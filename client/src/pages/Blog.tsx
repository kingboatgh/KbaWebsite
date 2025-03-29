import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/layouts/MainLayout";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { BlogPagination } from "@/components/ui/BlogPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Button as PaginationButton } from "@/components/ui/button";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  authorId: number | null;
  status: string;
  publishedAt: Date | null;
  createdAt: string;
  featuredImage: string | null;
  categories: string[] | null;
  tags: string[] | null;
}

interface BlogResponse {
  success: boolean;
  data: {
    posts: BlogPost[];
    total: number;
  };
}

export default function Blog() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const limit = 9;

  const { data, isLoading, error } = useQuery<BlogResponse>({
    queryKey: ["blog-posts", page, search, category, tag],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: "published",
        ...(search && { search }),
        ...(category && { category }),
        ...(tag && { tag }),
      });
      const response = await fetch(`/api/blog/posts?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blog posts");
      }
      return response.json();
    },
  });

  const totalPages = data ? Math.ceil(data.data.total / limit) : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500">Error loading blog posts. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const posts = data?.data?.posts || [];
  const total = data?.data?.total || 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <Input
                type="search"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
              <Select value={category || undefined} onValueChange={(value) => setCategory(value || null)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="web-development">Web Development</SelectItem>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tag || undefined} onValueChange={(value) => setTag(value || null)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Blog Posts Grid */}
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No posts found matching your criteria</p>
                {(category || tag || search) && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setCategory(null);
                      setTag(null);
                      setSearch("");
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {total > limit && (
              <div className="mt-8 flex justify-center gap-2">
                <PaginationButton
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </PaginationButton>
                <PaginationButton variant="outline" disabled>
                  {page}
                </PaginationButton>
                <PaginationButton
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * limit >= total}
                >
                  Next
                </PaginationButton>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-80">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 