/**
 *	Debit Credit
 */
$fi.fn.DC	=new MultiPart( 2, 3,
	function (debit,credit){
		return debit-credit;
	},
	function (debit,credit){
		return [ credit, debit ];
	},
	function (a,b){
		if( a[0] > b[0]	) return -1;
		if( b[0] > a[0]	) return 1;
		if( a[0] > 0	) return 0;
		if( a[1] > b[1]	) return 1;
		if( b[1] > a[1]	) return -1;
		return 0;

	},
	function (debit,credit){
		return [ debit-credit, credit-debit ].map(function(i){
			return i>0?i:0;
		});
	}
	);

$fi.fn.DC.U_Debit	=$fi.fn.DC.UNITS[0];
$fi.fn.DC.U_Credit	=$fi.fn.DC.UNITS[1];

$fi.fn.DC_P2	=new MultiPart( 2, 2,
	function (debit,credit){
		return debit-credit;
	},
	function (debit,credit){
		return [ credit, debit ];
	},
	function (a,b){
		if( a[0] > b[0]	) return -1;
		if( b[0] > a[0]	) return 1;
		if( a[0] > 0	) return 0;
		if( a[1] > b[1]	) return 1;
		if( b[1] > a[1]	) return -1;
		return 0;

	},
	function (debit,credit){
		return [ debit-credit, credit-debit ].map(function(i){
			return i>0?i:0;
		});
	}
	);

$fi.fn.DC_P2.U_Debit	=$fi.fn.DC_P2.UNITS[0];
$fi.fn.DC_P2.U_Credit	=$fi.fn.DC_P2.UNITS[1];
