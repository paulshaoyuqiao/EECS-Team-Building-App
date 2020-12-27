import os

from flask import Flask, request
from flask_cors import CORS
from middleware.registration import check_user_registration, verify_registration

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


if __name__ == '__main__':
    app.run(host="127.0.0.1", port="5000")
