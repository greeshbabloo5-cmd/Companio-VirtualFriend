/* =========================================
   COMPANIO - RELAXING SOUNDS
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const moodButtons = document.querySelectorAll(".mood-btn");

    const soundsGrid = document.getElementById("soundsGrid");

    const recommendationTitle =
        document.getElementById("recommendationTitle");

    const recommendationSubtitle =
        document.getElementById("recommendationSubtitle");

    const nowPlaying =
        document.getElementById("nowPlaying");

    const nowPlayingTitle =
        document.getElementById("nowPlayingTitle");

    const stopSoundBtn =
        document.getElementById("stopSoundBtn");


    /* =========================================
       AUDIO VARIABLES
       ========================================= */

    let selectedMood = null;

    let activeButton = null;

    let audioContext = null;

    let masterGain = null;

    let activeNodes = [];

    let isPlaying = false;

    /* Default volume = 75% */
    let masterVolume = 0.75;


    /* =========================================
       SOUND DATABASE
       ========================================= */

    const sounds = [

        {
            id: "rain",
            name: "Gentle Rain",
            icon: "🌧️",
            type: "rain",
            description:
                "Soft rainfall to create a peaceful atmosphere.",
            duration: "∞",
            moods: ["calm", "stressed", "sad", "tired"]
        },

        {
            id: "ocean",
            name: "Ocean Waves",
            icon: "🌊",
            type: "ocean",
            description:
                "Slow waves to help your mind settle down.",
            duration: "∞",
            moods: ["calm", "stressed", "sad", "tired"]
        },

        {
            id: "forest",
            name: "Forest Ambience",
            icon: "🌲",
            type: "forest",
            description:
                "A peaceful forest atmosphere with natural sounds.",
            duration: "∞",
            moods: ["calm", "happy", "stressed", "tired"]
        },

        {
            id: "piano",
            name: "Soft Piano",
            icon: "🎹",
            type: "piano",
            description:
                "Gentle piano tones for quiet moments.",
            duration: "∞",
            moods: ["sad", "calm", "tired"]
        },

        {
            id: "fireplace",
            name: "Cozy Fireplace",
            icon: "🔥",
            type: "fireplace",
            description:
                "Warm crackling ambience for a cozy feeling.",
            duration: "∞",
            moods: ["calm", "sad", "tired"]
        },

        {
            id: "wind",
            name: "Gentle Wind",
            icon: "🍃",
            type: "wind",
            description:
                "Soft flowing wind for a relaxed environment.",
            duration: "∞",
            moods: ["stressed", "calm", "tired"]
        },

        {
            id: "night",
            name: "Peaceful Night",
            icon: "🌙",
            type: "night",
            description:
                "Quiet nighttime ambience for slowing down.",
            duration: "∞",
            moods: ["tired", "sad", "calm"]
        },

        {
            id: "birds",
            name: "Morning Birds",
            icon: "🐦",
            type: "birds",
            description:
                "Cheerful birdsong to create a refreshing mood.",
            duration: "∞",
            moods: ["happy", "energetic", "calm"]
        },

        {
            id: "water",
            name: "Flowing Water",
            icon: "💧",
            type: "water",
            description:
                "Gentle flowing water for peaceful focus.",
            duration: "∞",
            moods: ["calm", "happy", "stressed"]
        }

    ];


    /* =========================================
       MOOD INFORMATION
       ========================================= */

    const moodData = {

        happy: {
            title: "Sounds for your happy mood 😊",
            subtitle:
                "Keep the positive energy flowing with refreshing natural sounds."
        },

        sad: {
            title: "Sounds for a gentle moment 💙",
            subtitle:
                "Take some time for yourself with soft and comforting sounds."
        },

        calm: {
            title: "Sounds to deepen your calm 😌",
            subtitle:
                "Stay in the peaceful moment with relaxing ambient sounds."
        },

        stressed: {
            title: "Sounds to help you unwind 🌿",
            subtitle:
                "Slow down, breathe, and give your mind some space."
        },

        energetic: {
            title: "Sounds for your energy ⚡",
            subtitle:
                "Refresh your mind with natural and uplifting ambience."
        },

        tired: {
            title: "Sounds for a peaceful rest 🌙",
            subtitle:
                "Create a quiet environment and allow yourself to slow down."
        }

    };


    /* =========================================
       ADD VOLUME CONTROL
       ========================================= */

    function createVolumeControl() {

        if (document.getElementById("soundVolumeControl")) {
            return;
        }

        const volumeContainer =
            document.createElement("div");

        volumeContainer.id =
            "soundVolumeControl";

        volumeContainer.innerHTML = `

            <div style="
                display:flex;
                align-items:center;
                gap:12px;
                width:100%;
                margin-top:20px;
                padding:15px 18px;
                background:rgba(255,255,255,0.9);
                border:1px solid #e8e6f2;
                border-radius:15px;
            ">

                <i
                    class="fa-solid fa-volume-high"
                    style="
                        color:#6d56d9;
                        font-size:16px;
                    "
                ></i>

                <span style="
                    font-size:13px;
                    font-weight:600;
                    color:#555;
                    white-space:nowrap;
                ">
                    Volume
                </span>

                <input
                    type="range"
                    id="soundVolumeSlider"
                    min="0"
                    max="100"
                    value="75"
                    style="
                        flex:1;
                        accent-color:#6d56d9;
                        cursor:pointer;
                    "
                >

                <span
                    id="soundVolumeValue"
                    style="
                        min-width:40px;
                        text-align:right;
                        font-size:12px;
                        color:#777;
                    "
                >
                    75%
                </span>

            </div>

        `;


        const recommendationSection =
            document.querySelector(
                ".recommendation-section"
            );


        if (recommendationSection) {

            recommendationSection.appendChild(
                volumeContainer
            );

        }


        const slider =
            document.getElementById(
                "soundVolumeSlider"
            );

        const volumeValue =
            document.getElementById(
                "soundVolumeValue"
            );


        slider.addEventListener(
            "input",
            () => {

                masterVolume =
                    Number(slider.value) / 100;


                volumeValue.textContent =
                    `${slider.value}%`;


                if (masterGain && audioContext) {

                    masterGain.gain.setTargetAtTime(
                        masterVolume,
                        audioContext.currentTime,
                        0.05
                    );

                }

            }
        );

    }


    /* =========================================
       MOOD BUTTON EVENTS
       ========================================= */

    moodButtons.forEach(button => {

        button.addEventListener("click", () => {

            moodButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            selectedMood =
                button.dataset.mood;

            recommendationTitle.textContent =
                moodData[selectedMood].title;

            recommendationSubtitle.textContent =
                moodData[selectedMood].subtitle;

            displaySounds();

        });

    });


    /* =========================================
       DISPLAY SOUNDS
       ========================================= */

    function displaySounds() {

        soundsGrid.innerHTML = "";

        let filteredSounds = sounds;


        if (selectedMood) {

            filteredSounds =
                sounds.filter(sound =>
                    sound.moods.includes(selectedMood)
                );

        }


        if (filteredSounds.length === 0) {

            soundsGrid.innerHTML = `

                <div class="empty-state">

                    <i class="fa-solid fa-headphones"></i>

                    <h3>No sounds found</h3>

                    <p>
                        Try selecting another mood.
                    </p>

                </div>

            `;

            return;
        }


        filteredSounds.forEach(sound => {

            const card =
                document.createElement("article");

            card.className =
                "sound-card";


            card.innerHTML = `

                <div class="sound-image ${sound.type}">
                    ${sound.icon}
                </div>

                <h3>${sound.name}</h3>

                <p>
                    ${sound.description}
                </p>

                <div class="sound-meta">

                    <span class="duration">
                        <i class="fa-regular fa-clock"></i>
                        ${sound.duration}
                    </span>

                    <span class="mood-tag">
                        Relaxing
                    </span>

                </div>

                <button
                    class="play-sound-btn"
                    data-sound="${sound.id}"
                >

                    <i class="fa-solid fa-play"></i>

                    Play Sound

                </button>

            `;


            const playButton =
                card.querySelector(
                    ".play-sound-btn"
                );


            playButton.addEventListener(
                "click",
                () => {

                    playSound(
                        sound,
                        playButton
                    );

                }
            );


            soundsGrid.appendChild(card);

        });

    }


    /* =========================================
       PLAY SOUND
       ========================================= */

    function playSound(sound, button) {

        stopCurrentSound();


        try {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();


            /*
             * Make sure browser audio is running.
             */

            if (
                audioContext.state ===
                "suspended"
            ) {

                audioContext.resume();

            }


            /*
             * MASTER VOLUME
             *
             * Increased from the old 8%
             * to a user-controlled 75%.
             */

            masterGain =
                audioContext.createGain();


            masterGain.gain.value =
                masterVolume;


            masterGain.connect(
                audioContext.destination
            );


            createSound(sound.id);


            isPlaying = true;

            activeButton = button;


            button.classList.add(
                "playing"
            );


            button.innerHTML = `
                <i class="fa-solid fa-pause"></i>
                Playing
            `;


            nowPlaying.classList.add(
                "show"
            );


            nowPlayingTitle.textContent =
                sound.name;

        }

        catch (error) {

            console.error(
                "Audio error:",
                error
            );


            alert(
                "Your browser could not start the relaxing sound."
            );

        }

    }


    /* =========================================
       CREATE AMBIENT SOUND
       ========================================= */

    function createSound(type) {

        if (!audioContext || !masterGain) {
            return;
        }


        /*
         * Each sound is now routed through
         * the louder master gain.
         */

        const gain =
            audioContext.createGain();


        gain.gain.value =
            0.90;


        gain.connect(
            masterGain
        );


        if (type === "rain") {

            createNoise(
                gain,
                0.55
            );

            createRainDrops(
                gain
            );

        }

        else if (type === "ocean") {

            createOcean(
                gain
            );

        }

        else if (type === "forest") {

            createNoise(
                gain,
                0.30
            );

            createBirdTone(
                gain
            );

        }

        else if (type === "piano") {

            createPiano(
                gain
            );

        }

        else if (type === "fireplace") {

            createNoise(
                gain,
                0.40
            );

            createCrackles(
                gain
            );

        }

        else if (type === "wind") {

            createNoise(
                gain,
                0.38
            );

        }

        else if (type === "night") {

            createNoise(
                gain,
                0.20
            );

            createNightTone(
                gain
            );

        }

        else if (type === "birds") {

            createBirdTone(
                gain
            );

            createBirdTone(
                gain
            );

        }

        else if (type === "water") {

            createWater(
                gain
            );

        }

    }


    /* =========================================
       WHITE NOISE
       ========================================= */

    function createNoise(
        gainNode,
        volume
    ) {

        const bufferSize =
            audioContext.sampleRate * 2;


        const buffer =
            audioContext.createBuffer(
                1,
                bufferSize,
                audioContext.sampleRate
            );


        const data =
            buffer.getChannelData(0);


        for (
            let i = 0;
            i < bufferSize;
            i++
        ) {

            data[i] =
                Math.random() * 2 - 1;

        }


        const source =
            audioContext.createBufferSource();


        source.buffer =
            buffer;


        source.loop =
            true;


        const filter =
            audioContext.createBiquadFilter();


        filter.type =
            "lowpass";


        filter.frequency.value =
            3200;


        const localGain =
            audioContext.createGain();


        localGain.gain.value =
            volume;


        source
            .connect(filter)
            .connect(localGain)
            .connect(gainNode);


        source.start();


        activeNodes.push(
            source
        );

    }


    /* =========================================
       RAIN DROPS
       ========================================= */

    function createRainDrops(
        gainNode
    ) {

        const interval =
            setInterval(() => {

                if (!audioContext) {
                    return;
                }


                const oscillator =
                    audioContext
                        .createOscillator();


                const gain =
                    audioContext
                        .createGain();


                oscillator.type =
                    "sine";


                oscillator.frequency.value =
                    900 +
                    Math.random() * 1600;


                gain.gain.setValueAtTime(
                    0.0001,
                    audioContext.currentTime
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.08,
                    audioContext.currentTime + 0.01
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.0001,
                    audioContext.currentTime + 0.18
                );


                oscillator
                    .connect(gain)
                    .connect(gainNode);


                oscillator.start();


                oscillator.stop(
                    audioContext.currentTime + 0.18
                );


            }, 90);


        activeNodes.push(
            interval
        );

    }


    /* =========================================
       OCEAN
       ========================================= */

    function createOcean(
        gainNode
    ) {

        const oscillator =
            audioContext.createOscillator();


        const gain =
            audioContext.createGain();


        oscillator.type =
            "sine";


        oscillator.frequency.value =
            0.15;


        gain.gain.value =
            0.35;


        oscillator
            .connect(gain)
            .connect(gainNode);


        oscillator.start();


        const wave =
            setInterval(() => {

                if (!audioContext) {
                    return;
                }


                const value =
                    0.25 +
                    Math.sin(
                        Date.now() / 1200
                    ) * 0.12;


                gain.gain.setTargetAtTime(
                    Math.max(
                        0.08,
                        value
                    ),
                    audioContext.currentTime,
                    0.5
                );


            }, 100);


        activeNodes.push(
            oscillator
        );

        activeNodes.push(
            wave
        );

    }


    /* =========================================
       PIANO
       ========================================= */

    function createPiano(
        gainNode
    ) {

        const notes = [
            261.63,
            329.63,
            392.00,
            523.25
        ];


        let index = 0;


        const playNote = () => {

            if (!audioContext) {
                return;
            }


            const oscillator =
                audioContext
                    .createOscillator();


            const gain =
                audioContext
                    .createGain();


            oscillator.type =
                "sine";


            oscillator.frequency.value =
                notes[
                    index % notes.length
                ];


            gain.gain.setValueAtTime(
                0.0001,
                audioContext.currentTime
            );


            gain.gain.exponentialRampToValueAtTime(
                0.16,
                audioContext.currentTime + 0.05
            );


            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                audioContext.currentTime + 2
            );


            oscillator
                .connect(gain)
                .connect(gainNode);


            oscillator.start();


            oscillator.stop(
                audioContext.currentTime + 2
            );


            index++;

        };


        playNote();


        const interval =
            setInterval(
                playNote,
                2200
            );


        activeNodes.push(
            interval
        );

    }


    /* =========================================
       FIREPLACE
       ========================================= */

    function createCrackles(
        gainNode
    ) {

        const interval =
            setInterval(() => {

                if (!audioContext) {
                    return;
                }


                const oscillator =
                    audioContext
                        .createOscillator();


                const gain =
                    audioContext
                        .createGain();


                oscillator.type =
                    "triangle";


                oscillator.frequency.value =
                    200 +
                    Math.random() * 500;


                gain.gain.setValueAtTime(
                    0.0001,
                    audioContext.currentTime
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.14,
                    audioContext.currentTime + 0.01
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.0001,
                    audioContext.currentTime + 0.08
                );


                oscillator
                    .connect(gain)
                    .connect(gainNode);


                oscillator.start();


                oscillator.stop(
                    audioContext.currentTime + 0.08
                );


            }, 400 + Math.random() * 600);


        activeNodes.push(
            interval
        );

    }


    /* =========================================
       BIRDS
       ========================================= */

    function createBirdTone(
        gainNode
    ) {

        const interval =
            setInterval(() => {

                if (!audioContext) {
                    return;
                }


                const oscillator =
                    audioContext
                        .createOscillator();


                const gain =
                    audioContext
                        .createGain();


                oscillator.type =
                    "sine";


                const startFrequency =
                    1200 +
                    Math.random() * 700;


                oscillator.frequency.setValueAtTime(
                    startFrequency,
                    audioContext.currentTime
                );


                oscillator.frequency.exponentialRampToValueAtTime(
                    startFrequency * 1.5,
                    audioContext.currentTime + 0.12
                );


                gain.gain.setValueAtTime(
                    0.0001,
                    audioContext.currentTime
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.10,
                    audioContext.currentTime + 0.02
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.0001,
                    audioContext.currentTime + 0.25
                );


                oscillator
                    .connect(gain)
                    .connect(gainNode);


                oscillator.start();


                oscillator.stop(
                    audioContext.currentTime + 0.25
                );


            }, 2200);


        activeNodes.push(
            interval
        );

    }


    /* =========================================
       NIGHT
       ========================================= */

    function createNightTone(
        gainNode
    ) {

        const oscillator =
            audioContext.createOscillator();


        const gain =
            audioContext.createGain();


        oscillator.type =
            "sine";


        oscillator.frequency.value =
            110;


        gain.gain.value =
            0.07;


        oscillator
            .connect(gain)
            .connect(gainNode);


        oscillator.start();


        activeNodes.push(
            oscillator
        );

    }


    /* =========================================
       FLOWING WATER
       ========================================= */

    function createWater(
        gainNode
    ) {

        createNoise(
            gainNode,
            0.32
        );


        const oscillator =
            audioContext.createOscillator();


        const gain =
            audioContext.createGain();


        oscillator.type =
            "sine";


        oscillator.frequency.value =
            350;


        gain.gain.value =
            0.05;


        oscillator
            .connect(gain)
            .connect(gainNode);


        oscillator.start();


        activeNodes.push(
            oscillator
        );

    }


    /* =========================================
       STOP CURRENT SOUND
       ========================================= */

    function stopCurrentSound() {

        activeNodes.forEach(
            node => {

                try {

                    if (
                        typeof node ===
                        "number"
                    ) {

                        clearInterval(
                            node
                        );

                    }

                    else if (
                        node &&
                        typeof node.stop ===
                        "function"
                    ) {

                        node.stop();

                    }

                }

                catch (error) {

                    console.log(
                        "Audio node already stopped."
                    );

                }

            }
        );


        activeNodes = [];


        if (audioContext) {

            audioContext.close();

            audioContext = null;

        }


        masterGain = null;


        if (activeButton) {

            activeButton.classList.remove(
                "playing"
            );


            activeButton.innerHTML = `
                <i class="fa-solid fa-play"></i>
                Play Sound
            `;

        }


        activeButton = null;

        isPlaying = false;


        nowPlaying.classList.remove(
            "show"
        );


        nowPlayingTitle.textContent =
            "Nothing playing";

    }


    /* =========================================
       STOP BUTTON
       ========================================= */

    stopSoundBtn.addEventListener(
        "click",
        stopCurrentSound
    );


    /* =========================================
       INITIAL SETUP
       ========================================= */

    createVolumeControl();

    displaySounds();

});