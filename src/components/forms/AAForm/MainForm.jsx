// MainForm.jsx
import React, { Component } from 'react';
import GeneralInfo from './GeneralInfo';
import ConfigForm from './configInfoForm';
import AdditionalInfoForm from './additionalInfoForm';
import OnboardAccount from '../../OnboardAccount.js';
import { trackPromise } from "react-promise-tracker";
import { withRouter } from 'react-router-dom';
import { validate } from '../../../validation/validate.js';


class MainForm extends Component {
    constructor(props){
        super(props);
        this.submitForm = this.submitForm.bind(this);
        this.isJSON = this.isJSON.bind(this);
      }
    //check all ID and check rules part >>> rules part input not added
    state = {
        AccData: [],
        step: 1,
        _id:'',
        accGeo: '', accMarket: '', accSector: '', isoCountryCode: '', countryName: '', countryCode:'', accIndustry: '', accCountry: '', blueID:'', CDIR:'',GBGID:'', dpeAdminName:'', dpeAdminEmail:'', itsmAdminName:'', itsmAdminEmail:'', networkAdminName:'', networkAdminEmail:'',
        collaborationTool: 'Slack', workspace:'', defaultLanguage:'', incidentChannelType:'public', eventSource: 'CDI',allowedPriorities:["1"], accountUtilizingNetcool:'', severityList:'', triggerChatOpsProcess: '', aiopsAccIdentifier:'', defaultassignments:'', assignmentServiceToAssignResource:'', 
        squadBasedAssignment:'no', aiopsSquadGeo: '', gnmAssignments: '', groupAssignment:'', usingTicketingTool:'', chatopsCommandAuth:'', authType:'', ticketingToolUsed: '', enableServiceManager: false, typeOfAuthentication:'', tickertingRestURL:'', urlPath: '',tableName: 'sn_customerservice_case',companyName: '', basicAuthUserID:'',basicAuthPassword:'',oauthClientID:'', 
        oauthClientSecret:'',relatedInsights:'',dropletEnabled:'',csmEnabled: '',dedicatedDropletInstance: '', enableCiDetails:'',enableDescDetails:'',enableStackDetails:'',internetFacing:'',enableOwner:'',otherInformation: '', generalFormSubmitted: false, configFormSubmitted: false, dedicatedDropletInstance: true, 
        SnowDropletStatusFlowConf: '', SnowCsmStatusFlowConf: '', IcdDefaultStatusFlowConf: '', SnowDefaultStatusFlowConf: '',
        enableWatsonAssistant:false,watsonURL:'',watsonApiKey:'',watsonVersion:'',
        collabConfig: {}, workspaceRegions: [], teamsBotDetails: {}
    }

