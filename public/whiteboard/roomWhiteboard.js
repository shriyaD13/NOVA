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
  
  console.log("SDCSDSD");