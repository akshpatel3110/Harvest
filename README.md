
Orchard Fruit Prediction App - Full Stack Deployment on Google Cloud

This project is a full-stack fruit size prediction web application. It estimates the average fruit diameter and produces a histogram of expected sizes based on user inputs such as scan date, harvest date, growth rate, and diameter range.

The application includes:
- A React frontend, containerized and deployed to Cloud Run
- A Flask backend, containerized and deployed to Cloud Run
- A PostgreSQL Cloud SQL database for storing fruit measurements
- Secure communication and connection between services via Google Cloud IAM and Cloud SQL connectors

Technologies Used:
- React (Frontend)
- Flask + Gunicorn (Backend)
- PostgreSQL (Cloud SQL)
- Docker
- Google Cloud Run
- Google Cloud SQL
- gcloud CLI

Overall Deployment Architecture:
1. Frontend Dockerized → Deployed to Cloud Run (public URL)
2. Backend Dockerized → Deployed to Cloud Run (public endpoint, handles API logic)
3. PostgreSQL Cloud SQL → Stores fruit dimensions, accessed by backend via secure socket/IPv4 connection
4. Frontend makes RESTful POST requests to backend /predict endpoint

Deployment Steps Summary

1. Dockerize and Push Frontend
- Ensure your Dockerfile is in the root of your frontend build folder
- Build and push Docker image:
  docker build -t gcr.io/PROJECT-ID/orchard-frontend .
  docker push gcr.io/PROJECT-ID/orchard-frontend

- Deploy to Cloud Run:
  gcloud run deploy orchard-frontend \
    --image gcr.io/PROJECT-ID/orchard-frontend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated

2. Dockerize and Push Backend
- Ensure Dockerfile and app.py are set correctly
- Build and push image:
  docker build -t gcr.io/PROJECT-ID/orchard-backend .
  docker push gcr.io/PROJECT-ID/orchard-backend

- Deploy to Cloud Run:
  gcloud run deploy orchard-backend \
    --image gcr.io/PROJECT-ID/orchard-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --add-cloudsql-instances PROJECT-ID:us-central1:fruit-db \
    --set-env-vars DB_USER=postgres,DB_NAME=fruit-db,DB_PASSWORD=your-password,INSTANCE_CONNECTION_NAME=PROJECT-ID:us-central1:fruit-db

3. Setup PostgreSQL Cloud SQL
- Create instance via console
  - Name: fruit-db
  - Region: us-central1
  - Enable Public IP
  - Set a secure password
  - Add your Cloud Run IPs to "Authorized Networks"

- Create the table:
  CREATE TABLE fruits (
      id SERIAL PRIMARY KEY,
      major_mm FLOAT,
      minor_mm FLOAT,
      subminor_mm FLOAT
  );

- Upload your dataset using the Cloud SQL import or psql

Usage
- Visit the frontend Cloud Run URL
- Fill form with:
  - Scan Date
  - Harvest Date
  - Growth Rate (mm/day)
  - Min and Max Diameters
- Click submit to view average predicted diameter and histogram

Notes
- Ensure proper environment variables are passed during deployment
- Cloud SQL must be authorized to connect from your Cloud Run backend
- React app should use backend's Cloud Run endpoint for API calls
