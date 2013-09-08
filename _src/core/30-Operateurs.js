$fi.fn.op = function(name){
	return this.e.operateurs[name] || function(){ console.log('operateur '+ c +' indefini') };
}


/**
 * create an account operator
 *
 * @param  {String} name name of the operator
 * @param  {Function} ope  code of the operator
 *
 * @return {Function}      [description]
 */
$fi.fn.create_operateur = function(name,ope){
	this.e.operateurs[name]=function(account,f_debit,f_credit,help){
		var f = function(x){
			var y = ope.apply({ f_debit:f_debit,f_credit:f_credit  }, [x] );
			if( y instanceof Function ) {
				var z = function(x){
					return [ [account].concat( y.apply({ f_debit:f_debit,f_credit:f_credit  },[x]) ) ]
				}
				z.toJSON	= function(){ return [ [ name, account, f_debit, f_credit, help ], x ] };
				return z
			}
			return [ [account].concat( y ) ]
		};
		f.help		= function(){ return (typeof help === 'string')?help:'' };
		f.toJSON	= function(){ return [ name, account, f_debit, f_credit, help ] };

		return f;
	}

	this.save();

	return this;
}
