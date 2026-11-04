# Guardar el carnet con el correo Javeriana

## Por qué
El carnet vive en el navegador (`localStorage`). Cerrar la app no lo borra, pero se pierde si la persona borra los datos del navegador, cambia de celular o de navegador, o, en iPhone sin instalar la app, después de 7 días sin abrirla (Safari borra lo guardado por la página: [WebKit, 2020](https://mjtsai.com/blog/2020/03/26/safari-13-1-third-party-cookie-blocking-and-7-day-script-writeable-storage/)).

Se eligió el correo Javeriana (cuenta Microsoft) porque es gratis, no necesita SMS ni servicio de correo y además confirma que la persona estudia en la Javeriana Cali. Opciones descartadas:
- SMS: necesita un proveedor como Twilio, que cobra ([Supabase](https://supabase.com/docs/guides/auth/phone-login)).
- Código por correo: el correo que trae Supabase solo llega a miembros del equipo del proyecto, 2 por hora ([Supabase](https://supabase.com/docs/guides/auth/auth-smtp)).

## Cómo funciona
1. La persona crea su carnet como hoy (sin contraseña).
2. En "Tu carnet está listo" y en Mi carnet aparece **Guarda tu carnet**. Toca **Guardar con correo Javeriana**, entra con Microsoft y vuelve a la app.
3. La función `vincular_cuenta` une el carnet con esa cuenta en la tabla privada `cuentas`. Solo acepta correos `@javerianacali.edu.co`.
4. En otro celular toca **¿Ya tienes carnet? Recupéralo con tu correo Javeriana** (en Crear carnet o en la pestaña Carnet). `recuperar_carnet` devuelve el carnet con una clave nueva para ese dispositivo. El dispositivo anterior deja de poder publicar con ese carnet hasta que lo recupere otra vez.
5. La sesión de Microsoft se cierra apenas termina: la app sigue funcionando con la clave del dispositivo, como antes.

Migración: `supabase/migraciones/20261104_cuentas_javeriana.sql` (ya aplicada). `cuentas` no tiene políticas: no se lee desde el cliente. Borrar el perfil borra también su fila en `cuentas`.

## Lo que tiene que hacer Jhon (una sola vez, unos 15 minutos)
Mientras no se haga, los botones muestran "todavía no está activo" y nada se rompe.

1. **Registrar la app en Microsoft.** Entra a [portal.azure.com](https://portal.azure.com) con una cuenta Microsoft personal (si pide crear una cuenta gratis de Azure, sigue los pasos; no necesitas pagar). Ve a **Microsoft Entra ID → Registros de aplicaciones → Nuevo registro**.
   - Nombre: `Colmena`.
   - Tipos de cuenta: **Cuentas en cualquier directorio organizativo (multiinquilino)**.
   - URI de redirección (Web): `https://gajqknhwlwvgjeionfmo.supabase.co/auth/v1/callback`.
2. En la app creada, copia el **Id. de aplicación (cliente)**. En **Certificados y secretos → Nuevo secreto de cliente**, crea uno y copia el **Valor** (solo se ve una vez).
3. En **Permisos de API**, confirma que están `openid`, `email` y `profile` (Microsoft Graph, delegados).
4. **Activar en Supabase:** Authentication → Sign In / Providers → **Azure**. Pega el Id. de cliente y el secreto. Deja el campo de URL del inquilino vacío (la restricción al dominio Javeriana la hace la base de datos).
5. **URLs permitidas:** Authentication → URL Configuration. Site URL: `https://colmena-dcv.netlify.app`. En Redirect URLs agrega `https://colmena-dcv.netlify.app/**`, `https://*--colmena-dcv.netlify.app/**` y `http://localhost:5173/**`.
6. Prueba con tu correo Javeriana: crea un carnet, toca Guardar, abre la app en otro navegador y toca Recuperar.

**Riesgo:** si sistemas de la Javeriana no deja que los estudiantes autoricen apps externas, Microsoft muestra "Se necesita la aprobación del administrador". En ese caso hay que pedirle a la Mesa de servicio del CSI que apruebe la app "Colmena" (solo pide leer nombre y correo) o cambiar a otra forma de guardar el carnet.
