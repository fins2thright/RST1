const GoogleSearchService = require('../services/GoogleSearchService');

describe('GoogleSearchService', () => {
  let service;

  beforeEach(() => {
    // Clear environment variables for testing
    delete process.env.GOOGLE_API_KEY;
    delete process.env.GOOGLE_SEARCH_ENGINE_ID;
    service = new GoogleSearchService();
  });

  describe('isConfigured', () => {
    it('should return false when API key is not set', () => {
      expect(service.isConfigured()).toBe(false);
    });

    it('should return false when search engine ID is not set', () => {
      process.env.GOOGLE_API_KEY = 'test-key';
      service = new GoogleSearchService();
      expect(service.isConfigured()).toBe(false);
    });

    it('should return true when both are set', () => {
      process.env.GOOGLE_API_KEY = 'test-key';
      process.env.GOOGLE_SEARCH_ENGINE_ID = 'test-id';
      service = new GoogleSearchService();
      expect(service.isConfigured()).toBe(true);
    });
  });

  describe('extractProductInfo', () => {
    it('should extract brand name from text', () => {
      const title = 'Sony WH-1000XM4 Wireless Headphones';
      const snippet = 'Premium noise cancelling headphones';
      const characteristics = { brand_name: 'Sony', model_number: 'WH-1000XM4' };

      const info = service.extractProductInfo(title, snippet, characteristics);

      expect(info.manufacturer).toBe('Sony');
      expect(info.model).toBe('WH-1000XM4');
    });

    it('should extract SKU from text', () => {
      const title = 'Product Title';
      const snippet = 'Available now SKU: ABC-123';
      const characteristics = {};

      const info = service.extractProductInfo(title, snippet, characteristics);

      expect(info.sku).toBe('ABC-123');
    });

    it('should extract color from text', () => {
      const title = 'Black Wireless Headphones';
      const snippet = 'Available in black';
      const characteristics = { color: 'Black' };

      const info = service.extractProductInfo(title, snippet, characteristics);

      expect(info.color).toBe('Black');
    });
  });

  describe('extractPrice', () => {
    it('should extract dollar prices', () => {
      expect(service.extractPrice('Price: $99.99')).toBe('$99.99');
      expect(service.extractPrice('Only $149')).toBe('$149');
      expect(service.extractPrice('Cost is 79.99 USD')).toBe('$79.99');
    });

    it('should return null if no price found', () => {
      expect(service.extractPrice('No price here')).toBe(null);
    });
  });

  describe('calculateConfidence', () => {
    it('should give higher confidence to earlier results', () => {
      const productInfo = {};
      const characteristics = {};
      
      const score0 = service.calculateConfidence(productInfo, characteristics, 0);
      const score5 = service.calculateConfidence(productInfo, characteristics, 5);

      expect(score0).toBeGreaterThan(score5);
    });

    it('should increase confidence for matching manufacturer', () => {
      const productInfo = { manufacturer: 'Sony' };
      const characteristics = { brand_name: 'Sony' };
      
      const scoreWithMatch = service.calculateConfidence(productInfo, characteristics, 0);
      
      const productInfoNoMatch = { manufacturer: 'Other' };
      const scoreNoMatch = service.calculateConfidence(productInfoNoMatch, characteristics, 0);

      expect(scoreWithMatch).toBeGreaterThan(scoreNoMatch);
    });

    it('should increase confidence for matching model', () => {
      const productInfo = { model: 'WH-1000XM4' };
      const characteristics = { model_number: 'WH-1000XM4' };
      
      const scoreWithMatch = service.calculateConfidence(productInfo, characteristics, 0);
      
      const productInfoNoMatch = { model: 'OTHER-MODEL' };
      const scoreNoMatch = service.calculateConfidence(productInfoNoMatch, characteristics, 0);

      expect(scoreWithMatch).toBeGreaterThan(scoreNoMatch);
    });
  });

  describe('transformToProductCandidates', () => {
    it('should transform search results to product candidates', () => {
      const searchResults = [
        {
          title: 'Sony WH-1000XM4 Wireless Headphones - Black',
          snippet: 'Premium noise cancelling headphones. Price: $349.99',
          link: 'https://example.com/product1',
          pagemap: {
            cse_image: [{ src: 'https://example.com/image1.jpg' }]
          }
        }
      ];
      const characteristics = {
        brand_name: 'Sony',
        model_number: 'WH-1000XM4',
        color: 'Black',
        category: 'Electronics'
      };

      const candidates = service.transformToProductCandidates(searchResults, characteristics);

      expect(candidates).toHaveLength(1);
      expect(candidates[0]).toMatchObject({
        name: 'Sony WH-1000XM4 Wireless Headphones - Black',
        manufacturer: 'Sony',
        model: 'WH-1000XM4',
        category: 'Electronics',
        source: 'google-search',
        url: 'https://example.com/product1',
        imageUrl: 'https://example.com/image1.jpg',
        price: '$349.99'
      });
      expect(candidates[0].confidence).toBeGreaterThan(0);
    });

    it('should filter out low confidence results', () => {
      const searchResults = [
        {
          title: 'Unrelated Product',
          snippet: 'This is not related',
          link: 'https://example.com/unrelated'
        }
      ];
      const characteristics = {
        brand_name: 'Sony',
        model_number: 'WH-1000XM4',
        category: 'Electronics'
      };

      const candidates = service.transformToProductCandidates(searchResults, characteristics);

      // Low confidence results should be filtered out
      expect(candidates.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getMatchedCharacteristics', () => {
    it('should return list of matched characteristics', () => {
      const productInfo = {
        manufacturer: 'Sony',
        model: 'WH-1000XM4',
        color: 'Black'
      };
      const characteristics = {
        description: 'Headphones',
        category: 'Electronics',
        brand_name: 'Sony',
        model_number: 'WH-1000XM4',
        color: 'Black'
      };

      const matched = service.getMatchedCharacteristics(productInfo, characteristics);

      expect(matched).toContain('description');
      expect(matched).toContain('category');
      expect(matched).toContain('brand_name');
      expect(matched).toContain('model_number');
      expect(matched).toContain('color');
    });
  });
});
