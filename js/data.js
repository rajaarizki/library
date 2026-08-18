/* =========================================================
   DATA — sample library, constants, seed logic
   Replace/extend this with a real API (Google Books / Open
   Library) later. Everything downstream just expects objects
   shaped like the ones below.
   ========================================================= */

const SPINE_COLORS = ["spine-1","spine-2","spine-3","spine-4","spine-5","spine-6","spine-7","spine-8"];

// heights in px, used to give the shelf a natural, uneven silhouette
function spineHeight(seed){
  const heights = [176, 196, 210, 224, 236, 250];
  return heights[seed % heights.length];
}
function spineWidth(seed){
  const widths = [34, 38, 42, 46, 50, 30];
  return widths[seed % widths.length];
}

const SAMPLE_BOOKS = [
  {
    id: "b1", title: "The Night Circus", author: "Erin Morgenstern",
    genre: "Fantasy", status: "reading", rating: 0, favorite: false,
    pages: 512, isbn: "9780307744432", pubDate: "2011",
    description: "A competition between two young illusionists unfolds within a magical, black-and-white circus that only opens at night.",
    dateStarted: "2026-08-02", dateFinished: "", color: "spine-1",
    review: "", quotes: [], notes: []
  },
  {
    id: "b2", title: "Piranesi", author: "Susanna Clarke",
    genre: "Fantasy", status: "reading", rating: 0, favorite: false,
    pages: 245, isbn: "9781635575637", pubDate: "2020",
    description: "A man lives in a labyrinthine House of endless halls and tides, slowly uncovering who he really is.",
    dateStarted: "2026-08-10", dateFinished: "", color: "spine-5",
    review: "", quotes: [
      { id:"q1", text:"The Beauty of the House is immeasurable; its Kindness infinite." }
    ], notes: []
  },
  {
    id: "b3", title: "Klara and the Sun", author: "Kazuo Ishiguro",
    genre: "Literary Fiction", status: "reading", rating: 0, favorite: false,
    pages: 303, isbn: "9780571364886", pubDate: "2021",
    description: "An Artificial Friend observes the world with wonder, hoping to be chosen, and to understand what it means to love.",
    dateStarted: "2026-08-14", dateFinished: "", color: "spine-6",
    review: "", quotes: [], notes: []
  },
  {
    id: "b4", title: "Circe", author: "Madeline Miller",
    genre: "Mythology", status: "finished", rating: 5, favorite: true,
    pages: 393, isbn: "9780316556347", pubDate: "2018",
    description: "The daughter of Helios is banished to a lonely island, where she comes into her own power as a witch.",
    dateStarted: "2026-05-01", dateFinished: "2026-05-14", color: "spine-2",
    review: "I did not expect to love a book about a minor goddess this much. Circe's loneliness felt so real, and her transformation from an overlooked girl to someone entirely her own was quietly devastating in the best way.",
    quotes: [
      { id:"q2", text:"I stepped into those flames and I have not stopped burning since." }
    ], notes: [ { id:"n1", date:"2026-05-14", text:"Reread the ending — it lands even harder the second time." } ]
  },
  {
    id: "b5", title: "The Song of Achilles", author: "Madeline Miller",
    genre: "Mythology", status: "finished", rating: 5, favorite: true,
    pages: 416, isbn: "9780062060624", pubDate: "2011",
    description: "Patroclus and Achilles grow from awkward boyhood friends into the great love story at the heart of the Trojan War.",
    dateStarted: "2026-03-02", dateFinished: "2026-03-11", color: "spine-3",
    review: "Devastating from the first page onward. I knew how it ended and it still broke my heart completely.",
    quotes: [], notes: []
  },
  {
    id: "b6", title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin",
    genre: "Literary Fiction", status: "finished", rating: 4, favorite: false,
    pages: 401, isbn: "9780593321201", pubDate: "2022",
    description: "Two childhood friends become creative partners, building video games together across three decades of collaboration and rupture.",
    dateStarted: "2026-02-10", dateFinished: "2026-02-24", color: "spine-4",
    review: "A love letter to friendship and making things with people. Slower in the middle but the ending justified it.",
    quotes: [], notes: []
  },
  {
    id: "b7", title: "Lessons in Chemistry", author: "Bonnie Garmus",
    genre: "Historical Fiction", status: "finished", rating: 4, favorite: false,
    pages: 390, isbn: "9780385547345", pubDate: "2022",
    description: "A brilliant, unconventional chemist becomes an unlikely star of 1960s daytime television.",
    dateStarted: "2026-01-05", dateFinished: "2026-01-18", color: "spine-7",
    review: "Funny, furious, and warm all at once. Elizabeth Zott deserves every bit of her own stubbornness.",
    quotes: [], notes: []
  },
  {
    id: "b8", title: "The House in the Cerulean Sea", author: "TJ Klune",
    genre: "Fantasy", status: "finished", rating: 5, favorite: true,
    pages: 396, isbn: "9781250217318", pubDate: "2020",
    description: "A caseworker for magical youth is sent to investigate an orphanage on a hidden island, and finds a family he didn't know he needed.",
    dateStarted: "2025-12-01", dateFinished: "2025-12-09", color: "spine-8",
    review: "The comfort read I didn't know I needed. Warm all the way through, like a mug of something hot on a cold day.",
    quotes: [ { id:"q3", text:"Home isn't a place. It's the people." } ], notes: []
  },
  {
    id: "b9", title: "Babel", author: "R. F. Kuang",
    genre: "Fantasy", status: "finished", rating: 4, favorite: false,
    pages: 560, isbn: "9780063021426", pubDate: "2022",
    description: "A boy taken from Canton to Oxford discovers that translation is both magic and empire's favorite weapon.",
    dateStarted: "2025-11-01", dateFinished: "2025-11-20", color: "spine-1",
    review: "Dense but rewarding. I underlined more in this book than in the last five combined.",
    quotes: [], notes: []
  },
  {
    id: "b10", title: "Fourth Wing", author: "Rebecca Yarros",
    genre: "Fantasy Romance", status: "want", rating: 0, favorite: false,
    pages: 528, isbn: "9781649374042", pubDate: "2023",
    description: "A young woman is swept into a brutal war college for dragon riders where the odds are stacked entirely against her.",
    dateStarted: "", dateFinished: "", color: "spine-6",
    review: "", quotes: [], notes: [], priority: 1
  },
  {
    id: "b11", title: "The Secret History", author: "Donna Tartt",
    genre: "Literary Fiction", status: "want", rating: 0, favorite: false,
    pages: 559, isbn: "9781400031702", pubDate: "1992",
    description: "A close-knit group of classics students at a New England college slowly unravels after a killing.",
    dateStarted: "", dateFinished: "", color: "spine-3",
    review: "", quotes: [], notes: [], priority: 2
  },
  {
    id: "b12", title: "A Court of Thorns and Roses", author: "Sarah J. Maas",
    genre: "Fantasy Romance", status: "want", rating: 0, favorite: false,
    pages: 419, isbn: "9781635575569", pubDate: "2015",
    description: "A huntress is dragged into a treacherous faerie court after killing a wolf in the woods.",
    dateStarted: "", dateFinished: "", color: "spine-7",
    review: "", quotes: [], notes: [], priority: 3
  },
  {
    id: "b13", title: "Pachinko", author: "Min Jin Lee",
    genre: "Historical Fiction", status: "want", rating: 0, favorite: false,
    pages: 490, isbn: "9781455563937", pubDate: "2017",
    description: "Four generations of a Korean family navigate love, loss, and survival across Japan through the twentieth century.",
    dateStarted: "", dateFinished: "", color: "spine-2",
    review: "", quotes: [], notes: [], priority: 4
  },
  {
    id: "b14", title: "The Atlas Six", author: "Olivie Blake",
    genre: "Dark Academia", status: "want", rating: 0, favorite: false,
    pages: 373, isbn: "9781250855775", pubDate: "2020",
    description: "Six magicians compete for five spots in a secret society that guards the world's lost knowledge.",
    dateStarted: "", dateFinished: "", color: "spine-4",
    review: "", quotes: [], notes: [], priority: 5
  }
];

