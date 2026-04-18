# Manual Técnico Exaustivo: Portal CNH Social 2026

Este documento fornece uma referência técnica absoluta e detalhada sobre o funcionamento do portal, mapeando cada variável, fórmula, gatilho e lógica de integração presente no código-fonte.

---

## 1. Dicionário de Dados Universal

### 1.1 Seção: Dados de Identificação e Cadastrais
Estes campos são mapeados diretamente do objeto `$json.data` e inputs HTML.

| ID do Campo (HTML) | Nome Amigável | Variável Backend (JSON/Payload) | Descrição / Regra |
| :--- | :--- | :--- | :--- |
| `numInscricao` | Número da Inscrição | `numInscricao` | ID único da inscrição. Se vazio/null, exibe "Pendente". |
| `cpf` | CPF | `cpf` | CPF do candidato (Chave primária de busca). |
| `nomeCompleto` | Nome Completo | `nomeCompleto` / `nome` | Nome completo extraído do CadÚnico/Receita. |
| `nomeSocial` | Nome Social | `nomeSocial` | Nome opcional para candidatos Trans/Não-binários. |
| `dataNascimento` | Data de Nascimento | `dataNascimento` | Formato YYYY-MM-DD. |
| `idade` | Idade | `idade` | Calculada no backend a partir da data de nascimento. |
| `nis` | NIS | `nis` | Número de Identificação Social (CadÚnico). |
| `genero` | Gênero | `genero` / `generoUC` | MASCULINO / FEMININO (Usado para travas de critérios). |
| `racaCor` | Raça/Cor | `racaCor` / `racaCorUC` | Autodeclaração para pontuação de grupos minoritários. |

### 1.2 Seção: Endereço e Contatos
Campos utilizados para localização e notificações.

| ID do Campo (HTML) | Nome Amigável | Variável Backend | Descrição / Regra |
| :--- | :--- | :--- | :--- |
| `telefone` | WhatsApp | `whatsapp` | Principal canal de contato. Formatado via lógica de máscara. |
| `email` | E-mail | `email` | Canal secundário de contato. |
| `cep` | CEP | `cep` | Dispara busca automática via BrasilAPI. |
| `logradouro` | Rua/Logradouro | `logradouro` | Preenchido via CEP ou manualmente após `chkUpdateAddress`. |
| `numero` | Número | `numero` | Número da residência. |
| `complemento` | Complemento | `complemento` | Detalhes adicionais do endereço. |
| `bairro` | Bairro | `bairro` | Preenchido via CEP ou manualmente. |
| `cidade` | Cidade | `cidade` | Fixado geralmente para RECIFE (Regra do programa). |
| `uf` | UF | `uf` | Fixado para PE. |

### 1.3 Seção: Critérios Socioeconômicos (Switches)
Estes campos determinam a pontuação e a elegibilidade.

| ID do Campo (HTML) | Nome Amigável | Variável Backend | Regra de Negócio |
| :--- | :--- | :--- | :--- |
| `trabalhadorAplicativo` | Trabalhador App | `trabalhadorapp` | Destrava o campo `dataInicioApp`. Pontua 20 pts base. |
| `pcd` | Pessoa com Deficiência | `pcd` | Declaração de deficiência. Pontua 20 pts. |
| `maeAtipica` | Mãe/Pai Atípico | `maepaiatipico` | **Cota de 10%**. Não gera pontuação direta (0 pts). |
| `mulherChefe` | Mulher Chefe Família | `mulherChefe` | Bloqueado se Gênero = Masculino. Pontua 15 pts. |
| `dependenteTratamento`| Dep. Legais em Tratamento | `dependentetratamento`| Necessidade de tratamento terapêutico. Pontua 20 pts. |
| `vitimaViolencia` | Vítima de Violência | `mulherviolencia` | Bloqueado se Gênero = Masculino. Pontua 20 pts. |
| `acolhimentoInstitucional`| Resido em Acolhimento | `acolhimento` | Confirmação SAS. Pontua 20 pts. |
| `programasSociais` | Beneficiário Bolsa Família| `programaBolsaFamilia`| Cruzamento com Base CadÚnico. Pontua 15 pts. |
| `semTrabalhoFormal`| Sem Trabalho Formal | `semTrabalhoFormalValor`| Baseado na ausência de vínculo na CTPS. Pontua 15 pts. |

