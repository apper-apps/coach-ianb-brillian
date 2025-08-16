import adminMockData from "@/services/mockData/admin.json";

class AdminService {
  constructor() {
    this.adminData = { ...adminMockData };
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  async getSystemStats() {
    await this.delay();
    return {
      status: "Online",
      totalSources: 1247,
      storageUsed: "84.3 GB",
      uptime: "99.8%",
      lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      activeConnections: 23,
      avgResponseTime: "1.2s"
    };
  }

  async executeTool(toolName) {
    await this.delay();
    
    // Simulate tool execution
    const tools = {
      rebuild_index: "Search index rebuilt successfully",
      merge_sources: "3 duplicate sources merged",
      batch_retag: "145 sources retagged",
      retranscribe: "12 audio files retranscribed",
      export_data: "Q&A export generated",
      cleanup: "Temporary files cleaned, 2.1 GB freed"
    };
    
    const result = tools[toolName] || "Tool executed successfully";
    return { success: true, message: result };
  }

  async getNotificationSettings() {
    await this.delay();
    return {
      weeklyDigest: {
        enabled: true,
        day: "monday",
        recipients: ["owner", "admin"]
      },
      uploadAlerts: {
        failures: true,
        successes: false
      },
      systemAlerts: {
        highErrorRates: true,
        lowConfidenceTrends: true,
        storageWarnings: false
      }
    };
  }

  async updateNotificationSettings(settings) {
    await this.delay();
    this.adminData.notificationSettings = { ...this.adminData.notificationSettings, ...settings };
    return { success: true };
  }
}

export const adminService = new AdminService();