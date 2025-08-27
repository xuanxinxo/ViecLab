'use client';

import React, { useState, useEffect, FormEvent } from 'react';
export const dynamic = "force-dynamic";


interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
}

export default function Page() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);

  const fetchPosts = async () => {
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, content, published }),
    });
    if (res.ok) {
      setTitle(''); setSlug(''); setContent(''); setPublished(false);
      fetchPosts();
    } else {
      alert('Error creating post');
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">Admin: Manage Posts</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block">Slug</label>
          <input value={slug} onChange={e => setSlug(e.target.value)} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block">Content</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="border p-2 w-full" />
        </div>
        <div className="flex items-center">
          <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
          <span className="ml-2">Published</span>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Create Post</button>
      </form>
      <section>
        <h2 className="text-xl mb-2">Existing Posts</h2>
        <ul className="space-y-2">
          {posts.map(post => (
            <li key={post.id} className="border p-2">
              <h3 className="font-bold">{post.title}</h3>
              <p className="text-sm text-gray-600">Slug: {post.slug}</p>
              <p>{post.content}</p>
              <p>Status: {post.published ? 'Published' : 'Draft'}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
