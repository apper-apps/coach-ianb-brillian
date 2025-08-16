import React from "react";

const Loading = ({ type = "skeleton", className = "" }) => {
  const renderSkeleton = () => (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  );

  const renderSpinner = () => (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  const renderDots = () => (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
      <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
    </div>
  );

  const renderStream = () => (
    <div className={`flex items-center text-primary-600 ${className}`}>
      <span className="stream-indicator">IanB is thinking...</span>
    </div>
  );

  switch (type) {
    case "spinner":
      return renderSpinner();
    case "dots":
      return renderDots();
    case "stream":
      return renderStream();
    case "skeleton":
    default:
      return renderSkeleton();
  }
};

export default Loading;