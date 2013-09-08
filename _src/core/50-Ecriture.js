/**
 * [Ecriture description]
 */
$fi.fn.Ecriture=create_class(
	function(m){
		this.set_or_default(m,{
			mouvement:[],
			date:'',
			message:'',
			id:undefined,
		});
	},{
		toVSON:function(){
			return { message:this.message, mouvement:this.mouvement.reverse() };
		},
		o:function(e){ return new $fi.fn.Ecriture({ mouvement: this.mouvement.concat(e.mouvement), date:this.date, message:this.message+"\n"+e.message  }) }
	}, ALO );
