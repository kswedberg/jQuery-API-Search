
$('#toggle-advanced').click(function() {
  var $span = $(this).find('span');
  $span.html($span.html() == '▼' ? '✒' : '▼');
  $('#advanced').slideToggle();
  return false;
});