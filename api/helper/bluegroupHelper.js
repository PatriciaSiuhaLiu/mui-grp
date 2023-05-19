var msutils = require('msutils');
var logger = require('winston');
var axios = require("axios");
var parseString = require('xml2js').parseString;
var https = require('https');
const jwt = require("jsonwebtoken")


function isUserAsssociatedToBlueGroup(user, groups) {
  return new Promise((resolve, reject) => {
    // we can send multiple groups too
    var groupQuery = "";
    
    if (groups) {
      groups.forEach(group => {
        groupQuery = groupQuery.concat(`group=${group}`);
      });
    }
    let bluepageUrl = process.env.bluepageUrl.concat(groupQuery);
    try {
      const axiosConfig = {
        headers: {
          'Content-Type': 'application/xml;charset=UTF-8'
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      };

         axios
        .get(bluepageUrl,  axiosConfig)
        .then(response => {
          if (response.data) {
            parseString(response.data, function (err, result) {
              if ((result.group.member) && (result.group.member.indexOf(user) > -1)) {
                resolve(true);
              } else {
                resolve(false);
              }
            });
          }
        })
        .catch(err => {
          reject(err);
          logger.error('isUserAsssociatedToBlueGroup ERROR:', err);
        });
    } catch (e) {
      reject(e);
      logger.error(`Error posting message for isUserAsssociatedToBlueGroup : ${e}`);
    }
  });
}




 function isValidBlueGroup(group) {
  return new Promise((resolve, reject) => {
    let bluepageUrl = process.env.bluepageUrl.concat(`group=${group}`);
    try {
      const axiosConfig = {
        headers: {
          'Content-Type': 'application/xml;charset=UTF-8'
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      };

       axios
        .get(bluepageUrl,  axiosConfig)
        .then(response => {
          if (response.data) {
            parseString(response.data, function (err, result) {
              if (result.group.rc == 6) {
                resolve(false);
              } else {
                resolve(true);
              }
            });
          }
        })
        .catch(err => {
          reject(err);
          logger.error('isValidBlueGroup ERROR:', err);
        });
    } catch (e) {
      reject(e);
      logger.error(`Error posting message for isValidBlueGroup : ${e}`);
    }

  });
}




function getBlueGroupListAssociated(user) {
  return new Promise(async (resolve, reject) => {
    // fetch the bluegroups which are having accountAdmin role
    let accountsResult = await msutils.fetchFromStore("MUIAccounts", {});
    var accountAdminBlueGroups = [];
    var blueGroupArray = [];
    if (accountsResult) {
      accountsResult.forEach(account => {
        accountAdminBlueGroups.push(account.bluegroupName.toLowerCase());
      });
    }

    if (accountAdminBlueGroups && accountAdminBlueGroups.length > 1) {
      let url = msutils.template(process.env.allBluegroupForUserUrl, { "mailId": user });
      try {
        const axiosConfig = {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          },
          httpsAgent: new https.Agent({ 
            rejectUnauthorized: false,
          }),
        };
  
         axios
          .get(url,  axiosConfig)
          .then(response => {
            if (response.data) {
              response = response.data;
              if (response.search.return.code == 0) {
                //success response
                let entries = response.search.entry;
                if (entries && entries.length > 0) {
                  let entry = entries[0];
                  let valueList = entry.attribute[0].value;
                  if (valueList) {
                    valueList.forEach(value => {
                      blueGroupArray.push(getAttributeObj(value).cn);
                    });
                  }
                }
                //find the common bluegroups  
                var result = accountAdminBlueGroups.filter(function (n) {
                  return blueGroupArray.indexOf(n) > -1;
                });
                resolve(result);
              }
            }
          })
          .catch(err => {
            reject(err);
            logger.error('getBlueGroupListAssociated ERROR:', err);
          });
      } catch (e) {
        reject(e);
        logger.error(`Error posting message for getBlueGroupListAssociated : ${e}`);
      }
    } else {
      resolve(accountAdminBlueGroups);
    }
  });
}


// isValidEmail
function isValidEmail(user) {
  return new Promise(async (resolve, reject) => {
    // fetch the bluegroups which are having accountAdmin role
    
    logger.info("IsValidEmail ==>");
    if (user.length>0) {
      let url = msutils.template(process.env.allBluegroupForUserUrl, { "mailId": user });
      try {
        const axiosConfig = {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          },
          httpsAgent: new https.Agent({ 
            rejectUnauthorized: false,
          }),
        };
  
         axios
          .get(url,  axiosConfig)
          .then(response => {
            if (response.data) {
              response = response.data;
              if (response.search.return.count == 0) {
                const errMsg = {"errMsg" : "Please provide a valid email"}
                resolve(false,errMsg);
              }
              else 
              {
              resolve(true);}
            }
          })
          .catch(err => {
            reject(err);
            logger.error('getBlueGroupListAssociated ERROR:', err);
          });
      } catch (e) {
        reject(e);
        logger.error(`Error posting message for getBlueGroupListAssociated : ${e}`);
      }
    } 
  });
}


