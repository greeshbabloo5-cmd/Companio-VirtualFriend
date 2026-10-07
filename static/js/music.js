document.addEventListener("DOMContentLoaded", function () {

    const moodButtons = document.querySelectorAll(".mood-btn");
    const languageButtons = document.querySelectorAll(".language");

    const moodResult = document.getElementById("moodResult");
    const recommendationTitle = document.getElementById("recommendationTitle");
    const recommendationSubtitle = document.getElementById("recommendationSubtitle");
    const recommendationGrid = document.getElementById("recommendationGrid");

    let selectedMood = null;
    let selectedLanguage = "All";


    /* =====================================================
       SONG DATABASE
    ===================================================== */

    const songs = [

        /* ================= ENGLISH ================= */

        {
            title: "Happy",
            artist: "Pharrell Williams",
            language: "English",
            moods: ["happy", "energetic"]
        },

        {
            title: "Count on Me",
            artist: "Bruno Mars",
            language: "English",
            moods: ["happy", "calm"]
        },

        {
            title: "Perfect",
            artist: "Ed Sheeran",
            language: "English",
            moods: ["calm", "tired"]
        },

        {
            title: "Fix You",
            artist: "Coldplay",
            language: "English",
            moods: ["sad", "stressed"]
        },

        {
            title: "A Sky Full of Stars",
            artist: "Coldplay",
            language: "English",
            moods: ["happy", "energetic"]
        },


        /* ================= HINDI ================= */

        {
            title: "Ilahi",
            artist: "Arijit Singh",
            language: "Hindi",
            moods: ["happy", "energetic"]
        },

        {
            title: "Love You Zindagi",
            artist: "Jasleen Royal",
            language: "Hindi",
            moods: ["happy", "calm"]
        },

        {
            title: "Safarnama",
            artist: "Lucky Ali",
            language: "Hindi",
            moods: ["calm", "tired"]
        },

        {
            title: "Phir Le Aya Dil",
            artist: "Arijit Singh",
            language: "Hindi",
            moods: ["sad", "calm"]
        },

        {
            title: "Zinda",
            artist: "Siddharth Mahadevan",
            language: "Hindi",
            moods: ["energetic"]
        },


        /* ================= KANNADA ================= */

        {
            title: "Belageddu",
            artist: "Vijay Prakash",
            language: "Kannada",
            moods: ["happy", "calm"]
        },

        {
            title: "Anisuthide",
            artist: "Sonu Nigam",
            language: "Kannada",
            moods: ["calm", "sad"]
        },

        {
            title: "Bombe Helutaithe",
            artist: "Vijay Prakash",
            language: "Kannada",
            moods: ["calm", "sad"]
        },

        {
            title: "Neenade Naa",
            artist: "Shreya Ghoshal",
            language: "Kannada",
            moods: ["calm", "tired"]
        },


        /* ================= TELUGU ================= */

        {
            title: "Samajavaragamana",
            artist: "Sid Sriram",
            language: "Telugu",
            moods: ["calm", "happy"]
        },

        {
            title: "Inkem Inkem Inkem Kaavaale",
            artist: "Sid Sriram",
            language: "Telugu",
            moods: ["calm", "happy"]
        },

        {
            title: "Life of Ram",
            artist: "Pradeep Kumar",
            language: "Telugu",
            moods: ["sad", "calm"]
        },

        {
            title: "Butta Bomma",
            artist: "Armaan Malik",
            language: "Telugu",
            moods: ["happy", "energetic"]
        },


        /* ================= TAMIL ================= */

        {
            title: "Megham Karukatha",
            artist: "Dhanush",
            language: "Tamil",
            moods: ["happy", "calm"]
        },

        {
            title: "Munbe Vaa",
            artist: "Shreya Ghoshal",
            language: "Tamil",
            moods: ["calm", "tired"]
        },

        {
            title: "The Life of Ram",
            artist: "Pradeep Kumar",
            language: "Tamil",
            moods: ["sad", "calm"]
        },

        {
            title: "Vaathi Coming",
            artist: "Anirudh Ravichander",
            language: "Tamil",
            moods: ["energetic", "happy"]
        },


        /* ================= MALAYALAM ================= */

        {
            title: "Malare",
            artist: "Vijay Yesudas",
            language: "Malayalam",
            moods: ["calm", "happy"]
        },

        {
            title: "Darshana",
            artist: "Hesham Abdul Wahab",
            language: "Malayalam",
            moods: ["happy", "calm"]
        },

        {
            title: "Pavizha Mazha",
            artist: "K. S. Harisankar",
            language: "Malayalam",
            moods: ["calm", "tired"]
        },

        {
            title: "Cherathukal",
            artist: "Sithara Krishnakumar",
            language: "Malayalam",
            moods: ["sad", "calm"]
        }

    ];


    /* =====================================================
       MOOD TEXT
    ===================================================== */

    const moodData = {

        happy: {
            emoji: "😊",
            title: "Music for Your Happy Mood",
            message: "Let's keep your positive energy going!",
            subtitle: "Cheerful and feel-good songs selected for you."
        },

        sad: {
            emoji: "💙",
            title: "Music for Comfort",
            message: "Here are some gentle songs for this moment.",
            subtitle: "Soft and comforting music selected for you."
        },

        calm: {
            emoji: "😌",
            title: "Stay in Your Calm",
            message: "Let's keep this peaceful mood going.",
            subtitle: "Relaxing music for your calm state of mind."
        },

        stressed: {
            emoji: "🌿",
            title: "Music to Help You Unwind",
            message: "Let's slow things down for a little while.",
            subtitle: "Gentle music selected for a quieter moment."
        },

        energetic: {
            emoji: "⚡",
            title: "Energy Boost",
            message: "Let's find music that matches your energy!",
            subtitle: "Upbeat tracks selected for your energetic mood."
        },

        tired: {
            emoji: "🌙",
            title: "Slow Down & Recharge",
            message: "Something gentle might feel good right now.",
            subtitle: "Slow and peaceful songs selected for you."
        }

    };


    /* =====================================================
       MOOD BUTTON CLICK
    ===================================================== */

    moodButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            moodButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            selectedMood = button.dataset.mood;

            const mood = moodData[selectedMood];

            moodResult.innerHTML =
                mood.emoji + " " + mood.message;

            recommendationTitle.textContent =
                mood.emoji + " " + mood.title;

            recommendationSubtitle.textContent =
                mood.subtitle;

            displayRecommendations();

        });

    });


    /* =====================================================
       LANGUAGE BUTTON CLICK
    ===================================================== */

    languageButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            languageButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            selectedLanguage =
                button.textContent.trim();

            displayRecommendations();

        });

    });


    /* =====================================================
       DISPLAY RECOMMENDATIONS
    ===================================================== */

    function displayRecommendations() {

        if (!selectedMood) {

            recommendationGrid.innerHTML = `
                <div class="empty-music-state">

                    <div class="empty-music-icon">
                        🎧
                    </div>

                    <h3>
                        Choose your mood
                    </h3>

                    <p>
                        Tell Companio how you're feeling
                        to get personalized music suggestions.
                    </p>

                </div>
            `;

            return;
        }


        let filteredSongs = songs.filter(function (song) {

            const matchesMood =
                song.moods.includes(selectedMood);

            const matchesLanguage =
                selectedLanguage === "All" ||
                song.language === selectedLanguage;

            return matchesMood && matchesLanguage;

        });


        recommendationGrid.innerHTML = "";


        if (filteredSongs.length === 0) {

            recommendationGrid.innerHTML = `
                <div class="empty-music-state">

                    <div class="empty-music-icon">
                        🎵
                    </div>

                    <h3>
                        No songs found
                    </h3>

                    <p>
                        Try selecting another language
                        or mood.
                    </p>

                </div>
            `;

            return;
        }


        filteredSongs.forEach(function (song) {

            const card =
                document.createElement("div");

            card.className = "song-card";


            card.innerHTML = `

                <div class="song-art">

                    <div class="song-note">
                        <i class="fa-solid fa-music"></i>
                    </div>

                    <span class="song-language">
                        ${song.language}
                    </span>

                </div>


                <div class="song-info">

                    <h3>
                        ${song.title}
                    </h3>

                    <p>
                        ${song.artist}
                    </p>

                </div>


                <button
                    class="song-play-btn"
                    data-title="${song.title}"
                    data-artist="${song.artist}">

                    <i class="fa-brands fa-youtube"></i>

                    Play

                </button>

            `;


            recommendationGrid.appendChild(card);

        });


        /* Attach play buttons */

        const playButtons =
            document.querySelectorAll(".song-play-btn");


        playButtons.forEach(function (button) {

            button.addEventListener("click", function () {

                const title =
                    this.dataset.title;

                const artist =
                    this.dataset.artist;


                openSong(title, artist);

            });

        });

    }


    /* =====================================================
       OPEN SONG ON YOUTUBE
    ===================================================== */

    function openSong(title, artist) {

        const search =
            encodeURIComponent(
                title + " " + artist + " official song"
            );


        const youtubeURL =
            "https://www.youtube.com/results?search_query=" +
            search;


        window.open(
            youtubeURL,
            "_blank",
            "noopener,noreferrer"
        );

    }
