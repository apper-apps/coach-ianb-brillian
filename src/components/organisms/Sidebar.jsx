import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";
import { sourcesService } from "@/services/api/sourcesService";
import { collectionsService } from "@/services/api/collectionsService";
const Sidebar = ({ isOpen, onClose, className = "" }) => {
  const location = useLocation();
  const [sourcesCount, setSourcesCount] = useState(0);
  const [collectionsCount, setCollectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    try {
      const [sourcesData, collectionsData] = await Promise.all([
        sourcesService.getAll(),
        collectionsService.getAll()
      ]);
      
      setSourcesCount(sourcesData.length);
      setCollectionsCount(collectionsData.length);
    } catch (error) {
      console.error("Error fetching sidebar counts:", error.message);
      // Keep existing counts if fetch fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
    
    // Set up automatic refresh every 60 seconds
    const interval = setInterval(() => {
      fetchCounts();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    { path: "/ask", label: "Ask", icon: "MessageCircle", badge: null },
    { path: "/search", label: "Search", icon: "Search", badge: null },
    { 
      path: "/sources", 
      label: "Sources", 
      icon: "Library", 
      badge: loading ? "..." : sourcesCount.toLocaleString()
    },
    { path: "/uploads", label: "Uploads", icon: "Upload", badge: null },
    { 
      path: "/collections", 
      label: "Collections", 
      icon: "FolderOpen", 
      badge: loading ? "..." : collectionsCount.toString()
    },
    { path: "/analytics", label: "Analytics", icon: "BarChart3", badge: null },
    { path: "/admin", label: "Admin", icon: "Settings", badge: null }
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      onClick={() => onClose?.()}
      className={({ isActive }) => cn(
        "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary-700/50",
        isActive 
          ? "bg-primary-700 text-white" 
          : "text-primary-100 hover:text-white"
      )}
    >
      <div className="flex items-center gap-3">
        <ApperIcon name={item.icon} size={20} />
        <span>{item.label}</span>
      </div>
      {item.badge && (
        <Badge variant="default" className="bg-white/20 text-white text-xs">
          {item.badge}
        </Badge>
      )}
    </NavLink>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:block w-64 bg-primary-600 h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-primary-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="Brain" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg">Coach IanB</h1>
              <p className="text-primary-200 text-sm">Knowledge AI</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-primary-500">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-700/30">
            <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center">
              <ApperIcon name="User" size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Team Member</p>
              <Badge variant="default" className="bg-white/20 text-white text-xs mt-1">
                Editor
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <div className={cn(
      "lg:hidden fixed inset-0 z-50 transition-opacity duration-300",
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-80 bg-primary-600 transform transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Brain" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-white text-lg">Coach IanB</h1>
                <p className="text-primary-200 text-sm">Knowledge AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-primary-200 hover:text-white p-2"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-primary-500">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-700/30">
              <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center">
                <ApperIcon name="User" size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Team Member</p>
                <Badge variant="default" className="bg-white/20 text-white text-xs mt-1">
                  Editor
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;