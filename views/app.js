/*=====================================modules===============================================*/
const fs=require('fs');
const express= require('express');
const https=require('https');
const path=require('path')
const requests=require('requests')
const port=80;
const {google } = require("googleapis");
const request=require("request");
const cors=require("cors");
const urlParse=require("url-parse");   //to encode the get-request res.send(url.parse(req.url,true).query);
const queryParse=require("query-string");  //to encode query in url (get-req);
const bodyParse=require("body-parser");  //to encode the post- request (req.body)
const cookieParser=require("cookie-parser");
const axios =require("axios");
const app =express();
const Fitbit=require('fitbit-node');
//const hbs=require("hbs");

/*==========================middle-wares=======================================================*/
const corsOptions ={
  origin:'http://localhost:3000', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(bodyParse.urlencoded({extended:true}));
app.use(bodyParse.json()); // to reciece json data in requests
app.use(cookieParser());
app.use(express.urlencoded())
 /*===============mongoose connection===============================================================*/
const mongoose = require('mongoose')
const mongoURI="mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false"
//const connectToMongo=()=>{

//mongoose.connect(mongoURI,()=>{
  // console.log("connected to mongodb");
//})
//}
mongoose.connect(mongoURI,{useNewUrlParser: true },{useUnifiedTopology:true});

const db= mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',function(){
console.log("mongo  connected");
  });
   
  
/* ============================Login-database===================================================*/
const Favlist=require('./module1.js');
 const Logindetail=require('./module2.js');


//===========================set the various-engine========================================================// 
//app.set('view engine', 'pug');
app.set('view engine','hbs')
//app.set('views',path.join(__dirname,'newpath'));  //for putting views in other folder
//hbs.registerpartials(path.join(__dirname,'partials');
//============================setting the static web===================================================//
const filepath=path.join(__dirname);
//app.use('/newname',express.static(filepath,'public'));    //for storing static files in other folder static 
 app.use(express.static(path.join(__dirname,'public')));  //for storing static files in other directory
 app.use('/css',express.static(path.join(__dirname,'/static/css')));
 
 app.use('/script',express.static(path.join(__dirname,'/static/script')));
 
 //=============================global-declares===========================================
 let login=false;
 const fitbit= new Fitbit({ clientId:"23BL88",clientSecret:"71c8016caecb5c5c293fe6f9e8b6db44",apiVersion:"1.2"});
 const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client("1055590570001-0ho2ga2ra9ot69d55ko8c09san8nase4.apps.googleusercontent.com");
 
 
    function checkAuthenticated(req,res,next){
    if(login==true)
        { next();}
   else
    {let user={};
    console.log(req.cookie);
    console.log(req.cookies);
    let token=req.cookies['session-token'];
   async function verify() {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "1055590570001-0ho2ga2ra9ot69d55ko8c09san8nase4.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend
     
  });
  const payload = ticket.getPayload();
          user.name=payload.name;
          user.email=payload.name;
          user.picture=payload.picture;
          console.log(payload);
}    
verify().then(()=>{
            req.user=user;
            next();
        // res.cookie('session-token',token);
         //res.send('success');     
}).catch(err=>{
     res.redirect('/login');
});
}
       
 }
 
 
 

//=====================routing======================================================================//


app.get('/',(req,res)=>{
   res.status(200).render('index.hbs',{content:'WELCOME'});
  });
app.get('/login',(req,res)=>{
   res.status(200).render('login.hbs',{content :'ALready users login here'});
  });
app.get('/signup',(req,res)=>{
   res.status(200).render('signup.hbs',{content:'New users signup here'});
  });
app.get('/profile',checkAuthenticated,(req,res)=>{
    let cred=req.user;    
   res.status(200).render('profile.hbs',{content:'welcome to feed page',cred});
    // res.sendFile(path.join(__dirname,'/action.html'));
  });
app.get('/dash',(req,res)=>{
    let cred=req.user;    
   res.status(200).render('dashboard.hbs',{content:'welcome to feed page',cred});
    // res.sendFile(path.join(__dirname,'/action.html'));
  });
app.get('/dietplans',(req,res)=>{
    let cred=req.user;    
   res.status(200).render('dietplans.hbs',{content:'welcome to feed page',cred});
    // res.sendFile(path.join(__dirname,'/action.html'));
  });
app.get('/home',(req,res)=>{
   res.status(200).render('index.hbs');
  });
 app.get('/updatepassword',(req,res)=>{
   res.status(200).render('updatepassword.hbs',{content:'Pick new Paasowrd'});
  });
  app.get('/activity',(req,res)=>{
   res.status(200).render('trackactivity.hbs',{content:'WELCOME'});
  });
  
  
//===============================================================================================  

app.get('/fitbit',(req,res)=>{
      let  scope= "profile activity heartrate location nutrition settings sleep social weight";
       res.redirect(fitbit.getAuthorizeUrl(scope,"http://localhost/trackactivity"));   
       });
       //redirects
