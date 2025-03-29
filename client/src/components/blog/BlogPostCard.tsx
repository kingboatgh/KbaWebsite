import { Link } from "wouter";
import { format } from "date-fns";

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

interface BlogPostCardProps {
  post: BlogPost;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const formattedDate = post.publishedAt
    ? format(post.publishedAt, "MMMM d, yyyy")
    : format(new Date(post.createdAt), "MMMM d, yyyy");

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`}>
        <div className="relative aspect-video">
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          {post.categories?.map((category) => (
            <span
              key={category}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {category}
            </span>
          ))}
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{formattedDate}</span>
          <Link href={`/blog/${post.slug}`}>
            <span className="text-blue-600 hover:text-blue-800">
              Read more →
            </span>
          </Link>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
} 