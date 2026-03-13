# 📋 Documento de Requisitos - Aurora Finance

## 1. Visão Geral do Sistema

**Nome do Sistema:** Aurora Finance  
**Tipo:** Plataforma de Gestão Financeira Pessoal  
**Público-Alvo:** Usuários que desejam controlar receitas, despesas e cartões de crédito  
**Plataforma:** Web Application (Single Page Application)

---

## 2. Requisitos Funcionais

### 2.1 Módulo de Dashboard

| ID | Requisito | Descrição | Prioridade |
|----|-----------|-----------|------------|
| RF-001 | Visualizar KPIs Financeiros | O sistema deve exibir cards com: Receita Mensal, Despesas Totais, Saldo do Mês e Gasto em Cartões | Alta |
| RF-002 | Exibir Gráfico de Evolução Anual | O sistema deve apresentar gráfico de área comparando receitas vs despesas ao longo do ano | Alta |
| RF-003 | Exibir Gráfico de Distribuição | O sistema deve apresentar gráfico de rosca (donut) mostrando distribuição de gastos por categoria | Alta |
| RF-004 | Exibir Gráfico de Saldo Mensal | O sistema deve apresentar gráfico de barras mostrando saldo dos últimos 6 meses | Média |
| RF-005 | Exibir Gráfico de Gastos com Cartão | O sistema deve apresentar gráfico de linha mostrando tendência de parcelamentos | Média |
| RF-006 | Alternar Sub-abas do Dashboard | O usuário deve poder navegar entre: Visão Geral, Tendências e Alertas | Média |
| RF-007 | Exibir Alertas Financeiros | O sistema deve notificar sobre saldo negativo e limite de cartão excedido | Alta |

### 2.2 Módulo de Controle Mensal

| ID | Requisito | Descrição | Prioridade |
|----|-----------|-----------|------------|
| RF-008 | Navegar Entre Meses | O usuário deve poder selecionar qualquer mês do ano para visualização | Alta |
| RF-009 | Cadastrar Receita | O usuário deve poder adicionar receitas com: descrição, valor e categoria | Alta |
| RF-010 | Cadastrar Despesa | O usuário deve poder adicionar despesas com: descrição, valor e categoria | Alta |
| RF-011 | Listar Transações do Mês | O sistema deve exibir todas as receitas e despesas do mês selecionado em tabela | Alta |
| RF-012 | Excluir Transação | O usuário deve poder remover receitas e despesas cadastradas | Alta |
| RF-013 | Visualizar Orçamento por Categoria | O sistema deve mostrar barras de progresso de gastos por categoria | Média |
| RF-014 | Visualizar Resumo do Mês | O sistema deve exibir resumo com Receitas, Despesas e Saldo do mês | Alta |
| RF-015 | Gerenciar Metas Financeiras | O usuário deve poder visualizar metas com progresso (Reserva, Viagem, Apartamento) | Baixa |

### 2.3 Módulo de Cartões de Crédito

| ID | Requisito | Descrição | Prioridade |
|----|-----------|-----------|------------|
| RF-016 | Cadastrar Cartão de Crédito | O usuário deve poder adicionar cartões com: nome e limite total | Alta |
| RF-017 | Excluir Cartão de Crédito | O usuário deve poder remover cartões cadastrados | Alta |
| RF-018 | Visualizar Cartões em 3D | O sistema deve exibir cartões com efeito flip (frente/verso) ao passar o mouse | Média |
| RF-019 | Exibir Utilização de Limite | O sistema deve mostrar barra de progresso do limite utilizado por cartão | Alta |
| RF-020 | Cadastrar Compra Parcelada | O usuário deve poder adicionar compras com: cartão, descrição, valor total e número de parcelas | Alta |
| RF-021 | Calcular Valor da Parcela | O sistema deve calcular automaticamente o valor por parcela (valor total ÷ parcelas) | Alta |
| RF-022 | Listar Parcelamentos Ativos | O sistema deve exibir todas as compras parceladas com: parcelas pagas/total, valor mensal | Alta |
| RF-023 | Excluir Parcelamento | O usuário deve poder remover parcelamentos cadastrados | Alta |
| RF-024 | Visualizar Faturas por Cartão | O sistema deve agrupar parcelamentos por cartão mostrando fatura atual | Alta |
| RF-025 | Integrar Parcelas nas Despesas | Ao adicionar parcela, o sistema deve automaticamente lançar como despesa no mês atual | Alta |

### 2.4 Módulo de Relatórios

| ID | Requisito | Descrição | Prioridade |
|----|-----------|-----------|------------|
| RF-026 | Exportar para Excel | O usuário deve poder baixar dados em formato planilha | Baixa |
| RF-027 | Exportar para PDF | O usuário deve poder gerar relatório em PDF | Baixa |
| RF-028 | Enviar Relatório por Email | O usuário deve poder configurar envio automático de relatórios | Baixa |

