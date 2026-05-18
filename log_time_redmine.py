import requests
import json
from datetime import date, timedelta

api_key = "b53f5197b641078084728bd160cc5a12e70ee82a"
base_url = "https://redmine.recife.pe.gov.br"
issue_id = 319072

headers = {
    "X-Redmine-API-Key": api_key,
    "Content-Type": "application/json"
}

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 1. Get Activity IDs to be sure
try:
    resp = requests.get(f"{base_url}/enumerations/time_entry_activities.json", headers=headers, verify=False)
    activities = resp.json().get('time_entry_activities', [])
    print("Available Activities:")
    for act in activities:
        print(f"ID: {act['id']}, Name: {act['name']}")
    
    # Default to 'Desenvolvimento' or first active if found, else 9
    activity_id = 9
    for act in activities:
        if "desenvolvimento" in act['name'].lower():
            activity_id = act['id']
            break
    print(f"Selected Activity ID: {activity_id}")

except Exception as e:
    print(f"Could not fetch activities: {e}")
    activity_id = 9

# 2. Define dates
start_date = date(2026, 3, 20)
end_date = date(2026, 4, 22)

holidays = [
    date(2026, 4, 3),  # Sexta-feira Santa
    date(2026, 4, 21), # Tiradentes
]

current = start_date
dates_to_log = []

while current <= end_date:
    # 0 = Monday, 1 = Tuesday, ..., 4 = Friday, 5 = Saturday, 6 = Sunday
    if current.weekday() < 5 and current not in holidays:
        dates_to_log.append(current)
    current += timedelta(days=1)

print(f"Logging {len(dates_to_log)} days...")

# 3. Post time entries
for d in dates_to_log:
    payload = {
        "time_entry": {
            "issue_id": issue_id,
            "spent_on": d.isoformat(),
            "hours": 8,
            "activity_id": activity_id,
            "comments": "Desenvolvimento e refatoração estrutural do Portal CNH Social - Refatoração da camada de dados e estabilização de UI."
        }
    }
    
    resp = requests.post(f"{base_url}/time_entries.json", headers=headers, data=json.dumps(payload), verify=False)
    if resp.status_code == 201:
        print(f"Logged 8h for {d.isoformat()}")
    else:
        print(f"Failed to log for {d.isoformat()}: {resp.status_code} - {resp.text}")
