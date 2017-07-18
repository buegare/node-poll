$('#add-answer').on('click', function(e){
	e.preventDefault();
	$('<input class="answer" name="answer" type="text" placeholder="Answer">').insertAfter($('.answer').last());
});

// $('#create-poll-btn').on('click', function(e) {
// 	var poll_title = $('#poll-title').val();
// 	var answer = $('.answer').val();

// 	if(poll_title === '') {
// 		alert('You must enter a title for this Poll');
// 		e.preventDefault();
// 		return;
// 	}

// 	$('.answer').each(function(i, v) {
// 		if($(this).val() === '') {
// 			alert('You must enter an answer');
// 			e.preventDefault();
// 		}
// 	});



// });
