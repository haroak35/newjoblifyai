import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  published_at: string;
  author: {
    name: string;
    avatar_url: string;
  };
  cover_image: string;
}

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          content,
          published_at,
          author:author_id (
            name,
            avatar_url
          ),
          cover_image
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <nav className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="text-2xl font-bold text-neutral-800">
                Joblify
              </Link>
            </div>
          </div>
        </nav>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-neutral-200 rounded w-3/4" />
            <div className="h-64 bg-neutral-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-neutral-200 rounded w-full" />
              <div className="h-4 bg-neutral-200 rounded w-5/6" />
              <div className="h-4 bg-neutral-200 rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <nav className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="text-2xl font-bold text-neutral-800">
                Joblify
              </Link>
            </div>
          </div>
        </nav>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">Post not found</h1>
          <Link
            to="/blog"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-800"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-2xl font-bold text-neutral-800">
              Joblify
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link
          to="/blog"
          className="inline-flex items-center text-neutral-600 hover:text-neutral-800 mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Blog
        </Link>

        <article className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-64 object-cover"
          />
          
          <div className="p-8">
            <h1 className="text-3xl font-bold text-neutral-800 mb-6">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 mb-8 border-b border-neutral-200 pb-8">
              <img
                src={post.author.avatar_url}
                alt={post.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-medium text-neutral-800">
                  {post.author.name}
                </p>
                <p className="text-sm text-neutral-500">
                  {format(new Date(post.published_at), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>

            <div className="prose prose-neutral max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogPostPage;