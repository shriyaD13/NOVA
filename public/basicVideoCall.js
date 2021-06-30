// Initialize the agora client
const client = AgoraRTC.createClient({
   mode: "rtc", 
   codec: "vp8" 
});


// Agora config 
  var options = {
    appid: "1e1b09b367354e35a77c2dba670d76ad",
    channel: "myChannel",
    uid: null,
    token: "0061e1b09b367354e35a77c2dba670d76adIAAu/LTuv3rVmqGffLLNGHxaxSXscp5zcTrYzWSagvtTPkOQEggAAAAAEAAm+nFWo/7dYAEAAQCk/t1g"
  };

let RTMoptions = {
    uid: "sd",
    token: "0061e1b09b367354e35a77c2dba670d76adIAAU34rgwmfSRWlkbCVZCymbTm/PPVlXuGJdz5CAWzkxV4udFA8AAAAAEAClcAAVnADeYAEA6AOcAN5g"
}


  // chat config
const chatClient = AgoraRTM.createInstance(options.appid);
let channel = chatClient.createChannel("demoChannel")

// Users' own track 
  var localTracks = {
    videoTrack: null,
    audioTrack: null
  };

  var localTrackState = {
    videoTrackEnabled: true,
    audioTrackEnabled: true
  }



// Basic functions for recieving and answering a call
const basicCalls = async() =>{
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
          const player = $(`
                      <div id="player-wrapper-${uid}">
                        <div id="player-${uid}" class="player"></div>
                      </div>
                    `);
          $("#remote-container").append(player);
          videoTrack.play(`player-${uid}`);
          // Play the video
        }
        
      });
      channel.on('ChannelMessage',  (message, memberId) => {
        console.log("recieved")
        const html = 
      `<h6>Friend</h6>
      ${text.val()}`;
      document.querySelector(".messages").appendChild(document.createElement('li')).innerHTML = html;
    })
  }

  // Function to join a channel 
const join = async () =>{
    // const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAudioTrack();
    const cameraTrack = await AgoraRTC.createCameraVideoTrack();
    const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.audioTrack = microphoneTrack;
    localTracks.videoTrack = cameraTrack;
    await client.join(options.appid, options.channel, options.token).then((uid) => {
      const player = $(`
      <div id="player-wrapper-${uid}">
        <div id="player-${uid}" class="player"></div>
      </div>
    `);
      $("#remote-container").append(player);
      cameraTrack.play(`player-${uid}`);
    });
    await client.publish([microphoneTrack, cameraTrack]).then(()=> console.log("published"));
    await chatClient.login(RTMoptions);
    await channel.join();
    // console.log(uid);
}

// End call function
const endCall = async() =>{
    await client.leave();
    await channel.leave();
    await chatClient.logout()
    console.log("left");
}

// switch video  on/off
const videoToggle = async() =>{
    if (localTrackState.videoTrackEnabled) {
        muteVideo();
      } else {
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
    await localTracks.videoTrack.setBeautyEffect(true, { lighteningLevel: 0.5, rednessLevel: 0.5, smoothnessLevel: 0.9 });
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
      const html = 
      `<h6>Me</h6>
      ${text.val()}`;
      document.querySelector(".messages").appendChild(document.createElement('li')).innerHTML = html;

  })
    text.val('')
  }
});

join();
basicCalls();
