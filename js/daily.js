let timestamp = (function() {
	const o = new Intl.DateTimeFormat('en', {
		year: 'numeric', month: 'numeric', day: 'numeric',
		hour: 'numeric', minute: 'numeric', second: 'numeric',
		hour12: false,
		timeZone: 'UTC',
	})
	return function(d) {
		const tzOffset = -7
		d.setHours(d.getHours() + tzOffset)
		return o.format(d)
	}
})()

const ROOK = '\u265C'
const BLANK = '\u29C4'


Promise.all([
	fetch('json/gamedata/en_US/gamedata/excel/item_table.json').then((r) => r.json()),
	fetch('json/gamedata/en_US/gamedata/excel/mission_table.json').then((r) => r.json()),
]).then((data) => {
	var [itemData, missionData] = data


	function rewardIcon(rewardData) {
		let item = itemData.items[rewardData.id]

		let root = document.createElement('div')
		root.className = 'item'

		let icon = document.createElement('div')
		icon.className = 'icon rare-' + (item.rarity+1)

		let img = document.createElement('img')
		img.src = './img/items/' + item.iconId + '.png'
		img.width = 40
		img.height = 40
		icon.appendChild(img)

		let count = document.createElement('span')
		count.className = "count"
		count.textContent = rewardData.count

		root.appendChild(icon)
		root.appendChild(count)

		return root
	}


	const now = new Date()
	// now.setHours(now.getHours()+24)
	const dom = document.querySelector('code')
	let text = []
	text.push("NOW: " + timestamp(now))
	missionData.dailyMissionPeriodInfo.forEach((daily) => {
		let startTime = new Date(daily.startTime * 1000)
		let endTime = new Date(daily.endTime * 1000)
		daily.startTime = timestamp(startTime)
		daily.endTime = timestamp(endTime)

		if (startTime > now || now > endTime) {
			return
		}
		text.push(JSON.stringify(daily, null, 4))

		daily.periodList.forEach((periodData, j) => {
			if (j > 0) return
			text.push('='.repeat(80))
			// DAILY REWARDS
			var dailyRewardsFragment = document.createDocumentFragment()

			Object.values(missionData.periodicalRewards)
			.filter((reward) => reward.groupId === periodData.rewardGroupId)
			.sort((a, b) => a.sortIndex - b.sortIndex)
			.forEach((reward, i) => {
				if (i > 2) return
				let rewardSet = document.createElement('div')
				rewardSet.textContent = `reward set - ${i.toString().padStart(3, '0')}\u25BC\n`

				let points = document.createElement('div')
				points.textContent = ROOK.repeat(reward.periodicalPointCost).padEnd(3, BLANK)

				let items = document.createElement('div')
				items.className = 'items'

				reward.rewards.forEach((rewardData) => {
					let icon = rewardIcon(rewardData)

					items.appendChild(icon)
				})

				dailyRewardsFragment.appendChild(items)
				// text.push(JSON.stringify(reward, null, 4))
			})
			document.querySelector('#daily .rewards').appendChild(dailyRewardsFragment)

			text.push('='.repeat(80))
			let missionGroup = missionData.missionGroups[periodData.missionGroupId]
			// text.push(JSON.stringify(missionGroup, null, 4))
			missionGroup.missionIds.forEach((missionId) => {
				let mission = missionData.missions[missionId]
				text.push(`${ROOK} [requirement] ${mission.description} [0/${mission.param[mission.param.length-1]} ${ROOK}\u00D7${mission.periodicalPoint}]`)
				// text.push(JSON.stringify(mission, null, 4))
			})
		})
	})
	// dom.textContent = text.join('\n')
})