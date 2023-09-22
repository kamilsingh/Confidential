/*=====================================modules===============================================*/
const express = require('express');
const path = require('path')
const port = process.env.PORT||80;
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParse = require("body-parser");  //to encode the post- request (req.body)
const cookieParser = require("cookie-parser");
const app = express();
const joblist = require('./details.json');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const verifyme =require('./middleware/getuser.js');
const { body, validationResult } = require('express-validator');
const PaytmChecksum=require('./Checksum');
const formidable =require('formidable');
const Mailgen = require('mailgen');
const multer=require('multer');
/*==========================middle-wares=======================================================*/
require('dotenv').config();
app.use(cors({origin:'*'}));
app.use(bodyParse.urlencoded({ limit:'50mb',extended: true }));
app.use(bodyParse.json({limit:'50mb'})); // to reciece json data in requests
app.use(cookieParser());

app.use(express.urlencoded())
/* ============================database-Schema===================================================*/
const Logindetail = require('./Schemas/UserAccountSchema.js');
const UserJobDetails = require('./Schemas/userJob.js');
const JobDetails = require('./Schemas/Jobs.js');
const Feedback=require('./Schemas/UserExperienceSchema');
const UserDocument=require('./Schemas/UserDocs')
const FileDocs=require('./Schemas/Documents')
const UserWallet=require('./Schemas/UserWallet');
const BASE_URL=process.env.BASE_URL;
/*===============mongoose connection===============================================================*/
const mongoose = require('mongoose');

//const mongoURI="mongodb://localhost:27017/kammm"
const dbUrl = process.env.DATABASE;
mongoose.connect(dbUrl, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', () => { //console.log('connection error:') 
     });
db.on('connected', async () => {
  //console.log("mongo  connected");
});

//===========================set the various-engine========================================================// 
//app.set('view engine', 'pug');
//app.set('views',path.join(__dirname,'newpath'));  //for putting views in other folder
//============================setting the static web===================================================//
//app.use('/newname',express.static(filepath,'public'));    //for storing static files in other folder static 
app.use(express.static(path.join(__dirname, 'public')));  //for storing static files in other directory
app.use('/css', express.static(path.join(__dirname, '/static/css')));
app.use('/script', express.static(path.join(__dirname, '/static/script')));

  
//=============================global-declares===========================================
let usertoken="";
let login = false;
const JWT_SECRET = 'officialkam$9';

let smtpTransport = require('nodemailer-smtp-transport');
const upload = multer();


function checkAuthenticated(req, res, next) {
  if (login == true) { next(); }
  else {
    let user = {};
    let token = req.body['token'];
    async function verify() {   
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "1055590570001-0ho2ga2ra9ot69d55ko8c09san8nase4.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend

      });
      const payload = ticket.getPayload();
      user.name = payload.name;
      user.email = payload.name;
      user.picture = payload.picture;
      //console.log(payload);
    }
    verify().then(() => {
      req.user = user;
      next();
      // res.cookie('session-token',token);
      //res.send('success');     
    }).catch(err => {
      res.redirect('/login');
    });
  }
}
app.get('/sendmail',async(req,res)=>{
      
  //console.log('check');
   try{
  async function main() {

      let testAccount = await nodemailer.createTestAccount();
    
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'abel.kuphal@ethereal.email',
            pass: 'BQNDA9qJbjKVZwdeJq'
        }
    });
    
      let info = await transporter.sendMail({
        from: '"admin 👻" <admin@digispot.com>', // sender address
        to: 'officialkam9@gmail.com', // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
      });
    
      //console.log("Message sent: %s", info.messageId);
    
      //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
      res.json({status:'success',desc:'Sent Succesfully',code:info});
    } 
    
    main().catch(console.error);
  

  }catch(e)
  {
     //console.log('error ',e);
     res.json({status:'error',desc:'Could not sent mail',code:'0'});
  }
})
let otpBox=[];
app.post('/sendmail2',(req,res)=>{
  const {userName,userEmail}=req.body; 
  const OTP=Math.floor((Math.random() * 1000000) + 100000);
  otpBox[userEmail]=OTP;
  //console.log(otpBox); 
})

