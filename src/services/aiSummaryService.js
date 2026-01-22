import { HfInference } from "@huggingface/inference";

/**
 * AI Summary Service using Hugging Face
 * Enhanced version with better quality summaries and key points
 */
class AISummaryService {
  constructor() {
    const apiKey = process.env.HUGGINGFACE_API_KEY || null;
    this.hf = apiKey ? new HfInference(apiKey) : new HfInference();

    this.models = {
      summarization: "facebook/bart-large-cnn",
      zeroShot: "facebook/bart-large-mnli",
    };
  }

  /**
   * Generate complete AI summary
   */
  async generateCompleteSummary(scrapedData) {
    try {
      const { title, content, description } = scrapedData;

      console.log("[AI] Starting summary generation...");

      // Prepare content for summarization
      const textToSummarize = this.prepareContentForSummary(content);

      const [summary, keyPoints, tags] = await Promise.all([
        this.generateSummary(textToSummarize, title, description),
        this.extractKeyPoints(content),
        this.generateTags(title, content),
      ]);

      console.log("[AI] Summary generation completed successfully");

      return {
        success: true,
        summary,
        keyPoints,
        tags,
        generatedAt: new Date(),
        model: this.models.summarization,
      };
    } catch (error) {
      console.error("[AI] Error:", error.message);
      return this.createFallbackSummary(scrapedData);
    }
  }

  /**
   * Prepare content for summarization
   */
  prepareContentForSummary(content) {
    const maxLength = 3000;

    if (content.length <= maxLength) {
      return content;
    }

    const intro = content.substring(0, 1000);
    const importantMiddle = this.extractImportantParagraphs(content);

    let combined = intro + " " + importantMiddle;
    return combined.substring(0, maxLength);
  }

