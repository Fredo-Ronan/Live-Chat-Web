/**
 * @param {Date} date
 */

const isDark = document.getElementById('dark-theme-text');

console.log(isDark.innerText);

document.querySelector('.toggle-icon').addEventListener('click', () => {
    document.body.classList.toggle('dark');

    if(isDark.innerText === "Dark Mode") {
        isDark.innerText = "Light Mode"
    } else {
        isDark.innerText = "Dark Mode";
    }

})

const divEmoji = document.querySelector('.emoji');

function toggleEmoji() {
    
    if(divEmoji.style.display === 'block') {
        divEmoji.style.display = 'none';
    } else {
        divEmoji.style.display = 'block';
    }

    // if(element[0].disabled === true) {
    //     for(let j = 0; j < element.length; j++) {
    //         element[j].disabled = false;
    //     }
    // } else {
    //     for(let j = 0; j < element.length; j++) {
    //         element[j].disabled = true;
    //     }
    // }
}

let counter = 0; //to set a unique id of message div
const socket = io(); // get the library (maybe i guess? need to learn more later)

socket.on("connect", () => {
    console.log(socket.id);  // when a user/client connect to server, it's console.log
})

const messageForm = document.getElementById('send-container'); //form input html
const messageInput = document.getElementById('message-input'); //input text format html
const messageContainer = document.getElementById('message-container'); //messages box
const feedback = document.getElementById('feedback'); //for user typing notification
const submitBtn = document.getElementById('submit'); //for disable send button when user choose voice note
const fileSend = document.getElementById('file-input'); //for sending file (originaly input with type file)
const uploadBtn = document.getElementById('custom-uploadbtn');//upload button trigger for input tag file
const customFileName = document.getElementById('custom-file-name');//for custom file name upload (actually just for alert that file uploaded)
const sendFileBtn = document.getElementById('upload-file'); //for sending file button (different from the sending text message)

// sendFileBtn.classList.toggle("upload-file-hidden");
sendFileBtn.style.display = "none";

const name = prompt('Enter your name'); // ask the name before using/join chat

// get permission to give notification when something change in the chat
Notification.requestPermission().then(perm => {
    if(perm === 'granted') {
        new Notification("Live Chat App", {
            body: name + ' conected',
        })
    }
})


appendMessage('You Joined'); // generate div to give feedback/confirmation that you have joined
socket.emit('new-user', name); // initiate the web socket library to tell the server someone have joined

// listen from the form input text if the user click the send button or hit enter (send message)
messageForm.addEventListener('submit', e => {
    e.preventDefault(); // to prevent browser from reload when sending message
    const message = messageInput.value; // take the message input from user
    appendMessage(`You: ${message}`); // add div to the message-container (client side)
    socket.emit('send-chat-message', message); // tell to the server about the message
    socket.emit('send-time', formatTime(new Date()));
    messageInput.value = ''; // clear the message input text
})

// method to the other client that connected (except the sender) to tell the newest message
socket.on('chat-message', data => {
    console.log(data); // just for checking the data object
    appendMessage(`${data.name}: ${data.message}`); // create div to show the newest message

    // create notification to other client (except the sender) about the new message
    new Notification(`${data.name}`, {
        body: `${data.message}`, // contain the message that show in the notification
    })
})

// listen for input text if the user is being typing or not
messageInput.addEventListener('input', () => {
    socket.emit('typing', name);  // tell the server that a user or some user is typing
})


// method to all client to tell about someone is connected to the chat session
socket.on('user-connected', name => {
    
    appendMessage(`${name} connected`); // create div to tell the name that conected to the chat

    const findId = "message-id" + (counter - 1); // store the id of that div

    console.log('Find ID Value : ' + findId); // just to verify to the console about the id

    // grab that id and change the background color style to green (usually for something is going well)
    document.getElementById(findId).style.backgroundColor = "green";

    socket.emit('time-connect', formatTime(new Date()));

    // send the notification to other user
    new Notification("Live Chat App", {
        body: name + ' conected',
    })
})

