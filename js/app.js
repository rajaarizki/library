/* =========================================================
   APP — router + event wiring. Vanilla JS, no build step.
   ========================================================= */

const appEl = document.getElementById("app");
const modalOverlay = document.getElementById("book-modal-overlay");
const toastEl = document.getElementById("toast");

let currentLibraryFilters = {};

/* ---------------------------------------------------------
   ROUTER
   --------------------------------------------------------- */
function parseHash(){
  const hash = location.hash.replace(/^#\//, "") || "home";
  const parts = hash.split("/");
  return { route: parts[0] || "home", param: parts[1] };
}

function router(){
  const { route, param } = parseHash();

  switch(route){
    case "home": appEl.innerHTML = renderHome(); break;
    case "library": appEl.innerHTML = renderLibrary(currentLibraryFilters); break;
    case "currently-reading": appEl.innerHTML = renderCurrentlyReading(); break;
    case "want-to-read": appEl.innerHTML = renderWantToRead(); break;
    case "journal": appEl.innerHTML = renderJournal(); break;
    case "stats": appEl.innerHTML = renderStats(); break;
    case "book": appEl.innerHTML = renderBookDetail(param); break;
    case "login": appEl.innerHTML = renderLogin(); break;
    case "signup": appEl.innerHTML = renderSignup(); break;
    case "profile": appEl.innerHTML = renderProfile(); break;
    default: appEl.innerHTML = renderHome();
  }

  document.querySelectorAll(".main-nav a").forEach(a => {
    a.classList.toggle("active", a.dataset.route === route);
  });
  document.getElementById("main-nav").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  wirePageEvents(route);
}

window.addEventListener("hashchange", router);

/* ---------------------------------------------------------
   TOAST
   --------------------------------------------------------- */
let toastTimer;
function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

/* ---------------------------------------------------------
   NAV TOGGLE (mobile)
   --------------------------------------------------------- */
document.getElementById("nav-toggle").addEventListener("click", () => {
  document.getElementById("main-nav").classList.toggle("open");
});

/* ---------------------------------------------------------
   ADD / EDIT BOOK MODAL
   --------------------------------------------------------- */
const bookForm = document.getElementById("book-form");
const swatchRow = document.getElementById("bf-swatches");

SPINE_COLORS.forEach(c => {
  const s = document.createElement("div");
  s.className = "swatch";
  s.dataset.color = c;
  s.style.background = `var(--${c})`; // e.g. var(--spine-1), defined in :root
  swatchRow.appendChild(s);
});

let selectedColor = SPINE_COLORS[0];
swatchRow.addEventListener("click", (e) => {
  const swatch = e.target.closest(".swatch");
  if(!swatch) return;
  selectedColor = swatch.dataset.color;
  [...swatchRow.children].forEach(s => s.classList.toggle("selected", s === swatch));
});

function openBookModal(book){
  document.getElementById("book-modal-title").textContent = book ? "Edit book" : "Add a book";
  document.getElementById("bf-id").value = book ? book.id : "";
  document.getElementById("bf-title").value = book ? book.title : "";
  document.getElementById("bf-author").value = book ? book.author : "";
  document.getElementById("bf-genre").value = book ? book.genre : "";
  document.getElementById("bf-status").value = book ? book.status : "want";
  document.getElementById("bf-pages").value = book ? book.pages || "" : "";
  document.getElementById("bf-isbn").value = book ? book.isbn || "" : "";
  document.getElementById("bf-desc").value = book ? book.description || "" : "";
  document.getElementById("bf-favorite").checked = book ? !!book.favorite : false;
  document.getElementById("bf-delete").style.display = book ? "inline-flex" : "none";

  selectedColor = book ? (book.color || SPINE_COLORS[0]) : SPINE_COLORS[Math.floor(Math.random()*SPINE_COLORS.length)];
  [...swatchRow.children].forEach(s => s.classList.toggle("selected", s.dataset.color === selectedColor));

  modalOverlay.classList.add("open");
}
function closeBookModal(){ modalOverlay.classList.remove("open"); }

document.getElementById("open-add-book").addEventListener("click", () => openBookModal(null));
document.querySelectorAll("[data-close-modal]").forEach(b => b.addEventListener("click", closeBookModal));
modalOverlay.addEventListener("click", (e) => { if(e.target === modalOverlay) closeBookModal(); });

bookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("bf-id").value || Store.newId("b");
  const existing = Store.getBook(id) || {};
  const book = {
    ...existing,
    id,
    title: document.getElementById("bf-title").value.trim(),
    author: document.getElementById("bf-author").value.trim(),
    genre: document.getElementById("bf-genre").value.trim(),
    status: document.getElementById("bf-status").value,
    pages: parseInt(document.getElementById("bf-pages").value) || 0,
    isbn: document.getElementById("bf-isbn").value.trim(),
    description: document.getElementById("bf-desc").value.trim(),
    favorite: document.getElementById("bf-favorite").checked,
    color: selectedColor,
    rating: existing.rating || 0,
    dateStarted: existing.dateStarted || (document.getElementById("bf-status").value !== "want" ? new Date().toISOString().slice(0,10) : ""),
    dateFinished: existing.dateFinished || "",
    quotes: existing.quotes || [],
    notes: existing.notes || [],
    review: existing.review || "",
    priority: existing.priority || (Store.getBooks().filter(b=>b.status==='want').length + 1)
  };
  Store.upsertBook(book);
  closeBookModal();
  showToast(existing.id ? "Book updated" : "Added to your shelf");
  router();
});

