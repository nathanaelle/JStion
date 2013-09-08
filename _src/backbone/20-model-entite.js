$fi.fn.m.Entite=
	Backbone.Model.extend({
		history:function(	){ return this.get('entite').history(); },
		back:	function(i	){ return this.get('entite').back(i); },
		current:function(	){ return this.get('entite').back(0); },
		nom:	function(	){ return this.get('entite').nom; },
		toJSON:	function(	){ return this.get('entite').toJSON(); },
		toVSON:	function(	){ return this.get('entite').toVSON(); },
	});
