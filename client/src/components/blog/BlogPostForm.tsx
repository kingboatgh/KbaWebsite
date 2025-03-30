import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, X, Eye, Save, Tag, FolderOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import RichTextEditor from "./RichTextEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface BlogPostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: number;
  status: "draft" | "published" | "archived";
  publishedAt: string;
  featuredImage: string | null;
  metaDescription: string;
  metaKeywords: string;
  categories: string[];
  tags: string[];
  isFeatured: boolean;
}

const SUGGESTED_CATEGORIES = [
  "Technology",
  "Programming",
  "Web Development",
  "Design",
  "Business",
  "Marketing",
  "Personal",
  "Tutorial",
  "News",
  "Review",
];

const SUGGESTED_TAGS = [
  "javascript",
  "react",
  "typescript",
  "nodejs",
  "css",
  "html",
  "web",
  "development",
  "programming",
  "design",
  "ui",
  "ux",
  "seo",
  "marketing",
  "business",
];

export default function BlogPostForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    authorId: 1, // TODO: Get actual user ID from auth context
    status: "draft",
    publishedAt: new Date().toISOString().split('T')[0],
    featuredImage: null,
    metaDescription: "",
    metaKeywords: "",
    categories: [],
    tags: [],
    isFeatured: false,
  });
  const [isPreview, setIsPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Calculate word count
  useEffect(() => {
    const words = formData.content.replace(/<[^>]*>/g, "").trim().split(/\s+/);
    setWordCount(words.length);
  }, [formData.content]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!formData.title || !formData.content) return;
    
    setIsAutoSaving(true);
    try {
      const response = await fetch("/api/blog/posts/autosave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status: "draft",
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [formData]);

  // Debounced auto-save
  useEffect(() => {
    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [autoSave]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle title change and update slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, GIF, and WebP images are allowed.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        featuredImage: data.url,
      }));
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/blog/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create blog post");
      }

      toast({
        title: "Success",
        description: "Blog post created successfully!",
      });

      // Navigate to the new post
      navigate(`/blog/${data.data.slug}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle category/tag selection
  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: [...new Set([...prev.categories, category])],
    }));
  };

  const handleTagSelect = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: [...new Set([...prev.tags, tag])],
    }));
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category),
    }));
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Create New Blog Post</h2>
        <div className="flex items-center gap-4">
          {isAutoSaving && (
            <span className="text-sm text-gray-500">
              <Loader2 className="inline-block w-4 h-4 animate-spin mr-1" />
              Auto-saving...
            </span>
          )}
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="write" className="w-full">
        <TabsList>
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleTitleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">
                {wordCount} words
              </span>
            </div>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            />
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "draft" | "published" | "archived") =>
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="publishedAt">Publish Date</Label>
            <Input
              id="publishedAt"
              type="date"
              value={formData.publishedAt}
              onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="featuredImage">Featured Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="featuredImage"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, featuredImage: null }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="mt-2">
              <Label className="text-sm text-gray-500">Suggested Categories</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SUGGESTED_CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCategorySelect(category)}
                    disabled={formData.categories.includes(category)}
                  >
                    <FolderOpen className="w-4 h-4 mr-1" />
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="mt-2">
              <Label className="text-sm text-gray-500">Suggested Tags</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SUGGESTED_TAGS.map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTagSelect(tag)}
                    disabled={formData.tags.includes(tag)}
                  >
                    <Tag className="w-4 h-4 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
            />
            <Label htmlFor="isFeatured">Featured Post</Label>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
              placeholder="Enter a brief description for search engines"
            />
          </div>

          <div>
            <Label htmlFor="metaKeywords">Meta Keywords</Label>
            <Input
              id="metaKeywords"
              value={formData.metaKeywords}
              onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
              placeholder="Enter keywords separated by commas"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">SEO Preview</h3>
            <div className="space-y-2">
              <div className="text-blue-600 text-lg">
                {formData.title || "Your title will appear here"}
              </div>
              <div className="text-green-600 text-sm">
                {formData.metaDescription || "Your meta description will appear here"}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/blog")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Post
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 