const fs = require('fs');

const formOrig = fs.readFileSync('form_original.html', 'utf8');
const sectionRegex = /<section id="([^"]+)" class="form-section">[\s\S]*?<div class="card card-section[^>]*>([\s\S]*?)<\/div>\s*<\/section>/g;

let match;
let mergedContent = '<div class="card card-section p-4 p-md-5">\n';
let count = 0;

while ((match = sectionRegex.exec(formOrig)) !== null) {
    let innerContent = match[2].trim();
    // Some sections had their own actions? No, actions were outside the sections.
    mergedContent += innerContent + '\n<hr class="section-divider" />\n';
    count++;
}

// remove last hr
mergedContent = mergedContent.replace(/<hr class="section-divider" \/>\n$/, '');

const submitButtonHtml = `
<div class="mt-5 d-flex justify-content-end">
    <button type="button" class="btn btn-primary btn-lg px-5" id="reviewButton">
        Revisar Inscrição
    </button>
</div>
</div>`;

mergedContent += submitButtonHtml;

let targetHtml = fs.readFileSync('formulario.html', 'utf8');

// The target HTML has `<form id="cnhSocialForm"...> ... </form>`
const targetFormRegex = /(<form id="cnhSocialForm"[^>]*>)([\s\S]*?)<\/form>/;
targetHtml = targetHtml.replace(targetFormRegex, `$1\n${mergedContent}\n</form>`);

fs.writeFileSync('formulario.html', targetHtml, 'utf8');
console.log(`Successfully merged ${count} sections into a single card.`);