const SAMPLE_JOURNAL = [
  { id:"j1", date:"2026-08-14", bookId:"b3", text:"Started Klara and the Sun on the train this morning. Ishiguro's narrators always sound so gentle right up until they say something devastating." },
  { id:"j2", date:"2026-08-10", bookId:"b2", text:"Piranesi's House is starting to feel like a real place I've visited. I keep thinking about the tides in the lower halls." },
  { id:"j3", date:"2026-05-14", bookId:"b4", text:"Finished Circe tonight. Sat with the last page for a long while before closing the book. Some stories you don't want to leave right away." },
  { id:"j4", date:"2026-05-06", bookId:"b4", text:"Circe's chapter with the Minotaur absolutely wrecked me. Did not see that coming." },
  { id:"j5", date:"2026-01-18", bookId:"b7", text:"Finished Lessons in Chemistry. Laughed out loud twice on the bus, which is always a little embarrassing." },
  { id:"j6", date:"2025-12-20", bookId:"", text:"Reorganized the want-to-read shelf tonight. It's getting delightfully out of hand." }
];

const DEFAULT_PROFILE = {
  name: "Amelia Hart",
  username: "amelia.reads",
  bio: "Mostly fantasy and quiet literary fiction. I dog-ear my paperbacks and I am not sorry about it.",
  goal: 30,
  joined: "2024"
};

const GENRES = ["Fantasy","Literary Fiction","Mythology","Historical Fiction","Fantasy Romance","Dark Academia","Romance","Mystery","Sci-Fi","Non-fiction"];
