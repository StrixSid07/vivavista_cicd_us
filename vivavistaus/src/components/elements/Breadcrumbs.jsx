import React from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

const Breadcrumbs = ({ items = [], className = "" }) => {
  if (!items.length) return null;

  return (
    <nav className={`flex text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <FaChevronRight className="mx-2 text-white/70 text-xs" />
              )}
              
              {isLast ? (
                <span className="font-medium text-white">{item.name}</span>
              ) : (
                <Link 
                  to={item.url} 
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 