function createBlueGroup(acc_bg_grp,dpeEmail,members,enterpriseConfig) {
   return new Promise(async (resolve, reject) => {
     logger.info("Create Blue Group==>");
    let settings = await msutils.fetchFromStore('settings', {"config_name": "chatopsCredentials"}); 
    var ndate = new Date();
    var nmonth = ndate.getMonth() + 1;
    var nyear = ndate.getFullYear() + 1;
    var nday = ndate.getDate() - 1;
    let groupParamQuery = "";
    let bluepageUrl ='';
    if (acc_bg_grp) {
    bluepageUrl = msutils.template(enterpriseConfig.BLUEGRP_CREATE_URL, { "acc_bg_grp": acc_bg_grp, "dpeEmail" :dpeEmail, "nyear":nyear, "nmonth":nmonth, "nday":nday});
    }
    logger.info(bluepageUrl);

    let username ='';
    let password ='';
    username = await msutils.decrypt(enterpriseConfig.functional_id[0].username);
    password = await msutils.decrypt(enterpriseConfig.functional_id[0].password);  
    
    let token ='';
    token = 'Basic ' +
    Buffer.from(
      username +
        ':' +
        password,
    ).toString('base64');
    try {
      const axiosConfig = {
        headers: {
          'Content-Type': 'application/xml;charset=UTF-8',
          'Authorization':token
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      };


      axios
        .post(bluepageUrl, {},axiosConfig)
        .then((response) => {
          if (response.status) {
              if (response.data == 0) {
                resolve([true,response.data]);
              } else {
                resolve([false,response.data]);
              }     
          }
        })
        .catch((err) => {
          logger.error('create Blue group ERROR:', err);
          reject(err);
          
        });
    } catch (e) {
      logger.error(`create Blue group ERROR : ${e}`);
      reject(e);     
    }
  });
}

function changeOwner(acc_bg_grp,dpeEmail,enterpriseConfig,addChatopsAsAdmin) {
  logger.info("changeOwner ....")
  return new Promise(async (resolve, reject) => {
    try{
        let UIDMem='';
        let changeOwner='';
        let addOwnerAsAdmin='';

        let username ='';
        let password ='';
        username = await msutils.decrypt(enterpriseConfig.functional_id[0].username);
        password = await msutils.decrypt(enterpriseConfig.functional_id[0].password);
        let token ='';

          token = 'Basic ' +
                     Buffer.from(
                     username +
                          ':' +
                          password,
                      ).toString('base64');
                    
                if(addChatopsAsAdmin){
                        UIDMem = await getUID(enterpriseConfig.functional_id[0].username,enterpriseConfig);
                        if(UIDMem)
                        {
                          changeOwner = await addOwnerasAdmin(UIDMem,acc_bg_grp,token,enterpriseConfig);
                        }
              
                }

        if(dpeEmail) // Add Owner
        {
          UIDMem = await getUID(dpeEmail,enterpriseConfig);
          if(UIDMem)
          {
            changeOwner = await addOwnerasAdmin(UIDMem,acc_bg_grp,token,enterpriseConfig);
            if(changeOwner)   {  
                addOwnerAsAdmin = await changeOwnerBluegroup (UIDMem,acc_bg_grp,token,enterpriseConfig);
            }
            else
              resolve(false);
          }
          else{
            resolve(false);
          }
          
            
        }
        
     }
    catch (err) {
      logger.error("Unable to connect to bluegroup");
      reject(err);
    
  }
  if(addMembers ) resolve(true);else resolve(false);
    logger.info("========================END changeOwner======================");
  });
}


// Add Members
//------------------------------------------------------
function addMembers(acc_bg_grp,members,enterpriseConfig) {
  logger.info("Add Memebers...");
  return new Promise(async (resolve, reject) => {
    let UIDMem='';
    let addMemebers = '';
    try{
        //let settings = await msutils.fetchFromStore('settings', {"config_name": "chatopsCredentials"});
        let username ='';
        let password ='';
        username = await msutils.decrypt(enterpriseConfig.functional_id[0].username);
        password = await msutils.decrypt(enterpriseConfig.functional_id[0].password);
        let token ='';

          token = 'Basic ' +
                     Buffer.from(
                     username +
                          ':' +
                          password,
                      ).toString('base64');
      
      for(let index = 0 ; index<members.length ;index++){
              var email = members[index];
              UIDMem = await getUID(email,enterpriseConfig);
              //UIDMem = await dummy(email);
              if(UIDMem){
                   //addMemebers = await dummy2(UIDMem,acc_bg_grp,token)
                addMemebers = await addMembersToGroup(UIDMem,acc_bg_grp,token,enterpriseConfig)   
                   if (!addMemebers){
                    resolve(false);  
                    break;
                   }
                   else {
                     continue;
                   }
                   
              }
              else{
                resolve (false);
              }
       }
       resolve(addMemebers);
         
  }catch(err){
    logger.info(err);
    reject(err);}
  });
}
//------------------------------------------------------
// -----------------------------------
async function getUID(ownerEmail,enterpriseConfig) {
  logger.info("getUID===>");
  return new Promise((resolve, reject) => {
  
    let result ='';
   // let urlfrCN = "https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(mail={{mailId}}).search/byJSON";
    if(ownerEmail){
      let urlforUID = msutils.template(enterpriseConfig.BLUEGRP_UID_URL, { "mailId": ownerEmail });
      logger.info(urlforUID);
    try {
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      httpsAgent: new https.Agent({
      rejectUnauthorized: false,
      }),
    };
      axios
        .get(urlforUID,  axiosConfig)
        .then(response => {
          if (response.data) {
            if (response.statusText == 'OK') {
              response = response.data;
              let entries = response.search.entry;
              if (entries && entries.length > 0) {
                let entry = entries[0];
                let attributes = entry.attribute;
                attributes.forEach(key => {
                  if(key.name =="uid")
                    result = key.value;
                });
              }      
            }
            logger.info("Result DUMMY ");
              resolve(result);
              
          }
        })
        .catch(err => {
          logger.error('getUID Associated ERROR:', err);
          reject(err);
          
        });
         
   } catch (e) {
    logger.error(`Error getting UID for the Associated Email : ${e}`);
    reject(e);
      }
  } // if closing
    else{
      resolve(result);
    }
  });
}



