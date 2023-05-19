var msutils = require('msutils');
var logger = require('winston');
var axios = require("axios");
var parseString = require('xml2js').parseString;
var https = require('https');
const jwt = require("jsonwebtoken");

 function saveWorkspaceData(url, data) {
  return new Promise((resolve, reject) => { 
    try {
      const axiosConfig = {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'transactionid': `tn-${Math.random().toString(36).replace(/[^a-z]+/g, '')}`
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      };

       axios
        .post(url, data, axiosConfig)
        .then(response => {
          if (response.data) {
            resolve(response.data);
          }
        })
        .catch(err => {
          reject(err);
          logger.error('request failed with error:', err);
        });
    } catch (e) {
      reject(e);
      logger.error(`request failed with error : ${e}`);
    }

  });
}

function getWorkspaceData(url) {
  return new Promise((resolve, reject) => {   
    try {
      const axiosConfig = {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'transactionid': `tn-${Math.random().toString(36).replace(/[^a-z]+/g, '')}`
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      };

       axios
        .get(url, axiosConfig)
        .then(response => {
          if (response.data) {
            resolve(response.data);
          }
        })
        .catch(err => {
          reject(err);
          logger.error('request failed with error:', err);
        });
    } catch (e) {
      reject(e);
      logger.error(`request failed with error : ${e}`);
    }

  });
}

exports.saveWorkspaceData =  saveWorkspaceData;
exports.getWorkspaceData =  getWorkspaceData;