#!/usr/bin/env python3
"""Validate exercises.json and regenerate data.js (run after every edit)."""
import json
d=json.load(open("exercises.json"))
ids=[e["id"] for e in d["exercises"]]
assert len(ids)==len(set(ids)),"duplicate exercise ids"
for e in d["exercises"]:
    assert isinstance(e.get("weighted"),bool),"%s needs weighted true/false"%e["id"]
    assert len(e["weeks"])==d["weeks"],"exercise %s needs %d weekly entries"%(e["id"],d["weeks"])
for day in d["days"]:
    for i in day["exercises"]: assert i in ids,"unknown id "+i
open("data.js","w").write("self.PLAN="+json.dumps(d,indent=1)+";")
print("data.js written, version",d["version"])