/* =====================================================
   ALBUMS & PLAYLISTS
===================================================== */

const playlistButtons =
    document.querySelectorAll(".playlist-card");

const playlistResult =
    document.getElementById("playlistResult");

const playlistTitle =
    document.getElementById("playlistTitle");

const playlistDescription =
    document.getElementById("playlistDescription");

const playlistSongs =
    document.getElementById("playlistSongs");

const closePlaylist =
    document.getElementById("closePlaylist");


/* =====================================================
   PLAYLIST DATA
===================================================== */

const playlists = {

    /* ===============================================
       MORNING
    =============================================== */

    morning: {

        emoji: "🌅",

        title: "Morning Motivation",

        description:
            "Positive and energetic songs to start your day.",

        songs: [

            {
                title: "Ilahi",
                artist: "Arijit Singh",
                language: "Hindi"
            },

            {
                title: "Happy",
                artist: "Pharrell Williams",
                language: "English"
            },

            {
                title: "Belageddu",
                artist: "Vijay Prakash",
                language: "Kannada"
            },

            {
                title: "Butta Bomma",
                artist: "Armaan Malik",
                language: "Telugu"
            },

            {
                title: "Vaathi Coming",
                artist: "Anirudh Ravichander",
                language: "Tamil"
            },

            {
                title: "Darshana",
                artist: "Hesham Abdul Wahab",
                language: "Malayalam"
            }

        ]

    },


    /* ===============================================
       STUDY
    =============================================== */

    study: {

        emoji: "📚",

        title: "Study & Focus",

        description:
            "Calm music for studying, reading and concentration.",

        songs: [

            {
                title: "Perfect",
                artist: "Ed Sheeran",
                language: "English"
            },

            {
                title: "Safarnama",
                artist: "Lucky Ali",
                language: "Hindi"
            },

            {
                title: "Anisuthide",
                artist: "Sonu Nigam",
                language: "Kannada"
            },

            {
                title: "Samajavaragamana",
                artist: "Sid Sriram",
                language: "Telugu"
            },

            {
                title: "Munbe Vaa",
                artist: "Shreya Ghoshal",
                language: "Tamil"
            },

            {
                title: "Pavizha Mazha",
                artist: "K. S. Harisankar",
                language: "Malayalam"
            }

        ]

    },


    /* ===============================================
       NIGHT
    =============================================== */

    night: {

        emoji: "🌙",

        title: "Night Calm",

        description:
            "Slow and peaceful music for relaxing at night.",

        songs: [

            {
                title: "Perfect",
                artist: "Ed Sheeran",
                language: "English"
            },

            {
                title: "Phir Le Aya Dil",
                artist: "Arijit Singh",
                language: "Hindi"
            },

            {
                title: "Neenade Naa",
                artist: "Shreya Ghoshal",
                language: "Kannada"
            },

            {
                title: "Life of Ram",
                artist: "Pradeep Kumar",
                language: "Telugu"
            },

            {
                title: "Munbe Vaa",
                artist: "Shreya Ghoshal",
                language: "Tamil"
            },

            {
                title: "Pavizha Mazha",
                artist: "K. S. Harisankar",
                language: "Malayalam"
            }

        ]

    },


    /* ===============================================
       FEEL BETTER
    =============================================== */

    feelbetter: {

        emoji: "❤️",

        title: "Feel Better",

        description:
            "Comforting and uplifting music for difficult moments.",

        songs: [

            {
                title: "Count on Me",
                artist: "Bruno Mars",
                language: "English"
            },

            {
                title: "Love You Zindagi",
                artist: "Jasleen Royal",
                language: "Hindi"
            },

            {
                title: "Bombe Helutaithe",
                artist: "Vijay Prakash",
                language: "Kannada"
            },

            {
                title: "Inkem Inkem Inkem Kaavaale",
                artist: "Sid Sriram",
                language: "Telugu"
            },

            {
                title: "Megham Karukatha",
                artist: "Dhanush",
                language: "Tamil"
            },

            {
                title: "Malare",
                artist: "Vijay Yesudas",
                language: "Malayalam"
            }

        ]

    }

};


