import React, { useState, useRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const FileUploadZone = ({ 
  onFilesSelected,
  acceptedTypes = ".pdf,.docx,.txt,.mp3,.mp4",
  maxSize = 1000,
  multiple = true,
  className = ""
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB <= maxSize;
    });

    if (onFilesSelected) {
      onFilesSelected(validFiles);
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors",
        isDragOver && "border-primary-500 bg-primary-50",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
          isDragOver ? "bg-primary-100" : "bg-gray-100"
        )}>
          <ApperIcon 
            name="Upload" 
            size={32} 
            className={isDragOver ? "text-primary-600" : "text-gray-500"}
          />
        </div>
        
        <div>
          <p className="text-lg font-medium text-gray-900 mb-1">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-gray-500">
            Supports documents, audio, and video files up to {maxSize}MB each
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <ApperIcon name="FolderOpen" size={16} className="mr-2" />
          Browse Files
        </Button>
      </div>
    </div>
  );
};

export default FileUploadZone;