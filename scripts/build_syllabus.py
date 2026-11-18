import re, json
L = open("/home/claude/src/ISTQB_CTFL_Syllabus_v4_0_1-1.txt").read().split("\n")
OUT = "/home/claude/istqb-exam-app/src/data/"
JUNK = re.compile(r"^\s*(v4\.0\.1\s+Page|© International|Certified Tester\s*$|Foundation Level\s*$)")

# chapter titles / minutes from the table of contents
chapters = {}
for l in L[100:240]:
    m = re.match(r"^\s*([1-6])\.\s+(.+?) – (\d+) minutes \.{3,}", l)
    if m:
        chapters[m.group(1)] = {"number": m.group(1), "title": m.group(2).strip(), "minutes": int(m.group(3)), "sections": []}

start = next(i for i, l in enumerate(L) if re.match(r"^\s+1\. Fundamentals of Testing – 180", l))
end = next(i for i, l in enumerate(L) if re.match(r"^7\.\s+References", l) and i > start)

los, sec_titles = {}, {}
cur_lo = None
for l in L[start:end]:
    m = re.match(r"^FL-(\d\.\d\.\d)\s+\((K\d)\)\s+(.*)", l)
    if m:
        cur_lo = m.group(1)
        los[cur_lo] = {"id": "FL-" + cur_lo, "k": m.group(2), "text": m.group(3).strip()}
        continue
    m = re.match(r"^(\d\.\d) ([A-Z].*)$", l)
    if m:
        sec_titles[m.group(1)] = m.group(2).strip()
        cur_lo = None
        continue
    if cur_lo and l.strip() and not JUNK.match(l) and not l.startswith("Learning Objectives") and not re.match(r"^\s*\d\.\d", l) and len(l) - len(l.lstrip()) > 10:
        los[cur_lo]["text"] += " " + l.strip()
    elif not l.strip():
        cur_lo = None

# body
sec, sub, block = None, None, None


def blocks_of(node):
    node.setdefault("content", [])
    return node["content"]


def add_line(node, text):
    c = blocks_of(node)
    t = text.strip()
    if t.startswith("•") or t.startswith("-  ") and False:
        c.append({"type": "li", "text": t.lstrip("• ").strip()})
    elif c and c[-1].get("open"):
        c[-1]["text"] += " " + t
    else:
        c.append({"type": "p", "text": t, "open": True})


cur_chapter = None
body_started = False
for l in L[start:end]:
    if JUNK.match(l) or "\f" in l and not l.replace("\f", "").strip():
        continue
    l = l.replace("\f", "")
    mc = re.match(r"^\s+([1-6])\.\s+(.+?)(?: – \d+ minutes)?\s*$", l)
    if mc and mc.group(1) in chapters and mc.group(2).strip() == chapters[mc.group(1)]["title"]:
        cur_chapter = chapters[mc.group(1)]
        sec = sub = None
        continue
    ms = re.match(r"^\s+(\d\.\d)\.\s+(\S.*)$", l)
    if ms and cur_chapter and ms.group(1)[0] == cur_chapter["number"]:
        body_started = True
        sec = {"number": ms.group(1), "title": ms.group(2).strip(), "learningObjectives": [], "content": [], "subsections": []}
        cur_chapter["sections"].append(sec)
        sub = None
        continue
    mu = re.match(r"^\s+(\d\.\d\.\d)\.\s+(\S.*)$", l)
    if mu and sec and mu.group(1).startswith(sec["number"]):
        sub = {"number": mu.group(1), "title": mu.group(2).strip(), "content": []}
        sec["subsections"].append(sub)
        continue
    if not body_started or not sec:
        continue
    if not l.strip():
        for node in (sub or sec,):
            c = node["content"]
            if c and c[-1].get("open"):
                c[-1].pop("open")
        continue
    add_line(sub or sec, l)

for ch in chapters.values():
    for s in ch["sections"]:
        s["title"] = sec_titles.get(s["number"], s["title"])
        s["learningObjectives"] = [v for k, v in los.items() if k.startswith(s["number"] + ".")]
        for node in [s] + s["subsections"]:
            for b in node["content"]:
                b.pop("open", None)
            node["content"] = [b for b in node["content"] if b["text"]]

data = {"version": "4.0.1", "title": "ISTQB Certified Tester Foundation Level Syllabus", "chapters": [chapters[k] for k in sorted(chapters)]}
json.dump(data, open(OUT + "syllabus.json", "w"), indent=1, ensure_ascii=False)
print("chapters", len(chapters), "sections", sum(len(c["sections"]) for c in chapters.values()), "subsections",
      sum(len(s["subsections"]) for c in chapters.values() for s in c["sections"]), "LOs", len(los), "LO count in sections",
      sum(len(s["learningObjectives"]) for c in chapters.values() for s in c["sections"]))
print({k: len(c["sections"]) for k, c in chapters.items()})
