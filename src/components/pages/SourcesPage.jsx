import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import { sourcesService } from "@/services/api/sourcesService";
import { toast } from "react-toastify";

const SourcesPage = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedSources, setSelectedSources] = useState([]);

  const filterOptions = [
    { value: "all", label: "All Sources" },
    { value: "by_collection", label: "By Collection" },
    { value: "recent", label: "Recently Added" },
    { value: "most_asked", label: "Most Referenced" },
    { value: "needs_review", label: "Needs Review" }
  ];

  const loadSources = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await sourcesService.getAll();
      setSources(data);
    } catch (err) {
      setError("Failed to load sources. Please try again.");
      console.error("Load sources error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleSourceSelect = (sourceId) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleBulkAction = (action) => {
    if (selectedSources.length === 0) {
      toast.warning("Please select sources first");
      return;
    }
    
    toast.info(`${action} applied to ${selectedSources.length} sources`);
    setSelectedSources([]);
  };

  const handleSourceDelete = async (sourceId) => {
    if (!window.confirm("Are you sure you want to delete this source?")) return;
    
    try {
      await sourcesService.delete(sourceId);
      setSources(prev => prev.filter(source => source.Id !== sourceId));
      toast.success("Source deleted successfully");
    } catch (err) {
      toast.error("Failed to delete source");
    }
  };

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

const filteredSources = sources.filter(source => {
    const title = source.title_c || source.title || '';
    const content = source.content_c || source.content || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
          <div className="h-5 bg-gray-300 rounded w-96"></div>
        </div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <Error
          title="Failed to Load Sources"
          message={error}
          onRetry={loadSources}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
          Content Sources
        </h1>
        <p className="text-gray-600">
          Manage and organize all of Coach IanB's content library.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <ApperIcon 
                name="Search" 
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sources by title or content..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-48"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40"
            >
              <option value="recent">Most Recent</option>
              <option value="title">Title A-Z</option>
              <option value="collection">Collection</option>
              <option value="type">Content Type</option>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedSources.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
            <span className="text-sm font-medium text-primary-700">
              {selectedSources.length} selected
            </span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkAction("Tag")}
              >
                <ApperIcon name="Tag" size={14} className="mr-1" />
                Tag
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkAction("Move")}
              >
                <ApperIcon name="FolderOpen" size={14} className="mr-1" />
                Move
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkAction("Export")}
              >
                <ApperIcon name="Download" size={14} className="mr-1" />
                Export
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Sources Grid */}
      {filteredSources.length === 0 ? (
        <Empty
          icon="Library"
          title="No sources found"
          message="Try adjusting your search criteria or upload new content."
          actionLabel="Upload Content"
          onAction={() => {/* Navigate to uploads */}}
        />
      ) : (
        <div className="grid gap-4">
          {filteredSources.map((source, index) => (
            <motion.div
              key={source.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card 
                className="hover:shadow-lg transition-all duration-200"
                elevation="1"
              >
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.Id)}
                      onChange={() => handleSourceSelect(source.Id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </div>

                  {/* Content Type Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ApperIcon 
                        name={getContentTypeIcon(source.contentType)} 
                        size={24} 
                        className="text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Source Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
variant={getContentTypeColor(source.content_type_c || source.contentType)}
                      className="text-xs"
                    >
                      {(source.content_type_c || source.contentType).toUpperCase()}
                    </Badge>
<Badge variant="primary" className="text-xs">
                      {source.collection_c || source.collection}
                    </Badge>
                      {source.metadata?.needsReview && (
                        <Badge variant="warning" className="text-xs">
                          Needs Review
                        </Badge>
                      )}
                    </div>

<h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1">
                      {source.title_c || source.title}
                    </h3>

                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {(source.content_c || source.content)?.substring(0, 150)}...
                    </p>

<div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Uploaded by {source.uploaded_by_c || source.uploadedBy}</span>
                      <span>•</span>
                      <span>{new Date(source.uploaded_at_c || source.uploadedAt).toLocaleDateString()}</span>
{((source.metadata_c ? (typeof source.metadata_c === 'string' ? JSON.parse(source.metadata_c) : source.metadata_c) : source.metadata)?.fileSize) && (
                        <>
                          <span>•</span>
                          <span>{(source.metadata_c ? (typeof source.metadata_c === 'string' ? JSON.parse(source.metadata_c) : source.metadata_c) : source.metadata).fileSize}</span>
                        </>
                      )}
                      {((source.metadata_c ? (typeof source.metadata_c === 'string' ? JSON.parse(source.metadata_c) : source.metadata_c) : source.metadata)?.duration) && (
                        <>
                          <span>•</span>
                          <span>{(source.metadata_c ? (typeof source.metadata_c === 'string' ? JSON.parse(source.metadata_c) : source.metadata_c) : source.metadata).duration}</span>
                        </>
                      )}
                    </div>

{((source.metadata_c ? (typeof source.metadata_c === 'string' ? JSON.parse(source.metadata_c) : source.metadata_c) : source.metadata)?.tags && (source.metadata_c ? (typeof source.metadata_c === 'string' ? JSON.parse(source.metadata_c) : source.metadata_c) : source.metadata).tags.length > 0) && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {(source.metadata_c ? (typeof source.metadata_c === 'string' ? JSON.parse(source.metadata_c) : source.metadata_c) : source.metadata).tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="default" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {(source.metadata_c ? (typeof source.metadata_c === 'string' ? JSON.parse(source.metadata_c) : source.metadata_c) : source.metadata).tags.length > 3 && (
                          <Badge variant="default" className="text-xs">
                            +{(source.metadata_c ? (typeof source.metadata_c === 'string' ? JSON.parse(source.metadata_c) : source.metadata_c) : source.metadata).tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="sm">
                      <ApperIcon name="Eye" size={14} className="mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ApperIcon name="Edit" size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSourceDelete(source.Id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourcesPage;