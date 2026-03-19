const fs = require('fs');
let html = fs.readFileSync('formulario.html', 'utf8');

// 1. Remove the step progress nav
html = html.replace(/<nav class="step-progress-nav[^>]*>[\s\S]*?<\/nav>\s*/, '');

// 2. Remove the form-step wrappers opening tags
html = html.replace(/<div class="form-step[^>]*>\s*/g, '');

// 3. Remove the step-actions blocks
// Let's replace the last one containing "reviewButton" with a simple div.
html = html.replace(/<div class="step-actions"[^{}]*Voltar<\/button>\s*<button type="button" class="step-actions__button step-actions__button--next"[^>]*>\s*Avançar\s*<i class="bi bi-arrow-right-short"[^>]*><\/i>\s*<\/button>\s*<\/div>\s*/g, '');

html = html.replace(/<div class="step-actions"[^>]*>\s*<button type="button" class="step-actions__button step-actions__button--next"[^>]*>\s*Avançar\s*<i class="bi bi-arrow-right-short"[^>]*><\/i>\s*<\/button>\s*<\/div>\s*/g, '');

const submitReplacement = `<div class="mt-5 d-flex justify-content-end">
                            <button type="button" class="btn btn-primary btn-lg px-5" id="reviewButton">
                                Revisar Inscrição
                            </button>
                        </div>`;
                        
html = html.replace(/<div class="step-actions"[^>]*>\s*<button type="button" class="step-actions__button step-actions__button--prev"[\s\S]*?<\/button>\s*<button type="button" class="step-actions__button step-actions__button--next"[^>]*id="reviewButton"[^>]*>\s*Avançar\s*<i[^>]*><\/i>\s*<\/button>\s*<\/div>/, submitReplacement);

// 4. Since we removed 5 opening `<div class="form-step">`, we need to remove 5 `</div>` just before `</form>`
let formEndIndex = html.lastIndexOf('</form>');
let beforeForm = html.substring(0, formEndIndex);
let afterForm = html.substring(formEndIndex);

// replace the last 5 `</div>` in beforeForm
let count = 0;
while(count < 5) {
    let lastDivIdx = beforeForm.lastIndexOf('</div>');
    if(lastDivIdx !== -1) {
        beforeForm = beforeForm.substring(0, lastDivIdx) + beforeForm.substring(lastDivIdx + 6);
        count++;
    } else {
        break;
    }
}

html = beforeForm + afterForm;

// 5. Write back to formulario.html
fs.writeFileSync('formulario.html', html, 'utf8');
console.log("Flattened HTML successfully.");
