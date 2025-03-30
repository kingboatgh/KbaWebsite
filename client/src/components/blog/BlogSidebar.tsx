import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Tag, Clock, ChevronRight, BookOpen, Share2, Heart } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

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

interface FeaturedPostsResponse {
  success: boolean;
  data: BlogPost[];
}

interface CategoriesResponse {
  success: boolean;
  data: string[];
}

interface TagsResponse {
  success: boolean;
  data: string[];
}

export default function BlogSidebar() {
  // Fetch featured posts
  const { data: featuredData, isLoading: isLoadingFeatured } = useQuery<FeaturedPostsResponse>({
    queryKey: ["featuredPosts"],
    queryFn: async () => {
      const response = await fetch("/api/blog/featured?limit=3");
      if (!response.ok) throw new Error("Failed to fetch featured posts");
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
    <div className="space-y-8">
      {/* Featured Posts */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Featured Posts</h3>
        </div>
        <div className="divide-y">
          {isLoadingFeatured ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-20 h-20 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            featuredData?.data.map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-4">
                  {post.featuredImage && (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-2 hover:text-primary">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.publishedAt || "")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {calculateReadingTime(post.excerpt)} min read
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      </Card>

      {/* Categories */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Categories</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {isLoadingCategories ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))
            ) : (
              categoriesData?.data.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {category}
                </Badge>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Tags */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Popular Tags</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {isLoadingTags ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))
            ) : (
              tagsData?.data.slice(0, 8).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Newsletter */}
      <Card className="overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Newsletter</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Subscribe to get the latest posts and updates delivered to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10"
            />
            <Button type="submit" className="w-full" disabled={isSubscribing}>
              {isSubscribing ? "Subscribing..." : "Subscribe"}
            </Button>
            {subscribeStatus === "success" && (
              <p className="text-sm text-green-600">Successfully subscribed!</p>
            )}
            {subscribeStatus === "error" && (
              <p className="text-sm text-red-600">Failed to subscribe. Please try again.</p>
            )}
          </form>
        </div>
      </Card>
    </div>
  );
} 