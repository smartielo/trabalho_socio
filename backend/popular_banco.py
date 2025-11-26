import requests
import random
from faker import Faker

# Configuração
API_URL = "http://localhost:5000/api/cadastro"
QTD_PARTICIPANTES = 50

fake = Faker('pt_BR')

# Opções para aleatoriedade
ORGAOS = ['CRAS', 'CREAS', 'Conselho Tutelar', 'Ministério Público', 'Demanda Espontânea']
SEXOS = ['Masculino', 'Feminino']
SITUACAO_ESCOLAR = ['frequenta', 'nao_frequenta']
BENEFICIOS = ['Bolsa Família', 'Renda Cidadã', 'Ação Jovem', 'BPC Idoso']

def gerar_participante():
    renda = random.uniform(0, 1500)
    tem_deficiencia = random.choice(['sim', 'nao'])
    
    # Lógica para forçar alguns como "Público Prioritário" (Renda baixa ou fora da escola)
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
        
        # Encaminhamento (Lista)
        "orgaoDemandante": [random.choice(ORGAOS)],
        
        # Família e Renda
        "chefeFamilia": random.choice(['Mãe', 'Pai', 'Avós']),
        "rendaFamiliar": f"{renda:.2f}".replace('.', ','), # Envia como string ex: "450,00"
        "familiaPossuiDeficiencia": tem_deficiencia,
        
        # Listas
        "beneficios": random.sample(BENEFICIOS, k=random.randint(0, 2)),
        
        # Responsável
        "nomeResponsavel": fake.name_female(),
        "cpfResponsavel": fake.cpf(),
        "telefoneContato": fake.phone_number()
    }
    return payload

print(f"🚀 Iniciando cadastro de {QTD_PARTICIPANTES} participantes...")

sucessos = 0
erros = 0

for i in range(QTD_PARTICIPANTES):
    dados = gerar_participante()
    try:
        response = requests.post(API_URL, json=dados)
        if response.status_code == 201:
            print(f"[{i+1}/{QTD_PARTICIPANTES}] ✅ {dados['nomeCompleto']} cadastrado.")
            sucessos += 1
        else:
            print(f"[{i+1}/{QTD_PARTICIPANTES}] ❌ Erro: {response.text}")
            erros += 1
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        break

print(f"\n🏁 Finalizado! Sucessos: {sucessos} | Falhas: {erros}")