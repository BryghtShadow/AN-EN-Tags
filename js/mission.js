var app = new Vue({
	el: '#app',
	data: {
		selectedDate: new Date(),
		period: (new Date(Date.now() - 11*60*60*1000)).getUTCDay() || 7,
		missionTable: {},
		itemTable: {},
		mode: 'single',
		formats: {
			input: ['L', 'YYYY-MM-DD', 'YYYY/MM/DD'],
			data: ['L', 'YYYY-MM-DD', 'YYYY/MM/DD'],
		}
	},	
	created() {
		fetch('json/gamedata/en_US/gamedata/excel/mission_table.json').then(r=>r.json()).then(data=>{
			this.missionTable = data
		})
		fetch('json/gamedata/en_US/gamedata/excel/item_table.json').then(r=>r.json()).then(data=>{
			this.itemTable = data.items
		})
	},
	computed: {
		dailies() {
			if (!this.missionTable.dailyMissionPeriodInfo) return {};
			let info = this.missionTable.dailyMissionPeriodInfo.find(e=>{
				return e.startTime * 1000 <= this.selectedDate
					&& this.selectedDate <= e.endTime * 1000;
			});
			if (!info) return {};
			info.periodList = (info.periodList || []).filter(e=>{
				return e.period.includes(this.period);
			});
			return info;
		},
		dailyTasks() {
			if (!this.dailies.periodList) return [];
			return this.dailies.periodList.map(period=>{
				let k = period.missionGroupId
				let ids = this.missionTable.missionGroups[k].missionIds
				return ids.map(id => this.missionTable.missions[id])
			});
		},
		dailyRewards() {
			if (!this.dailies.periodList) return [];
			return this.dailies.periodList.map(period=>{
				let k = period.rewardGroupId
				let rewards = Object.values(this.missionTable.periodicalRewards)
				return rewards.filter(r => r.groupId === k)
			});
		},
	},
	methods: {
		getItemName(item) {
			if (!this.itemTable[item.id]) {
				return '???';
			}
			return this.itemTable[item.id].name
		},
		getItemIcon(item) {
			if (!this.itemTable[item.id]) {
				return 'img/chara/empty.png';
			}
			return `img/items/${this.itemTable[item.id].iconId}.png`;
		},
	},
	filters: {
		timestamp: function(d) {
			if (!d) return "(n/a)";
			d = new Date(d);
			const pad = (n) => n < 10 ? '0' + n : n;
			return (
				d.getFullYear() + '/' +
				pad(d.getMonth() + 1) + '/' +
				pad(d.getDate()) + ' ' +
				pad(d.getHours()) + ':' +
				pad(d.getMinutes()) + ':' +
				pad(d.getSeconds())
			);
		},

	}
})