app.post('/sendmail1',(req,res)=>{
   const {userName,userEmail}=req.body; 
   
   const EMAIL='officialkam9@gmail.com';
    const PASSWORD='jqxdiwihykshvuov';
    const OTP=Math.floor((Math.random() * 1000000) + 100000);   
    otpBox[userEmail]=OTP;
    //console.log(otpBox); 
  let transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
      user:  EMAIL,
      pass:   PASSWORD,
    }
  }));

  let MailGenerator = new Mailgen({
      theme: "default",
      product : {
          name: "Mailgen",
          link : 'https://mailgen.js/'
      }
  })




  let response = {
      body: {
          name : userName,
          intro: "DigiSpot User",
          table : {
              data : [
                  { Message : "Your One Time password for DigiSpot Account is",
                    code: OTP,
                  }
              ]
          },
          outro: "Note: 1) Kindly Don't share OTP With anyone\n 2) This OTP will be valid for 10 min only "
      }
  }

  let mail = MailGenerator.generate(response)

  let message = {
      from : 'admin@digispot.com',
      to : userEmail,
      subject: "DigiSpot Account OTP",
      html: mail
  }

  transporter.sendMail(message).then(() => {
      //console.log('Email Sent Successfully to ',message.to);  
    return res.status(201).json({
          msg: "Email Sent Successfully"
      })
  }).catch(error => {
      return res.status(500).json({ error })
  })

})


app.post('/user/profileUpdate',verifyme,upload.single('file'),async (req, res) => {
 
  //console.log(req.body,req.file);
    try{
      //console.log('updateing ',req.body.name);
             if(req.file)
              {
              const field=req.body.name;
              const {buffer,mimetype,originalname}=req.file;
              const newFile = new FileDocs({
               name: field,
               data: buffer,
               contentType: mimetype,
               primaryName:originalname,
              user:req.user.id 
            });
   
         newFile.save( async (err, file) => {
       if (err) {
           console.error(err);
           return res.json({status:'failed',desc:'Error uploading file',code:'0'});
                }
               
               let user=await Logindetail.findOne({_id:req.user.id});
                  user['pic']=`${BASE_URL}/download/${file.id}`;
               //console.log(user); 
               const updated=await Logindetail.findByIdAndUpdate(req.user.id,{...user});
                //console.log(updated);  
              
            return  res.json({status:'success',data:user,code:1});
              })
         }
         else
         {   
          const field=req.body.name;
             
          const value=req.body.file;   
          let user=await Logindetail.findOne({_id:req.user.id});
            if(field==='name')
            {   const temp=value.split(' ');
               user['firstname']=temp[0];
               if(temp.length>2)user['middlename']=field.split(' ')[1];
               user['lastname']=temp[temp.length-1];
            }
           else
           {
            user[field]=value;
           }
          //console.log(user); 
          const updated=await Logindetail.findByIdAndUpdate(req.user.id,{...user});
           //console.log(updated);
        return  res.json({status:'success',data:user,code:1});   
         }
      }
    catch(e)
    {
         //console.log('error ',e);
         return res.json({status:'failed',desc:'Error uploading file',code:'0'});
    }
   });  

/*============================files ======================================================================*/

app.post('/user/DocumentUpload',verifyme,upload.single('file'), (req, res) => {
 
  try{
   const {name}=req.body;
   const {buffer,mimetype,originalname}=req.file;
   //console.log(req.body,req.file);
   const newFile = new FileDocs({
    name: name,
    data: buffer,
    contentType: mimetype,
    primaryName:originalname,
    user:req.user.id 
  });

  newFile.save((err, file) => {
    if (err) {
      console.error(err);
      return res.json({status:'failed',desc:'Error uploading file',code:'0'});
            }
     return  res.json({status:'success',desc:'File uploaded successfully',code:'1'});
       })
    }
    catch(e)
    {
      //console.log('error ',e);
      return res.json({status:'failed',desc:'Error uploading file',code:'0'});
    }
});


app.get('/download/:id', (req, res) => {
  const fileId = req.params.id;

  FileDocs.findById(fileId, (err, file) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error downloading file');
    }

    res.set('Content-Type', file.contentType);
    res.send(file.data);
  });
});

