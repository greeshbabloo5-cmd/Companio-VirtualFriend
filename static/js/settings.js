/* =========================================================
   COMPANIO SETTINGS
========================================================= */


/* =========================================================
   GLOBAL THEME SYSTEM (Light / Dark Mode)
========================================================= */

const themeSwitch =
    document.getElementById("themeSwitch");

const themeLabel =
    document.getElementById("themeLabel");

function syncThemeControls(theme) {
    if (themeSwitch) {
        themeSwitch.checked = (theme === "dark");
    }

    if (themeLabel) {
        themeLabel.textContent = (theme === "dark") ? "☀️ Light" : "🌙 Dark";
    }
}

// Initial sync with global theme
const initialTheme = (window.CompanioTheme && window.CompanioTheme.get)
    ? window.CompanioTheme.get()
    : (localStorage.getItem("companio_theme") || "light");
syncThemeControls(initialTheme);

if (themeSwitch) {
    themeSwitch.addEventListener("change", function () {
        const newTheme = themeSwitch.checked ? "dark" : "light";
        if (window.CompanioTheme && window.CompanioTheme.set) {
            window.CompanioTheme.set(newTheme);
        } else {
            localStorage.setItem("companio_theme", newTheme);
            document.documentElement.setAttribute("data-theme", newTheme);
        }
        syncThemeControls(newTheme);
    });
}

// Listen to any external theme changes
window.addEventListener("companio-theme-change", function (e) {
    if (e.detail && e.detail.theme) {
        syncThemeControls(e.detail.theme);
    }
});


/* =========================================================
   TEXT TO SPEECH
========================================================= */

const ttsSwitch =
    document.getElementById("ttsSwitch");

const ttsStatus =
    document.getElementById("ttsStatus");


let ttsEnabled =
    localStorage.getItem("companio_tts") === "true";


function updateTTSSetting() {

    if (!ttsSwitch) {
        return;
    }


    ttsSwitch.checked = ttsEnabled;


    if (ttsStatus) {

        if (ttsEnabled) {

            ttsStatus.textContent =
                "🔊 Voice is currently ON";

            ttsStatus.classList.add("enabled");

        } else {

            ttsStatus.textContent =
                "🔇 Voice is currently OFF";

            ttsStatus.classList.remove("enabled");

        }

    }

}


updateTTSSetting();


if (ttsSwitch) {

    ttsSwitch.addEventListener("change", function () {

        ttsEnabled =
            ttsSwitch.checked;


        localStorage.setItem(
            "companio_tts",
            ttsEnabled
        );


        updateTTSSetting();


        if (
            !ttsEnabled &&
            "speechSynthesis" in window
        ) {

            window.speechSynthesis.cancel();

        }

    });

}


/* =========================================================
   VOICE GENDER
========================================================= */

const voiceGender =
    document.getElementById("voiceGender");


if (voiceGender) {

    const savedVoiceGender =
        localStorage.getItem(
            "companio_voice_gender"
        );


    if (savedVoiceGender) {

        const lowerGender =
            savedVoiceGender.toLowerCase();

        for (let i = 0; i < voiceGender.options.length; i++) {

            if (
                voiceGender.options[i].value.toLowerCase() === lowerGender ||
                voiceGender.options[i].text.toLowerCase() === lowerGender
            ) {

                voiceGender.selectedIndex = i;

                break;

            }

        }

    }


    voiceGender.addEventListener(
        "change",
        function () {

            localStorage.setItem(
                "companio_voice_gender",
                voiceGender.value
            );

        }
    );

}


/* =========================================================
   CONVERSATION LANGUAGE
========================================================= */

const conversationLanguage =
    document.getElementById(
        "conversationLanguage"
    );


if (conversationLanguage) {

    const savedLanguage =
        localStorage.getItem(
            "companio_language"
        );


    if (savedLanguage) {

        const lowerLang =
            savedLanguage.toLowerCase();

        for (let i = 0; i < conversationLanguage.options.length; i++) {

            if (
                conversationLanguage.options[i].value.toLowerCase() === lowerLang ||
                conversationLanguage.options[i].text.toLowerCase() === lowerLang
            ) {

                conversationLanguage.selectedIndex = i;

                break;

            }

        }

    }


    conversationLanguage.addEventListener(
        "change",
        function () {

            localStorage.setItem(
                "companio_language",
                conversationLanguage.value
            );

        }
    );

}





