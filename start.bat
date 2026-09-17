@echo off
echo ========================================================
echo  🌴 Starting AI Trip Concierge (Goa Hotel Travel Companion)
echo ========================================================
echo.

echo 1. Installing backend requirements if needed...
pip install -r requirements.txt

echo 2. Installing frontend dependencies if needed...
cd frontend
call npm install
cd ..

echo.
echo 3. Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "AI Concierge Backend" python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

echo 4. Starting Vite Frontend on http://127.0.0.1:5173 ...
start "AI Concierge Frontend" npm --prefix frontend run dev

echo.
echo ========================================================
echo  ✅ Application successfully launched!
echo  👉 Open your browser at: http://localhost:5173/
echo ========================================================
timeout /t 3 >nul
start http://localhost:5173/
