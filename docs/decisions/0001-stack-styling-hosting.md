# 0001 — Stack, Styling und Hosting

- Status: akzeptiert
- Datum: 2026-08-25

## Kontext

Für die Domain `lolga8.com` entsteht eine Portfolio-Website. Sie ersetzt eine bestehende
WordPress-Installation im IONOS-Hosting, die anschließend abgeschaltet wird.

Anforderungen: geringes Gewicht der ausgelieferten Seite, Veröffentlichung neuer Inhalte durch
einen einfachen `git push`, Darstellung fachlich breiter Skills sowie Beschreibung von Projekten,
die aus dem Arbeitskontext stammen und nicht frei gezeigt werden dürfen.

Bindende Randbedingung: GitHub Pages liefert ausschließlich statische Dateien aus. Es gibt keine
Serverlaufzeit und keine Server-Redirects.

## Entscheidung

| Bereich           | Festlegung                                                 |
| ----------------- | ---------------------------------------------------------- |
| Framework         | Astro mit TypeScript, statisches Output                    |
| Styling           | Vanilla CSS, Design-Tokens als Custom Properties, `@layer` |
| Sprache der Seite | Deutsch, kein i18n                                         |
| Seitenstruktur    | Multi-Page mit je einer Detailseite pro Projekt            |
| Hosting           | GitHub Pages, Deploy über GitHub Actions                   |
| Repository        | `lala81996.github.io`, öffentlich                          |

## Begründung

**Astro.** Content Collections liefern typisierte Frontmatter-Schemas für Projekte und Skills.
Statisches Output ist der Normalfall des Frameworks und kein Sonderweg. Standardmäßig wird kein
JavaScript an den Browser ausgeliefert.

**Vanilla CSS.** Jeder Design-Wert hat genau eine Quelle in einer Token-Datei. Kein
Preprocessor-Schritt, kein Framework-Update-Risiko, minimales Auslieferungsgewicht.

**Repository-Name.** Ein Repository, das exakt `<username>.github.io` heißt, wird unter der
Root-URL ausgeliefert. Ein gewöhnliches Projekt-Repository läuft unter `/reponame/` und würde in
Astro ein `base` erfordern, das beim Umzug auf die eigene Domain wieder entfernt werden müsste.

**Öffentliches Repository.** GitHub Pages aus einem privaten Repository setzt einen
kostenpflichtigen Plan voraus. Zusätzlich ist der Quellcode der Seite selbst ein Arbeitsnachweis.

## Konsequenzen

- Keine serverseitige Logik. Kontaktformulare und vergleichbare Funktionen benötigen einen
  externen Dienst oder entfallen.
- Keine Server-Redirects möglich. Für die Ablösung der WordPress-Seite ist das ohne Folgen, weil
  dort bewusst nichts indexiert war.
- `astro.config.mjs` setzt `site` von Beginn an auf `https://lolga8.com`. Der Umzug auf die eigene
  Domain erfordert dadurch nur DNS-Änderungen und die Datei `public/CNAME`, keine
  Konfigurationsänderung.
- Solange die Seite noch unter `lala81996.github.io` läuft, verhindert `public/robots.txt` die
  Indexierung.

## Verworfene Alternativen

**Next.js.** Auf GitHub Pages nur mit `output: 'export'` betreibbar. Damit entfallen SSR, API
Routes, Middleware und ISR, `next/image` benötigt einen Custom Loader oder `unoptimized`. Der
Framework-Nutzen wird durch die statische Randbedingung weitgehend aufgehoben.

**Vite mit React.** Routing, Content-Pipeline und Metadatenverwaltung wären Eigenbau. Astro bringt
diese Teile mit.

**Tailwind.** Zusätzliches Klassenvokabular ohne Vorteil bei einer Seite dieser Größe.

**SCSS.** Zusätzlicher Preprocessor-Schritt ohne Funktion, die Custom Properties nicht abdecken.
