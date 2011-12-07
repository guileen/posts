$(function() {
    // Upload avatar
    var selectAvatar = document.getElementById('select-avatar');
    if (selectAvatar) {
      var uploader = new qq.FileUploader({
          element: selectAvatar,
          multiple: false,
          action: '/upload'
      });
    }

    $('form.preferences').ajaxForm({
        success: function(data) {
          if (data.success) {
            $notify.notify('create', {
                title: 'Preferences saved successfully'
            });
            if ($('body').hasClass('signup-step2')) {
              setTimeout(function() {
                  location.href = '/';
              }, 100);
            }
          } else {
            $notify.notify('create', {
                title: 'Something went wrong'
              , text : data.msg || ''
            });
          }
        }
    });

    $('input[name=fullname]').blur(function() {
        console.log('on blur');
    });
});
