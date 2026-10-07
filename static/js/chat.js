/* =========================================================
   COMPANIO CHAT
   Text Chat + Speech-to-Text + Text-to-Speech
========================================================= */

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

const micBtn = document.getElementById("micBtn");
const voiceStatus = document.getElementById("voiceStatus");

const attachBtn = document.getElementById("attachBtn");

const ttsToggle = document.getElementById("ttsToggle");


/* =========================================================
   TEXT TO SPEECH
========================================================= */

let ttsEnabled =
    localStorage.getItem("companio_tts") === "true";

let currentSpeakButton = null;
let currentUtterance = null;


function updateTTSButton() {

    if (!ttsToggle) return;

    if (ttsEnabled) {

        ttsToggle.classList.add("active");

        ttsToggle.innerHTML = `
            <i class="fa-solid fa-volume-high"></i>
            <span>Voice On</span>
        `;

    } else {

        ttsToggle.classList.remove("active");

        ttsToggle.innerHTML = `
            <i class="fa-solid fa-volume-xmark"></i>
            <span>Voice Off</span>
        `;

    }
}


updateTTSButton();


if (ttsToggle) {

    ttsToggle.addEventListener("click", function () {

        ttsEnabled = !ttsEnabled;

        localStorage.setItem(
            "companio_tts",
            ttsEnabled
        );

        updateTTSButton();

        if (!ttsEnabled) {

            stopSpeaking();

            showVoiceStatus(
                "Companio voice is off"
            );

        } else {

            showVoiceStatus(
                "Companio voice is on"
            );

        }

        setTimeout(hideVoiceStatus, 1500);

    });

}


/* =========================================================
   STOP SPEAKING
========================================================= */

function stopSpeaking() {

    if ("speechSynthesis" in window) {

        window.speechSynthesis.cancel();

    }

    if (currentSpeakButton) {

        currentSpeakButton.classList.remove("speaking");

        currentSpeakButton.innerHTML =
            '<i class="fa-solid fa-volume-high"></i>';

        currentSpeakButton = null;

    }

    currentUtterance = null;

}


/* =========================================================
   COMPANIO TEXT TO SPEECH
========================================================= */

/* =========================================================
   VOICE SELECTION & CACHING
========================================================= */

let voiceCache = {};

function getAvailableVoices() {

    if (!("speechSynthesis" in window)) {

        return [];

    }

    return window.speechSynthesis.getVoices() || [];

}


if ("speechSynthesis" in window) {

    window.speechSynthesis.onvoiceschanged = function () {

        voiceCache = {};

    };

}


window.addEventListener("storage", function (e) {

    if (
        e.key === "companio_voice_gender" ||
        e.key === "companio_language"
    ) {

        voiceCache = {};

    }

    if (e.key === "companio_tts") {

        ttsEnabled = e.newValue === "true";

        updateTTSButton();

    }

});


function detectVoiceGender(voice) {

    if (!voice) {
        return "unknown";
    }

    if (
        voice.gender &&
        typeof voice.gender === "string"
    ) {

        const g = voice.gender.toLowerCase();

        if (g === "female" || g === "male") {
            return g;
        }

    }

    const name = (
        (voice.name || "") + " " + (voice.voiceURI || "")
    ).toLowerCase();

    // Explicit female keywords & recognized female voice names
    const isFemale =
        /\b(female|woman|girl|femme|femenino|weiblich|donna|mujer|feminine)\b/i.test(name) ||
        /\b(zira|samantha|karen|susan|hazel|heera|kalpana|sapna|geeta|neerja|swara|shruti|sunita|priya|pallavi|chitra|kavya|ananya|jenny|aria|sonia|libby|natasha|clara|mia|ava|emma|ana|elena|laura|julie|florence|alice|michelle|catherine|linda|victoria|tessa|moira|fiona|veena|lekha|sangeeta|serena|allison|kate|yuna|kyoko|mei-jia|ting-ting|sin-ji|zhiyu|ayumi|haruka|yuka|nanami|stephanie|sarah|amanda|jessica|monica)\b/i.test(name);

    if (isFemale) {
        return "female";
    }

    // Explicit male keywords & recognized male voice names (ensuring not matching 'female')
    const isMale =
        (/\b(male|man|boy|homme|masculino|männlich|uomo|hombre|masculine)\b/i.test(name) && !/\bfemale\b/i.test(name)) ||
        /\b(david|mark|george|ravi|hemant|gagan|prabhat|madhur|guy|ryan|christopher|eric|roger|steffan|james|richard|sean|brian|paul|andrew|charles|alex|daniel|fred|arthur|gordon|aaron|rishi|tom|oliver|lee|yuri|tarik|karrar|kento|daichi|zhiwei|naoto|keita|takumi|shinji|michael|john|william|robert)\b/i.test(name);

    if (isMale) {
        return "male";
    }

    return "unknown";

}


