import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/layouts/MainLayout";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

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

interface BlogPostResponse {
  success: boolean;
  data: BlogPost;
}

export default function BlogPost() {
  const [location] = useLocation();
  const slug = location.split("/").pop();

  const { data, isLoading, error } = useQuery<BlogPostResponse>({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const response = await fetch(`/api/blog/posts/slug/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blog post");
      }
      return response.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !data?.data) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Error loading blog post</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const post = data.data;
  const formattedDate = post.publishedAt
    ? format(new Date(post.publishedAt), "MMMM d, yyyy")
    : format(new Date(post.createdAt), "MMMM d, yyyy");

  return (
    <MainLayout>
      <article className="container mx-auto px-4 py-8">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {post.categories?.map((category) => (
              <span
                key={category}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {category}
              </span>
            ))}
          </div>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-500">
            <time dateTime={post.publishedAt || post.createdAt}>
              {formattedDate}
            </time>
            {post.authorId && (
              <span>By Author {post.authorId}</span>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {post.content}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h2 className="text-xl font-semibold mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </MainLayout>
  );
} 