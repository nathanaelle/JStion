var $fi = window.$fi;
var mov={};
var ope={};
var ecr={};

describe('Checking Operateur',function(){

	it('$fi.create_operateur is a function',function(){
		expect($fi.create_operateur instanceof Function ).toBe(true);
	});

	$fi.create_operateur(
		'param', function(x){return [ this.f_debit*x, this.f_credit*x ]; }
	);

	it('$fi.op("param") is a function',function(){
		expect( $fi.op('param') instanceof Function ).toBe(true);
	});

	$fi.create_operateur(
		'constant', function(t){return function(x){return[ this.f_debit*t, this.f_credit*t ]}}
	).create_operateur(
		'taux', function(t){ t=t/100; return function(x){ return[ this.f_debit*t*x, this.f_credit*t*x ]} }
	).create_operateur(
		'itaux', function(t){ t=1-1/(1+t/100); return function(x){return[ this.f_debit*t*x, this.f_credit*t*x ]} }
	)

	it('$fi.op("constant") is a function',function(){
		expect( $fi.op('constant') instanceof Function ).toBe(true);
	});

	it('$fi.op("taux") is a function',function(){
		expect( $fi.op('taux') instanceof Function ).toBe(true);
	});

	it('$fi.op("itaux") is a function',function(){
		expect( $fi.op('itaux') instanceof Function ).toBe(true);
	});
});


describe('Checking Mouvement',function(){
	mov= {
		marchandise	: [$fi.op('param'	)(	'607'	,1,0, 'montant marchandise'			),'["param","607",1,0,"montant marchandise"]'				],
		tva		: [$fi.op('taux'	)(	'44566'	,1,0, 'taux tva'				),'["taux","44566",1,0,"taux tva"]'					],
		avoir_tva	: [$fi.op('itaux'	)(	'44566'	,0,1, 'taux tva'				),'["itaux","44566",0,1,"taux tva"]'					],
		remise		: [$fi.op('taux'	)(	'607'	,0,1, 'taux remise'				),'["taux","607",0,1,"taux remise"]'					],
		fournisseur	: [$fi.op('param'	)(	'401'	,0,1, 'montant payé au fournisseur'		),'["param","401",0,1,"montant payé au fournisseur"]'			],
		reg_fourn	: [$fi.op('param'	)(	'401'	,1,0, 'montant de la régularisation fournisseur'),'["param","401",1,0,"montant de la régularisation fournisseur"]'	],
		sortie_bnk	: [$fi.op('param'	)(	'512'	,0,1, 'sortie de la banque'			),'["param","512",0,1,"sortie de la banque"]'				],
		escompte	: [$fi.op('taux'	)(	'765'	,0,1, "taux d'escompte"				),'["taux","765",0,1,"taux d\'escompte"]'				],
		fraisport	: [$fi.op('constant'	)(	'624'	,1,0, "montant frais de transport"		),'["constant","624",1,0,"montant frais de transport"]'			],
		assurance	: [$fi.op('constant'	)(	'616'	,1,0, "montant frais d'assurance"		),'["constant","616",1,0,"montant frais d\'assurance"]'			]
	};

	for( var i in mov )(function(i,f,s){
		it(i +' is a function',function(){
			expect( f instanceof Function ).toBe(true);
		});
		it('transform '+i+' to JSON',function(){
			expect( JSON.stringify(f) ).toBe( s );
		});
	})(i,mov[i][0],mov[i][1]);
});


describe('Checking Operation',function(){
	ope = {
		achat_fournisseur		: [$fi.Operation( $fi.want(mov.marchandise[0]), $fi.want(mov.tva[0]), mov.fournisseur[0] ),
							'["want",'+mov.marchandise[1]+'],["want",'+mov.tva[1]+'],'+mov.fournisseur[1] ],
		achat_avec_remise_et_escompte	: [$fi.Operation( $fi.want(mov.marchandise[0]), $fi.want(mov.remise[0]),$fi.want(mov.escompte[0]),mov.tva[0](19.6),mov.fournisseur[0] ),
							'["want",'+mov.marchandise[1]+'],["want",'+mov.remise[1]+'],["want",'+mov.escompte[1]+'],['+mov.tva[1]+',19.6],'+mov.fournisseur[1] ],
		achat_avec_forfait_assu_port	: [$fi.Operation( $fi.want(mov.marchandise[0]), $fi.want(mov.fraisport[0]),mov.assurance[0](100),mov.tva[0](19.6),mov.fournisseur[0] ),
							'["want",'+mov.marchandise[1]+'],["want",'+mov.fraisport[1]+'],['+mov.assurance[1]+',100],['+mov.tva[1]+',19.6],'+mov.fournisseur[1] ],
		paie_escompte_achat_fourniture	: [$fi.Operation( $fi.want(mov.reg_fourn[0]), mov.avoir_tva[0](19.6), $fi.want(mov.escompte[0]), mov.tva[0](19.6), mov.sortie_bnk[0] ),
							'["want",'+mov.reg_fourn[1]+'],['+mov.avoir_tva[1]+',19.6],["want",'+mov.escompte[1]+'],['+mov.tva[1]+',19.6],'+mov.sortie_bnk[1] ],
		paie_achat_fourniture		: [$fi.Operation( $fi.want(mov.reg_fourn[0]), mov.sortie_bnk[0] ),
							'["want",'+mov.reg_fourn[1]+'],'+mov.sortie_bnk[1] ]
	};

	for( var i in ope )(function(i,f,s){
		it(i +' is a function',function(){
			expect( f instanceof Function ).toBe(true);
		});
		it('transform '+i+' to JSON',function(){
			expect( JSON.stringify( f ) ).toBe( '['+s+']' );
		});
	})(i,ope[i][0],ope[i][1]);
});


