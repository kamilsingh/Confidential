var axios = require("axios");
var fs = require("fs");
var constant = require("./utils/constant");
var csv = require("./utils/csv");

var domain = constant.DEFAULT_DOMAIN;
temp = process.argv.indexOf("-d");
if (temp !== -1 && constant.DOMAIN_LIST.includes(process.argv[temp + 1])) {
  domain = process.argv[temp + 1];
}
else
{
  console.log('argument" not found'+domain);
}

var format = constant.DEFAULT_FORMAT;
temp = process.argv.indexOf("-f");
if (temp !== -1 && constant.FORMAT_LIST.includes(process.argv[temp + 1])) {
  format = process.argv[temp + 1];
}

var listFile = "";
temp = process.argv.indexOf("-l");
if (temp !== -1) {
  listFile = process.argv[temp + 1];
} else {
  console.log("Usage: node run-scraper -o <filename>");
  process.exit(0);
}

var detailFile="" ;
temp = process.argv.indexOf("-i");
if (temp !== -1) {
  detailFile = process.argv[temp + 1];
} else {
  console.log("Usage: node run-scraper -d <filename>");
  process.exit(0);
}
var jobDetail = require(`./scripts/${domain}/job-detail`);
var jobList = require(`./scripts/${domain}/job-list`);

var url = jobList.jobListUrl;
var listingJob=[];
var data = [];

var counter = 0;
var temp;

function loadJobList(response) {
  if (response) {
    temp = jobList.scrapJobList(response.data);
    data = [...data, ...temp.data];
    saveData(temp,listFile);
  }
  if (temp.next==null) 
  {
    console.log(`----- list length : ${data.length}`);
    scrapData(data[counter]["link"], loadJobDetail);
  }
}
function loadJobDetail(response) {
  if (response) {
    let jobs={};
    jobs.details= jobDetail.scrapJobDetail(response.data); 
     let temp=""+data[counter].postName+","+data[counter].company+","+jobs.details.more["Organization Name"]+","+data[counter].location;
   data[counter].companyfull=jobs.details.more["Organization Name"];
    data[counter].site=jobs.details.links[jobs.details.links.length-1];
    data[counter].notice=jobs.details.links[1];
    jobs.info=data[counter++];
    jobs.index=temp;
    console.log(jobs); 
       listingJob.push(jobs);
      // saveData(jobList,detailFile);
  }
  
 
  if (counter < data.length) {
    scrapData(data[counter]["link"], loadJobDetail);  
    console.log(`----- ${url} appended, length of jobs are ${listingJob.length}`);  
  }
  else{
    const temp = JSON.stringify(listingJob,undefined,2);
    fs.appendFile(detailFile,temp, function (err) {
        
      if (err) {
        return console.log("error ",err);
      }
     console.log('demo');
    });
  }

}

function saveData(jobData,filename) {
  temp = jobData;
  switch (format) {
    case "json": 
    temp = JSON.stringify(temp, undefined, 2);
      temp+=",";
      break;
    case "csv":
      temp = csv.formatData(temp);
      temp = csv.parse(temp) + constant.LINE_BREAKER;
      break;
  }
  fs.appendFile(filename, temp, function (err) {
    if (err) {
      return console.log(err);
    }
   console.log(`----- ${url} appended to file ${filename} in ${format} format.`);
  });
}

function scrapData(url, callback) {
  axios.get(url)
    .then(function (response) {
      callback(response);
    })
    .catch(function (error) {
      console.log(`----- ${url} error occured!`);
      console.log(error);
      callback(null);
    });
}

scrapData(url, loadJobList);
