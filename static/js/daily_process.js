document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =====================================================
           ELEMENTS
        ===================================================== */

        const todayMoodElement =
            document.getElementById("todayMood");

        const streakElement =
            document.getElementById("currentStreak");

        const wellnessElement =
            document.getElementById("wellnessScore");

        const analysisElement =
            document.getElementById("analysisText");

        const achievementList =
            document.getElementById("achievementList");

        const recommendationGrid =
            document.getElementById("recommendationGrid");


        /* =====================================================
           DATA FROM FLASK
        ===================================================== */

        let progressPayload = {};
        const progressDataElement =
            document.getElementById("progressData");

        if (
            progressDataElement &&
            progressDataElement.textContent
        ) {
            try {
                progressPayload =
                    JSON.parse(progressDataElement.textContent);
            } catch (err) {
                console.error("Error parsing progressData:", err);
            }
        }

        const latestMood =
            progressPayload.latestMood || null;

        const moodHistory =
            Array.isArray(progressPayload.moodHistory)
                ? progressPayload.moodHistory
                : [];

        const moodStatistics =
            Array.isArray(progressPayload.moodStatistics)
                ? progressPayload.moodStatistics
                : [];

        const todayMoodDisplay =
            progressPayload.todayMoodDisplay || null;

        const currentStreakDisplay =
            progressPayload.currentStreakDisplay || null;

        const wellnessScoreDisplay =
            progressPayload.wellnessScoreDisplay || null;


        /* =====================================================
           MOOD INFORMATION
        ===================================================== */

        const moodInfo = {

            happy: {
                emoji: "😊",
                label: "Happy"
            },

            joy: {
                emoji: "😊",
                label: "Happy"
            },

            love: {
                emoji: "😊",
                label: "Happy"
            },

            calm: {
                emoji: "😌",
                label: "Calm"
            },

            relaxed: {
                emoji: "😌",
                label: "Calm"
            },

            peaceful: {
                emoji: "😌",
                label: "Calm"
            },

            sad: {
                emoji: "😔",
                label: "Sad"
            },

            sadness: {
                emoji: "😔",
                label: "Sad"
            },

            stressed: {
                emoji: "😣",
                label: "Stressed"
            },

            fear: {
                emoji: "😣",
                label: "Stressed"
            },

            anxious: {
                emoji: "😣",
                label: "Stressed"
            },

            angry: {
                emoji: "😠",
                label: "Angry"
            },

            anger: {
                emoji: "😠",
                label: "Angry"
            },

            excited: {
                emoji: "🤩",
                label: "Excited"
            },

            surprise: {
                emoji: "🤩",
                label: "Excited"
            },

            surprised: {
                emoji: "🤩",
                label: "Excited"
            },

            tired: {
                emoji: "😔",
                label: "Sad"
            },

            energetic: {
                emoji: "🤩",
                label: "Excited"
            }

        };


        /* =====================================================
           TODAY'S MOOD
        ===================================================== */

        function displayTodayMood() {

            if (todayMoodDisplay) {
                todayMoodElement.textContent = todayMoodDisplay;
                return;
            }

            const mood =
                String(latestMood || "")
                .toLowerCase();


            if (
                mood &&
                moodInfo[mood]
            ) {

                todayMoodElement.textContent =
                    `${moodInfo[mood].emoji} ${moodInfo[mood].label}`;

            }

            else {

                todayMoodElement.textContent =
                    "🌿 No mood yet";

            }

        }


        displayTodayMood();



        /* =====================================================
           NORMALIZE HISTORY
        ===================================================== */

        const history =
            Array.isArray(moodHistory)
                ? moodHistory
                : [];


        /* =====================================================
           DATE HELPERS
        ===================================================== */

        function getDateKey(date) {

            const year =
                date.getFullYear();

            const month =
                String(
                    date.getMonth() + 1
                ).padStart(2, "0");

            const day =
                String(
                    date.getDate()
                ).padStart(2, "0");

            return `${year}-${month}-${day}`;

        }


        function getLastSevenDays() {

            const days = [];

            const today =
                new Date();


            today.setHours(
                0,
                0,
                0,
                0
            );


            for (
                let i = 6;
                i >= 0;
                i--
            ) {

                const date =
                    new Date(today);


                date.setDate(
                    today.getDate() - i
                );


                days.push(date);

            }


            return days;

        }



        /* =====================================================
           CURRENT STREAK
        ===================================================== */

        function calculateStreak() {

            if (history.length === 0) {

                return 0;

            }


            const loggedDates =
                new Set();


            history.forEach(
                function (item) {

                    if (!item.created_at) {

                        return;

                    }


                    const date =
                        new Date(
                            item.created_at
                        );


                    if (
                        !isNaN(
                            date.getTime()
                        )
                    ) {

                        loggedDates.add(
                            getDateKey(date)
                        );

                    }

                }
            );


            let streak = 0;

            const today =
                new Date();


            today.setHours(
                0,
                0,
                0,
                0
            );


            /* Check today first */

            let checkDate =
                new Date(today);


            if (
                !loggedDates.has(
                    getDateKey(checkDate)
                )
            ) {

                /* Allow a streak that ended yesterday */

                checkDate.setDate(
                    checkDate.getDate() - 1
                );


                if (
                    !loggedDates.has(
                        getDateKey(checkDate)
                    )
                ) {

                    return 0;

                }

            }


            while (
                loggedDates.has(
                    getDateKey(checkDate)
                )
            ) {

                streak++;


                checkDate.setDate(
                    checkDate.getDate() - 1
                );

            }


            return streak;

        }


        const streak =
            calculateStreak();


        if (currentStreakDisplay) {
            streakElement.textContent = currentStreakDisplay;
        } else {
            streakElement.textContent =
                `${streak} ${streak === 1 ? "Day" : "Days"}`;
        }



        /* =====================================================
           MOOD BALANCE
        ===================================================== */

        function calculateMoodBalance() {

            if (history.length === 0) {

                return 0;

            }


            const scoreMap = {
                happy: 100,
                joy: 100,
                love: 100,
                excited: 95,
                surprise: 95,
                surprised: 95,
                energetic: 95,
                calm: 90,
                relaxed: 90,
                peaceful: 90,
                neutral: 70,
                sad: 40,
                sadness: 40,
                tired: 40,
                stressed: 30,
                fear: 30,
                anxious: 30,
                angry: 20,
                anger: 20
            };


            let totalScore = 0;

            history.forEach(
                function (item) {

                    const mood =
                        String(
                            item.emotion || ""
                        ).toLowerCase();

                    totalScore += (scoreMap[mood] !== undefined ? scoreMap[mood] : 70);

                }
            );


            return Math.round(
                totalScore / history.length
            );

        }


        const moodBalance =
            calculateMoodBalance();


        if (wellnessScoreDisplay) {
            wellnessElement.textContent = wellnessScoreDisplay;
        } else {
            wellnessElement.textContent =
                `${moodBalance}%`;
        }



        /* =====================================================
           WEEKLY TREND DATA
        ===================================================== */

        const days =
            getLastSevenDays();


        const labels =
            days.map(
                function (date) {

                    return date.toLocaleDateString(
                        "en-IN",
                        {
                            weekday: "short"
                        }
                    );

                }
            );


        const dailyMoodValues =
            days.map(
                function (date) {

                    const dateKey =
                        getDateKey(date);


                    const moodsForDay =
                        history.filter(
                            function (item) {

                                if (
                                    !item.created_at
                                ) {

                                    return false;

                                }


                                const itemDate =
                                    new Date(
                                        item.created_at
                                    );


                                return (
                                    getDateKey(
                                        itemDate
                                    ) === dateKey
                                );

                            }
                        );


                    if (
                        moodsForDay.length === 0
                    ) {

                        return null;

                    }


                    /*
                     * Simple mood scale for
                     * visualization only.
                     */

                    const values = {

                        sad: 1,

                        stressed: 2,

                        tired: 3,

                        calm: 4,

                        happy: 5,

                        energetic: 5

                    };


                    const total =
                        moodsForDay.reduce(
                            function (
                                sum,
                                item
                            ) {

                                return (
                                    sum +
                                    (
                                        values[
                                            String(
                                                item.emotion ||
                                                ""
                                            ).toLowerCase()
                                        ] || 3
                                    )
                                );

                            },
                            0
                        );


                    return Number(
                        (
                            total /
                            moodsForDay.length
                        ).toFixed(1)
                    );

                }
            );



        /* =====================================================
           MOOD TREND CHART
        ===================================================== */

        let lineChartInstance = null;
        let pieChartInstance = null;

        const moodCanvas =
            document.getElementById(
                "moodChart"
            );


        if (moodCanvas) {

            lineChartInstance = new Chart(
                moodCanvas,
                {

                    type: "line",

                    data: {

                        labels: labels,

                        datasets: [

                            {

                                label:
                                    "Mood level",

                                data:
                                    dailyMoodValues,

                                tension: 0.4,

                                spanGaps: true,

                                borderWidth: 3,

                                borderColor: "#7C3AED",

                                backgroundColor: "rgba(124, 58, 237, 0.12)",

                                pointBackgroundColor: "#7C3AED",

                                pointBorderColor: "#ffffff",

                                pointBorderWidth: 2,

                                pointRadius: 5,

                                pointHoverRadius: 7,

                                fill: true

                            }

                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        scales: {

                            x: {
                                ticks: {
                                    color: "#687386"
                                },
                                grid: {
                                    color: "rgba(124, 58, 237, 0.08)"
                                }
                            },

                            y: {

                                min: 1,

                                max: 5,

                                grid: {
                                    color: "rgba(124, 58, 237, 0.08)"
                                },

                                ticks: {

                                    color: "#687386",

                                    stepSize: 1,

                                    callback:
                                        function (
                                            value
                                        ) {

                                            const labels = {

                                                1: "Sad",

                                                2: "Stressed",

                                                3: "Tired",

                                                4: "Calm",

                                                5: "Positive"

                                            };


                                            return (
                                                labels[
                                                    value
                                                ] ||
                                                value
                                            );

                                        }

                                }

                            }

                        },

                        plugins: {

                            legend: {

                                display: false

                            }

                        }

                    }

                }
            );

        }



        /* =====================================================
           MOOD DISTRIBUTION
        ===================================================== */

        const moodCounts = {};

        if (Array.isArray(moodStatistics) && moodStatistics.length > 0) {
            moodStatistics.forEach(
                function (item) {

                    const rawEmotion =
                        String(
                            item.emotion || ""
                        ).trim().toLowerCase();

                    if (!rawEmotion) {
                        return;
                    }

                    const label =
                        moodInfo[rawEmotion]?.label ||
                        (item.emotion
                            ? String(item.emotion).charAt(0).toUpperCase() + String(item.emotion).slice(1)
                            : "Other");

                    const count =
                        Number(item.count) || 0;

                    moodCounts[label] =
                        (moodCounts[label] || 0) + count;

                }
            );
        } else if (Array.isArray(history) && history.length > 0) {
            history.forEach(
                function (item) {

                    const rawEmotion =
                        String(
                            item.emotion || ""
                        ).trim().toLowerCase();

                    if (!rawEmotion) {
                        return;
                    }

                    const label =
                        moodInfo[rawEmotion]?.label ||
                        (item.emotion
                            ? String(item.emotion).charAt(0).toUpperCase() + String(item.emotion).slice(1)
                            : "Other");

                    moodCounts[label] =
                        (moodCounts[label] || 0) + 1;

                }
            );
        }

        const distributionLabels =
            Object.keys(moodCounts);

        const distributionValues =
            Object.values(moodCounts);


        const pieCanvas =
            document.getElementById(
                "pieChart"
            );


        if (pieCanvas) {

            pieChartInstance = new Chart(
                pieCanvas,
                {

                    type: "doughnut",

                    data: {

                        labels:
                            distributionLabels,

                        datasets: [

                            {

                                data:
                                    distributionValues,

                                backgroundColor: [
                                    "#7C3AED",
                                    "#8B5CF6",
                                    "#A78BFA",
                                    "#C4B5FD",
                                    "#DDD6FE",
                                    "#6D28D9"
                                ],

                                borderColor: "#ffffff",

                                borderWidth: 2

                            }

                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        cutout: "65%",

                        plugins: {

                            legend: {

                                position:
                                    "bottom",

                                labels: {
                                    color: "#687386"
                                }

                            }

                        }

                    }

                }
            );

        }

        /* Dynamic Chart Theme Updater */
        function updateChartsTheme(theme) {
            const currentTheme = theme || document.documentElement.getAttribute("data-theme") || localStorage.getItem("companio_theme") || "light";
            const isDark = (currentTheme === "dark");
            const textColor = isDark ? "#c8c1d9" : "#687386";
            const gridColor = isDark ? "rgba(167, 139, 250, 0.14)" : "rgba(124, 58, 237, 0.08)";
            const pieBorder = isDark ? "#1d1630" : "#ffffff";

            if (lineChartInstance) {
                if (lineChartInstance.options.scales && lineChartInstance.options.scales.x) {
                    lineChartInstance.options.scales.x.ticks = lineChartInstance.options.scales.x.ticks || {};
                    lineChartInstance.options.scales.x.ticks.color = textColor;
                    lineChartInstance.options.scales.x.grid = lineChartInstance.options.scales.x.grid || {};
                    lineChartInstance.options.scales.x.grid.color = gridColor;
                }
                if (lineChartInstance.options.scales && lineChartInstance.options.scales.y) {
                    lineChartInstance.options.scales.y.ticks = lineChartInstance.options.scales.y.ticks || {};
                    lineChartInstance.options.scales.y.ticks.color = textColor;
                    lineChartInstance.options.scales.y.grid = lineChartInstance.options.scales.y.grid || {};
                    lineChartInstance.options.scales.y.grid.color = gridColor;
                }
                lineChartInstance.update();
            }

            if (pieChartInstance) {
                if (pieChartInstance.data && pieChartInstance.data.datasets && pieChartInstance.data.datasets[0]) {
                    pieChartInstance.data.datasets[0].borderColor = pieBorder;
                }
                if (pieChartInstance.options.plugins && pieChartInstance.options.plugins.legend) {
                    pieChartInstance.options.plugins.legend.labels = pieChartInstance.options.plugins.legend.labels || {};
                    pieChartInstance.options.plugins.legend.labels.color = textColor;
                }
                pieChartInstance.update();
            }
        }

        const initialThemeMode = document.documentElement.getAttribute("data-theme") || localStorage.getItem("companio_theme") || "light";
        updateChartsTheme(initialThemeMode);

        window.addEventListener("companio-theme-change", function (e) {
            const theme = (e.detail && e.detail.theme) ? e.detail.theme : (document.documentElement.getAttribute("data-theme") || "light");
            updateChartsTheme(theme);
        });

        if (window.MutationObserver) {
            const themeObserver = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
                        updateChartsTheme(document.documentElement.getAttribute("data-theme"));
                    }
                });
            });
            themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        }



        /* =====================================================
           AI MOOD ANALYSIS
        ===================================================== */

        function generateAnalysis() {

            if (
                history.length === 0
            ) {

                return (
                    "You haven't recorded a mood yet. " +
                    "Use Give Feedback in For You to start " +
                    "building your personal mood history."
                );

            }


            const counts = {};


            history.forEach(
                function (item) {

                    const mood =
                        String(
                            item.emotion || ""
                        ).toLowerCase();


                    if (!mood) {

                        return;

                    }


                    counts[mood] =
                        (
                            counts[mood] || 0
                        ) + 1;

                }
            );


            const sorted =
                Object.entries(
                    counts
                ).sort(
                    function (a, b) {

                        return b[1] - a[1];

                    }
                );


            const dominantMood =
                sorted.length
                    ? sorted[0][0]
                    : null;


            if (!dominantMood) {

                return (
                    "Keep recording your mood " +
                    "so Companio can understand your " +
                    "recent emotional patterns."
                );

            }


            const label =
                moodInfo[
                    dominantMood
                ]?.label ||
                dominantMood;


            if (
                dominantMood === "happy"
            ) {

                return (
                    `Your most frequently recorded mood ` +
                    `this week is ${label}. ` +
                    `Keep noticing the activities and moments ` +
                    `that support this feeling.`
                );

            }


            if (
                dominantMood === "calm"
            ) {

                return (
                    `Your recent mood history shows ` +
                    `a calm pattern. Continue making space ` +
                    `for activities that help you feel balanced.`
                );

            }


            if (
                dominantMood === "energetic"
            ) {

                return (
                    `You've recorded an energetic mood ` +
                    `frequently recently. Consider using ` +
                    `that energy for activities you enjoy.`
                );

            }


            if (
                dominantMood === "tired"
            ) {

                return (
                    `Tired is appearing often in your recent ` +
                    `mood entries. Consider giving yourself ` +
                    `time for rest and gentle activities.`
                );

            }


            if (
                dominantMood === "stressed"
            ) {

                return (
                    `Stressed is appearing frequently in your ` +
                    `recent mood entries. A short breathing ` +
                    `exercise or quiet activity may be a useful ` +
                    `self-care option.`
                );

            }


            if (
                dominantMood === "sad"
            ) {

                return (
                    `Sad is appearing frequently in your recent ` +
                    `mood entries. Consider using Companio ` +
                    `for a supportive conversation or choosing ` +
                    `a gentle wellness activity.`
                );

            }


            return (
                `Your recent mood history is mainly ` +
                `${label}. Keep checking in with yourself ` +
                `and exploring activities that feel supportive.`
            );

        }


        analysisElement.textContent =
            generateAnalysis();



        /* =====================================================
           TODAY'S ACHIEVEMENTS
        ===================================================== */

        function updateAchievements() {

            const today =
                new Date();


            const todayKey =
                getDateKey(today);


            const loggedToday =
                history.some(
                    function (item) {

                        if (
                            !item.created_at
                        ) {

                            return false;

                        }


                        return (
                            getDateKey(
                                new Date(
                                    item.created_at
                                )
                            ) === todayKey
                        );

                    }
                );


            achievementList.innerHTML = "";


            if (loggedToday) {

                const item =
                    document.createElement(
                        "li"
                    );

                item.textContent =
                    "✅ Logged today's mood";

                achievementList.appendChild(
                    item
                );

            }

            else {

                const item =
                    document.createElement(
                        "li"
                    );

                item.textContent =
                    "🌿 Log your mood today from For You.";

                achievementList.appendChild(
                    item
                );

            }


            if (
                history.length >= 3
            ) {

                const item =
                    document.createElement(
                        "li"
                    );

                item.textContent =
                    "✨ Made multiple mood check-ins this week";

                achievementList.appendChild(
                    item
                );

            }


            if (
                streak >= 2
            ) {

                const item =
                    document.createElement(
                        "li"
                    );

                item.textContent =
                    `🔥 Maintained a ${streak}-day mood streak`;

                achievementList.appendChild(
                    item
                );

            }

        }


        updateAchievements();



        /* =====================================================
           RECOMMENDATIONS
        ===================================================== */

        const recommendations = {

            happy: [

                {
                    icon: "🎵",
                    title: "Keep the Energy Going",
                    text:
                        "Explore music that matches your positive mood."
                },

                {
                    icon: "✨",
                    title: "Daily Motivation",
                    text:
                        "Read a positive thought and carry the energy forward."
                },

                {
                    icon: "🌿",
                    title: "Wellness Activity",
                    text:
                        "Try a simple activity to maintain your balanced mood."
                }

            ],


            calm: [

                {
                    icon: "🌧️",
                    title: "Relaxing Sounds",
                    text:
                        "Enjoy rain, ocean or forest sounds for a peaceful break."
                },

                {
                    icon: "🧘",
                    title: "Meditation",
                    text:
                        "Take a few quiet minutes for mindful breathing."
                },

                {
                    icon: "📖",
                    title: "Journaling",
                    text:
                        "Write down a few thoughts about your day."
                }

            ],


            sad: [

                {
                    icon: "💜",
                    title: "Continue Chat",
                    text:
                        "Talk with Companio if you would like some company."
                },

                {
                    icon: "🎵",
                    title: "Comfort Music",
                    text:
                        "Explore gentle music that fits your current mood."
                },

                {
                    icon: "🌿",
                    title: "Gentle Wellness",
                    text:
                        "Try a simple wellness activity at your own pace."
                }

            ],


            stressed: [

                {
                    icon: "🌬️",
                    title: "Breathing Exercise",
                    text:
                        "Take a short guided breathing break."
                },

                {
                    icon: "🌧️",
                    title: "Relaxing Sounds",
                    text:
                        "Try peaceful background sounds for a quiet moment."
                },

                {
                    icon: "💬",
                    title: "Continue Chat",
                    text:
                        "Talk with Companio if you want a supportive conversation."
                }

            ],


            tired: [

                {
                    icon: "🌙",
                    title: "Relaxation",
                    text:
                        "Choose a gentle relaxation activity."
                },

                {
                    icon: "🎵",
                    title: "Calm Music",
                    text:
                        "Listen to slower music while taking a break."
                },

                {
                    icon: "🧘",
                    title: "Quiet Time",
                    text:
                        "Try a short meditation or breathing activity."
                }

            ],


            energetic: [

                {
                    icon: "🚶",
                    title: "Take a Walk",
                    text:
                        "Use your energy for a short movement break."
                },

                {
                    icon: "🎵",
                    title: "Music",
                    text:
                        "Play something upbeat and enjoy your mood."
                },

                {
                    icon: "✨",
                    title: "Daily Motivation",
                    text:
                        "Use your energy to work toward a small goal."
                }

            ]

        };


        function displayRecommendations() {

            recommendationGrid.innerHTML = "";


            const rawMood =
                String(
                    latestMood || ""
                ).toLowerCase();

            const moodMap = {
                joy: "happy",
                love: "happy",
                sadness: "sad",
                fear: "stressed",
                anxious: "stressed",
                anger: "angry",
                surprise: "energetic",
                surprised: "energetic"
            };

            const mood =
                moodMap[rawMood] || rawMood;


            const selected =
                recommendations[mood] ||
                recommendations.calm;


            selected.forEach(
                function (item) {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "recommend-card";


                    card.innerHTML = `

                        <div class="recommend-icon">
                            ${item.icon}
                        </div>

                        <h3>
                            ${item.title}
                        </h3>

                        <p>
                            ${item.text}
                        </p>

                    `;


                    recommendationGrid.appendChild(
                        card
                    );

                }
            );

        }


        displayRecommendations();

    }

);