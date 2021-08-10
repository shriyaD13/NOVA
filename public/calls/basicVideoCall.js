// Initialize the agora client
const client = AgoraRTC.createClient({
   mode: "rtc", 
   codec: "vp8" 
});

// create instance of whiteboard
var whiteWebSdk = new WhiteWebSdk({
  appIdentifier: "adwQnkOAYEeuslwN27jbq5A/5YHd686esFqNkA",
  region: "us-sv",
})

// Initialize firebase
firebase.initializeApp({
  apiKey: "AIzaSyARCf1nsHmLWUYenUSQVQjJ8UG56TBTSFU",
  authDomain: "novawebchat.firebaseapp.com",
  projectId: "novawebchat"
});
let db = firebase.firestore();
const currentUser = JSON.parse(currentUserData);
// console.log(currentUser);
const chats = db.collection(meetName + " by " + host);

// Enable audio/volume indicator for detecting the active speaker
client.enableAudioVolumeIndicator();


// Agora config 
let options = {
    appid: "1e1b09b367354e35a77c2dba670d76ad",
    channel: meetName + " by " + host,
    token: RTCtoken,
    uid: uid
};

let RTMoptions = {
    uid: uid,
    token: RTMtoken
}

let boardOptions = {
  uuid: boardUid,
  roomToken: boardToken
}

let whiteboardRoom;

const avatar = "https://avataaars.io/?accessoriesType=Prescription02&avatarStyle=Circle&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&facialHairType=Blank&hatColor=Black&mouthType=Default&topType=LongHairFro"

// chat config
const chatClient = AgoraRTM.createInstance(options.appid);
let channel = chatClient.createChannel(meetName + " by " + host)

// Users' own track 
let localTracks = {
  videoTrack: null,
  audioTrack: null
};

let localTrackState = {
  videoTrackEnabled: true,
  audioTrackEnabled: true
}

// avriable to stire the local tracks id
let localUID;

function waitForElm(selector) {
  return new Promise(resolve => {
      if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
          if (document.querySelector(selector)) {
              resolve(document.querySelector(selector));
              observer.disconnect();
          }
      });

      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  });
}



const screenDisplay  = () =>{
  const container = document.getElementById("remote-container");
  const screen = container.lastChild;
  console.log(screen);
  container.style.flexDirection = "column";
  const elem1 = document.querySelectorAll(".player_wrapper");
  elem1.forEach((elem) =>{
    elem.style.width = "100%"
  })
  const elem2 = document.querySelectorAll(".player_wrapper_peer");
  elem2.forEach((elem) =>{
    elem.style.width = "100%"
  })
  container.removeChild(container.lastChild);
  console.log(container.className);
  container.className = " d-flex ms-4 justify-content-center align-items-center";
  container.style.width="20%";
  screen.style.flexGrow = "1";
  screen.style.width = "100%"
  $(".video-container").prepend(screen);
}

const displayBoard = () =>{
  // console.log(whiteboardRoom);
  document.getElementById("whiteboard1").style.display = "block"
  whiteboardRoom.bindHtmlElement(document.getElementById("whiteboard1"));
  document.querySelector('.tools_conatiner').style.display= "flex";
  document.getElementById('remote-container').style.flexDirection = "column"
  document.querySelector('.main_controls').style.zIndex =9;
  document.querySelector('.main_controls').style.color = "black";
  document.querySelector('.main_right').style.zIndex =9;
  document.querySelector('.video-container').className = "video-container flex-grow-1 d-flex align-items-center w-100"
  document.querySelector('.video-container').style.justifyContent = "space-between";
  document.querySelector('.tools').style.height = "343px";
  document.querySelector('.tools').style.width = "auto";
  document.getElementById('remote-container').className = " d-flex ms-4 justify-content-center align-items-center";
  document.getElementById('remote-container').style.width = "26%"
  document.getElementById('remote-container').style.height = "65%"
  document.querySelector('.tools_conatiner').style.width = "initial";
  document.querySelector('.tools_conatiner').style.height = "initial";

}

const hideBoard = () =>{
  document.getElementById("whiteboard1").style.display = "none"
  document.querySelector('.tools_conatiner').style.display= "none";
  document.getElementById('remote-container').style.flexDirection = "row"
  document.querySelector('.main_controls').style.color = "white";
  document.querySelector('.video-container').style.justifyContent = "center";
  document.getElementById('remote-container').style.width = "100%"
  document.getElementById('remote-container').style.height = "90%"
}

