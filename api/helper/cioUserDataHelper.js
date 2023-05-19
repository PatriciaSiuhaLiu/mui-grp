var msutils = require('msutils');
var logger = require('winston');
var axios = require("axios");
var parseString = require('xml2js').parseString;
var https = require('https');
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');

async function sendKSATMessage(message) {  
  let url = await msutils.getMsUrl('chatopsCollab');
  url += '/sendMessage'
  const method = "POST"
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    "transactionid": uuidv4()
  };
  const restRequest = new msutils.DynamicRestCall(url, message, method, headers);
  const restResponse = await restRequest.call();
  return restResponse;
}

async function formKSATMessage(contact, description) {  
  return {
    // issue is here GR         
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Request raised for help on Major Incident or Client Escalations, please find the details below`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Contact:* ${contact}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Description:* ${description}`,
        },
      },
    ],
  };  
}

async function getUsersemailFromChannel(channelId,CIOUserData){
  // TODO: get channel members based on channelID passed.
  // Blocker: /getConversationMembers api takes accountCode as params which we don't in case of cio reporting..
  // find a workaround for above issue.
    const drSettings = await msutils.fetchSettings('cioDailyReporting');    
    var token;
    var memberEmails = [];
    if(drSettings.collabPlatform.toUpperCase() === 'TEAMS'){
      const workSpace = CIOUserData.workspaceName;
      const teamId = CIOUserData.teamId;
      const token = await msutils.getTeamsTokens(workSpace);
      memberEmails = await msutils.getChannelMemberList(teamId,channelId,token,true);
    }else{
      const workSpace = drSettings.defaultWorkspace;
      const workSpaceObj = await msutils.getWorkspaceByName(workSpace);
      if(workSpaceObj){
          token = workSpaceObj.bot.tokens.xoxb;
          const channelMembers = await msutils.getConversationsMembers(token, channelId, true);
          for(user of channelMembers){
              const email = await msutils.fetchbyUserId(user,token, true);
              memberEmails.push(email);
          }
      }else{
          token = ""
          memberEmails = [];
      }
    }
    
    return memberEmails
    
}

exports.formKSATMessage = formKSATMessage;
exports.sendKSATMessage = sendKSATMessage;
exports.getUsersemailFromChannel = getUsersemailFromChannel;