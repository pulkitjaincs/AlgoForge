import assert from 'node:assert';

const parseCSVLine = (text) => {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
};

const parseCSV = (content) => {
  const lines = content.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) {
    return { error: 'CSV file has no data rows' };
  }

  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/["']/g, ''));
  const topicIdx = headers.findIndex((h) => h.includes('topic') && !h.includes('sub'));
  const subtopicIdx = headers.findIndex((h) => h.includes('subtopic') || h.includes('sub_topic'));
  const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('problem') || h.includes('question'));
  const diffIdx = headers.findIndex((h) => h.includes('diff'));
  const urlIdx = headers.findIndex((h) => h.includes('url') || h.includes('link'));

  if (titleIdx === -1) {
    return { error: 'Could not find a "Title" or "Problem" column in CSV' };
  }

  const topicMap = new Map();

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    const clean = (val) => (val || '').trim().replace(/^["']|["']$/g, '');

    const topicName = topicIdx !== -1 && row[topicIdx] ? clean(row[topicIdx]) : 'General Practice';
    const subtopicName = subtopicIdx !== -1 && row[subtopicIdx] ? clean(row[subtopicIdx]) : 'Core Problems';
    const title = clean(row[titleIdx]);
    if (!title) continue;

    let difficulty = 'Medium';
    if (diffIdx !== -1 && row[diffIdx]) {
      const d = clean(row[diffIdx]).toLowerCase();
      if (d.includes('easy')) difficulty = 'Easy';
      else if (d.includes('hard')) difficulty = 'Hard';
      else if (d.includes('basic')) difficulty = 'Basic';
    }

    const problemUrl = urlIdx !== -1 && row[urlIdx] ? clean(row[urlIdx]) : '';

    if (!topicMap.has(topicName)) {
      topicMap.set(topicName, new Map());
    }
    const subMap = topicMap.get(topicName);
    if (!subMap.has(subtopicName)) {
      subMap.set(subtopicName, []);
    }

    subMap.get(subtopicName).push({
      title,
      difficulty,
      problemUrl: problemUrl.startsWith('http') ? problemUrl : '#',
      platform: problemUrl.includes('codeforces') ? 'codeforces' : 'leetcode',
      companyTags: [],
    });
  }

  const result = [];
  topicMap.forEach((subMap, topicTitle) => {
    const subtopics = [];
    subMap.forEach((questions, subTitle) => {
      subtopics.push({ title: subTitle, questions });
    });
    result.push({
      title: topicTitle,
      description: `Imported from CSV (${subtopics.reduce((acc, s) => acc + s.questions.length, 0)} questions)`,
      subtopics,
      subTopics: subtopics,
    });
  });

  if (result.length === 0) {
    return { error: 'No valid problems parsed from CSV' };
  }

  return { result };
};

const parsePastedContent = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const json = JSON.parse(trimmed);
      const rawList = Array.isArray(json) ? json : json.topics || [];
      const normalized = rawList.map((t) => {
        const subList = t.subtopics || t.subTopics || [];
        return {
          title: t.title || 'Untitled Topic',
          description: t.description || '',
          subtopics: subList,
          subTopics: subList,
        };
      });
      return { type: 'json', data: normalized };
    } catch {
      return { error: 'Invalid JSON syntax' };
    }
  }

  return { type: 'csv', ...parseCSV(trimmed) };
};

// -------------------------------------------------------------
// Adversarial Stress Tests
// -------------------------------------------------------------

console.log('Testing parseCSVLine with quotes and commas...');
const line1 = parseCSVLine('"Dynamic Programming","Knapsack, Unbounded","0/1 Knapsack",Hard,https://leetcode.com/problems/knapsack');
assert.strictEqual(line1.length, 5);
assert.strictEqual(line1[0], 'Dynamic Programming');
assert.strictEqual(line1[1], 'Knapsack, Unbounded');
assert.strictEqual(line1[2], '0/1 Knapsack');
assert.strictEqual(line1[3], 'Hard');
assert.strictEqual(line1[4], 'https://leetcode.com/problems/knapsack');
console.log('✓ parseCSVLine correctly preserved comma inside quotes and stripped outer quotes');

console.log('Testing escaped quotes...');
const line2 = parseCSVLine('Arrays,Basics,"Search in ""Rotated"" Array",Medium,https://leetcode.com/problems/search');
assert.strictEqual(line2.length, 5);
assert.strictEqual(line2[2], 'Search in "Rotated" Array');
console.log('✓ parseCSVLine correctly unescaped double quotes');

