# How Perplexity should update the KneeFit app (v2)

## Files
exercises.json (single source of truth), build_data.py, data.js (generated), app.js, index.html, sw.js, manifest.json, icons/.

## App behaviour (do not break)
- Weight field only appears for exercises with "weighted": true. Planks, cardio, band and bodyweight moves are false.
- No pain score. Each exercise has a reps-or-time field (labelled "Time done" if the target contains sec or min).
- "Finished - submit day" saves the day and locks it; "Edit this day" unlocks it.
- Last-time weight/time of the same exercise id is shown and prefilled.
- Progress tab: line chart per exercise (weight if weighted, otherwise the number done), body weight chart, days finished per week.
- Data is in localStorage key "kneefit-data", keyed by week, day index and exercise id. Keep ids stable.

## exercises.json model
- version: integer, ALWAYS +1 on every edit.
- startDate (week 1 Monday, YYYY-MM-DD), weeks (count).
- exercises: {id (unique, no spaces), name, weighted (true/false), desc, weeks: one target string per week, e.g. "3 x 10 each" or "30 min"}.
- days: 7 entries Monday-Sunday, each {day, session, exercises: [ids]}.

## Procedure for edits
1. Edit only exercises.json. Keep the plan knee-strengthening, weight-loss oriented and lower-back safe (no deadlifts, good-mornings, barbell rows).
2. If weeks changes, every exercise needs that many entries in weeks.
3. Bump version.
4. Regenerate data.js: `self.PLAN=` + the JSON + `;` (or run build_data.py).
5. Return updated exercises.json and data.js plus a changelog. Only change app.js/index.html for new features.

## After receiving files
Replace exercises.json and data.js in the hosted folder (GitHub repo). Open the app online once to refresh.
