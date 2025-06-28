# Image URL Update Instructions

## Overview

The image handling has been updated to store full URLs in the database instead of relative paths. This change allows images to be accessed directly from the server without needing the frontend to construct the URL.

## Changes Made

1. Backend now stores full URLs (e.g., `http://localhost:5003/uploads/blog/image.webp`) instead of relative paths (e.g., `/uploads/blog/image.webp`)
2. Frontend `formatImageUrl` functions have been simplified to just return the URL as-is
3. A script has been created to update existing image URLs in the database

## Environment Configuration

The server URL is determined by the `SERVER_URL` environment variable. Make sure to set this variable to the appropriate URL for each environment:

- Development: `http://localhost:5003`
- Production: `https://api.vivavistavacations.ca`

## Updating Existing Images

To update all existing image URLs in the database to use full server URLs, run:

```bash
# Make sure your .env file has SERVER_URL set correctly first
node update-image-urls.js
```

This script will:
1. Connect to the MongoDB database
2. Find all documents with image fields
3. Convert relative image URLs to absolute URLs
4. Save the updated documents

## Important Notes

- The script should be run once per environment when deploying this change
- Make sure the SERVER_URL is set correctly before running the script
- After running the script, all new images uploaded will automatically use the full URL format
- The frontend will continue to work with both old and new image URLs during the transition 