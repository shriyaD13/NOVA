firebase.initializeApp({
  apiKey: 'AIzaSyD4JjNM3eyakgrkXVg_t8nUny2jpgnWeiE',
  authDomain: 'nova-c68e3.firebaseapp.com',
  projectId: 'nova-c68e3'
});
var db = firebase.firestore();

const currUser = JSON.parse(currentUser);
// console.log(currUser.username);

const chats = db.collection(meetId);

let RTMoptions = {
    uid: currUser.username,
    token: RTMtoken
}

const client = AgoraRTM.createInstance("1e1b09b367354e35a77c2dba670d76ad");
let channel = client.createChannel(meetId);

const scrollToBottom = () => {
  var d = $('.msgList');
  d.scrollTop(d.prop("scrollHeight"));
  // console.log("DFVS");
}

channel.on('ChannelMessage',  (message, memberId) => {
    console.log("recieved")
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date+ "@" + time;
    const key = dateTime;
    chats.doc(key).set({
      sender:  memberId,
      message: message.text
    })
    // console.log(message);
    const msgbox = $(`<div class="msgContainer d-flex my-1 flex-column align-items-start">
                          <div class="leftMsg">
                            <div id="sender">${memberId}</div>
                            <p>${message.text}</p>
                          </div>
                        </div>`)
    $(".msgList").append(msgbox);
    scrollToBottom();
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
        chats.doc(key).set({
        sender:  currUser.username,
        message: peerMessage
        })
          const msgbox = $(`<div class="msgContainer d-flex flex-column align-items-end">
                              <div class="rightMsg">
                                <div id="sender">${currUser.username}</div>
                                  <p>${peerMessage}</p>
                              </div>
                            </div>`)
          $(".msgList").append(msgbox);
          scrollToBottom();
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
  