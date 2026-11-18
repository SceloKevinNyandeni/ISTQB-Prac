import re, json, pdfplumber
from PIL import Image
U = "/mnt/user-data/uploads/"
OUT = "/home/claude/istqb-exam-app/"
SETS = {
 "A": ("ISTQB_CTFL_v4_0_Sample-Exam-A-Questions_v1_7.pdf", "ISTQB_CTFL_v4_0_Sample-Exam-A-Answers_v1_7.pdf"),
 "B": ("ISTQB_CTFL_v4_0_Sample-Exam-B-Questions_v1_7.pdf", "ISTQB_CTFL_v4_0_Sample-Exam-B-Answers_v1_7.pdf"),
 "C": ("ISTQB_CTFL_v4_0_Sample-Exam-C-Questions_v1_6.pdf", "ISTQB_CTFL_v4_0_Sample-Exam-C-Answers_v1_6.pdf"),
 "D": ("ISTQB_CTFL_v4_0_Sample-Exam-D-Questions_v1_5.pdf", "ISTQB_CTFL_v4_0_Sample-Exam-D-Answers_v1_5.pdf"),
}
HDR = re.compile(r"^(Certified Tester, Foundation Level|Sample Exam set [A-D]|Sample Exam – (Questions|Answers)|Version 1\.\d+ +Page|© International|Questions$)")
HEAD = re.compile(r"^Question #(A?\d+) \((\w+) Points?\)\s*$")
OPT = re.compile(r"^([a-e])\)\s+(.*)")


def parse_questions(sid):
    pdf = pdfplumber.open(U + SETS[sid][0])
    items, cur = [], None
    for pn, page in enumerate(pdf.pages):
        for ln in page.extract_text_lines():
            t = ln["text"].strip()
            if "...." in t or not t or HDR.match(t):
                continue
            m = HEAD.match(t)
            if m:
                cur = {"id": m.group(1), "lines": [], "start": (pn, ln["bottom"])}
                items.append(cur)
                continue
            if cur is None or (re.match(r"^Additional", t) and len(t) < 60):
                continue
            cur["lines"].append((pn, ln["top"], ln["bottom"], t))
    out = []
    for it in items:
        stem, opts, sel, mode, first_opt = [], [], "", "stem", None
        for pn, top, bot, t in it["lines"]:
            if re.match(r"^Select (ONE|TWO) option", t):
                sel, mode = t, "done"
                continue
            m = OPT.match(t)
            if m and mode in ("stem", "opt") and m.group(1) == chr(97 + len(opts)):
                mode = "opt"
                opts.append([m.group(1), m.group(2)])
                if first_opt is None:
                    first_opt = (pn, top)
                continue
            if mode == "stem":
                stem.append((pn, top, bot, t))
            elif mode == "opt":
                opts[-1][1] += " " + t
        sp, sb = it["start"]
        ep, et = first_opt if first_opt else (sp, sb)
        segs = []
        for p in range(sp, ep + 1):
            y0 = sb if p == sp else 100
            y1 = et - 1 if p == ep else 770
            if y1 > y0:
                segs.append((p, y0, y1))
        big, small = 0, 0
        for p, y0, y1 in segs:
            pg = pdf.pages[p]
            for k in ("images", "rects", "curves", "lines"):
                for o in getattr(pg, k):
                    if k == "curves" and (o["bottom"] - o["top"]) < 8:
                        continue
                    if o["top"] >= y0 - 1 and o["bottom"] <= y1 + 1 and o["top"] > 100 and (o["x1"] - o["x0"]) > 3 and not ((o["x1"] - o["x0"]) < 20 and (o["bottom"] - o["top"]) < 20):
                        if k in ("lines", "rects") and (o["x1"] - o["x0"]) < 90 and abs(o["bottom"] - o["top"]) < 2:
                            small += 1
                        else:
                            big += 1
        fig = big > 0 or small >= 4
        img = None
        if fig:
            parts = []
            for p, y0, y1 in segs:
                pg = pdf.pages[p]
                parts.append(pg.crop((40, max(y0 - 2, 0), pg.width - 40, min(y1 + 2, pg.height))).to_image(resolution=150).original)
            im = Image.new("RGB", (max(c.width for c in parts), sum(c.height for c in parts)), "white")
            y = 0
            for c in parts:
                im.paste(c, (0, y))
                y += c.height
            img = f"figures/{sid}-{it['id']}.png"
            im.save(OUT + "public/" + img)
        txt, prev = [], None
        for pn, top, bot, t in stem:
            if prev is not None and (pn != prev[0] or top - prev[1] > 16):
                txt.append("\n")
            elif prev is not None:
                txt.append(" ")
            txt.append(t)
            prev = (pn, bot)
        out.append({"id": it["id"], "stem": "".join(txt).strip(), "options": opts, "select": sel, "stemImage": img})
    return out