app.post('/updatePassword',async (req,res)=>{
     const {email,password}=req.body;
     
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      const password1=secPass;
     
     const user=await Logindetail.findOne({email:email});
        //console.log(user);
          Logindetail.findByIdAndUpdate(user._id,{password:password1},function (err,updated){
            if(err)
            {
              //console.log(err);
              res.json({status:'failed',desc:'Couldn\'t perfrom the specific action',code:0});
            }
            else
            {   
               //console.log(updated);
                 res.json({code:1});
            }
          });
})

app.post('/authenOTP',(req,res)=>{
    const temp=parseInt(req.body.OTP); 
       //console.log(temp);
       //console.log(req.body.email);
  if(temp===otpBox[req.body.email])
   res.json({code:1});
   else
   res.json({code:0});

 })


app.post('/paymentDetails',(req,res)=>{
    const form=new formidable.Incomingform();
      form.parse(req,(err,fields,file)=>{
        if(err)
        {
          //console.log(err);
        }  
        //console.log(fields);
        res.send(fields);

    })
})


app.post('/rechargeViaPaytm',(req,res)=>{

  const {amount,email,mobile}=req.body;
  var paytmParams = {};

  //paytmParams["ORDER_ID"] = "process.env.PAYTM_ORDER_ID";
  paytmParams["EMAIL"]= email;
  paytmParams["TXN_AMOUNT"]=amount;
  paytmParams["MOBILE_NO"]=mobile;
  paytmParams["MID"] ='AASDFG1234567DFGHGFD345' ;
  paytmParams["CHANNEL_ID"]="WEB";
  paytmParams["WEBSITE"]="WEBSTAGING";
  paytmParams["INDUSTRY_TYPE_ID"]="Retail";
  //paytmParams["CUST_ID"]=process.env.PAYTM_INDUSTRY_CUST_ID;
  paytmParams["CALLBACK_URL"]=`${BASE_URL}/paymentDetails`;
  var paytmChecksum =PaytmChecksum.generateSignature(paytmParams, "34567DFGHGFd3456789876");
  paytmChecksum.then(function(checksum){
    //console.log("generateSignature Returns: " + checksum);
       let response={...paytmParams,'CHECKSUMHASH':checksum} 
      res.json(response);
  }).catch(function(error){
    //console.log(error);
  });
});

app.get('/getUserDocument',verifyme,async(req,res)=>{
  try{
  const result=await FileDocs.find({user:req.user.id});
  res.json({ status: "success",data:result, code: 1});
  }catch(e)
  {
    res.json({ status: "Server Down", code: 0 });
  }

})

app.post('/deleteUserDocument',verifyme,async(req,res)=>{
  try{
  const result=await UserDocument.findByIdAndRemove({user:req.user.id,_id:req.body._id});
  res.json({ status: "success",data:result, code: 1});
  }catch(e)
  {
    res.json({ status: "Server Down", code: 0 });
  }

})

app.get('/user/wallet',verifyme,async(req, res) => {
  try{
    const result=await  UserWallet.findOne({user:req.user.id});
       //console.log(result);
    res.json({ status: "success",data:result, code: 1});
    }catch(e)
    {
      res.json({ status: "Server Down", code: 0 });
    }
});

app.post('/addUserDocument',verifyme,async(req, res) => {
  //console.log(req.body);
  try {    
    const format={user:req.user.id,docName:req.body.name,docFile:req.body.file}
    
  const doc= new UserDocument(format);
        //console.log(doc);
        doc.save((err, savedproduct) => {
          if (err) { res.json({ status: "Server Down", code: 0 }); }
          else {
            //console.log(savedproduct);
                 res.json({ status: "Saved", code: 1 });
          }
        });
       
     
    }
    catch(e)
    {
      //console.log(e);
      res.json({ status: "Server Down", code: 0 });
    }  
});

app.get('/getjobs', async(req, res) => {
  //console.log('peeked');
  const data=await JobDetails.find({});  
//console.log(data.length);
return res.json(data);
});

