import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { analyticsService } from "@/services/api/analyticsService";

const AnalyticsPage = () => {
const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const timeRanges = [
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" }
  ];

const loadAnalytics = async () => {
    setLoading(true);
    setError("");
    
try {
      const analyticsData = await analyticsService.getMetrics(timeRange);
      setData(analyticsData);
    } catch (err) {
      // Reset to default structure on error to ensure dashboard displays
      setData({
        questionsCount: 0,
        avgConfidence: 0,
        activeUsers: 0,
        sourceUtilization: 0,
        peakQuestions: 0,
        peakDay: "N/A",
        questionsGrowth: 0,
        confidenceChange: 0,
        usersGrowth: 0,
        utilizationChange: 0,
        topTopics: [],
        confidenceDistribution: [],
        coverageGaps: [],
        mostReferencedSources: []
      });
      setError("Analytics data reset. Dashboard showing default values.");
      console.error("Load analytics error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadAnalytics();
  };

  useEffect(() => {
    loadAnalytics();
    
    // Set up automatic refresh every 30 seconds for real-time data
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
          <div className="h-5 bg-gray-300 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse h-64">
              <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
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
          title="Failed to Load Analytics"
          message={error}
          onRetry={loadAnalytics}
        />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track knowledge base usage, performance, and insights.
          </p>
        </div>
        
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-48"
        >
          {timeRanges.map(range => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="MessageCircle" size={20} className="text-white" />
            </div>
<div>
              <p className="text-sm text-primary-600 font-medium">Questions Asked</p>
              <p className="text-2xl font-bold text-primary-800">{data.questionsCount || 0}</p>
              <p className="text-xs text-primary-600">
                {(data.questionsGrowth || 0) > 0 ? "+" : ""}{Math.round(data.questionsGrowth || 0)}% vs last period
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-secondary-50 to-secondary-100 border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="Target" size={20} className="text-white" />
            </div>
<div>
              <p className="text-sm text-secondary-600 font-medium">Avg Confidence</p>
              <p className="text-2xl font-bold text-secondary-800">
                {Math.round((data.avgConfidence || 0) * 100)}%
              </p>
              <p className="text-xs text-secondary-600">
                {(data.confidenceChange || 0) > 0 ? "+" : ""}{Math.round(data.confidenceChange || 0)}% vs last period
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-accent-50 to-accent-100 border-accent-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="Users" size={20} className="text-white" />
            </div>
            <div>
<p className="text-sm text-accent-600 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-accent-800">{data.activeUsers || 0}</p>
              <p className="text-xs text-accent-600">
                {(data.usersGrowth || 0) > 0 ? "+" : ""}{Math.round(data.usersGrowth || 0)}% vs last period
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-success/20 to-success/30 border-success/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
              <ApperIcon name="Library" size={20} className="text-white" />
            </div>
            <div>
<p className="text-sm text-success font-medium">Source Utilization</p>
              <p className="text-2xl font-bold text-success">
                {Math.round((data.sourceUtilization || 0) * 100)}%
              </p>
              <p className="text-xs text-success">
                {(data.utilizationChange || 0) > 0 ? "+" : ""}{Math.round(data.utilizationChange || 0)}% vs last period
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Questions Over Time */}
        <Card elevation="1">
          <h3 className="font-semibold text-gray-900 mb-4">Questions Per Day</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ApperIcon name="TrendingUp" size={48} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization would appear here</p>
<p className="text-sm text-gray-400">Peak: {data.peakQuestions || 0} questions on {data.peakDay || "N/A"}</p>
            </div>
          </div>
        </Card>

        {/* Top Topics */}
        <Card elevation="1">
          <h3 className="font-semibold text-gray-900 mb-4">Top Topics</h3>
<div className="space-y-3">
            {(data.topTopics || []).length > 0 ? data.topTopics.map((topic, index) => (
              <div key={topic.name} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary-600 text-white rounded text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{topic.name}</span>
                    <span className="text-sm text-gray-500">{topic.count} questions</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${data.topTopics[0] ? (topic.count / data.topTopics[0].count) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No topic data available</p>
                <p className="text-sm">Topics will appear as questions are asked</p>
              </div>
            )}
          </div>
        </Card>

        {/* Confidence Distribution */}
        <Card elevation="1">
          <h3 className="font-semibold text-gray-900 mb-4">Answer Confidence Distribution</h3>
<div className="space-y-3">
            {(data.confidenceDistribution || []).length > 0 ? data.confidenceDistribution.map((level) => (
              <div key={level.range} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  level.range === "High (80-100%)" ? "bg-success" :
                  level.range === "Medium (60-79%)" ? "bg-warning" : "bg-error"
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{level.range}</span>
                    <span className="text-sm text-gray-500">{level.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        level.range === "High (80-100%)" ? "bg-success" :
                        level.range === "Medium (60-79%)" ? "bg-warning" : "bg-error"
                      }`}
                      style={{ width: `${level.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No confidence data available</p>
                <p className="text-sm">Distribution will appear as answers are generated</p>
              </div>
            )}
          </div>
        </Card>

        {/* Coverage Gaps */}
        <Card elevation="1">
          <h3 className="font-semibold text-gray-900 mb-4">Coverage Gaps</h3>
<div className="space-y-3">
            {(data.coverageGaps || []).length > 0 ? data.coverageGaps.map((gap, index) => (
              <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <ApperIcon name="AlertTriangle" size={16} className="text-warning" />
                  <span className="font-medium text-yellow-800">{gap.topic}</span>
                </div>
                <p className="text-sm text-yellow-700">{gap.description}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-yellow-600">
                  <span>{gap.frequency} questions</span>
                  <span>Avg confidence: {Math.round((gap.avgConfidence || 0) * 100)}%</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No coverage gaps identified</p>
                <p className="text-sm">Gaps will be identified as the knowledge base grows</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Most Referenced Sources */}
      <Card elevation="1">
        <h3 className="font-semibold text-gray-900 mb-4">Most Referenced Sources</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Collection</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">References</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Relevance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Last Used</th>
              </tr>
            </thead>
            <tbody>
{(data.mostReferencedSources || []).length > 0 ? data.mostReferencedSources.map((source, index) => (
                <tr key={source.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <ApperIcon 
                        name={source.contentType === "pdf" ? "FileText" : 
                              source.contentType === "audio" ? "Mic" : 
                              source.contentType === "video" ? "Video" : "File"} 
                        size={16} 
                        className="text-gray-500"
                      />
                      <span className="font-medium text-gray-900">{source.title || "Untitled"}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{source.collection || "Unknown"}</td>
                  <td className="py-3 px-4 text-gray-900 font-medium">{source.references || 0}</td>
                  <td className="py-3 px-4">
                    <span className="text-gray-900">{Math.round((source.avgRelevance || 0) * 100)}%</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {source.lastUsed ? new Date(source.lastUsed).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    <div>
                      <p>No source data available</p>
                      <p className="text-sm">Referenced sources will appear as content is used</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;