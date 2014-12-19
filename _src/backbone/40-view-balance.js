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
