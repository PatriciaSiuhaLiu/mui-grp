var msutils = require("msutils");
var logger = require("winston");
var moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const { validateSpecialCharacterAccountAdmin, fetchByTeamsEmailId, fetchByTeamUserId } = require('./validationHelper');

const {isGroupValid}  = require('./groupUtil')
const { profile } = require("winston");

 const MS_TEAMS_BOTS_CONFIG_NAME = 'msTeams_bots';
// const { configs } = require("eslint-plugin-prettier");
let settingsData = {};
async function mappingAccountDetails(data) {  
    try{        
        //validate the basic details
        var validateResult = validateSpecialCharacterAccountAdmin(data);

        var bgErr = [];
         
        if(!validateResult){
            var is_submitted = false;
            var acc_id = data._id;
            var account = await msutils.fetchFromStoreById("MUIAccounts", acc_id);
            is_submitted = account.submitted;
            var eventStreams = account.eventStreams;
            data.eventStreams = eventStreams;
            var pushToEventStream = account.pushToEventStream;
            data.pushToEventStream = pushToEventStream;
            data.enterprise = account.enterprise;
            data.maceDisabled = account.maceDisabled;
            data.directIntegEnabled = account.directIntegEnabled;
            var saved = account.saved;
            var accountId ="";
            var workspaceApiData = "";
            var ticketId ="";
            if(is_submitted || saved == true){
                accountId =  account.accountId;
                ticketId =  account.ticketId;
            }
            let groupNotValid = 0
            let settings =await getSettingsMap();  
            if(groupNotValid == 0){
				
                ticketId = await mapToTicketingSystem(settings,data,is_submitted,saved,ticketId);
				accountId = await mapToAccounts(settings,data,is_submitted,saved,accountId); 
                
				await mapToMUIAccounts(data,accountId,saved,ticketId);
            }else{
				
                bgErr["bgerrMsg"] = "bgResult error";
                validateResult = bgErr;
            } 
            
        }
        
    }
    catch(e){
		var acc_id = data._id;
        var account = await msutils.fetchFromStoreById("MUIAccounts", acc_id);
        let ticketVal = account.ticketId ;
        let is_saved = true
        if(ticketVal){
            // var acc_id = data._id;
            // var account = await msutils.fetchFromStoreById("MUIAccounts", acc_id);
            var is_submitted = account.submitted;
            var saved = account.saved;
            if(is_submitted == false || saved == true){
                await msutils.deleteDataInStore("TicketingTool", ticketId);
            }
            is_saved = false;
        }        
        let dataWithErrMsg=[];
        dataWithErrMsg["is_valid"] = false;
        if(e.name && e.name == "BGError")
        {
            if(e.message)
            dataWithErrMsg["bluegrpError"] = e.message;
        }
        else if(e.indexOf("BadRequestError") > -1){
            dataWithErrMsg["page"] = "Something went wrong while saving data"; 
        }else{
            dataWithErrMsg["page"] = e;
            if(e.message){
                dataWithErrMsg["page"] = e.message;// need to revisit
            }
        }
        validateResult= dataWithErrMsg;
        
    }
    return validateResult;
   
}

async function getSettingsMap(){
    let result = await msutils.fetchFromStore("settings",{});
    let settingsMap = new Map();
    if(result){
        for(var i=0;i<result.length;i++){
            settingsMap.set(result[i].config_name,result[i].config_value);
        }
    }
    return settingsMap;
}
async function mapToMUIAccounts(data,accountId,saved,ticketId) {
    var acc_id = data._id;
    var muiAccount = {};
    var muiAccountData = await msutils.fetchFromStoreById("MUIAccounts",acc_id);
    muiAccount.saved = data.saved;
    var savedData = muiAccount.saved;
    var savedFromUI = data.saved;
    var submitFromUI = data.submitted;
    var submitStatusFromDB = muiAccountData.submitted;
    // Handled saved and submitted from DB >>> FOr submitted True
    if(submitStatusFromDB == true ) {
        muiAccount.saved = false;
        muiAccount.submitted = true;
    }
    if(submitStatusFromDB == true && (muiAccountData.saved == true || savedFromUI == true)) {
        muiAccount.saved = false;
        muiAccount.submitted = true;
    }
    if(submitStatusFromDB == true && (muiAccountData.saved == false || savedFromUI == true)) {
        muiAccount.saved = false;
        muiAccount.submitted = true;
    }
    if(submitStatusFromDB == true && (muiAccountData.saved == true || savedFromUI == false)) {
        muiAccount.saved = false;
        muiAccount.submitted = true;
    }

// Handled saved and submitted from DB >>> FOr submitted False   
    // if(submitStatusFromDB == false && (muiAccountData.saved == true || savedFromUI == true)) {
    //     muiAccount.saved = true;
    //     muiAccount.submitted = false;
    // }
    if(submitStatusFromDB == false && (savedFromUI == true)) {
        muiAccount.saved = true;
        muiAccount.submitted = false;
    }
    // if(submitStatusFromDB == false && (muiAccountData.saved == true || savedFromUI == false)) {
    //     muiAccount.saved = false;
    //     muiAccount.submitted = true;
    // }
    if(submitStatusFromDB == false && ( savedFromUI == false)) {
        muiAccount.saved = false;
        muiAccount.submitted = true;
    }
     muiAccount.ownername = data.dpeAdminName ;
    muiAccount.owneremail = data.dpeAdminEmail ;
    muiAccount.is_GTSWorkspaceInUse = data.workspace;
    muiAccount.is_GTSWorkspaceInUse = data.workspace;
    muiAccount.workspaceadminName = "";
    muiAccount.workspaceadminEmail = "";

    if(data.defaultLanguage == "noLanguage" || data.defaultLanguage == ''){
        muiAccount.defaultLanguage = "English"
    }else{
        muiAccount.defaultLanguage = data.defaultLanguage;  
    }
    // muiAccount.defaultLanguage = data.defaultLanguage || "English";
   
    muiAccount.itsmadminname = data.itsmAdminName ;
    muiAccount.itsmeadminemail = data.itsmAdminEmail ;
    muiAccount.networkadminName = data.networkAdminName ;
    muiAccount.networkadminEmail = data.networkAdminEmail ;
    muiAccount.collaborationTool = data.collaborationTool ;
    muiAccount.groupAssignment = data.groupAssignment ;
    muiAccount.squadBasedAssignment = data.squadBasedAssignment;
    muiAccount.geo = data.accGeo ;
    if(data.squadBasedAssignment && data.squadBasedAssignment == 'yes')
         muiAccount.squadGeo = data.aiopsSquadGeo
    else
         muiAccount.squadGeo = "";
    muiAccount.triggerChatOpsProcess = data.triggerChatOpsProcess ;
    muiAccount.accountUtilizingCDI = data.eventSource ;
    if(data.eventSource  == "CDI"){
        muiAccount.eventsTriggerChatOps = data.eventSource ;
    }else{
        muiAccount.eventsTriggerChatOps = "";
    }
    muiAccount.accountUtilizingNetcool = data.accountUtilizingNetcool ;
    muiAccount.accountIdentifier = data.accountIdentifier ;
    muiAccount.ticketingToolUsed = data.ticketingToolUsed ;
    //muiAccount.enableOwner = data.enableOwner ;
    if(data.usingTicketingTool == "no" || data.usingTicketingTool == "noTicketingToolUsed"){
        muiAccount.ticketingToolUsed = "noTicketingTool" ;
    }
    if(data.ticketingToolUsed == "icd"){
        muiAccount.internetFacing = data.internetFacing ;
    }else{
        muiAccount.internetFacing = "noOption" ;
    }
    muiAccount.otherInformation = data.otherInformation ;
    muiAccount.accountId = accountId ;
    muiAccount.ticketId = ticketId ;
    // muiAccount.date = new Date().toUTCString() ;
    muiAccount.date = moment.utc(new Date()).format('L HH:mm');
    muiAccount.ansibleInstance = (data.ansibleInstance)?data.ansibleInstance:'';

    // GSMA 1.1 Changes
    muiAccount.enrollMaintenanceWindow = data.enrollMaintenanceWindow;

    let result = await msutils.patchDataInStore("MUIAccounts",acc_id,muiAccount);
    if(result){
        logger.info(
            `MUIAccount saved successfully with accountCode : ${data.accCode    }`,
            {
              transactionid: ``,
              class: 'MappingHelper',
              function: 'mapToMUIAccounts',
            },
          );
        return true;
    }else{
        logger.info(`MUIAccount not saved successfully with accountCode : ${data.accCode}`)
    }
}

function formUrl(url) {  
    const newUrl = 'https://' + settingsData[url] + ':' + settingsData.defaultPort;    
    return newUrl;
}

async function setConfigValues(accountDetail, settings) {       
    let urlsMapping = settings.get("microservices");
    settingsData = urlsMapping;
    const assignmentItsmServiceType = {
        'icd': formUrl('chatopsAssignmentItsmIcd'),
        'service_now': formUrl('chatopsAssignmentItsmSnow')
    };
    const itsmServiceType = {
        'icd': formUrl('chatopsItsmIcd'),
        'service_now': formUrl('chatopsItsmSnow')
    }
    if (
        accountDetail.assignmentService && accountDetail.ticketingToolUsed &&
        accountDetail.ticketingToolUsed.toLowerCase() == 'icd'
       ) {
        accountDetail.assignmentItsmServiceType = formUrl('chatopsAssignmentItsmIcd');
    }else {       
        accountDetail.assignmentItsmServiceType = formUrl('chatopsAssignmentItsmSnow');
     }

     if (
        accountDetail.assignmentService && accountDetail.ticketingToolUsed &&
        accountDetail.ticketingToolUsed.toLowerCase() == 'icd'
      ) {
        accountDetail.itsmServiceType = formUrl('chatopsItsmIcd');
      } else {
        accountDetail.itsmServiceType = formUrl('chatopsItsmSnow');
      }
    
      accountDetail.collaboratorServiceType =
      urlsMapping.chatopsCollabSlack;
      
      accountDetail.collaboratorServiceType = formUrl('chatopsCollab');
      
      accountDetail.channeleventServiceType = formUrl('chatopsChannelevent');    

      accountDetail.assignmentServiceType = [];
      if (
        accountDetail.assignmentService &&
        accountDetail.assignmentService.toLowerCase() == 'cdi'
      ) {
        accountDetail.assignmentServiceType.push(
            formUrl('chatopsAssignmentCdi'),
        );
      }
      if (
        accountDetail.assignments && 
        accountDetail.assignments.squadBasedAssignment
      ) {
        accountDetail.assignmentServiceType.push(
            formUrl('chatopsAssignmentCdiSquad'),
        );
      }
      if (
        (accountDetail.assignmentService &&
            accountDetail.assignmentService.toLowerCase() == 'service_now') ||
            accountDetail.assignmentService.toLowerCase() == 'icd'
      ) {
        accountDetail.assignmentServiceType.push(
            formUrl('chatopsAssignmentItsm'),
        );
      }
      if(!accountDetail.assignmentService){
        console.log(`assignmentItsmServiceType --${assignmentItsmServiceType[accountDetail.ticketingToolUsed.toLowerCase()]}`);
        accountDetail.assignmentItsmServiceType = assignmentItsmServiceType[accountDetail.ticketingToolUsed.toLowerCase()];
        accountDetail.itsmServiceType = itsmServiceType[accountDetail.ticketingToolUsed.toLowerCase()];;
      }

      if (
        accountDetail.assignments &&
        accountDetail.assignments.groups &&
        accountDetail.assignments.groups.length > 0
      ) {
        accountDetail.assignmentServiceType.push(
            formUrl('chatopsAssignmentGroups'),
        );
      }       
    return accountDetail;
}

