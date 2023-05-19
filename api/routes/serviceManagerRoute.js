const { default: axios } = require("axios");
const expres = require("express");
const msutils = require("msutils");
const logger = require("winston");

const router = expres.Router();

router.get("/serachRule", async (req, res, next) => {
  try {
    const queryObj = req.query;
    let serviceManagerRule = await msutils.fetchFromStore(
      "ServiceManager",
      queryObj
    );
    res.status(200).send(serviceManagerRule);
  } catch (e) {
    logger.error(
      "Error while fetching Service Manager rules: ",
      JSON.stringify(e.message)
    );
    res.status(500).send({ status: "failed", error: e });
  }
});

router.get("/getTicketState/:accountCode", async (req, res, next) => {
  try {
    const accountCode = req.params.accountCode;
    let ticketingToolDetail = await msutils.fetchFromStoreByOptions(
      "TicketingTool",
      { accountCode: accountCode }
    );
    res
      .status(200)
      .send({ msStatusValues: ticketingToolDetail[0].msStatusValues });
  } catch (e) {
    logger.error(
      "Error while fetching ticket state from Ticketing Tool: ",
      JSON.stringify(e.message)
    );
    res.status(500).send({ status: "failed", error: e });
  }
});

router.get("/getDynamiceParamNames/:accountCode", async (req, res, next) => {

  try {
    const accountCode = req.params.accountCode;
    let ticketingToolDetail = await msutils.fetchFromStoreByOptions(
      "TicketingTool",
      { accountCode: accountCode }
    );
    let instanceUrl, token;
    if (ticketingToolDetail[0].authType === "Basic") {
      instanceUrl = ticketingToolDetail[0].instanceUrl;
      token =
        "Basic " +
        Buffer.from(
          msutils.decrypt(ticketingToolDetail[0].basicAuth.username) +
            ":" +
            msutils.decrypt(ticketingToolDetail[0].basicAuth.password)
        ).toString("base64");
    } else {
      if (
        ticketingToolDetail[0].authType === "noAuth" &&
        ticketingToolDetail[0].serviceManager
      ) {
        instanceUrl = ticketingToolDetail[0].serviceManager.url;
        const { username, password } = ticketingToolDetail[0].serviceManager;
        token =
          "Basic " +
          Buffer.from(
            msutils.decrypt(username) + ":" + msutils.decrypt(password)
          ).toString("base64");
      }
    }
    instanceUrl += '/api/now/table/incident?sysparm_limit=1'
    const response = await axios.get(instanceUrl, {
      headers: {
        Authorization: token,
      },
    });
     console.log(`response from ticketing tool for getting parameters------>> ${response}`);
     console.log(response.data);
     const serviceNowParams = Object.keys(response.data.result[0])
     res.status(200).send({serviceNowParams  })
  } catch (error) {
      console.log(`Error while fetching from ticketing tool for getting parameters`);
      console.log(error);
      res.status(500).send({ status: "failed", error });
  }
});


router.get('/serviceManagerSettings/:accountCode', async (req,res) => {
    try {
        let response = await msutils.fetchFromStoreByOptions(
            "ServiceManagerSettings",
            { accountCode: req.params.accountCode }
          );

          const serviceManager = await msutils.fetchSettings(
            'serviceManager',
          );
          console.log(`serviceManagerSettings`);
          console.log(response);
        res.status(200).send({serviceManagerSettings: response, dynamicQueryOperators: serviceManager.dynamicQueryOperators, ticketPriorities: serviceManager.ticketPriorities })
    } catch (error) {
        res.status(500).send({ status: "failed", error});
    }
    

    // 
});

router.patch('/serviceManagerSettings', async (req,res) => {
    try {
        const {id, data} = req.body;
        await msutils.patchDataInStore("ServiceManagerSettings", id, data);
        res.status(200).send({ incidentParamNames:data });
        
} catch (error) {
    logger.error(error.message);
    res.status(500).send({status: 'failed', error: error})
}
})
router.post('/serviceManagerSettings', async (req,res) => {
    try {
        const {accountCode, incidentParamNames} = req.body.data;
        const data = {
          accountCode,
          incidentParamNames
        }

       const result =  await msutils.saveInStore("ServiceManagerSettings", data);
        res.status(200).send({ result });
        
} catch (error) {
  console.log(`error during save in store`);
    logger.error(error.message);
    res.status(500).send({status: 'failed', error: error})
}
})

module.exports = router;
