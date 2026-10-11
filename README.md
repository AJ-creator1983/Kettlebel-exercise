# Kettlebell Coach

Kettlebell-app voor beginners met één kettlebell van 16 kg. Werkt als app op je Android-telefoon, ook offline. Geen account, geen advertenties, alles blijft op je toestel.

Let op: dit is algemene trainingsinformatie, geen medisch advies. Stop bij scherpe pijn. Twijfel je over je gezondheid? Vraag eerst je huisarts.

## Wat zit erin

- Schema Training A en B, weekplanning, overslaan en verplaatsen
- Trainingsscherm met grote timer, rusttimer, links/rechts-begeleiding
- Uitleg per oefening met tekeningen
- 8-wekenprogramma dat je zelf bepaalt (uitstellen of herhalen kan)
- Voortgang, grafieken, gewicht en middelomtrek
- Back-up (export/import als JSON)

## Installeren op je Android-telefoon (stap voor stap)

Een app als deze (PWA) moet op een internetadres met `https://` staan om echt te installeren. Alleen een bestand op je telefoon zetten werkt niet goed. Gratis oplossing: GitHub Pages. Je hoeft niets te programmeren.

### Deel 1: de app online zetten (eenmalig, ca. 10 minuten, op een computer is het makkelijkst)

1. Pak de ZIP uit. Je krijgt een map met o.a. `index.html`, `app.js`, `style.css`.
2. Ga naar https://github.com en maak een gratis account (knop "Sign up").
3. Klik rechtsboven op **+** en kies **New repository**.
4. Bij "Repository name" typ je: `kettlebell-coach`. Kies **Public**. Klik **Create repository**.
5. Klik op de pagina op de link **uploading an existing file**.
6. Open de uitgepakte map. Selecteer **alle bestanden** (niet de map zelf, niet de ZIP) en sleep ze naar het GitHub-venster.
7. Wacht tot alles geüpload is. Klik onderaan op **Commit changes**.
8. Klik bovenaan op **Settings**, links op **Pages**.
9. Bij "Branch" kies je **main** en daarnaast **/ (root)**. Klik **Save**.
10. Wacht 1 à 2 minuten en ververs de pagina. Bovenaan staat je adres, bijvoorbeeld `https://jouwnaam.github.io/kettlebell-coach/`. Dat is je app.

### Deel 2: op je telefoon installeren

1. Open **Chrome** op je Android-telefoon.
2. Ga naar het adres uit deel 1. Laat de app helemaal laden (even wachten).
3. Tik rechtsboven op de drie puntjes **⋮**.
4. Tik op **App installeren** (of **Toevoegen aan startscherm**). Bevestig.
5. Nu staat het icoon "Kettlebell Coach" op je startscherm. Open de app daarvandaan. Je ziet geen browserbalk.

### Offline gebruiken

1. Open de app **één keer met internet** (zie hierboven) en wacht een paar seconden.
2. Daarna werkt alles ook zonder internet, ook in vliegtuigmodus.
3. Je trainingen blijven op je telefoon bewaard.

## Je gegevens veilig houden

Alles staat alleen op je telefoon. Wis je browsergegevens of verwijder je de app, dan is het weg. Doe daarom af en toe:

**Instellingen → Exporteer alle gegevens (JSON)**. Bewaar het bestand ergens veilig (bijvoorbeeld in je Downloads of mail het naar jezelf). Terugzetten kan met **Importeer back-up**.

## Aanpassen of updaten (voor later)

Verander je een bestand? Verhoog dan in `service-worker.js` het getal bij `VERSION` (bijvoorbeeld `v1.0.1`). Anders blijven telefoons de oude versie tonen.

## Lokaal testen op een computer

Dubbelklikken op `index.html` is niet genoeg voor de offline-functie. In een terminal in deze map:

```
python3 -m http.server 8000
```

Open dan http://localhost:8000 in Chrome.

## Bestanden

`index.html`, `style.css`, `app.js`, `manifest.json`, `service-worker.js`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon-32.png`, `README.md`
