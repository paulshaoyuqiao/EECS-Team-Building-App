from database.routes import db


def add_new_template(template):
    template = dict(template)
    db.templates.update_one(
        {
            'formId': template.get('formId')
        },
        {
            '$set': template
        },
        upsert=True
    )
    return {'success': True}


def fetch_all_templates():
    templates = list(db.templates.find({}))
    for template in templates:
        template.pop("_id", None)
    return {'templates': templates}


def fetch_template_metadata_by_course(course):
    metadata = list(db.templates.find({'course': course}))
    for entry in metadata:
        entry.pop('_id', None)
        entry.pop('template', None)
        formId = entry['formId']
        responseCount = db.form_responses.find({'formId': formId}).count()
        entry['count'] = responseCount
    return {'metadata': metadata}


def submit_form_response(response):
    db.form_responses.insert_one(dict(response))
    return {'success': True}
