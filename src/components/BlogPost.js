import React, { useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { news } from '../data/news.js'; // Ensure this path matches where your news data is stored
import './BlogPost.css';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';

const PUBLIC_URL = process.env.REACT_APP_PUBLIC_URL;

const parseContent = (content) => {
  const replacements = {
    '<b>': '<strong>', '</b>': '</strong>',
    '/n': '<br />',
    '/t': '&nbsp;',  // Non-breaking space
    '<pre>': '<pre class="custom-preformatted">', '</pre>': '</pre>',
    '<ce>': '<div style="text-align: center;">', '</ce>': '</div>',
    '<u>': '<u>', '</u>': '</u>',
    '<i>': '<i>', '</i>': '</i>',
    '<ol>': '<ol>', '</ol>': '</ol>',
    '<ul>': '<ul>', '</ul>': '</ul>',
    '<li>': '<li>', '</li>': '</li>',
  };

  content = content.replace(/<f(\d+)>/g, '<span style="font-size: $1px;">').replace(/<\/f>/g, '</span>');
  content = content.replace(/<c#([0-9A-Fa-f]{6})>/g, '<span style="color: #$1;">').replace(/<\/c>/g, '</span>');
  content = content.replace(/<bc#([0-9A-Fa-f]{6})>/g, '<span style="background-color: #$1;">').replace(/<\/bc>/g, '</span>');

  for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
  }

  return content;
};

const fetchNews = async () => {
  return news;
};

const BlogPost = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);

  const { data: newsData, error, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews
  });

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      console.log(`Pathname changed to: ${pathname}`);
      window.scrollTo(0, 0);
      previousPathname.current = pathname;
    }
  }, [pathname]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading news: {error.message}</div>;
  }

  const blog = newsData.find(blog => blog.id === id);

  if (!blog) {
    return <div>Blog post not found</div>;
  }

  const sanitizedContent = DOMPurify.sanitize(parseContent(blog.content));
  const sanitizedIntro = DOMPurify.sanitize(parseContent(blog.intro));
  const sanitizedConclusion = DOMPurify.sanitize(parseContent(blog.content_and_conclusion));

  const otherBlogs = newsData.filter(otherBlog => otherBlog.id !== id);

  return (
    <div className="blog-post-container">
      <h1 className="blog-post-title">{blog.title}</h1>
      <img src={`${PUBLIC_URL}${blog.image}`} alt={blog.title} className="blog-post-image" />
      <div className="blog-post-intro">{parse(sanitizedIntro)}</div>
      <div className="blog-post-content">{parse(sanitizedContent)}</div>
      <img src={`${PUBLIC_URL}${blog.image2}`} alt={blog.title} className="blog-post-image2" />
      <div className="blog-post-content-and-conclusion">{parse(sanitizedConclusion)}</div>
      <div className="blog-post-meta">
        <span>{blog.time}</span>
        <span>{blog.views} views</span>
      </div>
      <div className="blog-post-interactions">
        <button className="blog-post-button">Like</button>
        <button className="blog-post-button">Comment</button>
      </div>

      <div className="recommendation-header">
        <h2>🔥 More News and Recommendations for You 🔥</h2>
      </div>

      <div className="recommendations">
        {otherBlogs.map((otherBlog) => (
          <div key={otherBlog.id} className="recommendation">
            <Link to={`/blog/${otherBlog.id}`} onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              console.log(`Scrolled to top for blog id: ${otherBlog.id}`);
            }}>
              <img src={`${PUBLIC_URL}${otherBlog.image}`} alt={otherBlog.title} className="recommendation-image" />
            </Link>
            <Link to={`/blog/${otherBlog.id}`} onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              console.log(`Scrolled to top for blog id: ${otherBlog.id}`);
            }} className="recommendation-title-link">
              <h3 className="recommendation-title">{otherBlog.title}</h3>
            </Link>
            <div className="recommendation-intro">{parse(DOMPurify.sanitize(parseContent(otherBlog.intro)))}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPost;