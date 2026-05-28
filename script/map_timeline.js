(function() {
    const years = ["2023", "2024", "2025", "2026"];
    let currentYearIndex = 3; 
    let playing = false;
    let timer;

    const playBtn = d3.select("#play-btn");
    const slider = d3.select("#year-slider");

    // Playback step function
    function step() {
        currentYearIndex++;
        
        // Infinite Loop Logic
        if (currentYearIndex >= years.length) {
            currentYearIndex = 0;
        }
        
        const year = years[currentYearIndex];
        slider.property("value", year); // Update slider UI
        
        // 1. Notify Map to update ONLY
        if (window.GlobalMapApp) {
            window.GlobalMapApp.updateMap(year);
        }        
    }

    function stopPlayback() {
        playing = false;
        playBtn.text("▶ Play").style("background", "#dc3545"); 
        clearInterval(timer); 
    }

    function startPlayback() {
        playing = true;
        playBtn.text("⏸ Pause").style("background", "#333"); 
        
        timer = setInterval(step, 1800); 
        step(); 
    }

    playBtn.on("click", () => {
        if (playing) {
            stopPlayback();
        } else {
            startPlayback();
        }
    });

    slider.on("input", function() {
        if (playing) {
            stopPlayback(); 
        }
        const selectedYear = this.value;
        currentYearIndex = years.indexOf(selectedYear);
        
        // Sync Map ONLY
        if (window.GlobalMapApp) {
            window.GlobalMapApp.updateMap(selectedYear);
        }
    });

    // --- AUTO-PLAY ON LOAD ---
    setTimeout(() => {
        startPlayback();
    }, 500); 

    // === NEW: Expose a global pause API for cross-component interruption ===
    window.MapTimelineApp = {
        pause: function() {
            if (playing) stopPlayback();
        }
    };
})();