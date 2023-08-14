var mongoose = require('mongoose')
var Schema= mongoose.Schema;
  
  
  const FeedbackSchema= new mongoose.Schema(
    {
       user:{type:mongoose.Schema.Types.ObjectId,ref:'signup'},
      ReferenceId:{type:mongoose.Schema.Types.ObjectId,ref:'Job'},
       feedback:String,
   }
  );
  
  module.exports=mongoose.model('feedback',FeedbackSchema);