function getBestVoice(language, gender) {

    const normGender =
        (gender || "female").toLowerCase().trim();

    const cacheKey =
        language + "_" + normGender;


    if (voiceCache[cacheKey]) {

        return voiceCache[cacheKey];

    }


    const voices =
        getAvailableVoices();

    if (!voices || voices.length === 0) {

        return null;

    }


    const languageMap = {

        "English": "en",

        "Hindi": "hi",

        "Kannada": "kn",

        "Telugu": "te",

        "Tamil": "ta",

        "Malayalam": "ml",

        "Bengali": "bn",

        "Marathi": "mr",

        "Gujarati": "gu",

        "Punjabi": "pa",

        "Urdu": "ur",

        "Spanish": "es",

        "French": "fr",

        "German": "de",

        "Italian": "it",

        "Portuguese": "pt",

        "Japanese": "ja",

        "Korean": "ko",

        "Chinese": "zh",

        "Arabic": "ar",

        "Russian": "ru"

    };


    const targetLangCode =
        (languageMap[language] || "en").toLowerCase();


    /* -----------------------------------------------------
       1. Filter voices by language first
    ----------------------------------------------------- */

    let langVoices = voices.filter(function (voice) {

        if (!voice) return false;

        const vLang = (voice.lang || "")
            .toLowerCase()
            .replace("_", "-");

        const vName = (voice.name || "")
            .toLowerCase();

        const lName = language.toLowerCase();

        return (
            vLang.startsWith(targetLangCode + "-") ||
            vLang === targetLangCode ||
            vName.includes(lName)
        );

    });

    if (langVoices.length === 0) {

        langVoices = voices.filter(function (voice) {

            const vLang = (voice.lang || "").toLowerCase();

            return vLang.startsWith(targetLangCode);

        });

    }

    const voicePool =
        langVoices.length > 0 ? langVoices : voices;


    /* -----------------------------------------------------
       2. From those voices, choose matching gender
    ----------------------------------------------------- */

    let chosenVoice = voicePool.find(function (voice) {

        return detectVoiceGender(voice) === normGender;

    });


    /* -----------------------------------------------------
       3. If exact gender is unavailable, use closest voice of that language
    ----------------------------------------------------- */

    if (!chosenVoice && langVoices.length > 0) {

        chosenVoice = langVoices[0];

    }

    if (!chosenVoice) {

        chosenVoice = voicePool[0] || null;

    }


    /* -----------------------------------------------------
       4. Cache the selected voice
    ----------------------------------------------------- */

    if (chosenVoice) {

        voiceCache[cacheKey] = chosenVoice;

    }

    return chosenVoice;

}


