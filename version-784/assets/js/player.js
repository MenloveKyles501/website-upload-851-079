import { H as Hls } from "./hls.js";

function attachPlayer(shell) {
  var video = shell.querySelector("video");
  var trigger = shell.querySelector("button");
  var stream = shell.getAttribute("data-stream");
  var loaded = false;
  var hls = null;

  function start() {
    if (!video || !stream) return;

    if (!loaded) {
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    if (trigger) trigger.classList.add("is-hidden");
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (trigger) trigger.addEventListener("click", start);
  if (video) {
    video.addEventListener("click", function () {
      if (!loaded) start();
    });
  }

  window.addEventListener("pagehide", function () {
    if (hls) hls.destroy();
  });
}

document.querySelectorAll("[data-stream]").forEach(attachPlayer);
