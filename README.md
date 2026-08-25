# lolga8.com

Quellcode der Portfolio-Website [lolga8.com](https://lolga8.com).

Statisch gebaut mit [Astro](https://astro.build), ausgeliefert über GitHub Pages. Jeder Push auf
`main` löst Build und Deployment aus.

## Entwicklung

Voraussetzung: Node ab Version 22.12.

```
npm install
npm run dev
```

| Befehl            | Zweck                                 |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Dev-Server mit Hot Reload             |
| `npm run build`   | Produktionsbuild nach `dist/`         |
| `npm run preview` | gebautes Ergebnis lokal ausliefern    |
| `npm run check`   | Typprüfung inklusive `.astro`-Dateien |
| `npm run lint`    | ESLint                                |
| `npm run format`  | Prettier schreibend                   |

## Struktur

```
.github/workflows/   Deploy nach GitHub Pages
docs/decisions/      Architecture Decision Records
public/              unverarbeitete statische Dateien
src/pages/           Routen, file-based
```

## Entscheidungen

Festlegungen zu Stack, Styling und Hosting sind unter [`docs/decisions/`](docs/decisions) als ADR
dokumentiert.

## Status

Im Aufbau. `public/robots.txt` sperrt die Seite derzeit für Suchmaschinen.
