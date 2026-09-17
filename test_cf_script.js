// Unit test suite for CF+ (LeetCodify Codeforces)
const assert = require('assert');

// 1. Test URL Parsing Logic
function parseProblemUrl(pathname) {
  let match = pathname.match(/\/group\/([^\/]+)\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
  if (match) {
    return { groupId: match[1], contestId: match[2], problemIndex: match[3].toUpperCase(), type: 'group' };
  }

  match = pathname.match(/\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
  if (match) {
    return { contestId: match[1], problemIndex: match[2].toUpperCase(), type: 'contest' };
  }

  match = pathname.match(/\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/i);
  if (match) {
    return { contestId: match[1], problemIndex: match[2].toUpperCase(), type: 'problemset' };
  }

  match = pathname.match(/\/gym\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
  if (match) {
    return { contestId: match[1], problemIndex: match[2].toUpperCase(), type: 'gym' };
  }

  match = pathname.match(/\/group\/[^\/]+\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
  if (match) {
    return { contestId: match[1], problemIndex: match[2].toUpperCase(), type: 'group' };
  }

  return null;
}

console.log('Testing URL Parser...');
assert.deepStrictEqual(parseProblemUrl('/contest/2000/problem/A'), {
  contestId: '2000',
  problemIndex: 'A',
  type: 'contest'
});
assert.deepStrictEqual(parseProblemUrl('/contest/1985/problem/C1'), {
  contestId: '1985',
  problemIndex: 'C1',
  type: 'contest'
});
assert.deepStrictEqual(parseProblemUrl('/problemset/problem/4/A'), {
  contestId: '4',
  problemIndex: 'A',
  type: 'problemset'
});
assert.deepStrictEqual(parseProblemUrl('/gym/102345/problem/B2'), {
  contestId: '102345',
  problemIndex: 'B2',
  type: 'gym'
});
assert.deepStrictEqual(parseProblemUrl('/group/abc1234/contest/5432/problem/D'), {
  groupId: 'abc1234',
  contestId: '5432',
  problemIndex: 'D',
  type: 'group'
});
assert.strictEqual(parseProblemUrl('/problemset'), null);
assert.strictEqual(parseProblemUrl('/contest/1234/standings'), null);
console.log('✔ URL Parser tests passed!');

// 2. Test Problem Navigation Logic
function getNextProblemIndex(currChar, delta) {
  if (currChar.length === 1 && /[A-Z]/i.test(currChar)) {
    const nextCode = currChar.toUpperCase().charCodeAt(0) + delta;
    if (nextCode >= 65 && nextCode <= 90) {
      return String.fromCharCode(nextCode);
    }
  }
  return null;
}

console.log('Testing Problem Navigation...');
assert.strictEqual(getNextProblemIndex('A', 1), 'B');
assert.strictEqual(getNextProblemIndex('B', -1), 'A');
assert.strictEqual(getNextProblemIndex('A', -1), null);
assert.strictEqual(getNextProblemIndex('Z', 1), null);
assert.strictEqual(getNextProblemIndex('C1', 1), null);
console.log('✔ Problem Navigation tests passed!');

// 3. Test Problemset Code formatting
function getSubmittedProblemCode(contestId, problemIndex) {
  return `${contestId}${problemIndex}`;
}

console.log('Testing Submitted Problem Code...');
assert.strictEqual(getSubmittedProblemCode('4', 'A'), '4A');
assert.strictEqual(getSubmittedProblemCode('2000', 'C1'), '2000C1');
console.log('✔ Submitted Problem Code tests passed!');

// 4. Test Verdict formatting
function formatVerdict(verdict, passedTests) {
  if (verdict === 'OK') return { label: 'Accepted', isAccepted: true };
  if (verdict === 'WRONG_ANSWER') return { label: `Wrong Answer on test ${passedTests + 1}`, isAccepted: false };
  if (verdict === 'TIME_LIMIT_EXCEEDED') return { label: `Time Limit Exceeded on test ${passedTests + 1}`, isAccepted: false };
  if (verdict === 'COMPILATION_ERROR') return { label: 'Compilation Error', isAccepted: false };
  return { label: verdict, isAccepted: false };
}

console.log('Testing Verdict Formatter...');
assert.deepStrictEqual(formatVerdict('OK', 15), { label: 'Accepted', isAccepted: true });
assert.deepStrictEqual(formatVerdict('WRONG_ANSWER', 3), { label: 'Wrong Answer on test 4', isAccepted: false });
assert.deepStrictEqual(formatVerdict('TIME_LIMIT_EXCEEDED', 11), { label: 'Time Limit Exceeded on test 12', isAccepted: false });
assert.deepStrictEqual(formatVerdict('COMPILATION_ERROR', 0), { label: 'Compilation Error', isAccepted: false });
console.log('✔ Verdict Formatter tests passed!');

// 5. Test Problemset Page Detection
function isProblemsetPage(pathname) {
  return (pathname === '/problemset' || pathname.startsWith('/problemset/page/')) &&
         !pathname.includes('/problemset/problem/') &&
         !pathname.includes('/problemset/submit') &&
         !pathname.includes('/problemset/customtest');
}

console.log('Testing Problemset Page Detector...');
assert.strictEqual(isProblemsetPage('/problemset'), true);
assert.strictEqual(isProblemsetPage('/problemset/page/2'), true);
assert.strictEqual(isProblemsetPage('/problemset/problem/4/A'), false);
assert.strictEqual(isProblemsetPage('/problemset/submit'), false);
assert.strictEqual(isProblemsetPage('/problemset/customtest'), false);
console.log('✔ Problemset Page Detector tests passed!');

// 6. Test CP-31 Data Completeness
const cp31 = require('./cp31_compact.json');
console.log('Testing CP-31 Sheet Completeness...');
const expectedRatings = ['800', '900', '1000', '1100', '1200', '1300', '1400', '1500', '1600'];
expectedRatings.forEach((r) => {
  assert(Array.isArray(cp31[r]), `Rating ${r} array should exist`);
  assert.strictEqual(cp31[r].length, 31, `Rating ${r} must contain exactly 31 questions`);
  cp31[r].forEach(([contestId, index, title, rating]) => {
    assert(typeof title === 'string' && title.length > 0, 'Problem title must be non-empty');
    assert.strictEqual(typeof rating, 'number', 'Rating must be a number');
  });
});
console.log('✔ CP-31 Sheet (all 279 questions across 9 ratings) verified!');

console.log('\nALL 6 TEST SUITES PASSED SUCCESSFULLY! 🎉');
