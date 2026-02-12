const { google } = require('googleapis');

/**
 * GoogleSearchService - Integrates with Google Custom Search API
 */
class GoogleSearchService {
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY;
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    this.customsearch = google.customsearch('v1');
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured() {
    return !!(this.apiKey && this.searchEngineId);
  }

  /**
   * Search for products using Google Custom Search API
   * @param {string} query - Search query
   * @param {number} numResults - Number of results to return (max 10 per request)
   * @returns {Promise<Array>} Array of search results
   */
  async search(query, numResults = 10) {
    if (!this.isConfigured()) {
      throw new Error('Google Search API is not configured. Please set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables.');
    }

    try {
      const response = await this.customsearch.cse.list({
        auth: this.apiKey,
        cx: this.searchEngineId,
        q: query,
        num: Math.min(numResults, 10), // API limit is 10 per request
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Google Search API error:', error.message);
      throw error;
    }
  }

  /**
   * Transform Google search results into product candidates
   * @param {Array} searchResults - Raw Google search results
   * @param {Object} characteristics - Product characteristics for matching
   * @returns {Array} Product candidates
   */
  transformToProductCandidates(searchResults, characteristics) {
    const candidates = [];

    searchResults.forEach((result, index) => {
      // Extract product information from search result
      const title = result.title || '';
      const snippet = result.snippet || '';
      const link = result.link || '';

      // Try to extract product details from title and snippet
      const productInfo = this.extractProductInfo(title, snippet, characteristics);

      // Calculate confidence based on match quality
      const confidence = this.calculateConfidence(productInfo, characteristics, index);

      // Only include results with reasonable confidence
      if (confidence >= 0.3) {
        candidates.push({
          id: `google_${Date.now()}_${index}`,
          name: title,
          manufacturer: productInfo.manufacturer || characteristics.brand_name || 'Unknown',
          model: productInfo.model || characteristics.model_number || 'Unknown',
          sku: productInfo.sku || 'N/A',
          color: productInfo.color || characteristics.color || 'N/A',
          category: characteristics.category || 'Product',
          confidence: confidence,
          matchedCharacteristics: this.getMatchedCharacteristics(productInfo, characteristics),
          source: 'google-search',
          url: link,
          imageUrl: result.pagemap?.cse_image?.[0]?.src || result.pagemap?.cse_thumbnail?.[0]?.src || null,
          price: this.extractPrice(snippet) || 'N/A',
          description: snippet,
        });
      }
    });

    return candidates;
  }

  /**
   * Extract product information from title and snippet
   */
  extractProductInfo(title, snippet, characteristics) {
    const info = {
      manufacturer: null,
      model: null,
      sku: null,
      color: null,
    };

    const text = `${title} ${snippet}`.toLowerCase();

    // Try to find brand name
    if (characteristics.brand_name) {
      const brandPattern = new RegExp(characteristics.brand_name.toLowerCase(), 'i');
      if (brandPattern.test(text)) {
        info.manufacturer = characteristics.brand_name;
      }
    }

    // Try to find model number
    if (characteristics.model_number) {
      const modelPattern = new RegExp(characteristics.model_number.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      if (modelPattern.test(text)) {
        info.model = characteristics.model_number;
      }
    }

    // Try to find SKU (pattern: SKU followed by alphanumeric)
    const skuMatch = text.match(/sku[:\s-]*([a-z0-9-]+)/i);
    if (skuMatch) {
      info.sku = skuMatch[1].toUpperCase();
    }

    // Try to find color
    if (characteristics.color) {
      const colorPattern = new RegExp(characteristics.color.toLowerCase(), 'i');
      if (colorPattern.test(text)) {
        info.color = characteristics.color;
      }
    }

    return info;
  }

  /**
   * Calculate confidence score for a product match
   */
  calculateConfidence(productInfo, characteristics, resultIndex) {
    let score = 0;
    let maxScore = 0;

    // Position in results matters (earlier = higher confidence)
    const positionBonus = Math.max(0, 0.3 - resultIndex * 0.03);
    score += positionBonus;

    // Check manufacturer match
    maxScore += 0.25;
    if (productInfo.manufacturer && characteristics.brand_name) {
      if (productInfo.manufacturer.toLowerCase() === characteristics.brand_name.toLowerCase()) {
        score += 0.25;
      }
    }

    // Check model match
    maxScore += 0.25;
    if (productInfo.model && characteristics.model_number) {
      if (productInfo.model.toLowerCase() === characteristics.model_number.toLowerCase()) {
        score += 0.25;
      }
    }

    // Check color match
    maxScore += 0.1;
    if (productInfo.color && characteristics.color) {
      if (productInfo.color.toLowerCase() === characteristics.color.toLowerCase()) {
        score += 0.1;
      }
    }

    // Check SKU match
    maxScore += 0.1;
    if (productInfo.sku) {
      score += 0.1;
    }

    // Normalize score (0-1 range)
    const normalizedScore = maxScore > 0 ? Math.min(1.0, score / maxScore) : positionBonus;

    return Math.round(normalizedScore * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get list of matched characteristics
   */
  getMatchedCharacteristics(productInfo, characteristics) {
    const matched = [];

    if (characteristics.description) matched.push('description');
    if (characteristics.category) matched.push('category');
    if (productInfo.manufacturer && characteristics.brand_name) matched.push('brand_name');
    if (productInfo.model && characteristics.model_number) matched.push('model_number');
    if (productInfo.color && characteristics.color) matched.push('color');
    if (productInfo.sku) matched.push('sku');

    return matched;
  }

  /**
   * Extract price from text
   */
  extractPrice(text) {
    // Match common price patterns: $99.99, $99, USD 99.99, etc.
    const priceMatch = text.match(/\$?\s*(\d{1,5}(?:[.,]\d{2})?)\s*(?:USD|dollars?)?/i);
    if (priceMatch) {
      return `$${priceMatch[1]}`;
    }
    return null;
  }
}

module.exports = GoogleSearchService;
