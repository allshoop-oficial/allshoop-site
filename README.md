# All Shoop — site

Site estático (HTML/CSS/JS puro, sem build necessário) pronto para GitHub Pages.

## Estrutura

```
index.html          → homepage (achados + prévia do blog)
blog.html            → listagem completa do blog
blog/*.html          → artigos individuais (gerados pelo workflow n8n)
products.json        → dados dos produtos (atualizado pelo workflow n8n)
articles.json        → índice dos artigos (atualizado pelo workflow n8n)
assets/style.css      → design system "etiqueta de preço"
assets/script.js       → renderização client-side dos JSON
```

## Passo 1 — Criar o repositório no GitHub

1. Vai a github.com → **New repository**.
2. Nome sugerido: `allshoop-site` (podes escolher outro — só precisas de o dar ao n8n depois).
3. Deixa **público** (GitHub Pages grátis exige isso, a não ser que tenhas GitHub Pro).
4. Faz upload de todos os ficheiros desta pasta para o repositório (arrasta os ficheiros na interface web do GitHub, ou usa `git push` se preferires linha de comandos).

## Passo 2 — Ativar o GitHub Pages

1. No repositório, vai a **Settings → Pages**.
2. Em "Source", escolhe **Deploy from a branch**.
3. Branch: `main`, pasta: `/ (root)`.
4. Guarda. Em 1-2 minutos o site fica disponível em:
   `https://<o-teu-utilizador>.github.io/allshoop-site/`

## Passo 3 — Gerar um Personal Access Token (para o n8n poder publicar)

O workflow n8n precisa de permissão para editar ficheiros no repositório automaticamente.

1. Vai a **github.com/settings/tokens** → **Generate new token (classic)**.
2. Nome: `n8n-allshoop`.
3. Validade: escolhe conforme preferires (90 dias, ou "no expiration" se quiseres evitar renovar).
4. Permissões: marca só o scope **repo** (dá acesso de leitura/escrita aos teus repositórios).
5. Gera e copia o token (começa por `ghp_...`) — só é mostrado uma vez.

## Passo 4 — Configurar no workflow n8n

Abre o node **"🔑 Config — Edita Aqui"** do workflow `All Shoop — Site (Publica Produtos + Artigos)` e preenche:

```js
GITHUB_TOKEN: 'ghp_o-teu-token-aqui',
GITHUB_OWNER: 'o-teu-utilizador-github',
GITHUB_REPO: 'allshoop-site',
GITHUB_BRANCH: 'main',
```

## Domínio próprio (opcional, mais tarde)

Quando quiseres um domínio próprio em vez de `github.io`, compra o domínio (ex: Namecheap, ou
qualquer registrador), e em **Settings → Pages → Custom domain** no GitHub, escreve o teu domínio.
O GitHub dá-te os registos DNS exatos para configurares no teu registrador.

## Netlify (alternativa)

Se preferires Netlify em vez de GitHub Pages: liga o Netlify diretamente a este mesmo repositório
GitHub (netlify.com → **Add new site → Import an existing project**), sem "build command" (é site
estático puro) e "publish directory" = `/`. O workflow continua a publicar via GitHub — o Netlify
deteta os commits automaticamente e reimplanta sozinho.
