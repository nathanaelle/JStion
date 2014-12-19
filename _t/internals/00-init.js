describe('Checking $fi availability',function(){
	it('$fi exists',function(){
		expect(window.$fi).toBeDefined();
	});

	var $fi = window.$fi;

	it('$fi is an Object',function(){
		expect($fi instanceof Object ).toBe(true);
	});
});
