// src/elements/Blog.jsx

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { blog } from "../../assets";


const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BlogPost = ({ id, title, image, date, author, summary }) => {
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate(`/blog/${id}`);
  };



  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={cardVariants}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-sm mx-auto my-8 shadow-lg h-[36rem] flex flex-col">
        <CardHeader floated={false} className="h-2/3">
          <img
            src={image}
            alt={title}
            className="object-cover h-full w-full rounded-t-lg"
          />
        </CardHeader>
        <CardBody className="p-4 flex flex-col flex-grow">
          <Typography variant="h5" className="mb-2 customfontstitle">
            {title}
          </Typography>
          <Typography className="text-gray-500 mb-4 text-sm customfontstitle">
            By {author} on{" "}
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
          <Typography className="text-gray-700 mb-4 text-sm flex-grow customfontstitle">
            {summary}
          </Typography>
          <Button
            color="blue"
            className="mt-4 customfontstitle"
            ripple="light"
            onClick={handleReadMore}
          >
            Read More
          </Button>
        </CardBody>
      </Card>
    </motion.div>
  );
};

const Blog = ({ posts }) => {
  return (
    <div className="relative bg-gray-50 min-h-screen py-12">
      {/* Full page background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={blog}
          alt="Blog"
          className="w-full md:h-screen h-full object-cover"
        />
        {/* Dark overlay to make the content more readable */}
        <div className="absolute inset-0 bg-black opacity-50">
          <Typography
            variant="h2"
            className="text-center font-bold mb-8 text-blue-800 mt-8 customfontstitle"
          >
            Travel Stories & Inspirations
          </Typography>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {posts.map((post) => (
            <BlogPost key={post.id} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
