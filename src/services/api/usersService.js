import usersMockData from "@/services/mockData/users.json";

class UsersService {
  constructor() {
    this.users = [...usersMockData];
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }

  async getAll() {
    await this.delay();
    return [...this.users];
  }

  async getById(id) {
    await this.delay();
    const user = this.users.find(u => u.Id === parseInt(id));
    if (!user) throw new Error("User not found");
    return { ...user };
  }

  async create(userData) {
    await this.delay();
    const newUser = {
      Id: Math.max(...this.users.map(u => u.Id), 0) + 1,
      email: userData.email,
      role: userData.role || "member",
      joinedAt: new Date().toISOString(),
      name: userData.name
    };
    
    this.users.push(newUser);
    return { ...newUser };
  }

  async update(id, updates) {
    await this.delay();
    const index = this.users.findIndex(u => u.Id === parseInt(id));
    if (index === -1) throw new Error("User not found");
    
    this.users[index] = { ...this.users[index], ...updates };
    return { ...this.users[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.users.findIndex(u => u.Id === parseInt(id));
    if (index === -1) throw new Error("User not found");
    
    this.users.splice(index, 1);
    return true;
  }
}

export const usersService = new UsersService();