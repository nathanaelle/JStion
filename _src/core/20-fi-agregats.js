$fi.fn.aggregate = function(){
	var args = to_array( arguments );

	if(typeof args[0] === 'string'){
		var message = args.shift();

		return function(societe){
			var part = new $fi.fn.Fragment();

			args.forEach(function(c){
				if(typeof c === 'function' ) part = part.add( c(societe) );
			else if(typeof c === 'object' && c instanceof $fi.Fragment() ) part = part.add( c );
				else if(c>0){
					part = part.add(societe.r_etat(""+c).solde());
				}else if(c<0){
					part = part.sub(societe.r_etat(""+(-c)).solde());
				}
			});

			return part.simplify(message);
		};
	}

	return function(societe){
		var part = new $fi.fn.Fragment();

		args.forEach(function(c){
			if(typeof c === 'function' ) part = part.add( c(societe) );
			else if(typeof c === 'object' && c instanceof $fi.Fragment() ) part = part.add( c );
			else if(c>0){
				part = part.add(societe.r_etat(""+c).solde());
			}else if(c<0){
				part = part.sub(societe.r_etat(""+(-c)).solde());
			}
		});

		return part;
	};
};

$fi.fn.ag_mask=function(){
	var args = to_array( arguments );
	var mask = args.slice(0,1).pop();
	args = args.slice(1);

	return function(societe){
		var part = new $fi.fn.Fragment();

		args.forEach(function(c){
			if(typeof c === 'function' ) part = part.add( c(societe).mask(mask) );
			else if(typeof c === 'object' && c instanceof $fi.Fragment() ) part = part.add( c.mask(mask) );
			else if(c>0){
				part = part.add(societe.r_etat(""+c).solde().mask(mask));
			}else if(c<0){
				part = part.sub(societe.r_etat(""+(-c)).solde().mask(mask));
			}
		});

		return part;
	};
};
