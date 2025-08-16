import collectionsMockData from "@/services/mockData/collections.json";

class CollectionsService {
  constructor() {
    this.collections = [...collectionsMockData];
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }

  async getAll() {
    await this.delay();
    return [...this.collections];
  }

  async getById(id) {
    await this.delay();
    const collection = this.collections.find(c => c.Id === parseInt(id));
    if (!collection) throw new Error("Collection not found");
    return { ...collection };
  }

  async create(collectionData) {
    await this.delay();
    const newCollection = {
      Id: Math.max(...this.collections.map(c => c.Id), 0) + 1,
      name: collectionData.name,
      description: collectionData.description,
      createdAt: new Date().toISOString(),
      createdBy: collectionData.createdBy || "current-user"
    };
    
    this.collections.push(newCollection);
    return { ...newCollection };
  }

  async update(id, updates) {
    await this.delay();
    const index = this.collections.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error("Collection not found");
    
    this.collections[index] = { ...this.collections[index], ...updates };
    return { ...this.collections[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.collections.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error("Collection not found");
    
    this.collections.splice(index, 1);
    return true;
  }
}

export const collectionsService = new CollectionsService();