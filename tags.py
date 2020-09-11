from collections import OrderedDict
import json
with open('json/tl-tags.json', encoding="utf-8-sig") as tl_tags:
	tags = json.load(tl_tags, object_pairs_hook=OrderedDict)

langs = {
	'cn': 'zh_CN',
	'en': 'en_US',
	'jp': 'ja_JP',
	'kr': 'ko_KR',
	'tw': 'zh_TW',
}
gacha_tags = {}
for k, v in langs.items():

	with open(f'json/gamedata/{v}/gamedata/excel/gacha_table.json') as gacha_table:
		for g in json.load(gacha_table)['gachaTags']:
			name = g['tagName']
			tagId = g['tagId']
			gacha_tags.setdefault(tagId, OrderedDict())[k] = name

def updateTag(tag):
	tag_cn = tag['tag_cn']
	tagId = None
	data = None
	for k,v in gacha_tags.items():
		if v['cn'] == tag_cn:
			tagId = int(k)
			data = v
			break

	result = OrderedDict()
	if tagId:
		result['id'] = tagId
	if data:
		for k,v in data.items():
			result['tag_'+k] = v
	else:
		for k in langs.keys():
			if k == 'tw' and tag_cn in ('MELEE', 'RANGED'):
				# print(k, tag_cn)
				result['tag_'+k] = tag_cn # tag.get('tag_'+k, tag_cn)
			else:
				result['tag_'+k] = tag.get('tag_'+k, '')

	result['type'] = tag['type']
	return result

result = list(map(updateTag, tags))
print(json.dumps(result, indent='\t', ensure_ascii=False))
