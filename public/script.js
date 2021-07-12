/* All js functions here */

const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};

/* Peer function for deployed app */

var peer = new Peer({host: 'vica-videochat-app.herokuapp.com',
port: '443',
path: '/peerjs'});
 
// var peer = new Peer(); // Peer function for local host

var name = "";

/* function for Join meet/login */
Swal.fire({
  title: "Join Meeting",
  input: "text",
  inputLabel: "Enter your name to join:",
  inputPlaceholder: "Your name here..",
  allowOutsideClick: false,
  confirmButtonColor: "red",
}).then((data) => {
  name = data.value;
  socket.emit("new-user-joined", data.value);
  totalSeconds = 0;
});

/* Start Video Stream */
let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    // imported media elements
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      // another user answers call

      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      // to listen here to my stream
      connecToNewUser(userId, stream);
    });
    let text = $("input"); // getting input in chat

    $("html").keydown((e) => {
      // e is event of typing keyboard
      if (e.which == 13 && text.val().length !== 0) {
        console.log(text.val());
        socket.emit("message", { message: text.val(), name: name });
        text.val("");
      }
    });

    socket.on("createMessage", (message) => {
      var today = new Date();
      var currentHours = today.getHours();
      if (currentHours < 10) currentHours = "0" + currentHours;
      var currentMinutes = today.getMinutes();
      if (currentMinutes < 10) currentMinutes = "0" + currentMinutes;
      document.getElementById("message-image").style.display = "none";
      $("ul").append(
        `<li class="message"><b>${message.message.name}</b>  <i>${
          currentHours + ":" + currentMinutes
        }<i><br/>${message.message.message}</li>`
      );
      scrollToBottom();
    });
  });

socket.on("user-joined", (name) => {
  socket.emit("message", { message: `${name} joined`, name: "" });
});

peer.on("open", (id) => {
  // ids generated
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-disconnect", (userId) => {
  console.log(userId);
  if (peers[userId]) peers[userId].close();
});

/* Connect/disconnect to new users video stream */
const connecToNewUser = (userId, stream) => {
  // connecting new user
  const call = peer.call(userId, stream); // calling the other user
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
};

/* Add video stream */
const addVideoStream = (video, stream) => {
  // to get a video stream
  video.style.borderStyle = "solid";
  video.style.borderColor = "rgb(195, 184, 179)";
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
};

/* Scroll chat in chat window */
const scrollToBottom = () => {
  let d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

/* Mute/Unmute the audio */
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

/* Turn On/Off the video */
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Turn off</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Turn on</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};

/* Chat */
const Chat = () => {
  if (document.getElementById("mainright").style.display == "none")
    document.getElementById("mainright").style.display = "flex";
  else document.getElementById("mainright").style.display = "none";
};

const messageInput = document.getElementById("chat_messages");
const messageContainer = document.querySelector(".main_chat__window");
const append = (message, position) => {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageElement.classList.add("message");
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
};

/* Timer: Records time duration of meet */
var timerVar = setInterval(countTimer, 1000);
var totalSeconds = 0;
function countTimer() {
  ++totalSeconds;
  var hour = Math.floor(totalSeconds / 3600);
  var minute = Math.floor((totalSeconds - hour * 3600) / 60);
  var seconds = totalSeconds - (hour * 3600 + minute * 60);
  if (hour < 10) hour = "0" + hour;
  if (minute < 10) minute = "0" + minute;
  if (seconds < 10) seconds = "0" + seconds;
  document.getElementById("timer").innerHTML =
    hour + ":" + minute + ":" + seconds;
}

/* Switch between light/dark theme */
function myFunction() {
  var element = document.body;
  element.classList.toggle("dark-mode");
}

// overlay effect
function on() {
  document.getElementById("overlay").style.display = "block";
}

/* Leave meet */
function leaveMeet(data) {
  if (data) {
    document.getElementById("id01").style.display = "none";
    document.getElementById("overlay").style.display = "block";
  } else {
    document.getElementById("id01").style.display = "none";
  }
}

/* Share Meet link by copying to clipboard */
function MeetLink() {
  var dummy = document.createElement("input"),
    text = window.location.href;
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
  Toast.fire({
    icon: "success",
    title: "Link copied successfully",
  });
}
