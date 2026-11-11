@echo off
rem Copia el juego (carpeta la-jaula) adentro de la app. Ejecutalo despues de cada cambio al juego.
rem Cambia la ruta si tu carpeta la-jaula esta en otro lado.
set JUEGO=%USERPROFILE%\Desktop\la-jaula
rmdir /s /q "app\src\main\assets\www"
robocopy "%JUEGO%" "app\src\main\assets\www" /E /XD .git supabase /XF LEEME.md README.md render.yaml plantilla-48.png plantilla-guia.png
echo Listo: juego copiado en app\src\main\assets\www
pause