app.get('/trackactivity',async(req,resp)=>{
    try{
               const queryURL = new urlParse(req.url);
                const code= queryParse.parse(queryURL.query).code;
               console.log("code line is: "+code);
                const res=await fitbit.getAccessToken(code,"http://localhost/trackactivity");
                       console.log(res);
                       let access_token=res.access_token;
                       const url="https://api.fitbit.com/1/user/-/profile.json";
                       const opt={method:'POST',headers: {"Authorization":"Bearer "+access_token}} 
      const result=await axios.request(url,opt); 
             console.log(result);
              resp.send(`${access_token}`);
         }
         catch(e){
         console.log("out to "+e);}
      
 });

//=====================================================================================================
       
 app.post('/glogin',(req,res)=>{
   let token=req.body.token;
   console.log(req.body);
 async function verify() {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "1055590570001-0ho2ga2ra9ot69d55ko8c09san8nase4.apps.googleusercontent.com",  
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
 
  console.log(payload);
  
}     
verify().then(()=>{
      res.cookie('session-token',token);
      res.send('success');
}).catch(err=>{  
    console.log(err);
     res.send('failed');
});
 
 });

//================================================================================================
app.get('/logout',(req,res)=>{
       res.clearCookie('session-token');
       res.redirect('/login');

});

//=================================================================================================
app.post('/saving',(req,res)=>{
    try{
    console.log(req.body);
       Favlist.find({name:req.body.name},function(err,products){
            if(err)
             {
              console.log(err);
             }
             else
             {    let count=0;
                 products.forEach((elem)=>{
                   count++;
                    });
                  if(count==0)
                    {
                      let favupdate= new Favlist(req.body);
               favupdate.save((err,savedproduct)=>{
                     if(err) {res.json({status:"could not done"});}
                       else { 
                          console.log(savedproduct);
                             }
                             }); 
                             res.json({status:"Saved"});
                             }
                    else
                    {
                     res.json({status:"Already exist"});
                    }
             }
             
       }); 
        }
        catch(e){
            console.log(e);
            res.json({status:"failed due to internal error"});
        };
 
});

//===================================================================================================
app.post('/track1',(reqs,res)=>{
  let quant=[];
  let item=[];
  let mealtype="";
    console.log(reqs.body);
      var obj= {item:"text",quant:"text"};
  let i=0;
  let temp="text";
    var url=[];
    var favsave=[];
      for(let x in reqs.body)
        {  let k=i/2;
            
          if(reqs.body[x]=='Submit')
                 {   mealtype=x;  
               continue;}
           if(i%2!=0)                 
            { quant[k]=reqs.body[x];
                 favsave.push({item:temp,quant:reqs.body[x]});
              console.log('Quantity :',quant[k]); 
            }
            else
             { item[k]=reqs.body[x];
            var foodrequest=item[k];
                     temp=reqs.body[x];
               console.log('Items :',item[k]);
      url[k]='https://api.edamam.com/api/food-database/v2/parser?app_id=eb306059&app_key=b6ea433ddc9ee58b9e326e490990f1cd&ingr='+foodrequest+'&nutrition-type=cooking';
             }
          i++;
          }   
      
                     //=======format the schema to database==================
       format={name:item.join(" "),data:favsave};                            
    let req_no=0;
    let respond=[];
    
    
                    //===========consecutive-fooditems-request(meal)=================
 for(let i in url){

 axios.request(url[i]).then(function (response) {
	 try{  
	     console.log(response.data.hints[0].food.nutrients);    
	            respond.push(response.data);
        }
      catch(e)
      {
        console.log('the error is'+e);
      } 
        req_no++;
      
       if(url.length==req_no)
        {console.log(respond);
           
          const datapacket=update(respond,quant,mealtype);
                 total_cal+=datapacket.total;
           
   
                         //===============write-file=======================
            fs.writeFile("./views/calculated.hbs",datapacket.file,(err)=>{
           if(err) {
           console.log(err);
                   }
           else
            {    
            res.render('calculated.hbs',{content: ' '+total_cal.toFixed(2)+' Kcal'});
              
            } 
                                                                 });
                                                                 
          }  //if ends
          
            console.log(req_no+" "+url.length);
        
      }).catch(function (error) {
	console.error("last error is: "+error);
	res.render('calculated.hbs',{content:"request couldn't be fetched due to bad request or bad connection"});
       });
           } //loop-end                                                       
                                                                
 });
      
 //==============================================================================================================     
 
  
 //================================================================================================================
  app.get('/calculate',(req,res)=>{
   total_cal=0;
   const tempfile=fs.readFileSync("./views/calculate.hbs","utf-8");
       fs.writeFile("./views/calculated.hbs",tempfile,(err)=>{
           if(err) {
           console.log(err);
                   }
           else
            {    
            res.render('calculated.hbs',{content:'0 Kcal' });
              
            } 
            });
  });
  
  
  
  
