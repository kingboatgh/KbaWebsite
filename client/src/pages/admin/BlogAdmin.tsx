import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BlogPagination } from "@/components/ui/BlogPagination";
import { useToast } from "@/components/ui/use-toast";
import { ImageIcon, X, Save, Eye, Trash2, Plus, Tag, FolderOpen, Link as LinkIcon, Settings } from "lucide-react";
import { format } from "date-fns";

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

interface CreateBlogPost {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId: number;
  status: string;
  publishedAt?: string;
  featuredImage?: string;
  categories?: string[];
  tags?: string[];
}

interface BlogResponse {
  data: {
    posts: BlogPost[];
    total: number;
  };
}

interface UploadResponse {
  success: boolean;
  url: string;
  error?: string;
}

export default function BlogAdmin() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const limit = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<BlogResponse>({
    queryKey: ["blog-posts", page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && status !== "all" && { status }),
      });

      const response = await fetch(`/api/blog/posts?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blog posts");
      }
      return response.json();
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (post: CreateBlogPost) => {
      const response = await fetch("/api/blog/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...post,
          publishedAt: post.status === "published" ? new Date().toISOString() : undefined,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create blog post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setIsCreating(false);
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, post }: { id: number; post: Partial<CreateBlogPost> }) => {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...post,
          publishedAt: post.status === "published" ? new Date().toISOString() : undefined,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update blog post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setEditingPost(null);
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update blog post",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete blog post");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading blog posts...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const posts = data?.data?.posts || [];
  const total = data?.data?.total || 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <Button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>

        {/* Posts List */}
        {!isCreating && !editingPost && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.data.posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {post.featuredImage && (
                            <div className="w-10 h-10 rounded overflow-hidden">
                              <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{post.title}</div>
                            <div className="text-sm text-gray-500">
                              {post.excerpt || "No excerpt"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800"
                            : post.status === "draft"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(post.publishedAt || post.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPost(post)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePostMutation.mutate(post.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t">
              <BlogPagination
                currentPage={page}
                totalPages={Math.ceil((data?.data.total || 0) / limit)}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}

        {/* Create/Edit Form */}
        {(isCreating || editingPost) && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Form Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {editingPost ? "Edit Post" : "Create New Post"}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Draft
                  </Button>
                  <Button
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsCreating(false);
                  setEditingPost(null);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form Content */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                // Get the form values
                const title = formData.get("title") as string;
                const slug = formData.get("slug") as string;
                const content = formData.get("content") as string;
                const excerpt = formData.get("excerpt") as string;
                const status = formData.get("status") as string;
                const categories = (formData.get("categories") as string)
                  .split(",")
                  .map(c => c.trim())
                  .filter(c => c.length > 0);
                const tags = (formData.get("tags") as string)
                  .split(",")
                  .map(t => t.trim())
                  .filter(t => t.length > 0);

                let featuredImage = editingPost?.featuredImage;

                // Handle image upload if a new image is selected
                if (selectedImage) {
                  const imageFormData = new FormData();
                  imageFormData.append("image", selectedImage);
                  
                  try {
                    const response = await fetch("/api/upload", {
                      method: "POST",
                      body: imageFormData,
                    });
                    
                    const data = await response.json() as UploadResponse;
                    
                    if (!response.ok || !data.success) {
                      throw new Error(data.error || "Failed to upload image");
                    }
                    
                    featuredImage = data.url;
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
                      variant: "destructive",
                    });
                    return;
                  }
                }

                if (editingPost) {
                  // Update existing post
                  updatePostMutation.mutate({
                    id: editingPost.id,
                    post: {
                      title,
                      slug,
                      content,
                      excerpt: excerpt || undefined,
                      status,
                      publishedAt: status === "published" ? new Date().toISOString() : undefined,
                      featuredImage: featuredImage || undefined,
                      categories: categories.length > 0 ? categories : undefined,
                      tags: tags.length > 0 ? tags : undefined,
                    },
                  });
                } else {
                  // Create new post
                  const post: CreateBlogPost = {
                    title,
                    slug,
                    content,
                    excerpt: excerpt || undefined,
                    authorId: 1,
                    status,
                    publishedAt: status === "published" ? new Date().toISOString() : undefined,
                    featuredImage: featuredImage || undefined,
                    categories: categories.length > 0 ? categories : undefined,
                    tags: tags.length > 0 ? tags : undefined,
                  };
                  createPostMutation.mutate(post);
                }
              }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6"
            >
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div>
                  <Input
                    type="text"
                    name="title"
                    placeholder="Post title"
                    defaultValue={editingPost?.title}
                    className="text-2xl font-bold border-0 focus-visible:ring-0 px-0"
                  />
                </div>

                {/* Slug */}
                <div>
                  <Input
                    type="text"
                    name="slug"
                    placeholder="Post slug"
                    defaultValue={editingPost?.slug}
                    className="text-gray-500 border-0 focus-visible:ring-0 px-0"
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-full">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {selectedImage ? "Change Image" : "Select Image"}
                      </Button>
                    </div>
                    {selectedImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveImage}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {(imagePreview || editingPost?.featuredImage) && (
                    <div className="mt-4">
                      <img
                        src={imagePreview || editingPost?.featuredImage || ""}
                        alt="Preview"
                        className="max-h-48 rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <Textarea
                    name="content"
                    placeholder="Write your post content here..."
                    defaultValue={editingPost?.content}
                    className="min-h-[400px] resize-none"
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Status */}
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-medium mb-4">Status</h3>
                  <Select
                    name="status"
                    defaultValue={editingPost?.status || "draft"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FolderOpen className="w-4 h-4" />
                    <h3 className="font-medium">Categories</h3>
                  </div>
                  <Input
                    type="text"
                    name="categories"
                    placeholder="Add categories (comma-separated)"
                    defaultValue={editingPost?.categories?.join(", ")}
                  />
                </div>

                {/* Tags */}
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4" />
                    <h3 className="font-medium">Tags</h3>
                  </div>
                  <Input
                    type="text"
                    name="tags"
                    placeholder="Add tags (comma-separated)"
                    defaultValue={editingPost?.tags?.join(", ")}
                  />
                </div>

                {/* Excerpt */}
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-medium mb-4">Excerpt</h3>
                  <Textarea
                    name="excerpt"
                    placeholder="Write a brief excerpt..."
                    defaultValue={editingPost?.excerpt || ""}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex flex-col gap-2">
                    <Button
                      type="submit"
                      className="w-full"
                    >
                      {editingPost ? "Update Post" : "Publish Post"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingPost(null);
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 