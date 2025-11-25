import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, datetime
from sqlalchemy import func, or_
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- CONFIGURAÇÕES ---
# Segurança: Chave secreta carregada do ambiente ou fallback para dev
# AVISO: Em produção, use sempre o arquivo .env
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', '6a4b12c7d9e0f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8) # Aumentei para 8h (turno de trabalho)

# Banco de Dados: Carrega do ambiente ou fallback
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:senha@localhost:3306/socioeducativo_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ==============================================================================
# MODELOS DE DADOS (Mapeamento das Tabelas)
# ==============================================================================

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # Relacionamento
    participantes_adicionados = db.relationship('Participante', backref='adicionado_por', lazy=True)
    
    def to_dict(self):
        return {'id': self.id, 'nome': self.nome, 'email': self.email, 'cpf': self.cpf}

class Participante(db.Model):
    class Participante(db.Model):
        __tablename__ = 'participantes'

        id = db.Column(db.Integer, primary_key=True)
        usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id', ondelete='SET NULL'))
        status = db.Column(db.String(20), default='pendente') 

    # ==========================================================================
    # 1. IDENTIFICAÇÃO E LOCALIDADE
    # ==========================================================================
        nome_completo = db.Column(db.String(150), nullable=False)
        cpf = db.Column(db.String(14), unique=True)
        data_nascimento = db.Column(db.Date)
        sexo = db.Column(db.Enum('Masculino', 'Feminino', 'Outro'))
        nis = db.Column(db.String(20))
    
        uf_naturalidade = db.Column(db.String(2))
        naturalidade_cidade = db.Column(db.String(100))
        endereco = db.Column(db.Text)
    
    # ==========================================================================
    # 2. DOCUMENTOS
    # ==========================================================================
        rg = db.Column(db.String(20))
        orgao_emissor = db.Column(db.String(20))
        uf_rg = db.Column(db.String(2))
        certidao_fls = db.Column(db.String(20))
    
    # ==========================================================================
    # 3. RESPONSÁVEIS
    # ==========================================================================
        nome_responsavel = db.Column(db.String(150))
        cpf_responsavel = db.Column(db.String(14))
        nis_responsavel = db.Column(db.String(20))
        rg_responsavel = db.Column(db.String(20))
    
    # ==========================================================================
    # 4. DADOS ESCOLARES
    # ==========================================================================
        situacao_escolar = db.Column(db.Enum('frequenta', 'nao_frequenta'))
        frequenta_eja = db.Column(db.Boolean)
        serie = db.Column(db.String(20))
        eja_semestre = db.Column(db.String(10))
        nome_escola = db.Column(db.String(100))
    
    # ==========================================================================
    # 5. ENCAMINHAMENTO E ENTIDADE
    # ==========================================================================
    # Nota: 'orgao_demandante' é uma lista, feita pela relação 'orgaos_demandantes' no final
        orgao_demandante_outro = db.Column(db.String(100))
        cras_referencia = db.Column(db.String(100))
        tecnico_referencia = db.Column(db.String(100))
        nome_entidade = db.Column(db.String(100))
        endereco_entidade = db.Column(db.Text)
        email_entidade = db.Column(db.String(120))
        telefone_entidade = db.Column(db.String(20))
        responsavel_preenchimento = db.Column(db.String(100))

    # ==========================================================================
    # 6. DADOS DA FAMÍLIA
    # ==========================================================================
        chefe_familia = db.Column(db.String(50))
        chefe_familia_outro = db.Column(db.String(50))
        religiao_familia = db.Column(db.String(50))
        local_trabalho_familia = db.Column(db.String(100))
        renda_familiar = db.Column(db.Numeric(10, 2))
        familia_possui_deficiencia = db.Column(db.Boolean)
        deficiente_sexo = db.Column(db.String(20))
        deficiente_faixa_etaria = db.Column(db.String(20))

    # ==========================================================================
    # 7. SAÚDE E CONTATO
    # ==========================================================================
        medicamento_uso = db.Column(db.Text)
        alergia_descricao = db.Column(db.Text)
        tecnico_responsavel = db.Column(db.String(100))
        responsavel_geral = db.Column(db.String(100))
        telefone_contato = db.Column(db.String(20))
        bpc_deficiencia_especificar = db.Column(db.Text)

    # ==========================================================================
    # RELAÇÕES (Listas / Checkboxes)
    # ==========================================================================
        familiares = db.relationship('Familiar', backref='participante', lazy=True)
        beneficios = db.relationship('BeneficioParticipante', backref='participante', lazy=True) 
        orgaos_demandantes = db.relationship('OrgaoDemandanteParticipante', backref='participante', lazy=True)

    def to_dict(self):
        # Formata a data para string se ela existir
        data_nasc_formatada = self.data_nascimento.strftime('%Y-%m-%d') if self.data_nascimento else None
        
        # Converte Decimal para float para ser compatível com JSON
        renda = float(self.renda_familiar) if self.renda_familiar else 0.0

        return {
            'id': self.id,
            'nomeCompleto': self.nome_completo,
            'cpf': self.cpf,
            'dataNascimento': data_nasc_formatada,
            'sexo': self.sexo,
            'nis': self.nis,
            'status': self.status,
            
            'ufNaturalidade': self.uf_naturalidade,
            'naturalidadeCidade': self.naturalidade_cidade,
            'endereco': self.endereco,
            
            'rg': self.rg,
            'orgaoEmissor': self.orgao_emissor,
            'ufRg': self.uf_rg,
            'certidaoFls': self.certidao_fls,
            
            'nomeResponsavel': self.nome_responsavel,
            'cpfResponsavel': self.cpf_responsavel,
            'nisResponsavel': self.nis_responsavel,
            'rgResponsavel': self.rg_responsavel,
            
            'situacao_escolar': self.situacao_escolar,
            'frequenta_eja': self.frequenta_eja,
            'serie': self.serie,
            'eja_semestre': self.eja_semestre,
            'nome_escola': self.nome_escola,
            
            'orgaoDemandante': [o.nome_orgao for o in self.orgaos_demandantes],
            'orgaoDemandanteOutro': self.orgao_demandante_outro,
            'crasReferencia': self.cras_referencia,
            'tecnicoReferencia': self.tecnico_referencia,
            'nomeEntidade': self.nome_entidade,
            'enderecoEntidade': self.endereco_entidade,
            'emailEntidade': self.email_entidade,
            'telefoneEntidade': self.telefone_entidade,
            'responsavelPreenchimento': self.responsavel_preenchimento,
            
            'chefeFamilia': self.chefe_familia,
            'chefeFamiliaOutro': self.chefe_familia_outro,
            'religiaoFamilia': self.religiao_familia,
            'localTrabalhoFamilia': self.local_trabalho_familia,
            'rendaFamiliar': renda,
            'familiaPossuiDeficiencia': self.familia_possui_deficiencia,
            'deficienteSexo': self.deficiente_sexo,
            'deficienteFaixaEtaria': self.deficiente_faixa_etaria,
            'familiares': [{'nome': f.nome, 'parentesco': f.parentesco, 'idade': f.idade} for f in self.familiares],
            
            'medicamentoUso': self.medicamento_uso,
            'alergiaDescricao': self.alergia_descricao,
            'tecnicoResponsavel': self.tecnico_responsavel,
            'responsavelGeral': self.responsavel_geral,
            'telefoneContato': self.telefone_contato,
            'bpcDeficienciaEspecificar': self.bpc_deficiencia_especificar,
            'beneficios': [b.nome_beneficio for b in self.beneficios]
        }


