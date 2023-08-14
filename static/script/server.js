const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;
const fs= require("fs");
  try{
const dash=fs.readFileSync("./dashboard.html","utf-8");
  const home=fs.readFileSync("second.html","utf-8");
  const login=fs.readFileSync("./login.html","utf-8");
  const signup=fs.readFileSync("./signup.html","utf-8");

const server = http.createServer((req, res) => {
   
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
    url=req.url
     console.log("request taken "+req.url);
    if(url=='/')
    {
       res.end(home);
    }
    else if(url =='/dash')
     {
       res.end(dash)
     }
     else if(url=='/login')
     {
      res.end(login);
     }
     else if(url=='/signup')
     {
     res.end(signup);
     }
     else
     {
        res.statusCode=404;
        res.end('<h1> 404 NOT FOUND <h1>');
     } 
  
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


 }
  catch(Error)
  {
    console.log(Error);
  }

