# DormiCare Starter

Monorepo toi gian gom 2 phan:
- `frontend`: React + Vite + Tailwind CSS
- `backend`: Node.js + Express + Supabase

## Cau truc

```txt
project-root/
|- frontend/
`- backend/
```

## Yeu cau
- Node.js 20+
- npm 10+

## Chay frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend mac dinh chay o `http://localhost:5173`.

## Chay backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend mac dinh chay o `http://localhost:4000`.

## Bien moi truong backend

Xem file `backend/.env.example`.

## Ghi chu
- Frontend dang dung Tailwind CSS v4 qua `@tailwindcss/vite`.
- Backend dang la skeleton co san route, controller, service, model de ban tiep tuc mo rong.
- Supabase da duoc khai bao san trong `backend/src/config/supabase.js`.
