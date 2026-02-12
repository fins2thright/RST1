# Migration Script Usage Guide

## migrate_to_retailsearch.py

This Python script automates the migration of the Product Identifier feature from the RST1 repository to a new RetailSearchAgent repository.

## Prerequisites

- Python 3.6+
- Git installed
- Source repository (RST1) with Product Identifier files

## Usage

### Basic Usage

```bash
python migrate_to_retailsearch.py <target_directory>
```

**Example:**
```bash
python migrate_to_retailsearch.py ../RetailSearchAgent
```

This will:
1. Create the target directory if it doesn't exist
2. Copy all Product Identifier files
3. Create necessary directory structure
4. Generate README.md and .gitignore
5. Initialize a git repository
6. Display a migration report

### Advanced Usage

Specify custom source repository:
```bash
python migrate_to_retailsearch.py <target_directory> <source_directory>
```

**Example:**
```bash
python migrate_to_retailsearch.py /path/to/RetailSearchAgent /path/to/RST1
```

## What Gets Migrated

### Backend Files (12 files)
- `server/services/ProductAgentService.js`
- `server/services/GoogleSearchService.js`
- `server/repositories/ProductAgentRepository.js`
- `server/routes/productAgentRoutes.js`
- `server/tests/productAgent.test.js`
- `server/tests/googleSearch.test.js`
- `server/check-google-api.js`
- `server/.env.template`
- `server/app.js`
- `server/index.js`
- `server/package.json`
- `server/db/db.js`

### Frontend Files (17 files)
- `src/ProductIdentifier.jsx`
- `src/ProductIdentifier.css`
- `src/App.jsx`
- `src/Navigation.jsx`
- `src/Navigation.css`
- `src/App.css`
- `src/main.jsx`
- Plus supporting components (HumanResourcesList, SkillsList, etc.)

### Configuration Files (4 files)
- `index.html`
- `package.json`
- `.prettierrc`
- `.eslintrc.json`

### Documentation Files (5 files)
- `GOOGLE_SEARCH_SETUP.md`
- `INTERACTIVE_UAT_GUIDE.md`
- `UAT_TEST_REPORT.md`
- `MIGRATION_GUIDE.md`
- `.env.example`

### Generated Files
- `README.md` - New README for RetailSearchAgent
- `.gitignore` - Proper exclusions for the new repo

## After Migration

### Step 1: Navigate to Target Directory
```bash
cd /path/to/RetailSearchAgent
```

### Step 2: Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ..  # Back to root
npm install
```

### Step 3: Configure Google API

1. Copy the environment template:
   ```bash
   cp server/.env.template server/.env
   ```

2. Edit `server/.env` and add your credentials:
   ```bash
   GOOGLE_API_KEY=your_api_key_here
   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
   ```

### Step 4: Verify Setup

```bash
cd server
npm run check-google-api
```

Expected output: ✅ Google Search API is properly configured!

### Step 5: Run Tests

```bash
cd server
npm test
```

Expected output: 30 tests passing

### Step 6: Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Access the app:**
Open browser to http://localhost:5173

## Troubleshooting

### Script Shows "Files Skipped"
- Check that you're running the script from the correct source directory
- Verify that the Product Identifier files exist in the source repo

### Git Initialization Fails
- Ensure git is installed: `git --version`
- The script will still copy files even if git initialization fails

### Dependencies Not Found
- Run `npm install` in both the root and `server` directories
- Check that Node.js is installed: `node --version`

### API Configuration Issues
- Use `npm run check-google-api` to validate credentials
- See `GOOGLE_SEARCH_SETUP.md` for detailed setup instructions

## Migration Report

The script generates a comprehensive report showing:
- Number of files copied
- Number of files skipped
- Source and target paths
- Next steps to complete setup

## Example Run

```bash
$ python migrate_to_retailsearch.py ../RetailSearchAgent

======================================================================
     Product Identifier Migration to RetailSearchAgent
======================================================================
✅ Source repository found: /home/user/RST1

📁 Creating directory structure in: /home/user/RetailSearchAgent
   ✅ Created: server/services
   ✅ Created: server/repositories
   ...

📋 Copying files...
  📦 backend_services:
   ✅ Copied: server/services/ProductAgentService.js
   ✅ Copied: server/services/GoogleSearchService.js
   ...

✅ Created README.md
✅ Created .gitignore
✅ Initialized git repository
✅ Created initial commit

======================================================================
                    MIGRATION REPORT
======================================================================

Files Copied:  38
Files Skipped: 0
Status: ✅ SUCCESS

======================================================================
```

## Additional Resources

- **MIGRATION_GUIDE.md** - Detailed migration documentation
- **GOOGLE_SEARCH_SETUP.md** - Google API setup guide
- **INTERACTIVE_UAT_GUIDE.md** - User acceptance testing guide

## Support

For issues or questions:
1. Check the migration guide: `MIGRATION_GUIDE.md`
2. Review the setup documentation: `GOOGLE_SEARCH_SETUP.md`
3. Check test results: `UAT_TEST_REPORT.md`
