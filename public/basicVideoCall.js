// Initialize the agora client
const client = AgoraRTC.createClient({
   mode: "rtc", 
   codec: "vp8" 
});

// Initialize firebase
firebase.initializeApp({
  apiKey: 'AIzaSyCGuC1xU-H4HdF2Oh9jqmBNXrWMbO4V-QA',
  authDomain: 'msteamsclone.firebaseapp.com',
  projectId: 'msteamsclone'
});
let db = firebase.firestore();
const currentUser = JSON.parse(currentUserData);
console.log(currentUser);
const chats = db.collection('chats').doc(currentUser.email);
// Enable audio/volume indicator for detecting the active speaker
client.enableAudioVolumeIndicator();


// Agora config 
let options = {
    appid: "1e1b09b367354e35a77c2dba670d76ad",
    channel: "myChannel",
    token: "0061e1b09b367354e35a77c2dba670d76adIADsKd6m1BMbPO2l8gRYtBLkvYIyIBClhWH7jQA3K0qxa0OQEggAAAAAEACqPfBq/tTkYAEAAQD81ORg"
};

let RTMoptions = {
    uid: uid,
    token: RTMtoken
}

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
          // receiveResolutionWidth()
          console.log(videoTrack.getMediaStreamTrack().getConstraints());
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

          }
          document.getElementById(`avatar${uid}`).style.setProperty('position', 'absolute');
          videoTrack.play(`player-${uid}`);
          // console.log(client.getRemoteVideoStats()) f21c9afc-dd47-434c-b5df-dfea506686b0  0ea8cd3a-7d2c-43ca-8ee2-f64275b0406d
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
        console.log("screeeeeeeeeeeeeen")
        $(`#player-wrapper-${id}`).remove();
        const elem = document.getElementById(`avatar${uid}`);
        if(elem) elem.style.setProperty('position', 'absolute')
      });



      // Listener for messages in channel 
      channel.on('ChannelMessage',  (message, memberId) => {
        console.log("recieved")
        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let dateTime = date+ "@" + time;
        const key = dateTime;
        const chatName = meetName + " by " + host; 
        const collection = chats.collection(chatName).doc(key);
        collection.set({
          sender:  memberId,
          message: message.text
        })
        // console.log(message);
        const html = 
      `<h6>${memberId}</h6>
      ${message.text}`;
      document.querySelector(".messages").appendChild(document.createElement('li')).innerHTML = html;
    })

    //voleme indicator to detect the active speaker
    client.on("volume-indicator", volumes => {
      volumes.forEach((volume, index) => {
        if(volume.level > 5) {
          document.getElementById(`player-wrapper-${volume.uid}`).style.border = "green 5px solid";
        } else {
          document.getElementById(`player-wrapper-${volume.uid}`).style.border = "0px";
        }
        // console.log(`${index} UID ${volume.uid} Level ${volume.level}`);
      });
    })
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
    await client.join(options.appid, options.channel, options.token).then((uid) => {
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
  `<div class="placeHolder">
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
    const uid = await screenClient.join(options.appid, options.channel, options.token);
    const screenTrack = await AgoraRTC.createScreenVideoTrack();
    await screenClient.publish(screenTrack).then(() =>{
      document.getElementById("shareScreenIcon").style.color = "red";
      document.getElementById("shareScreenText").innerHTML = `Unshare Screen`;
    });
  } else {
    shareScreenState = false;
    await screenClient.leave();
    const html = 
    `<i class="fas fa-tv icon" id="shareScreenIcon"></i>
    <span id="shareScreenText">Share screen</span>`;
    document.querySelector(".share-screen").innerHTML = html;
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
        const collection = chats.collection(chatName).doc(key);
        collection.set({
          sender:  uid,
          message: text.val()
        })
      const html = 
      `<h6>${uid}</h6>
      ${text.val()}`;
      document.querySelector(".messages").appendChild(document.createElement('li')).innerHTML = html;
  })
    text.val('')
  }
});

join();
basicCalls();
