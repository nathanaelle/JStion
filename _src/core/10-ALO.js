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

				if( id=== undefined ) return undefined;
				if(id.split === undefined ){
					return new this.$.Comptes( id, this.$ );
				}
				var t = id.split(/:/);
				t = $fi.fn[t[0]];

				//return new t({ id: id });
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
			},

			save:function(o){
				return this.$.sync('update',this,o);
			},

			fetch:function(o){
				var i = this;
				o=o||{};
				o.success=o.success||function(){};
				var o_suc = o.success;
				o.success = function(data){ i.set_or_default({},data); o_suc(data);};
				return this.$.sync('read',this,o );
			},

		});
