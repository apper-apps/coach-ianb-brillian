import answersMockData from "@/services/mockData/answers.json";
import citationsMockData from "@/services/mockData/citations.json";

class AnswersService {
  constructor() {
    this.answers = [...answersMockData];
    this.citations = [...citationsMockData];
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 800));
  }

  async getAll() {
    await this.delay();
    return [...this.answers];
  }

  async getById(id) {
    await this.delay();
    const answer = this.answers.find(a => a.Id === parseInt(id));
    if (!answer) throw new Error("Answer not found");
    return { ...answer };
  }

  async getByQuestionId(questionId) {
    await this.delay();
    const answer = this.answers.find(a => a.questionId === parseInt(questionId));
    if (!answer) throw new Error("Answer not found");
    return { ...answer };
  }

  async generateAnswer(questionId, format = "detailed") {
    await this.delay();
    
    // Simulate AI answer generation
    const sampleAnswers = {
      detailed: `
        <h3>Family Business Leadership Principles</h3>
        
        <p>Building a successful family business requires intentional leadership that balances family dynamics with business excellence. Here are the key principles:</p>
        
        <h4>1. Establish Clear Boundaries</h4>
        <ul>
          <li>Separate family meetings from business meetings</li>
          <li>Define roles and responsibilities clearly</li>
          <li>Create accountability structures that apply to everyone</li>
        </ul>
        
        <h4>2. Develop Next-Generation Leaders</h4>
        <ul>
          <li>Provide external work experience before joining the family business</li>
          <li>Create formal mentorship and development programs</li>
          <li>Establish merit-based advancement criteria</li>
        </ul>
        
        <h4>3. Focus on Purpose and Values</h4>
        <p>Remember, your family business exists to serve others and create value beyond just profit. When challenges arise, return to your core purpose and let it guide your decisions.</p>
        
        <p><strong>Next Step:</strong> Schedule a family business charter meeting within the next 30 days to align on vision, values, and decision-making processes.</p>
      `,
      summary: `
        • Establish clear boundaries between family and business decisions
        • Develop next-generation leaders through external experience and mentorship
        • Focus on purpose and values to guide difficult decisions
        • Create accountability structures that apply to all family members
        • Build merit-based systems for advancement and compensation
        
        <strong>Action:</strong> Schedule a family business charter meeting within 30 days to align on vision and processes.
      `
    };

    const confidence = 0.85 + Math.random() * 0.1; // 0.85-0.95
    const answerCitations = this.citations.slice(0, 3 + Math.floor(Math.random() * 3));

    const newAnswer = {
      Id: Math.max(...this.answers.map(a => a.Id), 0) + 1,
      questionId: parseInt(questionId),
      content: sampleAnswers[format],
      citations: answerCitations,
      confidence: confidence,
      generatedAt: new Date().toISOString()
    };
    
    this.answers.push(newAnswer);
    return { ...newAnswer };
  }

  async update(id, updates) {
    await this.delay();
    const index = this.answers.findIndex(a => a.Id === parseInt(id));
    if (index === -1) throw new Error("Answer not found");
    
    this.answers[index] = { ...this.answers[index], ...updates };
    return { ...this.answers[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.answers.findIndex(a => a.Id === parseInt(id));
    if (index === -1) throw new Error("Answer not found");
    
    this.answers.splice(index, 1);
    return true;
  }
}

export const answersService = new AnswersService();