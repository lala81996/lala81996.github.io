# lolga8.com — Projektregeln

Ergänzt die globale Konfiguration unter `~/.claude/CLAUDE.md`. Bei Widerspruch gilt die globale Regel.

## Projekt

Portfolio-Website für die Domain `lolga8.com`. Statisch gebaut mit Astro, ausgeliefert über GitHub
Pages aus dem Repository `lala81996.github.io`. Jeder Push auf `main` baut und deployed neu.

Zweck der Seite: die Breite vorhandener Skills belegen und Projekte darstellen, die aus dem
Arbeitskontext stammen und deshalb nicht frei gezeigt werden dürfen.

## Arbeitsregel: Astro-Konzepte erklären

Jeder Umsetzungsschritt, der ein Astro-spezifisches Konzept berührt, wird von einer kurzen
Erklärung begleitet: was das Konzept tut, warum es an dieser Stelle gewählt wurde, und der Verweis
auf die zugehörige Stelle in der Astro-Dokumentation. Wenige Sätze, kein Tutorial, keine
Wiederholung bereits erklärter Konzepte.

Hintergrund: Astro soll über dieses Projekt zu einem belegbaren Skill werden, dessen Nachweis das
Repository selbst ist.

## Stack

| Bereich   | Festlegung                                                             |
| --------- | ---------------------------------------------------------------------- |
| Framework | Astro, statisches Output, kein Adapter                                 |
| Sprache   | TypeScript, `astro/tsconfigs/strict`                                   |
| Styling   | Vanilla CSS, Design-Tokens als Custom Properties, `@layer`             |
| Lint      | ESLint Flat Config, `typescript-eslint`, `eslint-plugin-astro`         |
| Format    | Prettier mit `prettier-plugin-astro`, Tabs, einfache Anführungszeichen |

## Befehle

| Befehl            | Zweck                                                |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Dev-Server                                           |
| `npm run build`   | Produktionsbuild nach `dist/`                        |
| `npm run preview` | gebautes Ergebnis lokal ausliefern                   |
| `npm run check`   | `astro check`, Typprüfung inklusive `.astro`-Dateien |
| `npm run lint`    | ESLint                                               |
| `npm run format`  | Prettier schreibend                                  |

## Konventionen

- Sprache der Website ist Deutsch, kein i18n. Code bleibt englisch, UI-Texte und
  Routing-Segmente sind deutsch.
- Design-Werte kommen ausschließlich aus dem zentralen Token-Set. Keine Farb-, Abstands- oder
  Größen-Literale in einzelnen Komponenten.
- Wiederverwendbare Utility-Klassen global anlegen, nicht im Component-Scope.
- Entscheidungen mit Tragweite als ADR unter `docs/decisions/` festhalten.

## Branches

| Branch    | Zweck                                             |
| --------- | ------------------------------------------------- |
| `main`    | veröffentlichter Stand, löst das Deployment aus   |
| `develop` | laufende Arbeit, Standard-Branch für neue Commits |

Nicht direkt auf `main` committen. Änderungen entstehen auf `develop` und gelangen über einen
Merge nach `main`, wenn sie veröffentlicht werden sollen.

## Commit-Messages

Englisch, im Imperativ. Keine Co-Authorship-Zeilen und keine Werkzeug-Signaturen.

## Continuous Integration

| Workflow                       | Auslöser                          | Wirkung                                          |
| ------------------------------ | --------------------------------- | ------------------------------------------------ |
| `.github/workflows/ci.yml`     | Push auf `develop`, Pull Requests | Format, Lint, Typprüfung, Build. Kein Deployment |
| `.github/workflows/deploy.yml` | Push auf `main`                   | Build und Veröffentlichung über GitHub Pages     |

Beide laufen auf Node 24, weil `withastro/action` diese Version als Default verwendet. Weicht die
CI davon ab, prüft sie eine andere Umgebung als der Deploy baut.

Voraussetzung in den Repository-Einstellungen: Pages → Source steht auf **GitHub Actions**.

`package-lock.json` muss committet sein, `withastro/action` erkennt daran den Paketmanager.

## Indexierung

`public/robots.txt` sperrt derzeit die gesamte Seite für Suchmaschinen. Die Sperre wird aufgehoben,
sobald die Seite unter `lolga8.com` erreichbar ist und inhaltlich veröffentlichungsreif.
