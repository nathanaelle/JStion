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
