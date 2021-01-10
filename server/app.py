import os

from flask import Flask, request
from flask_cors import CORS
from middleware.registration import check_user_registration, verify_registration
from middleware.form_template_handler import (
    add_new_template,
    fetch_all_templates,
    submit_form_response,
    fetch_template_metadata_by_course,
)

# Flask app setup
app = Flask(__name__)
cors = CORS(app)

app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)

# Enables local testing of insecure transport over http
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'


@app.route('/is_registered')
def is_registered():
    email = request.args.get('email')
    return check_user_registration(email), 200


@app.route('/register')
def register():
    user_info = request.args
    return verify_registration(user_info), 200

@app.route('/new_template', methods=['POST'])
def add_template():
    template_data = request.get_json(force=True)
    return add_new_template(template_data), 200

@app.route('/all_templates')
def get_all_templates():
    return fetch_all_templates(), 200

@app.route('/template_metadata')
def get_templates_by_course():
    course = request.args.get('course')
    return fetch_template_metadata_by_course(course), 200

@app.route('/submit_response', methods=['POST'])
def submit_response():
    response_data = request.get_json(force=True)
    return submit_form_response(response_data), 200

if __name__ == '__main__':
    app.run(host="127.0.0.1", port="5000")
