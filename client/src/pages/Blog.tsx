import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Calendar, Clock, Tag, ChevronLeft, ChevronRight, BookOpen, Share2, Heart } from "lucide-react";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { formatDate } from "@/lib/utils";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string | null;
  categories: string[];
  tags: string[];
  authorId: number | null;
  viewCount: number;
  likes: number;
}

interface BlogResponse {
  posts: BlogPost[];
  total: number;
}

interface CategoriesResponse {
  success: boolean;
  data: string[];
}

interface TagsResponse {
  success: boolean;
  data: string[];
}

export default function Blog() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "oldest">("newest");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch blog posts
  const { data: blogData, isLoading: isLoadingPosts } = useQuery<BlogResponse>({
    queryKey: ["blogPosts", page, search, category, tag, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        sort: sortBy,
        ...(search && { search }),
        ...(category && { category }),
        ...(tag && { tag }),
      });
      const response = await fetch(`/api/blog/posts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch blog posts");
      return response.json();
    },
  });

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/blog/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Fetch tags
  const { data: tagsData, isLoading: isLoadingTags } = useQuery<TagsResponse>({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await fetch("/api/blog/tags");
      if (!response.ok) throw new Error("Failed to fetch tags");
      return response.json();
    },
  });

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setCategory(null);
    setTag(null);
    setSortBy("newest");
    setPage(1);
  };

  // Newsletter subscription
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Failed to subscribe");
      setSubscribeStatus("success");
      setEmail("");
    } catch (error) {
      setSubscribeStatus("error");
    } finally {
      setIsSubscribing(false);
    }
  };

  // Calculate reading time
  const calculateReadingTime = (text: string | null): number => {
    if (!text) return 0;
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background */}
      <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-20 mb-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Our Blog
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover insights, tutorials, and stories from our team of experts.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex gap-4 flex-wrap w-full">
              <Select value={category || "all"} onValueChange={(value) => setCategory(value === "all" ? null : value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesData?.data.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tag || "all"} onValueChange={(value) => setTag(value === "all" ? null : value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {tagsData?.data.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: "newest" | "popular" | "oldest") => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full md:w-auto"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {isLoadingPosts ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden mb-8">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </Card>
                ))
              ) : !blogData || blogData.posts.length === 0 ? (
                // No results message
                <Card className="p-8 text-center">
                  <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <Button onClick={clearFilters}>Clear all filters</Button>
                </Card>
              ) : (
                // Blog posts
                blogData.posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden mb-8 hover:shadow-lg transition-all duration-300">
                      {post.featuredImage && (
                        <div className="relative h-64 overflow-hidden">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {post.categories?.map((cat) => (
                                <Badge 
                                  key={cat} 
                                  variant="secondary"
                                  className="bg-white/90 hover:bg-white"
                                >
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                              <a href={`/blog/${post.slug}`} className="hover:text-primary/90">
                                {post.title}
                              </a>
                            </h2>
                            <div className="flex items-center gap-4 text-white/90 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(post.publishedAt || "")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {calculateReadingTime(post.excerpt)} min read
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {post.viewCount} views
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {post.tags?.map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="outline"
                                className="text-xs"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <Heart className="w-4 h-4 mr-2" />
                              {post.likes}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {/* Pagination */}
            {blogData && blogData.total > 9 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="min-w-[120px]"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 9 >= blogData.total}
                  className="min-w-[120px]"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar />
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 mb-12">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 rounded-xl">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
              <p className="text-muted-foreground mb-6">
                Get the latest articles and insights delivered to your inbox.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
                <Button type="submit" disabled={isSubscribing} className="h-12">
                  {isSubscribing ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
              {subscribeStatus === "success" && (
                <p className="text-green-600 mt-2">Successfully subscribed!</p>
              )}
              {subscribeStatus === "error" && (
                <p className="text-red-600 mt-2">Failed to subscribe. Please try again.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 