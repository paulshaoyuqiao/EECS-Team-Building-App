from database.routes import db

REGISTRATION_KEYS = {
    '162': 'OsIsCool',
    '169': 'SWEIsCool',
    '170': 'AlgoIsCool',
    '188': 'AiIsCool',
    '189': 'MlIsCool',
}


def check_user_registration(email):
    resp = {'is_registered': False}
    if email is None:
        return resp
    user = db.users.find_one({'email': email})
    if user is not None:
        resp['is_registered'] = True
    return resp


def verify_registration(user_info):
    course = user_info.get("course")
    key = user_info.get("key")
    resp = {'error': None}
    if course is None or key is None:
        resp['error'] = 'Course name and key cannot be empty.'
        return resp
    course_number = course.split(' ')[1].strip()
    expected_key = REGISTRATION_KEYS.get(key)
    if expected_key != key:
        resp['error'] = 'Incorrect secret key.'
    

