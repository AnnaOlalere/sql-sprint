const BASE_TABLES = {
  customers: [
    { id: 1, name: "Maya", city: "Boston", tier: "Gold" },
    { id: 2, name: "Leo", city: "Miami", tier: "Silver" },
    { id: 3, name: "Sana", city: "Boston", tier: "Bronze" },
    { id: 4, name: "Owen", city: "Denver", tier: "Gold" }
  ],
  orders: [
    { id: 101, customer_id: 1, product: "Laptop", amount: 1200, status: "shipped" },
    { id: 102, customer_id: 2, product: "Mouse", amount: 25, status: "pending" },
    { id: 103, customer_id: 1, product: "Keyboard", amount: 75, status: "shipped" },
    { id: 104, customer_id: 3, product: "Monitor", amount: 240, status: "cancelled" },
    { id: 105, customer_id: 4, product: "Desk", amount: 410, status: "shipped" }
  ],
  employees: [
    { id: 1, name: "Ari", department: "Sales", salary: 72000 },
    { id: 2, name: "Nia", department: "Data", salary: 91000 },
    { id: 3, name: "Cam", department: "Sales", salary: 68000 },
    { id: 4, name: "Jules", department: "Ops", salary: 77000 },
    { id: 5, name: "Rin", department: "Data", salary: 98000 }
  ],
  tickets: [
    { id: 1, owner: "Ari", priority: "high", days_open: 8 },
    { id: 2, owner: "Nia", priority: "low", days_open: 1 },
    { id: 3, owner: "Ari", priority: "medium", days_open: 4 },
    { id: 4, owner: "Cam", priority: "high", days_open: 11 }
  ],
  products: [
    { id: 1, name: "Laptop", category: "Tech", price: 1200 },
    { id: 2, name: "Mouse", category: "Tech", price: 25 },
    { id: 3, name: "Desk", category: "Office", price: 410 },
    { id: 4, name: "Chair", category: "Office", price: 180 }
  ]
};

const SKILLS = ["SELECT", "WHERE", "ORDER", "COUNT", "GROUP", "JOIN"];
const STORAGE_PREFIX = "sql-sprint-profile:";
const LAST_PROFILE_KEY = "sql-sprint-last-profile";
const SUPABASE_SETTINGS = window.SQL_SPRINT_SUPABASE || {};
const hasSupabaseConfig =
  SUPABASE_SETTINGS.url &&
  SUPABASE_SETTINGS.anonKey &&
  !SUPABASE_SETTINGS.url.includes("PASTE_YOUR") &&
  !SUPABASE_SETTINGS.anonKey.includes("PASTE_YOUR");
const supabaseClient = hasSupabaseConfig && window.supabase
  ? window.supabase.createClient(SUPABASE_SETTINGS.url, SUPABASE_SETTINGS.anonKey)
  : null;
const state = {
  profile: "",
  userId: "",
  current: 0,
  score: 0,
  streak: 0,
  attempts: 0,
  solved: new Set(),
  skill: Object.fromEntries(SKILLS.map((skill) => [skill, { correct: 0, total: 0 }]))
};