// Basic functions for recieving and answering requests
const basicCalls = async() =>{

  // User published event listener
    client.on("user-published", async (user, mediaType) => {
        // Initiate the subscription
        await client.subscribe(user, mediaType);
        console.log("subscribe success");
        const uid = user.uid;
        // If the subscribed track is an audio track
        if (mediaType === "audio") {
          const audioTrack = user.audioTrack;
          // Play the audio
          audioTrack.play();
        } else {
          const videoTrack = user.videoTrack;
          if(!document.getElementById(`player-wrapper-${uid}`)) {
                const player = $(`
                      <div id="player-wrapper-${uid}" class="player_wrapper_peer me-2">
                      <div id="avatar${uid}" class="avatar">
                        <img src =${avatar} alt = "robot"></img>
                      </div>
                      <div id="player-${uid}" class="player users"></div>
                      </div>
                    `);
          $("#remote-container").append(player);

          }document.getElementById(`avatar${uid}`).style.setProperty('position', 'absolute');
          videoTrack.play(`player-${uid}`);
        }
      });

      // listener for when user unpublishes
      client.on("user-unpublished", user => {
        const uid = user.uid;
        // console.log(`player-${uid}`);/
        // console.log("screeeeeeeeeeeeeen")
        const elem = document.getElementById(`player-${uid}`);
        if(elem && elem.childElementCount == 0) {
          document.getElementById(`avatar${uid}`).style.setProperty('position', 'inherit');
        }
      });

      //event listener for a user leaving
      client.on("user-left", async(user) =>{
        const id = user.uid;
        // console.log("screeeeeeeeeeeeeen")
        $(`#player-wrapper-${id}`).remove();
        const elem = document.getElementById(`avatar${uid}`);
        if(elem) elem.style.setProperty('position', 'absolute')
      });

      // Listener for messages in channel 
      channel.on('ChannelMessage',  (message, memberId) => {
        const uid= message.text.split("@")[0];
        const id = `player-wrapper-${uid}`;
        console.log(id);
        const msg = message.text.split("@")[1];
        if(msg === "screenSharingEnabled"){
          waitForElm(`#${id}`).then(() =>{
            screenDisplay();
          });
        } else if(message.text === "unshareScreen"){
          document.getElementById("remote-container").style.flexDirection = "row";
          const elem1 = document.querySelectorAll(".player_wrapper");
          elem1.forEach((elem) =>{
            elem.style.width = "46%"
          })
          const elem2 = document.querySelectorAll(".player_wrapper_peer");
          elem2.forEach((elem) =>{
            elem.style.width = "46%"
          })
          document.getElementById("remote-container").style.width = "100%"
        } 
        
        // Whiteboard ui changes
        else if(message.text === 'whiteBoardAdded'){
            displayBoard();
        } else if(message.text === 'whiteBoardRemoved'){
          hideBoard();
        }


        else {

          let today = new Date();
          let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
          let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          let dateTime = date+ "@" + time;
          const key = dateTime;
          const chatName = meetName + " by " + host; 
          db.collection(chatName).doc(key).set({
            sender:  memberId,
            message: message.text
          })
          // console.log(message);
          const html = 
        `<h6>${memberId}</h6>
        ${message.text}`;
        document.querySelector(".messages").appendChild(document.createElement('li')).innerHTML = html;
        scrollToBottom();
        }
    })

    // voleme indicator to detect the active speaker
    client.on("volume-indicator", volumes => {
      volumes.forEach((volume, index) => {
        const elem = document.getElementById(`player-wrapper-${volume.uid}`);
        if(volume.level > 5) {
          if(elem) {
           elem.style.border = "#0af320 5px solid";
          } 
        } else {
          if(elem) {
           elem.style.border = "0px"; 
          }
        }
        // console.log(`${index} UID ${volume.uid} Level ${volume.level}`);
      });
    })
  }


const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

  // Function to join a channel 
