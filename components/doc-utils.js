module.exports = {
  getById : function(id){
    return window.document.getElementById(id);
  },
  escapeRegExp : function(str){
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  },
  parseText : function(path, parameters){
    var content = fs.readFileSync(path);

    for (var i = 0; i < parameters.length; i++)
    {
      replaceAll(content, '$' + String(i), parameters[i]);
    }

    return content;
  }
}
