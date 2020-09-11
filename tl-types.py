import json
from collections import OrderedDict
with open('json/tl-type.json', encoding='utf-8-sig') as tl_type:
	tl_types = json.load(tl_type, object_pairs_hook=OrderedDict)

with open('json/gamedata/zh_CN/gamedata/excel/gacha_table.json') as gacha_table:
	gachaTags = json.load(gacha_table)['gachaTags']
	tags = {
		g['tagName']: g['tagId']
		for g in gachaTags
	}
with open('json/gamedata/zh_TW/gamedata/excel/gacha_table.json') as gacha_table:
	gachaTags = json.load(gacha_table)['gachaTags']
	tw_tags = {
		g['tagId']: g['tagName']
		for g in gachaTags
	}

def update(tag):
	name_cn = tag.get('type_cn')
	_id = tags[name_cn+'干员']
	o = {
		'id': _id,
	}
	for k,v in tag.items():
		o[k] = v
	o['type_tw'] = tw_tags[_id].replace('幹員','')
	return o


print(json.dumps(list(map(update, tl_types)), indent='\t', ensure_ascii=False))
