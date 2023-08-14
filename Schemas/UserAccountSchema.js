var mongoose = require('mongoose')

  var loginSchema= new mongoose.Schema(
  {
     // first: {type: String,default: "xxxxxx",required:true,unique:true},
      firstname: String,
      lastname: String,
      birth:String,
      Age:String,
      gender:String,
      mobile:String,
      email:String,
      password: String,
      pic:String, 
      admin:Boolean, 
  }

  );
  
  module.exports=mongoose.model('signup',loginSchema);