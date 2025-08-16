import questionsMockData from "@/services/mockData/questions.json";

class QuestionsService {
  constructor() {
    this.questions = [...questionsMockData];
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }

  async getAll() {
    await this.delay();
    return [...this.questions];
  }

  async getById(id) {
    await this.delay();
    const question = this.questions.find(q => q.Id === parseInt(id));
    if (!question) throw new Error("Question not found");
    return { ...question };
  }

  async create(questionData) {
    await this.delay();
    const newQuestion = {
      Id: Math.max(...this.questions.map(q => q.Id), 0) + 1,
      text: questionData.text,
      userId: questionData.userId,
      timestamp: new Date().toISOString(),
      answerFormat: questionData.answerFormat || "detailed"
    };
    
    this.questions.push(newQuestion);
    return { ...newQuestion };
  }

  async update(id, updates) {
    await this.delay();
    const index = this.questions.findIndex(q => q.Id === parseInt(id));
    if (index === -1) throw new Error("Question not found");
    
    this.questions[index] = { ...this.questions[index], ...updates };
    return { ...this.questions[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.questions.findIndex(q => q.Id === parseInt(id));
    if (index === -1) throw new Error("Question not found");
    
    this.questions.splice(index, 1);
    return true;
  }

  async search(query, filters = {}) {
    await this.delay();
    let results = [...this.questions];
    
    if (query) {
      results = results.filter(q => 
        q.text.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (filters.userId) {
      results = results.filter(q => q.userId === filters.userId);
    }
    
    if (filters.answerFormat) {
      results = results.filter(q => q.answerFormat === filters.answerFormat);
    }
    
    return results;
  }
}

export const questionsService = new QuestionsService();