let newCode;
let newUrl;

const displayMeetingInfo = () =>{
  let meetingName = $("#meetName");
  if(meetingName.val() === '') {
   document.getElementById("meetLabel").innerHTML = `<h6>Please enter a meeting name</h6>`
  } else{
    newCode = meetingCode + ":" + meetingName.val();
    newUrl = meetingUrl + newCode;
    document.getElementById("codeDisplay").placeholder = newCode;
    document.querySelector(".MeetName").style.display="none";
    document.querySelector(".meetingInfo").style.display="block"
  }
}

const copy = () => {
  const elem = document.createElement('textarea');
  elem.value = newCode;
  document.body.appendChild(elem);
  elem.select();
  document.execCommand('copy');
  document.body.removeChild(elem);
  const copyBtn = document.querySelector(".copybtn");
  // console.log(copyBtn.title);
  if(copyBtn.title === "copy") copyBtn.title = "copied";
  else copyBtn.title = "copy";
}

const sendInvite = () =>{
  let email = $(".inviteEmail");
  const body = `click on the link to join the meeting on NOVA
      ${newUrl}`;
      
  let link = `mailto:${email.val()}?subject=Join my meeting on NOVA&body=${body}`;
  
  window.location.href = link;
  const invitebtn = document.getElementById("invitebtn")
  invitebtn.innerText = "Invite Again";
}

const joinMeeting = () =>{
  location.href = newUrl;
}

