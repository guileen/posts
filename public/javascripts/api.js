// TODO ajaxSetup global
function removePost(id) {
  $.post( '/post/' + id + '/remove', null, function(r) {
      if (r.success) {
        $('#rm-' + id).data('twipsy').$tip.remove();
        $('#rm-' + id).parents('.entry').slideUp(function() {
            $(this).remove();
        });
      }
  });
}

$(function(){

    $('.icon.trash').popover({
        trigger:'manual'
      , html:true
      , placement : 'below'
      , content : function(){
          var id = this.id.substring(3);
          var hideSnip = "$('#rm-" + id + "').popover('hide')";
          var removeSnip = "removePost('" + id + "');";
          return '<p class="clearfix">Are you sure?</p><br>'
          + '<p style="text-align:center;">'
          + '<a class="btn" href="javascript:void(0)" onclick="' + removeSnip + hideSnip + '">Yes</a>'
          + '&nbsp;<a class="btn primary" onclick="' + hideSnip + '">No</a></p>'
        }
    });

    $('.icon.trash').click(function(){
        $(this).popover('show');
    })

})
