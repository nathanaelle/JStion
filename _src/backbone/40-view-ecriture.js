$fi.fn.v.Ecriture=
	Backbone.View.extend({
		el:'<table>',
		template:_.template('<caption><%= meta.message %></caption>'+
			'<tr><th>compte</th><th>debit</th><th>credit</th></tr>'+
			'<% _.each( mouvement, function(l){ %><tr><th><%= l[0] %></th><td><%= (window.$fi.fn.v.is_empty(f))?"":f %></td><td><%= (window.$fi.fn.v.is_empty(f))?"":f %></td></tr> <% }) %></table>' ),

		render:function(ev){ $(this.el).html(this.template(this.model.toVSON())); return this; },
	});
