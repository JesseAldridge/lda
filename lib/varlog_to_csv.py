import re, json, collections, csv

with open('out.varlog') as f:
  text = f.read()

class LabeledValue:
  def __init__(self, label):
    self.label = label
    self.tokens = []

labeled_values = []
for match in re.finditer(r'([^\s]+)([\s]+)', text):
  token, whitespace = match.group(1), match.group(2)
  if token.endswith(':'):
    labeled_values.append(LabeledValue(token[:-1]))
  else:
    labeled_values[-1].tokens.append(token + whitespace)

merged_row = {}
merged_rows = [merged_row]
all_vars = collections.OrderedDict()
for lv in labeled_values:
  if lv.label == 'newline':
    merged_row = {}
    merged_rows.append(merged_row)
  else:
    all_vars[lv.label] = 1
    if lv.label in merged_row:
      merged_row = {}
      merged_rows.append(merged_row)
    merged_row[lv.label] = ''.join(lv.tokens)

with open('out.json', 'w') as f:
  f.write(json.dumps(merged_rows, indent=2))

with open('out.csv', 'w') as f:
  writer = csv.writer(f, lineterminator='\n')
  writer.writerow(all_vars.keys())
  for row in merged_rows:
    writer.writerow([row.get(key, '') for key in all_vars])
