var traverseDomAndCollectElements = function(matchFunc, startEl) {
  var resultSet = [];

  var elements = startEl ? startEl : [document.body];
  while (elements.length !== 0) {
    var currentElement = elements.shift();
    var children = [];
    for (var i = 0; i < currentElement.children.length; i++) {
      children.push(currentElement.children[i]);
    }
    children.forEach(function(child) {
      elements.push(child);
    });
    if (matchFunc(currentElement)) {
      resultSet.push(currentElement);
    }
  }

  return resultSet;
};


// detect and return the type of selector
// return one of these types: id, class, tag.class, tag
//
var selectorTypeMatcher = function(selector) {
  var type = '';
  if(/\[/.test(selector)){
    return "tag.attribute";
  }
  if (selector[0] === '#') {
    type += 'id';
  }
  else if (selector[0] === '.') {
    type += 'class';
  }
  else {
    type += 'tag';
  }
  var remaining = selector.slice(1);
  for(var i = 0; i < remaining.length; i++){
    var letter = remaining[i];
    if(letter === "."){
      type += ".class";
    }else if(letter === "#"){
      type += ".id";
    }else if(letter === " "){
      if(remaining[i+1] === ">"){
        type += ".child";
      }else{
        type += ".tag";
      }
    }
  }
  return type;
};


// NOTE ABOUT THE MATCH FUNCTION
// remember, the returned matchFunction takes an *element* as a
// parameter and returns true/false depending on if that element
// matches the selector.

var matchFunctionMaker = function(selector) {
  var selectorType = selectorTypeMatcher(selector);
  var matchFunction;
  if (selectorType === "id") {
    matchFunction = function(element) {
      return element.id === selector.slice(1);
    };
  } else if (selectorType === "class") {
    matchFunction = function(element) {
      var classes = element.className.split(' ');
      return classes.some(function(c) {return c === selector.slice(1)});
    };
  } else if (selectorType === "tag.class") {
    matchFunction = function(element) {
      var selectors = selector.split('.');
      var classes = element.className.split(' ');
      return classes.some(function(c) {return c === selectors[1]}) && element.tagName.toLowerCase() === selectors[0];
    };   
  } else if (selectorType === "tag") {
    matchFunction = function(element) {
      return element.tagName.toLowerCase() === selector;
    };
  } else if (selectorType === "tag.child.tag") {
    matchFunction = function(element) {
      var tags = selector.split(" > ");
      return element.tagName.toLowerCase() === tags[1] && element.parentNode.tagName.toLowerCase() === tags[0];
    }
  } else if (selectorType === "tag.tag") {
    matchFunction = function(element) {
      var tags = selector.split(" ");
      var match = element.tagName.toLowerCase() === tags[1] ? true : false;
      if(match){
        var parent = element.parentNode;
        match = false;
        while(parent.tagName.toLowerCase() !== "html"){
          if(parent.tagName.toLowerCase() === tags[0]){
            match = true;
            break;
          }
          parent = parent.parentNode;
        }
      }
      return match;
    }
  } else if (selectorType === "tag.attribute"){
    matchFunction = function(element){
      var tagWtAt = selector.match(/(\w+)\[(\w+)\="(\w+)"\]/);
      var match = false;
      if(tagWtAt[1] === element.tagName.toLowerCase()){
        var attributes = element.attributes;
        for(var i = 0; i < attributes.length; i++){
          if(tagWtAt[2] === attributes[i].name && tagWtAt[3] === attributes[i].nodeValue){
            match = true;
            break;
          }
        }
      }
      return match;
    }
  } else {
    matchFunction = function(element){
      var tags = selector.split(" > ");
      var match = tags[tags.length - 1] === element.tagName.toLowerCase() ? true : false;
      if(match){
        for(var i = tags.length - 2; i > 0; i--){
          var parent = element.parentNode;
          if(tags[i] !== parent.tagName.toLowerCase()){
            match = false;
            break;
          }
          parent = parent.parentNode;
        }
      }
      return match;  
    }
  }
  return matchFunction;
};

var $ = function(selector) {
  var elements;
  var selectorMatchFunc = matchFunctionMaker(selector);
  elements = traverseDomAndCollectElements(selectorMatchFunc);
  return elements;
};

Array.prototype.find = function(selector){
  var elements;
  var selectorMatchFunc = matchFunctionMaker(this[0].tagName.toLowerCase() + " " + selector);
  return traverseDomAndCollectElements(selectorMatchFunc);
}

Array.prototype.get = function(index){
  return this[index];
}

Array.prototype.children = function(selector){
  var elements;
  var selectorMatchFunc = matchFunctionMaker(this[0].tagName.toLowerCase() + " > " + selector);
  return traverseDomAndCollectElements(selectorMatchFunc);
}