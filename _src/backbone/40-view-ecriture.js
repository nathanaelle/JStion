$fi.fn.v.Ecriture=
	Backbone.View.extend({
		el:'<table>',
		template:_.template('<caption><%= message %></caption>'+
			'<tr><th>compte</th><th>debit</th><th>credit</th></tr>'+
			'<% _.each( mouvement, function(l){ %><tr><th><%= l[0] %></th><td><%= l[1]?l[1].toFixed(window.$fi.fix):"" %></td><td><%= l[2]?l[2].toFixed(window.$fi.fix):"" %></td></tr> <% }) %></table>' ),

		render:function(ev){ $(this.el).html(this.template(this.model.toVSON())); return this; },
	});