const join = async () =>{
    const cameraTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: {
        width: 400,
        height: 400
    }});

    const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.audioTrack = microphoneTrack;
    localTracks.videoTrack = cameraTrack;
    await client.join(options.appid, options.channel, options.token, options.uid).then((uid) => {
      const player = $(`
      <div id="player-wrapper-${uid}" class="player_wrapper me-2">
        <div id="player-${uid}" class="player"></div>
      </div>
    `);
      $("#remote-container").append(player);
      cameraTrack.play(`player-${uid}`);
      localUID = uid;
    });
    await client.publish([microphoneTrack, cameraTrack]).then(()=> console.log("published"));
    
    // login and join RTM 
    await chatClient.login(RTMoptions);
    await channel.join();

    // Add the meeting to users data base
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date+ "@" + time;
    // const meetName = 
    db.collection('chats')
    .doc(currentUser.email)
    .collection('meetings')
    .doc(meetName + " by " + host)
    .set({
      time: dateTime  
    })

    // Join the whiteboard
    whiteboardRoom = await whiteWebSdk.joinRoom(boardOptions);
    whiteboardRoom.disableSerialization = false;
}

// End call function
const endCall = async() =>{
    await client.leave();
    await channel.leave();
    await chatClient.logout()
    console.log("left");
}

// switch video  on/off
const changeDisplay = () =>{
  const element = document.getElementById(`player-${localUID}`);
  const html = 
  `<div id="placeHolder">
  <img src =${avatar} alt = "robot"></img>
  </div>`
  element.innerHTML = html;
}

const unchangeDisplay = () =>{
  const element = document.getElementById(`player-${localUID}`);
  element.innerHTML = "";
}

const videoToggle = async() =>{
    if (localTrackState.videoTrackEnabled) {
        muteVideo();
        changeDisplay();
      } else {
        unchangeDisplay();
        unmuteVideo();
      }
}

// switch audio on/off
const audioToggle = async() =>{
    if (localTrackState.audioTrackEnabled) {
        muteAudio();
      } else {
        unmuteAudio();
      }
}

// helper functions for toggling audio and video
const muteAudio = async() => {
    if (!localTracks.audioTrack) return;
    await localTracks.audioTrack.setEnabled(false);
    localTrackState.audioTrackEnabled = false;
    const html = 
    `<i class="fas fa-microphone-slash icon unmute"></i>
    <span>Unmute</span>`;

    document.querySelector('.mute-btn').innerHTML = html;
  }

const muteVideo = async() => {
    if (!localTracks.videoTrack) return;
    await localTracks.videoTrack.setEnabled(false);
    localTrackState.videoTrackEnabled = false;
    const html = 
    `<i class="fas fa-video-slash icon unmute"></i>
    <span>Play video</span>`;

    document.querySelector('.stop-video').innerHTML = html;
}

const unmuteAudio = async() => {
    if (!localTracks.audioTrack) return;
    await localTracks.audioTrack.setEnabled(true);
    localTrackState.audioTrackEnabled = true;
    const html = 
    `<i class="fas fa-microphone icon"></i>
    <span>Mute</span>`;
    document.querySelector('.mute-btn').innerHTML = html;
}

const unmuteVideo = async() => {
    if (!localTracks.videoTrack) return;
    await localTracks.videoTrack.setEnabled(true);
    localTrackState.videoTrackEnabled = true;
    const html = 
    `<i class="fas fa-video icon"></i>
    <span>Stop Video</span>`;
    document.querySelector('.stop-video').innerHTML = html;
  }
  
