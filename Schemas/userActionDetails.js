var mongoose = require('mongoose')

  userActionDetails= new mongoose.Schema( 
    {
     user:{ type:mongoose.Schema.Types.ObjectId,ref:'signup'},
     job:{},
     action:String,
     status:String,
     id: {type:mongoose.Schema.Types.ObjectId,ref:'Job'},
    });

  module.exports=mongoose.model('userActionJob',userActionDetails);