document.getElementById("bf-delete").addEventListener("click", () => {
  const id = document.getElementById("bf-id").value;
  if(id && confirm("Remove this book from your library?")){
    Store.deleteBook(id);
    closeBookModal();
    showToast("Book removed");
    location.hash = "#/library";
    router();
  }
});

document.getElementById("hero-add-book") && document.getElementById("hero-add-book").addEventListener("click", () => openBookModal(null));

/* ---------------------------------------------------------
   PAGE-LEVEL EVENT WIRING (re-run after every render)
   --------------------------------------------------------- */
function wirePageEvents(route){
  const heroAdd = document.getElementById("hero-add-book");
  if(heroAdd) heroAdd.addEventListener("click", () => openBookModal(null));

  // book spine + card clicks -> detail page
  appEl.querySelectorAll("[data-book-id]").forEach(el => {
    if(el.classList.contains("book")){
      el.addEventListener("click", () => { location.hash = "#/book/" + el.dataset.bookId; });
      el.addEventListener("keydown", (e) => { if(e.key === "Enter") location.hash = "#/book/" + el.dataset.bookId; });
    }
  });

  // edit book buttons
  appEl.querySelectorAll("[data-edit-book]").forEach(btn => {
    btn.addEventListener("click", () => openBookModal(Store.getBook(btn.dataset.editBook)));
  });

  // status change buttons
  appEl.querySelectorAll("[data-set-status]").forEach(btn => {
    btn.addEventListener("click", () => {
      const [id, status] = btn.dataset.setStatus.split(":");
      const book = Store.getBook(id);
      const updates = { status };
      if(status === "reading" && !book.dateStarted) updates.dateStarted = new Date().toISOString().slice(0,10);
      if(status === "finished" && !book.dateFinished) updates.dateFinished = new Date().toISOString().slice(0,10);
      Store.upsertBook({ ...book, ...updates });
      showToast(status === "reading" ? "Moved to Currently Reading" : "Marked as finished");
      router();
    });
  });

  // favorite toggle
  appEl.querySelectorAll("[data-toggle-fav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const book = Store.getBook(btn.dataset.toggleFav);
      Store.upsertBook({ ...book, favorite: !book.favorite });
      router();
    });
  });

  // star rating (detail page)
  const starRate = document.getElementById("detail-star-rate");
  if(starRate){
    starRate.querySelectorAll(".star").forEach(star => {
      star.addEventListener("click", () => {
        const book = Store.getBook(starRate.dataset.bookId);
        Store.upsertBook({ ...book, rating: parseInt(star.dataset.val) });
        router();
      });
    });
  }

  // review save
  const saveReviewBtn = document.getElementById("save-review");
  if(saveReviewBtn){
    saveReviewBtn.addEventListener("click", () => {
      const book = Store.getBook(saveReviewBtn.dataset.bookId);
      const text = document.getElementById("review-text").value.trim();
      Store.upsertBook({ ...book, review: text });
      document.getElementById("review-status").textContent = "Saved";
      showToast("Review saved");
    });
  }

  // quotes
  const addQuoteBtn = document.getElementById("add-quote-btn");
  if(addQuoteBtn){
    addQuoteBtn.addEventListener("click", () => {
      const input = document.getElementById("new-quote-input");
      if(!input.value.trim()) return;
      const book = Store.getBook(addQuoteBtn.dataset.bookId);
      book.quotes.push({ id: Store.newId("q"), text: input.value.trim() });
      Store.upsertBook(book);
      router();
    });
  }
  appEl.querySelectorAll("[data-remove-quote]").forEach(btn => {
    btn.addEventListener("click", () => {
      const book = Store.getBook(btn.dataset.bookId);
      book.quotes = book.quotes.filter(q => q.id !== btn.dataset.removeQuote);
      Store.upsertBook(book);
      router();
    });
  });

  // notes
  const addNoteBtn = document.getElementById("add-note-btn");
  if(addNoteBtn){
    addNoteBtn.addEventListener("click", () => {
      const input = document.getElementById("new-note-input");
      if(!input.value.trim()) return;
      const book = Store.getBook(addNoteBtn.dataset.bookId);
      book.notes.push({ id: Store.newId("n"), text: input.value.trim(), date: new Date().toISOString().slice(0,10) });
      Store.upsertBook(book);
      router();
    });
  }
  appEl.querySelectorAll("[data-remove-note]").forEach(btn => {
    btn.addEventListener("click", () => {
      const book = Store.getBook(btn.dataset.bookId);
      book.notes = book.notes.filter(n => n.id !== btn.dataset.removeNote);
      Store.upsertBook(book);
      router();
    });
  });

  // want-to-read: move / remove
  appEl.querySelectorAll("[data-move]").forEach(btn => {
    btn.addEventListener("click", () => {
      const books = Store.getBooks().filter(b => b.status === "want").sort((a,b)=>(a.priority||99)-(b.priority||99));
      const ids = books.map(b => b.id);
      const idx = ids.indexOf(btn.dataset.bookId);
      const dir = btn.dataset.move === "up" ? -1 : 1;
      const swapIdx = idx + dir;
      if(swapIdx < 0 || swapIdx >= ids.length) return;
      [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];
      Store.reorderWant(ids);
      router();
    });
  });
  appEl.querySelectorAll("[data-remove-want]").forEach(btn => {
    btn.addEventListener("click", () => {
      if(confirm("Remove this book from your Want to Read shelf?")){
        Store.deleteBook(btn.dataset.removeWant);
        showToast("Removed");
        router();
      }
    });
  });

  // library filters
  ["filter-search","filter-genre","filter-status","filter-sort"].forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    const evt = el.tagName === "INPUT" ? "input" : "change";
    el.addEventListener(evt, () => {
      currentLibraryFilters = {
        search: document.getElementById("filter-search").value,
        genre: document.getElementById("filter-genre").value,
        status: document.getElementById("filter-status").value,
        sort: document.getElementById("filter-sort").value
      };
      appEl.innerHTML = renderLibrary(currentLibraryFilters);
      wirePageEvents("library");
    });
  });

  // journal add / remove
  const addJournalBtn = document.getElementById("add-journal-entry");
  if(addJournalBtn){
    addJournalBtn.addEventListener("click", () => {
      const text = document.getElementById("journal-text").value.trim();
      if(!text) return;
      Store.addJournalEntry({
        id: Store.newId("j"),
        date: new Date().toISOString().slice(0,10),
        bookId: document.getElementById("journal-book-link").value,
        text
      });
      showToast("Journal entry added");
      router();
    });
  }
  appEl.querySelectorAll("[data-remove-journal]").forEach(btn => {
    btn.addEventListener("click", () => {
      Store.deleteJournalEntry(btn.dataset.removeJournal);
      router();
    });
  });

  // stats goal
  const saveGoalBtn = document.getElementById("save-goal");
  if(saveGoalBtn){
    saveGoalBtn.addEventListener("click", () => {
      const profile = Store.getProfile();
      profile.goal = parseInt(document.getElementById("goal-input").value) || profile.goal;
      Store.saveProfile(profile);
      showToast("Goal updated");
      router();
    });
  }

  // profile form
  const profileForm = document.getElementById("profile-form");
  if(profileForm){
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const profile = Store.getProfile();
      profile.name = document.getElementById("pf-name").value.trim() || profile.name;
      profile.username = document.getElementById("pf-username").value.trim() || profile.username;
      profile.bio = document.getElementById("pf-bio").value.trim();
      Store.saveProfile(profile);
      updateNavAvatar();
      showToast("Profile saved");
      router();
    });
  }

  // login / signup (front-end only, cosmetic)
  const loginForm = document.getElementById("login-form");
  if(loginForm){
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Welcome back!");
      location.hash = "#/home";
    });
  }
  const signupForm = document.getElementById("signup-form");
  if(signupForm){
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const profile = Store.getProfile();
      profile.name = document.getElementById("su-name").value.trim() || profile.name;
      profile.username = document.getElementById("su-username").value.trim() || profile.username;
      Store.saveProfile(profile);
      Store.saveAccount({ email: document.getElementById("su-email").value.trim() });
      updateNavAvatar();
      showToast("Your library has been created");
      location.hash = "#/home";
    });
  }
}

/* ---------------------------------------------------------
   NAV AVATAR
   --------------------------------------------------------- */
function updateNavAvatar(){
  const profile = Store.getProfile();
  const initials = (profile.name || "?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  document.getElementById("nav-avatar").textContent = initials || "A";
}

/* ---------------------------------------------------------
   INIT
   --------------------------------------------------------- */
updateNavAvatar();
router();
