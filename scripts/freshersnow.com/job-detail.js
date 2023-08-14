var cheerio = require("cheerio");
var helper = require("../../utils/helper");



// function getSectionData($, elem) {
 
 
//   console.log($(elem).prop("tagName"));
//    if($(elem).prop("tagName")==='DIV')
//    {
//     var child=elem.children.toArray();
//       for(let i=0;i<child.length;i++)
//       {
//           ans.push(get_items($,child[i]));    
//       }

//    }
//    else
//    {
//        ans.push(get_items($,elem));
//    }

//   }

//    function get_items($,elem)
//    {
//    var data = {};

//    var temp1;
//    var temp2;
//    var temp3;
 
//    var i;
//    var j;
//    var k;
 
//    var arr1 = [];
//    var arr2 = [];
//    var arr3 = [];
//   switch ($(elem).prop("tagName")) {
//     case "UL":
//       data.value = [];
  
//       break;
//     case "TABLE":
//       data= [];
//       arr1 = $(elem).find("tr").toArray();
//       for (i = 0; i < arr1.length; i++) {
//         arr2 = $(arr1[i]).find("td").toArray();
//         for (j = 0; j < arr2.length; j++) {
//           temp2 = {};
//            if(arr2[j].toArray().length>1)temp2.arr2[j][0]=arr2[j][1];
//            else temp2.arr2[j][0]="";
           
//           // if ($(arr2[j]).find("a").length > 0) {
//           //   temp3 = [];
//           //   arr3 = $(arr2[j]).find("a").toArray();
//           //   for (k = 0; k < arr3.length; k++) {
//           //     temp3.push({
//           //       text: helper.formatString($(arr3[k]).text()),
//           //       link: helper.formatString($(arr3[k]).attr("href")),
//           //     })
//           //   }
           
//           //   temp2.value = temp3;
//           //   temp2.type = "Link";
//          //  } else {
//            // temp2.value = helper.formatString($(arr2[j]).text());
//            // temp2.type = "String";
//            data.push(temp2);
//           }
          
//           // temp3 = helper.formatString($(arr2[j]).attr("rowspan"));
//           // if (temp3) {
//           //   temp2.rowspan = temp3
//           // }
//           // temp3 = helper.formatString($(arr2[j]).attr("colspan"));
//           // if (temp3) {
//           //   temp2.colspan = temp3
//           // }
        
//           temp1.push(temp2);
//         }
//         data.type="Table"
//         data.value.push(temp1);
//       }

//       break;
//     default:
      
//     }
//   return data;
// }

function scrapJobDetail(html, url) {
  var $ = cheerio.load(html);

   let tables=$(".td-post-content").children().find("table").toArray();
   // console.log(tables);
  let data={},row={},download=[];
    for(let i=1;i<tables.length-1;i++)
       { 
         let arr1 = $(tables[i]).find("tr").toArray();
            for (let j = 0; j < arr1.length; j++) 
            {
             let arr2 = $(arr1[j]).find("td").toArray();
             let check=parseInt($(arr2[0]).text());   
             let temp="",k=1;
             if(check&&check>=0||($(arr2[0]).text())==="S.No")
             {
                temp=$(arr2[1]).text();
                k=2;
             }
            else
             {
              temp=$(arr2[0]).text();
             }
            for(;k < arr2.length; k++)
            {            
              let arr3=$(arr2[k]).find("a").toArray();
              if(arr3.length>0)
                {
                for(let m=0;m<arr3.length;m++)
                  {  let temp1=$(arr3[m]).attr("href");
                     if(temp1!=''||temp1!='#'||temp1!=' ') 
                       {download.push(temp1);
                       } 
                  }
                }
                else
                {
               // console.log($(arr2[k]).text());
               row[temp]=($(arr2[k]).text());
                }
            }
          }  
         }
        
         data.more=row; 
         data.links=download;
        let desc=[];
     let other=$(".td-post-content").children().find("p,ul,ol").toArray();
      for(let i=0;i<other.length;i++)
      { let  temp=$(other[i]).text();
        if(temp!==''||temp!=' ')
                desc.push(temp);
      }
    other=$(".td-post-content").children().find("h1,h2,h3,h4,h5,h6,strong").toArray();
      for(let i=0;i<other.length;i++)
      { let  temp=$(other[i]).text();
        if(temp!==''||temp!=' ')
                desc.push(temp);
      }
      data.desc=desc;

    //  let Links=[];
    //    let linksList=$(".td-post-content").children().find("a").toArray();
    //     for(let i=0;i<linksList.length;i++)
    //     {
    //      Links.push($(linksList[i]).text()); 
    //      Links.push($(linksList[i]).attr("href"));
    //     }
    //    data.links=Links;
   // console.log(data);
  return data;
}

module.exports.scrapJobDetail = scrapJobDetail;