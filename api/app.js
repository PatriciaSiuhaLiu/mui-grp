const express = require("express");
const { constants } = require("crypto");
var favicon = require("serve-favicon");
var https = require("https");
var fs = require("fs");

var axios = require("axios");
const path = require("path");
const Queue = require("bull");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var bodyParser = require("body-parser");
var msutils = require("msutils");
var xss = require("xss-clean");
var logger = require("winston");
var moment = require("moment");
const { getPassport } = require("./helper/authenticationHelper");
const { isValidConnection } = require("./helper/toolConnectionHelper");
const {
  mappingAccountDetails,
  mapDataFromDb,
  mapAccountCode,
  mapToWorkspace,
  mapToDynamicWorkflow,
  postToSettingsIndexChannel,
  postToGlobalAssignment,
  postToFeature,
  postServiceApprovalDataToSlack,
  postServiceKeyApprovalDataToSlack,
  postToTeamITRequest,
  postSkillRequestApprovalToSlack,
  postToTeamITVolunteer,
  MS_TEAMS_BOTS_CONFIG_NAME,
} = require("./helper/mappingHelper");
const checkSpecChar = require("./helper/security-middleware");
const {
  isGroupValid,
  createGroup,
  addGroupMembers,
  isValidEmail,
  getFreshAccountAccessDetail,
  getUserAccessDetail,
} = require("./helper/groupUtil");
const {
  saveWorkspaceData,
  getWorkspaceData,
} = require("./helper/workspaceTransitionHelper");
const {
  sendKSATMessage,
  formKSATMessage,
  getUsersemailFromChannel,
} = require("./helper/cioUserDataHelper");
var MemoryStore = require("memorystore")(session);
const Joi = require("joi");
const { any } = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { v4: uuidv4 } = require("uuid");
const baseUrl = "/mui/";
const itTeamBaseUrl = "/mui/teamit/";
const app = express();
const querystring = require("querystring");
const port = 5678;

const {
  getJSONFromExcel,
  processExcelData,
  validateExcelFile,
} = require("./helper/excelToJsonHelper");

var ansibleRouter = require("./routes/ansibleInstance");
const serviceManagerRouter = require("./routes/serviceManagerRoute");
const groupRouter = require("./routes/groupRoute");
const { log } = require("console");
const { ErrorBoundary } = require("carbon-components-react");
const {
  saveCertFile,
  mapChannelDocs,
  fetchMaintenanceWindowData,
  fetchSingleDocument,
  deleteButtonActions,
  updateAccountDetails,
  saveTicketHandlerAuth,
  getChannelId,
  fetchTicketHandlerAuthData,
} = require("./helper/maintenanceWindowHelper");
const multer = require("multer");
const { response } = require("express");
const { fetchByTeamsEmailId } = require("./helper/validationHelper");
const fileStorage = multer.memoryStorage();
const maxFileSize = 1024 * 1024 * 5; //5mb
const upload = multer({ storage: fileStorage });

//const upload = multer({ storage: fileStorage, limits: { fileSize: maxFileSize } });

app.use(express.json());
app.use(xss());
app.use(checkSpecChar());
app.disable("x-powered-by"); //AppScan Recommendation

app.use(cookieParser());
app.use(
  session({
    proxy: true,
    secret: "keyboard cat",
    resave: true,
    store: new MemoryStore(),
    saveUninitialized: true,
    secure: true,
    cookie: {
      sameSite: "none",
    },
  })
);

// Add headers

app.use(baseUrl, function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);
  // Pass to next layer of middleware
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

app.use(itTeamBaseUrl, function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);
  // Pass to next layer of middleware
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

var releaseNumber = process.env.RELEASE_NUMBER;
var nameSpace = process.env.NAMESPACE;
// If there is no release number
if (releaseNumber == "") {
  releaseNumber = "No Version";
}

// If there is no NAMESPACE
if (nameSpace == "") {
  nameSpace = "No Namespace";
}
var arrQueueus = [];
var qNames = process.env.chatops_queues.split(",");

// const queue = "ItsmSnowUpdTicketQueue,CKCreateIncQueue,CKUpdateIncQueue,CollabSlackQueue";
// var qNames = queue.split(',');
qNames.forEach(function addQueue(queueName) {
  arrQueueus.push(
    Queue(queueName, {
      redis: {
        port: process.env.chatops_port,
        host: process.env.chatops_redis,
      },
    })
  );
});

//initialize passport
var passport = getPassport(app);
function ensureAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    logger.info("User is not authenticated.");
    req.session.originalUrl = req.originalUrl;
    res.redirect(baseUrl + "login");
  } else {
    logger.info("User redirected to home page after successful login.");
    if (req.session.workspaceadminUrl) {
      // to be removed once workspace cleanup is being done.
      res.redirect("/mui" + req.session.workspaceadminUrl);
    } else {
      res.redirect(baseUrl + "home");
    }
  }
}
function authenticateUrl(req, res, next) {
  if (!req.isAuthenticated()) {
    logger.info("User is not authenticated to access IS Together");
    req.session.originalUrl = req.originalUrl;
    res.redirect(`${baseUrl}login`);
  } else {
    let reqId = req.query.id;
    if (reqId) {
      res.redirect(`/mui/teamit/requester?id=${req.query.id}`);
    } else {
      res.redirect(`/mui/teamit/requester`);
    }
  }
}
function authenticateUrlVolunteer(req, res, next) {
  if (!req.isAuthenticated()) {
    logger.info("User is not authenticated to access IS Together");
    req.session.originalUrl = req.originalUrl;
    res.redirect(`${baseUrl}login`);
  } else {
    let reqId = req.query.id;
    if (reqId) {
      res.redirect(`/mui/teamit/volunteer?id=${req.query.id}`);
    } else {
      res.redirect(`/mui/teamit/volunteer`);
    }
  }
}
function authenticateTeamitAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    logger.info("User is not authenticated to access IS Together");
    req.session.originalUrl = req.originalUrl;
    res.redirect(`${baseUrl}login`);
  } else {
    // let reqId = req.query.id;
    // if(reqId){
    //     res.redirect(`/mui/teamit/volunteer?id=${req.query.id}`);
    // }else{
    res.redirect(`/mui/teamit/admin`);
    // }
  }
}
function authenticateRBAC(req, res, next) {
  if (!req.isAuthenticated()) {
    // logger.info("User is not authenticated.")
    logger.info("not isAuthenticated");
    req.session.originalUrl = req.originalUrl;
    res.redirect(`${baseUrl}login`);
  } else {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  }
}

// Starts here for workspace transition.

function authenticateWorkspaceAdmins(req, res, next) {
  logger.info("authenticateWorkspaceAdmins");
  if (!req.isAuthenticated()) {
    // logger.info("User is not authenticated.")
    logger.info("not isAuthenticated");
    req.session.originalUrl = req.originalUrl;
    res.redirect("/mui/login");
  } else {
    // return next();
    logger.info("not isAuthenticated else");
    res.redirect(`/mui/workspace-exception?id=${req.params.id}`);
  }
}
//Workspace Admin Questionnaire

app.get("/register/questionnaire/:id", authenticateWorkspaceAdmins);

function authenticateWorkspaceException(req, res, next) {
  if (!req.isAuthenticated()) {
    // logger.info("User is not authenticated.")
    req.session.originalUrl = req.originalUrl;
    res.redirect(`${baseUrl}login`);
  } else {
    let workspaceId = req.query.id;
    if (workspaceId) {
      res.redirect(`/mui/workspace-exception-registration?id=${req.query.id}`);
    } else {
      res.redirect(`/mui/workspace-exception-registration`);
    }
  }
}

function authenticateDailyReporting(req, res, next) {
  if (!req.isAuthenticated()) {
    logger.info("User is not authenticated to access Daily reporting service.");
    req.session.originalUrl = req.originalUrl;
    res.redirect(`${baseUrl}login`);
  } else {
    let workspaceId = req.query.id;
    if (workspaceId) {
      res.redirect(`/mui/dailyReporting?id=${req.query.id}`);
    } else {
      res.redirect(`/mui/daily-reporting`);
    }
  }
}

function authenticateRegisterService(req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.serviceauthenticate = false;
    logger.info("User is not authenticated to access register-service");
    req.session.originalUrl = req.originalUrl;
    res.redirect("/mui/login");
  } else {
    req.session.serviceauthenticate = true;
    res.redirect(`/mui/services`);
  }
}
function authenticateChatopsGroups(req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.serviceauthenticate = false;
    logger.info("User is not authenticated to access Chatops Groups");
    req.session.originalUrl = req.originalUrl;
    res.redirect("/mui/login");
  } else {
    req.session.serviceauthenticate = true;
    res.redirect(`/mui/groups`);
  }
}
app.use("/servicemanager", serviceManagerRouter);
app.use("/group", groupRouter);

app.get("/workspace-exception", authenticateWorkspaceException);
app.get("/daily-reporting", authenticateDailyReporting);
app.get("/register-service", authenticateRegisterService);
app.get("/teamit/requesterIt", authenticateUrl);
app.get("/teamit/requesterIt", authenticateUrl);
app.get("/teamit/volunteerIt", authenticateUrlVolunteer);
app.get("/chatops-groups", authenticateChatopsGroups);
// app.get('/service-manager', authenticateServiceManager);
app.get("/teamit/adminIt", authenticateTeamitAdmin);

// ping api to check health
app.get("/ping", async function (req, res) {
  res.status(200).send("getting ping...");
});

app.get("/paFeatures", async function (req, res) {
  logger.info(`Loading features page for Program Admin`);
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/teamit/requester", async function (req, res) {
  logger.info(`Loading IS Together Requester page`);
  if (req.user) {
    if (req.query.id) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    }
  } else {
    logger.error("redirecting to login page");
    if (req.query.id) {
      res.redirect(itTeamBaseUrl + "requesterIt?id=" + req.query.id);
    } else {
      res.redirect(itTeamBaseUrl + "requesterIt");
    }
  }
});
app.get("/teamit/volunteer", async function (req, res) {
  logger.info(`Loading IS Together Volunteer page`);
  if (req.user) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  } else {
    logger.error("redirecting to login page");
    res.redirect(itTeamBaseUrl + "volunteerIt");
  }
});
app.get("/reqData", async function (req, res) {
  logger.info(`Loading IS Together Requester Update form page`);
  if (req.user) {
    var url = req.headers.referer;
    var reqid;
    if (url.includes("=")) {
      reqid = url.split("=").pop();
    } else {
      reqid = "";
    }
    var reqUpdate;
    var dataToUI;
    var reqData;
    if (reqid) {
      reqData = await msutils.fetchFromStore("TeamITRequest", {
        requestID: reqid,
      });
      var skillSet = await msutils.fetchFromStore("TeamITRequestSkill", {
        requestID: reqid,
      });
      dataToUI = reqData[0];
      dataToUI["skills"] = skillSet[0].skills;
      reqUpdate = true;
    } else {
      dataToUI = [];
      reqUpdate = false;
    }
    res
      .status(200)
      .send({ reqid: reqid, dataToUI: dataToUI, reqUpdate: reqUpdate });
  } else {
    logger.error("redirecting to login page");
    res.redirect(itTeamBaseUrl + "volunteerIt");
  }
});
app.get("/teamit/admin", async function (req, res) {
  logger.info(`Loading IS Together Admin page`);
  if (req.user) {
    await getUserAccessDetail(req);
    if (req.session.teamitAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      res.redirect("/mui/notAuthorized");
    }
  } else {
    logger.error("redirecting to login page");
    res.redirect(itTeamBaseUrl + "adminIt");
  }
});

app.get("/ibm2kyndryl", async function (req, res) {
  logger.info(`Loading IBMToKyndryl home page`);
  // if(req.session.authenticate == undefined){
  res.redirect("/mui/IBMToKyndryl");

  // }else{
  // res.sendFile(path.join(__dirname, "build", "index.html"));
  // }
});
app.get("/IBMToKyndryl", async function (req, res) {
  logger.info(`Loading IBMToKyndryl home page`);
  // if(req.session.authenticate == undefined){
  //     res.redirect("/mui/ibm2kyndryl");

  // }else{
  res.sendFile(path.join(__dirname, "build", "index.html"));
  // }
});
app.get("/workspace-exception-registration", async function (req, res) {
  try {
    req.session.workspaceadminUrl = req.originalUrl;
    if (req.user) {
      let keyId = req.query.id;
      if (keyId) {
        let query = querystring.encode({ id: keyId });
        query = encodeURIComponent(query);
        let url = await msutils.getMsUrl("chatopsWorkspaceTransition");
        url = url + "/getWorkspaces" + `?queryString=${query}`;
        let response = await getWorkspaceData(url);
        response = response[0];
        if (req.user.id.toLowerCase() === response.email.toLowerCase()) {
          res.sendFile(path.join(__dirname, "build", "index.html"));
        } else {
          logger.error(
            "Invalid user trying to access form, going to redirect to home."
          );
        }
      } else {
        res.sendFile(path.join(__dirname, "build", "index.html"));
      }
    } else {
      logger.error("redirecting to login page");
      res.redirect(baseUrl);
    }
  } catch (err) {
    console.log(err);
    console.log(err.message);
  }
});

app.get("/dailyReporting", async function (req, res) {
  try {
    req.session.workspaceadminUrl = req.originalUrl;
    if (req.user) {
      let keyId = req.query.id;
      if (keyId) {
        let CIOCountryStatus = await msutils.fetchFromStore(
          "CIOCountryStatus",
          { id: keyId }
        );
        let CIOUserData = await msutils.fetchFromStore("CIOUserData", {
          primary: CIOCountryStatus[0].primary,
        });
        let allowedEmails = [];
        if (CIOUserData.length > 0) {
          if (CIOCountryStatus[0].isChannel === true) {
            const usersEmails = await getUsersemailFromChannel(
              CIOCountryStatus[0].primary,
              CIOUserData[0]
            ); // primary column to have channelid saved. functiona should return array of email ids of users present in channel.
            if (usersEmails.length == 0) {
              throw new Error("Something went wrong while processing.");
            } else {
              allowedEmails = allowedEmails.concat(usersEmails); // TODO: hit collab api and get users emails from channel id which is saved in primary column.
            }
          } else {
            allowedEmails.push(CIOUserData[0].primary.toLowerCase());
            allowedEmails.push(CIOUserData[0].secondary.toLowerCase());
            allowedEmails.push(CIOUserData[0].global.toLowerCase());
          }
        } else {
          allowedEmails.push(CIOCountryStatus[0].primary.toLowerCase());
        }
        if (allowedEmails.includes(req.user.id.toLowerCase())) {
          res.sendFile(path.join(__dirname, "build", "index.html"));
        } else {
          res.sendFile(path.join(__dirname, "build", "index.html"));
          logger.error(
            "Invalid user trying to access form, going to redirect to home."
          );
        }
      } else {
        res.sendFile(path.join(__dirname, "build", "index.html"));
      }
    } else {
      logger.error("redirecting to login page");
      res.redirect(baseUrl);
    }
  } catch (err) {
    console.log(err);
    logger.error(err.message);
  }
});
app.post("/getWorkspaceData", async function (req, res) {
  try {
    let reqBody = req.body;
    let query;
    if (reqBody && Object.keys(reqBody).length > 0) {
      query = querystring.encode(req.body);
      query = encodeURIComponent(query);
    } else {
      query = querystring.stringify({ uniqueWorkspaceNames: true });
    }
    let url = await msutils.getMsUrl("chatopsWorkspaceTransition");
    url = url + "/getWorkspaces" + `?queryString=${query}`;
    const response = await getWorkspaceData(url);
    logger.info(`getWorkspaceData response: ${response}`);

    let finalData = { responseHash: response, user: req.user.id };
    res.status(200).send({ WorkspaceData: finalData });
  } catch (err) {
    console.log(err);
    logger.error(err.message);
  }
});

app.get("/getCIOUserData", async function (req, res) {
  try {
    logger.info(`Processing data for daily reporting page`);
    let keyID = req.query.id;
    let CIOCountryStatus = await msutils.fetchFromStore("CIOCountryStatus", {
      id: keyID,
    });
    var dataObj = CIOCountryStatus[0].data;
    var finalData = {};
    let CIOUserData = await msutils.fetchFromStore("CIOUserData", {
      primary: CIOCountryStatus[0].primary,
    });
    const drSettings = await msutils.fetchSettings("cioDailyReporting");
    let allowedEmails = [];
    var dayFormat = "";
    //TODO: Need to figure out howto show date in case of isRequestedLink scenario..
    if (CIOUserData.length > 0) {
      let date = moment(CIOCountryStatus[0].status.primary);
      var weekDayName = moment(date).format("YYYY-MM-DD");
      if (date.day() == 1) {
        dayFormat = "72 hours";
      } else {
        dayFormat = "24 hours";
      }
      if (CIOCountryStatus[0].isChannel === true) {
        const usersEmails = await getUsersemailFromChannel(
          CIOCountryStatus[0].primary,
          CIOUserData[0]
        ); // primary column to have channelid saved. functiona should return array of email ids of users present in channel.
        allowedEmails = allowedEmails.concat(usersEmails); // TODO: hit collab api and get users emails from channel id which is saved in primary column.
      } else {
        allowedEmails.push(CIOUserData[0].primary.toLowerCase());
        allowedEmails.push(CIOUserData[0].secondary.toLowerCase());
        allowedEmails.push(CIOUserData[0].global.toLowerCase());
      }
    } else {
      if (CIOCountryStatus[0].isRequestedLink === true) {
        let date = moment(CIOCountryStatus[0].status.primary);
        var weekDayName = moment(date).format("YYYY-MM-DD");
        if (date.day() == 1) {
          dayFormat = "72 hours";
        } else {
          dayFormat = "24 hours";
        }
      }
    }
    if (
      allowedEmails.includes(req.user.id.toLowerCase()) ||
      CIOCountryStatus[0].isRequestedLink === true
    ) {
      finalData["allowedEmailsCheck"] = true;
    } else {
      finalData["allowedEmailsCheck"] = false; // Show notification
    }
    logger.info(`getUserData response: ${CIOUserData}`);
    if (
      dataObj &&
      Object.keys(dataObj).length === 0 &&
      dataObj.constructor === Object
    ) {
      finalData["dataPresentCheck"] = true;
    } else {
      finalData["dataPresentCheck"] = false; // data is empty. Show notification
    }
    var countryList = [];
    var countryListToUI = "";
    if (CIOUserData.length > 0) {
      countryList = CIOUserData[0].geoCountryGrp;
      countryListToUI = Object.values(countryList).flat().join();
    } else if (CIOCountryStatus[0].isRequestedLink === true) {
      countryList = drSettings.exemptedCountriedList;
      if (countryList.length > 0) {
        countryListToUI = countryList.flat().join();
      }
    }

    finalData["CIOUserData"] = CIOUserData[0];
    finalData["CIOCountryStatus"] = CIOCountryStatus[0];
    finalData["user"] = req.user.id;
    finalData["dayFormat"] = dayFormat;
    finalData["weekDayName"] = weekDayName;
    finalData["countryListToUI"] = countryListToUI;
    finalData["drSettings"] = drSettings;
    res.status(200).send({ cioUserData: finalData });
  } catch (err) {
    console.log(err);
    logger.error(err.message);
  }
});

app.post("/saveCIOUserData", async function (req, res) {
  try {
    logger.info(`Saving Daily Report form data`);

    /** start metrics **/
    msutils.metricsQueueJobByJobType("updateMetricsFacts", {
      accountCode: "default",
      api: "saveCIOUserData",
      sourceSystem: "default",
      microservice: "internal",
      subFunction: "default",
      service: "default",
      command: "default",
      stage: "invoked",
    });
    /** end metrics **/

    let keyId = req.body.reportId;
    let formData = req.body;
    var miData = formData.majorIncident;
    var ceData = formData.clientEscalation;
    var errObj = {};
    var idCheck = false;
    var isSubmit = false;
    if (formData.majorIncidentPresent == "Yes" && miData.length == 0) {
      isSubmit = true;
      errObj["noMIErr"] = "Please fill Major Incidents details";
    }
    if (
      (formData.clientEscalationWithMI == "yes" ||
        formData.clientEscalation == "yes") &&
      ceData.length == 0
    ) {
      isSubmit = true;
      errObj["noCEErr"] = "Please fill Client Escalation details";
    }
    var miErr = "";
    const data = {
      formData: formData,
      keyId: keyId,
    };
    let response;
    logger.info(`Processing data to be saved: ${data}`);
    let CIOCountryStatus = await msutils.fetchFromStore("CIOCountryStatus", {
      id: keyId,
    });
    var dataObj = CIOCountryStatus[0].data;
    var dataCheck = false;
    if (
      dataObj &&
      Object.keys(dataObj).length === 0 &&
      dataObj.constructor === Object
    ) {
      dataCheck = false; // Can save
      errObj["dataPresentErr"] = "";
    } else {
      errObj["dataPresentErr"] = "Data is already submitted.";
      dataCheck = true; // data present.
    }
    //send KSAT l;ogic.
    const ksatMi = miData.filter((a) => a.ksatHelp === "yes");
    const ksatCe = ceData.filter((a) => a.ksatHelp === "yes");
    const drSettings = await msutils.fetchSettings("cioDailyReporting");
    let messageBody = {
      workspaceName: drSettings.ksatWorkspace,
      channelid: drSettings.ksatChannel,
      ts: "",
    };
    for (const mi of ksatMi) {
      message = await formKSATMessage(
        mi.ksatContactInfo,
        mi.incidentDeacription
      );
      messageBody["message"] = message;
      await sendKSATMessage(messageBody);
    }
    for (const ce of ksatCe) {
      message = await formKSATMessage(
        ce.ksatContactInfo,
        ce.incidentDeacription
      );
      messageBody["message"] = message;
      await sendKSATMessage(messageBody);
    }
    if (formData.significantEvent.ksatHelpForSE === "Yes") {
      message = await formKSATMessage(
        formData.significantEvent.ksatContactSE,
        formData.significantEvent.incidentDescriptionSE
      );
      messageBody["message"] = message;
      await sendKSATMessage(messageBody);
    }
    var cioCountryStatusData = CIOCountryStatus[0];
    if (idCheck == false) {
      if (keyId && CIOCountryStatus) {
        // save CIO USER data here..
        cioCountryStatusData.data = formData;
        cioCountryStatusData.utcTS = moment().unix();
        cioCountryStatusData["status"]["respReceived"] = true;
        var cioStatusDataId = cioCountryStatusData._id;
        delete cioCountryStatusData._id;
        var submitData = false;
        if (dataCheck == true) {
          submitData = true; // No save
        }
        if (isSubmit == true) {
          submitData = true; // No save
        }
        if (submitData == false) {
          await msutils.updateInStore(
            "CIOCountryStatus",
            cioStatusDataId,
            cioCountryStatusData
          );
          const cacheKey = `CIOUSER-${cioCountryStatusData.primary}`;
          await msutils.delCacheValue(cacheKey);

          /** start metrics **/
          msutils.metricsQueueJobByJobType("updateMetricsFacts", {
            accountCode: "default",
            api: "saveCIOUserData",
            sourceSystem: "default",
            microservice: "internal",
            subFunction: "default",
            service: "default",
            command: "default",
            stage: "completed",
          });
          /** end metrics **/
          res.status(200).send({ CIOUserData: CIOCountryStatus });
        } else {
          logger.error(`Error while saving data.`);

          /** start metrics **/
          msutils.metricsQueueJobByJobType("updateMetricsFacts", {
            accountCode: "default",
            api: "saveCIOUserData",
            sourceSystem: "default",
            microservice: "internal",
            subFunction: "default",
            service: "default",
            command: "default",
            stage: "error",
          });
          /** end metrics **/

          res.status(400).send({ CIOUserDataErr: errObj });
        }
      }
    } else {
      res.status(400).send({ CIOUserDataErr: errObj });
    }
  } catch (err) {
    console.log(err);
    logger.error(err.message);
    /** start metrics **/
    msutils.metricsQueueJobByJobType("updateMetricsFacts", {
      accountCode: "default",
      api: "saveCIOUserData",
      sourceSystem: "default",
      microservice: "internal",
      subFunction: "default",
      service: "default",
      command: "default",
      stage: "error",
    });
    /** end metrics **/
  }
});

