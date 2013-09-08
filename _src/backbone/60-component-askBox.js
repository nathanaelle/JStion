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

