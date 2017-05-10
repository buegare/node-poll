$('#add-answer').on('click', function(e){
	e.preventDefault();
	$('<input class="answer" name="a1" type="text" placeholder="Answer">').insertAfter($('.answer').last());
});
