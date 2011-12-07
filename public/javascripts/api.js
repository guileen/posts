// TODO ajaxSetup global
function removePost(id, el) {
  if (confirm('remove post?')) {
    $.post( '/post/' + id + '/remove', null, function(r) {
        if (r.success) {
          $(el).data('twipsy').$tip.remove();
          $(el).parents('.entry').slideUp(function() {
              $(this).remove();
          });
        }
    });
  }
}
