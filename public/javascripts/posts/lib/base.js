var posts = posts || {};

posts.views = {
  _cache : {}
, load : function(template) {
    if(!this._cache[template]) {
      this._cache[template] = Mustache.compile($('#template-' + template).html());
    }
    return this._cache[template];
  }
, render : function(template, context) {
    return this.load(template)(context);
  }
}
