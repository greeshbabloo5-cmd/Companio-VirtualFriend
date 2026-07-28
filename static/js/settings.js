// ============================
// Theme Toggle
// ============================

const themeSwitch = document.getElementById("themeSwitch");
const themeLabel = document.getElementById("themeLabel");

themeSwitch.addEventListener("change", () => {

    if(themeSwitch.checked){

        document.body.classList.add("dark-mode");

        themeLabel.innerHTML="☀️ Light";

    }
    else{

        document.body.classList.remove("dark-mode");

        themeLabel.innerHTML="🌙 Dark";

    }

});