### 1.4 Seção: Variáveis de Controle e Sistema (Inputs Ocultos)
Essenciais para a lógica de Recursos e Fluxo de Status.

| ID do Campo | Nome Amigável | Finalidade Técnica |
| :--- | :--- | :--- |
| `workflowStatus` | Status Atual | Indica a etapa exata no n8n (ex: "177 - Inscrição Rejeitada"). |
| `possuirecursoinscricao`| Flag Recurso J1 | Se vazio/null, indica que o candidato AINDA PODE enviar recurso J1. |
| `possuirecursopontuacao`| Flag Recurso J2 | Se vazio/null, indica que o candidato AINDA PODE enviar recurso J2. |
| `analiseredeprotecao` | Gatilho Rede Prot. | Análise inicial do fiscal (sim/não) -> Se "não", libera recurso J2. |
| `analisesociofamiliar` | Gatilho Sociofam. | Análise inicial do fiscal (sim/não) -> Se "não", libera recurso J2. |
| `analisesocioassistencial`| Gatilho Socioassi. | Análise inicial do fiscal (sim/não) -> Se "não", libera recurso J2. |
| `analisesocioocupacional`| Gatilho Socioocup. | Análise inicial do fiscal (sim/não) -> Se "não", libera recurso J2. |
| `analisedepterapeutica` | Gatilho Dep. Terap. | Análise inicial do fiscal (sim/não) -> Se "não", libera recurso J2. |
| `julredeprotecao` | Julgamento Rede Prot.| Se "sim", indica que recurso foi acatado. Reativa switch no form. |
| `julsociofamiliar` | Julgamento Sociofam. | Se "sim", indica que recurso foi acatado. Reativa switch no form. |
| `julsocioassistencial`| Julgamento Socioassi.| Se "sim", indica que recurso foi acatado. Reativa switch no form. |
| `julsocioocupacional` | Julgamento Socioocup. | Se "sim", indica que recurso foi acatado. Reativa switch no form. |
| `juldepterapeutica` | Julgamento Dep. Terap.| Se "sim", indica que recurso foi acatado. Reativa switch no form. |

---

## 2. Algoritmos e Fórmulas de Cálculo

### 2.1 Cálculo de Renda Per Capita
Calculado em tempo real na função `updateScore()`.
*   **Fórmula**: `rendaPerCapita = totalIncome / composicaoFamiliar`
*   **Aplicação**:
    *   `<= R$ 218,00`: 20 Pontos
    *   `<= R$ 810,50`: 10 Pontos
    *   `> R$ 810,50`: 5 Pontos

### 2.2 Cálculo de Tempo de Atualização CadÚnico
Localizado na `init()`. Determina há quanto tempo os dados do candidato não são revisados.
*   **Lógica**:
    ```javascript
    months = (dataAtual.ano - dataAtualizacao.ano) * 12;
    months -= dataAtualizacao.mes;
    months += dataAtual.mes;
    if (dataAtual.dia < dataAtualizacao.dia) months--;
    ```
*   **Exibição**: Injetado no campo `tempoAtualizacaoCadunico` como "X meses".

### 2.3 Cálculo de Experiência Trabalhador App (Tempo)
Lógica dinâmica baseada na `dataInicioApp`.
*   **Anos de Atividade**: `diffYears = (now - start) / (1000 * 60 * 60 * 24 * 365.25)`
*   **Grade de Pontuação**:
    *   `> 3 anos`: +20 Pontos
    *   `>= 2 anos`: +15 Pontos
    *   `>= 1 ano`: +10 Pontos
    *   `< 1 ano`: 0 Pontos (recebe apenas os 20 pts base se o switch estiver ativo).

### 2.4 Barra de Progresso do Cronograma
Calcula o avanço linear entre a data de publicação do edital e o resultado final.
*   **Lógica**: `progresso % = (DataAtual - DataPrimeiraEtapa) / (DataUltimaEtapa - DataPrimeiraEtapa) * 100`

