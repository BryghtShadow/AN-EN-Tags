var conf = {
	reg: 'cn',
	lang: 'en',
};

function isHidden(char) {
	return (char.hidden || char.globalHidden && conf.reg !== 'cn');
}

function init() {

	if (!localStorage.getItem('gameRegion') || !localStorage.getItem('webLang')) {
		localStorage.setItem('gameRegion', conf.reg);
		localStorage.setItem('webLang', conf.lang);
	}
	conf.reg = localStorage.getItem('gameRegion');
	conf.lang = localStorage.getItem('webLang');

	return Promise.all([
		fetch('json/tl-type.json').then(r=>r.json()),
		fetch('json/tl-tags.json').then(r=>r.json()),
		fetch('json/tl-gender.json').then(r=>r.json()),
		fetch('json/tl-akhr.json').then(r=>r.json()),
	]).then(([typesTL, tagsTL, gendersTL, akhrTL]) => {
		var JSON_DATA = {};

		JSON_DATA.tagsTL = [typesTL, tagsTL, gendersTL].reduce((acc, cur) => {
			cur.reduce((a,c) => {
				if (c.id) {
					a[c.id] = c;
				}
				return a;
			}, acc);
			return acc;
		}, {});

		JSON_DATA.characters = akhrTL;

		akhrTL = akhrTL.filter(char => {
			if (char.hidden) return false;
			if (char.globalHidden && conf.reg !== 'cn') return false;
			return true;
		});

		var tags_aval = {};
		var all_chars = {};

		var tag_count = 0;
		var char_tag_sum = 0;

		akhrTL.forEach(char => {
			if (isHidden(char)) return;

			char.tags.push(char.type);
			char.tags.push(char.sex);
			char.tags = char.tags.map(tag=>{
				var found = Object.values(JSON_DATA.tagsTL).find(e => {
					return (tag === e.type_cn || tag === e.tag_cn || tag === e.sex_cn)
				}) || {};
				return found.id
			})

			char.tags.forEach(tagID => {
				if (!(tagID in tags_aval)) {
					tags_aval[tagID] = []
					tag_count++;
				}
				tags_aval[tagID].push({
					name_en: char.name_en,
					name_cn: char.name_cn,
					name_jp: char.name_jp,
					name_kr: char.name_kr,
					level: char.level,
					type: char.type,
				});
				char_tag_sum++;
			})
			all_chars[char.name_cn] = {
				name_cn: char.name_cn,
				name_en: char.name_en,
				name_jp: char.name_jp,
				name_kr: char.name_kr,
				level: char.level,
				tags: char.tags,
			}
		});

		console.log(tag_count)
		console.log(char_tag_sum)

		var avg_char_tag = char_tag_sum / tag_count;

		JSON_DATA.tags_aval = tags_aval;
		JSON_DATA.all_chars = all_chars;
		JSON_DATA.avg_char_tag = avg_char_tag;
		return JSON_DATA
	})
}

init()
.then(data=>{
	var selectedOpsContainer = document.createElement('div')
	selectedOpsContainer.id = 'selectedOps';

	function clickBtnTag(ev) {

	}

	var ul = document.createElement('ul');
	ul.className = 'tags';
	Object.entries(data.tagsTL).forEach(([tagID, tag]) => {
		let li = document.createElement('li');
		let label = document.createElement('label')

		let checkbox = document.createElement('input')
		checkbox.type = 'checkbox';
		label.appendChild(checkbox);

		let textnode = document.createTextNode(tag.type_en || tag.tag_en || tag.sex_en);
		label.appendChild(textnode)

		li.appendChild(label)
		ul.appendChild(li)
	})
	document.body.appendChild(ul);
	// document.body.appendChild(selectedOpsContainer);
});