    componentDidMount() {
        const loadData=fetch('/mui/onboardAccountFormData')
        .then(res => {
            return res.json()
        })
        .then(AccData => { 
            this.setState({ AccData })
            AccData = AccData.accountsData  
            this.props.updateParent('accName', AccData.accountName)
            this.props.updateParent('accCode', AccData.accountCode)
            if(AccData.submitted || AccData.saved) {
                var dedicatedDropletInstanceVal;
                if(AccData.dedicatedDropletInstance == undefined){
                    dedicatedDropletInstanceVal = true
                }else{
                    dedicatedDropletInstanceVal = AccData.dedicatedDropletInstance;
                }
                let workspaceName;
               
                if(AccData.collabConfig){
                    workspaceName = AccData.collabConfig[AccData.collaborationTool.toLowerCase()].workspaceName
                }else {
                    workspaceName = AccData.workspaceName;
                }
                this.setState({
                    accGeo: AccData.geo,
                    accMarket: AccData.market, 
                    accSector: AccData.sector,
                    accountCountry: AccData.accountCountryCode, 
                    accIndustry: AccData.industry,
                    blueID: AccData.accountBlueID, 
                    CDIR: AccData.cdir, 
                    GBGID: AccData.gbgid, 
                    dpeAdminName: AccData.ownername, 
                    dpeAdminEmail: AccData.owneremail, 
                    itsmAdminName:AccData.itsmadminname, 
                    itsmAdminEmail:AccData.itsmeadminemail, 
                    networkAdminName:AccData.networkadminName, 
                    networkAdminEmail: AccData.networkadminEmail,
                    collaborationTool: AccData.collaborationTool, 
                    // workspace:AccData.is_GTSWorkspaceInUse,
                    workspace:workspaceName,
                    defaultLanguage: AccData.defaultLanguage,
                    SnowDropletStatusFlowConf: AccData.SnowDropletStatusFlowConf,
                    SnowCsmStatusFlowConf: AccData.SnowCsmStatusFlowConf,
                    IcdDefaultStatusFlowConf: AccData.IcdDefaultStatusFlowConf,
                    SnowDefaultStatusFlowConf: AccData.SnowDefaultStatusFlowConf,
                    incidentChannelType: AccData.incidentChannelType,
                    eventSource: AccData.accountUtilizingCDI,
                    accountUtilizingNetcool: AccData.accountUtilizingNetcool,
                    triggerChatOpsProcess: AccData.triggerChatOpsProcess,
                    aiopsAccIdentifier: AccData.accountCDIC,
                    defaultassignments: AccData.accmemberemail,
                    assignmentServiceToAssignResource: AccData.assignmentServiceToAssignResource,
                    CDITicketToolID: AccData.CDITktToolId,
                    squadBasedAssignment: AccData.squadBasedAssignment,
                    aiopsSquadGeo: AccData.squadGeo,
                    gnmAssignments: AccData.GNMAssignment,
                    groupAssignment: AccData.groupAssignment,
                    usingTicketingTool: AccData.ticketingToolInUse,
                    chatopsCommandAuth: AccData.chatopsCommandAuth, 
                    authType: AccData.authType,
                    authGroup: AccData.authGroup,
                    ticketingToolUsed: AccData.ticketingToolUsed, 
                    enableServiceManager: AccData.enableServiceManager, 
                    typeOfAuthentication: AccData.typeOfAuthentication, 
                    tickertingRestURL: AccData.ticketingRestApiUrl, 
                    basicAuthUserID: AccData.basicAuthUserID,
                    basicAuthPassword: AccData.basicAuthPassword,
                    oauthClientID: AccData.oauthClientID, 
                    oauthClientSecret: AccData.oauthClientSecret,
                    relatedInsights: AccData.relatedInsights,
                    dropletEnabled: AccData.dropletEnabled,
                    csmEnabled: AccData.csmEnabled,
                    urlPath: AccData.urlPath,
                    dedicatedDropletInstance: dedicatedDropletInstanceVal,
                    tableName: AccData.tableName || this.state.tableName,
                    companyName: AccData.companyName,
                    enableCiDetails: AccData.enableCiDetails,
                    enableDescDetails: AccData.enableDescDetails,
                    enableStackDetails: AccData.enableStackDetails,
                    internetFacing: AccData.internetFacing,
                    enableOwner: AccData.enableOwner,
                    otherInformation: AccData.otherInformation,
                    isoCountryCode: AccData.isoCountryCode,
                    countryName: AccData.countryName,
                    countryCode:  AccData.accountCountryCode,
                    enableC3: AccData.enableC3,
                    impersonateUser: AccData.impersonateUser,
                    usingAnsibleIntegration: (AccData.ansibleInstance)?AccData.ansibleFeature:'no',
                    ansibleInstance:AccData.ansibleInstance,
                    SnowDropletStatusFlowConfEdit: AccData.SnowDropletStatusFlowConfEdit ,
                    SnowCsmStatusFlowConfEdit: AccData.SnowCsmStatusFlowConfEdit ,
                    IcdDefaultStatusFlowConfEdit: AccData.IcdDefaultStatusFlowConfEdit ,
                    SnowDefaultStatusFlowConfEdit: AccData.SnowDropletStatusFlowConfEdit ,
                    ansibleInstanceLogFlag: AccData.ansibleInstanceLog.logRequired,
                    ansibleInstanceLogTemplate: AccData.ansibleInstanceLog.template,
                    ansibleInstanceLogChannels: AccData.ansibleInstanceLog.channels,
                    ansibleInstanceTemplateList: AccData.ansibleInstanceTemplateList,
                    allowedPriorities: AccData.allowedPriorities,
                    enableWatsonAssistant:AccData.watsonAssistant?AccData.watsonAssistant.enableWatsonAssistant:false,
                    watsonURL:AccData.watsonAssistant?AccData.watsonAssistant.watsonURL:'',
                    watsonApiKey:AccData.watsonAssistant?AccData.watsonAssistant.watsonApiKey:'',
                    watsonVersion:AccData.watsonAssistant?AccData.watsonAssistant.watsonVersion:'',
                    collabConfig: AccData.collabConfig,
                    workspaceRegions: AccData.workspaceRegions,
                    teamsBotDetails: AccData.teamsBotDetails
                })
                if(AccData.submitted) {
                    this.setState({
                        generalFormSubmitted: true,
                        configFormSubmitted: true
                    })
                }
                //loads initial state of BG rules                 
                AccData.groupList && Object.keys(AccData.groupList).forEach((groupName,index)=>{
                        this.setState({
                            [`groupName${index}`]:groupName,
                        });
                        this.setState({
                            [`groupRules${index}`]:AccData.groupList[groupName]
                        })                                          
                })
                AccData.workspaceIndexChannel && Object.entries(AccData.workspaceIndexChannel).forEach(([indexChannel, rulesAndWorkspace],index)=>{
                    this.setState({
                        [`indexChannel${index}`]:indexChannel,
                        [`channelRules${index}`]: rulesAndWorkspace[0],
                        [`workspaceRules${index}`]: rulesAndWorkspace[1]
                    });         
                })

            }

        })
        //spinner
        trackPromise(loadData);
    }

