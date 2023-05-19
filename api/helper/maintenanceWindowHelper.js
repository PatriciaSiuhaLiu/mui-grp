let msutils = require("msutils");
let logger = require("winston");

/**
 * @function saveCertFile
 * @description Saves .p12 file in after base64 encoding contents
 * @param {file, passphrase, accountCode} params
 * @returns {boolean}
 */
module.exports.saveCertFile = async (params) => {
  try {
    let { file, passphrase, accountCode } = params;
    let fileName = file.originalname;

    const accountCertData = await msutils.fetchFromStore("CertFiles", {
      accountCode: accountCode,
    });

    const be64 = file.buffer.toString("base64");

    if (accountCertData && accountCertData.length > 0) {
      let { _id } = accountCertData[0];

      await msutils.updateInStore("CertFiles", _id, {
        data: be64,
        fileName: fileName,
        passphrase: passphrase,
        accountCode: accountCode,
      });
      return true;
    } else {
      await msutils.saveInStore("CertFiles", {
        data: be64,
        fileName: fileName,
        passphrase: passphrase,
        accountCode: accountCode,
      });
      return true;
    }
  } catch (error) {
    logger.error(
      `maintenanceWindowHelper:: saveCertFile: Error while saving cert file:  ${error}`
    );
    throw new Error("Failed to save file");
  }
};

/**
 * @function mapChannelDocs
 * @description Update/insert a channel id and accound code mapping
 * @param {*} channelId
 * @param {*} accountCode
 * @returns {boolean}
 */
module.exports.mapChannelDocs = async (channelId, accountCode) => {
  try {
    let response;
    const mappedData = await msutils.fetchFromStore("ChannelDocs", {
      linkedTo: accountCode,
    });

    let channelDocData = {
      channelId: channelId,
      linkedTo: accountCode,
    };

    if (mappedData && mappedData.length > 0) {
      let { _id } = mappedData[0];
      response = await msutils.updateInStore(
        "ChannelDocs",
        _id,
        channelDocData
      );
    } else {
      response = await msutils.saveInStore("ChannelDocs", channelDocData);
    }
    return true;
  } catch (error) {
    logger.error(`maintenanceWindowHelper:: mapChannelDocs: Error:  ${error}`);
    throw new Error(error.message);
  }
};

/**
 * @function fetchMaintenanceWindowData
 * @description Fetch maintenance window data for an account
 * @param {*} accountCode
 * @returns {object} maintenance window data
 */
module.exports.fetchMaintenanceWindowData = async (accountCode) => {
  try {
    let response = false;
    let channeDocs = await msutils.fetchFromStore("ChannelDocs", {
      linkedTo: accountCode,
    });

    if (channeDocs && channeDocs.length > 0) {
      channeDocs = channeDocs[0];

      let { channelId } = channeDocs;

      response = {
        ...response,
        channelId: channelId,
        accountCode: accountCode,
      };

      let accountConfig = await msutils.fetchFromStore("Accounts", {
        accountCode: accountCode,
      });

      console.log("accountConfig: ", accountConfig.length);

      if (accountConfig && accountConfig.length > 0) {
        accountConfig = accountConfig[0];

        let { collaborationTool, workspaceName, collabConfig } = accountConfig;

        if (collaborationTool.toLowerCase() === "slack") {
          response = {
            ...response,
            collaborationTool: collaborationTool.toLowerCase(),
            workspace: workspaceName,
          };
        }

        if (collaborationTool.toLowerCase() === "teams") {
          let {
            teams: { workspaceName },
          } = collabConfig;
          response = {
            ...response,
            collaborationTool: collaborationTool.toLowerCase(),
            workspace: workspaceName,
          };
        }

        if (accountConfig.gsmaConfig) {
          let certDetails = await msutils.fetchFromStore("CertFiles", {
            accountCode: accountCode,
          });

          if (certDetails && certDetails.length > 0) {
            certDetails = certDetails[0];

            let { fileName, passphrase } = certDetails;

            response = {
              ...response,
              authType: "cert",
              certFile: true,
              certFilePassphrase: passphrase,
              certFileName: fileName,
            };
          }

          let {
            instanceType,
            maintenanceBaseUrl,
            enableHandlerEvent,
            maintenanceWindowAlert: enableMaintenanceWindow,
            ticketHandlerAuthId,
          } = accountConfig.gsmaConfig;

          if (ticketHandlerAuthId) {
            let ticketHandlerAuthData = await msutils.fetchFromStoreById(
              "TicketHandlerAuth",
              ticketHandlerAuthId
            );

            if (ticketHandlerAuthData) {
              let {
                url: handlerBaseUrl,
                userName: handlerAuthUserName,
                password: handlerAuthPassword,
                pemFileName,
              } = ticketHandlerAuthData;

              response = {
                ...response,
                handlerBaseUrl,
                handlerAuthUserName,
                handlerAuthPassword,
                pemFileName,
              };
            }
          }

          response = {
            ...response,
            instanceType,
            maintenanceBaseUrl,
            enableHandlerEvent,
            enableMaintenanceWindow,
          };
        }
      } else {
        response = false;
      }
    }
    return response;
  } catch (error) {
    logger.error(
      `maintenanceWindowHelper:: fetchMaintenanceWindowData: Error:  ${error}`
    );
    throw new Error("Failed to fetch data");
  }
};

