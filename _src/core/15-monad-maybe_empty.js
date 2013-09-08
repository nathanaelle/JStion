var maybe_empty = create_monad(function(M,v){
	if(v.length >0 )	return v;
	M.bind = function() {
		return new $fi.fn.Fragment([]);
	};
	return [];
});
