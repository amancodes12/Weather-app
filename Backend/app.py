from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("OPENWEATHER_API_KEY")
CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"
ONECALL_URL = "https://api.openweathermap.org/data/3.0/onecall"

@app.route("/weather/city", methods=["GET"])
def weather_by_city():
    city = request.args.get("city")

    if not city:
        return jsonify({"error": "City name is required"}), 400

    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"
    }

    response = requests.get(CURRENT_URL, params=params)
    return jsonify(response.json()), response.status_code


@app.route("/weather/coords", methods=["GET"])
def weather_by_coords():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if not lat or not lon:
        return jsonify({"error": "Latitude and Longitude are required"}), 400

    params = {
        "lat": lat,
        "lon": lon,
        "appid": API_KEY,
        "units": "metric"
    }

    response = requests.get(ONECALL_URL, params=params)
    return jsonify(response.json()), response.status_code


if __name__ == "__main__":
    app.run(debug=True)
