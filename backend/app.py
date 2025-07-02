from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from datetime import datetime
import os
import logging

app = Flask(__name__)
CORS(app)

# Logging setup
logging.basicConfig(level=logging.INFO)

# Read environment variables
DB_HOST = os.environ.get("DB_HOST")  # Optional if using socket
DB_NAME = os.environ.get("DB_NAME", "fruit-db")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASS = os.environ.get("DB_PASSWORD", "Aksh")
INSTANCE_CONNECTION_NAME = os.environ.get("INSTANCE_CONNECTION_NAME")

# Cloud SQL socket path (if using Cloud Run)
DB_SOCKET_PATH = f"/cloudsql/{INSTANCE_CONNECTION_NAME}" if INSTANCE_CONNECTION_NAME else None

def get_db_connection():
    if DB_SOCKET_PATH:
        logging.info(f"🔌 Connecting using Unix socket: {DB_SOCKET_PATH}")
        return psycopg2.connect(
            user=DB_USER,
            password=DB_PASS,
            dbname=DB_NAME,
            host=DB_SOCKET_PATH,
            connect_timeout=5
        )
    elif DB_HOST:
        logging.info(f"🌐 Connecting using host IP: {DB_HOST}")
        return psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            connect_timeout=5
        )
    else:
        raise Exception("❌ No DB_HOST or INSTANCE_CONNECTION_NAME provided.")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        for field in ['scan_date', 'harvest_date', 'growth_rate', 'min_diameter', 'max_diameter']:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        scan_date = datetime.strptime(data['scan_date'], '%Y-%m-%d')
        harvest_date = datetime.strptime(data['harvest_date'], '%Y-%m-%d')
        growth_rate = float(data['growth_rate'])
        min_diameter = float(data['min_diameter'])
        max_diameter = float(data['max_diameter'])

        days_delta = (harvest_date - scan_date).days
        if days_delta < 0:
            return jsonify({"error": "Harvest date must be after scan date"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT major_mm, minor_mm, subminor_mm FROM fruits
            WHERE ((major_mm + minor_mm + subminor_mm)/3) BETWEEN %s AND %s
        """, (min_diameter, max_diameter))

        fruits = cur.fetchall()
        cur.close()
        conn.close()

        if not fruits:
            return jsonify({
                "message": "No fruits found in diameter range",
                "average_diameter": 0,
                "histogram": []
            })

        predicted_diameters = []
        for major, minor, subminor in fruits:
            original_avg = (major + minor + subminor) / 3
            predicted_avg = original_avg + (growth_rate * days_delta)
            predicted_diameters.append(predicted_avg)

        avg_diameter = sum(predicted_diameters) / len(predicted_diameters)

        # Histogram: 5 mm bin size
        bin_size = 5
        max_d = max(predicted_diameters)
        bins = [0] * (int(max_d // bin_size) + 1)
        for d in predicted_diameters:
            index = min(int(d // bin_size), len(bins) - 1)
            bins[index] += 1

        histogram = [{"bin_start": i * bin_size, "count": count} for i, count in enumerate(bins)]

        return jsonify({
            "average_diameter": round(avg_diameter, 2),
            "histogram": histogram
        })

    except Exception as e:
        logging.error(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
