# Quick Start: Migrating to RetailSearchAgent

This guide shows you how to quickly migrate the Product Identifier feature to a standalone RetailSearchAgent repository.

## Method 1: Using the Python Script (Recommended)

### Step 1: Run the Migration Script

```bash
# From the RST1 repository directory
python migrate_to_retailsearch.py /path/to/RetailSearchAgent
```

**Example:**
```bash
# Create RetailSearchAgent in parent directory
python migrate_to_retailsearch.py ../RetailSearchAgent

# Or create it somewhere else
python migrate_to_retailsearch.py ~/projects/RetailSearchAgent
```

### Step 2: Navigate to New Repository

```bash
cd /path/to/RetailSearchAgent
```

### Step 3: Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ..
npm install
```

### Step 4: Configure Google API

```bash
# Copy environment template
cp server/.env.template server/.env

# Edit server/.env and add your credentials:
# GOOGLE_API_KEY=AIzaSyBjvzA952QeGsADqrkuoWziwbbVOo8kalo
# GOOGLE_SEARCH_ENGINE_ID=f086af4a9138c4901
```

### Step 5: Verify Setup

```bash
cd server
npm run check-google-api
```

**Expected output:**
```
✅ Google Search API is properly configured!
```

### Step 6: Run Tests

```bash
npm test
```

**Expected output:**
```
Test Suites: 3 passed, 3 total
Tests:       30 passed, 30 total
```

### Step 7: Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
# From repository root
npm run dev
```

**Access the application:**
Open your browser to: http://localhost:5173

Click "Product Identifier" in the navigation menu.

---

## Method 2: Manual Migration

If you prefer to manually copy files, follow the detailed steps in [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md).

---

## What You Get

After migration, your RetailSearchAgent repository will have:

### Complete Application
- ✅ Backend API server (Node.js/Express)
- ✅ Frontend UI (React/Vite)
- ✅ Google Search API integration
- ✅ 30 passing tests
- ✅ Complete documentation

### Key Features
- ✅ Interactive Q&A workflow
- ✅ Product photo upload
- ✅ Real-time Google Search results
- ✅ Intelligent ranking and confidence scores
- ✅ Graceful fallback to mock data

### File Structure
```
RetailSearchAgent/
├── server/
│   ├── services/
│   │   ├── ProductAgentService.js
│   │   └── GoogleSearchService.js
│   ├── repositories/
│   │   └── ProductAgentRepository.js
│   ├── routes/
│   │   └── productAgentRoutes.js
│   ├── tests/
│   │   ├── productAgent.test.js
│   │   └── googleSearch.test.js
│   ├── check-google-api.js
│   ├── .env.template
│   └── package.json
├── src/
│   ├── ProductIdentifier.jsx
│   ├── ProductIdentifier.css
│   ├── App.jsx
│   └── Navigation.jsx
├── README.md
├── GOOGLE_SEARCH_SETUP.md
└── package.json
```

---

## Troubleshooting

### Python Script Issues

**Script not found:**
```bash
# Make sure you're in the RST1 directory
cd /path/to/RST1
python migrate_to_retailsearch.py ../RetailSearchAgent
```

**Permission denied:**
```bash
chmod +x migrate_to_retailsearch.py
python migrate_to_retailsearch.py ../RetailSearchAgent
```

### Installation Issues

**npm install fails:**
```bash
# Check Node.js version (needs 18+)
node --version

# Try with legacy peer deps if needed
npm install --legacy-peer-deps
```

**Module not found errors:**
```bash
# Make sure you installed in both locations:
cd server && npm install
cd .. && npm install
```

### API Configuration Issues

**API check fails:**
```bash
# Verify credentials are in server/.env
cat server/.env

# Should show:
# GOOGLE_API_KEY=your_key_here
# GOOGLE_SEARCH_ENGINE_ID=your_id_here
```

**Wrong credentials:**
- Get API key: https://console.cloud.google.com/apis/credentials
- Get Search Engine ID: https://programmablesearchengine.google.com/

### Runtime Issues

**Port already in use:**
```bash
# Backend (port 4000)
lsof -ti:4000 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

**Database connection errors:**
- Product Identifier doesn't use SQL Server
- These errors are safe to ignore
- Only affects unused HR features

---

## Next Steps

1. **Customize the README**: Update `README.md` with your project details
2. **Set up CI/CD**: Add GitHub Actions or your preferred CI
3. **Deploy**: Deploy to your hosting platform
4. **Iterate**: Add new features and improvements

---

## Getting Help

- **Migration Guide**: [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **API Setup**: [GOOGLE_SEARCH_SETUP.md](GOOGLE_SEARCH_SETUP.md)
- **UAT Guide**: [INTERACTIVE_UAT_GUIDE.md](INTERACTIVE_UAT_GUIDE.md)
- **Script Usage**: [MIGRATION_SCRIPT_USAGE.md](MIGRATION_SCRIPT_USAGE.md)

---

## Success!

You now have a standalone RetailSearchAgent repository with all the Product Identifier functionality. The system is ready to identify products through an intelligent Q&A workflow powered by Google Search API.

**Test it out:**
1. Start the servers
2. Navigate to http://localhost:5173
3. Click "Product Identifier"
4. Enter a product description
5. Answer the questions
6. See real search results!
