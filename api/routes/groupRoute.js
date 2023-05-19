
const expres = require('express');
const msutils = require('msutils');
const logger = require('winston');


const router = expres.Router();

router.get('/getGroup/:grpName', async function(req, res) {
    logger.info('Checking for unique group name')
    const {grpName} = req.params
    try {
        var groupDetail = await msutils.fetchFromStoreByOptions(
            'ChatopsGroups',
            { name: grpName }
        );
        
        logger.info(`Existing group detail is : ${JSON.stringify(groupDetail)}`)
        res.status(200).send(groupDetail); 
        
    } catch (error) {
        logger.error(
            "Error while fetching Group List: ",
            JSON.stringify(error.message)
          );
          res.status(500).send({status: 'failed', error})
    }
});


module.exports = router;