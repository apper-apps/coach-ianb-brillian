import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collectionsService } from "@/services/api/collectionsService";
import { sourcesService } from "@/services/api/sourcesService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Label from "@/components/atoms/Label";

const CollectionsPage = () => {
const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    loadCollections();
  }, []);

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
          source.collection_c === collection.Name || source.collection === collection.Name
        );
        
        const contentTypes = [...new Set(collectionSources.map(s => s.content_type_c || s.contentType))];
        const totalSize = collectionSources.reduce((sum, source) => 
          sum + (source.metadata_c ? (typeof source.metadata_c === 'string' ? JSON.parse(source.metadata_c).fileSize || 0 : source.metadata_c.fileSize || 0) : source.metadata?.fileSize || 0), 0
        );
        const lastUpdated = collectionSources.length > 0 
          ? new Date(Math.max(...collectionSources.map(s => new Date(s.uploaded_at_c || s.uploadedAt))))
          : null;

        return {
          ...collection,
          name: collection.Name,
          description: collection.description_c,
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

  const handleCreateCollection = async () => {
    if (!formData.name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    try {
      await collectionsService.create({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      toast.success("Collection created successfully");
      setShowCreateModal(false);
      setFormData({ name: "", description: "" });
      loadCollections();
    } catch (err) {
      toast.error("Failed to create collection");
      console.error("Error creating collection:", err);
    }
  };

  const handleEditCollection = async () => {
    if (!formData.name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    try {
      await collectionsService.update(editingCollection.Id, {
        name: formData.name.trim(),
        description_c: formData.description.trim()
      });
      
      toast.success("Collection updated successfully");
      setShowEditModal(false);
      setEditingCollection(null);
      setFormData({ name: "", description: "" });
      loadCollections();
    } catch (err) {
      toast.error("Failed to update collection");
      console.error("Error updating collection:", err);
    }
  };

  const handleDeleteCollection = async (collection) => {
    if (!confirm(`Are you sure you want to delete "${collection.Name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await collectionsService.delete(collection.Id);
      toast.success("Collection deleted successfully");
      loadCollections();
    } catch (err) {
      toast.error("Failed to delete collection");
      console.error("Error deleting collection:", err);
    }
  };

  const openEditModal = (collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.Name || "",
      description: collection.description_c || ""
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingCollection(null);
setFormData({ name: "", description: "" });
  };


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
          Organize and manage your content collections with secure upload controls.
        </p>
      </div>
      
      <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
        <ApperIcon name="Plus" size={16} />
        Create Collection
      </Button>
      {/* Collections Grid */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <motion.div
              key={collection.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200" elevation="1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                      <ApperIcon 
                        name="FolderOpen" 
                        size={24} 
                        className="text-primary-600 collection-icon"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                        {collection.Name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {collection.created_by_c || "System"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(collection)}
                      className="text-gray-500 hover:text-primary-600"
                    >
                      <ApperIcon name="Edit2" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCollection(collection)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {collection.description_c || "No description provided."}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Created {collection.created_at_c ? 
                        new Date(collection.created_at_c).toLocaleDateString() : 
                        "Recently"
                      }
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12" elevation="1">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name="FolderOpen" size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Collections Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first collection to start organizing your content.
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Collection
          </Button>
        </Card>
      )}

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create Collection</h2>
                <Button variant="ghost" size="sm" onClick={closeModals}>
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Collection Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter collection name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this collection..."
                    rows={3}
                    className="mt-1 flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={closeModals} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateCollection} className="flex-1">
                  Create Collection
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Collection Modal */}
      {showEditModal && editingCollection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Edit Collection</h2>
                <Button variant="ghost" size="sm" onClick={closeModals}>
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Collection Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter collection name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this collection..."
                    rows={3}
                    className="mt-1 flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={closeModals} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleEditCollection} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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