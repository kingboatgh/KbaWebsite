import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import BlogPostCard from "./BlogPostCard";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  authorId: number | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  featuredImage: string | null;
  categories: string[] | null;
  tags: string[] | null;
}

export default function BlogSidebar() {
  const { data: featuredPosts } = useQuery<{ data: BlogPost[] }>({
    queryKey: ["featured-posts"],
    queryFn: async () => {
      const response = await fetch("/api/blog/featured?limit=3");
      if (!response.ok) {
        throw new Error("Failed to fetch featured posts");
      }
      return response.json();
    },
  });

  // Mock data for categories and tags (in a real app, these would come from the API)
  const categories = [
    "Technology",
    "Lifestyle",
    "Business",
    "Design",
    "Development",
  ];

  const tags = [
    "Web",
    "Design",
    "Development",
    "UI/UX",
    "Mobile",
    "Cloud",
    "Security",
    "Performance",
  ];

  return (
    <div className="space-y-8">
      {/* Featured Posts */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Featured Posts</h3>
        <div className="space-y-4">
          {featuredPosts?.data.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm p-4">
              <Link href={`/blog/${post.slug}`}>
                <h4 className="font-medium hover:text-blue-600 line-clamp-2">
                  {post.title}
                </h4>
              </Link>
              {post.excerpt && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/blog?category=${category.toLowerCase()}`}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${tag.toLowerCase()}`}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Subscribe to Newsletter</h3>
        <p className="text-gray-600 mb-4">
          Get the latest posts delivered right to your inbox.
        </p>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
} 