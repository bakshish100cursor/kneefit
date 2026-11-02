# How Perplexity should update the KneeFit app (v3)

## Files
exercises.json (single source of truth), build_data.py, data.js (generated), app.js, index.html, sw.js, manifest.json, icons/.

## App behaviour (do not break)
- One input row PER SET. The set count comes from the target text: "3 x 10" means 3 rows; a target without "N x" (e.g. "30 min") means 1 row.
- Weighted exercises ("weighted": true) show weight (kg) + reps boxes per set. Unweighted exercises show only a reps or time box per set (time if the target contains sec or min).
- No pain score.
- "Finished - submit day" saves and locks the day; "Edit this day" unlocks it.
- Last-time sets of the same exercise id are shown and prefilled set by set.
- Progress tab: line chart per exercise using the best set (max weight, or max reps/time), body weight chart, days finished per week.
- Dates use LOCAL time (never toISOString) so the weekday and date match.
- Data is in localStorage key "kneefit-data", keyed by week, day index and exercise id (value {sets:[{kg,act}]}). Keep ids stable. Old single-entry data {kg,act} is still read as set 1.

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
Replace exercises.json and data.js in the GitHub repository (Add file > Upload files, same names). Open the app online once to refresh.
