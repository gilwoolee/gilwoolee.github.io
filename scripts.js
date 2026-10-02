// Keep previews quiet when off screen and respect reduced-motion preferences.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const previews = [...document.querySelectorAll('video[autoplay]')];
const manuallyPaused = new WeakSet();
const automaticPause = new WeakSet();
function pausePreview(video) {
    if (!video.paused) {
        automaticPause.add(video);
        video.pause();
    }
}
function updatePreview(video, visible) {
    if (reducedMotion.matches || document.hidden || !visible) {
        pausePreview(video);
    } else if (!manuallyPaused.has(video)) {
        video.play().catch(() => {}); // Native controls remain available if autoplay is blocked.
    }
}
const visiblePreviews = new Set();
const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
        if (entry.isIntersecting) visiblePreviews.add(entry.target);
        else visiblePreviews.delete(entry.target);
        updatePreview(entry.target, entry.isIntersecting);
    }
}, { threshold: 0.15 });
for (const video of previews) {
    video.addEventListener('pause', () => {
        if (automaticPause.has(video)) automaticPause.delete(video);
        else manuallyPaused.add(video);
    });
    video.addEventListener('play', () => manuallyPaused.delete(video));
    if (reducedMotion.matches) pausePreview(video);
    observer.observe(video);
}
function updatePreviews() {
    previews.forEach(video => updatePreview(video, visiblePreviews.has(video)));
}
reducedMotion.addEventListener('change', updatePreviews);
document.addEventListener('visibilitychange', updatePreviews);