/* =====================================================
   PLAYLIST CLICK
===================================================== */

playlistButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const selectedPlaylist =
            this.dataset.playlist;


        /* Remove old active state */

        playlistButtons.forEach(function (btn) {

            btn.classList.remove("active");

        });


        /* Add active state */

        this.classList.add("active");


        /* Show playlist */

        displayPlaylist(selectedPlaylist);

    });

});


/* =====================================================
   DISPLAY PLAYLIST
===================================================== */

function displayPlaylist(playlistName) {

    const playlist =
        playlists[playlistName];


    if (!playlist) {
        return;
    }


    /* Update title */

    playlistTitle.textContent =
        playlist.emoji + " " + playlist.title;


    /* Update description */

    playlistDescription.textContent =
        playlist.description;


    /* Clear previous songs */

    playlistSongs.innerHTML = "";


    /* Create song cards */

    playlist.songs.forEach(function (song) {

        const card =
            document.createElement("div");


        card.className =
            "playlist-song-card";


        card.innerHTML = `

            <div class="playlist-song-art">

                <i class="fa-solid fa-music"></i>

                <span>
                    ${song.language}
                </span>

            </div>


            <div class="playlist-song-details">

                <h3>
                    ${song.title}
                </h3>

                <p>
                    ${song.artist}
                </p>

            </div>


            <button
                class="playlist-play-btn"
                data-title="${song.title}"
                data-artist="${song.artist}">

                <i class="fa-brands fa-youtube"></i>

                Play

            </button>

        `;


        playlistSongs.appendChild(card);

    });


    /* Show playlist result */

    playlistResult.classList.add("show");


    /* Play buttons */

    const playButtons =
        playlistSongs.querySelectorAll(
            ".playlist-play-btn"
        );


    playButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const title =
                    this.dataset.title;

                const artist =
                    this.dataset.artist;


                /*
                   Reuse your EXISTING
                   openSong() function
                */

                openSong(
                    title,
                    artist
                );

            }
        );

    });


    /* Smooth scroll */

    setTimeout(function () {

        playlistResult.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }, 100);

}


