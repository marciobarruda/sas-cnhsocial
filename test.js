
        function showSection(sectionId, linkElement) {
            document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            if (linkElement) {
                document.querySelectorAll('.sidebar .nav-link').forEach(link => link.classList.remove('active'));
                linkElement.classList.add('active');
            } else {
                const targetLink = document.querySelector(`.sidebar .nav-link[onclick*="'${sectionId}'"]`);
                if (targetLink) {
                    document.querySelectorAll('.sidebar .nav-link').forEach(link => link.classList.remove('active'));
                    targetLink.classList.add('active');
                }
            }

            if (sectionId === 'acompanhamento') {
                carregarPontuacao();
            }
        }

        async function carregarPontuacao() {
            const container = document.getElementById('pontuacao-container');
            const loading = document.getElementById('pontuacao-loading');
            const indisponivel = document.getElementById('pontuacao-indisponivel');
            const tabela = document.getElementById('tabela-criterios');
            const pontuacaoTotal = document.getElementById('pontuacao-total');
            const cpfCandidato = document.getElementById('cpf')?.value || '';
            
            container.style.display = 'none';
            indisponivel.style.display = 'none';
            loading.style.display = 'block';

            try {
                const response = await fetch('https://webhook-n8n-dev-conectarecife.recife.pe.gov.br/webhook/consultar-pontuacao', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cpf: cpfCandidato })
                });

                if (!response.ok) throw new Error("Erro na API");

                const data = await response.json();
                
                if (data && data.criterios && data.criterios.length > 0) {
                    tabela.innerHTML = '';
                    let somaTotal = 0;
                    
                    data.criterios.forEach(crit => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${crit.nome || crit.criterio}</td>
                            <td class="text-center">${crit.pontuacaoMaxima}</td>
                            <td class="text-center fw-bold text-primary">${crit.pontuacaoObtida}</td>
                        `;
                        tabela.appendChild(tr);
                        somaTotal += Number(crit.pontuacaoObtida) || 0;
                    });
                    
                    pontuacaoTotal.textContent = data.pontuacaoTotal !== undefined ? data.pontuacaoTotal : somaTotal;
                    
                    loading.style.display = 'none';
                    container.style.display = 'block';
                } else {
                    loading.style.display = 'none';
                    indisponivel.style.display = 'block';
                }

            } catch (err) {
                console.error("Erro ao carregar pontuação:", err);
                loading.style.display = 'none';
                indisponivel.style.display = 'block';
            }
        }

        const sectionNavLinksOriginal = Array.from(document.querySelectorAll(".sidebar .nav-link"));
        const formSteps = Array.from(document.querySelectorAll(".form-step"));
        let currentStepId = null;

        const getStepElementById = (stepId) => formSteps.find((step) => step.dataset.step === stepId);

        const sectionIdToStep = new Map();
        formSteps.forEach((step) => {
            const stepId = step.dataset.step;
            if (!stepId) return;
            step.querySelectorAll(".form-section[id]").forEach((section) => {
                sectionIdToStep.set(section.id, stepId);
            });
        });

        const setActiveStep = (stepId, { scroll = true, focusField = false, focusNav = false } = {}) => {
            if (!stepId) return;
            let activeStep = null;
            formSteps.forEach((step) => {
                const isActive = step.dataset.step === stepId;
                step.classList.toggle("is-active", isActive);
                step.hidden = !isActive;
                step.setAttribute("aria-hidden", isActive ? "false" : "true");
                if (isActive) {
                    activeStep = step;
                }
            });

            if (scroll && activeStep) {
                const wrapper = document.querySelector(".form-wrapper");
                if (wrapper && typeof wrapper.scrollIntoView === "function") {
                    wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }

            if (focusField && activeStep) {
                const focusable = activeStep.querySelector(
                    "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled])"
                );
                if (focusable && typeof focusable.focus === "function") {
                    focusable.focus();
                }
            }
            currentStepId = stepId;
            return activeStep;
        };

        const updateHashForStep = (stepId) => {
            if (!stepId) return;
            const step = getStepElementById(stepId);
            const primarySection = step?.querySelector(".form-section[id]");
            if (primarySection && primarySection.id) {
                if (typeof window.history?.replaceState === "function") {
                    window.history.replaceState(null, "", `#${primarySection.id}`);
                } else {
                    window.location.hash = primarySection.id;
                }
            }
        };

        const getStepByHash = (hash) => {
            if (!hash) return null;
            const cleaned = hash.startsWith("#") ? hash.slice(1) : hash;
            return sectionIdToStep.get(cleaned) || null;
        };

        const getFirstInvalidFieldElement = (invalidFields) => {
            for (const field of invalidFields) {
                if (field?.element && typeof field.element.focus === "function") {
                    return field.element;
                }
                if (Array.isArray(field?.groupElements)) {
                    const candidate = field.groupElements.find(
                        (item) => item && typeof item.focus === "function"
                    );
                    if (candidate) {
                        return candidate;
                    }
                }
            }
            return null;
        };

        const attemptStepChange = ({
            targetStepId,
            triggerElement = null,
            focusField = true,
            focusNav = false,
            scroll = true,
            updateHash = true,
        } = {}) => {
            if (!targetStepId) return;
            const currentId =
                currentStepId || formSteps.find((step) => step.classList.contains("is-active"))?.dataset.step;
            const currentNumber = Number.parseInt(currentId || "", 10);
            const targetNumber = Number.parseInt(targetStepId, 10);

            const proceedWithoutValidation =
                !Number.isFinite(currentNumber) || !Number.isFinite(targetNumber) || targetNumber <= currentNumber;

            const goToStep = () => {
                setActiveStep(targetStepId, { focusField, focusNav, scroll });
                if (updateHash) {
                    updateHashForStep(targetStepId);
                }
            };

            if (proceedWithoutValidation) {
                goToStep();
                return;
            }

            const currentStepElement = getStepElementById(currentId);
            if (!currentStepElement) {
                goToStep();
                return;
            }

            const extraErrors = validateAdditionalRules();
            const invalidFields = getInvalidFields(extraErrors, { stepElement: currentStepElement });

            if (invalidFields.length) {
                const focusTarget = getFirstInvalidFieldElement(invalidFields);
                showFeedbackModal({
                    type: "alert",
                    message: "Conclua os campos obrigatórios desta etapa antes de avançar.",
                    items: invalidFields.map((field) => field.label || "Campo obrigatório"),
                    focusElement: focusTarget,
                    triggerElement: triggerElement || null,
                });
                if (!updateHash) {
                    updateHashForStep(currentId);
                }
                return;
            }

        };
        
        window.navigateToStep = (stepId, element) => {
            attemptStepChange({ targetStepId: String(stepId), triggerElement: element });
        };

        if (formSteps.length) {
            formSteps.forEach((step, index) => {
                const isActive = step.classList.contains("is-active") || (!index && !document.querySelector(".form-step.is-active"));
                step.hidden = !isActive;
                step.setAttribute("aria-hidden", isActive ? "false" : "true");
            });

            const initialStep = getStepByHash(window.location.hash)
                || formSteps[0]?.dataset.step;

            if (initialStep) {
                setActiveStep(initialStep, { scroll: false });
            }

            // Sidebar links are handled by onclick="navigateToStep(...)" in HTML

            const stepActionButtons = Array.from(document.querySelectorAll(".step-actions__button[data-step-target]"));
            stepActionButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    const targetStep = button.dataset.stepTarget;
                    if (!targetStep) return;
                    attemptStepChange({ targetStepId: targetStep, triggerElement: button });
                });
            });

            window.addEventListener("hashchange", () => {
                const targetStep = getStepByHash(window.location.hash);
                if (targetStep) {
                    attemptStepChange({ targetStepId: targetStep, focusNav: true, focusField: false, updateHash: false });
                }
            });
        }

        const parseDateFromString = (value) => {
            if (!value && value !== 0) return null;
            if (value instanceof Date && !Number.isNaN(value.getTime())) {
                return value;
            }
            const stringValue = typeof value === "string" ? value.trim() : String(value || "").trim();
            if (!stringValue) return null;
            const isoMatch = stringValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (isoMatch) {
                const [, year, month, day] = isoMatch;
                const date = new Date(Number(year), Number(month) - 1, Number(day));
                return Number.isNaN(date.getTime()) ? null : date;
            }
            const brMatch = stringValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
            if (brMatch) {
                const [, day, month, year] = brMatch;
                const date = new Date(Number(year), Number(month) - 1, Number(day));
                return Number.isNaN(date.getTime()) ? null : date;
            }
            const timestamp = Date.parse(stringValue);
            if (!Number.isNaN(timestamp)) {
                return new Date(timestamp);
            }
            return null;
        };

        const formatDateToBrazil = (value) => {
            const date = parseDateFromString(value);
            if (!date) {
                return typeof value === "string" ? value : "";
            }
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const calculateAgeFromDate = (value) => {
            const birthDate = parseDateFromString(value);
            if (!birthDate) return null;
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age -= 1;
            }
            return age >= 0 ? age : null;
        };

        const formatElapsedTimeSinceDate = (value) => {
            if (typeof dayjs !== "function") {
                return "";
            }
            const referenceDate = parseDateFromString(value);
            if (!referenceDate) {
                return "";
            }
            const now = dayjs();
            const reference = dayjs(referenceDate);
            if (reference.isAfter(now)) {
                return "";
            }
            const years = now.diff(reference, "year");
            const afterYears = reference.add(years, "year");
            const months = now.diff(afterYears, "month");
            const afterMonths = afterYears.add(months, "month");
            const days = now.diff(afterMonths, "day");

            const formatUnit = (amount, singular, plural) => `${amount} ${amount === 1 ? singular : plural}`;
            return `${formatUnit(years, "ano", "anos")}, ${formatUnit(months, "mês", "meses")} e ${formatUnit(days, "dia", "dias")}`;
        };

        const parseCurrencyToNumber = (value) => {
            if (value == null) return Number.NaN;
            const normalized = value
                .toString()
                .replace(/[^0-9.,-]/g, "")
                .replace(/\.(?=\d{3}(\D|$))/g, "")
                .replace(/,/g, ".");
            return normalized ? Number.parseFloat(normalized) : Number.NaN;
        };

        const formatCurrencyBr = (value) => {
            const numberValue = typeof value === "number" ? value : parseCurrencyToNumber(value);
            if (Number.isNaN(numberValue)) return "";
            try {
                return numberValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
            } catch (error) {
                console.error("Falha ao formatar moeda", error);
                return numberValue.toString();
            }
        };

        const isAffirmativeValue = (value) => {
            if (value === true || value === 1) return true;
            const normalized = (value ?? "").toString().trim().toLowerCase();
            return normalized === "sim" || normalized === "true" || normalized === "1";
        };

        const normalizeAddressNumber = (value) => {
            const raw = (value ?? "").toString().trim();
            if (!raw) return "";
            if (/^s\/?n$/i.test(raw)) {
                return "S/N";
            }
            const withoutLeadingZeros = raw.replace(/^0+(?=\d)/, "");
            return withoutLeadingZeros || "0";
        };

        const formatProgramasSociaisValue = (rawValue, programName = "") => {
            const nome = (programName ?? "").toString().trim();
            if (rawValue == null || (typeof rawValue === "string" && rawValue.trim() === "")) {
                return "";
            }
            return isAffirmativeValue(rawValue) ? `SIM${nome ? `, ${nome}` : ""}` : "NÃO";
        };

        const prefillValues = {
            nomeCompleto: {{ JSON.stringify((($json.data || {}).nomeCompleto) || "") }},
        cpf: { { JSON.stringify((($json.data || {}).cpf) || "") } },
        nis: { { JSON.stringify((($json.data || {}).nis) || "") } },
        dataNascimento: { { JSON.stringify((($json.data || {}).dataNascimento) || "") } },
        genero: { { JSON.stringify((($json.data || {}).genero || "").toLowerCase()) } },
        nomeSocial: { { JSON.stringify((($json.data || {}).nomeSocial) || "") } },
        cep: { { JSON.stringify((($json.data || {}).cep) || "") } },
        logradouro: { { JSON.stringify((($json.data || {}).logradouro) || "") } },
        numero: { { JSON.stringify((($json.data || {}).numero) || "") } },
        complemento: { { JSON.stringify((($json.data || {}).complemento) || "") } },
        bairro: { { JSON.stringify((($json.data || {}).bairro) || "") } },
        cidade: { { JSON.stringify((($json.data || {}).cidade) || "") } },
        uf: { { JSON.stringify((($json.data || {}).uf) || "") } },
        enderecoAtualizado: { { JSON.stringify((($json.data || {}).enderecoAtualizado) || "") } },
        telefone: { { JSON.stringify((($json.data || {}).telefone) || "") } },
        email: { { JSON.stringify((($json.data || {}).email) || "") } },
        mulherChefe: { { JSON.stringify((($json.data || {}).mulherChefe) || "") } },
        acolhimento: { { JSON.stringify((($json.data || {}).acolhimento) || "") } },
        dependenteTratamento: { { JSON.stringify((($json.data || {}).dependenteTratamento) || "") } },
        rendaFamiliar: { { JSON.stringify((($json.data || {}).rendaPerCapita) || "") } },
        racaCor: { { JSON.stringify((($json.data || {}).racaCor || "").toLowerCase()) } },
        pcd: { { JSON.stringify((($json.data || {}).pcd) || "") } },
        maeAtipica: { { JSON.stringify((($json.data || {}).maeAtipica) || "") } },
        vitimaViolencia: { { JSON.stringify((($json.data || {}).vitimaViolencia) || "") } },
        necessidadesEspeciais: { { JSON.stringify((($json.data || {}).necessidadesEspeciais) || "") } },
        dataAtualizacaoCadunico: { { JSON.stringify((($json.data || {}).familiaDataAtualizacao) || "") } },
        semTrabalhoFormal: { { JSON.stringify((($json.data || {}).teveEmpregoCarteiraAssinada) || "") } },
        composicaoFamiliar: { { JSON.stringify((($json.data || {}).quantidadePessoaDomicilio) || "") } },
        programasSociais: { { JSON.stringify((($json.data || {}).programaBolsaFamilia) || "") } },
        programasSociaisNome: { { JSON.stringify((($json.data || {}).programaSocialNome || ($json.data || {}).programaBolsaFamiliaNome) || "") } },
      };
        const editableFields = ["cep", "logradouro", "numero", "complemento", "bairro", "cidade"];
        const cepInput = document.getElementById("cep");
        const numeroInput = document.getElementById("numero");
        const logradouroInput = document.getElementById("logradouro");
        const complementoInput = document.getElementById("complemento");
        const bairroInput = document.getElementById("bairro");
        const cidadeInput = document.getElementById("cidade");
        const ufSelect = document.getElementById("uf");
        const birthdateInput = document.getElementById("dataNascimento");
        const ageInput = document.getElementById("idade");
        const dataAtualizacaoInput = document.getElementById("dataAtualizacaoCadunico");
        const tempoAtualizacaoInput = document.getElementById("tempoAtualizacaoCadunico");
        const cepStatus = document.getElementById("cepStatus");
        let enderecoEdicaoAtiva = false;

        const escapeSelector = (value) => {
            const string = value == null ? "" : String(value);
            if (typeof window !== "undefined" && window.CSS && typeof window.CSS.escape === "function") {
                return window.CSS.escape(string);
            }
            const length = string.length;
            let index = -1;
            let result = "";
            let codeUnit;
            const firstCodeUnit = string.charCodeAt(0);
            while (++index < length) {
                codeUnit = string.charCodeAt(index);
                if (codeUnit === 0x0000) {
                    result += "\uFFFD";
                    continue;
                }
                if (
                    (codeUnit >= 0x0001 && codeUnit <= 0x001f) ||
                    codeUnit === 0x007f ||
                    (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
                    (index === 1 && codeUnit >= 0x0030 && codeUnit <= 0x0039 && firstCodeUnit === 0x002d)
                ) {
                    result += `\\${codeUnit.toString(16)} `;
                    continue;
                }
                if (index === 0 && codeUnit === 0x002d && length === 1) {
                    result += `\\${string.charAt(index)}`;
                    continue;
                }
                if (
                    codeUnit >= 0x0080 ||
                    codeUnit === 0x002d ||
                    codeUnit === 0x005f ||
                    (codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
                    (codeUnit >= 0x0041 && codeUnit <= 0x005a) ||
                    (codeUnit >= 0x0061 && codeUnit <= 0x007a)
                ) {
                    result += string.charAt(index);
                    continue;
                }
                result += `\\${string.charAt(index)}`;
            }
            return result;
        };

        const createMask = (element, options) => {
            if (typeof IMask === "function" && element) {
                try {
                    return IMask(element, options);
                } catch (error) {
                    console.error("Falha ao aplicar máscara", error);
                }
            }
            return null;
        };

        const maskCpf = createMask(document.getElementById("cpf"), { mask: "000.000.000-00" });
        const maskCep = createMask(cepInput, { mask: "00000-000" });
        const maskTelefone = createMask(document.getElementById("telefone"), {
            mask: "(00) 00000-0000",
        });

        const getCepDigits = () => {
            if (maskCep && typeof maskCep.unmaskedValue === "string") {
                return maskCep.unmaskedValue;
            }
            return (cepInput.value || "").replace(/\D/g, "");
        };

        if (numeroInput) {
            numeroInput.addEventListener("input", () => {
                if (numeroInput.readOnly) return;
                let value = numeroInput.value.toUpperCase();
                if (value.startsWith("S")) {
                    const length = Math.min(value.length, 3);
                    value = "S/N".slice(0, length === 0 ? 0 : Math.max(length, 1));
                } else {
                    value = value.replace(/[^0-9]/g, "");
                }
                numeroInput.value = value;
            });

            numeroInput.addEventListener("blur", () => {
                if (numeroInput.readOnly) return;
                if (/^S($|\/)$/.test(numeroInput.value)) {
                    numeroInput.value = "S/N";
                }
            });
        }

        const generoSelect = document.getElementById("genero");
        const generoHidden = document.getElementById("generoValor");
        const grupoMulherChefe = document.getElementById("grupoMulherChefe");
        const vitimaViolenciaWrapper = document.getElementById("vitimaViolenciaWrapper");
        const vitimaViolenciaSelect = document.getElementById("vitimaViolencia");

        const atualizarVitimaViolencia = () => {
            const generoAtual = (generoSelect?.value || generoHidden?.value || "").toLowerCase();
            const esconder = generoAtual === "masculino";
            if (vitimaViolenciaWrapper) {
                vitimaViolenciaWrapper.classList.toggle("d-none", esconder);
            }
            if (vitimaViolenciaSelect) {
                vitimaViolenciaSelect.disabled = esconder;
                if (esconder) {
                    vitimaViolenciaSelect.removeAttribute("required");
                    vitimaViolenciaSelect.value = "";
                } else {
                    vitimaViolenciaSelect.setAttribute("required", "required");
                }
            }
        };

        const atualizarGrupoMulherChefe = () => {
            const generoAtual = (generoSelect?.value || generoHidden?.value || "").toLowerCase();
            if (generoAtual === "feminino") {
                grupoMulherChefe.classList.remove("d-none");
            } else {
                grupoMulherChefe.classList.add("d-none");
                const mulherChefeInput = document.getElementById("mulherChefe");
                if (mulherChefeInput) {
                    mulherChefeInput.checked = false;
                }
            }
        };
        generoSelect?.addEventListener("change", () => {
            atualizarGrupoMulherChefe();
            atualizarVitimaViolencia();
        });
        atualizarGrupoMulherChefe();
        atualizarVitimaViolencia();

        const atualizarStatusCep = (mensagem, classe) => {
            if (!cepStatus) return;
            cepStatus.classList.remove("text-danger", "text-success", "text-muted");
            if (classe) {
                cepStatus.classList.add(classe);
            }
            cepStatus.textContent = mensagem;
        };

        const preencherEndereco = (dados) => {
            if (dados.street || dados.logradouro) logradouroInput.value = dados.street || dados.logradouro;
            if (dados.neighborhood || dados.bairro) bairroInput.value = dados.neighborhood || dados.bairro;
            if (dados.city || dados.localidade) cidadeInput.value = dados.city || dados.localidade;
            if (dados.complement || dados.complemento) complementoInput.value = dados.complement || dados.complemento;
            if (dados.state && ufSelect) {
                const possuiOpcao = Array.from(ufSelect.options).some((option) => option.value === dados.state);
                if (!possuiOpcao) {
                    const novaOpcao = document.createElement("option");
                    novaOpcao.value = dados.state;
                    novaOpcao.textContent = dados.state;
                    ufSelect.appendChild(novaOpcao);
                }
                ufSelect.value = dados.state;
            }
        };

        const consultarCepBrasilApi = async (cepLimpo) => {
            if (!cepLimpo || cepLimpo.length !== 8) return;
            atualizarStatusCep("Consultando CEP na BrasilAPI...", "text-muted");
            try {
                const resposta = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepLimpo}`);
                if (!resposta.ok) {
                    throw new Error("CEP não encontrado");
                }
                const endereco = await resposta.json();
                preencherEndereco(endereco);
                atualizarStatusCep("Endereço localizado automaticamente.", "text-success");
            } catch (erro) {
                atualizarStatusCep("Não foi possível localizar o CEP. Preencha os campos manualmente.", "text-danger");
                if (logradouroInput) {
                    logradouroInput.focus();
                }
            }
        };

        const preencherCidadePorCepSeNecessario = async () => {
            if (!cidadeInput || (cidadeInput.value || "").trim() !== "") {
                return;
            }
            const cepDigits = getCepDigits();
            if (cepDigits.length !== 8) {
                return;
            }
            try {
                const resposta = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepDigits}`);
                if (!resposta.ok) {
                    return;
                }
                const endereco = await resposta.json();
                const nomeCidade = endereco.city || endereco.localidade || endereco.city_name;
                if (nomeCidade && (cidadeInput.value || "").trim() === "") {
                    cidadeInput.value = nomeCidade;
                    cidadeInput.dispatchEvent(new Event("input", { bubbles: true }));
                    cidadeInput.dispatchEvent(new Event("change", { bubbles: true }));
                }
            } catch (error) {
                console.warn("Não foi possível complementar a cidade a partir do CEP carregado", error);
            }
        };

        const ativarEdicaoEndereco = () => {
            editableFields.forEach((fieldId) => {
                const field = document.getElementById(fieldId);
                if (!field) return;
                field.readOnly = false;
                field.removeAttribute("aria-readonly");
            });
            if (ufSelect) {
                ufSelect.disabled = false;
            }
            enderecoEdicaoAtiva = true;
            atualizarStatusCep("Informe o CEP e aguarde o preenchimento automático.", "text-muted");
            if (cepInput) {
                cepInput.focus();
            }
            updateSubmitState();
        };

        const desativarEdicaoEndereco = () => {
            editableFields.forEach((fieldId) => {
                const field = document.getElementById(fieldId);
                if (!field) return;
                field.readOnly = true;
                field.setAttribute("aria-readonly", "true");
            });
            if (ufSelect) {
                ufSelect.disabled = true;
            }
            enderecoEdicaoAtiva = false;
            if (cepStatus) {
                cepStatus.textContent = "";
            }
            updateSubmitState();
        };

        const handleCepAccept = () => {
            if (!enderecoEdicaoAtiva) return;
            if (getCepDigits().length < 8) {
                atualizarStatusCep("Digite o CEP completo para buscar automaticamente.", "text-muted");
            }
        };

        const handleCepComplete = () => {
            if (!enderecoEdicaoAtiva) return;
            const digits = getCepDigits();
            if (digits.length === 8) {
                consultarCepBrasilApi(digits);
            }
        };

        if (maskCep && typeof maskCep.on === "function") {
            maskCep.on("accept", handleCepAccept);
            maskCep.on("complete", handleCepComplete);
        } else if (cepInput) {
            cepInput.addEventListener("input", () => {
                handleCepAccept();
                handleCepComplete();
            });
        }

        const enforceAddressNumberFormatting = () => {
            if (!numeroInput) return;
            const normalized = normalizeAddressNumber(numeroInput.value);
            if (numeroInput.value !== normalized) {
                numeroInput.value = normalized;
            }
        };

        if (numeroInput) {
            numeroInput.addEventListener("blur", enforceAddressNumberFormatting);
            numeroInput.addEventListener("change", enforceAddressNumberFormatting);
        }

        const toggleFileSection = (condition, wrapperId) => {
            const wrapper = document.getElementById(wrapperId);
            if (!wrapper) return;
            if (condition) {
                wrapper.classList.remove("d-none");
            } else {
                wrapper.classList.add("d-none");
                const inputs = wrapper.querySelectorAll("input, select, textarea");
                inputs.forEach((input) => {
                    if (input.type === "checkbox" || input.type === "radio") {
                        input.checked = false;
                    } else if (input.type === "file") {
                        input.value = "";
                        const nameHolder = wrapper.querySelector(".file-name");
                        if (nameHolder) nameHolder.textContent = "";
                    } else {
                        input.value = "";
                    }
                    input.classList.remove("is-invalid");
                });
            }
            updateSubmitState();
        };

        const addFileNameListener = (inputId, displayId) => {
            const input = document.getElementById(inputId);
            const display = document.getElementById(displayId);
            if (!input || !display) return;
            input.addEventListener("change", () => {
                const file = input.files && input.files[0];
                display.textContent = file ? `Arquivo selecionado: ${file.name}` : "";
            });
        };

        [
            ["laudoPcd", "laudoPcdName"],
            ["docMaeAtipicaLaudo", "docMaeAtipicaLaudoName"],
            ["docMaeAtipicaCras", "docMaeAtipicaCrasName"],
            ["docResponsavel", "docResponsavelName"],
            ["docDependente", "docDependenteName"],
            ["docDependenteVinculo", "docDependenteVinculoName"],
            ["docTrabalhoAplicativo", "docTrabalhoAplicativoName"],
            ["docResidencia", "docResidenciaName"],
            ["docIdentidade", "docIdentidadeName"],
            ["cnhArquivo", "cnhArquivoName"],
        ].forEach(([inputId, displayId]) => addFileNameListener(inputId, displayId));

        const pcdSelect = document.getElementById("pcd");
        pcdSelect.addEventListener("change", () => {
            toggleFileSection(pcdSelect.value === "sim", "laudoPcdWrapper");
        });

        const maeAtipica = document.getElementById("maeAtipica");
        maeAtipica.addEventListener("change", () => {
            const ativo = maeAtipica.value === "sim";
            toggleFileSection(ativo, "docMaeAtipicaLaudoWrapper");
            toggleFileSection(ativo, "docMaeAtipicaCrasWrapper");
            toggleFileSection(ativo, "docResponsavelWrapper");
        });

        const trabalhadorAplicativo = document.getElementById("trabalhadorAplicativo");
        const updateTrabalhadorAplicativoVisibility = () => {
            const ativo = (trabalhadorAplicativo?.value || "").toLowerCase() === "sim";
            toggleFileSection(ativo, "docTrabalhoAplicativoWrapper");
        };
        if (trabalhadorAplicativo) {
            trabalhadorAplicativo.addEventListener("change", updateTrabalhadorAplicativoVisibility);
        }

        const vitimaViolencia = document.getElementById("vitimaViolencia");

        const acolhimento = document.getElementById("acolhimento");

        const dependenteTratamento = document.getElementById("dependenteTratamento");
        dependenteTratamento.addEventListener("change", () => {
            toggleFileSection(dependenteTratamento.checked, "docDependenteWrapper");
            toggleFileSection(dependenteTratamento.checked, "docDependenteVinculoWrapper");
        });

        const enderecoAtualizado = document.getElementById("enderecoAtualizado");
        enderecoAtualizado.addEventListener("change", () => {
            toggleFileSection(enderecoAtualizado.checked, "docResidenciaWrapper");
            if (enderecoAtualizado.checked) {
                ativarEdicaoEndereco();
            } else {
                desativarEdicaoEndereco();
            }
            const label = document.getElementById("docResidenciaLabel");
            if (!label) return;
            if (enderecoAtualizado.checked) {
                label.classList.add("required");
            } else {
                label.classList.remove("required");
            }
        });

        const categoriaSelect = document.getElementById("categoria");
        categoriaSelect.addEventListener("change", () => {
            const isAdicao = ["adicao_a", "adicao_b"].includes(categoriaSelect.value);
            toggleFileSection(isAdicao, "cnhNumeroWrapper");
            toggleFileSection(isAdicao, "cnhValidadeWrapper");
            toggleFileSection(isAdicao, "cnhArquivoWrapper");
        });

        const aplicarMaiusculas = () => {
            const campos = document.querySelectorAll('input[type="text"], textarea');
            campos.forEach((campo) => {
                const atualizarValor = () => {
                    const inicio = campo.selectionStart;
                    const fim = campo.selectionEnd;
                    campo.value = (campo.value || "").toUpperCase();
                    if (inicio != null && fim != null) {
                        campo.setSelectionRange(inicio, fim);
                    }
                };
                atualizarValor();
                campo.addEventListener("input", atualizarValor);
            });
        };

        const desbloquearEmails = () => {
            const emails = [document.getElementById("email"), document.getElementById("emailConfirm")].filter(Boolean);
            emails.forEach((campo) => {
                campo.readOnly = false;
                campo.removeAttribute("readonly");
                campo.removeAttribute("aria-readonly");
                campo.disabled = false;
                campo.removeAttribute("disabled");
                campo.classList.remove("disabled");
                campo.style.pointerEvents = "auto";
            });
            return emails;
        };

        const aplicarMinusculasEmail = () => {
            const emails = desbloquearEmails();
            emails.forEach((campo) => {
                const atualizarValor = () => {
                    const inicio = campo.selectionStart;
                    const fim = campo.selectionEnd;
                    campo.value = (campo.value || "").toLowerCase();
                    if (inicio != null && fim != null) {
                        campo.setSelectionRange(inicio, fim);
                    }
                };
                atualizarValor();
                campo.addEventListener("input", atualizarValor);
            });
        };

        aplicarMaiusculas();
        aplicarMinusculasEmail();

        const cpfInput = document.getElementById("cpf");
        const emailInput = document.getElementById("email");
        const emailConfirmInput = document.getElementById("emailConfirm");

        const applyEmailConfirmationFeedback = (isMatch) => {
            if (!emailInput || !emailConfirmInput) return;
            [emailInput, emailConfirmInput].forEach((field) => {
                field.classList.remove("is-valid", "is-invalid");
                field.removeAttribute("aria-invalid");
            });
            clearFieldError(emailConfirmInput);
            if (isMatch === true) {
                emailInput.classList.add("is-valid");
                emailConfirmInput.classList.add("is-valid");
                return;
            }
            if (isMatch === false) {
                showFieldError(emailConfirmInput, "Os e-mails informados não são iguais.");
                emailConfirmInput.classList.add("is-invalid");
                emailConfirmInput.setAttribute("aria-invalid", "true");
            }
        };

        const clearEmailConfirmationField = () => {
            if (!emailConfirmInput) return false;
            const emailValue = (emailInput?.value || "").trim();
            const confirmValue = (emailConfirmInput.value || "").trim();
            if (!emailValue || !confirmValue) {
                applyEmailConfirmationFeedback(null);
                return false;
            }
            const isMatch = emailValue.toLowerCase() === confirmValue.toLowerCase();
            applyEmailConfirmationFeedback(isMatch);
            return !isMatch;
        };

        const enforceEmailConfirmationConsistency = () => {
            if (!emailInput || !emailConfirmInput) return;
            const resetIfMismatch = () => {
                clearEmailConfirmationField();
            };
            emailConfirmInput.addEventListener("input", resetIfMismatch);
            emailConfirmInput.addEventListener("blur", resetIfMismatch);
            emailConfirmInput.addEventListener("change", resetIfMismatch);
            emailInput.addEventListener("change", () => {
                if ((emailConfirmInput.value || "").trim()) {
                    resetIfMismatch();
                }
            });
            emailInput.addEventListener("input", () => {
                if ((emailConfirmInput.value || "").trim()) {
                    resetIfMismatch();
                }
            });
        };

        const cpfValidator = (value) => {
            const digits = value.replace(/\D/g, "");
            if (digits.length !== 11 || /^([0-9])\1+$/.test(digits)) return false;
            let sum = 0;
            for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i), 10) * (10 - i);
            let firstDigit = (sum * 10) % 11;
            if (firstDigit === 10) firstDigit = 0;
            if (firstDigit !== parseInt(digits.charAt(9), 10)) return false;
            sum = 0;
            for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i), 10) * (11 - i);
            let secondDigit = (sum * 10) % 11;
            if (secondDigit === 10) secondDigit = 0;
            return secondDigit === parseInt(digits.charAt(10), 10);
        };

        const form = document.getElementById("cnhSocialForm");
        const submitButton = document.getElementById("submitButton");
        const submissionEndpoint =
            "https://webhook-n8n-dev-conectarecife.recife.pe.gov.br/webhook/6cb0dfd2-7c35-recebimentocnhsocial";
        let validation;
        let submitAttempted = false;

        const setSubmittingState = (isSubmitting) => {
            submitButton.toggleAttribute("disabled", isSubmitting);
            submitButton.setAttribute("aria-busy", isSubmitting ? "true" : "false");
        };

        const applyCurrencySubmissionValues = (formData) => {
            if (!formData || typeof formData.set !== "function") return;
            const rendaInput = document.getElementById("rendaFamiliar");
            const rendaValue = rendaInput ? rendaInput.value || rendaInput.dataset.rawValue || "" : "";
            const numeric = parseCurrencyToNumber(rendaValue);
            if (!Number.isNaN(numeric)) {
                formData.set("rendaFamiliar", numeric.toString());
            }
        };

        const isReadonlyElement = (element) => {
            if (!element) return false;
            return (
                element.readOnly === true ||
                element.getAttribute("aria-readonly") === "true" ||
                element.classList.contains("readonly-control")
            );
        };

        const isReadonlyAndEmpty = (element) => {
            if (!isReadonlyElement(element)) return false;
            const value = (element.value || "").trim();
            return value === "";
        };

        const relaxReadonlyEmptyFields = () => {
            const selectors = ["[readonly]", '[aria-readonly="true"]', ".readonly-control"];
            const processed = new Set();
            selectors.forEach((selector) => {
                form.querySelectorAll(selector).forEach((element) => {
                    if (!element || processed.has(element)) return;
                    processed.add(element);
                    if (!isReadonlyAndEmpty(element)) return;
                    element.removeAttribute("required");
                    element.removeAttribute("aria-required");
                    if (element.dataset && element.dataset.requiredField === "true") {
                        delete element.dataset.requiredField;
                    }
                    if (element.id) {
                        const label = form.querySelector(`label[for="${escapeSelector(element.id)}"]`);
                        if (label) {
                            label.classList.remove("required");
                        }
                    }
                });
            });
        };

        const isElementVisible = (element) => {
            if (!element) return false;
            if (element.hidden) return false;
            if (element.getAttribute && element.getAttribute("aria-hidden") === "true") return false;
            if (element.type === "hidden") return false;
            let current = element;
            while (current && current !== document.body) {
                if (current.hasAttribute && current.hasAttribute("hidden")) {
                    return false;
                }
                if (current.getAttribute && current.getAttribute("aria-hidden") === "true") {
                    return false;
                }
                if (current.classList && current.classList.contains("d-none")) {
                    return false;
                }
                if (typeof window !== "undefined" && window.getComputedStyle) {
                    const styles = window.getComputedStyle(current);
                    if (styles.display === "none" || styles.visibility === "hidden") {
                        return false;
                    }
                }
                current = current.parentElement;
            }
            if (typeof element.getClientRects === "function" && element.getClientRects().length === 0) {
                return false;
            }
            return true;
        };

        const isInInactiveStep = (element) => {
            if (!element) return false;
            const parentStep = element.closest(".form-step");
            if (!parentStep) return false;
            return !parentStep.classList.contains("is-active");
        };

        const isFieldFilled = (element, { bypassVisibilityCheck = false } = {}) => {
            if (!element) return true;
            if (!bypassVisibilityCheck && !isElementVisible(element)) return true;
            if (element.disabled) return true;
            if (element.type === "checkbox" || element.type === "radio") {
                if (element.checked) return true;
                const group = element.name
                    ? form.querySelectorAll(`[name="${escapeSelector(element.name)}"]`)
                    : [];
                if (group.length) {
                    return Array.from(group).some((input) => input.checked);
                }
                return false;
            }
            if (element.type === "file") {
                return element.files && element.files.length > 0;
            }
            const value = element.value != null ? String(element.value).trim() : "";
            return value.length > 0;
        };

        const setSubmitButtonState = (isReady) => {
            submitButton.setAttribute("data-ready", isReady ? "true" : "false");
            submitButton.setAttribute("aria-disabled", isReady ? "false" : "true");
            submitButton.classList.toggle("is-disabled", !isReady);
        };

        setSubmitButtonState(false);
        const createFeedbackModal = (() => {
            let modalElements = null;
            return () => {
                if (modalElements) {
                    return modalElements;
                }
                const backdrop = document.createElement("div");
                backdrop.className = "modal-backdrop";
                backdrop.dataset.feedbackModal = "true";
                backdrop.setAttribute("data-testid", "modal");
                backdrop.setAttribute("hidden", "");

                const card = document.createElement("div");
                card.className = "modal-card";
                card.setAttribute("role", "dialog");
                card.setAttribute("aria-modal", "true");
                card.setAttribute("aria-labelledby", "modalTitle");
                card.setAttribute("aria-describedby", "modalMessage");
                card.tabIndex = -1;

                const closeIconButton = document.createElement("button");
                closeIconButton.type = "button";
                closeIconButton.className = "modal-close-button";
                closeIconButton.setAttribute("aria-label", "Fechar modal");
                closeIconButton.innerHTML = "&times;";

                const title = document.createElement("p");
                title.className = "modal-title";
                title.id = "modalTitle";
                title.setAttribute("data-testid", "modal-title");

                const emojiSpan = document.createElement("span");
                emojiSpan.setAttribute("aria-hidden", "true");

                const titleText = document.createElement("span");

                title.append(emojiSpan, titleText);

                const message = document.createElement("p");
                message.className = "modal-message";
                message.id = "modalMessage";

                const list = document.createElement("ul");
                list.className = "modal-list";
                list.setAttribute("data-testid", "lista-faltantes");

                const actions = document.createElement("div");
                actions.className = "modal-actions";

                const closeButton = document.createElement("button");
                closeButton.type = "button";
                closeButton.className = "btn btn-primary";
                closeButton.textContent = "Fechar";

                actions.append(closeButton);
                card.append(closeIconButton, title, message, list, actions);
                backdrop.append(card);
                document.body.append(backdrop);

                modalElements = {
                    backdrop,
                    card,
                    closeIconButton,
                    closeButton,
                    emojiSpan,
                    titleText,
                    message,
                    list,
                };
                return modalElements;
            };
        })();

        let activeModal = null;
        let allowExternalFocusElement = null;
        let consentModalShown = false;
        let successCountdownInterval = null;
        let successRedirectTimeout = null;
        const successRedirectUrl = "https://cnhrecife.recife.pe.gov.br/";

        const clearSuccessRedirectTimers = () => {
            if (successCountdownInterval) {
                clearInterval(successCountdownInterval);
                successCountdownInterval = null;
            }
            if (successRedirectTimeout) {
                clearTimeout(successRedirectTimeout);
                successRedirectTimeout = null;
            }
        };

        const getModalFocusableElements = (container) =>
            Array.from(
                container.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
            ).filter((element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden"));

        const handleModalKeydown = (event) => {
            if (!activeModal) return;
            if (event.key === "Escape") {
                event.preventDefault();
                if (activeModal.allowEscape === false) {
                    return;
                }
                activeModal.close();
                return;
            }
            if (event.key !== "Tab") {
                return;
            }
            const focusable = getModalFocusableElements(activeModal.card);
            if (!focusable.length) {
                event.preventDefault();
                activeModal.card.focus({ preventScroll: true });
                return;
            }
            const currentIndex = focusable.indexOf(document.activeElement);
            let nextIndex = 0;
            if (event.shiftKey) {
                nextIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
            } else {
                nextIndex = currentIndex === focusable.length - 1 ? 0 : currentIndex + 1;
            }
            event.preventDefault();
            focusable[nextIndex].focus({ preventScroll: true });
        };

        const handleModalFocusIn = (event) => {
            if (!activeModal) return;
            const { card } = activeModal;
            if (card.contains(event.target)) {
                return;
            }
            if (allowExternalFocusElement && event.target === allowExternalFocusElement) {
                return;
            }
            const focusable = getModalFocusableElements(card);
            const target = focusable[0] || card;
            target.focus({ preventScroll: true });
        };

        const closeModal = () => {
            if (!activeModal) return;
            const { backdrop, returnFocusElement, cleanup } = activeModal;
            if (typeof cleanup === "function") {
                cleanup();
            }
            backdrop.classList.remove("is-open");
            backdrop.setAttribute("hidden", "");
            document.removeEventListener("keydown", handleModalKeydown, true);
            document.removeEventListener("focusin", handleModalFocusIn, true);
            document.body.style.removeProperty("overflow");
            allowExternalFocusElement = null;
            activeModal = null;
            if (returnFocusElement && typeof returnFocusElement.focus === "function") {
                returnFocusElement.focus({ preventScroll: true });
            }
        };

        const availabilityOverlay = document.createElement("div");
        availabilityOverlay.id = "availabilityOverlay";
        availabilityOverlay.className = "availability-overlay";
        availabilityOverlay.setAttribute("aria-hidden", "true");
        document.body.append(availabilityOverlay);

        const availabilityStart = dayjs("2026-03-18T00:00:00");
        const availabilityEnd = dayjs("2026-04-30T23:59:59");
        let availabilityWatcher = null;

        const getAvailabilityState = () => {
            const now = dayjs();
            if (!availabilityStart.isValid() || !availabilityEnd.isValid() || !now.isValid()) {
                return { status: "unknown", target: null };
            }
            if (now.isBefore(availabilityStart)) {
                return { status: "before", target: availabilityStart };
            }
            if (now.isAfter(availabilityEnd)) {
                return { status: "after", target: null };
            }
            return { status: "open", target: availabilityEnd };
        };

        const isWithinAvailabilityWindow = () => {
            const state = getAvailabilityState();
            return state.status === "open";
        };

        const toggleAvailabilityOverlay = (shouldLock) => {
            if (!availabilityOverlay) return;
            availabilityOverlay.classList.toggle("is-active", shouldLock);
        };

        const formatAvailabilityCountdown = (target) => {
            if (!target || typeof target.isValid !== "function" || !target.isValid()) {
                return "00d 00h 00m 00s";
            }
            const now = dayjs();
            let totalSeconds = Math.max(0, target.diff(now, "second"));
            const days = Math.floor(totalSeconds / 86400);
            totalSeconds -= days * 86400;
            const hours = Math.floor(totalSeconds / 3600);
            totalSeconds -= hours * 3600;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds - minutes * 60;
            const pad = (value) => String(value).padStart(2, "0");
            return `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
        };

        const applyAvailabilityState = () => {
            const state = getAvailabilityState();
            const locked = state.status !== "open";
            toggleAvailabilityOverlay(locked);
            if (locked) {
                setSubmitButtonState(false);
            }
            return state;
        };

        const createAvailabilityModal = (() => {
            let modalElements = null;
            return () => {
                if (modalElements) {
                    return modalElements;
                }

                const backdrop = document.createElement("div");
                backdrop.className = "modal-backdrop";
                backdrop.dataset.availabilityModal = "true";
                backdrop.setAttribute("data-testid", "availability-modal");
                backdrop.setAttribute("hidden", "");

                const card = document.createElement("div");
                card.className = "modal-card";
                card.setAttribute("role", "dialog");
                card.setAttribute("aria-modal", "true");
                card.setAttribute("aria-labelledby", "availabilityTitle");
                card.setAttribute("aria-describedby", "availabilityMessage availabilityCountdown");
                card.tabIndex = -1;

                const title = document.createElement("p");
                title.className = "modal-title";
                title.id = "availabilityTitle";

                const windowMessage = document.createElement("p");
                windowMessage.className = "availability-meta";
                windowMessage.id = "availabilityMessage";

                const countdown = document.createElement("p");
                countdown.className = "availability-countdown";
                countdown.id = "availabilityCountdown";
                countdown.setAttribute("aria-live", "polite");

                const actions = document.createElement("div");
                actions.className = "modal-actions";

                const okButton = document.createElement("button");
                okButton.type = "button";
                okButton.className = "btn btn-primary";
                okButton.textContent = "Ok, entendi";

                actions.append(okButton);
                card.append(title, windowMessage, countdown, actions);
                backdrop.append(card);
                document.body.append(backdrop);

                modalElements = { backdrop, card, title, windowMessage, countdown, okButton };
                return modalElements;
            };
        })();

        const setAvailabilityModalContent = (state) => {
            const { title, windowMessage, countdown } = createAvailabilityModal();
            const rangeText = "Período disponível: 18/03/2026 às 00:00 até 30/04/2026 às 23:59:59";
            let message = rangeText;
            let icon = "⏰";
            if (state.status === "before") {
                icon = "🚦";
                message = `🚦 As inscrições abrirão em 18/03/2026 às 00:00. ${rangeText}`;
            } else if (state.status === "after") {
                icon = "⛔";
                message = `⛔ Período encerrado em 30/04/2026 às 23:59:59.`;
            } else if (state.status === "open") {
                icon = "✅";
                message = `✅ Inscrições abertas até 30/04/2026 às 23:59:59.`;
            }
            title.textContent = `${icon} Período de inscrições`;
            windowMessage.textContent = message;
            countdown.textContent = `⏳ Contagem regressiva: ${formatAvailabilityCountdown(state.target)}`;
        };

        const openAvailabilityModal = (onClose = null) => {
            const state = applyAvailabilityState();
            if (state.status === "open") {
                return;
            }

            const { backdrop, card, okButton } = createAvailabilityModal();
            setAvailabilityModalContent(state);
            const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;

            const handleClose = () => {
                closeModal();
                if (typeof onClose === "function") {
                    onClose();
                }
            };

            const cleanup = () => {
                okButton.removeEventListener("click", handleClose);
            };

            okButton.addEventListener("click", handleClose);

            backdrop.removeAttribute("hidden");
            backdrop.classList.add("is-open");
            document.body.style.overflow = "hidden";

            activeModal = {
                backdrop,
                card,
                close: closeModal,
                cleanup,
                returnFocusElement: previousActive,
                allowEscape: false,
            };

            const focusable = getModalFocusableElements(card);
            const initialFocusTarget = focusable[0] || card;
            requestAnimationFrame(() => {
                initialFocusTarget.focus({ preventScroll: true });
            });

            document.addEventListener("keydown", handleModalKeydown, true);
            document.addEventListener("focusin", handleModalFocusIn, true);
        };


        const createConsentModal = (() => {
            let modalElements = null;
            return () => {
                if (modalElements) {
                    return modalElements;
                }

                const backdrop = document.createElement("div");
                backdrop.className = "modal-backdrop";
                backdrop.dataset.consentModal = "true";
                backdrop.setAttribute("data-testid", "consent-modal");
                backdrop.setAttribute("hidden", "");

                const card = document.createElement("div");
                card.className = "modal-card";
                card.setAttribute("role", "dialog");
                card.setAttribute("aria-modal", "true");
                card.setAttribute("aria-labelledby", "consentModalTitle");
                card.setAttribute("aria-describedby", "consentModalMessage");
                card.tabIndex = -1;

                const title = document.createElement("p");
                title.className = "modal-title title--alerta";
                title.id = "consentModalTitle";
                title.textContent = "Uso de dados do CadÚnico";

                const message = document.createElement("p");
                message.className = "modal-message";
                message.id = "consentModalMessage";
                message.textContent =
                    "Os dados do CadÚnico Recife serão utilizados para preencher automaticamente partes do formulário.";

                const actions = document.createElement("div");
                actions.className = "modal-actions";

                const okButton = document.createElement("button");
                okButton.type = "button";
                okButton.className = "btn btn-primary";
                okButton.textContent = "OK";

                actions.append(okButton);
                card.append(title, message, actions);
                backdrop.append(card);
                document.body.append(backdrop);

                modalElements = { backdrop, card, okButton };
                return modalElements;
            };
        })();

        const openConsentModal = () => {
            consentModalShown = true;
            const { backdrop, card, okButton } = createConsentModal();
            const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;

            const closeHandler = () => closeModal();

            const cleanup = () => {
                okButton.removeEventListener("click", closeHandler);
            };

            okButton.addEventListener("click", closeHandler);

            backdrop.removeAttribute("hidden");
            backdrop.classList.add("is-open");
            document.body.style.overflow = "hidden";

            activeModal = {
                backdrop,
                card,
                close: closeModal,
                cleanup,
                returnFocusElement: previousActive,
                allowEscape: false,
            };

            const focusable = getModalFocusableElements(card);
            const initialFocusTarget = focusable[0] || card;
            requestAnimationFrame(() => {
                initialFocusTarget.focus({ preventScroll: true });
            });

            document.addEventListener("keydown", handleModalKeydown, true);
            document.addEventListener("focusin", handleModalFocusIn, true);
        };

        const triggerConsentIfNeeded = () => {
            if (consentModalShown) return;
            if (!isWithinAvailabilityWindow()) return;
            openConsentModal();
        };

        const syncAvailabilityState = () => {
            const state = applyAvailabilityState();
            if (activeModal?.backdrop?.dataset.availabilityModal === "true") {
                setAvailabilityModalContent(state);
            }
            if (state.status === "open") {
                triggerConsentIfNeeded();
            }
        };

        const startAvailabilityWatcher = () => {
            syncAvailabilityState();
            if (availabilityWatcher) {
                clearInterval(availabilityWatcher);
            }
            availabilityWatcher = setInterval(syncAvailabilityState, 1000);
        };

        const showFeedbackModal = ({ type, message, items = [], focusElement = null, triggerElement = submitButton }) => {
            const {
                backdrop,
                card,
                closeIconButton,
                closeButton,
                emojiSpan,
                titleText,
                message: messageElement,
                list,
            } = createFeedbackModal();

            const isSuccess = type === "success";
            clearSuccessRedirectTimers();
            messageElement.textContent = message;

            if (isSuccess) {
                const lineBreak = document.createElement("br");
                const countdownLabel = document.createElement("span");
                countdownLabel.textContent = "Redirecionando para o portal CNH Recife em ";
                const countdownValue = document.createElement("strong");
                const countdownSuffix = document.createElement("span");
                countdownSuffix.textContent = "...";

                let remainingSeconds = 5;
                const updateCountdown = (value) => {
                    countdownValue.textContent = `${value}s`;
                };
                updateCountdown(remainingSeconds);

                messageElement.append(lineBreak, countdownLabel, countdownValue, countdownSuffix);

                successCountdownInterval = setInterval(() => {
                    remainingSeconds -= 1;
                    if (remainingSeconds >= 0) {
                        updateCountdown(remainingSeconds);
                    } else {
                        clearSuccessRedirectTimers();
                    }
                }, 1000);

                successRedirectTimeout = setTimeout(() => {
                    window.location.href = successRedirectUrl;
                }, 5000);
            }
            list.innerHTML = "";
            if (items.length && !isSuccess) {
                list.hidden = false;
                items.forEach((item) => {
                    const li = document.createElement("li");
                    li.textContent = item;
                    list.appendChild(li);
                });
            } else {
                list.hidden = true;
            }

            emojiSpan.textContent = isSuccess ? "✅" : "⚠️";
            titleText.textContent = isSuccess ? "Sucesso" : "Alerta";
            titleText.classList.remove("title--sucesso", "title--alerta");
            titleText.classList.add(isSuccess ? "title--sucesso" : "title--alerta");

            const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            backdrop.removeAttribute("hidden");
            backdrop.classList.add("is-open");
            document.body.style.overflow = "hidden";

            allowExternalFocusElement = type === "alert" ? focusElement || null : null;
            activeModal = {
                backdrop,
                card,
                close: closeModal,
                returnFocusElement: !isSuccess && focusElement ? focusElement : triggerElement || previousActive,
            };

            const focusable = getModalFocusableElements(card);
            const initialFocusTarget = focusable[0] || card;
            requestAnimationFrame(() => {
                initialFocusTarget.focus({ preventScroll: true });
            });

            if (type === "alert" && focusElement) {
                focusElement.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => {
                    if (focusElement && typeof focusElement.focus === "function") {
                        focusElement.focus({ preventScroll: true });
                    }
                }, 400);
            }

            const closeHandler = () => closeModal();
            const onBackdropClick = (event) => {
                if (event.target === backdrop) {
                    closeModal();
                }
            };

            const cleanup = () => {
                closeIconButton.removeEventListener("click", closeHandler);
                closeButton.removeEventListener("click", closeHandler);
                backdrop.removeEventListener("click", onBackdropClick);
            };

            closeIconButton.addEventListener("click", closeHandler);
            closeButton.addEventListener("click", closeHandler);
            backdrop.addEventListener("click", onBackdropClick);

            activeModal.cleanup = cleanup;

            document.addEventListener("keydown", handleModalKeydown, true);
            document.addEventListener("focusin", handleModalFocusIn, true);
        };

        const fieldLabels = {
            "#cpf": "CPF",
            "#genero": "Identificação de gênero",
            "#telefone": "Telefone/WhatsApp",
            "#email": "E-mail",
            "#emailConfirm": "Confirmação de e-mail",
            "#preferenciaContato": "Canal de contato preferencial",
            "#cep": "CEP",
            "#logradouro": "Logradouro",
            "#numero": "Número do endereço",
            "#bairro": "Bairro",
            "#cidade": "Cidade",
            "#rendaFamiliar": "Renda per capita mensal",
            "#pcd": "Pessoa com deficiência (PCD)",
            "#maeAtipica": "Responsável legal por pessoa PCD/TEA",
            "#vitimaViolencia": "Vínculo com serviços especializados de violência doméstica",
            "#racaCor": "Autodeclaração de cor/raça",
            "#racaCorValor": "Autodeclaração de cor/raça",
            "#categoria": "Categoria desejada",
            "#docIdentidade": "Documento de identificação oficial",
            "#lgpd": "Consentimento LGPD",
            "#veracidade": "Declaração de veracidade",
            "#imagem": "Consentimento de uso de imagem",
            "#docResidencia": "Comprovante de residência",
            "#laudoPcd": "Laudo médico PCD",
            "#docMaeAtipicaLaudo": "Laudo ou relatório para pais/mães atípicos",
            "#docMaeAtipicaCras": "Declaração técnica do CRAS/CREAS",
            "#docResponsavel": "Declaração técnica de responsabilidade legal",
            "#docDependente": "Declaração de tratamento terapêutico contínuo",
            "#docDependenteVinculo": "Comprovação de vínculo do dependente",
            "#docTrabalhoAplicativo": "Comprovante de trabalho por aplicativo",
            "#numeroCnh": "Número da CNH",
            "#validadeCnh": "Validade da CNH",
            "#cnhArquivo": "Arquivo da CNH",
        };

        const humanizeName = (value) =>
            value
                .split(/[_-]+/)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ");

        const getFieldLabel = (selector) => {
            if (fieldLabels[selector]) {
                return fieldLabels[selector];
            }
            let element;
            try {
                element = form.querySelector(selector);
            } catch (error) {
                element = null;
            }
            if (element) {
                if (element.id) {
                    const associatedLabel = form.querySelector(`label[for="${element.id}"]`);
                    if (associatedLabel) {
                        return associatedLabel.textContent.trim();
                    }
                }
                const ariaLabel = element.getAttribute("aria-label");
                if (ariaLabel) {
                    return ariaLabel.trim();
                }
                const placeholder = element.getAttribute("placeholder");
                if (placeholder) {
                    return placeholder.trim();
                }
                if (element.name) {
                    return humanizeName(element.name);
                }
            }
            return selector;
        };

        const getElementKey = (element) => {
            if (!element) return null;
            return element.id || element.name || null;
        };

        const getRequiredElements = () => {
            const elements = new Set();
            form.querySelectorAll("input[required], select[required], textarea[required]").forEach((item) => {
                elements.add(item);
            });
            form.querySelectorAll("[data-required-field=\"true\"]").forEach((item) => {
                elements.add(item);
            });
            return Array.from(elements);
        };

        const highlightRequiredFieldIfEmpty = (element) => {
            if (!element) return;
            const isRequired = element.hasAttribute("required") || element.dataset.requiredField === "true";
            if (!isRequired) return;
            const shouldHighlight = !isFieldFilled(element, { bypassVisibilityCheck: true });
            if (shouldHighlight) {
                element.classList.add("is-invalid");
                element.setAttribute("aria-invalid", "true");
            } else {
                element.classList.remove("is-invalid");
                element.removeAttribute("aria-invalid");
            }
        };

        const attachRequiredFieldFocusHandlers = () => {
            getRequiredElements().forEach((element) => {
                if (!element || element.dataset.requiredFieldHandler === "true") {
                    return;
                }
                element.dataset.requiredFieldHandler = "true";
                element.addEventListener("focus", () => {
                    highlightRequiredFieldIfEmpty(element);
                });
                const clearHighlightIfFilled = () => {
                    if (isFieldFilled(element, { bypassVisibilityCheck: true })) {
                        element.classList.remove("is-invalid");
                        element.removeAttribute("aria-invalid");
                    }
                };
                element.addEventListener("input", clearHighlightIfFilled);
                element.addEventListener("change", clearHighlightIfFilled);
                element.addEventListener("blur", clearHighlightIfFilled);
            });
        };

        const getGroupElements = (name) =>
            Array.from(form.querySelectorAll(`[name='${escapeSelector(name)}']`));

        const clearFieldError = (element) => {
            const key = getElementKey(element);
            if (!key) return;
            if (element && (element.type === "checkbox" || element.type === "radio")) {
                const group = element.name ? getGroupElements(element.name) : [element];
                group.forEach((input) => {
                    input.classList.remove("is-invalid", "js-validate-error-field");
                });
            } else if (element) {
                element.classList.remove("is-invalid", "js-validate-error-field");
            }
            form.querySelectorAll(`.error-text[data-error-for='${escapeSelector(key)}']`).forEach((node) => node.remove());
        };

        const showFieldError = (element, message, groupElements = null) => {
            if (!element) return;
            const key = getElementKey(element);
            if (!key) return;
            const targets = Array.isArray(groupElements) && groupElements.length ? groupElements : [element];
            targets.forEach((target) => target.classList.add("is-invalid"));
            const errorMessage = message || "Preenchimento obrigatório";
            let container = null;
            if (Array.isArray(groupElements) && groupElements.length) {
                container = element.closest("fieldset") || element.closest(".form-check")?.parentElement || element.closest(".col-12");
            }
            if (!container && (element.type === "checkbox" || element.type === "radio")) {
                container = element.closest(".form-check") || element.parentElement;
            }
            if (!container) {
                container = element.parentElement || element;
            }
            let error = container.querySelector(`.error-text[data-error-for='${escapeSelector(key)}']`);
            if (!error) {
                error = document.createElement("small");
                error.className = "error-text";
                error.dataset.errorFor = key;
                if (element.type === "checkbox" || element.type === "radio" || (Array.isArray(groupElements) && groupElements.length)) {
                    container.appendChild(error);
                } else {
                    element.insertAdjacentElement("afterend", error);
                }
            }
            error.textContent = errorMessage;
        };

        const applyValidationUI = (invalidFields) => {
            const trackedElements = new Set(getRequiredElements());
            form.querySelectorAll(".is-invalid").forEach((element) => trackedElements.add(element));
            form.querySelectorAll(".error-text[data-error-for]").forEach((node) => {
                const key = node.getAttribute("data-error-for");
                if (!key) return;
                const elementById = form.querySelector(`#${escapeSelector(key)}`);
                if (elementById) {
                    trackedElements.add(elementById);
                    return;
                }
                const elementsByName = form.querySelectorAll(`[name='${escapeSelector(key)}']`);
                if (elementsByName.length) {
                    elementsByName.forEach((el) => trackedElements.add(el));
                }
            });
            invalidFields.forEach((field) => {
                if (field.element) {
                    trackedElements.add(field.element);
                }
                if (Array.isArray(field.groupElements)) {
                    field.groupElements.forEach((item) => trackedElements.add(item));
                }
            });
            trackedElements.forEach((element) => clearFieldError(element));
            invalidFields.forEach((field) => {
                showFieldError(field.element, field.message, field.groupElements);
            });
        };

        const getInvalidFields = (additionalErrors = [], options = {}) => {
            const { stepElement = null } = options;
            const isElementWithinStep = (element) => {
                if (!stepElement) return true;
                if (!element) return false;
                return stepElement.contains(element);
            };
            const groupMatchesStep = (groupElements) => {
                if (!stepElement) return true;
                if (!Array.isArray(groupElements)) return false;
                return groupElements.some((item) => item && stepElement.contains(item));
            };
            const invalidMap = new Map();
            if (validation && validation.fields) {
                Object.entries(validation.fields).forEach(([selector, field]) => {
                    if (!field.isValid) {
                        const element = field.elem || (typeof selector === "string" ? form.querySelector(selector) : null);
                        if (isReadonlyAndEmpty(element)) {
                            return;
                        }
                        if (!isElementWithinStep(element)) {
                            return;
                        }
                        const messages = Array.isArray(field.messagesShown) ? field.messagesShown : [];
                        const message = messages.length ? messages[messages.length - 1] : "Preenchimento obrigatório";
                        invalidMap.set(selector, {
                            selector,
                            element,
                            label: getFieldLabel(selector),
                            message,
                        });
                    }
                });
            }

            const processedGroups = new Set();
            getRequiredElements().forEach((element) => {
                if (!element) return;
                if (!isElementWithinStep(element)) {
                    return;
                }
                if (isReadonlyAndEmpty(element)) {
                    return;
                }
                if (element.disabled || element.getAttribute("aria-hidden") === "true") {
                    return;
                }
                if (element.type === "hidden") {
                    return;
                }
                const elementInInactiveStep = isInInactiveStep(element);
                if (!elementInInactiveStep && !isElementVisible(element)) {
                    return;
                }
                const selector = element.id
                    ? `#${escapeSelector(element.id)}`
                    : element.name
                        ? `[name='${escapeSelector(element.name)}']`
                        : null;
                if (!selector || invalidMap.has(selector)) {
                    return;
                }
                if (element.type === "radio" || element.type === "checkbox") {
                    const name = element.name;
                    if (name) {
                        if (processedGroups.has(name)) {
                            return;
                        }
                        const group = getGroupElements(name).filter((input) => {
                            if (!input) return false;
                            if (!isElementWithinStep(input)) {
                                return false;
                            }
                            if (input.disabled || input.type === "hidden") {
                                return false;
                            }
                            const inInactiveStep = isInInactiveStep(input);
                            if (!inInactiveStep && !isElementVisible(input)) {
                                return false;
                            }
                            return true;
                        });
                        processedGroups.add(name);
                        if (group.length && !group.some((input) => input.checked)) {
                            invalidMap.set(selector, {
                                selector,
                                element: group[0],
                                groupElements: group,
                                label: getFieldLabel(selector),
                                message: "Preenchimento obrigatório",
                            });
                        }
                        return;
                    }
                    if (!element.checked) {
                        invalidMap.set(selector, {
                            selector,
                            element,
                            label: getFieldLabel(selector),
                            message: "Preenchimento obrigatório",
                        });
                    }
                    return;
                }
                if (!isFieldFilled(element, { bypassVisibilityCheck: elementInInactiveStep })) {
                    invalidMap.set(selector, {
                        selector,
                        element,
                        label: getFieldLabel(selector),
                        message: "Preenchimento obrigatório",
                    });
                }
            });

            additionalErrors.forEach((error) => {
                if (!error || !error.selector) return;
                const existing = invalidMap.get(error.selector);
                const element = error.element || (typeof error.selector === "string" ? form.querySelector(error.selector) : null);
                const groupElements = Array.isArray(error.groupElements) ? error.groupElements : null;
                if (stepElement && !isElementWithinStep(element) && !groupMatchesStep(groupElements)) {
                    return;
                }
                if (existing) {
                    existing.message = error.message || existing.message;
                    if (element) {
                        existing.element = element;
                    }
                    if (groupElements) {
                        existing.groupElements = groupElements;
                    }
                    return;
                }
                invalidMap.set(error.selector, {
                    selector: error.selector,
                    element,
                    label: error.label || getFieldLabel(error.selector),
                    message: error.message || "Preenchimento obrigatório",
                    groupElements,
                });
            });

            return Array.from(invalidMap.values());
        };

        if (typeof JustValidate === "function" && form) {
            validation = new JustValidate(form, {
                errorFieldCssClass: "js-validate-error-field",
                errorLabelCssClass: "error-text d-none",
                focusInvalidField: false,
                lockForm: true,
            });
        } else {
            console.warn("Biblioteca JustValidate não carregada. Prosseguindo com validação customizada.");
        }

        const updateSubmitState = () => {
            const extraErrors = validateAdditionalRules();
            const invalidFields = getInvalidFields(extraErrors);
            const isWindowOpen = isWithinAvailabilityWindow();
            setSubmitButtonState(invalidFields.length === 0 && isWindowOpen);
            if (submitAttempted) {
                applyValidationUI(invalidFields);
            }
        };

        const applyPrefillValues = () => {
            if (!prefillValues || typeof prefillValues !== "object") {
                return;
            }
            const hasContent = Object.values(prefillValues).some((value) => {
                if (value == null) return false;
                if (typeof value === "string") return value.trim() !== "";
                return true;
            });
            if (!hasContent) {
                return;
            }

            const setTextValue = (id, value) => {
                if (value == null) return;
                if (typeof value === "string" && value.trim() === "") return;
                const element = document.getElementById(id);
                if (!element) return;
                element.value = value;
            };

            const setCurrencyValue = (id, value) => {
                const element = document.getElementById(id);
                if (!element) return;
                const formatted = formatCurrencyBr(value);
                element.value = formatted;
                element.dataset.rawValue = value == null ? "" : value;
            };

            const setMaskedValue = (maskInstance, fallbackId, value) => {
                if (value == null) return;
                if (typeof value === "string" && value.trim() === "") return;
                if (maskInstance && typeof maskInstance.updateValue === "function") {
                    maskInstance.value = value;
                    maskInstance.updateValue();
                } else if (maskInstance) {
                    maskInstance.value = value;
                } else if (fallbackId) {
                    const element = document.getElementById(fallbackId);
                    if (element) {
                        element.value = value;
                    }
                }
            };

            const setSelectValue = (id, value, triggerChange = false) => {
                if (value == null) return;
                if (typeof value === "string" && value.trim() === "") return;
                const element = document.getElementById(id);
                if (!element) return;
                element.value = value;
                if (triggerChange) {
                    element.dispatchEvent(new Event("change"));
                }
            };

            const setCheckboxValue = (id, value) => {
                if (value == null) return;
                const element = document.getElementById(id);
                if (!element) return;
                const normalized = typeof value === "string" ? value.toLowerCase() : value;
                const shouldCheck = normalized === "sim" || normalized === "true" || normalized === true || normalized === 1 || normalized === "1";
                element.checked = shouldCheck;
                element.dispatchEvent(new Event("change"));
            };

            const setFormattedDateValue = (id, rawValue) => {
                const element = document.getElementById(id);
                if (!element) return;
                if (rawValue == null || (typeof rawValue === "string" && rawValue.trim() === "")) {
                    element.value = "";
                    if (element.dataset) {
                        element.dataset.rawValue = "";
                    }
                    return;
                }
                const formatted = formatDateToBrazil(rawValue);
                element.value = formatted || String(rawValue);
                if (element.dataset) {
                    element.dataset.rawValue = typeof rawValue === "string" ? rawValue : String(rawValue);
                }
            };

            setTextValue("nomeCompleto", prefillValues.nomeCompleto);
            if (prefillValues.cpf && prefillValues.cpf.trim() !== "") {
                setMaskedValue(maskCpf, "cpf", prefillValues.cpf);
            }
            setTextValue("nis", prefillValues.nis);
            setFormattedDateValue("dataNascimento", prefillValues.dataNascimento);
            setSelectValue("genero", prefillValues.genero, true);
            setTextValue("generoValor", prefillValues.genero);
            setTextValue("nomeSocial", prefillValues.nomeSocial);
            setFormattedDateValue("dataAtualizacaoCadunico", prefillValues.dataAtualizacaoCadunico);
            if (prefillValues.cep && prefillValues.cep.trim() !== "") {
                setMaskedValue(maskCep, "cep", prefillValues.cep);
            }
            setTextValue("logradouro", prefillValues.logradouro);
            const numeroNormalizado = normalizeAddressNumber(prefillValues.numero);
            setTextValue("numero", numeroNormalizado);
            setTextValue("complemento", prefillValues.complemento);
            setTextValue("bairro", prefillValues.bairro);
            setTextValue("cidade", prefillValues.cidade);
            setSelectValue("uf", prefillValues.uf);
            setCheckboxValue("enderecoAtualizado", prefillValues.enderecoAtualizado);
            if (prefillValues.telefone && prefillValues.telefone.trim() !== "") {
                setMaskedValue(maskTelefone, "telefone", prefillValues.telefone);
            }
            setTextValue("email", prefillValues.email);
            setTextValue("emailConfirm", prefillValues.email);
            setCheckboxValue("mulherChefe", prefillValues.mulherChefe);
            setCheckboxValue("acolhimento", prefillValues.acolhimento);
            setCheckboxValue("dependenteTratamento", prefillValues.dependenteTratamento);
            setCurrencyValue("rendaFamiliar", prefillValues.rendaFamiliar);
            setSelectValue("racaCor", prefillValues.racaCor);
            setTextValue("racaCorValor", prefillValues.racaCor);
            setSelectValue("pcd", prefillValues.pcd, true);
            setSelectValue("maeAtipica", prefillValues.maeAtipica, true);
            setSelectValue("vitimaViolencia", prefillValues.vitimaViolencia, true);
            setTextValue("necessidadesEspeciais", prefillValues.necessidadesEspeciais);
            const semTrabalhoCheck = document.getElementById("semTrabalhoFormal");
            const semTrabalhoHidden = document.querySelector('input[name="semTrabalhoFormalValor"]');
            const semTrabalhoValorNormalizado = (prefillValues.semTrabalhoFormal || "").toString().toLowerCase();
            if (semTrabalhoCheck) {
                semTrabalhoCheck.checked = semTrabalhoValorNormalizado === "nao";
            }
            if (semTrabalhoHidden) {
                semTrabalhoHidden.value = semTrabalhoValorNormalizado === "nao" ? "sim" : "nao";
            }
            setTextValue("composicaoFamiliar", prefillValues.composicaoFamiliar);
            const pontuacaoSpan = document.getElementById("pontuacaoComposicaoValor");
            if (pontuacaoSpan) {
                const pontos = Number.parseInt(prefillValues.composicaoFamiliar, 10);
                pontuacaoSpan.textContent = Number.isFinite(pontos) ? `${pontos} ponto${pontos === 1 ? "" : "s"}` : "—";
            }
            const programasValueFormatado = formatProgramasSociaisValue(
                prefillValues.programasSociais,
                prefillValues.programasSociaisNome
            );
            setTextValue("programasSociais", programasValueFormatado);
            preencherCidadePorCepSeNecessario();

            if (validation) {
                if (typeof validation.refreshAll === "function") {
                    validation.refreshAll();
                } else if (typeof validation.refresh === "function") {
                    validation.refresh();
                }
            }
        };

        if (validation) {
            validation
                .addField("#telefone", [
                    { rule: "required", errorMessage: "Informe um telefone válido" },
                    {
                        validator: (value) => value.replace(/\D/g, "").length >= 10,
                        errorMessage: "Informe DDD e número",
                    },
                ])
                .addField("#email", [{ rule: "required" }, { rule: "email", errorMessage: "E-mail inválido" }])
                .addField("#emailConfirm", [
                    { rule: "required", errorMessage: "Repita o e-mail informado" },
                    {
                        validator: (value) => value.trim() === (document.getElementById("email").value || "").trim(),
                        errorMessage: "Os e-mails informados não são iguais.",
                    },
                ])
                .addField("#preferenciaContato", [{ rule: "required" }])
                .addField("#cep", [
                    {
                        validator: () => {
                            if (!enderecoEdicaoAtiva) return true;
                            return getCepDigits().length === 8;
                        },
                        errorMessage: "Informe um CEP válido",
                    },
                ])
                .addField("#logradouro", [
                    {
                        validator: (value) => !enderecoEdicaoAtiva || value.trim().length > 0,
                        errorMessage: "Informe o logradouro",
                    },
                ])
                .addField("#numero", [
                    {
                        validator: () => {
                            if (!numeroInput || numeroInput.readOnly) return true;
                            const valor = numeroInput.value.trim();
                            return /^(?:\d+|S\/N)$/.test(valor) && valor.length > 0;
                        },
                        errorMessage: "Informe o número ou S/N",
                    },
                ])
                .addField("#bairro", [
                    {
                        validator: (value) => !enderecoEdicaoAtiva || value.trim().length > 0,
                        errorMessage: "Informe o bairro",
                    },
                ])
                .addField("#cidade", [
                    {
                        validator: (value) => !enderecoEdicaoAtiva || value.trim().length > 0,
                        errorMessage: "Informe o município",
                    },
                ])
                .addField("#rendaFamiliar", [
                    {
                        validator: (value) => {
                            const element = document.getElementById("rendaFamiliar");
                            if (isReadonlyAndEmpty(element)) return true;
                            return value.trim() !== "";
                        },
                        errorMessage: "Informe a renda familiar",
                    },
                    {
                        validator: (value) => {
                            const element = document.getElementById("rendaFamiliar");
                            if (isReadonlyAndEmpty(element)) return true;
                            const numeric = parseCurrencyToNumber(value);
                            return value !== "" && !Number.isNaN(numeric) && numeric >= 0;
                        },
                        errorMessage: "Valor inválido",
                    },
                ])
                .addField("#pcd", [{ rule: "required" }])
                .addField("#maeAtipica", [{ rule: "required" }])
                .addField("#vitimaViolencia", [{ rule: "required" }])
                .addField("#racaCorValor", [{ rule: "required", errorMessage: "Informe sua autodeclaração" }])
                .addField("#categoria", [{ rule: "required" }])
                .addField("#docIdentidade", [
                    { rule: "required", errorMessage: "Anexe um documento oficial" },
                    {
                        rule: "files",
                        value: {
                            files: {
                                extensions: ["pdf", "jpg", "jpeg", "png"],
                                maxSize: 5 * 1024 * 1024,
                            },
                        },
                        errorMessage: "Formato ou tamanho inválido (máx. 5 MB)",
                    },
                ])
                .addField("#lgpd", [{ rule: "required", errorMessage: "Confirme o consentimento LGPD" }])
                .addField("#veracidade", [{ rule: "required", errorMessage: "Confirme a declaração de veracidade" }]);
        }

        const handleFormInteraction = async (event) => {
            const target = event.target;
            if (!target) return;
            if (!validation) {
                updateSubmitState();
                return;
            }
            const selector = target.id ? `#${target.id}` : null;
            if (selector && validation.fields[selector] && typeof validation.revalidateField === "function") {
                try {
                    await validation.revalidateField(selector);
                } catch (error) {
                    /* Ignora erros de revalidação não críticos */
                }
            }
            if (
                selector === "#email" &&
                validation.fields["#emailConfirm"] &&
                typeof validation.revalidateField === "function"
            ) {
                try {
                    await validation.revalidateField("#emailConfirm");
                } catch (error) {
                    /* Ignora erros de revalidação não críticos */
                }
            }
            updateSubmitState();
        };

        form.addEventListener("input", handleFormInteraction, true);
        form.addEventListener("change", handleFormInteraction, true);
        form.addEventListener("reset", () => {
            submitAttempted = false;
            applyValidationUI([]);
            setSubmitButtonState(false);
            setTimeout(() => updateSubmitState(), 0);
        });

        function validateAdditionalRules() {
            const extraErrors = [];
            const registerError = (selector, message, element) => {
                extraErrors.push({
                    selector,
                    element,
                    label: getFieldLabel(selector),
                    message,
                });
            };
            const cpfDigits = (cpfInput.value || "").replace(/\D/g, "");
            if (cpfDigits && cpfDigits.length === 11 && !cpfValidator(cpfInput.value || "")) {
                registerError("#cpf", "CPF inválido", cpfInput);
            }
            if (cpfDigits && cpfDigits.length > 0 && cpfDigits.length !== 11) {
                registerError("#cpf", "CPF incompleto", cpfInput);
            }
            if (pcdSelect.value === "sim" && !document.getElementById("laudoPcd").files.length) {
                registerError("#laudoPcd", "Anexe o laudo PCD", document.getElementById("laudoPcd"));
            }
            if (maeAtipica.value === "sim") {
                [
                    ["#docMaeAtipicaLaudo", "Anexe laudo ou relatório", document.getElementById("docMaeAtipicaLaudo")],
                    ["#docMaeAtipicaCras", "Anexe a declaração do CRAS/CREAS", document.getElementById("docMaeAtipicaCras")],
                    ["#docResponsavel", "Anexe a declaração técnica", document.getElementById("docResponsavel")],
                ].forEach(([selector, message, element]) => {
                    if (element && !element.files.length) {
                        registerError(selector, message, element);
                    }
                });
            }
            if (dependenteTratamento.checked) {
                [
                    ["#docDependente", "Anexe a declaração de tratamento", document.getElementById("docDependente")],
                    ["#docDependenteVinculo", "Anexe a comprovação de vínculo", document.getElementById("docDependenteVinculo")],
                ].forEach(([selector, message, element]) => {
                    if (element && !element.files.length) {
                        registerError(selector, message, element);
                    }
                });
            }
            if (enderecoAtualizado.checked && !document.getElementById("docResidencia").files.length) {
                registerError(
                    "#docResidencia",
                    "Comprovante obrigatório quando atualizar endereço",
                    document.getElementById("docResidencia")
                );
            }
            const emailValue = (emailInput?.value || "").trim();
            const emailConfirmValue = (emailConfirmInput?.value || "").trim();
            if (
                emailValue &&
                emailConfirmValue &&
                emailValue.toLowerCase() !== emailConfirmValue.toLowerCase()
            ) {
                clearEmailConfirmationField();
                registerError(
                    "#emailConfirm",
                    "Os e-mails informados não são iguais.",
                    emailConfirmInput
                );
            }
            if (["adicao_a", "adicao_b"].includes(categoriaSelect.value)) {
                const numeroCnhField = document.getElementById("numeroCnh");
                if (!numeroCnhField.value.trim()) {
                    registerError("#numeroCnh", "Informe o número da CNH", numeroCnhField);
                }
                const validadeField = document.getElementById("validadeCnh");
                const validade = validadeField.value;
                if (!validade) {
                    registerError("#validadeCnh", "Informe a validade da CNH", validadeField);
                } else {
                    const diff = dayjs(validade).diff(dayjs(), "day");
                    if (diff <= 30) {
                        registerError(
                            "#validadeCnh",
                            "A CNH deve ter validade superior a 30 dias",
                            validadeField
                        );
                    }
                }
                if (!document.getElementById("cnhArquivo").files.length) {
                    registerError("#cnhArquivo", "Anexe a CNH", document.getElementById("cnhArquivo"));
                }
            }
            return extraErrors;
        }

        const processSubmissionAttempt = async ({ triggerElement = submitButton } = {}) => {
            const availabilityState = applyAvailabilityState();
            if (availabilityState.status !== "open") {
                openAvailabilityModal();
                return false;
            }
            let isValid = true;
            if (validation) {
                if (typeof validation.revalidate === "function") {
                    isValid = await validation.revalidate();
                } else if (typeof validation.validate === "function") {
                    isValid = await validation.validate();
                }
            }
            const extraErrors = validateAdditionalRules();
            const invalidFields = getInvalidFields(extraErrors);
            submitAttempted = true;
            applyValidationUI(invalidFields);

            if (!isValid || invalidFields.length) {
                setSubmitButtonState(false);
                const focusField = getFirstInvalidFieldElement(invalidFields);
                showFeedbackModal({
                    type: "alert",
                    message: "Por favor, verifique os campos obrigatórios listados abaixo.",
                    items: invalidFields.map((field) => field.label),
                    focusElement: focusField,
                    triggerElement,
                });
                updateSubmitState();
                return false;
            }

            const formData = new FormData(form);
            const removeEmptyFileFields = (data) => {
                if (!data || typeof data.forEach !== "function") return;
                const keysToDelete = [];
                data.forEach((value, key) => {
                    if (value instanceof File && value.size === 0) {
                        keysToDelete.push(key);
                    }
                });
                keysToDelete.forEach((key) => data.delete(key));
            };

            applyCurrencySubmissionValues(formData);
            removeEmptyFileFields(formData);
            setSubmittingState(true);

            try {
                const response = await fetch(submissionEndpoint, {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Falha ao enviar inscrição: ${response.status}`);
                }

                showFeedbackModal({
                    type: "success",
                    message: "Envio bem-sucedido da inscrição.",
                    triggerElement,
                });

                form.reset();
                if (validation) {
                    if (typeof validation.refreshAll === "function") {
                        validation.refreshAll();
                    } else if (typeof validation.refresh === "function") {
                        validation.refresh();
                    } else {
                        Object.values(validation.fields).forEach((field) => {
                            field.isValid = false;
                            field.elem?.classList.remove("is-invalid", "js-validate-error-field");
                        });
                    }
                }
                submitAttempted = false;
                applyValidationUI([]);
                setSubmitButtonState(false);
                const docResidenciaLabel = document.getElementById("docResidenciaLabel");
                if (docResidenciaLabel) {
                    docResidenciaLabel.classList.remove("required");
                }
                [
                    "docResidenciaWrapper",
                    "laudoPcdWrapper",
                    "docMaeAtipicaLaudoWrapper",
                    "docMaeAtipicaCrasWrapper",
                    "docResponsavelWrapper",
                    "docDependenteWrapper",
                    "docDependenteVinculoWrapper",
                    "cnhNumeroWrapper",
                    "cnhValidadeWrapper",
                    "cnhArquivoWrapper",
                ].forEach((id) => {
                    toggleFileSection(false, id);
                });
                grupoMulherChefe.classList.add("d-none");
                desativarEdicaoEndereco();
                document.querySelectorAll(".file-name").forEach((holder) => {
                    holder.textContent = "";
                });
                setTimeout(() => updateSubmitState(), 0);
                return true;
            } catch (error) {
                console.error(error);
                showFeedbackModal({
                    type: "alert",
                    message: "Não foi possível enviar a inscrição. Tente novamente.",
                    triggerElement,
                });
                return false;
            } finally {
                setSubmittingState(false);
            }
        };

        const updateAgeFieldFromBirthdate = () => {
            if (!ageInput || !birthdateInput) return;
            const referenceValue = birthdateInput.value || prefillValues.dataNascimento;
            const age = calculateAgeFromDate(referenceValue);
            ageInput.value = age != null ? `${age}` : "";
        };

        if (birthdateInput) {
            birthdateInput.addEventListener("change", updateAgeFieldFromBirthdate);
        }

        const updateTempoAtualizacaoField = () => {
            if (!tempoAtualizacaoInput) return;
            const referenceValue =
                (dataAtualizacaoInput && (dataAtualizacaoInput.dataset?.rawValue || dataAtualizacaoInput.value))
                || prefillValues.dataAtualizacaoCadunico;
            tempoAtualizacaoInput.value = formatElapsedTimeSinceDate(referenceValue);
        };

        if (dataAtualizacaoInput) {
            dataAtualizacaoInput.addEventListener("change", updateTempoAtualizacaoField);
        }

        const reviewModal = document.getElementById("reviewModal");
        const reviewModalCard = reviewModal ? reviewModal.querySelector(".modal-card") : null;
        const reviewModalList = document.getElementById("reviewModalList");
        const reviewModalClose = document.getElementById("reviewModalClose");
        const reviewModalCloseIcon = document.getElementById("reviewModalCloseIcon");
        const reviewButton = document.getElementById("reviewButton");
        const reviewChoiceModal = document.getElementById("reviewChoiceModal");
        const reviewChoiceModalCard = reviewChoiceModal ? reviewChoiceModal.querySelector(".modal-card") : null;
        const reviewChoiceCloseIcon = document.getElementById("reviewChoiceCloseIcon");
        const reviewChoiceReviewButton = document.getElementById("reviewChoiceReview");
        const reviewChoiceSendButton = document.getElementById("reviewChoiceSend");

        const getSelectText = (select) => {
            if (!select) return "";
            const option = select.selectedOptions && select.selectedOptions[0];
            return option ? option.textContent.trim() : select.value || "";
        };

        const formatValue = (value) => {
            const text = value == null ? "" : value.toString();
            return text.trim() ? text.trim() : "—";
        };

        const formatCheckbox = (inputId) => {
            const element = document.getElementById(inputId);
            return element && element.checked ? "Sim" : "Não";
        };

        const getFileName = (inputId) => {
            const input = document.getElementById(inputId);
            if (input && input.files && input.files.length) {
                return input.files[0].name;
            }

            const holder = document.getElementById(`${inputId}Name`);
            const holderText = holder?.textContent?.trim();
            return holderText || "";
        };

        const buildAddressSummary = () => {
            const partes = [
                document.getElementById("logradouro")?.value,
                normalizeAddressNumber(document.getElementById("numero")?.value),
                document.getElementById("bairro")?.value,
                document.getElementById("cidade")?.value,
                document.getElementById("uf")?.value,
            ]
                .map((parte) => (parte || "").trim())
                .filter(Boolean);
            return partes.length ? partes.join(", ") : "";
        };

        const openReviewChoiceModal = (triggerElement = null) => {
            if (!reviewChoiceModal || !reviewChoiceModalCard) {
                openReviewModal(triggerElement || reviewButton);
                return;
            }

            const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            const closeHandler = () => closeModal();
            const onBackdropClick = (event) => {
                if (event.target === reviewChoiceModal) {
                    closeModal();
                }
            };

            reviewChoiceCloseIcon?.addEventListener("click", closeHandler);
            reviewChoiceModal.addEventListener("click", onBackdropClick);

            allowExternalFocusElement = null;
            reviewChoiceModal.removeAttribute("hidden");
            reviewChoiceModal.classList.add("is-open");
            document.body.style.overflow = "hidden";

            activeModal = {
                backdrop: reviewChoiceModal,
                card: reviewChoiceModalCard,
                close: closeModal,
                returnFocusElement: triggerElement || previousActive,
                cleanup: () => {
                    reviewChoiceCloseIcon?.removeEventListener("click", closeHandler);
                    reviewChoiceModal.removeEventListener("click", onBackdropClick);
                },
            };

            const focusable = getModalFocusableElements(reviewChoiceModalCard);
            const initialFocusTarget = focusable[0] || reviewChoiceModalCard;
            requestAnimationFrame(() => {
                initialFocusTarget.focus({ preventScroll: true });
            });

            document.addEventListener("keydown", handleModalKeydown, true);
            document.addEventListener("focusin", handleModalFocusIn, true);
        };

        const populateReviewModal = () => {
            if (!reviewModalList) return;
            const items = [
                { label: "Nome completo", value: document.getElementById("nomeCompleto")?.value },
                { label: "CPF", value: document.getElementById("cpf")?.value },
                { label: "Nome social", value: document.getElementById("nomeSocial")?.value },
                { label: "Data de nascimento", value: document.getElementById("dataNascimento")?.value },
                { label: "Idade", value: document.getElementById("idade")?.value },
                { label: "NIS/PIS", value: document.getElementById("nis")?.value },
                { label: "Data da atualização", value: document.getElementById("dataAtualizacaoCadunico")?.value },
                { label: "Tempo desde a atualização", value: document.getElementById("tempoAtualizacaoCadunico")?.value },
                { label: "Identificação de gênero", value: getSelectText(document.getElementById("genero")) || document.getElementById("generoValor")?.value },
                { label: "Telefone/WhatsApp", value: document.getElementById("telefone")?.value },
                { label: "E-mail", value: document.getElementById("email")?.value },
                { label: "Canal de contato preferencial", value: getSelectText(document.getElementById("preferenciaContato")) },
                { label: "CEP", value: document.getElementById("cep")?.value },
                { label: "Logradouro", value: document.getElementById("logradouro")?.value },
                { label: "Número", value: normalizeAddressNumber(document.getElementById("numero")?.value) },
                { label: "Complemento", value: document.getElementById("complemento")?.value },
                { label: "Bairro", value: document.getElementById("bairro")?.value },
                { label: "Cidade", value: document.getElementById("cidade")?.value },
                { label: "UF", value: getSelectText(document.getElementById("uf")) },
                { label: "Trabalho por aplicativo", value: getSelectText(document.getElementById("trabalhadorAplicativo")) },
                { label: "Resido em serviço de acolhimento institucional", value: formatCheckbox("acolhimento") },
                { label: "Não tem trabalho formal", value: formatCheckbox("semTrabalhoFormal") },
                { label: "Sou mulher e responsável pela renda familiar", value: formatCheckbox("mulherChefe") },
                { label: "Possuo dependente em tratamento terapêutico contínuo", value: formatCheckbox("dependenteTratamento") },
                { label: "Composição familiar (nº de pessoas no domicílio)", value: document.getElementById("composicaoFamiliar")?.value },
                { label: "Renda per capita mensal (R$)", value: document.getElementById("rendaFamiliar")?.value },
                { label: "Participação em programas sociais (BPC ou Bolsa Família)", value: document.getElementById("programasSociais")?.value },
                { label: "Autodeclaração de cor/raça", value: getSelectText(document.getElementById("racaCor")) || document.getElementById("racaCorValor")?.value },
                { label: "Pessoa com deficiência (PCD)", value: getSelectText(document.getElementById("pcd")) },
                { label: "Mãe atípica com dependente PCD ou autista", value: getSelectText(document.getElementById("maeAtipica")) },
                { label: "Vítima de violência doméstica", value: getSelectText(document.getElementById("vitimaViolencia")) },
                { label: "Informações complementares", value: document.getElementById("necessidadesEspeciais")?.value },
                { label: "Categoria desejada", value: getSelectText(document.getElementById("categoria")) },
                { label: "Número da CNH (para adição)", value: document.getElementById("numeroCnh")?.value },
                { label: "Validade da CNH", value: document.getElementById("validadeCnh")?.value },
                { label: "LGPD autorizada", value: formatCheckbox("lgpd") },
                { label: "Declaração de veracidade", value: formatCheckbox("veracidade") },
                { label: "Autorizo uso da imagem", value: formatCheckbox("imagem") },
            ];

            const fileItems = [
                { label: "Comprovante de residência recente", value: getFileName("docResidencia") },
                { label: "Comprovante de trabalho por aplicativo", value: getFileName("docTrabalhoAplicativo") },
                { label: "Declaração de tratamento terapêutico contínuo", value: getFileName("docDependente") },
                { label: "Comprovação de vínculo do dependente", value: getFileName("docDependenteVinculo") },
                { label: "Laudo ou relatório para mãe atípica", value: getFileName("docMaeAtipicaLaudo") },
                { label: "Declaração técnica do CRAS/CREAS ou certificação", value: getFileName("docMaeAtipicaCras") },
                { label: "Declaração técnica de responsabilidade legal", value: getFileName("docResponsavel") },
                { label: "Laudo médico PCD", value: getFileName("laudoPcd") },
                { label: "CNH (frente e verso)", value: getFileName("cnhArquivo") },
                { label: "Documento oficial com foto", value: getFileName("docIdentidade") },
            ].filter(({ value }) => Boolean(value));

            reviewModalList.innerHTML = "";
            [...items, ...fileItems].forEach(({ label, value }) => {
                const dt = document.createElement("dt");
                dt.textContent = label;
                const dd = document.createElement("dd");
                dd.textContent = formatValue(value);
                reviewModalList.append(dt, dd);
            });
        };

        const openReviewModal = (triggerElement = null) => {
            if (!reviewModal || !reviewModalCard) return;
            populateReviewModal();

            const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            const closeHandler = () => closeModal();
            const onBackdropClick = (event) => {
                if (event.target === reviewModal) {
                    closeModal();
                }
            };

            reviewModalClose?.addEventListener("click", closeHandler);
            reviewModalCloseIcon?.addEventListener("click", closeHandler);
            reviewModal.addEventListener("click", onBackdropClick);

            allowExternalFocusElement = null;
            reviewModal.removeAttribute("hidden");
            reviewModal.classList.add("is-open");
            document.body.style.overflow = "hidden";

            activeModal = {
                backdrop: reviewModal,
                card: reviewModalCard,
                close: closeModal,
                returnFocusElement: triggerElement || previousActive,
                cleanup: () => {
                    reviewModalClose?.removeEventListener("click", closeHandler);
                    reviewModalCloseIcon?.removeEventListener("click", closeHandler);
                    reviewModal.removeEventListener("click", onBackdropClick);
                },
            };

            const focusable = getModalFocusableElements(reviewModalCard);
            const initialFocusTarget = focusable[0] || reviewModalCard;
            requestAnimationFrame(() => {
                initialFocusTarget.focus({ preventScroll: true });
            });

            document.addEventListener("keydown", handleModalKeydown, true);
            document.addEventListener("focusin", handleModalFocusIn, true);
        };

        const closeReviewModalIfOpen = () => {
            if (reviewModal && reviewModal.classList.contains("is-open") && activeModal?.backdrop === reviewModal) {
                closeModal();
            }
        };

        if (reviewButton) {
            reviewButton.addEventListener("click", () => {
                openReviewChoiceModal(reviewButton);
            });
        }

        if (reviewChoiceReviewButton) {
            reviewChoiceReviewButton.addEventListener("click", () => {
                closeModal();
                openReviewModal(reviewChoiceReviewButton || reviewButton);
            });
        }

        if (reviewChoiceSendButton) {
            reviewChoiceSendButton.addEventListener("click", async () => {
                closeModal();
                await processSubmissionAttempt({ triggerElement: reviewChoiceSendButton });
            });
        }

        startAvailabilityWatcher();
        const initialAvailabilityState = getAvailabilityState();
        if (initialAvailabilityState.status !== "open") {
            openAvailabilityModal(() => {
                triggerConsentIfNeeded();
            });
        } else {
            triggerConsentIfNeeded();
        }

        const validarEExibirModal = (formSelector, botaoSelector) => {
            const targetForm = document.querySelector(formSelector);
            const targetButton = document.querySelector(botaoSelector);
            if (!targetForm || !targetButton) {
                return;
            }
            targetButton.addEventListener("click", async (event) => {
                event.preventDefault();
                closeReviewModalIfOpen();
                const triggerElement =
                    event.currentTarget instanceof HTMLElement && event.currentTarget !== targetForm
                        ? event.currentTarget
                        : targetButton;
                await processSubmissionAttempt({ triggerElement });
            });
            targetForm.addEventListener("submit", async (event) => {
                event.preventDefault();
                closeReviewModalIfOpen();
                await processSubmissionAttempt({ triggerElement: targetButton });
            });
        };

        validarEExibirModal("#cnhSocialForm", "#submitButton");

        attachRequiredFieldFocusHandlers();
        enforceEmailConfirmationConsistency();

        applyPrefillValues();
        relaxReadonlyEmptyFields();
        updateTrabalhadorAplicativoVisibility();
        updateAgeFieldFromBirthdate();
        updateTempoAtualizacaoField();
        updateSubmitState();
    