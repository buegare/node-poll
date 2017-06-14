function createUser(){

	var new_user = {
		username: $("#signin-n-signup input[name='username']").val(),
		password: $("#signin-n-signup input[name='password']").val()
	};

	console.log(new_user);

	$.ajax({
		url: "/user/create",
		type: "POST",
		data: new_user,
		success: function(data) {
			console.log(new_user);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.warn(jqXHR.responseText);
            console.log('error ' + textStatus + " " + errorThrown);
        }
	});

}

$('#sign-up-opt').on('click',  createUser);