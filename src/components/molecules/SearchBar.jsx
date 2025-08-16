import React, { useState } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search knowledge base...",
  showFilters = false,
  className = ""
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <ApperIcon 
          name="Search" 
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-4"
        />
      </div>
      
      <Button type="submit" disabled={!query.trim()}>
        Search
      </Button>
      
      {showFilters && (
        <Button variant="outline" type="button">
          <ApperIcon name="Filter" size={16} className="mr-2" />
          Filters
        </Button>
      )}
    </form>
  );
};

export default SearchBar;