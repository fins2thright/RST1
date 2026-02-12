# Interactive UAT Guide - Real Google Search Integration

**Purpose:** Conduct a real User Acceptance Test with actual Google Custom Search API integration, where the user provides all inputs.

---

## Prerequisites Setup

Before we begin the UAT, you need to configure the Google Custom Search API with real credentials.

### Step 1: Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Custom Search API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Custom Search API"
   - Click "Enable"
4. Create API credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - **Copy this API key** - you'll need it!

### Step 2: Create Custom Search Engine

1. Go to [Google Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click "Add" or "New search engine"
3. Configure:
   - **Sites to search**: Select "Search the entire web"
   - **Name**: "Product Search UAT" (or any name)
4. After creation:
   - Click on your search engine
   - Go to "Setup" > "Basics"
   - **Copy the Search engine ID** (starts with letters/numbers)

### Step 3: Configure Environment

Create a `.env` file in the `/home/runner/work/RST1/RST1/server/` directory with:

```bash
GOOGLE_API_KEY=your_actual_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_actual_search_engine_id_here
```

**Replace the values with your actual credentials!**

---

## UAT Test Execution

Once the API is configured, we'll conduct the following test:

### Test Scenario: Real Product Identification

**Product to Test:** Choose a real product you want to identify (e.g., a device, gadget, or item you have nearby)

### UAT Steps:

1. **Start Servers**
   - Backend server will load your API credentials
   - Frontend will connect to the backend
   - System will use REAL Google Search

2. **Navigate to Product Identifier**
   - Open http://localhost:5173
   - Click "Product Identifier"

3. **Enter Product Information**
   - **YOU provide**: Describe a real product you want to search for
   - Include details like brand, model, color, features

4. **Answer Questions**
   - System will ask clarifying questions
   - **YOU answer** based on the actual product

5. **View Real Search Results**
   - System will query Google Custom Search API
   - **Real results** from Google will be displayed
   - Results will include:
     - Real product URLs
     - Real prices (if found)
     - Real product images
     - Links to actual websites

6. **Validate Results**
   - Check if results match your product
   - Verify confidence scores make sense
   - Test "View Product" links (real URLs)

---

## Expected Outcomes

### With Real Google API:
- ✅ Search results from actual websites (Amazon, eBay, manufacturer sites, etc.)
- ✅ Real product images
- ✅ Actual prices
- ✅ Working product URLs
- ✅ Source tag shows "google-search" instead of "search-engine"
- ✅ Server logs show: "Using Google Search API"

### Success Criteria:
1. At least 3-5 real product results returned
2. Results match the product description you provided
3. Product URLs are clickable and go to real product pages
4. Confidence scores reflect actual match quality
5. Images (if available) show the correct product type

---

## Troubleshooting

### If you see "Google Search API not configured":
- Check that `.env` file exists in `/server/` directory
- Verify API key and Search Engine ID are correct
- Restart the server after adding credentials

### If API returns errors:
- Check API quota (100 free queries/day)
- Verify Custom Search Engine is set to "Search the entire web"
- Ensure API is enabled in Google Cloud Console

### If no results found:
- Try more specific product descriptions
- Include brand names and model numbers
- Check that search terms are in English

---

## Ready to Start?

Once you have:
1. ✅ Created Google API key
2. ✅ Created Custom Search Engine
3. ✅ Added credentials to `.env` file

Let me know and I'll:
1. Start the servers with your real API configuration
2. Open the application
3. Guide you through the UAT as you provide the inputs

**Your Next Step:** Provide your Google API credentials, and tell me what product you'd like to search for in the UAT!
