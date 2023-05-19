import React from 'react';
import ReactDOM from 'react-dom';
import { trackPromise } from "react-promise-tracker";
import {  Button,UnorderedList, ListItem, Form, TextInput, TextArea, Select, SelectItem  } from 'carbon-components-react';
import { Link, withRouter } from 'react-router-dom';
import { TrashCan32 } from "@carbon/icons-react";
import DRForm from './DRForm';
import LazyLoad from "react-lazyload";
import { validate } from '../../validation/validate.js';
class DRHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = (
            {
                impactingEvent1: false,
                disableBtn: false
            }
        );
        this.state.filterText = "";
        this.state.id = 1;
        this.state.products = [
        ];
        this.state.filterTextCE = "";
        this.state.escalations = [
        ];
    }
    componentDidMount() {
        const search = this.props.location.search;
        const recordId = new URLSearchParams(search).get("id");
        this.setState({recordId: recordId})
        trackPromise(
            fetch("/mui/getCIOUserData?id="+recordId)
            .then((res) => {
                return res.json();
            })
            .then((cioUserData) => {
              var countryData = [];
              if(cioUserData.cioUserData.CIOUserData){
                countryData = Object.values(cioUserData.cioUserData.CIOUserData.geoCountryGrp);
              }else{                
                countryData = cioUserData.cioUserData.countryListToUI.split(",");
              }   
                var countryDataArr = countryData.flat();
                var formOptionCountry = '';
                const itemsCountry = [];
                for (var i = 0; i < countryDataArr.length; i++) {
                    formOptionCountry = (
                      <option
                        className="bx--select-option"
                        defaultValue={countryDataArr[i]}
                      >
                        {countryDataArr[i]}
                      </option>
                    );
                    itemsCountry.push(formOptionCountry);
                }
                this.setState({ cioUserData:cioUserData, itemsCountry: itemsCountry ,countryData:countryData });
            })
        );
    }
    handleUserInputCE(filterTextCE) {
        this.setState({filterTextCE: filterTextCE});
      };
      handleRowDelCE(escalation) {
        var index = this.state.escalations.indexOf(escalation);
        this.state.escalations.splice(index, 1);
        this.setState(this.state.escalations);
      };
    
      handleAddEventCE(evt) {
        var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
        var escalation = {
            id: id,
            country: '',
            customers: '',
            accountTeamContact: '',
            CEstatus: '',
            CEsummary: '',
            ksatHelp: '',
            incidentDeacription: '',
            ksatContactInfo: '',
            // TierofIncident: ''
        }
        this.state.escalations.push(escalation);
        this.setState(this.state.escalations);
    
      }
    
      handleEscalationTable(evt) {
        var itemCE = {
          id: evt.target.id,
          name: evt.target.name,
          value: evt.target.value
        };
    var escalations = this.state.escalations.slice();
      var newescalations = escalations.map(function(escalation) {
    
        for (var key in escalation) {
          if (key == itemCE.name && escalation.id == itemCE.id) {
            escalation[key] = itemCE.value;
    
          }
        }
        return escalation;
      });
        this.setState({escalations:newescalations});
      };
    handleUserInput(filterText) {
        this.setState({filterText: filterText});
      };
      handleRowDel(product) {
        var index = this.state.products.indexOf(product);
        this.state.products.splice(index, 1);
        this.setState(this.state.products);
      };
    
      handleAddEvent(evt) {
        var id = ( + new Date() + Math.floor(Math.random() * 999999)).toString(36);
        var product = {
            id: id,
            country: '',
            customers: '',
            accountTeamContact: '',
            mistatus: '',
            misummary: '',
            ksatHelp: '',
            incidentDeacription: '',
            ksatContactInfo: '',
            tierOfIncident: ''
        }
        this.state.products.push(product);
        this.setState(this.state.products);
    
      }
      
      handleProductTable(evt) {
        var item = {
          id: evt.target.id,
          name: evt.target.name,
          value: evt.target.value
        };
        var products = this.state.products.slice();
        var newProducts = products.map(function(product) {
    
        for (var key in product) {
          if (key == item.name && product.id == item.id) {
            product[key] = item.value;
    
          }
        }
        return product;
      });
        this.setState({products:newProducts});
      };
    handleInputChange = (e) => {
        if (
            (e.target.value &&
            e.target.value.includes("script") &&
            e.target.value.includes("<")) ||
            e.target.value.includes(">")
        ){
            this.setState({
                ["inValid_" + e.target.name]: "Invalid Input.",
            });
            return;
        }
        this.setState({
            [e.target.name]: e.target.value,
        });
    };
    handleCharacterChange = (e) => {
        var maxLength = e.target.getAttribute("maxlength")
        if(e.target.name == "significantEventDescription"){
            if( (maxLength - (e.target.value.length) - 2) < 0 ){
                this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: 0"})
            }else{
                this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: " + (maxLength - (e.target.value.length) - 2)})
            }
            if(e.target.value.length >= 1501){
                this.setState({disableBtnSE: true})
                this.setState({["maxLengthErr_" + e.target.name]: "You have reached the maximum limit of characters allowed"})
            }else{
                this.setState({disableBtnSE: false})
                this.setState({["maxLengthErr_" + e.target.name]: ""})
            }
        }
        if(this.state?.escalations[0]?.ksatHelp == "yes"){
            if(e.target.name == "incidentDeacription"){
                if (e.target.getAttribute("data-value") == "ceData"){
                    if( maxLength - (e.target.value.length) - 1 < 0 ){
                        this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: 0"})
                    }else{
                        this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: " + (maxLength - (e.target.value.length) - 2)})
                    }
                    // this.setState({["maxLengthLimit_" + e.target.name+ "CE"]: "Characters left: " + (maxLength - e.target.value.length)})
                    if(e.target.value.length >= 1501){
                        this.setState({disableBtnKSATCE: true})
                        this.setState({["maxLengthErr_" + e.target.name + "CE"]: "You have reached the maximum limit of characters allowed for Incident Description"})
                    }else{
                        this.setState({disableBtnKSATCE: false})
                        this.setState({["maxLengthErr_" + e.target.name + "CE"]: ""})
                    }
                }
            }
        }
        if(this.state?.products[0]?.ksatHelp == "yes"){
            if(e.target.name == "incidentDeacription" && e.target.value){
                if (e.target.getAttribute("data-value") == "miData"){
                    if( maxLength - (e.target.value.length) - 1 < 0 ){
                        this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: 0"})
                    }else{
                        this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: " + (maxLength - (e.target.value.length) - 2)})
                    }
                    // this.setState({["maxLengthLimit_" + e.target.name+ "MI"]: "Characters left: " + (maxLength - e.target.value.length)})
                    if(e.target.value.length >= 1501){
                        this.setState({disableBtnKSATMI: true})
                        this.setState({["maxLengthErr_" + e.target.name + "MI"]: "You have reached the maximum limit of characters allowed for Incident Description"})
                    }else{
                        this.setState({disableBtnKSATMI: false})
                        this.setState({["maxLengthErr_" + e.target.name + "MI"]: ""})
                    }
                }
            }
        }
        if(e.target.name == "misummary"){
            if( maxLength - (e.target.value.length) - 1 < 0 ){
                this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: 0"})
            }else{
                this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: " + (maxLength - (e.target.value.length) - 2)})
            }
            // this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: " + (maxLength - e.target.value.length)})
            if(e.target.value.length >= 1501){
                this.setState({disableBtnMISummary: true})
                this.setState({["maxLengthErr_" + e.target.name]: "You have reached the maximum limit of characters allowed for MI Summary"})
            }else{
                this.setState({disableBtnMISummary: false})
                this.setState({["maxLengthErr_" + e.target.name]: ""})
            }
        }
        
        if(e.target.name == "CEsummary"){
            if( maxLength - (e.target.value.length) - 1 < 0 ){
                this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: 0"})
            }else{
                this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: " + (maxLength - (e.target.value.length) - 2)})
            }
            // this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: " + (maxLength - e.target.value.length)})
            if(e.target.value.length >= 1501){
                this.setState({disableBtnCESummary: true})
                this.setState({["maxLengthErr_" + e.target.name]: "You have reached the maximum limit of characters allowed for Client Escalation"})
            }else{
                this.setState({disableBtnCESummary: false})
                this.setState({["maxLengthErr_" + e.target.name]: ""})
            }
        }
        if(e.target.name == "incidentDescriptionSE"){
            if( maxLength - (e.target.value.length) - 2 < 0 ){
                this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: 0"})
            }else{
                this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: " + (maxLength - (e.target.value.length) - 2)})
            }
            // this.setState({["maxLengthLimit_" + e.target.name]: "Characters left: " + (maxLength - e.target.value.length)})
            if(e.target.value.length >= 1501){
                this.setState({disableBtnKSATSE: true})
                this.setState({["maxLengthErr_" + e.target.name]: "You have reached the maximum limit of characters allowed"})
            }else{
                this.setState({disableBtnKSATSE: false})
                this.setState({["maxLengthErr_" + e.target.name]: ""})
            }
        }

    };
    handleSelectImapactingevent = (e) => {
        if (
            (e.target.value &&
            e.target.value.includes("script") &&
            e.target.value.includes("<")) ||
            e.target.value.includes(">")
        ){
            this.setState({
                ["inValid_" + e.target.name]: "Invalid Input.",
            });
            return;
        }
        this.setState({
            [e.target.name]: e.target.value,
        });
        if(e.target.value == "Yes"){
            this.setState({significantEvent: "No"})
            this.setState({ksatHelpForSE: "No"})
            this.setState({impactingEvent: "Yes"})
        }else{
            this.setState({impactingEvent: "No"})
            this.setState({clientEscalation: ""})
            this.setState({majorIncident: ""})
        }
    };
    handleSelectMI = (e) => {
        if (
            (e.target.value &&
            e.target.value.includes("script") &&
            e.target.value.includes("<")) ||
            e.target.value.includes(">")
        ){
            this.setState({
                ["inValid_" + e.target.name]: "Invalid Input.",
            });
            return;
        }
        this.setState({
            [e.target.name]: e.target.value,
        });
        if(e.target.value == "Yes"){
            this.setState({clientEscalation: "no"})
        }else{
            this.setState({clientEscalation: ""})
        }
    };
    handleSelectCEWithMI = (e) => {
        if (
            (e.target.value &&
            e.target.value.includes("script") &&
            e.target.value.includes("<")) ||
            e.target.value.includes(">")
        ){
            this.setState({
                ["inValid_" + e.target.name]: "Invalid Input.",
            });
            return;
        }
        this.setState({
            [e.target.name]: e.target.value,
        });
        if(e.target.value == "yes"){
            this.setState({clientEscalation : "yes"})
        }
    };
    handleSelectCE = (e) => {
        if (
            (e.target.value &&
            e.target.value.includes("script") &&
            e.target.value.includes("<")) ||
            e.target.value.includes(">")
        ){
            this.setState({
                ["inValid_" + e.target.name]: "Invalid Input.",
            });
            return;
        }
        this.setState({
            [e.target.name]: e.target.value,
        });
        if(e.target.value == "yes"){
            this.setState({clientEscalation : "yes"})
        }
    };
    handleSelectSE = (e) => {
        if (
            (e.target.value &&
            e.target.value.includes("script") &&
            e.target.value.includes("<")) ||
            e.target.value.includes(">")
        ){
            this.setState({
                ["inValid_" + e.target.name]: "Invalid Input.",
            });
            return;
        }
        this.setState({
            maxLengthLimit_significantEventDescription:"",
            maxLengthLimit_incidentDescriptionSE: ""
        });
        this.setState({
            [e.target.name]: e.target.value,
        });
        if(e.target.value == "Yes"){
            this.setState({significantEvent: "Yes"})
        }else{
            this.setState({significantEvent: "No"})
            this.setState({clientEscalation: ""})
            this.setState({majorIncident: ""})
            
        }
    };
    handleSelectKSATSE = (e) => {
        if (
            (e.target.value &&
            e.target.value.includes("script") &&
            e.target.value.includes("<")) ||
            e.target.value.includes(">")
        ){
            this.setState({
                ["inValid_" + e.target.name]: "Invalid Input.",
            });
            return;
        }
        this.setState({
            [e.target.name]: e.target.value,
        });
    };
    updateValue = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };
    formSubmit= (e) => {
        e.preventDefault();
        var dataToSave = {
            impactingEvent: this.state.impactingEvent,
            majorIncidentPresent: this.state.majorIncident,
            clientEscalationWithMI:this.state.clientEscalation,
            majorIncident: this.state.products,
            clientEscalation: this.state.escalations,
            significantEvent: {significantEvent: this.state.significantEvent,
                                significantEventDescription: this.state.significantEventDescription,
                                ksatHelpForSE: this.state.ksatHelpForSE,
                                ksatContactSE: this.state.ksatContactSE,
                                incidentDescriptionSE: this.state.incidentDescriptionSE,    
                            },    
            reportId: this.state.recordId
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
                fetch('/mui/saveCIOUserData' , {
                    method: "POST",
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(dataToSave)
                })
                .then((result) => {
                    if (result.status === 404 || result.status === 400 || result.status === 500)  {
                        result.json().then((object)=> {
                            this.setState({resErrMsg: object.CIOUserDataErr});
                        })
                    } else if (result.status === 409) {
                        result.json().then((object)=> {
                            this.setState({resErrMsg: object.CIOUserDataErr});
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
    }
    render() {
        var stateObj = this.state;
        var showMajorIncident;
        var showsignificantEvent;
        var miFlow, ksatHelpDiv, moreMIDiv, hideMiDiv, showCEDiv, ceDiv, showSignicantDiv, ksatHelpDivSE;
        var dataPresentCheck = true;
        var allowedEmailsCheck = true;
        var dataPresentCheckMsg = '';
        var dayFormat = '';
        var labelText = '';
        var allowedEmailsCheckMsg = '';
        if(this.state?.cioUserData?.cioUserData?.dayFormat){
            dayFormat = stateObj.cioUserData.cioUserData.dayFormat;
            labelText = "Where there any impacting events in your country in last "+dayFormat+" ?";
        }else{
            labelText = "Where there any impacting events in your country ?";
        }
        if(this?.state?.cioUserData){
            if(this.state?.cioUserData?.cioUserData?.dataPresentCheck == true){
                dataPresentCheck = true;
                dataPresentCheckMsg = ""
            }else{
                var weekday = stateObj.cioUserData.cioUserData.weekDayName
                var countryList = stateObj.cioUserData.cioUserData.countryListToUI
                dataPresentCheck = false; //Show
                dataPresentCheckMsg = "Data is already submitted for "+ countryList + ", for " +weekday ;
            }
        }
        //Temp Comenting the code for testing
        if(this.state?.cioUserData?.cioUserData?.allowedEmailsCheck == false){
            allowedEmailsCheck = false; //Show
            allowedEmailsCheckMsg = "Not authorised to view this link."
        }else{
            allowedEmailsCheck = true;
            allowedEmailsCheckMsg = ""
        }
        // allowedEmailsCheck = true;
        // allowedEmailsCheckMsg = ""
        // remove above 2 lines GR

        return (
            <div className="mainClassForm">
                {dataPresentCheck == false  && 
                    <div className="noAccessDiv">
                        {dataPresentCheckMsg}
                    </div>
                }
                {allowedEmailsCheck == false && 
                    <div className="noAccessDiv">
                        {allowedEmailsCheckMsg}
                    </div>
                }
                {dataPresentCheck && allowedEmailsCheck && 
                <LazyLoad>

                    <Form onSubmit={this.formSubmit}>
                    <Select className="labelFont widthProp" id="impactingEvent" name="impactingEvent" labelText={labelText} defaultValue="" onChange={(e) => this.handleSelectImapactingevent(e)}  required="required" >
                        <SelectItem
                            // selected={impactingEvent == true}
                            value=""
                            text="Choose an Option"
                        />
                        <SelectItem
                            // selected={impactingEvent == true}
                            value="Yes"
                            text="Yes"
                        />
                        <SelectItem
                            // selected={impactingEvent == false}
                            value="No"
                            text="No"
                        />
                    </Select>
                    {this.state.impactingEvent == "Yes" &&
                        <Select className="labelFont widthProp" id="majorIncident" name="majorIncident" labelText="Major Incidents?" defaultValue="" onChange={(e) => this.handleSelectMI(e)} required="required" >
                            <SelectItem
                                // selected={impactingEvent == true}
                                value=""
                                text="Choose an Option"
                            />
                            <SelectItem
                                // selected={impactingEvent == true}
                                value="Yes"
                                text="Yes"
                            />
                            <SelectItem
                                // selected={impactingEvent == false}
                                value="No"
                                text="No"
                            />
                        </Select>
                    }
                    {this.state.majorIncident == "Yes" &&
                        <div>
                            {this.state?.maxLengthErr_misummary &&
                                <small className="fontRed">
                                    <b className="blgrperrorMsg">{this.state.maxLengthErr_misummary}</b>
                                </small>
                            }
                            <br></br>
                            <br></br>
                            {this.state?.maxLengthErr_incidentDeacriptionMI &&
                                <small className="fontRed">
                                    <b className="blgrperrorMsg">{this.state.maxLengthErr_incidentDeacriptionMI}</b>
                                </small>
                            }
                            
                            <ProductTable onHandleCharacter = {this.handleCharacterChange.bind(this)} onProductTableUpdate={this.handleProductTable.bind(this)} onRowAdd={this.handleAddEvent.bind(this)} state={this.state} miData="miData" countryOption={this.state.itemsCountry} recordId={this.state.recordId} onRowDel={this.handleRowDel.bind(this)} products={this.state.products} filterText={this.state.filterText}/>
                            {
                            this.state.invalidMI &&
                            <small className="fontRed">
                                <b className="blgrperrorMsg">Fill all required fields</b>
                            </small>
                            }
                            {
                            this.state.validAccContact &&
                            <small className="fontRed">
                                <b className="fontNormal">{this.state.validAccContactErr}</b>
                            </small>
                            }
                            <Select className="labelFont widthProp" id="clientEscalation" name="clientEscalation" labelText="Client Escalation?" defaultValue="" onChange={(e) => this.handleSelectCEWithMI(e)}  required="required" >
                                <SelectItem
                                    // selected={impactingEvent == true}
                                    value=""
                                    text="Choose an Option"
                                />
                                <SelectItem
                                    // selected={impactingEvent == true}
                                    value="yes"
                                    text="Yes"
                                />
                                <SelectItem
                                    // selected={impactingEvent == false}
                                    value="no"
                                    text="No"
                                />
                            </Select>
                        </div>
                    }
                    {this.state.majorIncident == "No" &&
                    <div>
                        <Select className="labelFont widthProp" id="clientEscalation" name="clientEscalation" labelText="Client Escalation ?" defaultValue="" onChange={(e) => this.handleSelectCE(e)}  required="required" >
                        <SelectItem
                            // selected={impactingEvent == true}
                            value=""
                            text="Choose an Option"
                        />
                        <SelectItem
                            // selected={impactingEvent == true}
                            value="yes"
                            text="Yes"
                        />
                        <SelectItem
                            // selected={impactingEvent == false}
                            value="no"
                            text="No"
                        />
                    </Select>
                    </div>
                    }
                    
                    {this.state.impactingEvent == "No" &&
                        <Select className="labelFont widthProp" id="significantEvent" name="significantEvent" labelText="Any other significant events that you would like to share with larger Kyndryl?" defaultValue="" onChange={(e) => this.handleSelectSE(e)} required="required" >
                            <SelectItem
                                // selected={impactingEvent == true}
                                value=""
                                text="Choose an Option"
                            />
                            <SelectItem
                                // selected={impactingEvent == true}
                                value="Yes"
                                text="Yes"
                            />
                            <SelectItem
                                // selected={impactingEvent == false}
                                value="No"
                                text="No"
                            />
                        </Select>
                    }
                    {this.state.significantEvent == "Yes" &&
                    <div>
                        {this.state?.maxLengthLimit_significantEventDescription &&
                            <small className="fontRed">
                                <b className="fontNormal">{this.state.maxLengthLimit_significantEventDescription}</b>
                            </small>
                        }
                        <TextArea className="labelFont widthProp" maxlength="1502" style={{marginBottom: "16px"}} cols={50} rows={5} id="significantEventDescription" 
                        labelText={<>Significant Event Description <span className="specialCharacterLabel">(Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | ? ~ are not allowed)</span></>}
                        placeholder="Significant Event Description" onKeyUp={(e) => this.handleCharacterChange(e)} onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} name="significantEventDescription" defaultValue='' required="required" />
                        {/* <span className="specialCharacterLabel noLabelInput">(Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | ? ~ are not allowed)</span> */}
                        {this.state?.maxLengthErr_significantEventDescription &&
                            <small className="fontRed">
                                <b className="blgrperrorMsg">{this.state.maxLengthErr_significantEventDescription}</b>
                            </small>
                        }
                        {/* <TextInput className="bx--text-input bx--text__input widthProp" id="significantEventContact" name="significantEventContact" labelText= "Contact Information"  placeholder="Contact Information" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue='' /> */}
                        <Select className="labelFont widthProp"  id="ksatHelpForSE" name="ksatHelpForSE" labelText="Do you need any help? - Contact KSAT" defaultValue="" onChange={(e) => this.handleSelectKSATSE(e)}  required="required" >
                            <SelectItem
                                // selected={impactingEvent == true}
                                value=""
                                text="Choose an Option"
                            />
                            <SelectItem
                                // selected={impactingEvent == true}
                                value="Yes"
                                text="Yes"
                            />
                            <SelectItem
                                // selected={impactingEvent == false}
                                value="No"
                                text="No"
                            />
                        </Select>
                        {this.state.ksatHelpForSE == "Yes" &&
                            <div>
                                {this.state?.maxLengthLimit_incidentDescriptionSE &&
                            <small className="fontRed">
                                <b className="fontNormal">{this.state.maxLengthLimit_incidentDescriptionSE}</b>
                            </small>
                        }
                            <TextArea className="labelFont widthProp" maxlength="1502" style={{marginBottom: "16px"}} cols={50} rows={5} id="incidentDescriptionSE" labelText={<>Incident Description <span className="specialCharacterLabel">(Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | ? ~ are not allowed)</span></>} placeholder="Incident Description" onKeyUp={(e) => this.handleCharacterChange(e)}  onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} name="incidentDescriptionSE" defaultValue='' required="required" />
                        {this.state?.maxLengthErr_incidentDescriptionSE &&
                            <small className="fontRed">
                                <b className="blgrperrorMsg">{this.state.maxLengthErr_incidentDescriptionSE}</b>
                            </small>
                        }
                                <TextInput type="email" className="bx--text-input bx--text__input widthProp"  id="ksatContactSE" name="ksatContactSE" labelText= "Contact Email"  placeholder="Contact Email" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue='' required="required" />
                            </div>
                        }
                    </div>
                    }
                    {this.state.clientEscalation == "yes" &&
                        <div>
                            {this.state?.maxLengthErr_CEsummary &&
                                <small className="fontRed">
                                    <b className="blgrperrorMsg">{this.state.maxLengthErr_CEsummary}</b>
                                </small>
                            }
                            <br></br>
                            <br></br>
                            {this.state?.maxLengthErr_incidentDeacriptionCE &&
                                <small className="fontRed">
                                    <b className="blgrperrorMsg">{this.state.maxLengthErr_incidentDeacriptionCE}</b>
                                </small>
                            }
                            <EscalationTable onHandleCharacter = {this.handleCharacterChange.bind(this)} onEscalationTableUpdate={this.handleEscalationTable.bind(this)} onRowAddCE={this.handleAddEventCE.bind(this)} state={this.state} countryOption={this.state.itemsCountry} recordId={this.state.recordId} onRowDelCE={this.handleRowDelCE.bind(this)} escalations={this.state.escalations} filterTextCE={this.state.filterTextCE}/>
                            {
                                this.state.invalidCE &&
                                <small className="fontRed">
                                    <b className="blgrperrorMsg">Fill all required fields</b>
                                </small>
                            }
                            {
                            this.state.validAccContactCE &&
                            <small className="fontRed">
                                <b className="blgrperrorMsg">{this.state.validAccContactCEErr}</b>
                            </small>
                            }
                        </div>
                    }
                    <div>
                    {this.state?.resErrMsg?.dataPresentErr &&
                        <small className="fontRed">
                            <b className="blgrperrorMsg">{this.state.resErrMsg.dataPresentErr}</b>
                        </small>
                    }
                    {this.state?.resErrMsg?.noMIErr &&
                        <small className="fontRed">
                            <b className="blgrperrorMsg">{this.state.resErrMsg.noMIErr}</b>
                        </small>
                    }
                        <br></br>
                        <br></br>
                    {this.state?.resErrMsg?.noCEErr &&
                        <small className="fontRed">
                            <b className="blgrperrorMsg">{this.state.resErrMsg.noCEErr}</b>
                        </small>
                    }

                    </div>
                    <br></br>
                    {
                        this.state['specialCharacterErr'] &&
                        <small className="fontRed">
                            <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                        </small>
                    }
                    <br></br>
                    <Button
                        kind="primary"
                        tabIndex={0}
                        type="submit"
                        disabled={this.state.disableBtnSE == true || this.state.disableBtnKSATCE == true || this.state.disableBtnKSATMI == true || this.state.disableBtnMISummary == true || this.state.disableBtnCESummary == true || this.state.disableBtnKSATSE == true}
                    >
                        Submit
                    </Button>
                    </Form> 
                    </LazyLoad>
                }
                
            </div>
        );
    }
}
  
  class ProductTable extends React.Component {
  
    render() {
      var onProductTableUpdate = this.props.onProductTableUpdate;
      var onHandleCharacter = this.props.onHandleCharacter;
      var rowDel = this.props.onRowDel;
      var filterText = this.props.filterText;
      var rowState = this.props.state;
      var miData = this.props.miData;
      var product = this.props.products.map(function(product) {
        if (product.customers.indexOf(filterText) === -1) {
          return;
        }
        return (<ProductRow onHandleCharacter={onHandleCharacter} onProductTableUpdate={onProductTableUpdate} product={product} stateRow={rowState} miData={miData} onDelEvent={rowDel.bind(this)} key={product.id}/>)
      });
      return (
        <div>
        <a type="button" onClick={this.props.onRowAdd} className="btn btn-success pull-right btnTern">Add Major Incident</a>
        <p className="idDivTitleNoteDR">*&nbsp;If multiple customers are impacted by 1 Major Incident, add one customer per line.</p>
        <p className="idDivTitleNoteDR">*&nbsp;Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | \ ? ~ are not allowed.</p>
        <table className="table table-bordered tableGrid tableOverflow">
            <thead>
              <tr>
                <th className="thDataGrid tdWidthProp">Country</th>
                <th className="thDataGrid tdWidthProp">Customer/s</th>
                <th className="thDataGrid tdWidthProp">Tier of Incident</th>
                <th className="thDataGrid tdWidthProp">Account Team Contact Email</th>
                <th className="thDataGrid tdWidthProp">MI Status</th>
                <th className="thDataGrid tdWidthPropTextArea">MI Summary</th>
                <th className="thDataGrid tdWidthProp extraWidth">Do you need any help? Contact KSAT</th>
                <th className="thDataGrid noBackground"></th>
              </tr>
            </thead>
  
            <tbody>
              {product}
  
            </tbody>
  
          </table>
        </div>
      );
  
    }
  
  }
  
  class ProductRow extends React.Component {
    onDelEvent() {
      this.props.onDelEvent(this.props.product);
  
    }
    render() {
      return (
        <tr className="eachRow">
            <EditableCellSelectCountry
          onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
          type: "country",
          state: this.props.stateRow,
          value: this.props.product.summary,
          id: this.props.product.id
            }}/>
          <EditableCellTextAreaCustomer onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
            type: "customers",
            value: this.props.product.price,
            id: this.props.product.id
          }}/>
          <EditableCellSelectTI
          onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
          type: "tierOfIncident",
          value: this.props.product.summary,
          id: this.props.product.id
            }}/>
          <EditableCell onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
            type: "accountTeamContact",
            value: this.props.product.qty,
            id: this.props.product.id
          }}/>
          <EditableCellSelect
          onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
          type: "mistatus",
          value: this.props.product.summary,
          id: this.props.product.id
            }}/>
          <EditableCellTextArea
          onHandleCharacter ={this.props.onHandleCharacter}
          onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
              type: "misummary",
              value: this.props.product.summary,
              id: this.props.product.id
            }}/>
            <div className="tdStyleGrid">
            <EditableCellSelectKSAT
                onHandleCharacter ={this.props.onHandleCharacter}
                onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
                type: "ksatHelp",
                value: this.props.product.summary,
                id: this.props.product.id
            }}/>
             {this.props.product.ksatHelp == "yes" && 
                <div className="externalLabelMain">
                    <div className="externalLabelDiv">
                        <label for={this.props.product.id} class="bx--label externalLabel">Contact Email</label>
                        <EditableCellKSAT onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
                        type: "ksatContactInfo",
                        placeholder: "Contact Email",
                        value: this.props.product.summary,
                        id: this.props.product.id
                        }}/>
                    </div>
                    <div className="externalLabelDiv">
                        <label for={this.props.product.id} class="bx--label externalLabel">Incident Description</label>
                        <EditableCellKSATTextArea onHandleCharacter ={this.props.onHandleCharacter} onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
                        type: "incidentDeacription",
                        miData: this.props.miData,
                        placeholder: "Incident Description",
                        value: this.props.product.summary,
                        id: this.props.product.id
                        }}/>
                    </div> 
                </div>
            }
            {this.props.product.ksatHelp == "no" && 
                <p></p>
            }
            </div>
          <td className="del-cell">
            <TrashCan32 onClick={this.onDelEvent.bind(this)} className="delSvg" />
          </td>
        </tr>
      );
  
    }
  
  }
  class EscalationTable extends React.Component {

    render() {
      var onEscalationTableUpdate = this.props.onEscalationTableUpdate;
      var onHandleCharacter = this.props.onHandleCharacter;
      var rowDelCE = this.props.onRowDelCE;
      var filterTextCE = this.props.filterTextCE;
      var rowState = this.props.state;
      var escalation = this.props.escalations.map(function(escalation) {
        if (escalation.customers.indexOf(filterTextCE) === -1) {
          return;
        }
        return (<EscalationRow onHandleCharacter={onHandleCharacter} onEscalationTableUpdate={onEscalationTableUpdate} stateRow={rowState} escalation={escalation} onDelEventCE={rowDelCE.bind(this)} key={escalation.id}/>)
      });
      return (
        <div>
  
        <a type="button" onClick={this.props.onRowAddCE} className="btn btn-success pull-right btnTern">Add Client Escalation</a>
        <p className="idDivTitleNoteDR">*&nbsp;If multiple customers are impacted by 1 Client Escalation, add one customer per line.</p>
        <p className="idDivTitleNoteDR">*&nbsp;Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | \ ? ~ are not allowed.</p>
          <table className="table table-bordered tableGrid tableOverflow">
            <thead>
            <tr>
                <th className="thDataGrid tdWidthProp">Country</th>
                <th className="thDataGrid tdWidthProp">Customer/s</th>
                {/* <th className="thDataGrid tdWidthProp">Tier of Incident</th> */}
                <th className="thDataGrid tdWidthProp">Account Team Contact Email</th>
                <th className="thDataGrid tdWidthProp">Client Escalation Status</th>
                <th className="thDataGrid tdWidthPropTextArea">Client Escalation Summary</th>
                <th className="thDataGrid tdWidthProp extraWidth">Do you need any help? Contact KSAT</th>
                <th className="thDataGrid noBackground"></th>
              </tr>
            </thead>
  
            <tbody>
              {escalation}
  
            </tbody>
  
          </table>
        </div>
      );
  
    }
  
  }
  
  class EscalationRow extends React.Component {
    onDelEventCE() {
      this.props.onDelEventCE(this.props.escalation);
  
    }
    render() {
  
      return (
        <tr className="eachRow">
        <EditableCellSelectCOuntryCE
      onEscalationTableUpdate={this.props.onEscalationTableUpdate} cellDataCE={{
      type: "country",
      state: this.props.stateRow,
      value: this.props.escalation.summary,
      id: this.props.escalation.id
        }}/>
      <EditableCellTextAreaCustomerCE onEscalationTableUpdate={this.props.onEscalationTableUpdate} cellDataCE={{
        type: "customers",
        placeHolder: "testing",
        value: this.props.escalation.price,
        id: this.props.escalation.id
      }}/>
      {/* <EditableCellSelectCETI
      onEscalationTableUpdate={this.props.onEscalationTableUpdate} cellDataCE={{
      type: "TierofIncident",
      value: this.props.escalation.summary,
      id: this.props.escalation.id
        }}/> */}
      <EditableCellCE onEscalationTableUpdate={this.props.onEscalationTableUpdate} cellDataCE={{
        type: "accountTeamContact",
        value: this.props.escalation.qty,
        id: this.props.escalation.id
      }}/>
      <EditableCellSelectCE
      onEscalationTableUpdate={this.props.onEscalationTableUpdate} cellDataCE={{
      type: "CEstatus",
      value: this.props.escalation.summary,
      id: this.props.escalation.id
        }}/>
      <EditableCellTextAreaCE
      onHandleCharacter ={this.props.onHandleCharacter}
      onEscalationTableUpdate={this.props.onEscalationTableUpdate} cellDataCE={{
          type: "CEsummary",
          value: this.props.escalation.summary,
          id: this.props.escalation.id
        }}/>
        <div className="tdStyleGrid">
        <EditableCellSelectKSATCE
            onHandleCharacter ={this.props.onHandleCharacter}
            onEscalationTableUpdate={this.props.onEscalationTableUpdate} cellDataCE={{
            type: "ksatHelp",
            value: this.props.escalation.summary,
            id: this.props.escalation.id
        }}/> 
         {this.props.escalation.ksatHelp == "yes" && 
            <div className="externalLabelMain">
                <div className="externalLabelDiv">
                    <label for={this.props.escalation.id} class="bx--label externalLabel">Contact Email</label>
                    <EditableCellKSATCE onEscalationTableUpdate={this.props.onEscalationTableUpdate} cellDataCE={{
                    type: "ksatContactInfo",
                    placeholder: "Contact Email",
                    value: this.props.escalation.summary,
                    id: this.props.escalation.id
                    }}/>
                </div>
                <div className="externalLabelDiv">
                    <label for={this.props.escalation.id} class="bx--label externalLabel">Incident Description</label>
                    <EditableCellKSATTextAreaCE onHandleCharacter ={this.props.onHandleCharacter} onEscalationTableUpdate={this.props.onEscalationTableUpdate} cellDataCE={{
                    type: "incidentDeacription",
                    placeholder: "Incident Description",
                    value: this.props.escalation.summary,
                    id: this.props.escalation.id
                    }}/>
                </div> 
            </div>
        }
        {this.props.escalation.ksatHelp == "no" && 
            <p></p>
        }
        </div>
      <td className="del-cell">
        <TrashCan32 onClick={this.onDelEventCE.bind(this)} className="delSvg" />
      </td>
    </tr>
      );
  
    }
  
  }
  class EditableCellCE extends React.Component {
    
      render() {
        return (
          <td className="tdStyleGrid">
            <input className="noStyle" type='email' placeholder="Account Team Contact" name={this.props.cellDataCE.type} id={this.props.cellDataCE.id} value={this.props.cellDataCE.value} onChange={this.props.onEscalationTableUpdate} required="required" />
          </td>
        );
    
      }
    
    }
    class EditableCellEmptyCE extends React.Component {
    
      render() {
        return (
          <p></p>
        );
    
      }
    
    }
    class EditableCellKSATCE extends React.Component {
    
      render() {
        return (
          // <td className="tdStyleGrid">
            <input className="noStyle extraMargin extraLabelProp" type='email' name={this.props.cellDataCE.type} id={this.props.cellDataCE.id} value={this.props.cellDataCE.value} onChange={this.props.onEscalationTableUpdate} required="required" />
          // </td>
        );
    
      }
    
    }
    class EditableCellKSATTextAreaCE extends React.Component {
        
      render() {
        return (
          <textarea className="noStyle extraMargin externalTextArea" maxlength="1502" rows="2" data-value="ceData" name={this.props.cellDataCE.type} id={this.props.cellDataCE.id} value={this.props.cellDataCE.value} onKeyUp={this.props.onHandleCharacter} onChange={this.props.onEscalationTableUpdate} required="required" >
          </textarea>
        );
    
      }
    
    }
    class EditableCellTextAreaCE extends React.Component {
  
      render() {
        return (
          <td className="tdStyleGrid">
            <textarea className="noStyle textAreaStyle" maxlength="1502" placeholder="Enter Client Escalation Summary" rows="2" name={this.props.cellDataCE.type} id={this.props.cellDataCE.id} value={this.props.cellDataCE.value} onKeyUp={this.props.onHandleCharacter} onChange={this.props.onEscalationTableUpdate} required="required" >
              </textarea>
          </td>
        );
    
      }
    
    }
    class EditableCellTextAreaCustomerCE extends React.Component {
  
      render() {
        return (
          <td className="tdStyleGrid">
            <textarea className="noStyle textAreaStyle" maxlength="1502" placeholder="Enter Customer/s" rows="2" name={this.props.cellDataCE.type} id={this.props.cellDataCE.id} value={this.props.cellDataCE.value} onChange={this.props.onEscalationTableUpdate} required="required" >
              </textarea>
          </td>
        );
    
      }
    
    }
    class EditableCellSelectCE extends React.Component {
  
      render() {
        return (
          <td className="tdStyleGrid">
            <select className="noStyle" name={this.props.cellDataCE.type} id={this.props.cellDataCE.id} value={this.props.cellDataCE.value} onChange={this.props.onEscalationTableUpdate} required="required" >
              <option value="">Choose Status</option>
              <option value="InProgress">In Progress</option>
              <option value="closed">Closed</option>
          </select>
          </td>
        );
    
      }
    
    }
    // class EditableCellSelectCETI extends React.Component {
  
    //   render() {
    //     return (
    //       <td className="tdStyleGrid">
    //         <select className="noStyle" name={this.props.cellDataCE.type} id={this.props.cellDataCE.id} value={this.props.cellDataCE.value} onChange={this.props.onEscalationTableUpdate}>
    //           <option value="0">Choose an option</option>
    //           <option value="1">1</option>
    //           <option value="2">2</option>
    //           <option value="3">3</option>
    //       </select>
    //       </td>
    //     );
    
    //   }
    
    // }
    class EditableCellSelectCOuntryCE extends React.Component {
  
      render() {
        var propsData = this.props.cellDataCE.state;
        var countryData = propsData.itemsCountry;
        return (
          <td className="tdStyleGrid">
            <select className="noStyle" name={this.props.cellDataCE.type} id={this.props.cellDataCE.id} value={this.props.cellDataCE.value} onChange={this.props.onEscalationTableUpdate} required="required">
              <option value="">Choose Country</option>
              {countryData}
          </select>
          </td>
        );
    
      }
    
    }
    class EditableCellSelectKSATCE extends React.Component {
  
      render() {
        return (
          <td className="tdStyleGrid noBorder">
            <select className="noStyle" name={this.props.cellDataCE.type} id={this.props.cellDataCE.id} value={this.props.cellDataCE.value} onKeyUp={this.props.onHandleCharacter} onChange={this.props.onEscalationTableUpdate} required="required" >
              <option value="">Choose an option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
          </select>
          </td>
        );
    
      }
    
    }
  class EditableCell extends React.Component {
      render() {
      return (
        <td className="tdStyleGrid">
          <input className="noStyle" type='email' placeholder="Account Team Contact" name={this.props.cellData.type} id={this.props.cellData.id} value={this.props.cellData.value} onChange={this.props.onProductTableUpdate} required="required" />
        </td>
      );
  
    }
  
  }
  class EditableCellEmpty extends React.Component {
  
    render() {
      return (
        <p></p>
      );
  
    }
  
  }
  class EditableCellKSAT extends React.Component {
  
    render() {
      return (
        // <td className="tdStyleGrid">
          <input className="noStyle extraMargin extraLabelProp" type='email' name={this.props.cellData.type} id={this.props.cellData.id} value={this.props.cellData.value} onChange={this.props.onProductTableUpdate} required="required" />
        // </td>
      );
  
    }
  
  }
  class EditableCellKSATTextArea extends React.Component {
    
    render() {
        var propsData = this.props.cellData.miData;
      return (
        <textarea className="noStyle extraMargin externalTextArea" maxlength="1502" rows="2" data-value="miData" data-name={propsData} name={this.props.cellData.type} id={this.props.cellData.id} value={this.props.cellData.value} onKeyUp={this.props.onHandleCharacter} onChange={this.props.onProductTableUpdate} required="required" >
        </textarea>
      );
  
    }
  
  }
  class EditableCellTextArea extends React.Component {

    render() {
      return (
        <td className="tdStyleGrid">
          <textarea className="noStyle textAreaStyle" maxlength="1502" placeholder="Enter MI Summary" rows="2"  name={this.props.cellData.type} id={this.props.cellData.id} value={this.props.cellData.value} onKeyUp={this.props.onHandleCharacter} onChange={this.props.onProductTableUpdate} required="required" >
            </textarea>
        </td>
      );
  
    }
  
  }
  class EditableCellTextAreaCustomer extends React.Component {

    render() {
      return (
        <td className="tdStyleGrid">
          <textarea className="noStyle textAreaStyle" maxlength="1502" placeholder="Enter Customer/s" rows="2" name={this.props.cellData.type} id={this.props.cellData.id} value={this.props.cellData.value} onChange={this.props.onProductTableUpdate} required="required" >
            </textarea>
        </td>
      );
  
    }
  
  }
  class EditableCellSelect extends React.Component {

    render() {
      return (
        <td className="tdStyleGrid">
          <select className="noStyle" name={this.props.cellData.type} id={this.props.cellData.id} value={this.props.cellData.value} onChange={this.props.onProductTableUpdate} required="required" >
            <option value="">Choose Status</option>
            <option value="InProgress">In Progress</option>
            <option value="closed">Closed</option>
        </select>
        </td>
      );
  
    }
  
  }
  class EditableCellSelectCountry extends React.Component {
    render() {
        var propsData = this.props.cellData.state;
        var countryData = propsData.itemsCountry;
      return (
        <td className="tdStyleGrid">
          <select className="noStyle"  name={this.props.cellData.type} id={this.props.cellData.id} value={this.props.cellData.value} onChange={this.props.onProductTableUpdate} required="required">
            <option value="">Choose Country</option>
            {countryData}
        </select>
        </td>
      );
  
    }
  
  }
  class EditableCellSelectTI extends React.Component {

    render() {
      return (
        <td className="tdStyleGrid">
          <select className="noStyle" name={this.props.cellData.type} id={this.props.cellData.id} value={this.props.cellData.value} onChange={this.props.onProductTableUpdate} required="required" >
            <option value="">Choose Tier of Incident</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
        </select>
        </td>
      );
  
    }
  
  }
  class EditableCellSelectKSAT extends React.Component {

    render() {
      return (
        <td className="tdStyleGrid noBorder">
          <select className="noStyle"  name={this.props.cellData.type} id={this.props.cellData.id} value={this.props.cellData.value} onKeyUp={this.props.onHandleCharacter}  onChange={this.props.onProductTableUpdate} required="required">
            <option value="">Choose an option</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
        </select>
        </td>
      );
  
    }
  
  }
export default withRouter(DRHome);