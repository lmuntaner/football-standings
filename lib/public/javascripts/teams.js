(function (root) {
		
	var App = root.App = (root.App || {});
	
	var Team = App.Team = function (options) {
		this.id = options.id;
		this.name = options.name;
		this.table = options.table;
		this.$el = $('<tr>');
		this.pld = 0;
		this.W = 0
		this.D = 0;
		this.L = 0;
		this.GF = 0;
		this.GA = 0;
		
	};
	
	Team.prototype.addGame = function (data) {
		this.pld++;
		var GF = parseInt(data.GF);
		var GA = parseInt(data.GA);
		this.GF += GF;
		this.GA += GA;
		if (GF > GA) {
			this.W++;
		} else if (GF < GA) {
			this.L++;
		} else {
			this.D++;
		}			
		this.table.render();
	};
	
	Team.prototype.Pts = function () {
		return (this.W * 3) + this.D;
	};
	
	Team.prototype.GD = function () {
		return this.GF - this.GA;
	};
	
	Team.prototype.render = function (position) {
		this.$el.empty();
		var $pos = $('<td>').text(position);
		var $name = $('<td>').text(this.name);
		var $pld = $('<td>').text(this.pld);
		var $W = $('<td>').text(this.W);
		var $D = $('<td>').text(this.D);
		var $L = $('<td>').text(this.L);
		var $GF = $('<td>').text(this.GF);
		var $GA = $('<td>').text(this.GA);
		var $GD = $('<td>').text(this.GD());
		var $Pts = $('<td>').text(this.Pts());
		this.$el.append($pos)
				.append($name)
				.append($pld)
				.append($W)
				.append($D)
				.append($L)
				.append($GF)
				.append($GA)
				.append($GD)
				.append($Pts);
		
		return this;
	};
	
	var Table = App.Table = function (socket) {
		this.socket = socket;
		console.log(this.socket);
		this.teams = [];
		this.$el = $('#table-standings');
		var table = this;
		$.ajax({
			url: "/teams",
			type: "GET",
			success: function (data) {
				data.forEach( function (teamInfo) {
					teamInfo.table = table
					table.teams.push(new Team(teamInfo));
				})
				table.render();
			}
		});
		this.listenToSocket();
	};
	
	Table.prototype.listenToSocket = function () {
		console.log("listening to socket...");
		var table = this;
		this.socket.onopen = function () {
			console.log("connected");
		};
		this.socket.onmessage = function (msg) {
			var data = JSON.parse(msg.data);
			var homeTeam = table.teams.filter(function (team) {
				return team.id === data.homeTeamId;
			})[0];
			var awayTeam = table.teams.filter(function (team) {
				return team.id === data.awayTeamId;
			})[0];
			homeTeam.addGame({
				GF: data.homeGoals,
				GA: data.awayGoals
			});
			awayTeam.addGame({
				GF: data.awayGoals,
				GA: data.homeGoals
			});
		};
	};
	
	function comparePts(team1, team2) {
		if (team1.Pts() > team2.Pts()) {
			return -1;
		} else if (team1.Pts() < team2.Pts()) {
			return 1;
		} else {
			return 0;
		}
	};
	
	function compareGD(team1, team2) {
		if (team1.GD() > team2.GD()) {
			return -1;
		} else if (team1.GD() < team2.GD()){
			return 1;
		} else {
			return 0;
		}
	};
	
	function compareGF(team1, team2) {
		if (team1.GF > team2.GF) {
			return -1;
		} else if (team1.GF < team2.GF){
			return 1;
		} else {
			return 0;
		}
	};
	
	function compareName(team1, team2) {
		if (team1.name > team2.name) {
			return 1;
		} else if (team1.name < team2.name){
			return -1;
		} else {
			return 0;
		}
	};
	
	function compareTeams(team1, team2) {
		if (comparePts(team1, team2)) {
			return comparePts(team1, team2);
		} else if (compareGD(team1, team2)) {
			return compareGD(team1, team2);
		} else if (compareGF(team1, team2)) {
			return compareGF(team1, team2);
		} else {
			return compareName(team1, team2);
		}
	};
	
	Table.prototype.render = function () {
		var table = this;
		var sortedTeams = this.teams.sort(compareTeams);
		sortedTeams.forEach( function (team, index) {
			table.$el.append(team.render(index + 1).$el);
		});
		
		return this;
	};
	
})(this);