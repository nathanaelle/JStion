$fi.fn.v.Journal=
	Backbone.View.extend({
		el:'<dl>',
		template:_.template('<dt><%=message%><% if(mouvement.length){%><dd><table><tr><th>compte<th>debit<th>crédit</tr>'+
			'<% _.each( mouvement, function(l){ %><tr><th><%= l[0] %></th><td><%= l[1]?l[1].toFixed(window.$fi.fix):"" %></td><td><%= l[2]?l[2].toFixed(window.$fi.fix):"" %></td></tr> <% }) %>'+
			'</table><% } %>'),

		render:function(ev){
			var view	= this;
			var model	= this.model;
			var livre	= model.current();
			var el		= $(this.el);
			_.each(model.history(),function(log){
				el.append(view.template( livre.diff( livre.back(1) ).toVSON() ));
				livre = livre.back(1);
			});
			return this;
		},
	});
