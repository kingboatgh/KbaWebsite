import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BlogPagination } from "@/components/ui/BlogPagination";
import { useToast } from "@/components/ui/use-toast";
import { ImageIcon, X } from "lucide-react";

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Blog Admin</h1>
          <Button onClick={() => setIsCreating(true)}>Create New Post</Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            type="search"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Select value={status || undefined} onValueChange={(value) => setStatus(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Blog Posts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800"
                            : post.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : "Not published"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPost(post)}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePostMutation.mutate(post.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <p className="text-gray-500">No posts found</p>
                    {(search || status) && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setSearch("");
                          setStatus(null);
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button variant="outline" disabled>
              {page}
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
            >
              Next
            </Button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(isCreating || editingPost) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingPost ? "Edit Post" : "Create New Post"}
              </h2>
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
                      
                      if (!response.ok) {
                        throw new Error("Failed to upload image");
                      }
                      
                      const { url } = await response.json();
                      featuredImage = url;
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to upload image. Please try again.",
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
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <Input
                    name="title"
                    required
                    placeholder="Enter post title"
                    defaultValue={editingPost?.title}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Slug
                  </label>
                  <Input
                    name="slug"
                    required
                    placeholder="enter-post-slug"
                    defaultValue={editingPost?.slug}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <Textarea
                    name="content"
                    required
                    rows={10}
                    placeholder="Write your blog post content here..."
                    defaultValue={editingPost?.content}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Excerpt
                  </label>
                  <Textarea
                    name="excerpt"
                    rows={3}
                    placeholder="A brief summary of your post..."
                    defaultValue={editingPost?.excerpt || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Categories (comma-separated)
                  </label>
                  <Input
                    name="categories"
                    placeholder="technology, programming, web"
                    defaultValue={editingPost?.categories?.join(", ")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <Input
                    name="tags"
                    placeholder="javascript, react, typescript"
                    defaultValue={editingPost?.tags?.join(", ")}
                  />
                </div>
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
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingPost(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPost ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 