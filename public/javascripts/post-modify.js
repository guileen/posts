$(function() {
    var $preview = $(".preview");
    var editor = initEditor($('.editor textarea'), $(".editor .editor-bar"), function(html) {
        $preview.html(html);
        var title = $preview.children('h1,h2,h3,h4,h5,h6').first().text();
        $('.editor input[name="title"]').val(title);
    });
});
