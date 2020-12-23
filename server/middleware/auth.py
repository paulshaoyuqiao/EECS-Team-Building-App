import os
import json
import requests
from user import User
from oauthlib.oauth2 import WebApplicationClient

GOOGLE_DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration'
GOOGLE_CREDENTIALS = os.path.join(os.path.dirname(__file__), 'google_oauth2_info.json')


def get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL).json()


class Authenticator(object):
    """
    Main class for handling authenticating users to the application
    and cross-checking their registration information.
    """
    with open(GOOGLE_CREDENTIALS) as f:
        oauth2_info = json.load(f)
        client_id = oauth2_info['CLIENT_ID']
        client_secret = oauth2_info['CLIENT_SECRET']
    client = WebApplicationClient(client_id)

    @staticmethod
    def get_google_auth_endpoint_uri(base_url):
        """
        Retrieves the Google Authentication Endpoint uri where users
        provide their google emails/usernames and passwords for logging in.
        :param base_url: the current base url for the server.
        :return: the endpoint uri.
        """
        google_provider_cfg = get_google_provider_cfg()
        auth_endpoint = google_provider_cfg['authorization_endpoint']
        request_uri = Authenticator.client.prepare_request_uri(
            auth_endpoint,
            redirect_uri=base_url + '/callback',
            scope=['openid', 'email', 'profile'],
        )
        return request_uri

    @staticmethod
    def login_user(code, curr_url, base_url):
        """
        Attempts to login the user. If successful, a user object is returned
        containing their unique id, email address, first name, last name, and
        profile picture. Otherwise, None is returned.
        :param code: the authentication token code.
        :param curr_url: the url to request authentication.
        :param base_url: the base url of the web service.
        :return: an object containing basic metadata about the user (if they exist).
        """
        google_provider_cfg = get_google_provider_cfg()
        token_endpoint = google_provider_cfg['token_endpoint']
        token_url, headers, body = Authenticator.client.prepare_token_request(
            token_endpoint,
            authorization_response=curr_url,
            redirect_url=base_url,
            code=code,
        )
        token_response = requests.post(
            token_url,
            headers=headers,
            data=body,
            auth=(Authenticator.client_id, Authenticator.client_secret)
        )
        Authenticator.client.parse_request_body_response(json.dumps(token_response.json()))
        userinfo_endpoint = google_provider_cfg['userinfo_endpoint']
        uri, headers, body = Authenticator.client.add_token(userinfo_endpoint)
        userinfo_response = requests.get(uri, headers=headers, data=body).json()
        verified = userinfo_response.get('email_verified', False)
        if verified:
            return User(
                id_=userinfo_response['sub'],
                email=userinfo_response['email'],
                profile_pic=userinfo_response['picture'],
                name=userinfo_response['name'],
            )
