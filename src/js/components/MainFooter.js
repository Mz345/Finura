class MainFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    try {
      const response = await fetch("/partials/_footer.html");
      if (!response.ok) throw new Error("Footer HTML not found");
      const html = await response.text();

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
            background: #ffffff; /* White footer background */
            color: #111827;
            border-top: 1px solid #e5e7eb;
          }

          .footer-main-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-direction: row;
            padding: 20px 40px;
            font-family: 'Inter', sans-serif;
            flex-wrap: wrap;
            width: 100%;
            box-sizing: border-box;
          }

          .footer-logo-name {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .footer-logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: #000000; /* Black background for logo */
            border-radius: 8px;
            padding: 8px;
          }

          .footer-logo svg {
            width: 20px;
            height: 20px;
            color: #ffffff; /* White icon to contrast black background */
          }

          .footer-name h4 {
            font-size: 1rem;
            font-weight: 600;
            color: #111827;
            margin: 0;
          }

          .footer-copyright p {
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0;
          }

          @media (max-width: 640px) {
            .footer-main-box {
              flex-direction: column;
              justify-content: center;
              text-align: center;
              gap: 16px;
              align-items: center;
              padding: 20px;
            }
          }
        </style>

        ${html}
      `;
    } catch (error) {
      console.error("Could not load footer component:", error);
      this.shadowRoot.innerHTML = `<p>Error loading footer.</p>`;
    }
  }
}

customElements.define("main-footer", MainFooter);
