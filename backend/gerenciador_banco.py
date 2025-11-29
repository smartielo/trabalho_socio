import random
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy import text
# Importa TODOS os modelos necessários
from app import app, db, Usuario, Participante, Evento, bcrypt, OrgaoDemandanteParticipante

fake = Faker('pt_BR')

# --- 1. CRIAÇÃO DE USUÁRIOS FIXOS ---
def criar_admin_e_teste():
    print("👤 Criando usuários padrão...")
    
    # Admin Master
    if not Usuario.query.filter_by(cpf="000.000.000-00").first():
        hashed = bcrypt.generate_password_hash("admin").decode('utf-8')
        admin = Usuario(nome="Administrador Master", cpf="000.000.000-00", email="admin@sistema.com", password_hash=hashed, tipo="Master")
        db.session.add(admin)
        print("   ✅ Admin criado: CPF 000.000.000-00 | Senha: admin")
    
    # Usuário Comum para Teste
    if not Usuario.query.filter_by(cpf="111.111.111-11").first():
        hashed = bcrypt.generate_password_hash("usuario123").decode('utf-8')
        user = Usuario(nome="Usuário Teste", cpf="111.111.111-11", email="user@teste.com", password_hash=hashed, tipo="comum")
        db.session.add(user)
        db.session.flush()

        # Ficha do Participante
        part = Participante(
            usuario_id=user.id,
            nome_completo="Usuário Teste da Silva",
            cpf="111.111.111-11",
            data_nascimento=datetime(2000, 1, 1).date(),
            sexo="Masculino",
            status="aprovado",
            renda_familiar=1500.00,
            situacao_escolar="nao_frequenta",
            rg="12.345.678-9"
        )
        db.session.add(part)
        db.session.flush()

        # Órgão Demandante (Essencial para o gráfico)
        org_teste = OrgaoDemandanteParticipante(participante_id=part.id, nome_orgao="Demanda Espontânea")
        db.session.add(org_teste)

        print("   ✅ Usuário Teste criado: CPF 111.111.111-11 | Senha: usuario123")

    db.session.commit()

# --- 2. POPULAR PARTICIPANTES ---
def popular_participantes(qtd=20):
    print(f"🎲 Gerando {qtd} participantes aleatórios...")
    
    lista_orgaos = ['CRAS', 'CREAS', 'Conselho Tutelar', 'Ministério Público', 'Demanda Espontânea', 'Defensoria Pública']

    for _ in range(qtd):
        cpf_fake = fake.cpf()
        nome_fake = fake.name()
        
        if not Usuario.query.filter_by(cpf=cpf_fake).first():
            hashed = bcrypt.generate_password_hash("12345678").decode('utf-8')
            user = Usuario(nome=nome_fake, cpf=cpf_fake, password_hash=hashed, tipo="comum")
            db.session.add(user)
            db.session.flush()
            
            p = Participante(
                usuario_id=user.id,
                nome_completo=nome_fake,
                cpf=cpf_fake,
                data_nascimento=fake.date_of_birth(minimum_age=6, maximum_age=18),
                sexo=random.choice(['Masculino', 'Feminino']),
                nis=str(fake.random_number(digits=11)),
                endereco=fake.address(),
                naturalidade_cidade=fake.city(),
                uf_naturalidade=fake.state_abbr(),
                rg=str(fake.random_number(digits=9)),
                status=random.choice(['pendente', 'aprovado', 'reprovado']),
                renda_familiar=random.uniform(0, 3000),
                situacao_escolar=random.choice(['frequenta', 'nao_frequenta']),
                chefe_familia=random.choice(['Mãe', 'Pai', 'Avós'])
            )
            db.session.add(p)
            db.session.flush()

            # Adiciona Órgão para preencher o gráfico
            orgao_escolhido = random.choice(lista_orgaos)
            novo_orgao = OrgaoDemandanteParticipante(participante_id=p.id, nome_orgao=orgao_escolhido)
            db.session.add(novo_orgao)
    
    db.session.commit()
    print(f"   ✅ {qtd} participantes inseridos!")

