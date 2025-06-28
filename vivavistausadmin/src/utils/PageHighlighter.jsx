import React, { useEffect, useRef } from "react";
import Mark from "mark.js";

const PageHighlighter = ({ searchQuery, children }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const instance = new Mark(containerRef.current);

    instance.unmark({
      done: () => {
        if (searchQuery.trim()) {
          instance.mark(searchQuery, {
            separateWordSearch: false,
            className: "bg-yellow-300 text-2xl p-2 rounded-md",
            done: () => {
              // Delay scrolling to ensure highlight rendering
              setTimeout(() => {
                const highlightedElements =
                  containerRef.current.querySelectorAll("mark");
                if (highlightedElements.length > 0) {
                  highlightedElements[0].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }, 100);
            },
          });
        }
      },
    });
  }, [searchQuery]);

  return <div ref={containerRef}>{children}</div>;
};

export default PageHighlighter;
