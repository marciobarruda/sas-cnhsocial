const fs = require('fs');

async function phase3() {
    console.log("Loading HTML...");
    let html = fs.readFileSync('formulario.html', 'utf8');

    console.log("1. Splitting Identidade into FRENTE and VERSO");
    const idDocRegex = /<div class="col-12[^>]*>\s*<div class="file-input-wrapper"[\s\S]*?id="docIdentidade"[\s\S]*?<\/div>\s*<\/div>/;

    const splitIdentityHtml = `
    <div class="col-12 col-lg-6 doc-req" id="identidadeFrenteWrapper">
        <div class="file-input-wrapper" title="Obrigatório">
            <label for="docIdentidadeFrente" class="form-label required">Documento oficial com foto - FRENTE (PDF/JPG/PNG até 5 MB)</label>
            <input class="form-control identity-upload" type="file" id="docIdentidadeFrente" name="docIdentidadeFrente" accept=".pdf,.jpg,.jpeg,.png" required />
            <div class="mt-2 d-none validation-status" id="docIdentidadeFrenteStatus">
                <span class="badge border status-badge"></span>
                <small class="text-muted d-block mt-1 status-payload"></small>
            </div>
            <div class="file-name" id="docIdentidadeFrenteName"></div>
        </div>
    </div>
    <div class="col-12 col-lg-6 doc-req" id="identidadeVersoWrapper">
        <div class="file-input-wrapper" title="Obrigatório">
            <label for="docIdentidadeVerso" class="form-label required">Documento oficial com foto - VERSO (PDF/JPG/PNG até 5 MB)</label>
            <input class="form-control identity-upload" type="file" id="docIdentidadeVerso" name="docIdentidadeVerso" accept=".pdf,.jpg,.jpeg,.png" required />
            <div class="mt-2 d-none validation-status" id="docIdentidadeVersoStatus">
                <span class="badge border status-badge"></span>
                <small class="text-muted d-block mt-1 status-payload"></small>
            </div>
            <div class="file-name" id="docIdentidadeVersoName"></div>
        </div>
    </div>
    `;
    
    html = html.replace(idDocRegex, splitIdentityHtml);

    console.log("2. Injecting JavaScript logic script");
    const jsLogic = `
<!-- DYNAMIC LOGIC SCRIPT (PHASE 3) -->
<script>
document.addEventListener("DOMContentLoaded", function () {
    // A) Dynamic Visibility of Document Fields based on Form Selections
    
    const docResidenciaWrapper = document.getElementById('docResidenciaWrapper');
    const docResidenciaInput = document.getElementById('docResidencia');
    const chkEndereco = document.getElementById('enderecoAtualizado');
    if(chkEndereco) {
        chkEndereco.addEventListener('change', (e) => {
            if(e.target.checked) {
                docResidenciaWrapper.classList.remove('d-none');
                docResidenciaInput.setAttribute('required', 'true');
            } else {
                docResidenciaWrapper.classList.add('d-none');
                docResidenciaInput.removeAttribute('required');
            }
        });
    }

    const trabAppSelect = document.getElementById('trabalhadorAplicativo');
    const dataInicioContainer = document.getElementById('dataInicioAppContainer');
    const dataInicioInput = document.getElementById('dataInicioAplicativo');
    // For the file input, assuming its ID contains 'trabalho' or similar. We need to find its wrapper ID.
    const trabAppWrapper = document.querySelector('input[name="comprovanteAplicativo"]') ? document.querySelector('input[name="comprovanteAplicativo"]').closest('.col-12') : null;
    if(trabAppSelect) {
        trabAppSelect.addEventListener('change', (e) => {
            if(e.target.value === 'Sim') {
                dataInicioContainer.style.display = 'block';
                dataInicioInput.setAttribute('required', 'true');
                if(trabAppWrapper) {
                    trabAppWrapper.classList.remove('d-none');
                    trabAppWrapper.querySelector('input').setAttribute('required', 'true');
                }
            } else {
                dataInicioContainer.style.display = 'none';
                dataInicioInput.removeAttribute('required');
                if(trabAppWrapper) {
                    trabAppWrapper.classList.add('d-none');
                    trabAppWrapper.querySelector('input').removeAttribute('required');
                }
            }
        });
    }

    const pcdSelect = document.getElementById('pcd');
    const laudoPcdWrapper = document.getElementById('laudoPcdWrapper');
    if(pcdSelect && laudoPcdWrapper) {
        pcdSelect.addEventListener('change', (e) => {
            const input = laudoPcdWrapper.querySelector('input');
            if(e.target.value === 'Sim') {
                laudoPcdWrapper.classList.remove('d-none');
                if(input) input.setAttribute('required', 'true');
            } else {
                laudoPcdWrapper.classList.add('d-none');
                if(input) input.removeAttribute('required');
            }
        });
    }

    const dependenteTratamento = document.getElementById('dependenteTratamento');
    const tratWrapper1 = document.querySelector('input[name="declaracaoTratamento"]') ? document.querySelector('input[name="declaracaoTratamento"]').closest('.col-12') : null;
    const tratWrapper2 = document.querySelector('input[name="comprovanteVinculo"]') ? document.querySelector('input[name="comprovanteVinculo"]').closest('.col-12') : null;
    if(dependenteTratamento) {
        dependenteTratamento.addEventListener('change', (e) => {
            if(e.target.checked) {
                if(tratWrapper1) { tratWrapper1.classList.remove('d-none'); tratWrapper1.querySelector('input').setAttribute('required', 'true'); }
                if(tratWrapper2) { tratWrapper2.classList.remove('d-none'); tratWrapper2.querySelector('input').setAttribute('required', 'true'); }
            } else {
                if(tratWrapper1) { tratWrapper1.classList.add('d-none'); tratWrapper1.querySelector('input').removeAttribute('required'); }
                if(tratWrapper2) { tratWrapper2.classList.add('d-none'); tratWrapper2.querySelector('input').removeAttribute('required'); }
            }
        });
    }

    const maePaiAtipico = document.getElementById('maeAtipica');
    const atipicoW1 = document.querySelector('input[name="laudoRelatorio"]') ? document.querySelector('input[name="laudoRelatorio"]').closest('.col-12') : null;
    const atipicoW2 = document.querySelector('input[name="declaracaoCras"]') ? document.querySelector('input[name="declaracaoCras"]').closest('.col-12') : null;
    const atipicoW3 = document.querySelector('input[name="declaracaoResponsabilidade"]') ? document.querySelector('input[name="declaracaoResponsabilidade"]').closest('.col-12') : null;
    if(maePaiAtipico) {
        maePaiAtipico.addEventListener('change', (e) => {
            if(e.target.value === 'Sim') {
                if(atipicoW1) { atipicoW1.classList.remove('d-none'); atipicoW1.querySelector('input').setAttribute('required', 'true'); }
                if(atipicoW2) { atipicoW2.classList.remove('d-none'); atipicoW2.querySelector('input').setAttribute('required', 'true'); }
                if(atipicoW3) { atipicoW3.classList.remove('d-none'); atipicoW3.querySelector('input').setAttribute('required', 'true'); }
            } else {
                if(atipicoW1) { atipicoW1.classList.add('d-none'); atipicoW1.querySelector('input').removeAttribute('required'); }
                if(atipicoW2) { atipicoW2.classList.add('d-none'); atipicoW2.querySelector('input').removeAttribute('required'); }
                if(atipicoW3) { atipicoW3.classList.add('d-none'); atipicoW3.querySelector('input').removeAttribute('required'); }
            }
        });
    }

    // Category Tooltip Text
    const categoriaSelect = document.getElementById('categoriaDesejada');
    const catDescElem = document.getElementById('categoriaDescription');
    const catDescText = document.getElementById('catDescText');
    if(categoriaSelect && catDescElem) {
        categoriaSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if(val.includes('A')) {
                catDescText.innerText = "Categoria A: Veículos de duas ou três rodas (como motos e motonetas).";
                catDescElem.style.display = 'block';
            } else if(val.includes('B')) {
                catDescText.innerText = "Categoria B: Veículos de passeio ou utilitários leves, com limite de até 8 passageiros.";
                catDescElem.style.display = 'block';
            } else {
                catDescElem.style.display = 'none';
            }
        });
    }

    // B) AJAX Document Validation for FRENTE / VERSO
    const validateIdentityFiles = async (inputElem, statusWrapperElem) => {
        if(!inputElem.files || inputElem.files.length === 0) return;
        
        statusWrapperElem.classList.remove('d-none');
        const badge = statusWrapperElem.querySelector('.status-badge');
        const payloadText = statusWrapperElem.querySelector('.status-payload');
        
        badge.className = 'badge border status-badge bg-warning text-dark';
        badge.innerText = 'Validando Documento...';
        payloadText.innerText = 'Enviando para análise...';
        
        const file = inputElem.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', inputElem.id); // For the webhook differentiation
        
        try {
            const response = await fetch('https://webhook-n8n-dev-conectarecife.recife.pe.gov.br/webhook/validadar-documento', {
                method: 'POST',
                body: formData
            });
            
            // Assume the response returns { valid: boolean, message: string, data: any }
            // Let's degrade gracefully if the webhook is not standard
            const data = await response.json();
            
            const isValid = data.valid || data.is_valid || data.status === 'ok' || data.success;
            
            if(isValid) {
                badge.className = 'badge border status-badge bg-success text-white';
                badge.innerText = 'Documento Válido';
                payloadText.innerText = JSON.stringify(data.payload || data.data || data, null, 2).substring(0,100) + '...';
            } else {
                badge.className = 'badge border status-badge bg-danger text-white';
                badge.innerText = 'Documento Inválido';
                payloadText.innerText = data.error || data.message || 'Falha na extração dos dados legíveis.';
                inputElem.value = ''; // Clear file if invalid
            }
        } catch (error) {
            badge.className = 'badge border status-badge bg-secondary text-white';
            badge.innerText = 'Validação Indisponível';
            payloadText.innerText = 'Não foi possível contatar o serviço de validação. O anexo foi salvo.';
            // Do not clear the file so they can still proceed manually
        }
    };

    const docIdentidadeFrente = document.getElementById('docIdentidadeFrente');
    const docIdentidadeFrenteStatus = document.getElementById('docIdentidadeFrenteStatus');
    if(docIdentidadeFrente) {
        docIdentidadeFrente.addEventListener('change', () => validateIdentityFiles(docIdentidadeFrente, docIdentidadeFrenteStatus));
    }
    
    const docIdentidadeVerso = document.getElementById('docIdentidadeVerso');
    const docIdentidadeVersoStatus = document.getElementById('docIdentidadeVersoStatus');
    if(docIdentidadeVerso) {
        docIdentidadeVerso.addEventListener('change', () => validateIdentityFiles(docIdentidadeVerso, docIdentidadeVersoStatus));
    }


    // C) Cronograma Progress Bar Setup
    // Período: 18/03 a 30/04 (Inscrições), 15/05 (Resultado Preliminar), Junho (Atividades)
    const startDate = new Date(2026, 2, 18); // 18 March 2026
    const endDate = new Date(2026, 5, 30); // 30 June 2026
    const curDate = new Date();
    
    // Simulate current date being inside the schedule if testing, else use exact calculation
    // Total days: ~104
    const totalDays = Math.max(1, (endDate - startDate) / (1000 * 60 * 60 * 24));
    let elapsedDays = (curDate - startDate) / (1000 * 60 * 60 * 24);
    
    // Test override (remove in production if unneeded)
    if(elapsedDays < 0) elapsedDays = 15; // default 15 days in for testing
    if(elapsedDays > totalDays) elapsedDays = totalDays;
    
    let percent = Math.floor((elapsedDays / totalDays) * 100);
    const progressBar = document.querySelector('#cronograma .progress-bar');
    if(progressBar) {
        progressBar.style.width = percent + '%';
        progressBar.setAttribute('aria-valuenow', percent);
        if(percent < 35) progressBar.innerText = "Fase 1: Inscrições";
        else if(percent < 60) progressBar.innerText = "Fase 2: Análises";
        else progressBar.innerText = "Fase 3: Selecionados";
    }

});
</script>
    `;

    // Append script at the very end of the body
    html = html.replace(/(<\/body>)/i, jsLogic + '\n$1');

    console.log("Writing resulting HTML...");
    fs.writeFileSync('formulario.html', html, 'utf8');
    console.log("Done.");
}

refactor().catch(console.error);
