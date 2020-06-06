$(function() {
    $("#more").click(function(e) {
      e.preventDefault();
      $("#List").append("<li>&nbsp;</li>");
      $("#List").append("<li><input type='text' name='Time' placeholder='Time' /></li>");
    });
  });


//   var b= async function date(){
//     try{var a= document.getElementById("date").value
    
//     return a
//   }

//     catch(err){
//       console.log(err)
//     }
// }