# CF+ | LeetCodify Codeforces (Safari)

A sleek, modern LeetCode-style userscript built specifically for **Safari** (using the [Userscripts](https://github.com/quoid/userscripts) extension) that completely transforms the Codeforces experience:
- ⚡ **Split-View LeetCode IDE** for all problem pages
- 📊 **Auto-Sorted Problemset by Rating (Low to High)** with saved sorting preferences
- 📚 **Integrated TLE CP-31 Sheet** (279 curated practice problems from 800 to 1600 rating)
- ☀️ **Preserves Native Light Mode** on all standard Codeforces pages

---

## ✨ Features

### 1. 📊 Auto-Sorted Problemset by Rating (Low to High)
- When you visit `https://codeforces.com/problemset`, it automatically sorts problems by **Difficulty: Low to High** (`order=BY_RATING_ASC`).
- **Saved Sorting Preference**: A Quick Sort Bar is injected right above the problem table:
  - `⭐ Rating: Low → High`
  - `⭐ Rating: High → Low`
  - `🔥 Most Solved`
  - `🆔 Default (ID)`
  - `☑ Save as Default`: Automatically remembers your preferred sort order across sessions!

### 2. 📚 Integrated TLE CP-31 Practice Sheet
- Access the famous **CP-31 Sheet** (curated by Priyansh Agarwal / TLE Eliminators) directly on Codeforces!
- Accessible from:
  - The top navbar in LeetCode mode (`📚 CP-31`)
  - The Codeforces main menu header (`📚 CP-31`)
  - The Problemset quick bar (`📚 CP-31 Sheet`)
  - The bottom-right floating dock
- **Features inside the CP-31 Modal**:
  - All 9 rating tiers: **800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600** (31 problems per rating = 279 curated problems).
  - Search filter by title or code (e.g. `1903A`).
  - Interactive checkboxes to track solved problems (persisted in local storage).
  - **🔄 Sync CF Solves**: Automatically fetches your Codeforces submission history to check off every problem you've solved!
  - Single-click **Solve ↗** button that opens the problem directly in LeetCode mode.

### 3. 🖥️ LeetCode-Style Split Workspace (Problem Pages)
- **Left Pane**: Problem description, math equations (MathJax v2 & v3 support), sample test cases with single-click "Copy" buttons, and a **Submissions** tab showing past submissions via Codeforces API.
- **Draggable Divider**: Adjust the split ratio smoothly; double-click to reset to 50/50.
- **Spoiler Protection**: Problem tags and ratings are hidden by default with an interactive reveal toggle.
- **Problem Navigation**: `◀` and `▶` buttons in the navbar to cycle through contest problems.

### 4. 💻 Pro Code Editor
- Powered by **Ace Editor** with themes: **Monokai**, **Dracula**, **One Dark**, **Tomorrow Night**, and **Light (Chrome)**.
- Font size changer (`A-` / `A+`), tab indentation (4 spaces), bracket auto-closing, and line numbers.
- **Auto-Draft Persistence**: Automatically saves your written code locally per problem and per language.

### 5. 📋 Competitive Programming Boilerplates
- Battle-tested fast I/O multi-testcase templates for:
  - **C++ (C++20 / C++23)**: Fast I/O, `bits/stdc++.h`, `t` testcases loop.
  - **Python 3 / PyPy 3**: Fast `sys.stdin.readline` and structured solver.
  - **Java (Java 21 / 11)**: Fast I/O `BufferedReader` & `StringTokenizer`.
  - **Rust (2021)**: Buffered I/O template.
  - **Go (1.22)**: Buffered scanner/writer template.
- **In-App Template Editor**: Customize and save your default boilerplate for any language via the **⚙ Settings** modal.

### 6. 🚀 In-Page Submission & Live Verdict Tracking
- Click **Submit** or press `Cmd + Enter` (`⌘ ↵`) to submit directly from the problem page without reloading.
- Animated live evaluation tracker:
  - `🟡 Submitting Solution...`
  - `⏳ In Queue...`
  - `🔄 Running on test 14...`
  - `🎉 Accepted (46 ms, 14.2 MB)` or `✗ Wrong Answer on test 4`

### 7. 🧪 Sample Testcase Runner & Custom Test Console
- Interactive tabs for sample testcases (`Case 1`, `Case 2`, ...) plus `+ Custom Case`.
- Click **▶ Run Code** (`Cmd + '`) to run code against Codeforces' `/data/customtest` engine, reporting actual vs. expected output diffs, runtime, and compiler error logs.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd + Enter` (`⌘ ↵`) | **Submit Solution** to Codeforces |
| `Cmd + '` (`⌘ '`) | **Run Code** on active sample testcase |
| `Double Click Splitter` | Reset workspace split to 50% / 50% |

*(On Windows / Linux, use `Ctrl` in place of `Cmd`)*

---

## 🚀 Installation Guide for Safari

### Step 1: Install the Userscripts Extension for Safari
1. Open the **Mac App Store** and install [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) (by Justin Wasack).
2. Open **Safari** $\to$ **Settings** (or `Cmd + ,`) $\to$ **Extensions**.
3. Enable the checkbox next to **Userscripts**.
4. In the Safari toolbar, click the **Userscripts** extension icon and click **"Always Allow on Every Website"** (or allow on `codeforces.com`).

### Step 2: Add the CF+ Script
1. Click the **Userscripts** icon in the Safari toolbar.
2. Click the **"+"** (plus) icon to create a new script.
3. Replace the default template by copying the entire content of [`cf-leetcode.user.js`](file:///Users/aaradhya/Documents/Programming/cf+/cf-leetcode.user.js).
4. Click **Save** (or press `Cmd + S`).

### Step 3: Enjoy Codeforces!
1. Navigate to [Codeforces](https://codeforces.com) — Dark mode will activate automatically!
2. Go to the [Problemset](https://codeforces.com/problemset) — It will be sorted by rating low to high!
3. Open any problem (e.g., [4A Watermelon](https://codeforces.com/problemset/problem/4/A)) — LeetCode split view will launch!
4. Click **📚 CP-31** in the top menu or navbar to explore the curated 279-problem practice ladder!

---

## 📄 License

MIT License. Crafted for competitive programmers.
