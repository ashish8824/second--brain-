import Groq from "groq-sdk";

/**
 * Groq AI Summary Service
 * FREE and FAST - Uses Llama 3.3 70B model
 */
class GroqSummaryService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Best free model
    this.model = "llama-3.3-70b-versatile";
  }

  /**
   * Generate complete AI summary with Groq
   */
  async generateCompleteSummary(scrapedData) {
    try {
      const { title, content, description, url } = scrapedData;

      console.log("[Groq] Starting AI summary generation...");

      // Prepare content (Groq can handle more text)
      const textToAnalyze =
        content.length > 8000 ? content.substring(0, 8000) : content;

      const prompt = `Analyze this article and provide a comprehensive summary.

**Article Title:** ${title}
**URL:** ${url}

**Content:**
${textToAnalyze}

**Instructions:**
1. Write a detailed summary (4-6 sentences) that captures the main ideas and important details
2. Extract 5-7 key takeaways (important facts, insights, or points)
3. Generate 5-7 relevant tags for categorization

**Respond in this exact JSON format:**
{
  "summary": "Your detailed 4-6 sentence summary here...",
  "keyPoints": [
    "First key point",
    "Second key point",
    "Third key point",
    "Fourth key point",
    "Fifth key point"
  ],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Make sure the summary is informative and gives a clear understanding of what the article is about.`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are an expert at analyzing articles and creating comprehensive, informative summaries. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: this.model,
        temperature: 0.3, // Lower = more focused
        max_tokens: 1500, // Allow longer responses
        response_format: { type: "json_object" },
      });

      const responseText = completion.choices[0].message.content;
      const result = JSON.parse(responseText);

      console.log("[Groq] Summary generated successfully");
      console.log(`[Groq] Summary length: ${result.summary.length} characters`);
      console.log(`[Groq] Key points: ${result.keyPoints.length}`);
      console.log(`[Groq] Tags: ${result.tags.length}`);

      return {
        success: true,
        summary: result.summary,
        keyPoints: result.keyPoints,
        tags: result.tags,
        generatedAt: new Date(),
        model: this.model,
        isFallback: false,
      };
    } catch (error) {
      console.error("[Groq] Error:", error.message);

      // Fallback to basic extraction
      return this.createFallbackSummary(scrapedData);
    }
  }

  /**
   * Fallback summary extraction
   */
  createFallbackSummary(scrapedData) {
    const { title, description, content } = scrapedData;

    console.log("[Groq] Using fallback summary...");

    let summary = description;
    if (!summary || summary.length < 50) {
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      const goodSentences = sentences
        .filter((s) => {
          const words = s.trim().split(/\s+/).length;
          return words >= 10 && words <= 30;
        })
        .slice(0, 4);

      summary = goodSentences.join(" ");
    }

    // Extract key points
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    const keyPoints = sentences
      .filter((s) => {
        const trimmed = s.trim();
        const words = trimmed.split(/\s+/).length;
        return (
          words >= 10 &&
          words <= 30 &&
          !/\[|\]|http|citation|wikipedia/i.test(trimmed)
        );
      })
      .slice(0, 5)
      .map((s) => s.trim());

    // Extract tags
    const tags = this.extractTags(title, content);

    return {
      success: true,
      summary: summary || "Content extracted from article.",
      keyPoints:
        keyPoints.length > 0
          ? keyPoints
          : ["Information extracted from article"],
      tags,
      generatedAt: new Date(),
      model: "fallback",
      isFallback: true,
    };
  }

  /**
   * Extract tags from text
   */
  extractTags(title, content) {
    const text = `${title} ${content}`.toLowerCase();

    const patterns = {
      javascript: /\b(javascript|js|node\.?js|react|vue|angular)\b/,
      python: /\b(python|django|flask)\b/,
      "web development": /\b(web|frontend|backend|fullstack)\b/,
      programming: /\b(programming|coding|development|software)\b/,
      tutorial: /\b(tutorial|guide|learn|how to)\b/,
      ai: /\b(ai|artificial intelligence|machine learning)\b/,
      database: /\b(database|sql|mongodb|postgres)\b/,
      api: /\b(api|rest|graphql)\b/,
      cloud: /\b(cloud|aws|azure|gcp)\b/,
      technology: /\b(technology|tech|digital)\b/,
    };

    const tags = [];
    for (const [tag, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        tags.push(tag);
      }
    }

    return tags.length > 0 ? tags.slice(0, 6) : ["technology"];
  }
}

export default new GroqSummaryService();
