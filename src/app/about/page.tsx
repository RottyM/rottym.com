// src/app/about/page.tsx
export default function About() {
  return (
    <section className="py-20 px-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-center mb-12">About Rottman M. Mendez</h1>
      <p className="text-xl text-slate-600">Experienced Software Engineer with Java, JavaScript, AWS. Proven in microservices, agile, code reviews. Fluent English/Spanish.</p>
      
      <h2 className="text-2xl font-bold">Experience</h2>
      <ul className="space-y-4">
        <li>Freelance (2021-Present): WordPress developer, digital marketing for local businesses.</li>
        <li>Senior Software Engineer - Disney Streaming (2022-2023): Java 11, Scala, Spring Boot, AWS S3, Athena, Lambda.</li>
        <li>Full Stack Developer - BAE Systems (2021-2022): React/Redux, Java, SQL for expense tracking app.</li>
      </ul>

      <h2 className="text-2xl font-bold">Technical Skills</h2>
      <p className="text-slate-600">Java, JavaScript, React/Redux, AWS (DynamoDB, S3, Lambda), PostgreSQL, Docker, Kubernetes, Jenkins, Spring, GraphQL.</p>

      <h2 className="text-2xl font-bold">Education</h2>
      <p className="text-slate-600">Bachelor’s in Communications, University of San Carlos, Guatemala. + Udemy certifications in Java, SQL, React.</p>
    </section>
  );
}