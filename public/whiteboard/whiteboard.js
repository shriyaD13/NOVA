// Appidentifier:- adwQnkOAYEeuslwN27jbq5A/5YHd686esFqNkA
// AK: h7NV2cqZ78VZg_BO
// SK: u6h_pZ6WsAVz1X6ZFOjMYQwcrama9J5G
// sdk token: NETLESSSDK_YWs9aDdOVjJjcVo3OFZaZ19CTyZub25jZT1lZjVjOTBiMC1lMDE4LTExZWItYWM5Ny0wMzc2ZWUzNmVhZTQmcm9sZT0wJnNpZz01NGJmYjgxOGFjZDI1Y2UzNDRkMTU3YTk4YmVlYTdiYzQ2YWFhOTczMzU1ZDQ4ZmYzOTkyYWEwMDZlNWIwYmQx
var whiteWebSdk = new WhiteWebSdk({
  appIdentifier: "adwQnkOAYEeuslwN27jbq5A/5YHd686esFqNkA",
  region: "us-sv",
})

var joinRoomParams = {
  uuid: uid,
  roomToken: token,
};

let room;
// Join the whiteboard room and display the whiteboard on the web page.
const joinRoom = async() =>{
  room = await whiteWebSdk.joinRoom(joinRoomParams);
  console.log(room)
  room.bindHtmlElement(document.getElementById("whiteboard"));
  room.disableSerialization = false;
}

const changeTool = (name) =>{
  if(name === "pen"){
    room.setMemberState({currentApplianceName: "pencil"});
    var strokeColor =[247, 10, 69]; // The color marked with RGB, here is blue
    var strokeWidth = 4; // The thickness of the line, 10 is a very thick value
    room.setMemberState({
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
    });
    return;
  } 
  // console.log(name)
  room.setMemberState({currentApplianceName: name});
  if(name === "pencil"){
    var strokeColor =[105, 105, 105]; // The color marked with RGB, here is blue
    var strokeWidth = 1; // The thickness of the line, 10 is a very thick value
    room.setMemberState({
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
    });
  }
  
}

const clearScene = () =>{
  room.cleanCurrentScene();
}

const undo = () =>{
  room.undo();
}
const redo = () =>{
  room.redo();
}


joinRoom();
