const express = require('express');
const cors = require('cors')
const app = express();
const server = require('http').Server(app);
const path = require('path');
const { urlencoded } = require('express');
const firebase = require("firebase/app");
require("firebase/auth");
const admin = require('firebase-admin');
const session = require('express-session');
const { v4: uuidV4 } = require('uuid')
const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token')

// firebase configurations
const firebaseConfig = {
    apiKey: "AIzaSyCGuC1xU-H4HdF2Oh9jqmBNXrWMbO4V-QA",
    authDomain: "msteamsclone.firebaseapp.com",
    projectId: "msteamsclone",
    storageBucket: "msteamsclone.appspot.com",
    messagingSenderId: "893337993539",
    appId: "1:893337993539:web:57de5eec1c60c79a122ff6",
    measurementId: "G-G02TM61K6G",
    databaseURL: "https://msteamsclone.firebaseio.com",
  };
firebase.initializeApp(firebaseConfig);

const serviceAccount = require('./msteamsclone-firebase-adminsdk-8sjze-956fff9efb.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();


// setting up viewEngine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// adding necessary malware
app.use(express.static('public'));
app.use(urlencoded({extended: true}));
app.use(session(
  {
    secret: 'vulnerabilities',
    resave: false,
    saveUninitialized: true,
  }
));

app.use((req,res,next) =>{
  res.locals.currentUser = req.session.user;
  next();
})
app.use(cors())


// base routre
app.get('/', (req, res) =>{
    res.render('home');
})


// user authentication
const authorize = (req,res,next) =>{
  // console.log(req.session.user);
  if(!req.session.user){
    return res.redirect('/');
  } else {
    next();
  }
}

app.get('/signIn', (req,res)=>{
    res.render('signIn');
})

app.get('/signUp', (req,res)=>{
    res.render('signUp');
})

app.get('/logout', (req,res) => {
  req.session.destroy();
  res.redirect('/')
})

const getUser = async(email) =>{
  const user =  db.collection('users').doc(email);
  // console.log(user.id);
  const userData = await user.get();
  // console.log(userData.data())
  return userData.data();
}

app.get('/home/:id', authorize, async(req,res) =>{
    const id = req.params.id;
    // console.log(id);
    const {name, username, email, avatar} = await getUser(id);
    res.render('teamsHome' , {name,username, email,avatar});
})


const addUser = async(data) =>{
  const {email} = data;
  const newuser = db.collection('users').doc(email);
  await newuser.set(data)
  .catch((e)=>{
    console.log(e);
  })
}

app.post('/signUp', async(req,res) =>{
    const { name, username, email, password , confirmPassword} = req.body;
    if(password !== confirmPassword)
    {
      console.log("no match");
      res.redirect('/signUp');
    }
    await firebase.auth().createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {
    console.log("SignUP successful");
    flag = 1;
    // req.session.userId = email;
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorMessage);
    // ..
  });
  if(flag){
    const avatar = `https://robohash.org/${username}`
    const data = { name, username, email, avatar};
    req.session.user = data;
    await addUser(data);
    res.redirect(`/home/${email}`);
  } else {
    res.redirect('/');
  }
    
})

app.post('/signIn', async (req,res) =>{
    const { email, password } = req.body;
    let flag =0;
    await firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // const user = userCredential.user;
    // console.log(userCredential.user);
    console.log("Signin successful");
    flag = 1;
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage);
  });

  if(flag)
  {
    const userData = await getUser(email);
    req.session.user = userData;
    res.redirect(`/home/${email}`)
  } else {
    res.redirect('/');
  }
})


// Chat
app.get('/chat/:id', authorize, async(req,res) =>{
  const email  = req.params.id;
  const user =  db.collection('users').doc(email);
  const userData = await user.get();
  if(userData.exists) {
    const chats = db.collection('chats').doc(email);
    const chatPeers = await chats.listCollections();
    let peers = [];
    chatPeers.forEach((peer) =>{
      peers.push(peer.id)
  })
  let peerUsername = [];
  let meetings = [];
  for(let p of peers){
    console.log(p);
    if(p === "meetings"){
      const meeetIDs = await db.collection('chats').doc(email).collection('meetings').get();
      meeetIDs.forEach((meet) =>{
        meetings.push(meet.id);
      })
    } else {
      const peerdb =  db.collection('users').doc(p);
      const peerData = await peerdb.get();
      peerUsername.push(peerData.data().username)
    }
  // console.log(peerData.data());
  }
  // peerUsername.forEach((peer) => console.log("yeyey",peer));
  const username = userData.data().username;
  res.render('chat', {email,username,peerUsername, meetings});
  } else res.redirect('/');
})

