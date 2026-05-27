function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-video');
  var cover = document.getElementById('player-cover');
  var button = document.getElementById('play-button');
  var started = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachSource() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function playVideo() {
    attachSource();

    if (cover) {
      cover.classList.add('hidden');
    }

    video.controls = true;

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      playVideo();
    });
  }

  if (cover) {
    cover.addEventListener('click', function () {
      playVideo();
    });
  }

  video.addEventListener('click', function () {
    if (!started) {
      playVideo();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
