// Make sure to run npm install @formspree/react

import React from "react";
import { useForm, ValidationError } from "@formspree/react";

export function ExampleForm() {
  const [state, handleSubmit] = useForm("https://formspree.io/f/xpwooewg");

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