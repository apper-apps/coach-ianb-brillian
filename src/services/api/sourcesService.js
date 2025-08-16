import sourcesMockData from "@/services/mockData/sources.json";

class SourcesService {
  constructor() {
    this.sources = [...sourcesMockData];
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 400));
  }

  async getAll() {
    await this.delay();
    return [...this.sources];
  }

  async getById(id) {
    await this.delay();
    const source = this.sources.find(s => s.Id === parseInt(id));
    if (!source) throw new Error("Source not found");
    return { ...source };
  }

  async create(sourceData) {
    await this.delay();
    const newSource = {
      Id: Math.max(...this.sources.map(s => s.Id), 0) + 1,
      title: sourceData.title,
      content: sourceData.content,
      contentType: sourceData.contentType,
      collection: sourceData.collection,
      uploadedBy: sourceData.uploadedBy || "current-user",
      uploadedAt: new Date().toISOString(),
      metadata: sourceData.metadata || {}
    };
    
    this.sources.push(newSource);
    return { ...newSource };
  }

  async update(id, updates) {
    await this.delay();
    const index = this.sources.findIndex(s => s.Id === parseInt(id));
    if (index === -1) throw new Error("Source not found");
    
    this.sources[index] = { ...this.sources[index], ...updates };
    return { ...this.sources[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.sources.findIndex(s => s.Id === parseInt(id));
    if (index === -1) throw new Error("Source not found");
    
    this.sources.splice(index, 1);
    return true;
  }

  async search(query, filters = {}) {
    await this.delay();
    let results = [...this.sources];
    
    // Apply text search
    if (query) {
      results = results.filter(source => 
        source.title.toLowerCase().includes(query.toLowerCase()) ||
        source.content.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters.collection) {
      results = results.filter(source => source.collection === filters.collection);
    }
    
    if (filters.contentType) {
      results = results.filter(source => source.contentType === filters.contentType);
    }
    
    if (filters.dateRange) {
      const now = new Date();
      let cutoff;
      
      switch (filters.dateRange) {
        case "last-week":
          cutoff = new Date(now.setDate(now.getDate() - 7));
          break;
        case "last-month":
          cutoff = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "last-3-months":
          cutoff = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case "last-year":
          cutoff = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          cutoff = null;
      }
      
      if (cutoff) {
        results = results.filter(source => new Date(source.uploadedAt) >= cutoff);
      }
    }
    
    // Add relevance score for search results
    results = results.map(source => ({
      ...source,
      relevanceScore: 0.8 + Math.random() * 0.2 // Simulate relevance scoring
    }));
    
    // Sort by relevance or specified criteria
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "date-desc":
          results.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
          break;
        case "date-asc":
          results.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
          break;
        case "title":
          results.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "relevance":
        default:
          results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
          break;
      }
    }
    
    return results;
  }
}

export const sourcesService = new SourcesService();