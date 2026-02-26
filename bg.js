// ===== Visualizer Background Stability Module =====

(function () {

    function pauseVisualizer() {
        if (window.Visualizer?.animationId) {
            cancelAnimationFrame(window.Visualizer.animationId);
            window.Visualizer.animationId = null;
        }

        if (window.Visualizer?.audioContext) {
            window.Visualizer.audioContext.close();
            window.Visualizer.audioContext = null;
        }

        console.log("Visualizer paused for background stability");
    }

    function resumeVisualizer() {
        const audio = document.querySelector("audio");
        if (!audio) return;

        if (!audio.paused && window.Visualizer) {

            if (!window.Visualizer.animationId) {
                window.Visualizer.setupAudio();
                window.Visualizer.animate();
            }

            console.log("Visualizer resumed");
        }
    }

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            pauseVisualizer();
        }

        if (document.visibilityState === "visible") {
            resumeVisualizer();
        }
    });

})();

// ===============================
// BACKGROUND PLAYBACK STABILITY FIX
// ===============================

(function () {

    if (!window.audio) return;

    console.log("Background playback stabilizer loaded");

    // --------------------------------
    // 1️⃣ REMOVE Dangerous play override
    // --------------------------------

    if (audio.originalPlay) {
        audio.play = audio.originalPlay;
        console.log("Audio.play restored to original");
    }

    // --------------------------------
    // 2️⃣ ENSURE ended always triggers next
    // --------------------------------

    audio.removeEventListener("ended", window.__bgEndedHandler);

    window.__bgEndedHandler = function () {
        if (typeof playNext === "function") {
            playNext();
        }
    };

    audio.addEventListener("ended", window.__bgEndedHandler);

    // --------------------------------
    // 3️⃣ Prevent Visualizer from killing playback
    // --------------------------------

    document.addEventListener("visibilitychange", () => {

        if (document.visibilityState === "hidden") {

            // Stop animation only
            if (window.Visualizer?.animationId) {
                cancelAnimationFrame(window.Visualizer.animationId);
                window.Visualizer.animationId = null;
            }

            // DO NOT CLOSE AUDIO CONTEXT
            // This was breaking Android playback

            console.log("Visualizer animation paused (audio kept alive)");
        }

        if (document.visibilityState === "visible") {

            if (!audio.paused && window.Visualizer) {
                window.Visualizer.animate();
            }

            console.log("Visualizer resumed");
        }

    });

    // --------------------------------
    // 4️⃣ Ensure MediaSession remains active
    // --------------------------------

    if ('mediaSession' in navigator) {

        audio.addEventListener("play", () => {
            navigator.mediaSession.playbackState = "playing";
        });

        audio.addEventListener("pause", () => {
            navigator.mediaSession.playbackState = "paused";
        });

    }

})();
