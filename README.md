# Sistema de Gestão Socioeducativa - C.S.E. Irmã Adelaide

## 📖 Sobre o Projeto

Este projeto é uma plataforma web completa para a gestão do **Centro Socioeducativo Irmã Adelaide**. O sistema digitaliza todo o processo de inscrição, acompanhamento e gestão de participantes, substituindo fichas de papel por um fluxo digital seguro e eficiente.

O sistema conta com painéis distintos para **Administradores** e **Participantes**, gestão de eventos com lista de presença, controle de aprovação de matrículas e relatórios estatísticos.

---

## ✨ Funcionalidades Principais

### 🔐 Acesso e Segurança
* **Autenticação Segura:** Login com JWT (JSON Web Tokens).
* **Controle de Níveis de Acesso:**
    * **Master/Admin:** Acesso total ao sistema.
    * **Comum (Participante):** Acesso restrito aos seus próprios dados e eventos.
* **Recuperação de Senha:** Solicitação de reset pelo usuário e aprovação pelo administrador.
* **Proteção de Rotas:** Bloqueio de páginas não autorizadas via Frontend e Backend.
* **Variáveis de Ambiente:** Credenciais sensíveis protegidas via arquivo `.env`.

### 🏢 Módulo Administrativo (Dashboard)
* **KPIs em Tempo Real:** Total de ativos, pendentes, público prioritário e famílias PNE.
* **Gráficos Estatísticos:** Origem dos encaminhamentos e distribuição por sexo.
* **Gestão de Matrículas:**
    * Listagem com filtros avançados (Nome, CPF, Status).
    * Aprovação e Reprovação de cadastros.
    * Visualização completa da ficha do participante.
    * Exportação de Relatórios em CSV (Excel).
* **Gestão de Usuários:**
    * Criação de novos Administradores.
    * Remoção de usuários.
    * Aprovação de pedidos de reset de senha.

### 📅 Módulo de Eventos
* **CRUD Completo:** Criar, Editar e Excluir eventos da instituição.
* **Controle de Inscritos:** Visualização de quem se inscreveu em cada atividade.
* **Lista de Presença:** Geração automática de lista de chamada pronta para impressão (com nomes e RGs).

### 👤 Módulo do Participante (Área do Usuário)
* **Auto-Cadastro:** Formuláriowizard (passo a passo) intuitivo.
* **Status da Inscrição:** Acompanhamento em tempo real (Pendente/Aprovado).
* **Edição de Perfil:** Atualização de dados cadastrais (reseta o status para nova análise).
* **Inscrição em Eventos:** Visualização e inscrição/desinscrição em atividades disponíveis.

---

## 🛠 Tecnologias Utilizadas

### Backend
* **Linguagem:** Python 3.8+
* **Framework:** Flask
* **Banco de Dados:** MySQL (via SQLAlchemy)
* **Autenticação:** Flask-JWT-Extended & Bcrypt
* **Outros:** Python-Dotenv, Faker (para dados de teste)

### Frontend
* **Biblioteca:** React.js
* **Estilização:** CSS Modules (Design Responsivo e Moderno)
* **Gráficos:** Chart.js & React-Chartjs-2
* **Notificações:** React-Toastify
* **Rotas:** React Router Dom v6
* **Utilitários:** Date-fns, React Input Mask

---

## 🚀 Guia de Instalação e Execução

### Pré-requisitos
* Python instalado e adicionado ao PATH.
* Node.js (v16 ou superior).
* MySQL Server rodando (recomendado XAMPP ou Workbench).

### 1. Configuração do Banco de Dados e Backend

1.  Acesse a pasta `backend`.
2.  Crie um arquivo chamado `.env` e configure suas credenciais:
    ```env
    JWT_SECRET_KEY=sua_chave_secreta_aqui
    DATABASE_URL=mysql+pymysql://root:SUA_SENHA@localhost:3306/socioeducativo_db
    ```
    *(Se usar XAMPP sem senha, deixe vazio após os dois pontos: `root:@localhost...`)*

3.  Instale as dependências:
    ```bash
    pip install flask flask-cors flask-sqlalchemy flask-bcrypt flask-jwt-extended pymysql python-dotenv faker
    ```

4.  **Inicialize o Banco de Dados:**
    Utilize o script automatizado para criar as tabelas e usuários padrão.
    ```bash
    python gerenciador_banco.py
    ```
    * Escolha a **Opção 2 (PREPARAR DEMO)** para criar o banco, admin padrão e dados de teste.

5.  Inicie o servidor:
    ```bash
    python app.py
    ```
    *O servidor rodará em `http://127.0.0.1:5000`.*

### 2. Configuração do Frontend

1.  Em um novo terminal, acesse a pasta `frontend/trabalho_socio`.
2.  Instale as dependências (apenas na primeira vez):
    ```bash
    npm install
    ```
3.  Inicie a aplicação:
    ```bash
    npm start
    ```
    *O site abrirá em `http://localhost:3000`.*

---

## 🔑 Dados de Acesso Padrão

Após rodar o `gerenciador_banco.py` (Opção 2), utilize:

| Tipo | CPF | Senha |
| :--- | :--- | :--- |
| **Administrador Master** | `000.000.000-00` | `admin` |
| **Usuário Comum** | `111.111.111-11` | `usuario123` |

---

## 📂 Estrutura do Projeto

/ ├── backend/ # API Python Flask │ ├── app.py # Código principal do servidor e rotas │ ├── gerenciador_banco.py# Script para resetar/popular banco │ └── .env # Variáveis de ambiente (não versionado) │ └── frontend/ # Interface React └── trabalho_socio/ ├── src/ │ ├── components/ # Loading, ProtectedRoute, etc. │ ├── pages/ # Páginas (Login, Dashboard, Cadastro, etc.) │ ├── styles/ # Arquivos CSS │ └── assets/ # Imagens e Logos └── package.json /

## 🤝 Autores

Projeto desenvolvido como parte do projeto de extensão **"Fábrica de Software"** da UNISAGRADO.

* **Ana Nabeiro Junc**
* **Emerson Mazzeto**
* **Gabriel Furlaneto de Luiz**
* **Gabriel Martielo da Silva**
* **João Vitor de Paula Diniz**

---

**Orientador:** Prof. Dr. Elvio Gilberto da Silva
