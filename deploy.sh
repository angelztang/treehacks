#!/bin/bash

# Build the frontend
cd frontend
npm install
npm run build

# Move the build to the root directory
cd ..
rm -rf dist
mv frontend/build dist

# Create a simple package.json for Heroku
cat > package.json << EOL
{
  "name": "tigerpop-marketplace-frontend",
  "version": "1.0.0",
  "engines": {
    "node": "20.x"
  },
  "dependencies": {
    "express": "^4.18.3"
  },
  "scripts": {
    "start": "node server.js"
  }
}
EOL

# Create Procfile for Node.js
echo "web: npm start" > Procfile

# Commit and push to Heroku
git add .
git commit -m "Switch to Express server for static file serving"
git push -f heroku main 