class Familiar(db.Model):
    __tablename__ = 'familiares'
    id = db.Column(db.Integer, primary_key=True)
    participante_id = db.Column(db.Integer, db.ForeignKey('participantes.id', ondelete='CASCADE'), nullable=False)
    nome = db.Column(db.String(150))
    parentesco = db.Column(db.String(50))
    idade = db.Column(db.Integer)

class BeneficioParticipante(db.Model):
    __tablename__ = 'beneficios_participante'
    id = db.Column(db.Integer, primary_key=True)
    participante_id = db.Column(db.Integer, db.ForeignKey('participantes.id', ondelete='CASCADE'), nullable=False)
    nome_beneficio = db.Column(db.String(100))

class OrgaoDemandanteParticipante(db.Model):
    __tablename__ = 'orgaos_demandantes_participantes'
    id = db.Column(db.Integer, primary_key=True)
    participante_id = db.Column(db.Integer, db.ForeignKey('participantes.id', ondelete='CASCADE'), nullable=False)
    nome_orgao = db.Column(db.String(100))

# ==============================================================================
# ROTAS (API)
# ==============================================================================

# 1. LOGIN
@app.route("/api/login", methods=['POST'])
def login():
    dados = request.get_json()
    cpf = dados.get('cpf')
    senha = dados.get('senha')

    # Verifica se veio os dados
    if not cpf or not senha:
        return jsonify({"msg": "CPF e Senha são obrigatórios"}), 400

    usuario = Participante.query.filter_by(cpf=cpf).first()

    if usuario and bcrypt.check_password_hash(usuario.password_hash, senha):
        # Cria token
        access_token = create_access_token(identity=usuario.cpf)
        return jsonify({
            'access_token': access_token, 
            'nome': usuario.nome,
            'cpf': usuario.cpf
        }), 200

    return jsonify({"msg": "Credenciais inválidas"}), 401


