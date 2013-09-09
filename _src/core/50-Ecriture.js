/**
 * [Ecriture description]
 */
$fi.fn.Ecriture=create_class(
	function(m){
		this.set_or_default(m,{
			mouvement:	[],
			date:		'',
			message:	'',
			id:		undefined,
		});

		this.mouvement = this.mouvement.sort(function(a,b){
					if( a[1] > b[1]	) return -1;
					if( b[1] > a[1]	) return 1;
					if( a[1] > 0	) return (a[0]-b[0])/Math.abs(a[0]-b[0]);
					if( a[2] > b[2]	) return 1;
					if( b[2] > a[2]	) return -1;
					return (b[0]-a[0])/Math.abs(b[0]-a[0]);
				} );
	},{

		toVSON:function(){
			return {
				message:	this.message,
				mouvement:	this.mouvement
			};
		},

		o:function(e){
			return new $fi.fn.Ecriture({
				mouvement:	this.mouvement.concat(e.mouvement),
				date:		this.date,
				message:	this.message+"\n"+e.message
			});
		}

	}, ALO );
