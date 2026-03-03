document.querySelectorAll('.html5-video').forEach(function(video) {
  video.style.opacity = '0';
  video.play().then(function() {
    video.style.opacity = '1';
  }).catch(function() {
    var fallback = document.createElement('img');
    fallback.src = video.getAttribute('data-fallback');
    fallback.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;';
    video.parentNode.insertBefore(fallback, video);
    video.style.display = 'none';
  });
});

(function () {
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  document.querySelectorAll('[data-ios-vimeo]').forEach(function(el) {
    var value = el.getAttribute('data-ios-vimeo');
    if (isIOS  && value === 'false') el.style.display = 'none';
    if (!isIOS && value === 'true')  el.style.display = 'none';
  });
})();

document.addEventListener('DOMContentLoaded', function() {

  gsap.utils.toArray('[data-video="playpause"]').forEach(function(el) {
    var v = el.querySelector('video');
    if (!v) return;
    ScrollTrigger.create({
      trigger: el,
      start: '0% 50%',
      end: '50% 0%',
      onEnter:     function() { v.play(); },
      onEnterBack: function() { v.play(); },
      onLeave:     function() { v.pause(); },
      onLeaveBack: function() { v.pause(); }
    });
  });

  document.querySelectorAll('[data-vimeo-player-init]').forEach(function(vimeoElement, index) {
    var vimeoVideoID = vimeoElement.getAttribute('data-vimeo-video-id');
    if (!vimeoVideoID) return;

    vimeoElement.querySelector('iframe').setAttribute('src',
      'https://player.vimeo.com/video/' + vimeoVideoID + '?api=1&background=1&autoplay=0&loop=0&muted=1'
    );

    var videoIndexID = 'vimeo-player-advanced-index-' + index;
    vimeoElement.setAttribute('id', videoIndexID);
    var player = new Vimeo.Player(videoIndexID);

    var updateSize = vimeoElement.getAttribute('data-vimeo-update-size');
    if (updateSize === 'true') {
      Promise.all([player.getVideoWidth(), player.getVideoHeight()]).then(function(vals) {
        var w = vals[0], h = vals[1];
        var el = vimeoElement.querySelector('.vimeo-player__before');
        if (el) el.style.paddingTop = (h / w) * 100 + '%';
      });
    }

    var videoAspectRatio;
    if (updateSize === 'cover') {
      Promise.all([player.getVideoWidth(), player.getVideoHeight()]).then(function(vals) {
        var w = vals[0], h = vals[1];
        videoAspectRatio = h / w;
        var el = vimeoElement.querySelector('.vimeo-player__before');
        if (el) el.style.paddingTop = '0%';
        adjustVideoSizing();
      });
      window.addEventListener('resize', adjustVideoSizing);
    }

    function adjustVideoSizing() {
      var containerRatio = vimeoElement.offsetHeight / vimeoElement.offsetWidth;
      var iframeWrapper  = vimeoElement.querySelector('.vimeo-player__iframe');
      if (!iframeWrapper || !videoAspectRatio) return;
      if (containerRatio > videoAspectRatio) {
        iframeWrapper.style.width  = (containerRatio / videoAspectRatio) * 100 + '%';
        iframeWrapper.style.height = '100%';
      } else {
        iframeWrapper.style.height = (videoAspectRatio / containerRatio) * 100 + '%';
        iframeWrapper.style.width  = '100%';
      }
    }

    player.on('play', function() { vimeoElement.setAttribute('data-vimeo-loaded', 'true'); });

    if (vimeoElement.getAttribute('data-vimeo-autoplay') === 'false') {
      player.setVolume(1);
      player.pause();
    } else {
      player.setVolume(0);
      vimeoElement.setAttribute('data-vimeo-muted', 'true');
      if (vimeoElement.getAttribute('data-vimeo-paused-by-user') === 'false') {
        function checkVisibility() {
          var rect = vimeoElement.getBoundingClientRect();
          rect.top < window.innerHeight && rect.bottom > 0 ? vimeoPlayerPlay() : vimeoPlayerPause();
        }
        checkVisibility();
        window.addEventListener('scroll', checkVisibility);
      }
    }

    function vimeoPlayerPlay() {
      vimeoElement.setAttribute('data-vimeo-activated', 'true');
      vimeoElement.setAttribute('data-vimeo-playing', 'true');
      player.play();
    }
    function vimeoPlayerPause() {
      vimeoElement.setAttribute('data-vimeo-playing', 'false');
      player.pause();
    }

    var playBtn = vimeoElement.querySelector('[data-vimeo-control="play"]');
    if (playBtn) {
      playBtn.addEventListener('click', function() {
        player.setVolume(0);
        vimeoPlayerPlay();
        if (vimeoElement.getAttribute('data-vimeo-muted') !== 'true') player.setVolume(1);
      });
    }

    var pauseBtn = vimeoElement.querySelector('[data-vimeo-control="pause"]');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function() {
        vimeoPlayerPause();
        if (vimeoElement.getAttribute('data-vimeo-autoplay') === 'true') {
          vimeoElement.setAttribute('data-vimeo-paused-by-user', 'true');
        }
      });
    }

    var muteBtn = vimeoElement.querySelector('[data-vimeo-control="mute"]');
    if (muteBtn) {
      muteBtn.addEventListener('click', function() {
        var muted = vimeoElement.getAttribute('data-vimeo-muted') === 'true';
        player.setVolume(muted ? 1 : 0);
        vimeoElement.setAttribute('data-vimeo-muted', muted ? 'false' : 'true');
      });
    }

    var fsSupported = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
    var fsBtn = vimeoElement.querySelector('[data-vimeo-control="fullscreen"]');
    if (!fsSupported && fsBtn) fsBtn.style.display = 'none';

    if (fsBtn) {
      fsBtn.addEventListener('click', function() {
        var el = document.getElementById(videoIndexID);
        var isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
        if (isFullscreen) {
          vimeoElement.setAttribute('data-vimeo-fullscreen', 'false');
          (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        } else {
          vimeoElement.setAttribute('data-vimeo-fullscreen', 'true');
          (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
        }
      });
    }

    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function(evt) {
      document.addEventListener(evt, function() {
        vimeoElement.setAttribute('data-vimeo-fullscreen',
          (document.fullscreenElement || document.webkitFullscreenElement) ? 'true' : 'false'
        );
      });
    });

    function fmt(s) {
      return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + Math.floor(s % 60);
    }
    var durationEl = vimeoElement.querySelector('[data-vimeo-duration]');
    var timelineEl = vimeoElement.querySelector('[data-vimeo-control="timeline"]');
    var progressEl = vimeoElement.querySelector('progress');

    player.getDuration().then(function(duration) {
      if (durationEl) durationEl.textContent = fmt(duration);
      if (timelineEl) timelineEl.setAttribute('max', duration);
      if (progressEl) progressEl.setAttribute('max', duration);
    });

    if (timelineEl) {
      ['input', 'change'].forEach(function(evt) {
        timelineEl.addEventListener(evt, function() {
          player.setCurrentTime(timelineEl.value);
          if (progressEl) progressEl.value = timelineEl.value;
        });
      });
    }

    player.on('timeupdate', function(data) {
      if (timelineEl) timelineEl.value = data.seconds;
      if (progressEl) progressEl.value = data.seconds;
      if (durationEl) durationEl.textContent = fmt(Math.trunc(data.seconds));
    });

    var hoverTimer;
    vimeoElement.addEventListener('mousemove', function() {
      if (vimeoElement.getAttribute('data-vimeo-hover') === 'false')
        vimeoElement.setAttribute('data-vimeo-hover', 'true');
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(function() {
        vimeoElement.setAttribute('data-vimeo-hover', 'false');
      }, 3000);
    });

    player.on('ended', function() {
      vimeoElement.setAttribute('data-vimeo-activated', 'false');
      vimeoElement.setAttribute('data-vimeo-playing', 'false');
      player.unload();
    });
  });

});
