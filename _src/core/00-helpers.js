function to_array(arg){
	return [].slice.call( arg || [] );
}

function copy_array(arr){
	return arr.slice();
}

function idem(e){
	return e;
}

function filter_and_dispatch( filter, exact ) {
	return function (set){
		return set.filter( filter ).reduce(function(resp,e){
			if(exact(e))	return {
				exact:	resp.exact.concat([e]),
				sub:	resp.sub
			};
			return {
				exact:	resp.exact,
				sub:	resp.sub.concat([e])
			};
		}, { exact:[], sub:[] } );
	};
}
