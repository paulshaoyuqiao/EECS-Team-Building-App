from database.routes import db

def add_new_template(template):
    template = dict(template)
    db.templates.update_one(
        {'email': template.get('email'), 'course': template.get('course')},
        {
            '$set': template
        },
        upsert=True
    )
    return {'success': True}