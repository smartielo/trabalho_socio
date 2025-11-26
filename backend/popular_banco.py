import requests
import random
from faker import Faker
import sys

# Tenta importar o app e o banco para fazer a limpeza direta
try:
    from app import app, db, Participante
except ImportError:
    print("❌ Erro: Certifique-se de que este arquivo está na mesma pasta que o 'app.py'")
    sys.exit(1)

# Configuração
API_URL = "http://localhost:5000/api/cadastro"

fake = Faker('pt_BR')

# Opções para aleatoriedade
ORGAOS = ['CRAS', 'CREAS', 'Conselho Tutelar', 'Ministério Público', 'Demanda Espontânea']
SEXOS = ['Masculino', 'Feminino']
SITUACAO_ESCOLAR = ['frequenta', 'nao_frequenta']
BENEFICIOS = ['Bolsa Família', 'Renda Cidadã', 'Ação Jovem', 'BPC Idoso']
TURNOS = ['Matutino', 'Vespertino', 'Integral']

def gerar_participante():
    renda = random.uniform(0, 1500)
    tem_deficiencia = random.choice(['sim', 'nao'])
    situacao = random.choice(SITUACAO_ESCOLAR)
    
    payload = {
        "nomeCompleto": fake.name(),
        "cpf": fake.cpf(),
        "dataNascimento": fake.date_of_birth(minimum_age=5, maximum_age=18).strftime('%Y-%m-%d'),
        "sexo": random.choice(SEXOS),
        "nis": str(fake.random_number(digits=11)),
        "ufNaturalidade": fake.state_abbr(),
        "naturalidadeCidade": fake.city(),
        "endereco": fake.address(),
        
        # Dados Escolares
        "situacao_escolar": situacao,
        "frequenta_eja": "nao",
        "serie": f"{random.randint(1, 9)}º Ano",
        "nome_escola": "Escola Estadual " + fake.last_name(),
        "turno": random.choice(TURNOS),
        
        "orgaoDemandante": [random.choice(ORGAOS)],
        
        "chefeFamilia": random.choice(['Mãe', 'Pai', 'Avós']),
        "rendaFamiliar": f"{renda:.2f}".replace('.', ','),
        "familiaPossuiDeficiencia": tem_deficiencia,
        "beneficios": random.sample(BENEFICIOS, k=random.randint(0, 2)),
        
        "nomeResponsavel": fake.name_female(),
        "cpfResponsavel": fake.cpf(),
        "rgResponsavel": str(fake.random_number(digits=9)),
        "nisResponsavel": str(fake.random_number(digits=11)),
        "telefoneContato": fake.phone_number()
    }
    return payload

def executar_cadastro(qtd):
    print(f"\n🚀 Iniciando cadastro de {qtd} participantes...\n")
    sucessos = 0
    
    for i in range(qtd):
        dados = gerar_participante() # Gera os dados
        try:
            response = requests.post(API_URL, json=dados)
            if response.status_code == 201:
                # AQUI: Agora mostra o nome da pessoa gerada
                print(f"[{i+1}/{qtd}] ✅ {dados['nomeCompleto']} cadastrado.") 
                sucessos += 1
            else:
                print(f"[{i+1}/{qtd}] ❌ Erro ao cadastrar {dados['nomeCompleto']}: {response.text}")
        except:
            print("❌ Erro de conexão. O servidor (app.py) está ligado?")
            break
    print(f"\n🏁 Finalizado! Total cadastrados: {sucessos}")

def limpar_banco():
    print("\n🔥 MODO DE LIMPEZA 🔥")
    print("Isso vai apagar TODOS os participantes, familiares e fichas.")
    print("O usuário ADMIN não será apagado.")
    
    confirm = input("Digite 'SIM' para confirmar a exclusão: ")
    
    if confirm == 'SIM':
        # Usa o contexto do Flask para acessar o banco diretamente
        with app.app_context():
            try:
                # Deleta todos os registros da tabela Participante
                # Devido ao 'cascade' no banco, isso apaga familiares e beneficios automaticamente
                num_rows = db.session.query(Participante).delete()
                db.session.commit()
                print(f"✨ Sucesso! {num_rows} registros removidos do banco.")
            except Exception as e:
                db.session.rollback()
                print(f"❌ Erro ao limpar o banco: {e}")
    else:
        print("Operação cancelada.")

# --- MENU PRINCIPAL ---
if __name__ == "__main__":
    print("=========================================")
    print("      GERADOR DE DADOS - SOCIOEDUCATIVO   ")
    print("=========================================")
    print("1. Gerar Participantes Aleatórios")
    print("2. Limpar Banco de Dados (Resetar)")
    print("=========================================")
    
    opcao = input("Escolha uma opção (1 ou 2): ")

    if opcao == '1':
        qtd_input = input("Quantos participantes deseja gerar? (Padrão: 50): ")
        qtd = int(qtd_input) if qtd_input else 50
        executar_cadastro(qtd)
    elif opcao == '2':
        limpar_banco()
    else:
        print("Opção inválida!")