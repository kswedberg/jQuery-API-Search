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
  params: $.param.fragment(),
  cache: {},
  url: /\.dev$/.test(location.hostname) ?
      'http://api.dev/jsonp/?callback=?' :
      'http://api.jquery.com/jsonp/?callback=?'
};
var $form = $('#jqas'),
    $log = $('#log');

$('#title')[0].focus();

$.fn.includeParams = function() {
  KS.include = this.find('input:checkbox').serializeArray();

  KS.includes = {};
  for (var i=0; i < KS.include.length; i++) {
    KS.includes[ KS.include[i].value ] = true;
  }
  return this;
};
var textVals = function() {
  return $form.find('input:text').map(function() {
    return this.value;
  }).get().join('');
};

$('#search-again').bind('click', function(event) {
  event.preventDefault();
  $(this).toggleClass('js-hide');
  $(this).closest('form').find('fieldset').slideToggle();
});

$('a[href=#]').live('click', function() {
  return false;
});

$form.bind('submit', function(event) {
  event.preventDefault();

  KS.params = $form.find('input:text, input:radio').serialize();
  $form.includeParams();
  if ( !textVals() ) {
    $log.html('');
  } else {
    $.bbq.pushState('#' + KS.params);
  }


});

$form.find('input:checkbox').bind('click', function(event) {
  $form.includeParams();
  outputResults( KS.cache[ $.param.fragment() ]);
});

$(window).bind('hashchange', function(event, initial) {
  var search = $.param.fragment();

  if ( !window.location.hash ) {
    return $log.html('');
  }

  if ( $.bbq.getState('scrollTarget') && !initial ) {
    return;
  }

  if (search in KS.cache) {
    outputResults( KS.cache[search] );
  } else {
    $('#log').html('<blink style="color: #999;">loading ...</blink>');
    $.getJSON(KS.url, search, function(json) {
      outputResults(json, true);
    });
  }
  if (!initial) {
    $('#search-again').trigger('click');
  }

});

// set up initial set of parameters and populate form if necessary
$form.includeParams();
var initialFrag = $.deparam.fragment();
$form.find('input:text').val(function() {
  return initialFrag[this.name] || '';
});
// trigger the hashchange on page load so we can return to the initial state
// and in case the user goes directly to a search
if (!textVals()) {
  $.bbq.removeState();
} else {
  $(window).trigger('hashchange', true);
}



var buildItem = {
  // build all of the signatures (syntaxes) for a single method
  // calls buildItem.params(), buildItem.optiions(), and buildItem.version()
  signatures: function(item) {
    var sigs = item.signatures;
    if (!sigs || !sigs.length || (!KS.includes['added'] && !KS.includes['params'])) {
      return this.title(item, {index: 0});
    }
    var allSigs = '';

    for (var i = 0, sigCount = sigs.length; i < sigCount; i++) {
      allSigs += (i == sigCount -1) ? '<div class="signature last">' : '<div class="signature">';
      allSigs += this.title(item, {index: i});
      if (KS.includes['added']) {
        allSigs += this.version( sigs, i );
      }
      if (KS.includes['params']) {
        allSigs += this.params( sigs[i] );
      }
      allSigs += this.options( sigs[i] );
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
    return '<div class="introduced">introduced in version ' +  sigs[i].added + '</div>';
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

  // build the options for each signature
  // options are really rare. probably only in $.ajax
  options: function(sig) {
    var opt = sig.options;
    if (!opt) {
      return '';
    }

    var opts = [];
    for (var k = 0; k < opt.length; k++) {
      opts[k] = [
        '<div class="opt">',
          '<div class="opt-title group">',
            '<strong>',
              opt[k].name,
            '</strong> ',
            opt[k].type ? ' <span>(' + opt[k].type + ')</span>' : '',
            opt[k]['default'] ? '<span class="def">Default: ' + opt[k]['default'] + '</span>' : '',
          '</div>',
          '<div class="opt-desc">',
            opt[k].desc,
          '</div>',
        '</div>'
      ].join('');
    }
    opts.unshift('<div class="options">');
    opts.push('</div>');

    return opts.join('');
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
      var lngdesc = item.longdesc.replace(/(img .*?src=")\//g,'$1http://api.jquery.com/');
      return '<div class="longdesc">' + lngdesc + '</div>';
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

    itemParts[ipCount++] = '<h4><a href="' + it.url + '">' + it.title + '</a></h4>';
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
