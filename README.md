# Ayume Andrade — Portfólio

Portfólio de Ayume Andrade, escultora e pintora, com vitrine pública e área administrativa mockada.

## Stack

- Vite + React 18
- Tailwind CSS (tokens custom da paleta)
- React Router DOM v6
- Context API + `localStorage` (sem Firebase nesta fase)

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Acesso ao admin

Rota: `/painel-ayume/login`

| Campo | Valor |
|-------|-------|
| E-mail | `ayu@portfolio.local` |
| Senha | `ayu2026` |

> **Atenção:** os dados ficam salvos apenas no `localStorage` deste navegador. Cada navegador/dispositivo tem seu próprio estado.

## Observações

- Criar, editar e deletar obras no admin reflete imediatamente na vitrine pública (mesmo navegador).
- Ao recarregar a página, os dados são mantidos via `localStorage`.
- As imagens usam [Picsum Photos](https://picsum.photos) como placeholder.

## Próximas fases

- **Fase 2**: Integração com Firebase (Firestore + Auth real)
- **Fase 3**: Upload de imagens via Cloudinary
- **Fase 4**: Deploy final com domínio customizado