---

## 3. Matriz de Gatilhos e Interdependência

### 3.1 Gatilhos de UI (Frontend Puro)
| Gatilho (Ação) | Elemento Alvo | Efeito |
| :--- | :--- | :--- |
| `trabalhadorAplicativo` (Change) | `appWorkerDateContainer` | Exibe/Oculta campo de data e torna-o obrigatório. |
| `categoria` (Change) | `cnhInfo` | Exibe campos de CNH se categoria for Adição ou Mudança. |
| `chkUpdateAddress` (Change) | `addressBlock` | Remove opacidade e habilita edição de endereço. |
| `categoria` (Change) | `categoriaDescricao` | Atualiza texto explicativo técnico sobre a categoria escolhida. |

### 3.2 Gatilhos de Disponibilidade de Campos (Variáveis Backend)
Estes são os disparadores críticos da **Janela 2 (Recurso de Pontuação)**.

| Variável de Gatilho | Condição para Disparo | Campo Liberado no Recurso | Justificativa Exibida |
| :--- | :--- | :--- | :--- |
| `analiseredeprotecao` | "não" | Switch `swRecRedeProt` | `justrecredpro` |
| `analisesociofamiliar` | "não" | Switch `swRecSocioFami` | `justrecsociofami` |
| `analisesocioassistencial`| "não" | Switch `swRecSocioAssi` | `justrecsocioassi` |
| `analisesocioocupacional` | "não" | Switch `swRecSocioOcup` | `justrecsocioocup` |
| `analisedepterapeutica` | "não" | Switch `swRecDepTerap` | `justrecdepterap` |

> [!NOTE]
> Se todas as variáveis de análise retornarem "sim", o formulário de recurso e o campo de upload de provas são **totalmente ocultados**, pois não há objeto de contestação.

### 3.3 Gatilhos de Retomada Automática (Reflexo de Julgamento)
Executado na `init()`. Se o julgamento for favorável, a UI "esquece" a rejeição anterior e reativa o direito.

| Variável de Julgamento | Valor | Ação na Interface |
| :--- | :--- | :--- |
| `julsocioocupacional` | "sim" | Ativa `trabalhadorAplicativo` + Exibe campo de data. |
| `julsociofamiliar` | "sim" | Ativa `maeAtipica`. |
| `julredeprotecao` | "sim" | Ativa `vitimaViolencia`. |
| `julsocioassistencial` | "sim" | Ativa `acolhimentoInstitucional`. |
| `juldepterapeutica` | "sim" | Ativa `dependenteTratamento`. |

---

## 4. Integração Técnica e Endpoints

O portal comunica-se exclusivamente via `Fetch API` com cabeçalhos de autenticação ofuscados (`getAuthHeaders`).

| Funcionalidade | Endpoint | Método | Payload Principal |
| :--- | :--- | :--- | :--- |
| **Inscrição Principal** | `.../6cb0dfd2-7c35-recebimentocnhsocial` | POST (Multipart) | Dados Form + Arquivos |
| **Envio de Recursos** | `.../receber-recurso-cnh` | POST (Multipart) | `recursos` (JSON Array) + Anexos |
| **Validação OCR** | `.../validadar-documento` | POST | Arquivo Identidade |
| **Busca de Dados** | `.../buscar-dados-inscricao-homologada` | POST | CPF |
| **Classificação** | `.../consultar-classificados` | GET | Inscricao |
| **Matrícula/Aula** | `.../letramento` | POST | CPF + Presença |
| **Busca CEP** | `https://brasilapi.com.br/api/cep/v1/` | GET | CEP |

---

## 5. Cronograma e Janelas de Tempo

A lógica de visibilidade das abas baseia-se no `AppState.currentDate` comparado ao `AppState.cronograma`.

1.  **Edital**: Visível sempre.
2.  **Inscrição**: Aberta apenas na etapa ID 2 (`Período de Inscrições`).
3.  **Recursos J1**: Habilitado na etapa ID 5 se `workflowStatus` indicar rejeição de inscrição.
4.  **Recursos J2**: Habilitado na etapa ID 8 se `workflowStatus` indicar rejeição de critérios ou pontuação.
5.  **Score Detalhado**: Oculto até a etapa ID 7 (`Resultado Preliminar Seleção`). Exibe aviso datado antes disso.

