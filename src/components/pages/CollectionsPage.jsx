import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { collectionsService } from "@/services/api/collectionsService";
import { sourcesService } from "@/services/api/sourcesService";

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCollections = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [collectionsData, sourcesData] = await Promise.all([
        collectionsService.getAll(),
        sourcesService.getAll()
      ]);

      // Calculate stats for each collection
      const collectionsWithStats = collectionsData.map(collection => {
        const collectionSources = sourcesData.filter(source => 
          source.collection === collection.name
        );
        
        const contentTypes = [...new Set(collectionSources.map(s => s.contentType))];
        const totalSize = collectionSources.reduce((sum, source) => 
          sum + (source.metadata?.fileSize || 0), 0
        );
        const lastUpdated = collectionSources.length > 0 
          ? new Date(Math.max(...collectionSources.map(s => new Date(s.uploadedAt))))
          : null;

        return {
          ...collection,
          sourceCount: collectionSources.length,
          contentTypes,
          totalSize,
          lastUpdated
        };
      });

      setCollections(collectionsWithStats);
    } catch (err) {
      setError("Failed to load collections. Please try again.");
      console.error("Load collections error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

const getCollectionIcon = (name) => {
    switch (name) {
      case "Family Business": return "Users";
      case "Sermons & Theology": return "BookOpen";
      case "Coaching & Workshops": return "Target";
      case "Sales & FMCG": return "TrendingUp";
      case "Operations & HR": return "Settings";
      case "Strategy": return "Lightbulb";
      case "Interviews & Panels": return "Mic";
      case "Goal Setting": return "CheckCircle";
      default: return "Folder";
    }
  };

const getCollectionColor = (name) => {
    switch (name) {
      case "Family Business": return "primary";
      case "Sermons & Theology": return "accent";
      case "Coaching & Workshops": return "secondary";
      case "Sales & FMCG": return "success";
      case "Operations & HR": return "info";
      case "Strategy": return "warning";
      case "Interviews & Panels": return "error";
      case "Goal Setting": return "primary";
      default: return "default";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
          <div className="h-5 bg-gray-300 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-300 rounded w-3/4 mb-1"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <Error
          title="Failed to Load Collections"
          message={error}
          onRetry={loadCollections}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
          Content Collections
        </h1>
        <p className="text-gray-600">
          Explore organized categories of Coach IanB's knowledge and expertise.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="FolderOpen" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-primary-600 font-medium">Collections</p>
              <p className="text-2xl font-bold text-primary-800">{collections.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-secondary-50 to-secondary-100 border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="Library" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary-600 font-medium">Total Sources</p>
              <p className="text-2xl font-bold text-secondary-800">
                {collections.reduce((sum, c) => sum + c.sourceCount, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-accent-50 to-accent-100 border-accent-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="HardDrive" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-accent-600 font-medium">Total Size</p>
              <p className="text-2xl font-bold text-accent-800">
                {formatFileSize(collections.reduce((sum, c) => sum + c.totalSize, 0))}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-success/20 to-success/30 border-success/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
              <ApperIcon name="Activity" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-success font-medium">Avg per Collection</p>
              <p className="text-2xl font-bold text-success">
                {Math.round(collections.reduce((sum, c) => sum + c.sourceCount, 0) / collections.length) || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection, index) => (
          <motion.div
            key={collection.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full"
              elevation="2"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 bg-${getCollectionColor(collection.name)}-600 rounded-lg flex items-center justify-center collection-icon`}>
                  <ApperIcon 
                    name={getCollectionIcon(collection.name)} 
                    size={24} 
                    className="text-white"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {collection.sourceCount} sources
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 line-clamp-3">
                {collection.description}
              </p>

              {/* Content Types */}
              <div className="flex flex-wrap gap-2 mb-4">
                {collection.contentTypes.map((type) => (
                  <Badge 
                    key={type} 
                    variant="default" 
                    className="text-xs"
                  >
                    {type.toUpperCase()}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Sources</span>
                  <span className="font-medium text-gray-900">{collection.sourceCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Size</span>
                  <span className="font-medium text-gray-900">
                    {formatFileSize(collection.totalSize)}
                  </span>
                </div>
                {collection.lastUpdated && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="font-medium text-gray-900">
                      {collection.lastUpdated.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1"
                >
                  <ApperIcon name="Search" size={14} className="mr-1" />
                  Browse
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1"
                >
                  <ApperIcon name="MessageCircle" size={14} className="mr-1" />
                  Ask
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CollectionsPage;