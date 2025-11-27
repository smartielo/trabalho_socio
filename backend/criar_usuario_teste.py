import requests

# Configuração
API_URL = "http://localhost:5000/api/cadastro"

def criar_usuario_comum():
    # Dados de um usuário comum para teste
    payload = {
        # --- Dados de Login ---
        "senha": "usuario123",  # Senha padrão para o teste
        "confirmarSenha": "usuario123",
        
        # --- Dados da Ficha (Participante) ---
        "nomeCompleto": "Usuário Teste Comum",
        "cpf": "111.111.111-11",  # CPF fácil para digitar no login
        "dataNascimento": "2000-01-01",
        "sexo": "Masculino",
        "nis": "12345678901",
        "ufNaturalidade": "SP",
        "naturalidadeCidade": "Bauru",
        "endereco": "Rua de Teste, 100, Centro",
        "telefoneContato": "(14) 99999-9999",
        
        # Dados Complementares Obrigatórios
        "situacao_escolar": "nao_frequenta",
        "frequenta_eja": "nao",
        "serie": "",
        "nome_escola": "",
        "turno": "",
        "orgaoDemandante": ["Demanda Espontânea"],
        "chefeFamilia": "Próprio",
        "rendaFamiliar": "R$ 1.200,00",
        "familiaPossuiDeficiencia": "nao",
        "beneficios": [],
        "familyMembers": []
    }

    try:
        print(f"⏳ Enviando requisição para {API_URL}...")
        response = requests.post(API_URL, json=payload)
        
        if response.status_code == 201:
            print("\n✅ Sucesso! Usuário comum criado.")
            print("================================================")
            print("   CPF (Login): 111.111.111-11")
            print("   Senha:       usuario123")
            print("================================================")
            print("👉 Vá para a página de Login e use esses dados.")
        elif response.status_code == 409:
            print("\n⚠️  Aviso: Esse CPF já está cadastrado. Tente fazer login direto.")
        else:
            print(f"\n❌ Erro {response.status_code}: {response.text}")

    except Exception as e:
        print(f"\n❌ Erro de conexão: {e}")
        print("Certifique-se de que o servidor (python app.py) está rodando em outra janela.")

if __name__ == "__main__":
    criar_usuario_comum()