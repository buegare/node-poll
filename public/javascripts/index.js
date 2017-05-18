$('#add-answer').on('click', function(e){
	e.preventDefault();
	$('<input class="answer" name="answer" type="text" placeholder="Answer">').insertAfter($('.answer').last());
});
