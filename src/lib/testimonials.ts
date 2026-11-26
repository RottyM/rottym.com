export interface ClientTestimonial {
  id: string;
  author: string;
  role: string;
  roleEs: string;
  initials: string;
  category: string;
  categoryEs: string;
  rating: number;
  /** Concise excerpt shown in the above-the-fold hero switcher. */
  heroQuote: string;
  heroQuoteEs: string;
  /** Full client quote displayed in the lower spotlight switcher. */
  quote: string;
  quoteEs: string;
  caseStudyHref?: string;
  caseStudyLabel?: string;
  caseStudyLabelEs?: string;
}

export const clientTestimonials: ClientTestimonial[] = [
  {
    id: 'isabelle-deeme',
    author: 'Isabelle Deeme',
    role: 'Author, The Enchanted Series',
    roleEs: 'Autora, The Enchanted Series',
    initials: 'ID',
    category: 'Website client',
    categoryEs: 'Cliente web',
    rating: 5,
    heroQuote: 'It was worth every penny!',
    heroQuoteEs: '¡Valió cada centavo!',
    quote:
      'I highly recommend Rotty Mendez. Working with him was awesome! He took the time to understand what I wanted, and was very patient with my technology impaired brain. His advice was invaluable and he built the most amazing website for me. Rotty was very professional and responsive to my many requests. It was worth every penny!',
    quoteEs:
      'Recomiendo mucho a Rotty Mendez. ¡Trabajar con él fue excelente! Se tomó el tiempo de entender exactamente lo que buscaba y tuvo muchísima paciencia conmigo. Sus consejos fueron clave y me construyó un sitio web increíble. Siempre fue muy profesional y atento a cada detalle. ¡Valió cada centavo!',
  },
  {
    id: 'john-crownover',
    author: 'John F. Crownover',
    role: 'Founder & Lead Coach, Men Talking LLC',
    roleEs: 'Fundador y Coach Principal, Men Talking LLC',
    initials: 'JC',
    category: 'Coaching site & care',
    categoryEs: 'Sitio de coaching y soporte',
    rating: 5,
    heroQuote:
      'He delivered everything ahead of deadline, which mattered a great deal as I was preparing to launch a new business.',
    heroQuoteEs:
      'Entregó todo antes de la fecha límite, algo clave mientras me preparaba para lanzar un nuevo negocio.',
    quote:
      'He delivered everything ahead of deadline, which mattered a great deal as I was preparing to launch a new business. He communicates clearly about timelines and consistently follows through on what he promises. Since launch, he has remained a responsive and dependable partner, handling ongoing maintenance so I can stay focused on my clients.',
    quoteEs:
      'Entregó todo antes de la fecha límite, algo decisivo mientras me preparaba para lanzar mi negocio. Se comunica con claridad sobre los plazos y siempre cumple lo que promete. Desde el lanzamiento ha seguido siendo un aliado rápido y confiable, encargándose del mantenimiento para que yo pueda enfocarme en mis clientes.',
    caseStudyHref: '/portfolio/men-talking',
    caseStudyLabel: 'View Men Talking project',
    caseStudyLabelEs: 'Ver proyecto Men Talking',
  },
  {
    id: 'carolyn-mcbride',
    author: 'Carolyn McBride',
    role: 'President, Northern Virginia Writers Club',
    roleEs: 'Presidenta, Northern Virginia Writers Club',
    initials: 'CM',
    category: 'Membership platform',
    categoryEs: 'Plataforma de membresías',
    rating: 5,
    heroQuote:
      "The connected system he built didn't just solve our tech headaches — it saved our volunteer team from burnout and gave our authors a professional home they are genuinely proud of.",
    heroQuoteEs:
      'El sistema conectado que construyó no solo resolvió nuestros dolores técnicos: salvó del agotamiento al equipo voluntario y les dio a nuestros autores un espacio del que están orgullosos.',
    quote:
      "Before Rottman redesigned our architecture, our volunteer officers were spending whole weekends drowning in spreadsheet checks, missing email notifications, and resolving accidental member drops. The connected system he built didn't just solve our tech headaches — it saved our volunteer team from burnout and gave our authors a professional home they are genuinely proud of.",
    quoteEs:
      'Antes de que Rottman rediseñara nuestra arquitectura, nuestros voluntarios pasaban fines de semana enteros revisando hojas de cálculo, correos perdidos y bajas accidentales de miembros. El sistema conectado que construyó no solo resolvió los problemas técnicos: protegió al equipo del agotamiento y les dio a nuestros autores una plataforma profesional de la que están orgullosos.',
    caseStudyHref: '/portfolio/northern-virginia-writers',
    caseStudyLabel: 'Read NVWC case study',
    caseStudyLabelEs: 'Leer caso NVWC',
  },
  {
    id: 'lori-eaton',
    author: 'Lori Eaton',
    role: 'Archivist & Writer, Found Archives LLC',
    roleEs: 'Archivista y Escritora, Found Archives LLC',
    initials: 'LE',
    category: 'Linked platforms & care',
    categoryEs: 'Plataformas conectadas y soporte',
    rating: 5,
    heroQuote:
      'Rotty helped me integrate two websites that neatly link my passions for archiving and for writing, building clean, crisp designs that play well together.',
    heroQuoteEs:
      'Rotty me ayudó a integrar dos sitios web que unen mi trabajo de archivo y escritura con diseños limpios que funcionan en armonía.',
    quote:
      'Rotty helped me integrate two websites that neatly link my passions for archiving and for writing, building clean, crisp designs that play well together. And when there is a technical update, Rotty handles it before I even think to ask.',
    quoteEs:
      'Rotty me ayudó a integrar dos sitios web que enlazan a la perfección mi labor como archivista y escritora, con diseños limpios y coherentes. Y cuando hace falta una actualización técnica, Rotty la resuelve incluso antes de que tenga que pedirla.',
    caseStudyHref: '/portfolio/found-archives',
    caseStudyLabel: 'View Found Archives project',
    caseStudyLabelEs: 'Ver proyecto Found Archives',
  },
];
