// ===============================
// Guided Breathing Exercise
// ===============================

const breathText = document.getElementById("breathText");
const countdown = document.getElementById("countdown");

const phases = [
    { text: "🫁 Breathe In", duration: 4 },
    { text: "😌 Hold", duration: 4 },
    { text: "💨 Breathe Out", duration: 6 }
];

let currentPhase = 0;
let timeLeft = phases[currentPhase].duration;

function updateBreathing() {

    breathText.textContent = phases[currentPhase].text;
    countdown.textContent = timeLeft;

    timeLeft--;

    if (timeLeft < 0) {

        currentPhase++;

        if (currentPhase >= phases.length) {
            currentPhase = 0;
        }

        timeLeft = phases[currentPhase].duration;
    }
}

updateBreathing();
setInterval(updateBreathing, 1000);
// ===============================
// Grounding Exercise
// ===============================

const groundingSteps = [

    {
        title:"👀 Name 5 things you can SEE",
        progress:20
    },

    {
        title:"✋ Name 4 things you can TOUCH",
        progress:40
    },

    {
        title:"👂 Name 3 things you can HEAR",
        progress:60
    },

    {
        title:"👃 Name 2 things you can SMELL",
        progress:80
    },

    {
        title:"👅 Name 1 thing you can TASTE",
        progress:100
    }

];

let currentStep = 0;

const progressBar = document.getElementById("progressBar");
const stepNumber = document.getElementById("stepNumber");
const groundTitle = document.getElementById("groundTitle");
const groundInput = document.getElementById("groundInput");
const nextGround = document.getElementById("nextGround");

nextGround.addEventListener("click",function(){

    groundInput.value="";

    currentStep++;

    if(currentStep >= groundingSteps.length){

        progressBar.style.width="100%";

        stepNumber.innerHTML="Completed 🎉";

        groundTitle.innerHTML="💙 Great Job! You completed the grounding exercise.";

        groundInput.style.display="none";

        nextGround.style.display="none";

        return;

    }

    progressBar.style.width = groundingSteps[currentStep].progress + "%";

    stepNumber.innerHTML =
        "Step " + (currentStep + 1) + " of 5";

    groundTitle.innerHTML =
        groundingSteps[currentStep].title;

});
// ===============================
// Relaxing Sounds
// ===============================

const player = document.getElementById("naturePlayer");
const selector = document.getElementById("soundSelector");
const playBtn = document.getElementById("playSound");
const stopBtn = document.getElementById("stopSound");

playBtn.addEventListener("click", () => {

    if(selector.value === "") return;

    player.src = "/static/audio/" + selector.value + ".mp3";
    player.loop = true;
    player.play();

});

stopBtn.addEventListener("click", () => {

    player.pause();
    player.currentTime = 0;

});