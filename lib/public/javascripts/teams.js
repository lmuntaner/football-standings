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
	
	Team.prototype.render = function () {
		this.$el.empty();
		var $id = $('<td>').text(this.id);
		var $name = $('<td>').text(this.name);
		var $pld = $('<td>').text(this.pld);
		var $W = $('<td>').text(this.W);
		var $D = $('<td>').text(this.D);
		var $L = $('<td>').text(this.L);
		var $GF = $('<td>').text(this.GF);
		var $GA = $('<td>').text(this.GA);
		var $GD = $('<td>').text(this.GF - this.GA);
		var $Pts = $('<td>').text(this.Pts());
		this.$el.append($id)
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
	
	Table.prototype.render = function () {
		var table = this;
		var sortedTeams = this.teams.sort( function (team1, team2) {
			if (team1.Pts() > team2.Pts()) {
				return -1;
			} else {
				return 1;
			}
			return 0;
		});
		sortedTeams.forEach( function (team) {
			table.$el.append(team.render().$el);
		});
		
		return this;
	};
	
})(this);