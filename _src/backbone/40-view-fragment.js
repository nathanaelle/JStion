$fi.fn.v.Fragment=
	Backbone.View.extend({
		el:'<table>',
		template:_.template(
			'<tr><th>compte</th><th>debit</th><th>credit</th></tr>'+
			'<% _.each( d, function(l){ %><tr><th><%= l[0] %></th><td><%= l[1] %></td><td><%= l[2] %></td></tr> <% }) %></table>' ),

		render:function(ev){ $(this.el).html(this.template({d:this.model.toVSON()})); return this; },
	});
