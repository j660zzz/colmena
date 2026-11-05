# Ingeniería — Bloque A · Seguridad

Auditoría de seguridad (primera parte del encargo `docs/ingenieria/ENCARGO.md`). Rama `ingenieria/seguridad`, PR contra `main`. **No se aplicó ninguna migración ni se escribió en Supabase.** Cero cambios visuales.

Estado: **en revisión por Jhon** (versión de prueba pendiente de generar).

## Resumen

| Punto del encargo | Resultado |
|---|---|
| A.1 Cabeceras de seguridad | Hecho en `netlify.toml` (CSP, HSTS+includeSubDomains, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors) |
| A.2 Auditoría de las 24 RPC | Parcial: 5 audítables en el repo; 19 requieren el SQL que solo vive en Supabase (consulta de solo lectura entregada) |
| A.3 Exposición de datos | Patrón verificado en las migraciones presentes; consulta de solo lectura entregada para confirmar `whatsapp`/`clave_hash` |
| A.4 npm audit y dependencias | `npm audit fix` no cambia nada (sin arreglo sin salto mayor); documentado y con decisión para Jhon |

## Hallazgos por gravedad

### Alto
1. **Sin cabeceras de seguridad.** Antes solo había HSTS automático de Netlify (`max-age=31536000`, sin `includeSubDomains`). Faltaban `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y `frame-ancestors`. **Arreglado** en `netlify.toml`.
2. **19 de las 24 RPC no están en el repo.** Su SQL vive en las migraciones de Supabase (`esquema_inicial`, `proteger_clave_y_semilla`, `solo_lectura_directa`, `v0_manos_whatsapp_retos`, …) que no tienen copia en `supabase/migraciones/`. No se pueden auditar leyendo el código. **Acción:** correr `docs/ingenieria/auditoria-rpc.sql` (solo lectura) para extraerlas y completar la auditoría.

### Medio
3. **`clave_hash` usa SHA-256 sin sal** (`encode(extensions.digest(v_clave, 'sha256'), 'hex')`, visto en `recuperar_carnet`). Es aceptable porque la clave es un token aleatorio de 192 bits (`gen_random_bytes(24)`), no una contraseña humana; la sal es innecesaria con esa entropía. **No verificable:** la comparación en `_perfil_por_clave` (¿tiempo constante?) no está en el repo.
4. **Dependencias con avisos sin arreglo no rompiente.** `vite@5.4.21` (directa, alta: advisory del dev server `esbuild` GHSA-67mh-4wv8-2f99) y transitivas de solo build (`deepmerge`, `glob`, `minimatch`, `@rollup/plugin-node-resolve`, vía `workbox-build`). `npm audit fix` no aplica ningún cambio (verificado); el arreglo de `vite` exige salto a vite 8 (breaking). Ninguna de las transitivas se publica al cliente.

### Bajo
5. **`Permissions-Policy`** arranca con lo mínimo razonable (cámara, micrófono, geolocalización, pago y USB apagados). La app no usa ninguno.

## Qué se cambió

### `netlify.toml` — cabeceras para `/*`
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://www.google.com/s2/favicons; font-src 'self'; connect-src 'self' https://gajqknhwlwvgjeionfmo.supabase.co wss://gajqknhwlwvgjeionfmo.supabase.co; worker-src 'self'; manifest-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'
```

**Por qué cada decisión (evidencia):**
- `script-src 'self'` sin `'unsafe-inline'`: el build de Vite no genera scripts inline. En `dist/index.html` solo hay `<script src="/assets/index-*.js">` y `<script src="/registerSW.js">` externos; `registerSW.js` es una línea que solo registra el service worker.
- `style-src 'self' 'unsafe-inline'`: **necesario**. La app usa 37 atributos `style={{…}}` de React (p. ej. `--d`, `--dur`, `--mono` en `src/screens/Onboarding.jsx`, `src/components/ui.jsx`), que se renderizan como `style="..."` y una CSP sin `'unsafe-inline'` los bloquearía y rompería animaciones y colores. El riesgo de inyección de estilos es bajo comparado con el de scripts.
- `img-src` con `https://www.google.com/s2/favicons`: logos de Beneficios (`src/screens/Beneficios.jsx:42`).
- `connect-src` con Supabase `https://` y `wss://`: REST, tiempo real y `fetch('/auth/v1/settings')` (`src/lib/supabase.js`, `src/lib/store.jsx`).
- `frame-ancestors 'none'` + `X-Frame-Options: DENY`: anti-clickjacking. Ojo: puede bloquear la vista previa incrustada del panel de Netlify (la URL `deploy-preview-N` directa sí funciona).

### Auditoría de las RPC visibles
Solo hay SQL en el repo de 5 funciones; todas pasan los controles esperados:

| Función | Archivo | `search_path` fijo | Valida clave antes | Validación de entrada |
|---|---|---|---|---|
| `vincular_cuenta` | `20261104_cuentas_javeriana.sql` | `public, extensions` | sí (`_perfil_por_clave`) | dominio `@javerianacali.edu.co`, unicidad de cuenta |
| `recuperar_carnet` | `20261104_cuentas_javeriana.sql` | `public, extensions` | sí (auth.uid + correo) | n/a (devuelve null si no hay cuenta) |
| `mi_cuenta` | `20261104_cuentas_javeriana.sql` | `public, extensions` | sí (`_perfil_por_clave`) | n/a |
| `_correo_javeriana` | `20261104_cuentas_javeriana.sql` | `public` | n/a (helper, `revoke` de anon/authenticated) | normaliza y valida el dominio |
| `alternar_interes_taller` | `20261104_talleres.sql` | `public, extensions` | sí (`_perfil_por_clave`) | n/a (alterna) |

Las otras 19 (`crear_perfil`, `actualizar_perfil`, `mi_whatsapp`, `borrar_perfil`, `publicar`, `borrar_publicacion`, `marcar_resuelta`, `contactar`, `confirmar_mano`, `mis_pendientes`, `calificar`, `alternar_me_sirve`, `alternar_ayuda`, `alternar_conexion`, `alternar_asistencia`, `unirse_reto`, `salir_reto`, `alternar_voto_reto`, `proponer_beneficio`, `resenas_publicas` y el helper `_perfil_por_clave`) no están en el repo. `docs/ingenieria/auditoria-rpc.sql` las recupera con `pg_get_functiondef`.

### Exposición de datos
El patrón de permisos por columna se ve en las migraciones presentes (`revoke all … from anon, authenticated` + `grant select` selectivo) y `src/lib/store.jsx` ya selecciona columnas explícitas en `perfiles` (`PERFIL_COLS`, sin `whatsapp` ni `clave_hash`). La consulta 2 y 3 de `auditoria-rpc.sql` confirman en producción qué columnas puede leer cada rol.

## Mediciones antes / después

- **Cabeceras:** antes, ninguna de seguridad propia (solo HSTS automático). Después, las 7 de arriba. La verificación con `curl -I` queda pendiente de que Netlify genere la versión de prueba; se validará `Content-Security-Policy` presente y sin violaciones en consola en los flujos (muro, login, logos, PWA).
- **`npm audit`:** 7 vulnerabilidades antes y después (2 low, 4 moderate, 1 high). `npm audit fix` no produjo cambios (sin arreglo dentro del rango semver actual). Desglose en la tabla de dependencias.

## Dependencias (`npm audit`, 5-nov-2026)

| Paquete | Severidad | Directa | Afecta | Arreglo disponible |
|---|---|---|---|---|
| `vite` | alta | sí | dev server (`esbuild` ≤0.24.2) | solo `vite@8` (breaking) |
| `esbuild` | moderada | no (vía vite) | dev server | solo `vite@8` (breaking) |
| `workbox-build` | moderada | no (vía vite-plugin-pwa) | build | no |
| `deepmerge` | baja | no | build (prototype pollution en tooling) | no (4.3.1 ya es la última) |
| `@rollup/plugin-node-resolve` | baja | no | build | no |
| `glob` | moderada | no | build | no |
| `minimatch` | moderada | no | build | no |

Ninguna de las transitivas se publica al cliente; son dependencias de `workbox-build` (generación del service worker en build). El único aviso con impacto directo en el usuario es el de `vite`/`esbuild`, y solo afecta al servidor de desarrollo local, no al bundle de producción.

## Migraciones propuestas (sin aplicar)

Ninguna en este bloque. El endurecimiento de las 19 RPC pendientes (validaciones, límites de frecuencia, `search_path` fijo) depende de las definiciones que Jhon extraiga con `auditoria-rpc.sql`; se entregarán como migración propuesta en una iteración posterior.

## Decisiones que le tocan a Jhon

1. **Extraer y revisar las 19 RPC** con `docs/ingenieria/auditoria-rpc.sql` y pegar el resultado aquí para completar la auditoría.
2. **Actualizar `vite`** a 6/7/8 (salto mayor) para cerrar el aviso del dev server, o dejarlo como está (solo afecta desarrollo local).
3. **Confirmar `frame-ancestors 'none'`**: si Jhon usa la vista previa incrustada del panel de Netlify, esa vista dejará de cargar en el iframe (la URL directa de la preview sí funciona).
4. **Verificar con `curl -I`** la versión de prueba y probar los flujos (login Microsoft, tiempo real, logos, PWA) para confirmar que la CSP no rompe nada.

## Cómo se probó (local)

- `npm run build` sin errores (491 KB de JS principal, sin cambios de diseño).
- `node --test tests/destacados.test.js tests/historias.test.js` (14 pruebas de reglas).
- Inspección de `dist/index.html`, `dist/registerSW.js` y `dist/sw.js` para confirmar que no hay scripts inline ni recursos externos que la CSP bloquearía.
- No se corrieron los scripts de QA de Playwright porque requieren `COLMENA_CHROMIUM` y no aportan a cabeceras (no cambian el DOM ni el diseño).
