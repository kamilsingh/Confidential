var mongoose = require('mongoose')

  userJobSchema= new mongoose.Schema( 
    {
     user:{ type:mongoose.Schema.Types.ObjectId,ref:'signup'},
     job:{},
     status:{type:String},
     remark:{type:String},
     appliedDate:{type: Date, default: Date.now},
     LastUpdated:{type: Date, default: Date.now},
     jobId: {type:mongoose.Schema.Types.ObjectId,ref:'Job'},
    });
  
  module.exports=mongoose.model('userjob',userJobSchema);