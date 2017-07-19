import $ from 'jquery';

function toggleSignUpForm() {
  if ($('#signin-form').is(':visible')) {
    $('#signup-form, #signin-form').toggle();
    $("#signup-form input[name='username']").focus();
  } else {
    $('#signup-form').toggle();
    $("#signup-form input[name='username']").focus();
  }
}

function toggleSignInForm() {
  if ($('#signup-form').is(':visible')) {
    $('#signup-form, #signin-form').toggle();
    $("#signin-form input[name='username']").focus();
  } else {
    $('#signin-form').toggle();
    $("#signin-form input[name='username']").focus();
  }
}

$('#signup-btn').on('click', toggleSignUpForm);

$('#signin-btn').on('click', toggleSignInForm);
