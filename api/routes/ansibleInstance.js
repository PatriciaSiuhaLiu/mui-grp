var express = require('express');
var router = express.Router();
var https = require('https');
var axios = require("axios");
var msutils = require('msutils');
var logger = require('winston');
const {
    getFreshAccountAccessDetail
} = require('./../helper/groupUtil')
const baseUrl = '/mui/';
const path = require("path");

//const isReachable = require('is-reachable');

/* get ansible instance list. */
router.post('/', async function(req, res, next) {

    try {
        await getFreshAccountAccessDetail(req);
        if (req.session.isAccountAdmin || req.session.isSuperAdmin) {
            const url = req.body.ansibleInstanceData.url;
            req.body.ansibleInstanceData.url = ((url[url.length - 1]) === '/') ? (url.substring(0, url.length - 1)) : url;
            const encryptedUserKey = (req.body.ansibleInstanceData.userKey) ? Buffer.from(req.body.ansibleInstanceData.userKey).toString('base64') : '';
            req.body.ansibleInstanceData.userKey = encryptedUserKey;
            (!req.body.ansibleInstanceData.threeScale) ? req.body.ansibleInstanceData['threeScale'] = false: '';
            let edit = (req.body.edit) ? true : false;
            let result = false;
            req.body.ansibleInstanceData['accountCode'] = req.body.ansibleInstanceData.accountCode ? req.body.ansibleInstanceData.accountCode : '';

            if (req.body.ansibleInstanceData['autoStatus'] == 'kafka') {
                const parsedJson = JSON.parse(req.body.ansibleInstanceData['kafkaStream']);
                if (parsedJson["secret_id"]) {
                    const secretId = msutils.encrypt(parsedJson.secret_id);
                    parsedJson["secret_id"] = secretId;
                }
                if (parsedJson["api_key"]) {
                    let apiKey = msutils.encrypt(parsedJson.api_key);
                    parsedJson["api_key"] = apiKey;
                }
                req.body.ansibleInstanceData['kafkaStream'] = parsedJson;
            }

            if (edit) {
                const id = req.body.ansibleInstanceData._id;
                delete req.body.ansibleInstanceData._id;
                result = await msutils.patchDataInStore('AnsibleInstance', id, req.body.ansibleInstanceData);
            } else {
                result = await msutils.saveInStore("AnsibleInstance", req.body.ansibleInstanceData);
            }
            await msutils.clearAnsibleInstanceFromCache();
            if (result) {
                logger.info(
                    `ansible instance saved successfully`, {
                        transactionid: ``,
                        class: 'ansibleInstance',
                        function: 'saveansibleInstance',
                    },
                );
                res.send({
                    'success': true
                });
                return;
            }
            throw new Error("Error saving ansible instance");
        } else {
            throw new Error("User is not authorized to access this application.");
        }
    } catch (e) {
        logger.error(e.message);
        res.send({
            'success': false
        });
        return;
    }

});

/* test connection to ansible instance. */
router.get('/testconnection', async function(req, res, next) {

    try {

        await getFreshAccountAccessDetail(req);
        if (req.session.isAccountAdmin) {
            let url = req.query.url;
            var lastChar = ((url[url.length - 1]) !== '/') ? '/' : url;
            var userKey = (req.query.key) ? (req.query.key) : '';
            let data = {
                url: `${req.query.url}${lastChar}/ping/`,
                userKey
            };
            let result = await testConnection(`${process.env.CHATOPS_ANSIBLE_INTEGRATION}/ansibleTestConnection`, data);
            if (!result) {
                throw new Error("User is not authorized to access this application.");
            }
            res.send({
                'success': true
            });
            return;
        } else {
            throw new Error("User is not authorized to access this application.");
        }

    } catch (e) {
        logger.error(e);
        res.send({
            'success': true
        });
    }
});


