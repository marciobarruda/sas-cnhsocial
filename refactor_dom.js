const { JSDOM } = require("jsdom");
const fs = require('fs');

async function refactor() {
    console.log("Loading HTML...");
    const html = fs.readFileSync('formulario.html', 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    console.log("1. Add Documentação to Sidebar");
    const sidebarNav = document.querySelector('.sidebar .nav[role="tablist"]');
    if (sidebarNav) {
        const linkRecursos = document.getElementById('linkRecursos');
        if (linkRecursos) {
            const docLinkRaw = `
            <a href="#" class="nav-link" id="linkDocumentacao" onclick="showSection('documentacao', this)">
                <i class="bi bi-file-earmark-text"></i> Documentação
            </a>
            `;
            const template = document.createElement('template');
            template.innerHTML = docLinkRaw.trim();
            sidebarNav.insertBefore(template.content.firstChild, linkRecursos);
        }
    }

    console.log("2. Restructure Main Content Form Wrapper");
    const mainContent = document.querySelector('.main-content');
    const oldForm = document.getElementById('cnhSocialForm');
    if (oldForm) {
        // Move oldForm's children to its parent
        const parent = oldForm.parentNode;
        while (oldForm.firstChild) {
            parent.insertBefore(oldForm.firstChild, oldForm);
        }
        parent.removeChild(oldForm);
    }
    
    // Now wrap mainContent's inner HTML in a new form
    const mainInner = mainContent.innerHTML;
    mainContent.innerHTML = `<form id="cnhSocialForm" class="needs-validation" novalidate onsubmit="processSubmissionAttempt(event)">${mainInner}</form>`;
    
    // The `<form>` now wraps `#inscricao`. Let's create the other sections as siblings of `#inscricao`.
    const formEl = document.getElementById('cnhSocialForm');

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
                    </div>
                    
                    <div class="mt-5 d-flex justify-content-between align-items-center">
                        <button type="button" class="btn btn-outline-secondary btn-lg px-4" onclick="showSection('inscricao', document.querySelector('.nav-link.active'))">
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

    formEl.insertAdjacentHTML('beforeend', docHtml);
    formEl.insertAdjacentHTML('beforeend', acompHtml);
    formEl.insertAdjacentHTML('beforeend', reqHtml);
    formEl.insertAdjacentHTML('beforeend', croHtml);

    console.log("4. Moving Files to Documentação");
    const docContainer = document.getElementById('documentos-container');
    const fileWrappers = document.querySelectorAll('.file-input-wrapper');
    
    fileWrappers.forEach(wrapper => {
        // Find the closest parent column (col-12...)
        const colNode = wrapper.closest('.col-12');
        if (colNode) {
            // Also, there could be <hr> before it, we want to leave the <hr> in the original or remove it.
            // Move the colNode into documentacao
            docContainer.appendChild(colNode);
        }
    });

    // Also move "Condições especiais e anexos" header if it exists? We don't need it. We will remove the HRs that separates files.
    // Actually, identity documents etc. are moved. Let's make sure the elements were moved.

    console.log("5. Updating 'Revisar Inscrição' Button in Inscrição");
    const reviewBtn = document.getElementById('reviewButton');
    if (reviewBtn) {
        reviewBtn.textContent = 'Prosseguir para anexação de documentação requerida';
        reviewBtn.onclick = null;
        reviewBtn.removeAttribute('id'); // Remove id to prevent old bindings
        reviewBtn.classList.remove('btn-primary');
        reviewBtn.classList.add('btn-info', 'text-white');
        reviewBtn.setAttribute('onclick', 'document.getElementById("linkDocumentacao").click();');
    }

    console.log("6. Inserting 'Data de início' next to Trabalhador Aplicativo");
    const trabAplicativo = document.getElementById('trabalhadorAplicativo');
    if (trabAplicativo) {
        const trabCol = trabAplicativo.closest('.col-12');
        if (trabCol) {
            const dataInicioHtmlRaw = `
            <div class="col-12 col-md-4 col-lg-4" id="dataInicioAppContainer" style="display: none;">
                <label for="dataInicioAplicativo" class="form-label required">Data de início no aplicativo</label>
                <input type="text" class="form-control" id="dataInicioAplicativo" name="dataInicioAplicativo" placeholder="MM/AAAA" />
            </div>
            `;
            const template = document.createElement('template');
            template.innerHTML = dataInicioHtmlRaw.trim();
            trabCol.parentNode.insertBefore(template.content.firstChild, trabCol.nextSibling);

            // Change trabCol class to be 4 columns so it fits
            trabCol.className = 'col-12 col-md-4 col-lg-4';
        }
    }

    console.log("7. Styling Inscrição Headers and category description");
    const icons = [
        "bi-person-badge", "bi-house-door", "bi-people", 
        "bi-star", "bi-lungs", "bi-car-front", "bi-file-earmark-check", "bi-clipboard-check"
    ];
    let iconIndex = 0;
    const headers = document.querySelectorAll('#inscricao .section-header h2');
    headers.forEach(h2 => {
        h2.classList.add('fw-bold', 'text-primary');
        const iconRaw = `<i class="bi ${icons[Math.min(iconIndex, icons.length - 1)]} me-2"></i>`;
        const template = document.createElement('template');
        template.innerHTML = iconRaw;
        h2.insertBefore(template.content.firstChild, h2.firstChild);
        iconIndex++;
    });

    const categorySelect = document.getElementById('categoriaDesejada');
    if (categorySelect) {
        const catDescRaw = `
        <div id="categoriaDescription" class="form-text text-primary fw-semibold mt-2" style="display: none;">
            <i class="bi bi-info-circle"></i> <span id="catDescText"></span>
        </div>
        `;
        categorySelect.insertAdjacentHTML('afterend', catDescRaw);
    }

    console.log("Writing resulting HTML...");
    fs.writeFileSync('formulario.html', dom.serialize(), 'utf8');
    console.log("Done.");
}

refactor().catch(console.error);