function speakMessage(message, button = null, isManual = false) {

    if (!("speechSynthesis" in window)) {

        if (isManual) {

            alert(
                "Text-to-Speech is not supported by this browser."
            );

        }

        return;

    }


    const ttsEnabled =
        localStorage.getItem("companio_tts") === "true";


    if (!ttsEnabled && !isManual) {

        return;

    }


    const storedLang =
        (localStorage.getItem(
            "companio_language"
        ) || "English").trim();

    const language =
        storedLang.toLowerCase() === "kannada" ? "Kannada" : "English";


    const gender =
        (localStorage.getItem(
            "companio_voice_gender"
        ) || "female").toLowerCase().trim();


    stopSpeaking();


    const utterance =
        new SpeechSynthesisUtterance(message);

    currentSpeakButton = button;
    currentUtterance = utterance;

    if (button) {

        button.classList.add("speaking");

        button.innerHTML =
            '<i class="fa-solid fa-stop"></i>';

    }

    utterance.onend = function () {

        stopSpeaking();

    };

    utterance.onerror = function () {

        stopSpeaking();

    };


    const selectedVoice =
        getBestVoice(language, gender);

    const languageMap = {

        "English": "en",

        "Hindi": "hi",

        "Kannada": "kn",

        "Telugu": "te",

        "Tamil": "ta",

        "Malayalam": "ml",

        "Bengali": "bn",

        "Marathi": "mr",

        "Gujarati": "gu",

        "Punjabi": "pa",

        "Urdu": "ur",

        "Spanish": "es",

        "French": "fr",

        "German": "de",

        "Italian": "it",

        "Portuguese": "pt",

        "Japanese": "ja",

        "Korean": "ko",

        "Chinese": "zh",

        "Arabic": "ar",

        "Russian": "ru"

    };

    const targetLangCode =
        (languageMap[language] || "en").toLowerCase();

    if (selectedVoice) {

        utterance.voice =
            selectedVoice;

        utterance.lang =
            selectedVoice.lang || targetLangCode;

    } else {

        utterance.lang =
            targetLangCode;

    }


    utterance.rate = 0.95;

    utterance.pitch =
        gender === "male" ? 0.85 : 1.05;

    utterance.volume = 1;


    window.speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   SPEAKER BUTTONS
========================================================= */

function setupSpeakButtons() {

    const buttons =
        document.querySelectorAll(".speak-btn");


    buttons.forEach(function (button) {

        if (button.dataset.ready === "true") {
            return;
        }


        button.dataset.ready = "true";


        button.addEventListener(
            "click",
            function () {

                const content =
                    button.closest(
                        ".message-content"
                    );


                if (!content) return;


                const bubble =
                    content.querySelector(
                        ".bubble"
                    );


                if (!bubble) return;


                if (
                    button === currentSpeakButton
                ) {

                    stopSpeaking();

                    return;

                }


                speakMessage(
                    bubble.innerText,
                    button,
                    true
                );

            }
        );

    });

}


setupSpeakButtons();


/* =========================================================
   SPEECH TO TEXT
========================================================= */

let recognition = null;

let isRecording = false;

let finalTranscript = "";


/*
 * Chrome uses webkitSpeechRecognition.
 */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    /*
     * IMPORTANT
     */

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = "en-IN";


    /*
     * START
     */

    recognition.onstart = function () {

        isRecording = true;

        finalTranscript = "";


        micBtn.classList.add(
            "recording"
        );


        micBtn.innerHTML =
            '<i class="fa-solid fa-stop"></i>';


        micBtn.title =
            "Stop listening";


        showVoiceStatus(
            "Listening... Speak now"
        );

    };


    /*
     * AUDIO START
     */

    recognition.onaudiostart =
        function () {

            console.log(
                "Microphone audio started"
            );

        };


    /*
     * SPEECH START
     */

    recognition.onspeechstart =
        function () {

            console.log(
                "Speech detected"
            );

            showVoiceStatus(
                "I can hear you..."
            );

        };


    /*
     * RESULT
     */

    recognition.onresult =
        function (event) {

            let interimTranscript = "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const transcript =
                    event.results[i][0].transcript;


                if (
                    event.results[i].isFinal
                ) {

                    finalTranscript +=
                        transcript + " ";

                } else {

                    interimTranscript +=
                        transcript;

                }

            }


            /*
             * Show text immediately
             * inside the input box.
             */

            const currentText =
                (
                    finalTranscript +
                    interimTranscript
                ).trim();


            if (currentText) {

                input.value =
                    currentText;

                input.focus();

            }


            console.log(
                "Speech:",
                currentText
            );

        };


    /*
     * SPEECH END
     */

    recognition.onspeechend =
        function () {

            console.log(
                "Speech ended"
            );

        };


    /*
     * ERROR
     */

    recognition.onerror =
        function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );


            switch (event.error) {

                case "not-allowed":

                    showVoiceStatus(
                        "Microphone permission denied"
                    );

                    break;


                case "audio-capture":

                    showVoiceStatus(
                        "No microphone detected"
                    );

                    break;


                case "no-speech":

                    showVoiceStatus(
                        "No speech detected"
                    );

                    break;


                case "network":

                    showVoiceStatus(
                        "Speech service network error"
                    );

                    break;


                case "aborted":

                    showVoiceStatus(
                        "Voice input stopped"
                    );

                    break;


                default:

                    showVoiceStatus(
                        "Voice input error: " +
                        event.error
                    );

            }


            setTimeout(
                hideVoiceStatus,
                3000
            );

        };


    /*
     * END
     */

    recognition.onend =
        function () {

            console.log(
                "Speech recognition ended"
            );


            /*
             * Only change UI.
             *
             * Do NOT automatically restart.
             */

            stopRecordingUI();

        };

} else {

    console.error(
        "Speech Recognition API is not supported."
    );

}


/* =========================================================
   MICROPHONE BUTTON
========================================================= */

