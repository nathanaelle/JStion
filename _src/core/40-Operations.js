$fi.fn.Operation=(function (){

	var reduct_signed = function (x){
		return x.map(function (e){
			return e[1]-e[2];
		}).reduce(function (a,b){
			return a+b;
		},0);
	};

	var reduct_unsigned = function (x){
		return Math.abs(x.map(function (e){
			return e[1]-e[2];
		}).reduce(function (a,b){
			return a+b;
		},0));
	};

	var reduct = function (x){
		if(x.length === 0)	return 0;
		return Math.abs(x.reduce(function (old,v){ return old.add(v[1]); }, x[0][1].zero() ).reduction());
	};

	var equilibre = function (x){
		if(x.length === 0)	return true;
		return Math.abs(x.reduce(function (old,v){ return old.add(v[1]); }, x[0][1].zero() ).inEquilibrium());
	};


	var operations = create_monad()

		.lift_value('o',function (mouvement,f){
			if( f === undefined )		return compose_operation( mouvement );
			if( f.bind === undefined )	return compose_operation( mouvement );

			return compose_operation( mouvement.concat( f.bind( function (mouvement){
				return mouvement;
			} )));
		})

		.lift_value('grab',function (mouvement, vars){
			var t = mouvement
				.filter(function (e){
					return e instanceof $fi.fn.promise;
				}).slice(vars.length);

			if(t.length === 0 ) return vars;

			return vars.concat(
				t
				.map(function (n){
					return Number(prompt(n.f.help));
				}));
		})

		.lift_value('toJSON', function (mouvement) {
			return mouvement.slice(0);
		})

		.lift_value('compose',function (mouvement,vars) {
			return mouvement.reduce(function (e1,e2){
			//	console.log([ 'compose', reduct(e1), e1, e2, vars ].map(JSON.stringify));

				if(e2 instanceof $fi.fn.promise){
					var arg = vars.shift();
					if( arg instanceof Function ) arg = reduct(arg( e1 ));
					e2 = e2.resolve(arg);
				}

				return e2(reduct(e1)).concat(e1);
			}, [] );
		})


		.method('resolve', function (){
			var args = to_array( arguments );
			var meta = args.shift();

			var e = {
				meta:		meta,
				mouvement:	this.compose( this.grab( args ))
			};

			if(!equilibre(e.mouvement)) {
				console.log('non équilibré : '+ reduct(e.mouvement) );
				console.log(e);
				throw new Exception('Ecriture non équilibrée');
			}

			return new $fi.fn.Ecriture(e);
		});


	var compose_operation = function ( mouvement ){
		var op = operations( mouvement );

		var r = op.resolve.bind( op );

		r.o = op.o.bind( op );
		r.bind = op.bind.bind( op );
		r.toJSON= op.toJSON.bind( op );

		return r;
	};

	return function (){
		return compose_operation( to_array( arguments ) );
	};
})();



$fi.fn.peek_last = function (e){
//	console.log(JSON.stringify(e) );
	return [e[0]];
};
