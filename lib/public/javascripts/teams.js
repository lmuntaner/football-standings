(function (root) {
		
	var App = root.App = (root.App || {});
	
	var Team = App.Team = function (options) {
		this.id = options.id;
		this.name = options.name;
		this.$el = $('<tr>');
		this.pld = 0;
	};
	
	Team.prototype.addGame = function (data) {
		this.pld++;
		this.render();
	};
	
	Team.prototype.render = function () {
		this.$el.empty();
		var $id = $('<td>').text(this.id);
		var $name = $('<td>').text(this.name);
		var $pld = $('<td>').text(this.pld);
		this.$el.append($id).append($name).append($pld);
		
		return this;
	};
	
	var Teams = App.Teams = function (socket) {
		this.socket = socket;
		console.log(this.socket);
		this.teams = [];
		this.table = $('#table-standings');
		var collection = this;
		$.ajax({
			url: "/teams",
			type: "GET",
			success: function (data) {
				data.forEach( function (teamInfo) {
					collection.teams.push(new Team(teamInfo));
				})
				collection.render();
			}
		});
		this.listenToSocket();
	};
	
	Teams.prototype.listenToSocket = function () {
		console.log("listening to socket...");
		var collection = this;
		this.socket.onopen = function () {
			console.log("connected");
		};
		this.socket.onmessage = function (msg) {
			var data = JSON.parse(msg.data);
			var homeTeam = collection.teams.filter(function (team) {
				console.log(team.id);
				console.log(data.homeTeamId);
				return team.id === data.homeTeamId;
			})[0];
			homeTeam.addGame({
				GF: data.homeGoals,
				GA: data.awayGoals
			});
		};
	};
	
	Teams.prototype.render = function () {
		var collection = this;
		this.teams.forEach( function (team) {
			collection.table.append(team.render().$el);
		});
		
		return this;
	};
	
})(this);