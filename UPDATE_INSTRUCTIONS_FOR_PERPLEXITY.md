# How Perplexity should update the KneeFit app (v5)

## Files
exercises.json (single source of truth), build_data.py, data.js (generated), app.js, index.html, sw.js, manifest.json, icons/.

## App behaviour (do not break)
- One input row PER SET. Set count comes from the target text: "3 x 10" = 3 rows; no "N x" (e.g. "30 min") = 1 row.
- Weighted exercises ("weighted": true) show weight (kg) + reps boxes per set. Unweighted show only a reps or time box per set (time if target contains sec or min).
- Optional "options": list of strings on an exercise shows an equipment dropdown on its card (used for cardio: Stationary bike / Elliptical, plus Incline treadmill walk on Saturday). The choice is saved with the entry, defaults to the last choice, and appears in Last time, the progress table and the CSV ("Equipment" column).
- Timed sets (target contains sec or min) have a Start/Stop button (seconds for sec, minutes with 1 decimal for min) and a cancel button; the box stays editable = manual override.
- Workout timer card per day: Start/Stop workout, live elapsed time, manual duration override (minutes), Reset. Submitting the day auto-stops it.
- "Finished - submit day" saves and locks the day; "Edit this day" unlocks it.
- Last-time sets of the same exercise id are shown and prefilled set by set.
- Progress tab: chart per exercise (best set), body weight, days finished per week, workout duration.
- Dates use LOCAL time (never toISOString).
- Storage: localStorage "kneefit-data" (entries {sets:[{kg,act}],choice}, finish flags, workout timers "ses-w<week>-<dayIndex>") and "kneefit-timers". Keep exercise ids stable.

## exercises.json model
- version: integer, ALWAYS +1 on every edit.
- startDate (week 1 Monday), weeks (count).
- exercises: {id (unique, no spaces), name, weighted (true/false), desc, weeks: one target string per week, options (optional list of strings)}.
- days: 7 entries Monday-Sunday, each {day, session, exercises: [ids in training order]}.

## Exercise rules
- Knee strengthening (left knee priority), weight loss, lower-back safe (no deadlifts, good-mornings, barbell rows).
- NO resistance-band exercises. Use machines, cables, dumbbells or bodyweight.
- ORDER every session for training logic: warm-up, then big compound lifts, then unilateral/assistance work, then isolation, then carries/finishers, then core, then cool-down/mobility. Alternate push/pull where sensible and put the most demanding lifts first.

## Procedure for edits
1. Edit only exercises.json following the rules above.
2. If weeks changes, every exercise needs that many entries in weeks.
3. Bump version.
4. Regenerate data.js: `self.PLAN=` + the JSON + `;` (or run build_data.py).
5. Return updated exercises.json and data.js plus a changelog. Only change app.js/index.html for new features.

## After receiving files
Upload to the GitHub repository (Add file > Upload files, same names) and commit. Open the app online once to refresh.
