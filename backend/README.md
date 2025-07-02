Fruit Size Prediction Backend

This is a Flask backend API for predicting fruit sizes based on growth rates and historical fruit data stored in a PostgreSQL database.

---

Features

- Connects to PostgreSQL via IP or Cloud SQL socket.
- Calculates predicted fruit diameter growth over days.
- Returns average predicted diameter and a histogram of size distribution.
- CORS enabled for frontend communication.

---

Requirements

- Python 3.8+
- PostgreSQL instance with a `fruits` table containing columns: `major_mm`, `minor_mm`, `subminor_mm`.
- `pip` for installing Python dependencies.

---

Setup Instructions

1. Clone the repository

git clone <repository-url>
cd <repository-folder>

2. Create a virtual environment and activate it

python3 -m venv venv
source venv/bin/activate    # Linux/macOS
venv\Scripts\activate       # Windows

3. Install dependencies

pip install -r requirements.txt

---

Configuration

The app reads database connection settings from environment variables.

Variable               | Description                                  | Example
-----------------------|----------------------------------------------|--------------------------------------
DB_HOST                | PostgreSQL server IP (optional if using socket) | 34.122.198.27
DB_NAME                | PostgreSQL database name                      | fruit-db
DB_USER                | PostgreSQL username                           | postgres
DB_PASSWORD            | PostgreSQL password                           | yourpassword
INSTANCE_CONNECTION_NAME| Cloud SQL instance connection name for socket (optional) | project:region:instance

If INSTANCE_CONNECTION_NAME is set, the app connects via Cloud SQL socket. Otherwise, it uses DB_HOST.

---

Running Locally

Make sure PostgreSQL is reachable and environment variables are set.

Example on Linux/macOS:

export DB_HOST=34.122.198.27
export DB_NAME=fruit-db
export DB_USER=postgres
export DB_PASSWORD=yourpassword
# Optionally, unset INSTANCE_CONNECTION_NAME if not using Cloud Run socket:
unset INSTANCE_CONNECTION_NAME

python app.py

The API will run on http://localhost:8080.

---

Docker Usage

Build the Docker image:

docker build -t fruit-backend .

Run the container:

docker run -p 8080:8080 \
  -e DB_HOST=34.122.198.27 \
  -e DB_NAME=fruit-db \
  -e DB_USER=postgres \
  -e DB_PASSWORD=yourpassword \
  fruit-backend

---

Deploying to Google Cloud Run

1. Set the required environment variables in Cloud Run:

Name                  | Value
-----------------------|-------------------------------
DB_NAME                | fruit-db
DB_USER                | postgres
DB_PASSWORD            | Your database password
INSTANCE_CONNECTION_NAME| project:region:instance (Cloud SQL instance connection name)

2. Deploy your container with these environment variables configured.

3. Cloud Run will connect to Cloud SQL securely via the Unix socket.

