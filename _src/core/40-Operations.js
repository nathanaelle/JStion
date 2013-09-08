$fi.fn.Operation=(function(){

	var f = function(mouvement){
		this.mouvement = mouvement;
		this.needs = mouvement.filter(function(e){
			return e instanceof $fi.fn.promise;
		});
	};

	var reduct_signed = function(x){
		return x.map(function(e){
			return e[1]-e[2];
		}).reduce(function(a,b){
			return a+b;
		},0);
	};

	var reduct = function(x){
		return Math.abs(x.map(function(e){
			return e[1]-e[2];
		}).reduce(function(a,b){
			return a+b;
		},0));
	};


	f.prototype={
		compose:function(vars){
			if(this.needs.length > vars.length ) vars = this.needs[0].grab( this.needs, vars );

			return this.mouvement.reduce(function(e1,e2){
				// console.log([ 'compose',e1,e2,vars])
				if(e2 instanceof $fi.fn.promise){
					e2 = e2.exec(vars.shift());
				}
				return e2(reduct(e1)).concat(e1);
			}, [] );
		}
	};

	return function(){
		var ope = [].concat(Array.prototype.slice.call( arguments ));
		var o = new f( ope );
		var r=function(){
			var args = [].concat( Array.prototype.slice.call( arguments ) );
			var e = {
				message:	args[0],
				date:		args[1],
				mouvement:	o.compose( args.slice(2) )
			};

			if(reduct(e.mouvement)){
				console.log('bordel');
				console.log(e);
			}

			return new $fi.fn.Ecriture(e);
		};
		r.toJSON=function(){
			return ope;
		};

		for( var k in o ) r[k] = o[k];

		return r;
	};
})();
