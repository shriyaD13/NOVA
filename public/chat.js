var options = {
    appid: "1e1b09b367354e35a77c2dba670d76ad",
    channel: "myChannel",
  };

  let RTMoptions = {
    uid: username,
    token: RTMtoken
}

// const client = AgoraRTC.createClient({
//     mode: "rtc", 
//     codec: "vp8" 
//  });
 
 const client = AgoraRTM.createInstance(options.appid);

 client.on('ConnectionStateChanged', (newState, reason) => {
    console.log('reason', reason)
    const view = $('<li/>', {
      text: ['newState: ' + newState, ', reason: ', reason].join('')
    })
    $('.Peermsg').append(view)
  })

 client.on('MessageFromPeer', function (message, peerId) {

    document.querySelector(".Peermsg").appendChild(document.createElement('li')).append("Message from: " + peerId + " Message: " + message.text)
})

const basicCalls = async() =>{
    await client.login(RTMoptions)
}

document.getElementById("sendMsg").onclick = async() => {

    let peerId = document.getElementById("peerID").value.toString()
    let peerMessage = document.getElementById("PeerMessage").value.toString()

    client.queryPeersOnlineStatus([peerId]).then((res) => {
        const view = $('<li/>', {
          text: 'memberId: ' + peerId + ', online: ' + res[peerId]
        })
        $('.Peermsg').append(view)
      }).catch((err) => {
        // Toast.error('query peer online status failed, please open console see more details.')
        console.error(err);
      })

    await client.sendMessageToPeer(
        { text: peerMessage },
        peerId,
    ).then(sendResult => {
        if (sendResult.hasPeerReceived) {

            document.querySelector(".Peermsg").appendChild(document.createElement('li')).append("Message has been received by: " + peerId + " Message: " + peerMessage)

        } else {

            document.querySelector(".Peermsg").appendChild(document.createElement('li')).append("Message sent to: " + peerId + " Message: " + peerMessage)

        }
    })
}

const logOut = async() =>{
    client.logout();
    console.log("left");
}
basicCalls();