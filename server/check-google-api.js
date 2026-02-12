#!/usr/bin/env node

/**
 * Google Search API Configuration Checker
 * Tests if Google Custom Search API is properly configured
 */

require('dotenv').config();

const { google } = require('googleapis');

console.log('='.repeat(60));
console.log('Google Search API Configuration Checker');
console.log('='.repeat(60));
console.log();

// Check environment variables
console.log('1. Checking environment variables...');
const apiKey = process.env.GOOGLE_API_KEY;
const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

if (!apiKey || apiKey === 'your_google_api_key_here') {
  console.log('   ❌ GOOGLE_API_KEY is not configured');
  console.log('   Please set your API key in the .env file');
  process.exit(1);
}

if (!searchEngineId || searchEngineId === 'your_search_engine_id_here') {
  console.log('   ❌ GOOGLE_SEARCH_ENGINE_ID is not configured');
  console.log('   Please set your Search Engine ID in the .env file');
  process.exit(1);
}

console.log('   ✅ GOOGLE_API_KEY found (length: ' + apiKey.length + ')');
console.log('   ✅ GOOGLE_SEARCH_ENGINE_ID found: ' + searchEngineId);
console.log();

// Test API connection
console.log('2. Testing Google Custom Search API connection...');

const customsearch = google.customsearch('v1');

async function testSearch() {
  try {
    const response = await customsearch.cse.list({
      auth: apiKey,
      cx: searchEngineId,
      q: 'test product',
      num: 1,
    });

    console.log('   ✅ API connection successful!');
    console.log('   ✅ Found ' + (response.data.items ? response.data.items.length : 0) + ' result(s)');
    
    if (response.data.items && response.data.items.length > 0) {
      console.log('   ✅ Sample result: ' + response.data.items[0].title);
    }
    
    console.log();
    console.log('='.repeat(60));
    console.log('✅ Google Search API is properly configured!');
    console.log('='.repeat(60));
    console.log();
    console.log('The Product Identifier will now use REAL Google Search results.');
    console.log();
    
  } catch (error) {
    console.log('   ❌ API connection failed!');
    console.log();
    console.log('Error details:');
    console.log('   Message: ' + error.message);
    
    if (error.response && error.response.data) {
      console.log('   Status: ' + error.response.status);
      console.log('   Error: ' + JSON.stringify(error.response.data.error, null, 2));
    }
    
    console.log();
    console.log('Common issues:');
    console.log('   - API key is invalid or revoked');
    console.log('   - Custom Search API is not enabled in Google Cloud Console');
    console.log('   - Search Engine ID is incorrect');
    console.log('   - Daily quota exceeded (100 free queries/day)');
    console.log();
    
    process.exit(1);
  }
}

testSearch();