# 2. CADASTRO DE USUÁRIO (Quem usa o sistema)
# Nota: Mudei a rota para não conflitar com o login!
@app.route("/api/cadastro-usuario", methods=['POST'])
def cadastro_usuario():
    dados = request.get_json()
    email = dados.get('email')
    cpf = dados.get('cpf')
    senha = dados.get('senha')
    nome = dados.get('nome')
    
    # Validações
    if not all([email, cpf, senha, nome]):
        return jsonify({"msg": "Dados incompletos."}), 400

    if Usuario.query.filter_by(cpf=cpf).first():
        return jsonify({"msg": "CPF já cadastrado."}), 409
    if Usuario.query.filter_by(email=email).first():
        return jsonify({"msg": "E-mail já cadastrado."}), 409
        
    novo_usuario = Usuario(
        email=email,
        cpf=cpf,
        password_hash=bcrypt.generate_password_hash(senha).decode('utf-8'),
        nome=nome
    )

    try:
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify({"msg": "Usuário cadastrado com sucesso!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Erro ao criar usuário", "error": str(e)}), 500


# 3. CADASTRO DE PARTICIPANTE (O Formulário Grande)
@app.route("/api/cadastro", methods=['POST'])
@jwt_required()
def cadastrar_participante():
    dados = request.get_json()
    
    # Identifica quem está cadastrando
    cpf_usuario_logado = get_jwt_identity()
    usuario_logado = Usuario.query.filter_by(cpf=cpf_usuario_logado).first()

    # Tratamento de Data (Evita erro se vier vazio ou formato errado)
    data_nasc = None
    if dados.get('dataNascimento'):
        try:
            # Tenta converter string 'YYYY-MM-DD' para objeto date
            data_nasc = datetime.strptime(dados.get('dataNascimento'), '%Y-%m-%d').date()
        except ValueError:
            pass # Se der erro, salva como None ou trate o erro

    try:
        novo_participante = Participante(
            usuario_id=usuario_logado.id if usuario_logado else None,
            status='pendente', # Começa sempre como pendente
            
            # --- Mapeamento de Campos ---
            nome_completo=dados.get('nomeCompleto'),
            cpf=dados.get('cpf'),
            data_nascimento=data_nasc,
            sexo=dados.get('sexo'),
            nis=dados.get('nis'),
            uf_naturalidade=dados.get('ufNaturalidade'),
            naturalidade_cidade=dados.get('naturalidadeCidade'),
            endereco=dados.get('endereco'),
            rg=dados.get('rg'),
            orgao_emissor=dados.get('orgaoEmissor'),
            uf_rg=dados.get('ufRg'),
            certidao_fls=dados.get('certidaoFls'),
            nome_responsavel=dados.get('nomeResponsavel'),
            cpf_responsavel=dados.get('cpfResponsavel'),
            nis_responsavel=dados.get('nisResponsavel'),
            rg_responsavel=dados.get('rgResponsavel'),
            situacao_escolar=dados.get('situacao_escolar'),
            serie=dados.get('serie'),
            frequenta_eja=(dados.get('frequenta_eja') == 'true'), # Conversão segura
            eja_semestre=dados.get('eja_semestre'),
            orgao_demandante_outro=dados.get('orgaoDemandanteOutro'),
            cras_referencia=dados.get('crasReferencia'),
            tecnico_referencia=dados.get('tecnicoReferencia'),
            nome_entidade=dados.get('nomeEntidade'),
            endereco_entidade=dados.get('enderecoEntidade'),
            email_entidade=dados.get('emailEntidade'),
            telefone_entidade=dados.get('telefoneEntidade'),
            responsavel_preenchimento=dados.get('responsavelPreenchimento'),
            chefe_familia=dados.get('chefeFamilia'),
            chefe_familia_outro=dados.get('chefeFamiliaOutro'),
            religiao_familia=dados.get('religiaoFamilia'),
            local_trabalho_familia=dados.get('localTrabalhoFamilia'),
            
            # Conversão de Número
            renda_familiar=float(dados.get('rendaFamiliar')) if dados.get('rendaFamiliar') else 0.0,
            
            familia_possui_deficiencia=(dados.get('familiaPossuiDeficiencia') == 'true'),
            deficiente_sexo=dados.get('deficienteSexo'),
            deficiente_faixa_etaria=dados.get('deficienteFaixaEtaria'),
            medicamento_uso=dados.get('medicamentoUso'),
            alergia_descricao=dados.get('alergiaDescricao'),
            tecnico_responsavel=dados.get('tecnicoResponsavel'),
            responsavel_geral=dados.get('responsavelGeral'),
            telefone_contato=dados.get('telefoneContato'),
            bpc_deficiencia_especificar=dados.get('bpcDeficienciaEspecificar')
        )
        
        db.session.add(novo_participante)
        db.session.flush() # Gera o ID para usar nas relações abaixo

        # Salvar Listas (Arrays)
        if dados.get('beneficios'):
            for ben in dados.get('beneficios'):
                db.session.add(BeneficioParticipante(participante_id=novo_participante.id, nome_beneficio=ben))
        
        if dados.get('orgaoDemandante'):
            for org in dados.get('orgaoDemandante'):
                db.session.add(OrgaoDemandanteParticipante(participante_id=novo_participante.id, nome_orgao=org))

        db.session.commit()
        return jsonify({"msg": "Participante cadastrado com sucesso!", "id": novo_participante.id}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Erro Backend: {e}") # Mostra no terminal do Flask
        return jsonify({"msg": "Erro ao salvar participante.", "erro": str(e)}), 500


# 4. DASHBOARD (Dados Agregados)
@app.route("/api/dashboard", methods=['GET'])
@jwt_required()
def dashboard():
    cpf_usuario_atual = get_jwt_identity()
    usuario_atual = Usuario.query.filter_by(cpf=cpf_usuario_atual).first_or_404()

    try:
        # 1. Total de Participantes
        total_participantes = db.session.query(func.count(Participante.id)).scalar() or 0
        
        # 2. Famílias com PNE
        familias_pne = db.session.query(func.count(Participante.id))\
            .filter(Participante.familia_possui_deficiencia == True).scalar() or 0
        
        # 3. Pendentes (Baseado no status 'pendente')
        pending_registrations = db.session.query(func.count(Participante.id))\
            .filter(Participante.status == 'pendente').scalar() or 0

        # 4. Público Prioritário (Ex: Fora da escola OU Renda Baixa)
        # Ajuste a renda conforme sua regra de negócio (ex: < 500)
        priority_audience = db.session.query(func.count(Participante.id)).filter(
            or_(
                Participante.situacao_escolar == 'nao_frequenta',
                Participante.renda_familiar < 500 
            )
        ).scalar() or 0

        # 5. Últimas Matrículas
        recentes_db = Participante.query.order_by(Participante.id.desc()).limit(5).all()
        recentes_json = [{
            'id': p.id, 
            'name': p.nome_completo, 
            # Formata data para exibir no front
            'date': p.data_nascimento.strftime('%d/%m/%Y') if p.data_nascimento else "N/D"
        } for p in recentes_db]

        # 6. Gráfico: Origem dos Encaminhamentos
        encaminhamentos_db = db.session.query(
            OrgaoDemandanteParticipante.nome_orgao, 
            func.count(OrgaoDemandanteParticipante.id)
        ).group_by(OrgaoDemandanteParticipante.nome_orgao).all()

        encaminhamentos_data = {
            'labels': [r[0] for r in encaminhamentos_db],
            'values': [r[1] for r in encaminhamentos_db]
        }

        # 7. Gráfico: Público Alvo (Exemplo por Sexo)
        sexo_db = db.session.query(
            Participante.sexo,
            func.count(Participante.id)
        ).group_by(Participante.sexo).all()

        publico_alvo_data = {
            'labels': [r[0] for r in sexo_db],
            'values': [r[1] for r in sexo_db]
        }

        return jsonify({
            'mensagem': f'Bem-vindo, {usuario_atual.nome}!',
            'dados_usuario': usuario_atual.to_dict(),
            'totalParticipants': total_participantes,
            'capacity': 200,
            'familiasPNE': familias_pne,
            'pendingRegistrations': pending_registrations,
            'priorityAudience': priority_audience,
            'recentRegistrations': recentes_json,
            'pendingTasks': [],
            'encaminhamentosData': encaminhamentos_data,
            'publicoAlvoData': publico_alvo_data
        }), 200

    except Exception as e:
        print(f"Erro Dashboard: {e}")
        return jsonify({"msg": "Erro ao carregar dashboard", "erro": str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)