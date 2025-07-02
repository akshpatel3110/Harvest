Backend Service README - Cloud Run + Cloud SQL (PostgreSQL) Setup
================================================================

Overview
--------
This backend service is built with Flask and connects to a PostgreSQL database hosted on Google Cloud SQL.
It is containerized using Docker and deployed to Google Cloud Run.

Prerequisites
-------------
- Google Cloud Project with Cloud Run and Cloud SQL Admin APIs enabled.
- A running Cloud SQL PostgreSQL instance.
- Google Cloud SDK (gcloud) installed and authenticated.
- Docker installed for building images.

Step 1: Create & Configure Cloud SQL PostgreSQL Instance
--------------------------------------------------------
1. Go to Google Cloud Console > SQL > Create Instance > Choose PostgreSQL.
2. Set instance ID (e.g., fruit-db), set password for 'postgres' user, select region.
3. Wait for the instance to initialize.
4. Note the Instance Connection Name (format: project-id:region:instance-name).
5. (Optional) Enable Public IP or set up VPC for private connections.
6. Configure Cloud Run access via Cloud SQL Proxy (recommended).

Step 2: Initialize Database
---------------------------
1. Connect to the instance:
   gcloud sql connect fruit-db --user=postgres --region=us-central1
2. Create your database and table(s):
   Example SQL:
     CREATE DATABASE fruit_db;
     \c fruit_db
     CREATE TABLE fruits (
       id SERIAL PRIMARY KEY,
       major_mm FLOAT,
       minor_mm FLOAT,
       subminor_mm FLOAT
     );
3. Insert sample data as needed:
     INSERT INTO fruits (major_mm, minor_mm, subminor_mm) VALUES (75, 70, 72);

Step 3: Set Environment Variables in Cloud Run
----------------------------------------------
- DB_NAME=fruit_db
- DB_USER=postgres
- DB_PASSWORD=your_db_password
- INSTANCE_CONNECTION_NAME=project-id:region:instance-name

Step 4: Build and Push Docker Image
-----------------------------------
Run in backend folder:
  docker build -t gcr.io/<PROJECT-ID>/fruit-backend-service .
  docker push gcr.io/<PROJECT-ID>/fruit-backend-service

Step 5: Deploy to Cloud Run
---------------------------
gcloud run deploy fruit-backend-service \
  --image gcr.io/<PROJECT-ID>/fruit-backend-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances <INSTANCE_CONNECTION_NAME> \
  --set-env-vars DB_NAME=fruit_db,DB_USER=postgres,DB_PASSWORD=<YOUR_DB_PASSWORD>,INSTANCE_CONNECTION_NAME=<INSTANCE_CONNECTION_NAME>

Replace placeholders accordingly.

Step 6: Test Your Deployment
----------------------------
Send POST request to:
  https://<your-cloud-run-url>/predict

Example JSON payload:
{
  "scan_date": "2025-07-01",
  "harvest_date": "2025-07-10",
  "growth_rate": 0.5,
  "min_diameter": 70,
  "max_diameter": 85
}

Additional Notes
----------------
- Ensure Cloud Run service account has 'Cloud SQL Client' IAM role.
- Use environment variables to secure sensitive info.
- For local testing, use Cloud SQL Proxy.

---

Thank you for using this backend service!

