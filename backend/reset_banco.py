from app import app, db

def resetar_tudo():
    with app.app_context():
        print("🗑️  Apagando tabelas antigas...")
        # Isso apaga TODAS as tabelas e dados (Participantes, Usuários, etc.)
        db.drop_all()
        
        print("✨ Criando tabelas novas com a estrutura atualizada...")
        # Cria tudo novamente, agora com as colunas 'usuario_id', 'status', etc.
        db.create_all()
        
        print("✅ Banco de dados resetado com sucesso!")

if __name__ == "__main__":
    resetar_tudo()