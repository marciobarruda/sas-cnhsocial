const fs = require('fs');

let formHtml = fs.readFileSync('form_original.html', 'utf8');

const formMatch = formHtml.match(/<form id="cnhSocialForm"[^>]*>([\s\S]*?)<\/form>/);
if (!formMatch) {
    console.error("Form not found in form_original.html");
    process.exit(1);
}

let formContent = formMatch[1];

// Remove the section nav if it is inside the form (it isn't, but just in case)
// Remove step-actions blocks
formContent = formContent.replace(/<div class="step-actions"[>][\s\S]*?<\/div>(\s*<\/div>\s*<\/div>)?/g, ''); 
// Actually, step actions has inside `<button>...</button></div>`.
formContent = formContent.replace(/<div class="step-actions"[^>]*>[\s\S]*?<\/button>\s*<\/div>\s*/g, '');

// Now we want to remove the specific opening wrappers:
// <div class="form-step...">
formContent = formContent.replace(/<div class="form-step[^>]*>\s*/g, '');

// <section id="..." class="form-section">
formContent = formContent.replace(/<section id="[^"]+" class="form-section">\s*/g, '');

// <div class="card card-section p-4 p-md-5">
formContent = formContent.replace(/<div class="card card-section p-4 p-md-5">\s*/g, '');

// Now for the closing tags. What is the sequence at the end of a section?
// </div> (card)
// </section>
// </div> (step - but step 3 has two sections inside one step)
// So we just look for `</div>\s*</section>` and replace it with `<hr class="section-divider" />`
formContent = formContent.replace(/<\/div>\s*<\/section>\s*<\/div>\s*/g, '<hr class="section-divider" />\n');
formContent = formContent.replace(/<\/div>\s*<\/section>\s*/g, '<hr class="section-divider" />\n');

// The very last ones might result in an <hr> at the very end of the form. We can trim that later.
// Wait, replacing `</div>\n</section>` with `<hr>` means we removed 2 closing tags (card and section).
// If it also had `</div>` (step), we removed 3 closing tags.

// Let's manually clean up multiple <hr>s that might be next to each other
formContent = formContent.replace(/(<hr class="section-divider" \/>\s*)+/g, '<hr class="section-divider" />\n');

const submitButtonHtml = `
<div class="mt-5 d-flex justify-content-end">
    <button type="button" class="btn btn-primary btn-lg px-5" id="reviewButton">
        Revisar Inscrição
    </button>
</div>`;

const finalFormContent = `
<div class="card card-section p-4 p-md-5">
    ${formContent.trim()}
    ${submitButtonHtml}
</div>
`;

// Remove trailing <hr> before the submit button if any
const cleanedFinalFormContent = finalFormContent.replace(/<hr class="section-divider" \/>\s*(<div class="mt-5)/, '$1');

let resultHtml = fs.readFileSync('formulario.html', 'utf8');

const resultFormMatch = resultHtml.match(/(<form id="cnhSocialForm"[^>]*>)([\s\S]*?)<\/form>/);

resultHtml = resultHtml.substring(0, resultFormMatch.index) +
             resultFormMatch[1] +
             cleanedFinalFormContent +
             '</form>' +
             resultHtml.substring(resultFormMatch.index + resultFormMatch[0].length);

fs.writeFileSync('formulario.html', resultHtml, 'utf8');
console.log("Form re-processed successfully.");
