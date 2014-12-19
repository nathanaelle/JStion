var $fi = window.$fi;
var ope={};

describe('Checking Operateur',function(){

	it('$fi.create_operateur is a function',function(){
		expect($fi.create_operateur instanceof Function ).toBe(true);
	});

	$fi.create_operateur(
		'param', function(x){ return this.scale(x); }
	);

	it('$fi.op("param") is a function',function(){
		expect( $fi.op('param') instanceof Function ).toBe(true);
	});

	$fi
	.create_operateur('constant'	, function(t){			return function(x){ return this.scale(t)	;}})
	.create_operateur('taux'	, function(t){ t=t/100;		return function(x){ return this.scale(t*x)	;}})
	.create_operateur('itaux'	, function(t){ t=1-1/(1+t/100);	return function(x){ return this.scale(t*x)	;}})

	it('$fi.op("constant") is a function',function(){
		expect( $fi.op('constant') instanceof Function ).toBe(true);
	});

	it('$fi.op("taux") is a function',function(){
		expect( $fi.op('taux') instanceof Function ).toBe(true);
	});

	it('$fi.op("itaux") is a function',function(){
		expect( $fi.op('itaux') instanceof Function ).toBe(true);
	});
});
