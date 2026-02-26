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