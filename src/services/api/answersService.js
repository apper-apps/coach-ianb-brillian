class AnswersService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'answer_c';
    this.citationsTableName = 'citation_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "content_c" } },
          { field: { Name: "citations_c" } },
          { field: { Name: "confidence_c" } },
          { field: { Name: "generated_at_c" } },
          { field: { Name: "question_id_c" } }
        ],
        orderBy: [{ fieldName: "Id", sorttype: "DESC" }]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching answers:", error?.response?.data?.message);
      } else {
        console.error("Error fetching answers:", error.message);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "content_c" } },
          { field: { Name: "citations_c" } },
          { field: { Name: "confidence_c" } },
          { field: { Name: "generated_at_c" } },
          { field: { Name: "question_id_c" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching answer with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching answer with ID ${id}:`, error.message);
      }
      throw error;
    }
  }

  async getByQuestionId(questionId) {
    try {
      const params = {
        fields: [
          { field: { Name: "content_c" } },
          { field: { Name: "citations_c" } },
          { field: { Name: "confidence_c" } },
          { field: { Name: "generated_at_c" } },
          { field: { Name: "question_id_c" } }
        ],
        where: [
          {
            FieldName: "question_id_c",
            Operator: "EqualTo",
            Values: [parseInt(questionId)]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data || response.data.length === 0) {
        throw new Error("Answer not found");
      }
      
      return response.data[0];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching answer for question ${questionId}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching answer for question ${questionId}:`, error.message);
      }
      throw error;
    }
  }

  async generateAnswer(questionId, format = "detailed") {
    try {
      // Fetch sample citations
      const citationsResponse = await this.apperClient.fetchRecords(this.citationsTableName, {
        fields: [
          { field: { Name: "source_id_c" } },
          { field: { Name: "snippet_c" } },
          { field: { Name: "location_c" } },
          { field: { Name: "relevance_score_c" } },
          { field: { Name: "source_title_c" } },
          { field: { Name: "source_collection_c" } },
          { field: { Name: "source_content_type_c" } }
        ],
        pagingInfo: { limit: 6, offset: 0 }
      });

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
      const answerCitations = citationsResponse.success ? citationsResponse.data?.slice(0, 3 + Math.floor(Math.random() * 3)) || [] : [];

      const params = {
        records: [{
          question_id_c: parseInt(questionId),
          content_c: sampleAnswers[format],
          citations_c: JSON.stringify(answerCitations),
          confidence_c: confidence,
          generated_at_c: new Date().toISOString()
        }]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to generate answers ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }
        
        const successfulRecords = response.results.filter(result => result.success);
        const newAnswer = successfulRecords[0]?.data;
        
        // Return answer with parsed citations for compatibility
        return {
          ...newAnswer,
          citations: answerCitations
        };
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error generating answer:", error?.response?.data?.message);
      } else {
        console.error("Error generating answer:", error.message);
      }
      throw error;
    }
  }

  async update(id, updates) {
    try {
      const updateData = {
        Id: parseInt(id)
      };
      
      if (updates.content_c !== undefined) updateData.content_c = updates.content_c;
      if (updates.citations_c !== undefined) updateData.citations_c = typeof updates.citations_c === 'string' ? updates.citations_c : JSON.stringify(updates.citations_c);
      if (updates.confidence_c !== undefined) updateData.confidence_c = updates.confidence_c;
      
      const params = {
        records: [updateData]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update answers ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }
        
        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating answer:", error?.response?.data?.message);
      } else {
        console.error("Error updating answer:", error.message);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to delete answers ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to delete answer");
        }
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting answer:", error?.response?.data?.message);
      } else {
        console.error("Error deleting answer:", error.message);
      }
      throw error;
    }
  }
}

export const answersService = new AnswersService();