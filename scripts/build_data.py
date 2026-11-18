import json, re
R = "/home/claude/istqb-exam-app/"
D = R + "src/data/"
syl = json.load(open(D + "syllabus.json"))
lo_map = {}
for ch in syl["chapters"]:
    for s in ch["sections"]:
        for lo in s["learningObjectives"]:
            lo_map[lo["id"]] = {"chapter": ch["number"], "chapterTitle": ch["title"], "section": s["number"], "sectionTitle": s["title"],
                                "learningObjective": lo["id"], "learningObjectiveText": lo["text"]}

META = {  # source document versions and syllabus compatibility, read from each document's cover page
    "A": {"qv": "1.7", "av": "1.7", "syl": "4.0.1", "rel": "April 1, 2025"},
    "B": {"qv": "1.7", "av": "1.7", "syl": "4.0.1", "rel": "April 1, 2025"},
    "C": {"qv": "1.6", "av": "1.6", "syl": "4.0", "rel": "March 25, 2025"},
    "D": {"qv": "1.5", "av": "1.5", "syl": "4.0", "rel": "May 2, 2025"},
}
clean = lambda s: re.sub(r"\s+", " ", s).strip()
exams = []
problems = []


def build(sid, items, answers, exam_id):
    out = []
    for n, q in enumerate(items, 1):
        a = answers[q["id"]]
        ref = lo_map.get(a["lo"])
        if not ref:
            problems.append((exam_id, q["id"], "LO not in syllabus: " + a["lo"]))
            continue
        opts = [{"id": o[0], "text": clean(o[1])} for o in q["options"]]
        just = {k: clean(v) for k, v in a["options"].items()}
        out.append({
            "id": f"{exam_id}-q{n:02d}",
            "examinationId": exam_id,
            "questionNumber": n,
            "sourceNumber": q["id"],
            "type": "multiple-select" if len(a["correct"]) > 1 else "single-choice",
            "selectCount": len(a["correct"]),
            "question": q["stem"].strip(),
            "stemImage": q["stemImage"],
            "options": opts,
            "correctAnswer": a["correct"],
            "explanation": {
                "source": "official",
                "general": clean(a["general"]),
                "options": {k: {"correct": k in a["correct"], "text": v} for k, v in just.items()},
            },
            "syllabusReference": {k: ref[k] for k in ("chapter", "chapterTitle", "section", "sectionTitle")},
            "learningObjective": {"id": a["lo"], "text": ref["learningObjectiveText"], "kLevel": a["k"]},
            "kLevel": a["k"],
            "marks": a["points"],
        })
    return out


for sid in "ABCD":
    raw = json.load(open(f"{R}scripts/raw-{sid}.json"))
    m = META[sid]
    main = [q for q in raw["q"] if not q["id"].startswith("A")]
    add = [q for q in raw["q"] if q["id"].startswith("A")]
    eid = f"sample-{sid.lower()}"
    qs = build(sid, main, raw["a"], eid)
    json.dump(qs, open(f"{D}questions/{eid}.json", "w"), indent=1, ensure_ascii=False)
    exams.append({
        "id": eid, "title": f"ISTQB Foundation Level – Sample Exam {sid}", "kind": "official-structure",
        "questionDocumentVersion": m["qv"], "answerDocumentVersion": m["av"], "released": m["rel"],
        "syllabusVersion": m["syl"], "totalQuestions": len(qs), "totalMarks": sum(q["marks"] for q in qs),
        "passMarkPoints": 26, "passMarkPercent": 65, "durationMinutes": 60, "extraTimePercent": 25,
        "realTimeAvailable": True, "available": True, "questionFile": f"{eid}.json",
    })
    if add:
        aid = f"sample-{sid.lower()}-additional"
        aq = build(sid, add, raw["a"], aid)
        json.dump(aq, open(f"{D}questions/{aid}.json", "w"), indent=1, ensure_ascii=False)
        exams.append({
            "id": aid, "title": f"ISTQB Foundation Level – Sample Exam {sid} (Additional Questions)", "kind": "additional",
            "questionDocumentVersion": m["qv"], "answerDocumentVersion": m["av"], "released": m["rel"],
            "syllabusVersion": m["syl"], "totalQuestions": len(aq), "totalMarks": sum(q["marks"] for q in aq),
            "passMarkPoints": None, "passMarkPercent": None, "durationMinutes": None, "extraTimePercent": None,
            "realTimeAvailable": False, "available": True, "questionFile": f"{aid}.json",
            "note": "Additional questions published with Sample Exam A. They are not part of the 40-question exam structure, so the supplied documents define no duration or pass mark for them.",
        })

json.dump(exams, open(D + "examinations.json", "w"), indent=1, ensure_ascii=False)
json.dump({
    "source": "ISTQB Exam Structures and Rules v1.2 (May 2, 2025) and Exam Structure Tables v1.17 (CTFL v4.0)",
    "foundation": {"questions": 40, "points": 40, "passPercent": 65, "passPoints": 26, "durationMinutes": 60,
                   "extraTimePercentNonNativeLanguage": 25, "pointsPerQuestion": 1,
                   "kLevels": {"K1": 8, "K2": 24, "K3": 8},
                   "perChapter": {"1": 8, "2": 6, "3": 4, "4": 11, "5": 9, "6": 2}},
    "multipleChoiceRule": "Questions are multiple-choice: select the best possible answer (or answers) per the syllabus.",
    "partialMarks": "Not defined in the supplied documents; each Foundation question is worth exactly one point, so multiple-select questions are scored all-or-nothing.",
}, open(D + "examination-rules.json", "w"), indent=1, ensure_ascii=False)

# validation
for e in exams:
    qs = json.load(open(f"{D}questions/{e['questionFile']}"))
    ids = [q["id"] for q in qs]
    assert len(ids) == len(set(ids))
    for q in qs:
        if not q["correctAnswer"] or not set(q["correctAnswer"]) <= {o["id"] for o in q["options"]}:
            problems.append((e["id"], q["id"], "bad correct answer"))
        if len(q["options"]) not in (4, 5):
            problems.append((e["id"], q["id"], "option count"))
        if not q["question"] and not q["stemImage"]:
            problems.append((e["id"], q["id"], "no stem"))
        if len(q["correctAnswer"]) != q["selectCount"]:
            problems.append((e["id"], q["id"], "select count"))
    if e["kind"] == "official-structure":
        ch = {}
        for q in qs:
            ch[q["syllabusReference"]["chapter"]] = ch.get(q["syllabusReference"]["chapter"], 0) + 1
        k = {x: sum(1 for q in qs if q["kLevel"] == x) for x in ("K1", "K2", "K3")}
        print(e["id"], len(qs), "marks", e["totalMarks"], "chapters", dict(sorted(ch.items())), "K", k)
    else:
        print(e["id"], len(qs), "marks", e["totalMarks"])
print("problems:", problems)
