var $fi = window.$fi;
var mov={};
var ope={};
var ecr={};

$fi
.create_operateur('param'	, function(x){			return this.scale(x)				;})
.create_operateur('constant'	, function(t){			return function(x){ return this.scale(t)	;}})
.create_operateur('taux'	, function(t){ t=t/100;		return function(x){ return this.scale(t*x)	;}})
.create_operateur('itaux'	, function(t){ t=1-1/(1+t/100);	return function(x){ return this.scale(t*x)	;}})

mov= {
	marchandise	: $fi.op('param'	)('607'	, $fi.DC.U_Debit , 'montant marchandise'			),
	tva		: $fi.op('taux'		)('44566',$fi.DC.U_Debit , 'taux tva'					),
	avoir_tva	: $fi.op('itaux'	)('44566',$fi.DC.U_Credit, 'taux tva'					),
	remise		: $fi.op('taux'		)('607'	, $fi.DC.U_Credit, 'taux remise'				),
	fournisseur	: $fi.op('param'	)('401'	, $fi.DC.U_Credit, 'montant payé au fournisseur'		),
	reg_fourn	: $fi.op('param'	)('401'	, $fi.DC.U_Debit , 'montant de la régularisation fournisseur'	),
	sortie_bnk	: $fi.op('param'	)('512'	, $fi.DC.U_Credit, 'sortie de la banque'			),
	escompte	: $fi.op('taux'		)('765'	, $fi.DC.U_Credit, "taux d'escompte"				),
	fraisport	: $fi.op('constant'	)('624'	, $fi.DC.U_Debit , "montant frais de transport"			),
	assurance	: $fi.op('constant'	)('616'	, $fi.DC.U_Debit , "montant frais d'assurance"			),
};

ope = {
	achat_fournisseur		: $fi.Operation( $fi.want(mov.marchandise), $fi.want(mov.tva), mov.fournisseur ),
	achat_avec_remise_et_escompte	: $fi.Operation( $fi.want(mov.marchandise), $fi.want(mov.remise),$fi.want(mov.escompte),mov.tva(19.6),mov.fournisseur ),
	achat_avec_forfait_assu_port	: $fi.Operation( $fi.want(mov.marchandise), $fi.want(mov.fraisport),mov.assurance(100),mov.tva(19.6),mov.fournisseur ),
	paie_escompte_achat_fourniture	: $fi.Operation( $fi.want(mov.reg_fourn), mov.avoir_tva(19.6), $fi.want(mov.escompte), mov.tva(19.6), mov.sortie_bnk ),
	paie_achat_fourniture		: $fi.Operation( $fi.want(mov.reg_fourn), mov.sortie_bnk ),
};

