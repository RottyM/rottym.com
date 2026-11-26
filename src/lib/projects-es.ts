import type { Project } from './projects';
import type { SiteLang } from '@/components/ThemeProvider';

type ProjectEsOverride = Partial<
  Pick<
    Project,
    | 'role'
    | 'category'
    | 'tag'
    | 'liveUrlLabel'
    | 'highlightMetric'
    | 'summary'
    | 'challenge'
    | 'solution'
    | 'beforeAfter'
    | 'details'
    | 'caseStudy'
  >
>;

export const PROJECTS_ES: Record<string, ProjectEsOverride> = {
  throttlelife: {
    role: 'Concepto y Arquitectura',
    category: 'Arquitectura de Plataforma',
    tag: 'Stack Next.js',
    highlightMetric: 'Respuestas API < 200ms · Sistema móvil de respuesta inmediata',
    summary:
      'Ecosistema digital de alto rendimiento para motociclistas con datos en tiempo real, cuentas de usuario y sincronización en la nube.',
    challenge:
      'Crear una interfaz móvil táctil e instantánea para motociclistas en ruta que exige alto contraste, estabilidad sin conexión y telemetría rápida sin demoras.',
    solution:
      'Construido con Next.js App Router, caché en edge y estado ligero para lograr fluidez móvil bajo redes variables.',
    details:
      'Demuestra arquitectura moderna de aplicaciones, sincronización reactiva y patrones de diseño optimizados para pantallas táctiles.',
  },
  'family-os': {
    role: 'Ingeniero Full-Stack',
    category: 'Sistema Full-Stack',
    tag: 'Plataforma Cloud',
    highlightMetric: 'Seguridad multiusuario por rol · Flujos familiares automatizados',
    summary:
      'Centro digital centralizado para coordinación del hogar, calendarios, tareas automatizadas y bóveda segura de documentos familiares.',
    challenge:
      'Gestionar permisos multiusuario asíncronos, sincronización en tiempo real entre dispositivos y privacidad estricta sin servidores complejos.',
    solution:
      'Diseñado con reglas estrictas en Firestore, control de acceso por roles (RBAC) y actualizaciones instantáneas en interfaz sin latencia visible.',
    details:
      'Enfocado en arquitectura limpia de datos, tipado completo en TypeScript y diseño responsivo entre dispositivos.',
  },
  'found-archives': {
    role: 'Desarrollador Web Full-Stack',
    category: 'CMS Headless y Migración',
    tag: 'Migración WordPress',
    liveUrlLabel: 'Ver Sitio En Vivo',
    highlightMetric: '99/100 en Lighthouse · TTFB < 350ms · Cero plugins vulnerables',
    summary:
      'Plataforma de archivos digitales y curaduría histórica construida con arquitectura moderna headless para narración visual de nivel museo.',
    challenge:
      'El cliente necesitaba reemplazar un WordPress pesado y lento con conflictos constantes de plugins que tardaba más de 3.8 segundos en abrir en celular.',
    solution:
      'Migramos a Next.js App Router en Vercel conectado con Sanity CMS para editar colecciones visualmente en tiempo real.',
    beforeAfter: {
      before:
        'Instalación pesada de WordPress con 28 plugins activos, LCP de 3.8s, consultas lentas y mantenimiento constante de seguridad.',
      after:
        'Generación estática en Next.js sobre Vercel respaldada por Sanity Headless CMS con revalidación automática en edge.',
      result:
        '99/100 en rendimiento Lighthouse, TTFB menor a 350ms, cero mantenimiento de servidor y un estudio editorial intuitivo para el curador.',
    },
    details:
      'Demuestra la mejora real en velocidad y confiabilidad al migrar plataformas CMS pesadas hacia arquitectura web serverless moderna.',
  },
  'lori-eaton-writer': {
    role: 'Desarrollador Web y Diseñador',
    category: 'Autora y Publicaciones',
    tag: 'Stack Next.js',
    liveUrlLabel: 'Ver Sitio En Vivo',
    highlightMetric: '100% en SEO y Rendimiento · Actualizaciones instantáneas',
    summary:
      'Plataforma editorial limpia y elegante diseñada para presentar obra literaria, conectar con lectores y captar suscriptores.',
    challenge:
      'Reemplazar constructores genéricos con un portafolio veloz y con identidad propia que la autora pudiera actualizar sola sin tocar código.',
    solution:
      'Construido en Next.js sobre Vercel con datos estructurados SEO, vistas OpenGraph y flujos de edición simples en Sanity CMS.',
    details:
      'Combina diseño tipográfico responsivo con HTML accesible y publicación editorial inmediata.',
  },
  'rebeccas-cleaning': {
    role: 'Desarrollador Web y Diseñador',
    category: 'Negocio de Servicios Locales',
    tag: 'Landing Estática',
    highlightMetric: 'Cotizador de tarifa fija · Reservas móviles · Cero peso extra',
    summary:
      'Sitio de aterrizaje enfocado en conversión para un servicio residencial en el área DMV: historia de la fundadora, paquetes y cotizador guiado.',
    challenge:
      'Una emprendedora local necesitaba una presencia profesional y confiable sin pagar un CMS complejo ni software mensual — rápida, clara en precios y zona de servicio.',
    solution:
      'Diseñamos un sitio estático autocontenido con tipografía expresiva, banda de confianza, tres paquetes claros, testimonios y un generador de cotización listo para enviar.',
    beforeAfter: {
      before:
        'Sin sitio propio — dependía solo de recomendaciones y mensajes sueltos, sin desglose claro de precios para nuevos clientes en DMV.',
      after:
        'Sitio moderno con navegación fija, sección directa de la dueña, tarifas claras, cobertura en DMV y generador automático de solicitudes.',
      result:
        'Página lista para producción con formularios accesibles, navegación móvil limpia y rutas claras hacia cotización y servicios.',
    },
    details: '',
  },
  'northern-virginia-writers': {
    role: 'Ingeniero Full-Stack Líder y Arquitecto',
    category: 'Comunidad y Plataforma de Membresías',
    tag: 'Portal de Miembros',
    highlightMetric: 'Membresía casi duplicada · 90% renovación automática · 12+ hrs/sem ahorradas',
    summary:
      'Portal colaborativo y sistema de suscripción continua de 12 meses para el club de escritores más grande de Virginia — casi duplicando miembros el primer año con 90% de renovación automática.',
    challenge:
      'Modernizar el club dejando atrás hojas de cálculo manuales y cortes rígidos de año calendario hacia suscripciones continuas de 12 meses con portal privado.',
    solution:
      'Construimos un portal colaborativo tipo red social con suscripciones de 12 meses continuos, grupos de crítica literaria, archivo de grabaciones, sincronización en 3 vías y manual operativo v4.0.',
    details:
      'Arquitectura profunda de membresías: ciclos continuos de 12 meses, espacios privados en BuddyBoss, trazabilidad por webhook IPN y sincronización con MailChimp.',
    beforeAfter: {
      before:
        'La junta de voluntarios dedicaba 12 a 15 horas semanales a cruzar pagos en hojas de Excel bajo un modelo rígido anual y sin portal colaborativo.',
      after:
        'Portal privado conectado con suscripciones continuas de 12 meses, renovaciones automáticas, archivo de sesiones y sincronización real con MailChimp.',
      result:
        'La membresía casi se duplicó el primer año con 90% en renovación automática, liberando al equipo para organizar eventos y publicar una antología.',
    },
    caseStudy: {
      eyebrow: 'CASO DE ÉXITO · NORTHERN VIRGINIA WRITERS CLUB · PORTAL Y ARQUITECTURA DE MEMBRESÍAS',
      heroHeadline:
        'Cómo el club de escritores más grande de Virginia modernizó sus membresías y lanzó su portal colaborativo',
      heroSubtitle:
        'Diseñamos una plataforma automatizada de suscripciones continuas de 12 meses y un portal seguro para autores — casi duplicando la membresía en el primer año sin subir la cuota anual.',
      verifiedBadge: 'EN PRODUCCIÓN · VERIFICADO 2026',
      liveUrl: 'https://northernvirginiawriters.org/',
      liveUrlLabel: 'Ver Sitio En Vivo',
      proofBar: {
        title: 'Infraestructura Activa en Producción',
        description:
          'Portal colaborativo privado, archivo de grabaciones, directorio de autores verificado y registro IPN en vivo',
        chips: ['Casi 2x Membresía', '90% Renovación Auto', 'Manual v4.0'],
      },
      metrics: [
        { label: 'Crecimiento Año 1', value: '~2x', subtext: 'Membresía casi duplicada en el primer año' },
        { label: 'Renovación Automática', value: '90%', subtext: 'En suscripciones continuas de 12 meses' },
        { label: 'Ahorro Semanal', value: '12+ hrs', subtext: 'Horas liberadas para eventos creativos' },
        { label: 'Entrega Operativa', value: 'v4.0', subtext: 'Manual vivo para futuros directivos' },
      ],
      specs: [
        {
          label: 'Organización Cliente',
          value: 'Northern Virginia Writers Club',
          subtext: 'Fundado en 2007 · Mayor club de escritores en Virginia',
        },
        {
          label: 'Rol y Autoría',
          value: 'Rottman M. Mendez (RottyM)',
          subtext: 'Ingeniero Full-Stack Líder y Arquitecto',
        },
        {
          label: 'Duración y Alcance',
          value: 'Despliegue Inicial + Soporte Multianual',
          subtext: 'Rumbo al 20° Aniversario · Sin subir cuotas',
        },
        {
          label: 'Stack Integrado',
          value: 'Núcleo Conectado',
          chips: ['WordPress', 'PMPro', 'BuddyBoss', 'MailChimp API', 'PayPal IPN'],
        },
      ],
      crisis: {
        eyebrow: 'EL RETO DE MODERNIZACIÓN',
        heading: 'Superando las hojas manuales de Excel y el cobro por año calendario.',
        description: [
          'El Northern Virginia Writers Club (NVWC) reúne a autores publicados, periodistas, poetas y escritores en formación en toda Virginia. Aunque la comunidad crecía con fuerza, sus voluntarios cargaban con trabajo administrativo manual y carecían de un portal central.',
          'Sin integración automática entre cobros, listas de miembros y correo masivo — sumado a cortes fijos de fin de año — las tareas rutinarias quitaban horas valiosas a la programación literaria.',
        ],
        threat:
          'Quienes se inscribían cerca de fin de año pagaban la cuota completa sin recibir 12 meses reales de acceso, causando bajas frustradas y retrasos manuales para recibir boletines.',
        painPoints: [
          {
            title: '12–15 Horas Semanales Copiando Datos Manualmente',
            description:
              'La mesa directiva revisaba correos de PayPal contra hojas de Excel y exportaba CSVs manuales a MailChimp. Un error tipográfico dejaba a un socio sin comunicaciones.',
          },
          {
            title: 'Fricción en Cobros y Falta de Portal Privado',
            description:
              'Sin suscripciones continuas de 12 meses, los ingresos nuevos se frustraban por fechas de corte fijas y además no contaban con un espacio seguro para compartir manuscritos o grabaciones.',
          },
          {
            title: 'Fallos Silenciosos de Webhooks de Pago',
            description:
              'Los flujos estándar perdían notificaciones cuando el usuario cerraba la pestaña antes de redirigir, generando pagos sin registrar y auditorías manuales tediosas.',
          },
        ],
      },
      pillarsHeading: 'La Plataforma Conectada de Miembros: 6 Pilares Clave',
      pillarsSubheading:
        'En lugar de apilar herramientas incompatibles, RottyM construyó un portal unificado y suscripciones automatizadas que casi duplicaron los socios el primer año manteniendo la misma cuota.',
      pillars: [
        {
          index: '01 / PORTAL',
          tag: 'Colaboración',
          title: 'Portal Colaborativo Seguro Tipo Red Social',
          description:
            'En una interfaz privada familiar, los socios publican lanzamientos de libros, comparten manuscritos en grupos de crítica y consultan grabaciones de todas las reuniones.',
          bullets: ['Crítica de manuscritos y consultas en línea', 'Archivo completo de sesiones y grabaciones'],
        },
        {
          index: '02 / COBROS',
          tag: 'Flujo de Pago e IPN',
          title: 'Pagos Fluidos y Registro IPN en Servidor',
          description:
            'Motor PayPal integrado que captura datos completos de facturación junto con verificación redundante Instant Payment Notification (IPN) en servidor.',
          bullets: ['Cero pérdida silenciosa de pagos', 'Recibos automáticos al instante'],
        },
        {
          index: '03 / SINCRONÍA',
          tag: 'Sincronización 3 Vías',
          title: 'Sincronización Automática en Tres Vías',
          description:
            'Orquestación bidireccional que conecta Paid Memberships Pro, el directorio BuddyBoss y las etiquetas de MailChimp en tiempo real.',
          bullets: ['Cero exportaciones manuales de CSV', 'Segmentación instantánea de audiencias'],
        },
        {
          index: '04 / SUSCRIPCIONES',
          tag: '12 Meses Continuos',
          title: 'Suscripción Continua y Renovación Automática',
          description:
            'Reemplazo del corte de fin de año por 12 meses completos desde la fecha de alta, con control claro para cancelar solo la próxima renovación conservando el año pagado.',
          bullets: ['90% elige renovación automática', '12 meses reales sin importar cuándo se unan'],
        },
        {
          index: '05 / DIRECTORIO',
          tag: 'Vitrina Pública',
          title: 'Directorio Público Alimentado Desde el Portal',
          description:
            'Sección pública que destaca a autores publicados, lanzamientos y enlaces de compra desde los perfiles del portal con controles estrictos de privacidad.',
          bullets: ['Sin exponer correos privados', 'Control individual por autor'],
        },
        {
          index: '06 / ENTREGA',
          tag: 'Manual v4.0',
          title: 'Manual Operativo Vivo: Playbook v4.0',
          description:
            'Guía continua de 40 páginas con capturas y pasos claros para que cada nueva junta directiva opere la plataforma sin depender de una agencia externa.',
          bullets: ['Cero dependencia de agencias', 'Relevo anual fluido para voluntarios'],
        },
      ],
      topology: {
        eyebrow: 'TOPOLOGÍA DEL SISTEMA',
        heading: 'Orquestación de Eventos en Tiempo Real',
        subtext: 'Cómo se activan las suscripciones continuas y accesos al portal sin intervención manual',
        pulseBadge: 'HTTP 200 OK · Pulso Webhook',
        steps: [
          {
            step: 'PASO 01',
            title: 'Pago del Miembro',
            description: 'El escritor elige la membresía anual continua y completa el pago en PayPal.',
            code: 'POST /checkout',
          },
          {
            step: 'PASO 02',
            title: 'Verificación IPN',
            description: 'PayPal IPN valida la transacción contra el servidor y registra bitácora.',
            code: 'IPN Handshake',
          },
          {
            step: 'PASO 03',
            title: 'Ciclo de 12 Meses',
            description: 'Se activa la vigencia continua de 12 meses y la preferencia de renovación.',
            code: 'Role: Member_Active',
          },
          {
            step: 'PASO 04',
            title: 'Sincronía 3 Vías y Portal',
            description: 'BuddyBoss, grupos de crítica y etiquetas MailChimp se actualizan en 140ms.',
            code: 'API Dispatch',
          },
        ],
      },
      comparison: {
        beforeTitle: 'Flujo Manual Anterior',
        beforeSubtitle: 'ANTES DE MODERNIZAR',
        beforeItems: [
          'La junta voluntaria dedicaba de 12 a 15 horas semanales revisando correos de PayPal y capturando datos a mano en Excel.',
          'No existía un portal en línea para compartir lanzamientos, manuscritos, propuestas o ver grabaciones pasadas.',
          'La facturación anual fija frustraba a quienes se unían a fin de año sin recibir 12 meses completos.',
          'La falta de manuales dificultaba cada cambio anual de mesa directiva.',
        ],
        afterTitle: 'Portal Colaborativo Conectado',
        afterSubtitle: 'DESPLIEGUE ROTTYM',
        afterItems: [
          'En el primer año, la membresía casi se duplicó con el sistema continuo de 12 meses y 90% de renovación automática.',
          'Los socios colaboran hoy en un entorno seguro con lanzamientos, críticas de texto y archivo completo de reuniones.',
          'La automatización liberó al equipo directivo para atraer mejores ponentes, rentar sede y publicar una antología.',
          'El club mantuvo intacta la cuota anual agregando muchas más funciones rumbo a su 20° aniversario.',
        ],
      },
      testimonial: {
        quote:
          'Antes de que Rottman rediseñara nuestra arquitectura, nuestros voluntarios pasaban fines de semana enteros revisando hojas de cálculo, correos perdidos y bajas accidentales de miembros. El sistema conectado que construyó no solo resolvió los problemas técnicos: protegió al equipo del agotamiento y les dio a nuestros autores una plataforma profesional de la que están orgullosos.',
        author: 'Carolyn McBride, Presidenta',
        role: 'Northern Virginia Writers Club · Mayor club de escritores en Virginia',
        avatarText: 'CM',
      },
      guarantees: [
        '100% Propiedad de Código y Datos',
        'Cero Atadura Propietaria',
        'Estándares Empresariales Locales',
        'Manual Operativo Completo',
      ],
    },
  },
  'men-talking': {
    role: 'Desarrollador Web y Diseñador',
    category: 'Coaching y Bienestar',
    tag: 'Sitio de Marca',
    liveUrlLabel: 'Ver Sitio En Vivo',
    highlightMetric: 'Listo para lanzamiento · Entrega anticipada · Soporte continuo',
    summary:
      'Sitio sereno y tipográfico para Men Talking LLC — liderazgo, bienestar emocional y comunidad con un llamado claro a iniciar conversación.',
    challenge:
      'Una nueva firma de coaching necesitaba una presencia sólida antes de su lanzamiento: voz propia, confianza y ruta simple de contacto dentro de un plazo estricto.',
    solution:
      'Diseñamos un sitio crema y azul marino con tipografía editorial, secciones de programas y comunidad, acceso de clientes y soporte continuo posterior al lanzamiento.',
    beforeAfter: {
      before:
        'Firma próxima a lanzar sin sitio web terminado ni primera impresión profesional para clientes interesados en coaching.',
      after:
        'Sitio en producción con diseño editorial cálido, navegación clara (Enfoque, Programas, Comunidad, Acerca, FAQ) y llamado directo a conversar.',
      result:
        'Entregado antes de la fecha límite, con comunicación clara y mantenimiento continuo para que el fundador se enfoque en sus clientes.',
    },
    details:
      'Combina diseño visual de marca con mantenimiento práctico post-lanzamiento para negocios que necesitan funcionar desde el día uno.',
  },
  'usa-today-the-point': {
    role: 'Ingeniero Front-End Líder (Contrato)',
    category: 'Alta Escala Empresarial',
    tag: 'Medios a Gran Escala',
    highlightMetric: 'Ingeniero front-end líder para millones de lectores mensuales',
    summary:
      'Plataforma digital interactiva de noticias de alto tráfico desarrollada para Gannett / USA Today.',
    challenge:
      'Publicar actualizaciones editoriales en tiempo real bajo picos masivos de tráfico nacional sin degradación visual ni retrasos.',
    solution:
      'Arquitectura resiliente en React con estado normalizado Redux y distribución CDN en edge sobre AWS.',
    details:
      'Demuestra ingeniería front-end capaz de responder ante millones de usuarios simultáneos bajo acuerdos estrictos de disponibilidad.',
  },
  'custom-cms-platforms': {
    role: 'Ingeniero Full-Stack',
    category: 'Infraestructura Pública y Empresarial',
    tag: 'Sector Público',
    highlightMetric: 'Cumplimiento accesibilidad Section 508 · Cero vulnerabilidades',
    summary:
      'Infraestructura de portales y contenido de alta disponibilidad diseñada para cumplimiento institucional y del sector público.',
    challenge:
      'Cumplir normas estrictas de seguridad federal y accesibilidad Section 508 en flujos complejos de múltiples pasos.',
    solution:
      'Interfaces React accesibles integradas con microservicios endurecidos y pruebas automatizadas de accesibilidad.',
    details:
      'Construido bajo estándares federales de accesibilidad, resiliencia y procesamiento seguro de datos.',
  },
  'wwf-gift-center': {
    role: 'Desarrollador UX',
    category: 'Comercio Electrónico y Donaciones',
    tag: 'E-Commerce',
    highlightMetric: 'Flujo internacional de donaciones y adopciones simbólicas',
    summary:
      'Catálogo de regalos y donaciones para World Wildlife Fund enfocado en selección ágil y cierre sin fricción para donantes.',
    challenge:
      'Simplificar el proceso de compra y donación internacional entre distintos niveles de aporte.',
    solution:
      'Optimizamos los pasos del carrito y sumamos indicadores claros de impacto para maximizar donaciones en temporada alta.',
    details:
      'Ingeniería enfocada en conversión y experiencia de usuario para organizaciones sin fines de lucro de alcance global.',
  },
};

export function getLocalizedProject(project: Project, lang: SiteLang): Project {
  if (lang !== 'es') return project;
  const ov = PROJECTS_ES[project.slug];
  if (!ov) return project;
  return {
    ...project,
    role: ov.role ?? project.role,
    category: ov.category ?? project.category,
    tag: ov.tag ?? project.tag,
    liveUrlLabel: ov.liveUrlLabel ?? project.liveUrlLabel,
    highlightMetric: ov.highlightMetric ?? project.highlightMetric,
    summary: ov.summary ?? project.summary,
    challenge: ov.challenge ?? project.challenge,
    solution: ov.solution ?? project.solution,
    beforeAfter: ov.beforeAfter ?? project.beforeAfter,
    details: ov.details ?? project.details,
    caseStudy: ov.caseStudy ?? project.caseStudy,
  };
}
