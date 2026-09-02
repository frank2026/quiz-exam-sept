# English Exam Warm-Up Quiz

A static, no-database quiz site. 200 questions live in `questions.json`;
each round randomly picks 20 of them.

## Files
- `index.html` — the page
- `style.css` — styling
- `script.js` — quiz logic (fetches `questions.json`, shuffles, grades, shows explanations)
- `questions.json` — the 200-question bank (edit this to add/remove/change questions)

## How to host it

Any static file server works. A few quick options:

**Option 1 — Python (already on most machines):**
```
cd path/to/this/folder
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Option 2 — Node (if you have it):**
```
npx serve .
```

**Option 3 — any real server (Apache/Nginx/etc.):**
Just copy all four files into a folder served by the webserver. No build step,
no database, no server-side code required.

> Note: opening `index.html` directly by double-clicking it (a `file://` URL)
> will usually fail to load `questions.json` due to browser security rules.
> Always serve it through an actual http server (even a local one, as above).

## Editing the question bank
`questions.json` is a plain array of objects:
```json
{
  "id": 1,
  "category": "Present Perfect",
  "prompt": "I ______ for six years.",
  "options": ["have known", "have been knowing", "am knowing", "know"],
  "correct": 0,
  "explanation": "..."
}
```
`correct` is the zero-based index into `options`. Add more objects to grow
the bank past 200 — the quiz automatically adapts to however many are in the file.