const templates = [
  {
    title: "Choose a column",
    difficulty: "Easy",
    skill: "SELECT",
    table: "customers",
    prompt: "Show every customer's name.",
    answer: "SELECT name FROM customers;",
    expected: { select: ["name"], from: "customers" }
  },
  {
    title: "Filter text",
    difficulty: "Easy",
    skill: "WHERE",
    table: "customers",
    prompt: "Show the names of customers from Boston.",
    answer: "SELECT name FROM customers WHERE city = 'Boston';",
    expected: { select: ["name"], from: "customers", where: { column: "city", operator: "=", value: "Boston" } }
  },
  {
    title: "Filter numbers",
    difficulty: "Easy",
    skill: "WHERE",
    table: "orders",
    prompt: "Show products from orders with an amount greater than 100.",
    answer: "SELECT product FROM orders WHERE amount > 100;",
    expected: { select: ["product"], from: "orders", where: { column: "amount", operator: ">", value: 100 } }
  },
  {
    title: "Sort rows",
    difficulty: "Easy",
    skill: "ORDER",
    table: "employees",
    prompt: "Show employee names and salaries from highest salary to lowest.",
    answer: "SELECT name, salary FROM employees ORDER BY salary DESC;",
    expected: { select: ["name", "salary"], from: "employees", orderBy: { column: "salary", direction: "DESC" } }
  },
  {
    title: "Count rows",
    difficulty: "Medium",
    skill: "COUNT",
    table: "tickets",
    prompt: "Count how many tickets have high priority.",
    answer: "SELECT COUNT(*) FROM tickets WHERE priority = 'high';",
    expected: { select: ["COUNT(*)"], from: "tickets", where: { column: "priority", operator: "=", value: "high" } }
  },
  {
    title: "Group totals",
    difficulty: "Medium",
    skill: "GROUP",
    table: "employees",
    prompt: "Show each department and the average salary in that department.",
    answer: "SELECT department, AVG(salary) FROM employees GROUP BY department;",
    expected: { select: ["department", "AVG(salary)"], from: "employees", groupBy: ["department"] }
  },
  {
    title: "Join lookup",
    difficulty: "Hard",
    skill: "JOIN",
    tables: ["orders", "customers"],
    prompt: "Show each shipped order product with the customer's name.",
    answer: "SELECT orders.product, customers.name FROM orders JOIN customers ON orders.customer_id = customers.id WHERE orders.status = 'shipped';",
    expected: {
      select: ["orders.product", "customers.name"],
      from: "orders",
      join: { table: "customers", left: "orders.customer_id", right: "customers.id" },
      where: { column: "orders.status", operator: "=", value: "shipped" }
    }
  },
  {
    title: "Category prices",
    difficulty: "Medium",
    skill: "GROUP",
    table: "products",
    prompt: "Show each product category and its highest price.",
    answer: "SELECT category, MAX(price) FROM products GROUP BY category;",
    expected: { select: ["category", "MAX(price)"], from: "products", groupBy: ["category"] }
  },
  {
    title: "Multiple columns",
    difficulty: "Easy",
    skill: "SELECT",
    table: "orders",
    prompt: "Show product and status for every order.",
    answer: "SELECT product, status FROM orders;",
    expected: { select: ["product", "status"], from: "orders" }
  },
  {
    title: "Open work",
    difficulty: "Easy",
    skill: "WHERE",
    table: "tickets",
    prompt: "Show owners of tickets open for at least 5 days.",
    answer: "SELECT owner FROM tickets WHERE days_open >= 5;",
    expected: { select: ["owner"], from: "tickets", where: { column: "days_open", operator: ">=", value: 5 } }
  }
];

const challengePlan = [
  { difficulty: "Easy", count: 60 },
  { difficulty: "Medium", count: 30 },
  { difficulty: "Hard", count: 10 }
];

const challenges = challengePlan.flatMap(({ difficulty, count }) => {
  const pool = templates.filter((template) => template.difficulty === difficulty);
  return Array.from({ length: count }, (_, index) => {
    const base = pool[index % pool.length];
    const round = Math.floor(index / pool.length) + 1;
    return {
      ...structuredClone(base),
      title: `${base.title} ${round}`
    };
  });
}).map((challenge, index) => ({
  ...challenge,
  id: index + 1,
  prompt: `${challenge.prompt} (${index + 1}/100)`
}));

