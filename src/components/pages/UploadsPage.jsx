import React, { useEffect, useState } from "react";
import { contentService } from "@/services/api/contentService";
import { collectionsService } from "@/services/api/collectionsService";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import FileUploadZone from "@/components/molecules/FileUploadZone";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
const UploadsPage = () => {
const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [collections, setCollections] = useState([]);
  const [defaultCollection, setDefaultCollection] = useState("");
  const [defaultTags, setDefaultTags] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionPassword, setCollectionPassword] = useState("");
  const [loadingCollections, setLoadingCollections] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoadingCollections(true);
    try {
      const data = await collectionsService.getAll();
      setCollections(data);
      if (data.length > 0 && !defaultCollection) {
        setDefaultCollection(data[0].Name);
      }
    } catch (error) {
      toast.error("Failed to load collections");
      console.error("Error loading collections:", error);
    } finally {
      setLoadingCollections(false);
    }
  };

const verifyCollectionPassword = async (collectionName, password) => {
    // Check for the specific required password
    if (!password) {
      throw new Error("Password is required");
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify against the specific password
    if (password !== "M1an3^@1965") {
      throw new Error("Invalid password");
    }
    
    return true;
  };
const requestPasswordForUpload = (collection) => {
    setSelectedCollection(collection);
    setCollectionPassword("");
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    try {
      await verifyCollectionPassword(selectedCollection, collectionPassword);
      setShowPasswordModal(false);
      toast.success(`Access granted to ${selectedCollection} collection`);
      
      // Proceed with upload after password verification
      proceedWithUpload();
    } catch (error) {
      toast.error(error.message || "Invalid password");
    }
  };

const proceedWithUpload = async () => {
    const pendingFiles = files.filter(f => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setUploading(true);

    for (const file of pendingFiles) {
      try {
        // Update file status to uploading
        updateFileProperty(file.id, "status", "uploading");
        
        // Simulate upload progress
        await simulateUpload(file);
        
        // Extract file content for searchability
        const fileContent = await extractFileContent(file.file);
        
        // Save to content table
        const contentRecord = {
          Name: file.name,
          title_c: file.name,
          description_c: file.description || '',
          file_name_c: file.name,
          file_type_c: getContentType(file.type),
          upload_date_c: new Date().toISOString()
        };

        const contentResult = await contentService.create([contentRecord]);
        
        // Also save to source table for searchability
        const { sourcesService } = await import("@/services/api/sourcesService");
        const sourceRecord = {
          title_c: file.name,
          content_c: fileContent,
          content_type_c: getContentType(file.type),
          collection_c: file.collection,
          uploaded_by_c: "current-user",
          uploaded_at_c: new Date().toISOString(),
          metadata_c: JSON.stringify({
            originalFileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            tags: file.tags,
            contentId: contentResult[0]?.Id
          })
        };

        await sourcesService.create(sourceRecord);
        
        updateFileProperty(file.id, "status", "completed");
        updateFileProperty(file.id, "progress", 100);
      } catch (error) {
        updateFileProperty(file.id, "status", "error");
        updateFileProperty(file.id, "error", error.message);
      }
    }

    setUploading(false);
    toast.success(`Successfully uploaded ${pendingFiles.length} file(s) to ${selectedCollection}`);
  };

  // Extract searchable content from files
  const extractFileContent = async (file) => {
    try {
      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        return await file.text();
      } else if (file.name.endsWith('.csv')) {
        const text = await file.text();
        return text.replace(/,/g, ' '); // Convert CSV to searchable text
      } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        const text = await file.text();
        // Basic HTML tag removal for searchability
        return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      
      // For other file types, return basic metadata as searchable content
      return `File: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`;
    } catch (error) {
      console.error("Error extracting file content:", error);
      return `File: ${file.name}, Type: ${file.type}`;
    }
  };
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

      // Check if user has selected a collection that requires password
      if (defaultCollection && !selectedCollection) {
        requestPasswordForUpload(defaultCollection);
        return;
      }

      const { sourcesService } = await import("@/services/api/sourcesService");
      let successCount = 0;
      let failCount = 0;

      // Process each file individually for better error handling
      for (const file of pendingFiles) {
        try {
          // Simulate upload progress
          await simulateUpload(file);
          
          // Extract file content for searchability
          const fileContent = await extractFileContent(file.file);
          
          // Create content record
          const contentRecord = {
            Name: file.name,
            title_c: file.name,
            description_c: file.description || '',
            file_name_c: file.name,
            file_type_c: getContentType(file.type),
            upload_date_c: new Date().toISOString()
          };

          const contentResult = await contentService.create([contentRecord]);
          
          // Create corresponding source record for searchability
          const sourceRecord = {
            title_c: file.name,
            content_c: fileContent,
            content_type_c: getContentType(file.type),
            collection_c: file.collection,
            uploaded_by_c: "current-user",
            uploaded_at_c: new Date().toISOString(),
            metadata_c: JSON.stringify({
              originalFileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
              tags: file.tags,
              contentId: contentResult[0]?.Id
            })
          };

          await sourcesService.create(sourceRecord);
          
          updateFileProperty(file.id, "status", "completed");
          successCount++;
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          updateFileProperty(file.id, "status", "error");
          updateFileProperty(file.id, "error", error.message);
          failCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully uploaded and saved ${successCount} file(s) to the knowledge base`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} file(s) failed to upload. Check individual file status for details.`);
      }
    } catch (error) {
      toast.error("Upload process failed. Please try again.");
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
        <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
          Upload Content
        </h1>
        <p className="text-gray-600">
          Upload files to collections with password-protected access control.
        </p>
      </div>

      {loadingCollections ? (
        <Card className="mb-6" elevation="1">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin mr-2">
              <ApperIcon name="Loader" size={20} />
            </div>
            Loading collections...
          </div>
        </Card>
) : (
        <Card className="mb-6" elevation="1">
          <h3 className="font-semibold text-gray-900 mb-4">Default Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Default Collection</Label>
              <Select
                value={defaultCollection}
                onChange={(e) => setDefaultCollection(e.target.value)}
                disabled={collections.length === 0}
              >
                <option value="">Select a collection...</option>
                {collections.map(collection => (
                  <option key={collection.Id} value={collection.Name}>
                    {collection.Name}
                  </option>
                ))}
              </Select>
              {collections.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No collections available. Create a collection first.
                </p>
              )}
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
      )}

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
                disabled={uploading || pendingCount === 0 || !defaultCollection}
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
                      <option key={collection.Id} value={collection.Name}>
                        {collection.Name}
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

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Lock" size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Password Required</h2>
                    <p className="text-sm text-gray-600">
                      Enter password for "{selectedCollection}" collection
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPasswordModal(false)}
                >
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Collection Password</Label>
                  <Input
                    type="password"
                    value={collectionPassword}
                    onChange={(e) => setCollectionPassword(e.target.value)}
                    placeholder="Enter collection password"
                    className="mt-1"
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordModal(false)} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePasswordSubmit} 
                  disabled={!collectionPassword}
                  className="flex-1"
                >
                  Verify & Upload
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UploadsPage;