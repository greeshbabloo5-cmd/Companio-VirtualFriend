/* =========================================================
   COMPANIO - EMERGENCY SUPPORT JAVASCRIPT
   Real Call Parent (tel:) & SOS Emergency SMS (sms:)
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // DOM Elements
    const callParentBtn = document.getElementById("callParentBtn");
    const sendSosBtn = document.getElementById("sendSosBtn");
    const sosConfirmModal = document.getElementById("sosConfirmModal");
    const cancelSosBtn = document.getElementById("cancelSosBtn");
    const confirmSosBtn = document.getElementById("confirmSosBtn");
    const toastNotification = document.getElementById("toastNotification");

    // Primary emergency contact
    const parentPhonePrimary =
        (window.parentPhonePrimary || (callParentBtn && callParentBtn.dataset.phone) || (sendSosBtn && sendSosBtn.dataset.phone) || "").trim();

    let toastTimeout = null;

    function showToast(message) {
        if (!toastNotification) {
            alert(message);
            return;
        }

        toastNotification.textContent = message;
        toastNotification.classList.add("show");

        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        toastTimeout = setTimeout(function () {
            toastNotification.classList.remove("show");
        }, 3500);
    }

    /* =========================================================
       1. CALL PARENT BUTTON
       ========================================================= */
    if (callParentBtn) {
        callParentBtn.addEventListener("click", function (e) {
            e.preventDefault();

            if (!parentPhonePrimary) {
                showToast("No emergency contact registered.");
                return;
            }

            // Direct dialer trigger
            window.location.href = `tel:${parentPhonePrimary}`;
        });
    }

    /* =========================================================
       2. SOS ALERT BUTTON & SMS APP TRIGGER
       ========================================================= */
    function openConfirmModal() {
        if (sosConfirmModal) {
            sosConfirmModal.style.display = "flex";
            sosConfirmModal.setAttribute("aria-hidden", "false");
        }
    }

    function closeConfirmModal() {
        if (sosConfirmModal) {
            sosConfirmModal.style.display = "none";
            sosConfirmModal.setAttribute("aria-hidden", "true");
        }
    }

    // Step 1: When clicked, show confirmation modal
    if (sendSosBtn) {
        sendSosBtn.addEventListener("click", function (e) {
            e.preventDefault();

            if (!parentPhonePrimary) {
                showToast("No emergency contact registered.");
                return;
            }

            openConfirmModal();
        });
    }

    // Cancel modal
    if (cancelSosBtn) {
        cancelSosBtn.addEventListener("click", function () {
            closeConfirmModal();
        });
    }

    // Step 2: If confirmed, open user's default SMS app with pre-filled recipient and body
    if (confirmSosBtn) {
        confirmSosBtn.addEventListener("click", function () {
            closeConfirmModal();

            if (!parentPhonePrimary) {
                showToast("No emergency contact registered.");
                return;
            }

            const message = encodeURIComponent(
                "SOS! I need help. This alert was sent from Companio. Please contact me immediately."
            );

            // iOS / iPhone uses &body= delimiter; Android and standard use ?body=
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            const smsDelimiter = isIOS ? "&" : "?";

            window.location.href = `sms:${parentPhonePrimary}${smsDelimiter}body=${message}`;
        });
    }

    // Dismiss modal on backdrop click
    window.addEventListener("click", function (e) {
        if (e.target === sosConfirmModal) {
            closeConfirmModal();
        }
    });

    // Dismiss on Escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeConfirmModal();
        }
    });

});