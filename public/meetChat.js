firebase.initializeApp({
    apiKey: 'AIzaSyCGuC1xU-H4HdF2Oh9jqmBNXrWMbO4V-QA',
    authDomain: 'msteamsclone.firebaseapp.com',
    projectId: 'msteamsclone'
  });
var db = firebase.firestore();

const currUser = JSON.parse(currentUser);
// console.log(currUser.username);

const chats = db.collection('chats').doc(currUser.email);

let RTMoptions = {
    uid: currUser.username,
    token: RTMtoken
}

const client = AgoraRTM.createInstance("1e1b09b367354e35a77c2dba670d76ad");
let channel = client.createChannel(meetId);



channel.on('ChannelMessage',  (message, memberId) => {
    console.log("recieved")
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date+ "@" + time;
    const key = dateTime;
    const collection = chats.collection(meetId).doc(key);
    collection.set({
      sender:  memberId,
      message: message.text
    })
    // console.log(message);
    const msgbox = $(`<div class="msgContainer d-flex flex-column align-items-start">
    <h6>${memberId}</h6>
    <div>${message.text}</div>
    </div>`)
    $(".msgList").append(msgbox);
})

const basicCalls = async() =>{
    await client.login(RTMoptions);
    await channel.join();
}


const send = async() => {

    let peerMessage = document.getElementById("PeerMessage").value.toString()

    await channel.sendMessage({ text: peerMessage }).then(() => {
        document.getElementById("PeerMessage").value = "";

        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+ "@" + time;
        const key = dateTime;
        const collection = chats.collection(meetId).doc(key);
        collection.set({
        sender:  currUser.username,
        message: peerMessage
        })
          const msgbox = $(`<div class="msgContainer d-flex flex-column align-items-end">
                            <h6>${currUser.username}</h6>
                            <div>${peerMessage}</div>
                            </div>`)
          $(".msgList").append(msgbox);
    })
}
$('html').keydown((e) => {
  if (e.which == 13) {
    send();
  }
});

basicCalls();
  