FrontEnd Deployment on Google Cloud Run

This README explains how to deploy your frontend application to Google Cloud Run using your existing Dockerfile.

---

Prerequisites

- Google Cloud SDK (gcloud) installed and configured
- Google Cloud project selected
- Docker installed (for local image build and push)
- Dockerfile already present in your project root

---

Deployment Steps

1. Build the Docker image

Run the following command from your project directory (where Dockerfile is):

docker build -t gcr.io/[PROJECT-ID]/frontend-app .

Replace [PROJECT-ID] with your Google Cloud project ID.

---

2. Push the image to Google Container Registry

docker push gcr.io/[PROJECT-ID]/frontend-app

---

3. Deploy to Cloud Run

Deploy your container image to Cloud Run with this command:

gcloud run deploy frontend-service \
  --image gcr.io/[PROJECT-ID]/frontend-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080

---

4. Access your frontend app

After deployment completes, Cloud Run will provide a URL such as:

https://frontend-service-xxxxx.a.run.app

Open the URL in your browser to see your live frontend.

---

Updating the Frontend

To update your app:

- Make changes locally
- Rebuild the Docker image
- Push the new image to Container Registry
- Redeploy to Cloud Run with the gcloud run deploy command above

---

Troubleshooting

- Check logs:  
  gcloud run services logs read frontend-service --region us-central1

- Ensure correct project is selected:  
  gcloud config set project [PROJECT-ID]

---

Created by Aksh Minesh Patel  
Date: 2025-07-01
