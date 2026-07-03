# Abiodun Victor Alagbada — Academic Portfolio

Static site for https://alagbada123.github.io. No build step, no dependencies.

## Structure
- `index.html` — single-page portfolio (Research, About, Experience, Teaching, Education, Contact)
- `css/style.css` — design system ("measurement lab": Space Grotesk / Source Serif 4 / IBM Plex Mono)
- `js/main.js` — mobile nav + animated free-vibration signal in the hero
- `assets/Alagbada_Abiodun_CV.pdf` — downloadable CV
- `images/user.jpg` — portrait

## Deploy
Replace the entire contents of the `Alagbada123.github.io` repository with these files
(delete the old `js/` libraries, `Preloader.gif`, `json/`, and old images that are no longer referenced),
commit, and push to `main`. GitHub Pages serves it automatically.

## Before going live
1. Replace `YOUR_SCHOLAR_ID` in `index.html` (2 places) with your real Google Scholar profile URL.
2. Optionally replace the preprint link for the regime-switching paper with its canonical Preprints.org DOI page.
3. Revoke the old SmtpJS SecureToken (it was exposed in the previous repository).
