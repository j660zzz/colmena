# Encargo de ingeniería: velocidad, infraestructura y seguridad

Encargo de Jhon Alexander Marín Rivera para un agente de código (escrito el 5 de noviembre de 2026). Léelo completo antes de tocar algo. Si algo de aquí choca con `AGENTS.md`, manda `AGENTS.md`.

## 0. Contexto en 30 segundos

Colmena es una app web instalable (PWA) hecha con Vite 5, React 18 y Supabase. Es el proyecto de grado de Jhon (Diseño de Comunicación Visual, Pontificia Universidad Javeriana Cali): conecta a estudiantes que emprenden. Se presenta a jurados. El público tiene 18 a 23 años y quiere rapidez: cada segundo de carga cuenta.

- Producción: https://somoscolmena.app (también https://colmena-dcv.netlify.app). Netlify publica solo desde `main`.
- Cada PR contra `main` genera una versión de prueba en `https://deploy-preview-<número>--colmena-dcv.netlify.app`.
- Base de datos: Supabase, proyecto `gajqknhwlwvgjeionfmo` (São Paulo). **Producción y versiones de prueba comparten la misma base.** Aplicar una migración la deja en vivo para todos.
- Lectura pública con la llave publicable (está en `src/lib/supabase.js` y es pública a propósito). Toda escritura pasa por funciones RPC `SECURITY DEFINER` que validan `p_id` + `p_clave` (la clave del dispositivo, guardada en `localStorage` como `colmena.sesion.v1`). No hay contraseñas.

## 1. Lee esto antes de empezar (en este orden)

1. `AGENTS.md`: reglas del repo, reparto de trabajo, marca y voz.
2. `docs/BITACORA.md`: qué se construyó, qué decidió Jhon y qué está descartado.
3. `TODO-AGENTES.md`: pendientes.
4. `supabase/README.md` y `supabase/migraciones/`: tablas, RPC y cómo se administra la base.
5. `src/lib/store.jsx` (carga de datos y tiempo real), `src/lib/supabase.js`, `src/App.jsx`, `vite.config.js` y `netlify.toml`.
6. `docs/fiabilidad-flujos/README.md` y `docs/home-destacados/README.md`: cómo se probó lo que existe.

## 2. Reglas que no se rompen

**Base de datos**
- **No apliques migraciones ni escribas en Supabase.** No tienes que hacerlo y no debes: es producción. Todo cambio de esquema, índice, política, permiso o función se entrega como SQL en `supabase/migraciones/AAAAMMDD_nombre.sql`, con un comentario arriba que explique qué hace, por qué, cómo revertirlo y qué riesgo tiene. Jhon lo revisa y lo aplica él.
- No agregues políticas de escritura directa ni cambies el modelo de "todo se escribe por RPC".
- Las pruebas no pueden escribir en la base: intercepta todas las llamadas `/rest/v1/rpc/` (los scripts de `scripts/qa-*.cjs` ya lo hacen; copia ese patrón). La única excepción permitida es leer `resenas_publicas`.

**Diseño y contenido**
- **Cero cambios visuales.** El diseño acaba de ser aprobado por Jhon. Si optimizas CSS o JS, la app debe verse idéntica: compara capturas antes y después (390 × 844, escala 2, visitante y miembro).
- No toques `src/styles/tokens.css`, `docs/marca/` ni los textos de la interfaz. No cambies íconos ni el componente `Celda`.
- Lo de muestra lleva `es_ejemplo = true` y la etiqueta "Ejemplo". No la quites.
- No vuelvas a proponer lo descartado: la meta del mes con avances semanales, el panal dentro de Encuentro y el SMS para guardar la cuenta.

**Git y publicación**
- Trabaja en ramas `ingenieria/<tema>` desde `main` actualizado. Commits pequeños, en español, que digan qué y por qué.
- Abre uno o varios PR contra `main`. **No fusiones nada ni hagas push a `main`.** Jhon revisa la versión de prueba y decide.
- Nada de llaves, tokens, contraseñas ni datos personales en el repo (es público). La llave publicable de Supabase ya está y no es secreta.
- No agregues dependencias pesadas ni servicios de terceros sin justificarlo en el PR (peso, costo, privacidad). Nada de analítica ni rastreo de terceros.

**Calidad**
- Antes de cada PR: `npm run build` sin errores y todas las pruebas existentes pasando (ver sección 5).
- Si algo no lo puedes verificar, dilo. No inventes cifras: toda mejora va con su medición antes y después.

## 3. Diagnóstico de partida (medido el 5 de noviembre de 2026)

