const chatBox = document.getElementById("chat-box");
const input = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

scrollToBottom();

input.addEventListener("keypress", function(e){

    if(e.key==="Enter"){

        e.preventDefault();

        sendMessage();

    }

});

sendBtn.addEventListener("click",sendMessage);

function scrollToBottom(){

    chatBox.scrollTop = chatBox.scrollHeight;

}

function addUserMessage(message){

    const div=document.createElement("div");

    div.className="user-message";

    div.innerHTML=`

        <div class="bubble">

            ${message}

        </div>

        <div class="avatar user">

            You

        </div>

    `;

    chatBox.appendChild(div);

    scrollToBottom();

}

function addAIMessage(message){

    const div=document.createElement("div");

    div.className="ai-message";

    div.innerHTML=`

        <div class="avatar">

            🤖

        </div>

        <div class="bubble">

            ${message}

        </div>

    `;

    chatBox.appendChild(div);

    scrollToBottom();

}

function showTyping(){

    const div=document.createElement("div");

    div.className="ai-message";

    div.id="typing";

    div.innerHTML=`

        <div class="avatar">

            🤖

        </div>

        <div class="bubble typing">

            <span></span>

            <span></span>

            <span></span>

        </div>

    `;

    chatBox.appendChild(div);

    scrollToBottom();

}

function hideTyping(){

    const typing=document.getElementById("typing");

    if(typing){

        typing.remove();

    }

}

async function sendMessage(){

    const message=input.value.trim();

    if(message==="") return;

    addUserMessage(message);

    input.value="";

    showTyping();

    try{

        const response=await fetch("/send_message",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                message:message

            })

        });

        const data=await response.json();

        hideTyping();

        addAIMessage(data.reply);

        // Refresh sidebar title after first message
        if(data.conversation_title){

            setTimeout(()=>{

                location.reload();

            },500);

        }

    }

    catch(error){

        hideTyping();

        addAIMessage("Unable to connect to Companio.");

    }

}
function useSuggestion(text){

    input.value = text;

    sendMessage();

}