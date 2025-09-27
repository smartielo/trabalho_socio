Como compartilhar mudanças em tempo real no GitHub

Opções principais:

1) Live Share (VS Code)
- Bom para edição colaborativa em tempo real. Não envia código ao GitHub automaticamente; é colaboração ao vivo.
- Passos: instale a extensão Live Share no VS Code, inicie uma sessão e envie o link ao colaborador.

2) GitHub Codespaces
- Ambiente remoto completo hospedado pelo GitHub. Colaboradores podem abrir o Codespace diretamente.
- Requer conta e possivelmente plano pago.

3) Push automático (auto-commit + push)
- Usa um watcher local (ex: `push-watcher.ps1`) que detecta alterações e faz commit+push ao repositório remoto. Útil quando quer publicar mudanças imediatamente no GitHub.

4) CI / Deploy automático
- Use GitHub Actions, Vercel, Netlify ou GitHub Pages para publicar seu frontend a cada push.

Instruções rápidas para usar o `push-watcher.ps1`:
- Coloque o script no diretório raiz do repositório (ou use o argumento `-Path`).
- Abra o PowerShell e execute: `.ackend\push-watcher.ps1 -Path "c:\Users\emmaz\Desktop\MARCELO\trabalho_socio" -DebounceSeconds 10 -CommitMessage "Auto commit" -Branch "main"`
- O script debouça por 10s; após mudanças estáveis, faz `git add -A`, `git commit` e `git push origin main`.

Notas de segurança e boas práticas:
- Não use auto-push em branches sensíveis sem revisão.
- Melhore o script para pular arquivos temporários, ignorar grandes binários ou abrir uma confirmação antes do push.
- Prefira GitHub Actions para builds/deploys em produção.

Se quiser, eu posso:
- Adicionar filtro .gitignore para evitar commits indesejados.
- Criar um workflow de GitHub Actions para deploy do `frontend/trabalho_socio` para GitHub Pages ou Vercel.
- Fornecer instruções detalhadas para Live Share em VS Code.
