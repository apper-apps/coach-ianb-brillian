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
      setError("Failed to load analytics. Please try again.");
      console.error("Load analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
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
              <p className="text-2xl font-bold text-primary-800">{data.questionsCount}</p>
              <p className="text-xs text-primary-600">
                {data.questionsGrowth > 0 ? "+" : ""}{data.questionsGrowth}% vs last period
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
                {Math.round(data.avgConfidence * 100)}%
              </p>
              <p className="text-xs text-secondary-600">
                {data.confidenceChange > 0 ? "+" : ""}{data.confidenceChange}% vs last period
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
              <p className="text-2xl font-bold text-accent-800">{data.activeUsers}</p>
              <p className="text-xs text-accent-600">
                {data.usersGrowth > 0 ? "+" : ""}{data.usersGrowth}% vs last period
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
                {Math.round(data.sourceUtilization * 100)}%
              </p>
              <p className="text-xs text-success">
                {data.utilizationChange > 0 ? "+" : ""}{data.utilizationChange}% vs last period
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
              <p className="text-sm text-gray-400">Peak: {data.peakQuestions} questions on {data.peakDay}</p>
            </div>
          </div>
        </Card>

        {/* Top Topics */}
        <Card elevation="1">
          <h3 className="font-semibold text-gray-900 mb-4">Top Topics</h3>
          <div className="space-y-3">
            {data.topTopics.map((topic, index) => (
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
                      style={{ width: `${(topic.count / data.topTopics[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Confidence Distribution */}
        <Card elevation="1">
          <h3 className="font-semibold text-gray-900 mb-4">Answer Confidence Distribution</h3>
          <div className="space-y-3">
            {data.confidenceDistribution.map((level) => (
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
            ))}
          </div>
        </Card>

        {/* Coverage Gaps */}
        <Card elevation="1">
          <h3 className="font-semibold text-gray-900 mb-4">Coverage Gaps</h3>
          <div className="space-y-3">
            {data.coverageGaps.map((gap, index) => (
              <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <ApperIcon name="AlertTriangle" size={16} className="text-warning" />
                  <span className="font-medium text-yellow-800">{gap.topic}</span>
                </div>
                <p className="text-sm text-yellow-700">{gap.description}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-yellow-600">
                  <span>{gap.frequency} questions</span>
                  <span>Avg confidence: {Math.round(gap.avgConfidence * 100)}%</span>
                </div>
              </div>
            ))}
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
              {data.mostReferencedSources.map((source, index) => (
                <tr key={source.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <ApperIcon 
                        name={source.contentType === "pdf" ? "FileText" : 
                              source.contentType === "audio" ? "Mic" : "Video"} 
                        size={16} 
                        className="text-gray-500"
                      />
                      <span className="font-medium text-gray-900">{source.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{source.collection}</td>
                  <td className="py-3 px-4 text-gray-900 font-medium">{source.references}</td>
                  <td className="py-3 px-4">
                    <span className="text-gray-900">{Math.round(source.avgRelevance * 100)}%</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(source.lastUsed).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;