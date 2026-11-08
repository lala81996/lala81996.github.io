# 0003 — Animierter Marken-Gradient als eigener WebGL-Shader

- Status: akzeptiert
- Datum: 2026-11-08

## Kontext

Die Seite erhält einen Marken-Gradient aus vier Farben (`#fb13eb`, `#92fdce`, `#ff5a63`, `#398ffd`,
160°). Er wurde in einem Gradient-Tool als 3D-Shader entworfen: Wellen-Mesh, Noise, Verzerrung und
Grain. Auf der Startseite soll er animiert erscheinen, als eigenes Visual neben dem Text.

Randbedingungen aus [0001](0001-stack-styling-hosting.md): geringes Auslieferungsgewicht, standardmäßig
kein JavaScript im Browser.

## Entscheidung

Ein eigener WebGL-Fragment-Shader in `src/lib/gradient-shader.ts`, ohne zusätzliche Dependency.
Die Komponente `src/components/GradientVisual.astro` bindet ihn ein.

| Situation                        | Verhalten                                       |
| -------------------------------- | ----------------------------------------------- |
| WebGL verfügbar                  | animierter Shader                               |
| `prefers-reduced-motion: reduce` | ein statisches Shader-Frame                     |
| kein WebGL, kein JavaScript      | statischer CSS-`linear-gradient` aus den Tokens |
| Visual außerhalb des Viewports   | Animation pausiert                              |
| WebGL-Context geht verloren      | Rückfall auf den CSS-Gradient                   |

Farben und Winkel liest der Shader zur Laufzeit aus den Custom Properties in `src/styles/base.css`.
Die Tokens bleiben damit die einzige Quelle. Ausnahme ist `public/favicon.svg`, das keine Custom
Properties lesen kann und die Werte kopiert.

## Begründung

**Eigener Shader.** Nur ein Shader bildet Noise, Verzerrung und Grain der Vorlage nach. Der Code
umfasst wenige Kilobyte und wird nur auf Seiten geladen, die das Visual verwenden.

**Annäherung statt Nachbau.** Die 3D-Parameter des Quell-Tools (`waveHeight`, `stretchX/Y`, `glow`)
haben keine veröffentlichte Formel. Übernommen sind die direkt übertragbaren Werte (Noise, Verzerrung,
Grain, Helligkeit, Tempo). Der Rest ist sinngemäß nachgebildet.

## Konsequenzen

- Das Visual ist dekorativ (`aria-hidden`) und trägt keine Information.
- Die Auflösung ist auf Device Pixel Ratio 2 begrenzt, um die GPU-Last auf hochauflösenden
  Displays zu begrenzen.
- Änderungen an den Gradient-Farben betreffen drei Stellen: Tokens in `base.css`,
  `public/favicon.svg` und das daraus gerasterte `public/favicon.ico`. Die Farbe der Ziffer im
  Favicon kopiert zusätzlich den dunklen Wert von `--color-surface`.
- Der Shader liest Farben nur im Format `#rrggbb` und den Winkel nur in `deg`. Andere Formate
  schalten die Animation ab, der CSS-Fallback bleibt sichtbar.

## Verworfene Alternativen

**Reines CSS.** Animierte `radial-gradient`-Ebenen mit Keyframes kommen ohne JavaScript aus, wirken
aber flach. Noise und Verzerrung der Vorlage lassen sich nicht abbilden.

**three.js.** Mehrere hundert Kilobyte für eine einzelne Fläche. Sinnvoll erst, wenn echte 3D-Szenen
hinzukommen.
