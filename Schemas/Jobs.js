var mongoose = require('mongoose')

  var jobsSchema= new mongoose.Schema( 
    {

    info: {   
    company: String,
    postName: String,
    education: String,
    totalPosts: String,
    location: String,
    lastDate: String,
    site:String,
    notice:String,
    companyfull:String,
      },
      index:String,
    details:{
      more:{},
      links:[],
      desc:[],
    }
}
 );
  
  module.exports=mongoose.model('Job',jobsSchema);