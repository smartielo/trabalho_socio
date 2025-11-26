import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, datetime
from sqlalchemy import func, or_
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) # Permite que o React (porta 3000) fale com o Flask (porta 5000)

# --- CONFIGURAÇÕES ---
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'chave-secreta-super-segura-trocar-em-prod')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)

# IMPORTANTE: Ajuste a senha do banco aqui se não usar .env
# Formato: mysql+pymysql://usuario:senha@localhost:3306/nome_banco
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:root@localhost:3306/socioeducativo_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ==============================================================================
# MODELOS DE DADOS
# ==============================================================================

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {'id': self.id, 'nome': self.nome, 'email': self.email, 'cpf': self.cpf}


class Participante(db.Model):
    __tablename__ = 'participantes' #CORREÇÃO: Removida a classe duplicada

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id', ondelete='SET NULL'))
    status = db.Column(db.String(20), default='pendente') 

    # 1. IDENTIFICAÇÃO E LOCALIDADE
    nome_completo = db.Column(db.String(150), nullable=False)
    cpf = db.Column(db.String(14), unique=True)
    data_nascimento = db.Column(db.Date)
    sexo = db.Column(db.Enum('Masculino', 'Feminino', 'Outro'))
    nis = db.Column(db.String(20))
    uf_naturalidade = db.Column(db.String(2))
    naturalidade_cidade = db.Column(db.String(100))
    endereco = db.Column(db.Text)
    
    # 2. DOCUMENTOS
    rg = db.Column(db.String(20))
    orgao_emissor = db.Column(db.String(20))
    uf_rg = db.Column(db.String(2))
    certidao_fls = db.Column(db.String(20))
    
    # 3. RESPONSÁVEIS
    nome_responsavel = db.Column(db.String(150))
    cpf_responsavel = db.Column(db.String(14))
    nis_responsavel = db.Column(db.String(20))
    rg_responsavel = db.Column(db.String(20))
    
    # 4. DADOS ESCOLARES
    situacao_escolar = db.Column(db.Enum('frequenta', 'nao_frequenta'))
    frequenta_eja = db.Column(db.Boolean)
    serie = db.Column(db.String(20))
    eja_semestre = db.Column(db.String(10))
    nome_escola = db.Column(db.String(100))
    turno = db.Column(db.String(20))
    
    # 5. ENCAMINHAMENTO E ENTIDADE
    orgao_demandante_outro = db.Column(db.String(100))
    cras_referencia = db.Column(db.String(100))
    tecnico_referencia = db.Column(db.String(100))
    nome_entidade = db.Column(db.String(100))
    endereco_entidade = db.Column(db.Text)
    email_entidade = db.Column(db.String(120))
    telefone_entidade = db.Column(db.String(20))
    responsavel_preenchimento = db.Column(db.String(100))

    # 6. DADOS DA FAMÍLIA
    chefe_familia = db.Column(db.String(50))
    chefe_familia_outro = db.Column(db.String(50))
    religiao_familia = db.Column(db.String(50))
    local_trabalho_familia = db.Column(db.String(100))
    renda_familiar = db.Column(db.Numeric(10, 2))
    familia_possui_deficiencia = db.Column(db.Boolean)
    deficiente_sexo = db.Column(db.String(20))
    deficiente_faixa_etaria = db.Column(db.String(20))

    # 7. SAÚDE E CONTATO
    medicamento_uso = db.Column(db.Text)
    alergia_descricao = db.Column(db.Text)
    tecnico_responsavel = db.Column(db.String(100))
    responsavel_geral = db.Column(db.String(100))
    telefone_contato = db.Column(db.String(20))
    bpc_deficiencia_especificar = db.Column(db.Text)

    # RELAÇÕES
    familiares = db.relationship('Familiar', backref='participante', lazy=True)
    beneficios = db.relationship('BeneficioParticipante', backref='participante', lazy=True) 
    orgaos_demandantes = db.relationship('OrgaoDemandanteParticipante', backref='participante', lazy=True)
    
    # Relacionamento reverso para saber quem cadastrou
    adicionado_por = db.relationship('Usuario', backref=db.backref('participantes', lazy=True))

    def to_dict(self):
        # Formatações seguras (com verificação de None)
        nasc = "N/D"
        if self.data_nascimento:
            nasc = self.data_nascimento.strftime('%d/%m/%Y')

        renda = "R$ 0,00"
        if self.renda_familiar is not None:
            try:
                val = float(self.renda_familiar)
                renda = f"R$ {val:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
            except:
                renda = "R$ 0,00"

        # Listas seguras
        lista_orgaos = [o.nome_orgao for o in self.orgaos_demandantes] if self.orgaos_demandantes else []
        lista_beneficios = [b.nome_beneficio for b in self.beneficios] if self.beneficios else []
        lista_familiares = [{'nome': f.nome, 'parentesco': f.parentesco, 'idade': f.idade} for f in self.familiares] if self.familiares else []

        return {
            'id': self.id,
            'status': self.status or 'pendente',
            
            # Identificação
            'nomeCompleto': self.nome_completo or '',
            'cpf': self.cpf or '',
            'dataNascimento': nasc,
            'sexo': self.sexo or '',
            'nis': self.nis or '',
            'ufNaturalidade': self.uf_naturalidade or '',
            'naturalidadeCidade': self.naturalidade_cidade or '',
            'endereco': self.endereco or '',
            'rg': self.rg or '',
            'orgaoEmissor': self.orgao_emissor or '',
            
            # Responsável
            'nomeResponsavel': self.nome_responsavel or '',
            'cpfResponsavel': self.cpf_responsavel or '',
            'rgResponsavel': self.rg_responsavel or '',
            'nisResponsavel': self.nis_responsavel or '',
            
            # Escolar
            'situacao_escolar': self.situacao_escolar or '',
            'nome_escola': self.nome_escola or '',
            'serie': self.serie or '',
            'turno': self.turno or '', # Campo novo
            'frequenta_eja': "Sim" if self.frequenta_eja else "Não",
            
            # Social
            'crasReferencia': self.cras_referencia or '',
            'tecnicoReferencia': self.tecnico_referencia or '',
            'orgaosDemandantes': lista_orgaos,
            
            # Família
            'chefeFamilia': self.chefe_familia or '',
            'rendaFamiliar': renda,
            'beneficios': lista_beneficios,
            'familiaPossuiDeficiencia': "Sim" if self.familia_possui_deficiencia else "Não",
            
            # Saúde e Contato
            'medicamentoUso': self.medicamento_uso or '',
            'alergiaDescricao': self.alergia_descricao or '',
            'tecnicoResponsavel': self.tecnico_responsavel or '',
            'telefoneContato': self.telefone_contato or '',

            # Lista
            'familiares': lista_familiares
        }
