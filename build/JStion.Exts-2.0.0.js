/*! JStion — 2.0.0 2014-12-19 */
(function(window,$fi){
"use strict";

$fi.fn.cloture = {};
/*
 * Definitions des operateurs
 */
$fi
.create_operateur('param'	, function(x){				return this.scale(x)				;})
.create_operateur('constant'	, function(t){				return function(x){ return this.scale(t)	;};})
.create_operateur('taux'	, function(t){ t=t/100;			return function(x){ return this.scale(t*x)	;};})
.create_operateur('itaux'	, function(t){ t=1-1/(1+t/100);		return function(x){ return this.scale(t*x)	;};})
.create_operateur('ceil'	, function(x){ x=Math.ceil(x)-x;	return this.scale(x)				;})
;
$fi.fn.cloture.ecriture_bilan = function(context, checkpoint,debit,credit){
	var ret = checkpoint
		.s_etat('1','2','3','4','5')
		.filter(function(e){
			return !(e[1].inEquilibrium());
		})
		.map(function(e){
			var pos = e[1].reduction();
			if( pos > 0 ){
				return [ debit(e[0]), pos, new $fi.Fragment([[ e[0], e[1] ]]) ];
			}
			return [ credit(e[0]), -pos, new $fi.Fragment([[ e[0], e[1] ]]) ];
		})
		.reduce(function(old,e){
			return [ e[0].o(old[0]), [ e[1] ].concat( old[1] ), e[2].add(old[2]) ];
		},[]);

	return [ ret[0].apply( null, [ context ].concat(ret[1]) ), ret[2] ];
};




$fi.fn.cloture.bilan = function (societe,debit,credit){
	var part;
	var actif;
	var passif;

	part= $fi.aggregate(
		$fi.aggregate("Immobilisations incorporelles"			,201, 203, 205, 206, 207, 208, 232, 237 ),
		$fi.aggregate("Immobilisations corporelles"			,211, 212, 213, 214, 215, 218, 231, 238 ),
		$fi.aggregate("Immobilisations financières"			,261, 266, 267, 268, 271, 272, 273, 274, 275, 276, 277 )
	);

	actif =$fi.aggregate(
		$fi.aggregate("Stocks matières premières, en-cours de production produits (intermédiaires, finis) et autres approvisionnements"	, 31, 32, 33, 34, 35 ),
		$fi.aggregate("Stocks marchandises"				, 37 ),
		$fi.aggregate("Avances, acomptes versés sur commandes"		,4091 ),
		$fi.aggregate("Créances clients et comptes rattachés"		,411, 413, 416, 417, 418 ),
		$fi.aggregate("Autres créances"					,4096, 4097, 4098, 425,  441, 462, 465,
										$fi.ag_mask( debit, 443, 444, 445, 448, 451, 456,428, 438, 467, 468, 478 )),
		$fi.aggregate("Valeurs mobilières de placement"			,501, 502, 503, 504, 505, 506, 507, 508 ),
		$fi.aggregate("Disponibilités et instruments de trésorerie"	,511, 515, 516,  53, 54,
										$fi.ag_mask( debit,517, 518, 512, 514, 52 )),
		$fi.aggregate("Charges constatées d'avance"			,486	)
	);

	actif= $fi.aggregate(
		$fi.aggregate("Capital souscrit non appelé"			,109	),
		$fi.aggregate("## ACTIF IMMOBILISÉ"				,part	),
		part,
		$fi.aggregate(""),
		$fi.aggregate("## ACTIF CIRCULANT"				, actif ),
		actif,
		$fi.aggregate(""),
		$fi.aggregate("Comptes de régularisation"			,169, 476, 481 ),
		$fi.aggregate("# TOTAL ACTIF"					,109, part, actif, 169, 476,481 )
	);

	part= $fi.aggregate(
		$fi.aggregate("Capital social, primes"				,101, 108, 104 ),
		$fi.aggregate("Résultat de l'exercice"				,120, 129 ),
		$fi.aggregate("Subventions d'investissement"			,131, 138 ),
		$fi.aggregate("Autres capitaux propres"				,110, 119, 105, 1061, 1063, 1064, 1068, 14 )
	);

	passif= $fi.aggregate(
		$fi.aggregate("Emprunts et dettes assimilées"			,161,163,164,165,166,1675,168,17,426,519,
		 								$fi.ag_mask( credit,451,456,467,512,514,517,518 ) ),
		$fi.aggregate("Dette auprès des associés"			,$fi.ag_mask( credit,455 ) ),

		$fi.aggregate("Avances, acomptes sur commandes en cours"	,4191 ),
		$fi.aggregate("Dettes fournisseurs - comptes rattachés"		,401,403,408 ),
		$fi.aggregate("Autres dettes"					,421,422,424,427,431,437,442,446,447,457,269,279,404,405,4196,4198,464,509,
										$fi.ag_mask( credit,428,438,443,444,445,448,468,478 ) )
	);

	passif= $fi.aggregate(
		$fi.aggregate("## CAPITAUX PROPRES"				,part),
		part,
		$fi.aggregate(""),
		$fi.aggregate("Autres fonds propres"				,1671, 1674 ),
		$fi.aggregate("Provisions risques et charges"			,151, 153, 155, 156, 157, 158 ),
		$fi.aggregate(""),
		$fi.aggregate("## DETTES"					,passif ),
		passif,
		$fi.aggregate(""),
		$fi.aggregate("Produits constatés d'avance, écarts de conversion du passif"	,487, 477 ),
		$fi.aggregate("# TOTAL PASSIF"					, part, passif,1671, 1674 ,151, 153, 155, 156, 157, 158 ,487, 477 )
	);

	return {
		col_1:	actif(societe).single_col(true),
		col_2:	passif(societe).negate().single_col(true)
	};
};

/**
 * definition de 2 fonctions
 *
 * une pour le compte de résultat
 *
 * une pour le bilan
 */

$fi.fn.cloture.calcul_resultat = function(context, checkpoint,debit,credit){
	var ret = checkpoint
		.s_etat('6','7')
		.filter(function(e){
			return !(e[1].inEquilibrium());
		})
		.map(function(e){
			var pos = e[1].reduction();
			if( pos > 0 ){
				return [ debit(e[0]), pos ];
			}
			return [ credit(e[0]), -pos ];
		})
		.reduce(function(old,e){
			return [ e[0].o(old[0]), [ e[1] ].concat( old[1] ) ];
		},[]);

	return ret[0].apply( null, [ context ].concat(ret[1]) );
};


$fi.fn.cloture.ecriture_resultat = function(checkpoint, perte, benefice ){
	var my_resultat = checkpoint.etat('12').solde()[0][1].reduction();

	if( my_resultat > 0 ){
		return perte( my_resultat );
	}
	return benefice( -my_resultat );
};


$fi.fn.cloture.compte2resultat =function(checkpoint){
	var charge;
	var produit;
	var part;

	part = $fi.aggregate(
		$fi.aggregate('Achats de marchandises'								,607,-609			),
		$fi.aggregate('Variation des stocks (marchandises)'						,6037				),
		$fi.aggregate('Achats de matières premières et autres approvisionnements'			,601,602,-609			),
		$fi.aggregate('Variation des stocks (matières premières et autres approvisionnements)'		,6031,6032,-6039		),
		$fi.aggregate('Autres achats et charges externes'						,604,605,606,61,62,-619,-629	),
		$fi.aggregate('Impôts, taxes et versements assimilés'						,631,633,635,637		),
		$fi.aggregate('Salaires et traitements'								,641,644,648			),
		$fi.aggregate('Charges sociales'								,645,646,647,648		),
		$fi.aggregate('Dotations aux amortissements'							,6811,6812			),
		$fi.aggregate('Dotations aux provisions'							,6815,6816,6817			),
		$fi.aggregate("Autres charges d'exploitation"							,65,-655			)
	);

	charge = $fi.aggregate(
		$fi.aggregate("# Charges d'exploitation"							,part				),
		part,
		$fi.aggregate(''),
		$fi.aggregate('# Quote-part de résultat sur opérations faites en commun'			,655				),
		$fi.aggregate(''),
		$fi.aggregate("# Charges financières Produits financiers"					,66				),
		$fi.aggregate('Dont intérêts et charges assimilées'						,661,664,665,668		),
		$fi.aggregate(''),
		$fi.aggregate("# Charges exceptionnelles"							,67				),
		$fi.aggregate(''),
		$fi.aggregate('# Impôts sur les bénéfices'							,695,696,697,698,699		),
		$fi.aggregate('# Participation des salariés aux résultats'					,691				)
	);

	part = $fi.aggregate(
		$fi.aggregate('Ventes de marchandises'								,707,-7097			),
		$fi.aggregate('Production vendue (biens et services)'						,70,-707,-709,7097		)
	);

	produit = $fi.aggregate(
		$fi.aggregate("## Chiffre d'affaire"								,part				),
		$fi.aggregate("Dont à l'export"),
		$fi.aggregate(''),
		$fi.aggregate('Production stockée'								,713				),
		$fi.aggregate("Production immobilisée"								,72				),
		$fi.aggregate("Production immobilisée"								,74				),
		$fi.aggregate("Autres produits (dont reprises sur amortissements et transferts de charges)"	,78,79,75,-755			)
	);

	produit = $fi.aggregate(
		$fi.aggregate("# Produit d'exploitation"							,produit			),
		part,
		produit,
		$fi.aggregate(''),
		$fi.aggregate('# Quote-part de résultat sur opérations faites en commun'			,755				),
		$fi.aggregate(''),
		$fi.aggregate("# Produits financiers"								,76				),
		$fi.aggregate('Dont intérêts et produit assimilées'						,763,764,765,768		),
		$fi.aggregate('Dont produits de participations'							,761				),
		$fi.aggregate(''),
		$fi.aggregate("# Produits exceptionnels"							,77				)
	);

	var ret = {
		col_1:	charge(checkpoint).single_col(true),
		col_2:	produit(checkpoint).single_col(true)
	};

	var delta = [ret.col_1, ret.col_2]
		.map(function(c){
			return c.filter(function(l){
				return l[0].indexOf('# ')===0;
			}).map(function(l){
				return l[1];
			}).reduce(function(a,b){
				return b.add(a);
			});
		}).reduce(function(a,b){
			return b.add(a);
		}).quotient().negate();

	if(delta.reduction() !== 0 ){
		if(delta.reduction() > 0 ){
			ret.col_1.push(['# Benefice', delta ]);
		}else{
			ret.col_2.push(['# Perte', delta ]);
		}
	}

	ret.col_2 = ret.col_2.single_col(false).negate().single_col(true);

	return ret;
};
})(window,$fi);
