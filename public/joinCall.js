const code = $("input");

const joinMeeting = () =>{
    // console.log(code.val());
    location.href = `https://evening-brushlands-56347.herokuapp.com/${code.val()}`;
}