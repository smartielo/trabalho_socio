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
    # NOVA COLUNA: Define se é 'admin', 'master' ou 'comum'
    tipo = db.Column(db.String(20), default='comum', nullable=False)

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
            'cpf': usuario.cpf,
            'tipo': usuario.tipo
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
def cadastrar_participante():
    dados = request.get_json()
    
    # Validação básica de senha
    senha_texto = dados.get('senha')
    if not senha_texto or len(senha_texto) < 8:
        return jsonify({"msg": "Senha obrigatória (mínimo 8 caracteres)."}), 400

    # Verifica se CPF já existe como USUÁRIO
    if Usuario.query.filter_by(cpf=dados.get('cpf')).first():
        return jsonify({"msg": "CPF já cadastrado no sistema."}), 409

    try:
        # 1. CRIAR O USUÁRIO DE LOGIN (Tabela usuarios)
        hashed_password = bcrypt.generate_password_hash(senha_texto).decode('utf-8')
        novo_usuario = Usuario(
            nome=dados.get('nomeCompleto'),
            cpf=dados.get('cpf'),
            email=None, # O formulário não tem email obrigatório para login, pode adicionar se quiser
            password_hash=hashed_password,
            tipo='comum' # Define como usuário comum
        )
        db.session.add(novo_usuario)
        db.session.flush() # Isso gera o ID do usuário antes do commit final

        # 2. CRIAR O PARTICIPANTE (Tabela participantes)
        # ... (Mantenha a conversão de datas e lógica existente aqui) ...
        data_nasc = None
        if dados.get('dataNascimento'):
             try:
                data_nasc = datetime.strptime(dados.get('dataNascimento'), '%Y-%m-%d').date()
             except: pass

        novo_participante = Participante(
            usuario_id=novo_usuario.id, # <--- VINCULA AO USUÁRIO RECÉM CRIADO
            status='pendente',
            nome_completo=dados.get('nomeCompleto'),
            cpf=dados.get('cpf'),
            data_nascimento=data_nasc,
            sexo=dados.get('sexo'),
            nis=dados.get('nis'),
            # ... COPIE TODO O RESTO DOS CAMPOS QUE JÁ ESTAVAM NO SEU CÓDIGO ...
            # ... Certifique-se de copiar todos os campos do seu app.py original ...
            telefone_contato=dados.get('telefoneContato')
        )
        
        db.session.add(novo_participante)
        db.session.flush() 

        # Salvar Listas (Benefícios, Orgãos, Familiares)
        # ... (Mantenha o código das listas que já estava lá) ...
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
                    db.session.add(Familiar(
                        participante_id=novo_participante.id, 
                        nome=fam.get('nome'), 
                        parentesco=fam.get('parentesco'), 
                        idade=idade
                    ))

        db.session.commit()
        return jsonify({"msg": "Cadastro realizado com sucesso! Faça login para acompanhar."}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Erro: {e}")
        return jsonify({"msg": "Erro ao realizar cadastro.", "erro": str(e)}), 500

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

# --- NOVA ROTA: CADASTRO DE ADMIN (Protegida) ---
@app.route("/api/admin/cadastro", methods=['POST'])
@jwt_required() # Exige estar logado
def cadastro_admin():
    # Verifica quem está tentando cadastrar
    cpf_logado = get_jwt_identity()
    usuario_logado = Usuario.query.filter_by(cpf=cpf_logado).first()

    # Apenas Master ou Admin pode criar outro Admin
    if not usuario_logado or usuario_logado.tipo not in ['Master', 'Admin']:
        return jsonify({"msg": "Acesso negado. Apenas administradores podem realizar esta ação."}), 403

    dados = request.get_json()
    
    if Usuario.query.filter_by(cpf=dados.get('cpf')).first():
        return jsonify({"msg": "CPF já cadastrado."}), 409
    
    hashed_password = bcrypt.generate_password_hash(dados.get('senha')).decode('utf-8')
    
    novo_admin = Usuario(
        nome=dados.get('nome'),
        cpf=dados.get('cpf'),
        password_hash=hashed_password,
        tipo='Admin' # Força o tipo como Admin
    )

    try:
        db.session.add(novo_admin)
        db.session.commit()
        return jsonify({"msg": "Administrador cadastrado com sucesso!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Erro ao criar admin", "error": str(e)}), 500

@app.route("/api/meu-perfil", methods=['GET'])
@jwt_required()
def meu_perfil():
    cpf_logado = get_jwt_identity()
    
    # Busca o usuário pelo CPF do token
    usuario = Usuario.query.filter_by(cpf=cpf_logado).first()
    if not usuario:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    # Busca o participante vinculado a este usuário
    participante = Participante.query.filter_by(usuario_id=usuario.id).first()
    
    if not participante:
        return jsonify({"msg": "Ficha de participante não encontrada."}), 404

    return jsonify(participante.to_dict()), 200


# ... (outras rotas) ...

# --- SUBSTITUIR NO ARQUIVO backend/app.py ---

# Rota corrigida para STATUS (com print de erro)
@app.route("/api/admin/participantes/<int:id>/status", methods=['PUT'])
@jwt_required()
def alterar_status_participante(id):
    cpf_logado = get_jwt_identity()
    usuario_logado = Usuario.query.filter_by(cpf=cpf_logado).first()
    
    if not usuario_logado or usuario_logado.tipo not in ['Master', 'Admin']:
        return jsonify({"msg": "Acesso não autorizado."}), 403

    dados = request.get_json()
    novo_status = dados.get('status') 

    participante = Participante.query.get(id)
    if not participante:
        return jsonify({"msg": "Participante não encontrado"}), 404

    try:
        print(f"Tentando alterar status id={id} para {novo_status}") # Log para debug
        participante.status = novo_status
        db.session.commit()
        return jsonify({"msg": f"Status atualizado para {novo_status}!"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"❌ ERRO AO ALTERAR STATUS: {e}") # Isso vai aparecer no seu terminal
        return jsonify({"msg": "Erro ao atualizar status. Verifique o console do servidor."}), 500


# Rota corrigida para EDIÇÃO DE PERFIL (Mais robusta)
@app.route("/api/meu-perfil", methods=['PUT'])
@jwt_required()
def atualizar_meu_perfil():
    try:
        cpf_logado = get_jwt_identity()
        usuario = Usuario.query.filter_by(cpf=cpf_logado).first()
        
        if not usuario:
            return jsonify({"msg": "Usuário não encontrado"}), 404

        participante = Participante.query.filter_by(usuario_id=usuario.id).first()
        if not participante:
            return jsonify({"msg": "Ficha não encontrada"}), 404

        dados = request.get_json()
        
        # Só atualiza campos de texto se eles não forem vazios (ou se o campo permitir vazio)
        if dados.get('nomeCompleto'): participante.nome_completo = dados['nomeCompleto']
        if dados.get('sexo'): participante.sexo = dados['sexo']
        if dados.get('nis'): participante.nis = dados['nis']
        if dados.get('rg'): participante.rg = dados['rg']
        if dados.get('orgaoEmissor'): participante.orgao_emissor = dados['orgaoEmissor']
        if dados.get('ufRg'): participante.uf_rg = dados['ufRg']
        if dados.get('endereco'): participante.endereco = dados['endereco']
        
        # Campos opcionais - aceita string vazia
        participante.uf_naturalidade = dados.get('ufNaturalidade', participante.uf_naturalidade)
        participante.naturalidade_cidade = dados.get('naturalidadeCidade', participante.naturalidade_cidade)
        participante.nome_responsavel = dados.get('nomeResponsavel', participante.nome_responsavel)
        participante.rg_responsavel = dados.get('rgResponsavel', participante.rg_responsavel)
        participante.nome_escola = dados.get('nome_escola', participante.nome_escola)
        participante.serie = dados.get('serie', participante.serie)
        participante.turno = dados.get('turno', participante.turno)
        participante.telefone_contato = dados.get('telefoneContato', participante.telefone_contato)
        participante.medicamento_uso = dados.get('medicamentoUso', participante.medicamento_uso)
        participante.alergia_descricao = dados.get('alergiaDescricao', participante.alergia_descricao)

        # Tratamento de Data (Evita erro se vier vazio)
        data_nasc = dados.get('dataNascimento')
        if data_nasc:
            try:
                # O input date envia YYYY-MM-DD
                participante.data_nascimento = datetime.strptime(str(data_nasc), '%Y-%m-%d').date()
            except ValueError:
                pass 

        # Tratamento de Renda
        renda = dados.get('rendaFamiliar')
        if renda is not None:
            try:
                # Remove formatação R$ e converte
                val_str = str(renda).replace('R$', '').replace('.', '').replace(',', '.').strip()
                if val_str:
                    participante.renda_familiar = float(val_str)
            except ValueError:
                pass

        # Resetar Status ao editar
        participante.status = 'pendente'

        db.session.commit()
        return jsonify({"msg": "Dados atualizados com sucesso!"}), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        print(f"❌ ERRO AO ATUALIZAR PERFIL: {e}")
        return jsonify({"msg": "Erro interno ao salvar", "erro": str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)