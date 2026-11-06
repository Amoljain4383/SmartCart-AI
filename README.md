# SmartCart AI

Hackathon MVP for comparing product offers using a demonstration catalogue.

## Stack
- React + Vite frontend
- Python + FastAPI backend
- SQLite database
- Argon2 password hashing and JWT authentication
- Protected administrator role
- PayPal Sandbox and optional OpenAI configuration placeholders

## Start backend
From the project root, activate the SmartCart virtual environment, then:

```powershell
cd backend
..\ .venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Use the corrected command without the space: `..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload`

## Create the private admin
In a second terminal:

```powershell
cd D:\download\SmartCart_AI\backend
..\ .venv\Scripts\python.exe -m app.create_admin
```

Use the corrected command without the space: `..\.venv\Scripts\python.exe -m app.create_admin`

## Start frontend
In another terminal:

```powershell
cd D:\download\SmartCart_AI\frontend
npm.cmd run dev
```

Demo prices and retailer links are illustrative, not live offers. PayPal checkout and live retailer integrations still require credentials and dedicated integration/testing.