app.get('/seekjobs', async (req, res) => {
  let { jobquery } = req.query;
  if (jobquery) {
    const result = await JobDetails.aggregate([
      {
        $search: {
          index: "seekjobs",
          text: {
            query: jobquery,
            path: {
              wildcard: "*"
            }
          }
        }
      }
    ]);
   return res.json(result);
  }
 return  res.json({ Data: `Oops we couldn't fetch you ${jobquery} this time,try finding with something else` })
});

app.get('/searchjobs', async (req, res) => {
let { term } = req.query;
  let regex = new RegExp(term, "i");
  //console.log(regex);
  let list = [];
  let filterjob = JobDetails.find({ 'index': regex });
  await filterjob.exec(function (err, data) {

    if (!err) {
      if (data && data.length) {

        res.json({code:1,data:data});
      }
      else {
        res.json({code:0,data:'No Job available for your query'});  
      }
    }
    else {
      //console.log(err);
      res.json({code:0,data:'Server Error'});
    }
  });
})
app.get('/autosuggest', async (req, res) => {
  let { term } = req.query;
  let regex = new RegExp(term, "i");
  let list = [];
  let filterjob = JobDetails.find({ 'index': regex }).limit(10);
  await filterjob.exec(function (err, data) {

    if (!err) {
      if (data && data.length) {

        for (let i = 0; i < data.length; i++) {
          let obj = {
            index: data[i].index,
            id: data[i]._id,
          }

          list.push(obj);

        }
        res.jsonp(list);
      }
      else {
        list.push({ index: `No Suggestions with ${term}` })
        res.jsonp(list);
      }
    }
    else {
      //console.log(err);
      list.push({ index: `Invalid Search with query ${term}` });
      res.jsonp(list);
    }
  });
  //     if(term)
  //       {
  //       const result=await JobDetails.aggregate([
  //      {
  //     $search: {
  //       index: "suggestions",

  //       'autocomplete': {
  //         query: term==''?'':term,
  //         path:'index'
  //       },
  //         'highlight':{
  //         path: [ 'index']
  //       }
  //     }
  //   },
  //   {
  //     $limit:10
  //   },
  //   {
  //     $project:{
  //       title:1,
  //       highlights:{
  //         $meta:'searchHighlights'
  //       }
  //     }
  //   }
  // ]); 

  // let list=[];
  //
  // result.map((e)=>{
  //  let answer="";
  // e.highlights[0].texts.map((val)=>{
  //  answer+=val.value;
  //});

  //list.push(answer);
  //  });
  //  if(list.length===0)
  //  list.push(`No Suggestions with ${term}`);
  // console.log(list);  

  //res.jsonp(list);
  //  }
  // else
  //{  
  //  console.log("No query");
  // res.json({data:"No query found"});
  // }
});
app.get('/filterjobs', async (req, res) => {

  const { company, location, education, category, link, search } = req.query;
  let info = {};
  if (company) {
    info['info.company'] = { $regex: company, $options: "i" };
  }
  if (location) {
    info['info.location'] = { $regex: location, $options: "i" };
  }
  if (education) 
  {
    info['info.education'] = { $regex: education, $options: "i" };
  }
  if (category) 
  {
    info['details.links'] = { $regex: link, $options: "i" };
  }

  //console.log(info);
  const result = await JobDetails.find(info);
  res.json(result);

});
//=====================================================================================================================================

app.post('/glogin',checkAuthenticated,async (req, res)=>{
  let token = req.body.token;
  //console.log(req.body);
  verify().then( async () => {
    res.cookie('session-token', token);
   
   
  let user=await Logindetail.findOne({ email: profile.email ,admin:profile.admin});
      try {

          if (!user) {
            let profile = {
              firstname: req.body.cred.givenName,lastname: req.body.cred.familyName,birth: 'NA',Age: 'NA',gender: 'NA',mobile: 'NA',email: req.body.cred.email,
                password: 'NA',pic: req.body.cred.imageUrl,admin:req.body.admin,
              }
              //console.log('New ',profile);
            let Logindoc = new Logindetail(profile);
            //console.log(Logindoc);
            Logindoc.save((err, savedproduct) => {
              if (err) { res.json({ status: 'error', content: "Server Issue,Please try again later", code: 0 }); }
              else { 
                //console.log('saved : ', savedproduct) 
                 }
             });
          }
          //console.log(user);
          res.json({status:'success',content:user,code:0});
        }
        catch (e) {
          //console.log('database error', e);
          res.json({ status: 'error', content: 'Server Down,Please try again later', code: 0 });
        }
  });
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "1055590570001-0ho2ga2ra9ot69d55ko8c09san8nase4.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    //console.log(payload);
  }

});

