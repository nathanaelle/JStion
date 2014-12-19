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
	marchandise	:[$fi.op('param'	)('607'	, $fi.DC.U_Debit , 'montant marchandise'			),'["param","607",[1,0],"montant marchandise"]'				],
	tva		:[$fi.op('taux'		)('44566',$fi.DC.U_Debit , 'taux tva'					),'["taux","44566",[1,0],"taux tva"]'					],
	avoir_tva	:[$fi.op('itaux'	)('44566',$fi.DC.U_Credit, 'taux tva'					),'["itaux","44566",[0,1],"taux tva"]'					],
	remise		:[$fi.op('taux'		)('607'	, $fi.DC.U_Credit, 'taux remise'				),'["taux","607",[0,1],"taux remise"]'					],
	fournisseur	:[$fi.op('param'	)('401'	, $fi.DC.U_Credit, 'montant payé au fournisseur'		),'["param","401",[0,1],"montant payé au fournisseur"]'			],
	reg_fourn	:[$fi.op('param'	)('401'	, $fi.DC.U_Debit , 'montant de la régularisation fournisseur'	),'["param","401",[1,0],"montant de la régularisation fournisseur"]'	],
	sortie_bnk	:[$fi.op('param'	)('512'	, $fi.DC.U_Credit, 'sortie de la banque'			),'["param","512",[0,1],"sortie de la banque"]'				],
	escompte	:[$fi.op('taux'		)('765'	, $fi.DC.U_Credit, "taux d'escompte"				),'["taux","765",[0,1],"taux d\'escompte"]'				],
	fraisport	:[$fi.op('constant'	)('624'	, $fi.DC.U_Debit , "montant frais de transport"			),'["constant","624",[1,0],"montant frais de transport"]'		],
	assurance	:[$fi.op('constant'	)('616'	, $fi.DC.U_Debit , "montant frais d'assurance"			),'["constant","616",[1,0],"montant frais d\'assurance"]'		]
};


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
