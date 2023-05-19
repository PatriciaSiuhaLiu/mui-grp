var msutils = require("msutils");
var logger = require('winston');
const jwt = require("jsonwebtoken")
var axios = require("axios");
var https = require('https');


const isUserAssociatedToGroup = async (user, groups) => {
  const queryObj = { name: { $in: groups } };
  try {
    let groupList = await msutils.fetchFromStoreByOptions(
      "ChatopsGroups",
      queryObj
    );
    
 
    const userEmail = user.toLowerCase();
    logger.info(`groupUtil:: isUserAssociatedToGroup: user ${user}`);
    logger.info(`groupUtil:: isUserAssociatedToGroup: userEmail ${userEmail}`);
    logger.info(`groupUtil:: isUserAssociatedToGroup: groupList ${JSON.stringify(groupList)}`);
    
    const groupNames = [];
    for(let grp of  groupList){
        groupNames.push(grp.name)
    }

    logger.info(`groupUtil:: isUserAssociatedToGroup: groupList ${JSON.stringify(groupList)}`);
    logger.info("isUserAssociated:groupNames:", JSON.stringify(groupNames))
    logger.info("isUserAssociated:group Length:",groupNames.length)
    let result = false ;
    for (let group of groupList) {
      if (group.members.includes(userEmail)) {
        // return true;
        result = true;
      }
    }
    // return false;
    return result;
  } catch (error) {
    logger.error(`groupUtil:: isUserAssociatedToGroup: Error while fetching data from ChatopsGroups :  ${error}`)
  }
};



const isGroupValid = async (groupName) => {
  try {
        var groupDetail = await getGroupDetailByName(groupName);
        logger.info(`groupUtil:: isGroupValid: groupDetail ${groupDetail}`);

        // return groupDetail && groupDetail.length
        if(groupDetail && groupDetail.length > 0){
            return true;
        }else {
            return false;
        }
    } catch (error) {
        logger.error(`groupUtil:: isUserAssociatedToGroup: Error while fetching data from ChatopsGroups :  ${error}`);
        return false;
    }
} 



const getGroupListAssociated = async (user) => {
    try {
        
        logger.info(`groupUtil:: calling getGroupListAssociated ` )
            const accountsResult = await msutils.fetchFromStore("MUIAccounts", {});
            // logger.info(`calling getGroupListAssociated : accountsResult: ${JSON.stringify(accountsResult)}` )
            const accountAdminGroups = [];
            if (accountsResult) {
                accountsResult.forEach(account => {
                    accountAdminGroups.push(account.groupName);
                });
            }

            if (accountAdminGroups && accountAdminGroups.length > 1) {
                try {
                    logger.info(` groupUtil::getGroupListAssociated : user: ${user}` )       
                    logger.info(` groupUtil::getGroupListAssociated : accountAdminGroups: ${accountAdminGroups}` )       
                    const groupData= await getGroupForUser(user)
                    const groupList = groupData.map(group => group.name);  
                    //find the common groups  
                    var result = accountAdminGroups.filter(function (n) {
                        return groupList.indexOf(n) > -1;
                    });
                    logger.info(` getGroupListAssociated : result: ${result}` )       

                    return result;
                } catch (error) {
                    logger.error(`groupUtil:: getGroupListAssociated: Error while fetching data from ChatopsGroups :  ${error}`)
        
                }
            }

        } catch (error) {
            logger.error(`groupUtil:: getGroupListAssociated: Error while fetching data from MUIAccounts :  ${error}`)
        
        }
}



 const isValidEmail = async (user) => {
    let userTofetch;
    let splitUser = user.split("@");
    if(splitUser[1].toLowerCase() == "kyndryl.com"){
        // kyndryl ID
        splitUser[1] = "@ocean.ibm.com";
        userTofetch = splitUser.join("");
    }else {
        return false;
    }
    const url = "https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(mail="+userTofetch+").search/byjson?preferredidentity&notesId&additional";
    const axiosConfig = {
        headers: {
        'Content-Type': 'application/xml;charset=UTF-8'
        },
        httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        }),
    };

    try {
    

        const response = await  axios.get(url,  axiosConfig)
        let returnCount = response.data.search.return.count;
        if(returnCount === 0 ){
            logger.info(`No Details available against ${userTofetch}`);
            return false
            // res.status(400).send({ "validEmail":false, "fetchError": "No Details available against "+userTofetch })
        }else{
            return true
            // res.status(200).send({ "validEmail":true, "fetchError": "" })

        }
    } 
    catch(err)  {
        logger.error('Error Posting to user ERROR:', err);
        // res.status(400).send({ "validEmail":false, "fetchError": "No Details available against "+userTofetch })
        return false
    }
 }

  

