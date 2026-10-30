# Trabajar Colmena desde Antigravity (Gemini u otro agente)

## 1. Clonar (una sola vez)
En la terminal de Antigravity:
```bash
git clone https://github.com/j660zzz/colmena.git
cd colmena
npm install
npm run dev
```
Abre http://localhost:5173. Para verlo como celular: DevTools → modo dispositivo (390 × 844).

## 2. Antes de cada sesión
```bash
git checkout main
git pull
git checkout -b diseno/<lo-que-vas-a-mejorar>
```

## 3. Prompt de arranque para el agente
Pega esto al empezar:

> Lee `AGENTS.md` completo antes de tocar nada. Vas a trabajar SOLO en la capa visual de Colmena: `src/styles/app.css` y el marcado JSX de `src/screens/*` y `src/components/ui.jsx`. No modifiques `src/lib/*`, `supabase/*` ni la lógica de datos. No cambies `src/styles/tokens.css` sin preguntarme. Respeta el sistema de marca bloqueado (ámbar solo en sus 4 usos, verde solo semántico, Space Grotesk / Hanken Grotesk / JetBrains Mono, hexágono estructural). Mantén la etiqueta "Ejemplo" de los perfiles de muestra. La tarea de hoy es: **[describe la mejora]**. Muéstrame el resultado en el navegador a 390 px de ancho antes de hacer commit.

## 4. Al terminar
```bash
npm run build          # si falla, no subas
git add -A
git commit -m "diseño: <qué cambió>"
git push -u origin diseno/<lo-que-vas-a-mejorar>
```
Luego en GitHub abre el Pull Request y fusiónalo a `main`. Netlify publica solo.

## Si dos agentes tocaron lo mismo
Git va a marcar conflicto al fusionar. No elijas a ciegas: pídele a cualquiera de los agentes que lo resuelva conservando ambos cambios, y vuelve a correr `npm run build`.
