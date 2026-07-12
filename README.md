# Elite Dashboard

## Overview
The `elite_dashboard` is a dedicated administrative frontend designed specifically to manage and orchestrate the Human-in-the-Loop (HitL) execution pipeline for the Elite ETL platform. 

Rather than serving as the final consumer application (which will reside in `elite_mvp`), this dashboard empowers developers and data engineers to interact directly with the backend ETL API. It allows administrators to trigger extraction jobs, introspect raw data schemas, manually write and validate SQL transformations via the UI, and promote decoupled pipeline logic through the Silver and Gold phases.

## Technology Recommendations
To achieve a modern, reactive, and responsive application for this dashboard, we recommend the following toolchain:

### Core Frameworks
* **[Vite](https://vitejs.dev/) + [React](https://react.dev/) / [Vue 3](https://vuejs.org/):** Ideal for rapidly building an interactive Single Page Application (SPA). The complex HitL handshake requires maintaining intricate JSON states (e.g., table schemas and arrays of user-provided SQL payloads), making React or Vue's reactivity systems invaluable.
* **[Next.js](https://nextjs.org/) / [Nuxt](https://nuxt.com/):** If you anticipate the dashboard growing into a massive multi-page application with server-side rendering or extensive routing.

### Documentation Tooling
* **[VitePress](https://vitepress.dev/):** Since this project adheres to the Diátaxis documentation framework, VitePress is highly recommended for building beautiful, fast, Markdown-driven documentation sites directly from the `docs/` folder.

### UI & Styling
* **Component Libraries:** Use robust component libraries like [MUI](https://mui.com/), [Ant Design](https://ant.design/), or [Radix UI](https://www.radix-ui.com/) to quickly scaffold data grids, schema viewers, and SQL text-editor inputs (like Monaco Editor).
* **Styling:** Lean towards rich aesthetics (glassmorphism, subtle gradients, dark mode) rather than plain generic frameworks to ensure the tool feels premium and enjoyable to manage.

## Getting Started
Please consult the `docs/` directory for detailed information on how to interact with the Elite ETL API.

* See `docs/reference/api-endpoints.md` for technical API payloads and routes.