describe('Checking Operation',function(){
	ecr={
		a1: [	ope.achat_fournisseur			[0]('achat fournisseur avec TVA à 10%'					, '2012-01-01',  1000, 10	)
			,'{"mouvement":[["607",1000,0],["44566",100,0],["401",0,1100]],"date":"2012-01-01","message":"achat fournisseur avec TVA à 10%"}'
			,'{"message":"achat fournisseur avec TVA à 10%","mouvement":[["607",1000,0],["44566",100,0],["401",0,1100]]}'
		],
		a2: [	ope.achat_avec_remise_et_escompte	[0]("achat fournisseur de 15000€ HT avec 10% remise et 4% d'escompte"	, '2012-01-01', 15000, 10, 4	)
			,'{"mouvement":[["607",15000,0],["44566",2540.1600000000003,0],["765",0,540],["607",0,1500],["401",0,15500.16]],"date":"2012-01-01","message":"achat fournisseur de 15000€ HT avec 10% remise et 4% d\'escompte"}'
			,'{"message":"achat fournisseur de 15000€ HT avec 10% remise et 4% d\'escompte","mouvement":[["607",15000,0],["44566",2540.1600000000003,0],["765",0,540],["607",0,1500],["401",0,15500.16]]}'
		],
		a3: [	ope.achat_avec_forfait_assu_port	[0]('achat fournisseur de 2500€ HT avec frais de port et assurance'	, '2012-01-01',  2500, 200	)
			,'{"mouvement":[["607",2500,0],["44566",548.8000000000001,0],["624",200,0],["616",100,0],["401",0,3348.8]],"date":"2012-01-01","message":"achat fournisseur de 2500€ HT avec frais de port et assurance"}'
			,'{"message":"achat fournisseur de 2500€ HT avec frais de port et assurance","mouvement":[["607",2500,0],["44566",548.8000000000001,0],["624",200,0],["616",100,0],["401",0,3348.8]]}'
		],
		a4: [	ope.achat_avec_forfait_assu_port	[0]('achat fournisseur de 9000€ HT avec frais de port et assurance'	, '2012-01-01',  9000, 100	)
			,'{"mouvement":[["607",9000,0],["44566",1803.2,0],["616",100,0],["624",100,0],["401",0,11003.2]],"date":"2012-01-01","message":"achat fournisseur de 9000€ HT avec frais de port et assurance"}'
			, '{"message":"achat fournisseur de 9000€ HT avec frais de port et assurance","mouvement":[["607",9000,0],["44566",1803.2,0],["616",100,0],["624",100,0],["401",0,11003.2]]}'
		],
		a5: [	ope.paie_escompte_achat_fourniture	[0]('paiement fournisseur de 9568€ TTC avec escompte à 3%'		, '2012-01-01',  9568, 3	)
			,'{"mouvement":[["401",9568,0],["44566",1520.96,0],["765",0,240],["44566",0,1568],["512",0,9280.96]],"date":"2012-01-01","message":"paiement fournisseur de 9568€ TTC avec escompte à 3%"}'
			,'{"message":"paiement fournisseur de 9568€ TTC avec escompte à 3%","mouvement":[["401",9568,0],["44566",1520.96,0],["765",0,240],["44566",0,1568],["512",0,9280.96]]}'
		],
		a6: [	ope.achat_fournisseur			[0]('achat MacBook Pro avec TVA à 19.6%'				, '2012-01-01',  1999, 19.6	).o(
			ope.paie_achat_fourniture		[0]('paiement immediat sans escompte'					, '2012-01-01',  1999*1.196	))
			,'{"mouvement":[["401",2390.804,0],["607",1999,0],["44566",391.80400000000003,0],["512",0,2390.804],["401",0,2390.804]],"date":"2012-01-01","message":"achat MacBook Pro avec TVA à 19.6%\\npaiement immediat sans escompte"}'
			,'{"message":"achat MacBook Pro avec TVA à 19.6%\\npaiement immediat sans escompte","mouvement":[["401",2390.804,0],["607",1999,0],["44566",391.80400000000003,0],["512",0,2390.804],["401",0,2390.804]]}'
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






});