### 2.5 Módulo de Navegação

| ID | Requisito | Descrição | Prioridade |
|----|-----------|-----------|------------|
| RF-029 | Navegar por Abas Principais | O usuário deve poder alternar entre: Dashboard, Controle Mensal, Cartões e Relatórios | Alta |
| RF-030 | Navegar por Sub-abas | Cada aba principal deve ter sub-abas específicas de conteúdo | Média |
| RF-031 | Manter Estado da Navegação | O sistema deve preservar a aba ativa durante a sessão | Média |

---

## 3. Requisitos Não Funcionais

### 3.1 Performance

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RNF-001 | Tempo de Carregamento | A aplicação deve carregar em menos de 3 segundos em conexão 4G |
| RNF-002 | Atualização de Gráficos | Os gráficos devem atualizar em menos de 500ms após mudanças de dados |
| RNF-003 | Responsividade | A interface deve ser responsiva para dispositivos móveis (≥320px), tablets e desktop |

### 3.2 Usabilidade

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RNF-004 | Acessibilidade | A interface deve seguir WCAG 2.1 nível AA para contraste de cores |
| RNF-005 | Feedback Visual | Todas as ações do usuário devem ter feedback visual imediato (hover, click, loading) |
| RNF-006 | Animações | As transições entre telas devem ter duração entre 200ms-400ms |
| RNF-007 | Intuitividade | O usuário deve conseguir realizar operações básicas sem tutorial |

### 3.3 Design e Estética

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RNF-008 | Tema Aurora Boreal | A aplicação deve utilizar paleta de cores com gradientes inspirados em aurora boreal |
| RNF-009 | Efeito Glassmorphism | Os cards e painéis devem utilizar efeito de vidro fosco (blur + transparência) |
| RNF-010 | Tema Dark/Light Balance | A interface deve equilibrar elementos escuros e claros, não sendo totalmente dark mode |
| RNF-011 | Efeitos de Glow | Elementos importantes devem ter efeito de brilho (glow) ao interagir |
| RNF-012 | Animação de Fundo | O background deve ter elementos animados (blobs) com movimento suave |
| RNF-013 | Fonte | A tipografia deve utilizar a fonte "Outfit" do Google Fonts |

### 3.4 Técnicos

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RNF-014 | Framework Frontend | Utilizar Alpine.js para reatividade sem necessidade de build |
| RNF-015 | Estilização | Utilizar Tailwind CSS via CDN para estilização |
| RNF-016 | Gráficos | Utilizar Chart.js para renderização de gráficos |
| RNF-017 | Ícones | Utilizar Lucide Icons para iconografia |
| RNF-018 | Single Page | A aplicação deve funcionar como SPA sem recarregamento de página |
| RNF-019 | Navegadores | Suportar Chrome, Firefox, Safari e Edge (últimas 2 versões) |
| RNF-020 | Armazenamento | Dados devem persistir durante a sessão do navegador |

### 3.5 Segurança

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RNF-021 | Validação de Entrada | Todos os inputs devem validar dados antes de processamento |
| RNF-022 | Sanitização | Dados inseridos pelo usuário devem ser sanitizados contra XSS |

---

## 4. Regras de Negócio

### 4.1 Receitas e Despesas

| ID | Regra | Descrição |
|----|-------|-----------|
| RN-001 | Valor Positivo | Receitas e despesas devem ter valor maior que zero |
| RN-002 | Descrição Obrigatória | Toda transação deve ter descrição preenchida |
| RN-003 | Cálculo de Saldo | Saldo do Mês = Total Receitas - Total Despesas |
| RN-004 | Saldo Global | Saldo Global = Soma dos saldos de todos os meses |
| RN-005 | Categoria Padrão | Despesas sem categoria devem receber "Geral" como padrão |

### 4.2 Cartões de Crédito

| ID | Regra | Descrição |
|----|-------|-----------|
| RN-006 | Limite Positivo | Todo cartão deve ter limite maior que zero |
| RN-007 | Cálculo de Utilização | Utilização % = (Total Gasto no Cartão ÷ Limite) × 100 |
| RN-008 | Alerta de Limite | Sistema deve alertar quando utilização ultrapassar 80% do limite |
| RN-009 | Cartão sem Compras | Cartão pode existir sem compras parceladas associadas |

### 4.3 Parcelamentos