// screen Sharing Function
let shareScreenState = false;
const screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const shareScreen = async() => {
  if(!shareScreenState){
    shareScreenState = true;
    const uid = await screenClient.join(options.appid, options.channel,screenToken,options.uid + "-screen");
    console.log("uuuuuuuuuuuuuuuuuuuuuu",uid);
    const screenTrack = await AgoraRTC.createScreenVideoTrack();
    await screenClient.publish(screenTrack).then(() =>{
        const id = `player-wrapper-${uid}`
        waitForElm(`#${id}`).then(() =>{
          screenDisplay();
        });
        channel.sendMessage({ text: `${uid}@screenSharingEnabled` }).then(() =>{
        document.getElementById("shareScreenIcon").style.color = "red";
        document.getElementById("shareScreenText").innerHTML = `Unshare Screen`;
      })
    });
  } else {
    shareScreenState = false;
    await screenClient.leave();

    const elem1 = document.getElementById("remote-container");
    const elem2 = document.querySelectorAll(".player_wrapper"); 
    const elem3 = document.querySelectorAll(".player_wrapper_peer");
    if(elem1){
      elem1.style.flexDirection = "row";
      elem1.style.width = "100%";
    }
    if(elem2){
      elem2.forEach((elem) =>{
        elem.style.width = "46%";
      })
    } 
    if(elem3)
    {
      elem3.forEach((elem) =>{
        elem.style.width = "46%";
      })
    }   
    const html = 
    `<i class="fas fa-tv icon" id="shareScreenIcon"></i>
    <span id="shareScreenText">Share screen</span>`;
    document.querySelector(".share-screen").innerHTML = html;
    await channel.sendMessage({ text: `unshareScreen` })
  }
} 


// Beauty mode Enable/Disable
let beautyModeState = false;

const beautyModeToggle = async() => {
  // enable beauty effect
  if(!beautyModeState)
  {
    beautyModeState = true;
    await localTracks.videoTrack.setBeautyEffect(true, { lighteningLevel: 0.7, rednessLevel: 0.8, smoothnessLevel: 0.9 });
    console.log("enable beauty success");
    document.getElementById("beautyEffectText").innerHTML = `Disable Beauty Effect`;
  } else {
    beautyModeState = false;
    await localTracks.videoTrack.setBeautyEffect(false);
    console.log("disable beauty success");
    document.getElementById("beautyEffectText").innerHTML = `Beauty Effect`;
  }
  
}

// Chat Feature
let chatWindowState = false;
const chatWindow = async() =>{
  if(!chatWindowState){
    document.querySelector(".chat_window").style.display = 'flex';
    chatWindowState = true;
  } else {
    document.querySelector(".chat_window").style.display = 'none';
    chatWindowState = false;
  }
}
  // when press enter send message
$('html').keydown(async (e) => {
  let text = $("input");
  // console.log(text.val());
  if (e.which == 13) {
    await channel.sendMessage({ text: text.val() }).then(() => {
      console.log("message sent");
      let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let dateTime = date+ "@" + time;
        const key = dateTime;
        const chatName = meetName + " by " + host; 
        db.collection(chatName).doc(key).set({
          sender:  uid,
          message: text.val()
        })
      const html = 
      `<h6>${uid}</h6>
      ${text.val()}`;
      document.querySelector(".messages").appendChild(document.createElement('li')).innerHTML = html;
      scrollToBottom();
  })
    text.val('')
  }
});


let whiteBoardState = false;
const whiteBoard = async() =>{
  if(!whiteBoardState){
    channel.sendMessage({ text: 'whiteBoardAdded' }).then(() =>{
      // document.querySelector(".whiteBoard").style.color = "red";
      displayBoard();
      document.querySelector(".whiteBoard").innerHTML = `Disable whiteboard`;
      whiteBoardState = true;
    })
  } else {
    channel.sendMessage({ text: 'whiteBoardRemoved' }).then(() =>{
      // document.querySelector(".whiteBoard").style.color = "red";
      hideBoard();
      document.querySelector(".whiteBoard").innerHTML = `whiteboard`;
      whiteBoardState = false;
    })
  }
}
const changeTool = (name) =>{
  if(name === "pen"){
    whiteboardRoom.setMemberState({currentApplianceName: "pencil"});
    var strokeColor =[247, 10, 69]; // The color marked with RGB, here is blue
    var strokeWidth = 4; // The thickness of the line, 10 is a very thick value
    whiteboardRoom.setMemberState({
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
    });
    return;
  } 
  // console.log(name)
  whiteboardRoom.setMemberState({currentApplianceName: name});
  if(name === "pencil"){
    var strokeColor =[105, 105, 105]; // The color marked with RGB, here is blue
    var strokeWidth = 1; // The thickness of the line, 10 is a very thick value
    whiteboardRoom.setMemberState({
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
    });
  }
  
}

const clearScene = () =>{
  whiteboardRoom.cleanCurrentScene();
}

const undo = () =>{
  whiteboardRoom.undo();
}
const redo = () =>{
  whiteboardRoom.redo();
}



join();
basicCalls();