/**
 * @function fetchSingleDocument
 * @description Generic function to return document from collection
 * @param {string} collection
 * @param {object} query
 * @returns {object} mongodb document
 */
module.exports.fetchSingleDocument = async (collection, query) => {
  try {
    let document = await msutils.fetchFromStore(collection, query);

    if (document && document.length > 0) {
      document = document[0];
      return document;
    } else {
      throw new Error(`No document found in ${collection}`);
    }
  } catch (error) {
    logger.error(
      `maintenanceWindowHelper:: fetchSingleDocument: Error:  ${error}`
    );
    throw new Error(`Failed to fetch document from ${collection}`);
  }
};

/**
 * @function fetchButtonActions
 * @description Returns documents from ButtonActions collection based on
 * account code & channel id regex
 * @param {*} accountCode
 * @param {*} channelId
 * @returns {object[]} buttonActions array
 */
module.exports.fetchButtonActions = async (accountCode, channelId) => {
  try {
    let buttonActions = await msutils.fetchFromStore(
      "ButtonActions",
      {
        action: { $regex: `${accountCode}-${channelId}`, $options: "i" },
      },
      { _id: -1 }
    );
    return buttonActions;
  } catch (error) {
    logger.error(
      `maintenanceWindowHelper:: fetchButtonActions: Error:  ${error}`
    );
    throw new Error(`Failed to fetch buttons from ButtonActions`);
  }
};

/**
 * @function deleteButtonActions
 * @description Delete button action document from ButtonActions collection for edit operation mode
 * @param {*} accountCode
 * @param {*} channelId
 * @returns {boolean}
 */
module.exports.deleteButtonActions = async (accountCode, channelId) => {
  try {
    let buttonActions = await this.fetchButtonActions(accountCode, channelId);

    buttonActions.forEach(async (val) => {
      let { _id } = val;
      logger.info(`Deleting id: ${_id}`);
      let resp = await msutils.deleteDataInStore("ButtonActions", _id);
      console.log("resp: ", resp);
    });
    return true;
  } catch (error) {
    logger.error(
      `maintenanceWindowHelper:: deleteButtonActions: Error:  ${error}`
    );
    throw new Error(`Failed to delete buttons from ButtonActions`);
  }
};

/**
 * @description Updates GSMA configs in Accounts and MUIAccounts collection
 * @param {*} data
 * @returns {boolean}
 */
module.exports.updateAccountDetails = async (data) => {
  try {
    let { tabIndex, accountCode } = data;

    let accountData = await msutils.fetchFromStore("Accounts", {
      accountCode: accountCode,
    });
    accountData = accountData[0];

    let muiAccountData = await msutils.fetchFromStore("MUIAccounts", {
      accountCode: accountCode,
    });
    muiAccountData = muiAccountData[0];

    if (tabIndex === "0") {
      let { maintenanceWindowAlert, instanceType, maintenanceBaseUrl } = data;

      let gsmaConfigData = {
        ...accountData.gsmaConfig,
        maintenanceWindowAlert: maintenanceWindowAlert,
        instanceType: instanceType,
        maintenanceBaseUrl: maintenanceBaseUrl,
      };

      if (accountData) {
        let id = accountData._id;
        accountData["gsmaConfig"] = gsmaConfigData;
        delete accountData._id;
        await msutils.updateInStore("Accounts", id, accountData);
      }

      if (muiAccountData) {
        let id = muiAccountData._id;
        muiAccountData["gsmaConfig"] = gsmaConfigData;
        delete muiAccountData._id;
        await msutils.updateInStore("MUIAccounts", id, muiAccountData);
      }
    }

    if (tabIndex === "1") {
      let { enableHandlerEvent, ticketHandlerAuthId } = data;

      let gsmaConfigData = {
        ...accountData.gsmaConfig,
        enableHandlerEvent: enableHandlerEvent,
        ticketHandlerAuthId: ticketHandlerAuthId,
      };

      console.log("gsmaConfigData: ", gsmaConfigData);

      if (accountData) {
        let id = accountData._id;
        accountData["gsmaConfig"] = gsmaConfigData;
        delete accountData._id;
        await msutils.updateInStore("Accounts", id, accountData);
      }

      if (muiAccountData) {
        let id = muiAccountData._id;
        muiAccountData["gsmaConfig"] = gsmaConfigData;
        delete muiAccountData._id;
        await msutils.updateInStore("MUIAccounts", id, muiAccountData);
      }
    }

    return true;
  } catch (error) {
    logger.error(
      `maintenanceWindowHelper:: updateAccountDetails: Error:  ${error}`
    );
    throw new Error(`Failed to update account details`);
  }
};

