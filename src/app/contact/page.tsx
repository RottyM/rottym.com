'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Contact() {
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {  // Get free ID at formspree.io
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus('Message sent! I\'ll reply in 24 hours.');
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
      <h1 className="text-3xl font-bold text-center mb-8">Get In Touch</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <input name="name" placeholder="Your Name" required className="w-full p-3 border rounded" />
        <input name="email" type="email" placeholder="Your Email" required className="w-full p-3 border rounded" />
        <select name="service" className="w-full p-3 border rounded">
          <option>WordPress Migration</option>
          <option>E-Commerce</option>
          <option>Subscriptions</option>
          <option>Social Portals</option>
          <option>Marketing</option>
        </select>
        <textarea name="message" rows={4} placeholder="Project details..." required className="w-full p-3 border rounded" />
        <Button type="submit" className="w-full bg-sky-600">Send</Button>
        {status && <p className="text-center text-green-600">{status}</p>}
      </form>
    </section>
  );
}