async function mapToDynamicWorkflow(dynamicWorkflowData){
    try{
        var commandObj = {};
        commandObj.command = dynamicWorkflowData.command;
        commandObj.accountCode = dynamicWorkflowData.accCode;
        commandObj.processMessage = true;
        commandObj.msUrl = "";
        commandObj.group = dynamicWorkflowData.group; 
        commandObj.paramSequence =  dynamicWorkflowData.paramSequence;
        var paramList = [];
        var helpMsg = '';
        if (dynamicWorkflowData) {
            // var paramVal = dynamicWorkflowData.params;
            var paramVal1 = dynamicWorkflowData.paramSequence;
            var paramObj = {};
            // var paramData = paramVal["param"];
            Object.entries(paramVal1).map(([key, value]) => {
               paramObj[value] = `<${value}>`;
               helpMsg = helpMsg + ` --${value}=value`;
            });
            commandObj["params"] = paramObj;
        }
        //Geo Based commands
        var botPointer = '/ck';
        if(process.env.GEO && process.env.GEO.toUpperCase() !=="GLOBAL" && process.env.GEO.toUpperCase() !=="NA"){
            botPointer = `botPointer-${process.env.GEO.toLowerCase()}`
        }
        commandObj["helpMessage"] = `${botPointer} ${dynamicWorkflowData.command} ${helpMsg} OR <@app_name> ${dynamicWorkflowData.command} ${helpMsg}`;
        let result = "";
        if (dynamicWorkflowData._id) {
            // Edit Flow
            result = await msutils.updateInStore("Commands",dynamicWorkflowData._id, commandObj);
        } else {
            //  create flow
            result = await msutils.saveInStore("Commands", commandObj);
        }
        if (result) {            
            logger.info(`Going to create topic for custom commands with account code as ${commandObj.accountCode}`);
            await msutils.createEventsTopic(`customCommands_${commandObj.command}`, commandObj.accountCode);          
            logger.info(
                `Command saved successfully with `,
                {
                transactionid: ``,
                class: 'MappingHelper',
                function: 'mapToDynamicWorkflow',
                },
            );
        }
    }
    catch(error){
        
        logger.error(error);
        logger.error(
            `Error while saving Dynamic workflow for error :[${error}]`,
            {
            transactionid: ``,
            class: 'MappingHelper',
            function: 'mapToDynamicWorkflow',
            },
        );
        throw error;
    }
}
async function postToSettingsIndexChannel(dataFromUI) {
    logger.info(`Processing Index Channel data to save in settings collection`);
    var validateIndexChannel = {};
    try{
        var format_data;
        var saveData = false;
        var dataToSave = {};
        dataToSave["channel"] = dataFromUI.channelID;
        dataToSave["workspaceName"] = dataFromUI.workspace;
        dataToSave["workspaceType"] = dataFromUI.workspaceType;
        if(dataFromUI.minify == "true" || dataFromUI.minify == true){
            dataToSave["minify"] = true;
        }else{
            dataToSave["minify"] = false;
        }
        if(dataFromUI.ruleFromUI == '*'){
            dataToSave["rule"] = "*";
        }
        if(dataFromUI.ruleFromUI != '*'){
            if(dataFromUI.ruleFlag == true){
                format_data = dataFromUI.ruleFromUI;
                dataToSave["rule"] = format_data.replace(/"/g, "");
            }else{
                dataToSave["rule"] = dataFromUI.ruleFromUI;
            }
            
        }
        var indexChannelFromSettings = await msutils.fetchFromStore('settings',{"config_name":"globalIndexChannels"});
        var patchID = indexChannelFromSettings[0]._id;
        var channelId;
        var finalData = {}
        var equalFlag = false ;
        var indexChannnelList = indexChannelFromSettings[0].config_value;
        for (let i = 0; i < indexChannnelList.length; i++) {
            var elementFromDB = indexChannnelList[i];
            channelId = indexChannnelList[i].channel ;
            if (channelId == dataFromUI.channelID) {
                var equalFlag = true;
            }
        }
        if(dataFromUI.editFlag == false){
            if (equalFlag == false) {
                indexChannnelList.push(dataToSave)
                finalData["config_name"] = indexChannelFromSettings[0].config_name;
                finalData["config_value"] = indexChannnelList;
                saveData = true;
            }else{
                validateIndexChannel["successFlag"] = false;
                validateIndexChannel["validateChannelMsgNew"] = "Channel ID already existing";
                saveData = false;
            }
        }else{
            var indexChannelFromSettings = await msutils.fetchFromStore('settings',{"config_name":"globalIndexChannels"});
            var indexChannnelList = indexChannelFromSettings[0].config_value;
            var filteredResult = indexChannnelList.filter(obj => { //fetch from Store
                return obj.channel == dataFromUI.channelTOEdit
            })
            var dataToPatch = {};
            var dataArr = [];
            dataToPatch["channel"] = dataToSave.channel;
            dataToPatch["workspaceName"] = dataToSave.workspaceName;
            dataToPatch["minify"] = dataToSave.minify;
            dataToPatch["rule"] = dataToSave.rule;
            dataToPatch["workspaceType"] = dataToSave.workspaceType;
            dataArr.push(dataToPatch);
            var removeByAttr = function(arr, attr, value){
                var i = arr.length;
                while(i--){
                   if( arr[i] 
                       && arr[i].hasOwnProperty(attr) 
                       && (arguments.length > 2 && arr[i][attr] === value ) ){ 
            
                       arr.splice(i,1);
            
                   }
                }
                return arr;
            }
            var b = removeByAttr(indexChannnelList, 'channel', dataFromUI.channelTOEdit); 
            indexChannnelList[indexChannnelList.length] = dataArr[0]
            finalData["config_name"] = indexChannelFromSettings[0].config_name;
            finalData["config_value"] = indexChannnelList;
            saveData = true
        }
        if(saveData == true){
            var resulToSave = await msutils.patchDataInStore("settings",patchID,finalData);
            validateIndexChannel["successFlag"] = true;
            validateIndexChannel["validateChannelMsgNew"] = "Successfully saved index channel";
        }else{
            validateIndexChannel["successFlag"] = false;
        }
    }catch(error){
        logger.error(
            `Error while sending user data to settings :[${error}]`,
            {
            transactionid: ``,
            class: 'MappingHelper',
            function: 'postToSettingsIndexChannel',
            },
        );
    }
    return validateIndexChannel;
}
async function postToFeature(dataFromUI) {
    logger.info(`Processing Feature data to save in Features collection`);
    var validateFeature = {};
    try{
        var dataToSave = {};
        dataToSave["name"] = dataFromUI.name;
        dataToSave["publishToAll"] = dataFromUI.publishToAll;
        dataToSave["publishToSpecificAcount"] = dataFromUI.publishToSpecificAcount;
        dataToSave["category"] = dataFromUI.category;
        dataToSave["description"] = dataFromUI.description;
        var featureList = await msutils.fetchFromStore('Features', {}); 
        var featureName;
        var result;
        var equalFlag = false ;
        for (let i = 0; i < featureList.length; i++) {
            var elementFromDB = featureList[i];
            featureName = featureList[i].name ;
            if (featureName == dataFromUI.name) {
                equalFlag = true;
            }
        }
        if(dataFromUI.editFlag == false){
            // CREATE
            if (equalFlag == false) {
                await msutils.saveInStore("Features", dataToSave);
                validateFeature["successFlag"] = true;
                validateFeature["validateFeatureMsgNew"] = "Successfully saved feature";
                logger.info(
                    `Successfully saved feature data`,
                    {
                    transactionid: ``,
                    class: 'MappingHelper',
                    function: 'postToFeature',
                    },
                );
            }else{
                validateFeature["successFlag"] = false;
                validateFeature["validateFeatureMsgNew"] = "Feature name already existing";
                saveData = false;
            }
        }else{
            // EDIT
            // result =  await msutils.patchDataInStore("Features", dataFromUI.globalAssignmentID, dataToSave);
        }
    }catch(error){
        logger.error(
            `Error while sending user data to Features :[${error}]`,
            {
            transactionid: ``,
            class: 'MappingHelper',
            function: 'postToFeature',
            },
        );
    }
    return validateFeature;
}
async function postToGlobalAssignment(dataFromUI) {
    logger.info(`Processing Global Assignment data to save in GlobalAssignment collection`);
    var validateGlobalAssignment = {};
    try{
        var format_data;
        var saveData = false;
        var dataToSave = {};
        dataToSave["name"] = dataFromUI.name;
        dataToSave["groups"] = dataFromUI.group;
        if(dataFromUI.ruleFromUI == '*'){
            dataToSave["rule"] = "*";
        }
        if(dataFromUI.ruleFromUI != '*'){
            if(dataFromUI.ruleFlag == true){
                format_data = dataFromUI.ruleFromUI;
                dataToSave["rule"] = format_data.replace(/"/g, "");
            }else{
                dataToSave["rule"] = dataFromUI.ruleFromUI;
            }
        }
        var globalAssignmentsList = await msutils.fetchFromStore('GlobalAssignments', {}); 
        var assignmentName;
        var result;
        // var finalData = {}
        var equalFlag = false ;
        for (let i = 0; i < globalAssignmentsList.length; i++) {
            var elementFromDB = globalAssignmentsList[i];
            assignmentName = globalAssignmentsList[i].name ;
            if (assignmentName == dataFromUI.name) {
                equalFlag = true;
            }
        }
        if(dataFromUI.editFlag == false){
            // CREATE
            if (equalFlag == false) {
                result = await msutils.saveInStore("GlobalAssignments", dataToSave);
                validateGlobalAssignment["successFlag"] = true;
                validateGlobalAssignment["validateGAMsgNew"] = "Successfully saved index channel";
            }else{
                validateGlobalAssignment["successFlag"] = false;
                validateGlobalAssignment["validateGAMsgNew"] = "Assignment name already existing";
                saveData = false;
            }
        }else{
            // EDIT
            result =  await msutils.patchDataInStore("GlobalAssignments", dataFromUI.globalAssignmentID, dataToSave);
        }
    }catch(error){
        logger.error(
            `Error while sending user data to GlobalAssignments :[${error}]`,
            {
            transactionid: ``,
            class: 'MappingHelper',
            function: 'postToGlobalAssignment',
            },
        );
    }
    return validateGlobalAssignment;
}
async function postToTeamITRequest(dataFromUI) {
    logger.info(`Processing Requester data to save in TeamITRequest collection`);
    var validateRequest = {};
    try{
        var format_data;
        var dataToSave = {};
        if (dataFromUI.patchId) {
            var dataToSave = {
                requestID: dataFromUI.requestID,
                status: dataFromUI.status,
                requesterEmail: dataFromUI.requesterEmail,
                alternateEmail: dataFromUI.alternateEmail ,
                createDate: dataFromUI.createDate ,
                account: dataFromUI.account ,
                estHours: dataFromUI.estHours ,
                geo: dataFromUI.geo ,
                market: dataFromUI.market ,
                startDate: dataFromUI.startDate ,
                endDate: dataFromUI.endDate ,
                description: dataFromUI.description ,
                comments: dataFromUI.comments ,
                supportType: dataFromUI.supportType ,
                shortDesc: dataFromUI.shortDesc ,
                adminStatus: dataFromUI.adminStatus , 
                claimTerms: dataFromUI.claimTerms ,
                complianceTerms: dataFromUI.complianceTerms ,
                closeCode: dataFromUI.closeCode,
                resources: dataFromUI.resources,
                isAdminUpdate: dataFromUI.isAdminUpdate,
                requestorContactNo: dataFromUI.requestorContactNo,
                technicalContactNo: dataFromUI.technicalContactNo,
            }
            if(dataFromUI.skills){
                var dataToSkill = {
                    requestID: dataFromUI.requestID,
                    skills: dataFromUI.skills
                }
            }
            var skillCheck = false;
            var dateCheck = false;
            // if(dataToSkill.skills && Object.keys(dataToSkill.skills).length == 0 ){
            //     validateRequest["successSkillFlag"] = true;
            //     // validateRequest["validateReqSkillMsg"] = "Select atleast one skill";
            //     skillCheck = false;
            // }
            if(dataFromUI.startDate.length > 0 || dataFromUI.endDate.length > 0 ){
            }else{
                validateRequest["successDateFlag"] = false;
                validateRequest["validateReqDateMsg"] = "Select start/end date";
                dateCheck = true;
            }
            if(skillCheck == false && dateCheck == false){
                var result;
                if (dataToSave) {
                    logger.info(`Patching Requester data`);
                    result =  await msutils.patchDataInStore("TeamITRequest", dataFromUI.patchId, dataToSave);
                    var skillResult = await msutils.patchDataInStore("TeamITRequestSkill",dataFromUI.skillPatchId, dataToSkill);
                    await dataFromUI.resources.forEach( async resource => {
                        let volunteers = await msutils.fetchFromStoreByOptions('TeamITVolunteerTracker',{
                            volunteerEmail:resource,
                            requestID: dataFromUI.requestID
                        });
                        if (volunteers === null || volunteers.length === 0) {
                            const resourceData = {
                                requestID: dataFromUI.requestID,
                                volunteerEmail:resource,
                                volunteerStatus:"assigned",
                                assignedBy:dataFromUI.requesterEmail,
                                assignedMode:"AdminAssign",
                                processedOn: dataFromUI.createDate
                            };
                            logger.info(`Saving Volunteer details into volunteer tracker`);
                            result = await msutils.saveInStore('TeamITVolunteerTracker', resourceData);
                            // post to slack channel about volunteer assignment
                            await postAssignedVolunteerToSlack(resourceData, dataFromUI);
                            volunteers = null;
                        }

                    });
                    validateRequest["successFlag"] = true;
                    validateRequest["successSkillFlag"] = true;
                    validateRequest["validateReqMsgNew"] = "Successfully saved Requester data";
                }
            }
            
        }else{
            var dataToSave = {
                requestID: dataFromUI.requestID,
                status: dataFromUI.status,
                requesterEmail: dataFromUI.requesterEmail,
                alternateEmail: dataFromUI.alternateEmail ,
                createDate: dataFromUI.createDate ,
                account: dataFromUI.account ,
                estHours: dataFromUI.estHours ,
                geo: dataFromUI.geo ,
                market: dataFromUI.market ,
                startDate: dataFromUI.startDate ,
                endDate: dataFromUI.endDate ,
                description: dataFromUI.description ,
                comments: dataFromUI.comments ,
                supportType: dataFromUI.supportType ,
                shortDesc: dataFromUI.shortDesc ,
                claimTerms: dataFromUI.claimTerms ,
                complianceTerms: dataFromUI.complianceTerms ,
                adminStatus: dataFromUI.adminStatus,
                isAdminUpdate: dataFromUI.isAdminUpdate,
                requestorContactNo: dataFromUI.requestorContactNo,
                technicalContactNo: dataFromUI.technicalContactNo,
            }
            if(dataFromUI.skills){
                var dataToSkill = {
                    requestID: dataFromUI.requestID,
                    skills: dataFromUI.skills
                }
            }
            if(dataToSkill.skills && Object.keys(dataToSkill.skills).length == 0 ){
                validateRequest["successSkillFlag"] = false;
                validateRequest["validateReqSkillMsg"] = "Select atleast one skill";
            }else{
                var result;
                if (dataToSave) {
                    logger.info(`Saving Requester data`)
                    result = await msutils.saveInStore("TeamITRequest", dataToSave);
                    var skillResult = await msutils.saveInStore("TeamITRequestSkill", dataToSkill);
                    validateRequest["successFlag"] = true;
                    validateRequest["successSkillFlag"] = true;
                    validateRequest["validateReqMsgNew"] = "Successfully saved Requester data";
                }
            }
        }
        
    }catch(error){
        logger.error(
            `Error while sending user data to TeamITRequest :[${error}]`,
            {
            transactionid: ``,
            class: 'MappingHelper',
            function: 'postToTeamITRequest',
            },
        );
    }
    return validateRequest;
}
async function postToTeamITVolunteer(dataFromUI) {
    logger.info(`Processing Volunteer data to save in TeamITVolunteer collection`);
    var validateVolunteer = {};
    try{
        var emailArr = [];
        var emailCheck = false;
        for (var i = 0; i < dataFromUI.fromDB.length; i++) {
            emailArr.push(dataFromUI.fromDB[i].email);
        }
        if(emailArr.includes(dataFromUI.email)){
            emailCheck = true;
            validateVolunteer["emailCheck"] = true;
            validateVolunteer["emailCheckMsg"] = "Volunteer email already exists";
        }else{
            emailCheck = false;
            validateVolunteer["emailCheck"] = false;
        }
        var dataToSave = {};
        dataToSave = {
            email: dataFromUI.email,
            managerEmail: dataFromUI.managerEmail,
            phone: dataFromUI.phone ,
            alternatePhone: dataFromUI.alternatePhone,
            geo: dataFromUI.geo,
            market: dataFromUI.market,
            country: dataFromUI.country,
            timezone: dataFromUI.timezone,
            createDate: dataFromUI.createDate ,
            supportGlobal: dataFromUI.supportGlobal,
            loginToClientSystem: dataFromUI.loginToClientSystem,
            consultingSupport: dataFromUI.consultingSupport,
            gsePractice: dataFromUI.gsePractice,
            serviceLine: dataFromUI.serviceLine,
            complianceTerms: dataFromUI.complianceTerms ,
        }
        if(dataFromUI.skills){
            var dataToSkill = {
                email: dataFromUI.email,
                skills: dataFromUI.skills
            }
        }
        if(dataFromUI.supportLocation){
            var dataToSupportLoc = {
                email: dataFromUI.email,
                supportLocation: dataFromUI.supportLocation
            }
        }
        if(dataToSkill.skills && Object.keys(dataToSkill.skills).length == 0 ){
            validateVolunteer["successSkillFlag"] = false;
            validateVolunteer["validateVolunteerSkillMsg"] = "Select atleast one skill";
        }else{
            var result;
            if (emailCheck == false) {
                result = await msutils.saveInStore("TeamITVolunteer", dataToSave);
                var skillResult = await msutils.saveInStore("TeamITVolunteerSkill", dataToSkill);
                var supportLocationResult = await msutils.saveInStore("TeamITVolunteerSupportLocation", dataToSupportLoc);
                validateVolunteer["successFlag"] = true;
                validateVolunteer["successSkillFlag"] = true;
                validateVolunteer["validateVolunteerMsgNew"] = "Successfully saved Requester data";
            }else{
                validateVolunteer["successFlag"] = false;
                validateVolunteer["successSkillFlag"] = false;
                logger.error(
                    `Error while sending user data to postToTeamITVolunteer`
                );
            }
        }
    }catch(error){
        logger.error(
            `Error while sending user data to postToTeamITVolunteer :[${error}]`,
            {
            transactionid: ``,
            class: 'MappingHelper',
            function: 'postToTeamITRequest',
            },
        );
    }
    return validateVolunteer;
}
async function mapToWorkspace(settings,workspaceApiData) {
    try{
        var workspaceDetail = {};
        //workspace  information
        var workspace = {};
        var team = {};
        team.id = workspaceApiData.team.id;
        team.name = workspaceApiData.team.name;
        team.enterprise_id = workspaceApiData.bot.enterpriseId;
        team.enterprise_name = settings.get("enterprise_name");
        workspaceDetail.team = team;
        //workspace token details
        var tokens = {};
        tokens.xoxb =workspaceApiData.bot.tokens.xoxb;
        tokens.xoxp =workspaceApiData.bot.tokens.xoxp;
        //bot details
        var bot = {};
        bot.id = workspaceApiData.bot.userId;
        bot.name = workspaceApiData.bot.name;
        bot.userId = workspaceApiData.bot.userId;
        bot.botId = workspaceApiData.bot.botId;
        bot.appId = workspaceApiData.bot.appId;
        bot.tokens = tokens;
        workspaceDetail.bot = bot;
        //chatops  details
        var chatops = {};
        chatops.id = settings.get("chatops_id");
        chatops.email = settings.get("chatops_email");
        workspaceDetail.chatops = chatops;

        
        //profile details
        var profiles = [];
        workspaceDetail.profiles = profiles;
        //workspace signing secret 
        workspaceDetail.signingsecret = workspaceApiData.signingsecret;
        workspaceDetail.name = workspaceApiData.name;
        let result = "";
        result = await msutils.saveInStore("Workspace", workspaceDetail);
        if (result) {
            logger.info(
                `Workspace saved successfully with `,
                {
                transactionid: ``,
                class: 'MappingHelper',
                function: 'mapToWorkspace',
                },
            );
        }
    }
    catch(error){
        logger.error(
            `Error while saving Workspace for error :[${error}]`,
            {
            transactionid: ``,
            class: 'MappingHelper',
            function: 'mapToWorkspace',
            },
        );
        throw error.message;
    }

}

async function mapToAccounts(settings,data,saved,is_submitted,accountId) {
	try{
    var accountDetail = {};
    //Fetch old account objct to maintain any new chnages from DB
    if(saved || is_submitted || accountId){
        console.log(`AlreadyOnboarded`);
        const accountData = await msutils.fetchFromStoreByOptions(
            'Accounts',
            {accountCode: data.accCode },           
        );  
        accountDetail = accountData[0];
        delete accountDetail._id;
    }else{
        console.log(`OnboardingFirstTime`);
        accountDetail.statusEnabled = "enabled";
        accountDetail.commentsEnabled = true;
        accountDetail.toolInitiateComment = true;
    }    
    console.log(`accountDetail-->${JSON.stringify(accountDetail)}`);
    //account basic details
    accountDetail.accountCode = data.accCode;
    accountDetail.accountName = data.accName;
    accountDetail.enterprise = data.enterprise;
    accountDetail.maceDisabled = data.maceDisabled;
    accountDetail.directIntegEnabled = data.directIntegEnabled;
    // GSMA 1.1 Changes
    accountDetail.enrollMaintenanceWindow = data.enrollMaintenanceWindow;
    var allowedPrioritiesArr = [];
    data.allowedPriorities.forEach(str => {
        allowedPrioritiesArr.push(Number(str));
    });
    accountDetail.allowedPriorities = allowedPrioritiesArr;
    if(data.feedStatus){
        accountDetail.feedStatus = data.feedStatus;
    } else {
        accountDetail.feedStatus = '';
    }
    //assignment service used 
    accountDetail.assignmentService = data.assignmentServiceToAssignResource;
    //tickettool  used
    accountDetail.itsmMSEnabled = data.usingTicketingTool && data.usingTicketingTool.toUpperCase() =="YES"?true:false ;

    //accountcode locator information
    let accountCodeLocators = {};
    accountCodeLocators.geography = data.accGeo;
    accountCodeLocators.market = data.accMarket;
    accountCodeLocators.sector = data.accSector;
    accountCodeLocators.industry = data.accIndustry;
    accountCodeLocators.blueId = data.blueID;
    accountCodeLocators.cdir = data.CDIR;
    accountCodeLocators.gbgid = data.GBGID;
    accountCodeLocators.countryCode = data.countryCode;
    accountCodeLocators.cdic = data.aiopsAccIdentifier;
    accountCodeLocators.isoCountryCode=data.isoCountryCode ;
    accountCodeLocators.countryName= data.countryName ;
    // Add collaboration Tool to Account from MUI..
 
    accountDetail.collaborationTool = data.collaborationTool
    accountDetail.accountCodeLocators = accountCodeLocators;
    var accountCode = data.accCode;
    
    accountDetail.ticketToolUsed = data.ticketingToolUsed;
    if(data.usingTicketingTool == "no" || data.usingTicketingTool == "noTicketingToolUsed"){
        accountDetail.ticketToolUsed = "noTicketingTool" ;
    }
    accountDetail.ticketingToolUsed = data.ticketingToolUsed;
    // if(data.enableOwner && !(data.usingTicketingTool == "no" || data.usingTicketingTool == "noTicketingToolUsed")){
    //     accountDetail.enableOwner = data.enableOwner;
    // } 
    // else {
    //     accountDetail.enableOwner = "";
    // }
    accountDetail.defaultLanguage = data.defaultLanguage || "English";
    const config = await msutils.getConfig(['accounts', 'sourcesystems']);  
    let sourceSystem = config.SourceIdentificationMap.find(
        (source) =>
        source.SourceIdentificationCode.toUpperCase() ===
        data.accCode.toUpperCase(),
    );   
    var sourceSystemData = await msutils.fetchFromStoreByOptions(
        'MUIAccounts',
        { accountCode: data.accCode },
        {  },
    );  
    if(!sourceSystem){
        let sourceSystemRecord = {};
        sourceSystemRecord.SourceIdentificationCode = data.accCode;
        var pushToEventStreamFromDB = sourceSystemData[0].pushToEventStream;
        let uuid = uuidv4();
        sourceSystemRecord.SourceAPIKey = msutils.encrypt(uuid);
        sourceSystemRecord.SourceDescription = `Api Key for account ${data.accCode}`;              
        sourceSystemRecord.pushToEventStream = pushToEventStreamFromDB
        // sourceSystemRecord.allowPlainAuth = false;
        await msutils.saveInStore('SourceSystems', sourceSystemRecord);
        await msutils.refreshSourceSystems();    
    }
    //workspace  information
    var acc_collaborationTool = data.collaborationTool;
    var workspace = {};

    const workspaceData = await msutils.fetchFromStore("Workspace", { name: data.workspace });
    const collabConfigFromDB = data.collabConfig;
    try{
        var slackIds = [];
        let teamsIds = [];
        if (data.defaultassignments) {
            var emailIds = data.defaultassignments.split(","); 
            if( workspaceData[0].workspaceType && workspaceData[0].workspaceType.toLowerCase() === 'teams'){
                teamsIds = emailIds;
            }else {
                for (var i = 0; i < emailIds.length; i++) {
                    var slackid = [];
                    if(is_submitted){            
                        slackid = await msutils.fetchByEmailId(emailIds[i].toString().trim(), workspaceData[0].bot.tokens.xoxb);
                    }else{
                        slackid = await msutils.fetchByEmailId(emailIds[i].toString().trim(), workspaceData[0].bot.tokens.xoxb);
                    }  
                    slackIds.push(slackid);    
                }
                
            }

            
        }
        //defaultindexchannels
        var defaultindexchannels = [];
        if(data.indexChannel){
            var indexChannelData = data.indexChannel;
            Object.keys(indexChannelData).forEach(indexchannel=>{
                var rule = indexChannelData[indexchannel].rule?indexChannelData[indexchannel].rule:"*" ;
                var workspaceName = indexChannelData[indexchannel].workspace;
                var indecChannelDataObj  = {
                        channel:indexchannel,
                        rule:rule,
                        workspaceName:workspaceName
                };
                defaultindexchannels.push(indecChannelDataObj);
            });   
        }  
        if(workspaceData && workspaceData.length > 0){
            if (workspaceData[0].workspaceType && workspaceData[0].workspaceType.toLowerCase() === "teams") {
                    const slackObj =   collabConfigFromDB ? collabConfigFromDB.slack : {}
                    accountDetail["collabConfig"] = {
                        teams: { 
                            defaultassignments: teamsIds,
                            defaultindexchannels: defaultindexchannels,
                            workspaceName: data.workspace
                        }, 
                        slack: slackObj  
                    };
            } else {
                    const teamsObj = collabConfigFromDB ? collabConfigFromDB.teams : {}
                accountDetail["collabConfig"] = {
                        slack: { 
                            defaultassignments: slackIds ,
                            defaultindexchannels: defaultindexchannels,
                            workspaceName: data.workspace
                            },
                        teams: teamsObj
                };  
            }
        }
    }
    catch(e){
        throw e;
    }

    //Source system keys
    var sourceSystemKeys = [];
    var sourceKV = [];
    var cdiTktkeyType = {};
    var CDITicketToolIDObj = {};
    if(data.assignmentServiceToAssignResource == "cdi"){
        if(data.CDITicketToolID){
            var CDITicketToolIDVal = data.CDITicketToolID;
            cdiTktkeyType.keyType = "CDITktToolId";
            cdiTktkeyType.keyValue = CDITicketToolIDVal;
            sourceKV.push(cdiTktkeyType)
            CDITicketToolIDObj.sourceKV = sourceKV;
            CDITicketToolIDObj.sourceSystemId = "CDI";
            sourceSystemKeys.push(CDITicketToolIDObj);
        }
    }else{
        sourceSystemKeys = [];
    }
    accountDetail.sourceSystemKeys = sourceSystemKeys;

    
    
     // groups rules assignment
     var assignments = {};
     var groupsList = [];
     if(data.groupNameRules){
        var groupData = data.groupNameRules;
       
        Object.keys(groupData).forEach(groupName=>{
            var rule = groupData[groupName].rule?groupData[groupName].rule:"*" ;
            var groupsListData  = {
                   name:groupName,
                   rule:rule
            };
            groupsList.push(groupsListData);
        });       
    }
     if(data.groupAssignment == "yes"){
         assignments.groups = groupsList;
     }else{
         assignments.groups = [];
     }  
     if(data.squadBasedAssignment){
        assignments.squadBasedAssignment = data.squadBasedAssignment && data.squadBasedAssignment.toUpperCase() =="YES"?true:false ;
    }else{
        assignments.squadBasedAssignment = "";
    }  

    // squad geo
    if(data.squadBasedAssignment && data.squadBasedAssignment == "no")
    {
      accountDetail.squadGeo="";
    }
    else
    {
        accountDetail.squadGeo = data.aiopsSquadGeo
    }

   
    // Command Authorisation Details
    var rbacConfigAssignments={};
    var authEmailId = [];
    var authbgNotValid = 0;

    if(data.chatopsCommandAuth =="chatopsAuth" && data.authType=="useGroup")
    {
    try{
        if (data.authgroup) {
            var emailIds = data.authGroup.split(",");  
            if (emailIds && emailIds.length >0)
            {
            for (var i = 0; i < emailIds.length; i++) { 
                    let result = await isGroupValid(emailIds[i]); 
                    if(result === false){
                        // bgNotValid = 1;
                        throw("Invalid group entered!"); 
                    }else{
                        authEmailId.push(emailIds[i]);}         
            }
        }
        }
        rbacConfigAssignments.userGroups = authEmailId;
    }
    catch(e){
        var bgerror = e; // e.name is 'Error'
        bgerror.name = 'AuthBGError';
        throw {name : "BGError", message : "Invalid group entered!"}; 
    }
}


    if(data.chatopsCommandAuth){
        if(data.chatopsCommandAuth == "userAuth")
        {
            rbacConfigAssignments.externalAuth = true;
            rbacConfigAssignments.userGroups=[];
            rbacConfigAssignments.allowOpenAccess= false;
         }
        else{
            rbacConfigAssignments.externalAuth = false;}
        
    }

    if(data.authType){
        if(data.authType == "useopenAuth" && data.chatopsCommandAuth == "chatopsAuth") {
            rbacConfigAssignments.userGroups=[];
            rbacConfigAssignments.allowOpenAccess= true;
            rbacConfigAssignments.externalAuth=false;
         }
         if(data.authType == "useGroup" && data.chatopsCommandAuth == "chatopsAuth")
            { rbacConfigAssignments.allowOpenAccess= false;
            rbacConfigAssignments.externalAuth=false;
            }      
    }


    if(data.usingTicketingTool == "no" || data.usingTicketingTool == "noTicketingToolUsed"){
            rbacConfigAssignments.userGroups=[];
            rbacConfigAssignments.allowOpenAccess= "";
            rbacConfigAssignments.externalAuth="";

    }
    accountDetail.assignments = assignments;    
    accountDetail.rbacConfig = rbacConfigAssignments;
    accountDetail.channeltype = data.incidentChannelType;

    // add event stream into account Collections

    accountDetail.eventStreams = data.eventStreams;

    // C3 Details
    accountDetail.enableC3 = data.enableC3;
    accountDetail.impersonateUser = data.impersonateUser;

    // insight details
    if(data.relatedInsights && data.ticketingToolUsed == "service_now" && data.usingTicketingTool == "yes"){
        accountDetail.relatedInsights = data.relatedInsights;
    } else {
        accountDetail.relatedInsights = false;   
    }

    //ansible integration
    try{
        const ansibleInstances = await msutils.fetchAnsibleInstance();
        const ansibleInstanceObject = ansibleInstances.find((a) => a.name === data.ansibleInstance);
        accountDetail.ansibleInstance = '';
        let channels = (data.ansibleInstanceLogChannels)?data.ansibleInstanceLogChannels.split(','):[];
        let logFlag = (data.ansibleInstanceLogFlag)?data.ansibleInstanceLogFlag:'no';
        accountDetail.ansibleInstanceLog = {};
        accountDetail.ansibleInstanceLog.logRequired = logFlag;
        accountDetail.ansibleInstanceLog.template = data.ansibleInstanceLogTemplate;
        accountDetail.ansibleInstanceLog.channels = channels;

        if(ansibleInstanceObject){
            accountDetail.ansibleInstance = (data.usingAnsibleIntegration !== 'no') ? ansibleInstanceObject._id : '';
        }
    }catch(e){
        logger.info("Ansible not found!");
        accountDetail.ansibleInstance = '';
    }

    // ci details
    if(data.enableCiDetails && data.ticketingToolUsed == "service_now" && data.usingTicketingTool == "yes"){
        accountDetail.enableCiDetails = data.enableCiDetails;
    } else {
        accountDetail.enableCiDetails = false;   
    }

    // desc details
    if(data.enableDescDetails && data.ticketingToolUsed == "service_now" && data.usingTicketingTool == "yes"){
        accountDetail.enableDescDetails = data.enableDescDetails;
    } else {
        accountDetail.enableDescDetails = false;   
    }

    // stack details
    if(data.enableStackDetails){
        accountDetail.enableStackDetails = data.enableStackDetails;
    } else {
        accountDetail.enableStackDetails = false;   
    }
    // Watson assistant
    if(data.watsonAssistant && data.watsonAssistant.watsonApiKey){
        data.watsonAssistant.watsonApiKey = msutils.encrypt(data.watsonAssistant.watsonApiKey);
    }
    accountDetail.watsonAssistant = data.watsonAssistant;

    let accountDetail1 = await setConfigValues(accountDetail, settings); 
    delete accountDetail.ticketingToolUsed;
    let result = "";
    // updateInStore >> submitted: true, saved true
    // SaveInStore >> when submitted false
    console.log(`accountDetail-->${JSON.stringify(accountDetail)}`)
    if (is_submitted || saved == true) {
            //delete flat structures
            const slackObj = {
                workspaceName: "",
                defaultindexchannels: [],
                defaultassignments: []
            }
            let flatStructureFound = false
            if("workspaceName" in accountDetail){
                flatStructureFound = true;
                slackObj["workspaceName"] = accountDetail.workspaceName;
                delete accountDetail.workspaceName
            }
            if("defaultindexchannels" in accountDetail){
                flatStructureFound = true;
                slackObj["defaultindexchannels"] = accountDetail !== null ? accountDetail.defaultindexchannels: '';
                delete accountDetail.defaultindexchannels
            }
            if("defaultassignments" in accountDetail){
                flatStructureFound = true;
                slackObj["defaultassignments"] = accountDetail.defaultassignments !== null ? accountDetail.defaultassignments : '';
                delete accountDetail.defaultassignments
            }
            if(flatStructureFound){
                accountDetail.collabConfig["slack"] = slackObj;
            }

        result = await msutils.updateInStore("Accounts",accountId, accountDetail);
        console.log(`result - edit-->${JSON.stringify(result)}`);
    } else {
        //else create flow
		result = await msutils.saveInStore("Accounts", accountDetail);
        console.log(`result - add-->${JSON.stringify(result)}`);
        accountId = result._id;
    }

    if (result) {
        logger.info(
            `Account saved successfully with accountCode : ${data.accCode}`,
            {
              transactionid: ``,
              class: 'MappingHelper',
              function: 'mapToAccounts',
            },
          );
        return result._id;
    }
}
catch(error){
    logger.error(
        `Error while saving account for accountCode : ${data.accCode} error :[${error}]`,
        {
          transactionid: ``,
          class: 'MappingHelper',
          function: 'mapToAccounts',
        },
      );
      throw error;
}

}




async function mapToTicketingSystem(settings,data,saved,is_submitted, ticketId ) {
    try{
    var ticketingDetail = {};
    if(data.ticketingToolUsed != '' || data.ticketToolUsed != undefined){
        ticketingDetail.accountCode = data.accCode.toLowerCase();
        if(data.usingTicketingTool == "yes"){
            ticketingDetail.authType = data.typeOfAuthentication && data.typeOfAuthentication.toUpperCase() == "OAUTH" ? "OAuth2" : "Basic";
            ticketingDetail.instanceUrl = data.tickertingRestURL.trim();
            ticketingDetail.enableServiceManager = data.enableServiceManager;
            //ticketingDetail.enableCRFWEmail = data.enableCRFWEmail;
            ticketingDetail.Ticket_Channel_Assigned_Message = settings.get("ticket_message_pattern");    
            var ticketingConfigurations = {}; 
            
            if(data.ticketingToolUsed == "icd"){
                ticketingDetail.csmEnabled = false;
                ticketingDetail.dropletEnabled = false;
            }else{
                if(data.csmEnabled == true){
                    ticketingDetail.dropletEnabled = false;
                    ticketingDetail.csmEnabled = data.csmEnabled;
                    ticketingConfigurations["tableName"] = data.tableName;
                    ticketingDetail.ticketingConfigurations = ticketingConfigurations;
                }
                if(data.dropletEnabled == true){
                    ticketingDetail.dropletEnabled = data.dropletEnabled;
                    ticketingDetail.csmEnabled = false;
                    ticketingConfigurations["urlPath"] = data.urlPath;
                    ticketingConfigurations["dedicatedDropletInstance"] = data.dedicatedDropletInstance;
                    ticketingDetail.ticketingConfigurations=ticketingConfigurations;
                    if(data.dedicatedDropletInstance == false){
                        ticketingConfigurations["company"] = data.companyName;
                        ticketingDetail.ticketingConfigurations = ticketingConfigurations;
                    }
                }
                if(data.csmEnabled == false && data.dropletEnabled == false){
                    ticketingDetail.csmEnabled = false;
                    ticketingDetail.dropletEnabled = false;
                    ticketingDetail.ticketingConfigurations = {};
                }
            }
            var Objkeys = Object.keys(data);
            var msStatusValues ;
            var msTicketUpdateRules;
            // if !includes == CREATE FLOW
            if(data.ticketingToolUsed == "service_now" && data.csmEnabled == true && (data.dropletEnabled == false || data.dropletEnabled == undefined) ){
                var jsonObj = data.SnowCsmStatusFlowConf;
                if (typeof jsonObj == "string") {
                    // EDIT flow
                    var newjsonObj = JSON.parse(jsonObj);
                }else{
                    //else create flow
                    var newjsonObj = jsonObj;
                }
                ticketingDetail.msStatusValues = newjsonObj.msStatusValues;
                ticketingDetail.msTicketUpdateRules = newjsonObj.msTicketUpdateRules;
            }
            if(data.ticketingToolUsed == "service_now" && (data.csmEnabled == false || data.csmEnabled == undefined) && (data.dropletEnabled == false || data.dropletEnabled == undefined)){
                var jsonObj = data.SnowDefaultStatusFlowConf;
                if (typeof jsonObj == "string") {
                    // EDIT flow
                    var newjsonObj = JSON.parse(jsonObj);
                }else{
                    //else create flow
                    var newjsonObj = jsonObj;
                }
                ticketingDetail.msStatusValues = newjsonObj.msStatusValues;
                ticketingDetail.msTicketUpdateRules = newjsonObj.msTicketUpdateRules;
            }
            if(data.ticketingToolUsed == "service_now" && (data.csmEnabled == false || data.csmEnabled == undefined) && data.dropletEnabled == true){
                var jsonObj = data.SnowDropletStatusFlowConf;
                if (typeof jsonObj == "string") {
                    // EDIT flow
                    var newjsonObj = JSON.parse(jsonObj);
                }else{
                    //else create flow
                    var newjsonObj = jsonObj;
                }
                ticketingDetail.msStatusValues = newjsonObj.msStatusValues;
                ticketingDetail.msTicketUpdateRules = newjsonObj.msTicketUpdateRules;
            }
            if(data.ticketingToolUsed == 'icd'){
                var jsonObj = data.IcdDefaultStatusFlowConf;
                if (typeof jsonObj == "string") {
                    // EDIT flow
                    var newjsonObj = JSON.parse(jsonObj);
                }else{
                    //else create flow
                    var newjsonObj = jsonObj;
                }
                ticketingDetail.msStatusValues = newjsonObj.msStatusValues;
                ticketingDetail.msTicketUpdateRules = newjsonObj.msTicketUpdateRules;
            }

            let basicAuth = {};
            basicAuth.username = msutils.encrypt(data.basicAuthUserID);
            basicAuth.password = msutils.encrypt(data.basicAuthPassword);
            if (data.typeOfAuthentication.toUpperCase() == "OAUTH") {
                let oauth2Auth = {};
                oauth2Auth.client_id = msutils.encrypt(data.oauthClientID);
                oauth2Auth.client_secret = msutils.encrypt(data.oauthClientSecret);
                oauth2Auth.expires_safety_threshold = 60;
                ticketingDetail.oauth2Auth = oauth2Auth;
                ticketingDetail.basicAuth = basicAuth;
            } else {
                ticketingDetail.basicAuth = basicAuth;
            }
        }else if(data.usingTicketingTool == "no" || data.usingTicketingTool == "noTicketingToolUsed" || data.usingTicketingTool == ''){
            ticketingDetail.authType = "noAuth";
        }
    }else{
        ticketingDetail.accountCode = data.accCode.toLowerCase();
        ticketingDetail.authType = "noAuth";

    }
    let result = "";
    // updateInStore >> submitted: true, saved true
    // SaveInStore >> when submitted false
    if (is_submitted || saved == true) {
        logger.info('In Submitted Flow >>>>>>>>>>>>>>>>>');
        result = await msutils.patchDataInStore("TicketingTool", ticketId, ticketingDetail);
    }else{
        logger.info('In Creation Flow >>>>>>>>>>>>>>>>>');
        //else create flow
        result = await msutils.saveInStore("TicketingTool", ticketingDetail);
        ticketId = result._id;
    }
    if (result) {
        logger.info(
            `Ticketing tool details saved successfully with accountCode : ${data.accCode}`,
            {
              transactionid: ``,
              class: 'MappingHelper',
              function: 'mapToTicketingSystem',
            },
          );
        return ticketId;
    }
    }
    catch(error){
        logger.error(
            `Error while saving ticketing tool for accountCode : ${data.accCode} error :[${error}]`,
            {
              transactionid: ``,
              class: 'MappingHelper',
              function: 'mapToTicketingSystem',
            },
          );
        throw error;
        
    }

}

async function mapAccountCode(muiAccountId,data) {
    try{    
          //first fetch accountObj by accountId;
    let muiAccount = await msutils.fetchFromStoreById("MUIAccounts",muiAccountId);
    data.submitted = muiAccount.submitted;
    let ticketId = muiAccount.ticketId;
    let accountId = muiAccount.accountId;
    let result =  await msutils.patchDataInStore("MUIAccounts", muiAccountId, data);
    if(result){
        //update account and ticketing collection
        if(accountId){
            await msutils.patchDataInStore("Accounts", accountId, {'accountCode':data.accountCode, 'eventStreams': data.eventStreams, "maceDisabled": data.maceDisabled, "directIntegEnabled": data.directIntegEnabled});
        }
        if(ticketId){
            await msutils.patchDataInStore("TicketingTool", ticketId, {'accountCode':data.accountCode});
        }
    }
    logger.info(
        `Successfully patched muiaccount details for the accountCode : ${muiAccount.accountCode}`,
        {
          transactionid: ``,
          class: 'MappingHelper',
          function: 'mapAccountCode',
        },
      );
    }
    catch(error){
        logger.error(
            `Error while patching muiaccount details for accountCode : ${data.accountCode} error :[${error}]`,
            {
              transactionid: ``,
              class: 'MappingHelper',
              function: 'mapAccountCode',
            },
          );
        throw error;
    }
}

async function mapDataFromDb(muiAccount){
    var account = await msutils.fetchFromStore("Accounts",{"accountCode":muiAccount.accountCode});
    var workspace = await msutils.fetchFromStore("Workspace" );
    if(account && account.length > 0){
        account = account[0];
        //accountcodelocator
        if(account.accountCodeLocators){
            let accountCodeLocator = account.accountCodeLocators;
            muiAccount.geo = accountCodeLocator.geography;
            muiAccount.market = accountCodeLocator.market;
            muiAccount.sector = accountCodeLocator.sector;
            muiAccount.accountBlueID = accountCodeLocator.blueId;
            muiAccount.industry = accountCodeLocator.industry;
            muiAccount.cdir = accountCodeLocator.cdir;
            muiAccount.gbgid = accountCodeLocator.gbgid;
            muiAccount.accountCountryCode = accountCodeLocator.countryCode;
            muiAccount.accountCDIC = accountCodeLocator.cdic;
            // muiAccount.allowedPriorities = account.allowedPriorities;
            if(account.allowedPriorities){
                muiAccount.allowedPriorities = account.allowedPriorities.map(String)
            }else{
                muiAccount.allowedPriorities = ["1"];
            }
            //try population isocountry code and country name
            muiAccount.isoCountryCode = accountCodeLocator.isoCountryCode;
            muiAccount.countryName =accountCodeLocator.countryName;
        }
        //Channel Type
        muiAccount.incidentChannelType = account.channeltype;
        muiAccount.apiKey = account.apiKey;
        // C3 fields
        muiAccount.enableC3 = account.enableC3
        muiAccount.impersonateUser = account.impersonateUser
        //relatedInsights
        muiAccount.relatedInsights = account.relatedInsights;
        //enable ci
        muiAccount.enableCiDetails = account.enableCiDetails;
        //enable desc
        muiAccount.enableDescDetails = account.enableDescDetails;
        //enable stack
        muiAccount.enableStackDetails = account.enableStackDetails;
        //enable stack
        if(account.watsonAssistant && account.watsonAssistant.watsonApiKey){
            account.watsonAssistant.watsonApiKey = msutils.decrypt(account.watsonAssistant.watsonApiKey);
        }
        muiAccount.watsonAssistant = account.watsonAssistant;

        // Get workspace name from collabConfig
        if(account.collabConfig && account.collabConfig[account.collaborationTool.toLowerCase()] && account.collabConfig[account.collaborationTool.toLowerCase()].workspaceName){
            muiAccount.workspaceName = account.collabConfig[account.collaborationTool.toLowerCase()].workspaceName;
        }else {
            muiAccount.workspaceName = account.workspaceName;
        }
        //groups list
        if (account && account.assignments && account.assignments.groups && account.assignments.groups.length > 0) {           
            var groups = {};
            let groupsDB = account.assignments.groups;
            for(let group of groupsDB) {
                groups[group.name.toString()] = group.rule.toString();
            }
            muiAccount.groupList = groups;
        }  
        // Squad Based Assignment
       
        if (account && account.assignments && account.assignments.squadBasedAssignment)
        {
            muiAccount.squadBasedAssignment = account.assignments.squadBasedAssignment ? "yes" : "no";
        }

        muiAccount.squadGeo = muiAccount.squadGeo;
        //sourceSystemKeys
        if(account && account.sourceSystemKeys && account.sourceSystemKeys.length > 0){
            muiAccount.CDITktToolId = account.sourceSystemKeys[0].sourceKV[0].keyValue
        }

        //defaullt index channel
        let defaultindexchannels = [];
        var channel = {};
        if (account.collabConfig && account.collabConfig[account.collaborationTool.toLowerCase()] &&
        account.collabConfig[account.collaborationTool.toLowerCase()].defaultindexchannels ) {
            
             defaultindexchannels = account.collabConfig[account.collaborationTool.toLowerCase()].defaultindexchannels;
        }else {
            defaultindexchannels = account.defaultindexchannels || [];
        }
            let workSpaceName = [];

            for(var i=0;i<workspace.length;i++){
                workSpaceName.push(workspace[i].name);
            }
            
           
            for(var t =0;t<defaultindexchannels.length;t++){
                var channelIndex ='';
                var channelRule=''
                var channelWorkspcae='';
                // channel[defaultindexchannels[t].channel.toString()] = [defaultindexchannels[t].rule.toString()];
                if(defaultindexchannels[t].channel)
                    channelIndex = defaultindexchannels[t].channel.toString();
                if(defaultindexchannels[t].rule)
                    channelRule= defaultindexchannels[t].rule.toString();
                if(defaultindexchannels[t].workspaceName)
                    channelWorkspcae = defaultindexchannels[t].workspaceName.toString()
                channel[channelIndex] = [channelRule,channelWorkspcae,workSpaceName];
            }
            muiAccount.workspaceIndexChannel = channel;
            
   
            //default assignment
            let assignments = [];
            let currWorkspaceName="";
            var users = [];
            if(account.collabConfig){
                muiAccount.collabConfig = account.collabConfig;
                if (account.collabConfig[account.collaborationTool.toLowerCase()] && account.collabConfig[account.collaborationTool.toLowerCase()].defaultassignments  ) {
                     assignments = account.collabConfig[account.collaborationTool.toLowerCase()].defaultassignments;
                     currWorkspaceName = account.collabConfig[account.collaborationTool.toLowerCase()].workspaceName;
                }
            }else {
                assignments = account.defaultassignments;
                currWorkspaceName = account.workspaceName;
            }
            try{
                let xoxb = "";
                //default assignment for teams
                if(account.collaborationTool.toLowerCase() === 'teams'){
                    // // get Email ids from teams user id 
                    // const teamsBotDetails = await msutils.fetchSettings(MS_TEAMS_BOTS_CONFIG_NAME);
                    // //get current workspace detail
                    // const curentWorkSpaceDetail = workspace.find(element => element.name === muiAccount.workspaceName)
                    // if (teamsBotDetails) {
                    //     const bot = teamsBotDetails[curentWorkSpaceDetail.region];
                    //     if (bot) {
                    //         for (let i = 0; i < assignments.length; i++) {
                    //             const teamsUserEmail = await fetchByTeamUserId(assignments[i], bot)
                    //             console.log(teamsUserEmail);
                    //             users.push(teamsUserEmail)
                    //         }
                    //     }
                    // }

                    for (let i = 0; i < assignments.length; i++) {
                                    users.push(assignments[i])
                    }
                }else{
                    for(var j =0 ; j < workspace.length; j++){
                        if(currWorkspaceName.toString() == workspace[j].name.toString()){
                            xoxb = workspace[j].bot.tokens.xoxb;
                            break;
                        }else{
                            xoxb = "noValue"; // SCenario to handle if any breakage
                        }
                    }
                    for(var i =0;i<assignments.length;i++){
                        users.push(await msutils.fetchbyUserId(assignments[i],xoxb));// from workspace collection
                    }
                    muiAccount.accmemberemail = users.toString();       
                }  
                
            }
            catch(e){
                logger.error("Invalid token for workspace provided ");
            }
                
            if(account.collabConfig){
                if (account.collabConfig[account.collaborationTool.toLowerCase()] && account.collabConfig[account.collaborationTool.toLowerCase()].defaultassignments) {
                    muiAccount.collabConfig[account.collaborationTool.toLowerCase()]["defaultassignmentsEmail"] = users.toString();
                }
            }   



            muiAccount.ticketingToolInUse = account.itsmMSEnabled ? "yes" : "no"
            //assignmentservice
            muiAccount.assignmentServiceToAssignResource = account.assignmentService;
            if (workspace) {
                
            if( muiAccount.collaborationTool && muiAccount.collaborationTool.toUpperCase() == "SLACK"){
                    //workspace
                    if (workspace.team) {
                        // muiAccount.IBMEnterpriseSlackWorkspace = account.workspace.team.name;
                        muiAccount.workspaceID = workspace.team.id;
                        muiAccount.workspaceTeamDomain = workspace.team.domain;
                        muiAccount.workspaceEmailDomain = workspace.team.email_domain;
                        muiAccount.workspaceSigningSecret = workspace.signingsecret;
                        
                    }
                    if (workspace.tokens) {
                        //tokens
                        muiAccount.workspacexoxbToken = workspace.bot.tokens.xoxb;
                        muiAccount.workspacexoxpToken = workspace.bot.tokens.xoxp;
                    }
            
                    if (workspace.bot) {
                        //bot
                        muiAccount.workspaceBotName = workspace.bot.name;
                        muiAccount.workspaceBotID = workspace.bot.botId;
                    }
            
                }
            }

            // Fetch Command Access Token Details

            muiAccount.chatopsCommandAuth = account.rbacConfig.externalAuth ? "userAuth" : "chatopsAuth";
            if(account.rbacConfig){
            if(account.rbacConfig.userGroups && account.rbacConfig.userGroups.length >0 && account.rbacConfig.externalAuth == false)
            {
                muiAccount.authType = "useGroup";
            }else {
                muiAccount.authType = "useopenAuth";
            }
                if (account.rbacConfig.userGroups && account.rbacConfig.userGroups.length>0 ) {
                    var users = [];
                    let assignments = account.rbacConfig.userGroups;
                    for(var i =0;i<assignments.length;i++){
                        users.push(assignments[i]);// from workspace collection
                    }
                    muiAccount.authGroup = users.toString();
                }
            }
            
                // fetch ticketing details
            var ticketingDetail = await msutils.fetchFromStore("TicketingTool", { "accountCode": muiAccount.accountCode });
            if (ticketingDetail && ticketingDetail.length > 0 ) {
                ticketingDetail = ticketingDetail[0];
                muiAccount.typeOfAuthentication =  ticketingDetail.authType && ticketingDetail.authType.toUpperCase() == "OAUTH2" ? "oauth" : "basic";
                muiAccount.ticketingRestApiUrl =  ticketingDetail.instanceUrl;
                muiAccount.enableServiceManager =  ticketingDetail.enableServiceManager;
                muiAccount.enableCRFWEmail = ticketingDetail.enableCRFWEmail;
                if(ticketingDetail.basicAuth){
                    muiAccount.basicAuthUserID = msutils.decrypt(ticketingDetail.basicAuth.username);
                    muiAccount.basicAuthPassword = msutils.decrypt(ticketingDetail.basicAuth.password);
                }
                if(ticketingDetail.oauth2Auth){
                    muiAccount.oauthClientID = msutils.decrypt(ticketingDetail.oauth2Auth.client_id);
                    muiAccount.oauthClientSecret = msutils.decrypt(ticketingDetail.oauth2Auth.client_secret);
                }
                muiAccount.dropletEnabled = ticketingDetail.dropletEnabled;
                if(ticketingDetail.ticketingConfigurations){
                    muiAccount.urlPath = ticketingDetail.ticketingConfigurations.urlPath;
                    muiAccount.dedicatedDropletInstance = ticketingDetail.ticketingConfigurations.dedicatedDropletInstance;
                    muiAccount.tableName = ticketingDetail.ticketingConfigurations.tableName;
                    muiAccount.companyName = ticketingDetail.ticketingConfigurations.company;
                }
                muiAccount.csmEnabled = ticketingDetail.csmEnabled;
                var ticketingToolUsed = muiAccount.ticketingToolUsed;
                var SnowDropletStatusFlowConf = {};
                var SnowCsmStatusFlowConf = {};
                var IcdDefaultStatusFlowConf = {};
                var SnowDefaultStatusFlowConf = {};
                if(muiAccount.ticketingToolUsed == "icd"){
                    IcdDefaultStatusFlowConf["msStatusValues"] = ticketingDetail.msStatusValues;
                    IcdDefaultStatusFlowConf["msTicketUpdateRules"] = ticketingDetail.msTicketUpdateRules;
                    muiAccount.IcdDefaultStatusFlowConf = IcdDefaultStatusFlowConf;
                    muiAccount.SnowDropletStatusFlowConf = muiAccount.SnowDropletStatusFlowConfEdit;
                    muiAccount.SnowDefaultStatusFlowConf = muiAccount.SnowDefaultStatusFlowConfEdit;
                    muiAccount.SnowCsmStatusFlowConf = muiAccount.SnowCsmStatusFlowConfEdit;
                }
                if(muiAccount.ticketingToolUsed == "service_now" && ticketingDetail.dropletEnabled == true && (ticketingDetail.csmEnabled == false || ticketingDetail.csmEnabled == undefined)){
                    SnowDropletStatusFlowConf["msStatusValues"] = ticketingDetail.msStatusValues;
                    SnowDropletStatusFlowConf["msTicketUpdateRules"] = ticketingDetail.msTicketUpdateRules;
                    muiAccount.SnowDropletStatusFlowConf = SnowDropletStatusFlowConf;
                    muiAccount.IcdDefaultStatusFlowConf = muiAccount.IcdDefaultStatusFlowConfEdit;
                    muiAccount.SnowDefaultStatusFlowConf = muiAccount.SnowDefaultStatusFlowConfEdit;
                    muiAccount.SnowCsmStatusFlowConf = muiAccount.SnowCsmStatusFlowConfEdit;
                }
                if(muiAccount.ticketingToolUsed == "service_now" && (ticketingDetail.dropletEnabled == false || ticketingDetail.dropletEnabled == undefined) && (ticketingDetail.csmEnabled == false || ticketingDetail.csmEnabled == undefined)){
                    SnowDefaultStatusFlowConf["msStatusValues"] = ticketingDetail.msStatusValues;
                    SnowDefaultStatusFlowConf["msTicketUpdateRules"] = ticketingDetail.msTicketUpdateRules;
                    muiAccount.SnowDefaultStatusFlowConf = SnowDefaultStatusFlowConf;
                    muiAccount.IcdDefaultStatusFlowConf = muiAccount.IcdDefaultStatusFlowConfEdit;
                    muiAccount.SnowDropletStatusFlowConf = muiAccount.SnowDropletStatusFlowConfEdit;
                    muiAccount.SnowCsmStatusFlowConf = muiAccount.SnowCsmStatusFlowConfEdit;
                }
                if(muiAccount.ticketingToolUsed == "service_now" && (ticketingDetail.dropletEnabled == false || ticketingDetail.dropletEnabled == undefined) && ticketingDetail.csmEnabled == true){
                    SnowCsmStatusFlowConf["msStatusValues"] = ticketingDetail.msStatusValues;
                    SnowCsmStatusFlowConf["msTicketUpdateRules"] = ticketingDetail.msTicketUpdateRules;
                    muiAccount.SnowCsmStatusFlowConf =SnowCsmStatusFlowConf;
                    muiAccount.IcdDefaultStatusFlowConf = muiAccount.IcdDefaultStatusFlowConfEdit;
                    muiAccount.SnowDropletStatusFlowConf = muiAccount.SnowDropletStatusFlowConfEdit;
                    muiAccount.SnowDefaultStatusFlowConf = muiAccount.SnowDefaultStatusFlowConfEdit;
                }
            }
            //using ansible integration
            muiAccount.ansibleInstance =  (account.ansibleInstance)?account.ansibleInstance:'';
            muiAccount.ansibleInstanceLog =  (account.ansibleInstanceLog)?account.ansibleInstanceLog:'no';
    }

    

    logger.info(
        `Successfully fetched details for the accountCode : ${muiAccount.accountCode}`,
        {
          transactionid: ``,
          class: 'MappingHelper',
          function: 'mapDataFromDb',
        },
      );
    return muiAccount;
}

// For Service Approval
async function postServiceApprovalDataToSlack(dataToSent) {
    logger.info(`Processing data to send to Slack`)
    var validateSlack = {};
    try{
        var channelId, data, email; 
        
                validateSlack["successFlag"] = true;
                email = dataToSent.loggedInUser;
                req = dataToSent.request;
                email = email.split('@')[0];
                req.email = email;
                serviceName = dataToSent.serviceName;
                businessJustification = dataToSent.businessJustification;
                validateSlack["successFlag"] = true;
                validateSlack["validateSlackMsg"] = "Successfully sent details via slack to "+dataToSent.loggedInUser;
                let approvalChannel = 'approvalChannelsTeams';
                if(dataToSent.collabTool === 'slack'){
                    approvalChannel = 'approvalChannels';
                }
                const approvalchannelIds = await msutils.fetchFromStore("settings", {
                   "config_name":approvalChannel});
                const appChanel = approvalchannelIds[0].config_value;
                const approvalchannelId = appChanel.find(
                    appchannel => appchannel.type === 'service',
                  );
                channelId = approvalchannelId.channel;
                const date = new Date().toLocaleDateString();
               // Get the templates for service approval
                const templates = await msutils.getServiceTicketTemplates();
                let messageTemplate;
                templates.forEach(template => {
                    if (dataToSent.collabTool in template) {
                      if(template[dataToSent.collabTool].en){
                      slackTemplate = template[dataToSent.collabTool].en;
                      let type = 'service';
                      if (type in slackTemplate) {
                        messageTemplate = slackTemplate[type].message; // Change incTemplate to Message Template..
                      } 
                    }}
                  });
                  
                  req.justification = req["justification"].replace(/"/g, '\\"');
                let regex = /(?<=\{{)(.*?)(?=\}})/g;
                const arrayVal = JSON.stringify(messageTemplate).match(regex);
                messageTemplate = msutils.template(JSON.stringify(messageTemplate), req); 
                messageTemplate = JSON.parse(messageTemplate);
                transaction_id = "services_"+(Math.floor(Math.random() * 90000) + 10000);
                actionId = serviceName;
                console.log(`messageTemplate---${JSON.stringify(messageTemplate)}`);

                  let messageObj;
                  if(dataToSent.collabTool === 'msteams'){
                    messageObj = {
                        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                        version: '1.5',
                        type: 'AdaptiveCard',
                        body: messageTemplate.blocks,
                      }
                  }else{
                    messageObj = messageTemplate;
                  }
                 data = {
                    "workspaceName": dataToSent.workspaceName,
                    "message": messageObj,
                    "channelid": channelId,
                    "ts": "",
                    "isUpdate": false,      
                }
                const headers = {
                    transactionid:transaction_id
                }
                const reponse = await msutils.postToCollaborator("sendMessage",data,headers);
    }catch(error){
        var errorFetched = error;
        validateSlack["successFlag"] = false;
        logger.error(
            `Error while sending user data to slack :[${error}]`,
            {
            transactionid: ``,
            class: 'MappingHelper',
            function: 'postUserDataToSlack',
            },
        );
    }
    return validateSlack;

}

// For Service Key Approval

async function postServiceKeyApprovalDataToSlack(dataToSent){
    logger.info(`Processing data for postServiceKeyApprovalDataToSlack ` )
    var validateSlack = {};
    try{
        var channelId, data, email;     
                validateSlack["successFlag"] = true;  
                let req = dataToSent.request;
                email = dataToSent.request.issuedBy.split('@')[0];
                req.email = email;
                let scopes = req.scopes;
                //req.scopes = req.scopes.join('\n');
                validateSlack["successFlag"] = true;
                validateSlack["validateSlackMsg"] = "Successfully sent details via slack to "+dataToSent.loggedInUser;
                
                let approvalChannel = 'approvalChannelsTeams';
                if(dataToSent.collabTool === 'slack'){
                    approvalChannel = 'approvalChannels';
                }
                let approvalchannelIds = await msutils.fetchFromStore("settings", {
                   "config_name":approvalChannel});
                let appChanel = approvalchannelIds[0].config_value;
                const approvalchannelId = appChanel.find(
                    appchannel => appchannel.type === dataToSent.request.type,
                  );
                channelId = approvalchannelId.channel;
                
                // approvalchannelIds = await msutils.fetchFromStore("settings", {
                //    "config_name":"approvalChannels"});
                // appChanel = approvalchannelIds[0].config_value;
                // const approvalchannelId = appChanel.find(
                //     appchannel => appchannel.type === dataToSent.request.type,
                //   );
                // channelId = approvalchannelId.channel;
                let workspaceName = approvalchannelId.workspaceName;
                let date = new Date().toLocaleDateString();
               // Get the templates for service approval
                const templates = await msutils.getServiceTicketTemplates();
                let messageTemplate;
                templates.forEach(template => {
                    if (dataToSent.collabTool in template) {
                      if(template[dataToSent.collabTool].en){
                      let slackTemplate = template[dataToSent.collabTool].en;
                      let type = "keyApprovals";
                      let keytype = "type"+req.type;
                      if (type in slackTemplate) {
                        messageTemplate = slackTemplate[type].message[keytype]; // Change incTemplate to Message Template..
                      } 
                    }}
                  });
                let regex = /(?<=\{{)(.*?)(?=\}})/g;
                const arrayVal = JSON.stringify(messageTemplate).match(regex);
                messageTemplate = msutils.template(JSON.stringify(messageTemplate), req);
                messageTemplate = JSON.parse(messageTemplate);
                let transaction_id = "services_"+(Math.floor(Math.random() * 90000) + 10000);
                //console.log(`messageTemplate----${JSON.stringify(messageTemplate)}`);
                let messageObj;
                if(dataToSent.collabTool === 'msteams'){
                    messageObj = {
                        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                        version: '1.5',
                        type: 'AdaptiveCard',
                        body: messageTemplate.blocks,
                        }
                }else{
                    messageObj = messageTemplate;
                }
                data = {
                    "workspaceName": workspaceName,
                    "message": messageObj,
                    "channelid": channelId,
                    "ts": "",
                    "isUpdate": true,      
                }
                const headers = {
                    transactionid:transaction_id
                }
                await msutils.postToCollaborator("sendMessage",data,headers)
                
        
    }catch(error){
        var errorFetched = error;
        validateSlack["successFlag"] = false;
        logger.error(
            `Error while sending user data to slack :[${error}]`,
            {
            transactionid: ``,
            class: 'MappingHelper',
            function: 'postUserDataToSlack',
            },
        );
    }
    return validateSlack;

}

/* Post Skill Request to Team IT channel */
async function postSkillRequestApprovalToSlack(dataToSent) {
    logger.info(`Processing skill request data to send to Slack`);
    var validateSlack = {};
    try{
        var channelId, data, email, skill_set, req = {},approvalchannelIds,appChanel;  
        let requesterSkills = [];
                validateSlack["successFlag"] = true;
                email = dataToSent.requesterEmail;
                email = email.split('@')[0];
                for (const key in dataToSent.skills) {
                    requesterSkills = requesterSkills.concat(dataToSent.skills[key]);
                }
                skill_set = requesterSkills.map(d => `\`${d}\``);

                req = {
                    email : email,
                    createDate : dataToSent.createDate,
                    account : dataToSent.account,
                    alternateEmail : dataToSent.alternateEmail,
                    geo : dataToSent.geo,
                    market : dataToSent.market,
                    startDate : dataToSent.startDate,
                    endDate : dataToSent.endDate,
                    estHours : dataToSent.estHours,
                    supportType : dataToSent.supportType,
                    shortDesc : dataToSent.shortDesc? msutils.jsonEscape(dataToSent.shortDesc):"",
                    description : dataToSent.description? msutils.jsonEscape(dataToSent.description):"",
                    comments : dataToSent.comments? msutils.jsonEscape(dataToSent.comments):"",
                    requestID : dataToSent.requestID,
                    skillSet : skill_set,
                    requestorContactNo:dataToSent.requestorContactNo,
                    technicalContactNo: dataToSent.technicalContactNo,
                };
                validateSlack["successFlag"] = true;
                validateSlack["validateSlackMsg"] = "Successfully sent details via slack to Team IT Approval Channel";
                let teamItConfig = await msutils.fetchSettings("teamITConfigurations");
                let collabTool;
                let approvalChannel = 'approvalChannelsTeams';
                if(teamItConfig.defaultCollabTool.toUpperCase() === 'TEAMS') {
                    collabTool = 'msteams';
                } else {
                    collabTool = 'slack';
                    approvalChannel = 'approvalChannels';
                }
                approvalchannelIds = await msutils.fetchFromStore("settings", {
                   "config_name" : approvalChannel});
                appChanel = approvalchannelIds[0].config_value;
                const approvalchannelId = appChanel.find(
                    appchannel => appchannel.type === 'TeamITApproval',
                  );
                channelId = approvalchannelId.channel;
                const workspace_name = approvalchannelId.workspaceName;
                date = new Date().toLocaleDateString();
               // Get the templates for service approval
                const templates = await msutils.getServiceTicketTemplates();
                let toolTemplate, messageTemplate;
                templates.forEach(template => {
                    if (collabTool in template) {
                      if(template[collabTool].en){
                      toolTemplate = template[collabTool].en;
                      let type = 'TeamITSkillRequest';
                      if (type in toolTemplate) {
                        messageTemplate = toolTemplate[type].message;
                      } 
                    }}
                  });
                messageTemplate = msutils.template(JSON.stringify(messageTemplate), req);
                const messageToPost = JSON.parse(messageTemplate);
                messageTemplate = JSON.parse(messageTemplate);
                const transaction_id = "TeamIT_"+(Math.floor(Math.random() * 90000) + 10000);
                const message = {
                    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                    version: '1.5',
                    type: 'AdaptiveCard',
                    body: messageToPost.blocks,
                    actions: messageToPost.actions
                  };
                                
                data = {
                    "workspaceName": workspace_name,
                    "message": message,
                    "channelid": channelId,
                    "ts": "",
                    "isUpdate": false,      
                }
                const headers = {
                    transactionid:transaction_id
                }
                const reponse = await msutils.postToCollaborator("sendMessage",data,headers);
                /** start metrics completed **/
                 msutils.metricsQueueJobByJobType('updateMetricsFacts', {
                    accountCode: 'default',
                    api: 'saveTeamITRequester',
                    sourceSystem: 'default',
                    microservice: 'internal',
                    subFunction: 'default',
                    service: 'default',
                    command: 'default',
                    stage: 'completed',
                });
                /** end metrics completed **/
    }catch(error){
        var errorFetched = error;
        validateSlack["successFlag"] = false;
        logger.error(
            `Error while sending user data to slack :[${JSON.stringify(error)}]`,
            {
            transactionid: ``,
            class: 'MappingHelper',
            function: 'postUserDataToSlack',
            },
        );
        
        /** start metrics error **/
        msutils.metricsQueueJobByJobType('updateMetricsFacts', {
            accountCode: 'default',
            api: 'saveTeamITRequester',
            sourceSystem: 'default',
            microservice: 'internal',
            subFunction: 'default',
            service: 'default',
            command: 'default',
            stage: 'error',
        });
        /** end metrics error **/
    }
    return validateSlack;
}

const postAssignedVolunteerToSlack = async (resourceData, requestData) =>{
    let validateSlack = {};
    try{
        logger.info("Posting to slack as a thread on volunteer assignment")
        const teamItConfig = await msutils.fetchSettings('teamITConfigurations');
        let approvalChannel = 'approvalChannelsTeams';
        if(teamItConfig.defaultCollabTool.toUpperCase() !== 'TEAMS') {
            approvalChannel = 'approvalChannels';
        }
        const approvalchannelIds = await msutils.fetchFromStore('settings', {
            config_name: approvalChannel,
          });
        const appChanel = approvalchannelIds[0].config_value;
        const approvalchannelId = appChanel.find(
            appchannel => appchannel.type === 'TeamITApproval',
        );
        const workspace_name = approvalchannelId.workspaceName;
        const adminTS = requestData.adminTS;
        const adminChannel = approvalchannelId.channel;
        const requesterTS = requestData.requesterTS;
        const requesterChannel = requestData.requesterChannel;
        const volunteerEmail = resourceData.volunteerEmail;
        const assignedBy = resourceData.assignedBy;
    
         
        const transaction_id = "TeamIT_"+(Math.floor(Math.random() * 90000) + 10000);
        let message;
        if(teamItConfig.defaultCollabTool.toUpperCase() === 'TEAMS'){
          message = {
            blocks: [
              {
                type: 'TextBlock',
                wrap: true,
                text: `${assignedBy} assigned ${volunteerEmail} as volunteer`,
              },
            ],
          }
        } else {
            message = {
                blocks: [
                  {
                    type: 'section',
                    text: {
                    type: 'mrkdwn',
                    text: `:green-check-mark: @${assignedBy} assigned ${volunteerEmail} as volunteer`,
                    },
                  },
                ],
            }
        }
                        
        let data = {
            "workspaceName": workspace_name,
            "message": message,
            "channelid": adminChannel,
            "ts": adminTS,
            "isUpdate": false,      
        }
        const headers = {
            transactionid:transaction_id
        }

        await msutils.postToCollaborator("sendMessage",data,headers);

        if (requesterTS && requesterChannel) {
            if(teamItConfig.defaultCollabTool.toUpperCase() === 'TEAMS'){
                message={
                    blocks: [
                    {
                        type: 'TextBlock',
                        wrap: true,
                        text: `${volunteerEmail} is assigned as volunteer to the request`,
                    },
                ],
            }
        } else {
            message={
                blocks: [
                    {
                        type: 'section',
                        text: {
                        type: 'mrkdwn',
                        text: `:green-check-mark: ${volunteerEmail} is assigned as volunteer to the request`,
                        },
                    },
                    ],
                }
        }
                            
            data = {
                "workspaceName": workspace_name,
                "message": message,
                "channelid": requesterChannel,
                "ts": requesterTS,
                "isUpdate": false,      
            }
            
            await msutils.postToCollaborator("sendMessage",data,headers);
         }
         
         validateSlack["successFlag"] = true;
    }catch(error)
    {
        validateSlack["successFlag"] = false;
        logger.error(
            `Error while sending user data to slack :[${error}]`,
            {
            transactionid: ``,
            class: 'MappingHelper',
            function: 'postUserDataToSlack',
            },
        );
    }
}

exports.mappingAccountDetails = mappingAccountDetails;
exports.mapDataFromDb = mapDataFromDb;
exports.mapToWorkspace = mapToWorkspace;
exports.mapAccountCode = mapAccountCode;
exports.getSettingsMap = getSettingsMap;
exports.setConfigValues = setConfigValues;
exports.mapToDynamicWorkflow = mapToDynamicWorkflow;
exports.postToSettingsIndexChannel = postToSettingsIndexChannel;
exports.postToGlobalAssignment = postToGlobalAssignment;
exports.postToFeature = postToFeature;
exports.postServiceApprovalDataToSlack = postServiceApprovalDataToSlack;
exports.postServiceKeyApprovalDataToSlack= postServiceKeyApprovalDataToSlack
exports.postToTeamITRequest= postToTeamITRequest
exports.postSkillRequestApprovalToSlack = postSkillRequestApprovalToSlack
exports.postToTeamITVolunteer= postToTeamITVolunteer
exports.MS_TEAMS_BOTS_CONFIG_NAME= MS_TEAMS_BOTS_CONFIG_NAME;