| ID | Regra | Descrição |
|----|-------|-----------|
| RN-010 | Valor da Parcela | Valor Parcela = Valor Total ÷ Número de Parcelas |
| RN-011 | Parcelas Mínimas | Número de parcelas deve ser maior ou igual a 1 |
| RN-012 | Cartão Obrigatório | Todo parcelamento deve estar vinculado a um cartão cadastrado |
| RN-013 | Lançamento Automático | Ao criar parcelamento, lançar primeira parcela como despesa no mês atual |
| RN-014 | Categoria de Parcela | Parcelamentos devem receber categoria "Cartão de Crédito" automaticamente |
| RN-015 | Descrição da Fatura | Descrição da despesa deve incluir nome do cartão e descrição da compra |

### 4.4 Alertas e Notificações

| ID | Regra | Descrição |
|----|-------|-----------|
| RN-016 | Alerta Saldo Negativo | Exibir alerta quando Saldo do Mês < 0 |
| RN-017 | Alerta Limite Cartão | Exibir alerta quando Utilização do Cartão > 80% |
| RN-018 | Indicador Visual | Alertas devem ter cores distintas: Amarelo (atenção), Vermelho (crítico) |

### 4.5 Navegação e Visualização

| ID | Regra | Descrição |
|----|-------|-----------|
| RN-019 | Mês Atual | Ao abrir o sistema, selecionar automaticamente o mês corrente |
| RN-020 | Gráfico de 6 Meses | Gráficos de tendência devem mostrar últimos 6 meses ou até mês atual |
| RN-021 | Ordenação de Transações | Transações devem ser listadas por ordem de cadastro (mais recente primeiro) |

---

## 5. Estrutura de Dados

### 5.1 Entidades Principais

Mês
├── id: number
├── nome: string (Jan, Fev, Mar...)
├── ano: number
├── incomeItems: Array<Transacao>
└── expenseItems: Array<Transacao>
Transação
├── id: number (timestamp)
├── desc: string
├── value: number
├── category: string
└── type: 'income' | 'expense'
Cartão
├── id: number
├── name: string
└── limit: number
Parcelamento
├── id: number
├── cardId: number (referência ao Cartão)
├── desc: string
├── totalValue: number
├── installments: number
├── current: number
└── value: number (valor por parcela)


---

## 6. Matriz de Rastreabilidade

| Funcionalidade | RFs Relacionados | RNFs Relacionados | RNs Relacionadas |
|---------------|------------------|-------------------|------------------|
| Dashboard | RF-001 a RF-007 | RNF-001, RNF-002, RNF-008 a RNF-012 | RN-003, RN-004, RN-016, RN-017 |
| Controle Mensal | RF-008 a RF-015 | RNF-003, RNF-005, RNF-006 | RN-001 a RN-005, RN-019 a RN-021 |
| Cartões | RF-016 a RF-025 | RNF-005, RNF-011, RNF-012 | RN-006 a RN-015 |
| Relatórios | RF-026 a RF-028 | RNF-001, RNF-003 | - |
| Navegação | RF-029 a RF-031 | RNF-004, RNF-006, RNF-018 | RN-019, RN-020 |

---

## 7. Critérios de Aceite

### 7.1 Dashboard
- [ ] Todos os 4 cards de KPI exibem valores corretos
- [ ] Gráficos renderizam sem erros
- [ ] Sub-abas alternam conteúdo corretamente
- [ ] Alertas aparecem quando condições são atendidas

### 7.2 Controle Mensal
- [ ] Navegação entre meses funciona (12 meses)
- [ ] Transações são adicionadas e removidas corretamente
- [ ] Cálculos de saldo estão precisos
- [ ] Tabela exibe todas as transações do mês

### 7.3 Cartões
- [ ] Cartões são cadastrados e exibidos com efeito 3D
- [ ] Parcelamentos calculam valor correto por parcela
- [ ] Limite utilizado atualiza em tempo real
- [ ] Faturas agrupam parcelas por cartão

### 7.4 Design
- [ ] Efeito glassmorphism aplicado em todos os cards
- [ ] Animações de blobs no background funcionam
- [ ] Cores seguem paleta aurora boreal
- [ ] Interface responsiva em mobile e desktop

---

## 8. Glossário

| Termo | Definição |
|-------|-----------|
| **KPI** | Key Performance Indicator - Indicadores chave de performance financeira |
| **Glassmorphism** | Estilo de design que simula vidro fosco com blur e transparência |
| **Parcelamento** | Compra dividida em múltiplas pagamentos mensais no cartão |
| **Fatura** | Consolidado de gastos do cartão de crédito em um período |
| **SPA** | Single Page Application - Aplicação de página única |

---

## 9. Considerações Finais

Este documento cobre todos os requisitos identificados durante o desenvolvimento da plataforma Aurora Finance. As prioridades foram definidas considerando:

- **Alta:** Funcionalidades essenciais para o MVP
- **Média:** Funcionalidades que melhoram a experiência mas não bloqueiam o uso
- **Baixa:** Funcionalidades nice-to-have para versões futuras

---
