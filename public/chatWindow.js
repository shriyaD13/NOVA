// firebase

// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
    apiKey: 'AIzaSyCGuC1xU-H4HdF2Oh9jqmBNXrWMbO4V-QA',
    authDomain: 'msteamsclone.firebaseapp.com',
    projectId: 'msteamsclone'
  });
  
  const peerObj = JSON.parse(peerData);
  const peerID = peerObj.username;
  const hostObj = JSON.parse(hostData); 
// console.log(hostData, peerData);
var db = firebase.firestore();
const chats = db.collection('chats').doc(hostObj.email);

var options = {
    appid: "1e1b09b367354e35a77c2dba670d76ad",
    channel: "myChannel",
  };


console.log(hostObj.username)
// console.log(peerID)
  let RTMoptions = {
    uid: hostObj.username,
    token: RTMtoken
}
 const client = AgoraRTM.createInstance(options.appid);

 
const scrollToBottom = () => {
  var d = $('.msgList');
  d.scrollTop(d.prop("scrollHeight"));
  console.log("DFVS");
}

//  client.on('ConnectionStateChanged', (newState, reason) => {
//     console.log('reason', reason)
//     const view = $('<li/>', {
//       text: ['newState: ' + newState, ', reason: ', reason].join('')
//     })
//     $('.Peermsg').append(view)
//   })

 client.on('MessageFromPeer', function (message, peerId) {

    const msgbox = $(`<div class="msgContainer d-flex my-1 flex-column align-items-start">
                              <div class="leftMsg">
                                <p>${message.text}</p>
                              </div>
                            </div>`)
    $(".msgList").append(msgbox);
    scrollToBottom();
})

const basicCalls = async() =>{
    await client.login(RTMoptions)
}


const send = async() => {

    let peerId = peerID;
    let peerMessage = document.getElementById("PeerMessage").value.toString()

    // client.queryPeersOnlineStatus([peerId]).then((res) => {
    //     const view = $('<li/>', {
    //       text: 'memberId: ' + peerId + ', online: ' + res[peerId]
    //     })
    //     $('.Peermsg').append(view)
    //   }).catch((err) => {
    //     console.error(err);
    //   })

    await client.sendMessageToPeer(
        { text: peerMessage },
        peerId,
        // {enableOfflineMessaging: true}
    ).then(sendResult => {
        document.getElementById("PeerMessage").value = "";

        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+ "@" + time;
        const key = dateTime;
        const collection = chats.collection(peerObj.email).doc(key);
        collection.set({
          sender:  hostObj.username,
          reciever:peerObj.username,
          message: peerMessage
        })
        const peerCollection = db.collection('chats').doc(peerObj.email);
        const peerdata = peerCollection.get();
          peerCollection.collection(hostObj.email).doc(key).set({
            sender:  hostObj.username,
          reciever:peerObj.username,
          message: peerMessage
          })
          const msgbox = $(`<div class="msgContainer my-1 d-flex flex-column align-items-end">
                              <div class="rightMsg">
                                <p>${peerMessage}</p>
                              </div>
                            </div>`)
          $(".msgList").append(msgbox);
          scrollToBottom();
        // if (sendResult.hasPeerReceived) {

        //     document.querySelector(".msgList").appendChild(document.createElement('li')).append("Message has been received by: " + peerId + " Message: " + peerMessage)

        // } else {

        //     document.querySelector(".msgList").appendChild(document.createElement('li')).append("Message sent to: " + peerId + " Message: " + peerMessage)

        // }
    })
}
$('html').keydown((e) => {
  if (e.which == 13) {
    send();
  }
});

window.onload = () =>{
  scrollToBottom();
}

basicCalls();