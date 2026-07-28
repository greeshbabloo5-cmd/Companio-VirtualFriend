// ===============================
// Weekly Mood Line Chart
// ===============================

const moodChart = document.getElementById("moodChart");

new Chart(moodChart,{

    type:'line',

    data:{

        labels:[
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
        ],

        datasets:[{

            label:"Mood Score",

            data:[62,70,68,75,81,85,89],

            borderColor:"#2563eb",

            backgroundColor:"rgba(37,99,235,.15)",

            fill:true,

            tension:.4,

            pointRadius:5

        }]

    },

    options:{

        responsive:true,

        plugins:{

            legend:{
                display:false
            }

        }

    }

});

// ===============================
// Mood Distribution Pie Chart
// ===============================

const pieChart = document.getElementById("pieChart");

new Chart(pieChart,{

    type:'doughnut',

    data:{

        labels:[

            "Happy",

            "Calm",

            "Neutral",

            "Sad"

        ],

        datasets:[{

            data:[55,25,15,5],

            backgroundColor:[

                "#2563eb",

                "#60a5fa",

                "#93c5fd",

                "#dbeafe"

            ]

        }]

    },

    options:{

        responsive:true,

        plugins:{

            legend:{

                position:"bottom"

            }

        }

    }

});

// ===============================
// AI Analysis Messages
// ===============================

const messages=[

"😊 Your mood has improved consistently this week. Keep following your wellness routine.",

"💙 You are maintaining a healthy emotional balance. Great job!",

"🌿 Taking short breaks and listening to relaxing music can further improve your mood.",

"🧘 Remember to practice breathing exercises whenever you feel stressed."

];

let index=0;

setInterval(()=>{

    index++;

    if(index>=messages.length){

        index=0;

    }

    document.getElementById("analysisText").innerHTML=messages[index];

},6000);