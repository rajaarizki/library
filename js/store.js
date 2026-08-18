/* =========================================================
   STORE — thin persistence layer over localStorage.
   Swap this out for real API calls later; every function
   here returns/accepts plain JS objects, nothing DOM-related.
   ========================================================= */

const LS_KEYS = {
  books: "mylibrary.books",
  journal: "mylibrary.journal",
  profile: "mylibrary.profile",
  account: "mylibrary.account",
  seeded: "mylibrary.seeded"
};

const Store = {

  init(){
    if(!localStorage.getItem(LS_KEYS.seeded)){
      localStorage.setItem(LS_KEYS.books, JSON.stringify(SAMPLE_BOOKS));
      localStorage.setItem(LS_KEYS.journal, JSON.stringify(SAMPLE_JOURNAL));
      localStorage.setItem(LS_KEYS.profile, JSON.stringify(DEFAULT_PROFILE));
      localStorage.setItem(LS_KEYS.seeded, "1");
    }
  },

  // ---------- books ----------
  getBooks(){
    try{ return JSON.parse(localStorage.getItem(LS_KEYS.books)) || []; }
    catch(e){ return []; }
  },
  saveBooks(books){
    localStorage.setItem(LS_KEYS.books, JSON.stringify(books));
  },
  getBook(id){
    return this.getBooks().find(b => b.id === id);
  },
  upsertBook(book){
    const books = this.getBooks();
    const idx = books.findIndex(b => b.id === book.id);
    if(idx > -1){ books[idx] = { ...books[idx], ...book }; }
    else { books.push(book); }
    this.saveBooks(books);
  },
  deleteBook(id){
    this.saveBooks(this.getBooks().filter(b => b.id !== id));
  },
  reorderWant(orderedIds){
    const books = this.getBooks();
    orderedIds.forEach((id, i) => {
      const b = books.find(x => x.id === id);
      if(b) b.priority = i + 1;
    });
    this.saveBooks(books);
  },

  // ---------- journal ----------
  getJournal(){
    try{ return JSON.parse(localStorage.getItem(LS_KEYS.journal)) || []; }
    catch(e){ return []; }
  },
  saveJournal(entries){
    localStorage.setItem(LS_KEYS.journal, JSON.stringify(entries));
  },
  addJournalEntry(entry){
    const entries = this.getJournal();
    entries.unshift(entry);
    this.saveJournal(entries);
  },
  deleteJournalEntry(id){
    this.saveJournal(this.getJournal().filter(e => e.id !== id));
  },

  // ---------- profile ----------
  getProfile(){
    try{ return JSON.parse(localStorage.getItem(LS_KEYS.profile)) || DEFAULT_PROFILE; }
    catch(e){ return DEFAULT_PROFILE; }
  },
  saveProfile(profile){
    localStorage.setItem(LS_KEYS.profile, JSON.stringify(profile));
  },

  // ---------- account (cosmetic front-end-only auth) ----------
  getAccount(){
    try{ return JSON.parse(localStorage.getItem(LS_KEYS.account)); }
    catch(e){ return null; }
  },
  saveAccount(account){
    localStorage.setItem(LS_KEYS.account, JSON.stringify(account));
  },

  // ---------- utility ----------
  newId(prefix){
    return prefix + "_" + Math.random().toString(36).slice(2,9);
  }
};

Store.init();
