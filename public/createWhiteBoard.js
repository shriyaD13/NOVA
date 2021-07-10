const copy = () =>{
    const elem = document.createElement('textarea');
    elem.value = `https://evening-brushlands-56347.herokuapp.com/whiteBoard/${uid}`;
    document.body.appendChild(elem);
    elem.select();
    document.execCommand('copy');
    document.body.removeChild(elem);
    const copyBtn = document.querySelector(".copybtn");
    // console.log(copyBtn.title);
    if(copyBtn.title === "copy") copyBtn.title = "copied";
    else copyBtn.title = "copy";
}

const joinRoom = () =>{
    location.href = `https://evening-brushlands-56347.herokuapp.com/whiteBoard/${uid}`;
  }