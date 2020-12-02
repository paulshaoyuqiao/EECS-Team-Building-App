import json
import os

from flask import Flask, redirect, request, url_for, session
from oauthlib.oauth2 import WebApplicationClient
import requests

from user import User

# Configuring Google OAuth 2
with open('google_oauth2_info.json') as f:
    oauth2_info = json.load(f)
    GOOGLE_CLIENT_ID = oauth2_info['CLIENT_ID']
    GOOGLE_CLIENT_SECRET = oauth2_info['CLIENT_SECRET']
GOOGLE_DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration'

# Flask app setup
app = Flask(__name__)

app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)

# OAuth 2 client setup
client = WebApplicationClient(GOOGLE_CLIENT_ID)


def get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL).json()


@app.route('/')
def index():
    if session.get('is_logged_in', False):
        return {
                   'is_logged_in': True,
                   'id': session.get('id'),
                   'name': session.get('name'),
                   'email': session.get('email'),
                   'profile_pic': session.get('profile_pic'),
               }, 200
    return {
        'is_logged_in': False
    }


@app.route('/login')
def login():
    google_provider_cfg = get_google_provider_cfg()
    auth_endpoint = google_provider_cfg['authorization_endpoint']
    request_uri = client.prepare_request_uri(
        auth_endpoint,
        redirect_uri=request.base_url + '/callback',
        scope=['openid', 'email', 'profile'],
    )
    return redirect(request_uri)


@app.route('/login/callback')
def login_callback():
    code = request.args.get('code')
    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg['token_endpoint']
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code,
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
    )
    client.parse_request_body_response(json.dumps(token_response.json()))
    userinfo_endpoint = google_provider_cfg['userinfo_endpoint']
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body).json()
    verified = userinfo_response.get('email_verified', False)
    if verified:
        unique_id = userinfo_response['sub']
        users_email = userinfo_response['email']
        picture = userinfo_response['picture']
        users_name = userinfo_response['name']
    else:
        return 'User email not available or not verified by Google.', 400
    user = User(id_=unique_id, name=users_name, email=users_email, profile_pic=picture)
    users_metadata = user.to_dict()
    users_metadata['is_logged_in'] = True
    session.update(users_metadata)
    return redirect(url_for('index'))


@app.route('/logout')
def logout():
    session.clear()
    session['is_logged_in'] = False
    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(ssl_context='adhoc')