class Familiar(db.Model):
    __tablename__ = 'familiares'
    id = db.Column(db.Integer, primary_key=True)
    participante_id = db.Column(db.Integer, db.ForeignKey('participantes.id', ondelete='CASCADE'), nullable=False)
    nome = db.Column(db.String(150))
    parentesco = db.Column(db.String(50))
    idade = db.Column(db.Integer)
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'parentesco': self.parentesco,
            'idade': self.idade
        }

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

# 1. LOGIN (CORRIGIDO)
@app.route("/api/login", methods=['POST'])
def login():
    dados = request.get_json()
    cpf = dados.get('cpf')
    senha = dados.get('senha')

    if not cpf or not senha:
        return jsonify({"msg": "CPF e Senha são obrigatórios"}), 400

    # CORREÇÃO: Busca na tabela de USUÁRIOS, não de participantes
    usuario = Usuario.query.filter_by(cpf=cpf).first()

    if usuario and bcrypt.check_password_hash(usuario.password_hash, senha):
        access_token = create_access_token(identity=usuario.cpf)
        return jsonify({
            'access_token': access_token, 
            'nome': usuario.nome,
            'cpf': usuario.cpf
        }), 200

    return jsonify({"msg": "Credenciais inválidas"}), 401

# 2. CADASTRO DE USUÁRIO (Funcionários)
@app.route("/api/cadastro-usuario", methods=['POST'])
def cadastro_usuario():
    dados = request.get_json()
    email = dados.get('email')
    cpf = dados.get('cpf')
    senha = dados.get('senha')
    nome = dados.get('nome')
    
    if not all([email, cpf, senha, nome]):
        return jsonify({"msg": "Dados incompletos."}), 400

    if Usuario.query.filter_by(cpf=cpf).first():
        return jsonify({"msg": "CPF já cadastrado."}), 409
    
    hashed_password = bcrypt.generate_password_hash(senha).decode('utf-8')
    novo_usuario = Usuario(email=email, cpf=cpf, password_hash=hashed_password, nome=nome)

    try:
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify({"msg": "Usuário cadastrado com sucesso!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Erro ao criar usuário", "error": str(e)}), 500

