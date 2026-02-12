const GoogleSearchService = require('./GoogleSearchService');

/**
 * ProductAgentService - Core logic for product identification workflow
 */
class ProductAgentService {
  constructor() {
    this.googleSearch = new GoogleSearchService();
    
    // Define possible questions to ask based on product characteristics
    this.questionTemplates = [
      {
        id: 'category',
        text: 'What category does this product belong to? (e.g., electronics, clothing, tools, furniture)',
        importance: 'high',
      },
      {
        id: 'brand_visible',
        text: 'Is there a visible brand name or logo on the product?',
        importance: 'high',
      },
      {
        id: 'brand_name',
        text: 'What brand name or logo do you see?',
        importance: 'high',
        conditional: (answers) => {
          const brandVisible = answers.find((a) => a.questionId === 'brand_visible');
          return brandVisible && brandVisible.answer.toLowerCase().includes('yes');
        },
      },
      {
        id: 'model_number',
        text: 'Do you see any model numbers, serial numbers, or SKU codes on the product or packaging?',
        importance: 'high',
      },
      {
        id: 'color',
        text: 'What is the primary color of the product?',
        importance: 'medium',
      },
      {
        id: 'size',
        text: 'What is the approximate size or dimensions? (e.g., small, medium, large, or specific measurements)',
        importance: 'medium',
      },
      {
        id: 'material',
        text: 'What material is the product made of? (e.g., plastic, metal, wood, fabric)',
        importance: 'medium',
      },
      {
        id: 'special_features',
        text: 'Are there any distinctive features, patterns, or markings that stand out?',
        importance: 'medium',
      },
    ];
  }

  /**
   * Analyze initial input and generate first question
   */
  analyzeInitialInput(image, description) {
    // Extract basic info from description
    const analysis = {
      hasImage: !!image,
      descriptionLength: description ? description.length : 0,
      keywords: this.extractKeywords(description),
    };

    // Generate initial questions based on analysis
    const questions = this.generateQuestions([], analysis);

    return {
      analysis,
      nextQuestion: questions[0] || null,
      allQuestions: questions,
    };
  }

  /**
   * Extract keywords from description
   */
  extractKeywords(description) {
    if (!description) return [];

    const text = description.toLowerCase();
    const keywords = [];

    // Check for category hints
    const categories = ['electronic', 'clothing', 'tool', 'furniture', 'appliance', 'toy', 'book'];
    categories.forEach((cat) => {
      if (text.includes(cat)) {
        keywords.push(cat);
      }
    });

    // Check for color mentions
    const colors = ['red', 'blue', 'green', 'black', 'white', 'silver', 'gray', 'yellow'];
    colors.forEach((color) => {
      if (text.includes(color)) {
        keywords.push(color);
      }
    });

    // Check for brand mentions (common brands)
    const brands = ['apple', 'samsung', 'sony', 'lg', 'dell', 'hp', 'nike', 'adidas'];
    brands.forEach((brand) => {
      if (text.includes(brand)) {
        keywords.push(brand);
      }
    });

    return keywords;
  }

  /**
   * Generate next questions based on current answers
   */
  generateQuestions(answers, analysis) {
    const questions = [];

    for (const template of this.questionTemplates) {
      // Skip if already answered
      const alreadyAnswered = answers.some((a) => a.questionId === template.id);
      if (alreadyAnswered) continue;

      // Check conditional requirements
      if (template.conditional && !template.conditional(answers)) {
        continue;
      }

      // Check if question is relevant based on keywords
      if (template.id === 'brand_name' && analysis.keywords.some((k) => k.includes('brand'))) {
        questions.unshift(template); // Prioritize
      } else {
        questions.push(template);
      }
    }

    // Sort by importance
    questions.sort((a, b) => {
      const importance = { high: 3, medium: 2, low: 1 };
      return (importance[b.importance] || 0) - (importance[a.importance] || 0);
    });

    return questions;
  }

  /**
   * Determine if enough information has been gathered
   */
  shouldContinueQuestioning(answers) {
    // Continue if we have less than 4 answers or no critical info
    if (answers.length < 4) return true;

    // Check if we have at least category and one identifying feature
    const hasCategory = answers.some((a) => a.questionId === 'category');
    const hasIdentifier = answers.some(
      (a) => a.questionId === 'brand_name' || a.questionId === 'model_number'
    );

    return !(hasCategory && hasIdentifier);
  }

  /**
   * Build search queries from collected information
   */
  buildSearchQueries(description, answers, image) {
    const queries = [];
    const characteristics = { description };

    // Extract characteristics from answers
    answers.forEach((answer) => {
      characteristics[answer.questionId] = answer.answer;
    });

    // Build primary search query
    let primaryQuery = '';
    if (characteristics.brand_name) {
      primaryQuery += characteristics.brand_name + ' ';
    }
    if (characteristics.category) {
      primaryQuery += characteristics.category + ' ';
    }
    if (characteristics.model_number) {
      primaryQuery += characteristics.model_number + ' ';
    }
    if (characteristics.color) {
      primaryQuery += characteristics.color + ' ';
    }

    if (primaryQuery) {
      queries.push({
        type: 'text',
        query: primaryQuery.trim(),
        weight: 1.0,
      });
    }

    // Add description-based query
    if (description) {
      queries.push({
        type: 'text',
        query: description,
        weight: 0.8,
      });
    }

    // Add image-based query indicator
    if (image) {
      queries.push({
        type: 'image',
        query: 'reverse-image-search',
        weight: 0.9,
        image: image,
      });
    }

    return { queries, characteristics };
  }

