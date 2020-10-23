
let DB

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

const clock = `<svg x="0" y="0" viewBox="0 0 10 10" height="1em"><g fill="none" stroke="currentColor" stroke-width="10%" stroke-linecap="square">
<circle cx="50%" cy="50%" r="45%"/>
<line x1="50%" y1="50%" x2="30%" y2="50%"/>
<line x1="50%" y1="50%" x2="50%" y2="30%"/>
</g></svg>`

function pad(n) {
	return (n < 10 ? '0' : '') + n
}

function formatItemIcon(kwargs) {
	let item = DB.item_table.items[kwargs.id]

	let root = document.createElement('div')
	root.className = 'item rare-'+(item.rarity+1)
	let icon = document.createElement('span')
	icon.className = 'icon'
	let img = document.createElement('img')
	img.src = `img/items/${item.iconId}.png`
	img.width = 40
	let count = document.createElement('span')
	count.className = 'count'
	count.textContent = kwargs.count

	icon.append(img)
	root.append(icon, count)

	return root
}

Promise.all(promises).then(args=>{
	DB = DB || names.reduce((acc, name, i) =>{
		acc[name] = args[i]
		return acc
	}, {})


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
		fragment.append(h1)

		console.log(k, v)

		var table = document.createElement('table')
		var tr = document.createElement('tr')
		var th = document.createElement('th')
		th.textContent = 'Level'
		tr.append(th)
		var th = document.createElement('th')
		th.textContent = 'Requisites'
		tr.append(th)
		var th = document.createElement('th')
		th.textContent = 'Materials'
		tr.append(th)
		table.append(tr)

		v.allSkillLvlup.forEach((skill, i) => {
			let currLevel = i + 1
			let nextLevel = currLevel + 1
			var tr = document.createElement('tr')
			var td = document.createElement('td')
			td.textContent = `${currLevel} → ${nextLevel}`
			tr.append(td)
			var td = document.createElement('td')
			var img = document.createElement('img')
			img.src = `img/ui/elite/${skill.unlockCond.phase}-s.png`
			img.width = 25
			var reqCell = document.createElement('div')
			reqCell.className = 'requisites-cell'
			reqCell.append(img, `Lv${skill.unlockCond.level}`)
			td.append(reqCell)
			tr.append(td)

			var td = document.createElement('td')
			skill.lvlUpCost.forEach(item=>{
				total[item.id] = (total[item.id] || 0) + item.count
				td.append(formatItemIcon(item))
			})
			tr.append(td)
			table.append(tr)
		})
		fragment.append(table)

		var table = document.createElement('table')
		var tr = document.createElement('tr')
		var th = document.createElement('th')
		th.textContent = 'Skill'
		tr.append(th)
		var th = document.createElement('th')
		th.textContent = 'Rank'
		tr.append(th)
		var th = document.createElement('th')
		th.textContent = 'Requisites'
		tr.append(th)
		var th = document.createElement('th')
		th.textContent = 'Materials'
		tr.append(th)
		table.append(tr)

		v.skills.forEach((skill, si) => {
			const skillLevel = si + 1
			let masteryCount = skill.levelUpCostCond.length
			skill.levelUpCostCond.forEach((mastery, mi)=>{
				const masteryLevel = mi + 1
				let tr = document.createElement('tr')
				if (masteryLevel === 1) {
					let levelCell = document.createElement('td')
					levelCell.setAttribute('rowspan', masteryCount)
					levelCell.textContent = skillLevel
					tr.append(levelCell)
				}
				var rankCell = document.createElement('td')
				var img = document.createElement('img')
				img.src = `img/ui/rank/m-${masteryLevel}.png`
				img.width = 50
				rankCell.append(img)

				var requisitesCell = document.createElement('td')
				var reqCell = document.createElement('div')
				reqCell.className = 'requisites-cell'
				var reqLvl = document.createElement('span')
				reqLvl.textContent = `Lv${mastery.unlockCond.level}`
				var reqTime = document.createElement('span')
				reqTime.insertAdjacentHTML('beforeend', `${clock} ${pad(mastery.lvlUpTime / 3600)}h`)
				var reqPhase = document.createElement('span')
				var img = document.createElement('img')
				img.src = `img/ui/elite/${mastery.unlockCond.phase}-s.png`
				img.width = 25
				reqPhase.append(img)
				reqCell.append(reqTime, reqPhase, reqLvl)
				requisitesCell.append(reqCell)

				var materialsCell = document.createElement('td')
				mastery.levelUpCost.forEach(item=>{
					total[item.id] = (total[item.id] || 0) + item.count
					materialsCell.append(formatItemIcon(item))
				})
				tr.append(rankCell, requisitesCell, materialsCell)
				table.append(tr)
			})
		})
		fragment.append(table)

		table = document.createElement('table')
		tr = document.createElement('tr')
		th = document.createElement('th')
		th.textContent = 'Elite'
		tr.append(th)
		th = document.createElement('th')
		th.textContent = 'Materials'
		tr.append(th)
		table.append(tr)

		v.phases.forEach((phase, phaseIdx) => {
			console.log(phase)
			if (phase.evolveCost === null) {
				return
			}
			tr = document.createElement('tr')
			var td = document.createElement('td')
			var img = document.createElement('img')
			img.src = `img/ui/elite/${phaseIdx}-s.png`
			img.width = 25
			td.append(img)
			tr.append(td)
			var td = document.createElement('td')
			let goldCount = DB.gamedata_const.evolveGoldCost[v.rarity][phaseIdx-1]
			var item = {
				'id': '4001',
				'count': goldCount,
			}
			total[item.id] = (total[item.id] || 0) + item.count
			td.append(formatItemIcon(item))

			phase.evolveCost.forEach(item=>{
				total[item.id] = (total[item.id] || 0) + item.count
				td.append(formatItemIcon(item))
			})
			tr.append(td)
			table.append(tr)
		})
		fragment.append(table)

		var totalDiv = document.createElement('div')
		Object.entries(total).sort(([a,aa],[b,bb])=>{
			return DB.item_table.items[a].sortId - DB.item_table.items[b].sortId
		}).forEach(([id, count]) => {
			totalDiv.append(formatItemIcon({id, count}))
		})
		fragment.append(totalDiv)

		body.append(fragment)
	})
})