app.get('/admin/fetchusers',verifyme ,async (req, res) => {
  const result=await Logindetail.find({});
  //console.log(result);
  res.json(result);})
  

app.get('/admin/fetchfeedbacks',verifyme ,async (req, res) => {
  const result=await Feedback.find({});
  //console.log(result);
  res.json(result);})
//=================================================================================================
app.post('/savefeedback',verifyme,(req, res) => {
  try {    
      const format={user:req.user.id,ReferenceId:req.body.id,feedback:req.body.feedback}
      
    const feeds= new Feedback(format);
          //console.log(feeds);
          feeds.save((err, savedproduct) => {
            if (err) { res.json({ status: "Server Down", code: 0 }); }
            else {
              //console.log(savedproduct);
                   res.json({ status: "Saved", code: 1 });
            }
          });
         
       
      }

  catch (e) {
    //console.log(e);
    res.json({ status: "failed due to internal error", code: 0 });
  };

});


//======================================================================================================

app.post('/admin/updatependingjobs',async(req,res) =>{
   let {status,id,remark}=req.body;   
     if(status==='Done')
     { UserJobDetails.findByIdAndUpdate(id,{status:'Done'},function (err,updated){
    if(err)
    {
      //console.log(err);
      res.json({status:'failed',desc:'Couldn\'t perfrom the specific action',code:'0'});
    }
    else
    {   
       //console.log(updated);
         res.json({status:'failed',desc:'Couldn\'t perfrom the specific action',code:''});
    }
  });
  }
  else
  {
    UserJobDetails.findByIdAndUpdate(id,{status:'Action',remark:remark},function (err,updated){
      if(err)
      {
        //console.log(err);
        res.json({status:'failed',desc:'Couldn\'t perfrom the specific action',code:'0'});
      }
      else
      {   
         //console.log(updated);
           res.json(updated);
      }
  });
}

});

app.post('/loginauthen', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    //console.log(req.body);
  try {
     
    const error = validationResult(req);
    if (!error.isEmpty()) {
    res.status(400).json({ title:'failed',content:'Invalid Credential' ,code:0}); 
    }
    else
    {let user= await Logindetail.findOne({email:req.body.email,admin:req.body.admin});  
    if (!user) {
          res.json({ title: 'Authenication Failed', content: 'Email not Registered', code: 0 });
        }
        else {
        
          const passwordCompare = await bcrypt.compare(req.body.password, user.password);
              if(!passwordCompare)
              {
                return res.json({ title: 'Authenication Failed', content: 'Incorrect Password', code: 0 });
              }
              
                const data = {
                  user: {
                    id: user.id
                  }
                }
                usertoken = jwt.sign(data, JWT_SECRET);
                    
                res.json({ title:'Success',content:user,token:usertoken});  
            }
    }
  }
  catch (e) {
       //console.log(e);
    res.json({ title: 'Failed', content: 'Server Issue,Please try again later', code: 0 });
  }

 

});

app.post('/accountAuthenticate', [
  body('email', 'Enter a valid email').isEmail(),
], async (req, res) => {
    //console.log(req.body);
  try {
     
    const error = validationResult(req);
    if (!error.isEmpty()) {
    res.status(400).json({ title:'failed',content:'Email Incorrect',code:0}); 
    }
    else
    {let user= await Logindetail.findOne({email:req.body.email});  
    if (!user) {
          res.json({ title: 'failed', content: 'Email not Registered', code: 1 });
        }
        else {
        
           res.json({ title:'Success',code:2});  
            }
    }
  }
  catch (e) {
       //console.log(e);
    res.json({ title: 'Failed', content: 'Server Issue,Please try again later', code: 0 });
  }

 

});

