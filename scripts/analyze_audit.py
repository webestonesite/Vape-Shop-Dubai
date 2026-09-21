import openpyxl

wb = openpyxl.load_workbook('public/SEO_Audit_Consolidated_vapshopdubai.xlsx')
sheet = wb.active

rows = list(sheet.iter_rows(values_only=True))
# Find header row index
header_idx = None
for idx, r in enumerate(rows):
    if r[0] == 'Issue':
        header_idx = idx
        break

print(f"Header found at index {header_idx}: {rows[header_idx]}")

headers = rows[header_idx]
data = rows[header_idx+1:]

issues_by_type = {}
for r in data:
    issue_type = r[0]
    if not issue_type or str(issue_type).startswith("Source:") or str(issue_type).startswith("Total"):
        continue
    if issue_type not in issues_by_type:
        issues_by_type[issue_type] = []
    issues_by_type[issue_type].append(r)

for itype, item_list in issues_by_type.items():
    print(f"\n==========================================")
    print(f"ISSUE TYPE: {itype} (Count: {len(item_list)})")
    print(f"==========================================")
    for item in item_list[:10]: # print first 10
        print(f"  - Priority: {item[1]} | URL: {item[3]} | Detail: {item[4]} | Recommendation: {item[6]}")
    if len(item_list) > 10:
        print(f"  ... and {len(item_list) - 10} more items")
