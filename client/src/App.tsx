import { Router, Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/use-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Home from "@/pages/Home";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import BlogAdmin from "@/pages/admin/BlogAdmin";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogPost} />
            <Route path="/admin/blog" component={BlogAdmin} />
            <Route component={NotFound} />
          </Switch>
        </Router>
        <Toaster />
      </ToastProvider>
    </QueryClientProvider>
  );
}