// Add Owner as admin
async function addOwnerasAdmin(UID,acc_bg_grp,token,enterpriseConfig) {
  logger.info("addOwnerasAdmin ===> ");
  return new Promise((resolve, reject) => {
    let urlforUID=''
      //let urlfrCN = "https://bluepages.ibm.com/tools/groups/protect/groups.wss?gName={{GROUP_NAME}}&task=Administrators&mebox={{UID}}&Submit=Add+Administrators&API=1";
    if(UID){
       urlforUID = msutils.template(enterpriseConfig.BLUEGRP_ADD_ADMIN, { "GROUP_NAME": acc_bg_grp, "UID" :UID});
    try {
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization':token
      },
      httpsAgent: new https.Agent({
      rejectUnauthorized: false,
      }),
    };
      axios
        .get(urlforUID,  axiosConfig)
        .then(response => {
            if (response.data === 0) {
              resolve(true);
            } 
          else  resolve(false);
        })
        .catch(err => {
          logger.error('add as Administrator ERROR:', err);
          reject(err);
          
        });
         
   } catch (e) {
    logger.error(`Error adding owner as administrator for bluegroup : ${e}`);
    reject(e);
   
      }
  } // if closing
    else{
      resolve(false);
    }
  });
}
// -----------------------------------
//---------------------------Change Owner of the Bluegroup--------------------------------
async function changeOwnerBluegroup(UID,acc_bg_grp,token,enterpriseConfig) {
  logger.info("CHANGE OWNER===>")
  return new Promise((resolve, reject) => {
    let result ='';
    let urlforUID =''
    //let urlfrCN = "https://bluepages.ibm.com/tools/groups/protect/groups.wss?gName={{GROUP_NAME}}&task=GoCO&mebox={{UID}}&API=1";
    if(UID){
       urlforUID = msutils.template(enterpriseConfig.BLUEGRP_CHG_OWNER, { "GROUP_NAME": acc_bg_grp, "UID" :UID});
      logger.info(urlforUID);
    try {
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization':token
      },
      httpsAgent: new https.Agent({
      rejectUnauthorized: false,
      }),
    };
      axios
        .get(urlforUID,  axiosConfig)
        .then(response => {
            if (response.data === 0) {
              resolve(true);
            } else  resolve(false);
        })
        .catch(err => {
          reject(err);
          logger.error('getBlueGroupListAssociated ERROR:', err);
        });
         
   } catch (e) {
    reject(e);
    logger.error(`Error posting message for getBlueGroupListAssociated : ${e}`);
      }
  } // if closing
    else{
      resolve(false);
    }
  });
}

