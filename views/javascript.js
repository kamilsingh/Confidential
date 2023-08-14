
function drop(){
	
	var x = document.getElementById("drop");
	  if(x.className==="top")
		  {
		    x.className+=" responsive";
		  }
	  else
		  {
		    x.className="top";
		  }
}


  function bmi()
{
    var res=document.getElementById("result");
    
     var h=parseInt(document.getElementById("height").value);
      var w=parseInt(document.getElementById("weight").value);
       var str="";
       var cat="";
        if(isNaN(h)||isNaN(w))
          {
            alert(" enter the valid height or weight");
            }
            else
           {// alert("click ok to proceed");
              var str=w/((h/100)*(h/100));
            //  var str=res.substr(0,res.indexOf(".")+2);
                 str=str.toFixed(2);
                 if(str<18)
                   {
                     cat="under-weight";
                   }
                   else if(str>=18 && str<=25)
                   {
                    cat ="Normal"; 
                   }
                   else
                   {
                    cat="over-weight";
                   }
                   
              //  alert("ans  "+ str);
            }
            
        res.innerText="your BMI index is : "+str+" Category : "+cat; 
         return true;  
}


function check()
{
	
	alert("Are you sure want to submit");
	 var p=document.getElementById("change");
	    var em=document.form2.email.value;
	    var pass=document.form2.password.value;
	    var flag=0;
	    var str="";
	   
	     if(em=="")
	     {str=str+"Email is required\n";document.form2.email.style.borderColor="red";flag=1;}

	   
	   if(pass.length<6)
	     {str=str+"Password should be more than 6 character\n";document.getElementById("password").style.borderColor="red";flag=1;}
        
	    if(flag==1)
	    	{ alert(str);
	    	p.style.color="red";p.innerText=str;return false;}
	  
	    
	    return true;
	}




function signup()
{    var p=document.getElementById("change");
    var first=document.form1.first.value;
   var last=document.form1.last.value;
   var email=document.form1.email.value;
   var mob=document.form1.mob.value;
   var password=document.form1.password.value;
   var confirm=document.form1.confirm.value;
   var flag=0;

   var str="Possible errors :\n";
    if(first=="")
       {str=str+"first name is required\n";document.getElementById("first").style.borderColor="red";flag=1;}
    if(last=="")
       {str=str+"last name is required\n";document.getElementById("last").style.borderColor="red";flag=1;}

    if(email=="")
      {str=str+"Email is required\n";document.getElementById("email").style.borderColor="red";flag=1;}

    if(mob==""||mob.length!=10)
      {str=str+"mobile Number not valid\n";document.getElementById("mob").style.borderColor="red";flag=1;}
    
    
   if(password.length<6)
     {str=str+"password length should be more than 6\n";document.getElementById("password").style.borderColor="red";flag=1;}

     if((password!=confirm)||((password.length<6)&&(password==confirm)))
     {str=str+"password and confirm password aren't matched\n";document.getElementById("confirm").style.borderColor="red";flag=1;}

     if(flag==1)
    {  alert(str); p.style.color="red";p.innerText=str; return false;}

     {alert("ACCEPTED :MESSAGE submitted Succesfully\n");
       return true; } 
  
}


function passcheck(){
   var p=document.getElementById("change");
  var pass=document.forgotpass.password.value;
  var confirm=document.forgotpass.confirm.value;
  var str="";
     if(pass==confirm)
       { 
          return true;
       }
       else
       {  str="password and confirm password doesn't match";
         document.forgotpass.password.style.borderColor="red";
         document.forgotpass.confirm.style.borderColor="red";
          p.innerText=str;
          p.style.color="red";
          return false;
       }


}


function itemsadd(event)
    {    alert("ARE YOU SURE?");
	var p=document.getElementById("newadd"); 
	 
	var data="<div id='temp'>Food Name: <input type='text' id='name'> <br> Upload image :<input type='file' id='image' onchange='fun()' > <br> <h2 color='green'> Nutrients value </h2> <br>  Energy <input type='text' id='energy'> Carbs<input type='text' id='carbs'> <br> protein <input type='text' id='proteins'>  Fats <input type='text' id='fats'> <br> TransFat <input type='text' id='transfat'>  calcium <input type='text' id='calcium'> <button onclick='listing(event)'>Add </button> </div>";
	p.innerHTML=data;
   }
 
  
  
  function fun(){
	  
	  var foodpic=document.getElementById("image");
	  foodpic.src=URL.createObjectURL(event.target.files[0]); 
  }
  
  
  function listing(event)
  {  
	     
	  var append=document.getElementById("appen");
	  var q=document.getElementById("temp");
	  var foodenergy=document.getElementById("energy").value;
	  var foodname=document.getElementById("name").value;
	  var foodpic=document.getElementById("image").src;
	  var foodcarbs=document.getElementById("carbs").value;
	   var foodfats=document.getElementById("fats").value;
	   var foodprotein=document.getElementById("proteins").value;
	   var foodtransfat=document.getElementById("transfat").value;
	   var foodcalcium=document.getElementById("calcium").value;
	  alert("worked");
	  
	    q.innerText="";
	    var data="<div class='row'><div class='col3'> <h3> "+foodname+" </h3> </div> <div class='col5'> <image src="+foodpic+" alt='fooditem' /> </div> <div class='col3'><div><h2> Nutriton compostion </h2> </div><div> <ol><li> Energy:"+foodenergy+" Kcal </li> <li> Carbs:"+foodcarbs+"</li> <li> Protein :"+foodprotein+" </li><li>Fats:"+foodfats+" </li><li>Transfat:"+foodtransfat+"</li> <li>Calcium:"+foodcalcium+"</li> <li> Iron:"+foodcalcium+"</li>  <ol> </div> </div></div>";
	      let appended=document.createElement("div");
	      appended.innerHTML=data;
	      append.appendChild(appended);
	    
	  
	  
	 
	  	  
  }
 

 

