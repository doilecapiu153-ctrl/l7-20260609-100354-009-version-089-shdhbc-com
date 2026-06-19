(function () {
    function initPlayer(shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('[data-cover]');
        var playButton = shell.querySelector('[data-play]');
        var videoUrl = shell.getAttribute('data-video');
        var hls = null;
        var ready = false;

        if (!video || !videoUrl) {
            return;
        }

        function attachSource() {
            if (ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
                ready = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
                ready = true;
                return;
            }
            video.src = videoUrl;
            ready = true;
        }

        function play() {
            attachSource();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.setAttribute('controls', 'controls');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.addEventListener('canplay', function () {
                        video.play();
                    }, { once: true });
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        if (playButton) {
            playButton.addEventListener('click', function (event) {
                event.stopPropagation();
                play();
            });
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
    });
})();
