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
      // First, get the original question text
      const questionResponse = await this.apperClient.getRecordById('question_c', parseInt(questionId), {
        fields: [{ field: { Name: "text_c" } }]
      });
      
      if (!questionResponse.success) {
        throw new Error("Could not retrieve question details");
      }
      
      const questionText = questionResponse.data.text_c;
      
      // Search for relevant sources in the database
      const relevantSources = await this.searchSources(questionText);
      
      // Generate answer content based on found sources
      const answerContent = this.generateAnswerFromSources(relevantSources, format, questionText);
      
      // Create citations from the relevant sources and store them in citation_c table
      const citationObjects = relevantSources.slice(0, Math.min(5, relevantSources.length)).map((source, index) => ({
        source_id_c: source.Id,
        snippet_c: this.extractSnippet(source, questionText),
        location_c: `Page 1`, // Default location
        relevance_score_c: source.relevanceScore,
        source_title_c: source.title_c || source.Name,
        source_collection_c: source.collection_c || "Default Collection",
        source_content_type_c: source.content_type_c || "document"
      }));
      
      // Create citation records in the database
      const { citationsService } = await import('./citationsService.js');
      const createdCitations = await citationsService.createBulk(citationObjects);
      
      // Calculate confidence based on source relevance and quantity
      const confidence = this.calculateConfidence(relevantSources, questionText);
      
      // Store only citation IDs as comma-separated string to respect 255 char limit
      const citationIds = createdCitations.map(c => c.Id).join(',');
      
      const params = {
        records: [{
          question_id_c: parseInt(questionId),
          content_c: answerContent,
          citations_c: citationIds,
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
        
        // Return answer with full citation objects for UI compatibility
        return {
          ...newAnswer,
          citations: createdCitations
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

  async searchSources(questionText) {
    try {
      // Extract key terms from the question
      const searchTerms = this.extractSearchTerms(questionText);
      
      // Search sources using multiple approaches
      const whereGroups = [{
        operator: "OR",
        subGroups: searchTerms.map(term => ({
          conditions: [
            {
              fieldName: "title_c",
              operator: "Contains",
              values: [term]
            }
          ],
          operator: "OR"
        })).concat(searchTerms.map(term => ({
          conditions: [
            {
              fieldName: "content_c",
              operator: "Contains", 
              values: [term]
            }
          ],
          operator: "OR"
        })))
      }];

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "content_c" } },
          { field: { Name: "content_type_c" } },
          { field: { Name: "collection_c" } },
          { field: { Name: "uploaded_at_c" } }
        ],
        whereGroups: whereGroups,
        orderBy: [{ fieldName: "Id", sorttype: "DESC" }],
        pagingInfo: { limit: 20, offset: 0 }
      };

      const response = await this.apperClient.fetchRecords('source_c', params);
      
      if (!response.success) {
        console.error("Search sources error:", response.message);
        return [];
      }

      // Calculate relevance scores and sort by relevance
      const sourcesWithRelevance = (response.data || []).map(source => ({
        ...source,
        relevanceScore: this.calculateRelevanceScore(source, questionText, searchTerms)
      })).filter(source => source.relevanceScore > 0.1)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      return sourcesWithRelevance;
    } catch (error) {
      console.error("Error searching sources:", error.message);
      return [];
    }
  }

  extractSearchTerms(questionText) {
    // Simple term extraction - remove common words and extract meaningful terms
    const stopWords = ['what', 'how', 'when', 'where', 'why', 'who', 'is', 'are', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'can', 'should', 'would', 'could'];
    
    return questionText.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10); // Limit to top 10 terms
  }

  calculateRelevanceScore(source, questionText, searchTerms) {
    let score = 0;
    const titleText = (source.title_c || '').toLowerCase();
    const contentText = (source.content_c || '').toLowerCase();
    const questionLower = questionText.toLowerCase();

    // Exact question match gets highest score
    if (titleText.includes(questionLower) || contentText.includes(questionLower)) {
      score += 0.8;
    }

    // Term matches
    searchTerms.forEach(term => {
      if (titleText.includes(term)) score += 0.3;
      if (contentText.includes(term)) score += 0.2;
    });

    // Recent content gets slight boost
    const uploadedDate = new Date(source.uploaded_at_c);
    const daysSinceUpload = (new Date() - uploadedDate) / (1000 * 60 * 60 * 24);
    if (daysSinceUpload < 30) score += 0.1;

    return Math.min(score, 1.0); // Cap at 1.0
  }

  generateAnswerFromSources(sources, format, questionText) {
    if (!sources || sources.length === 0) {
      return format === "detailed" ? 
        `<p>I couldn't find specific information in the available sources to answer your question: "${questionText}". You may need to upload more relevant content or rephrase your question.</p>` :
        `No relevant information found in available sources for: "${questionText}"`;
    }

    // Extract relevant content from top sources
    const topSources = sources.slice(0, 3);
    const relevantContent = topSources.map(source => ({
      title: source.title_c || source.Name,
      content: this.extractRelevantContent(source, questionText),
      type: source.content_type_c
    }));

    if (format === "summary") {
      const points = relevantContent
        .map(content => `• ${content.content.substring(0, 150)}...`)
        .join('\n');
      
      return `Based on your available sources:\n\n${points}\n\n<strong>Sources:</strong> ${relevantContent.map(c => c.title).join(', ')}`;
    } else {
      // Detailed format
      let answer = `<h3>Answer based on your sources</h3>\n<p>Based on the information available in your uploaded content:</p>\n\n`;
      
      relevantContent.forEach((content, index) => {
        answer += `<h4>${index + 1}. ${content.title}</h4>\n`;
        answer += `<p>${content.content}</p>\n\n`;
      });

      answer += `<p><strong>This answer was generated from ${sources.length} relevant source(s) in your knowledge base.</strong></p>`;
      
      return answer;
    }
  }

  extractRelevantContent(source, questionText) {
    const content = source.content_c || '';
    const searchTerms = this.extractSearchTerms(questionText);
    
    // Find the most relevant paragraph/section
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    let bestSentence = sentences[0] || content.substring(0, 200);
    let highestScore = 0;

    sentences.forEach(sentence => {
      let score = 0;
      const sentenceLower = sentence.toLowerCase();
      
      searchTerms.forEach(term => {
        if (sentenceLower.includes(term)) score++;
      });

      if (score > highestScore) {
        highestScore = score;
        bestSentence = sentence;
      }
    });

    return bestSentence.trim().substring(0, 300) + (bestSentence.length > 300 ? '...' : '');
  }

  extractSnippet(source, questionText) {
    return this.extractRelevantContent(source, questionText).substring(0, 200) + '...';
  }

  calculateConfidence(sources, questionText) {
    if (!sources || sources.length === 0) return 0.2;

    const avgRelevance = sources.reduce((sum, source) => sum + source.relevanceScore, 0) / sources.length;
    const sourceCountFactor = Math.min(sources.length / 5, 1); // More sources = higher confidence, capped
    
    return Math.min(0.4 + (avgRelevance * 0.4) + (sourceCountFactor * 0.2), 0.95);
  }

  async update(id, updates) {
    try {
      const updateData = {
        Id: parseInt(id)
      };
      
if (updates.content_c !== undefined) updateData.content_c = updates.content_c;
      if (updates.citations_c !== undefined) {
        // Handle citations as comma-separated IDs string to respect 255 char limit
        updateData.citations_c = Array.isArray(updates.citations_c) 
          ? updates.citations_c.map(c => c.Id || c).join(',')
          : updates.citations_c;
      }
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