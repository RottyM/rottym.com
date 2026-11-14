export interface ClientTestimonial {
  id: string;
  author: string;
  role: string;
  initials: string;
  category: string;
  rating: number;
  /** Concise excerpt shown in the above-the-fold hero switcher. */
  heroQuote: string;
  /** Full client quote displayed in the lower spotlight switcher. */
  quote: string;
  caseStudyHref?: string;
  caseStudyLabel?: string;
}

export const clientTestimonials: ClientTestimonial[] = [
  {
    id: "isabelle-deeme",
    author: "Isabelle Deeme",
    role: "Author, The Enchanted Series",
    initials: "ID",
    category: "Website client",
    rating: 5,
    heroQuote: "It was worth every penny!",
    quote:
      "I highly recommend Rotty Mendez. Working with him was awesome! He took the time to understand what I wanted, and was very patient with my technology impaired brain. His advice was invaluable and he built the most amazing website for me. Rotty was very professional and responsive to my many requests. It was worth every penny!",
  },
  {
    id: "john-crownover",
    author: "John F. Crownover",
    role: "Founder & Lead Coach, Men Talking LLC",
    initials: "JC",
    category: "Coaching site & care",
    rating: 5,
    heroQuote:
      "He delivered everything ahead of deadline, which mattered a great deal as I was preparing to launch a new business.",
    quote:
      "He delivered everything ahead of deadline, which mattered a great deal as I was preparing to launch a new business. He communicates clearly about timelines and consistently follows through on what he promises. Since launch, he has remained a responsive and dependable partner, handling ongoing maintenance so I can stay focused on my clients.",
    caseStudyHref: "/portfolio/men-talking",
    caseStudyLabel: "View Men Talking project",
  },
  {
    id: "carolyn-mcbride",
    author: "Carolyn McBride",
    role: "President, Northern Virginia Writers Club",
    initials: "CM",
    category: "Membership platform",
    rating: 5,
    heroQuote:
      "The connected system he built didn't just solve our tech headaches — it saved our volunteer team from burnout and gave our authors a professional home they are genuinely proud of.",
    quote:
      "Before Rottman redesigned our architecture, our volunteer officers were spending whole weekends drowning in spreadsheet checks, missing email notifications, and resolving accidental member drops. The connected system he built didn't just solve our tech headaches — it saved our volunteer team from burnout and gave our authors a professional home they are genuinely proud of.",
    caseStudyHref: "/portfolio/northern-virginia-writers",
    caseStudyLabel: "Read NVWC case study",
  },
];
