#!/usr/bin/env bash
# Resumate AI - Start Script
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "============================================="
echo " Starting Resumate AI Application"
echo "============================================="

# Start Backend
echo "Starting FastAPI Backend on http://127.0.0.1:8000 ..."
cd "$DIR/backend"
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Start Frontend
echo "Starting Vite Frontend on http://127.0.0.1:5173 ..."
cd "$DIR/frontend"
npm run dev -- --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

trap "echo 'Shutting down Resumate AI...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT

echo ""
echo "Resumate AI is running!"
echo "Frontend: http://127.0.0.1:5173"
echo "Backend:  http://127.0.0.1:8000"
echo "API Docs: http://127.0.0.1:8000/docs"
echo "Press CTRL+C to stop both servers."
wait