// method when a user is disconnected from the chat session
socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`); // create div to tell who is disconnected

    const findId = "message-id" + (counter - 1); // store the id of that div

    console.log('Find ID Value : ' + findId); // just for verify the id

    // grab that id and change the background color style to red (usually for something going wrong)
    document.getElementById(findId).style.backgroundColor = "#A60000";

    socket.emit('time-disconnect', formatTime(new Date()));

    // send notification to other user
    new Notification("Live Chat App", {
        body: name + ' disconnected',
    })
})

// method when user is typing
socket.on('typing', (name) => {

    feedback.innerHTML = `${name} sedang mengetik....`;

    // set the duration of that user typing notifiaction to 3 second
    setTimeout(() => {
        feedback.innerHTML = "";
    }, 3000); // 3000 ms = 3 second
})


// function to create a div for the message that send
function appendMessage(message) {

    if(message.indexOf('https://') > -1 || message.indexOf('http://') > -1) {
        const newDiv = document.createElement('div');
        newDiv.className = "message";
        newDiv.setAttribute("id", "message-id" + counter++);

        const a = document.createElement('a');
        a.className = "anchor-link-user-send";

        const link = message.split(" ");

        const linkText = document.createTextNode(link[1]);

        const span = document.createElement('span');
        
        span.append(link[0]);
        a.append(link[1]);
        a.href = link[1];
        a.target = "_blank";

        newDiv.append(span);
        newDiv.append(' ');
        newDiv.append(a);

        messageContainer.append(newDiv);

        const getTime = formatTime(new Date());

        // give the time stamp
        const time = document.createElement('div');
        // give the class name to that div
        time.className = "time-stamp";
        // add the getTime value to the div
        time.innerText = getTime;
        // add to the previously created div
        newDiv.append(time);
    } else {
        // create new div and store to the messageElement variable
        const messageElement = document.createElement('div');

        // give the class name to that div
        messageElement.className = "message";
        // give the id of that div
        messageElement.setAttribute("id", "message-id" + counter++); // increment counter for unique div id data

        // add the message to the div that recently created
        messageElement.innerText = message;
        // add that div inside the div that store in the messageElement variable
        messageContainer.append(messageElement);

        // To get the current time from the browser
        // The parameter can be change with the new Date().getHours() to get the 24H time format
        // NOTE to the 24H time format, it maybe must get rid of the isAm variable
        const getTime = formatTime(new Date());

        // give the time stamp
        const time = document.createElement('div');
        // give the class name to that div
        time.className = "time-stamp";
        // add the getTime value to the div
        time.innerText = getTime;
        // add to the previously created div
        messageElement.append(time);
    }

    // this is for when the new div is created and added, 
    // it's always scrolled to the very bottom of the messageContainer div height
    messageContainer.scrollTop = messageContainer.scrollHeight;

}

function formatTime(date) {
    const hours12 = date.getHours() % 12 || 12;
    const minutes = date.getMinutes();
    const isAm = date.getHours() < 12;

    return `${hours12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${isAm ? "AM" : "PM"}`;
}

// let submit = document.getElementById("submit");
// submit.addEventListener("click", () => {
//     socket.emit('message', "Hey From Client");
// })


socket.on('vn', voiceData => {
    console.log(voiceData.voiceData);


    const newAudio = document.createElement('audio');
    newAudio.setAttribute("controls", "true");
    newAudio.className = "voice-note";
    newAudio.src = voiceData.voiceData;

    const newDiv = document.createElement('div');
    newDiv.className = "message";

    const newSpan = document.createElement('span');
    newSpan.innerText = `${voiceData.name}: `;

    newDiv.append(newSpan);
    newDiv.append(newAudio);
    messageContainer.append(newDiv);

    const getTime = formatTime(new Date());

    // give the time stamp
    const time = document.createElement('div');
    // give the class name to that div
    time.className = "time-stamp";
    // add the getTime value to the div
    time.innerText = getTime;
    // add to the previously created div
    newDiv.append(time);

    feedback.innerText = '';

    messageContainer.scrollTop = messageContainer.scrollHeight;
})


socket.on("file-sending", fileData => {
    const newDiv = document.createElement('div');
    newDiv.className = "message";
    newDiv.setAttribute("id", "message-id" + counter++);

    newDiv.innerText = `${fileData.name}: `;

    
    const newImg = document.createElement('img');
    newImg.src = fileData.fileData;
    newImg.className = "image-send";

    newDiv.append(newImg);


    const getTime = formatTime(new Date());

    // give the time stamp
    const time = document.createElement('div');
    // give the class name to that div
    time.className = "time-stamp";
    // add the getTime value to the div
    time.innerText = getTime;
    // add to the previously created div
    newDiv.append(time);

    messageContainer.append(newDiv);

    messageContainer.scrollTop = messageContainer.scrollHeight;
})


// EMOJI SIDE
let emojis = ['💘','💝','💖','💗','💓','💞','💕','💟','❣️','💔','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','❤️‍','🔥','❤️‍','🩹','💯','♨️','💢','💬','👁️‍🗨️','🗨️','🗯️','💭','💤','🌐','♠️','♥️','♦️','♣️','🃏','🀄️','🎴','🎭️','🔇','🔈️','🔉','🔊','🔔','🔕','🎼','🎵','🎶','💹','🏧','🚮','🚰','♿️','🚹️','🚺️','🚻','🚼️','🚾','🛂','🛃','🛄','🛅','⚠️','🚸','⛔️','🚫','🚳','🚭️','🚯','🚱','🚷','📵','🔞','☢️','☣️','⬆️','↗️','➡️','↘️','⬇️','↙️','⬅️','↖️','↕️','↔️','↩️','↪️','⤴️','⤵️','🔃','🔄','🔙','🔚','🔛','🔜','🔝','🛐','⚛️','🕉️','✡️','☸️','☯️','✝️','☦️','☪️','☮️','🕎','🔯','♈️','♉️','♊️','♋️','♌️','♍️','♎️','♏️','♐️','♑️','♒️','♓️','⛎','🔀','🔁','🔂','▶️','⏩️','⏭️','⏯️','◀️','⏪️','⏮️','🔼','⏫','🔽','⏬','⏸️','⏹️','⏺️','⏏️','🎦','🔅','🔆','📶','📳','📴','♀️','♂️','⚧','✖️','➕','➖','➗','♾️','‼️','⁉️','❓️','❔','❕','❗️','〰️','💱','💲','⚕️','♻️','⚜️','🔱','📛','🔰','⭕️','✅','☑️','✔️','❌','❎','➰','➿','〽️','✳️','✴️','❇️','©️','®️','™️','#️⃣','️⃣','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔠','🔡','🔢','🔣','🔤','🅰️','🆎','🅱️','🆑','🆒','🆓','ℹ️','🆔','Ⓜ️','🆕','🆖','🅾️','🆗','🅿️','🆘','🆙','🆚','🈁','🈂️','🈷️','🈶','🈯️','🉐','🈹','🈚️','🈲','🉑','🈸','🈴','🈳','㊗️','㊙️','🈺','🈵','🔴','🟠','🟡','🟢','🔵','🟣','🟤','⚫️','⚪️','🟥','🟧','🟨','🟩','🟦','🟪','🟫','⬛️','⬜️','◼️','◻️','◾️','◽️','▪️','▫️','🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔳','🔲','🕛️','🕧️','🕐️','🕜️','🕑️','🕝️','🕒️','🕞️','🕓️','🕟️','🕔️','🕠️','🕕️','🕡️','🕖️','🕢️','🕗️','🕣️','🕘️','🕤️','🕙️','🕥️','🕚️','🕦️','️','#️','0️','1️','2️','3️','4️','5️','6️','7️','8️','9️','🛎️','🧳','⌛️','⏳️','⌚️','⏰','⏱️','⏲️','🕰️','🌡️','🗺️','🧭','🎃','🎄','🧨','🎈','🎉','🎊','🎎','🎏','🎐','🎀','🎁','🎗️','🎟️','🎫','🔮','🧿','🎮️','🕹️','🎰','🎲','♟️','🧩','🧸','🖼️','🎨','🧵','🧶','👓️','🕶️','🥽','🥼','🦺','👔','👕','👖','🧣','🧤','🧥','🧦','👗','👘','🥻','🩱','🩲','🩳','👙','👚','👛','👜','👝','🛍️','🎒','👞','👟','🥾','🥿','👠','👡','🩰','👢','👑','👒','🎩','🎓️','🧢','⛑️','📿','💄','💍','💎','📢','📣','📯','🎙️','🎚️','🎛️','🎤','🎧️','📻️','🎷','🎸','🎹','🎺','🎻','🪕','🥁','📱','📲','☎️','📞','📟️','📠','🔋','🔌','💻️','🖥️','🖨️','⌨️','🖱️','🖲️','💽','💾','💿️','📀','🧮','🎥','🎞️','📽️','🎬️','📺️','📷️','📸','📹️','📼','🔍️','🔎','🕯️','💡','🔦','🏮','🪔','📔','📕','📖','📗','📘','📙','📚️','📓','📒','📃','📜','📄','📰','🗞️','📑','🔖','🏷️','💰️','💴','💵','💶','💷','💸','💳️','🧾','✉️','💌','📧','🧧','📨','📩','📤️','📥️','📦️','📫️','📪️','📬️','📭️','📮','🗳️','✏️','✒️','🖋️','🖊️','🖌️','🖍️','📝','💼','📁','📂','🗂️','📅','📆','🗒️','🗓️','📇','📈','📉','📊','📋️','📌','📍','📎','🖇️','📏','📐','✂️','🗃️','🗄️','🗑️','🔒️','🔓️','🔏','🔐','🔑','🗝️','🔨','🪓','⛏️','⚒️','🛠️','🗡️','⚔️','💣️','🏹','🛡️','🔧','🔩','⚙️','🗜️','⚖️','🦯','🔗','⛓️','🧰','🧲','⚗️','🧪','🧫','🧬','🔬','🔭','📡','💉','🩸','💊','🩹','🩺','🚪','🛏️','🛋️','🪑','🚽','🚿','🛁','🪒','🧴','🧷','🧹','🧺','🧻','🧼','🧽','🧯','🛒','🚬','⚰️','⚱️','🏺','🕳️','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏟️','🏛️','🏗️','🧱','🏘️','🏚️','🏠️','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭️','🏯','🏰','💒','🗼','🗽','⛪️','🕌','🛕','🕍','⛩️','🕋','⛲️','⛺️','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🗾','🏞️','🎠','🎡','🎢','💈','🎪','🚂','🚃','🚄','🚅','🚆','🚇️','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍️','🚎','🚐','🚑️','🚒','🚓','🚔️','🚕','🚖','🚗','🚘️','🚙','🚚','🚛','🚜','🏎️','🏍️','🛵','🦽','🦼','🛺','🚲️','🛴','🛹','🚏','🛣️','🛤️','🛢️','⛽️','🚨','🚥','🚦','🛑','🚧','⚓️','⛵️','🛶','🚤','🛳️','⛴️','🛥️','🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰️','🚀','🛸','🎆','🎇','🎑','🗿','⚽️','⚾️','🥎','🏀','🏐','🏈','🏉','🎾','🥏','🎳','🏏','🏑','🏒','🥍','🏓','🏸','🥊','🥋','🥅','⛳️','⛸️','🎣','🤿','🎽','🎿','🛷','🥌','🎯','🪀','🪁','🎱','🎖️','🏆️','🏅','🥇','🥈','🥉','🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🥝','🍅','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🥖','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🍲','🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕️','🍵','🍶','🍾','🍷','🍸️','🍹','🍺','🍻','🥂','🥃','🥤','🧃','🧉','🧊','🥢','🍽️','🍴','🥄','🔪','🐵','🐒','🦍','🦧','🐶','🐕️','🦮','🐕‍','🦺','🐩','🐺','🦊','🦝','🐱','🐈️','🐈‍','🦁','🐯','🐅','🐆','🐴','🐎','🦄','🦓','🦌','🐮','🐂','🐃','🐄','🐷','🐖','🐗','🐽','🐏','🐑','🐐','🐪','🐫','🦙','🦒','🐘','🦏','🦛','🐭','🐁','🐀','🐹','🐰','🐇','🐿️','🦔','🦇','🐻','🐻‍','❄️','🐨','🐼','🦥','🦦','🦨','🦘','🦡','🐾','🦃','🐔','🐓','🐣','🐤','🐥','🐦️','🐧','🕊️','🦅','🦆','🦢','🦉','🦩','🦚','🦜','🐸','🐊','🐢','🦎','🐍','🐲','🐉','🦕','🦖','🐳','🐋','🐬','🐟️','🐠','🐡','🦈','🐙','🦑','🦀','🦞','🦐','🦪','🐚','🐌','🦋','🐛','🐜','🐝','🐞','🦗','🕷️','🕸️','🦂','🦟','🦠','💐','🌸','💮','🏵️','🌹','🥀','🌺','🌻','🌼','🌷','🌱','🌲','🌳','🌴','🌵','🎋','🎍','🌾','🌿','☘️','🍀','🍁','🍂','🍃','🌍️','🌎️','🌏️','🌑','🌒','🌓','🌔','🌕️','🌖','🌗','🌘','🌙','🌚','🌛','🌜️','☀️','🌝','🌞','🪐','💫','⭐️','🌟','✨','🌠','🌌','☁️','⛅️','⛈️','🌤️','🌥️','🌦️','🌧️','🌨️','🌩️','🌪️','🌫️','🌬️','🌀','🌈','🌂','☂️','☔️','⛱️','⚡️','❄️','☃️','⛄️','☄️','🔥','💧','🌊','💥','💦','💨','😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐️','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','😮‍','💨','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','😶‍','🌫️','🥴','😵‍','💫','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽️','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🙈','🙉','🙊','👋','🤚','🖐️','✋','🖖','👌','🤏','✌️','🤞','🤟','🤘','🤙','👈️','👉️','👆️','🖕','👇️','☝️','👍️','👎️','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂️','🦻','👃','🧠','🦷','🦴','👀','👁️','👅','👄','💋','👶','🧒','👦','👧','🧑','👨','👩','🧔','🧔‍♀️','🧔‍♂️','🧑','👨‍','🦰','👩‍','🦰','🧑','👨‍','🦱','👩‍','🦱','🧑','👨‍','🦳','👩‍','🦳','🧑','👨‍','🦲','👩‍','🦲','👱','👱‍♂️','👱‍♀️','🧓','👴','👵','🙍','🙍‍♂️','🙍‍♀️','🙎','🙎‍♂️','🙎‍♀️','🙅','🙅‍♂️','🙅‍♀️','🙆','🙆‍♂️','🙆‍♀️','💁','💁‍♂️','💁‍♀️','🙋','🙋‍♂️','🙋‍♀️','🧏','🧏‍♂️','🧏‍♀️','🙇','🙇‍♂️','🙇‍♀️','🤦','🤦‍♂️','🤦‍♀️','🤷','🤷‍♂️','🤷‍♀️','🧑‍⚕️','👨‍⚕️','👩‍⚕️','🧑‍🎓','👨‍🎓','👩‍🎓','🧑‍🏫','👨‍🏫','👩‍🏫','🧑‍⚖️','👨‍⚖️','👩‍⚖️','🧑‍🌾','👨‍🌾','👩‍🌾','🧑‍🍳','👨‍🍳','👩‍🍳','🧑‍🔧','👨‍🔧','👩‍🔧','🧑‍🏭','👨‍🏭','👩‍🏭','🧑‍💼','👨‍💼','👩‍💼','🧑‍🔬','👨‍🔬','👩‍🔬','🧑‍💻','👨‍💻','👩‍💻','🧑‍🎤','👨‍🎤','👩‍🎤','🧑‍🎨','👨‍🎨','👩‍🎨','🧑‍✈️','👨‍✈️','👩‍✈️','🧑‍🚀','👨‍🚀','👩‍🚀','🧑‍🚒','👨‍🚒','👩‍🚒','👮','👮‍♂️','👮‍♀️','🕵️','🕵️‍♂️','🕵️‍♀️','💂','💂‍♂️','💂‍♀️','👷','👷‍♂️','👷‍♀️','🤴','👸','👳','👳‍♂️','👳‍♀️','👲','🧕','🤵','🤵‍♂️','🤵‍♀️','👰','👰‍♂️','👰‍♀️','🤰','🤱','👩‍','🍼','👨‍','🍼','🧑‍','🍼','👼','🎅','🤶','🧑‍','🎄','🦸','🦸‍♂️','🦸‍♀️','🦹','🦹‍♂️','🦹‍♀️','🧙','🧙‍♂️','🧙‍♀️','🧚','🧚‍♂️','🧚‍♀️','🧛','🧛‍♂️','🧛‍♀️','🧜','🧜‍♂️','🧜‍♀️','🧝','🧝‍♂️','🧝‍♀️','🧞','🧞‍♂️','🧞‍♀️','🧟','🧟‍♂️','🧟‍♀️','💆','💆‍♂️','💆‍♀️','💇','💇‍♂️','💇‍♀️','🚶','🚶‍♂️','🚶‍♀️','🧍','🧍‍♂️','🧍‍♀️','🧎','🧎‍♂️','🧎‍♀️','🧑‍','🦯','👨‍','🦯','👩‍','🦯','🧑‍','🦼','👨‍','🦼','👩‍','🦼','🧑‍','🦽','👨‍','🦽','👩‍','🦽','🏃','🏃‍♂️','🏃‍♀️','💃','🕺','🕴️','👯','👯‍♂️','👯‍♀️','🧖','🧖‍♂️','🧖‍♀️','🧗','🧗‍♂️','🧗‍♀️','🤺','🏇','⛷️','🏂️','🏌️','🏌️‍♂️','🏌️‍♀️','🏄️','🏄‍♂️','🏄‍♀️','🚣','🚣‍♂️','🚣‍♀️','🏊️','🏊‍♂️','🏊‍♀️','⛹️','⛹️‍♂️','⛹️‍♀️','🏋️','🏋️‍♂️','🏋️‍♀️','🚴','🚴‍♂️','🚴‍♀️','🚵','🚵‍♂️','🚵‍♀️','🤸','🤸‍♂️','🤸‍♀️','🤼','🤼‍♂️','🤼‍♀️','🤽','🤽‍♂️','🤽‍♀️','🤾','🤾‍♂️','🤾‍♀️','🤹','🤹‍♂️','🤹‍♀️','🧘','🧘‍♂️','🧘‍♀️','🛀','🛌','🧑‍','🤝‍','🧑','👭','👫','👬','💏','👩‍❤️‍💋‍👨','👨‍❤️‍💋‍👨','👩‍❤️‍💋‍👩','💑','👩‍❤️‍👨','👨‍❤️‍👨','👩‍❤️‍👩','👪️','👨‍👩‍👦','👨‍👩‍👧','👨‍👩‍👧‍👦','👨‍👩‍👦‍👦','👨‍👩‍👧‍👧','👨‍👨‍👦','👨‍👨‍👧','👨‍👨‍👧‍👦','👨‍👨‍👦‍👦','👨‍👨‍👧‍👧','👩‍👩‍👦','👩‍👩‍👧','👩‍👩‍👧‍👦','👩‍👩‍👦‍👦','👩‍👩‍👧‍👧','👨‍👦','👨‍👦‍👦','👨‍👧','👨‍👧‍👦','👨‍👧‍👧','👩‍👦','👩‍👦‍👦','👩‍👧','👩‍👧‍👦','👩‍👧‍👧','🗣️','👤','👥','👣'];

const emojiTable = document.getElementById('emoji-container');
let columnCounter = 10;
let trCount = 0;
let tdCount = 0;

for(let i=0; i < emojis.length;) {

    const tr = document.createElement('tr');

    tr.setAttribute("id", "tr-" + trCount++);

    while(columnCounter>-1) {
        const td = document.createElement('td');

        td.setAttribute("id", "td-" + tdCount++);
        td.className = "td";

        td.append(emojis[i]);
        
        tr.append(td);

        i++;
        columnCounter--;
    }

    columnCounter = 10;

    emojiTable.append(tr);
}




// VOICE NOTE MESSAGE HANDLE
// collect DOMs
const recordButton = document.querySelector('.voiceNote');
let stateIndex = 0
let mediaRecorder, chunks = [], audioURL = ''

const addButton = document.createElement('button');
addButton.className = "record-btn";
addButton.type = "button";
addButton.setAttribute("onclick", "record()");
addButton.innerText = "Record";
recordButton.append(addButton);

// mediaRecorder setup for audio
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
    console.log('mediaDevices supported..')

    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(stream => {
        mediaRecorder = new MediaRecorder(stream)

        mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data)
        }

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'})
            chunks = []
            audioURL = window.URL.createObjectURL(blob)
            document.querySelector('audio').src = audioURL

            const file = new File([blob], 'audio', {type: blob.type})
            
            console.log(file);

            readFile(file);
        }
    }).catch(error => {
        console.log('Following error has occured : ',error)
    })
}else{
    

}

function readFile(input) {
    const fr = new FileReader();

    let result = [];
    const res = [];

    fr.readAsDataURL(input);

    fr.addEventListener('load', () => {
        const res = fr.result;
        // console.log(res);

        socket.emit("send-vn", res);
    })
}


function record() {
    mediaRecorder.start();

    addButton.innerText = "Stop";
    addButton.classList.toggle("record-progress");

    addButton.setAttribute("onclick", "stopRecord()");

    submitBtn.classList.toggle("submit-hidden");

    socket.emit('vn-record', name);
}

function stopRecord() {
    mediaRecorder.stop();

    addButton.innerText = "Record";
    addButton.setAttribute("onclick", "record()");
    addButton.classList.toggle("record-progress");

    submitBtn.classList.toggle("submit-hidden");

    const audio = document.createElement('audio');
    audio.setAttribute("controls", "true");
    audio.className = "voice-note";
    audio.src = audioURL;

    console.log(audioURL);

    const newSpan = document.createElement('span');
    newSpan.innerText = 'You: ';

    const newDiv = document.createElement('div');
    newDiv.className = "message";

    newDiv.append(newSpan);
    newDiv.append(audio);

    messageContainer.append(newDiv);

    const getTime = formatTime(new Date());

    // give the time stamp
    const time = document.createElement('div');
    // give the class name to that div
    time.className = "time-stamp";
    // add the getTime value to the div
    time.innerText = getTime;
    // add to the previously created div
    newDiv.append(time);

    messageContainer.scrollTop = messageContainer.scrollHeight;
}

socket.on('record-vn', (name) => {
    feedback.innerText = `${name} sedang merekam audio....`;
})


//UPLOAD FILE AREA
uploadBtn.addEventListener("click", function() {
    fileSend.click();
});

fileSend.addEventListener("change", function() {
    if(fileSend.value) {
        //show alert that the file is uploaded and make the base64 encoded to send
        customFileName.innerHTML = "File Choosen";
        // sendFileBtn.classList.toggle("upload-file-show");
        // submitBtn.classList.toggle("submit-hidden");
        sendFileBtn.style.display = null;
        submitBtn.style.display = "none";

        console.log(fileSend.value);
        
        const newFile = this.files[0];

        console.log(newFile);

        if(newFile) {
            const reader = new FileReader();
            const hasil = [];
            const result = [];

            reader.readAsDataURL(newFile);

            reader.addEventListener("load", function() {
                console.log(this);

                const hasil = this.result;

                // const url = new URL(hasil);

                // console.log(hasil);

                const img = document.createElement("img");
                img.src = hasil;

                img.onload = function (e) {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 400;

                    const scale = MAX_WIDTH / e.target.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = e.target.height * scale;

                    const ctx = canvas.getContext("2d");

                    ctx.drawImage(e.target, 0, 0, canvas.width, canvas.height);

                    let srcEncoded = ctx.canvas.toDataURL(e.target, "image.jpeg");

                    // console.log(srcEncoded);

                    document.querySelector('.image-preview').src = srcEncoded;

                    sendFileBtn.addEventListener("click", function () {
                        // event.preventDefault();
                        if(srcEncoded != '') {
                            document.querySelector('.image-preview').src = '';

                            let newDiv = document.createElement('div');
                            newDiv.className = "message";
                            newDiv.setAttribute("id", "message-id" + counter++);

                            newDiv.innerText = 'You: ';

                            
                            let newImg = document.createElement('img');
                            newImg.src = srcEncoded;
                            newImg.className = "image-send";

                            newDiv.append(newImg);


                            const getTime = formatTime(new Date());

                            // give the time stamp
                            const time = document.createElement('div');
                            // give the class name to that div
                            time.className = "time-stamp";
                            // add the getTime value to the div
                            time.innerText = getTime;
                            // add to the previously created div
                            newDiv.append(time);

                            messageContainer.append(newDiv);

                            // this.classList.toggle("upload-file-show");
                            // submitBtn.classList.toggle("submit-hidden");
                            submitBtn.style.display = null;
                            sendFileBtn.style.display = "none";

                            messageContainer.scrollTop = messageContainer.scrollHeight;

                            fileSend.value = '';
                            customFileName.innerHTML = "No file chosen";

                            console.log("End : " + fileSend.value);


                            socket.emit("send-file", srcEncoded);

                            srcEncoded = '';
                        }
                        
                    })
                }
            })                    
        }

    } else {
        // for error handling
        customFileName.innerHTML = "No file chosen";
    }
})

// to show the messages to the server
socket.on("server", (msg) => {
    console.log(msg);
})