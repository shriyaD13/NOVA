const express = require('express');
const cors = require('cors')
const app = express();
const server = require('http').Server(app);
const path = require('path');
const { urlencoded } = require('express');
const firebase = require("firebase/app");
require("firebase/auth");
const admin = require('firebase-admin');
const {v4: uuidv4}  = require('uuid');
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
  debug: true
})

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
app.use('/peerjs' ,peerServer);
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
  meetingID = uuidv4();
  const meetingUrl = `http://localhost:3000/${meetingID}`;
  res.render('waitRoom', {meetingUrl, meetingID});
})

// video calling room
app.get('/:id', (req,res) =>{
  // res.send("yayay");
  res.render('room')
})
 

server.listen(process.env.PORT || 3000);