  /**
   * Extract paragraphs with important keywords
   */
  extractImportantParagraphs(content) {
    const paragraphs = content.split("\n").filter((p) => p.trim().length > 100);

    const importantKeywords = [
      "important",
      "key",
      "main",
      "enables",
      "allows",
      "designed",
      "created",
      "developed",
      "used for",
      "primary",
      "essential",
      "significant",
      "provides",
    ];

    const scoredParagraphs = paragraphs.map((para) => {
      let score = 0;
      const lower = para.toLowerCase();

      importantKeywords.forEach((keyword) => {
        if (lower.includes(keyword)) score += 1;
      });

      if (/\d+/.test(para)) score += 0.5;

      return { para, score };
    });

    return scoredParagraphs
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.para)
      .join(" ")
      .substring(0, 1500);
  }

  /**
   * ✅ FIXED: Generate summary using BART model
   */
  async generateSummary(content, title, description = "") {
    try {
      console.log("[AI] Generating summary with BART...");

      const result = await this.hf.summarization({
        model: this.models.summarization,
        inputs: content,
        parameters: {
          max_length: 200,
          min_length: 60,
          do_sample: false,
          // ✅ Removed wait_for_model parameter
        },
      });

      const summary = result.summary_text;

      if (summary.length < 50) {
        throw new Error("Summary too short");
      }

      console.log(`[AI] Summary generated: ${summary.substring(0, 80)}...`);
      return summary;
    } catch (error) {
      console.error("[AI] Summarization failed:", error.message);

      // Fallback 1: Use meta description
      if (description && description.length > 50) {
        console.log("[AI] Using meta description as fallback");
        return description;
      }

      // Fallback 2: Extract meaningful sentences
      console.log("[AI] Extracting sentences as fallback");
      const sentences = this.extractMeaningfulSentences(content, 3);

      if (sentences.length > 0) {
        const fallbackSummary = sentences.join(" ");
        return fallbackSummary.length > 300
          ? fallbackSummary.substring(0, 300) + "..."
          : fallbackSummary;
      }

      // Fallback 3: First paragraph
      const paragraphs = content
        .split("\n")
        .filter((p) => p.trim().length > 50);
      if (paragraphs.length > 0) {
        return paragraphs[0].substring(0, 250) + "...";
      }

      return "Summary unavailable. Please visit the original URL for full content.";
    }
  }

  /**
   * Extract key points from content
   */
  async extractKeyPoints(content) {
    try {
      console.log("[AI] Extracting key points...");

      const keyPoints = this.extractMeaningfulSentences(content, 5);

      if (keyPoints.length > 0) {
        console.log(`[AI] Extracted ${keyPoints.length} key points`);
        return keyPoints;
      }

      return ["Main content extracted from article"];
    } catch (error) {
      console.error("[AI] Key points extraction failed:", error.message);
      return ["Content summary available"];
    }
  }

  /**
   * Extract meaningful sentences
   */
  extractMeaningfulSentences(content, count = 5) {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];

    const validSentences = sentences.filter((sentence) => {
      const trimmed = sentence.trim();
      const wordCount = trimmed.split(/\s+/).length;

      if (wordCount < 10 || wordCount > 30) return false;

      const specialCharCount = (trimmed.match(/[\[\]{}()]/g) || []).length;
      if (specialCharCount > 3) return false;

      if (/\[\d+\]|\^|edit\]|\[citation needed\]/i.test(trimmed)) return false;
      if (/\d{4}-\d{2}-\d{2}|\/\s*January\s*\d+/.test(trimmed)) return false;
      if (/https?:\/\//i.test(trimmed)) return false;
      if (/retrieved|accessed|wikipedia|see also|external links/i.test(trimmed))
        return false;

      const uppercaseRatio =
        (trimmed.match(/[A-Z]/g) || []).length / trimmed.length;
      if (uppercaseRatio > 0.3) return false;

      return true;
    });

    const scoredSentences = validSentences.map((sentence, index) => {
      let score = 0;
      const lower = sentence.toLowerCase();

      const definitionKeywords = [
        "is a",
        "is an",
        "are",
        "refers to",
        "means",
        "defined as",
        "known as",
        "called",
      ];
      definitionKeywords.forEach((keyword) => {
        if (lower.includes(keyword)) score += 4;
      });

      const actionKeywords = [
        "allows",
        "enables",
        "provides",
        "supports",
        "helps",
        "makes",
        "creates",
        "designed to",
        "used for",
        "used to",
        "can be used",
      ];
      actionKeywords.forEach((keyword) => {
        if (lower.includes(keyword)) score += 3;
      });

      const importanceKeywords = [
        "important",
        "key",
        "main",
        "primary",
        "essential",
        "significant",
        "critical",
        "major",
        "notable",
      ];
      importanceKeywords.forEach((keyword) => {
        if (lower.includes(keyword)) score += 3;
      });

      if (/\d+/.test(sentence)) score += 2;

      const positionRatio = index / validSentences.length;
      if (positionRatio < 0.2) score += 3;
      else if (positionRatio < 0.4) score += 2;
      else if (positionRatio < 0.6) score += 1;

      if (
        /^[A-Z][a-z]+\s+(is|are|was|were|allows|enables|provides)/i.test(
          sentence,
        )
      ) {
        score += 2;
      }

      return { sentence: sentence.trim(), score };
    });

    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map((item) => item.sentence)
      .filter((s) => s.length > 30 && s.length < 300);

    return topSentences.length > 0
      ? topSentences
      : validSentences.slice(0, count).map((s) => s.trim());
  }

  /**
   * Generate tags using zero-shot classification
   */
  async generateTags(title, content) {
    try {
      console.log("[AI] Generating tags...");

      const text = `${title}. ${content.substring(0, 500)}`;

      const candidateLabels = [
        "programming",
        "web development",
        "mobile development",
        "javascript",
        "python",
        "java",
        "software engineering",
        "artificial intelligence",
        "machine learning",
        "data science",
        "frontend",
        "backend",
        "full-stack",
        "api",
        "database",
        "tutorial",
        "guide",
        "documentation",
        "news",
        "opinion",
        "research",
        "business",
        "technology",
      ];

      const result = await this.hf.zeroShotClassification({
        model: this.models.zeroShot,
        inputs: text,
        parameters: {
          candidate_labels: candidateLabels,
          multi_label: true,
        },
      });

      const tags = result.labels
        .filter((_, index) => result.scores[index] > 0.3)
        .slice(0, 6);

      console.log(`[AI] Generated ${tags.length} tags:`, tags.join(", "));

      return tags.length > 0 ? tags : this.extractKeywordTags(title, content);
    } catch (error) {
      console.error("[AI] Tag generation failed:", error.message);
      return this.extractKeywordTags(title, content);
    }
  }

  /**
   * Extract tags from keywords
   */
  extractKeywordTags(title, content) {
    const text = `${title} ${content}`.toLowerCase();

    const keywordPatterns = {
      javascript: /\b(javascript|js\b|node\.?js|react|vue)\b/i,
      python: /\b(python|django|flask)\b/i,
      "web development": /\b(web|website|html|css|frontend|backend)\b/i,
      api: /\b(api|rest|graphql)\b/i,
      tutorial: /\b(tutorial|guide|learn)\b/i,
      technology: /\b(technology|tech|software)\b/i,
    };

    const tags = [];
    for (const [tag, pattern] of Object.entries(keywordPatterns)) {
      if (pattern.test(text)) {
        tags.push(tag);
      }
    }

    return tags.length > 0 ? tags.slice(0, 6) : ["technology", "article"];
  }

  /**
   * Create fallback summary
   */
  createFallbackSummary(scrapedData) {
    const { title, description, content } = scrapedData;

    console.log("[AI] Creating fallback summary...");

    let summary = description;

    if (!summary || summary.length < 50) {
      const sentences = this.extractMeaningfulSentences(content, 3);
      summary = sentences.join(" ");
    }

    if (summary.length > 400) {
      summary = summary.substring(0, 400) + "...";
    }

    const keyPoints = this.extractMeaningfulSentences(content, 5);
    const tags = this.extractKeywordTags(title, content);

    return {
      success: true,
      summary: summary || "Content summary extracted from article.",
      keyPoints:
        keyPoints.length > 0
          ? keyPoints
          : ["Key information extracted from article"],
      tags,
      generatedAt: new Date(),
      isFallback: true,
      model: "fallback-extraction",
    };
  }
}

export default new AISummaryService();
