import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";

const SearchResults = ({ 
  results, 
  loading, 
  error, 
  onRetry,
  onSourceOpen,
  className = "" 
}) => {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Error
        title="Search Failed"
        message={error}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  if (!results || results.length === 0) {
    return (
      <Empty
        icon="Search"
        title="No results found"
        message="Try adjusting your search terms or exploring our collections."
        actionLabel="Browse Collections"
        onAction={() => {/* Navigate to collections */}}
        className={className}
      />
    );
  }

  const getContentTypeIcon = (type) => {
    switch (type) {
      case "pdf": return "FileText";
      case "audio": return "Mic";
      case "video": return "Video";
      case "document": return "File";
      default: return "File";
    }
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case "pdf": return "error";
      case "audio": return "warning";
      case "video": return "info";
      case "document": return "primary";
      default: return "default";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Found <span className="font-semibold text-gray-900">{results.length}</span> results
        </p>
      </div>

      {results.map((result, index) => (
        <motion.div
          key={result.Id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => onSourceOpen?.(result)}
            elevation="1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <ApperIcon 
name={getContentTypeIcon(result.content_type_c || result.contentType)} 
                      size={16} 
                      className="text-gray-500"
                    />
                    <Badge 
                      variant={getContentTypeColor(result.content_type_c || result.contentType)}
                      className="text-xs"
                    >
                      {(result.content_type_c || result.contentType).toUpperCase()}
                    </Badge>
                  </div>
<Badge variant="primary" className="text-xs">
                    {result.collection_c || result.collection}
                  </Badge>
                </div>
                
<h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                  {result.title_c || result.title}
                </h3>
                
<p className="text-gray-600 mb-3 line-clamp-3">
                  {(result.content_c || result.content)?.substring(0, 200)}...
                </p>
                
<div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>By {((result.metadata_c ? (typeof result.metadata_c === 'string' ? JSON.parse(result.metadata_c) : result.metadata_c) : result.metadata)?.author) || "Coach IanB"}</span>
                  <span>•</span>
                  <span>{new Date(result.uploaded_at_c || result.uploadedAt).toLocaleDateString()}</span>
                  {((result.metadata_c ? (typeof result.metadata_c === 'string' ? JSON.parse(result.metadata_c) : result.metadata_c) : result.metadata)?.duration) && (
                    <>
                      <span>•</span>
                      <span>{(result.metadata_c ? (typeof result.metadata_c === 'string' ? JSON.parse(result.metadata_c) : result.metadata_c) : result.metadata).duration}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 ml-4">
                <Badge variant="accent" className="text-xs">
                  {Math.round(result.relevanceScore || 0.85 * 100)}% match
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSourceOpen?.(result);
                  }}
                >
                  <ApperIcon name="ExternalLink" size={14} className="mr-1" />
                  Open
                </Button>
              </div>
            </div>
            
{((result.metadata_c ? (typeof result.metadata_c === 'string' ? JSON.parse(result.metadata_c) : result.metadata_c) : result.metadata)?.tags && (result.metadata_c ? (typeof result.metadata_c === 'string' ? JSON.parse(result.metadata_c) : result.metadata_c) : result.metadata).tags.length > 0) && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                {(result.metadata_c ? (typeof result.metadata_c === 'string' ? JSON.parse(result.metadata_c) : result.metadata_c) : result.metadata).tags.slice(0, 5).map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="default" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {(result.metadata_c ? (typeof result.metadata_c === 'string' ? JSON.parse(result.metadata_c) : result.metadata_c) : result.metadata).tags.length > 5 && (
                  <Badge variant="default" className="text-xs">
                    +{(result.metadata_c ? (typeof result.metadata_c === 'string' ? JSON.parse(result.metadata_c) : result.metadata_c) : result.metadata).tags.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default SearchResults;