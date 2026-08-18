/* =========================================================
   RENDER — pure(ish) functions that turn state into HTML.
   Nothing here talks to localStorage directly; app.js pulls
   data from Store and hands it to these functions.
   ========================================================= */

// small deterministic hash so the same book always leans/sits the same way
function hashSeed(str){
  let h = 0;
  for(let i=0; i<str.length; i++){ h = (h * 31 + str.charCodeAt(i)) >>> 0; }
  return h;
}

function starString(rating){
  const full = "&#9733;".repeat(rating);
  const empty = "&#9734;".repeat(5 - rating);
  return full + empty;
}

function escapeHtml(str){
  return String(str || "").replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[s]));
}

function formatDate(iso){
  if(!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if(isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, { month:"short", day:"numeric", year:"numeric" });
}

/* ---------------------------------------------------------
   BOOK SPINE — the signature component
   --------------------------------------------------------- */
function renderBookSpine(book){
  const seed = hashSeed(book.id);
  const height = spineHeight(seed) + (book.pages ? Math.min(30, Math.floor(book.pages / 40)) : 0);
  const width = spineWidth(seed);
  const rotate = ((seed % 5) - 2) * 0.6; // -1.2deg .. 1.2deg
  const lift = (seed % 3); // 0-2px natural stagger

  return `
    <div class="book ${book.color || 'spine-2'}"
         style="height:${height}px; width:${width}px; transform:rotate(${rotate}deg) translateY(${lift}px);"
         data-book-id="${book.id}" tabindex="0" role="button"
         aria-label="${escapeHtml(book.title)} by ${escapeHtml(book.author)}">
      <span class="spine-cap"></span>
      ${book.favorite ? '<span class="favorite-mark">&#10022;</span>' : ''}
      <span class="spine-label">${escapeHtml(book.title)}</span>
      <span class="spine-foot"></span>
      <div class="book-tooltip">
        <strong>${escapeHtml(book.title)}</strong>
        <span>${escapeHtml(book.author)}</span><br>
        <span class="tt-meta">${book.rating ? starString(book.rating) : statusLabel(book.status)}</span>
      </div>
    </div>`;
}

function statusLabel(status){
  return { reading:"Currently reading", finished:"Finished", want:"Want to read" }[status] || "";
}

function renderShelfRow(books){
  if(!books.length){
    return `<div class="shelf-row"><p class="shelf-empty">This shelf is still empty — for now.</p></div>`;
  }
  return `
    <div class="shelf-row">
      ${books.map(renderBookSpine).join("")}
    </div>
    <div class="shelf-board" style="margin:0 26px;"></div>`;
}

function shelfSection(eyebrow, title, books, viewAllRoute){
  return `
    <section class="shelf-section wrap">
      <div class="section-heading">
        <div>
          <span class="eyebrow">${eyebrow}</span>
          <h2>${title}</h2>
        </div>
        <div style="display:flex; align-items:center; gap:16px;">
          <span class="count">${books.length} book${books.length===1?'':'s'}</span>
          ${viewAllRoute ? `<a class="btn-text" href="#/${viewAllRoute}">View all &rarr;</a>` : ''}
        </div>
      </div>
      <div class="shelf-scroll">
        ${renderShelfRow(books)}
      </div>
    </section>`;
}

/* ---------------------------------------------------------
   HOME
   --------------------------------------------------------- */
function renderHome(){
  const books = Store.getBooks();
  const reading = books.filter(b => b.status === "reading");
  const finished = books.filter(b => b.status === "finished");
  const want = books.filter(b => b.status === "want").sort((a,b)=> (a.priority||99)-(b.priority||99));
  const favorites = books.filter(b => b.favorite);

  return `
    <div class="page">
      <section class="hero">
        <span class="eyebrow">A personal library</span>
        <h1 class="hero-title">My Library</h1>
        <p class="hero-sub">Stories I've loved, stories I'm reading, and stories waiting for me.</p>
        <div class="hero-meta">
          <a href="#/library" class="btn btn-primary">Browse my shelves</a>
          <button class="btn btn-ghost" id="hero-add-book">+ Add a book</button>
        </div>
      </section>

      ${shelfSection("On the nightstand", "Currently Reading", reading, "currently-reading")}
      ${shelfSection("Read &amp; loved", "Favorites", favorites, "library")}
      ${shelfSection("Already finished", "Finished", finished, "library")}
      ${shelfSection("Not yet begun", "Want to Read", want, "want-to-read")}
    </div>`;
}

/* ---------------------------------------------------------
   LIBRARY (filterable, still shelf-shaped)
   --------------------------------------------------------- */
function renderLibrary(filters = {}){
  let books = Store.getBooks();

  if(filters.genre) books = books.filter(b => b.genre === filters.genre);
  if(filters.status) books = books.filter(b => b.status === filters.status);
  if(filters.search){
    const q = filters.search.toLowerCase();
    books = books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }

  const sort = filters.sort || "title";
  books = [...books].sort((a,b) => {
    if(sort === "title") return a.title.localeCompare(b.title);
    if(sort === "author") return a.author.localeCompare(b.author);
    if(sort === "rating") return (b.rating||0) - (a.rating||0);
    if(sort === "recent") return (b.dateFinished||b.dateStarted||"").localeCompare(a.dateFinished||a.dateStarted||"") * -1;
    return 0;
  });

  const genres = [...new Set(Store.getBooks().map(b => b.genre).filter(Boolean))];

  const groups = [
    { key:"reading", label:"Currently Reading" },
    { key:"finished", label:"Finished" },
    { key:"want", label:"Want to Read" }
  ];

  return `
    <div class="page wrap" style="padding:50px 32px 40px;">
      <div class="section-heading">
        <div><span class="eyebrow">Every book, one shelf at a time</span><h2>My Library</h2></div>
        <span class="count">${books.length} book${books.length===1?'':'s'}</span>
      </div>

      <div class="filter-bar">
        <div><label>Search</label><input type="search" id="filter-search" placeholder="Title or author…" value="${escapeHtml(filters.search||'')}"></div>
        <div><label>Genre</label>
          <select id="filter-genre">
            <option value="">All</option>
            ${genres.map(g => `<option value="${g}" ${filters.genre===g?'selected':''}>${g}</option>`).join("")}
          </select>
        </div>
        <div><label>Status</label>
          <select id="filter-status">
            <option value="">All</option>
            <option value="reading" ${filters.status==='reading'?'selected':''}>Currently Reading</option>
            <option value="finished" ${filters.status==='finished'?'selected':''}>Finished</option>
            <option value="want" ${filters.status==='want'?'selected':''}>Want to Read</option>
          </select>
        </div>
        <div><label>Sort</label>
          <select id="filter-sort">
            <option value="title" ${sort==='title'?'selected':''}>Alphabetical</option>
            <option value="author" ${sort==='author'?'selected':''}>Author</option>
            <option value="rating" ${sort==='rating'?'selected':''}>Rating</option>
            <option value="recent" ${sort==='recent'?'selected':''}>Recently finished</option>
          </select>
        </div>
      </div>
    </div>

    ${ filters.genre || filters.status || filters.search
        ? shelfSection("Results", "Matching Books", books, null)
        : groups.map(g => shelfSection(g.label, g.label, books.filter(b => b.status===g.key), null)).join("")
    }`;
}

function renderCurrentlyReading(){
  const books = Store.getBooks().filter(b => b.status === "reading");
  return `
    <div class="page wrap" style="padding:50px 32px 20px;">
      <div class="section-heading">
        <div><span class="eyebrow">On the nightstand</span><h2>Currently Reading</h2></div>
        <span class="count">${books.length} book${books.length===1?'':'s'}</span>
      </div>
      ${!books.length ? emptyState("Nothing on the nightstand", "Move a book here from your Want to Read shelf, or add something new.") : ''}
    </div>
    ${books.length ? `<section class="wrap"><div class="shelf-scroll">${renderShelfRow(books)}</div></section>` : ''}
  `;
}

function emptyState(title, sub){
  return `<div class="empty-state"><h3>${title}</h3><p>${sub}</p></div>`;
}

/* ---------------------------------------------------------
   BOOK DETAIL
   --------------------------------------------------------- */
function renderBookDetail(id){
  const book = Store.getBook(id);
  if(!book){
    return `<div class="page wrap" style="padding:80px 32px;">${emptyState("Book not found", "It may have been removed from your library.")}<p style="text-align:center;"><a class="btn-text" href="#/library">&larr; Back to library</a></p></div>`;
  }

  return `
    <div class="page book-detail wrap">
      <p style="margin-bottom:26px;"><a class="btn-text" href="#/library">&larr; Back to shelf</a></p>
      <div class="detail-grid">
        <div class="book-cover ${book.color}">
          <div>
            <span class="cover-eyebrow">${escapeHtml(book.genre || "Book")}</span>
            <div class="cover-title">${escapeHtml(book.title)}</div>
          </div>
          <div>
            <div class="cover-author">${escapeHtml(book.author)}</div>
            ${book.rating ? `<div class="cover-rating">${starString(book.rating)}</div>` : ''}
          </div>
        </div>

        <div class="detail-body">
          <span class="status-pill">${statusLabel(book.status)}${book.favorite ? ' &middot; Favorite' : ''}</span>
          <h1>${escapeHtml(book.title)}</h1>
          <p class="by-line">by ${escapeHtml(book.author)}</p>

          <div class="field-row" style="max-width:220px; margin:20px 0 0;">
            <label>Your rating</label>
            <div class="star-rate" id="detail-star-rate" data-book-id="${book.id}">
              ${[1,2,3,4,5].map(n => `<span class="star ${n<=book.rating?'filled':''}" data-val="${n}">&#9733;</span>`).join("")}
            </div>
          </div>

          <div class="detail-meta-row">
            <div class="meta-item"><span class="meta-label">Genre</span><span class="meta-value">${escapeHtml(book.genre)||'—'}</span></div>
            <div class="meta-item"><span class="meta-label">Pages</span><span class="meta-value">${book.pages||'—'}</span></div>
            <div class="meta-item"><span class="meta-label">Started</span><span class="meta-value">${formatDate(book.dateStarted)}</span></div>
            <div class="meta-item"><span class="meta-label">Finished</span><span class="meta-value">${formatDate(book.dateFinished)}</span></div>
          </div>

          <p class="detail-description">${escapeHtml(book.description)}</p>

          <div class="detail-actions">
            <button class="btn btn-ghost" data-edit-book="${book.id}">Edit details</button>
            ${book.status !== "reading" ? `<button class="btn btn-ghost" data-set-status="${book.id}:reading">Move to Currently Reading</button>` : ''}
            ${book.status !== "finished" ? `<button class="btn btn-ghost" data-set-status="${book.id}:finished">Mark as Finished</button>` : ''}
            <button class="btn btn-ghost" data-toggle-fav="${book.id}">${book.favorite ? "Remove from Favorites" : "Add to Favorites"}</button>
          </div>

          <div class="journal-block">
            <h3>My review</h3>
            <div class="review-box">
              <textarea id="review-text" placeholder="What did you think of this book?">${escapeHtml(book.review)}</textarea>
              <div class="review-meta">
                <span class="count" id="review-status">${book.review ? 'Saved' : 'Not written yet'}</span>
                <button class="btn btn-primary btn-small" id="save-review" data-book-id="${book.id}">Save review</button>
              </div>
            </div>
          </div>

          <div class="journal-block">
            <h3>Favorite quotes</h3>
            <div class="quote-list" id="quote-list">
              ${book.quotes.map(q => `
                <div class="quote-card">
                  &ldquo;${escapeHtml(q.text)}&rdquo;
                  <button class="remove-x" data-remove-quote="${q.id}" data-book-id="${book.id}">&times;</button>
                </div>`).join("")}
            </div>
            <div class="inline-add">
              <input type="text" id="new-quote-input" placeholder="Add a favorite line…">
              <button class="btn btn-ghost btn-small" id="add-quote-btn" data-book-id="${book.id}">Add</button>
            </div>
          </div>

          <div class="journal-block">
            <h3>My notes</h3>
            <div class="note-list" id="note-list">
              ${book.notes.map(n => `
                <div class="note-card">
                  <span class="count">${formatDate(n.date)}</span><br>
                  ${escapeHtml(n.text)}
                  <button class="remove-x" data-remove-note="${n.id}" data-book-id="${book.id}">&times;</button>
                </div>`).join("")}
            </div>
            <div class="inline-add">
              <input type="text" id="new-note-input" placeholder="Jot down a thought…">
              <button class="btn btn-ghost btn-small" id="add-note-btn" data-book-id="${book.id}">Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ---------------------------------------------------------
   WANT TO READ
   --------------------------------------------------------- */
function renderWantToRead(){
  const books = Store.getBooks().filter(b => b.status === "want").sort((a,b)=> (a.priority||99)-(b.priority||99));
  return `
    <div class="page wrap" style="padding:50px 32px 90px;">
      <div class="section-heading" style="justify-content:center; flex-direction:column; text-align:center; gap:6px;">
        <span class="eyebrow">These are the stories waiting for me</span>
        <h2>Want to Read</h2>
      </div>
      ${!books.length ? emptyState("Your want-to-read shelf is empty", "Add a book and it will land here first.") : `
      <div class="want-list" id="want-list">
        ${books.map((b,i) => `
          <div class="want-item" data-book-id="${b.id}">
            <div class="want-swatch ${b.color}"></div>
            <div class="want-info">
              <div class="w-title"><a href="#/book/${b.id}">${escapeHtml(b.title)}</a></div>
              <div class="w-author">${escapeHtml(b.author)}</div>
            </div>
            ${i===0 ? '<span class="want-badge">Next</span>' : ''}
            <div class="want-controls">
              <button class="icon-btn" title="Move up" data-move="up" data-book-id="${b.id}">&uarr;</button>
              <button class="icon-btn" title="Move down" data-move="down" data-book-id="${b.id}">&darr;</button>
              <button class="btn btn-ghost btn-small" data-set-status="${b.id}:reading">Start reading</button>
              <button class="icon-btn" title="Remove" data-remove-want="${b.id}">&times;</button>
            </div>
          </div>`).join("")}
      </div>`}
    </div>`;
}

/* ---------------------------------------------------------
   JOURNAL
   --------------------------------------------------------- */
function renderJournal(){
  const entries = Store.getJournal();
  const books = Store.getBooks();

  return `
    <div class="page journal-page wrap" style="padding:50px 32px 90px;">
      <div class="section-heading" style="justify-content:center; flex-direction:column; text-align:center; gap:6px;">
        <span class="eyebrow">A quiet place for thoughts mid-story</span>
        <h2>Reading Journal</h2>
      </div>

      <div class="journal-compose">
        <textarea id="journal-text" placeholder="What are you thinking about today?"></textarea>
        <div class="journal-compose-footer">
          <select id="journal-book-link">
            <option value="">Not linked to a book</option>
            ${books.map(b => `<option value="${b.id}">${escapeHtml(b.title)}</option>`).join("")}
          </select>
          <button class="btn btn-primary btn-small" id="add-journal-entry">Add entry</button>
        </div>
      </div>

      ${!entries.length ? emptyState("Your journal is empty", "Write your first entry above.") : `
      <div class="journal-timeline">
        ${entries.map(e => {
          const book = books.find(b => b.id === e.bookId);
          return `
          <div class="journal-entry">
            <div class="journal-date">${formatDate(e.date)}${book ? `<span class="j-linked">&middot; ${escapeHtml(book.title)}</span>` : ''}</div>
            <div class="journal-text">${escapeHtml(e.text)}</div>
            <button class="journal-remove" data-remove-journal="${e.id}">Remove entry</button>
          </div>`;
        }).join("")}
      </div>`}
    </div>`;
}

/* ---------------------------------------------------------
   STATS
   --------------------------------------------------------- */
function renderStats(){
  const books = Store.getBooks();
  const profile = Store.getProfile();
  const finished = books.filter(b => b.status === "finished");
  const thisYear = finished.filter(b => (b.dateFinished||"").startsWith("2026"));
  const totalPages = finished.reduce((sum,b) => sum + (b.pages||0), 0);
  const avgRating = finished.length ? (finished.reduce((s,b)=>s+(b.rating||0),0) / finished.filter(b=>b.rating).length || 0) : 0;

  const genreCounts = {};
  finished.forEach(b => { if(b.genre) genreCounts[b.genre] = (genreCounts[b.genre]||0) + 1; });
  const favGenre = Object.entries(genreCounts).sort((a,b)=>b[1]-a[1])[0];

  const authorCounts = {};
  finished.forEach(b => { authorCounts[b.author] = (authorCounts[b.author]||0) + 1; });
  const favAuthor = Object.entries(authorCounts).sort((a,b)=>b[1]-a[1])[0];

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const perMonth = months.map((m,i) => {
    return finished.filter(b => {
      const d = b.dateFinished ? new Date(b.dateFinished+"T00:00:00") : null;
      return d && d.getFullYear() === 2026 && d.getMonth() === i;
    }).length;
  });
  const maxMonth = Math.max(1, ...perMonth);

  const goal = profile.goal || 30;
  const pct = Math.min(100, Math.round((thisYear.length / goal) * 100));

  return `
    <div class="page stats-page wrap" style="padding:50px 32px 40px;">
      <div class="section-heading" style="flex-direction:column; align-items:flex-start; gap:6px;">
        <span class="eyebrow">A look back at your reading life</span>
        <h2>Reading Statistics</h2>
      </div>

      <div class="goal-panel">
        <div>
          <div class="goal-title">2026 Reading Goal</div>
          <div class="goal-num">${thisYear.length} / <span id="goal-target">${goal}</span> books</div>
        </div>
        <div class="goal-bar-wrap">
          <div class="goal-bar"><div class="goal-bar-fill" style="width:${pct}%;"></div></div>
        </div>
        <div class="goal-edit">
          <label class="count" style="color:var(--gold-soft);">Edit goal</label>
          <input type="number" id="goal-input" value="${goal}" min="1">
          <button class="btn btn-ghost btn-small" id="save-goal" style="color:#fff; border-color:rgba(255,255,255,0.3);">Save</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><div class="stat-num">${thisYear.length}</div><div class="stat-label">Books read this year</div></div>
        <div class="stat-card"><div class="stat-num">${totalPages.toLocaleString()}</div><div class="stat-label">Pages read (all time)</div></div>
        <div class="stat-card"><div class="stat-num">${avgRating ? avgRating.toFixed(1) : '—'}</div><div class="stat-label">Average rating</div></div>
        <div class="stat-card"><div class="stat-num">${books.filter(b=>b.status==='reading').length}</div><div class="stat-label">Currently reading</div></div>
      </div>

      <div class="chart-panel">
        <div class="section-heading" style="margin-bottom:0;"><h3 style="font-size:1.1rem;">Books finished per month &mdash; 2026</h3></div>
        <div class="chart-bars">
          ${perMonth.map((count,i) => `
            <div class="chart-bar-col">
              <div class="chart-bar" style="height:${count ? (count/maxMonth*130)+14 : 4}px;"></div>
              <div class="chart-bar-label">${months[i]}</div>
            </div>`).join("")}
        </div>
      </div>

      <div class="favorites-row">
        <div class="fav-card"><div class="fav-label">Favorite genre</div><div class="fav-value">${favGenre ? favGenre[0] : '—'}</div></div>
        <div class="fav-card"><div class="fav-label">Favorite author</div><div class="fav-value">${favAuthor ? favAuthor[0] : '—'}</div></div>
      </div>
    </div>`;
}

/* ---------------------------------------------------------
   AUTH
   --------------------------------------------------------- */
function renderLogin(){
  return `
    <div class="page auth-page">
      <div class="auth-card">
        <span class="eyebrow">Welcome back</span>
        <h1>Sign in</h1>
        <p class="auth-sub">Your library is waiting.</p>
        <form id="login-form">
          <div class="field-row"><label for="li-email">Email</label><input type="email" id="li-email" required></div>
          <div class="field-row"><label for="li-password">Password</label><input type="password" id="li-password" required></div>
          <div class="auth-row-between">
            <label style="display:flex; align-items:center; gap:6px; text-transform:none; letter-spacing:0;"><input type="checkbox" id="li-remember"> Remember me</label>
            <a href="#" class="btn-text" id="forgot-link">Forgot password?</a>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;">Enter my library</button>
        </form>
        <p class="auth-footer">New here? <a class="btn-text" href="#/signup">Create an account</a></p>
      </div>
    </div>`;
}

function renderSignup(){
  return `
    <div class="page auth-page">
      <div class="auth-card">
        <span class="eyebrow">Begin your shelf</span>
        <h1>Create an account</h1>
        <p class="auth-sub">A quiet corner of the internet just for your books.</p>
        <form id="signup-form">
          <div class="field-row"><label for="su-name">Name</label><input type="text" id="su-name" required></div>
          <div class="field-row"><label for="su-username">Username</label><input type="text" id="su-username" required></div>
          <div class="field-row"><label for="su-email">Email</label><input type="email" id="su-email" required></div>
          <div class="field-row"><label for="su-password">Password</label><input type="password" id="su-password" required></div>
          <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; margin-top:8px;">Create my library</button>
        </form>
        <p class="auth-footer">Already have an account? <a class="btn-text" href="#/login">Sign in</a></p>
      </div>
    </div>`;
}

/* ---------------------------------------------------------
   PROFILE
   --------------------------------------------------------- */
function renderProfile(){
  const profile = Store.getProfile();
  const books = Store.getBooks();
  const finished = books.filter(b => b.status === "finished");
  const current = books.find(b => b.status === "reading");
  const favorites = books.filter(b => b.favorite);
  const initials = (profile.name || "?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();

  return `
    <div class="page profile-page wrap" style="padding:50px 32px 40px;">
      <div class="profile-header">
        <div class="profile-avatar">${initials}</div>
        <div>
          <div class="profile-name">${escapeHtml(profile.name)}</div>
          <div class="profile-username">@${escapeHtml(profile.username)} &middot; reading since ${escapeHtml(profile.joined||'')}</div>
          <p class="profile-bio">${escapeHtml(profile.bio)}</p>
        </div>
      </div>

      <div class="stats-grid" style="margin-bottom:44px;">
        <div class="stat-card"><div class="stat-num">${finished.length}</div><div class="stat-label">Books read</div></div>
        <div class="stat-card"><div class="stat-num">${favorites.length}</div><div class="stat-label">Favorites</div></div>
        <div class="stat-card"><div class="stat-num">${profile.goal||30}</div><div class="stat-label">Reading goal</div></div>
        <div class="stat-card" style="display:flex; flex-direction:column; justify-content:center;">
          <div class="stat-label" style="margin-top:0;">Currently reading</div>
          <div style="font-family:var(--font-display); font-size:1.05rem; margin-top:6px;">${current ? escapeHtml(current.title) : '—'}</div>
        </div>
      </div>

      <form class="profile-edit-form" id="profile-form">
        <h3 style="margin-bottom:18px; font-size:1.1rem;">Edit profile</h3>
        <div class="field-row"><label for="pf-name">Name</label><input type="text" id="pf-name" value="${escapeHtml(profile.name)}"></div>
        <div class="field-row"><label for="pf-username">Username</label><input type="text" id="pf-username" value="${escapeHtml(profile.username)}"></div>
        <div class="field-row"><label for="pf-bio">Bio</label><textarea id="pf-bio" rows="3">${escapeHtml(profile.bio)}</textarea></div>
        <button type="submit" class="btn btn-primary btn-small">Save profile</button>
      </form>

      <div class="section-heading"><h3 style="font-size:1.1rem;">Favorite shelf</h3></div>
      ${renderShelfRow(favorites)}
    </div>`;
}
