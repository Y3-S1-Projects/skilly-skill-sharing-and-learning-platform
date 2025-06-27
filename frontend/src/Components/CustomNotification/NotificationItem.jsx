import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

const NotificationItem = ({
  notification,
  onRemove,
  index,
  isStackHovered,
  position = "top-right",
  expandDirection = "down",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dismissTimer, setDismissTimer] = useState(null);
  const { title, description, type = "info", action } = notification;

  // Auto-dismiss logic with hover pause
  useEffect(() => {
    if (!isHovered && !isStackHovered) {
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
  }, [isHovered, isStackHovered, notification.id, onRemove]);

  const getIcon = () => {
    const iconProps = "w-4 h-4";
    switch (type) {
      case "success":
        return <CheckCircle className={`${iconProps} text-emerald-500`} />;
      case "error":
        return <XCircle className={`${iconProps} text-red-500`} />;
      case "warning":
        return <AlertTriangle className={`${iconProps} text-amber-500`} />;
      default:
        return <Info className={`${iconProps} text-blue-500`} />;
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case "success":
        return "border-l-emerald-500";
      case "error":
        return "border-l-red-500";
      case "warning":
        return "border-l-amber-500";
      default:
        return "border-l-blue-500";
    }
  };

  const getStackStyles = () => {
    const stackOffset = index * 4;
    const expandOffset = expandDirection === "up" ? -(index * 70) : index * 70;

    if (isStackHovered) {
      return {
        transform: `translateY(${expandOffset}px) scale(1)`,
        opacity: 1,
        zIndex: isHovered ? 100 : 50 - index,
      };
    } else {
      return {
        transform: `translateY(${stackOffset}px) scale(${1 - index * 0.05})`,
        opacity: index === 0 ? 1 : 0.7 - index * 0.1,
        zIndex: 50 - index,
      };
    }
  };

  const getPositionStyles = () => {
    if (position.includes("left")) {
      return "left-0";
    }
    return "right-0";
  };

  return (
    <div
      className={`absolute top-0 ${getPositionStyles()} transition-all duration-300 ease-out`}
      style={getStackStyles()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          bg-white border-l-4 ${getAccentColor()} 
          rounded-lg shadow-lg border border-gray-100
          p-4 w-80 backdrop-blur-sm
          hover:shadow-xl transition-shadow duration-200
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {getIcon()}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-5 text-gray-900">
                {title}
              </h4>
              {description && (
                <p className="text-sm text-gray-600 mt-1 leading-5">
                  {description}
                </p>
              )}
              {action && (
                <button
                  onClick={() => action.onClick()}
                  className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {action.label}
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => onRemove(notification.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 -m-0.5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
