(function () {
    var video = document.querySelector("[data-player-video]");
    var button = document.querySelector("[data-player-button]");
    var overlay = document.querySelector("[data-player-overlay]");
    var status = document.querySelector("[data-player-status]");
    if (!video) {
        return;
    }

    var streamUrl = video.getAttribute("data-stream");
    var initialized = false;
    var hlsInstance = null;

    function setStatus(text) {
        if (status) {
            status.textContent = text || "";
        }
    }

    function initializePlayer() {
        if (initialized || !streamUrl) {
            return;
        }
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                setStatus("");
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus("视频暂时无法播放，请稍后重试");
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    }
                }
            });
            return;
        }
        video.src = streamUrl;
    }

    function playMovie() {
        initializePlayer();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                setStatus("点击画面继续播放");
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    if (button) {
        button.addEventListener("click", playMovie);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            playMovie();
        }
    });
    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        setStatus("");
    });
    video.addEventListener("pause", function () {
        if (video.currentTime === 0 && overlay) {
            overlay.classList.remove("is-hidden");
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
