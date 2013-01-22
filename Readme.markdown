JStion
===================


Presentation
------------

This library :
 - works with 2-columns accounts.
 - provides 3 accounting plans issued from the french Plan Comptable Général ( abrege/short , basique/medium , complet/long )
 - supports multiples "entities"
 - stores data in localstorage
 - copes with multiple entities in the same instance
 - provides a GIT-like acces to each entity ( commit, log, diff, ... )
 - provides some optionnal Model and Views for BackBone.JS


How to ...
----------

### Entity / Company

 - load or create a company :  my_company = $fi.societe( 'name of the company' )
 - read the history of a company : some_var = my_company.history();
 - read the full log of a company : some_var = my_company.log();
 - go 5 versions back in the past : some_var = my_company.back( 5 );
 - compute the diff between to revision ( 5th ago and 7th ago ) : some_vars my_company.back( 5 ).diff( my_company.back( 7 ) );
 - commit an ecriture : my_company.commit( ecriture );


### Ecriture

 - combine 2 ecritures in only one : ecriture_3 = ecriture_1.o( ecriture_2 );
 - create an ecriture at a moment from an operation : ecriture = some_operation( 'an explanation message', 'a date', arg_1, arg_2, ... arg_i, ... arg_n )


### Operation

 - create an operation from 2 partial mouvements with 1 argmument : operation_1 = $fi.Operation( $fi.want( mouvement_1 ), mouvement_2 );
 - create an operation from 5 partial mouvements with 2 argmument : operation_2 = $fi.Operation( $fi.want( mouvement_1 ), mouvement_2, $fi.want( mouvement_3 ), mouvement_4, mouvement_5 );


### Mouvement

 - create a partial mouvement in debit column with an operateur :	mouvement_1 = $fi.op( 'operateur name' )(	'acount number '	,1,0, 'explanation text ' );
 - create a partial mouvement in credit column with an operateur :	mouvement_2 = $fi.op( 'operateur name' )(	'acount number '	,0,1, 'explanation text ' );


### Operateur

 - create an operateur : $fi.create_operateur( 'operateur name', js_function )


How the calculation are made
----------------------------

### Ecriture

An Ecriture is the description of a table like 

<table>
	<caption>by some stuff with 10% VAT</caption>
	<tr><th>Account number</th><th>debit</th><th>credit</th></tr>
	<tr><td>607</td><td>1000.00</td><td></td></tr>
	<tr><td>44566</td><td>100.00</td><td></td></tr>
	<tr><td>401</td><td></td><td>1100.00</td></tr>
</table>

as you can see you have a amount of 1000 you write it as-is, then you take this amount and you compute the VAT amount and write it and then you use the current debit amount directly as-is.

if you buy 1000 products, you need in your accounting to track 1000 Ecriture like this example but with 1000 different amount.


### Operation, Mouvement, Operateur

Lazily, you may wish to define something like a "macro" or a "function" you can use to compute directly the Ecriture for a given amount

<table>
	<tr><td>607</td><td>X</td><td></td></tr>
	<tr><td>44566</td><td>10% of X</td><td></td></tr>
	<tr><td>401</td><td></td><td>X+ 10%</td></tr>
</table>

In the Lazyliest way, you may dream of some thing like :

<table>
	<tr><td>607</td><td>X</td><td></td></tr>
	<tr><td>44566</td><td>Y% of X</td><td></td></tr>
	<tr><td>401</td><td></td><td>X+ Y%</td></tr>
</table>

Now, you can define :

 - this table is an Operation for a given X and Y ; so, you "$fi.want" X and Y
 - a line is a Mouvement on an account like apply some transformation on something and write it.
 - the applied transformation is the Operateur

<table>
	<tr><td>607</td><td>want() a value then write it</td><td></td></tr>
	<tr><td>44566</td><td>want() a value then use it as the a computed rate from the last then write it</td><td></td></tr>
	<tr><td>401</td><td></td><td>use the last state and write it</td></tr>
</table>



What is ...
-----------


### Operateur

An Operateur is a computed property issued from a flow of information.
This flow is provided later by the argument list when you create an real ecriture by applying an Operation on some arguments.

The test.html file contains the definition 4 different Operateurs.


#### create_operateur( 'param', function(x){return [ this.f_debit*x, this.f_credit*x ]} )

this Operateur is used for "use directly the current value in the flow".


#### create_operateur( 'constant', function(t){return function(x){return[ this.f_debit*t, this.f_credit*t ]}} )

this Operateur is used for "don't bother about the flow and just use directly this constant".


#### create_operateur( 'taux', function(t){ t=t/100; return function(x){ return[ this.f_debit*t*x, this.f_credit*t*x ]} } )

this Operateur is used for "apply some rate (taux in french) on the flow"


#### create_operateur( 'itaux', function(t){ t=1-1/(1+t/100);; return function(x){return[ this.f_debit*t*x, this.f_credit*t*x ]} } )

this Operateur is used for "apply apply some inverse rate on the flow"


### Mouvement

a Mouvement is the application of an Operator on the flow to produce an action in debit or credit on an account.

With the 4 previous Operateurs, we can write :

- I need to add a debit on the account '607' and this debit is my current flow : $fi.op('param'	)( '607',1,0, 'some debit on the 607 account' );


### Operation

an Operation is the aggregation of different Mouvement with the definition of the wanted arguments for this Operation.
