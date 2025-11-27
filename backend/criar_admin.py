from app import app, db, Usuario, bcrypt

def criar_admin():
    with app.app_context():
        cpf_admin = "000.000.000-00"
        senha_admin = "admin"
        
        user = Usuario.query.filter_by(cpf=cpf_admin).first()
        
        if user:
            print(f"Atualizando Admin existente...")
            user.password_hash = bcrypt.generate_password_hash(senha_admin).decode('utf-8')
            user.tipo = 'Master' # Garante que ele é Master
        else:
            print(f"Criando Admin Master...")
            hashed_password = bcrypt.generate_password_hash(senha_admin).decode('utf-8')
            novo_usuario = Usuario(
                nome="Administrador Master",
                email="admin@sistema.com",
                cpf=cpf_admin,
                password_hash=hashed_password,
                tipo='Master' # Define como Master
            )
            db.session.add(novo_usuario)
        
        db.session.commit()
        print("✅ Admin Master configurado com sucesso!")

if __name__ == "__main__":
    criar_admin()