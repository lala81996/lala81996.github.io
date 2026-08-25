# 0002 — ESLint 10 ohne jsx-a11y-Regeln

- Status: akzeptiert
- Datum: 2026-08-25

## Kontext

`eslint-plugin-astro` stellt Accessibility-Regeln über die Config-Exports
`flat/jsx-a11y-recommended` und `flat/jsx-a11y-strict` bereit. Diese Regeln benötigen das Paket
`eslint-plugin-jsx-a11y`, das im Plugin als `peerOptional` deklariert ist.

`eslint-plugin-jsx-a11y@6.10.2` gibt als unterstützten Bereich `eslint@^3 || … || ^9` an. Das
Projekt verwendet `eslint@10`. Die Installation beider Pakete gemeinsam scheitert an diesem
Peer-Konflikt.

## Entscheidung

ESLint 10 ohne `eslint-plugin-jsx-a11y`. Verwendet wird `astro.configs['flat/recommended']`, das
die a11y-Regeln nicht enthält und ohne das Paket lauffähig ist.

## Konsequenzen

- Markup-bezogene Accessibility-Fehler wie fehlende `alt`-Attribute oder Überschriften ohne Inhalt
  werden nicht automatisch erkannt.
- Accessibility wird stattdessen manuell geprüft. Kontrastwerte, Fokus-Indikatoren und Zielgrößen
  sind ohnehin nicht durch Linting abgedeckt.
- Der Wechsel zurück auf ESLint 9 mit aktiven a11y-Regeln wäre eine Änderung an zwei Stellen:
  Versionsbereich in `package.json` und ein zusätzlicher Config-Eintrag in `eslint.config.js`.

## Erneut prüfen, wenn

`eslint-plugin-jsx-a11y` ESLint 10 in seinen `peerDependencies` unterstützt. Dann das Paket
nachinstallieren und `astro.configs['flat/jsx-a11y-recommended']` in `eslint.config.js` ergänzen.
