// TODO ajaxSetup global
// TODO remove tipsy
function removePost(id, el) {
  if(confirm('remove post?')) {
    $.post( '/post/' + id + '/remove', null, function(r) {
        if(r.success) {
          $(el).parents('.entry').slideUp(function(){
              $(this).remove();
          });
        }
      });
  }
}
