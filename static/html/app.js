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
const urL=require('url');
const queryParse=require("query-string");  //to encode query in url (get-req);
const bodyParse=require("body-parser");  //to encode the post- request (req.body)
const cookieParser=require("cookie-parser");
const axios =require("axios");
const app =express();
const Fitbit=require('fitbit-node');
//const hbs=require("hbs");

/*==========================middle-wares=======================================================*/
app.use(cors());
app.use(bodyParse.urlencoded({extended:true}));
app.use(bodyParse.json()); // to reciece json data in requests
app.use(cookieParser());
app.use(express.urlencoded())
/* ============================Login-database===================================================*/
const Favlist=require('./module1.js');
 const Logindetail=require('./module2.js');
 const JobDetails=require('./module3.js');


/*===============mongoose connection===============================================================*/
const mongoose = require('mongoose');
const joblist=require('./details.json');
//const mongoURI="mongodb://localhost:27017/kammm"
const dbUrl='mongodb+srv://onefit:oceankam@cluster0.g5mindc.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(dbUrl,{useNewUrlParser: true});
const db= mongoose.connection;
db.on('error',()=>{console.log('connection error:')});
db.on('connected', async ()=>{

  console.log("mongo  connected")});

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
 let format;
 let total_cal=0;
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
//===============================================================================================  


let FitbitAuth;
app.get('/fitbit',async(req,res)=>{      
        let  scope= "profile activity heartrate location nutrition settings  sleep social weight";
        const path= await fitbit.getAuthorizeUrl(scope,"http://localhost/trackactivity"); 
          console.log(path);
         res.redirect(path);
       });
       //redirects
app.get('/trackactivity',async(req,resp)=>{
    try{        console.log("trackactivity is ",req);
                const queryURL = new urlParse(req.url);
                console.log(queryURL.query);
                const code= queryParse.parse(queryURL.query).code;
                console.log("code line is: "+code);
                const res=await fitbit.getAccessToken(code,"http://localhost/trackactivity");
                           FitbitAuth=res;
                            console.log(res);
                       
             resp.send('<h4 style="color:white;background:black;text-align:center"> <p> Success </p> <ul> <li> CLOSE THIS PANEL </li> <li> GO BACK TO PROFILE </li> <li> CLICK CONTINUE IN PROFILE SECTION TO PROCEED  <li> </ul></h4>');
            //res.end();
         }
         catch(e){
         console.log("out to "+e);}
      
 });

app.get('/getpass',(req,res)=>{
  res.send(FitbitAuth);
});



//=====================================================================================================

 app.post('/glogin',(req,res)=>{
   let token=req.body.token;
  console.log(req.body);
  verify().then(()=>{
    res.cookie('session-token',token);
    let profile={firstname:req.body.cred.givenName,
    lastname:req.body.cred.familyName,
    birth:'NA',
    Age:'NA',
    gender:'NA',
    mobile:'NA',
    email:req.body.cred.email,
    password: 'NA',
    pic:req.body.cred.imageUrl}
   console.log(profile);
           Logindetail.findOne({email:profile.email},function(err,products){
          if(err)
           {
                  console.log(err);
              res.json({status:'failed',content:'due to external error',code:0});
           }
           else
           {    
              try{
                console.log("products are :",products);
              
                  if(!products){
                     var Logindoc= new Logindetail(profile);
                   Logindoc.save((err,savedproduct)=>{
                   if(err) {res.json({status:'error',content:"could not done",code:0});}
                   else 
                   {console.log('saved : ',savedproduct)}
                                                     });
                         }
                  else
                  {console.log('already');
                  profile=products;}
                 res.json({status:'okk',content:profile,code:1});
                  }
                  catch(e)
                  {
                    console('databease error',e);
                     res.json({status:'error',content:'databasefailed',code:0});
                  }
  
                  
             }
             
     });        
  }).catch(err=>{  
  console.log(err);
   res.json({status:'failed'});});    
 async function verify() {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "1055590570001-0ho2ga2ra9ot69d55ko8c09san8nase4.apps.googleusercontent.com",  
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  console.log(payload);
}     

 });
 
