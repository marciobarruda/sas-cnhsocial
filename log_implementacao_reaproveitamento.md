# Resumo do Chat: Implementação de Reaproveitamento de Dados

Este arquivo contém o resumo da conversa e as alterações realizadas no programa CNH Social para permitir que candidatos reutilizem dados de processos anteriores.

## Objetivo
Adicionar dois switches na aba de Inscrição para:
1. Detectar se o candidato já teve uma inscrição homologada anteriormente.
2. Permitir que o candidato opte por reaproveitar esses dados para a nova inscrição.

## Alterações Realizadas

### 1. Interface (portal.html)
- Adição de um novo bloco visual no início do formulário de inscrição.
- Implementação de dois switches com textos aprimorados:
    - **Inscrição homologada em edital anterior detectada**: Ativado automaticamente via sistema.
    - **Reaproveitar dados para este novo processo?**: Opção para o usuário.

### 2. Lógica de Inicialização (Javascript)
- O sistema agora verifica o campo `inscricao_homologada_anterior` nos dados do candidato (vindo do n8n).
- Caso detectado, o bloco de reaproveitamento é exibido e o primeiro switch é ativado.

### 3. Resumo da Inscrição
- O modal de "Resumo da Inscrição" agora exibe um alerta informativo quando o modo de reaproveitamento está ativo, garantindo que o usuário saiba que seus dados anteriores serão utilizados.

### 4. Integração com Backend
- Os campos `swInscricaoAnterior` e `swReaproveitarDados` são enviados no payload do webhook ao finalizar a inscrição.

---
**Data da Implementação**: 01/04/2026
**ID da Conversa**: 1ee5e8b5-96d7-48be-bfad-b28e6d47b2a6
