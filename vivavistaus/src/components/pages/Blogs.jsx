// src/pages/Blogs.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import Blog from "../elements/Blog";
import { Base_Url } from "../../utils/Api";

const Blogs = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${Base_Url}/home/blogs`)
      .then((res) => {
        const formatted = res.data.map((post) => ({
          id: post._id,
          title: post.title,
          image: post.image,
          date: post.createdAt,
          author: "Viva Vista Team",
          summary:
            post.content
              ?.replace(/<[^>]+>/g, "")
              .slice(0, 180)
              .trim() + "...",
        }));
        setBlogPosts(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blog posts:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mt-12 md:mt-16 lg:mt-20 bg-gradient-to-t from-blue-400 to-blue-100 min-h-screen">
      {loading ? (
        <div className="text-center text-xl py-20 customfontstitle">
          Loading travel stories...
        </div>
      ) : (
        <Blog posts={blogPosts} />
      )}
    </div>
  );
};

export default Blogs;
