(function (root) {
	
	console.log("inside the teams.js");
	
	var App = root.App = (root.App || {});
	
	var Team = App.Team = function (options) {
		this.id = options.id;
		this.name = options.name;
		this.$el = $('<tr>');
	};
	
	Team.prototype.render = function () {
		var $id = $('<td>').text(this.id);
		var $name = $('<td>').text(this.name);
		this.$el.append($id).append($name);
		
		return this;
	};
	
	var Teams = App.Teams = function (socket) {
		this.socket = socket;
		this.teams = [];
		this.table = $('#table-standings');
		var that = this;
		$.ajax({
			url: "/teams",
			type: "GET",
			success: function (data) {
				data.forEach( function (teamInfo) {
					that.teams.push(new Team(teamInfo));
				})
				that.render();
			}
		});
	};
	
	Teams.prototype.render = function () {
		var that = this;
		this.teams.forEach( function (team) {
			that.table.append(team.render().$el);
		});
		
		return this;
	};
	
})(this);