import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { adminService } from "@/services/api/adminService";
import { usersService } from "@/services/api/usersService";
import { toast } from "react-toastify";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTab, setSelectedTab] = useState("users");

  const tabs = [
    { id: "users", label: "Users", icon: "Users" },
    { id: "system", label: "System", icon: "Settings" },
    { id: "tools", label: "Tools", icon: "Wrench" },
    { id: "notifications", label: "Notifications", icon: "Bell" }
  ];

  const roles = ["owner", "admin", "editor", "member", "viewer"];

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [usersData, statsData] = await Promise.all([
        usersService.getAll(),
        adminService.getSystemStats()
      ]);
      
      setUsers(usersData);
      setSystemStats(statsData);
    } catch (err) {
      setError("Failed to load admin data. Please try again.");
      console.error("Load admin data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersService.update(userId, { role: newRole });
      setUsers(prev => prev.map(user => 
        user.Id === userId ? { ...user, role: newRole } : user
      ));
      toast.success("User role updated successfully");
    } catch (err) {
      toast.error("Failed to update user role");
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await usersService.delete(userId);
      setUsers(prev => prev.filter(user => user.Id !== userId));
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const handleToolAction = async (action) => {
    try {
      await adminService.executeTool(action);
      toast.success(`${action} completed successfully`);
    } catch (err) {
      toast.error(`Failed to execute ${action}`);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "owner": return "error";
      case "admin": return "warning";
      case "editor": return "accent";
      case "member": return "primary";
      case "viewer": return "default";
      default: return "default";
    }
  };

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
          title="Failed to Load Admin Data"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
          Administration
        </h1>
        <p className="text-gray-600">
          Manage users, system settings, and maintenance tools.
        </p>
      </div>

      {/* System Status */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-success/20 to-success/30 border-success/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                <ApperIcon name="CheckCircle" size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-success font-medium">System Status</p>
                <p className="text-lg font-bold text-success">{systemStats.status}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Database" size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-primary-600 font-medium">Total Sources</p>
                <p className="text-lg font-bold text-primary-800">{systemStats.totalSources}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-secondary-50 to-secondary-100 border-secondary-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="HardDrive" size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-secondary-600 font-medium">Storage Used</p>
                <p className="text-lg font-bold text-secondary-800">{systemStats.storageUsed}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-accent-50 to-accent-100 border-accent-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Activity" size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-accent-600 font-medium">Uptime</p>
                <p className="text-lg font-bold text-accent-800">{systemStats.uptime}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? "border-primary-500 text-primary-600 bg-primary-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ApperIcon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Users Tab */}
          {selectedTab === "users" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <Button>
                  <ApperIcon name="UserPlus" size={16} className="mr-2" />
                  Invite User
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Joined</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.Id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                              <ApperIcon name="User" size={16} className="text-white" />
                            </div>
                            <span className="font-medium text-gray-900">{user.name || "User"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <Select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.Id, e.target.value)}
                            className="w-32 text-sm"
                          >
                            {roles.map(role => (
                              <option key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </option>
                            ))}
                          </Select>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(user.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <ApperIcon name="Edit" size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUserDelete(user.Id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <ApperIcon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* System Tab */}
          {selectedTab === "system" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">System Configuration</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h4 className="font-medium text-gray-900 mb-4">Search Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Confidence Threshold
                      </label>
                      <Input type="number" defaultValue="0.45" min="0" max="1" step="0.05" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Results per Query
                      </label>
                      <Input type="number" defaultValue="8" min="1" max="20" />
                    </div>
                    <Button variant="outline" size="sm">Save Settings</Button>
                  </div>
                </Card>

                <Card>
                  <h4 className="font-medium text-gray-900 mb-4">Content Processing</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Auto-transcription
                      </label>
                      <Select defaultValue="enabled">
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chunk Size (tokens)
                      </label>
                      <Input type="number" defaultValue="700" min="200" max="2000" />
                    </div>
                    <Button variant="outline" size="sm">Save Settings</Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Tools Tab */}
          {selectedTab === "tools" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Maintenance Tools</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <div className="flex items-center gap-3 mb-3">
                    <ApperIcon name="RefreshCw" size={20} className="text-primary-600" />
                    <h4 className="font-medium text-gray-900">Rebuild Index</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Recreate the search index for all sources
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleToolAction("rebuild_index")}
                  >
                    Rebuild
                  </Button>
                </Card>

                <Card>
                  <div className="flex items-center gap-3 mb-3">
                    <ApperIcon name="Merge" size={20} className="text-secondary-600" />
                    <h4 className="font-medium text-gray-900">Merge Sources</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Combine duplicate or related sources
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToolAction("merge_sources")}
                  >
                    Start Merge
                  </Button>
                </Card>

                <Card>
                  <div className="flex items-center gap-3 mb-3">
                    <ApperIcon name="Tags" size={20} className="text-accent-600" />
                    <h4 className="font-medium text-gray-900">Batch Retag</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Update tags for multiple sources at once
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToolAction("batch_retag")}
                  >
                    Retag
                  </Button>
                </Card>

                <Card>
                  <div className="flex items-center gap-3 mb-3">
                    <ApperIcon name="Mic" size={20} className="text-warning" />
                    <h4 className="font-medium text-gray-900">Retranscribe</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Re-process audio/video transcriptions
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToolAction("retranscribe")}
                  >
                    Process
                  </Button>
                </Card>

                <Card>
                  <div className="flex items-center gap-3 mb-3">
                    <ApperIcon name="Download" size={20} className="text-info" />
                    <h4 className="font-medium text-gray-900">Export Data</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Export Q&A pairs with citations
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToolAction("export_data")}
                  >
                    Export
                  </Button>
                </Card>

                <Card>
                  <div className="flex items-center gap-3 mb-3">
                    <ApperIcon name="Trash2" size={20} className="text-error" />
                    <h4 className="font-medium text-gray-900">Cleanup</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Remove old temporary files and caches
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToolAction("cleanup")}
                  >
                    Clean
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {selectedTab === "notifications" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
              
              <div className="space-y-6">
                <Card>
                  <h4 className="font-medium text-gray-900 mb-4">Weekly Digest</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Send weekly digest to owners and admins</span>
                    </label>
                    <div className="ml-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Send on
                      </label>
                      <Select defaultValue="monday" className="w-32">
                        <option value="monday">Monday</option>
                        <option value="friday">Friday</option>
                        <option value="sunday">Sunday</option>
                      </Select>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h4 className="font-medium text-gray-900 mb-4">Upload Alerts</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Alert on upload failures</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Alert on successful uploads</span>
                    </label>
                  </div>
                </Card>

                <Card>
                  <h4 className="font-medium text-gray-900 mb-4">System Alerts</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">High error rates</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Low confidence trends</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Storage capacity warnings</span>
                    </label>
                  </div>
                </Card>

                <Button>Save Notification Settings</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;