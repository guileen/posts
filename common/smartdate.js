var root = typeof module != 'undefined' && module.exports || this;

root.formatSeconds = function(s, def) {
    var d, h, m;
    if (s < 120) {
      return 'Just now';
    }
    m = Math.floor(s / 60);
    if (m < 60) {
      return m + ' minutes ago';
    }
    h = Math.floor(m / 60);
    if (h === 1) {
      return h + ' hour ago';
    }
    if (h < 24) {
      return h + ' hours ago';
    }
    d = Math.floor(h / 24);
    if (d === 1) {
      return 'yesterday';
    }
    if (d < 11) {
      return d + ' days ago';
    }
    return def;
  }

root.simpleDate = function(date) {
    var centuryDate, centuryNow, delta, format, now, s;
    now = new Date();
    delta = now - date;
    s = delta / 1000;
    if (now.getDate() === date.getDate() && s < 24 * 3600) {
      format = 'HH:MM';
    } else if (now.getYear() === date.getYear()) {
      format = 'mm-dd';
    } else {
      centuryNow = Math.floor(now.getFullYear() / 100);
      centuryDate = Math.floor(date.getFullYear() / 100);
      if (centuryNow === centuryDate) {
        format = 'yy-mm-dd';
      } else {
        format = 'yyyy-mm-dd';
      }
    }
    return date.format(format);
  }

root.smartDate = function(date) {
    var centuryDate, centuryNow, delta, format, now, s;
    now = new Date();
    delta = now - date;
    s = delta / 1000;

    var d, h, m;
    if (s < 120) {
      return 'Just now';
    }
    m = Math.floor(s / 60);
    if (m < 60) {
      return m + ' minutes ago';
    }
    h = Math.floor(m / 60);
    if (h === 1) {
      return h + ' hour ago';
    }
    if (h < 10) {
      return h + ' hours ago';
    }
    var d_now = Math.floor(now.getTime()/(24 * 3600 * 1000));
    var d = Math.floor(date.getTime()/(24 * 3600 * 1000));
    d = d_now - d;

    if(d === 0) {
      format = 'HH:MM';
    } else if (d === 1) {
      return 'yesterday';
    } else if (d < 10) {
      return d + ' days ago';
    } else if (now.getYear() === date.getYear()) {
      format = 'mm-dd';
    } else {
      centuryNow = Math.floor(now.getFullYear() / 100);
      centuryDate = Math.floor(date.getFullYear() / 100);
      if (centuryNow === centuryDate) {
        format = 'yy-mm-dd';
      } else {
        format = 'yyyy-mm-dd';
      }
    }
    return date.format(format);
  }

