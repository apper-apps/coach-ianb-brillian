import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const CitationCard = ({ 
  citation,
  index,
  onOpen,
  className = ""
}) => {
  const { source, snippet, location, relevanceScore } = citation;
  
  const getContentTypeIcon = (type) => {
    switch (type) {
      case "pdf": return "FileText";
      case "audio": return "Mic";
      case "video": return "Video";
      case "document": return "File";
      default: return "File";
    }
  };

  const formatLocation = (loc) => {
    if (loc.timestamp) {
      const minutes = Math.floor(loc.timestamp / 60);
      const seconds = loc.timestamp % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    if (loc.page) return `Page ${loc.page}`;
    return "";
  };

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-accent-400",
        className
      )}
      onClick={onOpen}
      elevation="1"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {index}
          </div>
          <ApperIcon 
            name={getContentTypeIcon(source.contentType)} 
            size={16} 
            className="text-gray-500"
          />
        </div>
        <Badge variant="accent" className="text-xs">
          {Math.round(relevanceScore * 100)}% match
        </Badge>
      </div>

      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {source.title}
      </h4>

      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
        {snippet}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Badge variant="primary" className="text-xs">
            {source.collection}
          </Badge>
          {location && (
            <span>{formatLocation(location)}</span>
          )}
        </div>
        
        <Button 
          size="sm" 
          variant="ghost"
          className="text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onOpen?.();
          }}
        >
          <ApperIcon name="ExternalLink" size={14} className="mr-1" />
          Open
        </Button>
      </div>
    </Card>
  );
};

export default CitationCard;