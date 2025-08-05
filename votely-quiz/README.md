# Votely Political Quiz System

## Overview

This is a sophisticated two-phase political ideology quiz that maps users onto a 3-axis political compass and then into a detailed 9x9 grid of specific ideologies. The quiz uses a combination of core questions, tiebreaker logic, and refinement questions to accurately place users within the political spectrum.

## Political Axes

The quiz measures three primary political dimensions:

1. **Economic Axis**: Left (-1) to Right (+1)
   - Left: Government intervention, redistribution, regulation
   - Right: Free markets, low taxes, minimal economic regulation

2. **Authority Axis**: Libertarian (-1) to Authoritarian (+1)
   - Libertarian: Individual freedom, limited government, personal autonomy
   - Authoritarian: Strong government, law and order, collective security

3. **Social Axis**: Progressive (-1) to Conservative (+1)
   - Progressive: Social change, diversity, secular governance
   - Conservative: Traditional values, cultural preservation, moral standards

## Quiz Structure

### Phase 1: Macro-Cell Placement (34 Questions)

**Core Questions (30 total)**:
- 10 Economic questions (5 left-leaning, 5 right-leaning)
- 10 Authority questions (5 libertarian, 5 authoritarian)
- 10 Social questions (5 progressive, 5 conservative)

**Tiebreaker Questions (4 total)**:
- 2 Economic tiebreakers (1 left, 1 right)
- 2 Authority tiebreakers (1 libertarian, 1 authoritarian)

### Phase 2: Ideology Refinement (180 Questions)

After Phase 1 determines the user's macro-cell (3x3 grid position), Phase 2 uses 20 specialized questions to pinpoint their exact ideology within that cell.

**Question Structure**: 5 questions per axis, 4 axes per macro-cell
- Format: `{MACRO_CELL}-{AXIS}-{NUMBER}`
- Example: `ELGL-A-01` = EL-GL macro-cell, Axis A, Question 1

## Question ID System

### Phase 1 IDs
- **Core Questions**: `P01` through `P30`
- **Tiebreaker Questions**: `T01` through `T04`

### Phase 2 IDs
Format: `{ECONOMIC}{AUTHORITY}-{AXIS}-{NUMBER}`

**Macro-Cells**:
- `ELGL`: Economic Left, Government Left (Revolutionary Communism)
- `EMGL`: Economic Middle, Government Left (Authoritarian Progressivism)
- `ERGL`: Economic Right, Government Left (Authoritarian Right)
- `ELGM`: Economic Left, Government Middle (Democratic Socialism)
- `EMGM`: Economic Middle, Government Middle (Liberal Center)
- `ERGM`: Economic Right, Government Middle (Conservative Capitalism)
- `ELGR`: Economic Left, Government Right (Libertarian Socialism)
- `EMGR`: Economic Middle, Government Right (Social-Market Libertarianism)
- `ERGR`: Economic Right, Government Right (Anarcho-Capitalism)

**Axes per Macro-Cell**: A, B, C, D (4 axes each)
**Questions per Axis**: 01-05 (5 questions each)

## Priority System

Questions have priority ratings for different quiz lengths:

- **Priority 2**: Essential questions for short (10-question) quiz
- **Priority 1**: Important questions for medium-length quiz
- **Priority 0**: Additional questions for comprehensive quiz

### 10-Question Short Quiz
Uses exactly 10 Priority 2 questions:
- 4 Economic (2 left, 2 right)
- 4 Authority (2 libertarian, 2 authoritarian)
- 2 Social (1 progressive, 1 conservative)

## Tiebreaker Logic

When axes are unclear after core questions:

1. **Economic or Authority ties**: Ask relevant tiebreaker questions
2. **Social axis unclear**: Reduce social questions, prioritize economic/authority
3. **No "close on social" case**: Social questions are simply deprioritized when other axes need clarification

## Question Characteristics

- **Length**: Under 120 characters
- **Direction**: "Strongly Agree" pushes toward +1 (right/authoritarian/conservative)
- **Balance**: Equal numbers of questions pushing each direction per axis
- **Topics**: Cover diverse political subjects within each axis

## Implementation Requirements

### Question Shuffling
- Randomize question order within each phase
- Maintain axis balance in shortened versions
- Ensure tiebreaker questions only appear when needed

### Scoring Algorithm
1. **Phase 1**: Calculate axis scores from responses
2. **Macro-cell determination**: Map scores to 3x3 grid
3. **Tiebreaker activation**: If any axis score is within threshold, ask tiebreakers
4. **Phase 2**: Use axis-specific questions to refine position within macro-cell

### Response Scale
- Strongly Disagree: -2
- Disagree: -1
- Neutral: 0
- Agree: +1
- Strongly Agree: +2

### Adaptive Logic
- Monitor axis clarity during Phase 1
- Trigger tiebreakers for unclear axes
- Adjust social question frequency based on economic/authority clarity
- Select appropriate Phase 2 questions based on macro-cell placement

## File Structure

- `political_quiz_final.tsv`: Complete question bank (214 questions)
- `phase1_questions.tsv`: Phase 1 questions only (34 questions)
- `Votely - grid - supplement-axes.tsv`: Phase 2 axis definitions
- `Votely - grid - grid details.tsv`: Ideology descriptions and examples

## Data Format

TSV (Tab-Separated Values) with columns:
- `id`: Unique question identifier
- `text`: Question content
- `axis`: Political axis (econ/auth/soc for Phase 1, specific axis for Phase 2)
- `agree_dir`: Direction that "agree" pushes (-1 or +1)
- `topic`: Subject category
- `priority`: Question priority (0, 1, or 2)
- `type`: Question type (core, tiebreaker, or refinement)
- `notes`: Additional context or usage notes

## Next Development Steps

1. **Quiz Engine**: Implement adaptive questioning logic
2. **Scoring System**: Calculate axis positions and macro-cell placement
3. **Result Visualization**: Display user position on political compass and grid
4. **Question Randomization**: Shuffle questions while maintaining balance
5. **Progress Tracking**: Show quiz completion and estimated time
6. **Result Interpretation**: Provide detailed ideology explanations
7. **Social Features**: Allow result sharing and comparison
8. **Analytics**: Track question effectiveness and user patterns

## Testing Considerations

- Validate axis balance across all quiz lengths
- Test tiebreaker triggering conditions
- Verify macro-cell mapping accuracy
- Ensure question randomization maintains statistical validity
- Test edge cases (extreme positions, neutral responses)