/* =========================================================
   AI MEMORY
========================================================= */

const memorySwitch =
    document.getElementById(
        "memorySwitch"
    );


if (memorySwitch) {

    const savedMemory =
        localStorage.getItem(
            "companio_ai_memory"
        );


    if (savedMemory !== null) {

        memorySwitch.checked =
            savedMemory === "true";

    }


    memorySwitch.addEventListener(
        "change",
        function () {

            localStorage.setItem(
                "companio_ai_memory",
                memorySwitch.checked
            );

        }
    );

}


/* =========================================================
   CLEAR AI MEMORY
========================================================= */

const clearMemoryBtn =
    document.getElementById(
        "clearMemoryBtn"
    );


if (clearMemoryBtn) {

    clearMemoryBtn.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Are you sure you want to clear your AI memory?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                "companio_ai_memory"
            );


            alert(
                "AI memory setting has been cleared. 💜"
            );

        }
    );

}


/* =========================================================
   SERVER SETTINGS PERSISTENCE HELPER
========================================================= */

async function saveSettingToServer(id, checked, element) {
    try {
        const response = await fetch("/api/settings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                [id]: checked
            })
        });

        const data = await response.json();

        if (response.ok && data && data.success) {
            localStorage.setItem("companio_" + id, checked);
        } else {
            element.checked = !checked;
            alert((data && data.message) ? data.message : "Failed to save setting to server.");
        }
    } catch (err) {
        console.error("Error saving setting to server:", err);
        element.checked = !checked;
        alert("Failed to connect to the server. Please check your connection.");
    }
}

/* =========================================================
   NOTIFICATIONS & PUSH NOTIFICATIONS
========================================================= */

const notificationIds = [
    "dailyMotivation",
    "moodReminder",
    "wellnessTips"
];

const notificationStatus = document.getElementById("notificationStatus");

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function updateNotificationStatusText() {
    if (!notificationStatus) return;

    if (!("Notification" in window)) {
        notificationStatus.textContent = "⚠️ Browser notifications are not supported on this device.";
        notificationStatus.style.color = "#DC2626";
        return;
    }

    if (Notification.permission === "denied") {
        notificationStatus.textContent = "⚠️ Notifications are blocked in browser site permissions.";
        notificationStatus.style.color = "#DC2626";
    } else if (Notification.permission === "granted") {
        const anyChecked = notificationIds.some(function (id) {
            const el = document.getElementById(id);
            return el && el.checked;
        });
        if (anyChecked) {
            notificationStatus.textContent = "🔔 Real notification reminders are active.";
            notificationStatus.style.color = "#059669";
        } else {
            notificationStatus.textContent = "🔕 All notification reminders are currently turned off.";
            notificationStatus.style.color = "#6B7280";
        }
    } else {
        notificationStatus.textContent = "ℹ️ Permission will be requested when enabling a reminder.";
        notificationStatus.style.color = "#6B7280";
    }
}

async function ensurePushSubscription() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Service Worker or PushManager not supported in this browser.");
        return null;
    }

    const registration = await navigator.serviceWorker.register("/service-worker.js");
    await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        const keyResponse = await fetch("/api/notifications/vapid-public-key");
        if (!keyResponse.ok) {
            throw new Error("Failed to retrieve notification server key.");
        }
        const keyData = await keyResponse.json();
        const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);

        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        });
    }

    // Persist push subscription for this logged-in user in MySQL
    await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            subscription: subscription
        })
    });

    return subscription;
}

notificationIds.forEach(function (id) {
    const element = document.getElementById(id);
    if (!element) {
        return;
    }

    const saved = localStorage.getItem("companio_" + id);
    if (saved !== null) {
        element.checked = saved === "true";
    }

    element.addEventListener("change", async function () {
        const wantsEnabled = element.checked;

        if (wantsEnabled) {
            if (!("Notification" in window)) {
                alert("Your browser does not support Web Notifications.");
                element.checked = false;
                updateNotificationStatusText();
                return;
            }

            if (Notification.permission === "denied") {
                alert("Notifications are currently blocked by your browser settings.\n\nPlease enable notifications for Companio in your browser's site settings to receive reminders 💜");
                element.checked = false;
                updateNotificationStatusText();
                return;
            }

            if (Notification.permission === "default") {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    alert("Notification permission was not granted. Companio cannot send you reminders without your permission.");
                    element.checked = false;
                    updateNotificationStatusText();
                    return;
                }
            }

            try {
                await ensurePushSubscription();
            } catch (err) {
                console.error("Error setting up push subscription:", err);
            }
        }

        // Save setting to MySQL
        await saveSettingToServer(id, wantsEnabled, element);

        // If all notifications are disabled, unregister server subscription
        const anyChecked = notificationIds.some(function (nid) {
            const el = document.getElementById(nid);
            return el && el.checked;
        });

        if (!anyChecked) {
            try {
                fetch("/api/notifications/unsubscribe", { method: "POST" });
            } catch (e) {
                console.warn("Unsubscribe call error:", e);
            }
        }

        updateNotificationStatusText();
    });
});


