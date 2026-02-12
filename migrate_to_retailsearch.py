#!/usr/bin/env python3
"""
Product Identifier Migration Script
Automates the migration of Product Identifier files from RST1 to RetailSearchAgent repository
"""

import os
import sys
import shutil
import subprocess
import json
from pathlib import Path
from typing import List, Tuple


class MigrationScript:
    """Handles migration of Product Identifier files to RetailSearchAgent repo"""
    
    def __init__(self, source_repo_path: str, target_repo_path: str):
        """
        Initialize migration script
        
        Args:
            source_repo_path: Path to RST1 repository
            target_repo_path: Path to RetailSearchAgent repository (will be created if doesn't exist)
        """
        self.source_repo = Path(source_repo_path).resolve()
        self.target_repo = Path(target_repo_path).resolve()
        
        # Product Identifier specific files to migrate
        self.files_to_migrate = {
            'backend_services': [
                'server/services/ProductAgentService.js',
                'server/services/GoogleSearchService.js',
            ],
            'backend_repositories': [
                'server/repositories/ProductAgentRepository.js',
            ],
            'backend_routes': [
                'server/routes/productAgentRoutes.js',
            ],
            'backend_tests': [
                'server/tests/productAgent.test.js',
                'server/tests/googleSearch.test.js',
            ],
            'backend_config': [
                'server/check-google-api.js',
                'server/.env.template',
                'server/app.js',
                'server/index.js',
                'server/package.json',
                'server/db/db.js',  # Needed for app.js
            ],
            'frontend': [
                'src/ProductIdentifier.jsx',
                'src/ProductIdentifier.css',
                'src/App.jsx',
                'src/Navigation.jsx',
                'src/Navigation.css',
                'src/App.css',
                'src/main.jsx',
            ],
            'frontend_config': [
                'index.html',
                'package.json',
                '.prettierrc',
                '.eslintrc.json',
            ],
            'documentation': [
                'GOOGLE_SEARCH_SETUP.md',
                'INTERACTIVE_UAT_GUIDE.md',
                'UAT_TEST_REPORT.md',
                'MIGRATION_GUIDE.md',
                '.env.example',
            ],
            'other_components': [
                # Other UI components that Product Identifier depends on
                'src/HumanResourcesList.jsx',
                'src/HumanResourcesList.css',
                'src/SkillsList.jsx',
                'src/SkillsList.css',
                'src/CompaniesList.jsx',
                'src/CompaniesList.css',
                'src/ResourceSkillsManager.jsx',
                'src/ResourceSkillsManager.css',
                'src/WorkHistoryManager.jsx',
                'src/WorkHistoryManager.css',
            ],
        }
        
    def validate_source_repo(self) -> bool:
        """Validate that source repository exists and has required files"""
        if not self.source_repo.exists():
            print(f"❌ Source repository not found: {self.source_repo}")
            return False
            
        print(f"✅ Source repository found: {self.source_repo}")
        
        # Check for key files
        key_files = [
            'server/services/ProductAgentService.js',
            'src/ProductIdentifier.jsx',
        ]
        
        missing_files = []
        for file_path in key_files:
            full_path = self.source_repo / file_path
            if not full_path.exists():
                missing_files.append(file_path)
        
        if missing_files:
            print(f"⚠️  Warning: Some key files not found:")
            for f in missing_files:
                print(f"   - {f}")
        
        return True
    
    def create_target_structure(self) -> bool:
        """Create directory structure in target repository"""
        print(f"\n📁 Creating directory structure in: {self.target_repo}")
        
        directories = [
            'server/services',
            'server/repositories',
            'server/routes',
            'server/tests',
            'server/db',
            'src',
        ]
        
        try:
            for dir_path in directories:
                full_path = self.target_repo / dir_path
                full_path.mkdir(parents=True, exist_ok=True)
                print(f"   ✅ Created: {dir_path}")
            return True
        except Exception as e:
            print(f"❌ Error creating directories: {e}")
            return False
    
    def copy_files(self) -> Tuple[int, int]:
        """
        Copy files from source to target repository
        
        Returns:
            Tuple of (files_copied, files_skipped)
        """
        print(f"\n📋 Copying files...")
        files_copied = 0
        files_skipped = 0
        
        for category, files in self.files_to_migrate.items():
            print(f"\n  📦 {category}:")
            for file_path in files:
                source_file = self.source_repo / file_path
                target_file = self.target_repo / file_path
                
                if not source_file.exists():
                    print(f"   ⚠️  Skipped (not found): {file_path}")
                    files_skipped += 1
                    continue
                
                try:
                    # Ensure target directory exists
                    target_file.parent.mkdir(parents=True, exist_ok=True)
                    
                    # Copy file
                    shutil.copy2(source_file, target_file)
                    print(f"   ✅ Copied: {file_path}")
                    files_copied += 1
                except Exception as e:
                    print(f"   ❌ Error copying {file_path}: {e}")
                    files_skipped += 1
        
        return files_copied, files_skipped
    
    def create_readme(self) -> bool:
        """Create README.md for RetailSearchAgent repository"""
        readme_content = """# RetailSearchAgent

An agentic workflow for analyzing product descriptions and photos to identify retail products.

## Features

- **Interactive Q&A Workflow**: Asks clarifying questions one at a time to narrow down product search
- **Google Custom Search Integration**: Uses Google Custom Search API for real product searches
- **Intelligent Ranking**: Returns weighted list of candidate products with confidence scores
- **Image Analysis**: Supports product photo uploads (base64 encoded)
- **Fallback Mode**: Gracefully falls back to mock data when API is unavailable

## Setup

### Prerequisites

- Node.js (v18+)
- npm
- Google Custom Search API credentials

### Installation

1. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Configure Google API**
   - Get API Key from: https://console.cloud.google.com/apis/credentials
   - Create Custom Search Engine at: https://programmablesearchengine.google.com/
   - Copy `server/.env.template` to `server/.env`
   - Add your credentials to `server/.env`

4. **Verify Setup**
   ```bash
   cd server
   npm run check-google-api
   ```

## Running the Application

### Development Mode

1. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on: http://localhost:4000

2. **Start Frontend Server** (in another terminal)
   ```bash
   npm run dev
   ```
   UI available at: http://localhost:5173

### Access the Application

Open your browser to: http://localhost:5173

Click "Product Identifier" in the navigation menu.

## Usage

1. **Enter Product Description**: Describe the product you want to identify
2. **Upload Photo** (optional): Add a product image for better results
3. **Answer Questions**: System asks clarifying questions about:
   - Category (electronics, clothing, etc.)
   - Brand visibility and name
   - Model numbers or SKU
   - Color, size, material
   - Special features
4. **View Results**: Get ranked product candidates with:
   - Confidence scores (0-100%)
   - Product details (manufacturer, model, SKU, price)
   - Matched characteristics
   - Links to product pages

## Testing

```bash
cd server
npm test
```

Expected: 30 tests passing
- 11 Product Agent API tests
- 14 Google Search Service tests
- 5 supporting tests

## Documentation

- **GOOGLE_SEARCH_SETUP.md** - Detailed API setup instructions
- **INTERACTIVE_UAT_GUIDE.md** - User acceptance testing guide
- **UAT_TEST_REPORT.md** - UAT results and validation
- **MIGRATION_GUIDE.md** - Migration from RST1 repository

## Architecture

```
User Input → ProductAgentService → Google Search API
                ↓                          ↓
        ProductAgentRepository      Real Results
                ↓                          ↓
        Ranked Results ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

### Components

- **ProductAgentService**: Core agentic workflow logic
- **GoogleSearchService**: Google Custom Search API integration
- **ProductAgentRepository**: Session and state management
- **ProductIdentifier UI**: React-based user interface

### API Endpoints

- `POST /product-agent/sessions` - Create identification session
- `POST /product-agent/sessions/:id/answers` - Submit answer
- `GET /product-agent/sessions/:id` - Get session details
- `DELETE /product-agent/sessions/:id` - Delete session

## Configuration

### Environment Variables

Create `server/.env` with:

```bash
GOOGLE_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### Free Tier Limits

- Google Custom Search API: 100 queries/day free
- Additional queries: $5 per 1,000 queries (up to 10k/day)

## License

[Your License Here]

## Contributing

[Contribution Guidelines Here]
"""
        
        try:
            readme_path = self.target_repo / 'README.md'
            readme_path.write_text(readme_content)
            print(f"\n✅ Created README.md")
            return True
        except Exception as e:
            print(f"❌ Error creating README: {e}")
            return False
    
    def create_gitignore(self) -> bool:
        """Create .gitignore for the target repository"""
        gitignore_content = """# Dependencies
node_modules/
package-lock.json
server/package-lock.json

# Environment variables
.env
server/.env

# Build outputs
dist/
build/

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Testing
coverage/

# Temporary files
tmp/
temp/
*.tmp
"""
        
        try:
            gitignore_path = self.target_repo / '.gitignore'
            gitignore_path.write_text(gitignore_content)
            print(f"✅ Created .gitignore")
            return True
        except Exception as e:
            print(f"❌ Error creating .gitignore: {e}")
            return False
    
    def initialize_git(self) -> bool:
        """Initialize git repository in target directory"""
        try:
            if (self.target_repo / '.git').exists():
                print(f"ℹ️  Git repository already initialized")
                return True
            
            subprocess.run(
                ['git', 'init'],
                cwd=self.target_repo,
                check=True,
                capture_output=True
            )
            print(f"✅ Initialized git repository")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Error initializing git: {e}")
            return False
    
    def create_initial_commit(self) -> bool:
        """Create initial commit in target repository"""
        try:
            # Add all files
            subprocess.run(
                ['git', 'add', '.'],
                cwd=self.target_repo,
                check=True,
                capture_output=True
            )
            
            # Create commit
            subprocess.run(
                ['git', 'commit', '-m', 'Initial commit: Migrated Product Identifier from RST1'],
                cwd=self.target_repo,
                check=True,
                capture_output=True
            )
            print(f"✅ Created initial commit")
            return True
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Note: Could not create initial commit (may need to configure git user)")
            return True  # Not critical
    
    def generate_migration_report(self, files_copied: int, files_skipped: int) -> None:
        """Generate and display migration report"""
        report = f"""
{'='*70}
                    MIGRATION REPORT
{'='*70}

Source Repository: {self.source_repo}
Target Repository: {self.target_repo}

Files Copied:  {files_copied}
Files Skipped: {files_skipped}

Status: {'✅ SUCCESS' if files_copied > 0 else '❌ FAILED'}

{'='*70}

Next Steps:
1. Navigate to: {self.target_repo}
2. Install dependencies:
   cd server && npm install
   cd .. && npm install
3. Configure environment:
   cp server/.env.template server/.env
   # Add your Google API credentials
4. Test the setup:
   cd server && npm run check-google-api
5. Run tests:
   cd server && npm test
6. Start the application:
   cd server && npm run dev  # Backend
   npm run dev               # Frontend (in another terminal)

{'='*70}
"""
        print(report)
    
    def run(self) -> bool:
        """Execute the migration process"""
        print("=" * 70)
        print("     Product Identifier Migration to RetailSearchAgent")
        print("=" * 70)
        
        # Validate source
        if not self.validate_source_repo():
            return False
        
        # Create target structure
        if not self.create_target_structure():
            return False
        
        # Copy files
        files_copied, files_skipped = self.copy_files()
        
        # Create additional files
        self.create_readme()
        self.create_gitignore()
        
        # Initialize git
        self.initialize_git()
        self.create_initial_commit()
        
        # Generate report
        self.generate_migration_report(files_copied, files_skipped)
        
        return files_copied > 0


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python migrate_to_retailsearch.py <target_repo_path>")
        print("\nExample:")
        print("  python migrate_to_retailsearch.py /path/to/RetailSearchAgent")
        print("\nOr with custom source:")
        print("  python migrate_to_retailsearch.py <target_repo_path> <source_repo_path>")
        sys.exit(1)
    
    target_path = sys.argv[1]
    source_path = sys.argv[2] if len(sys.argv) > 2 else os.getcwd()
    
    migrator = MigrationScript(source_path, target_path)
    success = migrator.run()
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
