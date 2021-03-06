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
    user_info = dict(user_info)
    course = user_info.get('course')
    key = user_info.get('key')
    if isinstance(course, list):
        course = course[0]
    if isinstance(key, list):
        key = key[0]
    resp = {'error': None, 'success': False}
    if course is None or key is None:
        resp['error'] = 'Course name and key cannot be empty.'
        return resp
    course_number = course.split(' ')[1].strip()
    expected_key = REGISTRATION_KEYS.get(course_number)
    if expected_key != key:
        resp['error'] = 'Incorrect secret key.'
        return resp
    db.users.update_one(
        {'id': user_info.get('id')},
        {
            '$set': user_info
        },
        upsert=True
    )
    resp['success'] = True
    return resp

