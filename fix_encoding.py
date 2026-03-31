import json
import requests
import urllib3

# Suppress insecure request warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

api_key = "b53f5197b641078084728bd160cc5a12e70ee82a"
issue_id = 319072
url = f"https://redmine.recife.pe.gov.br/issues/{issue_id}.json"

description = (
    "Desenvolvimento do Portal do Candidato CNH Recife. Interface 'Single Page Application' (SPA) com Bootstrap 5 e Public Sans, permitindo:\n"
    "1. Identificação do candidato via CPF/NIS e integração de dados do CadÚnico.\n"
    "2. Atualização cadastral e de endereço com funcionalidade de busca via CEP.\n"
    "3. Coleta de informações socioassistenciais detalhadas (PCD, Trabalhadores de app, Mães atípicas, etc.).\n"
    "4. Upload de documentação em formatos digitais (PDF/JPG/PNG).\n"
    "5. Visualização de pontuação preliminar baseada nos critérios de ranqueamento do edital."
)

val_criteria = (
    "1. Validação de campos de dados pessoais e contatos preferenciais. 2. Integração funcional com busca de CEP e preenchimento de endereço. "
    "3. Persistência de seleções socioassistenciais e lógica condicional de exibição. 4. Funcionalidade de upload de documentos operável. "
    "5. Cálculo e exibição correta da pontuação baseada nos dados informados."
)

payload = {
    "issue": {
        "description": description,
        "done_ratio": 75,
        "custom_fields": [
            {"id": 30, "value": val_criteria}
        ]
    }
}

headers = {
    "X-Redmine-API-Key": api_key,
    "Content-Type": "application/json"
}

# json.dumps with ensure_ascii=True will escape all non-ASCII characters
response = requests.put(url, headers=headers, data=json.dumps(payload), verify=False)

if response.status_code in [200, 204]:
    print("Ticket updated successfully with Python (escaped Unicode).")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
