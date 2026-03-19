const fs = require('fs');

async function refactor() {
    console.log("Loading HTML...");
    let html = fs.readFileSync('formulario.html', 'utf8');

    console.log("1. Add Documentação to Sidebar");
    const docLinkRaw = `
            <a href="#" class="nav-link" id="linkDocumentacao" onclick="showSection('documentacao', this)">
                <i class="bi bi-file-earmark-text"></i> Documentação
            </a>
            `;
    html = html.replace(/(<a href="#" class="nav-link" id="linkRecursos")/, docLinkRaw.trim() + '\n            $1');

    console.log("2. Restructure Main Content Form Wrapper");
    // Remove old <form> and </form>
    html = html.replace(/<form id="cnhSocialForm"[^>]*>\s*/, '');
    
    // We need to carefully remove the FIRST </form> we see
    html = html.replace(/<\/form>\s*/, '');

    // Now, insert `<form>` immediately after `<main class="main-content">`
    html = html.replace(/(<main class="main-content">\s*)/, '$1<form id="cnhSocialForm" class="needs-validation" novalidate onsubmit="processSubmissionAttempt(event)">\n');
    
    // Insert `</form>` before `</main>`
    html = html.replace(/(<\/main>)/, '</form>\n    $1');

    console.log("3. Creating Missing Sections");
    
    // A) Documentação
    const docHtml = `
    <div id="documentacao" class="content-section" style="display: none;">
        <div class="container-fluid">
            <div class="form-wrapper">
                <div class="card card-section p-4 p-md-5">
                    <div class="section-header">
                        <h2 class="h4 mb-0 fw-bold text-primary"><i class="bi bi-folder-check"></i> Documentação Comprobatória</h2>
                        <p class="text-muted mt-2">Anexe os arquivos solicitados de acordo com as informações preenchidas na inscrição.</p>
                    </div>
                    <div class="row g-4" id="documentos-container">
                        <!-- DOCS GO HERE -->
                    </div>
                    
                    <div class="mt-5 d-flex justify-content-between align-items-center">
                        <button type="button" class="btn btn-outline-secondary btn-lg px-4" onclick="showSection('inscricao', document.querySelector('#sidebarNav > a:first-child'))">
                            Voltar para Inscrição
                        </button>
                        <button type="button" class="btn btn-success btn-lg px-5" id="finalSubmitButton" onclick="processSubmissionAttempt(event)">
                            Revisar e Enviar Inscrição
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    // B) Acompanhamento
    const acompHtml = `
    <div id="acompanhamento" class="content-section" style="display: none;">
        <div class="container-fluid">
            <div class="form-wrapper">
                <div class="card card-section p-4 p-md-5">
                    <div class="section-header">
                        <h2 class="h4 mb-0 fw-bold text-primary"><i class="bi bi-search"></i> Acompanhamento da Inscrição</h2>
                        <p class="text-muted mt-2">Veja os detalhes da avaliação dos seus critérios de seleção.</p>
                    </div>
                    <div id="criterios-container">
                        <div class="alert alert-info d-flex align-items-center mb-4">
                            <div class="spinner-border spinner-border-sm me-3" role="status"></div>
                            <div>Carregando pontuação...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    // C) Recursos
    const reqHtml = `
    <div id="recursos" class="content-section" style="display: none;">
        <div class="container-fluid">
            <div class="form-wrapper">
                <div class="card card-section p-4 p-md-5">
                    <div class="section-header">
                        <h2 class="h4 mb-0 fw-bold text-primary"><i class="bi bi-journal-text"></i> Interposição de Recursos</h2>
                    </div>
                    <p>Utilize esta seção para enviar recursos referentes às fases do edital, conforme prazo estipulado no cronograma.</p>
                    <div class="alert alert-warning">
                        O período de recursos não está aberto no momento.
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    // D) Cronograma
    const croHtml = `
    <div id="cronograma" class="content-section" style="display: none;">
        <div class="container-fluid">
            <div class="form-wrapper">
                <div class="card card-section p-4 p-md-5">
                    <div class="section-header">
                        <h2 class="h4 mb-0 fw-bold text-primary"><i class="bi bi-calendar-event"></i> Cronograma do Programa</h2>
                    </div>
                    
                    <div class="mt-4 mb-5">
                        <h5 class="mb-3">Andamento do Edital</h5>
                        <div class="progress" style="height: 30px; border-radius: 15px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">Inscrições Abertas</div>
                        </div>
                        <div class="d-flex justify-content-between mt-2 text-muted small fw-bold">
                            <span>Março</span>
                            <span>Abril</span>
                            <span>Maio</span>
                            <span>Junho</span>
                        </div>
                    </div>
                    
                    <ul class="list-group list-group-flush mt-4">
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Período de Inscrição <span>18/03 a 30/04/2026</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center text-muted">
                            Publicação do Resultado Preliminar <span>15/05/2026</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    `;

    // Append the sections right before the `</form>` tag
    const sectionsToAppend = docHtml + acompHtml + reqHtml + croHtml;
    html = html.replace(/(<\/form>\s*<\/main>)/, sectionsToAppend + '\n$1');

    console.log("4. Moving Files to Documentação");
    
    // Custom zero-dependency HTML tag parser for `.col-12` containing `.file-input-wrapper`
    let blocks = [];
    let regex = /<div class="col-12[^>]*>\s*<div class="file-input-wrapper"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        let startIndex = match.index;
        let openDivs = 0;
        let i = startIndex;
        let foundStart = false;
        while (i < html.length) {
            if (html.substring(i, i+4) === '<div') {
                openDivs++;
                foundStart = true;
            } else if (html.substring(i, i+5) === '</div') {
                openDivs--;
            }
            if (foundStart && openDivs === 0) {
                let block = html.substring(startIndex, i + 6);
                blocks.push({ start: startIndex, end: i + 6, content: block });
                break;
            }
            i++;
        }
    }

    // Sort blocks descending by start index so string replacements don't shift positions
    blocks.sort((a, b) => b.start - a.start);
    
    let allFilesHtml = "";
    blocks.forEach(b => {
        allFilesHtml = b.content + "\n" + allFilesHtml;
        html = html.substring(0, b.start) + html.substring(b.end);
    });

    // Clean up empty lines/HRs left behind? Not strictly necessary, but good
    html = html.replace(/<!-- DOCS GO HERE -->/, allFilesHtml);

    console.log("5. Updating 'Revisar Inscrição' Button in Inscrição");
    // Replace the button inside `#inscricao`
    html = html.replace(/<button type="button" class="btn btn-primary btn-lg px-5" id="reviewButton">\s*Revisar Inscrição\s*<\/button>/, 
    `<button type="button" class="btn btn-info text-white btn-lg px-5" onclick="document.getElementById('linkDocumentacao').click();">
        Prosseguir para anexação de documentação requerida
    </button>`);

    console.log("6. Inserting 'Data de início' next to Trabalhador Aplicativo");
    const dataInicioHtml = `
                                    <div class="col-12 col-md-4 col-lg-4" id="dataInicioAppContainer" style="display: none;">
                                        <label for="dataInicioAplicativo" class="form-label required">Data de início no aplicativo</label>
                                        <input type="text" class="form-control" id="dataInicioAplicativo" name="dataInicioAplicativo" placeholder="MM/AAAA" />
                                    </div>
    `;
    // We need to find the `col-12` wrapping `trabalhadorAplicativo`
    html = html.replace(/(<div class="col-12[^>]*>\s*<label for="trabalhadorAplicativo"[\s\S]*?<\/div>)/, `$1\n${dataInicioHtml}`);
    // Change col size of trabalhadorAplicativo from 6 to 4 so it fits
    html = html.replace(/(<div class=")col-12 col-md-6 col-lg-6(">\s*<label for="trabalhadorAplicativo")/, `$1col-12 col-md-4 col-lg-4$2`);

    console.log("7. Styling Inscrição Headers and category description");
    let iconIndex = 0;
    const icons = [
        "bi-person-badge", "bi-house-door", "bi-people", 
        "bi-star", "bi-lungs", "bi-car-front", "bi-clipboard-check"
    ];
    
    // We replace `<h2 class="h4 mb-0">...</h2>` with icons
    html = html.replace(/<h2 class="h4 mb-0">(.*?)<\/h2>/g, (match, title) => {
        const icon = icons[iconIndex] || "bi-check-circle";
        iconIndex++;
        return `<h2 class="h4 mb-0 fw-bold text-primary"><i class="bi ${icon} me-2"></i> ${title}</h2>`;
    });

    const catDescRaw = `
                                        <div id="categoriaDescription" class="form-text text-primary fw-semibold mt-2" style="display: none;">
                                            <i class="bi bi-info-circle"></i> <span id="catDescText"></span>
                                        </div>
    `;
    // Find categoriaDesejada select and append the description block
    html = html.replace(/(<select class="form-select" id="categoriaDesejada"[\s\S]*?<\/select>)/, `$1\n${catDescRaw}`);

    console.log("Writing resulting HTML...");
    fs.writeFileSync('formulario.html', html, 'utf8');
    console.log("Done.");
}

refactor().catch(console.error);
