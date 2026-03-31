$apiKey = "b53f5197b641078084728bd160cc5a12e70ee82a"
$uri = "https://redmine.recife.pe.gov.br/issues/319072.json"

$description = "Desenvolvimento do Portal do Candidato CNH Recife. Interface 'Single Page Application' (SPA) com Bootstrap 5 e Public Sans, permitindo:`n1. Identificação do candidato via CPF/NIS e integração de dados do CadÚnico.`n2. Atualização cadastral e de endereço com funcionalidade de busca via CEP.`n3. Coleta de informações socioassistenciais detalhadas (PCD, Trabalhadores de app, Mães atípicas, etc.).`n4. Upload de documentação em formatos digitais (PDF/JPG/PNG).`n5. Visualização de pontuação preliminar baseada nos critérios de ranqueamento do edital."

$valCriteria = "1. Validação de campos de dados pessoais e contatos preferenciais. 2. Integração funcional com busca de CEP e preenchimento de endereço. 3. Persistência de seleções socioassistenciais e lógica condicional de exibição. 4. Funcionalidade de upload de documentos operável. 5. Cálculo e exibição correta da pontuação baseada nos dados informados."

$payload = @{
    issue = @{
        description = $description
        done_ratio = 75
        custom_fields = @(
            @{ id = 30; value = $valCriteria }
        )
    }
} | ConvertTo-Json -Depth 5

$client = New-Object System.Net.Http.HttpClient
$client.DefaultRequestHeaders.Add("X-Redmine-API-Key", $apiKey)

$content = New-Object System.Net.Http.StringContent($payload, [System.Text.Encoding]::UTF8, "application/json")

try {
    $response = $client.PutAsync($uri, $content).Result
    if ($response.IsSuccessStatusCode) {
        Write-Host "Ticket updated successfully with HttpClient."
    } else {
        $err = $response.Content.ReadAsStringAsync().Result
        Write-Host "Error: $($response.StatusCode) - $err"
    }
} catch {
    Write-Host "Failed: $($_.Exception.Message)"
} finally {
    $client.Dispose()
}