    componentDidUpdate (pevProps, prevState) {
        
        if(prevState.collaborationTool !== this.state.collaborationTool){
            console.log(this.state.collabConfig);
            if(this.state.collabConfig && this.state.collabConfig[this.state.collaborationTool.toLowerCase()]){
                const toolCollabConfig = this.state.collabConfig[this.state.collaborationTool.toLowerCase()];
                if(toolCollabConfig && Object.keys(toolCollabConfig).length > 0){
                    const workspaceIndexChannel = toolCollabConfig.defaultindexchannels;
                    for(let i = 0; i< workspaceIndexChannel.length; i++){
                            this.setState({
                                [`indexChannel${i}`]:workspaceIndexChannel[i].channel,
                                [`channelRules${i}`]: workspaceIndexChannel[i].rule,
                                [`workspaceRules${i}`]: workspaceIndexChannel[i].workspaceName
                            });
                    }
                    this.setState({
                        workspace: toolCollabConfig.workspaceName,
                        defaultassignments: toolCollabConfig?.defaultassignmentsEmail 
                    })
                }else {
                    this.setState({
                        [`indexChannel${0}`]: "",
                        [`channelRules${0}`]: "",
                        [`workspaceRules${0}`]: ""
                    });
                    this.setState({
                        workspace: "",
                        defaultassignments: []
                    })
                }
                
            }else {
                //if no collab config found, clear rule , channel and workspace
                this.setState({
                    [`indexChannel${0}`]: "",
                    [`channelRules${0}`]: "",
                    [`workspaceRules${0}`]: ""
                });
                this.setState({
                    workspace: "",
                    defaultassignments: []
                })
            }
        }
        
    }
    isJSON(str, key) {
        try {
            var data;
            if(typeof str == "object"){
                data = JSON.stringify(str)
            }else{
                data = str;
            }
            JSON.parse(data);
        } catch (e) {
            return false;
        }
        return true;
    }
    submitForm = (e) => {
        var saved = e;
        var submitted = ''
        const { step } = this.state
        var stateValue = this.state.AccData;
        var rulesArr = [];
        var bgRulesArr = [];
        let watsonAssistant = {enableWatsonAssistant:false};
        const { accGeo, accMarket, accSector,isoCountryCode, countryName, countryCode, accIndustry, accCountry , blueID , CDIR ,GBGID, dpeAdminName , dpeAdminEmail , itsmAdminName , itsmAdminEmail , networkAdminName , networkAdminEmail, collaborationTool, workspace , defaultLanguage , incidentChannelType , eventSource ,allowedPriorities, accountUtilizingNetcool, severityList , tickertingRestURL, triggerChatOpsProcess, aiopsAccIdentifier , defaultassignments ,assignmentServiceToAssignResource, squadBasedAssignment ,  aiopsSquadGeo , gnmAssignments, groupAssignment , usingTicketingTool , chatopsCommandAuth , authType , ticketingToolUsed, enableServiceManager, typeOfAuthentication , basicAuthUserID, basicAuthPassword, oauthClientID , oauthClientSecret, internetFacing, relatedInsights, enableCiDetails, enableDescDetails, enableStackDetails, enableOwner, otherInformation, authGroup, CDITicketToolID, enableC3,  impersonateUser, ansibleInstance, usingAnsibleIntegration,dropletEnabled, csmEnabled, urlPath, tableName, dedicatedDropletInstance, companyName, SnowDropletStatusFlowConf, SnowCsmStatusFlowConf, IcdDefaultStatusFlowConf, SnowDefaultStatusFlowConf, SnowDropletStatusFlowConfEdit, SnowCsmStatusFlowConfEdit, IcdDefaultStatusFlowConfEdit, SnowDefaultStatusFlowConfEdit, enrollMaintenanceWindow, ansibleInstanceLogFlag, ansibleInstanceLogChannels, ansibleInstanceLogTemplate,enableWatsonAssistant,watsonURL,watsonApiKey,watsonVersion} = this.state;
        const values = { accGeo, accMarket, accSector, isoCountryCode, countryName, countryCode, accIndustry, accCountry , blueID , CDIR,GBGID, dpeAdminName , dpeAdminEmail , itsmAdminName , itsmAdminEmail , networkAdminName , networkAdminEmail, collaborationTool, workspace , defaultLanguage , incidentChannelType , eventSource ,allowedPriorities, accountUtilizingNetcool, severityList ,tickertingRestURL,  triggerChatOpsProcess, aiopsAccIdentifier , defaultassignments ,assignmentServiceToAssignResource, squadBasedAssignment ,  aiopsSquadGeo , gnmAssignments, groupAssignment , usingTicketingTool , chatopsCommandAuth , authType , ticketingToolUsed, enableServiceManager, typeOfAuthentication , basicAuthUserID, basicAuthPassword, oauthClientID , oauthClientSecret, internetFacing, relatedInsights, enableCiDetails, enableDescDetails, enableStackDetails, enableOwner, otherInformation, authGroup, CDITicketToolID, enableC3, impersonateUser, ansibleInstance, usingAnsibleIntegration,dropletEnabled, csmEnabled, urlPath, tableName, dedicatedDropletInstance, companyName, SnowDropletStatusFlowConf, SnowCsmStatusFlowConf, IcdDefaultStatusFlowConf, SnowDefaultStatusFlowConf, SnowDropletStatusFlowConfEdit, SnowCsmStatusFlowConfEdit, IcdDefaultStatusFlowConfEdit, SnowDefaultStatusFlowConfEdit, enrollMaintenanceWindow, ansibleInstanceLogFlag, ansibleInstanceLogChannels, ansibleInstanceLogTemplate,watsonAssistant};

        var ruleTitle = document.getElementsByClassName('ruleTitle');
        var bgRuleTitle = document.getElementsByClassName('bgRulesTitle');
        var ruleValue = ruleTitle.value
        var count = 0;
        var rulesObj = {};
        var bgRulesObj = {};        
        var indexChannelObj = {}
        var indexChannelWorkspaceObj = {}
        var groupObj = {}
        var indexChannelWorkspaceObj = {};
        let validJson = true;
        Object.entries(this.state).map(([key, value]) => {
            if(key.includes("indexChannel")){
                let index = key.replace("indexChannel","");
                indexChannelObj[value]= {
                    rule: this.state[`channelRules${index}`],
                    workspace:this.state[`workspaceRules${index}`],
                    channel:value
                }
            }
            if(key.includes("workspaceRules")){
                indexChannelWorkspaceObj[key] = value
            }
            if(key.includes("groupName")){
                let index = key.replace("groupName","");
                groupObj[value]= {
                    rule: this.state[`groupRules${index}`]
                }
            }
            
        });  
        
        
        
        values["_id"] = stateValue.accountsData._id;
        values["accCode"] = stateValue.accountsData.accountCode;
        values["accName"] = stateValue.accountsData.accountName;
        values["collabConfig"] = stateValue.accountsData.collabConfig;
        values["saved"] = saved;
        values["submitted"] = submitted;
        values["channelRules"] = rulesObj;
        values["groupRules"] = bgRulesObj;
        values["indexChannel"] = indexChannelObj;
        values["groupNameRules"] = groupObj;
        values["indexChannelWorkspace"] = indexChannelWorkspaceObj;
        
        if(enableWatsonAssistant){
            watsonAssistant = {
                enableWatsonAssistant:enableWatsonAssistant,
                watsonURL:watsonURL,
                watsonApiKey:watsonApiKey,
                watsonVersion:watsonVersion
            }
            values.watsonAssistant = watsonAssistant;
        }
        
        if(values.usingTicketingTool == "Yes" || values.usingTicketingTool == "yes"){
            if(values.ticketingToolUsed == "icd"){
                if(values.IcdDefaultStatusFlowConf != '' && values.IcdDefaultStatusFlowConf != undefined){
                    values["snowStatusEdit"] = false;
                    values["IcdDefaultStatusConf"] = values.IcdDefaultStatusFlowConf ;
                    var toCHeck = values.IcdDefaultStatusFlowConf
                }else{
                    values["statusEdit"] = true;
                    if(this.state.AccData.accountsData.IcdDefaultStatusFlowConf == undefined){
                        values["IcdDefaultStatusFlowConf"] = this.state.AccData.accountsData.IcdDefaultStatusFlowConfEdit;
                        var toCHeck = this.state.AccData.accountsData.IcdDefaultStatusFlowConfEdit;
                    }else if(this.state.AccData.accountsData.IcdDefaultStatusFlowConfEdit == undefined){
                        values["IcdDefaultStatusFlowConf"] = this.state.AccData.accountsData.IcdDefaultStatusFlowConf;
                        var toCHeck = this.state.AccData.accountsData.IcdDefaultStatusFlowConf;
                    }
                    
                }
                if(toCHeck != undefined || toCHeck != ""){
                    validJson = this.isJSON(toCHeck, "icd");
                }else{
                    validJson = false;
                }
            }
            if(values.ticketingToolUsed == "service_now" && values.dropletEnabled == true && (values.csmEnabled == false || values.csmEnabled == undefined)){
                if(values.SnowDropletStatusFlowConf != '' && values.SnowDropletStatusFlowConf != undefined){
                    values["statusEdit"] = false;
                    values["SnowDropletStatusConf"] = values.SnowDropletStatusFlowConf ;
                    var toCHeck = values.SnowDropletStatusFlowConf
                }else{
                    values["statusEdit"] = true;
                    if(this.state.AccData.accountsData.SnowDropletStatusFlowConf == undefined){
                        values["SnowDropletStatusFlowConf"] = this.state.AccData.accountsData.SnowDropletStatusFlowConfEdit;
                        var toCHeck = this.state.AccData.accountsData.SnowDropletStatusFlowConfEdit;
                    }else if(this.state.AccData.accountsData.SnowDropletStatusFlowConfEdit == undefined){
                        values["SnowDropletStatusFlowConf"] = this.state.AccData.accountsData.SnowDropletStatusFlowConf;
                        var toCHeck = this.state.AccData.accountsData.SnowDropletStatusFlowConf;
                    }
                }
                if(toCHeck != undefined || toCHeck != ""){
                    validJson = this.isJSON(toCHeck, "snowDroplet");
                }else{
                    validJson = false;
                }
            }
            if(values.ticketingToolUsed == "service_now" && (values.dropletEnabled == false || values.dropletEnabled == undefined) && values.csmEnabled == true){
                if(values.SnowCsmStatusFlowConf != '' && values.SnowCsmStatusFlowConf != undefined){
                    values["statusEdit"] = false;
                    values["SnowCsmStatusConf"] = values.SnowCsmStatusFlowConf ;
                    var toCHeck = values.SnowCsmStatusFlowConf
                }else{
                    values["statusEdit"] = true;
                    if(this.state.AccData.accountsData.SnowCsmStatusFlowConf == undefined){
                        values["SnowCsmStatusFlowConf"] = this.state.AccData.accountsData.SnowCsmStatusFlowConfEdit;
                        var toCHeck = this.state.AccData.accountsData.SnowCsmStatusFlowConfEdit;
                    }else if(this.state.AccData.accountsData.SnowCsmStatusFlowConfEdit == undefined){
                        values["SnowCsmStatusFlowConf"] = this.state.AccData.accountsData.SnowCsmStatusFlowConf;
                        var toCHeck = this.state.AccData.accountsData.SnowCsmStatusFlowConf;
                    }
                }
                if(toCHeck != undefined || toCHeck != ""){
                    validJson = this.isJSON(toCHeck, "snowCSM");
                }else{
                    validJson = false;
                }
            }
            if(values.ticketingToolUsed == "service_now" && (values.dropletEnabled == false || values.dropletEnabled == undefined) && (values.csmEnabled == false || values.csmEnabled == undefined)){
                // if(values.SnowDropletStatusFlowConf != '' && values.SnowDropletStatusFlowConf != undefined){
                if(values.SnowDefaultStatusFlowConf != '' && values.SnowDefaultStatusFlowConf != undefined){
                    values["statusEdit"] = false;
                    values["SnowDefaultStatusConf"] = values.SnowDefaultStatusFlowConf ;
                    var toCHeck = values.SnowDefaultStatusFlowConf
                }else{
                    values["statusEdit"] = true;
                    if(this.state.AccData.accountsData.SnowDefaultStatusFlowConf == undefined){
                        values["SnowDefaultStatusFlowConf"] = this.state.AccData.accountsData.SnowDefaultStatusFlowConfEdit;
                        var toCHeck = this.state.AccData.accountsData.SnowDefaultStatusFlowConfEdit;
                    }else if(this.state.AccData.accountsData.SnowDefaultStatusFlowConfEdit == undefined){
                        values["SnowDefaultStatusFlowConf"] = this.state.AccData.accountsData.SnowDefaultStatusFlowConf;
                        var toCHeck = this.state.AccData.accountsData.SnowDefaultStatusFlowConf;
                    }
                }
                if(toCHeck != undefined || toCHeck != ""){
                    validJson = this.isJSON(toCHeck, "snowDefault"); 
                }else{
                    validJson = false;
                }
            }
            if(values.enrollMaintenanceWindow === undefined){
                values.enrollMaintenanceWindow = false;
            }
        }else{
            validJson = true;
        }
        
        
        if(validJson === true){
            this.setState({
                isvalidJSon: false,
                invalidJsonErr: ""
            });
            // SpecialCharacter validation
            var validateFields = validate(values);
            if(validateFields.length > 0){
                var message = "";
                for(var i =0; i<validateFields.length; i++){
                    var element = document.querySelector(`input[name=${validateFields[i]}]`);
                    if(element){
                        message += element.title + ", ";
                    }else{
                        message += validateFields[i] + ', '
                    }
                }
                this.setState({'specialCharacterErr': `Special Character not allowed in field ${message}`});
            }
            else if(values.usingTicketingTool.toLowerCase() === "yes" && values.ticketingToolUsed === 'noTicketingTool'){
                this.setState({
                    isvalidJSon: false,
                    invalidJsonErr: ""
                });
                this.setState({
                    isInvalidData: true,
                    invalidData: 'Ticketing Tool Used should be selected'
                });
            }
            else if(values.assignmentServiceToAssignResource === 'icd' && values.ticketingToolUsed !== 'icd'){
                this.setState({
                    isvalidJSon: false,
                    invalidJsonErr: ""
                });
                this.setState({
                    isInvalidData: true,
                    invalidData: '[Configure Information] -> Source for assigning incident channel owner and [Additional Information] -> Ticketing tool used - should be same'
                });
                
            } else if(values.assignmentServiceToAssignResource === 'service_now' && values.ticketingToolUsed !== 'service_now'){
                this.setState({
                    isvalidJSon: false,
                    invalidJsonErr: ""
                });
                this.setState({
                    isInvalidData: true,
                    invalidData: '[Configure Information] -> Source for assigning incident channel owner and [Additional Information] -> Ticketing Tool used - should be same'
                });
            }
            else{
                this.setState({
                    isInvalidData: false,
                    invalidData: ''
                })
                trackPromise(
                    fetch('/mui/postOnboardAccountDetails' , {
                        method: "POST",
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify(values)
                    })
                    .then((result) => {result.json()
                        if(result.status == 200){
                        this.props.history.push("/mui/onboardAccount");
                        }
                    })
                ) 
            }
        }else{
            this.setState({
                isvalidJSon: true,
                invalidJsonErr: "Invalid JSON. Please enter proper JSON"
            })
        }
    }
    registerState = (stateName,data) => {  
        this.setState({
            [stateName]: data,
        });        
    }

