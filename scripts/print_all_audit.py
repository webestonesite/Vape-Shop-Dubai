import openpyxl

wb = openpyxl.load_workbook('public/SEO_Audit_Consolidated_vapshopdubai.xlsx')
sheet = wb.active
rows = list(sheet.iter_rows(values_only=True))

header_idx = None
for idx, r in enumerate(rows):
    if r[0] == 'Issue':
        header_idx = idx
        break

data = rows[header_idx+1:]
issues = {}
for r in data:
    itype = r[0]
    if not itype or str(itype).startswith("Source:") or str(itype).startswith("Total"):
        continue
    if itype not in issues:
        issues[itype] = []
    issues[itype].append({
        'priority': r[1],
        'difficulty': r[2],
        'url': r[3],
        'detail': r[4],
        'recom': r[6]
    })

for itype, items in issues.items():
    print(f"\n==========================================")
    print(f"=== {itype} (Count: {len(items)}) ===")
    print(f"==========================================")
    for i in items:
        print(f"URL: {i['url']}")
        print(f"   Detail: {i['detail']}")
