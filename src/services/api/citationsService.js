class CitationsService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'citation_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "source_id_c" } },
          { field: { Name: "snippet_c" } },
          { field: { Name: "location_c" } },
          { field: { Name: "relevance_score_c" } },
          { field: { Name: "source_title_c" } },
          { field: { Name: "source_collection_c" } },
          { field: { Name: "source_content_type_c" } }
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
        console.error("Error fetching citations:", error?.response?.data?.message);
      } else {
        console.error("Error fetching citations:", error.message);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "source_id_c" } },
          { field: { Name: "snippet_c" } },
          { field: { Name: "location_c" } },
          { field: { Name: "relevance_score_c" } },
          { field: { Name: "source_title_c" } },
          { field: { Name: "source_collection_c" } },
          { field: { Name: "source_content_type_c" } }
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
        console.error(`Error fetching citation with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching citation with ID ${id}:`, error.message);
      }
      throw error;
    }
  }

  async create(citationData) {
    try {
      const params = {
        records: [{
          Name: citationData.source_title_c || citationData.sourceTitle || "Citation",
          source_id_c: citationData.source_id_c || citationData.sourceId,
          snippet_c: citationData.snippet_c || citationData.snippet,
          location_c: citationData.location_c || citationData.location,
          relevance_score_c: citationData.relevance_score_c || citationData.relevanceScore || 0.8,
          source_title_c: citationData.source_title_c || citationData.sourceTitle,
          source_collection_c: citationData.source_collection_c || citationData.sourceCollection,
          source_content_type_c: citationData.source_content_type_c || citationData.sourceContentType
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
          console.error(`Failed to create citations ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
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
        console.error("Error creating citation:", error?.response?.data?.message);
      } else {
        console.error("Error creating citation:", error.message);
      }
      throw error;
    }
  }

  async update(id, updates) {
    try {
      const updateData = {
        Id: parseInt(id)
      };
      
      if (updates.source_id_c !== undefined) updateData.source_id_c = updates.source_id_c;
      if (updates.snippet_c !== undefined) updateData.snippet_c = updates.snippet_c;
      if (updates.location_c !== undefined) updateData.location_c = updates.location_c;
      if (updates.relevance_score_c !== undefined) updateData.relevance_score_c = updates.relevance_score_c;
      if (updates.source_title_c !== undefined) updateData.source_title_c = updates.source_title_c;
      if (updates.source_collection_c !== undefined) updateData.source_collection_c = updates.source_collection_c;
      if (updates.source_content_type_c !== undefined) updateData.source_content_type_c = updates.source_content_type_c;
      
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
          console.error(`Failed to update citations ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
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
        console.error("Error updating citation:", error?.response?.data?.message);
      } else {
        console.error("Error updating citation:", error.message);
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
          console.error(`Failed to delete citations ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to delete citation");
        }
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting citation:", error?.response?.data?.message);
      } else {
        console.error("Error deleting citation:", error.message);
      }
      throw error;
    }
  }
}

export const citationsService = new CitationsService();