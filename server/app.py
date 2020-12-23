import os

from flask import Flask, redirect, request, url_for, session
from middleware.auth import Authenticator


# Flask app setup
app = Flask(__name__)

app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)


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
    request_uri = Authenticator.get_google_auth_endpoint_uri(request.base_url)
    return redirect(request_uri)


@app.route('/login/callback')
def login_callback():
    code = request.args.get('code')
    user = Authenticator.login_user(code, request.url, request.base_url)
    if user:
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
