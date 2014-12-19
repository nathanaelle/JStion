describe('Checking $fi availability',function(){
	it('$fi exists',function(){
		expect(window.$fi).toBeDefined();
	});

	var $fi = window.$fi;

	it('$fi is an Object',function(){
		expect($fi instanceof Object ).toBe(true);
	});

	var	debit	= $fi.DC.U_Debit,
		credit	= $fi.DC.U_Credit;

	/*
	 * Definitions des operations sur certains comptes
	 */
	var o = {
		marchandise	: $fi.op('param'	)(	'607'	, debit,	'montant marchandise'				),
		tva		: $fi.op('taux'		)(	'44566'	, debit,	'taux tva'					),
		avoir_tva	: $fi.op('itaux'	)(	'44566'	, credit,	'taux tva'					),
		remise		: $fi.op('taux'		)(	'607'	, credit,	'taux remise'					),
		fournisseur	: $fi.op('param'	)(	'401'	, credit,	'montant payé au fournisseur'			),
		reg_fourn	: $fi.op('param'	)(	'401'	, debit,	'montant de la régularisation fournisseur'	),
		sortie_bnk	: $fi.op('param'	)(	'512'	, credit,	'sortie de la banque'				),
		escompte	: $fi.op('taux'		)(	'765'	, credit,	"taux d'escompte"				),
		fraisport	: $fi.op('constant'	)(	'624'	, debit,	"montat frais de transport"			),
		assurance	: $fi.op('constant'	)(	'616'	, debit,	"montant frais d'assurance"			),
	};

	/*
	 * Definitions des template d'écriture
	 */
	var e = {
		achat_fournisseur			: $fi.Operation( $fi.want(o.marchandise), $fi.want(o.tva),       o.fournisseur ),
		achat_avec_remise_et_escompte		: $fi.Operation( $fi.want(o.marchandise), $fi.want(o.remise),    $fi.want(o.escompte), o.tva(20), o.fournisseur ),
		achat_avec_forfait_assu_port		: $fi.Operation( $fi.want(o.marchandise), $fi.want(o.fraisport), o.assurance(100),     o.tva(20), o.fournisseur ),
		paie_escompte_achat_fourniture		: $fi.Operation( $fi.want(o.reg_fourn),   o.avoir_tva(20),       $fi.want(o.escompte), o.tva(20), o.sortie_bnk ),
		paie_achat_fourniture			: $fi.Operation( $fi.want(o.reg_fourn),   o.sortie_bnk ),
	};

	e.compo_achat_fournisseur_et_paiement	= e.achat_fournisseur.o( e.paie_achat_fourniture );

	/*
	 * Création d'écritures
	 */
	var a1	= e.achat_fournisseur			({message:'achat fournisseur avec TVA à 10%'					,date:'2012-01-01'}, 1000,  10	);
	var a2	= e.achat_avec_remise_et_escompte	({message:"achat fournisseur de 15000€ HT avec 10% remise et 4% d'escompte"	,date:'2012-01-01'},15000,  10, 4	);
	var a3	= e.achat_avec_forfait_assu_port	({message:'achat fournisseur de 2500€ HT avec frais de port et assurance'	,date:'2012-01-01'}, 2500, 200	);
	var a4	= e.achat_avec_forfait_assu_port	({message:'achat fournisseur de 2500€ HT avec frais de port et assurance'	,date:'2012-01-01'}, 9000, 100	);
	var a5	= e.paie_escompte_achat_fourniture	({message:'paiement fournisseur de 9568€ TTC avec escompte à 3%'		,date:'2012-01-01'}, 9568,   3	);
	var a6	= e.achat_fournisseur			({message:'achat MacBook Pro avec TVA à 20%'					,date:'2012-01-01'}, 1999, 20 ).o(
		  e.paie_achat_fourniture		({message:'paiement immediat sans escompte'					,date:'2012-01-01'}, 1999*1.20 )
		);
	var a7 = e.compo_achat_fournisseur_et_paiement(
		{message:'achat de 2MacBook Pro avec TVA à 20% avec paiement immediat'	,date:'2012-01-01'}, 2*1999, 20, $fi.peek_last
		);


	var societe = new $fi.Entite({ nom: 'ma societe', mode:'abrege', $:$fi, type:'DC' });

	var societe1=societe
		.commit( a1 )
		.commit( a2 )
		.commit( a3 )
		.commit( a4 )
		.commit( a5 )
		.commit( a6 )
		.commit( a7 );

	it('a entity before a commit is not the same entity after the commit',function(){
		expect( JSON.stringify( societe1 ) ).not.toBe( JSON.stringify( societe ) );
	});


	var societe2 = $fi.entity( 'ma societe' );


	it('but you can reload your entity',function(){
		expect( JSON.stringify( societe1 ) ).toBe( JSON.stringify( societe2 ) );
	});


	it('you can rewind the 7 commits back to the first entity',function(){
		expect( JSON.stringify( societe1.back(7) ) ).toBe( JSON.stringify( societe ) );
	});

	var res_history = societe2.history();

	var exp_history = [
	{"id":"991e1282d7bc72959b1c4310eb3423263c086f01","meta":{"message":"achat de 2MacBook Pro avec TVA à 20% avec paiement immediat","date":"2012-01-01"}},
	{"id":"52ea306fef97a154b5ffe3fc105cecf80596646f","meta":{"message":"achat MacBook Pro avec TVA à 20%\npaiement immediat sans escompte","date":"2012-01-01\n2012-01-01"}},
	{"id":"ba2f19299fae36d58220f4290e8ae457a10b9905","meta":{"message":"paiement fournisseur de 9568€ TTC avec escompte à 3%","date":"2012-01-01"}},
	{"id":"8fc417a52dacc1318b9fdaff547bc8d86e932ac7","meta":{"message":"achat fournisseur de 2500€ HT avec frais de port et assurance","date":"2012-01-01"}},
	{"id":"03523913d40ed4715d3890e37a3474915ccd9579","meta":{"message":"achat fournisseur de 2500€ HT avec frais de port et assurance","date":"2012-01-01"}},
	{"id":"95733f070f58dae0c4c47a71ba10edf6d2409fab","meta":{"message":"achat fournisseur de 15000€ HT avec 10% remise et 4% d'escompte","date":"2012-01-01"}},
	{"id":"1e8d00865f95e040a2cd5e914511a8d422c95aa6","meta":{"message":"achat fournisseur avec TVA à 10%","date":"2012-01-01"}},
	{"id":"66a71ee81c29e221638b03696f2ee8f29481f589","meta":{"message":"mise à zéro"}}
	];

	it('you can list the history',function(){
		res_history.forEach(function(e,i){
			expect( JSON.stringify(e.meta)).toBe(JSON.stringify(exp_history[i].meta));
		});
	});

	it('the id identify an exact commit and you can use them',function(){
		res_history.forEach(function(e,i){
			expect( JSON.stringify(e.id)).toBe(JSON.stringify(exp_history[i].id));
		});
	});



	var res_diff = societe2.checkout( "03523913d40ed4715d3890e37a3474915ccd9579" ).diff(societe2.checkout( "95733f070f58dae0c4c47a71ba10edf6d2409fab" ))

	var exp_diff =  {
		"mouvement":[
		["60",["2500.000","0.000"]],
		["445",["560.000","0.000"]],
		["62",["200.000","0.000"]],
		["61",["100.000","0.000"]],
		["40",["0.000","3360.000"]]
		],
		"meta":{
			"message":"achat fournisseur de 2500€ HT avec frais de port et assurance",
			"date":"2012-01-01"
		}
	};

	it('you can diff two different IDs',function(){
		expect( JSON.stringify(res_diff.mouvement)).toBe(JSON.stringify(res_diff.mouvement));
	});


});
