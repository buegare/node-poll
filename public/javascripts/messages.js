import $ from 'jquery';

$('[class^=alert-] span').on('click', () => {
  $('[class^=alert-]').hide();
});
