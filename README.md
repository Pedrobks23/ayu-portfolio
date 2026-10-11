# Ayume Andrade — Portfólio

Site da artista Ayume Andrade (www.ayumeandrade.com.br): vitrine pública das obras, coleções, participações em exposições e contato, com painel administrativo para a própria artista gerenciar o conteúdo.

## Stack

- Vite + React 18, React Router v6, Tailwind CSS
- Firebase Authentication (e-mail/senha) + Firestore em tempo real
- Cloudinary para upload e otimização de imagens
- Web3Forms no formulário de contato
- Deploy na Vercel (branch `main` = produção)

## Como rodar

```bash
cp .env.example .env   # preencha VITE_WEB3FORMS_KEY
npm install
npm run dev
```

Acesse `http://localhost:5173`. O ambiente local usa o **mesmo Firestore de produção**: alterações feitas no painel aparecem no site real.

## Painel administrativo

Rota: `/painel-ayume/login`. O acesso é por conta do Firebase Authentication; não há cadastro pelo site.

Gerencia obras, coleções (com descrição curatorial), participações (próximas/passadas) e configurações (imagem hero, bio, contatos).

## Segurança

- `firestore.rules`: leitura pública, escrita só para os UIDs listados em `isAdmin()`.
  As regras **não** são publicadas pelo deploy: depois de alterar o arquivo, cole o conteúdo em
  Firebase Console → Firestore → Rules → Publish.
- Para dar acesso ao painel a outra pessoa: crie a conta em Authentication → Users e adicione o UID em `firestore.rules`.

## Testes

```bash
npm test
```