/* =====================================================
   CLOSE PLAYLIST
===================================================== */

if (closePlaylist) {

    closePlaylist.addEventListener(
        "click",
        function () {

            playlistResult
                .classList.remove("show");


            playlistButtons.forEach(
                function (button) {

                    button.classList.remove(
                        "active"
                    );

                }
            );

        }
    );

}

    /* =====================================================
       INITIAL SCREEN
    ===================================================== */

    displayRecommendations();

});
/* =====================================================
   FILM & MOVIE MUSIC
===================================================== */

const cinemaButtons =
    document.querySelectorAll(".cinema-card");

const cinemaSongsSection =
    document.getElementById("cinemaSongsSection");

const cinemaSongsGrid =
    document.getElementById("cinemaSongsGrid");

const cinemaTitle =
    document.getElementById("cinemaTitle");

const cinemaSubtitle =
    document.getElementById("cinemaSubtitle");

const closeCinema =
    document.getElementById("closeCinema");


/* =====================================================
   CINEMA SONG DATABASE
===================================================== */

const cinemaSongs = {

    Hindi: [

        {
            title: "Ilahi",
            artist: "Arijit Singh",
            movie: "Yeh Jawaani Hai Deewani"
        },

        {
            title: "Kesariya",
            artist: "Arijit Singh",
            movie: "Brahmāstra"
        },

        {
            title: "Love You Zindagi",
            artist: "Jasleen Royal",
            movie: "Dear Zindagi"
        },

        {
            title: "Apna Bana Le",
            artist: "Arijit Singh",
            movie: "Bhediya"
        }

    ],


    Kannada: [

        {
            title: "Belageddu",
            artist: "Vijay Prakash",
            movie: "Kirik Party"
        },

        {
            title: "Anisuthide",
            artist: "Sonu Nigam",
            movie: "Mungaru Male"
        },

        {
            title: "Bombe Helutaithe",
            artist: "Vijay Prakash",
            movie: "Raajakumara"
        },

        {
            title: "Singara Siriye",
            artist: "Vijay Prakash",
            movie: "Kantara"
        }

    ],


    Telugu: [

        {
            title: "Samajavaragamana",
            artist: "Sid Sriram",
            movie: "Ala Vaikunthapurramuloo"
        },

        {
            title: "Inkem Inkem Inkem Kaavaale",
            artist: "Sid Sriram",
            movie: "Geetha Govindam"
        },

        {
            title: "Butta Bomma",
            artist: "Armaan Malik",
            movie: "Ala Vaikunthapurramuloo"
        },

        {
            title: "Oh Sita Hey Rama",
            artist: "S. P. Charan & Ramya Behara",
            movie: "Sita Ramam"
        }

    ],


    Tamil: [

        {
            title: "Megham Karukatha",
            artist: "Dhanush",
            movie: "Thiruchitrambalam"
        },

        {
            title: "Munbe Vaa",
            artist: "Shreya Ghoshal",
            movie: "Sillunu Oru Kadhal"
        },

        {
            title: "Vaathi Coming",
            artist: "Anirudh Ravichander",
            movie: "Master"
        },

        {
            title: "Arabic Kuthu",
            artist: "Anirudh Ravichander",
            movie: "Beast"
        }

    ]

};


