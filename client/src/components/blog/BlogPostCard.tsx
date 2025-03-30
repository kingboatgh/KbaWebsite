import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar, User, Tag } from "lucide-react";

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

interface BlogPostCardProps {
  post: BlogPost;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const formattedDate = post.publishedAt
    ? format(new Date(post.publishedAt), "MMMM d, yyyy")
    : format(new Date(post.createdAt), "MMMM d, yyyy");

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative aspect-video overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
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

          {/* Title */}
          <h2 className="text-2xl font-bold mb-4 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
          )}

          {/* Meta Information */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
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

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    +{post.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
} 