app.get('/refreshjobs', (req,res)=>{
  JobDetails.deleteMany({});
  JobDetails.create(joblist);
    res.send('Jobs Are Updated');
});

//=================================================================================================
app.get('/fetchpendingjobs',verifyme ,async (req, res) => {
    const result=await UserJobDetails.find({status:'Pending',user:req.user.id});
    //console.log(result);
    res.json(result);
});

app.get('/fetchactionjobs',verifyme,async (req,res)=>{ 
  try 
   { 
     const fetched=await UserJobDetails.find({status:'Action',user:req.user.id});
       //console.log(fetched);    
       res.json(fetched);
   }
   catch(e)
   {
      //console.log(e);
      res.json({ status: "Bad Error", code: 0 });  
   }
});

app.get('/fetchdonejobs',verifyme, async (req,res)=>{
   try{
  const result=await UserJobDetails.find({status:'Done',user:req.user.id});
    //console.log(result);
    res.json(result);
  }
  catch(e)
  {
   //console.log(e);
   res.json({ status: "Bad Error", code: 0 });
  }
})

app.get('/admin/fetchpendingjobs',verifyme ,async (req, res) => {
   try{
  const result=await UserJobDetails.find({status:'Pending'});
  //console.log(result);
  res.json(result);
   }
   catch(e)
   {
    //console.log(e);
    res.json({ status: "Bad Error", code: 0 });
   }
});

app.get('/admin/fetchactionjobs',verifyme,async (req,res)=>{ 
try 
 { 
   const fetched=await UserJobDetails.find({status:'Action'});
     //console.log(fetched);    
     res.json(fetched);
 }
 catch(e)
 {
    //console.log(e);
    res.json({ status: "Bad Error", code: 0 });  
 }
});

app.get('/admin/fetchdonejobs',verifyme, async (req,res)=>{
  
 try{
  const result=await UserJobDetails.find({status:'Done'});
  //console.log(result);
  res.json(result);
}
catch(e)
{
 //console.log(e);
 res.json({ status: "Bad Error", code: 0 });
}
})

app.post('/addjobrequest',verifyme ,async (req, res) => {
  
    const {id}=req.body;
     const matchedjob= await JobDetails.find({_id:id});
       //console.log(matchedjob); 
     if(matchedjob.length===0)
       {
        return res.json({status:'failed',desc:'This job is no longer available',code:2});
       }
      else{
            let userNewPending={user:req.user.id,status:'Pending',job:matchedjob,jobId:id,remark:'NA'};
        const result= new UserJobDetails(userNewPending);
       result.save((err,saved)=>{
              if(err)
                {
                   //console.log(err);
                  res.json({status:'Failed',desc:'Server Error',code:3})
                }
                else
                {
                //console.log(saved);
                 res.json({status:'Success',desc: saved,code:1});
                }
            })
         }
  
  });

//============================================================================================================
app.post('/signup', [
  body('email', 'Invalid Email').isEmail(),
  body('mobile', 'Mobile no. should be valid ten digits').isLength({ min: 10, max: 10 }),
  body('password', 'password should conatin atleast 8 character').isLength({ min: 8 })

], async (req, res) => {
  //console.log("check");
  const error = validationResult(req);

              if (!error.isEmpty()) {
              let temp=""  
                error.errors.forEach((val)=>{
                   temp+=val.msg+"\n";
                })
              return  res.json({ status: 'Failed', content:temp});
                }
                
  try {
  let user= await Logindetail.findOne({ email:req.body.email,admin:req.body.admin });
      
        if (!user) {
          const salt = await bcrypt.genSalt(10);
          const secPass = await bcrypt.hash(req.body.password, salt);
          req.body.password=secPass;
          user = { ...req.body, pic: "NA" };
         
          var Logindoc = new Logindetail(user);
          Logindoc.save( async (err, saveduser) => {

            if (err) { res.json({ status: 'error', content: "Server Down,Please Try Again Later", code: 1 }); }
              //console.log(saveduser);
              const data = {
                user: {
                  id: saveduser.id
                }
              }
             
                wallet={
                  user:saveduser.id,
                  username:req.body.email.split('@')[0],
                  balance:120.50,
                  transactions:[],
                }

              var userWallet = new UserWallet(wallet);
              userWallet.save( async (err, savedwallet) => {
    
                if (err) { res.json({ status: 'error', content: "Server Down,Please Try Again Later", code: 1 }); }
                  //console.log(savedwallet);
                     
            });
            const authtoken = jwt.sign(data, JWT_SECRET);
             res.json({ status: 'Success', content: "Your account is created sucessfully, Now log in here", code: 1 });
        }
      )}
      else
        { res.json({ status: 'Failed', content: 'Email already registered', code: 1 }); }
      }
      catch (e) {
        //console.log('database error', e);
        res.json({ status: 'error', content: 'Server Error,Please Try Again Later', code: 0 });
      }

  });

