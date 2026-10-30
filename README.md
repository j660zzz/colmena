# Colmena

**Donde el que empieza deja de estar solo.**
Comunidad de estudiantes emprendedores de Diseño de Comunicación Visual · Pontificia Universidad Javeriana Cali.

Prototipo funcional del Proyecto de Grado *"Sistema articulado de apoyo para el emprendedor local"* — Jhon Alexander Marín Rivera, 2026.

## Qué hace
- **Muro**: publicas lo que necesitas o lo que ofreces; los demás responden "Puedo ayudar" y te escriben. Se actualiza en tiempo real.
- **Miembros**: directorio por habilidad, con conexión entre miembros.
- **Carnet**: identidad del miembro con número, actividad e insignias que se ganan participando.
- **Encuentro**: el encuentro presencial del mes y quién va.
- **Herramientas**: calculadora de precios y fichas prácticas (presupuesto, anticipo, contrato, factura, mensajes en frío, portafolio).

Se instala en el celular como app (PWA): abre el link y usa "Agregar a pantalla de inicio".

## Stack
Vite + React · Supabase (Postgres + tiempo real) · Netlify · vite-plugin-pwa.

## Desarrollo
```bash
npm install
npm run dev
```
Reglas para agentes y colaboradores: ver [AGENTS.md](AGENTS.md).

## Interfaz Bloques · Vínculo

Diseño elegido por Jhon e implementado sobre la marca v2.0: autor al frente de las publicaciones, tarjetas en contraste, navegación flotante y componentes compartidos para el resto de la app. Se mantienen las lecturas públicas, sesiones de dispositivo y escrituras por RPC existentes.

La revisión visual, capturas y comprobaciones están en [design-qa.md](design-qa.md). Las propuestas anteriores se conservan en `mockups/rediseno-ui/` como documentación; la app usa datos de Supabase, no el snapshot de los mockups.

## Administración rápida
Los datos viven en Supabase (proyecto `colmena`). Para cambiar la fecha o el lugar del encuentro, edita la fila de la tabla `encuentros` desde el Table Editor de Supabase.
