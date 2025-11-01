<script
  dangerouslySetInnerHTML={{
    __html: `
      setTimeout(() => {
        if (!localStorage.getItem('audit-shown')) {
          const popup = document.createElement('div');
          popup.innerHTML = \`
            <div style="position:fixed;bottom:20px;right:20px;background:white;padding:24px;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.1);max-width:320px;z-index:9999;border:1px solid #e2e8f0;">
              <h3 style="margin:0 0 8px;font-size:1.25rem;font-weight:bold;">Free WordPress Audit</h3>
              <p style="margin:0 0 16px;font-size:0.875rem;color:#475569;">Get a 5-point speed, security & SEO report in 24h.</p>
              <a href="/contact" style="display:inline-block;background:#0ea5e9;color:white;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:600;">Claim Audit →</a>
              <button onclick="this.parentElement.parentElement.remove();localStorage.setItem('audit-shown','true')" style="position:absolute;top:8px;right:8px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#94a3b8;">×</button>
            </div>
          \`;
          document.body.appendChild(popup);
        }
      }, 3000);
    `,
  }}
/>