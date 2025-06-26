import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle, XCircle, Info } from "lucide-react";

const NotificationItem = ({
  notification,
  onRemove,
  position = "top-right",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dismissTimer, setDismissTimer] = useState(null);
  const {
    title,
    description,
    type = "message",
    count = 1,
    action,
  } = notification;

  const isLarge = Boolean(description);

  // Auto-dismiss logic with hover pause
  useEffect(() => {
    if (!isHovered) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, 4000);
      setDismissTimer(timer);
      return () => clearTimeout(timer);
    } else {
      if (dismissTimer) {
        clearTimeout(dismissTimer);
        setDismissTimer(null);
      }
    }
  }, [isHovered, notification.id, onRemove]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-black" />;
      case "error":
        return <XCircle className="w-5 h-5 text-black" />;
      default:
        return <Info className="w-5 h-5 text-black" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-400";
      case "error":
        return "bg-red-400";
      default:
        return "bg-white";
    }
  };

  const getPositionAnimations = () => {
    const animations = {
      "top-right": { x: [300, 0], exit: { x: 300 } },
      "top-left": { x: [-300, 0], exit: { x: -300 } },
      "bottom-right": { x: [300, 0], exit: { x: 300 } },
      "bottom-left": { x: [-300, 0], exit: { x: -300 } },
      "top-center": { y: [-100, 0], exit: { y: -100 } },
      "bottom-center": { y: [100, 0], exit: { y: 100 } },
    };
    return animations[position] || animations["top-right"];
  };

  const animations = getPositionAnimations();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, ...animations }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, ...animations.exit }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          ${getBackgroundColor()} text-black p-4 rounded-none shadow-lg border border-black
          ${isLarge ? "min-w-80 max-w-96" : "min-w-64 max-w-80"}
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {getIcon()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm leading-tight">{title}</h4>
                {count > 1 && (
                  <span className="bg-white text-gray-800 text-s px-2 py-0.5 rounded-full font-medium">
                    {count}
                  </span>
                )}
              </div>
              {description && (
                <p className="text-xs text-black mt-1 leading-relaxed">
                  {description}
                </p>
              )}
              {action && (
                <button
                  onClick={() => action.onClick()}
                  className="mt-2 text-xs  text-black border-2 border-black px-3 py-1  hover:backdrop-brightness-150 cursor-pointer transition-colors font-medium"
                >
                  {action.label}
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => onRemove(notification.id)}
            className="text-black hover:text-white transition-colors p-1 -m-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
