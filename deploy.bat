@echo off
echo.
echo  English Chat Simulator - Deploy para Vercel
echo  =============================================
echo.

where vercel >nul 2>&1
if %errorlevel% neq 0 (
  echo  Instalando Vercel CLI...
  npm install -g vercel
)

echo  Fazendo login no Vercel (abre o browser)...
vercel login

echo.
echo  Fazendo primeiro deploy (preview)...
vercel

echo.
echo  ============================================
echo  PROXIMO PASSO: adicione as variaveis de
echo  ambiente no painel do Vercel:
echo.
echo    OPENAI_API_KEY
echo    SUPABASE_URL
echo    SUPABASE_ANON_KEY
echo    SUPABASE_SERVICE_ROLE_KEY
echo.
echo  Depois rode: vercel --prod
echo  ============================================
echo.
pause
