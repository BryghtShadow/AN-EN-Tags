const names = [
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

	var body = document.querySelector('body')

	Object.entries(DB.character_table)
	.forEach(([k, v]) => {
		if (v.profession === 'TRAP' || v.profession === 'TOKEN') {
			return;
		}
		if (v.name == 'Lappland') {
			console.log(k, v)

			var h2 = document.createElement('h3')
			h2.textContent = v.name
			body.appendChild(h2)

			v.allSkillLvlup.forEach((skillLvlup, idx) => {
				let hr = document.createElement('hr')
				let pre = document.createElement("pre")
				pre.textContent = `SLvl.${idx+1} -> SLvl.${idx+2}:\n`
				+ JSON.stringify(skillLvlup, null, '  ')
				// body.appendChild(pre)
				// body.appendChild(hr)
			})

			v.skills.forEach((skill, skillIdx) => {
				let hr = document.createElement('hr')
				let pre = document.createElement("pre")
				pre.textContent = `S${skillIdx}:\n`
				+ JSON.stringify(skill, null, '  ')
				+ JSON.stringify(DB.skill_table[skill.skillId], null, '  ')
				// body.appendChild(pre)
				// body.appendChild(hr)
			})

			v.phases.forEach((phase, phaseIdx) => {
				let hr = document.createElement('hr')
				let pre = document.createElement("pre")
				let evolveCost = phase.evolveCost
				// if (evolveCost != null) {
					pre.textContent = `E${phaseIdx} - evolve cost:\n`
					+ JSON.stringify(evolveCost, null, '  ')
					// body.appendChild(pre)
					// body.appendChild(hr)
				// }
			})
		}
	})
})