  /**
   * Search for products using Google Custom Search API
   * Falls back to mock data if API is not configured
   */
  async searchProducts(queries, characteristics) {
    // Try to use Google Search API if configured
    if (this.googleSearch.isConfigured()) {
      try {
        return await this.searchProductsWithGoogle(queries, characteristics);
      } catch (error) {
        console.error('Google Search API failed, falling back to mock data:', error.message);
        // Fall through to mock data
      }
    } else {
      console.log('Google Search API not configured, using mock data');
    }

    // Fallback to mock data
    const mockCandidates = this.generateMockCandidates(characteristics);
    return mockCandidates;
  }

  /**
   * Search products using Google Custom Search API
   */
  async searchProductsWithGoogle(queries, characteristics) {
    const allCandidates = [];

    // Search using text queries
    const textQueries = queries.filter(q => q.type === 'text');
    
    for (const queryObj of textQueries) {
      try {
        const searchResults = await this.googleSearch.search(queryObj.query, 5);
        const candidates = this.googleSearch.transformToProductCandidates(
          searchResults,
          characteristics
        );
        
        // Apply weight to candidates
        candidates.forEach(candidate => {
          candidate.confidence = candidate.confidence * queryObj.weight;
        });
        
        allCandidates.push(...candidates);
      } catch (error) {
        console.error(`Error searching for "${queryObj.query}":`, error.message);
      }
    }

    // Remove duplicates based on URL
    const uniqueCandidates = this.deduplicateCandidates(allCandidates);

    // Sort by confidence
    uniqueCandidates.sort((a, b) => b.confidence - a.confidence);

    // Return top results
    return uniqueCandidates.slice(0, 10);
  }

  /**
   * Remove duplicate candidates based on URL
   */
  deduplicateCandidates(candidates) {
    const seen = new Set();
    return candidates.filter(candidate => {
      if (seen.has(candidate.url)) {
        return false;
      }
      seen.add(candidate.url);
      return true;
    });
  }

  /**
   * Mock search function - simulates product search
   * Used as fallback when Google API is not configured
   */
  generateMockCandidates(characteristics) {
    const candidates = [];

    // Create realistic-looking mock products based on characteristics
    const brand = characteristics.brand_name || 'Generic';
    const category = characteristics.category || 'Product';
    const color = characteristics.color || 'standard';
    const model = characteristics.model_number || 'Unknown Model';

    // Generate 3-5 candidates with varying confidence scores
    const numCandidates = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < numCandidates; i++) {
      const confidence = 0.9 - i * 0.15; // Decreasing confidence
      candidates.push({
        id: `prod_${Date.now()}_${i}`,
        name: `${brand} ${category} - ${model}`,
        manufacturer: brand,
        model: model,
        sku: `SKU${Math.floor(Math.random() * 1000000)}`,
        color: color,
        category: category,
        confidence: confidence,
        matchedCharacteristics: this.calculateMatchedCharacteristics(characteristics, i),
        source: ['search-engine', 'retail-site'][i % 2],
        url: `https://example.com/product/${i}`,
        imageUrl: null, // Would be populated from real search
        price: `$${(Math.random() * 200 + 10).toFixed(2)}`,
      });
    }

    return candidates;
  }

  /**
   * Calculate which characteristics matched for a candidate
   */
  calculateMatchedCharacteristics(characteristics, candidateIndex) {
    const matched = [];
    const allKeys = Object.keys(characteristics);

    // Higher-ranked candidates match more characteristics
    const matchCount = Math.max(allKeys.length - candidateIndex, 3);

    for (let i = 0; i < matchCount && i < allKeys.length; i++) {
      matched.push(allKeys[i]);
    }

    return matched;
  }

  /**
   * Filter and rank candidates based on characteristics match
   */
  filterAndRankCandidates(candidates, characteristics) {
    // Filter out products that don't share majority of characteristics
    const numCharacteristics = Object.keys(characteristics).length;
    const minMatches = Math.ceil(numCharacteristics / 2);

    const filtered = candidates.filter((candidate) => {
      return candidate.matchedCharacteristics.length >= minMatches;
    });

    // Sort by confidence score
    filtered.sort((a, b) => b.confidence - a.confidence);

    return filtered;
  }

  /**
   * Complete analysis and return final results
   */
  async completeAnalysis(session) {
    const { image, description, answers } = session;

    // Build search queries
    const { queries, characteristics } = this.buildSearchQueries(description, answers, image);

    // Search for products
    const rawCandidates = await this.searchProducts(queries, characteristics);

    // Filter and rank
    const candidates = this.filterAndRankCandidates(rawCandidates, characteristics);

    return {
      candidates,
      characteristics,
      queries,
      totalFound: rawCandidates.length,
      totalFiltered: candidates.length,
    };
  }
}

module.exports = ProductAgentService;
