const socket = io('/');
const videoDisplay = document.getElementById("video-display");
const myVideo = document.createElement('video');
myVideo.muted = true;

const peer = new Peer();

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call =>{
        console.log("answer")
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream =>{
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userID) =>{
        connectToNewUser(userID, stream);
    })

    let msg = $('input')

    $('html').keydown((e) => {
        if(e.which == 13 &&  msg.val().length !== 0){
            socket.emit('message', msg.val());
            msg.val('');
        }
    })

    socket.on('createMessage', msg =>{
        $('ul').append(`<li class="message"><b>User</b><br/>${msg}</li>`)
        scrollToBottom();
    })
})

peer.on('open',id =>{
    socket.emit('join-room', ROOM_ID, id);
})


const connectToNewUser = (userID, stream) =>{
    const call = peer.call(userID, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })

}

const addVideoStream = (video, stream) =>{
    video.srcObject = stream;
    video.addEventListener('loadedmetadata' ,()=>{
        video.play()
    })
    videoDisplay.append(video);
}

const scrollToBottom = () =>{
    let d = $('.main_chat_window');
    d.scrollTop(d.prop('scrollHeight'));
}

const muteToggle = () =>{
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteButton();
    }
}

const setMuteButton = () => {
    const html = 
    `<i class="fas fa-microphone"></i>
    <span>Mute</span>`
    document.querySelector('.main_mute_button').innerHTML = html;
}

const setUnmuteButton = () =>{
    const html = 
    `<i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`
    document.querySelector('.main_mute_button').innerHTML = html;
}

const videoToggle = () =>{
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setPlayVideo = () =>{
    const html = 
    `<i class = "stop fas fa-video-slash"></i>
    <span>Play Video</span>`

    document.querySelector('.main_video_button').innerHTML = html;
}

const setStopVideo = () =>{
    const html = 
    `<i class = "fas fa-video"></i> 
    <span>Stop Video</span>`

    document.querySelector('.main_video_button').innerHTML = html;
}