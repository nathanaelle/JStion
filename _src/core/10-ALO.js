/**
 * Accounting Large Object
 *
 */
var ALO=create_class(
	function(){

	},
	{
		/**
		 * Load On Demand data
		 *
		 * @param  {string} o [description]
		 * @param  {string} k [description]
		 *
		 * @return {object}   [description]
		 */
		lod:function(k){
			// load on demand
			var id = this.hasOwnProperty(k)? this[k] : k;

			if( id === undefined	) return undefined;
			if( id === false	) return undefined;

			if(id.split === undefined ){
				return new this.$.Comptes( id, this.$ );
			}

			return this.$.sync('read',{
				id:	id,
				$:	this.$
			});
		},


		/**
		 * generate an ID for an object
		 *
		 * @return {string} ID of the object
		 */
		sign:function(){
			this.id= ''+CryptoJS.SHA1( JSON.stringify(this) );
			return this.id;
		},


		/**
		 * Initialize an object with given s non undefined values or d values
		 *
		 * @param {object} s [description]
		 * @param {object} d [description]
		 */
		set_or_default:function(s,d){
			for( var i in d ){
				this[i]= ( s[i]===undefined ? d[i] : s[i] );
			}
			return this;
		},


		/**
		 * Save an object ... and attribut it an ID
		 */
		save:function(o){
			return this.$.sync('update',this,o);
		}
	});
