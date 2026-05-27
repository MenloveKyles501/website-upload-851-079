import { H as Hls } from './hls-dru42stk.js';

function setStatus(player, message) {
  const status = player.querySelector('[data-player-status]');

  if (status) {
    status.textContent = message;
  }
}

function hideOverlay(player) {
  const overlay = player.querySelector('.player-overlay');

  if (overlay) {
    overlay.classList.add('is-hidden');
  }
}

function setupPlayer(player) {
  const video = player.querySelector('video');
  const startButton = player.querySelector('[data-play-button]');
  const source = player.dataset.src;
  const poster = player.dataset.poster;
  let hls = null;
  let initialized = false;
  let manifestReady = false;

  if (!video || !source) {
    setStatus(player, '播放器缺少播放源。');
    return;
  }

  if (poster) {
    video.poster = poster;
  }

  async function playVideo() {
    try {
      await video.play();
      player.classList.add('is-playing');
      hideOverlay(player);
      setStatus(player, '正在播放');
    } catch (error) {
      setStatus(player, '浏览器阻止了自动播放，请再次点击播放按钮。');
    }
  }

  function initialize() {
    if (initialized) {
      if (manifestReady || video.readyState > 0) {
        playVideo();
      }
      return;
    }

    initialized = true;
    player.classList.add('is-loading');
    setStatus(player, '正在加载播放源…');

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        manifestReady = true;
        player.classList.remove('is-loading');
        player.classList.add('is-ready');
        setStatus(player, '播放源已就绪');
        playVideo();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data && data.fatal) {
          setStatus(player, '视频加载失败，请稍后重试。');
          player.classList.remove('is-loading');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', () => {
        manifestReady = true;
        player.classList.remove('is-loading');
        player.classList.add('is-ready');
        setStatus(player, '播放源已就绪');
        playVideo();
      }, { once: true });
    } else {
      player.classList.remove('is-loading');
      setStatus(player, '当前浏览器不支持 HLS 播放。');
    }
  }

  if (startButton) {
    startButton.addEventListener('click', initialize);
  }

  video.addEventListener('click', () => {
    if (!initialized) {
      initialize();
    }
  });

  video.addEventListener('pause', () => {
    player.classList.remove('is-playing');
  });

  video.addEventListener('play', () => {
    player.classList.add('is-playing');
    hideOverlay(player);
  });

  window.addEventListener('beforeunload', () => {
    if (hls) {
      hls.destroy();
    }
  });
}

Array.from(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
