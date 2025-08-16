class QuestionsService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'question_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "text_c" } },
          { field: { Name: "user_id_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "answer_format_c" } }
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
        console.error("Error fetching questions:", error?.response?.data?.message);
      } else {
        console.error("Error fetching questions:", error.message);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "text_c" } },
          { field: { Name: "user_id_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "answer_format_c" } }
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
        console.error(`Error fetching question with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching question with ID ${id}:`, error.message);
      }
      throw error;
    }
  }

  async create(questionData) {
    try {
      const params = {
        records: [{
          Name: questionData.text?.substring(0, 50) || "Question",
          text_c: questionData.text,
          user_id_c: questionData.userId || questionData.user_id_c,
          timestamp_c: new Date().toISOString(),
          answer_format_c: questionData.answerFormat || questionData.answer_format_c || "detailed"
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
          console.error(`Failed to create questions ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
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
        console.error("Error creating question:", error?.response?.data?.message);
      } else {
        console.error("Error creating question:", error.message);
      }
      throw error;
    }
  }

  async update(id, updates) {
    try {
      const updateData = {
        Id: parseInt(id)
      };
      
      if (updates.Name !== undefined) updateData.Name = updates.Name;
      if (updates.text_c !== undefined) updateData.text_c = updates.text_c;
      if (updates.user_id_c !== undefined) updateData.user_id_c = updates.user_id_c;
      if (updates.answer_format_c !== undefined) updateData.answer_format_c = updates.answer_format_c;
      if (updates.text !== undefined) {
        updateData.text_c = updates.text;
        updateData.Name = updates.text.substring(0, 50);
      }
      if (updates.answerFormat !== undefined) updateData.answer_format_c = updates.answerFormat;
      
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
          console.error(`Failed to update questions ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
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
        console.error("Error updating question:", error?.response?.data?.message);
      } else {
        console.error("Error updating question:", error.message);
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
          console.error(`Failed to delete questions ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to delete question");
        }
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting question:", error?.response?.data?.message);
      } else {
        console.error("Error deleting question:", error.message);
      }
      throw error;
    }
  }

  async search(query, filters = {}) {
    try {
      const whereConditions = [];
      
      if (query) {
        whereConditions.push({
          FieldName: "text_c",
          Operator: "Contains",
          Values: [query]
        });
      }
      
      if (filters.userId) {
        whereConditions.push({
          FieldName: "user_id_c",
          Operator: "EqualTo",
          Values: [filters.userId]
        });
      }
      
      if (filters.answerFormat) {
        whereConditions.push({
          FieldName: "answer_format_c",
          Operator: "EqualTo",
          Values: [filters.answerFormat]
        });
      }
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "text_c" } },
          { field: { Name: "user_id_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "answer_format_c" } }
        ],
        where: whereConditions,
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
        console.error("Error searching questions:", error?.response?.data?.message);
      } else {
        console.error("Error searching questions:", error.message);
      }
      throw error;
    }
  }
}

export const questionsService = new QuestionsService();