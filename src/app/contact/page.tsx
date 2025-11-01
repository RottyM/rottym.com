// src/app/contact/page.tsx
'use client';
import { useForm } from '@formspree/react';

export default function Contact() {
  const [state, handleSubmit] = useForm('https://formspree.io/f/xpwooewg'); // ← REPLACE THIS

  if (state.succeeded) {
    return (
      <section className="py-20 px-6 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Thank You!</h1>
        <p className="text-xl text-green-600">Message sent! I'll reply in 24h.</p>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 max-w-md mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12">Get In Touch</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="fs-field">
          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="name">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div className="fs-field">
          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">I'll reply via email.</p>
        </div>

        <div className="fs-field">
          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="service">
            Service
          </label>
          <select
            id="service"
            name="service"
            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
          >
            <option>WordPress Migration</option>
            <option>E-Commerce</option>
            <option>Subscriptions</option>
            <option>Social Portals</option>
            <option>Marketing</option>
          </select>
        </div>

        <div className="fs-field">
          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">What would you like to discuss?</p>
        </div>

        <button
          type="submit"
          disabled={state.submitting}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-lg transition shadow-md disabled:opacity-50"
        >
          {state.submitting ? 'Sending...' : 'Send Message'}
        </button>

        {state.errors && (
          <p className="text-red-600 text-center">Error — email rottym@gmail.com</p>
        )}
      </form>
    </section>
  );
}