---

# Manual do Usuário Final: Guia do Candidato

Bem-vindo ao **Portal do Candidato CNH Social 2026**. Este guia foi criado para ajudar você a navegar por todas as etapas do programa, desde a inscrição até a matrícula final.

## 1. Primeiros Passos e Acompanhamento
Ao acessar o portal, a primeira coisa que você verá é o **Cronograma do Programa**. Ele é o seu mapa:
*   **Barra de Progresso**: Indica em qual fase o programa se encontra no momento.
*   **Linha do Tempo**: Mostra as datas de início e fim de cada etapa (Inscrição, Análise, Seleção, etc.).
*   **Informativos (Ícone de Envelope)**: No canto superior, você encontrará notificações importantes. Sempre que houver uma novidade sobre o seu processo, um número aparecerá sobre o envelope.

## 2. Como Realizar sua Inscrição
A aba **"Inscrição"** é onde você preenche seus dados socioeconômicos.
1.  **Dados Cadastrais**: Confira se seu nome, CPF e NIS estão corretos. Se precisar atualizar seu endereço, marque a caixa *"Desejo atualizar meu endereço residencial"*.
2.  **Critérios de Pontuação**: Marque com atenção os botões (switches) que se aplicam à sua realidade (ex: Trabalhador de Aplicativo, Mãe/Pai Atípico, etc.). 
    *   *Atenção*: Se você for homem, os campos exclusivos para mulheres (como "Mulher Chefe de Família") estarão bloqueados.
3.  **Categoria Desejada**: Escolha se deseja a Primeira Habilitação ou Adição/Mudança de categoria. O sistema explicará cada opção logo abaixo da seleção.

## 3. Gestão de Documentos (Upload)
Após preencher o formulário, vá para a aba **"Documentação"**.
*   **Anexar Arquivos**: O sistema listará exatamente quais documentos você precisa enviar com base nas opções que você marcou na inscrição.
*   **Formatos Aceitos**: Você pode enviar fotos (JPG/PNG) ou arquivos PDF.
*   **Validação em Tempo Real**: Ao enviar seu RG/CNH, o sistema processará o arquivo automaticamente para verificar se ele é válido e legível. 
*   **Aviso de Pendência**: Se você tentar finalizar sem um documento obrigatório, o portal avisará quais arquivos estão faltando.

## 4. Consulta de Resultados e Score
Quando o período de análise terminar (conforme o cronograma), você poderá consultar seu desempenho:
*   **Sua Pontuação**: Na aba de inscrição, aparecerá uma tabela detalhada mostrando quantos pontos você recebeu em cada critério.
*   **Total de Pontos**: O score final será exibido no topo da tabela, ajudando você a entender sua posição na classificação.

## 5. Como Entrar com Recurso (Contestações)
Se você não concordar com algum resultado, poderá usar a aba **"Recursos"** nos prazos definidos.
*   **Tipo 1 (Inscrição Rejeitada)**: Se sua inscrição for negada, você terá um campo para escrever sua justificativa e anexar novos documentos.
*   **Tipo 2 (Pontuação/Critérios)**: Se um critério específico (como "PCD") for negado, o portal exibirá um botão exclusivo para aquele critério. Você deve explicar por que merece os pontos e enviar provas.
*   **Importante**: O recurso só pode ser enviado uma única vez por etapa.

## 6. Matrícula e Aula Inaugural
Se você for **Classificado**, uma nova aba chamada **"Matrícula"** aparecerá para você.
1.  **Confirmar Matrícula**: Clique no botão para confirmar que você deseja seguir com o processo.
2.  **Aula Inaugural**: Escolha se você irá à aula sozinho ou com acompanhante. 
3.  **Sucesso**: Após confirmar, um banner verde aparecerá indicando que sua vaga está garantida.

---
**Dúvidas?** Consulte sempre o **Edital Completo** disponível na primeira aba do portal.
