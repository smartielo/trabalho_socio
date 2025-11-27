from app import app, db

def corrigir_banco():
    with app.app_context():
        print("🔍 Verificando tabelas e criando as que faltam...")
        try:
            # Este comando verifica os modelos no app.py e cria as tabelas 
            # que ainda não existem no MySQL
            db.create_all()
            print("✅ Sucesso! Todas as tabelas (incluindo Órgãos e Benefícios) foram criadas.")
        except Exception as e:
            print(f"❌ Erro ao criar tabelas: {e}")

if __name__ == "__main__":
    corrigir_banco()