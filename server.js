const express=require('express');
const app=express();
const port=80;
const mongoose=require('mongoose');
const bodyParse=require("body-parser");
app.use(bodyParse.urlencoded({extended:true}));
app.use(bodyParse.json());
mongoose.connect('mongodb://localhost:27017/kamm',{useNewUrlParser: true} ,{useUnifiedTopology:true}).then(()=>{
  console.log('db connected')
  }).catch((e)=>{
    console.log('db errror',e);
  })

//const schema1=require('./Schema_module');
let Schema=mongoose.Schema;
  
 const schema=new Schema(
  {
     name: String,
     sender: String,
     reciever: String,
   }
 )
)

  const schema1=mongoose.model('schema1',schema);
  let backup=[]; 
  let backup1=[];
  app.get('/',(req,res)=>{ 
   res.send('<h1> hey welcome to my chat  service <a href="localhost/act" > Next </a></h1>')});

app.get('/sender',async(req,res)=>{
  // schema1.find({}).then((data)=>{
  //      backup.push(data);
  // }).catch((err)=>{
  //      backup={name:xxx,string:"could not read previous msg"};
  // });
  
   backup=[],backup1=[];
  res.render('sender.ejs',{backup,backup1});
});   
app.get('/reciever',async (req,res)=>{ 
   
//      schema2.find({}).then((data)=>{
//        backup1.push(data);
// }).catch((err)=>{
//     backup1={name:xxx,string:"could not read previous msg"};
// });
  backup1=[],backup=[];  
res.render('reciever.ejs',{backup1,backup})});

app.get('*',(req,res)=>{ res.send('<h1> 404 error <a href="/" > i hsBack </a></h1>')});
app.listen(port,()=>{
    console.log('connected to server');
})
app.post('/reciever',(req,res)=>{
    let tmp={name:"Albert",sender:req.body.message,reciever:""};
       backup.push(tmp);
       if (backup1.length !==0){backup1[backup1.length-1].reciever=req.body.message;}
       else
       {
          let rec={name:"John",sender:"",reciever:req.body.message}
          backup1.push(rec);
       }
    console.log(backup1);
       res.render('reciever.ejs',{backup1});
})
app.post('/sender',(req,res)=>{
  let tmp={name:"John",sender:req.body.message,reciever:""};
    backup1.push(tmp);
    if (backup.length!== 0){backup[backup.length-1].reciever=req.body.message;}
      else
       {
          let rec1={name:"Albert",sender:"",reciever:req.body.message}
          backup.push(rec1);
       }
    console.log(backup);
    res.render('sender.ejs',{backup});
})