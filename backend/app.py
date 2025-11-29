import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, datetime
from sqlalchemy import func, or_
from dotenv import load_dotenv

# Carrega o arquivo .env
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Usa as variáveis do .env (ou valor padrão se não achar)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fallback_secret_key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:root@localhost:3306/socioeducativo_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- MODELOS ---

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    password_hash = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.String(20), default='comum', nullable=False)

    def to_dict(self):
        return {'id': self.id, 'nome': self.nome, 'email': self.email, 'cpf': self.cpf, 'tipo': self.tipo}

class ResetRequest(db.Model):
    __tablename__ = 'reset_requests'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    data_solicitacao = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pendente') 
    
    usuario = db.relationship('Usuario', backref=db.backref('reset_requests', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'usuario_nome': self.usuario.nome,
            'usuario_cpf': self.usuario.cpf,
            'data': self.data_solicitacao.strftime('%d/%m/%Y %H:%M'),
            'status': self.status
        }

inscricoes_eventos = db.Table('inscricoes_eventos',
    db.Column('participante_id', db.Integer, db.ForeignKey('participantes.id'), primary_key=True),
    db.Column('evento_id', db.Integer, db.ForeignKey('eventos.id'), primary_key=True),
    db.Column('data_inscricao', db.DateTime, default=datetime.utcnow)
)

class Evento(db.Model):
    __tablename__ = 'eventos'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(150), nullable=False)
    descricao = db.Column(db.Text)
    data_inicio = db.Column(db.DateTime, nullable=False)
    data_fim = db.Column(db.DateTime)
    local = db.Column(db.String(150))
    categoria = db.Column(db.String(50))
    imagem_url = db.Column(db.String(255))
    responsavel = db.Column(db.String(100)) # NOVO CAMPO
    
    participantes = db.relationship('Participante', secondary=inscricoes_eventos, lazy='subquery',
        backref=db.backref('eventos', lazy=True))

    def to_dict(self, participante_logado_id=None):
        inscrito = False
        if participante_logado_id:
            for p in self.participantes:
                if p.id == participante_logado_id:
                    inscrito = True
                    break
        
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'data_inicio': self.data_inicio.strftime('%Y-%m-%dT%H:%M'),
            'data_fim': self.data_fim.strftime('%Y-%m-%dT%H:%M') if self.data_fim else '',
            'local': self.local,
            'categoria': self.categoria,
            'imagem_url': self.imagem_url,
            'responsavel': self.responsavel or 'Não informado', # NOVO
            'inscrito': inscrito,
            'total_inscritos': len(self.participantes),
            'participantes_lista': [{'id': p.id, 'nome': p.nome_completo, 'rg': p.rg} for p in self.participantes] # Adicionei RG para a lista de presença
        }

