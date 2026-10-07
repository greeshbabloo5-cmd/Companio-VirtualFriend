/* =========================================
   COMPANIO - DAILY MOTIVATION
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =========================================
       DOM ELEMENTS
       ========================================= */

    const motivationText =
        document.getElementById("motivationText");

    const newMotivationBtn =
        document.getElementById("newMotivationBtn");

    const copyBtn =
        document.getElementById("copyBtn");

    const shareBtn =
        document.getElementById("shareBtn");

    const actionMessage =
        document.getElementById("actionMessage");

    const categoryButtons =
        document.querySelectorAll(".category-btn");

    const moodButtons =
        document.querySelectorAll(".mood-btn");


    /* =========================================
       MOTIVATION DATABASE
       ========================================= */

    const motivations = [

        /* =====================================
           SELF CONFIDENCE
           ===================================== */

        {
            text: "You are allowed to believe in yourself before everyone else does.",
            category: "confidence",
            moods: ["happy", "calm", "energetic"]
        },

        {
            text: "Your progress does not need to look like anyone else's.",
            category: "confidence",
            moods: ["sad", "stressed", "tired"]
        },

        {
            text: "You have already handled moments you once thought you couldn't.",
            category: "confidence",
            moods: ["sad", "stressed"]
        },

        {
            text: "You don't need to be perfect to be proud of yourself.",
            category: "confidence",
            moods: ["happy", "sad", "tired"]
        },

        {
            text: "Trust the person you are becoming, even when the path feels uncertain.",
            category: "confidence",
            moods: ["calm", "stressed", "energetic"]
        },

        {
            text: "Your voice, your ideas and your presence matter.",
            category: "confidence",
            moods: ["happy", "energetic"]
        },


        /* =====================================
           PERSONAL GROWTH
           ===================================== */

        {
            text: "Small steps still move you forward.",
            category: "growth",
            moods: ["tired", "sad", "calm"]
        },

        {
            text: "You can grow without rushing the process.",
            category: "growth",
            moods: ["calm", "stressed", "tired"]
        },

        {
            text: "Every experience can teach you something useful about yourself.",
            category: "growth",
            moods: ["sad", "calm"]
        },

        {
            text: "Today is another chance to learn, adjust and begin again.",
            category: "growth",
            moods: ["happy", "energetic", "sad"]
        },

        {
            text: "Progress is sometimes quiet. That does not make it less real.",
            category: "growth",
            moods: ["tired", "sad", "calm"]
        },

        {
            text: "Give yourself permission to be a work in progress.",
            category: "growth",
            moods: ["stressed", "tired", "sad"]
        },


        /* =====================================
           SELF LOVE
           ===================================== */

        {
            text: "Speak to yourself with the same kindness you would give someone you love.",
            category: "selflove",
            moods: ["sad", "stressed", "tired"]
        },

        {
            text: "You deserve rest without having to earn it.",
            category: "selflove",
            moods: ["tired", "stressed"]
        },

        {
            text: "Taking care of yourself is not selfish. It is necessary.",
            category: "selflove",
            moods: ["stressed", "tired", "sad"]
        },

        {
            text: "Your worth is not measured by how much you accomplish today.",
            category: "selflove",
            moods: ["tired", "stressed", "sad"]
        },

        {
            text: "It is okay to choose peace when you need it.",
            category: "selflove",
            moods: ["calm", "stressed", "tired"]
        },

        {
            text: "You are worthy of patience, including your own.",
            category: "selflove",
            moods: ["sad", "stressed", "calm"]
        },


        /* =====================================
           HOPE
           ===================================== */

        {
            text: "A difficult moment does not define the whole story.",
            category: "hope",
            moods: ["sad", "stressed"]
        },

        {
            text: "There can still be good moments ahead that you cannot see yet.",
            category: "hope",
            moods: ["sad", "tired", "calm"]
        },

        {
            text: "You only need enough hope for the next step.",
            category: "hope",
            moods: ["sad", "stressed", "tired"]
        },

        {
            text: "Tomorrow does not have to repeat today.",
            category: "hope",
            moods: ["sad", "stressed"]
        },

        {
            text: "Keep a little space in your heart for unexpected good things.",
            category: "hope",
            moods: ["calm", "happy", "sad"]
        },

        {
            text: "Even slow mornings can lead to brighter days.",
            category: "hope",
            moods: ["tired", "sad", "calm"]
        },


        /* =====================================
           GOALS
           ===================================== */

        {
            text: "Focus on the next step instead of trying to finish the entire journey today.",
            category: "goals",
            moods: ["energetic", "stressed", "calm"]
        },

        {
            text: "Your future is built from the small choices you make today.",
            category: "goals",
            moods: ["happy", "energetic", "calm"]
        },

        {
            text: "Start with what you can do, then build from there.",
            category: "goals",
            moods: ["energetic", "tired"]
        },

        {
            text: "Consistency can take you further than one perfect day.",
            category: "goals",
            moods: ["happy", "energetic", "tired"]
        },

        {
            text: "You don't need to move quickly. You just need to keep moving.",
            category: "goals",
            moods: ["tired", "stressed", "calm"]
        },

        {
            text: "Give today's small effort a chance to become tomorrow's progress.",
            category: "goals",
            moods: ["energetic", "happy", "calm"]
        },


        /* =====================================
           PEACE
           ===================================== */

        {
            text: "Take a breath. This moment does not require you to solve everything.",
            category: "peace",
            moods: ["stressed", "tired"]
        },

        {
            text: "You can pause without giving up.",
            category: "peace",
            moods: ["stressed", "tired", "sad"]
        },

        {
            text: "Let today be simple. One breath, one thought, one step at a time.",
            category: "peace",
            moods: ["calm", "stressed", "tired"]
        },

        {
            text: "You are allowed to slow down and still be moving forward.",
            category: "peace",
            moods: ["tired", "stressed", "calm"]
        },

        {
            text: "Not every thought needs an answer right now.",
            category: "peace",
            moods: ["stressed", "calm"]
        },

        {
            text: "Give yourself a quiet moment. You have permission to simply be.",
            category: "peace",
            moods: ["tired", "sad", "calm"]
        }

    ];


    /* =========================================
       STATE
       ========================================= */

    let selectedCategory = "all";

    let selectedMood = null;

    let currentMotivation = null;


    /* =========================================
       GET AVAILABLE MOTIVATIONS
       ========================================= */

    function getAvailableMotivations() {

        let result =
            motivations;


        /*
         * Filter by category
         */

        if (selectedCategory !== "all") {

            result =
                result.filter(
                    motivation =>
                        motivation.category ===
                        selectedCategory
                );

        }


        /*
         * Filter by mood
         */

        if (selectedMood) {

            const moodResults =
                result.filter(
                    motivation =>
                        motivation.moods.includes(
                            selectedMood
                        )
                );


            /*
             * Only replace the result if
             * suitable mood messages exist.
             */

            if (moodResults.length > 0) {

                result =
                    moodResults;

            }

        }


        return result;

    }


    /* =========================================
       SHOW MOTIVATION
       ========================================= */

    function showMotivation() {

        let available =
            getAvailableMotivations();


        /*
         * Safety fallback
         */

        if (!available.length) {

            available =
                motivations;

        }


        /*
         * Avoid immediate repetition
         */

        let choices =
            available.filter(
                motivation =>
                    motivation !==
                    currentMotivation
            );


        if (!choices.length) {

            choices =
                available;

        }


        const randomIndex =
            Math.floor(
                Math.random() *
                choices.length
            );


        currentMotivation =
            choices[randomIndex];


        /*
         * Small fade animation
         */

        motivationText.style.opacity =
            "0";


        setTimeout(() => {

            motivationText.textContent =
                currentMotivation.text;

            motivationText.style.opacity =
                "1";

        }, 150);


        clearActionMessage();

    }


    /* =========================================
       CATEGORY BUTTONS
       ========================================= */

    categoryButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                categoryButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                selectedCategory =
                    button.dataset.category;


                showMotivation();

            }
        );

    });


    /* =========================================
       MOOD BUTTONS
       ========================================= */

    moodButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                /*
                 * Clicking the same mood
                 * again removes the filter.
                 */

                if (
                    selectedMood ===
                    button.dataset.mood
                ) {

                    selectedMood = null;

                    button.classList.remove(
                        "active"
                    );

                }

                else {

                    moodButtons.forEach(
                        btn => {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    selectedMood =
                        button.dataset.mood;

                }


                showMotivation();

            }
        );

    });


    /* =========================================
       NEW MOTIVATION
       ========================================= */

    newMotivationBtn.addEventListener(
        "click",
        showMotivation
    );


    /* =========================================
       COPY MOTIVATION
       ========================================= */

    copyBtn.addEventListener(
        "click",
        async () => {

            if (!currentMotivation) {
                return;
            }


            try {

                await navigator.clipboard.writeText(
                    currentMotivation.text
                );


                showActionMessage(
                    "Motivation copied! ✨"
                );

            }

            catch (error) {

                /*
                 * Fallback for browsers that
                 * block clipboard API.
                 */

                const textArea =
                    document.createElement(
                        "textarea"
                    );


                textArea.value =
                    currentMotivation.text;


                document.body.appendChild(
                    textArea
                );


                textArea.select();


                document.execCommand(
                    "copy"
                );


                textArea.remove();


                showActionMessage(
                    "Motivation copied! ✨"
                );

            }

        }
    );


    /* =========================================
       SHARE MOTIVATION
       ========================================= */

    shareBtn.addEventListener(
        "click",
        async () => {

            if (!currentMotivation) {
                return;
            }


            const shareText =
                `${currentMotivation.text}\n\n— Companio`;


            /*
             * Modern browser sharing
             */

            if (
                navigator.share
            ) {

                try {

                    await navigator.share({

                        title:
                            "Companio Motivation",

                        text:
                            shareText

                    });


                    showActionMessage(
                        "Shared successfully! 💜"
                    );

                }

                catch (error) {

                    /*
                     * User may simply cancel
                     * the share window.
                     */

                    if (
                        error.name !==
                        "AbortError"
                    ) {

                        showActionMessage(
                            "Sharing was cancelled."
                        );

                    }

                }

            }

            else {

                /*
                 * Fallback
                 */

                try {

                    await navigator.clipboard.writeText(
                        shareText
                    );


                    showActionMessage(
                        "Sharing isn't available, so the message was copied."
                    );

                }

                catch (error) {

                    showActionMessage(
                        "Unable to share this message."
                    );

                }

            }

        }
    );


    /* =========================================
       ACTION MESSAGE
       ========================================= */

    function showActionMessage(message) {

        actionMessage.textContent =
            message;


        clearTimeout(
            window.motivationMessageTimer
        );


        window.motivationMessageTimer =
            setTimeout(
                clearActionMessage,
                2500
            );

    }


    function clearActionMessage() {

        actionMessage.textContent =
            "";

    }


    /* =========================================
       INITIAL MOTIVATION
       ========================================= */

    showMotivation();

});