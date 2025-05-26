import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published_at: string;
  author: {
    name: string;
    avatar_url: string;
  };
  cover_image: string;
}

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          published_at,
          author:author_id (
            name,
            avatar_url
          ),
          cover_image
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-2xl font-bold text-neutral-800">
              Joblify
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/pricing" className="text-neutral-700 hover:text-neutral-900 font-medium">
                Pricing
              </Link>
              <Link to="/login" className="text-neutral-700 hover:text-neutral-900 font-medium">
                Sign in
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 bg-[#FF7F50] text-white rounded-xl hover:bg-[#FF6B3D] transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">Blog</h1>
          <p className="text-xl text-neutral-600">
            Latest insights, updates, and best practices for hiring
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 rounded-2xl h-48 mb-4" />
                <div className="space-y-2">
                  <div className="h-6 bg-neutral-200 rounded w-3/4" />
                  <div className="h-4 bg-neutral-200 rounded w-1/2" />
                  <div className="h-4 bg-neutral-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h2 className="text-xl font-bold text-neutral-800 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-neutral-600 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatar_url}
                      alt={post.author.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        {post.author.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {format(new Date(post.published_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogPage;