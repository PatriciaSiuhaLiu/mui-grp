import React from 'react';
import ReactDOM from 'react-dom';
import { trackPromise } from "react-promise-tracker";
import {  Button, Tabs, Tab, ListItem, Form, TextInput, TextArea, Select, SelectItem  } from 'carbon-components-react';
import { Link, withRouter } from 'react-router-dom';
import { TrashCan32 } from "@carbon/icons-react";
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { validate } from '../../../validation/validate.js';

// import DRForm from './DRForm';
import LazyLoad from "react-lazyload";
class VolunteerHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = (
            {
                disableMarket: true,
                required: "required",
                disableMarket1: true,
                required1: "required",
                geoMarket: [{addGeo: "", addMarket: ""}],
                supportGlobally: false,
                loginToClientSyatem: false,
                provideConsultingSupport: false,
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
                // collect geo List 
                let geoListObj =  dbData.dbData.geoList;

                const geoList = Object.entries(geoListObj).map(([key, value]) => {
                        return value.geo;
                })
                const geoMarketMapping = {};
                for(let value of  Object.values(geoListObj)) {
                geoMarketMapping[value.geo] = value.market;
                }
                // Prepare data for initial geo market Selects(dropdowns)
                let geoMarketSelectList = {0: {geo: "", market:"", marketOptions: [], disableAddMarket:true}};
                this.setState({ dbData, geoList, geoMarketMapping, geoMarketSelectList});
 
             })
        );
    }


        //modified handle change
        handleChangeNew(i, e) {
            const { name, value } = e.target;
            const [selectOptionName, indexStr] = name.split('_');
            const index = parseInt(indexStr);
            let updatedGeoMarketObj = {}
            let marketOptions = [];
            if(selectOptionName === "addGeo"){
                const currentGeoMarketObj = this.state.geoMarketSelectList[index];
                 marketOptions = value ? this.state.geoMarketMapping[value]: [];
                const disableAddMarket = value? false : true;
                updatedGeoMarketObj = {...currentGeoMarketObj, geo:value, market: "", marketOptions, disableAddMarket }
            }else if(selectOptionName === "addMarket"){
                const currentGeoMarketObj = this.state.geoMarketSelectList[index];
                updatedGeoMarketObj = {...currentGeoMarketObj, market:value}
            }
            const updatedGeoMarketList = {...this.state.geoMarketSelectList , [index]: updatedGeoMarketObj}
            this.setState({geoMarketSelectList: updatedGeoMarketList, currentSelectGeoIndex:index })

   }

   onChangeAddGeo = (e) => {
    const {name, value} = e.target;
    const [selectOptionName, indexStr] = name.split('_');
            const index = parseInt(indexStr);
            let updatedGeoMarketObj = {}
            if(selectOptionName === "addGeo"){
                const currentGeoMarketObj = this.state.geoMarketSelectList[index];
                // const marketOptions = this.state.geoMarketMapping[value];
                const disableAddMarket = value ? false : true;
                updatedGeoMarketObj = {...currentGeoMarketObj,  disableAddMarket }
            }

            const updatedGeoMarketList = {...this.state.geoMarketSelectList , [index]: updatedGeoMarketObj}
            this.setState({geoMarketSelectList: updatedGeoMarketList})

};

     createSelectElement() {
         if(this.state.geoMarketSelectList){

            let geoMarketList =  this.state.geoMarketSelectList;
            const geoMarketListKeys = Object.keys(geoMarketList);

            let  formOptionGeo = '';
            // let disableAddMarket = true;
            const geoItems1 = [];
            for(let geo of this.state.geoList){
                formOptionGeo = (
                    <option
                        className="bx--select-option"
                        value={geo}
                    //   selected={market[i] == accountsData.market}
                    >
                        {geo}
                    </option>
                    );
                    geoItems1.push(formOptionGeo);
            }
            return geoMarketListKeys.map((el, i) => {
                const {marketOptions, geo, market, disableAddMarket} = this.state.geoMarketSelectList[el]
                let  formOptionMarket = '';
                const matketItems1 = [];
                for(let market of marketOptions){
                    formOptionMarket = (
                        <option
                            className="bx--select-option"
                            value={market}
                        //   selected={market[i] == accountsData.market}
                        >
                            {market}
                        </option>
                        );
                        matketItems1.push(formOptionMarket);
                }
                return( <div key={i} className="addSelectInline">
                        <div className="bx--col">
                            <Select className="labelFont " id= {"addGeo_"+i} name={"addGeo_"+i} labelText="Geo" defaultValue={geo || ''} onBlur={this.handleChangeNew.bind(this, i)} onChange={(e) => this.onChangeAddGeo(e)} required="required" >
                                <SelectItem
                                    // selected={impactingEvent == true}
                                    value=""
                                    text="Choose an Option"
                                />
                                {geoItems1}
                            </Select>
                        </div>
                        <div className="bx--col">
                                        <Select className="labelFont "disabled={disableAddMarket} id={"addMarket_"+i} name={"addMarket_"+i} labelText="Market" defaultValue={market || ''} onBlur={this.handleChangeNew.bind(this, i)} required={this.state.required1} >
                                            <SelectItem
                                                // selected={impactingEvent == true}
                                                value=""
                                                text="Choose an Option"
                                            />
                                            {matketItems1}
                                        </Select>
                        </div>
                    </div>
                )
            } )
        }
    }
    addClick(){
        let geoMarketList =  this.state.geoMarketSelectList;
        const indexGeoMarket = Object.keys(geoMarketList).length;
        const updatedGeoMarketList = {...geoMarketList, [indexGeoMarket]: {geo: "", market: "", marketOptions: [], disableAddMarket: true}};
        this.setState({geoMarketSelectList: updatedGeoMarketList})
    }

 
   removeClick(i){
      let geoMarket = [...this.state.geoMarket];
      geoMarket.splice(i, 1);
      this.setState({ geoMarket });
   }
    handleChange1 = (e) => {
        this.setState({ endDate: e._d });
    }
    handleChange2 = (e) => {
        this.setState({ startDate: e._d });
    }
    handleInputChange = (e) => {
        if ((e.target.value && e.target.value.includes("script") && e.target.value.includes("<")) || e.target.value.includes(">")){
            this.setState({
                ["inValid_" + e.target.name]: "Invalid Input.",
            });
            return;
        }
        this.setState({
            [e.target.name]: e.target.value,
        });
        if(e.target.name == "serviceLine"){
            var targetValue = e.target.value;
            var updatedTargetValue = targetValue+"-service";
            this.setState({
                [e.target.name]: updatedTargetValue,
            });
        }
        if(e.target.name == "volunteerEmail" || e.target.name == "managerEmail"){
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
        if(e.target.name == "primaryPhone" || e.target.name == "altPhone"){
            var format = /[!@#$%^&*_\=\[\]{};':"\\|,.<>\/?]+/;
            if(format.test(e.target.value)){
                this.setState({
                    ["inValid_" + e.target.name]: "Invalid Input.",
                });
                return;
            }else{
                this.setState({
                    [e.target.name]: e.target.value,
                });
                this.setState({
                    ["inValid_" + e.target.name]: "",
                });
            }
        }
        
        
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
        if(e.target.name == "addGeo" && e.target.value != ""){
            this.setState({disableMarket1: false})
            this.setState({required1: "required"})
        }
        if(e.target.name == "addGeo" && e.target.value == ""){
            this.setState({disableMarket1: true})
            this.setState({required1: ""})
        }
        
        // this.setState({ [e.target.name]: e.target.value });
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
    handleCheckbox5(name, event) {
        this.setState({
            [event.target.name]: event.target.checked,
        });
    };
    handleCheckbox6(name, event) {
        this.setState({
            [event.target.name]: event.target.checked,
        });
    };
    handleCheckbox7(name, event) {
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
    formSubmit= (e) => {
        e.preventDefault();
        var skills = {};
            var splitServiceLine = ''
            var dataToSent = {};
            var supportLocation = [];
            let [skillArr1, skillArr2,skillArr3, skillArr4,skillArr5, skillArr6, skillArr7, skillArr8, skillArr9, skillArr10 ] = [[], [], [], [], [], [], [], [], [], []];
            const selectedGeoMarket = this.state.geoMarketSelectList;
            let count =0;
            for (let geoMarket in selectedGeoMarket){
                count = count +1;
            }
            for (let i=0; i <count ;i++) {
                let geoMarketObj = {}
                geoMarketObj["geo"] = selectedGeoMarket[i].geo;
                geoMarketObj["market"] = selectedGeoMarket[i].market;
                supportLocation.push(geoMarketObj);
            }
            dataToSent[supportLocation] = supportLocation;
            for (var key in this.state) {
                if (this.state.hasOwnProperty(key)) {
                    if(key == "serviceLine"){
                        splitServiceLine = this.state[key].split("-");
                        var serviceLine = splitServiceLine[0]
                        dataToSent["serviceLine"] = splitServiceLine[0]
                    }
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
            var dataToSave = {
                skills: skills,
                email: this.state.volunteerEmail,
                supportLocation: supportLocation,
                managerEmail: this.state.managerEmail,
                phone: this.state.primaryPhone ,
                alternatePhone: this.state.altPhone,
                geo: this.state.reqGeo,
                market: this.state.reqMarket,
                country: this.state.country,
                timezone: this.state.timezone,
                supportGlobal: this.state.supportGlobally,
                loginToClientSystem: this.state.loginToClientSyatem,
                consultingSupport: this.state.provideConsultingSupport,
                gsePractice: this.state.gsePractice,
                serviceLine: this.state.serviceLine,  
                complianceTerms: this.state.complianceTerms
            }
            dataToSent["skills"] = skills;
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
                    fetch('/mui/saveTeamITVolunteer' , {
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
    }
    render() {
        var stateObj = this.state;
        var suportItem = ''
        const itemssuport = [];
        var gsePracticeItem = ''
        const itemsGsePractice = [];
        var serviceLineItem = ''
        const itemsServiceLine = [];
        var timeZoneItem = ''
        const itemsTimeZone = [];
        var countryItem = '';
        const itemsCountry = [];
        var geoItem = ''
        const itemsGeo = [];
        const itemsMarket = [];
        var formOptionMarket = "";
        var disableMarket = this.state.disableMarket;
        var itemsSkill = [];
        var itemCategory = "";
        if(stateObj?.dbData){
            var dbData = stateObj.dbData.dbData;
            var supportList = dbData.supportList[0].supportType;
            var serviceLineList = dbData.serviceLineList[0].serviceLine;
            var gsePracticeList = dbData.gsePracticeList[0].gsePractice;
            var timezoneList = dbData.timezoneList;
            var countryList = dbData.countryList;
            var geoList = dbData.geoList;
            var skillList = dbData.skillList;
            for (var i=0; i < supportList.length; i++) {
                suportItem = (
                    <option
                    className="bx--select-option"
                    value={supportList[i]}
                    // selected={value.name == workspaceNameFromDB}
                    >
                    {supportList[i]}
                    </option>
                );
                itemssuport.push(suportItem);
            }
            for (var i=0; i < serviceLineList.length; i++) {
                serviceLineItem = (
                    <option
                    className="bx--select-option"
                    value={serviceLineList[i]}
                    // selected={value.name == workspaceNameFromDB}
                    >
                    {serviceLineList[i]}
                    </option>
                );
                itemsServiceLine.push(serviceLineItem);
            }
            for (var i=0; i < gsePracticeList.length; i++) {
                gsePracticeItem = (
                    <option
                    className="bx--select-option"
                    value={gsePracticeList[i]}
                    // selected={value.name == workspaceNameFromDB}
                    >
                    {gsePracticeList[i]}
                    </option>
                );
                itemsGsePractice.push(gsePracticeItem);
            }
            for (var i=0; i < timezoneList.length; i++) {
                timeZoneItem = (
                    <option
                    className="bx--select-option"
                    value={timezoneList[i].abbr}
                    // selected={value.name == workspaceNameFromDB}
                    >
                    {timezoneList[i].value}
                    </option>
                );
                itemsTimeZone.push(timeZoneItem);
            }
            for (var i=0; i < countryList.length; i++) {
                countryItem = (
                    <option
                    className="bx--select-option"
                    value={countryList[i].desc}
                    // selected={value.name == workspaceNameFromDB}
                    >
                    {countryList[i].desc}
                    </option>
                );
                itemsCountry.push(countryItem);
            }
            Object.entries(geoList).map(([key, value]) => {
                  geoItem = <option
                    className="bx--select-option"
                    value={value.geo}
                    // selected={value.geo == accountsData.geo}
                  >
                    {value.geo}
                  </option>
                itemsGeo.push(geoItem);
            });
            Object.entries(skillList).map(([key, value]) => {
                var skillSet = ''
                var skillCheck = '';
                const itemSkillArr = []
                for(var i = 0; i< value.skills.length; i++){
                    var skills = value.skills[i];
                    skillSet = <div className="checkbox checkboxDisplayStyle">
                                    <input className="checkboxDisplayInline checkboxInput" type="checkbox" name={skills} data-value={value.category} onClick={ (event) => { this.handleCheckbox3({skills}, event) }} />
                                    <label className="bx--checkbox-label-text checkboxClass">
                                        {skills}
                                    </label>
                                </div> 
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
                  if (value.geo == this.state.reqGeo) {
                    var market = value.market;
                    for (var i = 0; i < market.length; i++) {
                      formOptionMarket = (
                        <option
                          className="bx--select-option"
                          value={market[i]}
                        //   selected={market[i] == accountsData.market}
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
                        <div className="bx--row">
                            <div className="bx--col">
                                <TextInput type="text" className="bx--text-input bx--text__input"  id="volunteerEmail" name="volunteerEmail" labelText= "Volunteer Email"  placeholder="Volunteer Email" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue='' required="required" />
                                {this.state?.inValid_volunteerEmail &&
                                    <small className="fontRed">
                                        <b className="blgrperrorMsg">{this.state.inValid_volunteerEmail}</b>
                                    </small>
                                }
                            </div>
                            <div className="bx--col">
                                <TextInput type="text" className="bx--text-input bx--text__input"  id="managerEmail" name="managerEmail" labelText= "Manager Email"  placeholder="Manager Email" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue='' />
                                {this.state?.inValid_managerEmail &&
                                    <small className="fontRed">
                                        <b className="blgrperrorMsg">{this.state.inValid_managerEmail}</b>
                                    </small>
                                }
                            </div>
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                <TextInput type="text" className="bx--text-input bx--text__input"  id="primaryPhone" name="primaryPhone" labelText= "Primary Phone"  placeholder="Primary Phone" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue='' required="required" />
                                {
                                    this.state['inValid_primaryPhone'] &&
                                    <small className="fontRed">
                                        <b className="blgrperrorMsg">{this.state['inValid_primaryPhone']}</b>
                                    </small>
                                }
                            </div>
                            <div className="bx--col">
                                <TextInput type="text" className="bx--text-input bx--text__input"  id="altPhone" name="altPhone" labelText= "Alternate Phone"  placeholder="Alternate Phone" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue=''  />
                                {
                                    this.state['inValid_altPhone'] &&
                                    <small className="fontRed">
                                        <b className="blgrperrorMsg">{this.state['inValid_altPhone']}</b>
                                    </small>
                                }
                            </div>
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                <Select className="labelFont " id="reqGeo" name="reqGeo" labelText="Geo" defaultValue="" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} required="required" >
                                    <SelectItem
                                        // selected={impactingEvent == true}
                                        value=""
                                        text="Choose an Option"
                                    />
                                   {itemsGeo}
                                </Select>
                            </div>
                            <div className="bx--col">
                                <Select className="labelFont " disabled={this.state.disableMarket} id="reqMarket" name="reqMarket" labelText="Market" defaultValue="" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} required={this.state.required} >
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
                                <Select className="labelFont " id="country" name="country" labelText="Country" defaultValue="" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} required="required" >
                                    <SelectItem
                                        // selected={impactingEvent == true}
                                        value=""
                                        text="Choose an Option"
                                    />
                                   {itemsCountry}
                                </Select>
                            </div>
                            <div className="bx--col">
                                <Select className="labelFont " id="timezone" name="timezone" labelText="Timezone" defaultValue="" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} required="required" >
                                    <SelectItem
                                        // selected={impactingEvent == true}
                                        value=""
                                        text="Choose an Option"
                                    />
                                    {itemsTimeZone}
                                </Select>
                            </div>
                        </div>
                        <div className="bx--row" style={{padding: "17px 13px"}}>
                            <div className="checkbox checkBoxDes">
                                <input type="checkbox" name="supportGlobally" className="checkboxInput checkboxDisplayInline" onClick={ (event) => { this.handleCheckbox7('supportGlobally', event) }} />
                                <label className="bx--checkbox-label-text checkboxClass">
                                    Willing to support globally?
                                </label>
                            </div>  
                        </div>
                        <div className="bx--row">
                            {/* <div className="bx--col"> */}
                                <div className="addUserDivMain">
                                    {/* <div> */}
                                    {this.createSelectElement()}                                         <a className="linkStyle"  value='add more' onClick={this.addClick.bind(this)}>Add</a>
                                </div>
                                {/* </div> */}
                            {/* </div> */}
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                <Select className="labelFont " id="gsePractice" name="gsePractice" labelText="GSE Practice" defaultValue="" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} required="required" >
                                    <SelectItem
                                        // selected={impactingEvent == true}
                                        value=""
                                        text="Choose an Option"
                                    />
                                   {itemsGsePractice}
                                </Select>
                            </div>
                            <div className="bx--col">
                                <Select className="labelFont " id="serviceLine" name="serviceLine" labelText="Service Line" defaultValue="" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} required="required" >
                                    <SelectItem
                                        // selected={impactingEvent == true}
                                        value=""
                                        text="Choose an Option"
                                    />
                                    {itemsServiceLine}
                                </Select>
                            </div>
                        </div>
                        <div className="bx--row" style={{padding: "17px 13px"}}>
                            <div className="bx--col">
                                <div className="checkbox checkBoxDes1">
                                    <input type="checkbox" name="loginToClientSyatem" className="checkboxInput checkboxDisplayInline" onClick={ (event) => { this.handleCheckbox5('loginToClientSyatem', event) }}  />
                                    <label className="bx--checkbox-label-text checkboxClass">
                                        Willing to Login into client system?
                                    </label>
                                </div>  
                                <div className="checkbox checkBoxDes1">
                                    <input type="checkbox" name="provideConsultingSupport" className="checkboxInput checkboxDisplayInline" onClick={ (event) => { this.handleCheckbox6('provideConsultingSupport', event) }}  />
                                    <label className="bx--checkbox-label-text checkboxClass">
                                        Provide consulting support?
                                    </label>
                                </div> 
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
                        <div className="bx--row" style={{padding: "17px 13px"}}>
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
                                disabled={this.state.disableBtn_shortDescription == true || this.state.disableBtn_description == true || this.state.disableBtn_comments || this.state['inValid_primaryPhone'] || this.state['inValid_altPhone'] } 
                                tabIndex={0} type="submit" className="btnMarginExt" style={{marginbottom: '2%'}}>Submit </Button>
                            </div>
                        </div>
                        <div className="bx--row btnMarginExt">
                            <div className="bx--col">
                                {
                                    this.state['resErrMsg'] && 
                                    <small className="fontRed">
                                    <b className="blgrperrorMsg">{this.state.resErrMsg.validateVolunteerSkillMsg}</b>
                                    </small>
                                }
                                {
                                    this.state['resErrMsg'] && 
                                    <small className="fontRed">
                                    <b className="blgrperrorMsg">{this.state.resErrMsg.emailCheckMsg}</b>
                                    </small>
                                }
                                {
                                    this.state['resErrMsg'] && 
                                    <small className="fontRed">
                                    <b className="blgrperrorMsg">{this.state.resErrMsg.dateError}</b>
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
                <input {...props} onChange={(e) => this.updateValue1(e)} name="endData" className="dtpStyle" required="required" />
            </div>
        );
    }
}
export default withRouter(VolunteerHome);