//====================================================================================================== 



app.get('*', (req, res) => {
  res.send('<h1 align="center">404 page not found<h1> ')

});

const server=app.listen(port, () => {
 
  //console.log(`the app started on port ${port}`);

});

const io = require('socket.io')(server,{
    cors:{
      origin:'*',
      method:['GET','POST']
    }
})

let socketsConected = new Set()
let users = {};
let callUser={}
let socketToRoom = {};
let socketToCallRoom = {};
io.on('connection', onConnected)

function onConnected(socket) {
  //console.log('Socket connected', socket.id);
  socketsConected.add(socket.id)
  io.emit('clients-total', socket.id)

  socket.on('disconnect', () => {

    socketsConected.delete(socket.id);
    //console.log('Socket disconnected', socket.id,socketsConected.size);
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
        room = room.filter(id => id !== socket.id);
        users[roomID] = room;
        socket.broadcast.emit('user left', socket.id);
    }
  
  })


  socket.on("joinCall", (data) => {
       
   if (callUser[data.name]) {
             const length = callUser[data.name].length;
              if (length === data.max)
              { socket.emit("max no. of users limit exceed",users);
                 return;
              }
              callUser[data.name].push(socket.id);
              }
              else
              {
                callUser[data.name] = [socket.id];
              }
         socketToCallRoom[socket.id] = data.name;
         const usersInThisRoom = callUser[data.name].filter(id => id !== socket.id);
         
         socket.emit("Secured your connection", usersInThisRoom);
     })

  socket.on('open-message', (data) => {
    //console.log(data)
    socket.broadcast.emit('chat-message', data)
  })
  socket.on('open-feedback', (data) => {
    //console.log(data);
    socket.broadcast.emit('feedback', data)
  })
  socket.on('message', (data) => {
    //console.log(data)
    socket.broadcast.emit('chat-message', data)
  })
  socket.on('feedback', (data) => {
    //console.log(data);
    socket.broadcast.emit('feedback', data);
  })
  socket.on('callUser', (data) => {
    //console.log('called',data.userToSignal);
    socket.broadcast.emit('callUser',
    data);
  })


  socket.on('answerCall', (data) => {
    //console.log('answered1',data.type);
    socket.broadcast.emit('callAccepted', data.signal);
  })


  socket.on("join room", ({roomID,entry}) => {
         //console.log(roomID,entry);    
        if (users[roomID]) {
                  const length = users[roomID].length;
                   if (length === 2) {
                      socket.emit("room full",users);
                      return;
                  }
                  users[roomID].push(socket.id);
              } else {
                if(entry===2)  
                     {socket.emit('NoRoom',users[roomID]);
                      return;}
                else
                     users[roomID] = [socket.id];
              }
              socketToRoom[socket.id] = roomID;
              const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
              socket.emit("all users", usersInThisRoom);
          });
      
    
          socket.on("sending signal", payload => {
               //console.log('sending',payload);
              io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID,audio:payload.audio });
          });
      
    
          socket.on("returning signal", payload => {
            //console.log('return',payload); 
            io.to(payload.callerID).emit('receiving returned signal', {signal: payload.signal, id: socket.id,audio:payload.audio });
          });
      
    
}