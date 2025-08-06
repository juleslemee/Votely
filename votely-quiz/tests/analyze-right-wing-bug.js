// Analyze why all right-wing ideologies are scoring as economically left

const examples = [
  { name: "Mussolini", expected: "ER-GL", got: "EL-GL", economicScore: -34.7 },
  { name: "Reagan", expected: "ER-GM", got: "EL-GM", economicScore: -43.6 },
  { name: "Thatcher", expected: "ER-GM", got: "EL-GM", economicScore: -52.9 },
  { name: "Rothbard", expected: "ER-GR", got: "EL-GR", economicScore: -74.7 },
  { name: "Friedman", expected: "ER-GR", got: "EL-GR", economicScore: -63.2 }
];

console.log('🐛 Right-Wing Economic Scoring Bug Analysis\n');

console.log('All right-wing ideologies are scoring as economically LEFT!\n');

console.log('Examples:');
examples.forEach(e => {
  console.log(`${e.name}: Expected ${e.expected}, got ${e.got} (Econ: ${e.economicScore})`);
});

console.log('\n🔍 Root Cause Analysis:\n');

console.log('The bug is in the beliefToAnswers function:');
console.log(`
economic: {
  redistribution: belief.economic,      // ✅ Correct: high = left
  freeTaxes: 1 - belief.economic,       // ❌ INVERTED! Should be belief.economic for right
  freeMarket: 1 - belief.economic,     // ❌ INVERTED! Should be belief.economic for right
  regulation: belief.economic,          // ✅ Correct: high = left  
  healthcare: belief.economic,          // ✅ Correct: high = left
  welfare: 1 - belief.economic,         // ❌ INVERTED! Should be belief.economic for right
  unions: belief.economic * 0.8,        // ✅ Correct: high = left
  privatization: 1 - belief.economic    // ❌ INVERTED! Should be belief.economic for right
}
`);

console.log('\n💡 The Fix:');
console.log('For right-wing ideologies (belief.economic > 0.5):');
console.log('- freeTaxes should be HIGH (support tax cuts)');
console.log('- freeMarket should be HIGH (support capitalism)');
console.log('- welfare should be HIGH (welfare skepticism)'); 
console.log('- privatization should be HIGH (support privatization)');

console.log('\nBut the current formula inverts these, making right-wingers answer like leftists!');

console.log('\n✅ Corrected mapping should be:');
console.log(`
economic: {
  redistribution: 1 - belief.economic,  // Low for right
  freeTaxes: belief.economic,          // High for right
  freeMarket: belief.economic,         // High for right
  regulation: 1 - belief.economic,     // Low for right
  healthcare: 1 - belief.economic,     // Low for right
  welfare: belief.economic,            // High for right (skepticism)
  unions: (1 - belief.economic) * 0.8, // Low for right
  privatization: belief.economic       // High for right
}
`);

console.log('\nThis explains why:');
console.log('- 0/9 right-authoritarian ideologies succeeded');
console.log('- 0/9 right-moderate ideologies succeeded');
console.log('- 0/9 right-libertarian ideologies succeeded');
console.log('- All scored as economically LEFT instead of RIGHT');