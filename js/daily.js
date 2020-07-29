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
	const now = new Date()
	const dom = document.querySelector('code')
	let text = []
	text.push("NOW: " + timestamp(now))
	missionData.dailyMissionPeriodInfo.forEach((daily) => {
		let startTime = new Date(daily.startTime * 1000)
		let endTime = new Date(daily.endTime * 1000)
		if (startTime > now || now > endTime) {
			return
		}
		daily.startTime = timestamp(startTime)
		daily.endTime = timestamp(endTime)

		text.push(JSON.stringify(daily, null, 4))

		daily.periodList.forEach((periodData) => {
			text.push('='.repeat(80))
			Object.values(missionData.periodicalRewards)
			.filter((reward) => reward.groupId === periodData.rewardGroupId)
			.sort((a, b) => a.sortIndex - b.sortIndex)
			.forEach((reward, i) => {
				text.push(`reward set - ${i.toString().padStart(3, '0')}\u25BC`)
				text.push(ROOK.repeat(reward.periodicalPointCost).padEnd(3, BLANK) + ' ' + reward.rewards.map((rewardData) => {
					return '[' + itemData.items[rewardData.id].name + ']\u00D7' + rewardData.count
				}).join(', '))
				text.push(JSON.stringify(reward, null, 4))
			})

			text.push('='.repeat(80))
			let missionGroup = missionData.missionGroups[periodData.missionGroupId]
			text.push(JSON.stringify(missionGroup, null, 4))
			text.push('='.repeat(80))
			missionGroup.missionIds.forEach((missionId) => {
				let mission = missionData.missions[missionId]
				text.push(ROOK.repeat(mission.periodicalPoint).padEnd(3, BLANK))
				text.push(JSON.stringify(mission, null, 4))
			})
		})
	})
	dom.textContent = text.join('\n')
})