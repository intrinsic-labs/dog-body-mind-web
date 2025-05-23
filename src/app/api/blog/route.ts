import { NextResponse } from 'next/server';
import { 
  getAllBlogPosts, 
  getAllCategories, 
  getAllTags, 
  getBlogPost,
  getRelatedPosts,
  getBlogPostsByCategory,
  getBlogPostsByTag,
  getFeaturedBlogPosts,
  searchBlogPosts,
  getBlogHero
} from '@/lib/blog';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'getPosts') {
      const posts = await getAllBlogPosts();
      return NextResponse.json(posts);
    } else if (action === 'getCategories') {
      const categories = await getAllCategories();
      return NextResponse.json(categories);
    } else if (action === 'getTags') {
      const tags = await getAllTags();
      return NextResponse.json(tags);
    } else if (action === 'getPost') {
      const slug = searchParams.get('slug');
      if (!slug) {
        return NextResponse.json(
          { error: 'Slug parameter is required' },
          { status: 400 }
        );
      }
      const post = await getBlogPost(slug);
      return NextResponse.json(post);
    } else if (action === 'getRelatedPosts') {
      const slug = searchParams.get('slug');
      const limitParam = searchParams.get('limit');
      
      if (!slug) {
        return NextResponse.json(
          { error: 'Slug parameter is required' },
          { status: 400 }
        );
      }
      
      const limit = limitParam ? parseInt(limitParam, 10) : 3;
      const relatedPosts = await getRelatedPosts(slug, limit);
      return NextResponse.json(relatedPosts);
    } else if (action === 'getPostsByCategory') {
      const category = searchParams.get('category');
      
      if (!category) {
        return NextResponse.json(
          { error: 'Category parameter is required' },
          { status: 400 }
        );
      }
      
      const posts = await getBlogPostsByCategory(category);
      return NextResponse.json(posts);
    } else if (action === 'getPostsByTag') {
      const tag = searchParams.get('tag');
      
      if (!tag) {
        return NextResponse.json(
          { error: 'Tag parameter is required' },
          { status: 400 }
        );
      }
      
      const posts = await getBlogPostsByTag(tag);
      return NextResponse.json(posts);
    } else if (action === 'getFeaturedPosts') {
      const posts = await getFeaturedBlogPosts();
      return NextResponse.json(posts);
    } else if (action === 'search') {
      const query = searchParams.get('query');
      
      if (!query) {
        return NextResponse.json(
          { error: 'Query parameter is required' },
          { status: 400 }
        );
      }
      
      const posts = await searchBlogPosts(query);
      return NextResponse.json(posts);
    } else if (action === 'getBlogHero') {
      const blogHero = await getBlogHero();
      return NextResponse.json(blogHero);
    } else {
      // Default: fetch all data
      const [posts, categories, tags] = await Promise.all([
        getAllBlogPosts(),
        getAllCategories(),
        getAllTags()
      ]);
      
      return NextResponse.json({ posts, categories, tags });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog data' },
      { status: 500 }
    );
  }
} 