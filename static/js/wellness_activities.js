/* =========================================
   COMPANIO - WELLNESS ACTIVITIES
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =========================================
       DOM ELEMENTS
       ========================================= */

    const activityCards =
        document.querySelectorAll(".activity-card");

    const workspace =
        document.getElementById("activityWorkspace");

    const workspaceTitle =
        document.getElementById("workspaceTitle");

    const activityContent =
        document.getElementById("activityContent");

    const closeWorkspace =
        document.getElementById("closeWorkspace");


    let activeInterval = null;


    /* =========================================
       ACTIVITY DATA
       ========================================= */

    const activityTitles = {

        breathing:
            "Breathing Exercise",

        meditation:
            "Mini Meditation",

        grounding:
            "5-4-3-2-1 Grounding",

        journaling:
            "Gentle Journaling",

        relaxation:
            "Relaxation Moment"

    };


    /* =========================================
       OPEN ACTIVITY
       ========================================= */

    activityCards.forEach(card => {

        card.addEventListener("click", () => {

            const activity =
                card.dataset.activity;


            stopActiveTimer();
            stopHeartbeat();


            workspaceTitle.textContent =
                activityTitles[activity];


            workspace.classList.add("show");


            renderActivity(
                activity
            );


            setTimeout(() => {

                workspace.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 100);

        });

    });


    /* =========================================
       CLOSE WORKSPACE
       ========================================= */

    closeWorkspace.addEventListener(
        "click",
        () => {

            stopActiveTimer();
            stopHeartbeat();

            workspace.classList.remove(
                "show"
            );

        }
    );


    /* =========================================
       RENDER ACTIVITY
       ========================================= */

    function renderActivity(
        activity
    ) {

        if (activity === "breathing") {

            renderBreathing();

        }

        else if (
            activity === "meditation"
        ) {

            renderMeditation();

        }

        else if (
            activity === "grounding"
        ) {

            renderGrounding();

        }

        else if (
            activity === "journaling"
        ) {

            renderJournaling();

        }

        else if (
            activity === "relaxation"
        ) {

            renderRelaxation();

        }

    }


    /* =========================================
       HEARTBEAT AUDIO MANAGEMENT (Web Audio API)
       ========================================= */

    const heartbeatAudio = new Audio("/static/audio/heartbeat.mp3");
    heartbeatAudio.loop = true;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(heartbeatAudio);
    const gainNode = audioContext.createGain();

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Amplify volume
    gainNode.gain.value = 2.5;

    function playHeartbeat() {
        try {
            if (audioContext && typeof audioContext.resume === "function") {
                audioContext.resume();
            }
            const playPromise = heartbeatAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    console.log("Heartbeat audio note:", err.message);
                });
            }
        } catch (e) {
            console.log("Heartbeat audio error:", e);
        }
    }

    function pauseHeartbeat() {
        try {
            heartbeatAudio.pause();
        } catch (e) {}
    }

    function stopHeartbeat() {
        try {
            heartbeatAudio.pause();
            heartbeatAudio.currentTime = 0;
        } catch (e) {}
    }


    /* =========================================
       BREATHING
       ========================================= */

    const BREATHING_TOTAL_SECONDS = 120; // 02:00 duration
    let breathingRemainingSeconds = BREATHING_TOTAL_SECONDS;
    let breathingPhase = "inhale";
    let breathingPhaseTimer = 4;
    let breathingState = "ready"; // "ready", "running", "paused", "completed"

    function formatBreathingTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    function renderBreathing() {
        stopActiveTimer();
        stopHeartbeat();
        breathingState = "ready";
        breathingRemainingSeconds = BREATHING_TOTAL_SECONDS;
        breathingPhase = "inhale";
        breathingPhaseTimer = 4;

        activityContent.innerHTML = `
            <div class="breathing-content">

                <div class="breathing-circle" id="breathingCircle">
                    <span id="breathingText">Ready</span>
                </div>

                <p class="breathing-instruction" id="breathingInstruction">
                    Follow the circle and breathe slowly.
                </p>

                <div class="timer-display breathing-timer-digits" id="breathingTimer">
                    02:00
                </div>

                <div class="breathing-controls">
                    <button class="breathing-btn breathing-btn-start" id="startBreathing" type="button">
                        <i class="fa-solid fa-play" id="startBreathingIcon"></i>
                        <span id="startBreathingText">Start</span>
                    </button>

                    <button class="breathing-btn breathing-btn-pause" id="pauseBreathing" type="button" disabled>
                        <i class="fa-solid fa-pause"></i>
                        <span>Pause</span>
                    </button>

                    <button class="breathing-btn breathing-btn-reset" id="resetBreathing" type="button">
                        <i class="fa-solid fa-rotate-right"></i>
                        <span>Reset</span>
                    </button>
                </div>

            </div>
        `;

        const startButton = document.getElementById("startBreathing");
        const pauseButton = document.getElementById("pauseBreathing");
        const resetButton = document.getElementById("resetBreathing");

        if (startButton) {
            startButton.addEventListener("click", () => {
                if (breathingState === "ready" || breathingState === "paused" || breathingState === "completed") {
                    startBreathingExercise();
                }
            });
        }

        if (pauseButton) {
            pauseButton.addEventListener("click", () => {
                pauseBreathingExercise();
            });
        }

        if (resetButton) {
            resetButton.addEventListener("click", () => {
                resetBreathingExercise();
            });
        }

        setupCompletionModal();
    }

    function setupCompletionModal() {
        const doneBtn = document.getElementById("breathingDoneBtn");
        const overlay = document.getElementById("breathingModalOverlay");
        const modal = document.getElementById("breathingCompleteModal");

        if (doneBtn && !doneBtn.dataset.listenerAttached) {
            doneBtn.dataset.listenerAttached = "true";
            doneBtn.addEventListener("click", () => {
                if (modal) {
                    modal.classList.remove("show");
                    modal.setAttribute("aria-hidden", "true");
                }
                resetBreathingExercise();
            });
        }

        if (overlay && !overlay.dataset.listenerAttached) {
            overlay.dataset.listenerAttached = "true";
            overlay.addEventListener("click", () => {
                if (modal) {
                    modal.classList.remove("show");
                    modal.setAttribute("aria-hidden", "true");
                }
                resetBreathingExercise();
            });
        }
    }

    function resetBreathingExercise() {
        stopActiveTimer();
        heartbeatAudio.pause();
        heartbeatAudio.currentTime = 0;
        breathingState = "ready";
        breathingRemainingSeconds = BREATHING_TOTAL_SECONDS;
        breathingPhase = "inhale";
        breathingPhaseTimer = 4;

        const circle = document.getElementById("breathingCircle");
        const breathingText = document.getElementById("breathingText");
        const instruction = document.getElementById("breathingInstruction");
        const timer = document.getElementById("breathingTimer");
        const startBtn = document.getElementById("startBreathing");
        const startBtnText = document.getElementById("startBreathingText");
        const startBtnIcon = document.getElementById("startBreathingIcon");
        const pauseBtn = document.getElementById("pauseBreathing");
        const completionModal = document.getElementById("breathingCompleteModal");

        if (completionModal) {
            completionModal.classList.remove("show");
            completionModal.setAttribute("aria-hidden", "true");
        }

        if (circle) {
            circle.classList.remove("inhale", "exhale", "paused");
            circle.style.transform = "";
        }
        if (breathingText) breathingText.textContent = "Ready";
        if (instruction) instruction.textContent = "Follow the circle and breathe slowly.";
        if (timer) timer.textContent = formatBreathingTime(breathingRemainingSeconds);

        if (startBtn) {
            startBtn.disabled = false;
            if (startBtnText) startBtnText.textContent = "Start";
            if (startBtnIcon) startBtnIcon.className = "fa-solid fa-play";
        }
        if (pauseBtn) pauseBtn.disabled = true;
    }

    function pauseBreathingExercise() {
        if (breathingState !== "running") return;

        stopActiveTimer();
        heartbeatAudio.pause();
        breathingState = "paused";

        const circle = document.getElementById("breathingCircle");
        const instruction = document.getElementById("breathingInstruction");
        const startBtn = document.getElementById("startBreathing");
        const startBtnText = document.getElementById("startBreathingText");
        const startBtnIcon = document.getElementById("startBreathingIcon");
        const pauseBtn = document.getElementById("pauseBreathing");

        if (circle) {
            const currentTransform = window.getComputedStyle(circle).transform;
            circle.style.transform = currentTransform;
            circle.classList.add("paused");
        }
        if (instruction) instruction.textContent = "Paused. Click Resume when you're ready.";

        if (startBtn) {
            startBtn.disabled = false;
            if (startBtnText) startBtnText.textContent = "Resume";
            if (startBtnIcon) startBtnIcon.className = "fa-solid fa-play";
        }
        if (pauseBtn) pauseBtn.disabled = true;
    }

    function startBreathingExercise() {
        if (breathingState === "completed") {
            resetBreathingExercise();
        }

        const circle = document.getElementById("breathingCircle");
        const breathingText = document.getElementById("breathingText");
        const instruction = document.getElementById("breathingInstruction");
        const timer = document.getElementById("breathingTimer");
        const startBtn = document.getElementById("startBreathing");
        const startBtnText = document.getElementById("startBreathingText");
        const startBtnIcon = document.getElementById("startBreathingIcon");
        const pauseBtn = document.getElementById("pauseBreathing");
        const completionModal = document.getElementById("breathingCompleteModal");

        if (completionModal) {
            completionModal.classList.remove("show");
            completionModal.setAttribute("aria-hidden", "true");
        }

        stopActiveTimer(); // Ensure only one timer runs at any time

        // Resume AudioContext
        if (audioContext && typeof audioContext.resume === "function") {
            audioContext.resume();
        }

        // Start button: Reset currentTime = 0, Play heartbeat
        if (breathingState !== "paused") {
            heartbeatAudio.currentTime = 0;
        }

        breathingState = "running";

        if (startBtn) {
            startBtn.disabled = true;
            if (startBtnText) startBtnText.textContent = "Breathing...";
            if (startBtnIcon) startBtnIcon.className = "fa-solid fa-wind";
        }
        if (pauseBtn) pauseBtn.disabled = false;

        heartbeatAudio.play().catch((err) => {
            console.log("Heartbeat playback note:", err.message);
        });

        function updatePhase() {
            if (!circle || !breathingText || !instruction) return;
            if (breathingPhase === "inhale") {
                circle.classList.remove("exhale", "paused");
                circle.classList.add("inhale");
                breathingText.textContent = "Breathe In";
                instruction.textContent = "Slowly breathe in through your nose.";
                breathingPhaseTimer = 4;
            } else {
                circle.classList.remove("inhale", "paused");
                circle.classList.add("exhale");
                breathingText.textContent = "Breathe Out";
                instruction.textContent = "Gently breathe out and relax.";
                breathingPhaseTimer = 6;
            }
        }

        if (circle) {
            circle.style.transform = "";
            circle.classList.remove("paused");
        }

        updatePhase();

        activeInterval = setInterval(() => {
            breathingRemainingSeconds--;
            breathingPhaseTimer--;

            if (timer) {
                timer.textContent = formatBreathingTime(breathingRemainingSeconds);
            }

            if (breathingRemainingSeconds <= 0) {
                stopActiveTimer();
                // When timer finishes: Pause audio, Reset currentTime, Show completion popup
                heartbeatAudio.pause();
                heartbeatAudio.currentTime = 0;
                breathingState = "completed";

                if (circle) {
                    circle.classList.remove("inhale", "exhale", "paused");
                    circle.style.transform = "";
                }
                if (breathingText) breathingText.textContent = "Well done 🌸";
                if (instruction) instruction.textContent = "Take a moment and notice how you feel.";

                if (startBtn) {
                    startBtn.disabled = false;
                    if (startBtnText) startBtnText.textContent = "Start Again";
                    if (startBtnIcon) startBtnIcon.className = "fa-solid fa-rotate-right";
                }
                if (pauseBtn) pauseBtn.disabled = true;

                // Show glass completion popup
                if (completionModal) {
                    completionModal.classList.add("show");
                    completionModal.setAttribute("aria-hidden", "false");
                }
                return;
            }

            if (breathingPhaseTimer <= 0) {
                breathingPhase = breathingPhase === "inhale" ? "exhale" : "inhale";
                updatePhase();
            }
        }, 1000);
    }


    /* =========================================
       MEDITATION
       ========================================= */

    function renderMeditation() {

        activityContent.innerHTML = `

            <div class="meditation-content">

                <div class="meditation-visual">
                    🧘‍♀️
                </div>


                <h3>
                    Three minutes for yourself
                </h3>


                <p>
                    Sit comfortably. Let your shoulders soften.
                    Close your eyes if that feels comfortable.
                    Notice your breathing without trying to change it.
                    When your mind wanders, gently bring your attention
                    back to your breath.
                </p>


                <div
                    class="timer-display"
                    id="meditationTimer"
                >
                    03:00
                </div>


                <button
                    class="start-activity-btn"
                    id="startMeditation"
                >

                    <i class="fa-solid fa-play"></i>

                    Begin Meditation

                </button>

            </div>

        `;


        const button =
            document.getElementById(
                "startMeditation"
            );


        button.addEventListener(
            "click",
            startMeditation
        );

    }


    function startMeditation() {

        const timer =
            document.getElementById(
                "meditationTimer"
            );

        const button =
            document.getElementById(
                "startMeditation"
            );


        let seconds = 180;


        button.disabled = true;

        button.innerHTML = `
            <i class="fa-solid fa-spa"></i>
            Meditating...
        `;


        activeInterval =
            setInterval(() => {

                seconds--;


                const minutes =
                    Math.floor(
                        seconds / 60
                    );

                const remaining =
                    seconds % 60;


                timer.textContent =
                    `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;


                if (seconds <= 0) {

                    clearInterval(
                        activeInterval
                    );

                    activeInterval =
                        null;


                    timer.textContent =
                        "Done ✨";


                    button.disabled =
                        false;


                    button.innerHTML = `
                        <i class="fa-solid fa-rotate-right"></i>
                        Meditate Again
                    `;

                }

            }, 1000);

    }


    /* =========================================
       GROUNDING
       ========================================= */

    function renderGrounding() {

        activityContent.innerHTML = `

            <div class="grounding-content">

                <p class="grounding-intro">

                    Look around you slowly.
                    Use your senses to connect with the present moment.

                </p>


                <div class="grounding-step">

                    <div class="grounding-number">
                        5
                    </div>

                    <div>

                        <strong>
                            See
                        </strong>

                        <span>
                            Notice 5 things you can see.
                        </span>

                    </div>

                </div>


                <div class="grounding-step">

                    <div class="grounding-number">
                        4
                    </div>

                    <div>

                        <strong>
                            Touch
                        </strong>

                        <span>
                            Notice 4 things you can physically feel.
                        </span>

                    </div>

                </div>


                <div class="grounding-step">

                    <div class="grounding-number">
                        3
                    </div>

                    <div>

                        <strong>
                            Hear
                        </strong>

                        <span>
                            Notice 3 sounds around you.
                        </span>

                    </div>

                </div>


                <div class="grounding-step">

                    <div class="grounding-number">
                        2
                    </div>

                    <div>

                        <strong>
                            Smell
                        </strong>

                        <span>
                            Notice 2 scents around you.
                        </span>

                    </div>

                </div>


                <div class="grounding-step">

                    <div class="grounding-number">
                        1
                    </div>

                    <div>

                        <strong>
                            Taste
                        </strong>

                        <span>
                            Notice 1 taste in your mouth.
                        </span>

                    </div>

                </div>

            </div>

        `;

    }


    /* =========================================
       JOURNALING
       ========================================= */

    function renderJournaling() {

        activityContent.innerHTML = `

            <div class="journal-content">

                <div class="journal-prompt">

                    <i class="fa-solid fa-lightbulb"></i>

                    <strong>
                        Today's prompt:
                    </strong>

                    What is one thing you would like
                    to give yourself more of today?

                </div>


                <textarea
                    class="journal-textarea"
                    id="journalText"
                    placeholder="Write whatever comes to mind..."
                ></textarea>


                <div class="journal-actions">

                    <button
                        class="start-activity-btn"
                        id="clearJournal"
                    >

                        Clear

                    </button>

                </div>


                <p
                    class="journal-message"
                    id="journalMessage"
                ></p>

            </div>

        `;


        const textarea =
            document.getElementById(
                "journalText"
            );

        const clearButton =
            document.getElementById(
                "clearJournal"
            );

        const message =
            document.getElementById(
                "journalMessage"
            );


        clearButton.addEventListener(
            "click",
            () => {

                textarea.value = "";

                message.textContent =
                    "Your journal space is clear.";

            }
        );

    }


    /* =========================================
       RELAXATION
       ========================================= */

    function renderRelaxation() {

        activityContent.innerHTML = `

            <div class="relaxation-content">

                <div class="relaxation-moon">
                    🌙
                </div>


                <h3>
                    Five quiet minutes
                </h3>


                <p>
                    Put your phone aside for a moment.
                    Relax your shoulders.
                    Take a slow breath.
                    Notice the space around you.
                    You don't need to accomplish anything
                    during these few minutes.
                </p>


                <div
                    class="timer-display"
                    id="relaxationTimer"
                >
                    05:00
                </div>


                <button
                    class="start-activity-btn"
                    id="startRelaxation"
                >

                    <i class="fa-solid fa-play"></i>

                    Start Relaxation

                </button>

            </div>

        `;


        const button =
            document.getElementById(
                "startRelaxation"
            );


        button.addEventListener(
            "click",
            startRelaxation
        );

    }


    function startRelaxation() {

        const timer =
            document.getElementById(
                "relaxationTimer"
            );

        const button =
            document.getElementById(
                "startRelaxation"
            );


        let seconds = 300;


        button.disabled = true;

        button.innerHTML = `
            <i class="fa-solid fa-moon"></i>
            Relaxing...
        `;


        activeInterval =
            setInterval(() => {

                seconds--;


                const minutes =
                    Math.floor(
                        seconds / 60
                    );

                const remaining =
                    seconds % 60;


                timer.textContent =
                    `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;


                if (seconds <= 0) {

                    clearInterval(
                        activeInterval
                    );

                    activeInterval =
                        null;


                    timer.textContent =
                        "Complete 🌿";


                    button.disabled =
                        false;


                    button.innerHTML = `
                        <i class="fa-solid fa-rotate-right"></i>
                        Relax Again
                    `;

                }

            }, 1000);

    }


    /* =========================================
       STOP TIMER & CLEANUP
       ========================================= */

    function stopActiveTimer() {

        if (activeInterval) {

            clearInterval(
                activeInterval
            );

            activeInterval =
                null;

        }

    }

    window.addEventListener("beforeunload", () => {
        stopActiveTimer();
        stopHeartbeat();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modal = document.getElementById("breathingCompleteModal");
            if (modal && modal.classList.contains("show")) {
                modal.classList.remove("show");
                modal.setAttribute("aria-hidden", "true");
                resetBreathingExercise();
            }
        }
    });

});