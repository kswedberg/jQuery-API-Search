/*!
 * jQuery API Search Demo
 * http://www.learningjquery.com/
 *
 * Copyright 2010, Karl Swedberg
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * 
 *
 * Date: Thu Sep 2 16:15:54 2010 -0400
 */
(function($) {
var KS = {
  includes: {},
  cache: {},
  url: 'http://api.jquery.com/jsonp/?callback=?'
};

var $form = $('#jqas');

$('#toggle-advanced').bind('click', function() {
  var $span = $(this).find('span');
  $span.html($span.html() == '▼' ? '✒' : '▼');
  $('#advanced').slideToggle();
  return false;
});

$.fn.includeParams = function() {
  KS.params = this.find('input:text, input:radio').serialize();
  KS.include = this.find('input:checkbox').serializeArray();
  KS.includes = {};
  for (var i=0; i < KS.include.length; i++) {
    KS.includes[ KS.include[i].value ] = true;
  }
  return this;
};

$('#search-again').bind('click', function(event) {
  event.preventDefault();
  $(this).toggleClass('js-hide');
  $form.find('fieldset').slideToggle();
});

$form.bind('submit', function(event) {
  event.preventDefault();
  
  $('#search-again').trigger('click');

  $form.includeParams();
   if (KS.params in KS.cache) {
    outputResults( KS.cache[KS.params] );
  } else {
    $('#log').html('<blink style="color: #999;">loading ...</blink>');
    $.getJSON(KS.url, KS.params, function(json) {
      outputResults(json, true);
    });
  }
  
});

$form.find('input:checkbox').click(function() {
  var search = KS.cache[KS.params];
  if (search) {
    $form.includeParams();
    outputResults( KS.cache[KS.params] );    
  }
  
});

var buildItem = {
  // build all of the signatures (syntaxes) for a single method
  // calls buildItem.params() and buildItem.version()
  signatures: function(item) {
    var sigs = item.signatures;
    if (!sigs.length || (!KS.includes['added'] && !KS.includes['params'])) {
      return this.title(item, {index: 0});
    }
    var allSigs = '';      

    for (var i = 0, sigCount = sigs.length; i < sigCount; i++) {
      allSigs += (i == sigCount -1) ? '<div class="signature group last">' : '<div class="signature group">';
      allSigs += this.title(item, {index: i});
      if (KS.includes['added']) {
        allSigs += this.version( sigs, i );
      }
      if (KS.includes['params']) {
        allSigs += this.params( sigs[i] );
      }
      allSigs += '</div>';
    }
    
    return '<div class="signatures">' + allSigs + '</div>';
  },
  // build all of the params for a single signature (syntax)
  params: function(sig) {
    var params = '';
    var param = sig.params;
    if (param) {
      for (var k = 0; k < param.length; k++) {
        params += '<div class="param"><strong title="' + param[k].type + '">' + param[k].name + '</strong> ';
        params += param[k].optional ? '<em>optional</em> ' : '';
        params += param[k].desc + '</div>';
      }
    }
    return params;
  },

  // build the note indicating the version at which the signature (syntax) was introduced
  version: function(sigs , i) {
    return '<div class="introduced" title="introduced in version ' +  sigs[i].added + '">' + sigs[i].added + '</div>';
  },

  // build the title for each method signature (syntax)
  title: function(item, options) {
    var opts = $.extend({
      index: 0, 
      pre: '<strong>', 
      post: '</strong>'
    }, options);

    item.newTitle = item.title;

    if (item.signatures && item.signatures[opts.index].params) {
      item.newTitle = item.newTitle.replace(/\)/,'');

      var newParams = [];

      for (var j = 0, params = item.signatures[opts.index].params; j < params.length; j++ ) {
        newParams[j] = params[j].name;
      }
      item.newTitle += ' ' + newParams.join(', ');
      item.newTitle += ' )';
    }
    return opts.pre + item.newTitle + opts.post;
  },
  
  // build the short description for each entry
  desc: function(item) {
    if (KS.includes['desc']) {
      return '<div class="desc">' + item.desc + '</div>';
    }
    return '';
  },
  
  // build the long description for each entry
  longdesc: function(item) {
    if (KS.includes['longdesc']) {
      return '<div class="longdesc">' + item.longdesc + '</div>';
    }
    return '';
  }

};

function outputResults(json, xhr) {
  var toc = [],
      list = [],
      entryCount = json.length;

  if (xhr) {
    KS.cache[ KS.params ] = json;
  }

  for (var i=0; i < entryCount; i++) {
    var it = json[i],
        itemParts = [],
        ipCount = 0,
        entryid = 'entry-' + i;
    
    toc[i] = buildItem.title(it, {
      pre: '<li><a href="#' + entryid + '">', 
      post: '</a></li>'
    });
    
    
    itemParts[ipCount++] = '<h4><a id="' + entryid + '" href="' + it.url + '">' + it.title + '</a></h4>';
    itemParts[ipCount++] = buildItem.signatures(it);
    
    itemParts[ipCount++] = buildItem.desc(it);
    itemParts[ipCount++] = buildItem.longdesc(it);
    
    list[i] = '<li id="' + entryid + '">' + itemParts.join('') + '</li>';

  }

  if (list.length) {
    var $list = $('<ol>' + list.join('') + '</ol>');
    $('#log')
    .empty()
    .append($list)
    .prepend('<ol class="toc">' + toc.join('') + '</ol>')
    .prepend( resultMsg(entryCount) );

  } else {
    $('#log').html('<p>Sorry, nothing found.</p>');
  }
  
}

function resultMsg(num) {
  var txt = '<strong>' + num + '</strong> ';
  txt += num == 1 ? 'result found' : 'results found';
  return '<p>' + txt + '</p>';
  
}


})(jQuery);