//---------------------------Add Members to the group------------------------------------
async function addMembersToGroup(UID,acc_bg_grp,token,enterpriseConfig) {
  return new Promise((resolve, reject) => {
    logger.info("AddMembersToGroup ==>");
    let result ='';
    if(UID){
      let urlforUID = msutils.template(enterpriseConfig.BLUEGRP_ADD_MEMBERS, { "GROUP_NAME": acc_bg_grp, "UID" :UID});
      logger.info(urlforUID);
    try {
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization':token
      },
      httpsAgent: new https.Agent({
      rejectUnauthorized: false,
      }),
    };
      axios
        .get(urlforUID,  axiosConfig)
        .then(response => {
            if (response.data === 0) {
              resolve(true);
          }else  resolve(false);
        })
        .catch(err => {
          logger.error('getBlueGroupListAssociated ERROR:', err);
          reject(err);
         
        });
         
   } catch (e) {
    reject(e);
    logger.error(`Error posting message for getBlueGroupListAssociated : ${e}`);
      }
  } // if closing
    else{
      resolve(false);
    }
  });
}
//-----------------------------------------------------------------------------------------

function getAttributeObj(attrs) {
  var values = attrs.split(",");
  var obj = {};
  for (var i = 0; i < values.length; i++) {
    var keyValue = values[i].split("=");
    obj[keyValue[0]] = keyValue[1].toLowerCase();
  }
  return obj;
}