def parse_answers(sid):
    pdf = pdfplumber.open(U + SETS[sid][1])
    recs, cur, started, thr = [], None, False, 194
    for page in pdf.pages:
        words = page.extract_words()
        if "Explanation / Rationale" in " ".join(w["text"] for w in words):
            started = True
            cx = [w["x0"] for w in words if w["text"] == "Correct"]
            thr = (cx[0] if cx else 149) + 45
        if not started:
            continue
        hb = [w["bottom"] for w in words if w["text"] in ("(#)", "(LO)", "Points") and w["top"] < 200]
        ytop = (max(hb) + 0.5) if hb else 75
        los = [w for w in words if re.fullmatch(r"FL-\d\.\d\.\d", w["text"]) and w["x0"] > thr + 300]
        lox = min(w["x0"] for w in los) if los else 580
        ws = sorted([w for w in words if ytop <= w["top"] <= 500], key=lambda w: w["top"])
        rows, rtop = [], None
        for w in ws:
            if rtop is None or w["top"] - rtop > 3.5:
                rows.append([])
                rtop = w["top"]
            rows[-1].append(w)
        for row in rows:
            row.sort(key=lambda w: w["x0"])
            lt = " ".join(w["text"] for w in row if w["x0"] < thr)
            et = " ".join(w["text"] for w in row if thr <= w["x0"] < lox - 3)
            rt = " ".join(w["text"] for w in row if w["x0"] >= lox - 3)
            m = re.match(r"^(A?\d+)\s+([a-e](?:\s*,\s*[a-e])*)", lt)
            mm = re.search(r"(FL-\d\.\d\.\d)\s+(K\d)\s+(\d+)", rt)
            if m and mm:
                cur = {"id": m.group(1), "correct": [x.strip() for x in m.group(2).split(",")], "lo": mm.group(1), "k": mm.group(2), "points": int(mm.group(3)), "lines": []}
                recs.append(cur)
            if cur is not None and et:
                cur["lines"].append(et)
    res = {}
    for r in recs:
        paras = []
        for l in r["lines"]:
            if re.match(r"^[a-e]\)\s", l) or not paras:
                paras.append(l)
            else:
                paras[-1] += " " + l
        general, optx = [], {}
        for p in paras:
            m = re.match(r"^([a-e])\)\s+(.*)", p)
            if m:
                optx[m.group(1)] = m.group(2)
            elif optx:
                optx[list(optx)[-1]] += " " + p
            else:
                general.append(p)
        res[r["id"]] = {"correct": r["correct"], "lo": r["lo"], "k": r["k"], "points": r["points"], "general": " ".join(general).strip(), "options": optx}
    return res


if __name__ == "__main__":
    for s in SETS:
        q, a = parse_questions(s), parse_answers(s)
        json.dump({"q": q, "a": a}, open(f"{OUT}scripts/raw-{s}.json", "w"), indent=1, ensure_ascii=False)
        print(s, "main", len([x for x in q if not x["id"].startswith("A")]), "additional", len([x for x in q if x["id"].startswith("A")]),
              "answers", len(a), "missing:", [x["id"] for x in q if x["id"] not in a], "figures:", [x["id"] for x in q if x["stemImage"]])
