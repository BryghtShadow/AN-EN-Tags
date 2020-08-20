var app = new Vue({
	el: '#app',
	data: {
		missions: {},
		items: {},
	},	
	created() {
		fetch('json/gamedata/en_US/gamedata/excel/mission_table.json').then(r=>r.json()).then(data=>{
			this.missions = data
		})
		fetch('json/gamedata/en_US/gamedata/excel/item_table.json').then(r=>r.json()).then(data=>{
			this.items = data
		})
	},
	computed: {
		dailies() {
			if (!this.missions.dailyMissionPeriodInfo) return {};
			let today = Date.now()
			return this.missions.dailyMissionPeriodInfo.find(entry=>{
				return entry.startTime * 1000 <= today && today <= entry.endTime * 1000
			})
		},
		dailyTasks() {
			let dailies = this.dailies
			if (!dailies.periodList) return []
			let results = {}
			dailies.periodList.forEach((periodData, periodIndex) => {
				this.missions.missionGroups[periodData.missionGroupId].missionIds.forEach((missionId, missionIndex)=>{
					results[missionIndex] = results[missionIndex] || []
					results[missionIndex].push(this.missions.missions[missionId])
				})
			})
			return results
		},
		dailyRewards() {
			let dailies = this.dailies
			if (!dailies.periodList) return [];
			if (!this.missions.periodicalRewards) return [];
			let results = {}
			dailies.periodList.forEach((periodData, periodIndex) => {
				Object.values(this.missions.periodicalRewards).filter(reward=>{
					return reward.groupId == periodData.rewardGroupId
				}).forEach((rewardData, rewardIndex)=>{
					results[rewardIndex] = results[rewardIndex] || []
					results[rewardIndex].push(rewardData)
				})
			})
			return results
		}
	}
})
