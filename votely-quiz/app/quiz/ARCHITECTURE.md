# Quiz Architecture Documentation

## Overview
The Votely quiz system consists of several key components working together to provide an interactive political alignment assessment.

## Directory Structure

```
app/quiz/
├── page.tsx                 # Main quiz route
├── quiz-page-client.tsx     # Quiz implementation with sliders
├── questions.ts             # Question bank with scores
├── results/
│   ├── page.tsx            # Results route
│   ├── results-client.tsx  # Results display logic
│   └── types.ts            # Type definitions
└── next/
    ├── page.tsx            # Next steps route
    └── next-steps-client.tsx
```

## Active Data Flow

1. **Quiz Entry** (`/quiz`)
   - User selects quiz type: `short` (10 questions) or `long` (50 questions)
   - Routes to `page.tsx` which renders `quiz-page-client.tsx`

2. **Question Flow**
   - Questions loaded from `questions.ts`
   - Each question has 3 score dimensions: economic, social, progressive
   - User answers via slider (0-1 scale)
   - Answers stored in state array

3. **Score Calculation**
   - `calculateScores()` in `/lib/quiz.ts` processes answers
   - Generates 3 primary scores: economic, social, progressive
   - For long quiz: also calculates supplement axes scores

4. **Results Display** (`/quiz/results`)
   - Passes answers via URL params
   - `results-client.tsx` handles:
     - Score calculation
     - Ideology determination
     - 3D visualization
     - Firebase analytics
     - Share functionality

5. **Sharing System**
   - `UnifiedShareModal` provides all sharing options
   - Three rendering contexts:
     - Modal UI (user interface)
     - Static screenshots (2D/3D images)
     - GIF frames (rotating animation)

## Key Components

### Core Quiz Components
- **QuizPageClient**: Main quiz interface with sliders
- **ResultsClient**: Results display with 3D cube
- **UnifiedShareModal**: Comprehensive sharing functionality

### Visualization Components
- **ResultCube**: 3D political cube visualization
- **AdaptivePoliticalCompass**: 2D grid visualization
- **SupplementAxes**: Additional axes for long quiz

### Supporting Components
- **AboutCreator**: Creator info and feedback form
- **AxisLabels**: Labels for 3D visualization

## State Management
- Local React state for quiz progress
- URL params for passing results
- Firebase for analytics and persistence

## Maintenance Notes
1. Always test both short and long quiz flows
2. Update both GIF and static screenshot contexts when changing styles
3. Use inline styles for html2canvas compatibility
4. Verify Firebase analytics after changes
5. Test share functionality across all formats (2D, 3D, GIF)