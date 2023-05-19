const excelTOJSON = require("convert-excel-to-json");
const joi = require("joi");
const msutils = require("msutils");
const logger = require("winston");
const COLLECTION_NAME = "CRFollowUp";
const SHEETS = {
  Users: {
    fields: {
      user: "user",
      email: "user.email",
      group: "group",
    },
    schema: joi.object({
      group: joi.string().required(),
      user: joi.string().required(),
      email: joi.string().email().required(),
    }),
  },
  Groups: {
    fields: {
      name: "name",
      email: "email",
      managerEmail: "manager.email",
    },
    schema: joi.object({
      name: joi.string().required(),
      managerEmail: joi.string().email().optional(),
      email: joi.string().email().optional(),
    }),
  },
};

function errorMessageMapping(errors, excelObject) {
  let valError;
  const sheets = Object.keys(excelObject);
  if (!errors.found) {
    const validEntries = {};
    sheets.forEach(
      (sheet) => (validEntries[sheet] = excelObject[sheet].validEntries)
    );
    return { validEntries };
  } else {
    const invalidEntries = {};
    if (errors.emptySheets.length && errors.invalidEntries.length) {
      valError = `Required sheet ${errors.emptySheets.join()} not found and ${errors.invalidEntries.join()} has invalid entries. Please correct and upload again`;
    } else if (errors.emptySheets.length) {
      valError = `Required sheets not found or empty - ${errors.emptySheets.join()}`;
    } else if (errors.invalidEntries.length) {
      valError = `File contains invalid entries, please correct and upload again`;
    }
    sheets.forEach((sheet) => {
      if (errors.invalidEntries.includes(sheet))
        invalidEntries[sheet] = excelObject[sheet].invalidEntries;
    });
    return { valError, invalidEntries };
  }
}

module.exports.getJSONFromExcel = function (excelInBuffer) {
  const result = excelTOJSON({
    source: excelInBuffer,
    sheets: Object.keys(SHEETS),
    header: {
      rows: 1,
    },
    columnToKey: {
      "*": "{{columnHeader}}",
    },
  });
  return result;
};

module.exports.validateExcelFile = function (excelJSON) {
  const validation = { valError: false };
  const sheetNames = Object.keys(SHEETS);
  const errors = {
    found: false,
    emptySheets: [],
    invalidEntries: [],
  };
  sheetNames.forEach((sheetName) => {
    const invalidEntries = [];
    const validEntries = [];
    const currentSheet = SHEETS[sheetName];
    if (excelJSON[sheetName]) {
      const jsonData = excelJSON[sheetName];
      jsonData.forEach((entry, index) => {
        const fields = Object.keys(currentSheet.fields);
        const currentRecord = {};
        fields.forEach((field) => {
          currentRecord[field] = entry[currentSheet.fields[field]];
        });
        const isBlankRow = !Object.keys(currentRecord).some(
          (key) => currentRecord[key]
        );
        if (!isBlankRow) {
          const { error } = currentSheet.schema.validate(currentRecord);
          error
            ? invalidEntries.push({ index: index + 2, ...currentRecord })
            : validEntries.push(currentRecord);
        }
      });
      if (invalidEntries.length > 0) {
        errors.found = true;
        errors.invalidEntries.push(sheetName);
      } else if (validEntries.length === 0) {
        errors.found = true;
        errors.emptySheets.push(sheetName);
      }
    }
    validation[sheetName] = { validEntries, invalidEntries };
  });
  return errorMessageMapping(errors, validation);
};

module.exports.processExcelData = async function (accountCode, validEntries) {
  const usersSheet = validEntries["Users"];
  const groupsSheet = validEntries["Groups"];

  let groupObject = usersSheet.reduce((grpObj, currentEntry) => {
    const { user, email, group } = currentEntry;
    const userObject = { user, email };
    const groupArray = grpObj[group];
    groupArray ? groupArray.push(userObject) : (grpObj[group] = [userObject]);
    return grpObj;
  }, {});

  const logInfo = {
    function: "CRApprovalFollowUpHandler",
    class: "ItsmSnowHandler",
  };

  const groups = Object.keys(groupObject);
  const groupList = groups.map((group) => ({
    name: group,
    users: groupObject[group],
  }));

  groupsSheet.forEach((grp) => {
    const { email, managerEmail, name } = grp;
    const groupInUsers = groupList.find((group) => group.name === name);
    if (groupInUsers) {
      groupInUsers.email = email;
      groupInUsers.managerEmail = managerEmail;
    } else {
      const newGroup = { name, email, managerEmail };
      groupList.push(newGroup);
    }
  });

  groupObject = { accountCode, groupList };
  logger.info(`Retrieving existing ${accountCode} record from DB `, logInfo);
  const dbRecords = await msutils.fetchFromStore(COLLECTION_NAME, {
    accountCode,
  });
  if (dbRecords.length > 0) {
    logger.info(`Deleting ${accountCode} Record from DB `, logInfo);
    const delRecord = await msutils.deleteDataInStore(
      COLLECTION_NAME,
      dbRecords[0]._id
    );
    logger.info(delRecord);
  } else {
    logger.info(`${accountCode} record not present in DB `, logInfo);
  }
  logger.info(`Saving ${accountCode} new Record to DB `, logInfo);
  const saveInStore = await msutils.saveInStore(COLLECTION_NAME, groupObject);
  logger.info(`${accountCode} Record saved to DB `, logInfo);

  return;
};
