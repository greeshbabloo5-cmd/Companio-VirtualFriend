(function () {
    const savedTheme =
        localStorage.getItem("companio_theme") || "light";

    document.documentElement.setAttribute(
        "data-theme",
        savedTheme
    );

    window.CompanioTheme = {
        get() {
            return localStorage.getItem("companio_theme") || "light";
        },

        set(theme) {
            localStorage.setItem("companio_theme", theme);
            document.documentElement.setAttribute(
                "data-theme",
                theme
            );

            window.dispatchEvent(
                new CustomEvent("companio-theme-change", {
                    detail: { theme }
                })
            );
        }
    };
})();