/* =========================================================
   PRIVACY
========================================================= */

const privacyIds = [
    "saveChatHistory",
    "saveMoodHistory"
];

privacyIds.forEach(function (id) {
    const element = document.getElementById(id);
    if (!element) {
        return;
    }

    const saved = localStorage.getItem("companio_" + id);
    if (saved !== null) {
        element.checked = saved === "true";
    }

    element.addEventListener("change", function () {
        saveSettingToServer(id, element.checked, element);
    });
});

async function syncSettingsWithServer() {
    try {
        const response = await fetch("/api/settings");
        if (!response.ok) return;

        const data = await response.json();
        if (data && data.success && data.settings) {
            const serverSettings = data.settings;
            [...notificationIds, ...privacyIds].forEach(function (id) {
                const element = document.getElementById(id);
                if (element && typeof serverSettings[id] !== "undefined") {
                    element.checked = Boolean(serverSettings[id]);
                    localStorage.setItem("companio_" + id, element.checked);
                }
            });

            updateNotificationStatusText();

            // If user has notification enabled and permission is granted, ensure push subscription is active
            const anyNotificationOn = notificationIds.some(function (id) {
                const el = document.getElementById(id);
                return el && el.checked;
            });

            if (anyNotificationOn && "Notification" in window && Notification.permission === "granted") {
                ensurePushSubscription().catch(function (e) {
                    console.log("Push subscription auto-sync:", e);
                });
            }
        }
    } catch (err) {
        console.error("Failed to sync settings from server:", err);
    }
}

syncSettingsWithServer();


/* =========================================================
   PROFILE
========================================================= */

const updateProfileBtn =
    document.getElementById(
        "updateProfileBtn"
    );


if (updateProfileBtn) {

    updateProfileBtn.addEventListener(
        "click",
        async function () {

            const nameInput = document.getElementById("profileName");
            const emailInput = document.getElementById("profileEmail");

            const fullName = nameInput ? nameInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";

            if (!fullName) {
                alert("Please enter your name.");
                if (nameInput) nameInput.focus();
                return;
            }

            if (!email) {
                alert("Please enter your email address.");
                if (emailInput) emailInput.focus();
                return;
            }

            try {
                const response = await fetch("/update-profile", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        full_name: fullName,
                        email: email
                    })
                });

                const data = await response.json();

                if (data.success) {
                    alert(data.message || "Profile updated successfully. 💙");
                } else {
                    alert(data.message || "Failed to update profile.");
                }
            } catch (err) {
                console.error("Profile update error:", err);
                alert("An error occurred while updating profile. Please try again.");
            }

        }
    );

}


/* =========================================================
   EXPORT
========================================================= */

const exportChatsBtn =
    document.getElementById(
        "exportChatsBtn"
    );


if (exportChatsBtn) {

    exportChatsBtn.addEventListener(
        "click",
        function () {

            window.location.href = "/export_chats";

        }
    );

}


const exportMoodBtn =
    document.getElementById(
        "exportMoodBtn"
    );


if (exportMoodBtn) {

    exportMoodBtn.addEventListener(
        "click",
        function () {

            window.location.href = "/export_mood";

        }
    );

}


/* =========================================================
   CLEAR LOCAL SETTINGS
========================================================= */

const clearDataBtn =
    document.getElementById(
        "clearDataBtn"
    );


if (clearDataBtn) {

    clearDataBtn.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Clear Companio settings saved in this browser?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.clear();


            alert(
                "Local Companio settings have been cleared."
            );


            location.reload();

        }
    );

}