/* =====================================================
   CINEMA CARD CLICK
===================================================== */

cinemaButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const cinema =
            this.dataset.cinema;


        /* Active cinema card */

        cinemaButtons.forEach(function (btn) {

            btn.classList.remove("active");

        });

        this.classList.add("active");


        showCinemaSongs(cinema);

    });

});


/* =====================================================
   DISPLAY CINEMA SONGS
===================================================== */

function showCinemaSongs(cinema) {

    const selectedSongs =
        cinemaSongs[cinema];


    cinemaTitle.innerHTML =
        "🎬 " + cinema + " Cinema";


    cinemaSubtitle.textContent =
        "Popular " +
        cinema +
        " movie songs selected for you.";


    cinemaSongsGrid.innerHTML = "";


    selectedSongs.forEach(function (song) {

        const card =
            document.createElement("div");


        card.className =
            "cinema-song-card";


        card.innerHTML = `

            <div class="cinema-album-art">

                <div class="cinema-music-icon">
                    <i class="fa-solid fa-music"></i>
                </div>

                <span class="movie-badge">
                    ${cinema}
                </span>

            </div>


            <div class="cinema-song-info">

                <h3>
                    ${song.title}
                </h3>

                <p class="cinema-artist">
                    ${song.artist}
                </p>

                <p class="movie-name">
                    🎬 ${song.movie}
                </p>

            </div>


            <button
                class="cinema-play-btn"
                data-title="${song.title}"
                data-artist="${song.artist}"
                data-movie="${song.movie}">

                <i class="fa-brands fa-youtube"></i>

                Play

            </button>

        `;


        cinemaSongsGrid.appendChild(card);

    });


    /* Show section */

    cinemaSongsSection.classList.add("show");


    /* Add Play Events */

    const cinemaPlayButtons =
        document.querySelectorAll(
            ".cinema-play-btn"
        );


    cinemaPlayButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const title =
                        this.dataset.title;

                    const artist =
                        this.dataset.artist;

                    const movie =
                        this.dataset.movie;


                    openCinemaSong(
                        title,
                        artist,
                        movie
                    );

                }
            );

        }
    );


    /* Scroll to songs */

    setTimeout(function () {

        cinemaSongsSection.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }, 100);

}


/* =====================================================
   OPEN CINEMA SONG
===================================================== */

function openCinemaSong(
    title,
    artist,
    movie
) {

    const search =
        encodeURIComponent(
            title +
            " " +
            movie +
            " " +
            artist +
            " official song"
        );


    const youtubeURL =
        "https://www.youtube.com/results?search_query=" +
        search;


    window.open(
        youtubeURL,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =====================================================
   CLOSE CINEMA SECTION
===================================================== */

if (closeCinema) {

    closeCinema.addEventListener(
        "click",
        function () {

            cinemaSongsSection
                .classList.remove("show");


            cinemaButtons.forEach(
                function (btn) {

                    btn.classList.remove(
                        "active"
                    );

                }
            );

        }
    );

}