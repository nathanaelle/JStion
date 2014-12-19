/*
 * Definitions des operateurs
 */
$fi
.create_operateur('param'	, function(x){				return this.scale(x)				;})
.create_operateur('constant'	, function(t){				return function(x){ return this.scale(t)	;};})
.create_operateur('taux'	, function(t){ t=t/100;			return function(x){ return this.scale(t*x)	;};})
.create_operateur('itaux'	, function(t){ t=1-1/(1+t/100);		return function(x){ return this.scale(t*x)	;};})
.create_operateur('ceil'	, function(x){ x=Math.ceil(x)-x;	return this.scale(x)				;})
;
