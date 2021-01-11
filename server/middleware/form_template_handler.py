from database.routes import db
from enum import Enum, unique

class QuestionType(str, Enum):
    SHORT_ANSWER = 'short-answer'
    SINGLE_SELECT = 'single-select'
    MULTI_SELECT = 'multi-select'

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

def construct_form_response_column_defs(headers, types):
    column_defs = []
    field_names = []
    field_names_to_headers = {}
    header_to_field_names = {}
    field_names_to_types = {}
    for idx, header in enumerate(headers):
        field_name = header.replace(' ', '_').lower()
        field_names.append(field_name)
        field_names_to_headers[field_name] = header
        header_to_field_names[header] = field_name
        field_names_to_types[field_name] = types[idx]
        column_defs.append({
            'field': field_name,
            'headerName': header,
            'width': 200,
        })
    return field_names, column_defs, field_names_to_types, field_names_to_headers, header_to_field_names

def match_form_responses_to_fields(submissions, header_to_field_names):
    field_responses = []
    for submission in submissions:
        response = submission['response']
        matched_response = {}
        for header in header_to_field_names:
            if header in response:
                matched_response[header_to_field_names[header]] = response[header]
            else:
                matched_response[header_to_field_names[header]] = 'NA'
        field_responses.append(matched_response)
    return field_responses 

def add_if_not_exists(d, field):
    if field not in d:
        d[field] = 0
    d[field] += 1

def aggregate_form_responses_by_fields(form_responses, field_names, field_names_to_types, field_names_to_headers):
    aggregated_result = {}
    for field_name in field_names:
        if not field_names_to_types[field_name] == QuestionType.SHORT_ANSWER:
            aggregated_result[field_name] = {}
            aggregated_result[field_name]['title'] = field_names_to_headers[field_name]
            aggregated_result[field_name]['data'] = []
            data = aggregated_result[field_name]['data']
            freq = {}
            for form_response in form_responses:
                response = form_response[field_name]
                if isinstance(response, str):
                    add_if_not_exists(freq, response)
                else:
                    # Handles when multiple options are chosen for multiselect
                    for individual_choice in response:
                        add_if_not_exists(freq, individual_choice)
            for option, count in freq.items():
                data.append({
                    'name': option,
                    'value': count
                })
    return aggregated_result

def aggregate_form_responses(form_id):
    # TODO: once SID + name verification are in place with the roster upload,
    # mark each submission as unique and traceable for the student
    submissions = db.form_responses.find({'formId': form_id})
    metadata = db.templates.find_one({'formId': form_id})
    if metadata:
        template = metadata['template']
        prompts = [q['prompt'] for q in template]
        types = [q['type'] for q in template]
        field_names, column_defs, field_names_to_types, field_names_to_headers, header_to_field_names = construct_form_response_column_defs(prompts, types)
        form_responses = match_form_responses_to_fields(submissions, header_to_field_names)
        aggregated_responses = aggregate_form_responses_by_fields(
            form_responses, field_names, field_names_to_types, field_names_to_headers)
        return {
            'grid_responses': form_responses,
            'grid_column_defs': column_defs,
            'aggregated_responses': aggregated_responses
        }
