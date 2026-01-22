import axios from "axios";
import * as cheerio from "cheerio";

/**
 * URL Scraper Utility
 * Extracts content from web pages
 */
class URLScraper {
  /**
   * Scrape content from a URL
   * @param {string} url - The URL to scrape
   * @returns {Promise<Object>} - Scraped content with title, text, and metadata
   */
  async scrapeURL(url) {
    try {
      // Validate URL format
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(url)) {
        throw new Error(
          "Invalid URL format. URL must start with http:// or https://",
        );
      }

      console.log(`[Scraper] Fetching URL: ${url}`);

      // Fetch the webpage
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 15000, // 15 seconds timeout
        maxRedirects: 5,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Remove unwanted elements
      $(
        "script, style, nav, footer, header, iframe, noscript, aside, .advertisement, .ads",
      ).remove();

      // Extract title
      let title = $("title").text().trim();
      if (!title) {
        title = $("h1").first().text().trim();
      }
      if (!title) {
        title = $('meta[property="og:title"]').attr("content");
      }
      if (!title) {
        title = "Untitled Document";
      }

      // Extract meta description
      let description = $('meta[name="description"]').attr("content");
      if (!description) {
        description = $('meta[property="og:description"]').attr("content");
      }
      if (!description) {
        description = "";
      }

      // Extract main content
      let mainContent = "";
      const contentSelectors = [
        "article",
        "main",
        '[role="main"]',
        ".post-content",
        ".article-content",
        ".entry-content",
        ".content",
        "#content",
        ".main-content",
        "body",
      ];

      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length && element.text().trim().length > 200) {
          mainContent = element.text();
          break;
        }
      }

      // If no content found, try body
      if (!mainContent || mainContent.length < 100) {
        mainContent = $("body").text();
      }

      // Clean up the text
      const cleanedText = mainContent
        .replace(/\s+/g, " ")
        .replace(/\n+/g, "\n")
        .replace(/\t+/g, " ")
        .trim();

      // Extract other metadata
      const author =
        $('meta[name="author"]').attr("content") ||
        $('meta[property="article:author"]').attr("content") ||
        $('[rel="author"]').text().trim() ||
        "";

      const publishDate =
        $('meta[property="article:published_time"]').attr("content") ||
        $("time").attr("datetime") ||
        "";

      const image =
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content") ||
        "";

      // Get word count
      const words = cleanedText.split(/\s+/).filter((word) => word.length > 0);
      const wordCount = words.length;

      // Estimate reading time (average 200 words per minute)
      const readingTimeMinutes = Math.ceil(wordCount / 200);

      console.log(
        `[Scraper] Successfully scraped: ${title} (${wordCount} words)`,
      );

      return {
        success: true,
        url,
        title,
        description,
        author,
        publishDate,
        image,
        content: cleanedText,
        wordCount,
        readingTime: readingTimeMinutes,
        scrapedAt: new Date(),
      };
    } catch (error) {
      console.error("[Scraper] Error:", error.message);

      if (error.code === "ENOTFOUND") {
        throw new Error("URL not found. Please check the URL and try again.");
      } else if (error.code === "ETIMEDOUT") {
        throw new Error(
          "Request timeout. The website took too long to respond.",
        );
      } else if (error.response?.status === 403) {
        throw new Error("Access forbidden. The website blocked our request.");
      } else if (error.response?.status === 404) {
        throw new Error("Page not found (404).");
      } else {
        throw new Error(`Failed to scrape URL: ${error.message}`);
      }
    }
  }

  /**
   * Truncate content to specified length
   */
  truncateContent(text, maxLength = 5000) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  /**
   * Extract important sentences
   */
  extractImportantSentences(text, count = 5) {
    if (!text) return [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

    const importanceKeywords = [
      "important",
      "key",
      "main",
      "significant",
      "critical",
      "essential",
      "fundamental",
      "primary",
      "major",
      "crucial",
    ];

    const scoredSentences = sentences.map((sentence) => {
      let score = 0;
      const lower = sentence.toLowerCase();

      importanceKeywords.forEach((keyword) => {
        if (lower.includes(keyword)) score += 2;
      });

      if (/\d+/.test(sentence)) score += 1;

      const wordCount = sentence.split(/\s+/).length;
      if (wordCount >= 8 && wordCount <= 25) score += 1;
      if (wordCount < 5) score -= 2;

      return { sentence: sentence.trim(), score };
    });

    return scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map((item) => item.sentence)
      .filter((s) => s.length > 20);
  }
}

export default new URLScraper();
