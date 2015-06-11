var traverseDomAndCollectElements = function(matchFunc, startEl) {
  var resultSet = [];
  
  if (typeof startEl === "undefined") {
    startEl = document.body;
  }

  var elements = [startEl];
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
  if (/\./.test(remaining)) {
    type += '.class';
  }
  else if (/#/.test(remaining)) {
    type += '#id';
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
    
  }
  return matchFunction;
};

var $ = function(selector) {
  var elements;
  var selectorMatchFunc = matchFunctionMaker(selector);
  elements = traverseDomAndCollectElements(selectorMatchFunc);
  return elements;
};
