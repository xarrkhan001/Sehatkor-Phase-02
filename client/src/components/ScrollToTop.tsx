import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ behavior = "auto" as ScrollBehavior }: { behavior?: ScrollBehavior }) => {
  const location = useLocation();

  useEffect(() => {
    // On route change, scroll to top
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      // Reset any hash scrolling first
      if (location.hash) {
        // Delay to let the new page mount before scrolling to top
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior });
        });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior });
      }
    }
  }, [location.pathname, location.search]);

  return null;
};

export default ScrollToTop;