function getFreshAccountAccessDetail(req) {
  return new Promise(async (resolve, reject) => {
    req.session.isAccountAdmin = false;
    req.session.isProgramAdmin = false;
    req.session.isSuperAdmin = false;
    req.session.groups = [];
    req.session.groups1 = [];
  let ref = this;
  if (req.user) {
    try {
        // check if the user is asscociated to program admin bluegroup
        var uerFromReq = req.user.id;
        var userToLogin ;
        var splitUser = uerFromReq.split("@");
        if(splitUser[1].toLowerCase() == "kyndryl.com"){
            splitUser[1] = "@ocean.ibm.com";
            userToLogin = splitUser.join("");
        }else{
            userToLogin = req.user.id
        }
        const secretKey = process.env.MS_ENCRYPTION_KEY + userToLogin
        let {isUserAsssociatedToBg, groups } = jwt.verify(req.user.token, secretKey)
        let {isUserAsssociatedToSABg, groups1 } = jwt.verify(req.user.token, secretKey)
        if (isUserAsssociatedToBg) {
            req.session.isProgramAdmin = true;
            resolve(req);
        }else{
            req.session.isProgramAdmin = false;
            resolve(req);
        }
        if(isUserAsssociatedToSABg){
            req.session.isSuperAdmin = true;
            resolve(req);
        }else{
            req.session.isSuperAdmin = false;
            resolve(req);
        }
        if(groups){
            groups = groups.filter(v=>v!='');//not allowing empty entry
            if (groups && groups.length > 0) {
                req.session.isAccountAdmin = true;
                req.session.groups = groups;
                resolve(req);
            }
        }else{
            // req.session.isAccountAdmin = true;
            // req.session.isProgramAdmin = false;
            req.session.isAccountAdmin = false;
            resolve(req);
        }
    }
    catch (err) {
      req.session.isProgramAdmin = false;
      req.session.isAccountAdmin = false;
      req.session.isSuperAdmin = false;
      reject(err);
      logger.error("Unable to connect to bluegroup");
    }
}else{
  req.session.isProgramAdmin = false;
  req.session.isAccountAdmin = false;
  req.session.isSuperAdmin = false;
  reject("User is not authorized");
}

  });

}
function getUserAccessDetail(req) {
    logger.info(`Checking user access with chatopsGroup`);
    return new Promise(async (resolve, reject) => {
        req.session.teamitAdmin = false;
        req.session.teamITgroups = [];
        let ref = this;
        if (req.user) {
            try {
                // check if the user is asscociated to TeamIT admin chtopsGroup
                var uerFromReq = req.user.id;
                var userToLogin ;
                var teamITAdmin = process.env.team_it_chatops_group;
                var groupArr = [];
                let groupsFetched = await msutils.fetchFromStore("ChatopsGroups", {});
                for(var i = 0; i < groupsFetched.length; i++) {
                    var groupName = groupsFetched[i].name;
                    groupArr.push(groupName)
                }
                if(groupArr.some(member=> member.toLowerCase() === teamITAdmin.toLocaleLowerCase())){
                    var groupFromDB = await msutils.fetchFromStoreByOptions(
                        'ChatopsGroups',
                        { name: teamITAdmin },
                        { },
                    );
                    var memberList = groupFromDB[0].members;
                    const newMemberList = memberList.map(name => name.toLowerCase());
                    if(newMemberList.includes(req.user.id.toLowerCase())){
                        req.session.teamitAdmin = true;
                        resolve(req);
                    }else{
                        req.session.teamITAdminAccess = false;
                        resolve(req);
                        // throw new Error("User is not authorized to access this application.");
                    }
                }else{
                      req.session.teamITAdminAccess = false;
                        resolve(req);
                }
                
            }
            catch (err) {
            req.session.teamitAdmin = false;
            reject(err);
            logger.error("Unable to fetch user details");
            }
        }else{
            req.session.isProgramAdmin = false;
            req.session.isAccountAdmin = false;
            req.session.isSuperAdmin = false;
            reject("User is not authorized");
        }

    });

}

exports.isValidBlueGroup =  isValidBlueGroup;
exports.getFreshAccountAccessDetail =  getFreshAccountAccessDetail;
exports.createBlueGroup = createBlueGroup;
exports.changeOwner = changeOwner;
exports.addMembers = addMembers;
exports.isValidEmail = isValidEmail;
exports.isUserAsssociatedToBlueGroup = isUserAsssociatedToBlueGroup;
exports.getBlueGroupListAssociated = getBlueGroupListAssociated;
exports.getUserAccessDetail = getUserAccessDetail;