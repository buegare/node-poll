import $ from 'jquery';

function deletePoll(e) {
  e.preventDefault();
  const pollId = $('#delete-btn').attr('postId');

  $.ajax({
    url: '/poll/delete',
    type: 'DELETE',
    data: { pollId },
    success: () => window.location.replace('/'),
    error: (jqXHR, textStatus, errorThrown) => {
      console.warn(jqXHR.responseText);
      console.log(`error ${textStatus} ${errorThrown}`);
    }
  });
}

$('#delete-btn').on('click', deletePoll);