class Participante(db.Model):
    __tablename__ = 'participantes'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id', ondelete='SET NULL'))
    status = db.Column(db.String(50), default='pendente') 

    nome_completo = db.Column(db.String(150), nullable=False)
    cpf = db.Column(db.String(14), unique=True)
    data_nascimento = db.Column(db.Date)
    sexo = db.Column(db.String(20))
    nis = db.Column(db.String(20))
    uf_naturalidade = db.Column(db.String(2))
    naturalidade_cidade = db.Column(db.String(100))
    endereco = db.Column(db.Text)
    rg = db.Column(db.String(20))
    orgao_emissor = db.Column(db.String(20))
    uf_rg = db.Column(db.String(2))
    
    nome_responsavel = db.Column(db.String(150))
    cpf_responsavel = db.Column(db.String(14))
    nis_responsavel = db.Column(db.String(20))
    rg_responsavel = db.Column(db.String(20))
    
    situacao_escolar = db.Column(db.String(20))
    frequenta_eja = db.Column(db.String(10)) 
    serie = db.Column(db.String(20))
    nome_escola = db.Column(db.String(100))
    turno = db.Column(db.String(20))
    
    orgao_demandante_outro = db.Column(db.String(100))
    cras_referencia = db.Column(db.String(100))
    tecnico_referencia = db.Column(db.String(100))
    nome_entidade = db.Column(db.String(100))
    endereco_entidade = db.Column(db.Text)
    email_entidade = db.Column(db.String(120))
    telefone_entidade = db.Column(db.String(20))
    responsavel_preenchimento = db.Column(db.String(100))

    chefe_familia = db.Column(db.String(50))
    religiao_familia = db.Column(db.String(50))
    local_trabalho_familia = db.Column(db.String(100))
    renda_familiar = db.Column(db.Numeric(10, 2))
    familia_possui_deficiencia = db.Column(db.String(10))
    deficiente_sexo = db.Column(db.String(20))
    deficiente_faixa_etaria = db.Column(db.String(20))

    medicamento_uso = db.Column(db.Text)
    alergia_descricao = db.Column(db.Text)
    tecnico_responsavel = db.Column(db.String(100))
    responsavel_geral = db.Column(db.String(100))
    telefone_contato = db.Column(db.String(50))
    
    familiares = db.relationship('Familiar', backref='participante', lazy=True)
    beneficios = db.relationship('BeneficioParticipante', backref='participante', lazy=True) 
    orgaos_demandantes = db.relationship('OrgaoDemandanteParticipante', backref='participante', lazy=True)
    
    def to_dict(self):
        nasc = "N/D"
        if self.data_nascimento:
            nasc = self.data_nascimento.strftime('%d/%m/%Y')

        renda = "R$ 0,00"
        if self.renda_familiar is not None:
            try:
                val = float(self.renda_familiar)
                renda = f"R$ {val:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
            except: pass

        lista_orgaos = [o.nome_orgao for o in self.orgaos_demandantes] if self.orgaos_demandantes else []
        lista_beneficios = [b.nome_beneficio for b in self.beneficios] if self.beneficios else []
        lista_familiares = [{'nome': f.nome, 'parentesco': f.parentesco, 'idade': f.idade} for f in self.familiares] if self.familiares else []

        return {
            'id': self.id,
            'status': self.status or 'pendente',
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
            'nomeResponsavel': self.nome_responsavel or '',
            'cpfResponsavel': self.cpf_responsavel or '',
            'rgResponsavel': self.rg_responsavel or '',
            'nisResponsavel': self.nis_responsavel or '',
            'situacao_escolar': self.situacao_escolar or '',
            'nome_escola': self.nome_escola or '',
            'serie': self.serie or '',
            'turno': self.turno or '',
            'frequenta_eja': self.frequenta_eja or '',
            'crasReferencia': self.cras_referencia or '',
            'tecnicoReferencia': self.tecnico_referencia or '',
            'orgaosDemandantes': lista_orgaos,
            'chefeFamilia': self.chefe_familia or '',
            'rendaFamiliar': renda,
            'beneficios': lista_beneficios,
            'familiaPossuiDeficiencia': self.familia_possui_deficiencia or '',
            'medicamentoUso': self.medicamento_uso or '',
            'alergiaDescricao': self.alergia_descricao or '',
            'tecnicoResponsavel': self.tecnico_responsavel or '',
            'telefoneContato': self.telefone_contato or '',
            'familiares': lista_familiares
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

# --- ROTAS ---

@app.route("/api/login", methods=['POST'])
def login():
    dados = request.get_json()
    cpf = dados.get('cpf')
    senha = dados.get('senha')
    usuario = Usuario.query.filter_by(cpf=cpf).first()

    if usuario and bcrypt.check_password_hash(usuario.password_hash, senha):
        access_token = create_access_token(identity=usuario.cpf)
        return jsonify({'access_token': access_token, 'nome': usuario.nome, 'cpf': usuario.cpf, 'tipo': usuario.tipo}), 200

    return jsonify({"msg": "Credenciais inválidas"}), 401

@app.route("/api/reset-password-request", methods=['POST'])
def request_reset_password():
    dados = request.get_json()
    cpf = dados.get('cpf')
    usuario = Usuario.query.filter_by(cpf=cpf).first()
    
    if not usuario: return jsonify({"msg": "CPF não encontrado."}), 404

    existe = ResetRequest.query.filter_by(usuario_id=usuario.id, status='pendente').first()
    if existe: return jsonify({"msg": "Já existe uma solicitação pendente."}), 409

    novo_pedido = ResetRequest(usuario_id=usuario.id)
    db.session.add(novo_pedido)
    db.session.commit()
    return jsonify({"msg": "Solicitação enviada! Aguarde a aprovação."}), 201

@app.route("/api/admin/reset-requests", methods=['GET'])
@jwt_required()
def get_reset_requests():
    cpf_logado = get_jwt_identity()
    usuario_logado = Usuario.query.filter_by(cpf=cpf_logado).first()
    if not usuario_logado or usuario_logado.tipo not in ['Master', 'Admin']:
        return jsonify({"msg": "Acesso negado."}), 403

    pedidos = ResetRequest.query.filter_by(status='pendente').all()
    return jsonify([p.to_dict() for p in pedidos]), 200

@app.route("/api/admin/reset-requests/<int:id>/acao", methods=['POST'])
@jwt_required()
def action_reset_request(id):
    cpf_logado = get_jwt_identity()
    usuario_logado = Usuario.query.filter_by(cpf=cpf_logado).first()
    if not usuario_logado or usuario_logado.tipo not in ['Master', 'Admin']:
        return jsonify({"msg": "Acesso negado."}), 403

    dados = request.get_json()
    acao = dados.get('acao')
    pedido = ResetRequest.query.get(id)
    if not pedido: return jsonify({"msg": "Pedido não encontrado"}), 404

    if acao == 'aprovar':
        pedido.status = 'aprovado'
        nova_senha_hash = bcrypt.generate_password_hash('mudar123').decode('utf-8')
        pedido.usuario.password_hash = nova_senha_hash
        msg = "Senha resetada para 'mudar123'."
    else:
        pedido.status = 'rejeitado'
        msg = "Solicitação rejeitada."

    db.session.commit()
    return jsonify({"msg": msg}), 200

@app.route("/api/cadastro", methods=['POST'])
def cadastrar_participante():
    dados = request.get_json()
    if Usuario.query.filter_by(cpf=dados.get('cpf')).first():
        return jsonify({"msg": "CPF já cadastrado."}), 409

    try:
        hashed_password = bcrypt.generate_password_hash(dados.get('senha')).decode('utf-8')
        novo_usuario = Usuario(nome=dados.get('nomeCompleto'), cpf=dados.get('cpf'), password_hash=hashed_password, tipo='comum')
        db.session.add(novo_usuario)
        db.session.flush()

        data_nasc = None
        if dados.get('dataNascimento'):
             try: data_nasc = datetime.strptime(dados.get('dataNascimento'), '%Y-%m-%d').date()
             except: pass

        novo_participante = Participante(
            usuario_id=novo_usuario.id,
            nome_completo=dados.get('nomeCompleto'),
            cpf=dados.get('cpf'),
            data_nascimento=data_nasc,
            sexo=dados.get('sexo'),
            nis=dados.get('nis'),
            telefone_contato=dados.get('telefoneContato'),
            situacao_escolar=dados.get('situacao_escolar'),
            frequenta_eja=dados.get('frequenta_eja'),
            serie=dados.get('serie'),
            nome_escola=dados.get('nome_escola'),
            turno=dados.get('turno'),
            rg=dados.get('rg'),
            orgao_emissor=dados.get('orgaoEmissor'),
            uf_rg=dados.get('ufRg'),
            endereco=dados.get('endereco'),
            uf_naturalidade=dados.get('ufNaturalidade'),
            naturalidade_cidade=dados.get('naturalidadeCidade'),
            nome_responsavel=dados.get('nomeResponsavel'),
            cpf_responsavel=dados.get('cpfResponsavel'),
            rg_responsavel=dados.get('rgResponsavel'),
            nis_responsavel=dados.get('nisResponsavel'),
            chefe_familia=dados.get('chefeFamilia'),
            familia_possui_deficiencia=dados.get('familiaPossuiDeficiencia'),
            medicamento_uso=dados.get('medicamentoUso'),
            alergia_descricao=dados.get('alergiaDescricao'),
            tecnico_responsavel=dados.get('tecnicoResponsavel'),
            cras_referencia=dados.get('crasReferencia'),
            tecnico_referencia=dados.get('tecnicoReferencia')
        )
        
        renda = dados.get('rendaFamiliar')
        if renda:
             try: novo_participante.renda_familiar = float(str(renda).replace('R$', '').replace('.', '').replace(',', '.').strip())
             except: pass

        db.session.add(novo_participante)
        db.session.flush() 

        if dados.get('beneficios'):
            for ben in dados.get('beneficios'):
                db.session.add(BeneficioParticipante(participante_id=novo_participante.id, nome_beneficio=ben))
        
        if dados.get('orgaoDemandante'):
            for org in dados.get('orgaoDemandante'):
                db.session.add(OrgaoDemandanteParticipante(participante_id=novo_participante.id, nome_orgao=org))

        lista_familiares = dados.get('familyMembers') or dados.get('familiares')
        if lista_familiares:
            for fam in lista_familiares:
                if fam.get('nome'):
                    idade = int(fam.get('idade')) if fam.get('idade') else None
                    db.session.add(Familiar(participante_id=novo_participante.id, nome=fam.get('nome'), parentesco=fam.get('parentesco'), idade=idade))

        db.session.commit()
        return jsonify({"msg": "Cadastro realizado!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Erro ao realizar cadastro.", "erro": str(e)}), 500

@app.route("/api/dashboard", methods=['GET'])
@jwt_required()
def dashboard():
    cpf_usuario_atual = get_jwt_identity()
    usuario_atual = Usuario.query.filter_by(cpf=cpf_usuario_atual).first()
    if not usuario_atual: return jsonify({"msg": "Usuário não encontrado"}), 404
    
    try:
        total_participantes = db.session.query(func.count(Participante.id)).scalar() or 0
        familias_pne = db.session.query(func.count(Participante.id)).filter(Participante.familia_possui_deficiencia == 'sim').scalar() or 0
        pending_registrations = db.session.query(func.count(Participante.id)).filter(Participante.status == 'pendente').scalar() or 0
        priority_audience = db.session.query(func.count(Participante.id)).filter(or_(Participante.situacao_escolar == 'nao_frequenta', Participante.renda_familiar < 500)).scalar() or 0

        recentes_db = Participante.query.order_by(Participante.id.desc()).limit(5).all()
        recentes_json = [{'id': p.id, 'name': p.nome_completo, 'date': p.data_nascimento.strftime('%d/%m/%Y') if p.data_nascimento else "N/D"} for p in recentes_db]

        encaminhamentos_db = db.session.query(OrgaoDemandanteParticipante.nome_orgao, func.count(OrgaoDemandanteParticipante.id)).group_by(OrgaoDemandanteParticipante.nome_orgao).all()
        encaminhamentos_data = {'labels': [r[0] for r in encaminhamentos_db], 'values': [r[1] for r in encaminhamentos_db]}

        sexo_db = db.session.query(Participante.sexo, func.count(Participante.id)).group_by(Participante.sexo).all()
        publico_alvo_data = {'labels': [r[0] for r in sexo_db if r[0]], 'values': [r[1] for r in sexo_db if r[0]]}

        return jsonify({
            'mensagem': f'Bem-vindo, {usuario_atual.nome}!',
            'totalParticipants': total_participantes,
            'familiasPNE': familias_pne,
            'pendingRegistrations': pending_registrations,
            'priorityAudience': priority_audience,
            'recentRegistrations': recentes_json,
            'encaminhamentosData': encaminhamentos_data,
            'publicoAlvoData': publico_alvo_data
        }), 200
    except Exception as e:
        return jsonify({"msg": "Erro", "erro": str(e)}), 500

@app.route("/api/participantes/todos", methods=['GET'])
def get_todos_participantes():
    participantes = Participante.query.all()
    return jsonify([p.to_dict() for p in participantes]), 200

@app.route("/api/participantes/<int:id>", methods=['GET'])
def get_participante(id):
    p = Participante.query.get(id)
    return jsonify(p.to_dict()) if p else (jsonify({"msg": "Não encontrado"}), 404)

@app.route("/api/meu-perfil", methods=['GET', 'PUT'])
@jwt_required()
def meu_perfil():
    cpf = get_jwt_identity()
    user = Usuario.query.filter_by(cpf=cpf).first()
    if not user: return jsonify({"msg": "Erro"}), 404
    p = Participante.query.filter_by(usuario_id=user.id).first()
    
    if request.method == 'GET':
        return jsonify(p.to_dict()) if p else (jsonify({"msg": "Sem ficha"}), 404)
    
    if request.method == 'PUT':
        dados = request.get_json()
        if not p: return jsonify({"msg": "Ficha não encontrada"}), 404
        
        if dados.get('nomeCompleto'): p.nome_completo = dados['nomeCompleto']
        if dados.get('telefoneContato'): p.telefone_contato = dados['telefoneContato']
        if dados.get('endereco'): p.endereco = dados['endereco']
        if dados.get('serie'): p.serie = dados['serie']
        if dados.get('nome_escola'): p.nome_escola = dados['nome_escola']
        
        p.status = 'pendente'
        db.session.commit()
        return jsonify({"msg": "Dados atualizados!"}), 200

@app.route("/api/admin/participantes/<int:id>/status", methods=['PUT'])
@jwt_required()
def alterar_status(id):
    p = Participante.query.get(id)
    if p:
        p.status = request.get_json().get('status')
        db.session.commit()
        return jsonify({"msg": "Status alterado"}), 200
    return jsonify({"msg": "Erro"}), 404

@app.route("/api/admin/users", methods=['GET'])
@jwt_required()
def get_users():
    users = Usuario.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@app.route("/api/admin/users/<int:id>", methods=['DELETE'])
@jwt_required()
def delete_user(id):
    u = Usuario.query.get(id)
    if u:
        db.session.delete(u)
        db.session.commit()
        return jsonify({"msg": "Deletado"}), 200
    return jsonify({"msg": "Erro"}), 404

@app.route("/api/admin/cadastro", methods=['POST'])
@jwt_required()
def cadastro_admin():
    cpf_logado = get_jwt_identity()
    usuario_logado = Usuario.query.filter_by(cpf=cpf_logado).first()
    if not usuario_logado or usuario_logado.tipo not in ['Master', 'Admin']:
        return jsonify({"msg": "Acesso negado."}), 403

    dados = request.get_json()
    if Usuario.query.filter_by(cpf=dados.get('cpf')).first():
        return jsonify({"msg": "CPF já cadastrado."}), 409
    
    hashed_password = bcrypt.generate_password_hash(dados.get('senha')).decode('utf-8')
    novo_admin = Usuario(nome=dados.get('nome'), cpf=dados.get('cpf'), password_hash=hashed_password, tipo='Admin')

    try:
        db.session.add(novo_admin)
        db.session.commit()
        return jsonify({"msg": "Administrador cadastrado com sucesso!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Erro ao criar admin", "error": str(e)}), 500

@app.route("/api/admin/eventos", methods=['GET', 'POST'])
@jwt_required()
def eventos():
    if request.method == 'GET':
        evs = Evento.query.order_by(Evento.data_inicio.desc()).all()
        return jsonify([e.to_dict() for e in evs]), 200
    
    d = request.get_json()
    ne = Evento(
        titulo=d.get('titulo'), 
        descricao=d.get('descricao'), 
        local=d.get('local'), 
        categoria=d.get('categoria'), 
        imagem_url=d.get('imagem_url'),
        responsavel=d.get('responsavel'), # NOVO
        data_inicio=datetime.strptime(d.get('data_inicio'), '%Y-%m-%dT%H:%M')
    )
    if d.get('data_fim'): ne.data_fim = datetime.strptime(d.get('data_fim'), '%Y-%m-%dT%H:%M')
    
    db.session.add(ne)
    db.session.commit()
    return jsonify({"msg": "Evento criado"}), 201

@app.route("/api/admin/eventos/<int:id>", methods=['PUT', 'DELETE'])
@jwt_required()
def manipular_evento(id):
    e = Evento.query.get(id)
    if not e: return jsonify({"msg": "Evento não encontrado"}), 404

    if request.method == 'DELETE':
        db.session.delete(e)
        db.session.commit()
        return jsonify({"msg": "Evento removido!"}), 200

    if request.method == 'PUT':
        d = request.get_json()
        e.titulo = d.get('titulo')
        e.descricao = d.get('descricao')
        e.local = d.get('local')
        e.categoria = d.get('categoria')
        e.imagem_url = d.get('imagem_url')
        e.responsavel = d.get('responsavel') # NOVO
        if d.get('data_inicio'): e.data_inicio = datetime.strptime(d.get('data_inicio'), '%Y-%m-%dT%H:%M')
        if d.get('data_fim'): e.data_fim = datetime.strptime(d.get('data_fim'), '%Y-%m-%dT%H:%M')
        db.session.commit()
        return jsonify({"msg": "Evento atualizado!"}), 200

@app.route("/api/eventos", methods=['GET'])
@jwt_required()
def listar_eventos_usuario():
    cpf = get_jwt_identity()
    u = Usuario.query.filter_by(cpf=cpf).first()
    p = Participante.query.filter_by(usuario_id=u.id).first()
    pid = p.id if p else None
    evs = Evento.query.order_by(Evento.data_inicio.asc()).all()
    return jsonify([e.to_dict(participante_logado_id=pid) for e in evs]), 200

@app.route("/api/eventos/<int:id>/toggle-inscricao", methods=['POST'])
@jwt_required()
def toggle_inscricao(id):
    cpf = get_jwt_identity()
    u = Usuario.query.filter_by(cpf=cpf).first()
    p = Participante.query.filter_by(usuario_id=u.id).first()
    if not p: return jsonify({"msg": "Sem ficha"}), 400
    
    ev = Evento.query.get(id)
    if p in ev.participantes:
        ev.participantes.remove(p)
        msg, inscrito = "Inscrição cancelada", False
    else:
        ev.participantes.append(p)
        msg, inscrito = "Inscrito com sucesso", True
    
    db.session.commit()
    return jsonify({"msg": msg, "inscrito": inscrito}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)