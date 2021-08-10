// firebase.initializeApp({
//   apiKey: 'AIzaSyCGuC1xU-H4HdF2Oh9jqmBNXrWMbO4V-QA',
//   authDomain: 'msteamsclone.firebaseapp.com',
//   projectId: 'msteamsclone'
// });
firebase.initializeApp({
  apiKey: "AIzaSyARCf1nsHmLWUYenUSQVQjJ8UG56TBTSFU",
  authDomain: "novawebchat.firebaseapp.com",
  projectId: "novawebchat"
});
var db = firebase.firestore();

const currUser = JSON.parse(currentUser);


let newCode;
let newUrl;
let meetingName

const displayMeetingInfo = () =>{
  meetingName = $("#meetName");
  if(meetingName.val() === '') {
   document.getElementById("meetLabel").innerHTML = `<h6>Please enter a meeting name</h6>`
  } else{
    newCode = meetingCode + ":" + meetingName.val();
    newUrl = meetingUrl + ":" + meetingName.val();
    document.getElementById("codeDisplay").placeholder = newCode;
    document.querySelector(".MeetName").style.display="none";
    document.querySelector(".meetingInfo").style.display="block"
    
    // Add the meet chat to users database
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date+ "@" + time;
    db.collection('chats')
    .doc(currUser.email)
    .collection('meetings')
    .doc(meetingName.val() + " by " + currUser.username)
    .set({
      time: dateTime  
    })

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
  if(email.val() !== ""){
    // check if teh user is registered or not
    const user =  db.collection('users').doc(email.val());
    user.get()
    .then((userData) =>{
      if(userData.exists) {
        const body = `click on the link to join the meeting on NOVA
        ${newUrl}  or enter this code after signing in: ${newCode}`;
        
        let link = `mailto:${email.val()}?subject=Join my meeting on NOVA&body=${body}`;
    
        window.location.href = link;
        const invitebtn = document.getElementById("invitebtn")
        invitebtn.innerText = "Invite Again";
  
        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let dateTime = date+ "@" + time;
        db.collection('chats')
        .doc(email.val())
        .collection('meetings')
        .doc(meetingName.val() + " by " + currUser.username)
        .set({
          time: dateTime  
        })
      } else {
        const alert =$(`<div class="alert alert-warning alert-dismissible fade show mt-2" role="alert">
        <strong>Sorry!</strong> User not registered.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
         </div>`)
          
         $(".title").prepend(alert);
      }
    })
    
  }
}

const joinMeeting = () =>{
  location.href = newUrl;
}

