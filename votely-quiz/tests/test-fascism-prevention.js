// Test to ensure moderate Phase 2 answers don't lead to extreme ideologies
// Specifically testing the ER-GL (top-right) macro cell where Fascism lives

console.log('🚨 Fascism Prevention Test\n');
console.log('Testing that moderate Phase 2 answers in ER-GL macro cell');
console.log('do not result in extreme ideologies like Fascism\n');

// Ideologies in ER-GL macro cell (from most to least extreme)
const ER_GL_IDEOLOGIES = [
  { name: 'Fascism', extremism: 10, coordinates: { A: 100, B: 100, C: -100, D: 100 } },
  { name: 'Nazism', extremism: 10, coordinates: { A: 100, B: 100, C: -100, D: 100 } },
  { name: 'Francoism', extremism: 8, coordinates: { A: 80, B: 50, C: 50, D: 50 } },
  { name: 'Military Dictatorship', extremism: 7, coordinates: { A: 50, B: 0, C: 0, D: 80 } },
  { name: 'Monarchism', extremism: 5, coordinates: { A: 100, B: -50, C: 100, D: -50 } },
  { name: 'Theocracy', extremism: 6, coordinates: { A: 100, B: -100, C: 100, D: -100 } },
  { name: 'Corporatism', extremism: 4, coordinates: { A: -50, B: 0, C: 50, D: 0 } },
  { name: 'Paternalistic Conservatism', extremism: 3, coordinates: { A: 0, B: -50, C: 50, D: -50 } },
  { name: 'Authoritarian Capitalism', extremism: 4, coordinates: { A: -50, B: -50, C: 0, D: 0 } }
];

// Weighted distance calculation
function calculateWeightedDistance(userX, userY, userSupp, ideologyX, ideologyY, ideologySupp) {
  // Phase 1 with half weight
  const xDist = 0.5 * Math.pow(userX - ideologyX, 2);
  const yDist = 0.5 * Math.pow(userY - ideologyY, 2);
  
  // Phase 2 with full weight
  const aDist = 1.0 * Math.pow(userSupp.A - ideologySupp.A, 2);
  const bDist = 1.0 * Math.pow(userSupp.B - ideologySupp.B, 2);
  const cDist = 1.0 * Math.pow(userSupp.C - ideologySupp.C, 2);
  const dDist = 1.0 * Math.pow(userSupp.D - ideologySupp.D, 2);
  
  return Math.sqrt(xDist + yDist + aDist + bDist + cDist + dDist);
}

// Find closest ideology
function findClosestIdeology(userX, userY, userSupp) {
  let closest = null;
  let minDistance = Infinity;
  
  ER_GL_IDEOLOGIES.forEach(ideology => {
    // All ideologies in ER-GL have similar Phase 1 coordinates
    const ideologyX = 70; // Right
    const ideologyY = 70; // Authoritarian
    
    const distance = calculateWeightedDistance(
      userX, userY, userSupp,
      ideologyX, ideologyY, ideology.coordinates
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closest = ideology;
    }
  });
  
  return { ideology: closest, distance: minDistance };
}

// Test scenarios
const testScenarios = [
  {
    name: 'All Phase 2 answers neutral (0.5)',
    phase1: { x: 70, y: 70 },
    phase2: { A: 0, B: 0, C: 0, D: 0 }
  },
  {
    name: 'Slightly conservative Phase 2',
    phase1: { x: 70, y: 70 },
    phase2: { A: 20, B: -20, C: 20, D: -20 }
  },
  {
    name: 'Mixed moderate Phase 2',
    phase1: { x: 70, y: 70 },
    phase2: { A: -30, B: 30, C: -30, D: 30 }
  },
  {
    name: 'All Phase 2 slightly negative',
    phase1: { x: 70, y: 70 },
    phase2: { A: -40, B: -40, C: -40, D: -40 }
  },
  {
    name: 'User barely in ER-GL (edge of macro cell)',
    phase1: { x: 35, y: 35 },
    phase2: { A: 0, B: 0, C: 0, D: 0 }
  },
  {
    name: 'Extreme Phase 2 (should get extreme ideology)',
    phase1: { x: 70, y: 70 },
    phase2: { A: 100, B: 100, C: -100, D: 100 }
  }
];

console.log('Test Results:\n');

testScenarios.forEach(scenario => {
  console.log(`📋 ${scenario.name}`);
  console.log(`   Phase 1: Economic=${scenario.phase1.x}, Authority=${scenario.phase1.y}`);
  console.log(`   Phase 2: A=${scenario.phase2.A}, B=${scenario.phase2.B}, C=${scenario.phase2.C}, D=${scenario.phase2.D}`);
  
  const result = findClosestIdeology(
    scenario.phase1.x,
    scenario.phase1.y,
    scenario.phase2
  );
  
  console.log(`   Result: ${result.ideology.name} (extremism level: ${result.ideology.extremism}/10)`);
  console.log(`   Distance: ${result.distance.toFixed(2)}`);
  
  if (result.ideology.extremism >= 8 && scenario.name.includes('neutral') || scenario.name.includes('moderate')) {
    console.log('   ⚠️  WARNING: Moderate answers led to extreme ideology!');
  } else if (result.ideology.extremism < 5) {
    console.log('   ✅ Good: Moderate answers led to moderate ideology');
  }
  
  console.log();
});

// Calculate distances to all ideologies for neutral Phase 2
console.log('\n📊 Distance Analysis for Neutral Phase 2 Answers:\n');
const neutralUser = { x: 70, y: 70, A: 0, B: 0, C: 0, D: 0 };

const distances = ER_GL_IDEOLOGIES.map(ideology => {
  const distance = calculateWeightedDistance(
    neutralUser.x, neutralUser.y, neutralUser,
    70, 70, ideology.coordinates
  );
  return { name: ideology.name, extremism: ideology.extremism, distance };
}).sort((a, b) => a.distance - b.distance);

distances.forEach((item, index) => {
  console.log(`${index + 1}. ${item.name} - Distance: ${item.distance.toFixed(2)}, Extremism: ${item.extremism}/10`);
});

console.log('\n🔍 Analysis:');
console.log('- Phase 2 axes have full weight (1.0) vs Phase 1 half weight (0.5)');
console.log('- This gives Phase 2 questions 4x total influence (4 axes vs 2 axes)');
console.log('- Neutral Phase 2 answers (all 0) should lead to moderate ideologies');
console.log('- Extreme Phase 2 answers should lead to extreme ideologies');
console.log('- The weighted distance ensures Phase 2 has major influence on final placement');

console.log('\n💡 Recommendations:');
console.log('1. Ensure extreme ideologies have extreme coordinates on at least 2 Phase 2 axes');
console.log('2. Place moderate ideologies near the center of Phase 2 space');
console.log('3. Consider adding a "extremism penalty" for edge cases');
console.log('4. Log actual user distributions to verify no systematic bias');
console.log('5. Add safeguards if > X% of users get extreme ideologies');

console.log('\n✅ Fascism prevention test completed!');