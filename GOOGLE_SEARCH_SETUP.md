# Google Custom Search API Setup

The Product Identifier uses Google Custom Search API to find and identify products based on user input.

## Features

- Real-time product search using Google's search engine
- Automatic fallback to mock data if API is not configured
- Intelligent result parsing and confidence scoring
- Support for brand, model, color, and other product attributes

## Setup Instructions

### 1. Get a Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Custom Search API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Custom Search API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### 2. Create a Custom Search Engine

1. Go to [Google Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click "Add" to create a new search engine
3. Configure your search engine:
   - **Sites to search**: Select "Search the entire web"
   - **Name**: Give it a descriptive name (e.g., "Product Search")
4. After creation, click on "Control Panel" for your search engine
5. Go to "Setup" > "Basic" tab
6. Copy your **Search engine ID** (also called "cx")

### 3. Configure Environment Variables

Create a `.env` file in the server directory (or update existing):

```bash
# Google Custom Search API Configuration
GOOGLE_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

Replace `your_api_key_here` and `your_search_engine_id_here` with your actual credentials.

### 4. Restart the Server

```bash
cd server
npm run dev
```

## Free Tier Limits

Google Custom Search API free tier includes:
- **100 queries per day** for free
- Additional queries cost $5 per 1,000 queries (up to 10k queries/day)

The application automatically falls back to mock data if:
- API credentials are not configured
- Daily quota is exceeded
- API request fails

## Testing the Integration

1. Navigate to the Product Identifier page in the application
2. Enter a product description (e.g., "Sony WH-1000XM4 wireless headphones")
3. Answer the questions
4. Check the results - they should come from Google Search if configured correctly

## Troubleshooting

### "Google Search API not configured" message

- Verify your `.env` file has both `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID`
- Restart the server after updating environment variables

### API errors or rate limiting

- Check the server console for error messages
- Verify your API key is valid in Google Cloud Console
- Check your usage quota in Google Cloud Console
- The application will automatically fall back to mock data

### No results found

- Ensure your Custom Search Engine is configured to "Search the entire web"
- Try different search queries
- Check the server logs for error messages

## API Response Format

Product candidates from Google Search include:

```javascript
{
  id: "google_timestamp_index",
  name: "Product Title from Search Result",
  manufacturer: "Extracted Brand Name",
  model: "Extracted Model Number",
  sku: "Extracted SKU or N/A",
  color: "Extracted Color",
  category: "User-provided Category",
  confidence: 0.85,  // 0-1 score based on match quality
  matchedCharacteristics: ["brand_name", "model_number", "color"],
  source: "google-search",
  url: "https://link-to-product.com",
  imageUrl: "https://product-image-url.com/image.jpg",
  price: "$299.99",
  description: "Product snippet from search"
}
```

## Architecture

- `GoogleSearchService.js` - Handles Google API integration
- `ProductAgentService.js` - Uses GoogleSearchService with fallback to mock data
- Automatic deduplication of results
- Confidence scoring based on:
  - Search result position
  - Brand/manufacturer match
  - Model number match
  - Color match
  - Presence of SKU

## Security Notes

- Never commit your `.env` file with real API keys
- Use environment variables in production
- Monitor your API usage in Google Cloud Console
- Consider implementing additional rate limiting if needed
