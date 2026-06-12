# SQL Sprint

A dependency-free MVP for rapid-fire SQL practice inspired by SQLBolt and Power BI-style targeted diagnostics.

Copyright (c) 2026 Anna Olalere. All rights reserved.

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
- Includes analyst-style drills for `CASE WHEN`, subqueries, CTEs, window functions, and KPI-style subscription questions
- Tracks score, streak, accuracy, solved drills, and skill-area progress
- Lets learners filter by topic, review missed questions, and read short explanations after correct answers
- Prompts learners to move to the next question after a correct answer
- Requires semicolons so learners practice ending SQL statements properly
- Lets learners log in with email/password and resume progress with Supabase
- Includes 150 varied drills from beginner fundamentals to analyst-style business SQL

## Curriculum Split

- Questions 1-16: SELECT, WHERE, and ORDER BY fundamentals
- Questions 17-30: DISTINCT, aliases, LIMIT, and AND/OR logic
- Questions 31-45: aggregates, GROUP BY, and HAVING
- Questions 46-65: INNER JOIN and LEFT JOIN practice
- Questions 66-80: CASE WHEN and segmentation
- Questions 81-95: subqueries and CTEs
- Questions 96-115: window functions such as ROW_NUMBER, RANK, LAG, and LEAD
- Questions 116-130: NULLs, dates, strings, and data cleaning
- Questions 131-150: business KPI drills for revenue, retention, churn, and cohorts

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

The current evaluator intentionally supports a focused SQL-training subset, including common forms of joins, grouped aggregates, CASE WHEN, one-level subqueries, simple CTEs, NULL checks, COALESCE cleaning, COUNT DISTINCT, and common window functions. For a production version, the next step would be replacing the hand-built evaluator with SQLite or DuckDB in the browser, while keeping the clause diagnostics layer.

## Intellectual Property

The source code, interface, question wording, fictional practice tables, sample data, explanations, and feedback text are original project materials.

This project does not claim exclusive ownership over SQL syntax, generic table concepts, scoring mechanics, query practice, or the general idea of an interactive SQL learning tool.
