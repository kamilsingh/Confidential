var mongoose = require('mongoose')

  userDoneDetails= new mongoose.Schema( 
    {
     user:{ type:mongoose.Schema.Types.ObjectId,ref:'signup'},
     job:{},
     status:String,
     id: {type:mongoose.Schema.Types.ObjectId,ref:'Job'},
    });

  module.exports=mongoose.model('userDoneJob',userDoneDetails);