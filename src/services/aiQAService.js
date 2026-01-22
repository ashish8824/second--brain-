import Groq from "groq-sdk";
import Content from "../models/content.model.js";

/**
 * AI Q&A Service - Chat with your knowledge base
 * Uses Groq for fast, high-quality AI responses
 */
class AIQAService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    this.model = "llama-3.3-70b-versatile";
  }

  /**
   * Answer question based on user's knowledge base
   * @param {string} userId - User ID
   * @param {string} question - User's question
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Answer with sources
   */
  async answerQuestion(userId, question, options = {}) {
    try {
      const { limit = 5, tags = null } = options;

      console.log("[AI Q&A] Processing question:", question);
      console.log("[AI Q&A] User ID:", userId);

      // Step 1: Find relevant content from user's knowledge base
      const relevantContent = await this.findRelevantContent(
        userId,
        question,
        limit,
        tags,
      );

      if (relevantContent.length === 0) {
        return {
          success: true,
          answer:
            "I couldn't find any relevant information in your knowledge base to answer this question. Try adding more content related to this topic!",
          sources: [],
          confidence: 0,
          contentCount: 0,
          timestamp: new Date(),
        };
      }

      console.log(
        `[AI Q&A] Found ${relevantContent.length} relevant content items`,
      );

      // Step 2: Build context from relevant content
      const context = this.buildContext(relevantContent);

      // Step 3: Generate answer using AI
      const answer = await this.generateAnswer(question, context);

      // Step 4: Prepare sources
      const sources = relevantContent.map((content, index) => ({
        id: content._id,
        title: content.title,
        url: content.sourceUrl,
        type: content.type,
        snippet: content.summary || content.body?.substring(0, 200) + "...",
        tags: content.tags,
        relevance: index + 1, // Rank by position
        createdAt: content.createdAt,
      }));

      console.log("[AI Q&A] Answer generated successfully");

      return {
        success: true,
        answer: answer,
        sources: sources,
        confidence: this.calculateConfidence(relevantContent),
        contentCount: relevantContent.length,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("[AI Q&A] Error:", error.message);
      throw new Error(`Failed to answer question: ${error.message}`);
    }
  }

  /**
   * Find relevant content using full-text and semantic search
   * @param {string} userId - User ID
   * @param {string} question - Search query
   * @param {number} limit - Max results
   * @param {Array} tags - Filter by tags
   * @returns {Promise<Array>} - Relevant content
   */
  async findRelevantContent(userId, question, limit = 5, tags = null) {
    const filter = {
      userId,
      isDeleted: false,
    };

    // Add tag filter if provided
    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    // Use full-text search if available
    try {
      // Try text search first
      const textSearchResults = await Content.find({
        ...filter,
        $text: { $search: question },
      })
        .select("title summary keyPoints body sourceUrl type tags createdAt")
        .limit(limit)
        .lean();

      if (textSearchResults.length > 0) {
        console.log(
          `[AI Q&A] Found ${textSearchResults.length} results via text search`,
        );
        return textSearchResults;
      }
    } catch (error) {
      console.log("[AI Q&A] Text search not available, using keyword match");
    }

    // Fallback: Keyword matching
    const keywords = question
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const keywordResults = await Content.find(filter)
      .select("title summary keyPoints body sourceUrl type tags createdAt")
      .limit(limit * 2) // Get more to filter
      .sort({ createdAt: -1 })
      .lean();

    // Score and filter by keyword relevance
    const scoredResults = keywordResults.map((content) => {
      let score = 0;
      const searchText =
        `${content.title} ${content.summary} ${content.body || ""}`.toLowerCase();

      keywords.forEach((keyword) => {
        const count = (searchText.match(new RegExp(keyword, "g")) || []).length;
        score += count;
      });

      return { ...content, score };
    });

    return scoredResults
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Build context string from content array
   * @param {Array} contentArray - Array of content objects
   * @returns {string} - Formatted context
   */
  buildContext(contentArray) {
    let context = "";

    contentArray.forEach((content, index) => {
      context += `\n━━━ Source ${index + 1}: ${content.title} ━━━\n`;
      context += `Type: ${content.type}\n`;

      if (content.sourceUrl) {
        context += `URL: ${content.sourceUrl}\n`;
      }

      if (content.summary) {
        context += `\nSummary:\n${content.summary}\n`;
      }

      if (content.keyPoints && content.keyPoints.length > 0) {
        context += `\nKey Points:\n`;
        content.keyPoints.slice(0, 5).forEach((point, idx) => {
          context += `${idx + 1}. ${point}\n`;
        });
      }

      if (content.body) {
        const bodyPreview = content.body.substring(0, 800);
        context += `\nContent Preview:\n${bodyPreview}${content.body.length > 800 ? "..." : ""}\n`;
      }

      if (content.tags && content.tags.length > 0) {
        context += `\nTags: ${content.tags.join(", ")}\n`;
      }

      context += "\n";
    });

    return context;
  }

  /**
   * Generate AI answer using Groq
   * @param {string} question - User's question
   * @param {string} context - Context from knowledge base
   * @returns {Promise<string>} - AI-generated answer
   */
  async generateAnswer(question, context) {
    const systemPrompt = `You are a helpful AI assistant that answers questions based on the user's personal knowledge base.

**Guidelines:**
1. Answer ONLY based on the provided context from the user's saved content
2. If the information is insufficient or unavailable, clearly state that
3. Cite which sources you're using (e.g., "According to Source 1...")
4. Be specific and provide actionable insights when possible
5. Use markdown formatting for better readability
6. If multiple sources provide conflicting information, mention both perspectives

**Your role is to:**
- Help the user recall and connect information from their knowledge base
- Provide clear, well-structured answers
- Reference specific sources to build trust`;

    const userPrompt = `**Question:** ${question}

**Available Information from Knowledge Base:**
${context}

**Please provide a comprehensive answer based on the information above:**`;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        model: this.model,
        temperature: 0.3, // Lower for more factual responses
        max_tokens: 1500,
        top_p: 0.9,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("[AI Q&A] Groq API error:", error.message);

      // Fallback response
      return `I found relevant information in your knowledge base, but encountered an error generating a detailed response. 

Based on the ${context.split("━━━").length - 1} sources found, here's what I can tell you:

${this.createFallbackAnswer(context)}

Please check the sources below for detailed information.`;
    }
  }

  /**
   * Create fallback answer when AI fails
   * @param {string} context - Context string
   * @returns {string} - Basic answer
   */
  createFallbackAnswer(context) {
    // Extract first few sentences from context
    const sentences = context.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 5).join(" ");
  }

  /**
   * Calculate confidence score based on results
   * @param {Array} contentArray - Relevant content
   * @returns {number} - Confidence (0-1)
   */
  calculateConfidence(contentArray) {
    if (contentArray.length === 0) return 0;
    if (contentArray.length >= 5) return 0.95;
    if (contentArray.length >= 3) return 0.85;
    if (contentArray.length >= 2) return 0.7;
    return 0.5;
  }

  /**
   * Get conversation history (for future multi-turn conversations)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Previous Q&A
   */
  async getConversationHistory(userId) {
    // TODO: Implement conversation history storage
    // For now, return empty array
    return [];
  }
}

export default new AIQAService();
