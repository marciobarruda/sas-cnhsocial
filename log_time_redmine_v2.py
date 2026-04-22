import requests
import json
from datetime import date, timedelta
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

api_key = "b53f5197b641078084728bd160cc5a12e70ee82a"
base_url = "https://redmine.recife.pe.gov.br"
issue_id = 319072
headers = {"X-Redmine-API-Key": api_key, "Content-Type": "application/json"}

# Mapeamento de comentários por período
def get_comment(d):
    if d <= date(2026, 3, 23):
        return "Estruturação inicial da interface SPA: Definição de layout responsivo com Bootstrap 5 e fontes Public Sans."
    elif d <= date(2026, 3, 25):
        return "Implementação do mapeamento de dados básicos do payload n8n e integração inicial com a API de CEP."
    elif d <= date(2026, 3, 27):
        return "Desenvolvimento das medidas de segurança e anti-inspeção do código; Integração inicial com a API do Redmine."
    elif d <= date(2026, 3, 31):
        return "Implementação da funcionalidade de reaproveitamento de dados de inscrições anteriores e normalização de campos."
    elif d <= date(2026, 4, 2):
        return "Refatoração do modal de reuso de dados: inclusão de resumos dinâmicos e destaque para critérios do CadÚnico."
    elif d <= date(2026, 4, 7):
        return "Desenvolvimento do módulo de upload de documentação: suporte a múltiplos formatos e validação de arquivos."
    elif d <= date(2026, 4, 10):
        return "Implementação da lógica de visualização de pontuação preliminar baseada nos critérios de ranqueamento do edital."
    elif d <= date(2026, 4, 15):
        return "Refinamento dos critérios socioassistenciais: lógica condicional para mulheres chefes de família e trabalhadores de app."
    elif d <= date(2026, 4, 18):
        return "Otimização da aba de situação: implementação de skeleton loaders, ícones animados e busca de workflow em tempo real."
    elif d <= date(2026, 4, 20):
        return "Ajustes de UI/UX na sidebar e rodapé; Implementação de hierarquia rigorosa para tratamento de erros de sincronização."
    else:
        return "Refatoração estrutural da camada de dados: remoção de template tags do JavaScript e padronização de informativos do CadÚnico."

start_date = date(2026, 3, 20)
end_date = date(2026, 4, 22)
holidays = [date(2026, 4, 3), date(2026, 4, 21)]

current = start_date
dates_to_log = []
while current <= end_date:
    if current.weekday() < 5 and current not in holidays:
        dates_to_log.append(current)
    current += timedelta(days=1)

print(f"Logging {len(dates_to_log)} days with specific comments...")

for d in dates_to_log:
    payload = {
        "time_entry": {
            "issue_id": issue_id,
            "spent_on": d.isoformat(),
            "hours": 8,
            "activity_id": 40,
            "comments": get_comment(d)
        }
    }
    resp = requests.post(f"{base_url}/time_entries.json", headers=headers, data=json.dumps(payload), verify=False)
    if resp.status_code == 201:
        print(f"Logged 8h for {d.isoformat()}: {payload['time_entry']['comments'][:40]}...")
    else:
        print(f"Failed to log for {d.isoformat()}: {resp.status_code}")
