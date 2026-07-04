# Assignment 3 — Node.js Streams + CRUD API

Everything (Part 1 streams, Part 2 CRUD, and this README) is served from a
**single Express app** (`server.js`), as requested.

## Setup

```bash
npm install
npm start
```

The server runs at `http://localhost:3000`.

## Part 1 — Streams (mounted under `/stream`)

| Method | URL                  | What it does                                                              |
|--------|----------------------|----------------------------------------------------------------------------|
| GET    | `/stream/read-chunks`| Reads `data/big.txt` with a readable stream, logs each chunk to console   |
| GET    | `/stream/copy`       | Copies `data/source.txt` -> `data/dest.txt` using pipe()                 |
| GET    | `/stream/compress`   | Pipeline: reads `data/data.txt` -> gzip -> writes `data/data.txt.gz`     |

Sample input files (`big.txt`, `source.txt`, `data.txt`) are already included
in `data/` so the endpoints work out of the box.

## Part 2 — CRUD (mounted under `/user`, backed by `data/users.json`)

All reads/writes go straight to `data/users.json` through the `fs` module on
every request (no in-memory array is kept as the data store).

| Method | URL          | Body                                   | Notes                                                                 |
|--------|--------------|-----------------------------------------|------------------------------------------------------------------------|
| POST   | `/user`      | `{ "name", "age", "email" }`           | 400 if email already exists                                           |
| PATCH  | `/user/:id`  | any subset of `{ name, age, email }`   | 404 if ID not found; **400 if the new email already belongs to another user** |
| DELETE | `/user/:id`  | —                                       | 404 if ID not found                                                    |
| GET    | `/user`      | —                                       | Returns all users                                                      |
| GET    | `/user/:id`  | —                                       | 404 if not found                                                       |

## Part 3 — Node Internals

See [`PART3_ANSWERS.md`](./PART3_ANSWERS.md) for the written answers.

## Postman

1. Import the requests above into a Postman collection.
2. Name each request meaningfully (e.g. "Add User", "Get All Users") — not
   "Untitled Request".
3. Save (Ctrl+S) after each change.
4. Export the collection (Collection -> ... -> Export) and include the link
   in your submission email along with the assignment link, as required.

## Bonus

The bonus (LeetCode "Majority Element", etc.) is a separate deliverable and
isn't part of this API — solve and submit it according to the assignment's
"How to deliver the bonus" instructions.