console.log('Testing multi-word titles with spaces...');
const csvMultiWord = `Topic,Subtopic,Title,Difficulty,URL
Graphs,Breadth First Search,Word Ladder II,Hard,https://leetcode.com/problems/word-ladder-ii
Dynamic Programming,2D DP,Longest Common Subsequence,Medium,https://leetcode.com/problems/longest-common-subsequence`;
const resMulti = parseCSV(csvMultiWord);
assert(!resMulti.error, 'Should not error on multi-word titles');
assert.strictEqual(resMulti.result.length, 2);
assert.strictEqual(resMulti.result[0].subtopics[0].questions[0].title, 'Word Ladder II');
assert.strictEqual(resMulti.result[1].subtopics[0].questions[0].title, 'Longest Common Subsequence');
console.log('✓ Multi-word titles and subtopics preserved with full spacing');

console.log('Testing empty fields without shifting columns...');
const csvEmptyFields = `Topic,Subtopic,Title,Difficulty,URL
Graphs,,Dijkstra Shortest Path,Medium,https://leetcode.com/problems/dijkstra
,Two Pointers,Trapping Rain Water,Hard,https://leetcode.com/problems/trapping-rain-water
Strings,Basics,Valid Anagram,,
Sorting,Quick,Partition Array,,,`;
const resEmpty = parseCSV(csvEmptyFields);
assert(!resEmpty.error, 'Should not error on empty columns');
// Check Dijkstra: subtopic was empty, so defaulted to 'Core Problems'
const graphsTopic = resEmpty.result.find(t => t.title === 'Graphs');
assert(graphsTopic, 'Graphs topic must exist');
assert.strictEqual(graphsTopic.subtopics[0].title, 'Core Problems');
assert.strictEqual(graphsTopic.subtopics[0].questions[0].title, 'Dijkstra Shortest Path');
assert.strictEqual(graphsTopic.subtopics[0].questions[0].difficulty, 'Medium');

// Check Trapping Rain Water: topic was empty, defaulted to 'General Practice'
const genTopic = resEmpty.result.find(t => t.title === 'General Practice');
assert(genTopic, 'General Practice topic must exist');
assert.strictEqual(genTopic.subtopics[0].title, 'Two Pointers');
assert.strictEqual(genTopic.subtopics[0].questions[0].title, 'Trapping Rain Water');
assert.strictEqual(genTopic.subtopics[0].questions[0].difficulty, 'Hard');

// Check Valid Anagram: difficulty empty, defaults to 'Medium', url empty defaults to '#'
const stringsTopic = resEmpty.result.find(t => t.title === 'Strings');
assert.strictEqual(stringsTopic.subtopics[0].questions[0].difficulty, 'Medium');
assert.strictEqual(stringsTopic.subtopics[0].questions[0].problemUrl, '#');
console.log('✓ Empty columns handled gracefully without column shifting');

console.log('Testing JSON vs CSV detection in parsePastedContent...');
const jsonInput = JSON.stringify([
  {
    title: 'Dynamic Programming',
    subtopics: [
      {
        title: '1D DP',
        questions: [{ title: 'Climbing Stairs', difficulty: 'Easy', problemUrl: '#' }]
      }
    ]
  }
]);
const parsedJson = parsePastedContent(jsonInput);
assert.strictEqual(parsedJson.type, 'json');
assert.strictEqual(parsedJson.data.length, 1);
assert.strictEqual(parsedJson.data[0].title, 'Dynamic Programming');
assert(parsedJson.data[0].subtopics && parsedJson.data[0].subTopics, 'Must have both subtopics and subTopics');

const jsonObjectInput = JSON.stringify({
  topics: [
    {
      title: 'Trees',
      subTopics: [
        {
          title: 'Binary Trees',
          questions: [{ title: 'Invert Binary Tree' }]
        }
      ]
    }
  ]
});
const parsedJsonObj = parsePastedContent(jsonObjectInput);
assert.strictEqual(parsedJsonObj.type, 'json');
assert.strictEqual(parsedJsonObj.data.length, 1);
assert.strictEqual(parsedJsonObj.data[0].title, 'Trees');
assert.strictEqual(parsedJsonObj.data[0].subtopics[0].title, 'Binary Trees');

const malformedJson = '[{"title": "Unclosed Object"';
const parsedBadJson = parsePastedContent(malformedJson);
assert.strictEqual(parsedBadJson.error, 'Invalid JSON syntax');

const standardCSV = `Topic,Subtopic,Title\nTrees,BST,Search in BST`;
const parsedCSVContent = parsePastedContent(standardCSV);
assert.strictEqual(parsedCSVContent.type, 'csv');
assert.strictEqual(parsedCSVContent.result.length, 1);
console.log('✓ parsePastedContent accurately distinguishes JSON from CSV, rejects bad JSON');

console.log('ALL CSV/JSON IMPORTER EMPIRICAL STRESS TESTS PASSED!');
