const names = [
	'gamedata_const',
	'character_table',
	'skill_table',
	'item_table',
]

let promises = names.map(name=>{
	let url = `json/gamedata/en_US/gamedata/excel/${name}.json`
	return fetch(url).then(
		successResponse => {
			if (successResponse.status != 200) {
				return null
			} else {
				return successResponse.json()
			}
		},
		failResponse => {
			return null
		},
	)
})

Promise.all(promises).then(args=>{
	let DB = names.reduce((acc, name, i) =>{
		acc[name] = args[i]
		return acc
	}, {})

	function formatItemIcon(kwargs) {
		let item = DB.item_table.items[kwargs.id]
		let root = document.createElement('div')
		root.className = 'item rare-'+(item.rarity+1)
		let icon = document.createElement('span')
		icon.className = 'icon'
		let img = document.createElement('img')
		img.src = `img/items/${item.iconId}.png`
		img.width = 40
		icon.appendChild(img)
		root.appendChild(icon)
		let count = document.createElement('span')
		count.className = 'count'
		count.textContent = kwargs.count
		root.appendChild(count)
		return root
	}

	var body = document.querySelector('body')
	let fragment = document.createDocumentFragment()

	Object.entries(DB.character_table)
	.forEach(([k, v]) => {
		if (v.profession === 'TRAP' || v.profession === 'TOKEN') {
			return;
		}
		if (v.name !== 'Lappland') {
			return
		}
		var total = {}

		var h1 = document.createElement('h1')
		h1.textContent = v.name
		fragment.appendChild(h1)

		console.log(k, v)

		var table = document.createElement('table')
		var tr = document.createElement('tr')
		var th = document.createElement('th')
		th.textContent = 'Level'
		tr.appendChild(th)
		var th = document.createElement('th')
		th.textContent = 'Requisites'
		tr.appendChild(th)
		var th = document.createElement('th')
		th.textContent = 'Materials'
		tr.appendChild(th)
		table.appendChild(tr)

		v.allSkillLvlup.forEach((skill, i) => {
			let currLevel = i + 1
			let nextLevel = currLevel + 1
			var tr = document.createElement('tr')
			var td = document.createElement('td')
			td.textContent = `${currLevel} → ${nextLevel}`
			tr.appendChild(td)
			var td = document.createElement('td')
			td.textContent = `E${skill.unlockCond.phase} Lv${skill.unlockCond.level}`
			tr.appendChild(td)

			var td = document.createElement('td')
			skill.lvlUpCost.forEach(item=>{
				total[item.id] = (total[item.id] || 0) + item.count
				td.appendChild(formatItemIcon(item))
			})
			tr.appendChild(td)
			table.appendChild(tr)
		})
		fragment.appendChild(table)


		var table = document.createElement('table')
		var tr = document.createElement('tr')
		var th = document.createElement('th')
		th.textContent = 'Skill'
		tr.appendChild(th)
		var th = document.createElement('th')
		th.textContent = 'Rank'
		tr.appendChild(th)
		var th = document.createElement('th')
		th.textContent = 'Requisites'
		tr.appendChild(th)
		var th = document.createElement('th')
		th.textContent = 'Materials'
		tr.appendChild(th)
		table.appendChild(tr)

		v.skills.forEach((skill, si) => {
			const skillLevel = si + 1
			let masteryCount = skill.levelUpCostCond.length
			skill.levelUpCostCond.forEach((mastery, mi)=>{
				const masteryLevel = mi + 1
				let tr = document.createElement('tr')
				if (masteryLevel === 1) {
					let td = document.createElement('td')
					td.setAttribute('rowspan', masteryCount)
					td.textContent = skillLevel
					tr.appendChild(td)
				}
				var td = document.createElement('td')
				var img = document.createElement('img')
				img.src = `img/ui/rank/m-${masteryLevel}.png`
				img.width = 40
				td.appendChild(img)
				tr.appendChild(td)

				var td = document.createElement('td')
				var reqLvl = document.createElement('span')
				reqLvl.textContent = `Lv${mastery.unlockCond.level}`
				td.appendChild(reqLvl)
				var reqTime = document.createElement('span')
				var svg = document.createElement('svg')

				reqTime.appendChild(svg)
				reqTime.appendChild(document.createTextNode(`${mastery.lvlUpTime / 3600}h`))
				td.appendChild(reqTime)
				var reqPhase = document.createElement('span')
				var img = document.createElement('img')
				img.src = `img/ui/elite/${mastery.unlockCond.phase}-s.png`
				img.width = 25
				reqPhase.appendChild(img)
				td.appendChild(reqPhase)
				tr.appendChild(td)

				var td = document.createElement('td')
				mastery.levelUpCost.map(item=>{
					total[item.id] = (total[item.id] || 0) + item.count
					td.appendChild(formatItemIcon(item))
				})
				tr.appendChild(td)
				table.appendChild(tr)
			})
		})
		fragment.appendChild(table)
		body.appendChild(fragment)

		// v.phases.forEach((phase, phaseIdx) => {
		// 	let hr = document.createElement('hr')
		// 	let pre = document.createElement("pre")
		// 	let evolveCost = phase.evolveCost
		// 	if (evolveCost != null) {
		// 		let txt = `E${phaseIdx} - evolve cost:`
		// 		txt += evolveCost.map(item => {
		// 			return `\n* [${DB.item_table.items[item.id].name}]x${item.count}`
		// 		})
		// 		pre.textContent = txt
		// 		body.appendChild(pre)
		// 		body.appendChild(hr)
		// 	}
		// })
	})
})
