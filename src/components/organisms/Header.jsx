import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const Header = ({ onMenuToggle, className = "" }) => {
  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <ApperIcon name="Menu" size={20} />
          </Button>
          
          {/* Mobile Title */}
          <div className="lg:hidden">
            <h1 className="font-display font-bold text-gray-900">Coach IanB AI</h1>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="hidden lg:flex items-center justify-between w-full">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 font-display">
              Knowledge Base
            </h2>
            <p className="text-sm text-gray-600">
              Access Coach IanB's insights on leadership, business, and faith
            </p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <ApperIcon name="Bell" size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-600 rounded-full"></span>
          </Button>

          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-xs font-medium text-success">System Online</span>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <ApperIcon name="User" size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <Badge variant="secondary" className="text-xs">
                Editor
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;