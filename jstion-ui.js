/*

igrab:function(needs,vars){
	needs = {
		titre:'plop',
		messages:needs.slice(vars.length).map(function(n){return n.f.help})
	};
	var v = new window.$fi.v.WantedBox({model: needs });
	$('body').html( v.render().el );
	return vars;
},
*/

window.$fi.fn.m={

	Entite: Backbone.Model.extend({
		history:function(	){ return this.get('entite').history(); },
		back:	function(i	){ return this.get('entite').back(i); },
		current:function(	){ return this.get('entite').back(0); },
		nom:	function(	){ return this.get('entite').nom; },
		toJSON:	function(	){ return this.get('entite').toJSON(); },
		toVSON:	function(	){ return this.get('entite').toVSON(); },
	}),

};

window.$fi.fn.v={
	b2: _.template('<tr><th><%=account%><td><%=debit%><td><%=credit%><td><%=solde_debit%><td><%=solde_credit%></tr><% _.each( subaccounts, function(c){%><%= window.$fi.v.b2(c) %><% }); %>'),

	Journal: Backbone.View.extend({
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
			return this; },
	}),

	Balance: Backbone.View.extend({
		el:'<table>',
		template:_.template('<caption><%=nom%> — <%=message%></caption>'+
			'<tr><th>compte<th>debit<th>credit<th>Solde débiteur<th>Solde créditeur</tr><% _.each( livre.accounts, function(c){ %><%= window.$fi.v.b2(c) %><% }); %>'),

		render:function(ev){ $(this.el).html(this.template(this.model.toVSON())); return this; },
	}),

	Ecriture: Backbone.View.extend({
		el:'<table>',
		template:_.template('<caption><%= message %></caption>'+
			'<tr><th>compte</th><th>debit</th><th>credit</th></tr>'+
			'<% _.each( mouvement, function(l){ %><tr><th><%= l[0] %></th><td><%= l[1]?l[1].toFixed(window.$fi.fix):"" %></td><td><%= l[2]?l[2].toFixed(window.$fi.fix):"" %></td></tr> <% }) %></table>' ),

		render:function(ev){ $(this.el).html(this.template(this.model.toVSON())); return this; },
	}),

	WantedBox: Backbone.View.extend({
		el:'<div>',
		template:_.template('<a href="#" class="close">fermer</a><form class="signin" action="#"><fieldset class="textbox"><legend><%=titre%></legend>'+
			'<% _.each( messages, function(message,i){ %><label><span><%=message%></span><input id="f<%=i%>" type="number"></label><% }); %>'+
			'<button class="submit button" type="button">OK</button></fieldset></form>' ),

		render:function(ev){ $(this.el).html(this.template( this.model )); return this; },
	}),

};
