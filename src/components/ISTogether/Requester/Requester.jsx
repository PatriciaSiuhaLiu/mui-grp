import React from 'react';
import ReactDOM from 'react-dom';
import { trackPromise } from "react-promise-tracker";
import {  Button, Tabs, Tab, ListItem, Form, TextInput, TextArea, Select, SelectItem  } from 'carbon-components-react';
import { Link, withRouter } from 'react-router-dom';
import { TrashCan32 } from "@carbon/icons-react";
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { AddAlt32 } from "@carbon/icons-react";
import { validate } from '../../../validation/validate.js';
// import DRForm from './DRForm';
import LazyLoad from "react-lazyload";
import validator from 'validator';
class ReqHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = (
            {
                disableMarket: true,
                addResource: [{resource: ""}],
                required: "required",
                reqEMail: "",
                altEmail: "",
                account: "",
                geo: "",
                resourceEmail: [""],
                market:"",
                suppotType: "",
                shortDescription:"",
                description:"",
                startDate: "",
                endDate: "",
                skills: "",
                estimatedHours: "",
                comments: "",
                requiredAdmin: true,
                isValidEndDate:true,
                validStartDate: true,
                requestorContactNo:'',
                technicalContactNo:'',
                domainData: []
            }
        );
    }
    componentDidMount() {
        trackPromise(
            fetch("/mui/teamITData")
            .then((res) => {
                return res.json();
            })
            .then((dbData) => {
                this.setState({ dbData });
            })
        );
        trackPromise(
            fetch("/mui/reqData")
            .then((res) => {
                // const { command } = await res.json();
                return res.json();
            })
            .then((reqData) => {
                this.setState({ reqData });
                this.setState({disableMarket: false});
                this.setState({requiredAdmin: false});
                this.setState({reqID: this.state?.reqData?.reqid});
            })
        );

        trackPromise(
            fetch("/mui/volunteertracker")
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                var command  = data.volunteerTrackerData;
                let resourceEmail = [];
                if(command === null || command === undefined || command.length === 0){
                    this.setState({resourceEmail: resourceEmail})
                }
                else
                {
                    command.forEach( volunteerTracker => {
                        resourceEmail.push(volunteerTracker.volunteerEmail);
                    })
                    this.setState({resourceEmail: resourceEmail})
                    command.resources = resourceEmail;
                }
            })
        );

        trackPromise(
            fetch("/mui/fetchAllowedDomains")
            .then((res) => {
                return res.json();
            })
            .then((domainData) => {
                this.setState({ domainData });
            })
        );
    }
    addParamField = () => {
        const { resourceEmail } = this.state;
        resourceEmail.push("");
        this.setState({
          resourceEmail,
        });
      };
    deleteParamField = (index) => {
        const { resourceEmail } = this.state;
        if (resourceEmail.filter((param) => param != undefined).length <= 1) return;
        resourceEmail[index] = undefined;
        this.setState({
          resourceEmail,
        });
      };
      addParam = (index, value) => {
        const { resourceEmail } = this.state;
        resourceEmail[index] = value.trim();
      };
      handleParam = (e) => {
        const { id, value } = e.target;
        const [field, i] = id.split("-");
        if (field === "inputResource") {
          this.addParam(+i, value);
        } else if (field === "delResource") {
          this.deleteParamField(+i);
        }
      };
    handleChange1 = (e) => {
        var currentDate = new Date();
        var currentDateNew = (currentDate.getMonth() + 1) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear();
        var month = e._d.getMonth() + 1; //months from 1-12
        var day = e._d.getDate();
        var year = e._d.getFullYear();
        var endDate = month + "/" + day + "/" + year;
        // if(endDate < currentDateNew){
        //     this.setState({disableBtn_endDate: true})
        // }else{
            this.setState({ endDate: endDate });
            this.setState({inValidDateDescription:""});
            this.setState({isValidEndDate : true});
            this.setState({disableBtn_endDate: false})
        // }
    }
    handleChange2 = (e) => {
        var currentDate = new Date();
        var currentDateNew = (currentDate.getMonth() + 1) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear();
        var month = e._d.getMonth() + 1; //months from 1-12
        var day = e._d.getDate();
        var year = e._d.getFullYear();
        var startDate = month + "/" + day + "/" + year;
        // if(startDate < currentDateNew){
        //     this.setState({disableBtn_startDate: true})
        // }else{
            this.setState({ startDate: startDate });
            this.setState({inValidDateDescription:""});
            this.setState({isValidEndDate : true});
            this.setState({disableBtn_startDate: false})
        // }
    }
    handleInputChange = (e) => {
        if ((e.target.value && e.target.value.includes("script") && e.target.value.includes("<")) || e.target.value.includes(">")){
            this.setState({
                ["inValid_" + e.target.name]: "Invalid Input.",
            });
            return;
        }
        if(e.target.name == "requesterEmail" || e.target.name == "alternateContactEmail"){
            if (e.target.value && e.target.value.includes("@")){
                this.setState({
                    [e.target.name]: e.target.value,
                });
                this.setState({
                    ["inValid_" + e.target.name]: "",
                });
            }else{
                this.setState({
                    ["inValid_" + e.target.name]: "Invalid Input.",
                });
                return;
            }
        }
        
        this.setState({
            [e.target.name]: e.target.value,
        });
    };
    updateValue = (e) => {
        if(e.target.name == "reqGeo" && e.target.value != ""){
            this.setState({disableMarket: false})
            this.setState({required: "required"})
        }
        if(e.target.name == "reqGeo" && e.target.value == ""){
            this.setState({disableMarket: true})
            this.setState({required: ""})
        }
        
        this.setState({ [e.target.name]: e.target.value });
    };
    updateValue1 = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };
    handleCheckbox1(name, event) {
        this.setState({
            [event.target.name]: event.target.checked,
        });
    };
    handleCheckbox3(name, event) {
        if(event.target.checked == true) {
            this.setState({
                [event.target.name]: event.target.getAttribute("data-value"),
            });
        }else{
            this.setState({[event.target.name]: ""})
        }
    };
    handleCheckbox2(name, event) {
        this.setState({
            [event.target.name]: event.target.checked,
        });
    };
    handleCharacterChange = (e) => {
        if(e.target.name == "comments" ){
            if(e.target.value.length == 300){
                this.setState({["disableBtn_"+ e.target.name]: true})
                this.setState({["maxLengthErr_" + e.target.name]: "You have reached the maximum limit of characters allowed"})
            }else{
                this.setState({["disableBtn_"+ e.target.name]: false})
                this.setState({["maxLengthErr_" + e.target.name]: ""})
            }
        }
        if(e.target.name == "shortDescription"){
            if(e.target.value.length == 300){
                this.setState({["disableBtn_"+ e.target.name]: true})
                this.setState({["maxLengthErr_" + e.target.name]: "You have reached the maximum limit of characters allowed"})
            }else{
                this.setState({["disableBtn_"+ e.target.name]: false})
                this.setState({["maxLengthErr_" + e.target.name]: ""})
            }
        }
        if(e.target.name == "description"){
            if(e.target.value.length == 1500){
                this.setState({["disableBtn_"+ e.target.name]: true})
                this.setState({["maxLengthErr_" + e.target.name]: "You have reached the maximum limit of characters allowed"})
            }else{
                this.setState({["disableBtn_"+ e.target.name]: false})
                this.setState({["maxLengthErr_" + e.target.name]: ""})
            }
        }
    }
    addClick(){
        this.setState(prevState => ({ 
            addResource: [...prevState.addResource, { resource: ""}]
        }))
    }
    createUI(){
        var resourceState = this.state?.reqData?.dataToUI.resources;
        return this.state.addResource.map((el, i) => (
            <div key={i} className="addSelectInline">
                <div className="bx--col">
                <TextInput type="text" className="bx--text-input bx--text__input"  id={"resource"+i} name={"resource"+i} labelText= "Resource Email"  placeholder="Resource Email" onBlur={this.handleChange.bind(this, i)} onChange={(e) => this.updateValue(e)}  defaultValue={el.addResource ||''} />
                </div>
                {/* <TrashCan32 value='remove' onClick={this.removeClick.bind(this, i)} className="linkStyle1" /> */}
            </div>          
        ))
    }
    handleChange(i, e) {
        const { name, value } = e.target;
        let addResource = [...this.state.addResource];
        addResource[i] = {...addResource[i], [name]: value};
        this.setState({ addResource });

   }
   
   removeClick(i){
      let addResource = [...this.state.addResource];
      addResource.splice(i, 1);
      this.setState({ addResource });
   }
    formSubmit= (e) => {
        e.preventDefault();
        if(this.checkEndDateIsHigher() === false){
            return false;
        }
        if(!this.state.reqID && (this.state.startDate === '' || this.state.endDate === '')){
            this.setState({
                resErrMsg: {
                    dateError: 'Start date and End date is required'
                }
            });
            return false;
        }
        else {
            this.setState({
                resErrMsg: false
            });

        }
        let [skillArr1, skillArr2,skillArr3, skillArr4,skillArr5, skillArr6, skillArr7, skillArr8, skillArr9, skillArr10 ] = [[], [], [], [], [], [], [], [], [], []]
        var skills = {};
        var resourceToSave = []
        var addResourceArr = this.state.addResource;
        for(var i = 0; i < addResourceArr.length; i++) {
            for (var key in addResourceArr[i]) {
                if(addResourceArr[i][key] == ""){
                }else{
                    var geoMarketObj = {}
                    if(key.includes("resource")){
                        var resourcevalue = addResourceArr[i][key];
                        resourceToSave.push(resourcevalue)
                    }
                }
            }
        }
        for (var key in this.state) {
            if (this.state.hasOwnProperty(key)) {
                if(this.state[key] == "Platform"){
                    skillArr1.push(key);
                    skills[this.state[key]] = skillArr1
                }
                if(this.state[key] == "Database"){
                    skillArr2.push(key);
                    skills[this.state[key]] = skillArr2
                }
                if(this.state[key] == "Middleware"){
                    skillArr3.push(key);
                    skills[this.state[key]] = skillArr3
                }
                if(this.state[key] == "SAP ERP"){
                    skillArr4.push(key);
                    skills[this.state[key]] = skillArr4
                }
                if(this.state[key] == "Network"){
                    skillArr5.push(key);
                    skills[this.state[key]] = skillArr5
                }
                if(this.state[key] == "Resiliency"){
                    skillArr6.push(key);
                    skills[this.state[key]] = skillArr6
                }
                if(this.state[key] == "Storage"){
                    skillArr7.push(key);
                    skills[this.state[key]] = skillArr7
                }
                if(this.state[key] == "Mainframe"){
                    skillArr8.push(key);
                    skills[this.state[key]] = skillArr8
                }
                if(this.state[key] == "WMS & Deskside (DWS)"){
                    skillArr9.push(key);
                    skills[this.state[key]] = skillArr9
                }
                if(this.state[key] == "Service Desk(DWS)"){
                    skillArr10.push(key);
                    skills[this.state[key]] = skillArr10
                }
            }
        }
        var endDateTOSave = '';
        if(this.state.endDate){
            endDateTOSave = this.state.endDate
        }
        if(this.state.endDate && this.state.reqData.dataToUI.endDate){
            endDateTOSave = this.state.endDate
        }
        if(!this.state.endDate && this.state.reqData.dataToUI.endDate){
            endDateTOSave = this.state.reqData.dataToUI.endDate
        }if(this.state.validStartDate === true){
            var dataToSave = {
                status: this.state.status || this.state.reqData.dataToUI.status,
                closeCode: this.state.closeCode || this.state.reqData.dataToUI.closeCode,
                account: this.state.account || this.state.reqData.dataToUI.account,
                reqID: this.state.reqID,
                alternateContactEmail: this.state.alternateContactEmail || this.state.reqData.dataToUI.alternateEmail,
                claimTerms: this.state.claimTerms,
                comments: this.state.comments || this.state.reqData.dataToUI.comments,
                complianceTerms: this.state.complianceTerms,
                description: this.state.description || this.state.reqData.dataToUI.description ,
                endDate: endDateTOSave ,
                estimatedHours: this.state.estimatedHours || this.state.reqData.dataToUI.estHours ,
                reqGeo: this.state.reqGeo || this.state.reqData.dataToUI.geo ,
                reqMarket: this.state.reqMarket || this.state.reqData.dataToUI.market ,
                requesterEmail: this.state.requesterEmail || this.state.reqData.dataToUI.requesterEmail ,
                shortDescription: this.state.shortDescription || this.state.reqData.dataToUI.shortDesc ,
                startDate: this.state.startDate || this.state.reqData.dataToUI.startDate ,
                supportType: this.state.supportType || this.state.reqData.dataToUI.supportType,
                skills: skills || this.state.reqData.dataToUI.skills,
                resourceToSave: this.state.resourceEmail || this.state.reqData.dataToUI.resources,
                requestorContactNo:this.state.requestorContactNo || this.state.reqData.dataToUI.requestorContactNo,
                technicalContactNo: this.state.technicalContactNo || this.state.reqData.dataToUI.technicalContactNo,
            };
             // SpecialCharacter validation
            var validateFields = validate(dataToSave);
            if(validateFields.length > 0){
                var message = "";
                for(var i =0; i<validateFields.length; i++){
                    var element = document.querySelector(`input[name=${validateFields[i]}]`);
                    if(element){
                        message += element.title + ", ";
                    }else{
                        message += validateFields[i] + ", "
                    }
                }
                this.setState({'specialCharacterErr': `Special Character not allowed in field ${message}`});
            }else{
                trackPromise(
                        fetch('/mui/saveTeamITRequester' , {
                        method: "POST",
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify(dataToSave)
                    })
                    .then((result) => {
                        if (result.status === 404 || result.status === 400 || result.status === 500)  {
                            result.json().then((object)=> {
                                this.setState({resErrMsg: object.fetchErrorfromRequester});
                            })
                        } else if (result.status === 409) {
                            result.json().then((object)=> {
                                this.setState({resErrMsg: object.fetchErrorfromRequester});
                            })
                        } else if(result.status == 200){
                            this.props.history.push("/mui/thankyou");
                        }
                })
                    .catch(err => { 
                    this.setState({errorMessage: err.message});
                    })
                )
            }
        }else{

        }
       
    }

    checkIfSelectedDateIsValid = (selectedDate)=> {
        if (this.state.startDate) {
            return selectedDate.isAfter(this.state.startDate - 1);
        }
        return true;
    }

    checkEndDateIsHigher = () => {
        let isValid = true;
        if (this.state.endDate) {
            const startDate = new Date(this.state.startDate);
            const endDate = new Date(this.state.endDate);
            if (endDate < startDate) {
                this.setState({
                    inValidDateDescription:"End Date should be after Start Date",
                    isValidEndDate : false
                });
                isValid = false;
                return isValid;
            }
        }
        return isValid;
    }
    render() {
        var stateObj = this.state;
        var suportItem = ''
        const itemssuport = [];
        var statusListItem = ''
        const itemsStatusList = [];
        const itemscloseCodeList = [];
        var closeCodeListItem = '';
        var geoItem = ''
        const itemsGeo = [];
        const itemsMarket = [];
        var formOptionMarket = "";
        var disableMarket = this.state.disableMarket;
        var itemsSkill = [];
        var reqEMail;
        var altEmail;
        var account;
        var geoToEdit;
        var marketToEdit;
        var suppotType;
        var shortDescription;
        var description;
        var startDate;
        var endDate;
        var skillsToEdit;
        var estimatedHours;
        var comments;
        var itemCategory = "";
        var checkboxChecked = "checked";
        var resourceDiv = '';
        var status = '';
        var colonVal = '';
        var closeCode = '';
        var statusList = ["In Progress", "Completed", "Failed"];
        var closeCodeList = ["Success", "On Hold", "Open", "Failed", "Closed"];
        let disableAll = false;
        let disableResources = false;
        let requestStatus = "";
        let addResourceStyle = {};
        let requestorContactNo='';
        let technicalContactNo='';
        let initialStartDate ='' ;
        let initialEndDate ='';
        if(this.state?.reqData){
            var fromDBToEdit = this.state.reqData.dataToUI;
            resourceDiv = this.state.reqData.reqUpdate;
            reqEMail= fromDBToEdit.requesterEmail;
            altEmail= fromDBToEdit.alternateEmail;
            account= fromDBToEdit.account;
            geoToEdit= fromDBToEdit.geo;
            marketToEdit= fromDBToEdit.market;
            suppotType= fromDBToEdit.supportType;
            shortDescription= fromDBToEdit.shortDesc;
            description= fromDBToEdit.description;
            startDate= fromDBToEdit.startDate;
            endDate= fromDBToEdit.endDate;
            skillsToEdit= fromDBToEdit.skills;
            estimatedHours= fromDBToEdit.estHours;
            comments= fromDBToEdit.comments;
            status = fromDBToEdit.status
            closeCode = fromDBToEdit.closeCode
            disableMarket = false
            colonVal = ":"
            requestStatus = fromDBToEdit.adminStatus;
            requestorContactNo = fromDBToEdit.requestorContactNo;
            technicalContactNo = fromDBToEdit.technicalContactNo;
        }else{
            // CREATE
            colonVal = "";
            reqEMail= "";
            altEmail= "";
            account= "";
            geoToEdit= "";
            marketToEdit="";
            suppotType= "";
            shortDescription="";
            description="";
            startDate= "";
            endDate= "";
            skillsToEdit= "";
            estimatedHours= "";
            comments= "";
            status = "";
            closeCode = '';
            disableMarket = true;
            requestorContactNo = '';
            technicalContactNo = '';
        }
        if(stateObj?.dbData){
            var dbData = stateObj.dbData.dbData;
            var supportList = dbData.supportList[0].supportType;
            var geoList = dbData.geoList;
            var skillList = dbData.skillList;
            for (var i=0; i < statusList.length; i++) {
                
                statusListItem = (
                    <option
                    className="bx--select-option"
                    value={statusList[i]}
                    selected={statusList[i] == status}
                    >
                    {statusList[i]}
                    </option>
                );
                itemsStatusList.push(statusListItem);
            }
            for (var i=0; i < closeCodeList.length; i++) {
                
                closeCodeListItem = (
                    <option
                    className="bx--select-option"
                    value={closeCodeList[i]}
                    selected={closeCodeList[i] == closeCode}
                    >
                    {closeCodeList[i]}
                    </option>
                );
                itemscloseCodeList.push(closeCodeListItem);
            }
            for (var i=0; i < supportList.length; i++) {
                suportItem = (
                    <option
                    className="bx--select-option"
                    value={supportList[i]}
                    selected={supportList[i] == suppotType}
                    >
                    {supportList[i]}
                    </option>
                );
                itemssuport.push(suportItem);
            }
            Object.entries(geoList).map(([key, value]) => {
                  geoItem = <option
                    className="bx--select-option"
                    value={value.geo}
                    selected={value.geo == geoToEdit}
                  >
                    {value.geo}
                  </option>
                itemsGeo.push(geoItem);
              });

              var skillSet = ''
              var skillCheck = '';
              var editSkill = [];
              var editPlatform = '';
              var itemSkillArr = [];
              var fromDBToEdit1 ;
              var skillsToEdit1

        if(this.state?.reqData?.reqUpdate){
            disableAll= true;
            //if(not admin) // disable resources
            if(!this.props.location?.state?.admin || requestStatus === "Pending"){
                disableResources = true
                 addResourceStyle = {
                    cursor: "not-allowed",
                    opacity: "50%",
                    hover: "none",
                  };
            }
            
        }
            Object.entries(skillList).map(([key, value]) => {
                skillSet = '';
                skillCheck = '';
                editSkill = [];
                editPlatform = '';
                itemSkillArr = [];
                if(this.state?.reqID){ 
                    //edit flow
                    fromDBToEdit1 = this.state?.reqData?.dataToUI;
                    skillsToEdit1= fromDBToEdit1.skills;
                    editSkill = skillsToEdit1[value.category];
                    if(editSkill == undefined){
                        editSkill = [0];
                    }
                }
                
                for(var i = 0; i< value.skills.length; i++){
                    var skills = value.skills[i];
                    if(editSkill.includes(skills)){
                        skillSet = <div className="checkbox checkboxDisplayStyle">
                                    <input className="checkboxDisplayInline checkboxInput" disabled={disableAll} type="checkbox" checked name={skills} data-value={value.category} onClick={ (event) => { this.handleCheckbox3({skills}, event) }}  />
                                    <label className="bx--checkbox-label-text checkboxClass">
                                        {skills}
                                    </label>
                                </div> 
                    }else{
                        skillSet = <div className="checkbox checkboxDisplayStyle">
                                    <input className="checkboxDisplayInline checkboxInput" disabled={disableAll} type="checkbox" checkboxChecked name={skills} data-value={value.category} onClick={ (event) => { this.handleCheckbox3({skills}, event) }}  />
                                    <label className="bx--checkbox-label-text checkboxClass">
                                        {skills}
                                    </label>
                                </div> 
                    }
                    itemSkillArr.push(skillSet)
                }
                itemCategory = <Tab className="tabStyle" href="#" id="tab-1" label={value.category} >
                                    <div className="some-content">
                                        {itemSkillArr}
                                    </div>
                                </Tab>

                itemsSkill.push(itemCategory);
              });
              Object.entries(geoList).map(([key, value]) => {
                if (this.state.reqGeo !== "Choose an Option") {
                  if (value.geo == (this.state.reqGeo || geoToEdit)) {
                    var market = value.market;
                    for (var i = 0; i < market.length; i++) {
                      formOptionMarket = (
                        <option
                          className="bx--select-option"
                          value={market[i]}
                          selected={market[i] ==marketToEdit}
                        >
                          {market[i]}
                        </option>
                      );
                      itemsMarket.push(formOptionMarket);
                    }
                  }
                }
            });
        }

       
        return (
                <LazyLoad>

                    <Form onSubmit={this.formSubmit}>
                    <div className="bx--grid gridPadd">
                        {this.state?.reqData?.reqUpdate &&
                            <div className="bx--row">
                                <div className="bx--col">
                                <Select className="labelFont" data-value="adminUpdate" id="status" name="status" labelText="Status" defaultValue={status} onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)}  >
                                    <SelectItem
                                        // selected={impactingEvent == true}
                                        value=""
                                        text="Choose an Option"
                                    />
                                    {itemsStatusList}
                                </Select>
                            </div>
                            <div className="bx--col">
                                <Select className="labelFont "  id="closeCode" name="closeCode" labelText="Close Code" defaultValue={closeCode} onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)}  >
                                    <SelectItem
                                        // selected={impactingEvent == true}
                                        value=""
                                        text="Choose an Option"
                                    />
                                    {itemscloseCodeList}
                                </Select>
                            </div>
                            </div>
                        }
                        <div className="bx--row">
                            <div className="bx--col">
                                <TextInput disabled={disableAll} type="text" className="bx--text-input bx--text__input"  id="requesterEmail" name="requesterEmail" labelText= "Requester Email"  placeholder="Requester Email" onBlur={(e) => this.handleInputChange(e)} 
                                onChange={(e) => {
                                    const email = e.target.value.trim();
                                    const isValidEmail = validator.isEmail(e.target.value.trim());
                                    var validEmail;
                                    var domainValues = this.state.domainData;
                                    var domainArray = domainValues.domainData;
                                    if(email.includes("@")){
                                        let splitUser = email.split("@");
                                        if(splitUser[1]) {
                                            validEmail = domainArray.includes(splitUser[1].toLowerCase());
                                        }
                                    }
                                    if (!isValidEmail || !validEmail )
                                      e.target.setCustomValidity(
                                        "Please provide a valid email id"
                                      );
                                    else e.target.setCustomValidity("");
                                    this.updateValue(e);
                                  }}
                                defaultValue={reqEMail} required="required"  />
                                {this.state?.inValid_requesterEmail &&
                                    <small className="fontRed">
                                        <b className="blgrperrorMsg">{this.state.inValid_requesterEmail}</b>
                                    </small>
                                }
                            </div>
                            <div className="bx--col">
                                <TextInput  type="text" disabled={disableAll} className="bx--text-input bx--text__input"  id="alternateContactEmail" name="alternateContactEmail" labelText= "Alternate Contact Email"  placeholder="Alternate Contact Email" onBlur={(e) => this.handleInputChange(e)} 
                                onChange={(e) => {
                                    if(e.target.value.trim() !== ''){
                                        const isValidEmail = validator.isEmail(e.target.value.trim());
                                        if (!isValidEmail){
                                            e.target.setCustomValidity(
                                                "Please provide a valid email id"
                                            );
                                        }else {
                                            e.target.setCustomValidity("");
                                        }
                                    }
                                    this.updateValue(e);
                                  }}
                                defaultValue={altEmail} />
                                {this.state?.inValid_alternateContactEmail &&
                                    <small className="fontRed">
                                        <b className="blgrperrorMsg">{this.state.inValid_alternateContactEmail}</b>
                                    </small>
                                }
                            </div>
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                <TextInput disabled={disableAll} type="text" className="bx--text-input bx--text__input"  id="requestorContactNo" name="requestorContactNo" labelText= "Contact No. of Requestor"  placeholder="Contact No. of Requester" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={requestorContactNo} required="required"  />
                            </div>
                            <div className="bx--col">
                                <TextInput  type="text" disabled={disableAll} className="bx--text-input bx--text__input"  id="technicalContactNo" name="technicalContactNo" labelText= "Technical Contact"  placeholder="Contact No. of Technical Contact" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={technicalContactNo} required="required" />
                            </div>
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                <TextInput type="text" disabled={disableAll} className="bx--text-input bx--text__input"  id="account" name="account" labelText= "Account"  placeholder="Account" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={account} required="required"  />
                            </div>
                            <div className="bx--col">
                            </div>
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                <Select className="labelFont " disabled={disableAll} id="reqGeo" name="reqGeo" labelText="Geo" defaultValue="" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} required="required"  >
                                    <SelectItem
                                        // selected={impactingEvent == true}
                                        value=""
                                        text="Choose an Option"
                                    />
                                   {itemsGeo}
                                </Select>
                            </div>
                            <div className="bx--col">
                                <Select className="labelFont " disabled={disableAll} id="reqMarket" name="reqMarket" labelText="Market" defaultValue="" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} required={this.state.required} >
                                    <SelectItem
                                        // selected={impactingEvent == true}
                                        value=""
                                        text="Choose an Option"
                                    />
                                    {itemsMarket}
                                </Select>
                            </div>
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                <Select className="labelFont " disabled={disableAll} id="supportType" name="supportType" labelText="Support Type(Channel)" defaultValue="" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} required="required"  >
                                    <SelectItem
                                        // selected={impactingEvent == true}
                                        value=""
                                        text="Choose an Option"
                                    />
                                    {itemssuport}
                                </Select>
                            </div>
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                {this.state?.maxLengthErr_shortDescription &&
                                    <small className="fontRed">
                                        <b className="blgrperrorMsg">{this.state.maxLengthErr_shortDescription}</b>
                                    </small>
                                }
                                <TextArea className="labelFont" disabled={disableAll} maxlength="300" cols={50} rows={2} labelText={<>Short Description <span className="specialCharacterLabel">(Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | ? ~ are not allowed)</span></>} placeholder="Short Description" onKeyUp={(e) => this.handleCharacterChange(e)} onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} name="shortDescription" defaultValue={shortDescription} required="required" />
                            </div>
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                {this.state?.maxLengthErr_description &&
                                    <small className="fontRed">
                                        <b className="blgrperrorMsg">{this.state.maxLengthErr_description}</b>
                                    </small>
                                }
                                <TextArea className="labelFont" disabled={disableAll} maxlength="1500"  cols={50} rows={5} labelText={<>Description <span className="specialCharacterLabel">(Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | ? ~ are not allowed)</span></>} placeholder="Description" onKeyUp={(e) => this.handleCharacterChange(e)} onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} name="description" defaultValue={description} required="required" />
                            </div>
                        </div>

                        <div className="bx--row">
                            <div className="bx--col">
                                <label for="startDate" className="bx--label">Assignment Start Date </label>
                                {this.state?.reqData?.reqUpdate &&
                                    <div className="divDTP">{startDate}</div>
                                }
                                <Datetime 
                                    onBlur={(e) => this.updateValue(e)}
                                    onChange={(e) => this.handleChange2(e)}
                                    name="startDate"
                                    // defaultValue={startDate}
                                    renderInput={ this.renderInput }
                                    placeholder={"Test"}
                                    dateFormat="DD/MM/YYYY" 
                                    timeFormat={false}
                                    initialValue={initialStartDate}
                                    // disable={disableAll}
                                />
                            </div>
                            <div className="bx--col">
                                <label for="startDate" className="bx--label">Assignment End Date</label>
                                {this.state?.reqData?.reqUpdate &&
                                    <div className="divDTP">{endDate}</div>
                                }
                                <Datetime 
                                    onBlur={(e) => this.updateValue(e)}
                                    onChange={(e) => this.handleChange1(e)}
                                    name="endDate"
                                    // defaultValue={endDate}
                                    renderInput={ this.renderInput }
                                    // isValidDate={this.checkIfSelectedDateIsValid}
                                    dateFormat="DD/MM/YYYY" 
                                    timeFormat={false}
                                    initialValue={initialEndDate}
                                />
                                {!this.state.isValidEndDate &&
                                    <small className="fontRed">
                                        <b className="blgrperrorMsg">{this.state.inValidDateDescription}</b>
                                    </small>
                                }
                            </div>
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                <div className="skillDivMain">
                                    <div>
                                        <Tabs scrollIntoView={false} className="test">
                                            {itemsSkill}
                                        </Tabs>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                <TextInput type="number" disabled={disableAll}  className="bx--text-input bx--text__input"  id="estimatedHours" name="estimatedHours" labelText= "Estimated Hours"  placeholder="Estimated Hours" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={estimatedHours} />
                            </div>
                            <div className="bx--col">
                            </div>
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                {this.state?.maxLengthErr_comments &&
                                    <small className="fontRed">
                                        <b className="blgrperrorMsg">{this.state.maxLengthErr_comments}</b>
                                    </small>
                                }
                                <TextArea className="labelFont" disabled={disableAll} maxlength="300"  cols={50} rows={5} labelText={<>Comments <span className="specialCharacterLabel">(Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | ? ~ are not allowed)</span></>} placeholder="Comments" onKeyUp={(e) => this.handleCharacterChange(e)} onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} name="comments" defaultValue={comments} />
                            </div>
                        </div>
                        {this.state?.reqData?.reqUpdate && 
                            <div className="bx--row">
                                <div className="paramsInlineDiv">
                                    <h4 className="bx--label paramsLabel">
                                    Resources
                                    </h4>
                                    {!disableResources &&
                                        <AddAlt32
                                            className="addParam"
                                            onClick={this.addParamField}
                                            style ={addResourceStyle}
                                        />
                                    }
                                </div>
                                <div className="rulesDivStyle" style={{ marginTop: "0", width: "100%" }} onChange={this.handleParam} onClick={this.handleParam} >
                                { this.state?.resourceEmail.map(
                                    (param, i) => param != undefined && (
                                        <div className="rulesSubDiv" key={i}>
                                        <TextInput id={"inputResource-" + i}  disabled={disableResources} defaultValue={this.state.resourceEmail[i]} name={i} className="bx--text-input bx--text__input" placeholder="Resource Email" />
                                        </div>
                                    )
                                )}
                                </div>
                            </div>
                        }
                        <div className="bx--row" style={{padding: "17px 13px"}}>
                            <div className="checkbox checkBoxDes">
                                <input type="checkbox" name="claimTerms" className="checkboxInput checkboxDisplayInline" onClick={ (event) => { this.handleCheckbox1('claimTerms', event) }} required="required" />
                                <label className="bx--checkbox-label-text checkboxClass">
                                    <strong>Claim Terms:</strong> I confirm that I will make available the need Claim Work Item Access
                                </label>
                            </div>  
                            <div className="checkbox checkBoxDes">
                                <input type="checkbox" name="complianceTerms" style={{width: "22px"}} className="checkboxInput checkboxDisplayInline" onClick={ (event) => { this.handleCheckbox2('complianceTerms', event) }} required="required" />
                                <label className="bx--checkbox-label-text checkboxClass">
                                    <strong>Compliance Terms:</strong> I consent to my information being collected and stored for the purpose of identifying community members in support of the TEAMIt Program. The data only retained for as long as the program is active.
                                </label>
                            </div> 
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                <Button kind="primary"
                                disabled={this.state.disableBtn_startDate == true || this.state.disableBtn_endDate == true || this.state.disableBtn_shortDescription == true || this.state.disableBtn_description == true || this.state.disableBtn_comments} 
                                tabIndex={0} type="submit" className="btnMarginExt" style={{marginbottom: '2%'}}>Submit </Button>
                            </div>
                        </div>
                        <div className="bx--row btnMarginExt">
                            <div className="bx--col">
                                {
                                    this.state['resErrMsg'] && 
                                    <small className="fontRed">
                                    <b className="blgrperrorMsg">{this.state.resErrMsg.validateReqSkillMsg}</b>
                                    </small>
                                }
                                {
                                    this.state['resErrMsg'] && 
                                    <small className="fontRed">
                                    <b className="blgrperrorMsg">{this.state.resErrMsg.validateReqDateMsg}</b>
                                    </small>
                                }
                                {
                                    this.state['resErrMsg'] && 
                                    <small className="fontRed">
                                    <b className="blgrperrorMsg">{this.state.resErrMsg.dateError}</b>
                                    </small>
                                }
                                {
                                    this.state['resErrMsg'] && 
                                    <small className="fontRed">
                                    <b className="blgrperrorMsg">{this.state.resErrMsg.resourceError}</b>
                                    </small>
                                }
                                {
                                    this.state['specialCharacterErr'] &&
                                    <small className="fontRed">
                                        <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                                    </small>
                                }
                            </div>
                        </div>
                    </div>
                    </Form> 
                </LazyLoad>
        );
    }
    renderInput( props, openCalendar, closeCalendar ){
        function clear(){
            props.onChange({target: {value: ''}});
        }
        return (
            <div>
                <input {...props} onChange={(e) => this.updateValue1(e)} name="endData" className="dtpStyle" />
            </div>
        );
    }
}
export default withRouter(ReqHome);