function flattenObject(ob){
    let result = {};
    for (const i in ob) {
        if ((typeof ob[i]) === 'object' && !Array.isArray(ob[i])) {
            const temp = flattenObject(ob[i]);
            for (const j in temp) {
                result[i + '.' + j] = temp[j];
            }
        }
         else {
            result[i] = ob[i];
        }
    }
    return result;
}
  
function sqlInjectionChars(val, fieldName) {
    if(typeof(val) === 'object'){
        val = JSON.stringify(val);
    }
    let url = window.location.pathname;
    let specialChars = /[`#$^&*()+\={};':"\\|,.<>\?~]/; // default chat check
    //TODO: clean the below code by grouping allowed entries
    if(fieldName.toLowerCase().includes('rule') || fieldName.toLowerCase().includes('config_value') || fieldName.toLowerCase().includes('incidentparamnames') || fieldName.toLowerCase().includes('sys_updated_on') || fieldName.toLowerCase().includes('sys_updated_by') || fieldName.toLowerCase().includes('due_date')  || fieldName.toLowerCase().includes('queryparameters') || fieldName.toLowerCase().includes('collabconfig') || fieldName.toLowerCase().includes('channel')){
        specialChars = /[`#$^&+\;\\|?~]/;
    }else if(fieldName.toLowerCase().includes('email') || fieldName.toLowerCase().includes('member') || fieldName.toLowerCase().includes('accounts') || fieldName.toLowerCase().includes('scope') || fieldName.toLowerCase().includes('assignment') || fieldName.toLowerCase().includes('issue') || fieldName.toLowerCase().includes('workspace') || fieldName.toLowerCase().includes('owners') || fieldName.toLowerCase().includes('administrator') || fieldName.toLowerCase().includes('collaborators') || fieldName.toLowerCase().includes('priorities')|| fieldName.toLowerCase().includes('ksatcontactse') || fieldName.toLowerCase().includes('accountteamcontact') || fieldName.toLowerCase().includes('ksatcontactinfo')){
        specialChars = /[`#$^&()+\=;\\|<>\?~]/;
    }else if(fieldName.toLowerCase().includes('stream') || fieldName.toLowerCase().includes('configuration') || fieldName.toLowerCase().includes('ticketstates') || fieldName.toLowerCase().includes('icddefaultstatusconf') || fieldName.toLowerCase().includes('icddefaultstatusflowconf') || fieldName.toLowerCase().includes('snowdropletstatusconf') || fieldName.toLowerCase().includes('snowdropletstatusflowconf') || fieldName.toLowerCase().includes('snowcsmstatusconf') || fieldName.toLowerCase().includes('snowcsmstatusflowconf') || fieldName.toLowerCase().includes('snowdefaultstatusconf') || fieldName.toLowerCase().includes('snowdefaultstatusflowconf') || fieldName.toLowerCase().includes('majorincident') || fieldName.toLowerCase().includes('clientescalation') || fieldName.toLowerCase().includes('servicelinelist')|| fieldName.toLowerCase().includes('supportlocation')){
        specialChars = /[`#$^&+\=;|<>?~]/;
    }else if(fieldName.toLowerCase().includes('url')){
        specialChars = /[`#$^&*()+=\[\]{};'"|,<>?~]/;
    }else if(fieldName.toLowerCase().includes('username') || fieldName.toLowerCase().includes('additionalinfo') || fieldName.toLowerCase().includes('signingsecret') || fieldName.toLowerCase().includes('xoxb') || fieldName.toLowerCase().includes('xoxp')){
        specialChars = /[`^&*()+=\[\]{};'"|,<>?~]/;
    }else if(fieldName.toLowerCase().includes('date')){
        specialChars = /[`#$^&*_+\=\[\];'"\\|,.<>?~]/;
    }else if(fieldName.toLowerCase().includes('version') || fieldName.toLowerCase().includes('apikey') || fieldName.toLowerCase().includes('key')){
        specialChars = /[`#$^&*\[\];'"\\|,<>?~]/;
    }else if(fieldName.toLowerCase().includes('help') || url.toLowerCase().includes('command') || fieldName.toLowerCase().includes('publish')|| fieldName.toLowerCase().includes('resource')){
        specialChars = /[`#$^&*()+{};':\\|?~]/;
    }else if(fieldName.toLowerCase().includes('geo') || fieldName.toLowerCase().includes('market') || fieldName.toLowerCase().includes('country') || fieldName.toLowerCase().includes('sector') || fieldName.toLowerCase().includes('industry') || fieldName.toLowerCase().includes('gsepractice') || fieldName.toLowerCase().includes('serviceline') || fieldName.toLowerCase().includes('timezone')){
        specialChars = /[`#$^*+\={};:\\|<>\?~]/;
    }else if(fieldName.toLowerCase().includes('supporttype')){
        specialChars = /[`#$^*+\={};':\\|.<>\?~]/;
    }else if(fieldName.toLowerCase().includes('blueid')){
        specialChars = /[`#$^&*()+\={};':"\\|.<>\?~]/;
    }else if(fieldName.toLowerCase().includes('comment') || fieldName.toLowerCase().includes('description') || fieldName.toLowerCase().includes('otherinformation') || fieldName.toLowerCase().includes('justification') || fieldName.toLowerCase().includes('summary')){ 
        specialChars = /[`#$^&*\={};:\\|<>\?~]/; 
        // not allowing >> #$^&*\={};\\|<>\?~
    }else if(fieldName.toLowerCase().includes('password') || fieldName.toLowerCase().includes('clientsecret')){
        specialChars = /[]/; 
        // Chaitra!@#$%^&*()_ ,
    }else if(fieldName.toLowerCase().includes('skills') || fieldName.toLowerCase().includes('platform') ){
        specialChars = /[`#$^+\=;|<>?~]/;
    }else if(fieldName.toLowerCase().includes('userid') || fieldName.toLowerCase().includes('clientid')){
        specialChars = /[]/; 
    }else if(fieldName.toLowerCase().includes('ansibleinstancelogchannels')){
        specialChars = /[]/; 
    }else if(fieldName.toLowerCase().includes('channel')){
        specialChars = /[`#$^&*()+\={};'"\\|,<>\?~]/; 
    }else if(fieldName.toLowerCase().includes('todeleteid') ){
        specialChars = /[]/; 
    }
    const specialCharPresent = specialChars.test(val)
    if(specialCharPresent){
        console.log(fieldName)
        console.log(val)
        console.log(specialCharPresent);
    }
    return specialCharPresent;
}
function checkChar(data) {
    try{
        const newObj = flattenObject(data);
        const keys = Object.keys(newObj);
        console.log(keys)
        let status = [];
        var detectedList = [];
        for(let i=0; i < keys.length; i++){
            const detectedStatus = sqlInjectionChars(newObj[keys[i]], keys[i]);
            status.push(detectedStatus);
            if(detectedStatus){
                detectedList.push(keys[i])
            }
        }  
        return [status, detectedList]
    }catch(e){
        console.log(e);
    }
  }
function validate(data) {
    const [status, detectedList] = checkChar(data);
    return detectedList;
}
export { validate };