// utils/scroll-utils.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to top on every route change
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/**
 * Smooth scrolls to top
 */
export const SmoothScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);
  return null;
};

/**
 * Scrolls to specific element by ID
 */
export const ScrollToElement = ({ elementId, offset = 0 }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    const element = document.getElementById(elementId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - offset,
        behavior: "smooth",
      });
    }
  }, [pathname, elementId, offset]);
  return null;
};
