class AnalyticsService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'analytics_c';
  }

  async getMetrics(timeRange = "7d") {
    try {
      const params = {
        fields: [
          { field: { Name: "questions_count_c" } },
          { field: { Name: "avg_confidence_c" } },
          { field: { Name: "active_users_c" } },
          { field: { Name: "source_utilization_c" } },
          { field: { Name: "peak_questions_c" } },
          { field: { Name: "peak_day_c" } },
          { field: { Name: "top_topics_c" } },
          { field: { Name: "confidence_distribution_c" } },
          { field: { Name: "coverage_gaps_c" } },
          { field: { Name: "most_referenced_sources_c" } }
        ],
        orderBy: [{ fieldName: "Id", sorttype: "DESC" }],
        pagingInfo: { limit: 1, offset: 0 }
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      const baseMetrics = response.data?.[0] || {
        questions_count_c: 342,
        avg_confidence_c: 0.84,
        active_users_c: 28,
        source_utilization_c: 0.76,
        peak_questions_c: 67,
        peak_day_c: "Monday",
        top_topics_c: JSON.stringify([
          { name: "Family Business Strategy", count: 45 },
          { name: "Leadership Development", count: 38 },
          { name: "Succession Planning", count: 32 }
        ]),
        confidence_distribution_c: JSON.stringify([
          { range: "High (80-100%)", percentage: 72 },
          { range: "Medium (60-79%)", percentage: 23 },
          { range: "Low (0-59%)", percentage: 5 }
        ]),
        coverage_gaps_c: JSON.stringify([
          { topic: "Digital Transformation", description: "Limited content", frequency: 12, avgConfidence: 0.45 }
        ]),
        most_referenced_sources_c: JSON.stringify([
          { id: 1, title: "Family Business Charter Framework", references: 127, avgRelevance: 0.92 }
        ])
      };

      // Simulate different metrics based on time range
      const multiplier = timeRange === "24h" ? 0.1 : timeRange === "7d" ? 1 : timeRange === "30d" ? 4 : 12;
      
      return {
        questionsCount: Math.round((baseMetrics.questions_count_c || 342) * multiplier),
        avgConfidence: baseMetrics.avg_confidence_c || 0.84,
        activeUsers: Math.round((baseMetrics.active_users_c || 28) * (timeRange === "24h" ? 0.3 : 1)),
        sourceUtilization: baseMetrics.source_utilization_c || 0.76,
        peakQuestions: baseMetrics.peak_questions_c || 67,
        peakDay: baseMetrics.peak_day_c || "Monday",
        questionsGrowth: -5 + Math.random() * 20,
        confidenceChange: -2 + Math.random() * 8,
        usersGrowth: -3 + Math.random() * 15,
        utilizationChange: -1 + Math.random() * 6,
        topTopics: baseMetrics.top_topics_c ? JSON.parse(baseMetrics.top_topics_c) : [
          { name: "Family Business Strategy", count: 45, percentage: 25 },
          { name: "Leadership Development", count: 38, percentage: 21 },
          { name: "Succession Planning", count: 32, percentage: 18 },
          { name: "Conflict Resolution", count: 28, percentage: 16 },
          { name: "Performance Management", count: 22, percentage: 12 },
          { name: "Faith Integration", count: 15, percentage: 8 }
        ],
        confidenceDistribution: baseMetrics.confidence_distribution_c ? JSON.parse(baseMetrics.confidence_distribution_c) : [
          { range: "High (80-100%)", percentage: 72 },
          { range: "Medium (60-79%)", percentage: 23 },
          { range: "Low (0-59%)", percentage: 5 }
        ],
        coverageGaps: baseMetrics.coverage_gaps_c ? JSON.parse(baseMetrics.coverage_gaps_c) : [
          {
            topic: "Digital Transformation",
            description: "Limited content on technology adoption in family businesses",
            frequency: 12,
            avgConfidence: 0.45
          },
          {
            topic: "International Expansion", 
            description: "Few sources covering global family business strategies",
            frequency: 8,
            avgConfidence: 0.52
          },
          {
            topic: "ESG Integration",
            description: "Minimal coverage of environmental and social governance",
            frequency: 6,
            avgConfidence: 0.38
          }
        ],
        mostReferencedSources: baseMetrics.most_referenced_sources_c ? JSON.parse(baseMetrics.most_referenced_sources_c) : [
          {
            id: 1,
            title: "Family Business Charter Framework",
            collection: "Family Business",
            contentType: "pdf",
            references: 127,
            avgRelevance: 0.92,
            lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            title: "Leadership in Crisis - Workshop Recording",
            collection: "Coaching & Workshops",
            contentType: "audio",
            references: 98,
            avgRelevance: 0.88,
            lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            title: "Succession Planning Best Practices",
            collection: "Strategy",
            contentType: "pdf",
            references: 85,
            avgRelevance: 0.91,
            lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching analytics metrics:", error?.response?.data?.message);
      } else {
        console.error("Error fetching analytics metrics:", error.message);
      }
      throw error;
    }
  }

  async getTopTopics(timeRange = "7d") {
    const metrics = await this.getMetrics(timeRange);
    return metrics.topTopics;
  }

  async getConfidenceDistribution() {
    const metrics = await this.getMetrics();
    return metrics.confidenceDistribution;
  }

  async getCoverageGaps() {
    const metrics = await this.getMetrics();
    return metrics.coverageGaps;
  }

  async getMostReferencedSources() {
    const metrics = await this.getMetrics();
    return metrics.mostReferencedSources;
  }
}

export const analyticsService = new AnalyticsService();