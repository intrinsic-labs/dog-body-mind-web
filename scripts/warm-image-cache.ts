#!/usr/bin/env tsx
/**
 * Tinify CDN Cache Warming Script
 *
 * Crawls the deployed site and requests all images to warm the Tinify CDN cache.
 * This ensures first-time visitors get optimized images without delays.
 *
 * Usage:
 *   npm run warm-cache -- https://dogbodymind.com
 */

import { JSDOM } from 'jsdom';

interface CacheWarmingConfig {
  siteUrl: string;
  concurrency: number;
  timeout: number;
}

interface WarmingStats {
  pagesVisited: number;
  imagesCached: number;
  errors: number;
  duration: number;
}

const DEFAULT_CONFIG: Omit<CacheWarmingConfig, 'siteUrl'> = {
  concurrency: 5, // Simultaneous image requests
  timeout: 30000, // 30s timeout per image
};

/**
 * Fetch a URL and extract all image sources
 */
async function extractImagesFromPage(url: string): Promise<string[]> {
  try {
    console.log(`📄 Crawling: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`⚠️  Failed to fetch ${url}: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const images = Array.from(dom.window.document.querySelectorAll('img'));

    const imageSrcs = images
      .map(img => img.src)
      .filter(src => src && (src.includes('tinify') || src.includes('sanity')));

    console.log(`   Found ${imageSrcs.length} images`);
    return imageSrcs;
  } catch (error) {
    console.error(`❌ Error crawling ${url}:`, error);
    return [];
  }
}

/**
 * Warm cache for a single image
 */
async function warmImageCache(imageUrl: string, timeout: number): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(imageUrl, {
      method: 'HEAD', // Just check if image is accessible, don't download
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log(`   ✅ Cached: ${imageUrl.substring(0, 80)}...`);
      return true;
    } else {
      console.warn(`   ⚠️  Failed: ${imageUrl.substring(0, 80)}... (${response.status})`);
      return false;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`   ⏱️  Timeout: ${imageUrl.substring(0, 80)}...`);
    } else {
      console.error(`   ❌ Error: ${imageUrl.substring(0, 80)}...`, error);
    }
    return false;
  }
}

/**
 * Process images in batches with concurrency limit
 */
async function warmImagesInBatches(
  images: string[],
  concurrency: number,
  timeout: number
): Promise<{ success: number; failed: number }> {
  const uniqueImages = [...new Set(images)]; // Deduplicate
  let success = 0;
  let failed = 0;

  console.log(`\n🔥 Warming ${uniqueImages.length} unique images (concurrency: ${concurrency})...`);

  for (let i = 0; i < uniqueImages.length; i += concurrency) {
    const batch = uniqueImages.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(img => warmImageCache(img, timeout))
    );

    success += results.filter(r => r).length;
    failed += results.filter(r => !r).length;
  }

  return { success, failed };
}

/**
 * Discover all blog post URLs from the blog listing page
 */
async function discoverBlogPosts(siteUrl: string): Promise<string[]> {
  const blogListingUrl = `${siteUrl}/en/blog`; // Start with English blog
  console.log(`\n🔍 Discovering blog posts from: ${blogListingUrl}`);

  try {
    const response = await fetch(blogListingUrl);
    if (!response.ok) {
      console.warn(`⚠️  Could not fetch blog listing: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const dom = new JSDOM(html);

    // Find all links to blog posts
    const links = Array.from(dom.window.document.querySelectorAll('a[href*="/blog/"]'));
    const blogPostUrls = links
      .map(link => (link as HTMLAnchorElement).href)
      .filter(href => {
        // Filter for actual blog post URLs (not just /blog or /blog/category/etc)
        const urlParts = href.split('/');
        return urlParts[urlParts.length - 1] &&
               !href.includes('/category/') &&
               !href.includes('/tag/') &&
               !href.endsWith('/blog');
      })
      .map(href => {
        // Ensure full URLs
        if (href.startsWith('http')) return href;
        return `${siteUrl}${href}`;
      });

    const uniqueUrls = [...new Set(blogPostUrls)];
    console.log(`   Found ${uniqueUrls.length} blog posts`);
    return uniqueUrls;
  } catch (error) {
    console.error(`❌ Error discovering blog posts:`, error);
    return [];
  }
}

/**
 * Main cache warming function
 */
async function warmCache(config: CacheWarmingConfig): Promise<WarmingStats> {
  const startTime = Date.now();
  const stats: WarmingStats = {
    pagesVisited: 0,
    imagesCached: 0,
    errors: 0,
    duration: 0,
  };

  console.log(`\n🚀 Starting Tinify CDN Cache Warming`);
  console.log(`   Site: ${config.siteUrl}`);
  console.log(`   Concurrency: ${config.concurrency}`);
  console.log(`   Timeout: ${config.timeout}ms\n`);

  // Pages to crawl
  const pagesToCrawl = [
    config.siteUrl, // Landing Page
  ];

  // Discover all blog posts
  const blogPosts = await discoverBlogPosts(config.siteUrl);
  pagesToCrawl.push(...blogPosts);

  // Extract images from all pages
  const allImages: string[] = [];
  for (const pageUrl of pagesToCrawl) {
    const images = await extractImagesFromPage(pageUrl);
    allImages.push(...images);
    stats.pagesVisited++;
  }

  // Warm cache for all images
  const { success, failed } = await warmImagesInBatches(
    allImages,
    config.concurrency,
    config.timeout
  );

  stats.imagesCached = success;
  stats.errors = failed;
  stats.duration = Date.now() - startTime;

  return stats;
}

/**
 * CLI Entry Point
 */
async function main() {
  const siteUrl = process.argv[2];

  if (!siteUrl) {
    console.error('❌ Error: Site URL is required');
    console.log('\nUsage:');
    console.log('  npm run warm-cache -- https://dogbodymind.com');
    process.exit(1);
  }

  // Validate URL
  try {
    new URL(siteUrl);
  } catch {
    console.error(`❌ Error: Invalid URL: ${siteUrl}`);
    process.exit(1);
  }

  const config: CacheWarmingConfig = {
    siteUrl: siteUrl.replace(/\/$/, ''), // Remove trailing slash
    ...DEFAULT_CONFIG,
  };

  try {
    const stats = await warmCache(config);

    console.log('\n✨ Cache Warming Complete!');
    console.log(`   Pages crawled: ${stats.pagesVisited}`);
    console.log(`   Images cached: ${stats.imagesCached}`);
    console.log(`   Errors: ${stats.errors}`);
    console.log(`   Duration: ${(stats.duration / 1000).toFixed(2)}s\n`);

    if (stats.errors > 0) {
      console.warn('⚠️  Some images failed to cache. Check logs above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Cache warming failed:', error);
    process.exit(1);
  }
}

main();