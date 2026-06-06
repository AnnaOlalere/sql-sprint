# SQL Sprint

A dependency-free MVP for rapid-fire SQL practice inspired by SQLBolt and Power BI-style targeted diagnostics.

## Run It

Open this file in your browser:

```text
C:\Users\annol\OneDrive\Documents\New project\index.html
```

No install step is required.

## What It Does

- Shows one short SQL challenge at a time
- Displays tiny source tables for the question
- Lets the learner write a SQL query
- Compares the result against the expected answer
- Gives clause-specific feedback for `SELECT`, `FROM`, `WHERE`, `JOIN`, `GROUP BY`, and `ORDER BY`
- Tracks score, streak, accuracy, solved drills, and skill-area progress
- Lets learners log in with a local profile name and resume later in the same browser
- Includes 100 generated drills from beginner to harder query patterns

## Progress Saving

The app supports Supabase cloud progress saving, with browser `localStorage` as a fallback when Supabase is not configured.

## Supabase Setup

1. Open `supabase-config.js`.
2. Paste your `anon public` key into `anonKey`.
3. In Supabase, open **SQL Editor** and run `supabase-schema.sql`.
4. In Supabase, go to **Authentication > URL Configuration**.
5. Add your deployed site URL after you publish the app.
6. Open `index.html`, sign up with email/password, answer a question, refresh, and log back in.

Do not paste the `service_role` key into this app. Only use the `anon public` key.

## Share It

This is a static site, so you can deploy it to Vercel, Netlify, or GitHub Pages.

For Vercel:

1. Put this folder in a GitHub repo.
2. Import the repo in Vercel.
3. Deploy it as a static site.
4. Copy the Vercel URL into Supabase **Authentication > URL Configuration**.

## How To Extend It

Edit `app.js`.

- Add tables in `BASE_TABLES`
- Add new challenge templates in `templates`
- Add more feedback rules in `diagnose`
- Add more SQL support in `parseSql` and `evaluateQuery`

The current evaluator intentionally supports a focused SQL-training subset. For a production version, the next step would be replacing the hand-built evaluator with SQLite or DuckDB in the browser, while keeping the clause diagnostics layer.