//================================================================================================

app.get('/post',async(req,res)=>{ 
   //  const format={name:'kami',data:[{item:'toma',quant:'12'}]}; 
     // const format={email:'kamilsingh@amil.com',password:'cccccccccc'};  
         const format={firstname:'akshay',
                       lastname:'singh',
                       birth:"23-10-1998",
                       Age:21,gender:'M',
                       mobile:'09878879099',
                       email:'mymai@nmail.com',
                       password:'090998090909'};  
          const opt={method:'POST',
          headers:{ 'Content-Type': 'application/json'},
          data:JSON.stringify(format)};
         const result=await axios.request('http://localhost/fitbit'); 
            console.log(result.data);
              res.send('done');
              
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
             {   
                console.log(products);
                  if(products.length===0)
                    {
                      let favupdate= new Favlist(req.body);
                    favupdate.save((err,savedproduct)=>{
                     if(err) {res.json({status:"could not done",code:0});}
                       else { 
                          console.log(savedproduct);
                             }
                             }); 
                             res.json({status:"Saved",code:1});
                             }
                    else
                    {
                     res.json({status:"Already exist",code:2});
                    }
             }
             
       }); 
        }
    
        catch(e){
            console.log(e);
            res.json({status:"failed due to internal error",code:0});
        };
 
});  
 
 
//======================================================================================================
  
  
  
  app.post('/loginauthen',(req,res)=>{
     console.log(req.body);
       
         try{
       Logindetail.findOne({email:req.body.email,password:req.body.password},function(err,products){
                  if(err)
                  {
                   console.log(err);
                   res.json({title:'failed',content:'due to external error',code:0});
                  }
                  else
                 {   
                    console.log(products);
                    
                     if(!products)
                     { 
                     res.json({title:'Authenication Failed',content:'Invalid email or Password',code:0});
                     }
                    else
                    { 
                      res.json({title:products.firstname,content:products,code:1});
                    }
          
                 }
          
            });
            
          }
          catch(e)
          {
           res.json({title:'Database fetch failed',content:'couldn fetch database',code:0});
          } 
  
    // we return response inside bcz of async function  inner delay may impact the result;
    
 });
 
//============================================================================================================
 app.post('/signup',(req,res)=>{
 
    console.log(req.body);
     const signupcred={...req.body,pic:"NA"};
       
    
     Logindetail.findOne({email:req.body.email},function(err,products){
            if(err)
             {
                    console.log(err);
                res.json({status:'failed',content:'due to external error',code:0});
             }
             else
             {    
                try{
                  console.log("products are :",products);
                
                    if(!products){
                       var Logindoc= new Logindetail(signupcred);
                     Logindoc.save((err,savedproduct)=>{
                     if(err) {res.json({status:'error',content:"could not done",code:1});}
                       else { res.json({status:'Success' ,content:'Your accountt is created Now log in here',code:1});}
                             
                                   });
                          
                                 }
                    else
                    {res.json({status:'Access Denied',content:'email already registered',code:1});}
                    }
                    catch(e)
                    {
                      console('databease error',e);
                       res.json({status:'error',content:'databasefailed',code:0});
                    }

                    
               }
               
       });
   
  });
 
//====================================================================================================== 
   app.post('/update',(req,res)=>{
         console.log(req.body);
         var Loginupdate=new Logindetail(req.body);
              Logindetail.findOne({email:req.body.email},(err,res1)=>{
            if(err){res.json({status:'error',content:'database error'})}
              else
              {
                if(res1)
                 { 
                  Logindetail.updateOne({email:req.body.email},{$set: {password :req.body.password}},(req,res2)=>{
                     if(err){res.json({status:'error',content:'update error'});}
                     else
                      {res.json({status:'updated',content:' Password changed'}); }
                                                                                                })
                 }
               else
                 {
                   res.json({status:'No Match',content:'No account matched with email'});
                 }
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
   
               try{
                     const result= await axios({
                        method: "POST",
                         headers :{ authorization : "Bearer "+tokens.tokens.access_token
                         },
                        "Content-Type" : "application/json",
                        url: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
                       data:{
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