var $fi = window.$fi;
var mov={};

$fi
.create_operateur('param'	, function(x){			return this.scale(x)				;})
.create_operateur('constant'	, function(t){			return function(x){ return this.scale(t)	;}})
.create_operateur('taux'	, function(t){ t=t/100;		return function(x){ return this.scale(t*x)	;}})
.create_operateur('itaux'	, function(t){ t=1-1/(1+t/100);	return function(x){ return this.scale(t*x)	;}})

describe('Checking Mouvement',function(){
	mov= {
		marchandise	: [$fi.op('param'	)('607'	, $fi.DC.U_Debit , 'montant marchandise'			),'["param","607",[1,0],"montant marchandise"]'				],
		tva		: [$fi.op('taux'	)('44566',$fi.DC.U_Debit , 'taux tva'					),'["taux","44566",[1,0],"taux tva"]'					],
		avoir_tva	: [$fi.op('itaux'	)('44566',$fi.DC.U_Credit, 'taux tva'					),'["itaux","44566",[0,1],"taux tva"]'					],
		remise		: [$fi.op('taux'	)('607'	, $fi.DC.U_Credit, 'taux remise'				),'["taux","607",[0,1],"taux remise"]'					],
		fournisseur	: [$fi.op('param'	)('401'	, $fi.DC.U_Credit, 'montant payé au fournisseur'		),'["param","401",[0,1],"montant payé au fournisseur"]'			],
		reg_fourn	: [$fi.op('param'	)('401'	, $fi.DC.U_Debit , 'montant de la régularisation fournisseur'	),'["param","401",[1,0],"montant de la régularisation fournisseur"]'	],
		sortie_bnk	: [$fi.op('param'	)('512'	, $fi.DC.U_Credit, 'sortie de la banque'			),'["param","512",[0,1],"sortie de la banque"]'				],
		escompte	: [$fi.op('taux'	)('765'	, $fi.DC.U_Credit, "taux d'escompte"				),'["taux","765",[0,1],"taux d\'escompte"]'				],
		fraisport	: [$fi.op('constant'	)('624'	, $fi.DC.U_Debit , "montant frais de transport"			),'["constant","624",[1,0],"montant frais de transport"]'			],
		assurance	: [$fi.op('constant'	)('616'	, $fi.DC.U_Debit , "montant frais d'assurance"			),'["constant","616",[1,0],"montant frais d\'assurance"]'			]
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