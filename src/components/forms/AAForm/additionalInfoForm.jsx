// AdditionalInfoForm.jsx
import{
Column,
Grid,
Row,
Select,
SelectItem,
TextArea,
TextInput,
Button,
Form,
FormLabel,
FormGroup,
Checkbox,

} from "carbon-components-react";
import React, { Component } from "react";
import "../form.scss";
import { trackPromise } from "react-promise-tracker";
import {CheckmarkFilled32, CloseFilled32} from "@carbon/icons-react";
import { Tooltip } from "carbon-components-react/lib/components/Tooltip/Tooltip";
// import ButtonsForm from '../../Buttons';
import { Close32 } from "@carbon/icons-react";

const styles = {
    labelAsterisk: {
        color: "red"
    }
};

class AdditionalInfoForm extends Component{
    constructor(){
        super();
        this.state ={            
            encryptedData:[],
            ansibleFeature:'',
            ansibleInstanceItems:'',
            cacfAnsibleInstanceItems:'',
            autoStatus: false
        };
        this.loadData = this.loadData.bind(this);
    }

    saveAndContinue = (e) => {
        e.preventDefault();
        this.props.nextStep();
    }

    componentDidMount() {
     
    }

    submitAndContinue = (e) => {
        e.preventDefault();
        var saved = false;
        var submitted = false;
        if(this.props.ticketingToolUsed == "icd"){
            var IcdDefaultStatusConf =this.props.IcdDefaultStatusFlowConf ;
        }
        if(this.props.ticketingToolUsed == "service_now" && this.props.dropletEnabled == true && this.props.csmEnabled == false){
            var SnowDropletStatusConf = this.props.SnowDropletStatusFlowConf ;
        }
        if(this.props.ticketingToolUsed == "service_now" && this.props.dropletEnabled == false && this.props.csmEnabled == true){
            var SnowCsmStatusConf = this.props.SnowCsmStatusFlowConf;
        }
        if(this.props.ticketingToolUsed == "service_now" && this.props.dropletEnabled == false && this.props.csmEnabled == false){
            var SnowDefaultStatusConf = this.props.SnowDefaultStatusFlowConf ;
        }
        if(e.target.className.includes("saveData")){
            saved = true;
            submitted = false;
            this.props.submitForm(saved);
        }else{
            saved = false;
            submitted = true;
            const ticketingToolData = {
                usingTicketingTool: this.props.usingTicketingTool,
                toolType: this.props.ticketingToolUsed,
                toolURL: this.props.tickertingRestURL,
                authType: this.props.typeOfAuthentication,
                userId: this.props.basicAuthUserID,
                userPassword: this.props.basicAuthPassword,
                oauthClientID: this.props.oauthClientID,
                oauthClientSecret: this.props.oauthClientSecret,
                dropletEnabled: this.props.dropletEnabled,
                csmEnabled: this.props.csmEnabled,
                urlPath: this.props.urlPath,
                dedicatedDropletInstance: this.props.dedicatedDropletInstance,
                tableName: this.props.tableName,
                companyName: this.props.companyName,
                relatedInsights: this.props.relatedInsights,
                enableCiDetails: this.props.enableCiDetails,
                enableDescDetails: this.props.enableDescDetails,
                //enableOwner: this.props.enableOwner,
                enableServiceManager: this.props.enableServiceManager,
                IcdDefaultStatusConf: IcdDefaultStatusConf,
                SnowDropletStatusConf: SnowDropletStatusConf,
                SnowCsmStatusConf: SnowCsmStatusConf,
                SnowDefaultStatusConf: SnowDefaultStatusConf,
            };
        
            if(this.props.usingTicketingTool == 'yes'){
                trackPromise(
                    fetch("/mui/testToolConnection", {
                        method: "POST",
                        headers: {
                        "Content-type": "application/json",
                        },
                        body: JSON.stringify(ticketingToolData),
                    }).then(async (result) => {
                        if (result.status == 200) {
                        this.setState({
                            showSuccess: true,
                            showFailure: false,
                        });
                        this.props.submitForm(saved);
                        } else {
                        this.setState({
                            showFailure: true,
                            showSuccess: false,
                        });
                        this.setState({
                            showFailPopup: true,
                        });
                        }
                    })
                );
            } else {
                this.props.submitForm(saved);
            }
        }
      // this.props.submitForm();
    }

    submitPopup = (e) => {
        e.preventDefault();
        var saved = false;
        var submitted = true;
        this.setState({
            showFailPopup: false,
        });
        this.props.submitForm(saved);
    };

    cancelPopup = (e) => {
        e.preventDefault();
        this.setState({
            showFailPopup: false,
        });
    };

    handleInsightCheckbox(name, event) {
        this.props.relatedInsights = event.target.checked;
        this.props.registerState("relatedInsights", this.props.relatedInsights);
    };
    handleDropletEnabled(name, event) {
        this.props.dropletEnabled = event.target.checked;
        var accData = this.props?.AccData?.accountsData;
        if(accData){
            if(this.props.dropletEnabled == false){
                this.props.dedicatedDropletInstance = true;
            }
        }
        this.props.registerState("dropletEnabled", this.props.dropletEnabled);
    };
    handlecsmEnabled(name, event) {
        this.props.csmEnabled = event.target.checked;
        this.props.registerState("csmEnabled", this.props.csmEnabled);
    };
    handleDedicatedDropletInstance(name, event) {
        this.props.dedicatedDropletInstance = event.target.checked;
        this.props.registerState("dedicatedDropletInstance", this.props.dedicatedDropletInstance);
    };

    handleCiCheckbox(name, event) {
        this.props.enableCiDetails = event.target.checked;
        this.props.registerState("enableCiDetails", this.props.enableCiDetails);
    };

    handleDescCheckbox(name, event) {
        this.props.enableDescDetails = event.target.checked;
        this.props.registerState("enableDescDetails", this.props.enableDescDetails);
    };

    handleStackCheckbox(name, event) {
        this.props.enableStackDetails = event.target.checked;
        this.props.registerState("enableStackDetails", this.props.enableStackDetails);
    };
    handleWatsonCheckbox(name, event) {
        this.props.enableWatsonAssistant = event.target.checked;
        this.props.registerState("enableWatsonAssistant", this.props.enableWatsonAssistant);
    };

