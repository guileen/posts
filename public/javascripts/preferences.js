$(function(){
    // Upload avatar
    var selectAvatar = document.getElementById('select-avatar');
    if(selectAvatar){
      var uploader = new qq.FileUploader({
          element: selectAvatar,
          multiple: false,
          action: '/upload'
      });
    }
});