const el = {
  score: document.querySelector("#score"),
  streak: document.querySelector("#streak"),
  accuracy: document.querySelector("#accuracy"),
  doneCount: document.querySelector("#doneCount"),
  authEmail: document.querySelector("#authEmail"),
  authPassword: document.querySelector("#authPassword"),
  loginBtn: document.querySelector("#loginBtn"),
  signupBtn: document.querySelector("#signupBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  profileStatus: document.querySelector("#profileStatus"),
  skillMap: document.querySelector("#skillMap"),
  challengeList: document.querySelector("#challengeList"),
  difficulty: document.querySelector("#difficulty"),
  prompt: document.querySelector("#prompt"),
  schemaArea: document.querySelector("#schemaArea"),
  sqlInput: document.querySelector("#sqlInput"),
  feedback: document.querySelector("#feedback"),
  actualResult: document.querySelector("#actualResult"),
  expectedResult: document.querySelector("#expectedResult"),
  attemptBadge: document.querySelector("#attemptBadge"),
  runBtn: document.querySelector("#runBtn"),
  hintBtn: document.querySelector("#hintBtn"),
  answerBtn: document.querySelector("#answerBtn"),
  prevBtn: document.querySelector("#prevBtn"),
  nextBtn: document.querySelector("#nextBtn")
};

function normalizeIdentifier(value) {
  return String(value || "").trim().replace(/["`]/g, "").toLowerCase();
}

function normalizeValue(value) {
  if (typeof value === "number") return value;
  const stripped = String(value || "").trim().replace(/^['"]|['"]$/g, "");
  const numeric = Number(stripped);
  return Number.isNaN(numeric) ? stripped : numeric;
}

function normalizeComparableValue(value) {
  return typeof value === "string" ? value.toLowerCase() : value;
}

function splitColumns(value) {
  const columns = [];
  let depth = 0;
  let current = "";
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      columns.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) columns.push(current.trim());
  return columns;
}

function parseSql(sql) {
  const cleaned = sql.trim().replace(/;$/, "").replace(/\s+/g, " ");
  const selectMatch = cleaned.match(/^select\s+(.+?)\s+from\s+([a-z_][\w.]*)/i);
  if (!selectMatch) {
    return { error: "Start with SELECT columns FROM table." };
  }

  const parsed = {
    raw: cleaned,
    select: splitColumns(selectMatch[1]).map((item) => item.replace(/\s+as\s+.+$/i, "")),
    from: selectMatch[2]
  };

  const joinMatch = cleaned.match(/\sjoin\s+([a-z_][\w.]*)\s+on\s+([a-z_][\w.]*?)\s*=\s*([a-z_][\w.]*)/i);
  if (joinMatch) {
    parsed.join = { table: joinMatch[1], left: joinMatch[2], right: joinMatch[3] };
  }

  const whereMatch = cleaned.match(/\swhere\s+([a-z_][\w.]*)\s*(=|!=|<>|>=|<=|>|<)\s*('[^']*'|"[^"]*"|[\w.]+)/i);
  if (whereMatch) {
    parsed.where = {
      column: whereMatch[1],
      operator: whereMatch[2] === "<>" ? "!=" : whereMatch[2],
      value: normalizeValue(whereMatch[3])
    };
  }

  const groupMatch = cleaned.match(/\sgroup\s+by\s+(.+?)(\s+order\s+by|\s+limit|$)/i);
  if (groupMatch) parsed.groupBy = splitColumns(groupMatch[1]);

  const orderMatch = cleaned.match(/\sorder\s+by\s+([a-z_][\w.]*)(?:\s+(asc|desc))?/i);
  if (orderMatch) parsed.orderBy = { column: orderMatch[1], direction: (orderMatch[2] || "ASC").toUpperCase() };

  return parsed;
}

function columnValue(row, column) {
  const key = normalizeIdentifier(column);
  if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
  const shortKey = key.split(".").pop();
  return row[shortKey];
}

function compare(a, operator, b) {
  const leftValue = normalizeComparableValue(a);
  const rightValue = normalizeComparableValue(b);
  switch (operator) {
    case "=":
      return String(leftValue) === String(rightValue);
    case "!=":
      return String(leftValue) !== String(rightValue);
    case ">":
      return Number(a) > Number(b);
    case "<":
      return Number(a) < Number(b);
    case ">=":
      return Number(a) >= Number(b);
    case "<=":
      return Number(a) <= Number(b);
    default:
      return false;
  }
}

function makeRows(parsed) {
  const base = BASE_TABLES[normalizeIdentifier(parsed.from)];
  if (!base) throw new Error(`Unknown table "${parsed.from}".`);
  let rows = base.map((row) => prefixRow(row, parsed.from));

  if (parsed.join) {
    const joined = BASE_TABLES[normalizeIdentifier(parsed.join.table)];
    if (!joined) throw new Error(`Unknown joined table "${parsed.join.table}".`);
    rows = rows.flatMap((leftRow) =>
      joined
        .map((row) => prefixRow(row, parsed.join.table))
        .filter((rightRow) => columnValue(leftRow, parsed.join.left) === columnValue(rightRow, parsed.join.right))
        .map((rightRow) => ({ ...leftRow, ...rightRow }))
    );
  }

  if (parsed.where) {
    rows = rows.filter((row) => compare(columnValue(row, parsed.where.column), parsed.where.operator, parsed.where.value));
  }

  return rows;
}

function storageKey(profile) {
  return `${STORAGE_PREFIX}${profile.trim().toLowerCase()}`;
}

function resetProgress(profile = state.profile, userId = state.userId) {
  state.profile = profile;
  state.userId = userId;
  state.current = 0;
  state.score = 0;
  state.streak = 0;
  state.attempts = 0;
  state.solved = new Set();
  state.skill = Object.fromEntries(SKILLS.map((skill) => [skill, { correct: 0, total: 0 }]));
}

function serializeProgress() {
  return {
    profile: state.profile,
    userId: state.userId,
    current: state.current,
    score: state.score,
    streak: state.streak,
    solved: Array.from(state.solved),
    skill: state.skill
  };
}

function applyProgress(progress) {
  state.current = Number(progress?.current ?? progress?.current_question) || 0;
  state.score = Number(progress?.score) || 0;
  state.streak = Number(progress?.streak) || 0;
  state.solved = new Set(progress?.solved || []);
  state.skill = { ...state.skill, ...(progress?.skill || {}) };
}

async function saveProgress() {
  if (!state.profile) return;
  if (supabaseClient && state.userId) {
    const { error } = await supabaseClient.from("sql_sprint_progress").upsert({
      user_id: state.userId,
      current_question: state.current,
      score: state.score,
      streak: state.streak,
      solved: Array.from(state.solved),
      skill: state.skill,
      updated_at: new Date().toISOString()
    });
    if (error) {
      el.profileStatus.textContent = `Signed in as ${state.profile}. Cloud save failed: ${error.message}`;
      return;
    }
    el.profileStatus.textContent = `Signed in as ${state.profile}. Progress saved to Supabase.`;
    return;
  }
  localStorage.setItem(storageKey(state.profile), JSON.stringify(serializeProgress()));
  localStorage.setItem(LAST_PROFILE_KEY, state.profile);
  el.profileStatus.textContent = `Signed in as ${state.profile}. Progress saved in this browser.`;
}

function loadProfile(profile) {
  const name = profile.trim();
  if (!name) return;
  resetProgress(name);
  const saved = localStorage.getItem(storageKey(name));
  if (saved) {
    try {
      applyProgress(JSON.parse(saved));
      el.profileStatus.textContent = `Welcome back, ${name}. Resumed at question ${state.current + 1}.`;
    } catch {
      el.profileStatus.textContent = `Signed in as ${name}. Starting fresh.`;
    }
  } else {
    el.profileStatus.textContent = `Signed in as ${name}. Starting fresh.`;
  }
  state.profile = name;
  el.authEmail.value = name;
  localStorage.setItem(LAST_PROFILE_KEY, name);
  renderStats();
  renderChallenge();
}

async function loadCloudProgress(user) {
  resetProgress(user.email || "Learner", user.id);
  const { data, error } = await supabaseClient
    .from("sql_sprint_progress")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    el.profileStatus.textContent = `Signed in, but progress could not load: ${error.message}`;
  } else if (data) {
    applyProgress(data);
    el.profileStatus.textContent = `Welcome back, ${state.profile}. Resumed at question ${state.current + 1}.`;
  } else {
    el.profileStatus.textContent = `Signed in as ${state.profile}. Starting fresh.`;
    await saveProgress();
  }
  el.authEmail.value = user.email || "";
  el.authPassword.value = "";
  localStorage.setItem(LAST_PROFILE_KEY, state.profile);
  renderStats();
  renderChallenge();
}

async function signIn() {
  if (!supabaseClient) {
    loadProfile(el.authEmail.value || "Local learner");
    return;
  }
  const email = el.authEmail.value.trim();
  const password = el.authPassword.value;
  if (!email || !password) {
    el.profileStatus.textContent = "Enter an email and password.";
    return;
  }
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    el.profileStatus.textContent = error.message;
    return;
  }
  await loadCloudProgress(data.user);
}

async function signUp() {
  if (!supabaseClient) {
    loadProfile(el.authEmail.value || "Local learner");
    return;
  }
  const email = el.authEmail.value.trim();
  const password = el.authPassword.value;
  if (!email || !password) {
    el.profileStatus.textContent = "Enter an email and password.";
    return;
  }
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (error) {
    el.profileStatus.textContent = error.message;
    return;
  }
  if (data.session?.user) {
    await loadCloudProgress(data.session.user);
    return;
  }
  if (data.user) {
    el.profileStatus.textContent = "Account created. Check your email if confirmation is enabled, then log in.";
  }
}

async function signOut() {
  if (supabaseClient) await supabaseClient.auth.signOut();
  resetProgress("");
  el.authEmail.value = "";
  el.authPassword.value = "";
  el.profileStatus.textContent = supabaseClient ? "Logged out." : "Local profile cleared.";
  renderStats();
  renderChallenge();
}

function prefixRow(row, table) {
  const output = {};
  for (const [key, value] of Object.entries(row)) {
    output[key] = value;
    output[`${normalizeIdentifier(table)}.${key}`] = value;
  }
  return output;
}

function evaluateQuery(spec) {
  let rows = makeRows(spec);
  const aggregate = spec.select.find((column) => /\w+\(.+\)/i.test(column));

  if (spec.groupBy?.length) {
    const groupCol = spec.groupBy[0];
    const grouped = rows.reduce((map, row) => {
      const key = columnValue(row, groupCol);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
      return map;
    }, new Map());
    return Array.from(grouped.entries(), ([key, groupRows]) => projectAggregateGroup(spec, groupCol, key, groupRows));
  }

  if (aggregate) {
    return [projectAggregateGroup(spec, null, null, rows)];
  }

  if (spec.orderBy) {
    const { column, direction } = spec.orderBy;
    rows = [...rows].sort((a, b) => {
      const left = columnValue(a, column);
      const right = columnValue(b, column);
      if (typeof left === "number" && typeof right === "number") {
        return direction === "DESC" ? right - left : left - right;
      }
      return direction === "DESC" ? String(right).localeCompare(String(left)) : String(left).localeCompare(String(right));
    });
  }

  const projected = rows.map((row) => {
    const output = {};
    spec.select.forEach((column) => {
      output[column] = columnValue(row, column);
    });
    return output;
  });

  return projected;
}

function projectAggregateGroup(spec, groupCol, groupKey, rows) {
  const output = {};
  for (const column of spec.select) {
    const count = column.match(/^count\(\*\)$/i);
    const avg = column.match(/^avg\(([\w.]+)\)$/i);
    const max = column.match(/^max\(([\w.]+)\)$/i);
    if (count) output["COUNT(*)"] = rows.length;
    else if (avg) output[`AVG(${avg[1]})`] = Math.round(rows.reduce((sum, row) => sum + Number(columnValue(row, avg[1])), 0) / rows.length);
    else if (max) output[`MAX(${max[1]})`] = Math.max(...rows.map((row) => Number(columnValue(row, max[1]))));
    else if (groupCol && normalizeIdentifier(column) === normalizeIdentifier(groupCol)) output[column] = groupKey;
    else output[column] = columnValue(rows[0] || {}, column);
  }
  return output;
}

function diagnose(parsed, expected, resultMatches) {
  const messages = [];
  if (parsed.error) {
    return [{ type: "bad", title: "Syntax", text: parsed.error }];
  }

  compareList("SELECT", parsed.select, expected.select, messages);
  if (normalizeIdentifier(parsed.from) !== normalizeIdentifier(expected.from)) {
    messages.push({ type: "bad", title: "FROM", text: `Use the ${expected.from} table. You used ${parsed.from || "nothing"}.` });
  }
  if (expected.join) {
    if (!parsed.join) {
      messages.push({ type: "bad", title: "JOIN", text: `Join ${expected.join.table} using ${expected.join.left} = ${expected.join.right}.` });
    } else {
      comparePart("JOIN table", parsed.join.table, expected.join.table, messages);
      comparePart("JOIN left key", parsed.join.left, expected.join.left, messages);
      comparePart("JOIN right key", parsed.join.right, expected.join.right, messages);
    }
  }
  if (expected.where) {
    if (!parsed.where) {
      messages.push({ type: "bad", title: "WHERE", text: `Add WHERE ${expected.where.column} ${expected.where.operator} ${JSON.stringify(expected.where.value)}.` });
    } else {
      comparePart("WHERE column", parsed.where.column, expected.where.column, messages);
      if (parsed.where.operator !== expected.where.operator) {
        messages.push({ type: "bad", title: "WHERE operator", text: `Use ${expected.where.operator}, not ${parsed.where.operator}.` });
      }
      if (String(normalizeComparableValue(parsed.where.value)) !== String(normalizeComparableValue(expected.where.value))) {
        messages.push({ type: "bad", title: "WHERE value", text: `Filter for ${JSON.stringify(expected.where.value)}, not ${JSON.stringify(parsed.where.value)}.` });
      }
    }
  }
  if (expected.groupBy) compareList("GROUP BY", parsed.groupBy || [], expected.groupBy, messages);
  if (expected.orderBy) {
    if (!parsed.orderBy) {
      messages.push({ type: "bad", title: "ORDER BY", text: `Sort by ${expected.orderBy.column} ${expected.orderBy.direction}.` });
    } else {
      comparePart("ORDER BY column", parsed.orderBy.column, expected.orderBy.column, messages);
      if (parsed.orderBy.direction !== expected.orderBy.direction) {
        messages.push({ type: "bad", title: "ORDER BY direction", text: `Use ${expected.orderBy.direction}, not ${parsed.orderBy.direction}.` });
      }
    }
  }

  if (resultMatches && messages.length === 0) {
    messages.push({ type: "good", title: "Correct", text: "That query returns the expected result." });
  } else if (!resultMatches && messages.length === 0) {
    messages.push({ type: "warn", title: "Result mismatch", text: "The clauses look close, but the returned rows do not match the expected result." });
  }
  return messages;
}

function comparePart(title, actual, expected, messages) {
  if (normalizeIdentifier(actual) !== normalizeIdentifier(expected)) {
    messages.push({ type: "bad", title, text: `Expected ${expected}; found ${actual || "nothing"}.` });
  }
}

function compareList(title, actual, expected, messages) {
  const actualSet = actual.map(normalizeIdentifier);
  const expectedSet = expected.map(normalizeIdentifier);
  const missing = expected.filter((column) => !actualSet.includes(normalizeIdentifier(column)));
  const extra = actual.filter((column) => !expectedSet.includes(normalizeIdentifier(column)));
  if (missing.length || extra.length) {
    const parts = [];
    if (missing.length) parts.push(`missing ${missing.join(", ")}`);
    if (extra.length) parts.push(`extra ${extra.join(", ")}`);
    messages.push({ type: "bad", title, text: parts.join("; ") });
  }
}

function sameResult(left, right) {
  return JSON.stringify(canonicalResult(left)) === JSON.stringify(canonicalResult(right));
}

function canonicalResult(rows) {
  return rows.map((row) => {
    const output = {};
    for (const [key, value] of Object.entries(row)) {
      output[normalizeIdentifier(key)] = value;
    }
    return output;
  });
}

function renderTable(rows) {
  if (!rows.length) return "<div class=\"empty-state\">No rows.</div>";
  const columns = Object.keys(rows[0]);
  return `<table><thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${rows
    .map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(row[column])}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[char]);
}

function renderChallenge() {
  const challenge = challenges[state.current];
  state.attempts = 0;
  el.difficulty.textContent = challenge.difficulty;
  el.prompt.textContent = challenge.prompt;
  el.sqlInput.value = "";
  el.feedback.className = "feedback empty-state";
  el.feedback.textContent = "Write a query and run it to get targeted feedback.";
  el.actualResult.className = "result-box empty-state";
  el.actualResult.textContent = "No result yet.";
  el.expectedResult.className = "result-box";
  el.expectedResult.innerHTML = renderTable(evaluateQuery(challenge.expected));
  el.attemptBadge.textContent = "Attempt 1";

  const tableNames = challenge.tables || [challenge.table];
  el.schemaArea.innerHTML = tableNames
    .map((name) => `<article class="table-card"><div class="table-title">${name}</div>${renderTable(BASE_TABLES[name])}</article>`)
    .join("");
  renderChallengeList();
}

function renderChallengeList() {
  el.challengeList.innerHTML = challenges
    .map((challenge, index) => {
      const active = index === state.current ? "active" : "";
      const done = state.solved.has(index) ? "done" : "";
      return `<button class="challenge-button ${active} ${done}" type="button" data-index="${index}">
        <span>${challenge.id}</span><span>${escapeHtml(challenge.title)}</span><span class="mini-level">${challenge.difficulty}</span>
      </button>`;
    })
    .join("");
}

function renderStats() {
  el.score.textContent = state.score;
  el.streak.textContent = state.streak;
  el.doneCount.textContent = `${state.solved.size}/100`;
  const totalAttempts = Object.values(state.skill).reduce((sum, item) => sum + item.total, 0);
  const totalCorrect = Object.values(state.skill).reduce((sum, item) => sum + item.correct, 0);
  el.accuracy.textContent = `${totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0}%`;
  el.skillMap.innerHTML = SKILLS.map((skill) => {
    const item = state.skill[skill];
    const pct = item.total ? Math.round((item.correct / item.total) * 100) : 0;
    return `<div class="skill-row"><span>${skill}</span><div class="bar"><span style="width:${pct}%"></span></div><span>${pct}%</span></div>`;
  }).join("");
}

function runCurrentQuery() {
  const challenge = challenges[state.current];
  state.attempts += 1;
  el.attemptBadge.textContent = `Attempt ${state.attempts + 1}`;

  let parsed = parseSql(el.sqlInput.value);
  let actual = [];
  let messages = [];
  let resultMatches = false;

  try {
    if (!parsed.error) actual = evaluateQuery(parsed);
    const expected = evaluateQuery(challenge.expected);
    resultMatches = sameResult(actual, expected);
    messages = diagnose(parsed, challenge.expected, resultMatches);
  } catch (error) {
    messages = [{ type: "bad", title: "Runtime", text: error.message }];
  }

  el.actualResult.className = "result-box";
  el.actualResult.innerHTML = parsed.error ? "<div class=\"empty-state\">Query could not run.</div>" : renderTable(actual);
  el.feedback.className = "feedback";
  el.feedback.innerHTML = messages.map((message) => `<div class="feedback-item ${message.type}"><strong>${message.title}</strong>${escapeHtml(message.text)}</div>`).join("");

  state.skill[challenge.skill].total += 1;
  if (resultMatches) {
    state.skill[challenge.skill].correct += 1;
    if (!state.solved.has(state.current)) {
      state.score += Math.max(2, 12 - state.attempts * 2);
      state.solved.add(state.current);
    }
    state.streak += 1;
  } else {
    state.streak = 0;
  }
  renderStats();
  renderChallengeList();
  saveProgress();
}

function showHint() {
  const challenge = challenges[state.current];
  const parts = [`Start with SELECT ${challenge.expected.select.join(", ")} FROM ${challenge.expected.from}`];
  if (challenge.expected.join) parts.push(`JOIN ${challenge.expected.join.table} ON ${challenge.expected.join.left} = ${challenge.expected.join.right}`);
  if (challenge.expected.where) parts.push(`WHERE ${challenge.expected.where.column} ${challenge.expected.where.operator} ${JSON.stringify(challenge.expected.where.value)}`);
  if (challenge.expected.groupBy) parts.push(`GROUP BY ${challenge.expected.groupBy.join(", ")}`);
  if (challenge.expected.orderBy) parts.push(`ORDER BY ${challenge.expected.orderBy.column} ${challenge.expected.orderBy.direction}`);
  el.feedback.className = "feedback";
  el.feedback.innerHTML = `<div class="feedback-item warn"><strong>Hint</strong>${escapeHtml(parts.join(" "))}</div>`;
}

function showAnswer() {
  const challenge = challenges[state.current];
  el.feedback.className = "feedback";
  el.feedback.innerHTML = `<div class="feedback-item warn"><strong>Answer</strong><div class="answer-code">${escapeHtml(challenge.answer)}</div></div>`;
}

function move(delta) {
  state.current = (state.current + delta + challenges.length) % challenges.length;
  renderChallenge();
  saveProgress();
}

el.runBtn.addEventListener("click", runCurrentQuery);
el.hintBtn.addEventListener("click", showHint);
el.answerBtn.addEventListener("click", showAnswer);
el.prevBtn.addEventListener("click", () => move(-1));
el.nextBtn.addEventListener("click", () => move(1));
el.loginBtn.addEventListener("click", signIn);
el.signupBtn.addEventListener("click", signUp);
el.logoutBtn.addEventListener("click", signOut);
el.authPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") signIn();
});
el.challengeList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (!button) return;
  state.current = Number(button.dataset.index);
  renderChallenge();
  saveProgress();
});
el.sqlInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") runCurrentQuery();
});

async function startApp() {
  if (supabaseClient) {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session?.user) {
      await loadCloudProgress(data.session.user);
      return;
    }
    el.profileStatus.textContent = "Log in or sign up to sync progress across devices.";
  } else {
    const lastProfile = localStorage.getItem(LAST_PROFILE_KEY);
    if (lastProfile) {
      loadProfile(lastProfile);
      return;
    }
    el.profileStatus.textContent = "Paste your Supabase anon key to enable cloud accounts.";
  }
  renderStats();
  renderChallenge();
}

startApp();
