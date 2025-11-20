CREATE DATABASE IF NOT EXISTS socioeducativo_db;
USE socioeducativo_db;

-- Tabela de Usuários (para acesso ao sistema)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cpf VARCHAR(14) NOT NULL UNIQUE, -- CPF formatado
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Principal de Participantes (Dados do Formulário)
CREATE TABLE IF NOT EXISTS participantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT, -- Relaciona com o login (opcional, se o próprio usuário se cadastrar)
    
    -- Identificação
    nome_completo VARCHAR(150) NOT NULL,
    data_nascimento DATE,
    sexo ENUM('Masculino', 'Feminino', 'Outro'),
    nis VARCHAR(20),
    uf_naturalidade CHAR(2),
    naturalidade_cidade VARCHAR(100),
    endereco TEXT,
    
    -- Documentos
    rg VARCHAR(20),
    orgao_emissor VARCHAR(20),
    uf_rg CHAR(2),
    
    -- Certidão
    certidao_fls VARCHAR(20),
    certidao_livro VARCHAR(20),
    data_registro_certidao DATE,
    
    -- Responsável Legal
    nome_responsavel VARCHAR(150),
    nis_responsavel VARCHAR(20),
    rg_responsavel VARCHAR(20),
    cpf_responsavel VARCHAR(14),
    
    -- Dados Escolares
    situacao_escolar ENUM('frequenta', 'nao_frequenta'),
    tempo_fora_escola VARCHAR(50),
    frequenta_eja BOOLEAN,
    eja_segmento VARCHAR(10),
    eja_semestre VARCHAR(10),
    nome_escola VARCHAR(100),
    escolaridade VARCHAR(50),
    serie VARCHAR(20),
    turno VARCHAR(20),
    
    -- Entidade e Encaminhamento
    nome_entidade VARCHAR(100),
    tecnico_referencia VARCHAR(100),
    cras_referencia VARCHAR(100),
    
    -- Dados Familiares e Saúde
    chefe_familia VARCHAR(50),
    religiao_familia VARCHAR(50),
    renda_familiar DECIMAL(10,2),
    medicamento_uso TEXT,
    alergia_descricao TEXT,
    
    -- Contato
    telefone_contato VARCHAR(20),
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabela para os Membros Familiares (1 para Muitos)
CREATE TABLE IF NOT EXISTS familiares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participante_id INT NOT NULL,
    nome VARCHAR(150),
    parentesco VARCHAR(50),
    idade INT,
    FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE CASCADE
);

-- Tabela para Checkboxes (Ex: Benefícios que a família recebe)
-- Isso evita colunas como "beneficio1", "beneficio2"
CREATE TABLE IF NOT EXISTS beneficios_participante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participante_id INT NOT NULL,
    nome_beneficio VARCHAR(100),
    FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE CASCADE
);
