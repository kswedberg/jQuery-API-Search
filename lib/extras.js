
$('#toggle-advanced').click(function() {
  var $span = $(this).find('span');
  $span.html($span.html() == '▼' ? '✒' : '▼');
  $('#advanced').slideToggle();
  return false;
});

$('ol.toc a').live('click', function(event) {
  event.preventDefault();
  var tgt = this.hash;
  $.bbq.pushState({scrollTarget: tgt});
});

$(window).bind('hashchange', function(event) {
  var st = $.bbq.getState('scrollTarget');
  if (st) {
    $.smoothScroll({scrollTarget: st});
  }


});
