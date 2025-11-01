import Image from 'next/image';

const projects = [
  {
    title: 'USA Today - The Point',
    desc: 'Led front-end for major relaunch of interactive entertainment portal.',
    image: '/images/usa-today.jpg',  // From your portfolio PDF
    tech: ['jQuery', 'Adobe CQ', 'Java'],
    role: 'Lead Front-End Developer'
  },
  {
    title: 'Disney Streaming Policy Team',
    desc: 'Microservices with Java/Scala, AWS, React for auth & analytics.',
    image: '/images/disney.jpg',
    tech: ['Spring Boot', 'AWS Lambda', 'React/Redux'],
    role: 'Senior Software Engineer'
  },
  {
    title: 'FEMA Grants Management Modernization',
    desc: 'Full-stack for consolidating grant programs into FEMA GO.',
    image: '/images/fema.jpg',
    tech: ['Java 8', 'PostgreSQL', 'OpenShift'],
    role: 'Full Stack Java Developer'
  },
  {
    title: 'WWF Gift Center Redesign',
    desc: 'Front-end development & platform upgrade for e-commerce site.',
    image: '/images/wwf.jpg',
    tech: ['React', 'WordPress'],
    role: 'UX Developer'
  },
  // Add more from PDF: Reverb, Brevic, etc.
  {
    title: 'Reverb Networks Performa Beams',
    desc: 'Wireframes & front-end for web apps.',
    image: '/images/reverb.jpg',
    tech: ['React', 'Custom UI'],
    role: 'UX Designer/Developer'
  },
];

export default function Portfolio() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Portfolio</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <Image 
                  src={project.image} 
                  alt={project.title} 
                  width={400} 
                  height={300} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition" 
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition p-4 flex flex-col justify-end text-white">
                  <h3 className="font-bold">{project.title}</h3>
                  <p className="text-sm opacity-90">{project.role}</p>
                  <p className="text-xs mt-2">{project.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}