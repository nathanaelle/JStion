$fi.fn.v.b2=
	_.template('<tr><th><%=account%><td><%=debit%><td><%=credit%><td><%=solde_debit%><td><%=solde_credit%></tr><% _.each( subaccounts, function(c){%><%= window.$fi.v.b2(c) %><% }); %>');

$fi.fn.v.Balance=
	Backbone.View.extend({
		el:'<table>',
		template:_.template('<caption><%=nom%> — <%=message%></caption>'+
			'<tr><th>compte<th>debit<th>credit<th>Solde débiteur<th>Solde créditeur</tr><% _.each( livre.accounts, function(c){ %><%= window.$fi.v.b2(c) %><% }); %>'),

		render:function(ev){ $(this.el).html(this.template(this.model.toVSON())); return this; },
	});
