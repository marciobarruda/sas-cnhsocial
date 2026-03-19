# Inventário de Campos - formulario.html

Este documento lista todos os campos identificados no arquivo [formulario.html](file:///g:/Outros%20computadores/Meu%20laptop%20%28Emprel%29/Desktop/Automa%C3%A7%C3%A3o/GitHub/sas-cnhsocial/formulario.html), organizados por seção, conforme aparecem no formulário.

## 1. Identificação do Candidato
| Rótulo (Label) | ID | Nome (name) | Tipo | Observações |
| :--- | :--- | :--- | :--- | :--- |
| CPF | [cpf](file:///g:/Outros%20computadores/Meu%20laptop%20%28Emprel%29/Desktop/Automa%C3%A7%C3%A3o/GitHub/sas-cnhsocial/formulario.html#2747-2761) | [cpf](file:///g:/Outros%20computadores/Meu%20laptop%20%28Emprel%29/Desktop/Automa%C3%A7%C3%A3o/GitHub/sas-cnhsocial/formulario.html#2747-2761) | Text | Somente leitura, máscara CPF. |
| Nome completo | `nomeCompleto` | `nomeCompleto` | Text | Somente leitura. |
| Nome social | `nomeSocial` | `nomeSocial` | Text | Opcional. |
| Data de nascimento | `dataNascimento` | `dataNascimento` | Text | Somente leitura, máscara data. |
| Idade | [idade](file:///g:/Outros%20computadores/Meu%20laptop%20%28Emprel%29/Desktop/Automa%C3%A7%C3%A3o/GitHub/sas-cnhsocial/formulario.html#2440-2464) | [idade](file:///g:/Outros%20computadores/Meu%20laptop%20%28Emprel%29/Desktop/Automa%C3%A7%C3%A3o/GitHub/sas-cnhsocial/formulario.html#2440-2464) | Text | Somente leitura, calculada. |
| NIS/PIS | `nis` | `nis` | Text | Somente leitura. |
| Data da atualização | `dataAtualizacaoCadunico` | `dataAtualizacaoCadunico` | Text | Somente leitura. |
| Tempo desde a atualização | `tempoAtualizacaoCadunico` | `tempoAtualizacaoCadunico` | Text | Somente leitura, calculado. |
| Identificação de gênero | `genero` | `generoExibicao` | Select | Desabilitado (uso de `generoValor` oculto). |

## 2. Contatos e Residência
| Rótulo (Label) | ID | Nome (name) | Tipo | Observações |
| :--- | :--- | :--- | :--- | :--- |
| Telefone/WhatsApp | `telefone` | `telefone` | Text | Obrigatório, máscara telefone. |
| E-mail | `email` | `email` | Email | Obrigatório. |
| Confirme o e-mail | `emailConfirm` | `emailConfirm` | Email | Obrigatório, validação de igualdade. |
| Canal de contato preferencial | `preferenciaContato` | `preferenciaContato` | Select | Obrigatório. |

## 3. Endereço Residencial
| Rótulo (Label) | ID | Nome (name) | Tipo | Observações |
| :--- | :--- | :--- | :--- | :--- |
| CEP | [cep](file:///g:/Outros%20computadores/Meu%20laptop%20%28Emprel%29/Desktop/Automa%C3%A7%C3%A3o/GitHub/sas-cnhsocial/formulario.html#2500-2506) | [cep](file:///g:/Outros%20computadores/Meu%20laptop%20%28Emprel%29/Desktop/Automa%C3%A7%C3%A3o/GitHub/sas-cnhsocial/formulario.html#2500-2506) | Text | Editável se `enderecoAtualizado` marcado. |
| Logradouro | `logradouro` | `logradouro` | Text | Editável se `enderecoAtualizado` marcado. |
| Número | `numero` | `numero` | Text | Editável se `enderecoAtualizado` marcado. |
| Complemento | `complemento` | `complemento` | Text | Editável se `enderecoAtualizado` marcado. |
| Bairro | `bairro` | `bairro` | Text | Editável se `enderecoAtualizado` marcado. |
| Cidade | `cidade` | `cidade` | Text | Editável se `enderecoAtualizado` marcado. |
| UF | `uf` | `uf` | Select | Editável se `enderecoAtualizado` marcado. |
| Atualizar endereço | `enderecoAtualizado` | `enderecoAtualizado` | Checkbox | Habilita edição de endereço e anexo. |

## 4. Contexto Socioassistencial
| Rótulo (Label) | ID | Nome (name) | Tipo | Observações |
| :--- | :--- | :--- | :--- | :--- |
| Trabalhador de aplicativo? | `trabalhadorAplicativo` | `trabalhadorAplicativo` | Select | |
| Resido em acolhimento... | `acolhimento` | `acolhimento` | Checkbox | |
| Não tem trabalho formal | `semTrabalhoFormal` | `semTrabalhoFormalValor` | Checkbox | Desabilitado, preenchimento via base. |
| Mulher chefe de família | `mulherChefe` | `mulherChefe` | Checkbox | Visível apenas para gênero feminino. |
| Dependente em tratamento... | `dependenteTratamento` | `dependenteTratamento` | Checkbox | Habilita anexos específicos. |
| Composição familiar | `composicaoFamiliar` | `composicaoFamiliar` | Number | Somente leitura. |
| Renda per capita mensal | `rendaFamiliar` | `rendaFamiliar` | Text | Somente leitura, formato moeda. |
| Participação em prog. sociais| `programasSociais` | `programasSociais` | Text | Somente leitura. |

## 5. Diversidade e Priorização
| Rótulo (Label) | ID | Nome (name) | Tipo | Observações |
| :--- | :--- | :--- | :--- | :--- |
| Autodeclaração de cor/raça | `racaCor` | `racaCorExibicao` | Select | Desabilitado. |

## 6. Condições Especiais e Anexos
| Rótulo (Label) | ID | Nome (name) | Tipo | Observações |
| :--- | :--- | :--- | :--- | :--- |
| Pessoa com deficiência (PCD) | `pcd` | `pcd` | Select | Habilita anexo de laudo. |
| Mãe/Pai atípico | `maeAtipica` | `maeAtipica` | Select | Habilita anexos de comprovação. |
| Vítima violência doméstica | `vitimaViolencia` | `vitimaViolencia` | Select | |
| Informações complementares | `necessidadesEspeciais` | `necessidadesEspeciais` | Textarea | Máximo 500 caracteres. |

## 7. Informações da CNH
| Rótulo (Label) | ID | Nome (name) | Tipo | Observações |
| :--- | :--- | :--- | :--- | :--- |
| Categoria desejada | `categoria` | `categoria` | Select | |
| Número da CNH | `numeroCnh` | `numeroCnh` | Text | Visível se categoria for adição. |
| Validade da CNH | `validadeCnh` | `validadeCnh` | Date | Visível se categoria for adição. |

## 8. Declarações e Consentimentos
| Rótulo (Label) | ID | Nome (name) | Tipo | Observações |
| :--- | :--- | :--- | :--- | :--- |
| Consentimento LGPD | `lgpd` | `lgpd` | Checkbox | Obrigatório. |
| Declaração de veracidade | `veracidade` | `veracidade` | Checkbox | Obrigatório. |
| Uso de imagem | `imagem` | `imagem` | Checkbox | Obrigatório. |

## 9. Documentação (Upload de Arquivos)
| Rótulo (Campo Display) | ID | Nome (name) | Condição de Visibilidade |
| :--- | :--- | :--- | :--- |
| Foto — FRENTE | `docIdentidadeFrente` | `docIdentidadeFrente` | Sempre visível. |
| Foto — VERSO | `docIdentidadeVerso` | `docIdentidadeVerso` | Sempre visível. |
| Comprovante de residência | `docResidencia` | `docResidencia` | Se `enderecoAtualizado` é "Sim". |
| Comprovante aplicativo | `docTrabalhoAplicativo` | `docTrabalhoAplicativo` | Se `trabalhadorAplicativo` é "Sim". |
| Laudo médico PCD | `laudoPcd` | `laudoPcd` | Se `pcd` é "Sim". |
| Declaração tratamento | `docDependente` | `docDependente` | Se `dependenteTratamento` marcado. |
| Comprovante vínculo | `docDependenteVinculo` | `docDependenteVinculo` | Se `dependenteTratamento` marcado. |
| Laudo mãe atípica | `docMaeAtipicaLaudo` | `docMaeAtipicaLaudo` | Se `maeAtipica` é "Sim". |
| Declaração CRAS/CREAS | `docMaeAtipicaCras` | `docMaeAtipicaCras` | Se `maeAtipica` é "Sim". |
| Resp. legal | `docResponsavel` | `docResponsavel` | Se `maeAtipica` é "Sim". |
| Arquivo da CNH | `cnhArquivo` | `cnhArquivo` | Se categoria for adição. |
