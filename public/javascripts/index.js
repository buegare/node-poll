import $ from 'jquery';

$('#add-answer').on('click', (e) => {
  e.preventDefault();
  $('<input class="answer" name="answer" type="text" placeholder="Answer">').insertAfter($('.answer').last());
});
