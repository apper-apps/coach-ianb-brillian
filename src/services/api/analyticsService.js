import analyticsMockData from "@/services/mockData/analytics.json";

class AnalyticsService {
  constructor() {
    this.analytics = [...analyticsMockData];
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 600));
  }

  async getMetrics(timeRange = "7d") {
    await this.delay();
    
    // Simulate different metrics based on time range
    const baseMetrics = this.analytics[0];
    const multiplier = timeRange === "24h" ? 0.1 : timeRange === "7d" ? 1 : timeRange === "30d" ? 4 : 12;
    
    return {
      ...baseMetrics,
      questionsCount: Math.round(baseMetrics.questionsCount * multiplier),
      activeUsers: Math.round(baseMetrics.activeUsers * (timeRange === "24h" ? 0.3 : 1)),
      questionsGrowth: -5 + Math.random() * 20,
      confidenceChange: -2 + Math.random() * 8,
      usersGrowth: -3 + Math.random() * 15,
      utilizationChange: -1 + Math.random() * 6
    };
  }

  async getTopTopics(timeRange = "7d") {
    await this.delay();
    return [
      { name: "Family Business Strategy", count: 45, percentage: 25 },
      { name: "Leadership Development", count: 38, percentage: 21 },
      { name: "Succession Planning", count: 32, percentage: 18 },
      { name: "Conflict Resolution", count: 28, percentage: 16 },
      { name: "Performance Management", count: 22, percentage: 12 },
      { name: "Faith Integration", count: 15, percentage: 8 }
    ];
  }

  async getConfidenceDistribution() {
    await this.delay();
    return [
      { range: "High (80-100%)", percentage: 72 },
      { range: "Medium (60-79%)", percentage: 23 },
      { range: "Low (0-59%)", percentage: 5 }
    ];
  }

  async getCoverageGaps() {
    await this.delay();
    return [
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
    ];
  }

  async getMostReferencedSources() {
    await this.delay();
    return [
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
    ];
  }
}

export const analyticsService = new AnalyticsService();