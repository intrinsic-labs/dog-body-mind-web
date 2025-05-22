import Link from 'next/link';
import { BlogPost } from '@/lib/blog';
// import BlogSearch from './BlogSearch'; // Keep search commented out for now

// Define the props interface
interface BlogPostsProps {
  posts: BlogPost[];
}

// Define props for the inline item component
interface BlogPostItemProps {
  post: BlogPost;
  index: number;
  totalCount: number;
}

const BlogPostItem = ({ post, index, totalCount }: BlogPostItemProps) => {
  return (
    <div>
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="hover:border-primary/30 transition-colors duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-2 text-left text-neutral-600 group-hover:text-primary transition-colors duration-300">
                <span className="text-sm">{post.date}</span>
                <span className="text-xs">|</span>
                <span className="text-sm">{post.readingTime}</span>
              </div>
              <h3 className="text-2xl font-heading2 mb-2 group-hover:text-orange transition-colors duration-300">
                {post.title}
              </h3>
              {/* Category for mobile only */}
              <div className="flex flex-wrap gap-2 mb-3 md:hidden">
                <span 
                  key={index} // Using index here is okay as it's stable within this list render
                  className="text-xs px-3 py-1 border border-neutral-500 text-neutral-800 group-hover:border-orange transition-colors duration-300"
                >
                  {post.category}
                </span>
              </div>
            </div>
            {/* Category for desktop only - right aligned */}
            <div className="hidden md:block">
              <span 
                className="text-sm font-light px-4 py-1.5 border border-neutral-500 text-neutral-800 group-hover:border-orange transition-colors duration-300"
              >
                {post.category}
              </span>
            </div>
          </div>
          {/* Add a divider line between posts, but not after the last post */}
          {index !== totalCount - 1 && (
            <div className="border-b border-neutral-800/50 pb-6 hover:border-primary/30 transition-colors duration-300"></div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default function BlogPosts({ posts }: BlogPostsProps) {
  // Remove local state fetching, use the passed 'posts' prop directly
  // const [posts, setPosts] = useState<BlogPost[]>([]); 
  // const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  // const [categories, setCategories] = useState<string[]>([]);
  // const [tags, setTags] = useState<string[]>([]);
  // const [isLoading, setIsLoading] = useState(true);

  // Remove useEffect for fetching data
  // useEffect(() => { ... });

  // Remove filtering logic for now
  // const handleSearch = (query: string, category: string, tag: string) => { ... };

  // Remove loading state
  // if (isLoading) { ... }

  // If there are no posts, render a message
  if (!posts || posts.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">No posts available.</p>;
  }

  return (
    <section className="mt-12 py-8 md:px-4 md:py-16 bg-secondary/30">
      <div className="container-custom">
        {/* Keep Search UI commented out for now */}
        {/* <BlogSearch 
          categories={categories}
          tags={tags}
          onSearch={handleSearch} 
        /> */}
        <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Latest Posts</h2>
        <div className="space-y-6">
          {posts.map((post, index) => (
            <BlogPostItem key={post.id} post={post} index={index} totalCount={posts.length} />
          ))}
          <div className="h-16 flex-shrink-0"></div> {/* Spacer */}
        </div>
      </div>
    </section>
  );
} 