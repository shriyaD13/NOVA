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

// const client = AgoraRTC.createClient({
//     mode: "rtc", 
//     codec: "vp8" 
//  });
 
 const client = AgoraRTM.createInstance(options.appid);

 client.on('MessageFromPeer', function (message, peerId) {

    document.querySelector(".Peermsg").appendChild(document.createElement('li')).append("Message from: " + peerId + " Message: " + message)
})

const basicCalls = async() =>{
    await client.login(RTMoptions)
}

document.getElementById("sendMsg").onclick = async() => {

    let peerId = document.getElementById("peerID").value.toString()
    let peerMessage = document.getElementById("PeerMessage").value.toString()

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
basicCalls();