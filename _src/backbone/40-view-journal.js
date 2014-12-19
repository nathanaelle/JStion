$fi.fn.v.Journal=
	Backbone.View.extend({
		el:'<dl>',
		template:_.template('<dt><%= meta.date %> : <%= meta.message %><% if(mouvement.length){%><dd><table><tr><th>compte<th>debit<th>crédit</tr>'+
			'<% _.each( mouvement, function(l){ %><tr><th><%= l[0] %></th>'+
			'<% _.each( l[1], function(f){%><td><%= (window.$fi.fn.v.is_empty(f))?"":f %></td><% }) %>'+
			'</tr> <% }) %>'+
			'</table><% } %>'),

		render:function(ev){
			var view	= this;
			var model	= this.model;
			var el		= $(this.el);
			_.each(model.history().slice().reverse(),function(log){
				if(log.parents === undefined ) return;
				var livre = model.checkout(log.id);
				el.append(view.template( livre.diff( livre.back(1) ).toVSON() ));
			});
			return this;
		},
	});
