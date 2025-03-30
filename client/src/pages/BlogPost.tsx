import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/layouts/MainLayout";
import { format } from "date-fns";
import { AlertCircle, Calendar, User, Tag, Share2, Bookmark, Facebook, Twitter, Linkedin, Link as LinkIcon, ThumbsUp, MessageCircle } from "lucide-react";

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

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  featuredImage: string | null;
  publishedAt: string | null;
}

interface BlogPostResponse {
  success: boolean;
  data: BlogPost;
}

interface RelatedPostsResponse {
  success: boolean;
  data: RelatedPost[];
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

  const { data: relatedPosts } = useQuery<RelatedPostsResponse>({
    queryKey: ["related-posts", slug],
    queryFn: async () => {
      const response = await fetch(`/api/blog/posts/related/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch related posts");
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
      <article className="min-h-screen bg-white">
        {/* Hero Section */}
        {post.featuredImage && (
          <div className="relative h-[60vh] w-full">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white max-w-3xl px-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  {post.title}
                </h1>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.publishedAt || post.createdAt}>
                      {formattedDate}
                    </time>
                  </div>
                  {post.authorId && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Author {post.authorId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Categories */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {post.categories.map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              {/* Excerpt */}
              {post.excerpt && (
                <div className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {post.excerpt}
                </div>
              )}

              {/* Main Content */}
              <div className="prose prose-lg max-w-none">
                {post.content}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-semibold">Tags</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement */}
              <div className="mt-12 pt-8 border-t flex items-center gap-6">
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <ThumbsUp className="w-5 h-5" />
                  <span>Like</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>Comment</span>
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Author Card */}
              {post.authorId && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Author {post.authorId}</h3>
                      <p className="text-sm text-gray-500">Contributor</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Passionate about technology and innovation. Writing about the latest trends in software development and digital transformation.
                  </p>
                </div>
              )}

              {/* Share Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-4">Share this article</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Facebook className="w-4 h-4" />
                    <span>Facebook</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                    <Twitter className="w-4 h-4" />
                    <span>Twitter</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <LinkIcon className="w-4 h-4" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>

              {/* Related Posts */}
              {relatedPosts?.data && relatedPosts.data.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.data.map((relatedPost) => (
                      <a
                        key={relatedPost.id}
                        href={`/blog/${relatedPost.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-4">
                          {relatedPost.featuredImage && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={relatedPost.featuredImage}
                                alt={relatedPost.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium group-hover:text-blue-600 transition-colors line-clamp-2">
                              {relatedPost.title}
                            </h4>
                            <time className="text-sm text-gray-500">
                              {format(new Date(relatedPost.publishedAt || ""), "MMM d, yyyy")}
                            </time>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter Signup */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-2">Stay Updated</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Subscribe to our newsletter for the latest articles and insights.
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </article>
    </MainLayout>
  );
} 