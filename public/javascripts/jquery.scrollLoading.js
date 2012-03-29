/*!
 * jquery.scrollLoading.js
 * by zhangxinxu  http://www.zhangxinxu.com
 * 2010-11-19 v1.0
 * 2012-01-13 v1.1 偏移值计算修改 position → offset
 *
 * http://www.zhangxinxu.com/wordpress/2010/11/jquery%E9%A1%B5%E9%9D%A2%E5%9B%BE%E7%89%87%E7%AD%89%E5%85%83%E7%B4%A0%E6%BB%9A%E5%8A%A8%E5%8A%A8%E6%80%81%E5%8A%A0%E8%BD%BD%E5%AE%9E%E7%8E%B0/
*/
(function($) {
	$.fn.scrollLoading = function(options) {
		var defaults = {
			attr: "data-url"	
		};
		var params = $.extend({}, defaults, options || {});
		params.cache = [];
		$(this).each(function() {
			var node = this.nodeName.toLowerCase(), url = $(this).attr(params["attr"]);
			if (!url) { return; }
			//重组
			var data = {
				obj: $(this),
				tag: node,
				url: url
			};
			params.cache.push(data);
		});
		
		//动态显示数据
		var loading = function() {
			var st = $(window).scrollTop(), sth = st + $(window).height();
			$.each(params.cache, function(i, data) {
				var o = data.obj, tag = data.tag, url = data.url;
				if (o) {
					post = o.offset().top; posb = post + o.height();
					if ((post > st && post < sth) || (posb > st && posb < sth)) {
						//在浏览器窗口内
						if (tag === "img") {
							//图片，改变src
							o.attr("src", url);	
						} else {
							o.load(url);
						}	
						data.obj = null;		
					}
				}
			});		
			return false;	
		};
		
		//事件触发
		//加载完毕即执行
		loading();
		//滚动执行
		$(window).bind("scroll", loading);
	};
})(jQuery);
