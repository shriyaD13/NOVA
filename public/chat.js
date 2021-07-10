// firebase

// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
  apiKey: 'AIzaSyD4JjNM3eyakgrkXVg_t8nUny2jpgnWeiE',
  authDomain: 'nova-c68e3.firebaseapp.com',
  projectId: 'nova-c68e3'
});

var db = firebase.firestore();

// Search the user to chat with
let searchFor = $("input");
const searchUser = async() =>{
  if(searchFor.val() !== username)
  {
  let flag = 0;
   const data = db.collection('users');
   await data.get().then(async(users) =>{
     users.forEach((user) => {
      //  console.log(user.data())
      if(user.data().username === searchFor.val()) {
        location.href = `https://evening-brushlands-56347.herokuapp.com/chatWindow/${username}-${user.data().username}`;
        flag = 1;
        // break;
       }
     });
     if(flag === 0){
      const alert =$(`<div class="alert alert-warning alert-dismissible fade show mt-2" role="alert">
      <strong>Sorry!</strong> User does not exist.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
       </div>`)
        
       $("#chats").prepend(alert);
       console.log("doneee")
     } 
   })
  }
}

$('html').keydown((e) => {
  if (e.which == 13) {
    searchUser();
  }
});