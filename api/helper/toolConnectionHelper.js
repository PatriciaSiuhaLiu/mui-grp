var logger = require('winston');
var request = require('request');
var https = require('https');

//using general config other than axios as its throwing error in case of ip address which is not acceptable for node version less than 15
function isValidConnection(data) {
  
    return new Promise((resolve, reject) => {
        let ticketingToolUrl = data.toolURL;
        var token;
        var authData;

        try {

            if(data.authType == 'basic'){
            
                token = Buffer.from(`${data.userId}:${data.userPassword}`, 'utf8').toString('base64');
                authData = `Basic ${token}`;
                if(data.toolType == 'service_now'){
                        if(data.csmEnabled == true || data.csmEnabled != '' ){
                            if(data.csmEnabled != undefined){
                                if(data.tableName != ''){
                                    ticketingToolUrl = ticketingToolUrl + '/api/now/table/'+data.tableName+'?number=&sysparm_display_value=true';
                                }
                            }else{
                                ticketingToolUrl = ticketingToolUrl + '/api/now/table/incident?number=&sysparm_display_value=true';
                            }
                        }
                        else{
                            ticketingToolUrl = ticketingToolUrl + '/api/now/table/incident?number=&sysparm_display_value=true';
                        }
                        
                }
                if(data.toolType == 'icd'){
                    ticketingToolUrl = ticketingToolUrl + '/maxrest/rest/mbo/incident?lean=1&TICKETID=';
                }
                var headers = {
                    'Accept': 'application/json',
                    'Authorization': authData,
                    'cache-control': 'no-cache',
                    'Content-type': 'application/json'
                };
                var options = {
                    url: ticketingToolUrl,
                    headers: headers,
                    strictSSL: false,
                    method: 'GET'
                };
                request(options, function(err, res) {
                    if(res){
                    let code = res.statusCode;
                    if (code == 200) {
                        resolve(true);
                    } else {
                        logger.error('isValidConnection ERROR with status code: ' + code);
                        resolve(false);
                    }
                    } else {
                    logger.error('No Response');
                    resolve(false);
                    }
                });  
            } else {
                ticketingToolUrl = ticketingToolUrl + '/oauth_token.do';
                let body = "grant_type=password&client_id="+data.oauthClientID+"&client_secret="+data.oauthClientSecret+"&username="+data.userId+"&password="+data.userPassword;

                var headers = {
                    'Accept': 'application/json',
                    'Content-type': 'application/x-www-form-urlencoded'
                };
                var options = {
                    url: ticketingToolUrl,
                    headers: headers,
                    strictSSL: false,
                    method: 'POST',
                    body: body
                };

                request(options, function(err, res) {
                    if(res){
                    let code = res.statusCode;
                    if (code == 200) {
                        resolve(true);
                    } else {
                        logger.error('isValidConnection ERROR with status code: ' + code);
                        resolve(false);
                    }
                    } else {
                    logger.error('No Response');
                    resolve(false);
                    }
                });
            }
        } catch (e) {
            reject(e);
            logger.error(`Error posting message for isValidConnection : ${e}`);
        }
    });
}

// --function with axiosConfig which can be used once node version is changed to 15 or above
// function isValidConnection(data) {
//   return new Promise((resolve, reject) => {
//     let ticketingToolUrl = data.toolURL;
//     var token;
//     var authData;

//     try {

//     if(data.authType == 'basic'){
      
//       token = Buffer.from(`${data.userId}:${data.userPassword}`, 'utf8').toString('base64');
//       authData = `Basic ${token}`;
//       if(data.toolType == 'service_now'){
//         ticketingToolUrl = ticketingToolUrl + '/api/now/table/incident?number=&sysparm_display_value=true';
//       }
//       if(data.toolType == 'icd'){
//         ticketingToolUrl = ticketingToolUrl + '/incident?lean=1&TICKETID=';
//       }

//       const axiosConfig = {
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//           'cache-control': 'no-cache',
//           'Authorization': authData
//         },
//         httpsAgent: new https.Agent({
//           rejectUnauthorized: false,
//         }),
//       };
//        axios
//         .get(ticketingToolUrl, axiosConfig)
//         .then(response => {
//           if (response.status == 200) {
//             resolve(true);
//           } else {
//             resolve(false);
//           }
//         })
//         .catch(err => {
//           reject(err);
//           logger.error('isValidConnection ERROR:', err);
//         });
//     } else {
//       ticketingToolUrl = ticketingToolUrl + '/oauth_token.do';

//       const axiosConfig = {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Accept': 'application/json'
//         },
//         httpsAgent: new https.Agent({
//           rejectUnauthorized: false,
//         }),
//       };
//       let body = "grant_type=password&client_id="+data.oauthClientID+"&client_secret="+data.oauthClientSecret+"&username="+data.userId+"&password="+data.userPassword;
//        axios
//         .post(ticketingToolUrl, body, axiosConfig)
//         .then(response => {
//           if (response.status == 200) {
//             resolve(true);
//           } else {
//             resolve(false);
//           }
//         })
//         .catch(err => {
//           reject(err);
//           logger.error('isValidConnection ERROR:', err);
//         });
//     }
//     } catch (e) {
//       reject(e);
//       logger.error(`Error posting message for isValidConnection : ${e}`);
//     }

//   });
// }

exports.isValidConnection =  isValidConnection;