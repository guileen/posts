$(function(){
    // default pjax, currently just test
    $('a.pjax').pjax('.content .next', {
        fragment: '.content .current'
    }).live('click', function(){
        $('.content .current').slideUp().removeClass('current');
        $('.content').append('<div class="current"></div>');
    });
    $('.content .current')
    .bind('pjax:start', function() {
        console.log('pjax:start');
    }).bind('pjax:end',   function() {
        console.log('pjax:end');
        $('.content .next').addClass('current');
    });

    // init notify
    window.$notify = $('#notify-container').notify();
});

