import React, { useState } from "react";
import FileUploadZone from "@/components/molecules/FileUploadZone";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Badge from "@/components/atoms/Badge";
import { contentService } from "@/services/api/contentService";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const UploadsPage = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [defaultCollection, setDefaultCollection] = useState("Family Business");
  const [defaultTags, setDefaultTags] = useState("");

  const collections = [
    "Family Business",
    "Sermons & Theology",
    "Coaching & Workshops", 
    "Sales & FMCG",
    "Operations & HR",
    "Strategy",
    "Interviews & Panels"
  ];

  const handleFilesSelected = (selectedFiles) => {
    const newFiles = selectedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending",
      progress: 0,
      collection: defaultCollection,
      tags: defaultTags.split(",").map(t => t.trim()).filter(Boolean),
      error: null
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`${selectedFiles.length} file(s) added to upload queue`);
  };

  const updateFileProperty = (fileId, property, value) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, [property]: value } : file
    ));
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const simulateUpload = (file) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          updateFileProperty(file.id, "status", "completed");
          updateFileProperty(file.id, "progress", 100);
          resolve();
        } else {
          updateFileProperty(file.id, "progress", progress);
        }
      }, 200);
    });
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === "pending");
    if (pendingFiles.length === 0) {
      toast.warning("No files to upload");
      return;
    }

    setUploading(true);
try {
      // Update all pending files to uploading status
      pendingFiles.forEach(file => {
        updateFileProperty(file.id, "status", "uploading");
      });

      // Save files to database
      const contentRecords = pendingFiles.map(file => ({
        Name: file.name,
        title_c: file.name,
        description_c: file.description || '',
        file_name_c: file.name,
        file_type_c: getContentType(file.type),
        upload_date_c: new Date().toISOString()
      }));

      await contentService.create(contentRecords);
      
      // Simulate upload progress
      await Promise.all(pendingFiles.map(file => simulateUpload(file)));
      
      toast.success(`Successfully uploaded and saved ${pendingFiles.length} file(s)`);
    } catch (error) {
      toast.error("Some uploads failed. Please try again.");
      console.error("Upload error:", error);
      pendingFiles.forEach(file => {
        updateFileProperty(file.id, "status", "error");
        updateFileProperty(file.id, "error", "Upload failed");
      });
    } finally {
      setUploading(false);
    }
  };
const clearCompleted = () => {
    setFiles(prev => prev.filter(file => file.status !== "completed"));
    toast.success("Cleared completed uploads");
  };

  const getContentType = (mimeType) => {
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("video/")) return "video";
    return "document";
  };

  const getFileIcon = (type) => {
    if (type.startsWith("audio/")) return "Mic";
    if (type.startsWith("video/")) return "Video";
    if (type.includes("pdf")) return "FileText";
    if (type.includes("document") || type.includes("docx")) return "File";
    if (type.includes("presentation") || type.includes("pptx")) return "Presentation";
    if (type.includes("spreadsheet") || type.includes("xlsx")) return "Sheet";
    return "File";
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "success";
      case "uploading": return "info";
      case "error": return "error";
      case "pending": return "warning";
      default: return "default";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const pendingCount = files.filter(f => f.status === "pending").length;
  const completedCount = files.filter(f => f.status === "completed").length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
          Upload Content
        </h1>
        <p className="text-gray-600">
          Add documents, audio, and video files to Coach IanB's knowledge base.
        </p>
      </div>

      {/* Upload Settings */}
      <Card className="mb-6" elevation="1">
        <h3 className="font-semibold text-gray-900 mb-4">Default Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Default Collection</Label>
            <Select
              value={defaultCollection}
              onChange={(e) => setDefaultCollection(e.target.value)}
            >
              {collections.map(collection => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Default Tags (comma-separated)</Label>
            <Input
              value={defaultTags}
              onChange={(e) => setDefaultTags(e.target.value)}
              placeholder="leadership, coaching, strategy"
            />
          </div>
        </div>
      </Card>

      {/* Upload Zone */}
      <Card className="mb-6" elevation="1">
        <FileUploadZone
          onFilesSelected={handleFilesSelected}
          acceptedTypes=".pdf,.docx,.pptx,.xlsx,.txt,.md,.csv,.html,.mp3,.wav,.m4a,.mp4,.mov,.avi,.png,.jpg,.jpeg"
          maxSize={1000}
          multiple={true}
        />
      </Card>

      {/* Upload Queue */}
      {files.length > 0 && (
        <Card className="mb-6" elevation="1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Upload Queue</h3>
              <p className="text-sm text-gray-600">
                {files.length} files • {pendingCount} pending • {completedCount} completed
              </p>
            </div>
            <div className="flex gap-2">
              {completedCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompleted}
                >
                  Clear Completed
                </Button>
              )}
              <Button
                onClick={handleUploadAll}
                disabled={uploading || pendingCount === 0}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Upload" size={16} />
                Upload All ({pendingCount})
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                    <ApperIcon 
                      name={getFileIcon(file.type)} 
                      size={20} 
                      className="text-gray-600"
                    />
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {file.name}
                    </h4>
                    <Badge 
                      variant={getStatusColor(file.status)}
                      className="text-xs flex-shrink-0"
                    >
                      {file.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.collection}</span>
                    {file.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{file.tags.join(", ")}</span>
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {file.status === "uploading" && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}

                  {file.error && (
                    <p className="text-sm text-error mt-1">{file.error}</p>
                  )}
                </div>

                {/* File Settings */}
                <div className="flex items-center gap-2">
                  <Select
                    value={file.collection}
                    onChange={(e) => updateFileProperty(file.id, "collection", e.target.value)}
                    className="w-36 text-xs"
                    disabled={file.status === "uploading" || file.status === "completed"}
                  >
                    {collections.map(collection => (
                      <option key={collection} value={collection}>
                        {collection}
                      </option>
                    ))}
                  </Select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={file.status === "uploading"}
                    className="text-red-600 hover:text-red-700"
                  >
                    <ApperIcon name="X" size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upload Guidelines */}
      <Card elevation="1">
        <h3 className="font-semibold text-gray-900 mb-4">Upload Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Supported File Types</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Documents: PDF, DOCX, PPTX, XLSX, TXT, MD, CSV, HTML</li>
              <li>• Audio: MP3, WAV, M4A</li>
              <li>• Video: MP4, MOV, AVI</li>
              <li>• Images: PNG, JPG, JPEG</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Best Practices</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Maximum file size: 1GB per file</li>
              <li>• Use descriptive filenames</li>
              <li>• Assign appropriate collections and tags</li>
              <li>• High-quality audio/video for better transcription</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UploadsPage;