/**
 * @function getChannelId
 * @description Get channel mapped to account
 * @param {*} accountCode
 * @returns {string} channelId
 */
module.exports.getChannelId = async (accountCode) => {
  try {
    let channelId = "";
    const mappedData = await msutils.fetchFromStore("ChannelDocs", {
      linkedTo: accountCode,
    });

    if (mappedData && mappedData.length > 0) {
      let data = mappedData[0];
      channelId = data.channelId;
    }
    return channelId;
  } catch (error) {
    logger.error(`maintenanceWindowHelper:: mapChannelDocs: Error:  ${error}`);
    throw new Error(error.message);
  }
};

/**
 * @function saveTicketHandlerAuth
 * @description Upserts data in TicketHandlerAuth collection
 * @param {url, userName, password, pemFile} data
 * @returns {string} document id
 */
module.exports.saveTicketHandlerAuth = async (data) => {
  try {
    let { url, userName, password, pemFile } = data;
    let payload = {};
    let mode = "save";
    let id = "";

    let handlerAuthData = await msutils.fetchFromStore("TicketHandlerAuth", {
      url: url,
    });

    if (handlerAuthData && handlerAuthData.length > 0) {
      handlerAuthData = handlerAuthData[0];
      id = handlerAuthData._id;
      mode = "update";
    }

    if (pemFile) {
      const be64 = pemFile.buffer.toString("base64");
      let fileName = pemFile.originalname;

      payload = {
        url: url,
        userName: userName,
        password: password,
        pemFile: be64,
        pemFileName: fileName,
      };
    } else {
      payload = {
        url: url,
        userName: userName,
        password: password,
        pemFile: handlerAuthData.pemFile,
        pemFileName: handlerAuthData.pemFileName,
      };
    }

    if (mode === "update") {
      await msutils.updateInStore("TicketHandlerAuth", id, payload);
    } else {
      await msutils.saveInStore("TicketHandlerAuth", payload);

      let doc = await this.fetchSingleDocument("TicketHandlerAuth", {
        url: url,
      });
      id = doc._id;
    }

    return id;
  } catch (error) {
    console.log(error);
    logger.error(
      `maintenanceWindowHelper:: saveTicketHandlerAuth: Error:  ${error}`
    );
    throw new Error(error.message);
  }
};

/**
 * @function fetchTicketHandlerAuthData
 * @description Fetch Ticket Handler Auth Details
 * @param {string} url
 * @returns {string, string, string} handlerAuthUserName, handlerAuthPassword, pemFileName
 */
module.exports.fetchTicketHandlerAuthData = async (url) => {
  try {
    let response = false;

    let ticketHandlerData = await msutils.fetchFromStore("TicketHandlerAuth", {
      url: url,
    });

    if (ticketHandlerData && ticketHandlerData.length > 0) {
      ticketHandlerData = ticketHandlerData[0];
      let {
        userName: handlerAuthUserName,
        password: handlerAuthPassword,
        pemFileName,
      } = ticketHandlerData;

      response = {
        ...response,
        handlerAuthUserName,
        handlerAuthPassword,
        pemFileName,
      };
      return response;
    }
    return response;
  } catch (error) {
    logger.error(
      `maintenanceWindowHelper:: fetchTicketHandlerAuthData: Error:  ${error}`
    );
    throw new Error(error.message);
  }
};