app.get("/thankyou", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/notAuthorized", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Till here for workspace transition.

app.get("/", ensureAuthenticated);
app.get("/register", authenticateRBAC);
app.get("/logout", function (req, res) {
  req.session.destroy();
  req.logout();
  res.redirect(baseUrl);
});
app.get(
  "/login",
  passport.authenticate("openidconnect", {
    state: Math.random().toString(36).substr(2, 10),
  })
);

app.get("/auth/sso/callback", function (req, res, next) {
  var session_url = req.session.originalUrl;
  var redirect_url = "";
  if (session_url) {
    session_url = session_url[0] == "/" ? session_url.slice(1) : session_url;
    redirect_url = baseUrl + `${session_url}`;
  } else {
    redirect_url = baseUrl;
  }
  logger.info(`Executing callback with redirect_url :: ${redirect_url}`);
  passport.authenticate("openidconnect", {
    successRedirect: redirect_url,
    failureRedirect: "/failure",
  })(req, res, next);
});

// failure page
app.get("/failure", function (req, res) {
  res.send("login failed");
});

app.use(express.static(path.join(__dirname, "build")));
app.use(express.static("public"));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use("/teamit", favicon(path.join(__dirname, "public", "favicon.ico")));
app.use("/teamit", express.static(path.join(__dirname, "build")));
app.use("/teamit", express.static(__dirname + "public"));

app.get("/home", async function (req, res) {
  if (req.user) {
    let result = await getFreshAccountAccessDetail(req);
    logger.debug(`Validating account access for user : ${req.user.id}`);
    res.sendFile(path.join(__dirname, "build", "index.html"));
  } else {
    res.redirect(baseUrl);
  }
});
app.get("/getUserData", async function (req, res) {
  var loggedIn;
  if (req.user) {
    loggedIn = req.user.id;
    res.status(200).send({ loggedIn: loggedIn });
  } else {
    loggedIn = "";
    throw new Error("User is not authorized to access this application.");
  }
});

// Get user access data, to grand access as per the persona privilage
app.get("/getUserAccess", async function (req, res) {
  if (req.user) {
    let result = await getFreshAccountAccessDetail(req);
    logger.debug(`Processing accout access details for : ${req.user.id}`);
    var userAccessData = {};
    var releaseNumber = process.env.RELEASE_NUMBER;
    var nameSpace = process.env.NAMESPACE;
    var url = req.headers.referer;
    if (url.includes("IBMToKyndryl")) {
      userAccessData["isAccoutAdmin"] = "";
      userAccessData["isProgramAdmin"] = "";
      userAccessData["isSuperAdmin"] = "";
      userAccessData["user"] = "";
    } else {
      userAccessData["isAccoutAdmin"] = req.session.isAccountAdmin;
      userAccessData["isProgramAdmin"] = req.session.isProgramAdmin;
      userAccessData["isSuperAdmin"] = req.session.isSuperAdmin;
      userAccessData["user"] = req.user.id;
    }
    // If there is no release number
    if (releaseNumber == "" || releaseNumber == undefined) {
      userAccessData["releaseNumber"] = "No Version";
    } else {
      userAccessData["releaseNumber"] = releaseNumber;
    }

    // If there is no NAMESPACE
    if (nameSpace == "" || nameSpace == undefined) {
      userAccessData["namespace"] = "No Namespace";
    } else {
      userAccessData["namespace"] = nameSpace;
    }

    res.status(200).send({ userAccessData: userAccessData });
  } else {
    res.redirect(baseUrl);
  }
});

app.get("/addUserRegistration/:id", async function (req, res) {
  try {
    let cacheValue = await msutils.getCacheValue(req.params.id);
    cacheValue = JSON.parse(cacheValue);
    if (cacheValue.expired) {
      throw new Error("expired link");
    }
    var data = {
      key: req.params.id,
    };
    var serviceUsedFromDB = cacheValue.jobData.accountCfg.ticketToolUsed;
    var itsmMSEnabled = cacheValue.jobData.accountCfg.itsmMSEnabled;
    var serviceUsed = {};
    if (itsmMSEnabled && serviceUsedFromDB == "noTicketingTool") {
      serviceUsed["service"] = "";
    } else {
      if (serviceUsedFromDB == "icd") {
        serviceUsed["service"] = "ICD";
      } else if (serviceUsedFromDB == "service_now") {
        serviceUsed["service"] = "ServiceNow";
      }
    }
    serviceUsed["accountName"] = cacheValue.jobData.accountCfg.accountName;

    let ansibledetails = await getAnsibleInstance(cacheValue);
    serviceUsed["ansibleInstance"] = ansibledetails.ansibleInstance;
    serviceUsed["ansibleInstanceName"] = ansibledetails.ansibleInstanceName;
    let userEmail = ansibledetails.userEmail;
    res
      .status(200)
      .send({ key: data.key, serviceUsed: serviceUsed, userEmail });
  } catch (e) {
    logger.error(e);
    res.status(200).send({ expired: true });
  }
});

async function getAnsibleInstance(cacheValue) {
  let response = {
    userEmail: "",
    ansibleInstance: "",
    ansibleInstanceName: "",
  };
  try {
    response.userEmail = cacheValue.jobData.getTicketDetailsRequest.userEmail
      ? cacheValue.jobData.getTicketDetailsRequest["userEmail"]
      : "";
    response.ansibleInstance = cacheValue.jobData.accountCfg["ansibleInstance"]
      ? cacheValue.jobData.accountCfg["ansibleInstance"]
      : "";
    const ansibleInstances = await msutils.fetchAnsibleInstance();
    const ansibleInstanceObject = ansibleInstances.find(
      (a) =>
        a.name === response.ansibleInstance ||
        a._id === response.ansibleInstance
    );
    response["ansibleInstanceName"] = ansibleInstanceObject.name;
    return response;
  } catch (e) {
    return response;
  }
}

function getAnsibleFeature(muiAccount, templates) {
  try {
    ansibleInstanceLog(muiAccount, templates);
    let ansibleFeature = "";
    ansibleInstance = muiAccount["ansibleInstance"];
    const ansibleInstanceList = muiAccount["ansibleInstanceList"];
    if (!ansibleInstance) {
      return "cacf";
    }
    let ansibleInstanceObject = ansibleInstanceList.find(
      (a) => a._id == ansibleInstance || a.name == ansibleInstance
    );
    muiAccount["ansibleInstance"] = ansibleInstanceObject.name;
    ansibleFeature = ansibleInstanceObject.threeScale ? "cacf" : "ansible";
    return ansibleFeature;
  } catch (e) {
    return "";
  }
}

function ansibleInstanceLog(muiAccount, templates) {
  try {
    const ticketTemplates = templates.find((obj) => obj.id === "cacfTemplates");
    let templateList = [];
    if (ticketTemplates) {
      let slacken = ticketTemplates["slack"]["en"];
      let msteamsen = ticketTemplates["msteams"]
        ? ticketTemplates["msteams"]["en"]
        : {};
      let en = { ...slacken, ...msteamsen };
      for (let key in en) {
        templateList.push({ name: key });
      }
    }
    muiAccount["ansibleInstanceTemplateList"] = templateList;
    let ansibleInstanceLog = muiAccount["ansibleInstanceLog"];
    if (!ansibleInstanceLog) {
      muiAccount["ansibleInstanceLog"] = {};
      muiAccount["ansibleInstanceLog"]["logRequired"] = "no";
      muiAccount["ansibleInstanceLog"]["template"] = "no";
      muiAccount["ansibleInstanceLog"]["channels"] = "";
    } else {
      muiAccount["ansibleInstanceLog"]["channels"] =
        ansibleInstanceLog["channels"].join(",");
    }
  } catch (e) {
    muiAccount["ansibleInstanceLog"] = {};
    muiAccount["ansibleInstanceLog"]["logRequired"] = "";
    muiAccount["ansibleInstanceLog"]["template"] = "no";
    muiAccount["ansibleInstanceLog"]["channels"] = "";
    muiAccount["ansibleInstanceTemplateList"] = [];
  }
}

app.post("/submitUserRegistration/:id", async function (req, res) {
  try {
    let keyId = req.params.id;
    let requestObj = await msutils.getCacheValue(keyId);
    requestObj = JSON.parse(requestObj);
    const accountObj = await msutils.getAccountByCode(requestObj.accountCode);
    const userCredKey = requestObj.userCredKey;
    if (userCredKey) {
      var data = {
        username: await msutils.encrypt(req.body.username),
        password: await msutils.encrypt(req.body.password),
      };
      await msutils.saveSecretToVault(userCredKey, data);
      await msutils.reloadJob(requestObj);
      requestObj["expired"] = true;
      await msutils.setCacheValue(keyId, JSON.stringify(requestObj), 900);
    }
    res.status(200).send({ success: true });
  } catch (err) {
    console.log(err);
    throw new Error("request failed, please retry..");
  }
});

// redirect to accounts page for Acc Admin after checking acc details
app.get("/onboardAccount", async function (req, res) {
  logger.info(`Loading Accounts page for Account Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
app.get("/onboardAccountData", async function (req, res) {
  logger.info(`Processing Account details for ${req.user.id}`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      var accountsDataDetails = await msutils.fetchFromStoreByOptions(
        "MUIAccounts",
        { groupName: { $in: req.session.groups } },
        {}
      );
      var accountsData = accountsDataDetails.sort(function (a, b) {
        var dateA = new Date(a.date),
          dateB = new Date(b.date);
        return dateB - dateA;
      });

      const submittedAccounts = [];
      for (var i = 0; i < accountsData.length; i++) {
        var dateFromDB = accountsData[i].date;
        if (dateFromDB.includes("/")) {
          accountsData[i].date = dateFromDB;
        } else {
          accountsData[i].date = moment.utc(dateFromDB).format("L HH:mm");
        }

        if (accountsData[i].submitted === true) {
          submittedAccounts.push(accountsData[i].accountCode);
        }
      }
      accountsData["isAccountAdmin"] = req.session.isAccountAdmin;

      // get ticketing tool details for submitted accounts
      const ticketingToolDetails = await msutils.fetchFromStoreByOptions(
        "TicketingTool",
        { accountCode: { $in: submittedAccounts } },
        {}
      );
      const ticketingToolAccounts = {
        enabledSMAccnts: [],
        enabledFollowUpAccnts: [],
      };
      if (ticketingToolDetails) {
        ticketingToolDetails.forEach((accDetail) => {
          if (accDetail.enableServiceManager) {
            ticketingToolAccounts.enabledSMAccnts.push(accDetail.accountCode);
          }
          if (accDetail.enableCRFWEmail) {
            ticketingToolAccounts.enabledFollowUpAccnts.push(
              accDetail.accountCode
            );
          }
        });
      }
      for (let i = 0; i < accountsData.length; i++) {
        const accountCode = accountsData[i].accountCode;
        if (ticketingToolAccounts.enabledSMAccnts.includes(accountCode)) {
          accountsData[i]["enableServiceManager"] = true;
        } else {
          accountsData[i]["enableServiceManager"] = false;
        }

        accountsDataDetails[i].enableCRFWEmail =
          ticketingToolAccounts.enabledFollowUpAccnts.includes(accountCode)
            ? true
            : false;
      }
      res.status(200).send({ accountsData: accountsData });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

app.post("/crFollowUpEnableCheck", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const ticketTool = await msutils.fetchFromStoreByOptions(
        "TicketingTool",
        { accountCode: req.body.accountCode },
        {}
      );
      if (ticketTool.length && ticketTool[0].enableCRFWEmail) {
        res.status(200).send({ isEnabled: true });
      } else {
        res.status(200).send({ isEnabled: false });
      }
      //res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

app.get("/extract-team-ids", async function (req, res) {
  logger.info("Loading teams extract ids page");
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/cr-approval-followup", async function (req, res) {
  logger.info(`Loading cr followup Page`);
  try {
    if (req.isAuthenticated()) {
      const ticketTool = await msutils.fetchFromStoreByOptions(
        "TicketingTool",
        { accountCode: req.params.code },
        {}
      );

      if (ticketTool.length && ticketTool[0].enableCRFWEmail) {
        // res.status(200).send({isEnabled: true});
        res.sendFile(path.join(__dirname, "build", "index.html"));
      } else {
        res.redirect(baseUrl);
      }
      //res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

//File Upload for CR Approval Follow Up
app.post(
  "/crFollowUpApproval",
  upload.single("file"),
  async function (req, res) {
    //const fileSize = 1024 * 1024 * 5;
    if (req.file) {
      try {
        logger.info(
          `File Received with Size ${req.file.size} for CR Follow Up Approval `
        );

        if (req.file.size > maxFileSize) {
          logger.error("File size is more than 5MB ");
          return res
            .status(413)
            .send({ message: "File exceeded maximum size limit" });
        }
        const { accountCode } = req.body;
        const isFileSafe = await msutils.runAntiVirusScanOnFile(req.file);

        if (!isFileSafe) {
          res.status(400).send({ message: "File is infected with Virus" });
        }

        const excelInJson = getJSONFromExcel(req.file.buffer);
        const valResult = validateExcelFile(excelInJson);

        if (valResult.valError) {
          const errorResponse = {
            message: valResult.valError,
            invalidEntries: valResult.invalidEntries,
          };
          return res.status(400).send(errorResponse);
        }
        await processExcelData(accountCode, valResult.validEntries);
        res.status(200).send({ message: "File uploaded successfully" });
      } catch (err) {
        logger.error(err);
        res.status(500).send({ message: err.message });
      }
    } else {
      logger.error("File not found");
      res.status(400).send({ message: "File not attached" });
    }
  }
);

// Search Accounts PA
app.post("/searchAccounts", async function (req, res) {
  logger.info("Processing Account Data for Program Admin Search");
  if (req.body) {
    var value = req.body.searchVal;
    var valueToSearch = {};
    valueToSearch["searchVal"] = value;
    app.set("searchVal", valueToSearch);
    res.status(200).send({ valueToSearch: valueToSearch });
  }
});
app.post("/resetSearch", async function (req, res) {
  logger.info("Processing Reset of Account Data for Program Admin ");
  if (req.body) {
    var valueToSearch = {};
    valueToSearch["searchVal"] = "";
    app.set("searchVal", valueToSearch);
    res.status(200).send({ valueToSearch: valueToSearch });
  }
});
app.get("/onboardAccountDataPA", async function (req, res) {
  logger.info(`Processing Program Admin Account details for ${req.user}`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isProgramAdmin) {
      if (app.get("searchVal") != undefined) {
        var searchData = app.get("searchVal");
        var valueToSearch = searchData.searchVal.trim();
      }
      // Undefined normal flow without search
      if (!app.get("searchVal") || app.get("searchVal") == undefined) {
        let accountsDataDetails = await msutils.fetchFromStore(
          "MUIAccounts",
          {}
        );
        var accountsData = accountsDataDetails.sort(function (a, b) {
          var dateA = new Date(a.date),
            dateB = new Date(b.date);
          return dateB - dateA;
        });
        for (var i = 0; i < accountsData.length; i++) {
          var dateFromDB = accountsData[i].date;
          if (dateFromDB.includes("/")) {
            accountsData[i].date = dateFromDB;
          } else {
            accountsData[i].date = moment.utc(dateFromDB).format("L HH:mm");
          }
        }
        accountsData["isProgramAdmin"] = req.session.isProgramAdmin;
        res.status(200).send({ accountsData: accountsData });
      } else {
        if (valueToSearch != "" || valueToSearch != undefined) {
          let accountsData = [];
          let accountsDataDetails = await msutils.fetchFromStore(
            "MUIAccounts",
            {}
          );
          for (var i = 0; i < accountsDataDetails.length; i++) {
            var dataFromDB = accountsDataDetails[i];
            if (Object.values(dataFromDB).indexOf(valueToSearch) > -1) {
              accountsData.push(dataFromDB);
            }
          }
          accountsData["isProgramAdmin"] = req.session.isProgramAdmin;
          res.status(200).send({ accountsData: accountsData });
        } else {
          let accountsData = await msutils.fetchFromStore("MUIAccounts", {});
          for (var i = 0; i < accountsData.length; i++) {
            var dateFromDB = accountsData[i].date;
            if (dateFromDB.includes("GMT")) {
              accountsData[i].date = moment.utc(dateFromDB).format("L HH:mm");
            } else {
              accountsData[i].date = dateFromDB;
            }
          }
          accountsData["isProgramAdmin"] = req.session.isProgramAdmin;
          res.status(200).send({ accountsData: accountsData });
        }
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.redirect(baseUrl);
  }
});
// redirect to accounts page for Program Admin after checking acc details
app.get("/addAccount", async function (req, res) {
  logger.info(`Loading Accounts page for Program Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isProgramAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
app.get("/addAccountData", async function (req, res) {
  logger.info(`Processing Account details for ${req.user.id}`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isProgramAdmin) {
      let accountsData = await msutils.fetchFromStore("MUIAccounts", {});
      res.status(200).send({ accountsData: accountsData });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// redirect to AA onboard account form for Acc Admin
app.get("/onboardAccountDetails", async function (req, res) {
  logger.info(`Loading Onboard Accounts page for Account Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
// Fetch geo, market, and other fields to populate in UI dropdown
app.get("/onboardAccountFormData", async function (req, res) {
  logger.info(`Fetching Geo, market, industry and country data`);
  try {
    await msutils.clearkWorkspacesFromCache();
    await getFreshAccountAccessDetail(req);

    if (req.session.isAccountAdmin) {
      var url = req.headers.referer;
      var id = url.split("?").pop();
      var eventSourceValue = "CDI";
      var muiAccount = await msutils.fetchFromStoreById("MUIAccounts", id);
      if (muiAccount.submitted || muiAccount.saved) {
        let SnowDropletStatusFlowConf = await msutils.fetchFromStore(
          "settings",
          { config_name: "SnowDropletStatusFlowConf" }
        );
        let SnowCsmStatusFlowConf = await msutils.fetchFromStore("settings", {
          config_name: "SnowCsmStatusFlowConf",
        });
        let IcdDefaultStatusFlowConf = await msutils.fetchFromStore(
          "settings",
          { config_name: "IcdDefaultStatusFlowConf" }
        );
        let SnowDefaultStatusFlowConf = await msutils.fetchFromStore(
          "settings",
          { config_name: "SnowDefaultStatusFlowConf" }
        );
        muiAccount["SnowDropletStatusFlowConfEdit"] =
          SnowDropletStatusFlowConf[0].config_value;
        muiAccount["SnowCsmStatusFlowConfEdit"] =
          SnowCsmStatusFlowConf[0].config_value;
        muiAccount["IcdDefaultStatusFlowConfEdit"] =
          IcdDefaultStatusFlowConf[0].config_value;
        muiAccount["SnowDefaultStatusFlowConfEdit"] =
          SnowDefaultStatusFlowConf[0].config_value;
        await mapDataFromDb(muiAccount);
      } else {
        let SnowDropletStatusFlowConf = await msutils.fetchFromStore(
          "settings",
          { config_name: "SnowDropletStatusFlowConf" }
        );
        let SnowCsmStatusFlowConf = await msutils.fetchFromStore("settings", {
          config_name: "SnowCsmStatusFlowConf",
        });
        let IcdDefaultStatusFlowConf = await msutils.fetchFromStore(
          "settings",
          { config_name: "IcdDefaultStatusFlowConf" }
        );
        let SnowDefaultStatusFlowConf = await msutils.fetchFromStore(
          "settings",
          { config_name: "SnowDefaultStatusFlowConf" }
        );
        muiAccount["SnowDropletStatusFlowConf"] =
          SnowDropletStatusFlowConf[0].config_value;
        muiAccount["SnowCsmStatusFlowConf"] =
          SnowCsmStatusFlowConf[0].config_value;
        muiAccount["IcdDefaultStatusFlowConf"] =
          IcdDefaultStatusFlowConf[0].config_value;
        muiAccount["SnowDefaultStatusFlowConf"] =
          SnowDefaultStatusFlowConf[0].config_value;
      }
      let countryList = await msutils.fetchFromStore("CountryCode", {});
      let industryList = await msutils.fetchFromStore("IndustryCodeList", {});
      let sectorList = await msutils.fetchFromStore("SectorCodeList", {});
      let geoList = await msutils.fetchFromStore("GeoCodeList", {});
      let TicketTemplatesList = await msutils.fetchFromStore(
        "TicketTemplates",
        {}
      );
      let ansibleInstanceList = await msutils.fetchFromStore(
        "AnsibleInstance",
        {}
      );
      const indexChannelTemplates = await msutils.fetchSettings("indexChannelTemplates");
      const ticketTemplatesArr = indexChannelTemplates.length? indexChannelTemplates:[];
      var sourceSystems = await msutils.fetchFromStore("SourceSystems", {
        SourceIdentificationCode: eventSourceValue,
      });
      const ticketTemplates = new Set();
      for (let i = 0; i < TicketTemplatesList.length; i++) {
        const indexTemplates = [
          "ticketChannelDashboard",
          "indexChannelDashboard",
        ];
        if (indexTemplates.includes(TicketTemplatesList[i].id)) {
          const types = [
            TicketTemplatesList[i].slack.en,
            TicketTemplatesList[i].msteams.en,
          ];
          const templateList = Object.keys(types[0]).concat(
            Object.keys(types[1])
          );
          templateList.forEach((tmplet) => {
            if (ticketTemplatesArr.includes(tmplet))
              ticketTemplates.add(tmplet);
          });
          // ticketTemplates = Object.keys(templateList);
        }
      }

      var sourceSystemsDetails = sourceSystems[0];
      var squadGeoList = [];
      if (sourceSystemsDetails.callbackConfig) {
        var sourceList = sourceSystemsDetails.callbackConfig;
        var sourceInstanceList = sourceList.instanceList;
        Object.entries(sourceInstanceList).map(([key, value]) => {
          if (value.callbackUrls.squadAssignmentUrl) {
            squadGeoList.push(key);
          }
        });
      }
      let workspaceData = await msutils.fetchSlackWorkspaces();
      //filter slack workspace
      const slackWorkspace = workspaceData.filter((workspaceObj) => {
        if (workspaceObj.workspaceType) {
          if (workspaceObj.workspaceType.toLowerCase() !== "teams") {
            return workspaceObj;
          }
        } else {
          return workspaceObj;
        }
      });

      const accSpecificTeamsWrkspace = workspaceData.filter((workspaceObj) => {
        if (workspaceObj.workspaceType) {
          if (
            workspaceObj.workspaceType.toLowerCase() === "teams" &&
            workspaceObj.accountCode === muiAccount.accountCode
          ) {
            return workspaceObj;
          }
        }
      });

      //Merge both, slack and teams workspace
      let workspaceList = [...slackWorkspace, ...accSpecificTeamsWrkspace];

      let languageList = await msutils.fetchFromStore("settings", {
        config_name: "supportedLanguages",
      });
      let marketList = [];
      let geoListRules = [];
      geoList = geoList.sort(function (a, b) {
        if (a.geo == b.geo) return 0;
        if (a.geo == "Choose an Option") return -1;
        if (b.geo == "Choose an Option") return 1;
        if (a.key < b.key) return -1;
        if (a.key > b.key) return 1;
        return 0;
      });
      for (let val of geoList) {
        if (val.market != "Choose an Option") {
          marketList = [].concat.apply(marketList, val.market);
        }
        if (val.geo != "Choose an Option") {
          geoListRules.push(val.geo);
        }
      }
      geoListRules = geoListRules.sort();
      marketList = marketList.sort();
      marketList = [...new Set(marketList)];
      muiAccount["languageList"] = languageList[0].config_value;
      muiAccount["acc_id"] = id;
      muiAccount["loggedInUser"] = req.user.id;
      muiAccount["countryList"] = countryList;
      muiAccount["industryList"] = industryList;
      muiAccount["sectorList"] = sectorList;
      muiAccount["geoList"] = geoList;
      muiAccount["marketList"] = marketList;
      muiAccount["workspaceList"] = workspaceList;
      muiAccount["squadGeoList"] = squadGeoList;
      muiAccount["ansibleInstanceList"] = ansibleInstanceList;
      muiAccount["ticketTemplates"] = Array.from(ticketTemplates);
      const templates = await msutils.getTicketTemplates();
      muiAccount["ansibleFeature"] = getAnsibleFeature(muiAccount, templates);
      const teamsBotDetails = await msutils.fetchSettings(
        MS_TEAMS_BOTS_CONFIG_NAME
      );
      const workspaceRegions = Object.keys(teamsBotDetails);
      muiAccount["workspaceRegions"] = workspaceRegions;
      muiAccount["teamsBotDetails"] = teamsBotDetails;
      res.status(200).send({ accountsData: muiAccount });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});

// redirect to PA add account form for Program Admin
app.get("/addAccountDetails", async function (req, res) {
  logger.info(`Loading Add/Edit Accounts page for Program Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isProgramAdmin) {
      var url = req.headers.referer;
      var enterpriseData = await msutils.fetchFromStore("settings", {
        config_name: "enterprises",
      });
      var enterpriseFromSettings = [];
      var enterpriseArray = enterpriseData[0].config_value;

      for (var j = 0; j < enterpriseArray.length; j++) {
        enterpriseFromSettings.push(enterpriseArray[j].enterprise);
      }
      if (url.includes("?")) {
        var accId = url.split("?").pop();
        var muiAccount = await msutils.fetchFromStoreById("MUIAccounts", accId);
        res.status(200).send({
          return: "true",
          enterprisesDetails: enterpriseFromSettings,
          retrievedData: muiAccount,
          redirectUrl: baseUrl + "addAccountDetails",
        });
      } else {
        res.status(200).send({
          return: "true",
          enterprisesDetails: enterpriseFromSettings,
          redirectUrl: baseUrl + "addAccountDetails",
        });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.redirect(baseUrl);
  }
});

// Edit Accounts for PA
app.post("/editAccountDetails", async function (req, res) {
  logger.info(`Loading Edit Accounts page for Program Admin - post`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isProgramAdmin) {
      var accID = req.body.accID;
      var muiAccount;
      if (accID) {
        muiAccount = await msutils.fetchFromStoreById("MUIAccounts", accId);
      }
      var enterpriseData = await msutils.fetchFromStore("settings", {
        config_name: "enterprises",
      });
      var enterpriseFromSettings = [];
      var enterpriseArray = enterpriseData[0].config_value;

      for (var j = 0; j < enterpriseArray.length; j++) {
        enterpriseFromSettings.push(enterpriseArray[j].enterprise);
      }
      app.set("muiAccount", muiAccount);
      app.set("enterpriseDetails", enterpriseFromSettings);
      res.status(200).send({
        return: "true",
        muiAccount: muiAccount,
        enterpriseDetails: enterpriseFromSettings,
        redirectUrl: baseUrl + "addAccountDetails",
      });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// Save and fetch feed status
app.post("/addFeedStatus", async function (req, res) {
  logger.info(`Saving Feed Status Program Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isProgramAdmin) {
      if (req.body) {
        var accCode = req.body.accCode;
        var data = {
          feedStatus: req.body.feedStatusData,
        };
        var resultFetch = await msutils.fetchFromStoreByOptions(
          "MUIAccounts",
          { accountCode: accCode },
          {}
        );
        var fetchAccounts = await msutils.fetchFromStoreByOptions(
          "Accounts",
          { accountCode: accCode },
          {}
        );
        var acc_id = resultFetch[0]._id;
        await msutils.patchDataInStore("MUIAccounts", acc_id, data);
        logger.info(
          `Successfully updated Account Feed status to Active for Account: ${accCode}`
        );
        if (fetchAccounts[0]) {
          var account_id = fetchAccounts[0]._id;
          await msutils.patchDataInStore("Accounts", account_id, data);
          await msutils.refreshAccountsList();
        }
        var statusToFetch = {
          acc_Code: accCode,
        };
        app.set("feedDataCode", statusToFetch);
        res.status(200).send({ statusUpdate: true });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
app.get("/getStatus", async function (req, res) {
  logger.info(`Fetching Account Feed status`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isProgramAdmin) {
      var accCode = app.get("feedDataCode");
      var resultFetch = await msutils.fetchFromStoreByOptions(
        "MUIAccounts",
        { accountCode: accCode.acc_Code },
        {}
      );
      var statusList = {};
      var feedFromDB = resultFetch[0].feedStatus;
      if (feedFromDB == "active") {
        statusList["feedStatusVal"] = "Active";
        statusList["feedClass"] = "teal";
      } else if (feedFromDB == "hold") {
        statusList["feedStatusVal"] = "Hold";
        statusList["feedClass"] = "cyan";
      } else if ((feedFromDB = "deactive")) {
        statusList["feedClass"] = "magenta";
        statusList["feedStatusVal"] = "Deactivated";
      } else if (feedFromDB == "requestForFeed") {
        statusList["feedClass"] = "gray";
        statusList["feedStatusVal"] = "Requested for feed";
      } else {
        statusList["feedClass"] = "warm-gray";
        statusList["feedStatusVal"] = "NA";
      }
      statusList["feedStatus"] = resultFetch[0].feedStatus;
      statusList["accCode"] = accCode.acc_Code;
      res.status(200).send({ statusList: statusList });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    logger.error(e.message);
  }
});

//Post/Save Accounts added by PA
app.post("/postAddAccountDetails", async function (req, res) {
  logger.info(`Posting Accounts details as Program Admin `);
  // payload validation
  const schema = Joi.object({
    accCode: Joi.string().trim().required(),
    accName: Joi.string().trim().required(),
    enterprise: Joi.string().trim().required(),
    group: Joi.string()
      .trim()
      .required()
      .pattern(/[!<>#%]/, {
        name: "should not contain !<>#% characters",
        invert: true,
      }),
    _id: Joi.objectId(),
    globalConfig: Joi.optional(),
    eventStream: Joi.optional(),
    createGroup: Joi.optional(),
    dpeEmail: Joi.optional(),
    globalRepEmail: Joi.optional(),
    accountRepEmail: Joi.optional(),
    disableCreateGroup: Joi.optional(),
    addChatopsAsAdmin: Joi.optional(),
    maceDisabled: Joi.optional(),
    directIntegEnabled: Joi.optional(),
    enrollMaintenanceWindow: Joi.optional(),
  });
  const { error } = schema.validate(req.body);
  if (error)
    return res.status(400).send({ errMsg: error.message, saveStatus: "false" });
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isProgramAdmin) {
      var date = new Date();
      var errMsg = [];
      const members = [];
      const administrators = [];
      var acc_code = req.body.accCode.toLowerCase().trim();
      var acc_name = req.body.accName.trim();
      var acc_group = req.body.group;
      var event_stream = req.body.globalConfig;
      var pushToEventStream = req.body.eventStream;
      redirectUrl = baseUrl + "home";
      var accID = req.body._id;
      var enableCreateGroup = req.body.createGroup;
      let dpeEmail = "";
      var globalRepEmail = req.body.globalRepEmail;
      var accRepEmail = req.body.accountRepEmail;
      var enterpriseVal = req.body.enterprise;
      var isValid2 = "";
      var createEditGroup = req.body.disableCreateGroup;
      var addChatopsAsAdmin = req.body.addChatopsAsAdmin;
      var directIntegEnabled = false;
      if (req.body.maceDisabled == undefined || req.body.maceDisabled == null) {
        var maceDisabled = false;
      } else {
        var maceDisabled = req.body.maceDisabled;
      }
      if (req.body.directIntegEnabled) {
        directIntegEnabled = req.body.directIntegEnabled;
      }
      if (
        req.body.enrollMaintenanceWindow == undefined ||
        req.body.enrollMaintenanceWindow == null
      ) {
        var enrollMaintenanceWindow = false;
      } else {
        var enrollMaintenanceWindow = req.body.enrollMaintenanceWindow;
      }
      const acc$ = msutils.fetchFromStore("MUIAccounts", {
        accountCode: acc_code,
      });

      // check for duplicate Acc
      const acc = await acc$;

      if (acc && acc.length > 0) {
        const { _id } = acc[0];
        if (accID != _id) {
          errMsg.push("Account code already exist.");
          logger.error(errMsg[0]);
          return res.status(409).send({
            errMsg,
            saveStatus: false,
            accountCode: acc_code,
            redirectUrl: baseUrl + "addAccount",
          });
        }
      }

      if (!enableCreateGroup) {
        try {
          const isValid = await isGroupValid(acc_group);
          if (!isValid)
            return res
              .status(404)
              .send({ errMsg: "Group not found", saveStatus: "false" });
        } catch (e) {
          return res
            .status(400)
            .send({ errMsg: "Invalid Group", saveStatus: "false" });
        }
      }
      // create a new group
      if (enableCreateGroup && !createEditGroup) {
        logger.info("Creation of groups==>");

        if (req.body.dpeEmail) {
          dpeEmail = req.body.dpeEmail;
          // let emailId = [];
          // emailId[0] = dpeEmail;
          const validEmail = await msutils.validateEnterpriseEmails(
            enterpriseVal,
            [req.body.dpeEmail]
          );
          if (validEmail) {
            members.push(req.body.dpeEmail);
            if (administrators.includes(req.body.dpeEmail) === false)
              administrators.push(req.body.dpeEmail);
          } else {
            return res.status(404).send({
              errMsg: "DPE Email is not " + enterpriseVal + " email",
              saveStatus: "false",
            });
          }

          // var enterpriseConfig = await msutils.fetchSettings('enterprises');
          // enterpriseConfig = (enterpriseConfig.find(c => c.enterprise === enterpriseVal));
          if (req.body.globalRepEmail) {
            let emailId = [];
            emailId[0] = req.body.globalRepEmail;
            const validEmail = await msutils.validateEnterpriseEmails(
              enterpriseVal,
              emailId
            );
            if (validEmail) {
              if (members.includes(req.body.globalRepEmail) === false)
                members.push(req.body.globalRepEmail);
              if (administrators.includes(req.body.globalRepEmail) === false)
                administrators.push(req.body.globalRepEmail);
            } else {
              return res.status(404).send({
                errMsg:
                  "Global Representative Email is not " +
                  enterpriseVal +
                  " email",
                saveStatus: "false",
              });
            }
          }

          if (req.body.accountRepEmail) {
            let emailId = [];
            emailId[0] = req.body.accountRepEmail;
            const validEmail = await msutils.validateEnterpriseEmails(
              enterpriseVal,
              emailId
            );
            if (validEmail) {
              if (members.includes(req.body.accRepEmail) === false)
                members.push(req.body.accountRepEmail);
              if (administrators.includes(req.body.accRepEmail) === false)
                administrators.push(req.body.accountRepEmail);
            } else {
              return res.status(404).send({
                errMsg:
                  "Account Representative Email is not " +
                  enterpriseVal +
                  " email",
                saveStatus: "false",
              });
            }
          }
          try {
            // const isBGCreated = await createGroup(acc_group,dpeEmail,members,enterpriseConfig);
            logger.info(`app.js:: Calling create group: ${administrators} `);
            const isBGCreated = await createGroup(
              acc_group,
              dpeEmail,
              members,
              administrators
            );
            data = isBGCreated[1];
            if (!isBGCreated[0]) {
              return res
                .status(404)
                .send({ errMsg: data, saveStatus: "false" });
            }
          } catch (e) {
            logger.error(`Error while creating Group : ${e.message}`);
            return res
              .status(400)
              .send({ errMsg: "Bluegroup not created", saveStatus: "false" });
          }
        }
      }
      if (!accID) {
        var serviceList = await msutils.fetchFromStore("SourceSystems", {});
        var sourceCode = acc_code;
        var sourceName = acc_name;
        var uniqueCheck = false;
        var sourceSystemCheck = false;
        for (var i = 0; i < serviceList.length; i++) {
          if (
            serviceList[i].SourceIdentificationCode == sourceCode ||
            serviceList[i].SourceIdentificationCode == sourceName
          ) {
            sourceSystemCheck = true;
            return res.status(400).send({
              errMsg: "Account or service name already existing.",
              saveStatus: "false",
            });
          }
        }
      }

      if (errMsg.length == 0) {
        var currentDate = new Date();
        var date = moment.utc(currentDate).format("L HH:mm");
        let data = {
          accountCode: acc_code,
          accountName: acc_name,
          groupName: acc_group,
          maceDisabled: maceDisabled,
          directIntegEnabled: directIntegEnabled,
          enrollMaintenanceWindow: enrollMaintenanceWindow,
          enterprise: enterpriseVal,
          createGroup: enableCreateGroup,
          dpeEmail: dpeEmail,
          submitted: false,
          globalRepEmail: globalRepEmail,
          accountRepEmail: accRepEmail,
          saved: false,
          date: date,
        };
        try {
          if (accID) {
            // Edit
            await mapAccountCode(accID, data);
          } else {
            // New
            await msutils.saveInStore("MUIAccounts", data);
          }
          res.status(200).send({
            saveStatus: "true",
            accountCode: acc_code,
            redirectUrl: baseUrl + "addAccount",
          });
        } catch (e) {
          logger.error(e);
          logger.error(e.message);
          if (e.isAxiosError) {
            if (e.response.data.error.message.indexOf("duplicate") > -1) {
              errMsg.push("Account code already exist.");
            }
          } else {
            errMsg.push("Error occured while updating db.");
          }
          res.status(409).send({
            errMsg: errMsg,
            saveStatus: "false",
            accountCode: acc_code,
            redirectUrl: baseUrl + "addAccount",
          });
        }
      } else {
        //need to check
        logger.error(errMsg);
        res.status(400).send({
          errMsg: errMsg,
          saveStatus: "false",
          accountCode: acc_code,
          redirectUrl: baseUrl + "addAccountDetails",
        });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.status(400).send({
      saveStatus: "false",
      accountCode: acc_code,
      redirectUrl: baseUrl + "addAccountDetails",
    });
  }
});

app.post("/createRule", async function (req, res) {
  let errMsg = [];
  const accountCode = req.body.accountCode;
  const priority = req.body.priority;
  const assignmentGroup = req.body.assignmentGroup.trim();
  const sla = req.body.sla;
  const slaUnit = req.body.slaUnit;
  const breachType = req.body.breachType;
  const breachTimeUnit = req.body.breachTimeUnit;
  const breachTime = req.body.breachTime;
  const isRuleEnabled = req.body.isRuleEnabled;
  const userEmail = req.body.userEmail;
  const groupName = req.body.groupName;
  const channelId = req.body.channelId;
  const enableOwnerNotification = req.body.enableOwnerNotification;
  const incidentChannelEnabled = req.body.incidentChannelEnabled;
  const ticketStates = req.body.ticketStates;
  const queryParameters = req.body.queryParameters;

  const data = {
    accountCode,
    priority,
    assignmentGroup,
    sla,
    slaUnit,
    breachType,
    breachTimeUnit,
    breachTime,
    userEmail,
    groupName,
    channelId,
    isRuleEnabled,
    enableOwnerNotification,
    incidentChannelEnabled,
    // ticketState,
    ticketStates,
    queryParameters,
  };
  try {
    await msutils.saveInStore("ServiceManager", data);
    res.status(200).send({ saveStatus: "true" });
  } catch (e) {
    logger.error(`Error object while saving Rules ${e}`);
    logger.error(`${e.message}`);

    res.status(500).send({
      errMsg: e.message,
      saveStatus: "false",
      redirectUrl: baseUrl + "servicemanager",
    });
  }
});

app.patch("/patchRule", async function (req, res) {
  try {
    const { ruleId, data } = req.body;
    await msutils.patchDataInStore("ServiceManager", ruleId, data);
    res.status(200).send({ ruleUpdated: true });
  } catch (error) {
    logger.error(error.message);
    res.status(500).send({ status: "failed", error: error });
  }
});

app.get("/ruleDetails/:id", async (req, res) => {
  try {
    logger.info(`Getting Rule details   ${req.params.id} `);

    let ruleDetail = await msutils.fetchFromStoreById(
      "ServiceManager",
      req.params.id
    );
    logger.info(
      `app.js:: '/ruleDetails:id Rule detail :   ${JSON.stringify(
        ruleDetail
      )}  `
    );

    res.status(200).send({ ruleDetail });
  } catch (error) {
    res.status(500).send({ status: "failed", error: error });
  }
});

app.post("/deleteRule", async function (req, res) {
  try {
    logger.info(`Calling Delete  Rule   ${req.params.id} `);

    var deleteId = req.body.toDeleteID;
    await msutils.deleteDataInStore("ServiceManager", deleteId);
    res.status(200).send({ delete: true, ruleError: "" });
  } catch (error) {
    res.status(500).send({ status: "failed", error: error });
  }
});
app.get("/getMUIAccountData/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const muiAccountData = await msutils.fetchFromStoreById("MUIAccounts", id);

    res.status(200).send({ muiAccountData });
  } catch (e) {
    logger.error(
      "Error while fetching account details for Service manager: ",
      JSON.stringify(e.message)
    );
    res.status(500).send({ status: "failed", error: e });
  }
});

app.get("/getSMRules", async function (req, res) {
  try {
    let url = req.headers.referer;
    let isParamGenerated = false;
    const id = url.split("?").pop();
    const muiAccountData = await msutils.fetchFromStoreById("MUIAccounts", id);
    const { accountCode, _id, accountName } = muiAccountData;
    const SMRules = await msutils.fetchFromStoreByOptions("ServiceManager", {
      accountCode,
    });
    const SMSettings = await msutils.fetchFromStoreByOptions(
      "ServiceManagerSettings",
      {
        accountCode,
      }
    );

    if (SMSettings && SMSettings.length) {
      const setting = SMSettings[0];
      if (setting && Object.keys(setting.incidentParamNames).length) {
        isParamGenerated = true;
      } else {
        isParamGenerated = false;
      }
    }

    const accountData = { accountCode, accountId: _id, accountName };
    res.status(200).send({
      SMRules,
      accountData,
      isParamGenerated,
    });
  } catch (e) {
    logger.error(
      "Error while fetching Service Manager rules: ",
      JSON.stringify(e.message)
    );
    res.status(500).send({ status: "failed", error: e });
  }
});
app.post("/createGroup", async function (req, res) {
  logger.info(`Creating a Group for user ${req.user.id}`);

  await getFreshAccountAccessDetail(req);
  logger.info(`  super admin : ${req.session.isSuperAdmin}`);

  if (req.session.isSuperAdmin) {
    logger.info(`preparing data for a  Group`);
    let errMsg = [];
    const members = req.body.members;
    const owners = req.body.owners;
    const grpName = req.body.grpName.trim();
    const grpDescription = req.body.grpDescription.trim();

    const data = {
      name: grpName,
      description: grpDescription,
      members,
      owners,
    };
    try {
      logger.info(
        `app.js:: createGroup: data saving groups ${JSON.stringify(data)}`
      );
      await msutils.saveInStore("ChatopsGroups", data);
      res.status(200).send({ saveStatus: "true", groupname: grpName });
    } catch (e) {
      logger.error(`Error object while saving groups ${e}`);
      logger.error(`Error Message while saving groups ${e.message}`);

      res.status(409).send({
        errMsg: errMsg,
        saveStatus: "false",
        groupname: grpName,
        redirectUrl: baseUrl + "groups",
      });
    }
  } else {
    throw new Error("User is not authorized to access this application.");
  }
});

app.post("/validateGroupUser", async function (req, res) {
  const emailId = req.body.emailId.trim();
  logger.info(
    `app.js======>>>>>/validateGroupUser/:emailId:: emailID passed in parameter  ${emailId}`
  );
  let userTofetch;
  let splitUser = emailId.split("@");
  const enterprises = ["kyndryl.com", "onmicrosoft.com"];
  const matchEnterprises = enterprises.some((enterprise) =>
    splitUser[1].toLowerCase().includes(enterprise)
  );
  // if(splitUser[1].toLowerCase() === "kyndryl.com"){
  if (splitUser && matchEnterprises) {
    // kyndryl ID
    splitUser[1] = "@ocean.ibm.com";
    userTofetch = splitUser.join("");
  }

  const url =
    "https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(mail=" +
    userTofetch +
    ").search/byjson?preferredidentity&notesId&additional";
  const axiosConfig = {
    headers: {
      "Content-Type": "application/xml;charset=UTF-8",
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };
  return new Promise((resolve, reject) => {
    const axiosConfig = {
      headers: {
        "Content-Type": "application/xml;charset=UTF-8",
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };

    axios
      .get(url, axiosConfig)
      .then((response) => {
        let returnCount = response.data.search.return.count;
        if (returnCount === 0) {
          logger.info(`No Details available against ${userTofetch}`);
          res.status(400).send({
            validEmail: false,
            fetchError: "No Details available against " + userTofetch,
          });
        } else {
          res.status(200).send({ validEmail: true, fetchError: "" });
        }
      })
      .catch((err) => {
        reject(err);
        logger.error("Error Posting to user ERROR:", err);
        res.status(400).send({
          validEmail: false,
          fetchError: "No Details available against " + userTofetch,
        });
      });
  });
});
app.post("/updateGroup", async function (req, res) {
  logger.info(`updating  a Group for user ${req.user.id}`);

  logger.info(`preparing data for a  Group`);
  const errMsg = [];
  const groupId = req.body.groupId;
  const data = req.body.data;
  logger.info(
    `data to be updated:: groupId: ${groupId}, Update Data: ${JSON.stringify(
      data
    )}`
  );
  try {
    const groupsData = await msutils.fetchFromStoreById(
      "ChatopsGroups",
      groupId
    );
    await msutils.patchDataInStore("ChatopsGroups", groupId, data);
    logger.info(
      `Going to remove cache for pattern: Chatops-Groups-${groupsData["name"]}`
    );
    await msutils.delCacheValuesByPattern(
      `Chatops-Groups-${groupsData["name"]}`
    );
    res.status(200).send({ saveStatus: "true", groupId: groupId });
  } catch (e) {
    logger.error(`Error object while saving groups ${e}`);
    logger.error(`Error Message while saving groups ${e.message}`);
    res.status(409).send({
      errMsg: errMsg,
      saveStatus: "false",
      groupId: groupId,
      redirectUrl: baseUrl + "groups",
    });
  }
});

app.post("/deleteGroup", async function (req, res) {
  logger.info(`Deleting group as Super Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    logger.info(`  super admin : ${req.session.isSuperAdmin}`);

    if (req.session.isSuperAdmin) {
      var deleteId = req.body.toDeleteID;
      logger.info(
        ` deleting  group - id: ${deleteId} as a super admin : ${req.session.isSuperAdmin}`
      );
      await msutils.deleteDataInStore("ChatopsGroups", deleteId);
      logger.info(`Successfully deleted group - id: ${deleteId}`);
      res.status(200).send({ delete: true, groupError: "" });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
  }
});

const getKyndrylEmail = (userEmail) => {
  if (userEmail) {
    let userToLogin;
    let splitUser = userEmail.split("@");
    if (splitUser[1].toLowerCase() === "ocean.ibm.com") {
      splitUser[1] = "@kyndryl.com";
      userToLogin = splitUser.join("");
      return userToLogin;
    } else if (splitUser[1].toLowerCase() === "kyndryl.com") {
      return userEmail;
    } else return null;
  }
};

// Get List of all Groups for users who are either member, admin or owner
app.get("/groupsForUser", async function (req, res) {
  try {
    await getFreshAccountAccessDetail(req);
    logger.info(`  super admin : ${req.session.isSuperAdmin}`);
    const userId = getKyndrylEmail(req.user.id).toLowerCase();
    logger.info(`/groupsForUser:: Getting Groups data for user  ${userId}  `);
    const queryObj = { $or: [] };
    queryObj["$or"].push({ members: { $in: [userId] } });
    queryObj["$or"].push({ owners: { $in: [userId] } });
    queryObj["$or"].push({ administrators: { $in: [userId] } });

    let groupList = await msutils.fetchFromStoreByOptions(
      "ChatopsGroups",
      queryObj
    );

    logger.info(
      `app.js:: '/groupsForUser Groups data :   ${JSON.stringify(
        groupList
      )} and super Admin is:  ${req.session.isSuperAdmin} `
    );

    res.status(200).send({
      groupData: groupList,
      isSuperAdmin: req.session.isSuperAdmin ? req.session.isSuperAdmin : false,
    });
  } catch (e) {
    logger.error("Error while fetching Group List: ", JSON.stringify(e));
    // res.redirect(baseUrl);
  }
});

app.get("/uniqueGroup/:grpName", async function (req, res) {
  logger.info("Checking for unique group name");
  const { grpName } = req.params;
  try {
    var groupDetail = await msutils.fetchFromStoreByOptions("ChatopsGroups", {
      name: grpName,
    });

    logger.info(`Existing group detail is : ${JSON.stringify(groupDetail)}`);
    if (groupDetail && groupDetail.length > 0) {
      res.send({ unique: false });
    } else {
      res.send({ unique: true });
    }
  } catch (error) {
    res.send({ unique: false });
  }
});
app.post("/uniqueGroupUser", async function (req, res) {
  logger.info("Checking for unique group name");
  const groupId = req.body.groupId;
  const user = req.body.email;
  const userType = req.body.userType;
  const OWNER = "OWNER";
  const ADMINISTRATOR = "ADMINISTRATOR";
  const MEMBER = "MEMBER";
  try {
    let groupDetail = await msutils.fetchFromStoreById(
      "ChatopsGroups",
      groupId
    );
    let userExists = false;
    logger.info(`Existing group detail is : ${JSON.stringify(groupDetail)}`);
    logger.info(`user is : ${user}`);
    switch (userType) {
      case OWNER:
        userExists =
          groupDetail.owners &&
          groupDetail.owners.length &&
          groupDetail.owners.some(
            (owner) => owner.trim().toLowerCase() === user.trim().toLowerCase()
          );
        break;
      case ADMINISTRATOR:
        userExists =
          groupDetail.administrators &&
          groupDetail.administrators.length &&
          groupDetail.administrators.some(
            (admin) => admin.trim().toLowerCase() === user.trim().toLowerCase()
          );
        break;
      case MEMBER:
        logger.info(
          `groupDetail.members-->${JSON.stringify(groupDetail.members)}`
        );
        userExists =
          groupDetail.members &&
          groupDetail.members.length &&
          groupDetail.members.some(
            (member) =>
              member.trim().toLowerCase() === user.trim().toLowerCase()
          );
        break;

      default:
        break;
    }
    logger.info(`userExists -->${userExists}`);

    res.send({ unique: !userExists });
  } catch (error) {
    logger.error(`An error occured-->${JSON.stringify(error)}`);
    res.send({ unique: false });
  }
});

app.get("/groupsDetail/:id", async (req, res) => {
  try {
    logger.info(`Getting Group details for Group Name  ${req.params.id} `);

    let groupDetail = await msutils.fetchFromStoreById(
      "ChatopsGroups",
      req.params.id
    );
    logger.info(
      `app.js:: '/groupsDetail:id Groups detail :   ${JSON.stringify(
        groupDetail
      )}  `
    );

    res.status(200).send({ groupDetail: groupDetail });
  } catch (error) {
    logger.error(
      `Error while fetching Group details for  ${
        req.params.id
      } :  ${JSON.stringify(error)} `
    );
    res.redirect(baseUrl);
  }
});

// redirect to Home page for Super Admin after checking acc details
app.get("/superAdmin", async function (req, res) {
  logger.info(`Loading Accounts page for Super Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isProgramAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
// Workspace page for SA
app.get("/workspaces", async function (req, res) {
  logger.debug(`Loading Super Admin Workspace Listing page.`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// commands page for SA
app.get("/commands", async function (req, res) {
  logger.debug(`Loading Super Admin Workspace Listing page.`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// add-commands page for SA
app.get("/add-command", async function (req, res) {
  logger.debug(`Loading Super Admin Workspace Listing page.`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

app.get("/addWorkspaces", async function (req, res) {
  logger.debug(`Loading Workspace Form for SA.`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var workspaceId;
      var wsDetails = {};
      var url = req.headers.referer;
      if (url.includes("?")) {
        workspaceId = url.split("?").pop();
      }
      const teamsBotDetails = await msutils.fetchSettings(
        MS_TEAMS_BOTS_CONFIG_NAME
      );
      const workspaceRegions = Object.keys(teamsBotDetails);
      wsDetails["workspaceRegions"] = workspaceRegions;
      if (workspaceId !== undefined) {
        var workspaceDetail = await msutils.fetchFromStoreById(
          "Workspace",
          workspaceId
        );
        var botData = workspaceDetail.bot;
        wsDetails["signingSecret"] = workspaceDetail.signingsecret;
        if (botData && botData.tokens) {
          wsDetails["xoxp"] = botData.tokens.xoxp;
          wsDetails["xoxb"] = botData.tokens.xoxb;
        }
        wsDetails["name"] = workspaceDetail.name;
        wsDetails["workspaceType"] = workspaceDetail.workspaceType;
        const team = workspaceDetail.team;
        wsDetails["teamId"] = team.id;
        wsDetails["teamName"] = team.name;
        wsDetails["region"] = workspaceDetail.region;
        wsDetails["accountCode"] = workspaceDetail.accountCode;
        res.status(200).send({ workspaceDataToEdit: wsDetails });
      } else {
        res.status(200).send({ workspaceDataToEdit: wsDetails });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.redirect(baseUrl);
  }
});
app.post("/postWorkspaces", async function (req, res) {
  logger.debug(`Loading Workspace Form for SA.`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

//Fetch Workspace for SA Workspace List page
app.get("/fetchWorkspaceData", async function (req, res) {
  logger.info(
    `SA Workspace: Fetching workspace data from Workspace collection `
  );
  try {
    await msutils.clearkWorkspacesFromCache();
    await getFreshAccountAccessDetail(req);

    if (req.session.isSuperAdmin) {
      let workspaceList = await msutils.fetchSlackWorkspaces();
      res.status(200).send({
        workspaceData: workspaceList,
        redirectUrl: baseUrl + "workspaces",
      });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});

app.get("/fetchCommands", async function (req, res) {
  logger.info(`SA Commands: Fetching commands data from Commands collection `);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      let commandList = await msutils.getCommandList();
      res
        .status(200)
        .send({ commands: commandList, redirectUrl: baseUrl + "commands" });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});

app.get("/fetchCommand", async function (req, res) {
  logger.info(`SA Commands: Fetching command from Commands collection `);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      const { id } = req.query;
      let commandList = await msutils.getCommandList();
      const command = commandList.find((cmd) => cmd._id == id);
      if (!command) throw new Error("Invalid user id");
      res.status(200).send({ command });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});

app.post("/check-command", async function (req, res) {
  logger.info("Checking for unique command as Super Admin");
  try {
    await getFreshAccountAccessDetail(req);
    const { command } = req.body;
    if (!command)
      return res
        .status(400)
        .send({ status: "failed", error: "command name is mandatory." });

    let commandList = await msutils.getCommandList();

    const existingCmd =
      commandList &&
      commandList.find(
        (cmd) => cmd.command.toLowerCase() === command.toLowerCase()
      );

    return res.status(200).send({
      unique: !!!existingCmd,
    });
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});

app.post("/command", async function (req, res) {
  logger.info("posting command as Super Admin");
  try {
    await getFreshAccountAccessDetail(req);
    if (!req.session.isSuperAdmin)
      throw new Error("User is not authorized to access this application.");

    const { _id, command, isNLP } = req.body;
    if (!command)
      return res
        .status(400)
        .send({ status: "failed", error: "command name is mandatory." });

    if (!_id) {
      let commandList = await msutils.getCommandList();
      const existingCmd =
        commandList &&
        commandList.find(
          (cmd) => cmd.command.toLowerCase() === command.toLowerCase()
        );

      if (existingCmd)
        return res
          .status(400)
          .send({ status: "failed", error: "command name is already exists." });
    }
    var payload;
    if (isNLP) {
      payload = {
        isNLP: true,
        command: command,
        processMessage: false,
        helpMessage: "",
      };
    } else {
      const { global, group, params } = req.body;
      const paramObj = {};
      let helpMsg = ""; // need to generate
      params &&
        params.forEach((param) => {
          paramObj[param] = `<${param}>`;
          helpMsg += ` --${param}=value`;
        });
      const botPointer =
        process.env.GEO &&
        process.env.GEO.toUpperCase() !== "GLOBAL" &&
        process.env.GEO.toUpperCase() !== "NA"
          ? `botPointer-${process.env.GEO.toLowerCase()}`
          : "/ck";

      payload = {
        default: false, // in case of global command default should be false
        processMessage: true,
        ms: "",
        command,
        global: global || false,
        group: group,
        params: paramObj,
        helpMessage: `${botPointer} ${command} ${helpMsg} OR <@app_name> ${command} ${helpMsg}`,
      };
    }
    if (_id) await msutils.updateInStore("Commands", _id, payload);
    else await msutils.saveInStore("Commands", payload);
    logger.info("Going to create topic for custom commands for Super Admin");
    await msutils.createEventsTopic(`customCommands_${command}`, "");
    await msutils.refreshCommands();
    res.status(200).send({ success: true });
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});

// Workspace Data to validate and save
app.post("/deleteWorkspace", async function (req, res) {
  logger.info(`Deleting workspace details as Super Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var deleteVariable = req.body.deleteConfirm.toLowerCase();
      var deleteId = req.body.toDeleteID;
      var workspaceError = "";
      if (deleteVariable == "delete") {
        await msutils.deleteDataInStore("Workspace", deleteId);
        await msutils.clearkWorkspacesFromCache();
        logger.info(`Successfully deleted workspace - id: ${deleteId}`);
        res.status(200).send({ delete: true, workspaceError: "" });
      } else {
        workspaceError = "Invalid confirmation";
        logger.error(`Error deleting workspace - id: ${deleteId}`);
        return res.status(400).send({
          workspaceSaved: false,
          workspaceError: workspaceError,
          redirectUrl: baseUrl + "workspaces",
        });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
  }
});
// Workspace Data to validate and save
app.post("/validateSAWorkspace", async function (req, res) {
  logger.info(`Posting workspace details as Super Admin`);
  try {
    await getFreshAccountAccessDetail(req);

    if (req.session.isSuperAdmin) {
      var data = req.body;
      var url = req.headers.referer;
      var workspaceId;
      if (url.includes("?")) {
        workspaceId = url.split("?").pop();
      }
      var checkxoxb = false;
      var xoxpNameCheck = false;
      var xoxbNameCheck = false;
      var xoxbErrorMsg = "";
      var workspaceNameCheck = false;
      var workspaceNameErrorMsg = "";
      var workspaceError = {};
      if (workspaceId != undefined) {
        var workspaceDetail = await msutils.fetchFromStoreById(
          "Workspace",
          workspaceId
        );
        var botFromDb = workspaceDetail.bot;
        if (workspaceDetail.bot.tokens.xoxp != req.body.xoxp) {
          if (req.body.xoxp.toLowerCase().includes("xoxp-")) {
            logger.info(`xoxp token check passed`);
            workspaceDetail["bot"]["tokens"]["xoxp"] = msutils.encrypt(
              req.body.xoxp
            );
          } else {
            xoxpNameCheck = true;
            logger.info(`xoxb token check failed`);
          }
        }
        var dataToPatch = {
          bot: workspaceDetail["bot"],
        };
        if (xoxpNameCheck == false) {
          let result = await msutils.patchDataInStore(
            "Workspace",
            workspaceId,
            dataToPatch
          );
          logger.info(`Successfully patched Workspace collection`);
          res.status(200).send({ workspaceSaved: true, workspaceError: "" });
        } else {
          workspaceError["xoxpNameError"] =
            "xoxp token value should start with < xoxp- >";
          return res.status(400).send({
            workspaceSaved: false,
            workspaceError: workspaceError,
            redirectUrl: baseUrl + "addWorkspaces",
          });
        }
      } else {
        if (req.body.xoxb.toLowerCase().includes("xoxb-")) {
          logger.info(`xoxb token check passed`);
        } else {
          xoxbNameCheck = true;
          logger.info(`xoxb token check failed`);
        }
        if (req.body.xoxp.toLowerCase().includes("xoxp-")) {
          logger.info(`xoxp token check passed`);
        } else {
          xoxpNameCheck = true;
          logger.info(`xoxb token check failed`);
        }
        var encryptedData = {
          signingSecret: msutils.encrypt(req.body.signingSecret),
          xoxp: msutils.encrypt(req.body.xoxp),
          xoxb: msutils.encrypt(req.body.xoxb),
        };
        logger.info(`Successful encription`);
        let result = await msutils.fetchFromStore("settings", {});
        let workspaceFromCollection = await msutils.fetchFromStore(
          "Workspace",
          {}
        );
        let settings = new Map();
        if (result) {
          for (var i = 0; i < result.length; i++) {
            settings.set(result[i].config_name, result[i].config_value);
          }
        }
        logger.info(`Fetched settings data`);
        let tokens = {};
        tokens.xoxb = encryptedData.xoxb;
        tokens.xoxp = encryptedData.xoxp;
        let signingsecret = encryptedData.signingSecret;
        if (tokens && signingsecret) {
          var workspaceApiData = await msutils.fetchWorkspace(
            tokens,
            signingsecret
          );
        }

        if (req.body.workspaceName) {
          workspaceApiData["name"] = req.body.workspaceName;
        }
        if (workspaceApiData != undefined) {
          for (var i = 0; i < workspaceFromCollection.length; i++) {
            if (
              workspaceFromCollection[i].bot.id == workspaceApiData.bot.userId
            ) {
              logger.error(`xoxb value already existing`);
              checkxoxb = true;
              xoxbErrorMsg = "Xoxb token already exists.";
            }
            if (workspaceFromCollection[i].name == workspaceApiData.name) {
              logger.error(`workspace name already existing`);
              workspaceNameCheck = true;
              workspaceNameErrorMsg = "Slack App already exists.";
            }
          }
          if (
            checkxoxb == true ||
            workspaceNameCheck == true ||
            xoxbNameCheck == true ||
            xoxpNameCheck == true
          ) {
            workspaceError["xoxbErr"] = xoxbErrorMsg;
            workspaceError["workspaceNameErr"] =
              "Slack app " +
              workspaceApiData.name +
              " already exist. Please enter a different name to proceed";
            workspaceError["xoxpNameError"] =
              "xoxp token value should start with < xoxp- >";
            workspaceError["xoxbNameError"] =
              "xoxb token value should start with < xoxb- >";
            workspaceError["workspaceName"] = workspaceApiData.name;
            return res.status(400).send({
              workspaceSaved: false,
              workspaceError: workspaceError,
              redirectUrl: baseUrl + "addWorkspaces",
            });
          }

          if (
            checkxoxb == false &&
            workspaceNameCheck == false &&
            xoxbNameCheck == false &&
            xoxpNameCheck == false
          ) {
            if (req.body.workspaceName) {
              workspaceApiData["name"] = req.body.workspaceName;
            }
            await mapToWorkspace(settings, workspaceApiData);
            await msutils.clearkWorkspacesFromCache();
            res.status(200).send({ workspaceSaved: true, workspaceError: "" });
          }
        } else {
          workspaceError["xoxpNameError"] =
            "xoxp token value should start with < xoxp- >";
          workspaceError["xoxbNameError"] =
            "xoxb token value should start with < xoxb- >";
          workspaceError["slackAPIError"] =
            "Please provide proper xoxp token and xoxb token.";
          return res.status(400).send({
            workspaceSaved: false,
            workspaceError: workspaceError,
            redirectUrl: baseUrl + "addWorkspaces",
          });
          // res.status(400).send({ message: "Invalid token!" })
        }
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    console.log(e);
    logger.error(e.message);
  }
});

//Post/Save Accounts details by AA
app.post("/postOnboardAccountDetails", async function (req, res) {
  logger.info(`Posting onboarded accounts details as Account Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    var errMsg = [];
    if (req.session.isAccountAdmin) {
      var data = req.body;
      var resultFetch = await msutils.fetchFromStoreByOptions(
        "MUIAccounts",
        { accountCode: req.body.accCode },
        {}
      );
      if (resultFetch[0].feedStatus) {
        data["feedStatus"] = resultFetch[0].feedStatus;
      }
      var validateResult = await mappingAccountDetails(data);
      if (validateResult == false) {
        errMsg.push(
          "Error occured while updating db. Please recheck all the values entered"
        );
      }
      if (typeof validateResult == "undefined") {
        req.session.message = "success";
        await msutils.clearkWorkspacesFromCache();
        await msutils.refreshAccountsList();
        res.status(200).send({ success: true });
      } else {
        let countryList = await msutils.fetchFromStore("CountryCode", {});
        res.status(400).send({
          errMsg: errMsg,
          success: false,
          bgErr: validateResult["bgerrMsg"],
          pageErr: validateResult["page"],
          groupError: validateResult["grpError"],
          errorData: validateResult,
          countryList: countryList,
        });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.redirect("/mui/home");
  }
});

// Workspace Data to save in Workspace collection
app.post("/addWorkspace", async function (req, res) {
  logger.info(`Posting workspace details as Account Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      var data = req.body;
      var encryptedData = {
        signingSecret: msutils.encrypt(req.body.signingSecret),
        xoxp: msutils.encrypt(req.body.xoxp),
        xoxb: msutils.encrypt(req.body.xoxb),
      };
      var acc_id = data.accCode.toString();
      var is_submitted = false;
      var resultFetch = await msutils.fetchFromStoreByOptions(
        "MUIAccounts",
        { accountCode: acc_id },
        {}
      );
      is_submitted = resultFetch[0].submitted;
      let result = await msutils.fetchFromStore("settings", {});
      let settings = new Map();
      var muiAccountId = data._id;
      var dataToSave = {
        workspaceadminName: data.workspaceAdmin,
        workspaceadminEmail: data.workspaceEmail,
      };
      if (data.workspaceAdmin || data.workspaceEmail) {
        let result = await msutils.patchDataInStore(
          "MUIAccounts",
          muiAccountId,
          dataToSave
        );
      }
      if (result) {
        for (var i = 0; i < result.length; i++) {
          settings.set(result[i].config_name, result[i].config_value);
        }
      }
      let tokens = {};
      tokens.xoxb = encryptedData.xoxb;
      tokens.xoxp = encryptedData.xoxp;
      let signingsecret = encryptedData.signingSecret;
      let collaborationTool = resultFetch[0].collaborationTool;
      if (tokens && signingsecret) {
        var workspaceApiData = await msutils.fetchWorkspace(
          tokens,
          signingsecret
        );
      }
      if (workspaceApiData != undefined) {
        var workspaceFetch = await msutils.fetchFromStoreByOptions(
          "Workspace",
          { name: workspaceApiData.name },
          {}
        );
        if (workspaceFetch.length == 0) {
          await mapToWorkspace(settings, workspaceApiData);
          await msutils.clearkWorkspacesFromCache();
          res
            .status(200)
            .send({ workspace: true, workspaceApiData: workspaceApiData });
        } else {
          res.status(500).send({ message: "Workspace exists!" });
        }
      } else {
        res.status(500).send({ message: "Invalid token!" });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
  }
});
// MS Teams Workspace Data to save in Workspace collection
app.post("/addTeamsWorkspace", async function (req, res) {
  logger.info(`Posting workspace details as Account Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin || req.session.isSuperAdmin) {
      var data = req.body;
      let accountCode = data.accCode;
      let teamName = data.teamName;
      let teamId = data.teamId;
      let name = data.teamName;
      let workspaceType = data.workspaceType;
      let region = data.region;
      let workspaceId = data.workspaceId;

      if (!(teamName && teamId && region)) {
        res
          .status(500)
          .send({ message: "Enter values for all mandatory fields" });
      } else {
        const team = {
          id: teamId,
          name: teamName,
        };
        const workspaceDetail = {
          name,
          accountCode,
          team,
          workspaceType,
          region,
        };

        var workspaceFetch = await msutils.fetchFromStoreByOptions(
          "Workspace",
          { name: name },
          {}
        );
        let result = "";
        logger.info(`workspaceFetch-->${JSON.stringify(workspaceFetch)}`);
        if (
          workspaceFetch.length === 0 &&
          (workspaceId === null || workspaceId === undefined)
        ) {
          result = await msutils.saveInStore("Workspace", workspaceDetail);
        } else if (
          workspaceId &&
          workspaceFetch &&
          workspaceFetch[0]._id === workspaceId
        ) {
          result = await msutils.patchDataInStore(
            "Workspace",
            workspaceId,
            workspaceDetail
          );
        } else {
          res
            .status(500)
            .send({ message: "Workspace/Team Name already exists!" });
        }
        await msutils.clearkWorkspacesFromCache();
        res.status(200).send({ workspace: true, workspaceApiData: result });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
  }
});

// EventStreams page for SA
app.get("/eventStreams", async function (req, res) {
  logger.debug(`Loading Super Admin EventStreams Listing page.`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
// Event Stream form page SA
app.get("/addEventStreams", async function (req, res) {
  logger.debug(`Loading EventStreams Form for SA.`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var ESId;
      var ESDetails = {};
      var url = req.headers.referer;
      if (url.includes("?")) {
        ESId = url.split("?").pop();
      }
      if (ESId != undefined) {
        var eventStreamsDetail = await msutils.fetchFromStoreById(
          "EventStreams",
          ESId
        );
        ESDetails["name"] = eventStreamsDetail.name;
        ESDetails["configurations"] = eventStreamsDetail.configurations;
        res.status(200).send({ ESDataToEdit: ESDetails });
      } else {
        res.sendFile(path.join(__dirname, "build", "index.html"));
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.redirect(baseUrl);
  }
});
// Fetch eventStream data from EventStreams collection for SA
app.get("/fetchEventStreamData", async function (req, res) {
  logger.info(
    `SA EventStreams: Fetching EventStreams data from EventStreams collection `
  );
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var eventStreamList = await msutils.fetchFromStore("EventStreams", {});
      res.status(200).send({
        eventStreamData: eventStreamList,
        redirectUrl: baseUrl + "eventStreams",
      });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});
// Delete EventStream data - SA
app.post("/deleteEventStream", async function (req, res) {
  logger.info(`Deleting EventStream details as Super Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var deleteVariable = req.body.deleteConfirm.toLowerCase();
      var deleteId = req.body.toDeleteID;
      var eventSteamError = "";
      if (deleteVariable == "delete") {
        await msutils.deleteDataInStore("EventStreams", deleteId);
        logger.info(`Successfully deleted eventStream - id: ${deleteId}`);
        res.status(200).send({ delete: true, eventSteamError: "" });
      } else {
        eventSteamError = "Invalid confirmation";
        logger.error(`Error deleting EventStream - id: ${deleteId}`);
        return res.status(400).send({
          eventStreamSaved: false,
          eventSteamError: eventSteamError,
          redirectUrl: baseUrl + "eventStreams",
        });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
  }
});
// post Eventstream data to EventStreams collection -- SA
app.post("/saveEventStreams", async function (req, res) {
  logger.info(`Saving EventStream details as Super Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var data = req.body;
      var ESId;
      var ESNameCheck = false;
      var url = req.headers.referer;
      if (url.includes("?")) {
        ESId = url.split("?").pop();
      }
      var parsedJson;
      var ESName = req.body.name;
      var ESConfig = req.body.configuration;
      if (ESId) {
        // EDIT FLow
        parsedJson = ESConfig;
      } else {
        // CREATE encryption
        parsedJson = JSON.parse(ESConfig);
        let api_key = parsedJson["api_key"];
        let apikey = parsedJson["apikey"];
        let password = parsedJson["password"];
        let token = parsedJson["user"];
        if (api_key) {
          parsedJson["api_key"] = msutils.encrypt(api_key);
        }
        if (apikey) {
          parsedJson["apikey"] = msutils.encrypt(apikey);
        }
        if (password) {
          parsedJson["password"] = msutils.encrypt(password);
        }
        if (token) {
          parsedJson["token"] = msutils.encrypt(token);
        }
      }

      var dataToSave = {};
      var eventStreamsError = {};

      if (ESId != undefined) {
        // EDIT
        var eventStreamsDetail = await msutils.fetchFromStoreById(
          "EventStreams",
          ESId
        );
        var dataToPatch = {};
        var configData = eventStreamsDetail.configurations;
        dataToPatch.name = data.name;
        var configurationDetails = {};
        if (typeof data.configuration == "string") {
          // configuratioln value changed
          configurationDetails = JSON.parse(data.configuration);
        } else {
          // configuration not changed
          configurationDetails = data.configuration;
        }
        var api_key = configurationDetails["api_key"];
        var apikey = configurationDetails["apikey"];
        var password = configurationDetails["password"];
        var token = configurationDetails["token"];
        if (configData.api_key != configurationDetails.api_key) {
          if (api_key) {
            configurationDetails["api_key"] = msutils.encrypt(api_key);
          }
        }
        if (configData.apikey != configurationDetails.apikey) {
          if (apikey) {
            configurationDetails["apikey"] = msutils.encrypt(apikey);
          }
        }
        if (configData.password != configurationDetails.password) {
          if (password) {
            configurationDetails["password"] = msutils.encrypt(password);
          }
        }
        if (configData.token != configurationDetails.token) {
          if (token) {
            configurationDetails["token"] = msutils.encrypt(token);
          }
        }
        dataToPatch.configurations = configurationDetails;
        let result = await msutils.patchDataInStore(
          "EventStreams",
          ESId,
          dataToPatch
        );
        logger.info(`Successfully patched EventStrems collection`);
        res.status(200).send({ ESSaved: true, eventStreamsError: "" });
      } else {
        // CREATE
        logger.info(`Creating EventStreams data`);
        if (parsedJson) {
          let ESFromCollection = await msutils.fetchFromStore(
            "EventStreams",
            {}
          );
          for (var i = 0; i < ESFromCollection.length; i++) {
            if (ESFromCollection[i].name == ESName) {
              ESNameCheck = true;
              ESNameErrorMsg = "EventStream already exists.";
            }
          }
          if (ESNameCheck == true) {
            eventStreamsError["jsonErr"] =
              "EventStream " + ESName + " already exist.";
            return res.status(400).send({
              ESSaved: false,
              eventStreamsError: eventStreamsError,
              redirectUrl: baseUrl + "addEventStreams",
            });
          }
          dataToSave.name = ESName;
          dataToSave.configurations = parsedJson;
          await msutils.saveInStore("EventStreams", dataToSave);
          logger.info(`Successfully saved data to EventStrems collection`);
          res.status(200).send({ ESSaved: true, eventStreamsError: "" });
        } else {
          eventStreamsError["jsonErr"] =
            "Some error occured while saving. Please check the json provided";
          return res.status(400).send({
            ESSaved: false,
            eventStreamsError: eventStreamsError,
            redirectUrl: baseUrl + "addEventStreams",
          });
        }
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    console.log(e);
    logger.error(e.message);
    var eventStreamsError = {};
    if (
      e.message.includes("Unexpected string in JSON") ||
      e.message.includes("Unexpected end of JSON input") ||
      e.message.includes("Unexpected token : in JSON")
    ) {
      eventStreamsError["jsonErr"] = "Please enter valid json";
    }
    return res.status(400).send({
      ESSaved: false,
      eventStreamsError: eventStreamsError,
      redirectUrl: baseUrl + "addEventStreams",
    });
  }
});
// Features page for SA
app.get("/features", async function (req, res) {
  logger.info(`Loading Super Feature Listing page.`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
// Add Global Assignments SA
app.get("/addFeature", async function (req, res) {
  logger.info(`Loading Add feature Form for SA`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.redirect(baseUrl);
  }
});
// Fetch Features for SA Featue List page
app.get("/fetchfeatureData", async function (req, res) {
  logger.info(`SA Features: Fetching features data from Features collection `);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      let FeatureList = await msutils.fetchFromStore("Features", {});
      let accountsList = await msutils.fetchFromStore("MUIAccounts", {});
      let accountCodesAddFeatures = [];
      var accountCodes = ["Choose an Option"];
      for (var i = 0; i < accountsList.length; i++) {
        accountCodes.push(accountsList[i].accountCode);
        if (
          accountsList[i].submitted === true &&
          accountsList[i].saved === false
        )
          accountCodesAddFeatures.push(accountsList[i].accountCode);
      }
      res.status(200).send({
        featureData: FeatureList,
        accountCodes: accountCodes,
        redirectUrl: baseUrl + "features",
        accountForAddFeature: accountCodesAddFeatures,
      });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});
// post Feature data to Features collection -- SA
app.post("/saveFeature", async function (req, res) {
  logger.info(`SA Features: Saving feature data to Features collection `);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var data = req.body;
      var validateFeature = await postToFeature(data);
      if (validateFeature.successFlag == false) {
        logger.error(validateFeature.validateFeatureMsgNew);
        res
          .status(400)
          .send({ fetch: false, fetchErrorfromFeature: validateFeature });
      } else {
        res
          .status(200)
          .send({ fetch: true, fetchSuccessfromFeature: validateFeature });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    logger.error(e.message);
  }
});
// Global Assignments page for SA
app.get("/globalAssignments", async function (req, res) {
  logger.info(`Loading Super Admin Global Assignments Listing page.`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
// Add Global Assignments SA
app.get("/addGlobalAssignments", async function (req, res) {
  logger.info(`Loading Global Assignments Form for SA`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var globalAssignmnetID;
      var assignmentDetails = {};
      var url = req.headers.referer;
      if (url.includes("?")) {
        globalAssignmnetID = url.split("?").pop();
      }
      if (globalAssignmnetID != undefined) {
        var fetchedResult = await msutils.fetchFromStoreById(
          "GlobalAssignments",
          globalAssignmnetID
        );
        logger.info(
          `Successfully fetched GLobal Assignments data from collection to edit`
        );
        assignmentDetails["name"] = fetchedResult.name;
        assignmentDetails["groups"] = fetchedResult.groups;
        assignmentDetails["rule"] = fetchedResult.rule;
        res.status(200).send({ globalAssignmentDataToEdit: assignmentDetails });
      } else {
        res.sendFile(path.join(__dirname, "build", "index.html"));
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.redirect(baseUrl);
  }
});
app.get("/addglobalAssignmentData", async function (req, res) {
  logger.info(`Fetching Data for SA Index Channel Form `);
  await getFreshAccountAccessDetail(req);
  if (req.session.isSuperAdmin) {
    await msutils.clearkWorkspacesFromCache();
    let workspaceList = await msutils.fetchSlackWorkspaces();
    let countryList = await msutils.fetchFromStore("CountryCode", {});
    let industryList = await msutils.fetchFromStore("IndustryCodeList", {});
    let sectorList = await msutils.fetchFromStore("SectorCodeList", {});
    let geoList = await msutils.fetchFromStore("GeoCodeList", {});
    let marketList = [];
    var geoListNew = geoList.sort(function (a, b) {
      if (a.geo == b.geo) return 0;
      if (a.geo == "Choose an Option") return -1;
      if (b.geo == "Choose an Option") return 1;
      if (a.key < b.key) return -1;
      if (a.key > b.key) return 1;
      return 0;
    });
    for (let val of geoListNew) {
      if (val.market != "Choose an Option") {
        marketList = [].concat.apply(marketList, val.market);
      }
    }
    res.status(200).send({
      addIndexChannelData: workspaceList,
      countryList: countryList,
      industryList: industryList,
      sectorList: sectorList,
      geoList: geoList,
      marketList: marketList,
    });
  } else {
    throw new Error("User is not authorized to access this application.");
  }
});

// Fetch eventStream data from EventStreams collection for SA
app.get("/fetchGlobalAssignmentsData", async function (req, res) {
  logger.info(
    `SA Global Assignments: Fetching Global Assignments data from GlobalAssignments collection `
  );
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var globalAssignmentsList = await msutils.fetchFromStore(
        "GlobalAssignments",
        {}
      );
      res.status(200).send({
        globalAssignmentsData: globalAssignmentsList,
        redirectUrl: baseUrl + "globalAssignments",
      });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});
// post Global Assignment data to GlobalAssignment collection -- SA
app.post("/saveGlobalAssignment", async function (req, res) {
  logger.info(
    `SA Index Channel: Saving Index Channel data to Settings collection `
  );
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var data = req.body;
      if (req.body.rule != "" && req.body.rule != undefined) {
        var ruleFromUI = req.body.rule.toString();
        data["ruleFromUI"] = ruleFromUI;
      } else {
        data["ruleFromUI"] = "*";
      }
      var url = req.headers.referer;
      var globalAssignmentID;
      if (url.includes("?")) {
        globalAssignmentID = url.split("?").pop();
        data["globalAssignmentID"] = globalAssignmentID;
      }
      var validateGlobalAssignment = await postToGlobalAssignment(data);
      await msutils.refreshGlobalAssignments();
      if (validateGlobalAssignment.successFlag == false) {
        logger.error(validateGlobalAssignment.validateGLobalAssignmentMsgNew);
        res.status(400).send({
          fetch: false,
          fetchErrorfromGlobalAssignment: validateGlobalAssignment,
        });
      } else {
        res.status(200).send({
          fetch: true,
          fetchSuccessfromGlobalAssignment: validateGlobalAssignment,
        });
      }
      var rule = ruleFromUI;
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    logger.error(e.message);
  }
});
// Delete Assistants data from Assistantscollection
app.post("/deleteGlobalAssignments", async function (req, res) {
  logger.info(`Deleting assignment details as Super Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var deleteVariable = req.body.deleteConfirm.toLowerCase();
      var deleteId = req.body.toDeleteID;
      var globalAssignmentErr = "";
      if (deleteVariable == "delete") {
        await msutils.deleteDataInStore("GlobalAssignments", deleteId);
        logger.info(`Successfully deleted Assignmnet - id: ${deleteId}`);
        res.status(200).send({ delete: true, globalAssignmentErr: "" });
      } else {
        globalAssignmentErr = "Invalid confirmation";
        logger.error(`Error deleting Assignment - id: ${deleteId}`);
        return res.status(400).send({
          eventStreamSaved: false,
          globalAssignmentErr: globalAssignmentErr,
          redirectUrl: baseUrl + "globalAssignments",
        });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
  }
});
// Index channel page for SA
app.get("/indexChannels", async function (req, res) {
  logger.info(`Loading Super Admin Index Channel Listing page.`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
// Add Index Channel SA
app.get("/addIndexChannel", async function (req, res) {
  logger.info(`Loading Index Channel Form for SA`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var inndexChannelId;
      var inexChannelDetails = {};
      var url = req.headers.referer;
      if (url.includes("?")) {
        inndexChannelId = url.split("?").pop();
      }
      if (inndexChannelId != undefined) {
        var indexChannelFromSettings = await msutils.fetchFromStore(
          "settings",
          { config_name: "globalIndexChannels" }
        );
        var indexChannnelList = indexChannelFromSettings[0].config_value;
        var filteredResult = indexChannnelList.filter((obj) => {
          return obj.channel == inndexChannelId;
        });
        logger.info(
          `Successfully fetched Index Channel data from collection to edit`
        );
        inexChannelDetails["channel"] = filteredResult[0].channel;
        inexChannelDetails["rule"] = filteredResult[0].rule;
        inexChannelDetails["workspaceName"] = filteredResult[0].workspaceName;
        inexChannelDetails["minify"] = filteredResult[0].minify;
        inexChannelDetails["workspaceType"] = filteredResult[0].workspaceType;
        res.status(200).send({ indexChannelDataToEdit: inexChannelDetails });
      } else {
        res.sendFile(path.join(__dirname, "build", "index.html"));
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.redirect(baseUrl);
  }
});
app.get("/addIndexChannelData", async function (req, res) {
  logger.info(`Fetching Data for SA Index Channel Form `);
  await getFreshAccountAccessDetail(req);
  if (req.session.isSuperAdmin) {
    await msutils.clearkWorkspacesFromCache();
    let workspaceList = await msutils.fetchSlackWorkspaces();
    let countryList = await msutils.fetchFromStore("CountryCode", {});
    let industryList = await msutils.fetchFromStore("IndustryCodeList", {});
    let sectorList = await msutils.fetchFromStore("SectorCodeList", {});
    let geoList = await msutils.fetchFromStore("GeoCodeList", {});
    let marketList = [];
    var geoListNew = geoList.sort(function (a, b) {
      if (a.geo == b.geo) return 0;
      if (a.geo == "Choose an Option") return -1;
      if (b.geo == "Choose an Option") return 1;
      if (a.key < b.key) return -1;
      if (a.key > b.key) return 1;
      return 0;
    });
    for (let val of geoListNew) {
      if (val.market != "Choose an Option") {
        marketList = [].concat.apply(marketList, val.market);
      }
    }
    res.status(200).send({
      addIndexChannelData: workspaceList,
      countryList: countryList,
      industryList: industryList,
      sectorList: sectorList,
      geoList: geoList,
      marketList: marketList,
    });
  } else {
    throw new Error("User is not authorized to access this application.");
  }
});
// Fetch Index Channel for SA Index Channel List page
app.get("/fetchIndexChannelData", async function (req, res) {
  logger.info(
    `SA Index Channel: Fetching Index Channel data from Settings collection `
  );
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var indexChannelFromSettings = await msutils.fetchFromStore("settings", {
        config_name: "globalIndexChannels",
      });
      var indexChannnelList = indexChannelFromSettings[0].config_value;
      res.status(200).send({
        inedexChannelData: indexChannnelList,
        redirectUrl: baseUrl + "indexChannels",
      });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});
// post IndexChannel data to settings collection -- SA
app.post("/saveIndexChannel", async function (req, res) {
  logger.info(
    `SA Index Channel: Saving Index Channel data to Settings collection `
  );
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var data = req.body;
      if (req.body.rule != "" && req.body.rule != undefined) {
        var ruleFromUI = req.body.rule.toString();
        data["ruleFromUI"] = ruleFromUI;
      } else {
        data["ruleFromUI"] = "*";
      }
      var validateIndexChannel = await postToSettingsIndexChannel(data);
      await msutils.refreshSettings("globalIndexChannels");
      if (validateIndexChannel.successFlag == false) {
        logger.error(validateIndexChannel.validateChannelMsgNew);
        res.status(400).send({
          fetch: false,
          fetchErrorfromIndexChannel: validateIndexChannel,
        });
      } else {
        res.status(200).send({
          fetch: true,
          fetchSuccessfromIndexChannel: validateIndexChannel,
        });
      }

      var rule = ruleFromUI;
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    logger.error(e.message);
  }
});
// Delete Assistants data from Assistantscollection
app.post("/deleteIndexChannel", async function (req, res) {
  logger.info(`Deleting Index Channel details as Super Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var deleteVariable = req.body.deleteConfirm.toLowerCase();
      var deleteId = req.body.toDeleteID;
      var indexChannelFromSettings = await msutils.fetchFromStore("settings", {
        config_name: "globalIndexChannels",
      });
      var patchID = indexChannelFromSettings[0]._id;
      var indexChannnelList = indexChannelFromSettings[0].config_value;
      var deleteRecord = indexChannnelList.filter((obj) => {
        return obj.channel == deleteId;
      });
      var indexChannelError = "";
      if (deleteVariable == "delete") {
        var removeByAttr = function (arr, attr, value) {
          var i = arr.length;
          while (i--) {
            if (
              arr[i] &&
              arr[i].hasOwnProperty(attr) &&
              arguments.length > 2 &&
              arr[i][attr] === value
            ) {
              arr.splice(i, 1);
            }
          }
          return arr;
        };
        var toPatch = removeByAttr(indexChannnelList, "channel", deleteId);
        var finalData = {};
        finalData["config_name"] = indexChannelFromSettings[0].config_name;
        finalData["config_value"] = toPatch;
        var resulToSave = await msutils.patchDataInStore(
          "settings",
          patchID,
          finalData
        );
        await msutils.refreshSettings("globalIndexChannels");
        logger.info(`Successfully deleted Assistant - id: ${deleteId}`);
        res.status(200).send({ delete: true, indexChannelError: "" });
      } else {
        indexChannelError = "Invalid confirmation.";
        logger.error(`Error deleting AssisIndex CHannel - id: ${deleteId}`);
        return res.status(400).send({
          ICSaved: false,
          indexChannelError: indexChannelError,
          redirectUrl: baseUrl + "indexChannels",
        });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
  }
});

// Assistants page for SA
app.get("/assistants", async function (req, res) {
  logger.info(`Loading Super Admin Assistants Listing page.`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
// Add Assistantspage SA
app.get("/addAssistants", async function (req, res) {
  logger.info(`Loading Assistants Form for SA.`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var assistantsId;
      var assistantsDetails = {};
      var url = req.headers.referer;
      if (url.includes("?")) {
        assistantsId = url.split("?").pop();
      }
      if (assistantsId != undefined) {
        var assistantsDetailFromDB = await msutils.fetchFromStoreById(
          "Assistants",
          assistantsId
        );
        if (assistantsDetailFromDB.groups) {
          assistantsDetails["groups"] = assistantsDetailFromDB.groups.join(",");
        }
        assistantsDetails["name"] = assistantsDetailFromDB.name;
        assistantsDetails["url"] = assistantsDetailFromDB.url;
        assistantsDetails["apiKey"] = assistantsDetailFromDB.apiKey;
        assistantsDetails["version"] = assistantsDetailFromDB.version;
        assistantsDetails["version"] = assistantsDetailFromDB.version;
        logger.info(
          `Successfully fetched Assistant data from collection to edit`
        );
        res.status(200).send({ assistantsDataToEdit: assistantsDetails });
      } else {
        res.sendFile(path.join(__dirname, "build", "index.html"));
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.redirect(baseUrl);
  }
});
// Fetch Assistants for SA Assistants List page
app.get("/fetchAssistantsData", async function (req, res) {
  logger.info(
    `SA Assistants: Fetching Assistants data from Assistants collection `
  );
  try {
    await msutils.clearkWorkspacesFromCache();
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      await msutils.refreshAssistants();
      let assistantsList = await msutils.getAssistants();
      res.status(200).send({
        assistantsData: assistantsList,
        redirectUrl: baseUrl + "assistants",
      });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});
// Delete Assistants data from Assistantscollection
app.post("/deleteAssistants", async function (req, res) {
  logger.info(`Deleting Assistant details as Super Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var deleteVariable = req.body.deleteConfirm.toLowerCase();
      var deleteId = req.body.toDeleteID;
      var deleteRecord = await msutils.fetchFromStoreById(
        "Assistants",
        deleteId
      );
      var assistantsError = "";
      if (deleteVariable == "delete" && deleteRecord.name != "primary") {
        await msutils.deleteDataInStore("Assistants", deleteId);
        await msutils.refreshAssistants();
        logger.info(`Successfully deleted Assistant - id: ${deleteId}`);
        res.status(200).send({ delete: true, assistantsError: "" });
      } else {
        assistantsError = "Invalid confirmation.";
        logger.error(`Error deleting Assistant - id: ${deleteId}`);
        return res.status(400).send({
          assistantSaved: false,
          assistantsError: assistantsError,
          redirectUrl: baseUrl + "assistants",
        });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
  }
});

// post Eventstream data to EventStreams collection -- SA
app.post("/saveAssistants", async function (req, res) {
  logger.info(`Saving Assistants details as Super Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      var data = req.body;
      var assistantID;
      var assistantNameCheck = false;
      var urlCheck = false;
      var versionCheck = false;
      var url = req.headers.referer;
      var encryptedApiKey;
      if (url.includes("?")) {
        assistantID = url.split("?").pop();
      }
      if (assistantID) {
        // EDIT FLow
        var assistantDetail = await msutils.fetchFromStoreById(
          "Assistants",
          assistantID
        );
        var apiKeyDataFromDB = assistantDetail.apiKey;
        var apiFromUI = data.apiKey;
        if (apiKeyDataFromDB != apiFromUI) {
          logger.info(`Encryption of key in progress`);
          encryptedApiKey = msutils.encrypt(data.apiKey);
        } else {
          encryptedApiKey = data.apiKey;
        }
      } else {
        // CREATE encryption
        if (data.apiKey) {
          logger.info(`Encryption of key in progress`);
          encryptedApiKey = msutils.encrypt(data.apiKey);
        }
      }
      var dataToSave = {};
      var assistantsError = {};
      var bgArrToSave = [];
      if (data.groups) {
        var bgList = data.groups.split(",");
        for (var i = 0; i < bgList.length; i++) {
          bgArrToSave.push(bgList[i]);
        }
      } else {
        bgArrToSave = [];
      }
      let assistantFromCollection = await msutils.fetchFromStore(
        "Assistants",
        {}
      );
      for (var i = 0; i < assistantFromCollection.length; i++) {
        if (
          assistantFromCollection[i].name == data.name &&
          assistantID == undefined
        ) {
          assistantNameCheck = true;
          logger.info(`Unique name check failed`);
        }
      }
      if (assistantNameCheck == false) {
        logger.info(`Unique name check passed`);
      }
      if (data.url.indexOf("https") == 0) {
        logger.info(`url check passed`);
      } else {
        urlCheck = true;
        logger.info(`url check failed`);
      }
      if (data.version.includes("version=")) {
        logger.info(`Version check passed`);
      } else {
        versionCheck = true;
        logger.info(`Version check failed`);
      }
      if (assistantNameCheck == true) {
        assistantsError["assistantNameErr"] =
          "Assistant " + data.name + " already exist.";
      }
      if (urlCheck == true) {
        assistantsError["assistantURLErr"] = "URL should start with https";
      }
      if (versionCheck == true) {
        assistantsError["assistantVersionErr"] =
          "Version should be of format 'version=<value>' ";
      }
      if (assistantID != undefined) {
        // EDIT
        logger.info(`Editing Assistants data`);
        var dataToPatch = {};
        dataToPatch.name = data.name;
        dataToPatch.url = data.url;
        dataToPatch.version = data.version;
        dataToPatch.groups = bgArrToSave;
        dataToPatch.apiKey = encryptedApiKey;
        if (urlCheck == false && versionCheck == false) {
          logger.info(
            `All checks passed. Patching Asssitant data to Asssitants collection for ${assistantID} `
          );
          let result = await msutils.patchDataInStore(
            "Assistants",
            assistantID,
            dataToPatch
          );
          await msutils.refreshAssistants();
          logger.info(`Successfully patched data to Assistants collection`);
          res.status(200).send({ assistantSaved: true, assistantsError: "" });
        } else {
          assistantsError["assistantSaveErr"] =
            "Some error occured while saving. Please check the data provided";
          return res.status(400).send({
            assistantSaved: false,
            assistantsError: assistantsError,
            redirectUrl: baseUrl + "addAssistants",
          });
        }
      } else {
        // CREATE
        logger.info(`Creating Assistant data`);
        if (data) {
          if (
            assistantNameCheck == false &&
            urlCheck == false &&
            versionCheck == false
          ) {
            logger.info(
              `All checks passed. Saving Asssitant data to Asssitants collection`
            );
            dataToSave.name = data.name;
            dataToSave.url = data.url;
            dataToSave.version = data.version;
            dataToSave.apiKey = encryptedApiKey;
            dataToSave.groups = bgArrToSave;
            await msutils.saveInStore("Assistants", dataToSave);
            await msutils.refreshAssistants();
            logger.info(`Successfully saved data to Assistants collection`);
            res.status(200).send({ assistantSaved: true, assistantsError: "" });
          } else {
            assistantsError["assistantSaveErr"] =
              "Some error occured while saving. Please check the data provided";
            return res.status(400).send({
              assistantSaved: false,
              assistantsError: assistantsError,
              redirectUrl: baseUrl + "addAssistants",
            });
          }
        } else {
          assistantsError["assistantErr"] =
            "Some error occured while saving. Please check the data provided";
          return res.status(400).send({
            assistantSaved: false,
            assistantsError: assistantsError,
            redirectUrl: baseUrl + "addAssistants",
          });
        }
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    logger.error(e.message);
  }
});

// Fetch settings for service manager email domains
app.get("/fetchAllowedDomains", async function (req, res) {
  logger.info(`SM: Fetching Allowed Domains data from settings collection `);
  try {
    const domainSettings = await msutils.fetchSettings("allowedDomains");
    if (domainSettings) {
      res.status(200).send({ domainData: domainSettings });
    } else {
      res.status(400).send({ domainData: [] });
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});

app.post("/encryptSecret", async function (req, res) {
  if (req.body) {
    var encrypted = {};
    var signingSecretEnctext = req.body.signingSecret;
    var xoxpEnctext = req.body.xoxp;
    var xoxbEnctext = req.body.xoxb;
    if (signingSecretEnctext != "" && signingSecretEnctext != undefined) {
      var signingSecret = await msutils.encrypt(signingSecretEnctext);
      encrypted["signingSecret"] = signingSecret;
    }
    if (xoxbEnctext != "" && xoxbEnctext != undefined) {
      var xoxb = await msutils.encrypt(xoxbEnctext);
      encrypted["xoxb"] = xoxb;
    }
    if (xoxpEnctext != "" && xoxpEnctext != undefined) {
      var xoxp = await msutils.encrypt(xoxpEnctext);
      encrypted["xoxp"] = xoxp;
    }
    app.set("encryptedData", encrypted);
    res.status(200).send({ encrypted: encrypted });
  }
});
app.get("/encryptSecret", async function (req, res) {
  if (app.get("encryptedData") != "" && app.get("encryptedData") != undefined) {
    var encrypted = {};
    var encryptedData = app.get("encryptedData");
    if (
      encryptedData.signingSecret != "" &&
      encryptedData.signingSecret != undefined
    ) {
      encrypted["signingSecret"] = encryptedData.signingSecret;
    }
    if (encryptedData.xoxb != "" && encryptedData.xoxb != undefined) {
      encrypted["xoxb"] = encryptedData.xoxb;
    }
    if (encryptedData.xoxp != "" && encryptedData.xoxp != undefined) {
      encrypted["xoxp"] = encryptedData.xoxp;
    }
    res.status(200).send({ encrypted: encrypted });
  }
});

app.post("/testToolConnection", async function (req, res) {
  logger.info(`Posting testToolConnection details as Account Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      var data = req.body;
      let response = await isValidConnection(data);
      if (response == true) {
        res.status(200).send({ connection: true, toolData: data });
      } else {
        res.status(500).send({ connection: false, toolData: data });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
  }
});

// redirect to Command registraion page for Acc Admin // per account
app.get("/commandRegistraton", async function (req, res) {
  logger.info(`Loading Command Registration page for Account Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

app.post("/postAccCodeCommandRegistration", async function (req, res) {
  logger.info("Processing Account Data for command registration filter");
  await getFreshAccountAccessDetail(req);
  var errMsg = [];
  if (req.session.isAccountAdmin) {
    if (req.body) {
      var accCode = req.body.accountCodeFilter;
      var accData = {};
      accData["accCode"] = accCode;
      app.set("accData", accData);
      res.status(200).send({ accountCodeForCommandReg: accCode });
    }
  } else {
    throw new Error("User is not authorized to access this application.");
  }
});
// Fetch Command registration data from #Commands collection
app.get("/fetchCommandRegistered", async function (req, res) {
  logger.info(`Fetching Commands data for Account Admin`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      var url = req.headers.referer;
      var accountData = {};
      var uniqueNames = [];
      var accountToPush = [];

      if (url.includes("=") && url.includes("?")) {
        var cmdId = url.split("=").pop();
      } else {
        var id = url.split("?").pop();
      }
      if (id) {
        var accountDetail = await msutils.fetchFromStoreById("MUIAccounts", id);
        var accountCommands = await msutils.fetchFromStore("Commands", {});

        for (var i = 0; i < accountCommands.length; i++) {
          var accCodeFromDB = accountCommands[i].accountCode;
          if (accCodeFromDB != undefined) {
            accountToPush.push(accCodeFromDB);
            uniqueNames = Array.from(new Set(accountToPush));
          }
        }
        if (accountDetail) {
          var accountCodeFetched = accountDetail.accountCode;
          var accountNameFetched = accountDetail.accountName;
        }
        accountData["accCode"] = accountCodeFetched;
        accountData["accName"] = accountNameFetched;
        accountData["_id"] = id;
        accountData["uniqueNames"] = uniqueNames;
        if (app.get("accData") != undefined) {
          var accCodeFromUI = app.get("accData");
          var accCodeToFetch = accCodeFromUI.accCode;
        }
        if (accCodeFromUI) {
          var accData = {};
          accData["accCode"] = "";
          app.set("accData", accData);
          if (accCodeToFetch != "") {
            var dynamicWorkflowData = await msutils.fetchFromStore("Commands", {
              accountCode: accCodeToFetch,
            });
          } else {
            var dynamicWorkflowData = await msutils.fetchFromStore(
              "Commands",
              {}
            );
          }
        } else {
          var dynamicWorkflowData = await msutils.fetchFromStore(
            "Commands",
            {}
          );
          var commandData = await msutils.fetchFromStore("Commands", {
            accountCode: accountCodeFetched,
          });
        }
        res.status(200).send({
          dynamicWorkflowData: dynamicWorkflowData,
          accountData: accountData,
        });
      } else {
        var CommandRegistrationData = await msutils.fetchFromStoreById(
          "Commands",
          cmdId
        );
        var cmdAccCode = CommandRegistrationData.accountCode;
        var accountDetail = await msutils.fetchFromStore("MUIAccounts", {
          accountCode: cmdAccCode,
        });
        if (accountDetail) {
          var accountCodeFetched = accountDetail[0].accountCode;
          var accountNameFetched = accountDetail[0].accountName;
          var accID = accountDetail[0]._id;
        }
        var dynamicWorkflowData = await msutils.fetchFromStore("Commands", {});
        // var commandData = await msutils.fetchFromStore('Commands', {
        //     'commands.accountCode': accountCodeFetched,
        // });
        var accountData = {};
        accountData["accCode"] = accountCodeFetched;
        accountData["accName"] = accountNameFetched;
        accountData["_id"] = accID;
        res.status(200).send({
          dynamicWorkflowData: dynamicWorkflowData,
          accountData: accountData,
          commandData: CommandRegistrationData,
        });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    logger.error(e.message);
    res.redirect(baseUrl);
  }
});

// redirect to Command Registraio form for Account Admin
app.get("/addCommandRegistraton", async function (req, res) {
  logger.info(`Loading Add/Edit Command Registration page for Account Admin`);
  try {
    logger.info(`Add/Edit Command Registration page try block`);
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.info(`Catch block`);
    logger.error(e);
    logger.error(e.message);
    res.redirect(baseUrl);
  }
});

// Post Command Registration to DynamicWorksflow collection
app.post("/postCommandRegistration", async function (req, res) {
  logger.info(`Saving Command Registration Details`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      var dynamicWorkflowData = {};
      var url = req.headers.referer;
      var cmdId = "";
      if (url.includes("id")) {
        cmdId = url.split("=").pop();
      } else {
        cmdId = "";
      }
      var id = req.body.accID;
      var accCode = req.body.accCode;
      var groupValid = 0;
      var groupResult = {};
      var bgErr = [];
      var data = {};
      var paramsData = [];
      var params = {};
      logger.info(`Processing Group Validation`);
      if (req.body.group != "" && req.body["group"]) {
        var groupList = req.body.group.split(",");
        for (var i = 0; i < groupList.length; i++) {
          var groupVal = groupList[i];
          let result = await isGroupValid(groupVal);
          if (result == false) {
            groupResult[groupVal] = result;
            groupValid = 1;
            bgErr.push("Please enter valid Group.");
          }
        }
        logger.info(`Exiting Group Validation`);
        data["command"] = req.body.command;
        dynamicWorkflowData["command"] = req.body.command;
        dynamicWorkflowData["group"] = req.body.group;
        dynamicWorkflowData["params"] = params;
        dynamicWorkflowData["accCode"] = accCode;
        dynamicWorkflowData["_id"] = cmdId;
        dynamicWorkflowData["paramSequence"] = req.body.paramSequence;
        if (groupValid == 0) {
          logger.info(`Successful validation. Saving and Redirecting `);
          await mapToDynamicWorkflow(dynamicWorkflowData);
          await msutils.refreshCommands();
          res.status(200).send({ success: true });
        } else {
          logger.error(`Group Validation Failed in /addCommandRegistration.`);
          let errdata = {};
          let data = {};
          var id = req.body.accID;
          errdata["groupValidation"] = false;
          data = { id: id };
          if (typeof id !== "undefined") {
            errdata["id"] = id;
          } else {
            errdata["id"] = "";
          }
          errdata["message"] = "Please add a valid Group";
          res
            .status(500)
            .send({ redirectUrl: "/mui/addCommandRegistration" + id, errdata });
        }
      } else if (req.body.group != undefined || !req.body["group"]) {
        data["command"] = req.body.command;
        dynamicWorkflowData["command"] = req.body.command;
        dynamicWorkflowData["group"] = "";
        dynamicWorkflowData["params"] = params;
        dynamicWorkflowData["accCode"] = accCode;
        dynamicWorkflowData["paramSequence"] = req.body.paramSequence;
        dynamicWorkflowData["_id"] = cmdId;
        logger.info(`Successful validation. Saving and Redirecting `);
        await mapToDynamicWorkflow(dynamicWorkflowData);
        await msutils.refreshCommands();
        res.status(200).send({ success: true });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    logger.error(e.message);
  }
});

app.post("/validateEmail", async function (req, res) {
  let emailId = [];
  emailId[0] = req.body.email;
  let enterprise = req.body.enterpriseName;
  try {
    if (emailId.length) {
      // const isValid = await isValidEmail(req.body.email);
      const isValid = await isValidEmail(req.body.email);
      const isValidDomain = await msutils.validateEnterpriseEmails(
        enterprise,
        emailId
      );
      if (!isValid || !isValidDomain)
        return res.status(404).send({
          errMsg: "Please provide a valid email",
          valid: false,
          saveStatus: "false",
        });
    }
  } catch (e) {
    return res
      .status(400)
      .send({ errMsg: "Invalid email id", saveStatus: "false" });
  }
  res.status(200).send({ return: "true", valid: true });
});

app.post("/saveAuthServices", async function (req, res) {
  logger.info("Saving Auth for services");
  try {
    // const {id} = req.params
    var serviceDataDetails = await msutils.fetchFromStoreByOptions(
      "SourceSystems",
      { SourceIdentificationCode: req.body.serviceName },
      {}
    );
    let serviceDataDetailsFetched = serviceDataDetails[0];
    const apiAuthKeyVal = req.body.allowApi;
    var keyValue = req.body.keyName;
    // Store the auth key in the DB
    if (serviceDataDetailsFetched) {
      var keySpecifications =
        serviceDataDetailsFetched.keySpecifications[keyValue];
      if (apiAuthKeyVal != undefined) {
        serviceDataDetailsFetched.keySpecifications[keyValue][
          "allowPlainAuth"
        ] = apiAuthKeyVal;
      }
      var documentId = serviceDataDetailsFetched._id;
      delete serviceDataDetailsFetched.allowPlainAuth;
      delete serviceDataDetailsFetched._id;
      await msutils.updateInStore(
        "SourceSystems",
        documentId,
        serviceDataDetailsFetched
      );
      await msutils.refreshSourceSystems();
    }
    const loggedInUser = req.user.id;
    let result;
    if (serviceDataDetailsFetched.keys) {
      Object.keys(serviceDataDetailsFetched.keys).forEach((key) => {
        serviceDataDetailsFetched.keys[key] = `COSK-${msutils.decrypt(
          serviceDataDetailsFetched.keys[key]
        )}`;
      });
    }
    if (serviceDataDetailsFetched.keySpecifications) {
      Object.keys(serviceDataDetailsFetched.keySpecifications).forEach(
        (key) => {
          let keySpec = serviceDataDetailsFetched.keySpecifications[key];
          if (keySpec.accountApproval) {
            result = keySpec.accountApproval.reduce(function (ids, obj) {
              if (obj.status === "rejected") {
                ids.push(obj.accountCode);
              }
              return ids;
            }, []);
          }

          if (result) {
            serviceDataDetailsFetched.keySpecifications[key].rejectedAccount =
              result;
          }
        }
      );
    }
    if (
      serviceDataDetailsFetched.owner &&
      serviceDataDetailsFetched.owner
        .join()
        .match(new RegExp(loggedInUser, "i"))
    ) {
      res.status(200).send({ serviceData: serviceDataDetailsFetched });
    } else if (
      serviceDataDetailsFetched.collaborator &&
      serviceDataDetailsFetched.collaborator
        .join()
        .match(new RegExp(loggedInUser, "i"))
    ) {
      if (serviceDataDetailsFetched.keySpecifications) {
        Object.entries(serviceDataDetailsFetched.keySpecifications).forEach(
          ([keyName, keyObj]) => {
            if (
              keyObj.issuedTo.toLowerCase() != loggedInUser.toLowerCase() &&
              keyObj.issuedBy.toLowerCase() != loggedInUser.toLowerCase()
            ) {
              delete serviceDataDetailsFetched.keys[keyName];
              delete serviceDataDetailsFetched.keySpecifications[keyName];
            }
          }
        );
      }
    }
    // res.status(200).send({"serviceData": serviceDataDetailsFetched});
  } catch (e) {
    logger.error(e.message);
    res.redirect("/mui/");
  }
});

app.post("/saveAccountButtonSettings", async function (req, res) {
  logger.info("Saving saveAccountButtonSettings");
  try {
    const accId = req.body.acc_id;
    let dataToPatch = {};
    dataToPatch["statusEnabled"] = req.body.statusEnabled;
    dataToPatch["commentsEnabled"] = req.body.commentsEnabled;
    dataToPatch["toolInitiateComment"] = req.body.toolInitiateComment;
    dataToPatch["enableOwner"] = req.body.enableOwner;
    console.log(`dataToPatch----${JSON.stringify(dataToPatch)}`);
    const result = await msutils.patchDataInStore(
      "Accounts",
      accId,
      dataToPatch
    );
    console.log(`result----${JSON.stringify(result)}`);
    res
      .status(200)
      .send({ status: "ok", message: "Button Settings Saved Successfully" });
  } catch (e) {
    logger.error(e.message);
    // res.redirect("/mui/");
    res
      .status(200)
      .send({ status: "error", message: "Problem in saving Button settings" });
  }
});
app.post("/saveAuth", async function (req, res) {
  logger.info("Saving Auth");

  try {
    const accId = req.body.acc_id;
    // const account = await msutils.fetchFromStoreById("MUIAccounts", accId); //muiaccounts
    var account = await msutils.fetchFromStoreByOptions(
      "MUIAccounts",
      { accountCode: accId },
      {}
    );
    const accCode = account.accountCode;
    const apiAuthKeyVal = req.body.allowApi;
    var keyValue = req.body.keyName;
    var accountDetailsData = await msutils.fetchFromStoreByOptions(
      "Accounts",
      { accountCode: accId },
      {}
    );
    var apiKeyData = await msutils.fetchFromStoreByOptions(
      "SourceSystems",
      { SourceIdentificationCode: accId },
      {}
    );
    var dataToMUI = accountDetailsData[0];
    apiKeyData = apiKeyData[0];

    // Store the auth key in the DB
    if (apiKeyData) {
      var keySpecifications = apiKeyData.keySpecifications[keyValue];
      if (apiAuthKeyVal != undefined || apiAuthKeyVal != "") {
        apiKeyData.keySpecifications[keyValue]["allowPlainAuth"] =
          apiAuthKeyVal;
      } else {
        apiKeyData.keySpecifications[keyValue]["allowPlainAuth"] = false;
      }
      var documentId = apiKeyData._id;
      delete apiKeyData.allowPlainAuth;
      delete apiKeyData._id;
      await msutils.updateInStore("SourceSystems", documentId, apiKeyData);
      await msutils.refreshSourceSystems();
    }

    let apiKeyData1 = {};
    let apiKey = [];
    if (apiKeyData.keys) {
      Object.keys(apiKeyData.keys).forEach((key) => {
        item = {};
        item["keyName"] = key;
        item["keyValue"] = `COAK-${msutils.decrypt(apiKeyData.keys[key])}`;
        item["source_id"] = apiKeyData.SourceIdentificationCode;
        item["issue_to"] = apiKeyData.keySpecifications[key].issuedTo;
        item["issue_from"] = apiKeyData.keySpecifications[key].issuedBy;
        item["scopes"] = apiKeyData.keySpecifications[key].scopes;
        if (
          apiKeyData.keySpecifications[key].allowPlainAuth == undefined ||
          apiKeyData.keySpecifications[key].allowPlainAuth == ""
        ) {
          item["allowPlainAuth"] = false;
          dataToMUI["allowPlainAuth"] = false;
        } else {
          item["allowPlainAuth"] =
            apiKeyData.keySpecifications[keyValue]["allowPlainAuth"];
          dataToMUI["allowPlainAuth"] =
            apiKeyData.keySpecifications[keyValue]["allowPlainAuth"];
        }
        apiKey.push(item);
      });
    }
    dataToMUI["appKeys"] = apiKey;
    // dataToMUI["allowPlainAuth"] = apiKeyData.allowPlainAuth;
    res.status(200).send({
      return: "true",
      retrievedData: dataToMUI,
      redirectUrl: baseUrl + "APIKeys",
    });
  } catch (e) {
    logger.error(e.message);
    res.redirect("/mui/");
  }
});

// API keys Main Page
app.get("/APIKeys/:id", async function (req, res) {
  logger.info(`Processing Data for ChatOps Knight and EventStream API Key `);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      const accId = req.params.id;
      const account = await msutils.fetchFromStoreById("MUIAccounts", accId); //muiaccounts
      const accCode = account.accountCode;
      var accountDetailsData = await msutils.fetchFromStoreByOptions(
        "Accounts",
        { accountCode: accCode },
        {}
      );
      var apiKeyData = await msutils.fetchFromStoreByOptions(
        "SourceSystems",
        { SourceIdentificationCode: accCode },
        {}
      );
      var dataToMUI = accountDetailsData[0];
      apiKeyData = apiKeyData[0];
      let apiKeyData1 = {};
      let apiKey = [];
      if (apiKeyData.keys) {
        Object.keys(apiKeyData.keys).forEach((key) => {
          item = {};
          item["keyName"] = key;
          item["keyValue"] = `COAK-${msutils.decrypt(apiKeyData.keys[key])}`;
          item["source_id"] = apiKeyData.SourceIdentificationCode;
          item["issue_to"] = apiKeyData.keySpecifications[key].issuedTo;
          item["issue_from"] = apiKeyData.keySpecifications[key].issuedBy;
          item["scopes"] = apiKeyData.keySpecifications[key].scopes;
          var keyName = key;
          if (
            apiKeyData.keySpecifications[key].allowPlainAuth == undefined ||
            apiKeyData.keySpecifications[key].allowPlainAuth == ""
          ) {
            item["allowPlainAuth"] = false;
          } else {
            item["allowPlainAuth"] =
              apiKeyData.keySpecifications[key].allowPlainAuth;
          }
          apiKey.push(item);
        });
      }
      dataToMUI["appKeys"] = apiKey;
      // dataToMUI["allowPlainAuth"] = apiKeyData.allowPlainAuth;
      res.status(200).send({
        return: "true",
        retrievedData: dataToMUI,
        redirectUrl: baseUrl + "APIKeys",
      });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    console.log(e);
    logger.error(e.message);
    res.redirect("/mui/");
  }
});

app.get("/scopes", async (req, res, next) => {
  let scopes = await msutils.fetchFromStore("settings", {
    config_name: "apiPermissionsMap",
  });
  let scopeConfig = scopes[0].config_value;
  let tickets = [];
  let collaborators = [];
  Object.keys(scopeConfig).forEach((key) => {
    item = {};
    item["id"] = scopeConfig[key].id;
    item["label"] = scopeConfig[key].label;
    item["group"] = scopeConfig[key].group;
    if (item["group"] == "Ticket") tickets.push(item);
    if (item["group"] == "collaborator") collaborators.push(item);
  });
  res.status(200).send({ tickets, collaborators });
});

app.post("/fetchCKKey", async function (req, res) {
  logger.info(`Processing Data for ChatOps Knight API Key `);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      var accCode = req.body.accCode;
      var keyName = req.body.keyName;
      var issuedTo = req.body.issuedTo;
      //extract this params from req like accCode
      logger.info("Fetch CK key" + req.user.id);
      var apiScopes = req.body.apiScopes;
      var errMsg = [];
      var issuedBy = req.user.id;
      if (
        typeof apiScopes != "undefined" &&
        apiScopes != null &&
        apiScopes.length != null &&
        apiScopes.length > 0
      ) {
        var sourceSystems = await msutils.fetchFromStore("SourceSystems", {
          SourceIdentificationCode: accCode,
        });
        var sourceSystem = sourceSystems[0];
        if (sourceSystem) {
          var apiKey = uuidv4();
          var key = msutils.encrypt(apiKey);
          keySpecification = {
            scopes: apiScopes,
            issuedTo: issuedTo,
            issuedBy: issuedBy,
          };
          logger.info(`Processing Decryption of ChatOps Knight API Key `);
          if (!sourceSystem.keys) {
            sourceSystem.keys = {};
          }
          if (!sourceSystem.keySpecifications) {
            sourceSystem.keySpecifications = {};
          }

          sourceSystem.keys[keyName] = key;
          sourceSystem.keySpecifications[keyName] = keySpecification;
          var documentId = sourceSystem._id;
          delete sourceSystem._id;
          delete sourceSystem.allowPlainAuth;
          logger.info(
            `Processing Decryption of ChatOps Knight API Key im here`
          );
          await msutils.updateInStore(
            "SourceSystems",
            documentId,
            sourceSystem
          );
          await msutils.refreshSourceSystems();
        }
        var CKApiData = {};
        logger.info(`Successfully Decrypted and ChatOps Knight API Key `);
        Object.keys(sourceSystem.keys).forEach((key) => {
          sourceSystem.keys[key] = `COAK-${msutils.decrypt(
            sourceSystem.keys[key]
          )}`;
        });
        CKApiData["keys"] = sourceSystem.keys;
        logger.info(
          `Successfully processed API Keys for ChatOps Knight ${CKApiData}`
        );
        res.status(200).send({ success: true, data: CKApiData });
      } else {
        errMsg.push("!!Please select atleast one scope");
        res.status(400).send({ success: false, errMsg: errMsg });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.redirect(baseUrl + "home");
  }
});

app.post("/reGenerateCKKey", async function (req, res) {
  logger.info(`Processing Data for Regenerate ChatOps Knight API Key `);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      var accCode = req.body.accCode;
      //extract this params from req like accCode
      var keyName = req.body.keyName;
      logger.info(accCode);
      var sourceSystems = await msutils.fetchFromStore("SourceSystems", {
        SourceIdentificationCode: accCode,
      });
      logger.info(sourceSystems);
      var sourceSystem = sourceSystems[0];
      if (sourceSystem) {
        var sourceAPIKey = await msutils.decrypt(sourceSystem.SourceAPIKey);
        var apiKey = uuidv4();
        var key = msutils.encrypt(apiKey);
        sourceSystem.keys[keyName] = key;
        var documentId = sourceSystem._id;
        delete sourceSystem._id;
        await msutils.updateInStore("SourceSystems", documentId, sourceSystem);
        await msutils.refreshSourceSystems();
      }
      var CKApiData = {};
      logger.info(`Successfully Regenerated ChatOps Knight API Key `);
      Object.keys(sourceSystem.keys).forEach((key) => {
        sourceSystem.keys[key] = `COAK-${msutils.decrypt(
          sourceSystem.keys[key]
        )}`;
      });
      CKApiData["keys"] = sourceSystem.keys;
      logger.info(
        `Successfully processed Regenerate API Keys for ChatOps Knight ${CKApiData}`
      );
      res.status(200).send({ success: true, data: CKApiData });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

app.post("/deleteCKKey", async function (req, res) {
  logger.info(`Processing Data for Delete ChatOps Knight API Key `);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      var accCode = req.body.accCode;
      //extract this params from req like accCode
      var keyName = req.body.keyName;
      logger.info(accCode);
      var sourceSystems = await msutils.fetchFromStore("SourceSystems", {
        SourceIdentificationCode: accCode,
      });
      logger.info(sourceSystems);
      var sourceSystem = sourceSystems[0];
      if (sourceSystem) {
        if (!sourceSystem.keys) {
          sourceSystem.keys = {};
        } else {
          delete sourceSystem.keys[keyName];
          delete sourceSystem.keySpecifications[keyName];
        }
        var documentId = sourceSystem._id;
        delete sourceSystem._id;
        await msutils.updateInStore("SourceSystems", documentId, sourceSystem);
        await msutils.refreshSourceSystems();
      }
      var CKApiData = {};
      logger.info(`Successfully Deleted ChatOps Knight API Key `);
      Object.keys(sourceSystem.keys).forEach((key) => {
        sourceSystem.keys[key] = `COAK-${msutils.decrypt(
          sourceSystem.keys[key]
        )}`;
      });
      CKApiData["keys"] = sourceSystem.keys;
      logger.info(
        `Successfully processed Delete API Keys for ChatOps Knight ${CKApiData}`
      );
      res.status(200).send({ success: true, data: CKApiData });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

app.post("/checkEventStreamConnection", async function (req, res) {
  logger.info(`Checking EventStream Connection`);
  await getFreshAccountAccessDetail(req);
  var data = req.body;
  var eventConfig = JSON.parse(data.configuration);
  adminUrl = eventConfig.kafka_admin_url;
  apiKey = eventConfig.api_key;
  user = eventConfig.user;
  let buff = Buffer.from(`${user}:${apiKey}`);
  base64ApiUserAndKey = buff.toString("base64");
  const url = adminUrl + "/admin/topics";
  const axiosConfig = {
    headers: {
      "Content-Type": "text/plain",
      Accept: "application/json",
      "X-Auth-Token": apiKey,
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };
  try {
    const response = await axios.get(url, axiosConfig);
    if (response.data) {
      if (response.statusText == "OK") {
        res
          .status(200)
          .send({ statusText: response.statusText, code: response.status });
      } else {
        res
          .status(500)
          .send({ statusText: response.statusText, code: response.status });
      }
    }
  } catch (err) {
    res.status(500).send({ statusText: err.message, code: 500 });
  }
});

app.post("/saveAccountBasedES", async function (req, res) {
  logger.info(`Saving EventStream details`);
  try {
    await getFreshAccountAccessDetail(req);
    var data = req.body;
    var accCode = req.body.name;
    var ESId;
    var ESNameCheck = false;
    var pushToEventStreamData = { pushToEventStream: data.eventStreamEnabled };
    var account = await msutils.fetchFromStore("Accounts", {
      accountCode: accCode,
    });
    var sourceSystems = await msutils.fetchFromStore("SourceSystems", {
      SourceIdentificationCode: accCode,
    });
    account = account[0];
    sourceSystems = sourceSystems[0];
    var EventStreamData = await msutils.fetchFromStore("EventStreams", {
      name: accCode,
    });
    if (EventStreamData[0]) {
      ESId = EventStreamData[0]._id;
    }
    var parsedJson;
    var ESName = req.body.name;
    var ESConfig = req.body.configuration;
    if (ESId) {
      // EDIT FLow
      parsedJson = ESConfig;
    } else {
      // CREATE encryption
      parsedJson = JSON.parse(ESConfig);
      let api_key = parsedJson["api_key"];
      let apikey = parsedJson["apikey"];
      let password = parsedJson["password"];
      let user = parsedJson["user"];
      if (api_key) {
        parsedJson["api_key"] = msutils.encrypt(api_key);
      }
      if (apikey) {
        parsedJson["apikey"] = msutils.encrypt(apikey);
      }
      if (password) {
        parsedJson["password"] = msutils.encrypt(password);
      }
      if (user) {
        parsedJson["user"] = msutils.encrypt(user);
      }
    }

    var dataToSave = {};
    var eventStreamsError = {};
    if (ESId != undefined) {
      // EDIT
      logger.info(`Editing EventStreams data 1`);
      var eventStreamsDetail = EventStreamData[0]; //await msutils.fetchFromStoreById("EventStreams", ESId);
      var dataToPatch = {};
      var configData = eventStreamsDetail.configurations;
      dataToPatch.name = data.name;
      var configurationDetails = {};
      if (typeof data.configuration == "string") {
        // configuratioln value changed
        configurationDetails = JSON.parse(data.configuration);
      } else {
        // configuration not changed
        configurationDetails = data.configuration;
      }
      var api_key = configurationDetails["api_key"];
      var apikey = configurationDetails["apikey"];
      var password = configurationDetails["password"];
      var user = configurationDetails["user"];
      if (configData.api_key != configurationDetails.api_key) {
        if (api_key) {
          configurationDetails["api_key"] = msutils.encrypt(api_key);
        }
      }
      if (configData.apikey != configurationDetails.apikey) {
        if (apikey) {
          configurationDetails["apikey"] = msutils.encrypt(apikey);
        }
      }
      if (configData.password != configurationDetails.password) {
        if (password) {
          configurationDetails["password"] = msutils.encrypt(password);
        }
      }
      if (configData.user != configurationDetails.user) {
        if (user) {
          configurationDetails["user"] = msutils.encrypt(user);
        }
      }
      dataToPatch.configurations = configurationDetails;
      let result = await msutils.patchDataInStore(
        "EventStreams",
        ESId,
        dataToPatch
      );
      // await msutils.patchDataInStore("Accounts", account._id, pushToEventStreamData);
      await msutils.patchDataInStore(
        "SourceSystems",
        sourceSystems._id,
        pushToEventStreamData
      );
      await msutils.delCacheValue(`eventStream-${accCode}`);
      logger.info(`Successfully patched EventStrems collection`);
      res.status(200).send({ ESSaved: true, eventStreamsError: "" });
    } else {
      // CREATE
      logger.info(`Creating EventStreams data`);
      if (parsedJson) {
        let ESFromCollection = await msutils.fetchFromStore("EventStreams", {});
        for (var i = 0; i < ESFromCollection.length; i++) {
          if (ESFromCollection[i].name == ESName) {
            ESNameCheck = true;
            ESNameErrorMsg = "EventStream already exists.";
          }
        }
        if (ESNameCheck == true) {
          eventStreamsError["jsonErr"] =
            "EventStream " + ESName + " already exist.";
          return res.status(400).send({
            ESSaved: false,
            eventStreamsError: eventStreamsError,
            redirectUrl: baseUrl + "addEventStreams",
          });
        }
        dataToSave.name = ESName;
        dataToSave.configurations = parsedJson;
        await msutils.saveInStore("EventStreams", dataToSave);
        await msutils.patchDataInStore(
          "SourceSystems",
          sourceSystems._id,
          pushToEventStreamData
        );
        await msutils.delCacheValue(`eventStream-${accCode}`);
        logger.info(`Successfully saved data to EventStrems collection`);
        res.status(200).send({ ESSaved: true, eventStreamsError: "" });
      } else {
        eventStreamsError["jsonErr"] =
          "Some error occured while saving. Please check the json provided";
        return res.status(400).send({
          ESSaved: false,
          eventStreamsError: eventStreamsError,
          redirectUrl: baseUrl + "addEventStreams",
        });
      }
    }
  } catch (e) {
    console.log(e);
    logger.error(e.message);
    var eventStreamsError = {};
    if (
      e.message.includes("Unexpected string in JSON") ||
      e.message.includes("Unexpected end of JSON input") ||
      e.message.includes("Unexpected token : in JSON")
    ) {
      eventStreamsError["jsonErr"] = "Please enter valid json";
    }
    return res.status(400).send({
      ESSaved: false,
      eventStreamsError: eventStreamsError,
      redirectUrl: baseUrl + "addEventStreams",
    });
  }
});

app.get("/fetchEventStreamsKey", async function (req, res) {
  logger.info(`Processing Data for Event Streams API Key `);
  const accId = req.query.id;
  const account = await msutils.fetchFromStoreById("MUIAccounts", accId); //muiaccounts
  const accCode = account.accountCode;
  var dataToPass = { esData: "" };
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isAccountAdmin) {
      logger.info(`Fetching EventStreams Data`);
      var sourceSystemData = await msutils.fetchFromStore("SourceSystems", {
        SourceIdentificationCode: accCode,
      });
      let EventStreamAPIData = await msutils.getAccountEventStreamsData(
        accCode
      );
      sourceSystemData = sourceSystemData[0];
      if (
        EventStreamAPIData.length > 0 ||
        Object.keys(EventStreamAPIData).length > 0
      ) {
        var eventStreamCnfigDetails = EventStreamAPIData.configurations;
        logger.info(`Processing Decryption for Event Streams API Key`);
        if (eventStreamCnfigDetails) {
          var api_key = await msutils.decrypt(eventStreamCnfigDetails.api_key);
          var apikey = await msutils.decrypt(eventStreamCnfigDetails.apikey);
          var password = await msutils.decrypt(
            eventStreamCnfigDetails.password
          );
          var user = await msutils.decrypt(eventStreamCnfigDetails.user);
        }
        logger.info(`Successfully Decrypted data for Event Streams API Key `);
        EventStreamAPIData.configurations["api_key"] = api_key;
        EventStreamAPIData.configurations["apikey"] = apikey;
        EventStreamAPIData.configurations["password"] = password;
        EventStreamAPIData.configurations["user"] = user;
        dataToPass["esData"] = EventStreamAPIData.configurations;
        logger.info(`Successfully processed API Keys for EventStreams `);
      }
      dataToPass["ssData"] = sourceSystemData;
      dataToPass["accountData"] = account;
      res.status(200).send({ EventStreamAPIData: dataToPass });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.redirect(baseUrl);
  }
});

app.post("/validateEmails", async (req, res) => {
  logger.info(`Processing Data for validating emails`);
  const { emails, workspaceToken, collaborationTool, region } = req.body;
  if (collaborationTool.toLowerCase() === "slack") {
    try {
      const response = await Promise.allSettled(
        emails.map((email) => msutils.fetchByEmailId(email, workspaceToken))
      );
      const invalidIndex = response.findIndex((v) => v.status == "rejected");
      if (invalidIndex < 0) {
        res.status(200).send({
          valid: true,
          response,
        });
      } else {
        res.status(404).send({
          valid: false,
          message: `${emails[invalidIndex]} not associated to the given workspace`,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(404).send({
        valid: false,
        message: "User is not part of workspace",
      });
    }
  } else {
    res.status(200).send({
      valid: true,
    });

    // try {
    //     // const response = await Promise.allSettled(emails.map(email => msutils.fetchByEmailId(email, workspaceToken)))
    //     const teamsBotDetails = await msutils.fetchSettings(MS_TEAMS_BOTS_CONFIG_NAME);
    //     if(teamsBotDetails) {
    //         const users = []
    //         const bot =  teamsBotDetails[region];
    //         if(bot) {
    //             for(let email of emails) {
    //                 const teamsData = await fetchByTeamsEmailId(email, bot);
    //                 if(teamsData && Object.keys(teamsData).length){
    //                     users.push(teamsData.id)
    //                 }

    //             }

    //             if(users.length >= 3){
    //                 res.status(200).send({
    //                     valid: true
    //                 })
    //             }else {
    //                 res.status(200).send({
    //                     valid: false,
    //                     message: "Some email ids may not exists in MS Teams instance. Enter 3 valid email ids"
    //                 })
    //             }

    //         }else {
    //             res.status(404).send({
    //                 valid: false,
    //                 message: `Bot details not found`
    //             })
    //         }
    //     }

    // } catch (error) {
    //     console.log(error);
    //     res.status(404).send({
    //         valid: false,
    //         message: "User is not part of workspace"
    //     })
    // }
  }
});

app.post("/validateCdic", async (req, res) => {
  logger.info(`Processing Data for validating cdic`);
  const { cdic } = req.body;
  try {
    const response = await msutils.fetchFromStore("Accounts");
    const existingCdic = response.find(
      (account) =>
        account.accountCodeLocators &&
        account.accountCodeLocators.cdic &&
        account.accountCodeLocators.cdic.toLowerCase() == cdic.toLowerCase()
    );
    if (!existingCdic) {
      res.status(200).send({
        valid: true,
      });
    } else {
      res.status(404).send({
        valid: false,
        message: `${cdic} already exists!`,
      });
    }
  } catch (error) {
    res.status(404).send({
      valid: false,
      message: "Use another value",
    });
  }
});

app.use("/ansibleInstance", ansibleRouter);

app.get("/style.css", (req, res, next) => {
  res.sendFile(path.join(__dirname, "build", "style.css"));
});
app.get("/groups", async function (req, res) {
  logger.info("Loading Groups Page");

  try {
    if (req.session.serviceauthenticate == undefined) {
      res.redirect("/mui/chatops-groups");
    } else {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
app.get("/servicemanager", async function (req, res) {
  logger.info("Loading Service Manager Page");

  try {
    if (req.session.serviceauthenticate == undefined) {
      res.redirect("/mui/service-manager");
    } else {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
// Services Page

app.get("/services", async function (req, res) {
  try {
    if (req.session.serviceauthenticate == undefined) {
      res.redirect("/mui/register-service");
    } else {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// Service Keys Page
app.get("/service-keys", async function (req, res) {
  logger.info(`Loading Service Keys Page`);
  try {
    if (req.isAuthenticated()) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// Add Service Page
app.get("/add-service", async function (req, res) {
  logger.info(`Loading Add Service Page`);
  try {
    if (req.isAuthenticated()) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// Get Scopes
app.get("/checkUniqueWorkspace/:name", async function (req, res) {
  logger.info(`getting Workspace details list for Add workspace Key Page`);
  try {
    if (req.isAuthenticated()) {
      const { name } = req.params;
      let nameLowerCase = name.toLowerCase();
      if (!req.session.usersTeamsWorkspaces.includes(nameLowerCase)) {
        res.status(200).send({
          message: `Team can't be added, Logged in user is not a member of the team - ${name}`,
          error: true,
        });
      }
      const workspaceDetail = await msutils.getWorkspaceByName(name);
      console.log(`workspaceDetail----${JSON.stringify(workspaceDetail)}`);
      if (workspaceDetail) {
        res.status(200).send({
          message: `Workspace already exists with name :  ${name}`,
          error: true,
        });
      } else {
        res.status(200).send({ message: "", error: false });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// Get Service Details
app.get("/serviceKeyDetail/:sourceCode", async function (req, res) {
  logger.info(`getting service key details list for Add Service Key Page`);
  try {
    if (req.isAuthenticated()) {
      const { sourceCode } = req.params;
      const sourceSystemsData = await msutils.fetchFromStore("SourceSystems", {
        SourceIdentificationCode: sourceCode,
      });
      if (sourceSystemsData.length > 0) {
        const workspaceDetail = await msutils.getWorkspaceByName(
          sourceSystemsData[0].workspace
        );
        sourceSystemsData[0]["collabTool"] =
          workspaceDetail.workspaceType === "TEAMS" ? "teams" : "slack";
        res.send({ sourceSystemsData: sourceSystemsData[0] });
      } else {
        res.send({ sourceSystemsData: {} });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// Get Scopes
app.get("/serviceKeyScopes", async function (req, res) {
  logger.info(`getting scopes list for Add Service Key Page`);
  try {
    if (req.isAuthenticated()) {
      const scopes = await msutils.fetchFromStore("settings", {
        config_name: "apiPermissionsMap",
      });
      res.send({ scopes: scopes[scopes.length - 1] });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// Add Service Key Page
app.get("/add-serviceKey", async function (req, res) {
  logger.info(`Loading Add Service Key Page`);
  try {
    if (req.isAuthenticated()) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// Get Accounts list
app.get("/accounts", async function (req, res) {
  logger.info(`getting accounts list for Add Service Key Page`);
  try {
    if (req.isAuthenticated()) {
      const accounts = await msutils.fetchFromStore("Accounts");
      res.send({ accounts });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// Get Accounts list
app.get("/muiaccounts", async function (req, res) {
  logger.info(`getting Muiaccounts list for Add Service Key Page`);
  try {
    if (req.isAuthenticated()) {
      const regexQueryWrapper = {};
      regexQueryWrapper["$and"] = [];
      regexQueryWrapper["$and"].push({ saved: false });
      regexQueryWrapper["$and"].push({ submitted: true });
      const accounts = await msutils.fetchFromStoreByOptions(
        "MUIAccounts",
        regexQueryWrapper
      );
      res.send({ accounts });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// Fetch Accounts for PA Feature List page for Search
app.get("/muiaccounts/dropdown", async function (req, res) {
  logger.info(
    `PA Features: Fetching Account Code from MUIAccounts collection `
  );
  try {
    if (req.isAuthenticated()) {
      const regexQueryWrapper = {};
      regexQueryWrapper["$and"] = [];
      regexQueryWrapper["$and"].push({ saved: false });
      regexQueryWrapper["$and"].push({ submitted: true });
      const accountsList = await msutils.fetchFromStoreByOptions(
        "MUIAccounts",
        regexQueryWrapper
      );
      let accountCodes = ["Choose an Option"];
      for (var i = 0; i < accountsList.length; i++) {
        accountCodes.push(accountsList[i].accountCode);
      }
      res.status(200).send({ accountCodes: accountCodes });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});

app.get("/uniqueService/:service", async function (req, res) {
  logger.info("Checking for unique service name");
  const { service } = req.params;
  try {
    var services = await msutils.fetchFromStoreByOptions(
      "SourceSystems",
      { isService: true },
      {}
    );
    const existingService = services.find(
      ({ SourceIdentificationCode }) =>
        SourceIdentificationCode &&
        SourceIdentificationCode.toLowerCase() == service.toLowerCase()
    );
    res.send({ unique: !existingService });
  } catch (error) {
    res.send({ unique: false });
  }
});

app.get("/uniqueServiceKeys/:id/:servicekey", async function (req, res) {
  logger.info("Checking for unique service Keys");
  const { servicekey, id } = req.params;
  try {
    var serviceDataDetails = await msutils.fetchFromStoreById(
      "SourceSystems",
      id
    );
    let existingServiceKey = false;

    if (serviceDataDetails.keys) {
      existingServiceKey = serviceDataDetails.keys.hasOwnProperty(servicekey);
    }
    res.send({ unique: !existingServiceKey });
  } catch (error) {
    res.send({ unique: false });
  }
});

app.get("/registeredService/:id", async function (req, res) {
  logger.info(`Processing Service details for ${req.user.id}`);
  if (!req.isAuthenticated()) {
    logger.info("User is not authenticated.");
    req.session.originalUrl = req.originalUrl;
    return res.redirect("/mui/login");
  }
  try {
    const { id } = req.params;
    var serviceDataDetails = await msutils.fetchFromStoreById(
      "SourceSystems",
      id
    );
    console.log(`serviceDataDetails---${JSON.stringify(serviceDataDetails)}`);
    if (serviceDataDetails.SourceIdentificationCode) {
      serviceDataDetails["collabTool"] = "SLACK";
      if (serviceDataDetails.workspace) {
        const workSpaceDet = await msutils.getWorkspaceByName(
          serviceDataDetails.workspace
        );
        serviceDataDetails["collabTool"] = workSpaceDet.workspaceType;
      }
    }
    const loggedInUser = req.user.id;
    let result;
    if (serviceDataDetails.keys) {
      Object.keys(serviceDataDetails.keys).forEach((key) => {
        serviceDataDetails.keys[key] = `COSK-${msutils.decrypt(
          serviceDataDetails.keys[key]
        )}`;
      });
    }
    if (serviceDataDetails.keySpecifications) {
      Object.keys(serviceDataDetails.keySpecifications).forEach((key) => {
        let keySpec = serviceDataDetails.keySpecifications[key];
        // serviceDataDetails.keySpecifications[key].allowPlainAuth =
        if (keySpec.accountApproval) {
          result = keySpec.accountApproval.reduce(function (ids, obj) {
            if (obj.status === "rejected") {
              ids.push(obj.accountCode);
            }
            return ids;
          }, []);
        }

        if (result) {
          serviceDataDetails.keySpecifications[key].rejectedAccount = result;
        }
      });
    }

    if (
      serviceDataDetails.owner &&
      serviceDataDetails.owner.join().match(new RegExp(loggedInUser, "i"))
    ) {
      res.status(200).send({ serviceData: serviceDataDetails });
    } else if (
      serviceDataDetails.collaborator &&
      serviceDataDetails.collaborator
        .join()
        .match(new RegExp(loggedInUser, "i"))
    ) {
      if (serviceDataDetails.keySpecifications) {
        Object.entries(serviceDataDetails.keySpecifications).forEach(
          ([keyName, keyObj]) => {
            if (
              keyObj.issuedTo.toLowerCase() != loggedInUser.toLowerCase() &&
              keyObj.issuedBy.toLowerCase() != loggedInUser.toLowerCase()
            ) {
              delete serviceDataDetails.keys[keyName];
              delete serviceDataDetails.keySpecifications[keyName];
            }
          }
        );
      }

      res.status(200).send({ serviceData: serviceDataDetails });
    } else {
      throw new Error("Unauthorized User...");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// Get Services from the Source Syste,
app.get("/registeredService", async function (req, res) {
  logger.info(`Processing Service details for ${req.user.id}`);
  try {
    const query = {};
    const userId = req.user.id.toLowerCase();
    // query
    var regexQueryWrapper = {};
    regexQueryWrapper["$and"] = [];
    var wrapper = { $or: [] };
    wrapper["$or"].push({ owner: { $in: [userId] } });
    wrapper["$or"].push({ collaborator: { $in: [userId] } });
    regexQueryWrapper["$and"].push(wrapper);
    regexQueryWrapper["$and"].push({ isService: true });
    console.log(`regexQueryWrapper---${JSON.stringify(regexQueryWrapper)}`);
    var serviceDataDetails = await msutils.fetchFromStoreByOptions(
      "SourceSystems",
      regexQueryWrapper
    );
    var serviceData = serviceDataDetails.sort(function (a, b) {
      var dateA = new Date(a.date),
        dateB = new Date(b.date);
      return dateB - dateA;
    });
    for (var i = 0; i < serviceData.length; i++) {
      var dateFromDB = serviceData[i].date;
      if (dateFromDB.includes("/")) {
        serviceData[i].date = dateFromDB;
      } else {
        serviceData[i].date = moment.utc(dateFromDB).format("L HH:mm");
      }
    }
    res.status(200).send({ serviceData: serviceData });
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});

// post service approval
app.post("/postServiceApprovalToSlack", async function (req, res) {
  logger.info(`Posting Service Approval To Slack`);
  try {
    req.body.email = req.user.id;
    if (req.user) {
      /** start metrics **/
      msutils.metricsQueueJobByJobType("updateMetricsFacts", {
        accountCode: "default",
        api: "postServiceApprovalToSlack",
        sourceSystem: "default",
        microservice: "internal",
        subFunction: "default",
        service: "default",
        command: "default",
        stage: "invoked",
      });
      /** end metrics **/
      var workspaceName = req.body.workspace;
      console.log(`workspaceName----${JSON.stringify(workspaceName)}`);
      console.log(typeof workspaceName, "---typeofworkspaceName");
      if (typeof workspaceName === "object") {
        let accountCode = req.body.name;
        let isService = true;
        let teamName = workspaceName.teamName;
        let teamId = workspaceName.teamId;
        let name = workspaceName.teamName;
        let workspaceType = workspaceName.workspaceType;
        let region = workspaceName.region;

        const team = {
          id: teamId,
          name: teamName,
        };
        const workspaceDetail = {
          name,
          accountCode,
          isService,
          team,
          workspaceType,
          region,
        };
        console.log(JSON.stringify(workspaceDetail), "---workspaceDetail");
        await msutils.saveInStore("Workspace", workspaceDetail);
        await msutils.delCacheValue("SLACK-WORKSPACES");
        //await msutils.clearkWorkspacesFromCache();
        workspaceName = workspaceName.teamName;
      }
      let approvalChannels = "approvalChannelsTeams";
      if (req.body.collaborationTool === "SLACK") {
        approvalChannels = "approvalChannels";
      }
      const approvalchannelIds = await msutils.fetchFromStore("settings", {
        config_name: approvalChannels,
      });
      const appChanel = approvalchannelIds[0].config_value;
      const approvalchannelId = appChanel.find(
        (appchannel) => appchannel.type === "service"
      );
      const approvalWorkspaceName = approvalchannelId.workspaceName;
      var workspaceDetail = await msutils.getWorkspaceByName(
        approvalWorkspaceName
      );
      console.log(`workspaceDetail----${JSON.stringify(workspaceDetail)}`);
      if (!workspaceDetail) {
        res.status(400).send({
          fetch: false,
          fetchErrorforWorkspace: `Workspace not found for ${workspaceName}`,
        });
      }
      console.log(`test1`);
      var sourceCode = req.body.name;
      var actionId = "SERVICE_KEY" + req.body.serviceName;
      if (workspaceDetail.workspaceType !== "TEAMS") {
        var token = msutils.encrypt(workspaceDetail.bot.tokens.xoxb);
      }
      var currentDate = new Date();
      var date = moment.utc(currentDate).format("L HH:mm");
      req.body.date = date;
      let serviceStatus;
      var owners;
      let postServiceRequest = false;

      // Add the requester as owner by default
      if (
        req.body.owners !== null &&
        req.body.owners.length > 0 &&
        req.body.owners !== "undefined"
      ) {
        owners = req.body.owners.map((owner) => {
          return owner.toLowerCase();
        });
        if (owners.indexOf(req.user.id.toLowerCase()) === -1) {
          owners.push(req.user.id.toLowerCase());
          owners = owners.filter((item) => item);
        }
      } else {
        owners = [req.user.id];
        owners = owners.filter((item) => item);
      }

      var match = /\r|\n/.exec(req.body.justification);
      var businessJustification = "";
      if (match) {
        req.body["justification"] = req.body.justification.replace(/\n/g, " ");
      }
      var dataToSent = {
        loggedInUser: req.user.id,
        token: token,
        businessJustification: req.body.justification,
        serviceName: req.body.name,
        workspaceName: workspaceName,
        date: date,
        action_id: actionId,
        request: req.body,
        collabTool:
          workspaceDetail.workspaceType === "TEAMS" ? "msteams" : "slack",
      };
      console.log(`dataToSent----${JSON.stringify(dataToSent)}`);
      if (workspaceDetail.workspaceType === "TEAMS") {
        delete dataToSent.token;
      }
      var sourceSystems = await msutils.fetchFromStore("SourceSystems", {
        SourceIdentificationCode: sourceCode,
      });

      let sourceSystemRecord = {};
      sourceSystemRecord.SourceIdentificationCode = req.body.name;
      let uuid = uuidv4();
      sourceSystemRecord.SourceAPIKey = msutils.encrypt(uuid);
      sourceSystemRecord.SourceDescription = req.body.description;
      sourceSystemRecord.pushToEventStream = false;
      // sourceSystemRecord.allowPlainAuth = true;
      sourceSystemRecord.status = "pending";
      sourceSystemRecord.isService = true;
      sourceSystemRecord.date = new Date();
      sourceSystemRecord.owner = owners;
      sourceSystemRecord.collaborator = req.body.collaborators;
      sourceSystemRecord.businessJustification = req.body.justification;
      sourceSystemRecord.workspace = workspaceName;
      logger.info(`Going to save to source systems ${sourceSystemRecord}`);

      // Edit Flow
      var fetchSourceSystem = await msutils.fetchFromStore("SourceSystems", {});
      var fetchAccount = await msutils.fetchFromStore("MUIAccounts", {});
      var uniqueCheck = false;
      var sourceSystemCheck = false;
      var accountsCheck = false;
      for (var i = 0; i < fetchSourceSystem.length; i++) {
        if (fetchSourceSystem[i].SourceIdentificationCode == sourceCode) {
          // uniqueCheck = true;
          sourceSystemCheck = true;
        }
      }
      for (var j = 0; j < fetchAccount.length; j++) {
        if (fetchAccount[j].accountCode == sourceCode) {
          // uniqueCheck = true;
          accountsCheck = true;
        }
      }
      if (accountsCheck == true || sourceSystemCheck == true) {
        logger.error("Invalid service name. Service name already existing");
        uniqueCheck = true;
      }

      logger.info(
        "Saving service data to SourceSystems collection after unique name validation"
      );
      if (sourceSystems.length > 0) {
        var sourceSystemCng = sourceSystems[0];
        serviceStatus = sourceSystemCng.status;

        if (sourceSystemCng.keys) {
          sourceSystemRecord.keys = sourceSystemCng.keys;
          sourceSystemRecord.keySpecifications =
            sourceSystemCng.keySpecifications;
        }
        // Change the status to pending if the status is not approved and its an edit flow
        if (serviceStatus !== "approved") {
          sourceSystemRecord.status = "pending";
          postServiceRequest = true;
        } else {
          postServiceRequest = false;
          sourceSystemRecord.status = serviceStatus;
        }
        var documentId = sourceSystemCng._id;
        delete sourceSystemCng._id;
        await msutils.updateInStore(
          "SourceSystems",
          documentId,
          sourceSystemRecord
        );
        await msutils.refreshSourceSystems();
      } else {
        if (uniqueCheck == false) {
          logger.info("New Source Added");
          postServiceRequest = true;
          await msutils.saveInStore("SourceSystems", sourceSystemRecord);
          await msutils.refreshSourceSystems();
        } else {
          res.status(400).send({ uniqueCheck: false });
        }
      }
      if (postServiceRequest) {
        postServiceApprovalDataToSlack(dataToSent)
          .then((validateSlack) => {
            if (validateSlack.successFlag == false) {
              /** start metrics **/
              msutils.metricsQueueJobByJobType("updateMetricsFacts", {
                accountCode: "default",
                api: "postServiceApprovalToSlack",
                sourceSystem: "default",
                microservice: "internal",
                subFunction: "default",
                service: "default",
                command: "default",
                stage: "error",
              });
              /** end metrics **/
              res
                .status(400)
                .send({ fetch: false, fetchErrorfromSlack: validateSlack });
            } else {
              /** start metrics **/
              msutils.metricsQueueJobByJobType("updateMetricsFacts", {
                accountCode: "default",
                api: "postServiceApprovalToSlack",
                sourceSystem: "default",
                microservice: "internal",
                subFunction: "default",
                service: "default",
                command: "default",
                stage: "completed",
              });
              /** end metrics **/
              res
                .status(200)
                .send({ fetch: true, fetchSuccessfromSlack: validateSlack });
            }
          })
          .catch((err) => {
            logger.error("Error Posting to user ERROR:", err);
            /** start metrics **/
            msutils.metricsQueueJobByJobType("updateMetricsFacts", {
              accountCode: "default",
              api: "postServiceApprovalToSlack",
              sourceSystem: "default",
              microservice: "internal",
              subFunction: "default",
              service: "default",
              command: "default",
              stage: "error",
            });
            /** end metrics **/
          });
      } else
        res.status(200).send({
          fetch: true,
          fetchSuccessfromSlack: "success",
          uniqueCheck: true,
        });
    } else {
      res.status(400).send({
        fetch: false,
        fetchErrorforUser: `User not found for. Please login `,
      });
    }
  } catch (e) {
    logger.error(e.message);
    /** start metrics **/
    msutils.metricsQueueJobByJobType("updateMetricsFacts", {
      accountCode: "default",
      api: "postServiceApprovalToSlack",
      sourceSystem: "default",
      microservice: "internal",
      subFunction: "default",
      service: "default",
      command: "default",
      stage: "error",
    });
    /** end metrics **/
  }
});

app.post("/createServiceKey", async function (req, res) {
  logger.info(`Processing Data for ChatOps Knight ServiceAPI Key `);
  try {
    if (req.user) {
      /** start metrics **/
      msutils.metricsQueueJobByJobType("updateMetricsFacts", {
        accountCode: "default",
        api: "createServiceKey",
        sourceSystem: "default",
        microservice: "internal",
        subFunction: "default",
        service: "default",
        command: "default",
        stage: "invoked",
      });
      /** end metrics **/
      var sourceCode = req.body.sourceCode;
      var keyName = req.body.name;
      var issuedTo = req.body.issuedTo;
      var type = req.body.type;
      var currentDate = new Date();
      var date = moment.utc(currentDate).format("L HH:mm");
      req.body.date = date;
      logger.info("createServiceKey" + req.user.id);
      var apiScopes = req.body.scopes;
      var requestedAccounts;
      var scopes;
      var accounts;
      var status = "pending";
      // Changes done in order to reflect in the slack message
      if (
        typeof apiScopes != "undefined" &&
        apiScopes != null &&
        apiScopes.length != null &&
        apiScopes.length > 0
      ) {
        scopes = apiScopes;
        scopes = scopes.map((i) => "`" + i + "`");
        req.body.scopes = scopes;
      }

      if (type == "1") {
        status = "approved";
      }

      // Changes done in order to reflect in the slack message
      if (
        type == "2" &&
        typeof req.body.accounts != "undefined" &&
        req.body.accounts != null &&
        req.body.accounts.length != null &&
        req.body.accounts.length > 0
      ) {
        requestedAccounts = req.body.accounts;
        accounts = req.body.accounts;
        accounts = accounts.map((i) => "`" + i + "`");
        req.body.accounts = accounts;
      }
      var errMsg = [];
      var issuedBy = req.user.id;
      req.body.issuedBy = issuedBy;
      var dataToSent = {
        request: req.body,
      };

      if (
        typeof apiScopes != "undefined" &&
        apiScopes != null &&
        apiScopes.length != null &&
        apiScopes.length > 0
      ) {
        var sourceSystems = await msutils.fetchFromStore("SourceSystems", {
          SourceIdentificationCode: sourceCode,
        });
        var sourceSystem = sourceSystems[0];

        if (sourceSystem) {
          var apiKey = uuidv4();
          var key = msutils.encrypt(apiKey);
          if (type == "1" || type == "3") {
            keySpecification = {
              type: type,
              scopes: apiScopes,
              issuedTo: issuedTo,
              issuedBy: issuedBy,
              status: status,
              date: date,
            };
          } else if (type == "2") {
            keySpecification = {
              type: type,
              scopes: apiScopes,
              issuedTo: issuedTo,
              issuedBy: issuedBy,
              requestedAccounts: requestedAccounts,
              status: status,
              date: date,
            };
          }
          logger.info(`Processing Decryption of ChatOps Knight API Key `);
          if (!sourceSystem.keys) {
            sourceSystem.keys = {};
          }
          if (!sourceSystem.keySpecifications) {
            sourceSystem.keySpecifications = {};
          }

          sourceSystem.keys[keyName] = key;
          sourceSystem.keySpecifications[keyName] = keySpecification;
          var documentId = sourceSystem._id;
          delete sourceSystem._id;
          delete sourceSystem.allowPlainAuth;
          await msutils.updateInStore(
            "SourceSystems",
            documentId,
            sourceSystem
          );
          logger.info("Successfully saved in Source systems");
          await msutils.delCacheValuesByPattern(`*chatops-*`);
          await msutils.refreshSourceSystems();
          console.log(`sourceSystem---${JSON.stringify(sourceSystem)}`);
          let workSpaceDet = await msutils.getWorkspaceByName(
            sourceSystem.workspace
          );
          console.log(`workSpaceDet---${JSON.stringify(workSpaceDet)}`);
          dataToSent["collabTool"] =
            workSpaceDet.workspaceType === "TEAMS" ? "msteams" : "slack";
        }

        logger.info(`Successfully Decrypted and ChatOps Knight API Key `);
        postServiceKeyApprovalDataToSlack(dataToSent)
          .then((validateSlack) => {
            if (validateSlack.successFlag == false) {
              /** start metrics **/
              msutils.metricsQueueJobByJobType("updateMetricsFacts", {
                accountCode: "default",
                api: "createServiceKey",
                sourceSystem: "default",
                microservice: "internal",
                subFunction: "default",
                service: "default",
                command: "default",
                stage: "error",
              });
              /** end metrics **/
              res
                .status(400)
                .send({ fetch: false, fetchErrorfromSlack: validateSlack });
            } else {
              /** start metrics **/
              msutils.metricsQueueJobByJobType("updateMetricsFacts", {
                accountCode: "default",
                api: "createServiceKey",
                sourceSystem: "default",
                microservice: "internal",
                subFunction: "default",
                service: "default",
                command: "default",
                stage: "completed",
              });
              /** end metrics **/
              res
                .status(200)
                .send({ fetch: true, fetchSuccessfromSlack: validateSlack });
            }
          })
          .catch((err) => {
            /** start metrics **/
            msutils.metricsQueueJobByJobType("updateMetricsFacts", {
              accountCode: "default",
              api: "createServiceKey",
              sourceSystem: "default",
              microservice: "internal",
              subFunction: "default",
              service: "default",
              command: "default",
              stage: "error",
            });
            /** end metrics **/
            logger.error("Error Posting to user ERROR:", err);
          });
        res.status(200).send({ success: true });
      } else {
        errMsg.push("Please select atleast one scope");
        res.status(400).send({ success: false, errMsg: errMsg });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    /** start metrics **/
    msutils.metricsQueueJobByJobType("updateMetricsFacts", {
      accountCode: "default",
      api: "createServiceKey",
      sourceSystem: "default",
      microservice: "internal",
      subFunction: "default",
      service: "default",
      command: "default",
      stage: "error",
    });
    /** end metrics **/
    res.redirect(baseUrl + "home");
  }
});

// service key
app.get("/fetchWorkspace", async function (req, res) {
  logger.info(`Workspace: Fetching workspace data from Workspace collection `);
  try {
    await msutils.clearkWorkspacesFromCache();
    await getFreshAccountAccessDetail(req);

    if (req.isAuthenticated()) {
      let workspaceList = await msutils.fetchSlackWorkspaces();
      const list = [];
      try {
        let getSandBoxDomain = await fetchSingleDocument("settings", {
          config_name: "development_sandbox_domain",
        });
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          transactionid: uuidv4(),
        };
        let logginUserId = req.user.id.toLowerCase();
        let payload = {
          emailId: logginUserId,
        };
        console.log(`getSandBoxDomain---${JSON.stringify(getSandBoxDomain)}`);
        if (getSandBoxDomain && getSandBoxDomain.config_value.enable) {
          logginUserId = logginUserId.split("@");
          payload = {
            emailId: `${logginUserId[0]}@${getSandBoxDomain.config_value.domain}`,
          };
        }

        let url = await msutils.getMsUrl("chatopsCollabTeams");
        url = url + "/getUserByEmailId";
        console.log(url, payload, "POST", headers);
        const axiosConfig = {
          headers: headers,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        };

        const restRequest = await axios.post(url, payload, axiosConfig);
        if (restRequest.data) {
          const workSpaceTeams = restRequest.data.value;
          const workspaceArrayTeams = [];
          if (workSpaceTeams.length > 0) {
            workSpaceTeams.map((det) => {
              let lowerCaseName = det.displayName.toLowerCase();
              workspaceArrayTeams.push(lowerCaseName);
            });
          }
          req.session.usersTeamsWorkspaces = workspaceArrayTeams;
          //console.log(`workspaceArrayTeams---${JSON.stringify(workspaceArrayTeams)}`);
          //console.log(`workspaceList---${JSON.stringify(workspaceList)}`);
          workspaceList.filter((det) => {
            if (det["workspaceType"] === "TEAMS") {
              let details = det["name"].toLowerCase();
              if (workspaceArrayTeams.indexOf(details) !== -1) {
                list.push(det);
                return list;
              }
            } else {
              list.push(det);
              return list;
            }
          });
          //console.log(`data----${JSON.stringify(workspaceList)}`);
        }
      } catch (e) {
        logger.error(`Error at fetching workspace ${e.message}`);
      }
      res
        .status(200)
        .send({ workspaceData: list, redirectUrl: baseUrl + "workspaces" });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});

// Add ansible instances SA
app.get("/addAnsibleIntances", async function (req, res) {
  logger.info(`Loading ansible instances Form for SA`);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.session.isSuperAdmin) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.redirect(baseUrl);
  }
});

// Team IT -- IS Together
// Fetch TeamIT data
app.get("/teamITData", async function (req, res) {
  logger.info(
    `Fetching Team IT data from TeamITGeoMarket, TeamITSkills, TeamITSupportType collection `
  );
  try {
    await getFreshAccountAccessDetail(req);
    if (req.user) {
      var dbData = {};
      let geoList = await msutils.fetchFromStore("TeamITGeoMarket", {});
      let skillList = await msutils.fetchFromStore("TeamITSkills", {});
      let supportList = await msutils.fetchFromStore("TeamITSupportType", {});
      let countryList = await msutils.fetchFromStore("CountryCode", {});
      let serviceLineList = await msutils.fetchFromStore(
        "TeamITServiceLine",
        {}
      );
      let gsePracticeList = await msutils.fetchFromStore(
        "TeamITGSEPractice",
        {}
      );
      let timezoneList = await msutils.fetchFromStore("TeamITTimezone", {});
      dbData["geoList"] = geoList;
      dbData["skillList"] = skillList;
      dbData["supportList"] = supportList;
      dbData["countryList"] = countryList;
      dbData["serviceLineList"] = serviceLineList;
      dbData["gsePracticeList"] = gsePracticeList;
      dbData["timezoneList"] = timezoneList;
      res.status(200).send({ dbData: dbData });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});
app.get("/teamITAdminData", async function (req, res) {
  logger.info(
    `TeamIT Admin: Fetching Team IT data from TeamITRequest collection `
  );
  try {
    await getFreshAccountAccessDetail(req);
    var teamITRequestDataFromDB = await msutils.fetchFromStore(
      "TeamITRequest",
      {}
    );
    if (req.session.teamitAdmin) {
      if (app.get("statusCode") != undefined) {
        var statusCodeFromUI = app.get("statusCode");
        var statusCodeToFetch = statusCodeFromUI.statusCode;
      }
      if (statusCodeFromUI) {
        logger.info(
          `TeamIT Admin: Fetching Team IT data with status filter from TeamITRequest collection`
        );
        if (statusCodeFromUI != "" && statusCodeFromUI != "noFilter") {
          var teamITRequestData = await msutils.fetchFromStoreByOptions(
            "TeamITRequest",
            { status: statusCodeFromUI },
            {}
          );
        } else {
          var teamITRequestData = await msutils.fetchFromStore(
            "TeamITRequest",
            {}
          );
        }
      } else {
        var teamITRequestData = await msutils.fetchFromStore(
          "TeamITRequest",
          {}
        );
      }
      res.status(200).send({
        dbData: teamITRequestData,
        teamITRequestDataFromDB: teamITRequestDataFromDB,
      });
    } else {
      res.redirect("/mui/notAuthorized");
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});
app.post("/postRequestFilter", async function (req, res) {
  logger.info("Processing Request Data with status filter");
  await getFreshAccountAccessDetail(req);
  var errMsg = [];
  if (req.session.teamitAdmin) {
    if (req.body) {
      var statusCode = req.body.reaStatusFilter;
      var requestDataFilter = {};
      var fromDBReqData = await msutils.fetchFromStoreByOptions(
        "TeamITRequest",
        { status: statusCode },
        {}
      );
      requestDataFilter["statusCode"] = statusCode;
      app.set("statusCode", statusCode);
      res.status(200).send({ dbData: fromDBReqData });
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } else {
    throw new Error("User is not authorized to access this application.");
  }
});
// post Requester data to TeamITRequest collection
app.post("/editAdmin", async function (req, res) {});
app.post("/saveTeamITRequester", async function (req, res) {
  logger.info(`Saving Requester data to TeamITRequest collection `);
  let validateRequest = {};
  try {
    await getFreshAccountAccessDetail(req);

    /** start metrics invoked **/
    msutils.metricsQueueJobByJobType("updateMetricsFacts", {
      accountCode: "default",
      api: "saveTeamITRequester",
      sourceSystem: "default",
      microservice: "internal",
      subFunction: "default",
      service: "default",
      command: "default",
      stage: "invoked",
    });
    /** end metrics invoked **/

    if (req.user) {
      var data = req.body;
      var dataToSent = {};
      if (data.reqID) {
        var currentDate = new Date();
        // var currentDateUTC = moment.utc(currentDate).format('L ');
        var startDateUTC = moment.utc(data.startDate).format("L ");
        var endDateUTC = moment.utc(data.endDate).format("L ");
        let UTCstartDate = moment.utc(data.startDate).format("L");
        let UTCendDate = moment.utc(data.endDate).format("L");
        var currentDateUTC = moment.utc(currentDate).format("L");
        var fromDBReqData = await msutils.fetchFromStoreByOptions(
          "TeamITRequest",
          { requestID: data.reqID },
          {}
        );
        var fromDBReqSkillData = await msutils.fetchFromStoreByOptions(
          "TeamITRequestSkill",
          { requestID: data.reqID },
          {}
        );
        var dataToSave = {
          skills: fromDBReqSkillData[0].skills,
          requestID: data.reqID,
          status: data.status,
          requesterEmail: data.requesterEmail,
          alternateEmail: data.alternateContactEmail
            ? data.alternateContactEmail
            : "",
          createDate: fromDBReqData[0].createDate,
          account: data.account,
          estHours: data.estimatedHours ? data.estimatedHours : "",
          geo: data.reqGeo,
          market: data.reqMarket,
          startDate: UTCstartDate,
          endDate: UTCendDate,
          description: data.description,
          comments: data.comments ? data.comments : "",
          supportType: data.supportType,
          shortDesc: data.shortDescription,
          adminStatus: fromDBReqData[0].adminStatus,
          claimTerms: data.claimTerms,
          complianceTerms: data.complianceTerms,
          closeCode: data.closeCode,
          resources: data.resourceToSave,
          patchId: fromDBReqData[0]._id,
          skillPatchId: fromDBReqSkillData[0]._id,
          isAdminUpdate: data.isAdminUpdate,
          adminTS: fromDBReqData[0].adminTS,
          requesterChannel: fromDBReqData[0].requesterChannel,
          requesterTS: fromDBReqData[0].requesterTS,
          requestorContactNo: data.requestorContactNo,
          technicalContactNo: data.technicalContactNo,
        };
        var startDateCheck = startDateUTC < currentDateUTC;
        var endDateCheck = endDateUTC < currentDateUTC;
        var dateCheck = true;
        var resourceCheck = false;
        var resourceArr = [];
        if (data.resourceToSave.length > 0) {
          for (var i = 0; i < data.resourceToSave.length; i++) {
            if (data.resourceToSave[i].includes("@")) {
              resourceCheck = false;
            } else {
              resourceArr.push(data.resourceToSave[i]);
            }
          }
        }
        if (resourceArr.length > 0) {
          resourceCheck = true;
          var errMsg = { resourceError: "Provide proper Resource Email" };
        }
        // if((currentDateUTC <= UTCstartDate) == false || (currentDateUTC <= UTCendDate) == false ){
        //     dateCheck = false;
        //     var errMsg = {dateError: "Provide date greater than current date"}
        // }
        // if((currentDateUTC <= UTCstartDate) == true && (currentDateUTC <= UTCendDate) == true  ){
        //     dateCheck = true;
        // }

        if (dateCheck == true && resourceCheck == false) {
          validateRequest = await postToTeamITRequest(dataToSave);
          if (
            validateRequest.successFlag == false ||
            validateRequest.successSkillFlag == false ||
            validateRequest.successDateFlag == false
          ) {
            logger.error(validateRequest.validateReqSkillMsg);
            res
              .status(400)
              .send({ fetch: false, fetchErrorfromRequester: validateRequest });
          } else {
            res.status(200).send({
              fetch: true,
              fetchSuccessfromRequester: validateRequest,
            });
          }
        } else {
          res
            .status(400)
            .send({ fetch: false, fetchErrorfromRequester: errMsg });
        }
      } else {
        var status = "Pending";
        var adminStatus = "Pending";
        var currentDate = new Date();
        let UTCstartDate = moment.utc(data.startDate).format("L");
        let UTCendDate = moment.utc(data.endDate).format("L");
        var currentDateUTC = moment.utc(currentDate).format("L");
        var newStartDate = new Date(data.startDate);
        var newEndDate = new Date(data.endDate);
        var newCurrrentDate = new Date(currentDate);
        var newStartDateCheck = newStartDate > newCurrrentDate;
        var newEndDateCheck = newEndDate > newCurrrentDate;
        var newstartEndDateCheck = newEndDate > newStartDate;
        if (data.startDate != undefined) {
          var startDateUTC = UTCstartDate;
        } else {
          var startDateUTC = "";
        }
        if (data.endDate != undefined) {
          var endDateUTC = UTCendDate;
        } else {
          var endDateUTC = "";
        }
        var startDateUTCCheck = startDateUTC >= currentDateUTC;
        var endDateUTCCheck = endDateUTC >= currentDateUTC;
        var dateCheck = true;
        var fromDB = await msutils.fetchFromStore("TeamITRequest", {});
        var IDCounter = 10000;
        var reqIDToSave;
        var rewIDToPush = [];
        var uniqueNames = [];
        if (fromDB.length == 0) {
          reqIDToSave = IDCounter;
        } else {
          for (var i = 0; i < fromDB.length; i++) {
            var requestIDFromDB = parseInt(fromDB[i].requestID);
            if (requestIDFromDB != undefined) {
              rewIDToPush.push(requestIDFromDB);
              var largestID = Math.max(...rewIDToPush);
              reqIDToSave = largestID + 1;
            }
          }
        }
        var dataToSave = {
          skills: data.skills,
          requestID: reqIDToSave.toString(),
          status: status,
          requesterEmail: data.requesterEmail,
          alternateEmail: data.alternateContactEmail
            ? data.alternateContactEmail
            : "",
          createDate: currentDateUTC,
          account: data.account,
          estHours: data.estimatedHours ? data.estimatedHours : "",
          geo: data.reqGeo,
          market: data.reqMarket,
          startDate: startDateUTC,
          endDate: endDateUTC,
          description: data.description,
          comments: data.comments ? data.comments : "",
          supportType: data.supportType,
          shortDesc: data.shortDescription,
          adminStatus: adminStatus,
          claimTerms: data.claimTerms,
          complianceTerms: data.complianceTerms,
          isAdminUpdate: data.isAdminUpdate,
          requestorContactNo: data.requestorContactNo,
          technicalContactNo: data.technicalContactNo,
        };
        var utcStartCheck = currentDateUTC <= UTCstartDate;
        var utcEndCheck = currentDateUTC <= UTCendDate;
        if (
          currentDateUTC <= UTCstartDate == false ||
          currentDateUTC <= UTCendDate == false
        ) {
          dateCheck = false;
          var errMsg = { dateError: "Provide date greater than current date" };
        }
        if (
          currentDateUTC <= UTCstartDate == true &&
          currentDateUTC <= UTCendDate == true
        ) {
          dateCheck = true;
        }
        if (dateCheck == true) {
          validateRequest = await postToTeamITRequest(dataToSave);
          if (
            validateRequest.successFlag == false ||
            validateRequest.successSkillFlag == false
          ) {
            logger.error(validateRequest.validateReqSkillMsg);

            /** start metrics invoked **/
            msutils.metricsQueueJobByJobType("updateMetricsFacts", {
              accountCode: "default",
              api: "saveTeamITRequester",
              sourceSystem: "default",
              microservice: "internal",
              subFunction: "default",
              service: "default",
              command: "default",
              stage: "error",
            });
            /** end metrics invoked **/

            res
              .status(400)
              .send({ fetch: false, fetchErrorfromRequester: validateRequest });
          } else {
            res.status(200).send({
              fetch: true,
              fetchSuccessfromRequester: validateRequest,
            });
            postSkillRequestApprovalToSlack(dataToSave)
              .then((validateSlack) => {})
              .catch((err) => {
                logger.error("Error Posting to user ERROR:", err);
              });
          }
        } else {
          res
            .status(400)
            .send({ fetch: false, fetchErrorfromRequester: errMsg });
        }
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    logger.error(e.message);

    /** start metrics invoked **/
    msutils.metricsQueueJobByJobType("updateMetricsFacts", {
      accountCode: "default",
      api: "saveTeamITRequester",
      sourceSystem: "default",
      microservice: "internal",
      subFunction: "default",
      service: "default",
      command: "default",
      stage: "error",
    });
    /** end metrics invoked **/
  }
});
// post Volunteer data to TeamITVulunteer collection
app.post("/saveTeamITVolunteer", async function (req, res) {
  logger.info(`Saving Volunteer data to TeamITVolunteer collection `);
  try {
    await getFreshAccountAccessDetail(req);
    if (req.user) {
      /** start metrics invoked **/
      msutils.metricsQueueJobByJobType("updateMetricsFacts", {
        accountCode: "default",
        api: "saveTeamITVolunteer",
        sourceSystem: "default",
        microservice: "internal",
        subFunction: "default",
        service: "default",
        command: "default",
        stage: "invoked",
      });
      /** end metrics invoked **/
      var data = req.body;
      var dataToSent = {};
      var fromDB = await msutils.fetchFromStore("TeamITVolunteer", {});
      var currentDate = new Date();
      var currentDateUTC = moment.utc(currentDate).format("L HH:mm");
      var dataToSave = {
        skills: data.skills,
        email: data.email,
        supportLocation: data.supportLocation,
        managerEmail: data.managerEmail,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        geo: data.geo,
        market: data.market,
        country: data.country,
        timezone: data.timezone,
        createDate: currentDateUTC,
        supportGlobal: data.supportGlobal,
        loginToClientSystem: data.loginToClientSystem,
        consultingSupport: data.consultingSupport,
        gsePractice: data.gsePractice,
        serviceLine: data.serviceLine,
        complianceTerms: data.complianceTerms,
        fromDB: fromDB,
      };
      var validateVolunteer = await postToTeamITVolunteer(dataToSave);
      if (
        validateVolunteer.successFlag == false ||
        validateVolunteer.successSkillFlag == false
      ) {
        logger.error(validateVolunteer.validateVolunteerSkillMsg);

        /** start metrics invoked **/
        msutils.metricsQueueJobByJobType("updateMetricsFacts", {
          accountCode: "default",
          api: "saveTeamITVolunteer",
          sourceSystem: "default",
          microservice: "internal",
          subFunction: "default",
          service: "default",
          command: "default",
          stage: "error",
        });
        /** end metrics invoked **/

        res
          .status(400)
          .send({ fetch: false, fetchErrorfromRequester: validateVolunteer });
      } else {
        /** start metrics invoked **/
        msutils.metricsQueueJobByJobType("updateMetricsFacts", {
          accountCode: "default",
          api: "saveTeamITVolunteer",
          sourceSystem: "default",
          microservice: "internal",
          subFunction: "default",
          service: "default",
          command: "default",
          stage: "completed",
        });
        /** end metrics invoked **/

        res
          .status(200)
          .send({ fetch: true, fetchSuccessfromRequester: validateVolunteer });
      }
    } else {
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    logger.error(e.message);
    /** start metrics **/
    msutils.metricsQueueJobByJobType("updateMetricsFacts", {
      accountCode: "default",
      api: "saveTeamITVolunteer",
      sourceSystem: "default",
      microservice: "internal",
      subFunction: "default",
      service: "default",
      command: "default",
      stage: "error",
    });
    /** end metrics **/
  }
});

app.get("/volunteertracker", async function (req, res) {
  logger.info(`Loading Volunteer tracker`);
  if (req.user) {
    const url = req.headers.referer;
    let requestId;
    if (url.includes("=")) {
      requestId = url.split("=").pop();
    } else {
      requestId = "";
    }
    let volunteerTrackerData = null;
    if (requestId) {
      volunteerTrackerData = await msutils.fetchFromStore(
        "TeamITVolunteerTracker",
        {
          requestID: requestId,
        }
      );
    }
    res
      .status(200)
      .send({ reqid: requestId, volunteerTrackerData: volunteerTrackerData });
  } else {
    logger.error("redirecting to login page");
    res.redirect(itTeamBaseUrl + "volunteerIt");
  }
});

// Team IT -- IS Together

// SRE Service
app.get("/webhooks", async function (req, res) {
  logger.info(`Loading Webhooks Page`);
  try {
    if (req.isAuthenticated()) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      res.redirect("/mui/notAuthorized");
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
app.get("/addWebhook", async function (req, res) {
  logger.info(`Loading Webhooks Form Page`);
  try {
    if (req.user) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      res.redirect("/mui/notAuthorized");
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e);
    res.redirect(baseUrl);
  }
});
app.get("/getWebhook/:id", async function (req, res) {
  logger.info(`SRE Service: Fetching SRE service data`);
  try {
    if (req.user) {
      // var url = req.headers.referer;
      var serviceID;
      var serviceName;
      var accountID;
      var accountName;
      var reqid;
      var accountData = [];
      var serviceData = [];
      var serviceNameCheck;
      var accountNameCheck;
      var toUI = {};
      // if(url.includes("=")){
      //     reqid = url.split('=').pop();
      // }else{
      //     reqid = '';
      // }
      reqid = req.params.id;
      var fromMUIAccounts = await msutils.fetchFromStoreById(
        "MUIAccounts",
        reqid
      );
      var fromSourceSyatems = await msutils.fetchFromStoreById(
        "SourceSystems",
        reqid
      );
      var webhooksFromDB = await msutils.fetchFromStore("Webhooks", {});
      let webhookURL = process.env.MUI_URL_EXT + "/api/v1/webhooks/";
      if (fromSourceSyatems != null) {
        serviceID = fromSourceSyatems._id;
        serviceName = fromSourceSyatems.SourceIdentificationCode;
      } else {
        serviceID = "";
        serviceName = "";
      }
      if (fromMUIAccounts != null) {
        accountID = fromMUIAccounts._id;
        accountName = fromMUIAccounts.accountCode;
      } else {
        accountID = "";
        accountName = "";
      }
      if (webhooksFromDB != undefined) {
        var webhookType;
        for (var i = 0; i < webhooksFromDB.length; i++) {
          if (webhooksFromDB[i].isService && serviceID != "") {
            serviceNameCheck = webhooksFromDB[i].SourceIdentificationCode;
            if (
              fromSourceSyatems.SourceIdentificationCode == serviceNameCheck
            ) {
              webhooksFromDB[i].webhookURL =
                webhookURL + webhooksFromDB[i].uniqueId;
              serviceData.push(webhooksFromDB[i]);
              toUI["tableData"] = serviceData;
            }
          }
          if (webhooksFromDB[i].isAccount && accountID != "") {
            accountNameCheck = webhooksFromDB[i].SourceIdentificationCode;
            if (fromMUIAccounts.accountCode == accountNameCheck) {
              webhooksFromDB[i].webhookURL =
                webhookURL + webhooksFromDB[i].uniqueId;
              accountData.push(webhooksFromDB[i]);
              toUI["tableData"] = accountData;
            }
          }
        }
      }

      toUI["serviceID"] = serviceID;
      toUI["serviceName"] = serviceName;
      toUI["accountID"] = accountID;
      toUI["accountName"] = accountName;
      res.status(200).send({ dbData: toUI });
    } else {
      res.redirect("/mui/notAuthorized");
      throw new Error("User is not authorized to access this application.");
    }
  } catch (e) {
    logger.error(e.message);
    res.status(500).send({ status: "failed", error: e });
  }
});
app.get('/getWebhookFormData/:serviceId', async function (req, res) {
  logger.info(`SRE Service: Fetching SRE service data for add Webhook form`);
  try{
      if (req.user) {
          var url = req.headers.referer;
          var toolTypeArr = [];
          var workspaceArr = [];
          var templateArr = [];
          const {serviceId} = req.params;
          const sourceSystemsData = await msutils.fetchFromStoreById("SourceSystems", serviceId);
          let collabTool = 'slack';
          if(sourceSystemsData){
              const workspaceDetail = await msutils.getWorkspaceByName(
                  sourceSystemsData.workspace
              );
              collabTool = workspaceDetail.workspaceType === 'TEAMS' ? 'teams' : 'slack';
          }else{
              const accountsData = await msutils.fetchFromStoreById("MUIAccounts", serviceId);
              const workspaceDetail = await msutils.getWorkspaceByName(
                  accountsData.is_GTSWorkspaceInUse
              );
              collabTool = workspaceDetail.workspaceType === 'TEAMS' ? 'teams' : 'slack';
          }
          var toUI = {};
          var toolType = await msutils.fetchFromStore("WebhookTools",{});
          var workspaces = await msutils.fetchFromStore("Workspace",{});
          for(var i = 0; i <toolType.length; i++){
              toolTypeArr.push(toolType[i].toolName)
          }
          for(var i = 0; i <workspaces.length; i++){
              if(workspaces[i].workspaceType.toLowerCase() === collabTool){
                  workspaceArr.push(workspaces[i].name)
              }
          }
          toUI["toolTypeArr"] = toolTypeArr;
          toUI["workspaceArr"] = workspaceArr;
          let templateType = (collabTool === "slack") ? "slack" : "msteams";
          var templates = await msutils.fetchFromStore("TicketTemplates", {});
          const ticketTemplates = templates.find((obj) => obj.id === "NotifyTemplates");
          if (ticketTemplates) {
            let en = ticketTemplates[templateType]
              ? ticketTemplates[templateType]["en"]
              : {};
            for (let key in en) {
                templateArr.push(key);
            }
          }
          toUI["templateArr"] = templateArr;
          res.status(200).send({"dbData": toUI, });
      }else {
          res.redirect("/mui/notAuthorized");
          throw new Error("User is not authorized to access this application.");
      }
  }
  catch(e){
      logger.error(e.message);
      res.status(500).send({status: 'failed', error: e})
  }
});
app.post("/saveWebhooks", async function (req, res) {
  logger.info(`Saving webhook information`);
  try {
    await getFreshAccountAccessDetail(req);
    var data = req.body;
    var dataToSave = {};
    var webhookError = {};
    var uniqueIDCheck = true;
    var fromMUIAccounts = await msutils.fetchFromStoreById(
      "MUIAccounts",
      data.reqid
    );
    var fromSourceSyatems = await msutils.fetchFromStoreById(
      "SourceSystems",
      data.reqid
    );
    var fetchTemplate = await msutils.fetchFromStore("TicketTemplates", {});
    for (var i = 0; i < fetchTemplate.length; i++) {
      if (fetchTemplate[i].slack) {
        var ticketTemplates = Object.keys(fetchTemplate[i].slack.en);
        if (data.toolType === ticketTemplates[0]) {
          dataToSave["templateId"] = fetchTemplate[i]._id;
        }
      }
    }
    if (fromSourceSyatems != null) {
      dataToSave["SourceIdentificationCode"] =
        fromSourceSyatems.SourceIdentificationCode;
      dataToSave["isService"] = true;
    }
    if (fromMUIAccounts != null) {
      dataToSave["SourceIdentificationCode"] = fromMUIAccounts.accountCode;
      dataToSave["isAccount"] = true;
    }
    if (data.hasOwnProperty("apiKey")) {
      var apiKey = await msutils.encrypt(data.apiKey);
    }
    var uniqueIDToSave = uuidv4().slice(0, 8).toUpperCase();
    logger.info(`Creating Webhook data`);
    var fromDb = await msutils.fetchFromStore("Webhooks", {});
    for (let j = 0; i < fromDb.length; i++) {
      if (uniqueIDToSave === fromDb[j].uniqueId) {
        uniqueIDCheck = false;
        webhookError["webhookError"] =
          "Some error occured while saving. Please try again";
        throw new Error(
          "Error occured while saving. Unique ID already existing. Try again"
        );
      } else {
        uniqueIDCheck = true;
      }
    }
    if (uniqueIDCheck === true) {
      dataToSave["assignedMembers"] = data.assignedMembers.split(",");
      dataToSave["uniqueId"] = uniqueIDToSave;
      dataToSave["apiKey"] = apiKey;
      dataToSave["toolName"] = data.toolType;
      dataToSave["workSpaceName"] = data.workspace;
      dataToSave["channelName"] = "";
      dataToSave["channelId"] = "";
      dataToSave["ChannelAutoCreate"] = data.channelAutoCreate;
      dataToSave["allowUpdates"] = data.allowUpdates;
      dataToSave["serviceAccountEmailId"] = data.serviceAccountEmailId;
      dataToSave["isEnabled"] = data.isEnabled;
      dataToSave["webhookName"] = data.webhookName;
      let tmpTemplate = data["templateType"];
      if(data.toolType === "NotifyTemplates"){
          await dataForCacfAlert(dataToSave, tmpTemplate);
      }
      await msutils.saveInStore("Webhooks", dataToSave);
      res.status(200).send({ webhookSaved: true, webhookError: "" });
    } else {
      webhookError["webhookError"] =
        "Some error occured while saving. Please check the data provided";
      return res.status(400).send({
        webhookSaved: false,
        webhookError: webhookError,
        redirectUrl: baseUrl + "addWebhook",
      });
    }
  } catch (e) {
    logger.error(e);
    logger.error(e.message);
  }
});


async function dataForCacfAlert(dataToSave, tmpTemplate){
  try{

    dataToSave["assignedMembers"] = [];
    dataToSave["channelName"] = "";
    dataToSave["channelId"] = "";
    dataToSave["ChannelAutoCreate"] = false;
    dataToSave["allowUpdates"] = false;
    dataToSave["serviceAccountEmailId"] = "";
    dataToSave["apiKey"] = "";
    dataToSave["templateId"] = tmpTemplate;
  }catch(e){
    console.log(e);
  }
}

app.patch("/webhooks", async function (req, res) {
  try {
    if (req.user) {
      const data = req.body;
      logger.info(`requestedData: ${JSON.stringify(data)}`);
      const id = data.id;
      await msutils.patchDataInStore("Webhooks", id, {
        isEnabled: data.isEnabled,
      });
      res.status(200).send({ WebhooksSaved: true, webhookError: "" });
    } else {
      res.redirect("/mui/notAuthorized");
      throw new Error("User is not authorized to access this application.");
    }
  } catch (error) {
    logger.error(error.message);
    res.status(500).send({ status: "failed", error: error });
  }
});
// SRE Service

/* Maintenance Window Onboarding */
app.post(
  "/onboardForMaintenanceWindow",
  upload.single("file"),
  async function (req, res) {
    try {
      console.log("operationMode: ", req.body.operationMode);
      if (
        req.body.operationMode !== "create" &&
        req.body.operationMode !== "edit"
      ) {
        throw new Error("Invalid operation mode");
      }

      if (!req.body.tabIndex) {
        throw new Error("Must provide tab index");
      }

      let { tabIndex, operationMode } = req.body;

      if (tabIndex === "0") {
        let {
          certFilePassphrase,
          accountCode,
          enableMaintenanceWindow: maintenanceWindowAlert,
          authType,
          instanceType,
          maintenanceBaseUrl,
        } = req.body;

        maintenanceWindowAlert =
          maintenanceWindowAlert === "true" ? true : false;

        let isCertSaved = false;

        //undefined & create
        if (!req.file && operationMode === "create") {
          throw new Error("No file attached");
        } else if (!req.file && operationMode === "edit") {
          isCertSaved = true;
        }

        if (authType === "cert" && req.file) {
          logger.info("Updating file details in CertFiles");
          isCertSaved = await saveCertFile({
            file: req.file,
            passphrase: certFilePassphrase,
            accountCode: accountCode,
          });
        }

        if (isCertSaved) {
          let channelId = await getChannelId(accountCode);

          if (!channelId) {
            throw new Error("No channel is linked to account");
          }

          await updateAccountDetails({
            tabIndex: tabIndex,
            accountCode: accountCode,
            maintenanceWindowAlert: maintenanceWindowAlert,
            instanceType: instanceType,
            maintenanceBaseUrl: maintenanceBaseUrl,
          });

          let rawMessageTemplate = await fetchSingleDocument(
            "TicketTemplates",
            {
              id: "mneButtonTemplate",
            }
          );

          if (rawMessageTemplate) {
            let accountData = await fetchSingleDocument("Accounts", {
              accountCode: accountCode,
            });

            if (accountData) {
              let { workspaceName, collaborationTool } = accountData;

              const headers = {
                transactionid: uuidv4(),
              };

              console.log(
                "collaborationTool: ",
                collaborationTool.toUpperCase()
              );

              if (collaborationTool.toUpperCase() === "SLACK") {
                let data = {
                  channelId: channelId,
                  accountCode: accountCode,
                };

                //   let { baseUrl } = accountData.gsmaConfig;

                let active = await fetchSingleDocument("settings", {
                  config_name: "gsma_active",
                });
                let endpoint = active.config_value.url;
                active.config_value.apiEndpoint = `${maintenanceBaseUrl}${endpoint}`;

                let scheduled = await fetchSingleDocument("settings", {
                  config_name: "gsma_scheduled",
                });
                endpoint = scheduled.config_value.url;
                scheduled.config_value.apiEndpoint = `${maintenanceBaseUrl}${endpoint}`;

                let create = await fetchSingleDocument("settings", {
                  config_name: "gsma_create",
                });
                endpoint = create.config_value.url;
                create.config_value.apiEndpoint = `${maintenanceBaseUrl}${endpoint}`;

                let actionIdObj = {
                  [`MNE-GET-ACTIVE-${accountCode}-${channelId}`]:
                    active.config_value,
                  [`MNE-GET-SCHEDULED-${accountCode}-${channelId}`]:
                    scheduled.config_value,
                  [`MNE-CREATE-MAINTENANCE-${accountCode}-${channelId}`]:
                    create.config_value,
                };

                if (operationMode === "edit") {
                  // deleting buttons actions mapped to respective account and channel
                  logger.info("Deleting button actions");
                  await deleteButtonActions(accountCode, channelId);
                }

                const slackTemplateUtils = new msutils.SlackTemplateUtils(
                  "en",
                  "mne",
                  rawMessageTemplate,
                  rawMessageTemplate.type,
                  data,
                  actionIdObj,
                  "message"
                );

                let { dynamicActionObj, template } =
                  await slackTemplateUtils.init();

                console.log(
                  "dynamicActionObj: ",
                  JSON.stringify(dynamicActionObj)
                );

                let slackPayload = {
                  accountCode: accountCode,
                  workspaceName: workspaceName,
                  channelid: channelId,
                  ts: "",
                  isUpdate: false,
                  language: "English",
                  message: template,
                  actions: dynamicActionObj,
                };

                if (template && dynamicActionObj) {
                  await msutils.postToCollaborator(
                    "sendMessage",
                    slackPayload,
                    headers
                  );

                  res
                    .status(200)
                    .send({ status: "succcess", message: "Success!" });
                } else {
                  res.status(500).send({
                    status: "failed",
                    message: "Failed to post message to slack",
                  });
                }
              }

              if (collaborationTool.toUpperCase() === "TEAMS") {
                console.log(
                  "rawMessageTemplate: ",
                  JSON.stringify(rawMessageTemplate)
                );
                let template = rawMessageTemplate.msteams.en.mne.message;

                const interpolatedMessage =
                  await msutils.prepareMsTeamsTemplate(
                    { accountCode: accountCode },
                    template
                  );

                workspaceName = accountData.collabConfig.teams.workspaceName;

                let teamsPayload = {
                  accountCode: accountCode,
                  workspaceName: workspaceName,
                  channelid: channelId.toLowerCase(),
                  ts: "",
                  isUpdate: false,
                  language: "English",
                  message: interpolatedMessage,
                  collabPlatform: "TEAMS",
                };

                if (interpolatedMessage) {
                  console.log(
                    "\n teamsPayload: ",
                    JSON.stringify(teamsPayload)
                  );
                  await msutils.postToCollaborator(
                    "sendMessage",
                    teamsPayload,
                    headers
                  );

                  res
                    .status(200)
                    .send({ status: "succcess", message: "Success!" });
                } else {
                  res.status(500).send({
                    status: "failed",
                    message: "Failed to post message to slack",
                  });
                }
              }
            }
          }
        }
      }

      if (tabIndex === "1") {
        let {
          accountCode,
          enableHandlerEvent,
          handlerBaseUrl,
          handlerAuthUserName,
          handlerAuthPassword,
        } = req.body;

        enableHandlerEvent = enableHandlerEvent === "true" ? true : false;

        //undefined & create
        if (!req.file && operationMode === "create") {
          throw new Error("No file attached");
        }

        let ticketHandlerAuthId = "";
        logger.info("Updating file details in TicketHandlerAuth");
        ticketHandlerAuthId = await saveTicketHandlerAuth({
          url: handlerBaseUrl,
          userName: handlerAuthUserName,
          password: handlerAuthPassword,
          pemFile: req.file,
        });

        if (ticketHandlerAuthId) {
          await updateAccountDetails({
            tabIndex: tabIndex,
            accountCode: accountCode,
            enableHandlerEvent: enableHandlerEvent,
            ticketHandlerAuthId: ticketHandlerAuthId,
          });

          res.status(200).send({ status: "succcess", message: "Success!" });
        }
      }

      if (tabIndex === "2") {
        let { accountCode, channelId } = req.body;

        await mapChannelDocs(channelId, accountCode);

        res.status(200).send({ status: "success", message: "Success!" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "failed", error: error.message });
    }
  }
);

app.get("/getMaintenanceWindow", async function (req, res) {
  try {
    let { accountCode } = req.query;
    let response = await fetchMaintenanceWindowData(accountCode);

    res.status(200).send({
      status: "succcess",
      message: "Success!",
      data: response,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", error: error.message });
  }
});

app.get("/fetchTicketHandlerData", async function (req, res) {
  try {
    let { handlerBaseUrl } = req.query;

    let response = await fetchTicketHandlerAuthData(handlerBaseUrl);

    if (response) {
      res.status(200).send({
        status: "succcess",
        message: "Success!",
        data: response,
      });
    } else {
      res.status(200).send({
        status: "fail",
        message: "Failed!",
        data: response,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", error: error.message });
  }
});

/* Maintenance Window Onboarding */



//  <<<<<<<---------------------------------MUI Redesign Routes----------------------------------------->>>>>>>>
// Home page   
app.get('/MUIHome', async function (req, res) {
    if(req.user){
        let result = await getFreshAccountAccessDetail(req);
        logger.debug(`Validating account access to new home page for user : ${req.user.id}`);
        res.sendFile(path.join(__dirname, "build", "index.html"));
    }else{
        res.redirect(baseUrl);  
    } 
});
app.get('/MUIAccountProfile', async function (req, res) {
    if(req.user){
        let result = await getFreshAccountAccessDetail(req);
        logger.debug(`Validating account access to new account profile page for user : ${req.user.id}`);
        res.sendFile(path.join(__dirname, "build", "index.html"));
    }else{
        res.redirect(baseUrl);  
    } 
});
app.get('/MUIITSMIntegration', async function (req, res) {
    if(req.user){
        let result = await getFreshAccountAccessDetail(req);
        logger.debug(`Validating account access to new ITSM Integration page for user : ${req.user.id}`);
        res.sendFile(path.join(__dirname, "build", "index.html"));
    }else{
        res.redirect(baseUrl);  
    } 
});
app.get('/MUIIncidentManagement', async function (req, res) {
    if(req.user){
        let result = await getFreshAccountAccessDetail(req);
        logger.debug(`Validating account access to new Incident management page for user : ${req.user.id}`);
        res.sendFile(path.join(__dirname, "build", "index.html"));
    }else{
        res.redirect(baseUrl);  
    } 
});
app.get('/MUIAnsibleIntegration', async function (req, res) {
    if(req.user){
        let result = await getFreshAccountAccessDetail(req);
        logger.debug(`Validating account access to new Ansible integration page for user : ${req.user.id}`);
        res.sendFile(path.join(__dirname, "build", "index.html"));
    }else{
        res.redirect(baseUrl);  
    } 
});
app.get('/MUIAssignments', async function (req, res) {
    if(req.user){
        let result = await getFreshAccountAccessDetail(req);
        logger.debug(`Validating account access to new Assignments page for user : ${req.user.id}`);
        res.sendFile(path.join(__dirname, "build", "index.html"));
    }else{
        res.redirect(baseUrl);  
    } 
});
app.get('/MUIInsights', async function (req, res) {
    if(req.user){
        let result = await getFreshAccountAccessDetail(req);
        logger.debug(`Validating account access to new Insights page for user : ${req.user.id}`);
        res.sendFile(path.join(__dirname, "build", "index.html"));
    }else{
        res.redirect(baseUrl);  
    } 
});
app.get('/MUIDashboard', async function (req, res) {
    if(req.user){
        let result = await getFreshAccountAccessDetail(req);
        logger.debug(`Validating account access to new Insights page for user : ${req.user.id}`);
        res.sendFile(path.join(__dirname, "build", "index.html"));
    }else{
        res.redirect(baseUrl);  
    } 
});

app.get('/MUIAddIndexChannel', async function (req, res) {
    if(req.user){
        logger.debug(`Validating account access to new Index Channel page for user : ${req.user.id}`);
        res.sendFile(path.join(__dirname, "build", "index.html"));
    }else{
        res.redirect(baseUrl);  
    } 
});

app.get('/MUIChatPlatform', async function (req, res) {
    if(req.user){
        logger.debug(`Validating account access to new Chat platform page for user : ${req.user.id}`);
        res.sendFile(path.join(__dirname, "build", "index.html"));
    }else{
        res.redirect(baseUrl);  
    } 
});


var options = {
  secureOptions:
    constants.SSL_OP_NO_SSLv2 |
    constants.SSL_OP_NO_SSLv3 |
    constants.SSL_OP_NO_TLSv1 |
    constants.SSL_OP_NO_TLSv1_1,
  key: fs.readFileSync(`./ssl/${process.env.NODE_ENV}/privatekey.pem`),
  cert: fs.readFileSync(`./ssl/${process.env.NODE_ENV}/certificate.pem`),
  requestCert: false,
  rejectUnauthorized: false,
};

let configureServer = setInterval(async function () {
  let config = await msutils.getConfig();
  if (config) {
    logger.info("Fetched mui config...");
    https.createServer(options, app).listen(port, function () {
      logger.info(`MUI listening at port ${port}`);
      return clearInterval(configureServer);
    });
  }
}, 3000);