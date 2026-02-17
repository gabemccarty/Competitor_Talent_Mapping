# Talent Map – Globe-Based Competitor Talent Mapping

A **reusable, shareable web app** for viewing talent by location. Drop or paste a Gem-style CSV, optionally filter by company, then explore an interactive globe with location pins and per-location org charts (department → tier → employees, with LinkedIn links).

**Runs entirely in the browser.** No server; CSV is parsed client-side. Publish to GitHub Pages and share the URL—anyone can open it and use their own data.

---

## Publish on GitHub Pages

1. **Push this folder to a GitHub repo** (e.g. `your-username/Competitor_Talent_Map` or a repo named `talent-map`).

2. **Enable GitHub Pages** in the repo:
   - **Settings** → **Pages**
   - **Source**: Deploy from a **branch**
   - **Branch**: `main` (or your default), folder **/ (root)**
   - Save.

3. The site will be at:
   - **`https://<username>.github.io/<repo-name>/`**  
   Example: `https://gabemccarty.github.io/Competitor_Talent_Map/`

4. Share that URL. Visitors get the landing page, then can drop a CSV or paste content, set an optional company filter, and click **Generate Map** to use the globe and pins.

No build step. The site is static: `index.html` + `js/` (parser, globe). You can also open `index.html` locally or run:

```bash
npx serve . -p 3333
```

Then visit http://localhost:3333.

---

## Optional: CLI for a single-file HTML (3D globe)

To generate a **self-contained HTML file** (e.g. to email or host elsewhere) with a Three.js 3D globe and embedded data:

```bash
node generate.js sample-gem-export.csv --company Meta
```

Output: `dist/index.html`. Open in a browser or serve the `dist` folder. No `js/` folder needed in that file—data is embedded.

---

## Project layout

```
Competitor_Talent_Map/
├── index.html             # Main app (landing + globe + panel) — GitHub Pages entry
├── js/
│   ├── parser.js          # CSV → locations + departments (browser)
│   └── globe2d.js         # 2D canvas globe, pins, click
├── generate.js            # CLI: parse CSV → output single-file HTML
├── template.js            # HTML template for CLI (3D globe)
├── cities.js              # City/region → lat,lng
├── tiers.js               # Job title → tier 0–9
├── departments.js         # Job title keywords → department + colors
├── sample-gem-export.csv
├── package.json
├── README.md
└── dist/                  # Output of `node generate.js` (optional)
```

---

## CSV format (Gem export)

The app looks for common column names:

| Data     | Column names tried                                                |
|----------|-------------------------------------------------------------------|
| Name     | First Name + Last Name, or "Name" / "Full Name"                   |
| Title    | Title, Job Title, Position, Current Title                         |
| Company  | Company, Current Company, Employer, Organization                  |
| Location | Location, Office, City, Geography                                 |
| LinkedIn | LinkedIn, LinkedIn URL, Profile URL                               |

- **Company filter**: optional; only rows whose company contains that text are included.
- **Location**: resolved to lat/lng via a built-in city list (e.g. "San Francisco CA" → SF). Unmatched locations still appear in the panel under their raw label.

---

## Customization

- **More cities**: edit `js/parser.js` and add entries to the city lookup (or `cities.js` if using the CLI).
- **Tiers / departments**: adjust patterns in the parser (or `tiers.js` / `departments.js` for the CLI) to match your title conventions.

---

## License and reuse

Use and modify as you like. If you publish to GitHub Pages, others can use your fork as a reusable site—point them to your repo URL.
