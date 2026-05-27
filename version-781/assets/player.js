(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupPlayer(root) {
    const video = root.querySelector('video[data-stream]');
    const overlay = root.querySelector('.play-overlay');
    if (!video || !overlay) return;
    const source = video.getAttribute('data-stream');
    let attached = false;
    let hls = null;

    function attach() {
      if (attached || !source) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        root._hls = hls;
        attached = true;
        return;
      }
      video.src = source;
      attached = true;
    }

    function start() {
      attach();
      overlay.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      const promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!attached || video.paused) start();
    });
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
  });
})();