**Velocidad**
- Paquete JS principal: `index-*.js` de 491 KB (143 KB con gzip). El aviso de Vite dice que `src/screens/Beneficios.jsx` se importa a la vez de forma diferida (`App.jsx`) y fija (`components/Inicio.jsx`, `screens/Herramientas.jsx`), así que la división en partes no funciona para esa pantalla.
- CSS: un solo archivo de 134 KB (32 KB con gzip). `src/styles/app.css` tiene capas de reglas que se sobrescriben unas a otras (la misma clase definida varias veces).
- Cabeceras: los archivos con huella (`/assets/*`) se sirven con `cache-control: public,max-age=0,must-revalidate`; deberían ser inmutables por un año. `index.html` y `sw.js` sí deben revalidarse.
- Carga de datos (`src/lib/store.jsx`): el cliente lee tablas completas (`perfiles`, `ayudas`, `me_sirve`, `reto_votos`, `reto_participantes`, `asistencias`, `conexiones`), algunas con `select('*')`. Hoy hay pocos datos, pero crece lineal con el uso.
- Fuentes propias con `@fontsource` (Space Grotesk, Hanken Grotesk, JetBrains Mono): revisa que solo se carguen los pesos y subconjuntos que se usan.

**Seguridad**
- Sin cabeceras de seguridad aparte de HSTS (`max-age=31536000`, sin `includeSubDomains`). Faltan `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y `frame-ancestors`. Ojo: la CSP debe permitir Supabase (`https://gajqknhwlwvgjeionfmo.supabase.co` y `wss://` para tiempo real), los favicons de `https://www.google.com/s2/favicons` (logos de Beneficios) y el login de Microsoft vía Supabase Auth.
- Asesor de seguridad de Supabase:
  - 24 funciones `SECURITY DEFINER` ejecutables por `anon` y `authenticated` (todas las RPC de `supabase/README.md`). Es intencional por diseño, pero hay que auditar cada una: `search_path` fijo, validación de la clave del dispositivo antes de cualquier efecto, validación de longitudes y valores, límites de frecuencia (`publicar`, `contactar` y `proponer_beneficio` ya tienen; revisa las demás), y que no devuelvan columnas privadas (`clave_hash`, `whatsapp`).
  - 5 tablas con RLS activa y sin políticas (`calificaciones`, `contactos`, `contactos_vistos`, `cuentas`, `solicitudes_beneficio`): intencional (solo se tocan por RPC); confírmalo y documéntalo.
- Revisa cómo se guarda y compara `clave_hash` (algoritmo, sal, comparación de tiempo constante) y si un `p_id` + `p_clave` filtrados permiten algo más de lo esperado.
- `npm audit` y versiones de dependencias.

**Base de datos (rendimiento)**
- 14 llaves foráneas sin índice: `asistencias.perfil_id`, `ayudas.perfil_id`, `calificaciones.de_id`, `calificaciones.para_id`, `conexiones.a_id`, `contactos_vistos.a_quien`, `contactos_vistos.quien`, `me_sirve.perfil_id`, `publicaciones.autor_id`, `reto_participantes.perfil_id`, `reto_votos.votante_id`, `solicitudes_beneficio.perfil_id`, `taller_interes.perfil_id`, `talleres.dicta_id`.
- `contactos_vistos` no tiene llave primaria.

**Infraestructura**
- No hay integración continua: las pruebas (`tests/*.test.js`, `scripts/qa-*.cjs`) se corren a mano. `package.json` no tiene scripts `test` ni `qa`. Los scripts de QA requieren `playwright` global y la variable `COLMENA_CHROMIUM`.
- Producción y pruebas comparten la base: cualquier error de una versión de prueba afecta datos reales.
- Dominio nuevo `somoscolmena.app`: el PR #15 lo vuelve dirección principal en la vista previa al compartir. Falta que `colmena-dcv.netlify.app` redirija al dominio principal (se configura en Netlify, lo hace Jhon) y agregar el dominio en Supabase Auth (Jhon).

## 4. La tarea

Haz una auditoría de ingeniería y entrega mejoras reales, priorizadas. Puedes dividirla en varios PR (recomendado: uno por bloque). Para cada punto: mide antes, cambia, mide después y documenta.

### Bloque A · Seguridad (prioridad alta)
1. **Cabeceras en `netlify.toml`**: CSP estricta que no rompa nada (prueba login, tiempo real, logos, PWA y vista previa), HSTS con `includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` mínima y `frame-ancestors 'none'`. Verifica con `curl -I` en la versión de prueba y que la consola no muestre violaciones de CSP en ningún flujo.
2. **Auditoría de las 24 RPC**: lee el SQL de cada función. Si no está en el repo, usa el de `supabase/migraciones/`. Si falta, documenta qué no pudiste ver y escribe una consulta de solo lectura que Jhon pueda correr para obtener las definiciones (`pg_get_functiondef`). Entrega un informe por función (riesgo, evidencia, arreglo) y, si hace falta, una migración propuesta (sin aplicarla) con `set search_path = public, pg_temp`, validaciones y límites.
3. **Exposición de datos**: confirma qué columnas puede leer `anon` en cada tabla (permisos por columna, RLS) y que `whatsapp` y `clave_hash` nunca salen. Si encuentras una fuga, avisa en el PR con prioridad y propón el arreglo.
4. `npm audit` y actualización segura de dependencias (sin saltos de versión mayor que rompan algo; si propones uno, justifícalo).

