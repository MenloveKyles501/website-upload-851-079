(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-overlay');
    var stream = video ? video.getAttribute('data-stream') : '';
    var loaded = false;
    var hls = null;

    function loadStream() {
      if (!video || !stream || loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      loaded = true;
    }

    function startPlayback() {
      loadStream();
      if (button) {
        button.classList.add('is-hidden');
      }
      video.controls = true;
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button && video) {
      button.addEventListener('click', startPlayback);
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('ended', function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
