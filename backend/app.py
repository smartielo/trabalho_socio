from flask import Flask, jsonify
from flask_cors import CORS # comunicação entre front e back


app = Flask(__name__)

CORS(app) 

# 2. Dados de Simulação (MOCK)
USUARIOS = [
    {"id": 0, "nome": "João", "idade": 25},
    {"id": 1, "nome": "Elvio", "idade": 30}
]

# 3. Rota Inicial
@app.route("/")
def index(): 
    # Essa rota não é usada pela API, mas é boa para um teste de saúde.
    return "API Flask está rodando. Acesse /api/usuarios para os dados."

# 4. Endpoint RESTful (GET)
# Agora usando o padrão /api/ e jsonify
@app.route("/api/usuarios", methods=['GET'])
def listar_usuarios():
    # Usamos jsonify para garantir que a resposta seja formatada corretamente
    # como JSON, com o cabeçalho HTTP apropriado.
    return jsonify(USUARIOS)

if __name__ == '__main__':
    # Roda o servidor na porta padrão 5000
    app.run(debug=True)