# 3. CADASTRO DE PARTICIPANTE (O Formulário)
@app.route("/api/cadastro", methods=['POST'])
# Removi o @jwt_required() temporariamente para facilitar seu teste, 
# mas idealmente deve ter se for um sistema fechado.
# Se quiser proteger, descomente a linha abaixo:
# @jwt_required() 
def cadastrar_participante():
    dados = request.get_json()
    
    # Se estiver usando JWT, descomente:
    # cpf_usuario_logado = get_jwt_identity()
    # usuario_logado = Usuario.query.filter_by(cpf=cpf_usuario_logado).first()
    usuario_logado = None # Fallback se não tiver login

    data_nasc = None
    if dados.get('dataNascimento'):
        try:
            data_nasc = datetime.strptime(dados.get('dataNascimento'), '%Y-%m-%d').date()
        except ValueError:
            pass 

    try:
        novo_participante = Participante(
            usuario_id=usuario_logado.id if usuario_logado else None,
            status='pendente',
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
            frequenta_eja=(dados.get('frequenta_eja') == 'sim'), # Ajustado para coincidir com o frontend
            eja_semestre=dados.get('eja_semestre'),
            nome_escola=dados.get('nome_escola'), # Adicionei este campo que faltava no seu snippet
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
            renda_familiar=float(dados.get('rendaFamiliar').replace('R$', '').replace('.', '').replace(',', '.')) if dados.get('rendaFamiliar') else 0.0,
            familia_possui_deficiencia=(dados.get('familiaPossuiDeficiencia') == 'sim'),
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
        db.session.flush() 

        # Salvar Listas
        if dados.get('beneficios'):
            for ben in dados.get('beneficios'):
                db.session.add(BeneficioParticipante(participante_id=novo_participante.id, nome_beneficio=ben))
        
        # Salvar Órgãos Demandantes
        if dados.get('orgaoDemandante'):
            for org in dados.get('orgaoDemandante'):
                db.session.add(OrgaoDemandanteParticipante(participante_id=novo_participante.id, nome_orgao=org))
        
        if dados.get('familyMembers'):
            for fam in dados.get('familyMembers'):
                # Validação básica para não salvar linhas vazias
                if fam.get('nome'):
                    idade = int(fam.get('idade')) if fam.get('idade') else None
                    db.session.add(Familiar(
                        participante_id=novo_participante.id, 
                        nome=fam.get('nome'), 
                        parentesco=fam.get('parentesco'), 
                        idade=idade
                    ))

        # --- CORREÇÃO: Salvar Familiares (Isso estava faltando) ---
        # Verifica se o frontend enviou 'familyMembers' ou 'familiares' (ajuste conforme o JSON)
        lista_familiares = dados.get('familyMembers') or dados.get('familiares')
        if lista_familiares:
            for fam in lista_familiares:
                # Só salva se tiver nome preenchido
                if fam.get('nome'): 
                    idade_valida = int(fam.get('idade')) if fam.get('idade') else None
                    db.session.add(Familiar(
                        participante_id=novo_participante.id, 
                        nome=fam.get('nome'), 
                        parentesco=fam.get('parentesco'), 
                        idade=idade_valida
                    ))

        db.session.commit()
        return jsonify({"msg": "Participante cadastrado com sucesso!", "id": novo_participante.id}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Erro Backend: {e}")
        return jsonify({"msg": "Erro ao salvar participante.", "erro": str(e)}), 500

# 4. DASHBOARD
@app.route("/api/dashboard", methods=['GET'])
@jwt_required()
def dashboard():
    cpf_usuario_atual = get_jwt_identity()
    usuario_atual = Usuario.query.filter_by(cpf=cpf_usuario_atual).first()
    
    if not usuario_atual:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    try:
        total_participantes = db.session.query(func.count(Participante.id)).scalar() or 0
        
        familias_pne = db.session.query(func.count(Participante.id))\
            .filter(Participante.familia_possui_deficiencia == True).scalar() or 0
        
        pending_registrations = db.session.query(func.count(Participante.id))\
            .filter(Participante.status == 'pendente').scalar() or 0

        priority_audience = db.session.query(func.count(Participante.id)).filter(
            or_(
                Participante.situacao_escolar == 'nao_frequenta',
                Participante.renda_familiar < 500 
            )
        ).scalar() or 0

        recentes_db = Participante.query.order_by(Participante.id.desc()).limit(5).all()
        recentes_json = [{
            'id': p.id, 
            'name': p.nome_completo, 
            'date': p.data_nascimento.strftime('%d/%m/%Y') if p.data_nascimento else "N/D"
        } for p in recentes_db]

        # Gráficos
        encaminhamentos_db = db.session.query(
            OrgaoDemandanteParticipante.nome_orgao, 
            func.count(OrgaoDemandanteParticipante.id)
        ).group_by(OrgaoDemandanteParticipante.nome_orgao).all()

        encaminhamentos_data = {
            'labels': [r[0] for r in encaminhamentos_db],
            'values': [r[1] for r in encaminhamentos_db]
        }

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

    # 5. BUSCAR PARTICIPANTE POR ID (Para a página de Perfil)

    # 5. BUSCAR PARTICIPANTE POR ID
@app.route("/api/participantes/<int:id>", methods=['GET'])
def get_participante(id):
    participante = Participante.query.get(id)
    if participante:
        return jsonify(participante.to_dict()), 200
    return jsonify({"msg": "Participante não encontrado"}), 404

# 6. LISTAR TODOS OS PARTICIPANTES (Para Exportação de Planilha)
@app.route("/api/participantes/todos", methods=['GET'])
# @jwt_required() 
def get_todos_participantes():
    # Busca todos no banco
    participantes = Participante.query.all()
    # Converte para lista de dicionários
    lista = [p.to_dict() for p in participantes]
    return jsonify(lista), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)