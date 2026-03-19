import json

lines = open('formulario.html', 'r', encoding='utf-8').readlines()

results = {
    'nav_start': -1,
    'nav_end': -1,
    'steps': [],
    'actions_starts': [],
    'actions_ends': [],
    'form_end': -1
}

for i, line in enumerate(lines):
    if '<nav class="step-progress-nav' in line:
        results['nav_start'] = i + 1
    if '</nav>' in line and results['nav_start'] != -1 and results['nav_end'] == -1:
        results['nav_end'] = i + 1
    if '<div class="form-step' in line:
        results['steps'].append(i + 1)
    if '<div class="step-actions"' in line:
        results['actions_starts'].append(i + 1)
    if 'id="reviewButton"' in line:
        results['review_btn'] = i + 1
    if '</form>' in line:
        results['form_end'] = i + 1

# Find the ends of step-actions
actions_starts = results['actions_starts']
ends = []
for start in actions_starts:
    # find the next line with just </div> or similar closing for step-actions
    # step actions is usually 5-10 lines
    for j in range(start, len(lines)):
        if '</div>' in lines[j] and j - start > 4:
            # We must be careful to match the outer div
            pass
            
print(json.dumps(results))
