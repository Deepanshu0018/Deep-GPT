# DeepGPT

DeepGPT is a full-stack AI chat app built with React, Vite, Express, and MongoDB.

## Features

- User authentication
- Chat history and thread management
- AI replies with markdown/code rendering
- Separate frontend and backend setup

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB

## Run Locally

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Backend
```bash
cd Backend
npm install
npm run dev
```

Make sure your backend `.env` file is configured before starting the server.

## Render Deployment

If the deployed frontend shows `Failed to fetch` on login, the static site is usually calling the wrong API URL or the backend is rejecting the frontend origin.

Set these environment variables on Render:

Frontend static site:
`VITE_API_BASE_URL=https://your-backend-service.onrender.com/api`

Backend web service:
`FRONTEND_URL=https://your-frontend-site.onrender.com`

Notes:
- If you use multiple frontend URLs, set `FRONTEND_URL` as a comma-separated list.
- After changing `VITE_API_BASE_URL`, redeploy the frontend so Vite rebuilds with the new value.
- The frontend now uses `localhost` only during local development. In production it avoids falling back to a local machine URL.
