class CollectionPasswordService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'collection_password_c';
  }

  async getPasswordByCollectionId(collectionId) {
    try {
      const params = {
        fields: [
          { field: { Name: "password_hash_c" } },
          { field: { Name: "salt_c" } },
          { field: { Name: "collection_id_c" } }
        ],
        where: [
          {
            FieldName: "collection_id_c",
            Operator: "EqualTo",
            Values: [parseInt(collectionId)]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data?.[0] || null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching collection password:", error?.response?.data?.message);
      } else {
        console.error("Error fetching collection password:", error.message);
      }
      throw error;
    }
  }

  async createPassword(collectionId, password) {
    try {
      // In production, you would hash the password with a proper hashing library
      const salt = Math.random().toString(36).substring(2, 15);
      const passwordHash = this.simpleHash(password + salt);

      const params = {
        records: [{
          Name: `Password for Collection ${collectionId}`,
          collection_id_c: parseInt(collectionId),
          password_hash_c: passwordHash,
          salt_c: salt
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
          console.error(`Failed to create collection password ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to create collection password");
        }
        
        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating collection password:", error?.response?.data?.message);
      } else {
        console.error("Error creating collection password:", error.message);
      }
      throw error;
    }
  }

  async verifyPassword(collectionId, password) {
    try {
      const passwordRecord = await this.getPasswordByCollectionId(collectionId);
      
      if (!passwordRecord) {
        throw new Error("No password set for this collection");
      }

      const expectedHash = this.simpleHash(password + passwordRecord.salt_c);
      return expectedHash === passwordRecord.password_hash_c;
    } catch (error) {
      console.error("Error verifying collection password:", error.message);
      throw error;
    }
  }

  // Simple hash function for demo purposes - use proper hashing in production
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  async updatePassword(collectionId, newPassword) {
    try {
      const existingRecord = await this.getPasswordByCollectionId(collectionId);
      
      if (!existingRecord) {
        throw new Error("Password record not found");
      }

      const salt = Math.random().toString(36).substring(2, 15);
      const passwordHash = this.simpleHash(newPassword + salt);

      const params = {
        records: [{
          Id: existingRecord.Id,
          password_hash_c: passwordHash,
          salt_c: salt
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating collection password:", error?.response?.data?.message);
      } else {
        console.error("Error updating collection password:", error.message);
      }
      throw error;
    }
  }

  async deletePassword(collectionId) {
    try {
      const existingRecord = await this.getPasswordByCollectionId(collectionId);
      
      if (!existingRecord) {
        return true; // Already deleted or doesn't exist
      }

      const params = {
        RecordIds: [existingRecord.Id]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting collection password:", error?.response?.data?.message);
      } else {
        console.error("Error deleting collection password:", error.message);
      }
      throw error;
    }
  }
}

export const collectionPasswordService = new CollectionPasswordService();