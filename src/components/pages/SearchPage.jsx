import React, { useState, useEffect } from "react";
import SearchBar from "@/components/molecules/SearchBar";
import SearchResults from "@/components/organisms/SearchResults";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { sourcesService } from "@/services/api/sourcesService";
import { toast } from "react-toastify";

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    collection: "",
    contentType: "",
    dateRange: "",
    sortBy: "relevance"
  });
  const [showFilters, setShowFilters] = useState(false);

  const collections = [
    "Family Business",
    "Sermons & Theology", 
    "Coaching & Workshops",
    "Sales & FMCG",
    "Operations & HR",
    "Strategy",
    "Interviews & Panels"
  ];

  const contentTypes = ["pdf", "audio", "video", "document"];
  const dateRanges = ["last-week", "last-month", "last-3-months", "last-year"];
  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "date-desc", label: "Newest First" },
    { value: "date-asc", label: "Oldest First" },
    { value: "title", label: "Title A-Z" }
  ];

  const handleSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const searchResults = await sourcesService.search(query, filters);
      setResults(searchResults);
    } catch (err) {
      setError("Failed to search. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceOpen = (source) => {
    toast.info(`Opening: ${source.title}`);
    // In a real implementation, this would open the source document/media
  };

  const clearFilters = () => {
    setFilters({
      collection: "",
      contentType: "",
      dateRange: "",
      sortBy: "relevance"
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== "relevance");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
          Search Knowledge Base
        </h1>
        <p className="text-gray-600">
          Find specific content across all of Coach IanB's documents, audio, and video materials.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <SearchBar 
          onSearch={handleSearch}
          showFilters={false}
          className="mb-4"
        />

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Filter" size={16} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-accent-600 rounded-full ml-1"></span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection
              </label>
              <Select
                value={filters.collection}
                onChange={(e) => setFilters(prev => ({ ...prev, collection: e.target.value }))}
              >
                <option value="">All Collections</option>
                {collections.map(collection => (
                  <option key={collection} value={collection}>
                    {collection}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <Select
                value={filters.contentType}
                onChange={(e) => setFilters(prev => ({ ...prev, contentType: e.target.value }))}
              >
                <option value="">All Types</option>
                {contentTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <Select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="">All Time</option>
                <option value="last-week">Last Week</option>
                <option value="last-month">Last Month</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-year">Last Year</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <Select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <SearchResults
        results={results}
        loading={loading}
        error={error}
        onRetry={() => {/* Retry last search */}}
        onSourceOpen={handleSourceOpen}
      />
    </div>
  );
};

export default SearchPage;