describe('Checking Ecriture',function(){
	var UD =function(a){ return JSON.stringify($fi.DC.U_Debit.scale(a)); };
	var UC =function(a){ return JSON.stringify($fi.DC.U_Credit.scale(a)); };
	ecr={
		a1: [	ope.achat_fournisseur			({message:'achat fournisseur avec TVA à 10%'					,date:'2012-01-01'},  1000, 10	)
			,'{"mouvement":[["607",'+UD(1000)+'],["44566",'+UD(100)+'],["401",'+UC(1100)+']],"meta":{"message":"achat fournisseur avec TVA à 10%","date":"2012-01-01"}}'
			,'{"meta":{"message":"achat fournisseur avec TVA à 10%","date":"2012-01-01"},"mouvement":[["607",'+UD(1000)+'],["44566",'+UD(100)+'],["401",'+UC(1100)+']]}'
		],
		a2: [	ope.achat_avec_remise_et_escompte	({message:"achat fournisseur de 15000€ HT avec 10% remise et 4% d'escompte"	,date:'2012-01-01'}, 15000, 10, 4	)
			,'{"mouvement":[["607",'+UD(15000)+'],["44566",'+UD(2540.16)+'],["765",'+UC(540)+'],["607",'+UC(1500)+'],["401",'+UC(15500.16)+']],'+
			'"meta":{"message":"achat fournisseur de 15000€ HT avec 10% remise et 4% d\'escompte","date":"2012-01-01"}}'
			,'{"meta":{"message":"achat fournisseur de 15000€ HT avec 10% remise et 4% d\'escompte","date":"2012-01-01"},"mouvement":'+
			'[["607",'+UD(15000)+'],["44566",'+UD(2540.16)+'],["765",'+UC(540)+'],["607",'+UC(1500)+'],["401",'+UC(15500.16)+']]}'
		],
		a3: [	ope.achat_avec_forfait_assu_port	({message:'achat fournisseur de 2500€ HT avec frais de port et assurance'	,date:'2012-01-01'},  2500, 200	)
			,'{"mouvement":[["607",'+UD(2500)+'],["44566",'+UD(548.80)+'],["624",'+UD(200)+'],["616",'+UD(100)+'],["401",'+UC(3348.8)+']],'+
			'"meta":{"message":"achat fournisseur de 2500€ HT avec frais de port et assurance","date":"2012-01-01"}}'
			,'{"meta":{"message":"achat fournisseur de 2500€ HT avec frais de port et assurance","date":"2012-01-01"},"mouvement":'+
			'[["607",'+UD(2500)+'],["44566",'+UD(548.80)+'],["624",'+UD(200)+'],["616",'+UD(100)+'],["401",'+UC(3348.8)+']]}'
		],
		a4: [	ope.achat_avec_forfait_assu_port	({message:'achat fournisseur de 9000€ HT avec frais de port et assurance'	,date:'2012-01-01'},  9000, 100	)
			,'{"mouvement":[["607",'+UD(9000)+'],["44566",'+UD(1803.2)+'],["616",'+UD(100)+'],["624",'+UD(100)+'],["401",'+UC(11003.2)+']],'+
			'"meta":{"message":"achat fournisseur de 9000€ HT avec frais de port et assurance","date":"2012-01-01"}}'
			,'{"meta":{"message":"achat fournisseur de 9000€ HT avec frais de port et assurance","date":"2012-01-01"},"mouvement":'+
			'[["607",'+UD(9000)+'],["44566",'+UD(1803.2)+'],["616",'+UD(100)+'],["624",'+UD(100)+'],["401",'+UC(11003.2)+']]}'
		],
		a5: [	ope.paie_escompte_achat_fourniture	({message:'paiement fournisseur de 9568€ TTC avec escompte à 3%'		,date:'2012-01-01'},  9568, 3	)
			,'{"mouvement":[["401",'+UD(9568)+'],["44566",'+UD(1520.96)+'],["765",'+UC(240)+'],["44566",'+UC(1568)+'],["512",'+UC(9280.96)+']],'+
			'"meta":{"message":"paiement fournisseur de 9568€ TTC avec escompte à 3%","date":"2012-01-01"}}'
			,'{"meta":{"message":"paiement fournisseur de 9568€ TTC avec escompte à 3%","date":"2012-01-01"},"mouvement":'+
			'[["401",'+UD(9568)+'],["44566",'+UD(1520.96)+'],["765",'+UC(240)+'],["44566",'+UC(1568)+'],["512",'+UC(9280.96)+']]}'
		],
		a6: [	ope.achat_fournisseur			({message:'achat MacBook Pro avec TVA à 19.6%'			,date:'2012-01-01'},  1999, 19.6	).o(
			ope.paie_achat_fourniture		({message:'paiement immediat sans escompte'			,date:'2012-01-01'},  1999*1.196	))
			,'{"mouvement":[["401",'+UD(2390.804)+'],["607",'+UD(1999)+'],["44566",'+UD(391.804)+'],["512",'+UC(2390.804)+'],["401",'+UC(2390.804)+']],'+
			'"meta":{"message":"achat MacBook Pro avec TVA à 19.6%\\npaiement immediat sans escompte","date":"2012-01-01\\n2012-01-01"}}'
			,'{"meta":{"message":"achat MacBook Pro avec TVA à 19.6%\\npaiement immediat sans escompte","date":"2012-01-01\\n2012-01-01"},"mouvement":'+
			'[["401",'+UD(2390.804)+'],["607",'+UD(1999)+'],["44566",'+UD(391.804)+'],["512",'+UC(2390.804)+'],["401",'+UC(2390.804)+']]}'
		]
	}

	for( var i in ecr )(function(i,f,s,vs){
		it(i +' is a function',function(){
			expect( f instanceof Object ).toBe(true);
		});
		it('transform '+i+' to JSON',function(){
			expect( JSON.stringify( f ) ).toBe( s );
		});
		it('transform '+i+' to VSON',function(){
			expect( JSON.stringify( f.toVSON() ) ).toBe( vs );
		});
	})(i,ecr[i][0],ecr[i][1],ecr[i][2]);


	it("la composition d'écritures équivaut à l'écriture d'une composition d'opération sans peek_last",function(){
		expect(JSON.stringify(
			ecr.a6[0].mouvement
		)).toBe( JSON.stringify(
			( (ope.achat_fournisseur.o( ope.paie_achat_fourniture ))(
				{message:'achat MacBook Pro avec TVA à 19.6%'	,date:'2012-01-01'}, 1999, 19.6, 1999*1.196 )).mouvement
		));
	});

	it("la composition d'écritures équivaut à l'écriture d'une composition d'opération avec peek_last",function(){
		expect(JSON.stringify(
			ecr.a6[0].mouvement
		)).toBe( JSON.stringify(
			( (ope.achat_fournisseur.o( ope.paie_achat_fourniture ))(
				{message:'achat MacBook Pro avec TVA à 19.6%'	,date:'2012-01-01'}, 1999, 19.6, 1999*1.196 )).mouvement

		));
	});


});

