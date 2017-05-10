$('#add-answer').on('click', function(e){
	e.preventDefault();
	console.log('CLICKED');
	$('<input class="answer" name="a1" type="text" placeholder="Answer">').insertAfter($('.answer').last());
});
