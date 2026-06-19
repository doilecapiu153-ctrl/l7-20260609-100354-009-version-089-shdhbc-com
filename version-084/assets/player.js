(function() {
  var sourceUrl = '';
  var shell = document.querySelector('.player-shell');
  var video = shell ? shell.querySelector('video') : null;
  var overlay = shell ? shell.querySelector('.player-overlay') : null;
  var button = shell ? shell.querySelector('.player-button') : null;
  var hlsInstance = null;

  function attachSource() {
    if (!video || !sourceUrl) {
      return;
    }
    if (video.getAttribute('data-ready') === '1') {
      return;
    }
    video.setAttribute('data-ready', '1');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }
    if (globalThis.Hls && globalThis.Hls.isSupported()) {
      hlsInstance = new globalThis.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = sourceUrl;
  }

  function startPlayback() {
    if (!video) {
      return;
    }
    attachSource();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.controls = true;
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function() {});
    }
  }

  globalThis.initPlayer = function(url) {
    sourceUrl = url;
    if (!video || !overlay) {
      return;
    }
    overlay.addEventListener('click', startPlayback);
    if (button) {
      button.addEventListener('click', startPlayback);
    }
    video.addEventListener('click', function() {
      if (video.paused) {
        startPlayback();
      }
    });
    window.addEventListener('beforeunload', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
