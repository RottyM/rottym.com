// src/app/contact/page.tsx
'use client';
import { useState } from 'react';

export default function Contact() {
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus('Message sent! I\'ll reply in 24h.');
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus('Error — email rottym@gmail.com directly.');
      }
    } catch (error) {
      setStatus('Error — email rottym@gmail.com directly.');
    }
  };

  return (
    <section className="py-20 px-6 max-w-md mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12">Get In Touch</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <input
          name="name"
          placeholder="Your Name"
          required
          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
        />
        <input
          name="email"
          type="email"
          placeholder="Your Email"
          required
          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
        />
        <select
          name="service"
          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
        >
          <option>WordPress Migration</option>
          <option>E-Commerce</option>
          <option>Subscriptions</option>
          <option>Social Portals</option>
          <option>Marketing</option>
        </select>
        <textarea
          name="message"
          rows={5}
          placeholder="Your project..."
          required
          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition resize-none"
        />
        <button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
        >
          Send Message
        </button>
        {status && (
          <p className={`text-center mt-4 font-medium ${status.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </p>
        )}
      </form>
    </section>
  );
}