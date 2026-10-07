document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       MOTIVATIONAL QUOTES
    ===================================================== */

    const quotes = [
        "Believe in yourself. Every small step counts.",
        "You don't have to have everything figured out today.",
        "Progress is progress, no matter how small.",
        "Take things one moment at a time.",
        "You are capable of handling more than you think.",
        "Rest is also part of progress.",
        "Be proud of how far you have come.",
        "Your feelings matter, but they do not define your future.",
        "A difficult day does not mean a difficult life.",
        "Give yourself the same kindness you give others."
    ];

    const quoteElement = document.getElementById("quote");
    const quoteButton = document.getElementById("newQuote");

    if (quoteButton && quoteElement) {

        quoteButton.addEventListener("click", function () {

            let randomIndex =
                Math.floor(Math.random() * quotes.length);

            quoteElement.textContent =
                quotes[randomIndex];

        });

    }


    /* =====================================================
       MUSIC PLAYER
    ===================================================== */

    const musicButton =
        document.getElementById("musicButton");

    const musicSelect =
        document.getElementById("musicSelect");

    const musicAudio =
        document.getElementById("musicAudio");


    if (musicButton && musicSelect && musicAudio) {

        musicButton.addEventListener("click", function () {

            const selectedMusic =
                musicSelect.value;


            if (!selectedMusic) {

                alert("Please select music first.");

                return;

            }


            /* Stop relaxing sound if playing */

            if (soundAudio) {

                soundAudio.pause();

                soundAudio.currentTime = 0;

                if (soundButton) {
                    soundButton.innerHTML =
                        '<i class="fa-solid fa-play"></i> Play Sound';
                }

            }


            /* If new music selected */

            if (!musicAudio.src.includes(selectedMusic)) {

                musicAudio.src = selectedMusic;

                musicAudio.play();

                musicButton.innerHTML =
                    '<i class="fa-solid fa-pause"></i> Pause Music';

                return;

            }


            /* Play / Pause */

            if (musicAudio.paused) {

                musicAudio.play();

                musicButton.innerHTML =
                    '<i class="fa-solid fa-pause"></i> Pause Music';

            }

            else {

                musicAudio.pause();

                musicButton.innerHTML =
                    '<i class="fa-solid fa-play"></i> Play Music';

            }

        });

    }


    /* =====================================================
       RELAXING SOUND PLAYER
    ===================================================== */

    const soundButton =
        document.getElementById("soundButton");

    const soundSelect =
        document.getElementById("soundSelect");

    const soundAudio =
        document.getElementById("soundAudio");


    if (soundButton && soundSelect && soundAudio) {

        soundButton.addEventListener("click", function () {

            const selectedSound =
                soundSelect.value;


            if (!selectedSound) {

                alert("Please select a relaxing sound first.");

                return;

            }


            /* Stop music if playing */

            if (musicAudio) {

                musicAudio.pause();

                musicAudio.currentTime = 0;

                if (musicButton) {
                    musicButton.innerHTML =
                        '<i class="fa-solid fa-play"></i> Play Music';
                }

            }


            /* If new sound selected */

            if (!soundAudio.src.includes(selectedSound)) {

                soundAudio.src = selectedSound;

                soundAudio.loop = true;

                soundAudio.play();

                soundButton.innerHTML =
                    '<i class="fa-solid fa-pause"></i> Pause Sound';

                return;

            }


            /* Play / Pause */

            if (soundAudio.paused) {

                soundAudio.play();

                soundButton.innerHTML =
                    '<i class="fa-solid fa-pause"></i> Pause Sound';

            }

            else {

                soundAudio.pause();

                soundButton.innerHTML =
                    '<i class="fa-solid fa-play"></i> Play Sound';

            }

        });

    }


    /* =====================================================
       WELLNESS ACTIVITY
    ===================================================== */

    const activitySelect =
        document.getElementById("activitySelect");

    const activityButton =
        document.getElementById("activityButton");

    const activityMessage =
        document.getElementById("activityMessage");


    const activities = {

        meditation: {
            title: "🧘 Meditation",
            message:
                "Sit comfortably. Close your eyes and take slow breaths for 2 minutes. Focus only on your breathing."
        },

        walking: {
            title: "🚶 Walking",
            message:
                "Take a gentle 10-minute walk. Notice your surroundings and allow your mind to relax."
        },

        journaling: {
            title: "📖 Journaling",
            message:
                "Write down three things you are feeling right now and one thing you are grateful for."
        },

        stretching: {
            title: "🤸 Stretching",
            message:
                "Relax your shoulders, stretch your arms and gently move your neck. Continue for 3–5 minutes."
        },

        yoga: {
            title: "🌿 Yoga",
            message:
                "Find a comfortable space and practice gentle breathing and simple stretches for 5 minutes."
        }

    };


    if (activityButton && activitySelect) {

        activityButton.addEventListener("click", function () {

            const selectedActivity =
                activitySelect.value;


            if (!selectedActivity) {

                alert("Please select an activity.");

                return;

            }


            const activity =
                activities[selectedActivity];


            activityMessage.innerHTML = `

                <div class="activity-result">

                    <h3>
                        ${activity.title}
                    </h3>

                    <p>
                        ${activity.message}
                    </p>

                </div>

            `;

        });

    }


    /* =====================================================
       GENTLE STRETCHING INTERACTIVE TIMER
    ===================================================== */
    const stretchModal = document.getElementById("stretchTimerModal");
    const stretchModalOverlay = document.getElementById("stretchModalOverlay");
    const timerCloseBtn = document.getElementById("timerCloseBtn");
    const timerIcon = document.getElementById("timerIcon");
    const timerActivityTitle = document.getElementById("timerActivityTitle");
    const timerActivityDesc = document.getElementById("timerActivityDesc");
    const timerRemainingTime = document.getElementById("timerRemainingTime");
    const timerStatusLabel = document.getElementById("timerStatusLabel");
    const timerProgressRing = document.getElementById("timerProgressRing");
    const stretchCompletionMessage = document.getElementById("stretchCompletionMessage");
    const timerStartBtn = document.getElementById("timerStartBtn");
    const timerStartBtnText = document.getElementById("timerStartBtnText");
    const timerStartIcon = document.getElementById("timerStartIcon");
    const timerPauseBtn = document.getElementById("timerPauseBtn");
    const timerResetBtn = document.getElementById("timerResetBtn");
    const stretchCards = document.querySelectorAll(".stretch-card");

    // Circumference for r=92: 2 * PI * 92 ~= 578.053
    const RING_RADIUS = 92;
    const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

    if (timerProgressRing) {
        timerProgressRing.style.strokeDasharray = `${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`;
        timerProgressRing.style.strokeDashoffset = "0";
    }

    let totalDurationSeconds = 30;
    let remainingSeconds = 30;
    let timerInterval = null;
    let timerState = "ready"; // "ready", "running", "paused", "completed"

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    function setRingProgress(remaining, total) {
        if (!timerProgressRing || total <= 0) return;
        const fraction = Math.max(0, Math.min(1, remaining / total));
        // Remaining time fraction: full ring at 1 (offset 0), empty ring at 0 (offset = circumference)
        const offset = RING_CIRCUMFERENCE * (1 - fraction);
        timerProgressRing.style.strokeDashoffset = offset;
    }

    function playCompletionChime() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const chords = [523.25, 659.25, 783.99]; // Gentle C-E-G chime
            const startTime = ctx.currentTime;

            chords.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, startTime + idx * 0.12);

                gain.gain.setValueAtTime(0.0001, startTime + idx * 0.12);
                gain.gain.linearRampToValueAtTime(0.18, startTime + idx * 0.12 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + idx * 0.12 + 1.8);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime + idx * 0.12);
                osc.stop(startTime + idx * 0.12 + 1.85);
            });
        } catch (err) {
            console.warn("Could not play completion chime:", err);
        }
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function resetTimer() {
        stopTimer();
        timerState = "ready";
        remainingSeconds = totalDurationSeconds;

        if (timerRemainingTime) {
            timerRemainingTime.textContent = formatTime(remainingSeconds);
        }
        if (timerStatusLabel) {
            timerStatusLabel.textContent = "Ready to begin";
        }
        if (stretchCompletionMessage) {
            stretchCompletionMessage.style.display = "none";
        }
        setRingProgress(remainingSeconds, totalDurationSeconds);

        if (timerStartBtnText) timerStartBtnText.textContent = "Start";
        if (timerStartIcon) timerStartIcon.className = "fa-solid fa-play";
        if (timerStartBtn) timerStartBtn.disabled = false;
        if (timerPauseBtn) timerPauseBtn.disabled = true;
    }

    function startTimer() {
        if (timerState === "completed") {
            remainingSeconds = totalDurationSeconds;
            if (stretchCompletionMessage) {
                stretchCompletionMessage.style.display = "none";
            }
        }

        stopTimer(); // Ensure only one timer runs at any time
        timerState = "running";

        if (timerStartBtnText) timerStartBtnText.textContent = "Running";
        if (timerStartIcon) timerStartIcon.className = "fa-solid fa-play";
        if (timerStartBtn) timerStartBtn.disabled = true;
        if (timerPauseBtn) timerPauseBtn.disabled = false;
        if (timerStatusLabel) timerStatusLabel.textContent = "In progress";
        if (stretchCompletionMessage) stretchCompletionMessage.style.display = "none";

        setRingProgress(remainingSeconds, totalDurationSeconds);

        timerInterval = setInterval(() => {
            remainingSeconds--;

            if (remainingSeconds < 0) {
                remainingSeconds = 0;
            }

            if (timerRemainingTime) {
                timerRemainingTime.textContent = formatTime(remainingSeconds);
            }
            setRingProgress(remainingSeconds, totalDurationSeconds);

            if (remainingSeconds <= 0) {
                stopTimer();
                timerState = "completed";

                if (timerStatusLabel) timerStatusLabel.textContent = "Completed";
                if (timerStartBtnText) timerStartBtnText.textContent = "Restart";
                if (timerStartIcon) timerStartIcon.className = "fa-solid fa-rotate-right";
                if (timerStartBtn) timerStartBtn.disabled = false;
                if (timerPauseBtn) timerPauseBtn.disabled = true;

                if (stretchCompletionMessage) {
                    stretchCompletionMessage.style.display = "block";
                }

                playCompletionChime();
            }
        }, 1000);
    }

    function pauseTimer() {
        if (timerState !== "running") return;

        stopTimer();
        timerState = "paused";

        if (timerStatusLabel) timerStatusLabel.textContent = "Paused";
        if (timerStartBtnText) timerStartBtnText.textContent = "Resume";
        if (timerStartIcon) timerStartIcon.className = "fa-solid fa-play";
        if (timerStartBtn) timerStartBtn.disabled = false;
        if (timerPauseBtn) timerPauseBtn.disabled = true;
    }

    function openModalForActivity(card) {
        const title = card.getAttribute("data-title") || "Gentle Stretch";
        const duration = parseInt(card.getAttribute("data-duration"), 10) || 30;
        const iconClass = card.getAttribute("data-icon") || "fa-solid fa-spa";
        const desc = card.getAttribute("data-desc") || "";

        totalDurationSeconds = duration;
        remainingSeconds = duration;

        if (timerActivityTitle) timerActivityTitle.textContent = title;
        if (timerActivityDesc) timerActivityDesc.textContent = desc;
        if (timerIcon) timerIcon.className = iconClass;

        resetTimer();

        if (stretchModal) {
            stretchModal.classList.add("show");
            stretchModal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open");
        }
    }

    function closeModal() {
        stopTimer();
        resetTimer();
        if (stretchModal) {
            stretchModal.classList.remove("show");
            stretchModal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("modal-open");
        }
    }

    // Attach click listeners to cards
    stretchCards.forEach((card) => {
        card.addEventListener("click", () => {
            openModalForActivity(card);
        });
    });

    if (timerStartBtn) {
        timerStartBtn.addEventListener("click", () => {
            if (timerState === "ready" || timerState === "paused" || timerState === "completed") {
                startTimer();
            }
        });
    }

    if (timerPauseBtn) {
        timerPauseBtn.addEventListener("click", () => {
            pauseTimer();
        });
    }

    if (timerResetBtn) {
        timerResetBtn.addEventListener("click", () => {
            resetTimer();
        });
    }

    if (timerCloseBtn) {
        timerCloseBtn.addEventListener("click", () => {
            closeModal();
        });
    }

    if (stretchModalOverlay) {
        stretchModalOverlay.addEventListener("click", () => {
            closeModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && stretchModal && stretchModal.classList.contains("show")) {
            closeModal();
        }
    });

});