# --- 3. POPULAR EVENTOS ---
def popular_eventos():
    print("📅 Gerando eventos de exemplo...")
    
    eventos_ficticios = [
        {"titulo": "Torneio de Futsal", "cat": "Esporte", "desc": "Campeonato interclasses.", "resp": "Prof. Carlos"},
        {"titulo": "Oficina de Artesanato", "cat": "Cultura", "desc": "Pintura em tecido.", "resp": "Dra. Ana"},
        {"titulo": "Roda de Conversa", "cat": "Social", "desc": "Cidadania e direitos.", "resp": "Assistente Social"},
        {"titulo": "Curso de Informática", "cat": "Educação", "desc": "Word e Excel.", "resp": "Monitor João"},
        {"titulo": "Festa da Família", "cat": "Lazer", "desc": "Diversão e lanches.", "resp": "Coordenação"}
    ]

    for ev in eventos_ficticios:
        data_inicio = datetime.now() + timedelta(days=random.randint(1, 30))
        novo_evento = Evento(
            titulo=ev['titulo'],
            descricao=ev['desc'],
            local="Sede do Instituto",
            categoria=ev['cat'],
            responsavel=ev['resp'], # Garante que o responsável seja inserido
            data_inicio=data_inicio,
            data_fim=data_inicio + timedelta(hours=2),
            imagem_url=""
        )
        db.session.add(novo_evento)
    
    db.session.commit()
    print("   ✅ 5 Eventos criados!")

# --- 4. CORRIGIR ESTRUTURA DO BANCO ---
def corrigir_tabelas_existentes():
    print("🔧 Aplicando correções no banco existente...")
    try:
        with db.engine.connect() as conn:
            # 1. Tenta adicionar a coluna responsavel (caso não exista)
            try:
                conn.execute(text("ALTER TABLE eventos ADD COLUMN responsavel VARCHAR(100)"))
                print("   -> Coluna 'responsavel' adicionada.")
            except: 
                print("   -> Coluna 'responsavel' já existe.")

            # 2. Corrige o tamanho do status (bug do Reprovado)
            conn.execute(text("ALTER TABLE participantes MODIFY COLUMN status VARCHAR(50) DEFAULT 'pendente'"))
            print("   -> Coluna 'status' ajustada.")

            # 3. Corrige tamanho do telefone
            conn.execute(text("ALTER TABLE participantes MODIFY COLUMN telefone_contato VARCHAR(50)"))
            print("   -> Coluna 'telefone' ajustada.")

            # 4. Cria tabelas que faltam (reset requests, inscricoes, etc)
            db.create_all()
            conn.commit()
            
        print("   ✅ Banco totalmente corrigido!")
    except Exception as e:
        print(f"   ⚠️ Erro na correção: {e}")

# --- MENUS ---
def menu_resetar_tudo():
    if input("\n🔴 Apagar TUDO? (SIM): ") == 'SIM':
        db.drop_all()
        db.create_all()
        criar_admin_e_teste()
        print("\n✨ Banco resetado!")

def menu_demo_completa():
    if input("\nResetar e Popular para DEMO? (SIM): ") == 'SIM':
        db.drop_all()
        db.create_all()
        criar_admin_e_teste()
        popular_participantes(30)
        popular_eventos()
        print("\n🚀 DEMO pronta para apresentação!")

if __name__ == "__main__":
    with app.app_context():
        while True:
            print("\n=== GERENCIADOR DE BANCO (FINAL) ===")
            print("1. 🔥 RESETAR BANCO (Limpa tudo)")
            print("2. 🚀 PREPARAR DEMO (Limpa, cria Admin e enche de dados)")
            print("6. 🔧 Corrigir Estrutura (Se o banco já tem dados)")
            print("0. Sair")
            
            op = input("Opção: ")
            if op == '1': menu_resetar_tudo()
            elif op == '2': menu_demo_completa()
            elif op == '6': corrigir_tabelas_existentes()
            elif op == '0': break