
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