if (micBtn) {

    micBtn.addEventListener(
        "click",
        function () {

            /*
             * Browser doesn't support it
             */

            if (!recognition) {

                showVoiceStatus(
                    "Voice input is not supported by this browser"
                );

                setTimeout(
                    hideVoiceStatus,
                    533
                );

                return;

            }


            /*
             * STOP
             */

            if (isRecording) {

                recognition.stop();

                return;

            }


            /*
             * START
             */

            finalTranscript = "";

            input.focus();


            try {

                recognition.start();

            }

            catch (error) {

                console.error(
                    "Could not start microphone:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   STOP RECORDING UI
========================================================= */

function stopRecordingUI() {

    isRecording = false;


    if (micBtn) {

        micBtn.classList.remove(
            "recording"
        );


        micBtn.innerHTML =
            '<i class="fa-solid fa-microphone"></i>';


        micBtn.title =
            "Speak";

    }


    hideVoiceStatus();

}


/* =========================================================
   VOICE STATUS
========================================================= */

function showVoiceStatus(message) {

    if (!voiceStatus) return;

    voiceStatus.textContent =
        message;

    voiceStatus.classList.add(
        "show"
    );

}


function hideVoiceStatus() {

    if (!voiceStatus) return;

    voiceStatus.classList.remove(
        "show"
    );

}


/* =========================================================
   SCROLL
========================================================= */

function scrollToBottom() {

    if (!chatBox) return;

    chatBox.scrollTop =
        chatBox.scrollHeight;

}


scrollToBottom();


/* =========================================================
   ENTER TO SEND
========================================================= */

if (input) {

    input.addEventListener(
        "keydown",
        function (event) {

            if (
                (event.key === "Enter" || event.keyCode === 13) &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


/* =========================================================
   SEND BUTTON
========================================================= */

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        function (event) {

            if (event) {

                event.preventDefault();

            }

            sendMessage();

        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


/* =========================================================
   USER INITIAL HELPER
========================================================= */

function getUserInitial() {

    const profileEl =
        document.querySelector(".profile");

    if (profileEl && profileEl.textContent.trim()) {

        return profileEl.textContent.trim().charAt(0).toUpperCase();

    }

    const welcomeEl =
        document.querySelector(".welcome h1");

    if (welcomeEl) {

        const text =
            welcomeEl.textContent.trim();

        const match =
            text.match(/Hello\s+([A-Za-z0-9_]+)/i);

        if (match && match[1]) {

            return match[1].charAt(0).toUpperCase();

        }

    }

    return "U";

}


/* =========================================================
   ADD USER MESSAGE
========================================================= */

function addUserMessage(message) {

    const welcome =
        document.querySelector(".welcome");
    if (welcome) {
        welcome.remove();
    }

    const div =
        document.createElement("div");

    div.className =
        "user-message";

    div.innerHTML = `

        <div class="bubble">
            ${escapeHtml(message)}
        </div>

        <div class="avatar user">
            ${escapeHtml(getUserInitial())}
        </div>

    `;

    const box =
        chatBox || document.getElementById("chat-box");

    if (box) {

        box.appendChild(div);

    }

    scrollToBottom();

}


/* =========================================================
   ADD AI MESSAGE
========================================================= */

function addAIMessage(message) {

    const div =
        document.createElement("div");

    div.className =
        "ai-message";

    div.innerHTML = `

        <div class="avatar">
            <img src="/static/images/companio_logo_white.png"
                 alt="Companio Logo"
                 class="brand-logo">
        </div>

        <div class="message-content">

            <div class="bubble">
                ${escapeHtml(message)}
            </div>

            <button
                type="button"
                class="speak-btn"
                title="Read this message aloud"
            >

                <i class="fa-solid fa-volume-high"></i>

            </button>

        </div>

    `;

    const box =
        chatBox || document.getElementById("chat-box");

    if (box) {

        box.appendChild(div);

    }

    setupSpeakButtons();

    scrollToBottom();


    /*
     * Automatic voice ONLY
     * when Voice On.
     */

    if (ttsEnabled) {

        const button =
            div.querySelector(
                ".speak-btn"
            );

        speakMessage(
            message,
            button,
            false
        );

    }

}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

    if (
        document.getElementById("typing")
    ) {
        return;
    }

    const div =
        document.createElement("div");

    div.className =
        "ai-message";

    div.id =
        "typing";

    div.innerHTML = `

        <div class="avatar">
            <img src="/static/images/companio_logo_white.png"
                 alt="Companio Logo"
                 class="brand-logo">
        </div>

        <div class="bubble typing">

            <span></span>
            <span></span>
            <span></span>

        </div>

    `;

    const box =
        chatBox || document.getElementById("chat-box");

    if (box) {

        box.appendChild(div);

    }

    scrollToBottom();

}


function hideTyping() {

    const typing =
        document.getElementById(
            "typing"
        );

    if (typing) {

        typing.remove();

    }

}


/* =========================================================
   EXPLICIT LANGUAGE SWITCH DETECTION
========================================================= */

function detectExplicitLanguageSwitch(text) {

    if (!text) return null;

    const clean =
        text.toLowerCase().trim();

    // Check English explicit switch requests
    if (
        /\b(speak\s+in\s+english|talk\s+in\s+english|reply\s+in\s+english|switch\s+to\s+english|speak\s+english|talk\s+english)\b/i.test(clean) ||
        clean === "english" ||
        clean === "in english"
    ) {
        return "English";
    }

    // Check Kannada explicit switch requests
    if (
        /\b(speak\s+in\s+kannada|talk\s+in\s+kannada|reply\s+in\s+kannada|switch\s+to\s+kannada|speak\s+kannada|talk\s+kannada|kannadadalli\s+ma?tha?di)\b/i.test(clean) ||
        clean === "kannada" ||
        clean === "in kannada"
    ) {
        return "Kannada";
    }

    return null;

}


/* =========================================================
   SEND MESSAGE
========================================================= */

let isSending = false;

async function sendMessage() {

    if (isSending) {
        return;
    }

    const inputElement =
        input || document.getElementById("message");

    const sendButton =
        sendBtn || document.getElementById("sendBtn");

    if (!inputElement) {
        return;
    }

    const message =
        inputElement.value.trim();

    if (!message) {
        return;
    }

    /*
     * Stop microphone if running.
     */

    if (
        isRecording &&
        recognition
    ) {

        try {
            recognition.stop();
        } catch (e) {
            // ignore
        }

    }

    stopSpeaking();

    addUserMessage(
        message
    );

    inputElement.value = "";

    showTyping();

    isSending = true;
    if (sendButton) {
        sendButton.disabled = true;
    }

    // Use companio_language from localStorage as the ONLY default conversation language (bilingual only: English or Kannada)
    let currentLanguage =
        (localStorage.getItem("companio_language") || "English").trim();

    currentLanguage =
        currentLanguage.toLowerCase() === "kannada" ? "Kannada" : "English";

    // If user explicitly asks to switch language, update immediately and persist to localStorage
    const explicitSwitch =
        detectExplicitLanguageSwitch(message);

    if (explicitSwitch) {

        currentLanguage = explicitSwitch;

        localStorage.setItem(
            "companio_language",
            currentLanguage
        );

        voiceCache = {};

    }

    try {

        const response =
            await fetch(
                "/send_message",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify({
                            message: message,
                            language: currentLanguage,
                            voice_gender:
                                localStorage.getItem("companio_voice_gender") || "female"
                        })
                }
            );

        const data =
            await response.json();

        hideTyping();

        if (data && data.language) {

            localStorage.setItem(
                "companio_language",
                data.language
            );

        }

        if (response.ok && data && data.reply) {

            addAIMessage(data.reply);

            /*
             * Update conversation title in sidebar without page reload.
             */
            if (
                data.conversation_title
            ) {
                const activeItem =
                    document.querySelector(".history-item.active span");
                if (activeItem) {
                    activeItem.textContent = data.conversation_title;
                }
            }

        } else if (data && data.reply) {

            addAIMessage(data.reply);

        } else if (!response.ok) {

            addAIMessage(
                "Unable to connect to Companio."
            );

        } else {

            addAIMessage(
                "I couldn't generate a response."
            );

        }

    }

    catch (error) {

        console.error(
            "Chat error:",
            error
        );

        hideTyping();

        addAIMessage(
            "Unable to connect to Companio."
        );

    }

    finally {

        isSending = false;

        if (sendButton) {

            sendButton.disabled = false;

        }

        inputElement.focus();

    }

}


/* =========================================================
   SUGGESTIONS
========================================================= */

function useSuggestion(text) {

    const inputElement =
        input || document.getElementById("message");

    if (inputElement) {

        inputElement.value =
            text;

        inputElement.focus();

    }

    sendMessage();

}


/* =========================================================
   ATTACHMENT
========================================================= */

if (attachBtn) {

    attachBtn.addEventListener(
        "click",
        function () {

            alert(
                "File attachment will be added soon. 📎"
            );

        }
    );

}