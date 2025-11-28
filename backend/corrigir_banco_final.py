from app import app, db
from sqlalchemy import text

def corrigir_tabelas():
    with app.app_context():
        print("🔧 Iniciando correção do banco de dados...")
        
        try:
            # 1. Aumentar o tamanho da coluna STATUS para aceitar 'reprovado'
            print("👉 Aumentando coluna 'status' na tabela 'participantes'...")
            # O comando abaixo funciona em MySQL
            with db.engine.connect() as conn:
                conn.execute(text("ALTER TABLE participantes MODIFY COLUMN status VARCHAR(50) DEFAULT 'pendente'"))
                conn.commit()
            print("✅ Coluna 'status' corrigida!")
            
        except Exception as e:
            print(f"⚠️ Aviso (pode ignorar se já estiver corrigido): {e}")

        try:
            # 2. Garantir que as colunas de texto sejam grandes o suficiente
            print("👉 Ajustando colunas de texto...")
            with db.engine.connect() as conn:
                conn.execute(text("ALTER TABLE participantes MODIFY COLUMN telefone_contato VARCHAR(50)"))
                conn.commit()
            print("✅ Colunas de texto ajustadas!")

        except Exception as e:
            print(f"⚠️ Erro ao ajustar colunas: {e}")

        print("\n🎉 Concluído! Tente reprovar um participante agora.")

if __name__ == "__main__":
    corrigir_tabelas()