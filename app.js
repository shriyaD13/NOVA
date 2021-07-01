const express = require('express');
const cors = require('cors')
const app = express();
const server = require('http').Server(app);
const path = require('path');
const { urlencoded } = require('express');
const firebase = require("firebase/app");
require("firebase/auth");
const admin = require('firebase-admin');
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
app.use(cors())
// base routre
app.get('/', (req, res) =>{
    res.render('home');
})


// user authentication
let name1,username1,email1;

app.get('/signIn', (req,res)=>{
    res.render('signIn');
})

app.get('/signUp', (req,res)=>{
    res.render('signUp');
})
app.get('/home', (req,res) =>{
    res.render('teamsHome' , {name1,username1, email1});
})

app.get('/calls', (req,res)=>{
  res.render('calls');
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
    const data = { name, username, email};
    addUser(data);
    // const user = userCredential.user;
    name1 = name;
    username1 = username;
    email1 = email;
    res.redirect('/home');
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorMessage);
    // ..
    res.redirect('/');
  });
    
})

const getUser = async(email) =>{
  const user =  db.collection('users').doc(email);
  const userData = await user.get();
  return userData;
}

app.post('/signIn', async (req,res) =>{
    const { email, password } = req.body;
    let flag =0;
    await firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in
    // const user = userCredential.user;
    console.log("Signin successful");
    flag = 1;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage);
  });

  if(flag)
  {
    const userInfo = await getUser(email);
    const {name, username} = userInfo.data();
    name1 = name;
    username1 = username;
    email1 = email;
    res.redirect('/home');
  } else {
    res.redirect('/');
  }
})


// Chat
app.get('/chat', (req,res) =>{
  res.render('chat');
})

// https://evening-brushlands-56347.herokuapp.com/
// waiting room
// let meetingID;
app.get('/callWait', (req,res)=>{
  meetingID = uuidV4();
  const meetingUrl = `https://evening-brushlands-56347.herokuapp.com/${meetingID}`;
  res.render('waitRoom', {meetingUrl, meetingID});
})


const generateToken = (uid) =>{
  const options = {
    appid: "1e1b09b367354e35a77c2dba670d76ad",
    channel: "myChannel",
    certificate: "ca4737d406234493a87967c1ed6eefac",
  };
  const expirationTimeInSeconds = 3600

  const currentTimestamp = Math.floor(Date.now() / 1000)

  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const RTMtoken = RtmTokenBuilder.buildToken(options.appid, options.certificate, uid, RtmRole, privilegeExpiredTs);

  // console.log("Rtm Token: " + RTMtoken);
  return RTMtoken;
}


// video calling room
app.get('/:id', (req,res) =>{
  // res.send("yayay");
  const uid = uuidV4();
  const RTMtoken = generateToken(uid);
  res.render('room', {RTMtoken,uid});
})
 

server.listen(process.env.PORT || 3000);