async function testConnection(url, data) {

    return new Promise(async (resolve, reject) => {
        const axiosConfig = {
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        axios
            .post(url, data, axiosConfig)
            .then((response) => {
                console.log(response.data);
                resolve(response.data);
            })
            .catch((err) => {
                reject(err);
            });
    }).catch(err => {
        logger.error('testConnection ERROR:', err);
        return false;
    });
}


router.get('/', async function(req, res) {
    logger.info(`Loading Super Admin ansible instances Listing page.`);
    try {
        await getFreshAccountAccessDetail(req);
        if (req.session.isSuperAdmin) {
            const pathIndex = __dirname.replace('routes', '');
            res.sendFile(path.join(pathIndex, "build", "index.html"));
        } else {
            throw new Error("User is not authorized to access this application.");
        }
    } catch (e) {
        console.log(e)
        logger.error(e);
        res.redirect(baseUrl);
    }
});

router.get('/list', async function(req, res) {
    logger.info(`Loading Super Admin ansible instances Listing page.`);
    try {
        await getFreshAccountAccessDetail(req);
        if (req.session.isSuperAdmin) {
            const ansibleInstancesList = await msutils.fetchFromStore('AnsibleInstance', {
                "threeScale": true
            });
            let ansibleInstances = ansibleInstancesList.map(function(ansibleInstanceObject) {
                let temp = Buffer.from(ansibleInstanceObject.userKey, 'base64').toString('ascii');
                const instance = msutils.encrypt(ansibleInstanceObject._id);
                ansibleInstanceObject.instanceId = instance;
                ansibleInstanceObject.userKey = temp;
                return ansibleInstanceObject;
            });
            res.status(200).send({
                "ansibleInstancesData": ansibleInstances,
                "redirectUrl": baseUrl + "ansibleInstance"
            });
        } else {
            throw new Error("User is not authorized to access this application.");
        }
    } catch (e) {
        logger.error(e.message);
        res.redirect(baseUrl);
    }
});

// Add ansible instances SA
router.get('/add', async function(req, res) {
    logger.info(`Loading ansible instances Form for SA`);
    try {
        await getFreshAccountAccessDetail(req);
        if (req.session.isSuperAdmin) {
            const ansibleInstancesList = await msutils.fetchFromStore('AnsibleInstance', {
                "threeScale": true
            });
            const ansibleList = await msutils.fetchFromStore('AnsibleInstance', {});
            let ansibleInstanceId = '';
            let url = req.headers.referer;
            let ansibleInstanceObject = {};
            if (url && url.includes("?")) {
                logger.info("Url Found");
                ansibleInstanceId = url.split('?').pop();
                ansibleInstanceObject = ansibleInstancesList.find(
                    (a) => a._id === ansibleInstanceId,
                );
            }
            if (ansibleInstanceObject && ansibleInstanceObject.userKey) {
                ansibleInstanceObject.userKey = Buffer.from(ansibleInstanceObject.userKey, 'base64').toString('ascii');
            }
            let edit = (ansibleInstanceObject && ansibleInstanceObject.url) ? true : false;

            if (ansibleInstanceObject['autoStatus'] == 'kafka') {
                const parsedJson = ansibleInstanceObject['kafkaStream'];
                if (parsedJson["secret_id"]) {
                    const secretId = msutils.decrypt(parsedJson.secret_id);
                    ansibleInstanceObject['kafkaStream']["secret_id"] = secretId;
                }
                if (parsedJson["api_key"]) {
                    let apiKey = msutils.decrypt(parsedJson.api_key);
                    ansibleInstanceObject['kafkaStream']["api_key"] = apiKey;
                }
            }
            await msutils.clearAnsibleInstanceFromCache();
            res.status(200).send({
                "ansibleInstancesData": ansibleInstancesList,
                ansibleList,
                edit,
                ansibleInstanceObject
            });
        } else {
            throw new Error("User is not authorized to access this application.");
        }
    } catch (e) {
        logger.error(e.message);
        res.redirect(baseUrl);
    }
});

module.exports = router;