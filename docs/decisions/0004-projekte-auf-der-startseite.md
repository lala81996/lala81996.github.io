# 0004 — Projekte als Panels auf der Startseite

- Status: akzeptiert
- Datum: 2026-11-10

## Kontext

[0001](0001-stack-styling-hosting.md) legt eine Multi-Page-Struktur mit je einer Detailseite pro
Projekt fest. Die Projekttexte sind inzwischen kurz gehalten: eine Zusammenfassung, wenige
Herausforderungen, Rolle und belegte Bereiche.

## Entscheidung

| Bereich        | Festlegung                                                       |
| -------------- | ---------------------------------------------------------------- |
| Seitenstruktur | Eine Seite, Projekte als Panels im Kapitel „Projekte“            |
| Inhalt         | Felder im Frontmatter der Collection `projects`, kein Body       |
| Kacheln        | höchstens vier Herausforderungen je Projekt, im Schema geprüft   |
| Verknüpfung    | Bereiche im Panel verlinken als Sprungmarken auf `#bereich-<id>` |

## Begründung

Der Inhalt eines Projekts passt vollständig in ein Panel. Eine Detailseite hätte kaum mehr Inhalt
und kostet einen Klick. Alle Projekte sind ohne Navigation scanbar, wie schon die Bereiche.

## Konsequenzen

- Keine dynamische Route `projekte/[id]`. Längere Texte stehen nicht auf der Seite.
- Das Kachel-Layout ist auf eine bis vier Kacheln ausgelegt. Mehr Herausforderungen lehnt der Build
  ab.

## Verworfene Alternativen

**Detailseite pro Projekt.** Wie in 0001 vorgesehen. Bei der jetzigen Textlänge ohne Mehrwert
gegenüber dem Panel. Bei deutlich längeren Projekttexten neu zu bewerten.
