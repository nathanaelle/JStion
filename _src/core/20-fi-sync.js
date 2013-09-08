$fi.fn.sync = function(method,model,options){
	var r;
	var getclass='';

	options=options||{};
	options.success=options.success||function(){};

	switch (method) {
		case "read":
			if( model.id === undefined )	return undefined;
			if( !model.id ){
				console.log(model);
				console.error('no id in model for method '+method);
				throw new Exception('no id in model for method '+method);
			}
			var r =this.storage.getItem(model.id);
			if(r === undefined ) return undefined;
			//console.log('read = '+ model.id + ' -- '+ r );

			r= JSON.parse( r );
			r.type = this[r.type];
			r.data.id = model.id;
			r.data.$ = this;
			r= new r.type( r.data );
			break;

		case "create":
		case "update":
			for( var k in instanciable ){
				if(model instanceof this[k]){
					getclass=k;
					break;
				}
			}

			this.storage.setItem( model.sign(), JSON.stringify( { type: getclass,  data: model } ) );
			r= model;
			break;

		case "delete":
			this.storage.removeItem( model.sign() );
			r= {};
	}

	options.success(r);
	return r;

};
