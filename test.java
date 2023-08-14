   
    try{
                     const result= await axios({
                        method: "POST",
                         headers :{ authorization : "Bearer "+ tokens.tokens.access_token
                         },
                        "Content-Type" :"application/json",
                        url: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
                        data: {
                             "aggregateBy": [{
                               "dataTypeName": "com.google.step_count.delta",
                                "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
                                            }],
                                   "bucketByTime": { "durationMillis": 86400000 },
                                    "startTimeMillis": 1634790460211,
                                 "endTimeMillis": 1634790460211
        
                                       }
                                       
                                       });
                                  }
                                  catch(e)
                                 {
                                    console.log("axios error is "+e);
                                 }
   