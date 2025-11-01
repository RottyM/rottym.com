// src/app/portfolio/page.tsx
import Image from 'next/image';

const projects = [
  { title: "USA Today – The Point", img: "/images/portfolio/usa-today-thepoint.jpg", role: "Lead Front-End", tech: "React, Redux, AWS" },
  { title: "Detroit Free Press", img: "/images/portfolio/detroit-freepress.jpg", role: "UX Developer", tech: "HTML5, CSS3, JS" },
  { title: "WBIR.com", img: "/images/portfolio/wbir.jpg", role: "UX Developer", tech: "Responsive Design" },
  { title: "WWF Gift Center", img: "/images/portfolio/wwf-giftcenter.jpg", role: "UX Developer", tech: "E-commerce UX" },
  { title: "Reverb Networks", img: "/images/portfolio/reverb-performa.jpg", role: "UX Designer", tech: "Wireframes, Figma" },
  { title: "Brevic Development", img: "/images/portfolio/brevic.jpg", role: "Freelance", tech: "WordPress, PHP" },
  { title: "VB-Controls", img: "/images/portfolio/vbcontrols.jpg", role: "Freelance", tech: "Custom CMS" },
  { title: "Tech24 Construction", img: "/images/portfolio/tech24.jpg", role: "Freelance", tech: "SEO, Analytics" },
];

export default function Portfolio() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Portfolio</h1>
        <p className="text-center text-slate-600 mb-12">Disney · FAA · USA Today · WWF · DC Local</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p, i) => (
            <div 
              key={i} 
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white h-full flex flex-col">
                <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                  <Image 
                    src={p.img} 
                    alt={p.title}
                    width={600}
                    height={400}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{p.title}</h3>
                    <p className="text-sm text-sky-600 mb-2">{p.role}</p>
                    <p className="text-xs text-slate-500">{p.tech}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">Live Demo</span>
                    <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded">Case Study</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}