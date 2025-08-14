#!/bin/bash

# Deploy to Google Cloud Run
# Make sure you have gcloud CLI installed and authenticated

PROJECT_ID="your-project-id"  # Replace with your actual project ID
SERVICE_NAME="nathaneichert-portfolio"
REGION="us-central1"  # Choose your preferred region

echo "Building and deploying to Cloud Run..."

# Build and deploy in one command
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production

echo "Deployment complete!"
echo "Your service URL will be displayed above."