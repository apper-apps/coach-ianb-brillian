class SourcesService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'source_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "content_c" } },
          { field: { Name: "content_type_c" } },
          { field: { Name: "collection_c" } },
          { field: { Name: "uploaded_by_c" } },
          { field: { Name: "uploaded_at_c" } },
          { field: { Name: "metadata_c" } }
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
        console.error("Error fetching sources:", error?.response?.data?.message);
      } else {
        console.error("Error fetching sources:", error.message);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "content_c" } },
          { field: { Name: "content_type_c" } },
          { field: { Name: "collection_c" } },
          { field: { Name: "uploaded_by_c" } },
          { field: { Name: "uploaded_at_c" } },
          { field: { Name: "metadata_c" } }
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
        console.error(`Error fetching source with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching source with ID ${id}:`, error.message);
      }
      throw error;
    }
  }

  async create(sourceData) {
    try {
      const params = {
        records: [{
          Name: sourceData.title_c || sourceData.title,
          title_c: sourceData.title_c || sourceData.title,
          content_c: sourceData.content_c || sourceData.content,
          content_type_c: sourceData.content_type_c || sourceData.contentType,
          collection_c: sourceData.collection_c || sourceData.collection,
          uploaded_by_c: sourceData.uploaded_by_c || sourceData.uploadedBy || "current-user",
          uploaded_at_c: new Date().toISOString(),
          metadata_c: typeof sourceData.metadata_c === 'string' ? sourceData.metadata_c : JSON.stringify(sourceData.metadata_c || sourceData.metadata || {})
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
          console.error(`Failed to create sources ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
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
        console.error("Error creating source:", error?.response?.data?.message);
      } else {
        console.error("Error creating source:", error.message);
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
      if (updates.title_c !== undefined) updateData.title_c = updates.title_c;
      if (updates.title !== undefined) {
        updateData.title_c = updates.title;
        updateData.Name = updates.title;
      }
      if (updates.content_c !== undefined) updateData.content_c = updates.content_c;
      if (updates.content !== undefined) updateData.content_c = updates.content;
      if (updates.content_type_c !== undefined) updateData.content_type_c = updates.content_type_c;
      if (updates.contentType !== undefined) updateData.content_type_c = updates.contentType;
      if (updates.collection_c !== undefined) updateData.collection_c = updates.collection_c;
      if (updates.collection !== undefined) updateData.collection_c = updates.collection;
      if (updates.uploaded_by_c !== undefined) updateData.uploaded_by_c = updates.uploaded_by_c;
      if (updates.uploadedBy !== undefined) updateData.uploaded_by_c = updates.uploadedBy;
      if (updates.metadata_c !== undefined) updateData.metadata_c = typeof updates.metadata_c === 'string' ? updates.metadata_c : JSON.stringify(updates.metadata_c);
      if (updates.metadata !== undefined) updateData.metadata_c = typeof updates.metadata === 'string' ? updates.metadata : JSON.stringify(updates.metadata);
      
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
          console.error(`Failed to update sources ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
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
        console.error("Error updating source:", error?.response?.data?.message);
      } else {
        console.error("Error updating source:", error.message);
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
          console.error(`Failed to delete sources ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to delete source");
        }
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting source:", error?.response?.data?.message);
      } else {
        console.error("Error deleting source:", error.message);
      }
      throw error;
    }
  }

  async search(query, filters = {}) {
    try {
      const whereConditions = [];
      
      if (query) {
        whereConditions.push({
          FieldName: "title_c",
          Operator: "Contains",
          Values: [query]
        });
        whereConditions.push({
          FieldName: "content_c",
          Operator: "Contains",
          Values: [query]
        });
      }
      
      if (filters.collection) {
        whereConditions.push({
          FieldName: "collection_c",
          Operator: "EqualTo",
          Values: [filters.collection]
        });
      }
      
      if (filters.contentType) {
        whereConditions.push({
          FieldName: "content_type_c",
          Operator: "EqualTo",
          Values: [filters.contentType]
        });
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
        }
        
        if (cutoff) {
          whereConditions.push({
            FieldName: "uploaded_at_c",
            Operator: "GreaterThanOrEqualTo",
            Values: [cutoff.toISOString()]
          });
        }
      }
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "content_c" } },
          { field: { Name: "content_type_c" } },
          { field: { Name: "collection_c" } },
          { field: { Name: "uploaded_by_c" } },
          { field: { Name: "uploaded_at_c" } },
          { field: { Name: "metadata_c" } }
        ],
        where: whereConditions.length > 0 ? whereConditions : undefined
      };

      // Add sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "date-desc":
            params.orderBy = [{ fieldName: "uploaded_at_c", sorttype: "DESC" }];
            break;
          case "date-asc":
            params.orderBy = [{ fieldName: "uploaded_at_c", sorttype: "ASC" }];
            break;
          case "title":
            params.orderBy = [{ fieldName: "title_c", sorttype: "ASC" }];
            break;
          case "relevance":
          default:
            params.orderBy = [{ fieldName: "Id", sorttype: "DESC" }];
            break;
        }
      } else {
        params.orderBy = [{ fieldName: "Id", sorttype: "DESC" }];
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Add relevance score for search results
      const results = (response.data || []).map(source => ({
        ...source,
        relevanceScore: 0.8 + Math.random() * 0.2 // Simulate relevance scoring
      }));
      
      return results;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error searching sources:", error?.response?.data?.message);
      } else {
        console.error("Error searching sources:", error.message);
      }
      throw error;
    }
  }
}

export const sourcesService = new SourcesService();