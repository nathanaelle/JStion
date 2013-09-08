$fi.fn.v.Etat=
	Backbone.View.extend({
		tagName:'table',
		className:'etat',
		template:_.template(
			'<table><% _.each( d, function(l){ %><tr class="h<%= l[0].split("#").length-1 %>"><td><%= l[0].split("#").pop() %></td><td><%= l[1] %></td> <% }) %></table>' ),

		render:function(ev){
			$(this.el).html('<tr><td>'+this.template({d:this.model.col_1.toVSON()}) +'</td><td>'+this.template({d:this.model.col_2.toVSON()})+'</td></tr>');
			return this;
		},
	});
