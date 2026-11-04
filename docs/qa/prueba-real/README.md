# Prueba real de escrituras · 4 de noviembre de 2026

Versión probada: https://deploy-preview-6--colmena-dcv.netlify.app (commit `6a1c03d`), con la base de datos de producción.
Dos celulares emulados con Playwright (iPhone 13 y Pixel 7) y dos carnets de prueba ("Prueba QA Ana" y "Prueba QA Beto"). WhatsApp se interceptó: se verificó el enlace y el mensaje, no se envió nada.

## Resultado: 18 de 18 pasos correctos, cero errores de JavaScript

| Paso | Resultado |
|---|---|
| Bienvenida → Crear carnet (Ana), con habilidad en el carnet listo | OK |
| Ana publica un Necesito en el muro | OK |
| Beto crea su carnet desde la cabecera | OK |
| Beto ve la publicación, marca Útil | OK |
| Puedo ayudar abre `wa.me/57…` con "puedo ayudarte" | OK |
| Beto abre el carnet de Ana en Miembros y ve su habilidad | OK |
| "Pídele ayuda con" abre WhatsApp con "Me interesa tu ayuda con packaging" | OK |
| Beto se inscribe al encuentro | OK |
| Ana ve "¿Se concretó la ayuda?" y confirma | OK |
| Ana recibe la tarjeta para calificar y publica su reseña | OK |
| Beto califica y ve la reseña de Ana (se revelan juntas) | OK |
| El carnet de Beto cuenta "1 ayuda dada" y gana la insignia Primera ayuda | OK |
| Limpieza: ambos borran su carnet desde Editar | OK |

Comprobado después en la base: 0 perfiles, publicaciones o contactos de prueba; los totales volvieron a los de antes (9 perfiles, 11 publicaciones, 4 asistencias, 6 calificaciones).

## Efectos que quedan

- La secuencia de números de carnet avanzó: el próximo miembro real será **COL-0106** (los números 102 a 105 los usaron los carnets de prueba de varias corridas).
- En la versión de prueba de Netlify aparece la barra "Netlify Drawer", que en el celular tapa los botones de abajo. No existe en producción; para revisar la versión de prueba en el teléfono se puede minimizar. El script la oculta.

## No cubierto

Teléfono físico (teclado real, instalar la PWA, abrir la app de WhatsApp), lector de pantalla, reto con link de propuesta y votos.