//======================================================================================================
  
  app.post('/loginauthen',(req,res)=>{
     console.log(req.body);
       Logindetail.findOne({email:req.body.email,password:req.body.password},function(err,products){
            if(err)
             {
               console.log(err);
               res.send(err);
             }
             else
             {   
               
                  if(products.length==0)
                    {
                    res.render('login.hbs',{title:'login',content:'Invalid email or Paasword'});
                    }
                    else
                    {  login=true;
                     res.render('profile.hbs',{title:'Feeds',content:req.body});
                    }
          
             }
             
       }); 
  
    // we return response inside bcz of async function  inner delay may impact the result;
    
 });
 
//============================================================================================================
 app.post('/signup',(req,res)=>{
 
    console.log(req.body);
    
     Logindetail.find({$or:[{email:req.body.email},{mob:req.body.mob}]},function(err,products){
            if(err)
             {
               res.send("error");
             }
             else
             {    let count=0;
                 products.forEach((elem)=>{
                   count++;
                    });
                  if(count==0)
                    {
                       var Logindoc= new Logindetail(req.body);
                     Logindoc.save((err,savedproduct)=>{
                     if(err) {res.status(500).send({error:"could not done"});}
                       else { //res.json(savedproduct);
                           res.render('signup.hbs',{title: 'signed in',content:'Invalid email or password'});
                             }
                             
                                                        });
                                        
                    }
                    else
                    {
                     res.render('login.hbs',{title:'login' ,content:'Your accountt is created Now log in here'});
                    }
                    
               }
               
       });
   
  });
 
//====================================================================================================== 
   app.post('/update',(req,res)=>{
         console.log(req.body);
         var Loginupdate=new Logindetail(req.body);
              Logindetail.findOne({email:req.body.email},(err,resp)=>{
            if(err){res.status(400).send('failed');}
            else
            { 
              Logindetail.updateOne({email:req.body.email},{$set: {password :req.body.password}},(req,respo)=>{
              
                     if(err){res.status(401).render('login.hbs',{title:'login',content:'Password didn\'t change'});}
                     else
                      {res.status(200).render('login.hbs',{title:'login',content:' Password changed'}); }
              
              
              })
            
            }
      
      });       
 
 });
 //=========================================================================================================== 
 app.get('/check',(req,res)=>{
    const oauth2Client = new google.auth.OAuth2(
    
    "1055590570001-0ho2ga2ra9ot69d55ko8c09san8nase4.apps.googleusercontent.com",
    "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",
    "http://localhost/fitness"
    
    );	
    
    const url= oauth2Client.generateAuthUrl({
        access_type:"offline",
        scope:[ "https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.nutrition.read https://www.googleapis.com/auth/fitness.nutrition.write profile email openid "],
        state: JSON.stringify({
        callbackUrl: req.body.callbackUrl,
        userID:req.body.userid,
                              })
        
                                            });
                                            
   
  // request.get(url,(err,resp,body)=>{
      // console.log("error:",err);
        //console.log("response : ",resp);
     //   console.log(body); 
        
   // res.send(`<a href=${url}> Continue </a>`); 
            //res.send(body);
                                                                  
 //});
   res.redirect(url);
  });
   
 //================================================================================================  
    app.get("/fitness",async(req,res)=>{
       let obj={};
           try{
             const queryURL = new urlParse(req.url);
             const code= queryParse.parse(queryURL.query).code;
             console.log("code line is: "+code);
            
         const oauth2Client = new google.auth.OAuth2(
            
      "1055590570001-0ho2ga2ra9ot69d55ko8c09san8nase4.apps.googleusercontent.com",
    "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",
    "http://localhost/fitness"
      
      );
      const tokens =await oauth2Client.getToken(code);
       console.log("token "+tokens.tokens.access_token);
             
                 let arr=[];
                             try{
                     const result= await axios({
                        method: "POST",
                         headers :{ authorization : "Bearer "+tokens.tokens.access_token
                         },
                        "Content-Type" : "application/json",
                        url: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
                       data: {
                                 "aggregateBy": [{
                                   "dataTypeName": "com.google.step_count.delta",
                                   "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
                                                 }],
                                     "bucketByTime": { "durationMillis": 86400000 },
                                      "startTimeMillis":1636120259924,
                                       "endTimeMillis": 1636206659924,
                              }    
                                       });  
                                       
                                        console.log(result.data.bucket[0].dataset[0].point[0]);
                                        
                                    
                                       res.render('trackactivity.hbs');
                                       //res.send({rres});          
                             }
                             catch(e)
                             {
                               console.log();
                               res.render(tokens);
                             }
                             
                            
       
       }catch(err){
          console.log("outer "+err);
           
       }
      
});
  
  
  app.get('*',(req,res)=>{
  res.send('<h1 align="center">404 page not found<h1> ')

});
  
  
 
 
  
 
app.listen(port,()=>{
console.log(`the app started on port ${port}`);

});