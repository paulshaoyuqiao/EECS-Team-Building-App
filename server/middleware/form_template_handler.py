from database.routes import db
from enum import Enum, unique


class QuestionType(str, Enum):
    SHORT_ANSWER = 'short-answer'
    SINGLE_SELECT = 'single-select'
    MULTI_SELECT = 'multi-select'
    GRID_RANK = 'grid-rank'


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
    submission = {}
    prompts = list(response['response'].keys())
    submission['formId'] = response['formId']
    submission['response'] = {}
    submission['prompts_to_idx'] = prompts
    # Reconstruct submission object to create a mapping from the prompt
    # to its numerical index in the array prompts (to avoid bson decode error)
    for idx, prompt in enumerate(prompts):
        submission['response'][str(idx)] = response['response'][prompt]
    db.form_responses.insert_one(submission)
    return {'success': True}


def construct_form_response_column_defs(headers, types):
    column_defs = []
    generic_names = []
    generic_names_to_headers = {}
    header_to_generic_names = {}
    generic_names_to_types = {}
    for idx, header in enumerate(headers):
        generic_name = f'q{idx}'
        generic_names.append(generic_name)
        generic_names_to_headers[generic_name] = header
        header_to_generic_names[header] = generic_name
        generic_names_to_types[generic_name] = types[idx]
        column_defs.append({
            'field': generic_name,
            'headerName': header,
            'width': 200,
        })
    return generic_names, column_defs, generic_names_to_types, generic_names_to_headers, header_to_generic_names


def match_form_responses_to_fields(submissions, header_to_generic_names):
    field_responses = []
    for submission in submissions:
        response = submission['response']
        prompts = submission['prompts_to_idx']
        # Prepares reverse mapping to decode index key back to the actual header
        prompts_to_idx = {prompt: idx for idx, prompt in enumerate(prompts)}
        matched_response = {}
        for header in header_to_generic_names:
            if header in prompts_to_idx:
                matched_response[header_to_generic_names[header]] = response[str(prompts_to_idx[header])]
            else:
                matched_response[header_to_generic_names[header]] = 'NA'
        field_responses.append(matched_response)
    return field_responses


def add_if_not_exists(d, field):
    if field not in d:
        d[field] = 0
    d[field] += 1


def add_to_multi_freq_if_not_exists(d, field, rank):
    if field not in d:
        d[field] = {}
    if rank not in d[field]:
        d[field][rank] = 0
    d[field][rank] += 1


def aggregate_form_responses_by_fields(form_responses, generic_names, generic_names_to_types, generic_names_to_headers):
    aggregated_result = {}
    for generic_name in generic_names:
        if not generic_names_to_types[generic_name] == QuestionType.SHORT_ANSWER:
            aggregated_result[generic_name] = {}
            aggregated_result[generic_name]['title'] = generic_names_to_headers[generic_name]
            aggregated_result[generic_name]['data'] = []
            data = aggregated_result[generic_name]['data']
            freq = {}
            all_ranks = set()
            for form_response in form_responses:
                response = form_response[generic_name]
                if isinstance(response, str):
                    add_if_not_exists(freq, response)
                elif isinstance(response, list):
                    # Handles when multiple options are chosen for multiselect
                    for individual_choice in response:
                        add_if_not_exists(freq, individual_choice)
                elif isinstance(response, dict):
                    # Handles when the question is a grid-rank with multiple options
                    for option, rank in response.items():
                        if rank:
                            all_ranks.add(str(rank))
                            add_to_multi_freq_if_not_exists(freq, option, str(rank))
                    form_response[generic_name] = str(response)
            for option, count in freq.items():
                if isinstance(count, int):
                    data.append({'name': option, 'value': count})
                elif isinstance(count, dict):
                    # Makes sure each dictionary contains the exact same keys
                    for rank in all_ranks:
                        if rank not in count:
                            count[rank] = 0
                    data.append({'name': option, **count})
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
        generic_names, column_defs, generic_names_to_types, \
        generic_names_to_headers, header_to_generic_names = construct_form_response_column_defs(
            prompts, types)
        form_responses = match_form_responses_to_fields(submissions, header_to_generic_names)
        aggregated_responses = aggregate_form_responses_by_fields(
            form_responses, generic_names, generic_names_to_types, generic_names_to_headers)
        return {
            'grid_responses': form_responses,
            'grid_column_defs': column_defs,
            'aggregated_responses': aggregated_responses
        }
