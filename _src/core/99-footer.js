[ 'Comptes', 'Compte', 'Ecriture', 'Journal', 'Livre', 'Entite', 'Operation' ].forEach(function(k){instanciable[k]=$fi.fn[k]});

window.$fi = new $fi();
window.$fi.fn = $fi.prototype;

})(window);
