/*!
*	jQuery-tubeground plugin
*	Originally Written by Sean, MIT License - jquery-tubular ( http://www.seanmccambridge.com/tubular/ )
*	Maintained&Modified By Seung Yeon You ( @SeungYeonYou )
*	License: Creative Commons BY-SA 4.0 ( http://creativecommons.org/licenses/by-sa/4.0/ )
*/

;(function ($, window, document) {

    // test for feature support and return if failure
    
    // defaults
    var defaults = {
        ratio: 16/9, // usually either 4/3 or 16/9 -- tweak as needed
        videoId: 'O2mzNqRN4iw', // toy robot in space is a good default, no?
        mute: true,
        repeat: true,
        width: $(window).width(),
        wrapperZIndex: 99,
        playButtonClass: 'tubeground-play',
        pauseButtonClass: 'tubeground-pause',
        muteButtonClass: 'tubeground-mute',
        volumeUpClass: 'tubeground-volume-up',
        volumeDownClass: 'tubeground-volume-down',
        increaseVolumeBy: 10,
        start: 0,
        onVideoStart: function () {}
    };

    // methods

    var tubeground = function(node, options) { // should be called on the wrapper div
	    
        var options = $.extend({}, defaults, options),
            $body = $('body'), // cache body node
            $node = $(node); // cache wrapper node

        // build container
        var tubegroundContainer = '<div id="tubeground-container" style="overflow: hidden; position: fixed; z-index: 1; width: 100%; height: 100%"><div id="tubeground-player" style="position: absolute"></div></div><div id="tubeground-shield" style="width: 100%; height: 100%; z-index: 2; position: absolute; left: 0; top: 0;"></div>';

        // set up css prereq's, inject tubeground container and set up wrapper defaults
        $('html,body').css({'width': '100%', 'height': '100%'});
        $body.prepend(tubegroundContainer);
        $node.css({position: 'relative', 'z-index': options.wrapperZIndex});

        // set up iframe player, use global scope so YT api can talk
        window.player;
        window.onYouTubeIframeAPIReady = function() {
            window.player = new YT.Player('tubeground-player', {
                width: options.width,
                height: Math.ceil(options.width / options.ratio),
                videoId: options.videoId,
                playerVars: {
                    'modestbranding': 1,
                    'wmode': 'transparent',
					'autoplay' : 1,
					'rel' : 0,
					'showinfo' : 0,
					'showsearch' : 0,
					'controls' : 0,
					'loop' : 1,
					'enablejsapi' : 1,
					'playlist': options.videoId
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        };

        window.onPlayerReady = function(e) {
            resize();
            if (options.mute) e.target.mute();
            e.target.seekTo(options.start);
            e.target.playVideo();
        };

        window.onPlayerStateChange = function(state) {
            /*if (state.data === 0 && options.repeat) { // video ended and repeat option is set true
                player.seekTo(options.start); // restart
            }*/
            if (state.data === 1) {
	            // 재생중 - onVideoStart 시작
	            options.onVideoStart();
            }
        };

        // resize handler updates width, height and offset of player after resize/init
        var resize = function() {
            var width = $(window).width(),
                pWidth, // player width, to be defined
                height = $(window).height(),
                pHeight, // player height, tbd
                $tubegroundPlayer = $('#tubeground-player');

            // when screen aspect ratio differs from video, video must center and underlay one dimension

            if (width / options.ratio < height) { // if new video height < window height (gap underneath)
                pWidth = Math.ceil(height * options.ratio); // get new player width
                $tubegroundPlayer.width(pWidth).height(height).css({left: (width - pWidth) / 2, top: 0}); // player width is greater, offset left; reset top
            } else { // new video width < window width (gap to right)
                pHeight = Math.ceil(width / options.ratio); // get new player height
                $tubegroundPlayer.width(width).height(pHeight).css({left: 0, top: (height - pHeight) / 2}); // player height is greater, offset top; reset left
            }

        };

        // events
        $(window).on('resize.tubeground', function() {
            resize();
        });

        $('body').on('click','.' + options.playButtonClass, function(e) { // play button
            e.preventDefault();
            player.playVideo();
        }).on('click', '.' + options.pauseButtonClass, function(e) { // pause button
            e.preventDefault();
            player.pauseVideo();
        }).on('click', '.' + options.muteButtonClass, function(e) { // mute button
            e.preventDefault();
            (player.isMuted()) ? player.unMute() : player.mute();
        }).on('click', '.' + options.volumeDownClass, function(e) { // volume down button
            e.preventDefault();
            var currentVolume = player.getVolume();
            if (currentVolume < options.increaseVolumeBy) currentVolume = options.increaseVolumeBy;
            player.setVolume(currentVolume - options.increaseVolumeBy);
        }).on('click', '.' + options.volumeUpClass, function(e) { // volume up button
            e.preventDefault();
            if (player.isMuted()) player.unMute(); // if mute is on, unmute
            var currentVolume = player.getVolume();
            if (currentVolume > 100 - options.increaseVolumeBy) currentVolume = 100 - options.increaseVolumeBy;
            player.setVolume(currentVolume + options.increaseVolumeBy);
        });
        
        // load yt iframe js api
	    var tag = document.createElement('script');
	    tag.src = "//www.youtube.com/iframe_api";
	    var firstScriptTag = document.getElementsByTagName('script')[0];
	    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    };

    // create plugin

    $.fn.tubeground = function (options) {
	    var tgelems = $('#tubeground-container,#tubeground-shield');
	    if (tgelems.length == 0) {
			return tubeground(this, options);
	    } else if (options.force) {
		    tgelems.remove();
		    return tubeground(this, options);
	    } else {
		    return false;
	    }
    };

})(jQuery, window, document);