import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Users,
  Eye,
  Clock,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalUsers: number;
}

interface RecentPost {
  id: number;
  title: string;
  status: string;
  publishedAt: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: stats } = useQuery<{ data: DashboardStats }>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return response.json();
    },
  });

  const { data: recentPosts } = useQuery<{ data: { posts: RecentPost[] } }>({
    queryKey: ["recent-posts"],
    queryFn: async () => {
      const response = await fetch("/api/blog/posts?limit=5");
      if (!response.ok) {
        throw new Error("Failed to fetch recent posts");
      }
      return response.json();
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/admin/blog/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Posts</p>
              <p className="text-2xl font-bold">{stats?.data.totalPosts || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Published Posts</p>
              <p className="text-2xl font-bold">
                {stats?.data.publishedPosts || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Draft Posts</p>
              <p className="text-2xl font-bold">{stats?.data.draftPosts || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats?.data.totalUsers || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
        <div className="space-y-4">
          {recentPosts?.data.posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-medium">{post.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    post.status === "published"
                      ? "bg-green-100 text-green-800"
                      : post.status === "draft"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {post.status}
                </span>
                <Link to={`/admin/blog/${post.id}`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 