const createGroup = async (groupName, owner, members, administrators, groupDescription ) => {
    let errMsg = [];
        const owners = [];
        let updatedMembers = [];
        let updatedAdmins = [];
        if(owner) owners.push(owner.toLowerCase())
        if(members && members.length) {
             updatedMembers = members.map(member => member.toLowerCase())
        } 
        if(administrators && administrators.length) updatedAdmins = administrators.map(admin => admin.toLowerCase())

        const data = {
            name: groupName,
            description: groupDescription? groupDescription : "",
            members: updatedMembers,
            owners,
            administrators: updatedAdmins   
        }

        logger.info(`groupUtil:: createGroup: data saving groups ${JSON.stringify(data)}`)
        try {
           const result =  await msutils.saveInStore("ChatopsGroups", data); 
           if(result.name){
            return[true, result];
           }else {
            return[false, result];
           }
           
        }
        catch (e) {
            logger.error(`groupUtil:: createGroup: Error  while saving groups ${e}`)

            // res.status(409).send({ "errMsg": errMsg,"saveStatus": "false","groupname": grpName,"redirectUrl": baseUrl+"groups"});

        }
}

// replacement of addMembers
const addGroupMembers = async (groupName, members) => {

    try {
        var groupDetail = await getGroupDetailByName(groupName);

        const groupId = groupDetail._id;
        const data = {
            members
        }
        const result =  await msutils.patchDataInStore("ChatopsGroups", groupId, data);
        if(result && result.name){
            logger.info(`Going to remove cache for pattern: Chatops-Groups-${groupName}`);
            await msutils.delCacheValuesByPattern(`Chatops-Groups-${groupName}`);
            return true
        }else {
            return false;
        }
    } catch (error) {
            
    }
}


//No change needed
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
          // check if the user is asscociated to program admin group
          var uerFromReq = req.user.id;
          var userToLogin ;
          var splitUser = uerFromReq.split("@");
        //   if(splitUser[1].toLowerCase() == "kyndryl.com"){
        //       splitUser[1] = "@ocean.ibm.com";
        //       userToLogin = splitUser.join("");
        //   }else{
        //       userToLogin = req.user.id
        //   }
        if(splitUser[1].toLowerCase() === "ocean.ibm.com"){
            splitUser[1] = "@kyndryl.com";
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
        logger.error("Unable to connect to chatops group");
      }
  }else{
    req.session.isProgramAdmin = false;
    req.session.isAccountAdmin = false;
    req.session.isSuperAdmin = false;
    reject("User is not authorized");
  }
  
    });
  
  }

//No change needed
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

//new method
const getGroupForUser = async (user) => {
    try {
            const queryObj = {"members": {$in:[user.toLowerCase()]}};
            return await msutils.fetchFromStoreByOptions(
                'ChatopsGroups', queryObj
            );
           
        } catch (error) {
            logger.error(`groupUtil:: getGroupListAssociated: Error while fetching data from ChatopsGroups for user ${user} :  ${error}`)
        }

}

const getGroupDetailByName = async (groupName) => {
logger.info(` inside getGroupDetailByName:  ${groupName}`)
    return await msutils.fetchFromStoreByOptions(
        'ChatopsGroups',
        { name: groupName }
    );
}

module.exports = {
    isUserAssociatedToGroup,
    isGroupValid,
    getGroupListAssociated,
    isValidEmail,
    createGroup,
    addGroupMembers,
    getFreshAccountAccessDetail,
    getUserAccessDetail
}
