import Image from 'next/image';

const projects = [
  { title: "USA Today – The Point", img: "/images/portfolio/usa-today-thepoint.jpg", role: "Lead Front-End Developer" },
  { title: "Detroit Free Press", img: "/images/portfolio/detroit-freepress.jpg", role: "UX Developer" },
  { title: "WBIR.com", img: "/images/portfolio/wbir.jpg", role: "UX Developer" },
  { title: "WWF Gift Center", img: "/images/portfolio/wwf-giftcenter.jpg", role: "UX Developer" },
  { title: "Reverb Networks Performa", img: "/images/portfolio/reverb-performa.jpg", role: "UX Designer/Developer" },
  { title: "Brevic Development", img: "/images/portfolio/brevic.jpg", role: "Freelance Developer" },
  { title: "Goverment Sites", img: "/images/portfolio/gov-sites.jpg", role: "Freelance Developer" },
  { title: "Club Sites", img: "/images/portfolio/club-sites.jpg", role: "Freelance Developer" },
  { title: "Logos", img: "/images/portfolio/logos.jpg", role: "Freelance Developer" },
];

export default function Portfolio() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Portfolio</h1>
        <p className="text-center text-slate-600 mb-12">Disney · FAA · USA Today · WWF · Local DC</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p) => (
            <div key={p.title} className="group cursor-pointer transform transition-all hover:scale-105">
              <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white">
                <Image 
                  src={p.img} 
                  alt={p.title}
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end text-white">
                  <h3 className="text-xl font-bold">{p.title}</h3>
                  <p className="text-sm opacity-90">{p.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}