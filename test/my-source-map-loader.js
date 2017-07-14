module.exports =   function(source, map) {
  this.cacheable();
  source = 'require("source-map-support/browser-source-map-support");sourceMapSupport.install();' + source
  this.callback(null, source, map)
}

