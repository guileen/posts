function initEditor(textarea, bar, onUpdate) {
  var $editor = $(textarea)
    , $bar  = $(bar);
    

    var converter = new Showdown.converter();

    function resetEditor() {
      $editor.val('');
      $editor.attr('data-numlinks', 0);
      $editor[0].dataLinks = {};
      $editor[0].dataNumLinks = 0;
      onUpdate('');
    }

    // resetEditor();

    //TODO make it a little delay, don't refresh too fast
    function update() {
        var html = converter.makeHtml($editor.val());
        onUpdate(html);
    };
    $editor.keyup(update);

    /* $bar #btn-upload */
    $("#btn-upload").click(function() {
        $("#input-file").click();
    });

    /* $bar #input-file */
    $("#input-file").change(function() {
        $("#upload-form").ajaxSubmit({
            success: function(data) {
              $editor.mkdInsertLink(data.url, data.filename, data.mime.indexOf('image/') === 0);
              update();
            }
        });
    });

    /* $bar img.emotion */
    $bar.find('img.emotion').click(function() {
        $editor.mkdInsertLink(this.src, this.alt, true);
        update();
    });

    return {
      reset: resetEditor
    };
}
