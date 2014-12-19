/*! JStion — 2.0.0 2014-12-19 */
(function(window,$fi,Backbone){

$fi.fn.m={};
$fi.fn.v={};

$fi.fn.m.Entite=
	Backbone.Model.extend({
		history:function(	){ return this.get('entite').history(); },
		checkout:function(i	){ return this.get('entite').checkout(i); },
		back:	function(i	){ return this.get('entite').back(i); },
		current:function(	){ return this.get('entite').back(0); },
		nom:	function(	){ return this.get('entite').nom; },
		toJSON:	function(	){ return this.get('entite').toJSON(); },
		toVSON:	function(	){ return this.get('entite').toVSON(); },
	});
$fi.fn.v.is_empty=function(v){
	//console.log([v, Number(v)]);
	return (Number(v) === 0);
};

$fi.fn.v.b2=
	_.template('<% if(_.filter(data, window.$fi.fn.v.is_empty).length != data.length ) { %>'+
	'<tr><th><%=account%>' +
	'<% _.each( data, function(f){%><td><%= (window.$fi.fn.v.is_empty(f))?"":f %></td><% }) %>'+
	'<% _.each( solde, function(f){%><td><%= (window.$fi.fn.v.is_empty(f))?"":f %></td><% }) %>'+
	'</tr>'+'<% } %>'+
	'<% _.each( subaccounts, function(c){%><%= window.$fi.v.b2(c) %><% }); %>');

$fi.fn.v.Balance=
	Backbone.View.extend({
		el:'<table>',
		template:_.template('<caption><%=nom%> — <%=meta.message%></caption>'+
			'<tr><th>compte<th>debit<th>credit<th>Solde débiteur<th>Solde créditeur</tr><% _.each( livre.accounts, function(c){ %><%= window.$fi.v.b2(c) %><% }); %>'),

		render:function(ev){ $(this.el).html(this.template(this.model.toVSON())); return this; },
	});
$fi.fn.v.Ecriture=
	Backbone.View.extend({
		el:'<table>',
		template:_.template('<caption><%= meta.message %></caption>'+
			'<tr><th>compte</th><th>debit</th><th>credit</th></tr>'+
			'<% _.each( mouvement, function(l){ %><tr><th><%= l[0] %></th><td><%= (window.$fi.fn.v.is_empty(f))?"":f %></td><td><%= (window.$fi.fn.v.is_empty(f))?"":f %></td></tr> <% }) %></table>' ),

		render:function(ev){ $(this.el).html(this.template(this.model.toVSON())); return this; },
	});
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
$fi.fn.v.Fragment=
	Backbone.View.extend({
		el:'<table>',
		template:_.template(
			'<tr><th>compte</th><th>debit</th><th>credit</th></tr>'+
			'<% _.each( d, function(l){ %><tr><th><%= l[0] %></th>'+
			'<% _.each( l[1], function(f){%><td><%= (window.$fi.fn.v.is_empty(f))?"":f %></td><% }) %>'+
			'</tr> <% }) %></table>' ),

		render:function(ev){ $(this.el).html(this.template({d:this.model.toVSON()})); return this; },
	});
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



window.$fi.fn.v.askBox=
	Backbone.View.extend({
		el:'<div>',
		template:_.template('<a href="#" class="close">fermer</a><form class="signin" action="#"><fieldset class="textbox"><legend><%=titre%></legend>'+
			'<% _.each( messages, function(message,i){ %><label><span><%=message%></span><input id="f<%=i%>" type="number"></label><% }); %>'+
			'<button class="submit button" type="button">OK</button></fieldset></form>' ),

		render:function(ev){ $(this.el).html(this.template( this.model )); return this; },
	});
*/

})(window,$fi,Backbone);