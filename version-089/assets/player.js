(function (global) {
    global.initMoviePlayer = function (url) {
        var box = document.querySelector('[data-video-player]');
        var video = document.querySelector('[data-video-element]');
        var cover = document.querySelector('[data-player-cover]');
        var button = document.querySelector('[data-player-button]');
        var loaded = false;
        var hlsInstance = null;

        if (!box || !video || !url) {
            return;
        }

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (global.Hls && global.Hls.isSupported()) {
                hlsInstance = new global.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            attach();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})(window);
