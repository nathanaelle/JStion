$fi.fn.aggregate = function(){
	var args = [].concat( Array.prototype.slice.call( arguments ) );

	if(typeof args[0] === 'string'){
		var message = args.shift();

		return function(societe){
			part = new $fi.fn.Fragment();
			args.forEach(function(c){
				if(typeof c === 'function' ) part = part.add( c(societe) );
			else if(typeof c === 'object' && c instanceof $fi.Fragment() ) part = part.add( c );
				else if(c>0){
					part = part.add(societe.flux(""+c));
				}else if(c<0){
					part = part.sub(societe.flux(""+(-c)));
				}
			});

			return part.simplify(message);
		};
	}

	return function(societe){
		part = new $fi.fn.Fragment();
		args.forEach(function(c){
			if(typeof c === 'function' ) part = part.add( c(societe) );
			else if(typeof c === 'object' && c instanceof $fi.Fragment() ) part = part.add( c );
			else if(c>0){
				part = part.add(societe.flux(""+c));
			}else if(c<0){
				part = part.sub(societe.flux(""+(-c)));
			}
		});

		return part;
	};
};



$fi.fn.ag_debit=function(){
	var args = [].concat( Array.prototype.slice.call( arguments ) );

	return function(societe){
		part = new $fi.fn.Fragment();
		args.forEach(function(c){
			if(typeof c === 'function' ) part = part.add( c(societe).debit() );
			else if(typeof c === 'object' && c instanceof $fi.Fragment() ) part = part.add( c.debit() );
			else if(c>0){
				part = part.add(societe.flux(""+c).solde().debit());
			}else if(c<0){
				part = part.sub(societe.flux(""+(-c)).solde().debit());
			}
		});

		return part;
	};
};

$fi.fn.ag_credit=function(){
	var args = [].concat( Array.prototype.slice.call( arguments ) );

	return function(societe){
		part = new $fi.fn.Fragment();
		args.forEach(function(c){
			if(typeof c === 'function' ) part = part.add( c(societe).credit() );
			else if(typeof c === 'object' && c instanceof $fi.Fragment() ) part = part.add( c.credit() );
			else if(c>0){
				part = part.add(societe.flux(""+c).solde().credit());
			}else if(c<0){
				part = part.sub(societe.flux(""+(-c)).solde().credit());
			}
		});

		return part;
	};
};
