const fs = require('fs');

const compactJson = fs.readFileSync('./cp31_compact.json', 'utf8');

const scriptContent = `// ==UserScript==
// @name         CF+ | LeetCodify Codeforces (Safari)
// @namespace    https://github.com/aaradhya/cf-plus
// @version      2.0.0
// @description  Full LeetCode-style split-view IDE, Site-Wide Dark Mode, Problemset Rating Sorting, and CP-31 Sheet for Codeforces on Safari.
// @author       Aaradhya
// @match        https://codeforces.com/*
// @match        http://codeforces.com/*
// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  'use strict';

  if (window.__CF_LEETCODIFY_INITIALIZED__) return;
  window.__CF_LEETCODIFY_INITIALIZED__ = true;

  /* ==========================================================================
     1. STORAGE & CONFIGURATION
     ========================================================================== */

  const STORAGE_KEYS = {
    ENABLED: 'cf_plus_enabled',
    PROBLEMSET_SORT: 'cf_plus_problemset_sort',
    CP31_SOLVED: 'cf_plus_cp31_solved',
    SPLIT_RATIO: 'cf_plus_split_ratio',
    THEME: 'cf_plus_theme',
    LANGUAGE: 'cf_plus_lang',
    FONT_SIZE: 'cf_plus_font_size',
    SHOW_TAGS: 'cf_plus_show_tags',
    TEMPLATES: 'cf_plus_templates',
    DRAFTS: 'cf_plus_drafts_'
  };

  function getStorage(key, defaultVal) {
    try {
      if (typeof GM_getValue !== 'undefined') {
        const val = GM_getValue(key);
        return val !== undefined && val !== null ? val : defaultVal;
      }
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }

  function setStorage(key, val) {
    try {
      if (typeof GM_setValue !== 'undefined') {
        GM_setValue(key, val);
        return;
      }
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('[CF+] Failed to save storage:', e);
    }
  }

  /* ==========================================================================
     2. CP-31 SHEET DATA & HELPERS
     ========================================================================== */

  const CP31_RAW = ${compactJson};

  function getCP31Problems(rating) {
    const list = CP31_RAW[rating] || [];
    return list.map(([contestId, index, title, r], i) => ({
      order: i + 1,
      contestId,
      index,
      code: contestId ? \`\${contestId}\${index}\` : '',
      title,
      rating: r || rating,
      url: contestId ? \`/problemset/problem/\${contestId}/\${index}\` : \`https://codeforces.com/problemset?search=\${encodeURIComponent(title)}\`
    }));
  }

  /* ==========================================================================
     3. DEFAULT BOILERPLATE TEMPLATES & COMPILERS
     ========================================================================== */

  const DEFAULT_TEMPLATES = {
    cpp: \`#include <bits/stdc++.h>
using namespace std;

#define FAST_IO ios_base::sync_with_stdio(false); cin.tie(NULL);
#define all(x) (x).begin(), (x).end()
#define ll long long
#define nl '\\n'

void solve() {
    // Write your solution here
    
}

int main() {
    FAST_IO;
    int t = 1;
    cin >> t;
    while (t--) {
        solve();
    }
    return 0;
}
\`,
    python: \`import sys

def solve():
    input = sys.stdin.readline
    # Write your solution here
    pass

def main():
    try:
        t_line = sys.stdin.readline()
        if not t_line:
            return
        t = int(t_line.strip())
    except:
        t = 1
    for _ in range(t):
        solve()

if __name__ == '__main__':
    main()
\`,
    java: \`import java.io.*;
import java.util.*;

public class Main {
    static FastReader in = new FastReader();
    static PrintWriter out = new PrintWriter(System.out);

    static void solve() {
        // Write your solution here
        
    }

    public static void main(String[] args) {
        int t = 1;
        if (in.hasNext()) {
            t = in.nextInt();
        }
        while (t-- > 0) {
            solve();
        }
        out.flush();
    }

    static class FastReader {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st;

        String next() {
            while (st == null || !st.hasMoreElements()) {
                try {
                    String line = br.readLine();
                    if (line == null) return null;
                    st = new StringTokenizer(line);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            return st.nextToken();
        }

        boolean hasNext() {
            while (st == null || !st.hasMoreElements()) {
                try {
                    String line = br.readLine();
                    if (line == null) return false;
                    st = new StringTokenizer(line);
                } catch (IOException e) {
                    return false;
                }
            }
            return true;
        }

        int nextInt() { return Integer.parseInt(next()); }
        long nextLong() { return Long.parseLong(next()); }
        double nextDouble() { return Double.parseDouble(next()); }
        String nextLine() {
            String str = "";
            try { str = br.readLine(); } catch (IOException e) { e.printStackTrace(); }
            return str;
        }
    }
}
\`,
    rust: \`use std::io::{self, BufRead};

fn solve<R: BufRead>(reader: &mut R) {
    // Write your solution here
}

fn main() {
    let stdin = io::stdin();
    let mut reader = stdin.lock();
    solve(&mut reader);
}
\`,
    golang: \`package main

import (
    "bufio"
    "fmt"
    "os"
)

func solve(in *bufio.Reader, out *bufio.Writer) {
    // Write your solution here
}

func main() {
    in := bufio.NewReader(os.Stdin)
    out := bufio.NewWriter(os.Stdout)
    defer out.Flush()

    var t int = 1
    if _, err := fmt.Fscan(in, &t); err == nil {
        for i := 0; i < t; i++ {
            solve(in, out)
        }
    }
}
\`
  };

  const LANGUAGES = [
    { id: '89', key: 'cpp', name: 'GNU G++20 11.2.0 (64 bit)', aceMode: 'c_cpp', defaultTemplate: 'cpp' },
    { id: '91', key: 'cpp', name: 'GNU G++23 14.2 (64 bit)', aceMode: 'c_cpp', defaultTemplate: 'cpp' },
    { id: '54', key: 'cpp', name: 'GNU G++17 7.3.0', aceMode: 'c_cpp', defaultTemplate: 'cpp' },
    { id: '31', key: 'python', name: 'Python 3.8.10', aceMode: 'python', defaultTemplate: 'python' },
    { id: '70', key: 'python', name: 'PyPy 3.10 (64 bit)', aceMode: 'python', defaultTemplate: 'python' },
    { id: '87', key: 'java', name: 'Java 21 (64 bit)', aceMode: 'java', defaultTemplate: 'java' },
    { id: '60', key: 'java', name: 'Java 11 (64 bit)', aceMode: 'java', defaultTemplate: 'java' },
    { id: '75', key: 'rust', name: 'Rust 2021 (1.75.0)', aceMode: 'rust', defaultTemplate: 'rust' },
    { id: '32', key: 'golang', name: 'Go 1.22.2', aceMode: 'golang', defaultTemplate: 'golang' }
  ];

  /* ==========================================================================
     4. URL ROUTING & DETECTION
     ========================================================================== */

  function isProblemPage() {
    const pathname = window.location.pathname;
    return Boolean(
      pathname.match(/\\/contest\\/\\d+\\/problem\\/[A-Za-z0-9]+/i) ||
      pathname.match(/\\/problemset\\/problem\\/\\d+\\/[A-Za-z0-9]+/i) ||
      pathname.match(/\\/gym\\/\\d+\\/problem\\/[A-Za-z0-9]+/i) ||
      pathname.match(/\\/group\\/[^\\/]+\\/contest\\/\\d+\\/problem\\/[A-Za-z0-9]+/i)
    );
  }

  function isProblemsetPage() {
    const pathname = window.location.pathname;
    return (pathname === '/problemset' || pathname.startsWith('/problemset/page/')) &&
           !pathname.includes('/problemset/problem/') &&
           !pathname.includes('/problemset/submit') &&
           !pathname.includes('/problemset/customtest');
  }

  function parseProblemUrl() {
    const pathname = window.location.pathname;

    let match = pathname.match(/\\/group\\/([^\\/]+)\\/contest\\/(\\d+)\\/problem\\/([A-Za-z0-9]+)/i);
    if (match) {
      return { groupId: match[1], contestId: match[2], problemIndex: match[3].toUpperCase(), type: 'group' };
    }

    match = pathname.match(/\\/contest\\/(\\d+)\\/problem\\/([A-Za-z0-9]+)/i);
    if (match) {
      return { contestId: match[1], problemIndex: match[2].toUpperCase(), type: 'contest' };
    }

    match = pathname.match(/\\/problemset\\/problem\\/(\\d+)\\/([A-Za-z0-9]+)/i);
    if (match) {
      return { contestId: match[1], problemIndex: match[2].toUpperCase(), type: 'problemset' };
    }

    match = pathname.match(/\\/gym\\/(\\d+)\\/problem\\/([A-Za-z0-9]+)/i);
    if (match) {
      return { contestId: match[1], problemIndex: match[2].toUpperCase(), type: 'gym' };
    }

    return null;
  }

  function getProblemUniqueKey(info) {
    if (!info) return 'unknown';
    return \`\${info.contestId}_\${info.problemIndex}\`;
  }

  function getCsrfToken() {
    const meta = document.querySelector('meta[name="X-Csrf-Token"]');
    if (meta && meta.content) return meta.content;

    if (window.Codeforces && typeof window.Codeforces.getCsrfToken === 'function') {
      return window.Codeforces.getCsrfToken();
    }

    const input = document.querySelector('input[name="csrf_token"]');
    if (input && input.value) return input.value;

    const csrfSpan = document.querySelector('.csrf-token');
    if (csrfSpan && csrfSpan.getAttribute('data-csrf')) {
      return csrfSpan.getAttribute('data-csrf');
    }

    return '';
  }

  function getLoggedInHandle() {
    const profileLink = document.querySelector('a[href^="/profile/"]');
    if (profileLink) {
      return profileLink.textContent.trim();
    }
    return null;
  }

  function parseSampleTestCases() {
    const cases = [];
    const sampleTests = document.querySelectorAll('.sample-test');

    sampleTests.forEach((st) => {
      const inputs = st.querySelectorAll('.input pre');
      const outputs = st.querySelectorAll('.output pre');

      for (let i = 0; i < Math.min(inputs.length, outputs.length); i++) {
        const clean = (el) => {
          let text = '';
          el.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              text += node.textContent;
            } else if (node.nodeName === 'DIV' || node.nodeName === 'BR') {
              text += (node.textContent || '') + '\\n';
            } else {
              text += node.textContent || '';
            }
          });
          return text.trim();
        };

        cases.push({
          input: clean(inputs[i]),
          output: clean(outputs[i])
        });
      }
    });

    return cases;
  }

  /* ==========================================================================
     5. STYLESHEET INJECTION (LeetCode + Codeforces Dark Mode)
     ========================================================================== */

  function injectStyles() {
    const css = \`
      :root {
        --cfl-bg-main: #141414;
        --cfl-bg-panel: #1e1e1e;
        --cfl-bg-header: #262626;
        --cfl-bg-hover: #303030;
        --cfl-bg-active: #3a3a3a;
        --cfl-border: #333333;
        --cfl-border-light: #444444;
        --cfl-text-primary: #eff1f6;
        --cfl-text-secondary: #9ca3af;
        --cfl-text-muted: #6b7280;
        --cfl-accent-green: #2cbb5d;
        --cfl-accent-green-hover: #22994a;
        --cfl-accent-blue: #3b82f6;
        --cfl-accent-yellow: #f59e0b;
        --cfl-accent-red: #ef4444;
        --cfl-font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Monaco, Consolas, monospace;
        --cfl-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }

      /* -------------------------------------------------------------
         PROBLEMSET QUICK SORT BAR (Native Light Mode)
         ------------------------------------------------------------- */
      #cfl-problemset-bar {
        background: #ffffff;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 10px 16px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        font-family: var(--cfl-font-sans);
        color: #1f2937;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
      .cfl-sort-group {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .cfl-sort-label {
        font-size: 13px;
        font-weight: 700;
        color: #4b5563;
      }
      .cfl-sort-pill {
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
        border-radius: 16px;
        padding: 4px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .cfl-sort-pill:hover {
        background: #e5e7eb;
        color: #111827;
      }
      .cfl-sort-pill.active {
        background: #eff6ff;
        color: #1d4ed8;
        border-color: #93c5fd;
        font-weight: 700;
      }
      .cfl-sort-pref {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #4b5563;
      }
      .cfl-btn-cp31 {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #ffffff !important;
        border: none;
        border-radius: 16px;
        padding: 5px 14px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .cfl-btn-cp31:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
      }

      /* -------------------------------------------------------------
         LEETCODE INTERFACE & SPLIT VIEW
         ------------------------------------------------------------- */
      body.cf-leetcode-active {
        overflow: hidden !important;
        background-color: var(--cfl-bg-main) !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      body.cf-leetcode-active > #body,
      body.cf-leetcode-active > #header,
      body.cf-leetcode-active > #footer,
      body.cf-leetcode-active > .header {
        display: none !important;
      }

      /* Floating Action Bar (Bottom Right) */
      #cfl-floating-dock {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cfl-dock-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        background: #ffffff;
        color: #1f2937;
        font-family: var(--cfl-font-sans);
        font-size: 12.5px;
        font-weight: 600;
        border: 1px solid #d1d5db;
        border-radius: 24px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .cfl-dock-btn:hover {
        transform: translateY(-2px);
        border-color: #9ca3af;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
      }
      .cfl-dock-btn-primary {
        background: linear-gradient(135deg, #2563eb, #7c3aed);
        color: #ffffff;
        border: none;
      }
      .cfl-dock-btn-primary:hover {
        box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45);
      }
      .cfl-dock-btn-cp31 {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #ffffff;
        border: none;
      }
      .cfl-dock-btn-cp31:hover {
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
      }

      /* LeetCode App Container */
      #cf-leetcode-app {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 999990;
        display: flex;
        flex-direction: column;
        background-color: var(--cfl-bg-main);
        color: var(--cfl-text-primary);
        font-family: var(--cfl-font-sans);
        box-sizing: border-box;
      }

      #cfl-navbar {
        height: 48px;
        background-color: var(--cfl-bg-header);
        border-bottom: 1px solid var(--cfl-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        user-select: none;
        box-sizing: border-box;
      }

      .cfl-nav-section {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .cfl-logo {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 800;
        font-size: 16px;
        letter-spacing: -0.5px;
        color: #ffa116;
        cursor: pointer;
        text-decoration: none;
      }
      .cfl-logo span { color: #fff; }

      .cfl-problem-title-nav {
        font-size: 14px;
        font-weight: 600;
        color: var(--cfl-text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .cfl-nav-btn {
        background: transparent;
        border: 1px solid var(--cfl-border);
        color: var(--cfl-text-secondary);
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .cfl-nav-btn:hover {
        background-color: var(--cfl-bg-hover);
        color: #fff;
        border-color: var(--cfl-border-light);
      }

      .cfl-badge {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
      }
      .cfl-badge-rating {
        background-color: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
        border: 1px solid rgba(59, 130, 246, 0.3);
      }
      .cfl-badge-rating.expert {
        background-color: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
      }
      .cfl-badge-rating.master {
        background-color: rgba(239, 68, 68, 0.2);
        color: #f87171;
      }

      .cfl-action-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .cfl-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.15s ease;
      }
      .cfl-btn-run {
        background-color: rgba(255, 255, 255, 0.08);
        color: var(--cfl-text-primary);
        border: 1px solid var(--cfl-border);
      }
      .cfl-btn-run:hover {
        background-color: rgba(255, 255, 255, 0.14);
        border-color: var(--cfl-border-light);
      }
      .cfl-btn-submit {
        background-color: var(--cfl-accent-green);
        color: #ffffff;
      }
      .cfl-btn-submit:hover {
        background-color: var(--cfl-accent-green-hover);
        box-shadow: 0 2px 8px rgba(44, 187, 93, 0.4);
      }
      .cfl-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      #cfl-workspace {
        flex: 1;
        display: flex;
        overflow: hidden;
        position: relative;
        background-color: var(--cfl-bg-main);
      }

      #cfl-left-pane {
        width: 50%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: var(--cfl-bg-panel);
        overflow: hidden;
        border-right: 1px solid var(--cfl-border);
      }

      .cfl-pane-tabs {
        height: 40px;
        background-color: var(--cfl-bg-header);
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--cfl-border);
        padding: 0 12px;
        gap: 4px;
        user-select: none;
      }

      .cfl-tab-btn {
        padding: 6px 12px;
        font-size: 13px;
        font-weight: 500;
        color: var(--cfl-text-secondary);
        background: transparent;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
      }
      .cfl-tab-btn:hover {
        color: var(--cfl-text-primary);
        background-color: var(--cfl-bg-hover);
      }
      .cfl-tab-btn.active {
        color: #fff;
        background-color: var(--cfl-bg-active);
        font-weight: 600;
      }

      .cfl-pane-content {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        box-sizing: border-box;
      }

      .cfl-problem-header {
        margin-bottom: 20px;
        border-bottom: 1px solid var(--cfl-border);
        padding-bottom: 16px;
      }
      .cfl-problem-title {
        font-size: 22px;
        font-weight: 700;
        color: #fff;
        margin: 0 0 12px 0;
      }
      .cfl-meta-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        font-size: 12px;
        color: var(--cfl-text-secondary);
      }
      .cfl-meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
        background: rgba(255, 255, 255, 0.05);
        padding: 4px 8px;
        border-radius: 4px;
      }

      .cfl-statement-body {
        line-height: 1.7;
        font-size: 14.5px;
        color: #d1d5db;
      }
      .cfl-statement-body p { margin: 12px 0; }
      .cfl-statement-body ul, .cfl-statement-body ol {
        padding-left: 24px;
        margin: 12px 0;
      }
      .cfl-statement-body li { margin: 6px 0; }
      .cfl-statement-body img {
        max-width: 100%;
        height: auto;
        border-radius: 6px;
        display: block;
        margin: 16px auto;
      }
      .cfl-statement-body table {
        border-collapse: collapse;
        margin: 16px 0;
        width: 100%;
      }
      .cfl-statement-body th, .cfl-statement-body td {
        border: 1px solid var(--cfl-border);
        padding: 8px 12px;
      }
      .cfl-section-title {
        font-size: 16px;
        font-weight: 700;
        color: #fff;
        margin: 24px 0 10px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .cfl-sample-box {
        background: #181818;
        border: 1px solid var(--cfl-border);
        border-radius: 8px;
        margin: 16px 0;
        overflow: hidden;
      }
      .cfl-sample-header {
        background: var(--cfl-bg-header);
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        color: var(--cfl-text-secondary);
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--cfl-border);
      }
      .cfl-copy-btn {
        background: transparent;
        border: 1px solid var(--cfl-border);
        color: var(--cfl-text-secondary);
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        cursor: pointer;
      }
      .cfl-copy-btn:hover {
        background: var(--cfl-bg-hover);
        color: #fff;
      }
      .cfl-sample-pre {
        margin: 0;
        padding: 12px;
        font-family: var(--cfl-font-mono);
        font-size: 13px;
        white-space: pre-wrap;
        word-break: break-all;
        color: #e5e7eb;
        line-height: 1.45;
      }

      .cfl-tags-container {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid var(--cfl-border);
      }
      .cfl-tag-chip {
        display: inline-block;
        background: rgba(255, 255, 255, 0.06);
        color: var(--cfl-text-secondary);
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 12px;
        margin: 4px 4px 4px 0;
      }

      #cfl-resizer {
        width: 6px;
        background-color: var(--cfl-bg-main);
        cursor: col-resize;
        transition: background-color 0.2s ease;
        position: relative;
        z-index: 10;
      }
      #cfl-resizer:hover, #cfl-resizer.dragging {
        background-color: var(--cfl-accent-blue);
      }

      #cfl-right-pane {
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: var(--cfl-bg-panel);
        overflow: hidden;
      }

      .cfl-editor-toolbar {
        height: 40px;
        background-color: var(--cfl-bg-header);
        border-bottom: 1px solid var(--cfl-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        user-select: none;
      }

      .cfl-toolbar-left, .cfl-toolbar-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .cfl-select {
        background-color: var(--cfl-bg-panel);
        color: var(--cfl-text-primary);
        border: 1px solid var(--cfl-border);
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        outline: none;
        cursor: pointer;
      }
      .cfl-select:hover {
        border-color: var(--cfl-border-light);
      }

      .cfl-save-indicator {
        font-size: 11px;
        color: var(--cfl-accent-green);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      #cfl-editor-container {
        flex: 1;
        position: relative;
        overflow: hidden;
        min-height: 180px;
      }
      #cfl-ace-editor {
        width: 100%;
        height: 100%;
        font-size: 14px;
        line-height: 1.5;
        font-family: var(--cfl-font-mono);
      }

      #cfl-console-drawer {
        height: 240px;
        background-color: #181818;
        border-top: 1px solid var(--cfl-border);
        display: flex;
        flex-direction: column;
        transition: height 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
      }
      #cfl-console-drawer.collapsed {
        height: 36px !important;
      }

      .cfl-console-resizer {
        height: 5px;
        position: absolute;
        top: -3px;
        left: 0;
        right: 0;
        cursor: row-resize;
        z-index: 20;
      }
      .cfl-console-resizer:hover {
        background: var(--cfl-accent-blue);
      }

      .cfl-console-header {
        height: 36px;
        background-color: var(--cfl-bg-header);
        border-bottom: 1px solid var(--cfl-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        user-select: none;
      }

      .cfl-console-tabs {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .cfl-console-body {
        flex: 1;
        overflow-y: auto;
        padding: 12px 16px;
        box-sizing: border-box;
      }

      .cfl-case-pill-bar {
        display: flex;
        gap: 6px;
        margin-bottom: 12px;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .cfl-case-pill {
        background: var(--cfl-bg-hover);
        color: var(--cfl-text-secondary);
        border: 1px solid var(--cfl-border);
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      }
      .cfl-case-pill.active {
        background: rgba(59, 130, 246, 0.2);
        color: #60a5fa;
        border-color: rgba(59, 130, 246, 0.4);
      }

      .cfl-test-field-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--cfl-text-secondary);
        text-transform: uppercase;
        margin-bottom: 4px;
        margin-top: 8px;
      }

      .cfl-test-textarea {
        width: 100%;
        background: #111111;
        border: 1px solid var(--cfl-border);
        border-radius: 6px;
        color: #fff;
        font-family: var(--cfl-font-mono);
        font-size: 12.5px;
        padding: 8px;
        box-sizing: border-box;
        resize: vertical;
        outline: none;
      }
      .cfl-test-textarea:focus {
        border-color: var(--cfl-accent-blue);
      }

      .cfl-verdict-card {
        padding: 16px;
        border-radius: 8px;
        background: #111111;
        border: 1px solid var(--cfl-border);
        margin-bottom: 12px;
      }
      .cfl-verdict-title {
        font-size: 18px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .cfl-verdict-accepted { color: var(--cfl-accent-green); }
      .cfl-verdict-wrong { color: var(--cfl-accent-red); }
      .cfl-verdict-testing { color: var(--cfl-accent-yellow); }

      .cfl-subs-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .cfl-subs-table th, .cfl-subs-table td {
        padding: 10px 12px;
        text-align: left;
        border-bottom: 1px solid var(--cfl-border);
      }
      .cfl-subs-table th {
        color: var(--cfl-text-secondary);
        font-weight: 600;
        font-size: 12px;
      }
      .cfl-subs-table tr:hover {
        background: rgba(255, 255, 255, 0.02);
      }

      /* -------------------------------------------------------------
         CP-31 SHEET & SETTINGS MODALS
         ------------------------------------------------------------- */
      .cfl-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(5px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--cfl-font-sans);
      }
      .cfl-modal {
        background: var(--cfl-bg-panel);
        border: 1px solid var(--cfl-border-light);
        border-radius: 12px;
        width: 760px;
        max-width: 92vw;
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 30px -5px rgba(0, 0, 0, 0.6);
        color: var(--cfl-text-primary);
      }
      .cfl-modal-header {
        padding: 16px 20px;
        background: var(--cfl-bg-header);
        border-bottom: 1px solid var(--cfl-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        font-weight: 700;
      }
      .cfl-modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }
      .cfl-modal-footer {
        padding: 12px 20px;
        background: var(--cfl-bg-header);
        border-top: 1px solid var(--cfl-border);
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 12px;
      }

      /* CP-31 Sheet specific */
      .cfl-cp31-rating-bar {
        display: flex;
        gap: 6px;
        margin-bottom: 16px;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .cfl-cp31-rating-pill {
        background: var(--cfl-bg-hover);
        color: var(--cfl-text-secondary);
        border: 1px solid var(--cfl-border);
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .cfl-cp31-rating-pill.active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.3));
        color: #fbbf24;
        border-color: rgba(245, 158, 11, 0.6);
      }

      .cfl-cp31-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .cfl-cp31-table th, .cfl-cp31-table td {
        padding: 10px 12px;
        text-align: left;
        border-bottom: 1px solid var(--cfl-border);
      }
      .cfl-cp31-table th {
        color: var(--cfl-text-secondary);
        font-size: 11.5px;
        text-transform: uppercase;
        font-weight: 600;
      }
      .cfl-cp31-table tr:hover {
        background: rgba(255, 255, 255, 0.03);
      }
      .cfl-cp31-table tr.solved-row {
        opacity: 0.75;
      }
      .cfl-cp31-table tr.solved-row .cfl-prob-title {
        text-decoration: line-through;
        color: #9ca3af;
      }

      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.25);
      }
    \`;

    if (typeof GM_addStyle !== 'undefined') {
      GM_addStyle(css);
    } else {
      const style = document.createElement('style');
      style.id = 'cfl-custom-styles';
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  /* ==========================================================================
     6. ACE EDITOR INJECTION & BOOTSTRAP
     ========================================================================== */

  let editorInstance = null;

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = url;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  async function initAceEditor(containerEl, initialCode, mode, theme, fontSize) {
    if (!window.ace) {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/ace.js');
        await Promise.allSettled([
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/mode-c_cpp.min.js'),
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/mode-python.min.js'),
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/mode-java.min.js'),
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/mode-rust.min.js'),
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/mode-golang.min.js'),
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/theme-monokai.min.js'),
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/theme-dracula.min.js'),
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/theme-one_dark.min.js'),
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/theme-tomorrow_night.min.js'),
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/theme-chrome.min.js')
        ]);
      } catch (err) {
        console.warn('[CF+] Ace CDN blocked, using enhanced native editor:', err);
      }
    }

    if (window.ace) {
      const editor = window.ace.edit(containerEl);
      editor.setTheme(\`ace/theme/\${theme || 'monokai'}\`);
      editor.session.setMode(\`ace/mode/\${mode || 'c_cpp'}\`);
      editor.setValue(initialCode || '', -1);
      editor.setFontSize(fontSize || 14);
      editor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showPrintMargin: false,
        tabSize: 4,
        useSoftTabs: true,
        wrap: true
      });
      editorInstance = editor;
      return editor;
    }

    containerEl.innerHTML = '';
    const textarea = document.createElement('textarea');
    textarea.style.cssText = \`
      width: 100%; height: 100%; background: #141414; color: #eff1f6;
      font-family: var(--cfl-font-mono); font-size: \${fontSize || 14}px;
      padding: 16px; border: none; outline: none; box-sizing: border-box; resize: none;
      line-height: 1.5; white-space: pre; tab-size: 4;
    \`;
    textarea.value = initialCode || '';
    containerEl.appendChild(textarea);

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      } else if (e.key === '(' || e.key === '[' || e.key === '{' || e.key === '"' || e.key === "'") {
        e.preventDefault();
        const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
        const close = pairs[e.key];
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + e.key + close + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }
    });

    editorInstance = {
      getValue: () => textarea.value,
      setValue: (val) => { textarea.value = val; },
      setFontSize: (sz) => { textarea.style.fontSize = sz + 'px'; },
      setTheme: () => {},
      session: { setMode: () => {} },
      on: (evt, cb) => { if (evt === 'change') textarea.addEventListener('input', cb); },
      resize: () => {}
    };
    return editorInstance;
  }

  /* ==========================================================================
     7. SUBMISSION & VERDICT POLLING ENGINE
     ========================================================================== */

  async function submitSolution(contestId, problemIndex, programTypeId, sourceCode) {
    const csrfToken = getCsrfToken();
    if (!csrfToken) {
      throw new Error('Could not find Codeforces CSRF token. Please log in first.');
    }

    let submitUrl = \`/contest/\${contestId}/submit?csrf_token=\${csrfToken}\`;
    if (window.location.pathname.includes('/group/')) {
      const groupMatch = window.location.pathname.match(/\\/group\\/([^\\/]+)/);
      if (groupMatch) {
        submitUrl = \`/group/\${groupMatch[1]}/contest/\${contestId}/submit?csrf_token=\${csrfToken}\`;
      }
    } else if (window.location.pathname.includes('/problemset/')) {
      submitUrl = \`/problemset/submit?csrf_token=\${csrfToken}\`;
    } else if (window.location.pathname.includes('/gym/')) {
      submitUrl = \`/gym/\${contestId}/submit?csrf_token=\${csrfToken}\`;
    }

    const existingForm = document.querySelector('form.submit-form, form[action*="submit"]');
    if (existingForm && existingForm.action) {
      submitUrl = existingForm.action;
    }

    const formData = new FormData();
    formData.append('csrf_token', csrfToken);
    formData.append('action', 'submitSolutionFormSubmitted');
    formData.append('submittedProblemIndex', problemIndex);
    formData.append('submittedProblemCode', \`\${contestId}\${problemIndex}\`);
    formData.append('programTypeId', programTypeId);
    formData.append('source', sourceCode);
    formData.append('tabSize', '4');
    formData.append('sourceCodeConfirmation', 'true');
    formData.append('_tta', '594');

    const existingFtaa = document.querySelector('input[name="ftaa"]')?.value;
    const existingBfaa = document.querySelector('input[name="bfaa"]')?.value;
    if (existingFtaa) formData.append('ftaa', existingFtaa);
    if (existingBfaa) formData.append('bfaa', existingBfaa);

    const resp = await fetch(submitUrl, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!resp.ok) {
      throw new Error(\`Submission failed with HTTP status \${resp.status}\`);
    }

    const text = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const errorEl = doc.querySelector('.error.for__source, .error.for__submittedProblemIndex, .error.for__programTypeId, .error.for__submittedProblemCode');
    if (errorEl && errorEl.textContent.trim()) {
      throw new Error(errorEl.textContent.trim());
    }

    return true;
  }

  async function pollSubmissionVerdict(handle, contestId, problemIndex, lastKnownId, onProgress) {
    let attempts = 0;
    const maxAttempts = 65;

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
          clearInterval(interval);
          reject(new Error('Verdict polling timed out. Please check the Submissions tab.'));
          return;
        }

        try {
          const res = await fetch(\`https://codeforces.com/api/user.status?handle=\${encodeURIComponent(handle)}&from=1&count=5\`);
          if (!res.ok) return;
          const data = await res.json();
          if (data.status !== 'OK' || !data.result || data.result.length === 0) return;

          const sub = data.result.find((s) => {
            const p = s.problem;
            const matchProb = p && (String(s.contestId) === String(contestId) || String(p.contestId) === String(contestId)) &&
                              String(p.index).toUpperCase() === String(problemIndex).toUpperCase();
            return matchProb && (lastKnownId ? s.id > lastKnownId : true);
          });

          if (!sub) return;

          const verdict = sub.verdict;
          const passedTests = sub.passedTestCount || 0;

          if (!verdict || verdict === 'TESTING') {
            onProgress({
              status: 'testing',
              message: \`Running on test \${passedTests + 1}...\`,
              passedTests: passedTests,
              submissionId: sub.id
            });
          } else {
            clearInterval(interval);
            resolve({
              verdict: verdict,
              time: sub.timeConsumedMillis,
              memory: sub.memoryConsumedBytes,
              passedTests: passedTests,
              submissionId: sub.id,
              lang: sub.programmingLanguage
            });
          }
        } catch (err) {
          console.warn('[CF+] Polling error:', err);
        }
      }, 1200);
    });
  }

  /* ==========================================================================
     8. CUSTOM TEST / RUN CODE ENGINE (/data/customtest)
     ========================================================================== */

  async function runCustomTest(programTypeId, sourceCode, inputData) {
    const csrfToken = getCsrfToken();
    if (!csrfToken) {
      throw new Error('CSRF token missing. Please log in.');
    }

    const data = new FormData();
    data.append('csrf_token', csrfToken);
    data.append('source', sourceCode);
    data.append('sourceCode', sourceCode);
    data.append('tabSize', '4');
    data.append('programTypeId', programTypeId);
    data.append('input', inputData || '');
    data.append('output', '');
    data.append('communityCode', '');
    data.append('action', 'submitSourceCode');

    const submitResp = await fetch('/data/customtest', {
      method: 'POST',
      body: data,
      headers: { 'X-Csrf-Token': csrfToken },
      credentials: 'include'
    });

    if (!submitResp.ok) {
      throw new Error(\`Custom test failed: HTTP \${submitResp.status}\`);
    }

    const submitJson = await submitResp.json();
    const customTestSubmitId = submitJson.customTestSubmitId;
    if (!customTestSubmitId) {
      throw new Error('Did not receive custom test ID from Codeforces');
    }

    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 650));

      const pollData = new FormData();
      pollData.append('csrf_token', csrfToken);
      pollData.append('action', 'getVerdict');
      pollData.append('customTestSubmitId', customTestSubmitId);

      const pollResp = await fetch('/data/customtest', {
        method: 'POST',
        body: pollData,
        headers: { 'X-Csrf-Token': csrfToken },
        credentials: 'include'
      });

      if (!pollResp.ok) continue;

      const pollJson = await pollResp.json();
      if (pollJson && pollJson.stat) {
        return {
          output: pollJson.output || '',
          verdict: pollJson.verdict || 'OK',
          time: pollJson.time || pollJson.timeConsumed || 0,
          memory: pollJson.memory || pollJson.memoryConsumed || 0,
          compilationError: pollJson.verdict !== 'OK' ? pollJson.output : ''
        };
      }
    }

    throw new Error('Custom test execution timed out.');
  }

  /* ==========================================================================
     9. PROBLEMSET AUTO-SORTING & TOOLBAR
     ========================================================================== */

  function handleProblemsetSorting() {
    if (!isProblemsetPage()) return;

    const savedSort = getStorage(STORAGE_KEYS.PROBLEMSET_SORT, 'BY_RATING_ASC');
    const urlParams = new URLSearchParams(window.location.search);

    // If no order specified, redirect to saved preference
    if (!urlParams.has('order') && savedSort && savedSort !== 'none') {
      urlParams.set('order', savedSort);
      window.location.replace(\`\${window.location.pathname}?\${urlParams.toString()}\`);
      return;
    }

    // Inject Problemset Bar
    const problemTable = document.querySelector('.problems, .datatable');
    if (!problemTable || document.getElementById('cfl-problemset-bar')) return;

    const currentOrder = urlParams.get('order') || 'none';

    const bar = document.createElement('div');
    bar.id = 'cfl-problemset-bar';
    bar.innerHTML = \`
      <div class="cfl-sort-group">
        <span class="cfl-sort-label">⚡ Sort:</span>
        <button class="cfl-sort-pill \${currentOrder === 'BY_RATING_ASC' ? 'active' : ''}" data-order="BY_RATING_ASC">⭐ Rating: Low → High</button>
        <button class="cfl-sort-pill \${currentOrder === 'BY_RATING_DESC' ? 'active' : ''}" data-order="BY_RATING_DESC">⭐ Rating: High → Low</button>
        <button class="cfl-sort-pill \${currentOrder === 'BY_SOLVED_DESC' ? 'active' : ''}" data-order="BY_SOLVED_DESC">🔥 Most Solved</button>
        <button class="cfl-sort-pill \${currentOrder === 'none' ? 'active' : ''}" data-order="none">🆔 Default</button>
      </div>
      <div style="display:flex; align-items:center; gap:16px;">
        <label class="cfl-sort-pref">
          <input type="checkbox" id="cfl-save-sort-chk" \${savedSort !== 'none' ? 'checked' : ''}>
          <span>Save as Default</span>
        </label>
        <button class="cfl-btn-cp31" id="cfl-ps-cp31-btn">📚 CP-31 Sheet</button>
      </div>
    \`;

    problemTable.parentNode.insertBefore(bar, problemTable);

    // Event listeners
    bar.querySelectorAll('.cfl-sort-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const order = pill.getAttribute('data-order');
        const shouldSave = document.getElementById('cfl-save-sort-chk').checked;

        if (shouldSave) {
          setStorage(STORAGE_KEYS.PROBLEMSET_SORT, order);
        }

        const nextParams = new URLSearchParams(window.location.search);
        if (order === 'none') {
          nextParams.delete('order');
        } else {
          nextParams.set('order', order);
        }
        window.location.href = \`\${window.location.pathname}?\${nextParams.toString()}\`;
      });
    });

    document.getElementById('cfl-save-sort-chk').addEventListener('change', (e) => {
      if (e.target.checked) {
        setStorage(STORAGE_KEYS.PROBLEMSET_SORT, currentOrder);
      } else {
        setStorage(STORAGE_KEYS.PROBLEMSET_SORT, 'none');
      }
    });

    document.getElementById('cfl-ps-cp31-btn').addEventListener('click', () => {
      openCP31Modal();
    });
  }

  /* ==========================================================================
     10. CP-31 SHEET MODAL & SOLVED SYNC
     ========================================================================== */

  function openCP31Modal() {
    const existing = document.querySelector('.cfl-modal-backdrop');
    if (existing) existing.remove();

    let solvedSet = new Set(getStorage(STORAGE_KEYS.CP31_SOLVED, []));
    let activeRating = '800';
    let searchQuery = '';

    const backdrop = document.createElement('div');
    backdrop.className = 'cfl-modal-backdrop';

    backdrop.innerHTML = \`
      <div class="cfl-modal" style="width: 820px;">
        <div class="cfl-modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">📚</span>
            <span>TLE CP-31 Practice Sheet</span>
            <span class="cfl-badge" id="cfl-cp31-total-badge" style="background:rgba(245,158,11,0.2); color:#fbbf24;">Loading...</span>
          </div>
          <button class="cfl-nav-btn" id="cfl-cp31-close-btn" style="font-size:14px;">✕</button>
        </div>

        <div style="padding:12px 20px; background:#222; border-bottom:1px solid #333; display:flex; gap:12px; align-items:center;">
          <input type="text" id="cfl-cp31-search" placeholder="🔍 Search problems by title or code (e.g. 1903A)..." style="flex:1; font-size:13px;">
          <button class="cfl-nav-btn" id="cfl-cp31-sync-btn" title="Sync with your Codeforces solved submissions">🔄 Sync CF Solves</button>
        </div>

        <div class="cfl-modal-body" style="padding:16px 20px;">
          <!-- Rating Pills -->
          <div class="cfl-cp31-rating-bar" id="cfl-cp31-ratings">
            \${['800', '900', '1000', '1100', '1200', '1300', '1400', '1500', '1600'].map((r) => \`
              <button class="cfl-cp31-rating-pill \${r === activeRating ? 'active' : ''}" data-rating="\${r}">
                <span>★ \${r}</span>
                <span class="cfl-badge" id="cfl-badge-rate-\${r}" style="background:rgba(0,0,0,0.3); font-size:10px;">0/31</span>
              </button>
            \`).join('')}
          </div>

          <!-- Problems List Container -->
          <div id="cfl-cp31-table-container"></div>
        </div>

        <div class="cfl-modal-footer">
          <span style="font-size:12px; color:var(--cfl-text-secondary); margin-right:auto;">
            Curated by Priyansh Agarwal (TLE Eliminators) • Click problem to solve in LeetCode mode
          </span>
          <button class="cfl-btn cfl-btn-run" id="cfl-cp31-done-btn">Done</button>
        </div>
      </div>
    \`;

    document.body.appendChild(backdrop);

    const updateBadgeCounts = () => {
      let totalSolved = 0;
      let totalCount = 0;

      ['800', '900', '1000', '1100', '1200', '1300', '1400', '1500', '1600'].forEach((r) => {
        const probs = getCP31Problems(r);
        const solvedCount = probs.filter((p) => solvedSet.has(p.code)).length;
        totalSolved += solvedCount;
        totalCount += probs.length;
        const b = backdrop.querySelector(\`#cfl-badge-rate-\${r}\`);
        if (b) b.textContent = \`\${solvedCount}/\${probs.length}\`;
      });

      const totalBadge = backdrop.querySelector('#cfl-cp31-total-badge');
      if (totalBadge) {
        totalBadge.textContent = \`\${totalSolved} / \${totalCount} Solved (\${Math.round((totalSolved / totalCount) * 100)}%)\`;
      }
    };

    const renderProblems = () => {
      const container = backdrop.querySelector('#cfl-cp31-table-container');
      const probs = getCP31Problems(activeRating);

      const filtered = probs.filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || (p.code && p.code.toLowerCase().includes(q));
      });

      if (filtered.length === 0) {
        container.innerHTML = '<p style="color:var(--cfl-text-secondary); padding:20px 0; text-align:center;">No matching problems found.</p>';
        return;
      }

      const rows = filtered.map((p) => {
        const isSolved = solvedSet.has(p.code);
        return \`
          <tr class="\${isSolved ? 'solved-row' : ''}">
            <td style="width:30px; text-align:center;">
              <input type="checkbox" class="cfl-cp31-chk" data-code="\${p.code}" \${isSolved ? 'checked' : ''}>
            </td>
            <td style="width:35px; color:var(--cfl-text-muted); font-size:12px;">#\${p.order}</td>
            <td style="width:80px; font-weight:700; font-family:var(--cfl-font-mono);">\${p.code || '-'}</td>
            <td>
              <a href="\${p.url}" class="cfl-prob-title" style="color:#eff1f6; text-decoration:none; font-weight:500;">
                \${p.title}
              </a>
            </td>
            <td style="width:70px;">
              <span class="cfl-badge cfl-badge-rating">★ \${p.rating}</span>
            </td>
            <td style="width:80px; text-align:right;">
              <a href="\${p.url}" class="cfl-nav-btn" style="text-decoration:none; padding:3px 8px;">Solve ↗</a>
            </td>
          </tr>
        \`;
      }).join('');

      container.innerHTML = \`
        <table class="cfl-cp31-table">
          <thead>
            <tr>
              <th style="width:30px;">Done</th>
              <th style="width:35px;">#</th>
              <th style="width:80px;">Code</th>
              <th>Problem Name</th>
              <th style="width:70px;">Rating</th>
              <th style="width:80px; text-align:right;">Action</th>
            </tr>
          </thead>
          <tbody>
            \${rows}
          </tbody>
        </table>
      \`;

      // Checkbox event listeners
      container.querySelectorAll('.cfl-cp31-chk').forEach((chk) => {
        chk.addEventListener('change', (e) => {
          const code = chk.getAttribute('data-code');
          if (e.target.checked) {
            solvedSet.add(code);
          } else {
            solvedSet.delete(code);
          }
          setStorage(STORAGE_KEYS.CP31_SOLVED, Array.from(solvedSet));
          updateBadgeCounts();
          chk.closest('tr').classList.toggle('solved-row', e.target.checked);
        });
      });
    };

    // Rating selector click
    backdrop.querySelectorAll('.cfl-cp31-rating-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        backdrop.querySelectorAll('.cfl-cp31-rating-pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        activeRating = pill.getAttribute('data-rating');
        renderProblems();
      });
    });

    // Search filter
    const searchInput = backdrop.querySelector('#cfl-cp31-search');
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim();
      renderProblems();
    });

    // Sync CF Solves button
    const syncBtn = backdrop.querySelector('#cfl-cp31-sync-btn');
    syncBtn.addEventListener('click', async () => {
      const handle = getLoggedInHandle();
      if (!handle) {
        alert('Please log in to Codeforces to sync your solved submissions.');
        return;
      }

      syncBtn.disabled = true;
      syncBtn.textContent = '⏳ Syncing...';

      try {
        const res = await fetch(\`https://codeforces.com/api/user.status?handle=\${encodeURIComponent(handle)}&from=1&count=2000\`);
        if (!res.ok) throw new Error('API fetch failed');
        const data = await res.json();

        if (data.status === 'OK' && data.result) {
          let newSolves = 0;
          data.result.forEach((sub) => {
            if (sub.verdict === 'OK' && sub.problem) {
              const code = \`\${sub.problem.contestId}\${sub.problem.index}\`;
              if (!solvedSet.has(code)) {
                solvedSet.add(code);
                newSolves++;
              }
            }
          });

          setStorage(STORAGE_KEYS.CP31_SOLVED, Array.from(solvedSet));
          updateBadgeCounts();
          renderProblems();
          syncBtn.textContent = \`✓ Synced (+\${newSolves})\`;
          setTimeout(() => {
            syncBtn.disabled = false;
            syncBtn.textContent = '🔄 Sync CF Solves';
          }, 2000);
        }
      } catch (err) {
        alert('Could not sync submissions: ' + err.message);
        syncBtn.disabled = false;
        syncBtn.textContent = '🔄 Sync CF Solves';
      }
    });

    updateBadgeCounts();
    renderProblems();

    backdrop.querySelector('#cfl-cp31-close-btn').addEventListener('click', () => backdrop.remove());
    backdrop.querySelector('#cfl-cp31-done-btn').addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.remove();
    });
  }

  /* ==========================================================================
     11. HEADER NAVIGATION SHORTCUTS
     ========================================================================== */

  function injectHeaderControls() {
    // Add CP-31 Sheet to main menu
    const mainMenu = document.querySelector('.main-menu-list');
    if (mainMenu && !document.getElementById('cfl-menu-cp31')) {
      const li = document.createElement('li');
      li.id = 'cfl-menu-cp31';
      li.innerHTML = '<a href="javascript:void(0)" style="color:#d97706 !important; font-weight:bold;">📚 CP-31</a>';
      li.addEventListener('click', (e) => {
        e.preventDefault();
        openCP31Modal();
      });
      mainMenu.appendChild(li);
    }
  }

  /* ==========================================================================
     12. FLOATING DOCK (Global controls)
     ========================================================================== */

  function createFloatingDock() {
    let dock = document.getElementById('cfl-floating-dock');
    if (dock) return;

    const isProblem = isProblemPage();
    const isLeetCodeActive = getStorage(STORAGE_KEYS.ENABLED, true);

    dock = document.createElement('div');
    dock.id = 'cfl-floating-dock';

    dock.innerHTML = \`
      <button class="cfl-dock-btn cfl-dock-btn-cp31" id="cfl-dock-cp31" title="Open CP-31 Practice Sheet">
        <span>📚</span> <span>CP-31</span>
      </button>
      \${isProblem ? \`
        <button class="cfl-dock-btn cfl-dock-btn-primary" id="cfl-dock-toggle-view">
          <span>⚡</span> <span>\${isLeetCodeActive ? 'Classic CF' : 'LeetCode View'}</span>
        </button>
      \` : ''}
    \`;

    document.body.appendChild(dock);

    document.getElementById('cfl-dock-cp31').addEventListener('click', () => {
      openCP31Modal();
    });

    const toggleBtn = document.getElementById('cfl-dock-toggle-view');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentlyActive = getStorage(STORAGE_KEYS.ENABLED, true);
        const nextState = !currentlyActive;
        setStorage(STORAGE_KEYS.ENABLED, nextState);
        toggleBtn.querySelector('span:last-child').textContent = nextState ? 'Classic CF' : 'LeetCode View';

        if (nextState) {
          const problemInfo = parseProblemUrl();
          mountLeetCodeInterface(problemInfo, getProblemUniqueKey(problemInfo));
        } else {
          dismountLeetCodeInterface();
        }
      });
    }
  }

  function dismountLeetCodeInterface() {
    document.body.classList.remove('cf-leetcode-active');
    const app = document.getElementById('cf-leetcode-app');
    if (app) app.remove();
  }

  /* ==========================================================================
     13. LEETCODE WORKSPACE MOUNTING (Problem Pages)
     ========================================================================== */

  function mountLeetCodeInterface(problemInfo, problemKey) {
    document.body.classList.add('cf-leetcode-active');

    const titleEl = document.querySelector('.problem-statement .title');
    const problemTitle = titleEl ? titleEl.textContent.trim() : \`\${problemInfo.problemIndex}. Problem\`;
    const timeLimit = document.querySelector('.time-limit')?.textContent.replace('time limit per test', '').trim() || '1 second';
    const memoryLimit = document.querySelector('.memory-limit')?.textContent.replace('memory limit per test', '').trim() || '256 MB';

    let rating = '';
    const tagBoxes = document.querySelectorAll('.tag-box');
    const tags = [];
    tagBoxes.forEach((t) => {
      const text = t.textContent.trim();
      if (text.startsWith('*')) {
        rating = text.replace('*', '');
      } else {
        tags.push(text);
      }
    });

    const sampleCases = parseSampleTestCases();
    const handle = getLoggedInHandle();

    const savedLangId = getStorage(STORAGE_KEYS.LANGUAGE, '89');
    const savedTheme = getStorage(STORAGE_KEYS.THEME, 'monokai');
    const savedFontSize = getStorage(STORAGE_KEYS.FONT_SIZE, 14);
    const savedSplitRatio = getStorage(STORAGE_KEYS.SPLIT_RATIO, 50);
    const savedTemplates = getStorage(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);

    const currentLangObj = LANGUAGES.find((l) => l.id === savedLangId) || LANGUAGES[0];
    const draftKey = STORAGE_KEYS.DRAFTS + problemKey + '_' + currentLangObj.key;
    const savedDraft = getStorage(draftKey, null);
    const initialCode = savedDraft !== null ? savedDraft : (savedTemplates[currentLangObj.key] || DEFAULT_TEMPLATES[currentLangObj.key] || '');

    let app = document.getElementById('cf-leetcode-app');
    if (app) app.remove();

    app = document.createElement('div');
    app.id = 'cf-leetcode-app';

    app.innerHTML = \`
      <!-- TOP NAVBAR -->
      <nav id="cfl-navbar">
        <div class="cfl-nav-section">
          <a class="cfl-logo" href="https://codeforces.com" title="Codeforces Home">
            <span>CF</span>+
          </a>
          <div class="cfl-problem-title-nav">
            <span>\${problemTitle}</span>
            \${rating ? \`<span class="cfl-badge cfl-badge-rating \${parseInt(rating) >= 1900 ? 'master' : parseInt(rating) >= 1600 ? 'expert' : ''}">★ \${rating}</span>\` : ''}
          </div>
          <button class="cfl-nav-btn" id="cfl-prev-prob-btn" title="Previous Problem">◀</button>
          <button class="cfl-nav-btn" id="cfl-next-prob-btn" title="Next Problem">▶</button>
        </div>

        <div class="cfl-nav-section cfl-action-group">
          <button class="cfl-btn cfl-btn-run" id="cfl-run-btn" title="Run with sample tests (⌘')">
            <span>▶</span> Run Code
          </button>
          <button class="cfl-btn cfl-btn-submit" id="cfl-submit-btn" title="Submit Solution (⌘↵)">
            <span>🚀</span> Submit
          </button>
        </div>

        <div class="cfl-nav-section">
          <button class="cfl-nav-btn" id="cfl-nav-cp31-btn" style="color:#fbbf24;" title="Browse CP-31 Sheet">📚 CP-31</button>
          <button class="cfl-nav-btn" id="cfl-reset-btn" title="Reset Code to Template">↺ Reset</button>
          <button class="cfl-nav-btn" id="cfl-settings-btn" title="Settings & Custom Boilerplates">⚙ Settings</button>
          \${handle ? \`<span class="cfl-badge" style="background:rgba(255,255,255,0.08);color:#fff;">👤 \${handle}</span>\` : '<a href="/enter" style="color:#60a5fa;font-size:12px;">Log in</a>'}
        </div>
      </nav>

      <!-- MAIN WORKSPACE -->
      <div id="cfl-workspace">
        <div id="cfl-left-pane" style="width: \${savedSplitRatio}%;">
          <div class="cfl-pane-tabs">
            <button class="cfl-tab-btn active" data-tab="desc">📄 Description</button>
            <button class="cfl-tab-btn" data-tab="submissions">🕒 Submissions</button>
          </div>

          <div class="cfl-pane-content" id="cfl-tab-desc">
            <div class="cfl-problem-header">
              <h1 class="cfl-problem-title">\${problemTitle}</h1>
              <div class="cfl-meta-bar">
                <div class="cfl-meta-item">⏱ \${timeLimit}</div>
                <div class="cfl-meta-item">💾 \${memoryLimit}</div>
                <div class="cfl-meta-item">📥 standard input</div>
                <div class="cfl-meta-item">📤 standard output</div>
              </div>
            </div>

            <div class="cfl-statement-body" id="cfl-statement-container"></div>

            \${tags.length > 0 ? \`
              <div class="cfl-tags-container">
                <button class="cfl-nav-btn" id="cfl-toggle-tags-btn">🏷 Show Tags (\${tags.length})</button>
                <div id="cfl-tags-list" style="display:none; margin-top:10px;">
                  \${tags.map((t) => \`<span class="cfl-tag-chip">\${t}</span>\`).join('')}
                </div>
              </div>
            \` : ''}
          </div>

          <div class="cfl-pane-content" id="cfl-tab-submissions" style="display:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <h3 style="margin:0; font-size:16px;">Past Submissions</h3>
              <button class="cfl-nav-btn" id="cfl-refresh-subs-btn">↻ Refresh</button>
            </div>
            <div id="cfl-subs-table-container">Loading previous submissions...</div>
          </div>
        </div>

        <div id="cfl-resizer"></div>

        <div id="cfl-right-pane">
          <div class="cfl-editor-toolbar">
            <div class="cfl-toolbar-left">
              <select class="cfl-select" id="cfl-lang-select">
                \${LANGUAGES.map((l) => \`<option value="\${l.id}" \${l.id === savedLangId ? 'selected' : ''}>\${l.name}</option>\`).join('')}
              </select>
              <select class="cfl-select" id="cfl-theme-select">
                <option value="monokai" \${savedTheme === 'monokai' ? 'selected' : ''}>Monokai</option>
                <option value="dracula" \${savedTheme === 'dracula' ? 'selected' : ''}>Dracula</option>
                <option value="one_dark" \${savedTheme === 'one_dark' ? 'selected' : ''}>One Dark</option>
                <option value="tomorrow_night" \${savedTheme === 'tomorrow_night' ? 'selected' : ''}>Tomorrow Night</option>
                <option value="chrome" \${savedTheme === 'chrome' ? 'selected' : ''}>Light (Chrome)</option>
              </select>
              <div style="display:flex; align-items:center; gap:2px;">
                <button class="cfl-nav-btn" id="cfl-font-dec" style="padding:2px 6px;">A-</button>
                <button class="cfl-nav-btn" id="cfl-font-inc" style="padding:2px 6px;">A+</button>
              </div>
            </div>

            <div class="cfl-toolbar-right">
              <span class="cfl-save-indicator" id="cfl-save-indicator">✓ Draft saved</span>
            </div>
          </div>

          <div id="cfl-editor-container">
            <div id="cfl-ace-editor"></div>
          </div>

          <div id="cfl-console-drawer">
            <div class="cfl-console-resizer" id="cfl-console-resizer"></div>
            <div class="cfl-console-header">
              <div class="cfl-console-tabs">
                <button class="cfl-tab-btn active" data-ctab="testcases">📋 Testcases</button>
                <button class="cfl-tab-btn" data-ctab="results">📊 Run Result</button>
                <button class="cfl-tab-btn" data-ctab="verdict" id="cfl-verdict-tab-btn">🚀 Submission</button>
              </div>
              <div>
                <button class="cfl-nav-btn" id="cfl-toggle-console-btn" title="Minimize / Expand Console">⏷</button>
              </div>
            </div>

            <div class="cfl-console-body" id="cfl-console-body">
              <div id="cfl-ctab-testcases">
                <div class="cfl-case-pill-bar" id="cfl-case-pills">
                  \${sampleCases.map((_, idx) => \`<button class="cfl-case-pill \${idx === 0 ? 'active' : ''}" data-case-idx="\${idx}">Case \${idx + 1}</button>\`).join('')}
                  <button class="cfl-case-pill" id="cfl-add-custom-case-btn">+ Custom</button>
                </div>
                <div id="cfl-case-editor-fields">
                  <div class="cfl-test-field-label">Input:</div>
                  <textarea class="cfl-test-textarea" id="cfl-case-input" rows="3">\${sampleCases[0] ? sampleCases[0].input : ''}</textarea>
                  <div class="cfl-test-field-label">Expected Output:</div>
                  <textarea class="cfl-test-textarea" id="cfl-case-output" rows="2">\${sampleCases[0] ? sampleCases[0].output : ''}</textarea>
                </div>
              </div>

              <div id="cfl-ctab-results" style="display:none;">
                <div id="cfl-results-content" style="color:var(--cfl-text-secondary); font-size:13px;">
                  Click "Run Code" to test your solution against the sample testcases.
                </div>
              </div>

              <div id="cfl-ctab-verdict" style="display:none;">
                <div id="cfl-verdict-content" style="color:var(--cfl-text-secondary); font-size:13px;">
                  Click "Submit" to send your solution directly to Codeforces.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    \`;

    document.body.appendChild(app);

    populateProblemStatement();
    setupResizers();
    setupTabs();

    const editorDiv = document.getElementById('cfl-ace-editor');
    initAceEditor(editorDiv, initialCode, currentLangObj.aceMode, savedTheme, savedFontSize).then((ed) => {
      let saveTimeout = null;
      ed.on('change', () => {
        const ind = document.getElementById('cfl-save-indicator');
        if (ind) ind.textContent = 'Saving...';
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          const code = ed.getValue();
          const selectedLangId = document.getElementById('cfl-lang-select').value;
          const lang = LANGUAGES.find((l) => l.id === selectedLangId) || currentLangObj;
          setStorage(STORAGE_KEYS.DRAFTS + problemKey + '_' + lang.key, code);
          if (ind) ind.textContent = '✓ Draft saved';
        }, 800);
      });
    });

    setupInteractions(problemInfo, problemKey, sampleCases, handle);
  }

  function populateProblemStatement() {
    const origStatement = document.querySelector('.problem-statement');
    const container = document.getElementById('cfl-statement-container');
    if (!origStatement || !container) return;

    origStatement.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains('header')) return;
        const clone = node.cloneNode(true);

        if (clone.classList.contains('sample-tests')) {
          const sampleDivs = clone.querySelectorAll('.sample-test');
          sampleDivs.forEach((sd) => {
            const inputs = sd.querySelectorAll('.input');
            const outputs = sd.querySelectorAll('.output');

            for (let i = 0; i < Math.min(inputs.length, outputs.length); i++) {
              const inpPre = inputs[i].querySelector('pre');
              const outPre = outputs[i].querySelector('pre');

              const box = document.createElement('div');
              box.className = 'cfl-sample-box';
              box.innerHTML = \`
                <div class="cfl-sample-header">
                  <span>Input #\${i + 1}</span>
                  <button class="cfl-copy-btn">Copy</button>
                </div>
                <pre class="cfl-sample-pre">\${inpPre ? inpPre.textContent : ''}</pre>
                <div class="cfl-sample-header">
                  <span>Output #\${i + 1}</span>
                  <button class="cfl-copy-btn">Copy</button>
                </div>
                <pre class="cfl-sample-pre">\${outPre ? outPre.textContent : ''}</pre>
              \`;

              box.querySelectorAll('.cfl-copy-btn').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                  const pre = e.target.closest('.cfl-sample-header').nextElementSibling;
                  if (pre) {
                    navigator.clipboard.writeText(pre.textContent);
                    btn.textContent = 'Copied!';
                    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
                  }
                });
              });

              sd.replaceWith(box);
            }
          });
        }

        container.appendChild(clone);
      }
    });

    if (window.MathJax) {
      if (window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([container]).catch((err) => console.warn('[CF+] MathJax 3 typeset error:', err));
      } else if (window.MathJax.Hub && window.MathJax.Hub.Queue) {
        window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, container]);
      }
    }
  }

  function setupResizers() {
    const resizer = document.getElementById('cfl-resizer');
    const leftPane = document.getElementById('cfl-left-pane');
    const workspace = document.getElementById('cfl-workspace');

    if (resizer && leftPane && workspace) {
      let isDragging = false;

      resizer.addEventListener('mousedown', () => {
        isDragging = true;
        resizer.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = workspace.getBoundingClientRect();
        const percentage = Math.max(20, Math.min(80, ((e.clientX - rect.left) / rect.width) * 100));
        leftPane.style.width = \`\${percentage}%\`;
      });

      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          resizer.classList.remove('dragging');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          const ratio = parseFloat(leftPane.style.width);
          setStorage(STORAGE_KEYS.SPLIT_RATIO, ratio);
          if (editorInstance && editorInstance.resize) editorInstance.resize();
        }
      });

      resizer.addEventListener('dblclick', () => {
        leftPane.style.width = '50%';
        setStorage(STORAGE_KEYS.SPLIT_RATIO, 50);
        if (editorInstance && editorInstance.resize) editorInstance.resize();
      });
    }

    const consoleResizer = document.getElementById('cfl-console-resizer');
    const drawer = document.getElementById('cfl-console-drawer');

    if (consoleResizer && drawer) {
      let isDraggingConsole = false;

      consoleResizer.addEventListener('mousedown', () => {
        isDraggingConsole = true;
        drawer.classList.remove('collapsed');
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDraggingConsole) return;
        const h = Math.max(80, Math.min(window.innerHeight * 0.75, window.innerHeight - e.clientY));
        drawer.style.height = \`\${h}px\`;
      });

      document.addEventListener('mouseup', () => {
        if (isDraggingConsole) {
          isDraggingConsole = false;
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          if (editorInstance && editorInstance.resize) editorInstance.resize();
        }
      });
    }
  }

  function setupTabs() {
    const leftTabBtns = document.querySelectorAll('.cfl-pane-tabs .cfl-tab-btn');
    leftTabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        leftTabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        document.getElementById('cfl-tab-desc').style.display = tab === 'desc' ? 'block' : 'none';
        document.getElementById('cfl-tab-submissions').style.display = tab === 'submissions' ? 'block' : 'none';
      });
    });

    const consoleTabBtns = document.querySelectorAll('.cfl-console-tabs .cfl-tab-btn');
    consoleTabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        consoleTabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const ctab = btn.getAttribute('data-ctab');
        document.getElementById('cfl-ctab-testcases').style.display = ctab === 'testcases' ? 'block' : 'none';
        document.getElementById('cfl-ctab-results').style.display = ctab === 'results' ? 'block' : 'none';
        document.getElementById('cfl-ctab-verdict').style.display = ctab === 'verdict' ? 'block' : 'none';

        const drawer = document.getElementById('cfl-console-drawer');
        drawer.classList.remove('collapsed');
      });
    });
  }

  function setupInteractions(problemInfo, problemKey, sampleCases, handle) {
    let currentSampleCases = [...sampleCases];
    if (currentSampleCases.length === 0) {
      currentSampleCases.push({ input: '', output: '' });
    }
    let activeCaseIndex = 0;

    const prevBtn = document.getElementById('cfl-prev-prob-btn');
    const nextBtn = document.getElementById('cfl-next-prob-btn');
    const currIndexChar = problemInfo.problemIndex;

    const navigateProblem = (delta) => {
      if (currIndexChar.length === 1 && /[A-Z]/i.test(currIndexChar)) {
        const nextChar = String.fromCharCode(currIndexChar.toUpperCase().charCodeAt(0) + delta);
        if (nextChar >= 'A' && nextChar <= 'Z') {
          const newUrl = window.location.pathname.replace(new RegExp(\`/\${currIndexChar}$\`, 'i'), \`/\${nextChar}\`);
          window.location.href = newUrl;
        }
      }
    };
    if (prevBtn) prevBtn.addEventListener('click', () => navigateProblem(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateProblem(1));

    // CP-31 Sheet button in top navbar
    const cp31Btn = document.getElementById('cfl-nav-cp31-btn');
    if (cp31Btn) {
      cp31Btn.addEventListener('click', () => openCP31Modal());
    }

    const toggleTagsBtn = document.getElementById('cfl-toggle-tags-btn');
    const tagsList = document.getElementById('cfl-tags-list');
    if (toggleTagsBtn && tagsList) {
      toggleTagsBtn.addEventListener('click', () => {
        const isHidden = tagsList.style.display === 'none';
        tagsList.style.display = isHidden ? 'block' : 'none';
        toggleTagsBtn.textContent = isHidden ? '🏷 Hide Tags' : \`🏷 Show Tags (\${tagsList.children.length})\`;
      });
    }

    const toggleConsoleBtn = document.getElementById('cfl-toggle-console-btn');
    const consoleDrawer = document.getElementById('cfl-console-drawer');
    if (toggleConsoleBtn && consoleDrawer) {
      toggleConsoleBtn.addEventListener('click', () => {
        consoleDrawer.classList.toggle('collapsed');
        toggleConsoleBtn.textContent = consoleDrawer.classList.contains('collapsed') ? '⏶' : '⏷';
        if (editorInstance && editorInstance.resize) editorInstance.resize();
      });
    }

    const caseInputArea = document.getElementById('cfl-case-input');
    const caseOutputArea = document.getElementById('cfl-case-output');

    const updateCaseView = (idx) => {
      activeCaseIndex = idx;
      document.querySelectorAll('.cfl-case-pill[data-case-idx]').forEach((p, i) => {
        p.classList.toggle('active', i === idx);
      });
      caseInputArea.value = currentSampleCases[idx] ? currentSampleCases[idx].input : '';
      caseOutputArea.value = currentSampleCases[idx] ? currentSampleCases[idx].output : '';
    };

    document.querySelectorAll('.cfl-case-pill[data-case-idx]').forEach((pill, idx) => {
      pill.addEventListener('click', () => updateCaseView(idx));
    });

    caseInputArea.addEventListener('input', () => {
      if (currentSampleCases[activeCaseIndex]) {
        currentSampleCases[activeCaseIndex].input = caseInputArea.value;
      }
    });
    caseOutputArea.addEventListener('input', () => {
      if (currentSampleCases[activeCaseIndex]) {
        currentSampleCases[activeCaseIndex].output = caseOutputArea.value;
      }
    });

    const addCustomBtn = document.getElementById('cfl-add-custom-case-btn');
    if (addCustomBtn) {
      addCustomBtn.addEventListener('click', () => {
        const newIdx = currentSampleCases.length;
        currentSampleCases.push({ input: '', output: '' });

        const pill = document.createElement('button');
        pill.className = 'cfl-case-pill';
        pill.setAttribute('data-case-idx', newIdx);
        pill.textContent = \`Case \${newIdx + 1}\`;
        pill.addEventListener('click', () => updateCaseView(newIdx));

        addCustomBtn.before(pill);
        updateCaseView(newIdx);
      });
    }

    const langSelect = document.getElementById('cfl-lang-select');
    langSelect.addEventListener('change', () => {
      const selectedId = langSelect.value;
      setStorage(STORAGE_KEYS.LANGUAGE, selectedId);
      const langObj = LANGUAGES.find((l) => l.id === selectedId) || LANGUAGES[0];

      if (editorInstance) {
        if (editorInstance.session && editorInstance.session.setMode) {
          editorInstance.session.setMode(\`ace/mode/\${langObj.aceMode}\`);
        }

        const draftKey = STORAGE_KEYS.DRAFTS + problemKey + '_' + langObj.key;
        const draft = getStorage(draftKey, null);
        if (draft !== null) {
          editorInstance.setValue(draft, -1);
        } else {
          const templates = getStorage(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
          const tpl = templates[langObj.key] || DEFAULT_TEMPLATES[langObj.key] || '';
          editorInstance.setValue(tpl, -1);
        }
      }
    });

    const themeSelect = document.getElementById('cfl-theme-select');
    themeSelect.addEventListener('change', () => {
      const th = themeSelect.value;
      setStorage(STORAGE_KEYS.THEME, th);
      if (editorInstance && editorInstance.setTheme) {
        editorInstance.setTheme(\`ace/theme/\${th}\`);
      }
    });

    let currentFontSize = getStorage(STORAGE_KEYS.FONT_SIZE, 14);
    document.getElementById('cfl-font-inc').addEventListener('click', () => {
      currentFontSize = Math.min(26, currentFontSize + 1);
      setStorage(STORAGE_KEYS.FONT_SIZE, currentFontSize);
      if (editorInstance) editorInstance.setFontSize(currentFontSize);
    });
    document.getElementById('cfl-font-dec').addEventListener('click', () => {
      currentFontSize = Math.max(10, currentFontSize - 1);
      setStorage(STORAGE_KEYS.FONT_SIZE, currentFontSize);
      if (editorInstance) editorInstance.setFontSize(currentFontSize);
    });

    document.getElementById('cfl-reset-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the editor to the default template? Your current code for this language will be replaced.')) {
        const selectedId = langSelect.value;
        const langObj = LANGUAGES.find((l) => l.id === selectedId) || LANGUAGES[0];
        const templates = getStorage(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
        const tpl = templates[langObj.key] || DEFAULT_TEMPLATES[langObj.key] || '';
        if (editorInstance) {
          editorInstance.setValue(tpl, -1);
          setStorage(STORAGE_KEYS.DRAFTS + problemKey + '_' + langObj.key, tpl);
        }
      }
    });

    document.getElementById('cfl-settings-btn').addEventListener('click', () => {
      openSettingsModal(langSelect.value);
    });

    const refreshSubsBtn = document.getElementById('cfl-refresh-subs-btn');
    if (refreshSubsBtn) {
      refreshSubsBtn.addEventListener('click', () => loadSubmissions(handle, problemInfo));
    }
    document.querySelector('.cfl-tab-btn[data-tab="submissions"]').addEventListener('click', () => {
      loadSubmissions(handle, problemInfo);
    });

    const runBtn = document.getElementById('cfl-run-btn');
    runBtn.addEventListener('click', () => handleRunCode(langSelect.value, currentSampleCases[activeCaseIndex]));

    const submitBtn = document.getElementById('cfl-submit-btn');
    submitBtn.addEventListener('click', () => handleSubmit(problemInfo, langSelect.value, handle));

    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (cmdKey && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(problemInfo, langSelect.value, handle);
      }
      if (cmdKey && e.key === "'") {
        e.preventDefault();
        handleRunCode(langSelect.value, currentSampleCases[activeCaseIndex]);
      }
    });
  }

  /* ==========================================================================
     14. RUN CODE & SUBMIT HANDLERS
     ========================================================================== */

  async function handleRunCode(langId, activeCase) {
    const runBtn = document.getElementById('cfl-run-btn');
    const resultsContainer = document.getElementById('cfl-results-content');
    const drawer = document.getElementById('cfl-console-drawer');

    document.querySelectorAll('.cfl-console-tabs .cfl-tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelector('.cfl-console-tabs .cfl-tab-btn[data-ctab="results"]').classList.add('active');
    document.getElementById('cfl-ctab-testcases').style.display = 'none';
    document.getElementById('cfl-ctab-results').style.display = 'block';
    document.getElementById('cfl-ctab-verdict').style.display = 'none';
    drawer.classList.remove('collapsed');

    runBtn.disabled = true;
    runBtn.innerHTML = '<span>⏳</span> Running...';
    resultsContainer.innerHTML = '<div style="padding:10px 0; color:var(--cfl-accent-yellow);">Executing code with Codeforces compiler...</div>';

    const code = editorInstance.getValue();
    const input = activeCase ? activeCase.input : '';
    const expected = activeCase ? activeCase.output.trim() : '';

    try {
      const result = await runCustomTest(langId, code, input);
      const actual = (result.output || '').trim();
      const isMatch = expected && actual === expected;

      resultsContainer.innerHTML = \`
        <div class="cfl-verdict-card">
          <div class="cfl-verdict-title \${isMatch ? 'cfl-verdict-accepted' : result.compilationError ? 'cfl-verdict-wrong' : 'cfl-verdict-wrong'}">
            <span>\${isMatch ? '✓ Passed' : result.compilationError ? '✗ Compilation Error' : '✗ Output Mismatch'}</span>
            <span style="font-size:12px; font-weight:normal; color:var(--cfl-text-secondary); margin-left:auto;">
              \${result.time ? \`⏱ \${result.time} ms\` : ''}
            </span>
          </div>

          \${result.compilationError ? \`
            <div style="background:#2a1215; border:1px solid #7f1d1d; border-radius:6px; padding:10px; margin-top:8px;">
              <div style="color:#f87171; font-weight:600; font-size:12px; margin-bottom:4px;">Compiler Output:</div>
              <pre style="margin:0; font-family:var(--cfl-font-mono); font-size:12px; color:#fca5a5; white-space:pre-wrap;">\${result.compilationError}</pre>
            </div>
          \` : \`
            <div style="margin-top:10px;">
              <div class="cfl-test-field-label">Your Output:</div>
              <pre class="cfl-sample-pre" style="background:#111111; border-radius:6px; border:1px solid var(--cfl-border); max-height:140px; overflow-y:auto;">\${actual || '(empty)'}</pre>

              \${expected ? \`
                <div class="cfl-test-field-label">Expected Output:</div>
                <pre class="cfl-sample-pre" style="background:#111111; border-radius:6px; border:1px solid var(--cfl-border); max-height:140px; overflow-y:auto;">\${expected}</pre>
              \` : ''}
            </div>
          \`}
        </div>
      \`;
    } catch (err) {
      resultsContainer.innerHTML = \`
        <div class="cfl-verdict-card" style="border-color:#ef4444;">
          <div class="cfl-verdict-title cfl-verdict-wrong">✗ Run Failed</div>
          <p style="color:#fca5a5; font-size:13px; margin:4px 0 0 0;">\${err.message || err}</p>
        </div>
      \`;
    } finally {
      runBtn.disabled = false;
      runBtn.innerHTML = '<span>▶</span> Run Code';
    }
  }

  async function handleSubmit(problemInfo, langId, handle) {
    if (!handle) {
      alert('You are not logged in to Codeforces. Please log in first to submit solutions.');
      return;
    }

    const submitBtn = document.getElementById('cfl-submit-btn');
    const verdictTabBtn = document.getElementById('cfl-verdict-tab-btn');
    const verdictContent = document.getElementById('cfl-verdict-content');
    const drawer = document.getElementById('cfl-console-drawer');

    document.querySelectorAll('.cfl-console-tabs .cfl-tab-btn').forEach((b) => b.classList.remove('active'));
    verdictTabBtn.classList.add('active');
    document.getElementById('cfl-ctab-testcases').style.display = 'none';
    document.getElementById('cfl-ctab-results').style.display = 'none';
    document.getElementById('cfl-ctab-verdict').style.display = 'block';
    drawer.classList.remove('collapsed');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳</span> Submitting...';
    verdictContent.innerHTML = \`
      <div class="cfl-verdict-card">
        <div class="cfl-verdict-title cfl-verdict-testing">
          <span>🟡 Submitting Solution...</span>
        </div>
        <p style="color:var(--cfl-text-secondary); font-size:13px; margin:4px 0 0 0;">Sending code to Codeforces backend...</p>
      </div>
    \`;

    let lastKnownSubId = 0;
    try {
      const checkRes = await fetch(\`https://codeforces.com/api/user.status?handle=\${encodeURIComponent(handle)}&from=1&count=1\`);
      if (checkRes.ok) {
        const d = await checkRes.json();
        if (d.status === 'OK' && d.result && d.result.length > 0) {
          lastKnownSubId = d.result[0].id;
        }
      }
    } catch (e) {
      console.warn('[CF+] Could not pre-fetch latest submission ID:', e);
    }

    const code = editorInstance.getValue();

    try {
      await submitSolution(problemInfo.contestId, problemInfo.problemIndex, langId, code);

      verdictContent.innerHTML = \`
        <div class="cfl-verdict-card">
          <div class="cfl-verdict-title cfl-verdict-testing">
            <span>⏳ In Queue...</span>
          </div>
          <p style="color:var(--cfl-text-secondary); font-size:13px; margin:4px 0 0 0;">Waiting for an available testing judge...</p>
        </div>
      \`;

      const finalResult = await pollSubmissionVerdict(handle, problemInfo.contestId, problemInfo.problemIndex, lastKnownSubId, (progress) => {
        verdictContent.innerHTML = \`
          <div class="cfl-verdict-card">
            <div class="cfl-verdict-title cfl-verdict-testing">
              <span>🔄 \${progress.message}</span>
            </div>
            <p style="color:var(--cfl-text-secondary); font-size:13px; margin:4px 0 0 0;">
              Submission ID: <a href="/contest/\${problemInfo.contestId}/submission/\${progress.submissionId}" target="_blank" style="color:#60a5fa;">#\${progress.submissionId}</a>
            </p>
          </div>
        \`;
      });

      const isAccepted = finalResult.verdict === 'OK';
      const verdictClass = isAccepted ? 'cfl-verdict-accepted' : 'cfl-verdict-wrong';
      const verdictLabel = isAccepted
        ? 'Accepted'
        : finalResult.verdict === 'WRONG_ANSWER'
        ? \`Wrong Answer on test \${finalResult.passedTests + 1}\`
        : finalResult.verdict === 'TIME_LIMIT_EXCEEDED'
        ? \`Time Limit Exceeded on test \${finalResult.passedTests + 1}\`
        : finalResult.verdict === 'MEMORY_LIMIT_EXCEEDED'
        ? \`Memory Limit Exceeded on test \${finalResult.passedTests + 1}\`
        : finalResult.verdict === 'COMPILATION_ERROR'
        ? 'Compilation Error'
        : finalResult.verdict;

      verdictContent.innerHTML = \`
        <div class="cfl-verdict-card" style="border-color:\${isAccepted ? 'rgba(44,187,93,0.4)' : 'rgba(239,68,68,0.4)'}; background:\${isAccepted ? 'rgba(44,187,93,0.06)' : 'rgba(239,68,68,0.06)'};">
          <div class="cfl-verdict-title \${verdictClass}">
            <span>\${isAccepted ? '🎉' : '✗'} \${verdictLabel}</span>
          </div>
          <div style="display:flex; gap:16px; margin-top:12px; font-size:13px; color:var(--cfl-text-secondary);">
            <div>⏱ <strong>\${finalResult.time || 0} ms</strong></div>
            <div>💾 <strong>\${((finalResult.memory || 0) / 1024 / 1024).toFixed(1)} MB</strong></div>
            <div>🏷 \${finalResult.lang || ''}</div>
            <div style="margin-left:auto;">
              <a href="/contest/\${problemInfo.contestId}/submission/\${finalResult.submissionId}" target="_blank" style="color:#60a5fa; text-decoration:none;">View Submission #\${finalResult.submissionId} ↗</a>
            </div>
          </div>
        </div>
      \`;

      loadSubmissions(handle, problemInfo);
    } catch (err) {
      verdictContent.innerHTML = \`
        <div class="cfl-verdict-card" style="border-color:#ef4444; background:rgba(239,68,68,0.08);">
          <div class="cfl-verdict-title cfl-verdict-wrong">✗ Submission Failed</div>
          <p style="color:#fca5a5; font-size:13px; margin:6px 0 0 0;">\${err.message || err}</p>
        </div>
      \`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>🚀</span> Submit';
    }
  }

  async function loadSubmissions(handle, problemInfo) {
    const container = document.getElementById('cfl-subs-table-container');
    if (!container) return;
    if (!handle) {
      container.innerHTML = '<p style="color:var(--cfl-text-secondary);">Please log in to view submissions.</p>';
      return;
    }

    container.innerHTML = '<p style="color:var(--cfl-text-secondary);">Fetching submissions...</p>';

    try {
      const res = await fetch(\`https://codeforces.com/api/user.status?handle=\${encodeURIComponent(handle)}&from=1&count=50\`);
      if (!res.ok) throw new Error('Failed to fetch from Codeforces API');
      const data = await res.json();

      if (data.status !== 'OK' || !data.result) {
        throw new Error('Invalid API response');
      }

      const matches = data.result.filter((s) => {
        const p = s.problem;
        return p && (String(s.contestId) === String(problemInfo.contestId) || String(p.contestId) === String(problemInfo.contestId)) &&
               String(p.index).toUpperCase() === String(problemInfo.problemIndex).toUpperCase();
      });

      if (matches.length === 0) {
        container.innerHTML = '<p style="color:var(--cfl-text-secondary);">No submissions found for this problem.</p>';
        return;
      }

      const rows = matches.map((sub) => {
        const isOk = sub.verdict === 'OK';
        const vText = isOk ? 'Accepted' : (sub.verdict || 'In Queue');
        const vColor = isOk ? 'var(--cfl-accent-green)' : sub.verdict === 'TESTING' ? 'var(--cfl-accent-yellow)' : 'var(--cfl-accent-red)';
        const dateStr = new Date(sub.creationTimeSeconds * 1000).toLocaleString();

        return \`
          <tr>
            <td><a href="/contest/\${sub.contestId}/submission/\${sub.id}" target="_blank" style="color:#60a5fa; text-decoration:none;">#\${sub.id}</a></td>
            <td><span style="color:\${vColor}; font-weight:600;">\${vText}</span></td>
            <td>\${sub.programmingLanguage}</td>
            <td>\${sub.timeConsumedMillis} ms</td>
            <td>\${(sub.memoryConsumedBytes / 1024 / 1024).toFixed(1)} MB</td>
            <td style="color:var(--cfl-text-muted); font-size:12px;">\${dateStr}</td>
          </tr>
        \`;
      }).join('');

      container.innerHTML = \`
        <table class="cfl-subs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Verdict</th>
              <th>Language</th>
              <th>Time</th>
              <th>Memory</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            \${rows}
          </tbody>
        </table>
      \`;
    } catch (err) {
      container.innerHTML = \`<p style="color:#f87171;">Failed to load submissions: \${err.message}</p>\`;
    }
  }

  /* ==========================================================================
     15. SETTINGS & BOILERPLATE MANAGER MODAL
     ========================================================================== */

  function openSettingsModal(currentLangId) {
    const existing = document.querySelector('.cfl-modal-backdrop');
    if (existing) existing.remove();

    const templates = getStorage(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
    const langObj = LANGUAGES.find((l) => l.id === currentLangId) || LANGUAGES[0];
    let selectedLangKey = langObj.key;

    const backdrop = document.createElement('div');
    backdrop.className = 'cfl-modal-backdrop';

    backdrop.innerHTML = \`
      <div class="cfl-modal">
        <div class="cfl-modal-header">
          <span>⚙ Settings & Boilerplates</span>
          <button class="cfl-nav-btn" id="cfl-close-modal-btn">✕</button>
        </div>
        <div class="cfl-modal-body">
          <div style="margin-bottom:16px;">
            <label style="display:block; font-size:13px; font-weight:600; margin-bottom:6px; color:#fff;">
              Edit Default Boilerplate:
            </label>
            <select class="cfl-select" id="cfl-modal-lang-select" style="width:100%; margin-bottom:12px;">
              <option value="cpp" \${selectedLangKey === 'cpp' ? 'selected' : ''}>C++ (C++20 / C++23)</option>
              <option value="python" \${selectedLangKey === 'python' ? 'selected' : ''}>Python (Python 3 / PyPy 3)</option>
              <option value="java" \${selectedLangKey === 'java' ? 'selected' : ''}>Java (Java 21 / 11)</option>
              <option value="rust" \${selectedLangKey === 'rust' ? 'selected' : ''}>Rust</option>
              <option value="golang" \${selectedLangKey === 'golang' ? 'selected' : ''}>Go</option>
            </select>

            <textarea id="cfl-modal-template-editor" style="width:100%; height:260px; background:#141414; color:#eff1f6; font-family:var(--cfl-font-mono); font-size:13px; padding:12px; border:1px solid var(--cfl-border); border-radius:6px; resize:vertical; outline:none; box-sizing:border-box;">\${templates[selectedLangKey] || DEFAULT_TEMPLATES[selectedLangKey] || ''}</textarea>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <button class="cfl-nav-btn" id="cfl-modal-reset-default-btn">Restore Built-in Default</button>
            <span id="cfl-modal-status" style="color:var(--cfl-accent-green); font-size:12px;"></span>
          </div>
        </div>
        <div class="cfl-modal-footer">
          <button class="cfl-btn cfl-btn-run" id="cfl-modal-cancel-btn">Cancel</button>
          <button class="cfl-btn cfl-btn-submit" id="cfl-modal-save-btn">Save Boilerplate</button>
        </div>
      </div>
    \`;

    document.body.appendChild(backdrop);

    const select = backdrop.querySelector('#cfl-modal-lang-select');
    const editor = backdrop.querySelector('#cfl-modal-template-editor');
    const status = backdrop.querySelector('#cfl-modal-status');

    select.addEventListener('change', () => {
      selectedLangKey = select.value;
      editor.value = templates[selectedLangKey] || DEFAULT_TEMPLATES[selectedLangKey] || '';
      status.textContent = '';
    });

    backdrop.querySelector('#cfl-modal-reset-default-btn').addEventListener('click', () => {
      editor.value = DEFAULT_TEMPLATES[selectedLangKey] || '';
      status.textContent = 'Restored built-in default (click Save to apply).';
    });

    backdrop.querySelector('#cfl-modal-save-btn').addEventListener('click', () => {
      templates[selectedLangKey] = editor.value;
      setStorage(STORAGE_KEYS.TEMPLATES, templates);
      status.textContent = '✓ Saved successfully!';
      setTimeout(() => { backdrop.remove(); }, 600);
    });

    backdrop.querySelector('#cfl-close-modal-btn').addEventListener('click', () => backdrop.remove());
    backdrop.querySelector('#cfl-modal-cancel-btn').addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.remove();
    });
  }

  /* ==========================================================================
     16. ENTRYPOINT
     ========================================================================== */

  function bootstrap() {
    // 1. Inject Styles
    injectStyles();

    // 2. Header controls (CP-31 Sheet link)
    injectHeaderControls();

    // 3. Problemset sorting logic
    handleProblemsetSorting();

    // 4. Floating dock (CP-31 Sheet + View toggle)
    createFloatingDock();

    // 5. If problem page, check if LeetCode mode is active
    if (isProblemPage()) {
      const isLeetCodeActive = getStorage(STORAGE_KEYS.ENABLED, true);
      const problemInfo = parseProblemUrl();
      if (isLeetCodeActive && problemInfo) {
        mountLeetCodeInterface(problemInfo, getProblemUniqueKey(problemInfo));
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
`;

fs.writeFileSync('./cf-leetcode.user.js', scriptContent);
console.log('Successfully generated cf-leetcode.user.js v2.0.0!');
