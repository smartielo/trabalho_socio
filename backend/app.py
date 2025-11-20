from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

app = Flask(__name__) # Inicialização do Flask
CORS(app)    # Permite que conexões de qualquer origem acessem a API

#configurações do JWT(Tokens)
app.config['JWT_SECRET_KEY'] = '6a4b12c7d9e0f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8'  # chave para assinar os tokens JWT
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Tempo que a pessoa tem no nosso site antes de precisar logar de novo

#Configurações do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///usuarios.db' #Mudar para o banco de dados que formos usar
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


# 2. isso é preciso para que eu faça as operações no banco de dados, pra isso, tem que coolocar todas as colunas do banco de dados
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    cpf = db.Column(db.String(11), unique=True, nullable=False)


    # Coluna para o hash da senha
    password_hash = db.Column(db.String(60), nullable=False)
    # ------------------------------------------------------- 
    nome = db.Column(db.String(100)) 

    def to_dict(self):
        return {'id': self.id, 'nome': self.nome, 'cpf': self.cpf}
    

@app.route("/login", methods=['POST'])
def login():
    dados = request.get_json()
    cpf = dados.get('cpf')
    senha = dados.get('senha')

    usuario = Usuario.query.filter_by(cpf=cpf).first()


    if usuario and bcrypt.check_password_hash(usuario.password_hash, senha):
        access_token = create_access_token(identity=usuario.cpf)
        return jsonify({'access_token': access_token}), 200
    

    return jsonify({"msg": "Credenciais inválidas"}), 401


@app.route("/cadastro", methods=['POST'])
def cadastro():
    dados = request.get_json()
    email = dados.get('email')
    cpf = dados.get('cpf')
    senha = dados.get('senha')
    
    # Validação de Unicidade
    if Usuario.query.filter_by(cpf=cpf).first():
        return jsonify({"msg": "CPF já cadastrado."}), 409
        
    novo_usuario = Usuario(
        email=email,
        cpf=cpf,


        password_hash=bcrypt.generate_password_hash(senha).decode('utf-8'),
        nome=dados.get('nome')
    )

    db.session.add(novo_usuario)
    db.session.commit()
    return jsonify({"msg": "Usuário cadastrado com sucesso!"}), 201


@app.route("/dashboard", methods=['GET'])
@jwt_required()
def dashboard():
    cpf_usuario_atual = get_jwt_identity()
    usuario_atual = Usuario.query.get_or_404(cpf_usuario_atual)


    # da pra alterar pra retornar dados específicos da instituição, pq isso nao é a mensagem que queremos mostrar, como o martielo fez o dashboard la
    return jsonify({
        'mensagem': f'Bem-vindo ao dashboard, {usuario_atual.nome}!',
        'dados_usuario': usuario_atual.to_dict(),
    }), 200




if __name__ == '__main__':
    app.run(debug=True, port=5000)