from app import app, db

def criar_tabelas_eventos():
    with app.app_context():
        print("📅 Criando tabelas de Eventos e Inscrições...")
        try:
            db.create_all()
            print("✅ Sucesso! Tabelas criadas.")
        except Exception as e:
            print(f"❌ Erro: {e}")

if __name__ == "__main__":
    criar_tabelas_eventos()