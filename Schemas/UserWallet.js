 
 var mongoose = require('mongoose');
 UserWallet= new mongoose.Schema( 
    {
     user:{ type:mongoose.Schema.Types.ObjectId,ref:'signup'},
     name:'String',
     username:'String',
     balance:Number,
     transactions:[],

    }
  );
  
  module.exports=mongoose.model('userwallet',UserWallet);