    setServiceManager = event => {
        this.setState({enableServiceManager: !this.state.enableServiceManager})
    }

    handleCheckbox = form => input => event => {
    // handleCheckbox(name, event) {
        this.setState({
            [event.target.name]: event.target.checked,
          });
    };
    handleCheckbox3 = form => input => event => {
    // handleCheckbox3(name, event) {
        this.setState({
            [event.target.name]: event.target.checked,
          });
    };
    // handleCheckboxPriority(event) {
        handleCheckboxPriority = form => input => event => {
        if(event.target.checked == true) {
            this.setState({
                allowedPriorities: [...this.state.allowedPriorities, event.target.getAttribute("data-value")]
            })
        }else{
            var index = this.state.allowedPriorities.indexOf(event.target.getAttribute("data-value"));
            if (index > -1) {
                this.state.allowedPriorities.splice(index, 1);
                this.setState({
                    allowedPriorities: this.state.allowedPriorities
                })
            } 
        }
    };
    handleCheckboxGsma = (form) => (input) => (event) => {
        this.setState({
          enrollMaintenanceWindow: event.target.checked,
        });
    };

    setdefaultFunctionalId = (defaultassignments) => {
        let emailStr = defaultassignments
        const workspaceList = this.state.AccData.accountsData.workspaceList;
        const selectedWorkspaceData = workspaceList.filter(workspaceData => {
            if(workspaceData.name === this.state.workspace){
                return true;
            }else {
                return false;
            }
           })
        const selectedRegion = selectedWorkspaceData[0].region;
        const functionalEmailId = this.state.AccData.accountsData.teamsBotDetails[selectedRegion].functionalEmailId
        if(!emailStr.includes(functionalEmailId)){
            if(!emailStr || emailStr === ''){
                emailStr = functionalEmailId;
            }else {
                emailStr = `${emailStr},${functionalEmailId}`
            }
        }
        this.setState({
            "defaultassignments": emailStr,
        });
    }
    handleChange = form => input => event => {
        if(form && this.state[[form]]) this.setState({[form]: false})
        this.setState({
            [event.target.name]: event.target.value,
        });
        if(event.target.name.startsWith("channelRules")){
        }
        if(event.target.name === "defaultassignments"){
            let emailStr =  event.target.value;
            if(this.state.collaborationTool.toLowerCase() === 'teams'){
               
               const workspaceList = this.state.AccData.accountsData.workspaceList;
               const selectedWorkspaceData = workspaceList.filter(workspaceData => {
                if(workspaceData.name === this.state.workspace){
                    return true;
                }else {
                    return false;
                }
               })
               const selectedRegion = selectedWorkspaceData.region;
               const functionalEmailId = this.state.AccData.accountsData.teamsBotDetails[selectedRegion].functionalEmailId
               if(emailStr === ''){
                emailStr = functionalEmailId;
               }else {
                emailStr = `${emailStr},${functionalEmailId}`
               }
            }
            this.setState({
                [event.target.name]: emailStr,
            });
        }
        if(event.target.name == "accGeo"){
            var geoSelected = event.target.value;
            if( geoSelected == "APAC"){
                this.setState({
                    geo: "APAC",
                });
            }else if(geoSelected == "Americas"){
                this.setState({
                    geo: "Americas",
                });
            }else if(geoSelected == "EMEA"){
                this.setState({
                    geo: "EMEA",
                });
            }else if(geoSelected == "Japan"){
                this.setState({
                    geo: "Japan",
                });
            }else if(geoSelected == "Choose an Option"){
                this.setState({
                    geo: "Choose an Option",
                });
            }
        }
        if(event.target.name == "eventSource" && event.target.value != "CDI") {
            this.setState({
                squadBasedAssignment: "no",
                aiopsSquadGeo: ""
            })
        }
        if(event.target.name == "eventSource" && event.target.value == "netcool") {
            this.setState({
                usingTicketingTool: 'yes',
                chatopsCommandAuth: 'chatopsAuth',
            })
        }
        if(event.target.name == "eventSource" && event.target.value == "CDI") {
            this.setState({
                usingTicketingTool: '',
                chatopsCommandAuth: '',
            })
        }
        if(event.target.name == "usingTicketingTool" && event.target.value == "yes") {
            this.setState({
                chatopsCommandAuth: 'chatopsAuth'
            })
        }
        if(event.target.name == "ticketingToolUsed" && event.target.value == "icd") {
            this.setState({
                typeOfAuthentication: 'basic'
            })
        }
        if(event.target.name == "ansibleIntegratedWithChatops") {
            if(event.target.value === "no"){
                this.setState({ ansibleInstance: '',ansibleInstanceLogFlag: 'no',ansibleInstanceLogChannels: '',ansibleInstanceLogTemplate: 'no'});
            };
            this.setState({
                usingAnsibleIntegration: event.target.value
            })
        }
        if(event.target.name == "ansibleInstanceLogFlag") {
            this.setState({
                ansibleInstanceLogFlag: event.target.value
            });
        }
        if(event.target.name == "ansibleInstanceLogTemplate") {
            this.setState({
                ansibleInstanceLogTemplate: event.target.value
            });
        }

        var eventSource = {}
        var accListState = this.state
        if(accListState.AccData){
            var accList = accListState.AccData;
            if(accList.accountsData){
                var accountDetail = accList.accountsData;
                var countryList = accountDetail.countryList;
                Object.entries(countryList).map(([key, value]) => {
                    if(event.target.value == value.desc){
                        this.setState({
                            isoCountryCode: value.isocode,
                            countryName: event.target.value,
                            countryCode:  value.countrycode
                        })
                    }
                }); 
            }
        }
        
    }