    checkConnection = (e) => {
        e.preventDefault();
        const ticketingToolData = {
            toolType: this.props.ticketingToolUsed,
            toolURL: this.props.tickertingRestURL,
            authType: this.props.typeOfAuthentication,
            userId: this.props.basicAuthUserID,
            userPassword: this.props.basicAuthPassword,
            oauthClientID: this.props.oauthClientID,
            oauthClientSecret: this.props.oauthClientSecret,
            tableName: this.props.tableName,
            dropletEnabled: this.props.dropletEnabled,
            csmEnabled: this.props.csmEnabled
        };
  
        trackPromise(
            fetch("/mui/testToolConnection", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify(ticketingToolData),
            }).then(async (result) => {
                if (result.status == 200) {
                    e.preventDefault();
                    this.setState({
                    showSuccess: true,
                    showFailure: false,
                    });
                } else {
                    this.setState({
                    showFailure: true,
                    showSuccess: false,
                    });
                }
            })
        );
    };

    back  = (e) => {
        e.preventDefault();
        this.props.prevStep();
    }

    loadData = () => {
        trackPromise(
            fetch("/mui/onboardAccountFormData")
            .then((res) => {
                return res.json();
            })
            .then((AccData) => {
                this.props.registerState("AccData", AccData);
                this.handleInstanceChange(this.state.ansibleFeature)
            })
        );
    };

    formatAnsibleInstanceData = (ansibleInstances) => {
      
        let accountCode = (this.props.AccData.accountsData)?this.props.AccData.accountsData.accountCode:false;
        let accountAnsibleInstances = ansibleInstances.filter(
            (a) => a.accountCode == accountCode);
        let cacfAnsibleInstances = ansibleInstances.filter(
            (a) => a.threeScale == true);
        let ansibleInstanceItems =  this.formatOptions(accountAnsibleInstances);
        let cacfAnsibleInstanceItems = this.formatOptions(cacfAnsibleInstances);
        let selectedAnsible = (accountAnsibleInstances.length > 0)?accountAnsibleInstances[0]['name']:'';
        let selectedCacf = (cacfAnsibleInstances.length > 0)?cacfAnsibleInstances[0]['name']:'';
        return {ansibleInstanceItems, cacfAnsibleInstanceItems, selectedAnsible, selectedCacf};
    };

    formatOptions(ansibleInstances){

        let formatAnsibleInstanceData = [];
        for(const ansibleInstance of ansibleInstances){
            let formOption = (
                <option className="bx--select-option" defaultValue={ansibleInstance.url}>
                    {ansibleInstance.name}
                </option>
            );
            formatAnsibleInstanceData.push(formOption);
        }
        return formatAnsibleInstanceData;
    }

    formatTemplateOptions(templateLists){

        let formatData = [];
        for(const templateList of templateLists){
            let formOption = (
                <option className="bx--select-option" defaultValue={templateList.name}>
                    {templateList.name}
                </option>
            );
            formatData.push(formOption);
        }
        return formatData;
    }

    handleInstanceChange = (value) => {
        this.setState({ansibleFeature:value});
        this.setState({cacfAnsibleInstanceItems:[]});
        this.setState({ansibleInstanceItems:[]});
        let accData = this.props.AccData;
        let ansibleInstance =  accData.accountsData.ansibleInstanceList;
        let {ansibleInstanceItems,cacfAnsibleInstanceItems,selectedCacf,selectedAnsible} = this.formatAnsibleInstanceData(ansibleInstance);
        setTimeout(() => {
            this.setState({cacfAnsibleInstanceItems:cacfAnsibleInstanceItems});
            this.setState({ansibleInstanceItems:ansibleInstanceItems});
            this.props.ansibleInstance = (this.state.ansibleFeature == 'cacf') ? selectedCacf : selectedAnsible;
        },10);
    };

    handleAnsibleInputChange = (e) => {
        this.setState({ansibleInvalidMsg:''});
        this.setState({[e.target.name]: e.target.value});
    }

    handleAnsibleCheckChange = (checked,name) => {
        this.setState({[name]: checked});
    }

    isValidURL = (urlString) => {
        let url;
        try {
            url = new URL(urlString);
        } catch (_) {
            return false;  
        }
        return url.protocol === "http:" || url.protocol === "https:";
    };

    checkDuplicateAnsibleName = () => {

        var accData = this.props.AccData;
        let ansibleInstances =  accData.accountsData.ansibleInstanceList;
        let ansibleInstanceObject = ansibleInstances.find(a => a.name.toLowerCase() == this.state.ansibleInstanceName.toLowerCase()); 
        if(ansibleInstanceObject){
            return false;
        }
        return true;
    };

	testConnectionAnsibleInstance = async() => {
	
        const url = this.state.ansibleInstanceUrl;
        const key = this.state.ansibleInstanceKey;
        var response = fetch(`/mui/ansibleInstance/testconnection?url=${url}&key=${key}`)
        .then((res) => {
            return res.json();
        })
        .then((result) => {
            return result;
        })
        trackPromise(response);
        let results = await response;
        return results;
    };

    showModal = (e) => {
        this.setState({
            showPopup: true,
        });
    };

    cancelModal = (e) => {
        e.preventDefault();
        this.setState({
            showPopup: false,
        });
    };

    saveAnsibleInstance = async(e) => {

        e.preventDefault();

        this.setState({ansibleInvalidMsg:''});

        if(!this.checkDuplicateAnsibleName()){
            this.setState({ansibleInvalidMsg:'Ansible instance name already exists!!'});
            return;
        }

        if(!this.isValidURL(this.state.ansibleInstanceUrl)){
            this.setState({ansibleInvalidMsg:'Invalid Url!!'});
            return;
        }

        let testConnection = await this.testConnectionAnsibleInstance()
        if(!testConnection || !testConnection.success){
            this.setState({ansibleInvalidMsg:'Test connection to ansible instance failed!!'});
            return;
        }
        if(this.state.isThreeScale && !this.state.ansibleInstanceKey){
            this.setState({ansibleInvalidMsg:'Invalid User Key!!'});
            return;
        }
        let accountCode = (this.props.AccData.accountsData)?this.props.AccData.accountsData.accountCode:false;
        if(!accountCode){
            this.setState({ansibleInvalidMsg:'Account Code Missing!!'});
            return;
        }
        const ansibleInstanceData = {
            name: this.state.ansibleInstanceName,
            url:this.state.ansibleInstanceUrl,
                userKey:this.state.ansibleInstanceKey,
            threeScale: this.state.isThreeScale,
            accountCode: accountCode
        };
        if(this.state.autoStatus){
            ansibleInstanceData['autoStatus'] = 'cron';
        }

        trackPromise(
            fetch("/mui/ansibleInstance", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({ansibleInstanceData}),
            }).then(async (result) => {
                const parsedMsz = await result.json();
                if (result.status == 200 && parsedMsz.success) {
                    e.preventDefault();
                    this.setState({
                    showPopup: false,
                    ansibleInvalidMsg: undefined,
                    ansibleInstanceName:'',
                    ansibleInstanceUrl:'',
                    threeScale:false,
                    autoStatus:false,
                    userKey:'',
                    });
                    this.loadData();
                } else {
                    this.setState({
                    showPopup: true,
                    ansibleInvalidMsg: 'Failed adding ansible instance',
                    });
                }
            })
        );
    };


    ansibleModalHtml = () => {
        return (
            <div className="popup">
                <div className="bx--modal-container modal-css-ansible">
                    <div className="bx--modal-header">
                        <p
                        className="bx--modal-header__label bx--type-delta"
                        id="modal-ansible-label"
                        ></p>
                        <p
                        className="bx--modal-header__heading bx--type-beta"
                        id="modal-ansible-heading"
                        >
                        Add Ansible Instance
                        </p>
                        
                        <button
                        className="bx--modal-close"
                        type="button"
                        data-modal-close
                        aria-label="close modal"
                        >
                        <Close32
                            className="iconEditSize"
                            onClick={this.cancelModal}
                        />
                        </button>
                    </div>
                    <div className="bx--modal-content">
                        {this.state.ansibleInvalidMsg && (
                        <h4>
                            <b className="fontRed">
                            {this.state.ansibleInvalidMsg}
                            </b>
                        </h4>
                        )}
                        <Form>
                        <TextInput
                        className="bx--text-input bx--text__input"
                        id="ansibleInstanceName"
                        name="ansibleInstanceName"
                        labelText={
                            <>
                            Name <b className="fontRed">*</b>
                            </>
                        }
                        placeholder="name"
                        onBlur={this.handleAnsibleInputChange}
                        />
                        <br />
                        <TextInput
                        className="bx--text-input bx--text__input"
                        id="ansibleInstanceUrl"
                        name="ansibleInstanceUrl"
                        labelText={
                            <>
                            URL <b className="fontRed">*</b>
                            </>
                        }
                        placeholder="url"
                        onBlur={this.handleAnsibleInputChange}
                        />
    
                        <div class="addAccBtn">
                        <Checkbox
                            id="autoStatus"
                            labelText="Auto Job Status"
                            onChange={(isChecked) =>
                                this.handleAnsibleCheckChange(isChecked, "autoStatus")
                            }
                            checked={this.state.autoStatus}
                        />
                        </div>

                        </Form>
                    </div>
                    <div className="bx--modal-content--overflow-indicator"></div>

                    <div className="bx--modal-footer">
                        <Button
                        kind="secondary"
                        className="addWorkspace"
                        onClick={this.cancelModal}
                        >
                        Cancel
                        </Button>
                        <Button
                        kind="primary"
                        type="submit"
                        className="addWorkspace"
                        disabled={(!this.state.ansibleInstanceUrl || !this.state.ansibleInstanceName )}
                        onClick={this.saveAnsibleInstance}
                        >
                        Add Ansible Instance
                        </Button>
                    </div>
                </div>
                <span tabindex="0"></span>
            </div>
        )
    }

    enableAnsibleHtml = () => {

        var accData = this.props.AccData;
        let ansibleInstance =  accData.accountsData.ansibleInstanceList;
        let {ansibleInstanceItems,cacfAnsibleInstanceItems} = this.formatAnsibleInstanceData(ansibleInstance);
        let ansibleInstanceOptions = this.state.ansibleInstanceItems || ansibleInstanceItems;
      
        return (
            <Row>
                <Column>
                    <br />
                    <Select
                    className="labelFont"
                    id="ansibleInstance"
                    labelText={
                    <span>
                        Select Ansible instance <b className="fontRed">*</b>
                        <Tooltip>
                        Add Ansible Tower Instance <br />
                        User either can select existing ansible instance or add new
                        Ansible instance by giving appropriate details
                        </Tooltip>
                        <a
                        className="addWorkspaceLink"
                        onClick={(e) => { this.showModal(); }}
                        >
                        Add Ansible Instance
                        </a>
                    </span>
                    }
                    name="ansibleInstance"
                    onChange={this.props.handleChange("ansibleInstance")}
                    defaultValue={this.props.ansibleInstance}
                    required
                >
                    <SelectItem hidden value="" text="Choose an option" />
                    {ansibleInstanceOptions} 
                </Select>
                </Column>
                <Column></Column>
            </Row>
        )
    }

    enableCacfHtml = () => {

        var accData = this.props.AccData;
        let ansibleInstance =  accData.accountsData.ansibleInstanceList;
        let {ansibleInstanceItems,cacfAnsibleInstanceItems} = this.formatAnsibleInstanceData(ansibleInstance);
        let cacfInstanceOptions = this.state.cacfAnsibleInstanceItems || cacfAnsibleInstanceItems;

        return (
            <Row>
                <Column>
                    <br />
                    <Select
                        className="labelFont"
                        id="ansibleInstance"
                        labelText={
                        <span>
                            Select CACF instance <b className="fontRed">*</b>
                        </span>
                        }
                        name="ansibleInstance"
                        onChange={this.props.handleChange("ansibleInstance")}
                        defaultValue={this.props.ansibleInstance}
                        required
                    >
                        <SelectItem hidden value="" text="Choose an option" />
                        {cacfInstanceOptions} 
                    </Select>
                
                </Column>
                <Column></Column>
            </Row>
        )
    }

    jobLogHtml = () => {

        const { values } = this.props;
        var accData = this.props.AccData;
        let templateList =  accData.accountsData.ansibleInstanceTemplateList;
        let templateOptions = this.formatTemplateOptions(templateList);
      
        return (
            <Row>
                <Column>
                    <Select
                        className="labelFont"
                        id="ansibleInstanceLogFlag"
                        labelText={
                        <span>
                            Job Log with Notification
                        </span>
                        }
                        name="ansibleInstanceLogFlag"
                        onChange={this.props.handleChange("ansibleInstanceLogFlag")}
                        required
                    >
                        <SelectItem value="no" text="No" selected={values.ansibleInstanceLogFlag != "yes"} /> 
                        <SelectItem value="yes" text="Yes" selected={values.ansibleInstanceLogFlag == "yes"} />
                    </Select>
                </Column>
                <Column>
                   <Select
                        className="labelFont"
                        id="ansibleInstanceLogTemplate"
                        labelText={
                        <span>
                            Notification Template 
                        </span>
                        }
                        name="ansibleInstanceLogTemplate"
                        onChange={this.props.handleChange("ansibleInstanceLogTemplate")}
                        defaultValue={this.props.ansibleInstanceLogTemplate}
                        required
                    >
                        <SelectItem value="no" text="No" selected={values.ansibleInstanceLogTemplate != "yes"} /> 
                         {templateOptions} 
                    </Select>
                </Column>
                <Column>
                <TextInput
                    className="labelFont"
                    id="ansibleInstanceLogChannels"
                    placeholder="Channels"
                    labelText={<>Notification Channels</>}
                    name="ansibleInstanceLogChannels"
                    onChange={this.props.handleChange('ansibleInstanceLogChannels')}
                    defaultValue={this.props.ansibleInstanceLogChannels}
                />
                </Column>
                
            </Row>
        )
    }

    render(){
        const { values } = this.props;
        var disableCMS = false;
        var disabledroplet = false;
        if(values.dropletEnabled == true){
            disableCMS = true;
        }else{
            disableCMS = false;
        }
        if(values.csmEnabled == true){
            disabledroplet = true;
        }else{
            disabledroplet = false;
        }
        var stateData = this.state;
        var accData = this.props.AccData;
        if(accData.length !==0){
            var accountsData = accData.accountsData;
            var submitted = accountsData.submitted;
            var savedBtn = '';
            var saved = accountsData.saved;
            var snowDefault = false;
            var snowDroplet = false;
            var snowCsm = false;
            var icdDefault = false;
            var snowDefaultInput = '';
            var IcdDefaultStatusFlowConf = '';
            var SnowDropletStatusFlowConf = '';
            var SnowCsmStatusFlowConf = '';
            var SnowDefaultStatusFlowConf = '';

            if(values.usingTicketingTool == "yes" && (values.IcdDefaultStatusFlowConf != undefined || values.SnowCsmStatusFlowConf != undefined || values.SnowDefaultStatusFlowConf != undefined || values.SnowDropletStatusFlowConf != undefined)){
                if(values.ticketingToolUsed == "icd"){
                    if(typeof accountsData.SnowDropletStatusFlowConf == 'object'){
                        IcdDefaultStatusFlowConf = JSON.stringify(accountsData.IcdDefaultStatusFlowConf).replaceAll(",", ", \n");
                    }else{
                        IcdDefaultStatusFlowConf = values.IcdDefaultStatusFlowConf
                    }
                }
                if(values.ticketingToolUsed == "service_now" && values.dropletEnabled == true && (values.csmEnabled == false || values.csmEnabled == undefined)){
                    if(typeof accountsData.SnowDropletStatusFlowConf == 'object'){
                        SnowDropletStatusFlowConf = JSON.stringify(accountsData.SnowDropletStatusFlowConf).replaceAll(",", ", \n");
                    }else{
                        SnowDropletStatusFlowConf = values.SnowDropletStatusFlowConf
                    }
                }
                if(values.ticketingToolUsed == "service_now" && (values.dropletEnabled == false || values.dropletEnabled == undefined) && values.csmEnabled == true){
                    if(typeof accountsData.SnowCsmStatusFlowConf == 'object'){
                        SnowCsmStatusFlowConf = JSON.stringify(accountsData.SnowCsmStatusFlowConf).replaceAll(",", ", \n");
                    }else{
                        SnowCsmStatusFlowConf = values.SnowCsmStatusFlowConf
                    }
                }
                if(values.ticketingToolUsed == "service_now" && (values.dropletEnabled == false || values.dropletEnabled == undefined) && (values.csmEnabled == false || values.csmEnabled == undefined)){
                    if(typeof accountsData.SnowDefaultStatusFlowConf == 'object'){
                        SnowDefaultStatusFlowConf = JSON.stringify(accountsData.SnowDefaultStatusFlowConf).replaceAll(",", ", \n");
                    }else{
                        SnowDefaultStatusFlowConf = values.SnowDefaultStatusFlowConf
                    }
                }
                if(submitted == false && (saved == true || saved == false)){ 
                    savedBtn = <Button className="btnMargin saveData" kind='secondary' key="saveData" onClick={this.submitAndContinue}>Save</Button>
                }else if(submitted == true && (saved == true || saved == false)){
                    savedBtn = ''
                }
            }
            if(values.usingTicketingTool == "yes" && (values.IcdDefaultStatusFlowConf == undefined || values.SnowCsmStatusFlowConf == undefined || values.SnowDefaultStatusFlowConf == undefined || values.SnowDropletStatusFlowConf == undefined)){
                if(values.ticketingToolUsed == "icd"){
                    IcdDefaultStatusFlowConf = JSON.stringify(accountsData.IcdDefaultStatusFlowConfEdit).replaceAll(",", ", \n");
                }
                if(values.ticketingToolUsed == "service_now" && (values.dropletEnabled == true ) && (values.csmEnabled == false || values.csmEnabled == undefined)){
                    SnowDropletStatusFlowConf = JSON.stringify(accountsData.SnowDropletStatusFlowConfEdit).replaceAll(",", ", \n");
                }
                if(values.ticketingToolUsed == "service_now" && (values.dropletEnabled == false || values.dropletEnabled == undefined) && (values.csmEnabled == true )){
                    SnowCsmStatusFlowConf = JSON.stringify(accountsData.SnowCsmStatusFlowConfEdit).replaceAll(",", ", \n");
                }
                if(values.ticketingToolUsed == "service_now" && (values.dropletEnabled == false || values.dropletEnabled == undefined) && (values.csmEnabled == false || values.csmEnabled == undefined)){
                    SnowDefaultStatusFlowConf = JSON.stringify(accountsData.SnowDefaultStatusFlowConfEdit).replaceAll(",", ", \n");
                }
                if(submitted == false && (saved == true || saved == false)){ 
                    savedBtn = <Button className="btnMargin saveData" kind='secondary' key="saveData" onClick={this.submitAndContinue}>Save</Button>
                }else if(submitted == true && (saved == true || saved == false)){
                    savedBtn = ''
                }
            }
        }

        return(
            <div>

                {this.state.showPopup ? ( this.ansibleModalHtml()) : null}
                <Form  onSubmit={this.submitAndContinue}>
                    <Grid>
                        <Row>
                            {/* main row */}
                            <Column>
                            {/* main column */}
                                <Row>
                                    <Column>
                                        <Select
                                            className="labelFont"
                                            id="integratedWithChatops"
                                            labelText={<>Does account uses a ticketing tool, if yes, does it needs to be integrated with ChatOps  <b className="fontRed">*</b></>}
                                            name="usingTicketingTool"
                                            onChange={this.props.handleChange('usingTicketingTool')}
                                            defaultValue={values.usingTicketingTool || ""}
                                            required
                                        >
                                            {values.eventSource !== "netcool" && <>
                                            <SelectItem
                                            value=""
                                            hidden
                                            text="Choose an option"
                                            />
                                            <SelectItem value="no" text="No" selected={values.usingTicketingTool == "no"} /> </>}
                                            <SelectItem value="yes" text="Yes" selected={values.usingTicketingTool == "yes"} />
                                        </Select>
                                    </Column>
                                    <Column>

                                    </Column>
                                </Row>
                                <br />
                                { values.usingTicketingTool === "yes" &&  <> 
                                    <Row>
                                        <Column>
                                            <Select
                                                className="labelFont"
                                                id="chatopsCommandAuth"
                                                name="chatopsCommandAuth"
                                                labelText="Authorisation Type"
                                                onChange={this.props.handleChange('chatopsCommandAuth')}
                                                defaultValue={this.props.chatopsCommandAuth||""}
                                            >
                                                <SelectItem
                                                    value=""
                                                    hidden
                                                    text="Choose an option"
                                                />
                                                <SelectItem
                                                    value="userAuth"
                                                    text="User Authorisation"
                                                    selected={this.props.chatopsCommandAuth == "userAuth"}
                                                />
                                                <SelectItem
                                                    value="chatopsAuth"
                                                    text="Chatops Authorization"
                                                    selected={this.props.chatopsCommandAuth == "chatopsAuth"}
                                                />
                                            </Select>
                                        </Column>
                                        <Column></Column>
                                    </Row>
                                    <br />
                                    {(values.chatopsCommandAuth == "chatopsAuth") &&
                                        <Row>
                                            <Column>
                                                <Select
                                                className="labelFont"
                                                    id="authType"
                                                    labelText={
                                                    <span>Access Type <b className="fontRed">*</b> 
                                                    <Tooltip>
                                                    <b>Group: </b> Group members will be ablee to perform the command action.
                                                    <br/>
                                                    <b>Open Access: </b> All the users would be able to perform the command action via the detail provided in the onboarding form.
                                                    </Tooltip>
                                                    </span>
                                                }
                                                    name="authType"
                                                    onChange={this.props.handleChange('authType')}
                                                    defaultValue={this.props.authType}
                                                    required
                                                >
                                                    <SelectItem value="useopenAuth" text="Open Access" selected={this.props.authType == "useopenAuth"} />
                                                    <SelectItem value="useGroup" text="Group"  selected={this.props.authType == "useGroup"}/>
                                                </Select>
                                            </Column>
                                            {values.authType == "useGroup" ? 
                                                <Column>
                                                    <TextInput
                                                        className="labelFont"
                                                        id="authGroup"
                                                        placeholder="Add Group Name"
                                                        labelText={<>Group Name  <b className="fontRed">*</b></>}
                                                        name="authGroup"
                                                        onChange={this.props.handleChange('authGroup')}
                                                        defaultValue={this.props.authGroup}
                                                        required
                                                    />
                                                </Column>:
                                                <Column></Column>
                                            }
                                        </Row> 
                                    }
                                    <br />
                                    {/* Ticketing Tool Group */}
                                    <div className="ticketingToolGroupDiv">
                                        <Row>
                                            <Column>
                                                <Select
                                                className="labelFont"
                                                    id="ticketingToolType"
                                                    labelText={<>Ticketing Tool Used  <b className="fontRed">*</b></>}
                                                    name="ticketingToolUsed"
                                                    onChange={this.props.handleChange('ticketingToolUsed')}
                                                    defaultValue={this.props.ticketingToolUsed|| ""}
                                                    required
                                                >
                                                    <SelectItem
                                                    hidden
                                                    value="noTicketingTool"
                                                    text="Choose an option"
                                                    />
                                                    <SelectItem value="icd" text="ICD" selected={this.props.ticketingToolUsed == "icd"} />
                                                    <SelectItem value="service_now" text="ServiceNow" selected={this.props.ticketingToolUsed == "serviceNow"} />
                                                </Select>
                                            </Column>
                                            <Column>
                                                <TextInput
                                                className="labelFont"
                                                    id="tickertingRestURL"
                                                    placeholder="Ticketing Tool Used"
                                                    labelText={<>Ticketing REST API URL  <b className="fontRed">*</b> <Tooltip>Only host url with / at end to be added. Eg: "https://example.service-now.com/" </Tooltip> </>}
                                                    name="tickertingRestURL"
                                                    onChange={this.props.handleChange('tickertingRestURL')}
                                                    defaultValue={this.props.tickertingRestURL}
                                                    required
                                                />
                                            </Column> 
                                        </Row>
                                            {(this.props.ticketingToolUsed == "service_now") &&
                                            <Checkbox
                                                labelText={`Enable Service Manager`}
                                                id="checkbox-SM"
                                                checked={this.props.enableServiceManager}
                                                onChange={() => this.props.setServiceManager()}
                                            /> }
                                            <br />
                                        <Row>   
                                        </Row>
                                        {values.ticketingToolUsed == 'service_now' && 
                                            <div className="csmGroupDiv">
                                                {values.ticketingToolUsed == 'service_now' &&  (values.csmEnabled == false || values.csmEnabled == undefined) && (values.dropletEnabled == false || values.dropletEnabled == undefined) &&
                                                    <Row>
                                                        <Column>
                                                            <TextArea
                                                                cols={50}
                                                                className="labelFont marginTextArea"
                                                                id="SnowDefaultStatusFlowConf"
                                                                name="SnowDefaultStatusFlowConf"
                                                                // helperText="Provide proper json with name/value pairs, that begins with { left brace and ends with } right brace. Each name should be followed by : colon and the name/value pairs separated by , comma"
                                                                // onBlur={(e) => this.handleInputChange(e)} 
                                                                onChange={this.props.handleChange('SnowDefaultStatusFlowConf')}
                                                                defaultValue={SnowDefaultStatusFlowConf || this.props.SnowDefaultStatusConf} 
                                                                labelText={ <> Snow default status flow configuration 
                                                                    <Tooltip>
                                                                        Default ticketing tool status flow, the config can be modified according to how the configuration is in the tool
                                                                    </Tooltip>
                                                                </> }
                                                                placeholder="Snow default status flow configuration"
                                                                rows={5}
                                                            />
                                                        </Column>
                                                    </Row>
                                                }
                                                <br />
                                                <Row>
                                                    <Column>
                                                        <FormGroup className="displayInlineDiv">
                                                            <label className="displayInlineLabel"><b>Is this instance droplet enabled?</b>
                                                                <Tooltip>
                                                                    Enable this option for servicenow instances that have droplets enabled
                                                                </Tooltip>
                                                                <input
                                                                    type="checkbox"
                                                                    className="relatedInsights"
                                                                    name="dropletEnabled"
                                                                    id="dropletEnabled"
                                                                    disabled={disabledroplet}
                                                                    onClick={ (event) => { this.handleDropletEnabled('dropletEnabled', event) }}
                                                                    defaultChecked={this.props.dropletEnabled || false}
                                                                />
                                                            </label>
                                                        </FormGroup> 
                                                    </Column>
                                                    <Column>
                                                        <FormGroup className="displayInlineDiv">
                                                            <label className="displayInlineLabel"><b>Is this instance CSM enabled?</b>
                                                                <Tooltip>Enable this option for CSM servicenow instances</Tooltip>
                                                                <input
                                                                    type="checkbox"
                                                                    className="relatedInsights"
                                                                    name="csmEnabled"
                                                                    id="csmEnabled"
                                                                    disabled={disableCMS}
                                                                    onClick={ (event) => { this.handlecsmEnabled('csmEnabled', event) }}
                                                                    defaultChecked={this.props.csmEnabled || false}
                                                                />
                                                            </label>
                                                        </FormGroup> 
                                                    </Column>
                                                </Row>
                                                {values.ticketingToolUsed == 'service_now' &&  (values.dropletEnabled == true ) && (values.csmEnabled == false || values.csmEnabled == undefined) &&
                                                    <Row>
                                                        <Column>
                                                            <TextArea
                                                                cols={50}
                                                                className="labelFont marginTextArea"
                                                                id="SnowDropletStatusFlowConf"
                                                                name="SnowDropletStatusFlowConf"
                                                                onChange={this.props.handleChange('SnowDropletStatusFlowConf')}
                                                                defaultValue={SnowDropletStatusFlowConf} 
                                                                labelText={ <> Snow droplet status flow configuration 
                                                                </> }
                                                                placeholder="Snow droplet status flow configuration"
                                                                rows={5}
                                                            />
                                                        </Column>
                                                    </Row>
                                                }
                                                {/* (values.dropletEnabled == false || values.dropletEnabled == undefined) && (values.csmEnabled == true || values.csmEnabled == undefined) */}
                                                {values.ticketingToolUsed == 'service_now' &&  (values.dropletEnabled == false || values.dropletEnabled == undefined) && (values.csmEnabled == true) &&
                                                    <Row>
                                                        <Column>
                                                            <TextArea
                                                                cols={50}
                                                                className="labelFont marginTextArea"
                                                                id="SnowCsmStatusFlowConf"
                                                                name="SnowCsmStatusFlowConf"
                                                                onChange={this.props.handleChange('SnowCsmStatusFlowConf')}
                                                                defaultValue={SnowCsmStatusFlowConf} 
                                                                labelText={ <> Snow CSM status flow configuration </> }
                                                                placeholder="Snow CSM status flow configuration"
                                                                rows={5}
                                                            />
                                                        </Column>
                                                    </Row>
                                                }
                                                {(values.dropletEnabled == true) && 
                                                    <Row>
                                                            <Column>
                                                                <TextInput
                                                                    className="labelFont"
                                                                    id="urlPath"
                                                                    placeholder="API Path"
                                                                    labelText={<>API Path<b className="fontRed">*</b>
                                                                    <Tooltip> Enter the API path of the droplet instance eg:- "/api/now/table/x_ibmip_int_inc_web_services"</Tooltip>
                                                                    </>}
                                                                    name="urlPath"
                                                                    onChange={this.props.handleChange('urlPath')}
                                                                    defaultValue={this.props.urlPath}
                                                                    required
                                                                />
                                                            </Column>
                                                            <Column>
                                                            <FormGroup className="displayInlineDiv">
                                                                <label className="displayInlineLabel"><b>Is this a dedicated droplet instance?</b>
                                                                <Tooltip>Enable this option if this is a dedicated servicenow droplet instance</Tooltip>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="relatedInsights"
                                                                        name="dedicatedDropletInstance"
                                                                        id="dedicatedDropletInstance"
                                                                        onClick={ (event) => { this.handleDedicatedDropletInstance('dedicatedDropletInstance', event) }}
                                                                        defaultChecked={this.props.dedicatedDropletInstance || false}
                                                                    />
                                                                </label>
                                                                </FormGroup> 
                                                            </Column>
                                                    </Row> 
                                                }
                                                {(values.csmEnabled == true) && 
                                                    <Row>
                                                        <Column>
                                                            <TextInput
                                                                className="labelFont"
                                                                id="tableName"
                                                                placeholder="Table Name"
                                                                labelText={<>Table Name<b className="fontRed">*</b>
                                                                    <Tooltip>
                                                                        Default is entered, in case of a different table name enter the appropriate table name
                                                                    </Tooltip>
                                                                </>}
                                                                name="tableName"
                                                                onChange={this.props.handleChange('tableName')}
                                                                defaultValue={this.props.tableName}
                                                                required
                                                            />
                                                        </Column>
                                                        <Column>
                                                        </Column>
                                                    </Row> 
                                                }
                                                {(values.dedicatedDropletInstance == false && values.dropletEnabled == true) && 
                                                    <Row>
                                                        <Column>
                                                            <TextInput
                                                                className="labelFont"
                                                                id="companyName"
                                                                placeholder="Company Name"
                                                                labelText={<>Company Name<b className="fontRed">*</b>
                                                                <Tooltip>Enter client name as specified in the servicenow instance</Tooltip>
                                                                </>}
                                                                name="companyName"
                                                                onChange={this.props.handleChange('companyName')}
                                                                defaultValue={this.props.companyName}
                                                                required
                                                            />
                                                        </Column>
                                                        <Column>
                                                        </Column>
                                                    </Row> 
                                                }
                                            </div>
                                        }
                                        {values.ticketingToolUsed == 'service_now' && 
                                            <div className="serviceNowGroup">
                                                <Row>
                                                    <Column>
                                                        <FormGroup className="displayInlineDiv noMarginDiv">
                                                            <label className="displayInlineLabel"><b>Related ticket insights to display child tickets</b>
                                                            <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip>
                                                                <input
                                                                    type="checkbox"
                                                                    className="relatedInsights"
                                                                    name="relatedInsights"
                                                                    id="relatedInsights"
                                                                    onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                                    defaultChecked={this.props.relatedInsights || false}
                                                                />
                                                            </label>
                                                        </FormGroup> 
                                                    </Column>
                                                </Row>
                                           {/* } */}
                                            {/* {values.ticketingToolUsed == 'service_now' &&  */}
                                                <Row>
                                                    <Column>
                                                        <FormGroup className="displayInlineDiv noMarginDiv">
                                                            <label className="displayInlineLabel"><b>Display incidents with similar configuration item</b>
                                                            <Tooltip>Incidents with similar configuration item displays as an insight in the Incident channel if enabled</Tooltip>
                                                                <input
                                                                    type="checkbox"
                                                                    className="enableCiDetails"
                                                                    name="enableCiDetails"
                                                                    id="enableCiDetails"
                                                                    onClick={ (event) => { this.handleCiCheckbox('enableCiDetails', event) }}
                                                                    defaultChecked={this.props.enableCiDetails || false}
                                                                />
                                                            </label>
                                                        </FormGroup> 
                                                    </Column>
                                                </Row>
                                             {/* } */}
                                            {/* {values.ticketingToolUsed == 'service_now' &&  */}
                                                <Row>
                                                    <Column>
                                                        <FormGroup className="displayInlineDiv noMarginDiv">
                                                            <label className="displayInlineLabel"><b>Display incidents with similar description</b> 
                                                            <Tooltip>Incidents with similar description displays as an insight in the Incident channel if enabled</Tooltip>
                                                                <input
                                                                    type="checkbox"
                                                                    className="enableDescDetails"
                                                                    name="enableDescDetails"
                                                                    id="enableDescDetails"
                                                                    onClick={ (event) => { this.handleDescCheckbox('enableDescDetails', event) }}
                                                                    defaultChecked={this.props.enableDescDetails || false}
                                                                />
                                                            </label>
                                                        </FormGroup> 
                                                    </Column>
                                                </Row>
                                            </div>
                                        }
                                        {values.ticketingToolUsed == 'icd' && 
                                            <div className="icdGroup">
                                                <Row>
                                                    <Column>
                                                        <TextArea
                                                            cols={50}
                                                            className="labelFont marginTextArea"
                                                            id="IcdDefaultStatusFlowConf"
                                                            name="IcdDefaultStatusFlowConf"
                                                            onChange={this.props.handleChange('IcdDefaultStatusFlowConf')}
                                                            defaultValue={IcdDefaultStatusFlowConf} 
                                                            labelText={ <> ICD default status flow configuration </> }
                                                            placeholder="ICD default status flow configuration"
                                                            rows={5}
                                                        />
                                                    </Column>
                                                </Row>
                                                <Row>
                                                    <Column>
                                                        <Select
                                                        className="labelFont"
                                                        id="internetFacing"
                                                        labelText="Can ticketing tool API be accessed from the Internet?(Internet Facing)"
                                                        // defaultValue="opts"
                                                        name="internetFacing"
                                                        onChange={this.props.handleChange('internetFacing')}
                                                        defaultValue={this.props.internetFacing|| ""}
                                                        >
                                                            <SelectItem
                                                                value=""
                                                                hidden
                                                                text="Choose an option"
                                                            />
                                                            <SelectItem value="yes" text="Yes" selected={this.props.internetFacing == "yes"} />
                                                            <SelectItem value="no" text="No" selected={this.props.internetFacing == "no"} />
                                                        </Select>
                                                    </Column>
                                                    <Column>
                                                        
                                                    </Column>
                                                </Row>
                                            </div>
                                        }
                                        
                                    </div>
                                    <br />
                                    <Row>
                                        <Column>
                                            <Select
                                            className="labelFont"
                                                id="authenticationType"
                                                labelText={<>Type of Authentication  <b className="fontRed">*</b></>}
                                                // defaultValue="opts"
                                                name="typeOfAuthentication"
                                                onChange={this.props.handleChange('typeOfAuthentication')}
                                                defaultValue={this.props.typeOfAuthentication}
                                                required
                                            >
                                                {values.ticketingToolUsed != 'icd' && <><SelectItem
                                                //   disabled
                                                value="noAuth"
                                                text="Select an option"
                                                />
                                                <SelectItem value="oauth" text="OAuth" /></>}
                                                <SelectItem value="basic" text="Basic" />
                                            </Select>
                                        </Column>
                                        <Column>
                                        </Column>
                                    </Row>
                                    <br />
                                    <div>
                                        {(values.typeOfAuthentication == "basic" || values.typeOfAuthentication == "oauth") && 
                                            <>
                                            <Row>
                                                <Column>
                                                    <TextInput
                                                    className="labelFont"
                                                        type="password"
                                                        id="userId"
                                                        placeholder="Basic Auth User ID(Required for Oauth Style as well)"
                                                        labelText={<>Basic Auth User ID  <b className="fontRed">*</b></>}
                                                        name="basicAuthUserID"
                                                        defaultValue={this.props.basicAuthUserID}
                                                        onChange={this.props.handleChange('basicAuthUserID')}
                                                        required
                                                    />
                                                </Column>
                                                <Column>
                                                    <TextInput
                                                    className="labelFont"
                                                        type="password"
                                                        id="userPassword"
                                                        placeholder="*********"
                                                        labelText={<>Basic Auth Password  <b className="fontRed">*</b></>}
                                                        name="basicAuthPassword"
                                                        defaultValue={this.props.basicAuthPassword}
                                                        onChange={this.props.handleChange('basicAuthPassword')}
                                                        required
                                                    />
                                                </Column>        
                                            </Row>
                                            {values.typeOfAuthentication == "oauth" && 
                                            <Row>
                                                <Column>
                                                    <TextInput
                                                    className="labelFont"
                                                        type="password"
                                                        id="oauthClientID"
                                                        placeholder="*********"
                                                        labelText={<>OAuth Client ID  <b className="fontRed">*</b></>}
                                                        name="oauthClientID"
                                                        onChange={this.props.handleChange('oauthClientID')}
                                                        defaultValue={this.props.oauthClientID || ""}
                                                        required
                                                    />
                                                </Column>
                                                <Column>
                                                    <TextInput
                                                    className="labelFont"
                                                        type="password"
                                                        id="oauthClientSecret"
                                                        placeholder="*********"
                                                        labelText={<>OAuth Client Secret  <b className="fontRed">*</b></>}
                                                        name="oauthClientSecret"
                                                        onChange={this.props.handleChange('oauthClientSecret')}
                                                        defaultValue={this.props.oauthClientSecret || ""}
                                                        required
                                                    />
                                                </Column>
                                            </Row>
                                            } 
                                        </>
                                        }
                                        <Row>
                                            <Column>
                                                <div className="checkConnectionDiv">
                                                    <a href="#" className="bx--btn bx--btn--tertiary" onClick= {this.checkConnection}>Test Connection
                                                    </a>
                                                    {this.state.showSuccess ? (
                                                        <CheckmarkFilled32 className="connectionSuccess"/>) : null
                                                    }
                                                    {this.state.showFailure ? (
                                                        <CloseFilled32 className="connectionFailure"/>) : null
                                                    }
                                                </div>
                                                {this.state.showFailPopup ? (
                                                    <div className="popup">
                                                        <div className="bx--modal-container modal-css">
                                                            <div className="bx--modal-header">
                                                                <p
                                                                className="bx--modal-header__heading bx--type-beta"
                                                                id="modal-connectionFail-heading"
                                                                >
                                                                Ticketing Tool Connection is Failed. Do you want to Continue?
                                                                </p>
                                                            </div>
                                                            <div className="bx--modal-content--overflow-indicator"></div>

                                                            <div className="bx--modal-footer">
                                                            <Button
                                                            kind="tertiary"
                                                            className="connectionCheck"
                                                            onClick={this.cancelPopup}
                                                            >
                                                            No
                                                            </Button>
                                                            <Button
                                                            kind="primary"
                                                            onClick={this.submitPopup}
                                                            className="connectionCheck"
                                                            >
                                                            Yes
                                                            </Button>
                                                            </div>
                                                        </div>
                                                        <span tabindex="0"></span>
                                                    </div>
                                                    ) : null
                                                }
                                            </Column>
                                        </Row>
                                    </div>
                                    </> 
                                } 
                            </Column>
                        </Row>
                        <div className="additionalGroup">  
                            <Row>
                                <Column>
                                    <FormGroup className="displayInlineDiv">
                                        <label className="displayInlineLabel"><b>Enable Stack exchange</b>
                                            <span>
                                                <Tooltip>
                                                    URL Links from stack exchange for the incident description gets added as an insight to the incident channel.
                                                </Tooltip>
                                            </span>
                                        <input
                                            type="checkbox"
                                            className="enableStackDetails"
                                            name="enableStackDetails"
                                            id="enableStackDetails"
                                            onClick={ (event) => { this.handleStackCheckbox('enableStackDetails', event) }}
                                            defaultChecked={this.props.enableStackDetails || false}
                                        />
                                        </label>
                                    </FormGroup> 
                                </Column>
                            </Row>
                            <Row>
                                <Column>
                                    <FormGroup className="displayInlineDiv">
                                        <label className="displayInlineLabel"><b>Enable Watson Knowledge insights</b>
                                            <span>
                                                <Tooltip>
                                                    Response from Watson assistant gets added as an insight to the incident channel.
                                                </Tooltip>
                                            </span>
                                            <input
                                                type="checkbox"
                                                className="enableWatsonAssistant"
                                                name="enableWatsonAssistant"
                                                id="enableWatsonAssistant"
                                                onClick={ (event) => { this.handleWatsonCheckbox('enableWatsonAssistant', event) }}
                                                defaultChecked={this.props.enableWatsonAssistant || false}
                                            />
                                        </label>
                                        {this.props.enableWatsonAssistant?
                                        <>
                                        <Row>
                                        <Column>
                                            <TextInput
                                                className="labelFont"
                                                id="watsonURL"
                                                placeholder="IBM Watson Assistant URL"
                                                labelText={<>IBM Watson Assistant URL  <b className="fontRed">*</b></>}
                                                name="watsonURL"
                                                onChange={this.props.handleChange('watsonURL')}
                                                defaultValue={this.props.watsonURL || ""}
                                                required
                                            />
                                        </Column>
                                        <Column>
                                            <TextInput
                                                className="labelFont"
                                                id="watsonVersion"
                                                placeholder="IBM Watson Version"
                                                labelText={<span>IBM Watson Version  <b className="fontRed">*</b>
                                                <Tooltip>
                                                Version should be of format version=&lt;value&gt; , eg: version=2020-04-01
                                                </Tooltip>
                                            </span>}
                                                name="watsonVersion"
                                                onChange={this.props.handleChange('watsonVersion')}
                                                defaultValue={this.props.watsonVersion || ""}
                                                required
                                            />
                                            
                                        </Column>
                                    </Row>
                                    <Row>
                                        <Column>
                                             <TextInput
                                                type="password"
                                                className="labelFont"
                                                id="watsonApiKey"
                                                placeholder="IBM Watson API Key"
                                                labelText={<>IBM Watson API Key  <b className="fontRed">*</b></>}
                                                name="watsonApiKey"
                                                onChange={this.props.handleChange('watsonApiKey')}
                                                defaultValue={this.props.watsonApiKey || ""}
                                                required
                                            />
                                        </Column>
                                    </Row>
                                    </>:''
                                        }
                                    </FormGroup>
                                </Column>
                            </Row>
                            <br />      
                            <Row>
                                <Column>
                                    <Select
                                        className="labelFont"
                                        id="ansibleIntegratedWithChatops"
                                        labelText={<>Does account need ChatOps integration with CACF/Ansible <b className="fontRed">*</b></>}
                                        name="ansibleIntegratedWithChatops"
                                        onChange={this.props.handleChange('usingAnsibleIntegration')}
                                        defaultValue={values.usingAnsibleIntegration || "no"}
                                        required
                                        >
                                        <SelectItem value="no" text="No" selected={values.usingAnsibleIntegration == "no"} /> 
                                        <SelectItem value="cacf" text="CACF" selected={values.usingAnsibleIntegration == "cacf"} />
                                        <SelectItem value="ansible" text="Ansible" selected={values.usingAnsibleIntegration == "ansible"} />
                                    </Select>
                                </Column>
                                <Column></Column>
                            </Row>
                            { values.usingAnsibleIntegration == "ansible"? this.enableAnsibleHtml() : null}
                            { values.usingAnsibleIntegration == "cacf"? this.enableCacfHtml() : null}
                            { (values.usingAnsibleIntegration == "ansible" || values.usingAnsibleIntegration == "cacf") ? this.jobLogHtml() : null}

                            <br />
                            <Row>
                                <Column>
                                <TextArea
                                    className="labelFont"
                                    cols={50}
                                    rows={5}
                                    labelText={<>Any other Information that you would like to add ? <span className="specialCharacterLabel">(Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | ? ~ are not allowed)</span></>}
                                    placeholder="Any other Information that you would like to add ?"
                                    onChange={this.props.handleChange('otherInformation')}
                                    name="otherInformation"
                                    defaultValue={this.props.otherInformation}
                                />
                                </Column>
                            </Row>
                        </div>
                        <Row>
                            <div className="btnDivAA">
                                {/* <ButtonsForm /> */}
                                {/* <Button kind='secondary' type="submit" id="cancelTab1" className="btnAA cancelBtn">Cancel</Button>
                                <Button kind='primary' type="submit" id="saveTab1" className="btnAA saveBtn">Save</Button>
                                <Button kind='primary' type="submit"    id="continueTab1" className="btnAA continueBtn">Submit</Button> */}
                            </div>
                            
                        </Row>
                        <div>
                            {
                                this.props['specialCharacterErr'] &&
                                <small className="fontRed" style={{width: '100% !important'}}>
                                    <b className="errorMsg specialCharErr">{this.props['specialCharacterErr']}</b>
                                </small>
                            }
                        </div>
                        <div className="btnCommon">
                            <Button className="btnMargin" kind='tertiary' onClick={this.back}>Back</Button>
                            <div>
                                {savedBtn}
                            </div>
                            {/* <Button className="btnMargin saveData" kind='secondary' key="saveData" onClick={this.submitAndContinue}>Save</Button> */}
                               
                            <Button type="submit" className="btnMargin btnLast" disabled={!(this.props.generalFormSubmitted && this.props.configFormSubmitted)}>Submit</Button>
                        </div>
                        {
                            this.props.isvalidJSon == true && 
                            <small className="fontRed">
                            <b className="blgrperrorMsg">{this.props.invalidJsonErr}</b>
                            </small>
                        }
                        <div>
                            {
                                this.props.isInvalidData &&
                                <small className="fontRed" style={{width: '100% !important'}}>
                                    <b className="blgrperrorMsg">{this.props.invalidData}</b>
                                </small>
                            }
                        </div>
                    </Grid>
                    
                </Form>
            </div>

        )
    }
}

export default AdditionalInfoForm;