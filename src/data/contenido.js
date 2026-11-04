export const CATS = ['Marca', 'Diseño', 'Redes sociales', 'Web/UX', 'Foto', 'Video', 'Ilustración', 'Producción', 'Moda', 'Comida', 'Otro']
export const TOOLCATS = ['Precio', 'Ventas', 'Legal', 'Marca']

// Habilidades sugeridas al crear el carnet, según las categorías elegidas (la persona puede escribir otras)
export const SUGERENCIAS = {
  Marca: ['Logo', 'Identidad', 'Manual de marca', 'Naming'],
  'Diseño': ['Piezas gráficas', 'Packaging', 'Editorial', 'Tipografía'],
  'Redes sociales': ['Contenido para redes', 'Community management', 'Copywriting'],
  'Web/UX': ['Diseño web', 'Tienda en línea', 'UX/UI'],
  Foto: ['Fotografía de producto', 'Retoque', 'Bodegón'],
  Video: ['Reels', 'Edición de video', 'Animación'],
  'Ilustración': ['Ilustración digital', 'Patrones', 'Mural'],
  'Producción': ['Impresión', 'Proveedores', 'Tirajes cortos', 'Costos'],
  Moda: ['Confección', 'Estampado', 'Patronaje'],
  Comida: ['Costos de cocina', 'Menús', 'Ferias'],
  Otro: ['Ventas', 'Atención al cliente']
}

// Insignias calculadas con actividad real del perfil (ver statsDe en Carnet.jsx)
export const BADGES = [
  { n: 'Miembro de Colmena', k: 'card', ok: () => true },
  { n: 'Primera publicación', k: 'wall', ok: (s) => s.publicaciones >= 1 },
  { n: 'Primera ayuda', k: 'hand', ok: (s) => s.manos >= 1 },
  { n: 'Perfil completo', k: 'seal', ok: (s) => s.completo },
  { n: 'Primer reto', k: 'spark', ok: (s) => s.retos >= 1 },
  { n: 'Primer encuentro', k: 'cal', ok: (s) => s.encuentros >= 1 },
  { n: 'Primera reseña', k: 'star', ok: (s) => s.resenas >= 1 },
  { n: 'Cinco ayudas', k: 'users', ok: (s) => s.manos >= 5, meta: 5, prog: (s) => s.manos }
]

export const CHIPS_CALIFICAR = ['Cumplió a tiempo', 'Buena comunicación', 'Buena calidad', 'La recomiendo']
export const PALABRA_ESTRELLAS = ['', 'Mala', 'Regular', 'Buena', 'Muy buena', 'Excelente']

