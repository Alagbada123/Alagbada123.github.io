# Abiodun Victor Alagbada: academic portfolio

Source for <https://alagbada123.github.io>. The site is plain HTML, CSS and JavaScript with no build step and no dependencies. GitHub Pages serves the `main` branch.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | The whole page: About, Research, Publications, Talks, Skills, Experience, Education, Contact |
| `css/style.css` | Styles, with colour tokens for light and dark themes at the top of the file |
| `js/main.js` | Mobile menu, section highlight in the navigation, photo slideshow, hero signal plot |
| `assets/Abiodun_Alagbada.pdf` | CV linked from the page |
| `images/` | Portrait, favicon, social preview image, and `talks/` for conference photos |

## Preview locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Common updates

**Add a publication.** Copy an existing `<li class="pub">` block inside the right category in `index.html` (journal articles, conference papers, book chapters, preprints, theses). Give it the next key in that category, for example `J2`, and update the count in the `pub-index` navigation above the list. Link the title to the DOI.

**Replace the CV.** Overwrite `assets/Abiodun_Alagbada.pdf` and keep the same file name. If the name changes, update the three links to it in `index.html`.

**Add a talk photo.** Save a 3:2 JPEG, 1500 by 1000 pixels, in `images/talks/`. Add a `<figure class="slide">` with an `alt` text and a `<figcaption>` inside the `slideshow` block. The script builds the dots and controls from the slides it finds.
