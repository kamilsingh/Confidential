const mongoose=require('mongoose');
let Schema=mongoose.Schema;
  
 const schema1=new Schema(
   {
     name: String,
     company: Array,
     sender: String,
     reciever: String,
   }

 )

 const schema2=new Schema(
    {
      name: String,
      sender: String,
      reciever: String,
    }
 
  )
 
 module.export=mongoose.model('first',schema1);
 

