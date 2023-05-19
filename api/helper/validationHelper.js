//validationHelper.js

var msutils = require('msutils');
const  {HttpsProxyAgent} = require( 'https-proxy-agent');
var dataWithErrMsg = {}

function validateSpecialCharacter(reqJson) { 
    var invalidCharecters =  "!,@,#,$,%,^,&,*,/,(,),+,=,{,},[,],|,\,?,<,>,:,;,~,`" ;
    var invalidCharArray = invalidCharecters.split(",");
        invalidCharArray.push(",");
        invalidCharArray.push("'");
        invalidCharArray.push('"');
    var dataWithMsg = {}
    var flag = false;
    for (var key in reqJson) {
        if(key != "date" && key != "submitted" && key != "saved" && key != "accountCode" && key != "accountName" && key != "pushToEventStream" && key != "eventStreams"){
            var textVal = reqJson[key];
            var inputFeildArray = textVal.split("");
            if(key == "bluegroupName"){
                invalidCharArray = ["!", "<",  ">", "#", "%"];
            }
            var  doesInclude = invalidCharArray.filter(value => inputFeildArray.includes(value));
            if(doesInclude.length > 0){
                flag = true;
                dataWithMsg[key] = {data: reqJson[key],msg:"Invalid data,special character not allowed"}  
            }else{
                dataWithMsg[key] = {data: reqJson[key],msg:""}
            }
        }
    }
    dataWithMsg["is_valid"] = true;
    if(flag){
        dataWithMsg["is_valid"] = false;
    }
    return dataWithMsg;
   
}

function validateSpecialCharacterAccountAdmin(req){
    var body = req.body
    var isValidData = false;
    var hasSpecialChar = false;
    var isValidEmail = false;
    var isNumeric = false;
    var isValidDate = false;

    var checkSpecCharFields = ["accountOwnersName","itsmSystemAdminName","networkAdminName","slackWorkspaceAdminName","workspaceIndexChannel"];
    var checkValidEmailFields = ["accountOwnersEmail","itsmSystemAdminEmail","networkAdminEmail","slackWorkspaceAdminEmail","accmemberemail"];
   
    // for (var key in body) {
    //     if(body[key] != ""){
        
    //         if(checkSpecCharFields.includes(key)){
    //             hasSpecialChar = checkSpecChar(body[key]);
    //             if(!hasSpecialChar){
    //                 dataWithErrMsg["is_valid"] = false;
    //                 dataWithErrMsg[key] = "Special character not allowed. Please provide valid data."
    //                 return dataWithErrMsg;
    //             }
    //         }

    //         if(checkValidEmailFields.includes(key)){
    //             isValidEmail = checkValidEmail(body[key]);
    //             if(!isValidEmail){
    //                 dataWithErrMsg["is_valid"] = false;
    //                 dataWithErrMsg[key] = "Please provide valid data.Only IBM is supported"
    //                 return dataWithErrMsg;
    //             }
    //         }
    //         if(checkNumericFields.includes(key)){
    //             isNumeric = checkNumeric(body[key]);
    //             if(!isNumeric){
    //                 dataWithErrMsg["is_valid"] = false;
    //                 dataWithErrMsg[key] = "Only numeric value allowed. Please provide valid data."
    //                 return dataWithErrMsg;
    //             }
    //         }
    //     }
    // }   


}

function checkSpecChar(val){
    var invalidCharecters =  "!,@,#,$,% ,^,&,*,/,(,),+,=,{,},[,],|,\,?,<,>,:,;,~,`" ;
    var invalidCharArray = invalidCharecters.split(",");
        invalidCharArray.push(",");
        invalidCharArray.push("'");
        invalidCharArray.push('"');
   
    var textVal = val;
    var inputFeildArray = textVal.split("");   
    var  doesInclude = invalidCharArray.filter(value => inputFeildArray.includes(value));
    if(doesInclude.length > 0){
        return false;
        }else{
        return true;
        }
}

function checkValidEmail(data){
    var emailText = data;
    var substring = "ibm";
    if(emailText.includes(substring)){
        return true;
    }else{
        return false;
    }
}

function checkDate(data){
    var isISO = data;
    var dateFormat = isISO.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(dateFormat != null){
        return true;
    }else{
        return false;
    }
}

function checkNumeric(data){
 var value = parseInt(data);
 if(isNaN(value)){
     return false;
 }else{
     return true;
 }
}


const fetchByTeamsEmailId = async (emailId, bot) => {
    require("isomorphic-fetch");
    const { Client } = require("@microsoft/microsoft-graph-client");
    const {
      TokenCredentialAuthenticationProvider,
    } = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
    const { ClientSecretCredential } = require("@azure/identity");
    async function getUserByEmail() {

      try {
        // bot.appTenantId = msutils.decrypt(bot.appTenantId);
        // bot.appId = msutils.decrypt(bot.appId);
        // bot.appSecret = msutils.decrypt(bot.appSecret);
        const credential = new ClientSecretCredential(
          bot.appTenantId,
          bot.appId,
          bot.appSecret
        );
        const authProvider = new TokenCredentialAuthenticationProvider(
          credential,
          {
            scopes: [bot.scopes],
          }
        );
        const SERVER_PROXY = process.env.https_proxy ;
        const fetchOptions = {};
        if (SERVER_PROXY && SERVER_PROXY !== '') {
          const proxyAgent = new HttpsProxyAgent(SERVER_PROXY);
          fetchOptions['agent'] = proxyAgent;
        }
        let apiClient = Client.initWithMiddleware({
          debugLogging: true,
          authProvider,
          fetchOptions: fetchOptions,
        });
        let id = emailId;
        let url_1 = `users/${id}`;
        let data = await apiClient.api(url_1).get();
        return data;
      } catch (error) {
        console.error(error);
      }
    }
    return await getUserByEmail();
}

async function fetchByTeamUserId(userId, bot) {
  require("isomorphic-fetch");
  const { Client } = require("@microsoft/microsoft-graph-client");
  const {
    TokenCredentialAuthenticationProvider,
  } = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
  const { ClientSecretCredential } = require("@azure/identity");

  const log = console.log;
  async function getUserByEmail() {
    log("-");
    log("2. Getting User Details");
    try {
      // bot.appId = msutils.decrypt(bot.appId);
      // bot.appSecret = msutils.decrypt(bot.appSecret);
      const credential = new ClientSecretCredential(
        bot.appTenantId,
        bot.appId,
        bot.appSecret
      );
      const authProvider = new TokenCredentialAuthenticationProvider(
        credential,
        {
          scopes: [bot.scopes],
        }
      );

      const SERVER_PROXY = process.env.https_proxy ;
      const fetchOptions = {};
      if (SERVER_PROXY && SERVER_PROXY !== '') {
        const proxyAgent = new HttpsProxyAgent(SERVER_PROXY);
        fetchOptions['agent'] = proxyAgent;
      }

      let apiClient = Client.initWithMiddleware({
        debugLogging: true,
        authProvider,
        fetchOptions: fetchOptions,
      });
      let id = userId;
      let url_1 = `users/${id}/identities`;
      let data = await apiClient.api(url_1).get();

      if(data && Object.keys(data).length){
        return data.value[0].issuerAssignedId;
      }
      
    } catch (error) {
      console.error(error);
    }
  }
  return await getUserByEmail();
}


exports.validateSpecialCharacter =  validateSpecialCharacter;
exports.validateSpecialCharacterAccountAdmin =  validateSpecialCharacterAccountAdmin;
exports.fetchByTeamsEmailId =  fetchByTeamsEmailId;
exports.fetchByTeamUserId =  fetchByTeamUserId;

