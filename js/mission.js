function pad(n) {
	return n < 10 ? '0' + n : n;
}
var app = new Vue({
	el: '#app',
	data: {
		selectedDate: new Date(),
		period: (new Date(Date.now() - 11*60*60*1000)).getUTCDay() || 7,
		missions: {},
		items: {},
		mode: 'single',
		formats: {
			input: ['L', 'YYYY-MM-DD', 'YYYY/MM/DD'],
			data: ['L', 'YYYY-MM-DD', 'YYYY/MM/DD'],
		}
	},	
	created() {
		fetch('json/gamedata/en_US/gamedata/excel/mission_table.json').then(r=>r.json()).then(data=>{
			this.missions = data
		})
		fetch('json/gamedata/en_US/gamedata/excel/item_table.json').then(r=>r.json()).then(data=>{
			this.items = data.items
		})
	},
	computed: {
		dailies() {
			if (!this.missions.dailyMissionPeriodInfo) return {};
			let found = this.missions.dailyMissionPeriodInfo.find(e=>{
				return (
					e.startTime * 1000 <= this.selectedDate &&
					this.selectedDate <= e.endTime * 1000
				)
			})
			return found
		},
		dailyPeriod() {
			let dailies = this.dailies
			if (!dailies.periodList) return null;
			return dailies.periodList.find(e=>{
				return e.period.includes(this.period)
			})
		},
		dailyTasks() {
			let periodData = this.dailyPeriod;
			if (!periodData) return [];
			let missionIds = this.missions.missionGroups[periodData.missionGroupId].missionIds
			let results = missionIds.map((missionId, missionIndex)=>{
				return this.missions.missions[missionId];
			})
			return results
		},
		dailyRewards() {
			let periodData = this.dailyPeriod;
			if (!periodData) return [];
			let periodicalRewards = this.missions.periodicalRewards
			if (!this.missions.periodicalRewards) return [];
			let results = Object.values(periodicalRewards).filter(reward=>{
				return reward.groupId === periodData.rewardGroupId
			})
			return results
		}
	},
	methods: {
		getItemIcon(item) {
			let itemData = this.items[item.id]
			if (!itemData) return 'img/chara/empty.png'
			return `img/items/${itemData.iconId}.png`
		},
	},
	filters: {
		timestamp: function(d) {
			if (!d) return "(n/a)";
			d = new Date(d);
			return (
				d.getFullYear() + '/' +
				pad(d.getMonth() + 1) + '/' +
				pad(d.getDate()) + ' ' +
				pad(d.getHours()) + ':' +
				pad(d.getMinutes()) + ':' +
				pad(d.getSeconds())
			);
		}
	}
})