    handleSubmit = (form) => { // [general, config]
        if(form == "general") this.setState({generalFormSubmitted: true})
        else if (form == "config") this.setState({configFormSubmitted: true})
    }

    render(){
        const {step} = this.props;
        const { accGeo, accMarket, accSector, isoCountryCode, countryName,countryCode, accIndustry, accCountry , blueID , CDIR,GBGID , dpeAdminName , dpeAdminEmail , itsmAdminName , itsmAdminEmail , networkAdminName , networkAdminEmail, collaborationTool, workspace , defaultLanguage , incidentChannelType , eventSource ,allowedPriorities, accountUtilizingNetcool, severityList , triggerChatOpsProcess, aiopsAccIdentifier , defaultassignments ,assignmentServiceToAssignResource, squadBasedAssignment , aiopsSquadGeo , gnmAssignments, groupAssignment , usingTicketingTool , chatopsCommandAuth , authType ,tickertingRestURL, ticketingToolUsed, enableServiceManager, typeOfAuthentication , basicAuthUserID, basicAuthPassword, oauthClientID , oauthClientSecret, internetFacing, relatedInsights, enableCiDetails, enableDescDetails, enableStackDetails, enableOwner, otherInformation, CDITicketToolID, dropletEnabled, csmEnabled, urlPath, tableName, dedicatedDropletInstance, companyName, SnowDropletStatusFlowConf, SnowCsmStatusFlowConf, IcdDefaultStatusFlowConf, SnowDefaultStatusFlowConf, enrollMaintenanceWindow } = this.state;
        const values = { accGeo, accMarket, accSector, isoCountryCode, countryName,countryCode, accIndustry, accCountry , blueID , CDIR,GBGID , dpeAdminName , dpeAdminEmail , itsmAdminName , itsmAdminEmail , networkAdminName , networkAdminEmail, collaborationTool, workspace , defaultLanguage , incidentChannelType , eventSource , allowedPriorities,accountUtilizingNetcool, severityList, triggerChatOpsProcess, aiopsAccIdentifier , defaultassignments ,assignmentServiceToAssignResource, squadBasedAssignment , aiopsSquadGeo , gnmAssignments, groupAssignment , usingTicketingTool , chatopsCommandAuth ,tickertingRestURL, authType , ticketingToolUsed, enableServiceManager, typeOfAuthentication , basicAuthUserID, basicAuthPassword, oauthClientID , oauthClientSecret, internetFacing, relatedInsights, enableCiDetails, enableDescDetails, enableStackDetails, enableOwner, otherInformation, CDITicketToolID, dropletEnabled, csmEnabled, urlPath, tableName, dedicatedDropletInstance, companyName, SnowDropletStatusFlowConf, SnowCsmStatusFlowConf, IcdDefaultStatusFlowConf, SnowDefaultStatusFlowConf, enrollMaintenanceWindow };
        switch(step) {
        case 1:
            return <GeneralInfo
                    nextStep={this.props.nextStep}
                    handleChange = {this.handleChange('generalFormSubmitted')}
                    values={this.state}
                    onSubmit={this.handleSubmit}
                    submitForm={this.submitForm}
                    {...this.state}
                    />
        case 2:
            return <ConfigForm
                    nextStep={this.props.nextStep}
                    prevStep={this.props.prevStep}
                    submitForm={this.submitForm}
                    onSubmit={this.handleSubmit}
                    handleChange = {this.handleChange('configFormSubmitted')}
                    handleCheckboxPriority = {this.handleCheckboxPriority('handleCheckboxPriority')}
                    handleCheckboxGsma = {this.handleCheckboxGsma('gsma')}
                    values={this.state}
                    registerState={this.registerState}
                    setdefaultFunctionalId={this.setdefaultFunctionalId}
                    {...this.state}
                    />
        case 3:
            return <AdditionalInfoForm
                    nextStep={this.props.nextStep}
                    prevStep={this.props.prevStep}
                    handleChange = {this.handleChange()}
                    submitForm={this.submitForm}
                    values={this.state}
                    registerState={this.registerState}
                    setServiceManager = {this.setServiceManager}
                    {...this.state}
                    />
        case 4:
            return  <OnboardAccount />
        default: return null;

        }
    }
}

export default withRouter(MainForm);