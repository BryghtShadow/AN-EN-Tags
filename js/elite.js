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

	function formatIcon(kwargs) {
		let itemData = DB.item_table.items[kwargs.id]
		let iconId = itemData.iconId
		let root = document.createElement('div')
		root.className = 'item rare-'+(itemData.rarity + 1)
		let icon = document.createElement("div")
		icon.className = 'icon'
		let img = document.createElement('img')
		img.src = `img/items/${iconId}.png`
		img.width = 40
		img.height = 40
		icon.appendChild(img)
		root.appendChild(icon)
		let quantity = document.createElement('div')
		quantity.className = "count"
		quantity.textContent = kwargs.count
		root.appendChild(quantity)
		return root
	}

	let FRAG = document.createDocumentFragment()

	Object.entries(DB.character_table)
	.forEach(([k, v]) => {
		if (v.profession === 'TRAP' || v.profession === 'TOKEN') {
			return;
		}

		if (v.name !== 'Lappland') {
			return
		}

		console.log(k, v)

		var total = {}

		var h2 = document.createElement('h1')
		h2.textContent = v.name
		FRAG.appendChild(h2)


		let skillsCostSection = document.createElement('div')

		let table, tr, th, td
		table = document.createElement('table')
		tr = document.createElement('tr')
		Array.from(['Level', 'Requisites', 'Materials']).forEach(txt=>{
			th = document.createElement('th')
			th.textContent = txt
			tr.appendChild(th)
		})
		table.appendChild(tr)

		v.allSkillLvlup.forEach((skill, i) => {
			let currLvl = i+1
			let nextLvl = i+2
			let reqPhase = document.createTextNode('E'+skill.unlockCond.phase)
			let reqLevel = document.createTextNode('Lv'+skill.unlockCond.level)
			let materials = document.createElement('ul')
			materials.className = 'hlist'

			tr = document.createElement('tr')

			td = document.createElement('td')
			td.textContent = `${currLvl} ➝ ${nextLvl}`
			tr.appendChild(td)

			td = document.createElement('td')
			td.appendChild(reqPhase)
			td.appendChild(reqLevel)
			tr.appendChild(td)

			skill.lvlUpCost.forEach(item=>{
				total[item.id] = (total[item.id] || 0) + item.count
				let icon = formatIcon({'id': item.id, 'count': item.count})

				let li = document.createElement('li')
				li.appendChild(icon)
				materials.appendChild(li)
			})
			td = document.createElement('td')
			td.appendChild(materials)
			tr.appendChild(td)

			table.appendChild(tr)
		})
		skillsCostSection.appendChild(table)
		FRAG.appendChild(skillsCostSection)


		table = document.createElement('table')
		tr = document.createElement('tr')
		Array.from(['Skill', 'Level', 'Requisites', 'Materials']).forEach(txt=>{
			th = document.createElement('th')
			th.textContent = txt
			tr.appendChild(th)
		})
		table.appendChild(tr)
		v.skills.forEach((skill, si) => {
			let skillLvl = si+1
			skill.levelUpCostCond.forEach((mastery, mi)=>{
				let masteryLevel = mi+1

				let tr = document.createElement('tr')
				if (mi == 0) {
					td = document.createElement('td')
					td.setAttribute('rowspan', 3)
					td.textContent = skillLvl
					tr.appendChild(td)
				}

				td = document.createElement('td')
				td.appendChild(document.createTextNode(masteryLevel))
				tr.appendChild(td)

				td = document.createElement('td')
				td.appendChild(document.createTextNode('Lv1'))
				td.appendChild(document.createTextNode(`${masteryLevel*8}h`))
				td.appendChild(document.createTextNode(`E2`))
				tr.appendChild(td)

				let materials = document.createElement('ul')
				materials.className = 'hlist'
				mastery.levelUpCost.map(item=>{
					total[item.id] = (total[item.id] || 0) + item.count
					let icon = formatIcon({'id': item.id, 'count': item.count})
					let li = document.createElement('li')
					li.appendChild(icon)
					materials.appendChild(li)
				})
				td.appendChild(materials)
				tr.appendChild(td)
				table.appendChild(tr)
			})
		})
		FRAG.appendChild(skillSection)

			// // Promotion
			// v.phases.forEach((phase, i) => {
			// 	let promotionSection = document.createElement("div")
			// 	let evolveCost = phase.evolveCost
			// 	if (evolveCost === null) {
			// 		return
			// 	}
			// 	let header = document.createElement('div')
			// 	header.textContent = `Elite ${i} promotion requirement:`
			// 	promotionSection.appendChild(header)

			// 	let ul = document.createElement('ul')
			// 	ul.className = 'hlist'
			// 	// "Level " + v.phases[i-1].maxLevel,
			// 	let count = DB.gamedata_const.evolveGoldCost[v.rarity][i-1]
			// 	let requiredItems = [{'id': '4001', 'count': count}]
			// 	evolveCost.forEach(item=>{
			// 		total[item.id] = (total[item.id] || 0) + item.count
			// 		requiredItems.push({'id': item.id, 'count': item.count})
			// 	})
			// 	requiredItems.forEach((req)=>{
			// 		let li = document.createElement('li')
			// 		li.appendChild(formatIcon(req))
			// 		ul.appendChild(li)
			// 	})
			// 	promotionSection.appendChild(ul)
			// 	FRAG.appendChild(promotionSection)
			// })

			// let finalCostSection = document.createElement('div')
			// let header = document.createElement('h3')
			// header.textContent = "Final cost"
			// finalCostSection.appendChild(header)

			// let ul = document.createElement('ul')
			// ul.className = 'hlist'

			// let ITEMS = DB.item_table.items
			// var txt = Object.entries(total).sort(([k1,v1],[k2,v2])=>{
			// 	return ITEMS[k1].sortId - ITEMS[k2].sortId
			// }).map(([id, count]) => {
			// 		return ({'id': id, 'count': count})
			// }).forEach(req => {
			// 		let li = document.createElement('li')
			// 		li.appendChild(formatIcon(req))
			// 		ul.appendChild(li)
			// })
			// finalCostSection.appendChild(ul)
			// FRAG.appendChild(finalCostSection)
	})

	let body = document.querySelector('body')
	body.appendChild(FRAG)
})