app.get('/chatWindow/:id', authorize, async(req,res)=>{
  const id = req.params.id;
  const user1 =id.split("-")[0];
  const user2 = id.split("-")[1];
  const collection =  db.collection('users');
  let host;
  let peer; 
  await collection.where("username","==", `${user1}`)
  .get()
  .then((snapshot) =>{
    snapshot.forEach((doc) => host = doc.data());
  })
  await collection.where("username","==", `${user2}`)
  .get()
  .then((snapshot) =>{
    snapshot.forEach((doc) => peer = doc.data());
  })
  let chats = [];
  const chatdb = await db.collection('chats').doc(host.email).collection(peer.email).get();
  chatdb.forEach((chat) =>{
    chats.push({
      time: chat.id,
      data: chat.data()
    });
  })    

  // for(let p of chats){
  //   console.log(p);
  // }
  const RTMtoken = generateToken(user1);
  res.render("chatWindow" , {host, peer, chats,RTMtoken});
})


app.get('/meetingChat/:id', authorize, async(req,res) =>{
  const id = decodeURI(req.params.id);
  const user1 =id.split("-")[0];
  const meetId = id.split("-")[1];
  console.log(meetId);
  // res.send("SDC"); 
  const chatdb = await db.collection(meetId).get();
  let chats = [];
  chatdb.forEach((chat) =>{
    chats.push({
      time: chat.id,
      data: chat.data()
    })
  })

  const RTMtoken = generateToken(req.session.user.username);
  res.render('meetChatWindow', {chats, meetId, RTMtoken})
  // const collection =  db.collection('users');

})


// calander
app.get('/calender',authorize, (req,res) =>{
    res.render("calender");
})


// Join Call
app.get('/joinCall', authorize, (req,res) =>{
  res.render('joinCall');
})


// https://evening-brushlands-56347.herokuapp.com/
// waiting room
app.get('/callWait/:id',authorize, (req,res)=>{
  const id = req.params.id;
  const meetingID = uuidV4();
  const meetingCode = meetingID +':'+ id;
  // console.log(meetingID);
  const meetingUrl = `https://evening-brushlands-56347.herokuapp.com/call/${meetingID}:${id}`;
  res.render('waitRoom', {id, meetingUrl, meetingCode});
})


const generateToken = (uid,channel) =>{
  const options = {
    appid: "1e1b09b367354e35a77c2dba670d76ad",
    channel: channel,
    certificate: "ca4737d406234493a87967c1ed6eefac",
  };
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600

  const currentTimestamp = Math.floor(Date.now() / 1000)

  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const RTMtoken = RtmTokenBuilder.buildToken(options.appid, options.certificate, uid, RtmRole, privilegeExpiredTs);
  const RTCtoken = RtcTokenBuilder.buildTokenWithUid(options.appid, options.certificate, options.channel, uid, role, privilegeExpiredTs);
  const screenToken = RtcTokenBuilder.buildTokenWithUid(options.appid, options.certificate, options.channel, uid + "-screen", role, privilegeExpiredTs);
  return {RTMtoken, RTCtoken, screenToken};
}



app.get('/call/:id', authorize, async(req,res) =>{
  const id = req.params.id;
  const userEmail=id.split(":")[1];
  const meetName = id.split(":")[2];
  // console.log("yyyyyyyyyyyyyy",userEmail);
  let user;
  if(userEmail) user =  db.collection('users').doc(userEmail);
  else {
    res.render("error");
    return;
  }
  const userData = await user.get();
  if(userData.exists)
  {
    const host = userData.data().username;
    const uid = req.session.user.username;
    const channel = meetName + " by " + host;
    const {RTMtoken, RTCtoken, screenToken} = generateToken(uid, channel);
    // console.log(RTMtoken,RTCtoken,screenToken);
    res.render('room', {RTMtoken,RTCtoken,screenToken,uid, meetName,host});
  } else {
    res.render("error");
  }
})

server.listen(process.env.PORT || 3000);

