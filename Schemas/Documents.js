const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    user:{ type:mongoose.Schema.Types.ObjectId,ref:'signup'},
    name: String,
    data: Buffer,
    contentType: String,
    primaryName:String
  });


module.exports= mongoose.model('UserDocument', fileSchema);