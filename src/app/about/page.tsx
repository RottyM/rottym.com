export default function About() {
  return (
    <section className="py-20 px-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-center">About Rottman M. Mendez</h1>
      <div className="prose max-w-none">
        <p><strong>Summary:</strong> Experienced Software Engineer with Java, JavaScript, AWS. Proven in microservices, agile, code reviews. Fluent English/Spanish.</p>
        
        <h2>Experience Highlights</h2>
        <ul>
          <li><strong>Senior Software Engineer, Disney Streaming (2022-2023):</strong> Microservices with Java 11, Spring Boot, AWS S3/Athena/Lambda. Led JWT auth migration & Adobe Analytics integration.</li>
          <li><strong>Full Stack Developer, BAE Systems (2021-2022):</strong> React/Redux front-end, Java/SQL back-end for expense tracking app.</li>
          <li><strong>Full Stack Java Developer, FEMA (2020-2021):</strong> Grants Management Modernization with OpenShift, PostgreSQL, Camunda.</li>
          <li><strong>Front End Developer, Leidos - FAA (2017-2020):</strong> UI enhancements, Bootstrap, 508 accessibility, Webpack optimization.</li>
          {/* Add more from PDF */}
        </ul>

        <h2>Skills</h2>
        <p>Java, JavaScript, React/Redux, AWS (DynamoDB, S3, Lambda), PostgreSQL, Docker, Kubernetes, Jenkins, Spring, GraphQL.</p>

        <h2>Education</h2>
        <p>Bachelor’s in Communications, University of San Carlos, Guatemala. + Udemy: Java Crash Course, SQL Bootcamp, React Fundamentals.</p>

        <blockquote className="border-l-4 border-sky-500 pl-4 italic">
          "Results-driven, collaborative, cross-functional."
        </blockquote>
      </div>
    </section>
  );
}