//src/app/contact/page.tsx

import React from "react";
import { useForm, ValidationError } from "@formspree/react";

export function ExampleForm() {
  const [state, handleSubmit] = useForm("xpwooewg");

  if (state.succeeded) {
    return <p>Thanks for joining!</p>;
  }

  return (
    <form className="fs-form" onSubmit={handleSubmit}>
      <div className="fs-field">
        <label className="fs-label" htmlFor="name">
          Your Name
        </label>
        <input className="fs-input" id="name" name="name" required />
      </div>
      <div className="fs-field">
        <label className="fs-label" htmlFor="email">
          Email
        </label>
        <input className="fs-input" id="email" name="email" required />
        <p className="fs-description">
          This will help me respond to your query via an email.
        </p>
      </div>
      <select name="service" className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
        <option>WordPress Migration</option>
        <option>E-Commerce</option>
        <option>Subscriptions</option>
        <option>Social Portals</option>
        <option>Marketing</option>
      </select>
      <div className="fs-field">
        <label className="fs-label" htmlFor="message">
          Message
        </label>
        <textarea
          className="fs-textarea"
          id="message"
          name="message"
          required
        />
        <p className="fs-description">What would you like to discuss?</p>
      </div>
      <div className="fs-button-group">
        <button className="fs-button" type="submit">
          Submit
        </button>
      </div>
    </form>
  );
}