// Fichas de la biblioteca. Contenido práctico y general; lo legal lleva nota de verificación.
export const TOOLS = [
  {
    id: 'presupuesto', n: 'Presupuesto en una página', k: 'Plantilla', cat: 'Precio',
    d: 'Una estructura clara para cotizar.',
    lead: 'Un presupuesto claro evita malentendidos: deja por escrito qué incluye, qué no y cuánto cuesta.',
    secciones: [
      { h: 'Lo que nunca puede faltar', ul: [
        'A quién va dirigido y la fecha.',
        'Alcance: qué incluye y, sobre todo, qué NO incluye.',
        'Entregables concretos (formatos, cantidades).',
        'Tiempos de entrega y número de rondas de ajustes.',
        'Valor total, anticipo y forma de pago.',
        'Vigencia: hasta cuándo es válido ese precio.'
      ] },
      { h: 'Copia y adapta', pre:
`PRESUPUESTO · [Tu marca]
Para: [Cliente] · Fecha: [dd/mm/aaaa]

PROYECTO
[Una línea que diga qué vas a hacer]

INCLUYE
- [Entregable 1]
- [Entregable 2]
- [N] rondas de ajustes

NO INCLUYE
- [Lo que sueles terminar haciendo gratis]

TIEMPO
[N] días hábiles desde el anticipo y la información completa.

VALOR
Total: $[valor]
Anticipo para arrancar: [50] % · Saldo contra entrega

Vigencia: 15 días.` }
    ]
  },
  {
    id: 'anticipo', n: 'Cómo cobrar un anticipo', k: 'Ficha', cat: 'Ventas',
    d: 'Qué porcentaje pedir y cómo plantearlo.',
    lead: 'El anticipo no es desconfianza: es lo que compromete al cliente y te protege el tiempo.',
    secciones: [
      { h: 'Esquemas comunes', ul: [
        'Proyectos cortos: 50 % para arrancar y 50 % contra entrega.',
        'Proyectos largos: por hitos, por ejemplo 40 / 30 / 30.',
        'Producción con materiales: el anticipo cubre al menos los insumos.'
      ] },
      { h: 'Cómo proponerlo', p: [
        'Ponlo en el presupuesto desde el inicio, no lo negocies al final.',
        '“Para separar la fecha y arrancar, trabajo con un anticipo del 50 %. El saldo se paga al entregar.”',
        'Si el cliente no paga el anticipo, el proyecto no ha empezado. No adelantes trabajo.'
      ] }
    ]
  },
  {
    id: 'contrato', n: 'Contrato simple de servicio', k: 'Plantilla', cat: 'Legal',
    d: 'Las cláusulas básicas, en lenguaje claro.',
    lead: 'Un acuerdo corto y firmado te protege más que una conversación por chat. Esta es una guía de puntos para incluir, no asesoría legal.',
    secciones: [
      { h: 'Puntos que debe cubrir', ol: [
        'Partes: quién contrata a quién (nombres y documento).',
        'Objeto: qué servicio se presta.',
        'Entregables y plazos.',
        'Valor, anticipo y fechas de pago.',
        'Rondas de ajustes incluidas y costo de las adicionales.',
        'Derechos de uso: qué puede hacer el cliente con el trabajo y si puedes mostrarlo en tu portafolio.',
        'Qué pasa si alguna parte cancela.',
        'Firmas y fecha.'
      ] }
    ],
    nota: 'Para proyectos grandes o temas de propiedad intelectual, revísalo con un abogado o con el consultorio jurídico de la universidad.'
  },
  {
    id: 'factura', n: 'Tu primera factura', k: 'Ficha', cat: 'Legal',
    d: 'RUT, facturación y qué debe llevar el documento.',
    lead: 'Facturar te abre la puerta a empresas y clientes grandes. El primer paso es tener el RUT.',
    secciones: [
      { h: 'Paso a paso', ol: [
        'Tramita tu RUT ante la DIAN. Es gratuito.',
        'Revisa con la DIAN o con un contador si, por tu actividad e ingresos, estás obligado a facturar electrónicamente.',
        'La DIAN ofrece una solución gratuita de facturación electrónica para quienes empiezan.',
        'Guarda copia de todo lo que factures y de tus gastos.'
      ] },
      { h: 'Datos básicos de una factura', ul: [
        'Tus datos y tu número de identificación tributaria.',
        'Datos del cliente.',
        'Número consecutivo y fecha.',
        'Descripción del servicio o producto.',
        'Valor total e impuestos, si aplican.'
      ] }
    ],
    nota: 'Las reglas tributarias cambian. Confirma tu caso en dian.gov.co o con un contador antes de facturar.'
  },
  {
    id: 'frio', n: 'Mensajes para conseguir clientes', k: 'Plantilla', cat: 'Ventas',
    d: 'Una estructura de cuatro líneas y tres ejemplos.',
    lead: 'Un mensaje corto tiene más probabilidades de recibir respuesta. Usa cuatro líneas y termina con una pregunta fácil.',
    secciones: [
      { h: 'La estructura', ol: [
        'Quién eres, en una línea.',
        'Por qué le escribes a ESA persona (algo específico que viste).',
        'Qué propones, concreto.',
        'Una pregunta que se responda con sí o no.'
      ] },
      { h: 'Ejemplos', pre:
`1 · A un restaurante
Hola, soy Laura, hago fotografía de comida en Cali. Vi que lanzaron carta nueva y las fotos del menú no le hacen justicia a los platos. Les propongo una sesión de 10 platos en una tarde. ¿Les mando ejemplos?

2 · A una marca de ropa
Hola, soy Andrés, edito reels para marcas locales. Su contenido de producto está muy bien, pero los videos se cortan antes del gancho. Puedo reeditar uno gratis para que vean la diferencia. ¿Les interesa?

3 · A otro emprendedor de Colmena
Hola, vi en Colmena que buscas quién te imprima etiquetas en vinilo. Yo imprimí las mías con una imprenta que hace tirajes cortos. ¿Te paso el contacto?` }
    ]
  },
  {
    id: 'portafolio', n: 'Qué poner en tu portafolio', k: 'Ficha', cat: 'Marca',
    d: 'Tres proyectos bien contados valen más que diez.',
    lead: 'Un portafolio no es un álbum: es la prueba de que sabes resolver problemas.',
    secciones: [
      { h: 'Cada proyecto debe contar', ul: [
        'El problema: qué necesitaba el cliente.',
        'Tu proceso: dos o tres decisiones clave, no todos los bocetos.',
        'El resultado: piezas finales bien fotografiadas o en mockup, y si puedes, una cifra.'
      ] },
      { h: 'Errores comunes', ul: [
        'Meter todo lo que has hecho. Elige tus tres mejores.',
        'No decir qué hiciste tú cuando fue en equipo.',
        'Esconder el contacto. Que se vea en la primera pantalla.'
      ] }
    ]
  }
]
