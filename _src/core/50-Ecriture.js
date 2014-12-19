/**
 * [Ecriture description]
 */
$fi.fn.Ecriture=create_class(
	function (m){
		this.set_or_default(m,{
			mouvement:	[],
			meta:		{ message: '' },
			id:		undefined,
		});

		this.meta	= new Hash( this.meta );

		this.mouvement = this.mouvement.sort(function (a,b){
			var c =a[1].compare(b[1]);
			if(c!==0) return c;
			if(a[1].compare(a[1].zero() ) < 0) return (a[0]-b[0])/Math.abs(a[0]-b[0]);
			return (b[0]-a[0])/Math.abs(b[0]-a[0]);
		} );
	},{

		toVSON:function (){
			return {
				meta:		this.meta,
				mouvement:	this.mouvement.map(function(e){
					return [ e[0], e[1].toJSON() ];
				})
			};
		},

		o:function (e){
			return new $fi.fn.Ecriture({
				mouvement:	this.mouvement.concat(e.mouvement),
				meta:		this.meta.concat( e.meta )
			});
		}

	}, ALO );