### Bloque B · Velocidad (prioridad alta)
5. **División del paquete**: arregla la importación mixta de `Beneficios.jsx` (por ejemplo, mueve `Logo`, `rango`, `Aliados` y `Proponer` a un módulo propio que no arrastre la pantalla completa). Separa `@supabase/supabase-js` y React en partes propias si mejora la caché. Meta orientativa: paquete inicial por debajo de 300 KB sin comprimir, sin romper la carga diferida ni la PWA sin conexión.
6. **Caché**: `/assets/*` con `Cache-Control: public, max-age=31536000, immutable`; `index.html`, `sw.js`, `manifest.webmanifest` y `registerSW.js` sin caché larga. Confirma que una actualización sigue llegando a la app instalada.
7. **Fuentes**: precarga solo lo que pinta la primera pantalla, con los pesos y subconjuntos usados y `font-display` adecuado.
8. **CSS**: elimina reglas duplicadas o muertas de `app.css` **solo si las capturas antes y después son idénticas píxel a píxel** (haz la comparación con un script y adjunta el resultado). Si no puedes garantizarlo, déjalo como propuesta.
9. **Datos**: reduce lo que lee el cliente sin cambiar el esquema (columnas explícitas en vez de `*`, límites razonables, no recargar lo que no cambia). Lo que necesite vistas, índices o RPC nuevas va como migración propuesta.
10. Mide con Lighthouse (móvil, red lenta 4G) en la versión de prueba antes y después: LCP, TBT, CLS, peso transferido y tiempo hasta que el muro muestra publicaciones. Pon la tabla en el informe.

### Bloque C · Infraestructura (prioridad media)
11. **Integración continua** en `.github/workflows/ci.yml`: en cada PR, `npm ci`, `npm run build`, `node --test tests/` y los scripts de QA con Chromium (todas las RPC interceptadas; nunca escritura real). Agrega `test` y `qa` a `package.json` y haz que los scripts funcionen sin `playwright` global (agrégalo como dependencia de desarrollo si hace falta).
12. **Índices**: migración propuesta con los 14 índices de llaves foráneas y una llave primaria para `contactos_vistos`. Explica el costo (pequeño) y el beneficio esperado.
13. **Entorno de pruebas separado**: propón cómo dejar de compartir la base entre producción y versiones de prueba (rama de Supabase o proyecto aparte, variables `VITE_SUPABASE_URL`/`VITE_SUPABASE_KEY` por contexto en Netlify, datos de ejemplo). Escríbelo como plan paso a paso para Jhon; no lo ejecutes.
14. **Errores en producción**: propón una forma liviana y sin terceros de saber cuándo algo falla (por ejemplo, una RPC de registro de errores con límite de frecuencia). Solo propuesta, con SQL sin aplicar.

### Bloque D · Opcional, si te queda tiempo
15. Vista previa propia por publicación compartida (`/?publicacion=<id>`): una función Edge de Netlify que lea la publicación con la llave publicable y devuelva las etiquetas Open Graph con el texto y el nombre de quien publicó, sin afectar a las personas que abren la app.
16. Revisa el flujo de actualización de la PWA y el modo sin conexión con la caché nueva.

## 5. Cómo probar

```bash
npm install
npm run build
npm run preview -- --port 4174 --host 127.0.0.1   # en otra terminal
node --test tests/destacados.test.js tests/historias.test.js
COLMENA_CHROMIUM=<ruta a Chrome o Chromium> node scripts/qa-home.cjs
COLMENA_CHROMIUM=<ruta> node scripts/qa-visor.cjs
COLMENA_CHROMIUM=<ruta> node scripts/qa-fiabilidad.cjs
COLMENA_CHROMIUM=<ruta> node scripts/qa-pwa.cjs
```

Hoy pasan: 14 pruebas de reglas, 35 de inicio, 9 del visor, 35 de fiabilidad y 6 de PWA. Deben seguir pasando. Los scripts reescriben archivos de resultados y capturas en `docs/fiabilidad-flujos/` y `docs/home-destacados/`: no subas esos cambios salvo que sean parte de tu evidencia.

## 6. Qué me entregas (y cuándo me muestras)

1. **Antes de escribir código**, deja en el primer PR (o como comentario del issue) un plan corto: qué vas a hacer, en qué orden y en cuántos PR. Si el plan cambia mucho respecto a este encargo, explícalo.
2. `docs/ingenieria/README.md` con: hallazgos por gravedad (crítico, alto, medio, bajo), evidencia de cada uno, qué cambiaste, mediciones antes y después, migraciones propuestas (sin aplicar) y decisiones que le tocan a Jhon.
3. Uno o varios PR contra `main`, cada uno con: qué cambia, por qué, cómo se probó, riesgos y cómo revertirlo, y el enlace a su versión de prueba.
4. Actualiza `docs/BITACORA.md` (entrada nueva arriba) y `TODO-AGENTES.md`.
5. **No fusiones.** Al terminar, deja un resumen de 10 líneas como máximo: qué cambiaste, los enlaces de las versiones de prueba y qué decisiones le tocan a Jhon. Jhon revisa y responde "sube" cuando quiera publicarlo.
