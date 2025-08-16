import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  icon = "FileSearch",
  title = "No results found",
  message = "Try adjusting your search criteria or explore our collections.",
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name={icon} size={40} className="text-primary-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2 font-display">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {message}
      </p>
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;