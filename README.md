# My Library

A personal digital library and reading journal — a warm, editorial alternative
to Goodreads. Browse your books on a real-looking bookshelf (spines out, not
cover grids), track what you're reading, write reviews, save favorite quotes,
keep a reading journal, and watch your yearly reading goal fill in.

Everything runs entirely in the browser. No build step, no server, no
database — just HTML, CSS, and JavaScript, with your data saved to
`localStorage` so it's there the next time you open the site.

## What's inside

```
my-digital-library/
├── index.html          the single page shell (nav, modal, routes into #app)
├── css/
│   └── style.css        the entire visual design system
├── js/
│   ├── data.js           sample books, journal entries, and shared constants
│   ├── store.js          localStorage read/write layer (swap for a real API later)
│   ├── render.js          turns app state into HTML for every page
│   └── app.js             router + all event handling
├── assets/
│   ├── images/
│   └── icons/
├── README.md
└── .gitignore
```

The site is a small hash-routed single-page app: `#/home`, `#/library`,
`#/currently-reading`, `#/want-to-read`, `#/journal`, `#/stats`,
`#/book/:id`, `#/login`, `#/signup`, `#/profile`. Book covers are generated
from title, author, and a chosen spine color — no image hosting required, and
every book still gets its own distinct, elegant cover on its detail page.

## Running it locally

You can open `index.html` directly in a browser, but most browsers block
`localStorage` on the `file://` protocol, so it's better to serve it locally:

```bash
# from inside my-digital-library/
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Or, with Node installed:

```bash
npx serve .
```

## How the data works

The first time the site loads, it seeds `localStorage` with a set of sample
books and journal entries (see `js/data.js`) so you can see the design
immediately. After that, everything you add, edit, rate, or write is read
from and saved back to `localStorage` — nothing is ever sent anywhere.

To start over with a clean library, open your browser's dev tools and run:

```js
localStorage.clear();
```
then refresh the page.

## Adding a book

Click **+ Add a book** in the header (or on the homepage). Fill in the
title, author, genre, status, page count, and a short description, and pick
a spine color from the swatches. The book appears immediately on the
matching shelf. Click any book's spine to open its detail page, where you
can rate it, write a review, add favorite quotes, jot notes, and move it
between "Want to Read," "Currently Reading," and "Finished."

## Connecting a real book API later

`js/store.js` is intentionally the only file that touches `localStorage`.
To connect a real backend or a books API (Google Books, Open Library), you'd:

1. Replace the bodies of `Store.getBooks()` / `Store.upsertBook()` / etc.
   with `fetch()` calls to your API, keeping the same function names and
   return shapes.
2. In `js/app.js`, wire the "Add a book" form to first search the API by
   title/ISBN, then prefill the form (cover image, description, page count)
   before saving.
3. Everything in `render.js` already expects the same book object shape
   (`title`, `author`, `genre`, `status`, `rating`, `pages`, `description`,
   `dateStarted`, `dateFinished`, `quotes`, `notes`, `review`, `favorite`,
   `color`), so no rendering code needs to change.

## Deploying to GitHub Pages

1. Create a new GitHub repository and push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "My Library — first version"
   git branch -M main
   git remote add origin https://github.com/<your-username>/my-digital-library.git
   git push -u origin main
   ```
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch,"
   pick the `main` branch and the `/ (root)` folder, then save.
4. GitHub will give you a URL like
   `https://<your-username>.github.io/my-digital-library/` — that's your
   live site.

No build tools, no `npm install`, no server required — it's a static site
from the start.

## Customizing

- **Colors and type** live entirely in `css/style.css`, at the top under
  `:root` — change the CSS variables there and the whole site follows.
- **Sample books** live in `js/data.js` — edit or clear `SAMPLE_BOOKS` and
  `SAMPLE_JOURNAL` to start with your own shelf.
- **Fonts** are Fraunces (serif, headings/titles/quotes) and Inter (sans,
  UI/labels/body), both loaded from Google Fonts in `index.html`.
