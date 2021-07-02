const copy = () => {
    const elem = document.createElement('textarea');
    elem.value = meetingID;
    document.body.appendChild(elem);
    elem.select();
    document.execCommand('copy');
    document.body.removeChild(elem);
    const copyBtn = document.querySelector(".copybtn");
    // console.log(copyBtn.title);
    if(copyBtn.title === "copy") copyBtn.title = "copied";
    else copyBtn.title = "copy";
  }

const joinMeeting = () =>{
    const code = meetingID;
    location.href = `https://evening-brushlands-56347.herokuapp.com/${code}`;
  }


const sendInvite = () =>{
    let email = $(".inviteEmail");
    const code = meetingID;
    const body = `click on the link to join the meeting on NOVA
        https://evening-brushlands-56347.herokuapp.com/${code}`;
        
    let link = `mailto:${email.val()}?subject=Join my meeting on NOVA&body=${body}`;
    
    window.location.href = link;
    const invitebtn = document.getElementById("invitebtn")
    invitebtn.innerText = "Invite Again";
}