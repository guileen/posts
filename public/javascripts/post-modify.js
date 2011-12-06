$(function(){
    var $preview = $(".preview");
    var editor = initEditor($('.editor textarea'), $(".editor .editor-bar"), function(html){
        $preview.html(html);
    });
});
