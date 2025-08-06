// Analyze the 4 failed ideologies from the 36 ideology test

const FAILED_PERSONAS = [
  {
    name: "Francisco Franco",
    expected: "ER-GL",
    got: "EM-GL", 
    scores: { economic: 29.5, authority: 76.0, cultural: 63.5 },
    analysis: "Economic score of 29.5 is in CENTER range (-33 to 33), not RIGHT (>33). Needs to be more economically right-wing."
  },
  {
    name: "Viktor Orbán",
    expected: "ER-GM",
    got: "EM-GL",
    scores: { economic: 16.3, authority: 40.4, cultural: 81.6 },
    analysis: "Two issues: 1) Economic 16.3 is CENTER not RIGHT. 2) Authority 40.4 is AUTHORITARIAN not MODERATE."
  },
  {
    name: "Friedrich Hayek",
    expected: "EM-GR",
    got: "ER-GR",
    scores: { economic: 36.3, authority: -41.7, cultural: -10.7 },
    analysis: "Economic score of 36.3 is just over RIGHT threshold (>33). Too economically right for CENTER."
  },
  {
    name: "Robert Nozick",
    expected: "EM-GR", 
    got: "ER-GR",
    scores: { economic: 52.9, authority: -71.5, cultural: -34.8 },
    analysis: "Economic score of 52.9 is clearly RIGHT, not CENTER. Minarchism is being scored as too economically right."
  }
];

console.log('📊 Analysis of 4 Failed Ideologies\n');
console.log('Thresholds: LEFT < -33 | CENTER -33 to 33 | RIGHT > 33\n');

FAILED_PERSONAS.forEach(p => {
  console.log(`${p.name}`);
  console.log(`Expected: ${p.expected} | Got: ${p.got}`);
  console.log(`Scores: Econ=${p.scores.economic}, Auth=${p.scores.authority}`);
  console.log(`Analysis: ${p.analysis}`);
  console.log();
});

console.log('💡 Summary:');
console.log('- Franco: Too economically centrist (29.5 vs need >33)');
console.log('- Orbán: Both axes wrong - too centrist economically AND too authoritarian');
console.log('- Hayek & Nozick: Too economically right-wing for center-libertarian placement');
console.log('\nThese edge cases show the importance of:');
console.log('1. Careful belief calibration near boundaries');
console.log('2. Tiebreaker questions for scores near ±33');
console.log('3. Phase 2 for fine-tuning within macro cells');