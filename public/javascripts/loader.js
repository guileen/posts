function(window, document, namespace) {
  if (window[namespace] && typeof window[namespace].postToPostsli === 'function') {
    return;
  }
  var script = document.createElement('script');
  script.setAttribute('charset', 'utf-8');
  script.src = 'http://posts.li/bookmark.js?' + Math.floor(new Date() / 1E7);
  document.body.appendChild(script);
}
