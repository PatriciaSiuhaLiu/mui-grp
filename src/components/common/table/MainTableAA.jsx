// MainTable.jsx
import React, { Component } from 'react';
import GeneralInfo from './GeneralInfo';
import ConfigForm from './configInfoForm';
import AdditionalInfoForm from './additionalInfoForm';
import OnboardAccount from '../../OnboardAccount.js';
import { Breadcrumb, BreadcrumbItem, OrderedList, ListItem, Form } from 'carbon-components-react';
class MainTable extends Component {
    //check all ID and check rules part >>> rules part input not added
    state = {
        AccData: [],
        // step: 1,
        // _id:'',
        // accGeo: '', accMarket: '', accSector: '', accIndustry: '', accCountry: '', blueID:'', CDIR:'', dpeAdminName:'', dpeAdminEmail:'', itsmAdminName:'', itsmAdminEmail:'', networkAdminName:'', networkAdminEmail:'',
        // collaborationTool: '', workspace:'', defaultLanguage:'', incidentChannelType:'', eventSource: '', severityList:'', triggerChatOpsProcess: '', aiopsAccIdentifier:'', defaultassignments:'', assignmentServiceToAssignResource:'', squadBasedAssignment:'', aiopsSquadGeo:'', gnmAssignments: '', blueGroupAssignment:'', 
        // usingTicketingTool:'', chatopsCommandAuth:'', authType:'', ticketingToolUsed: '', typeOfAuthentication:'', tickertingRestURL:'', basicAuthUserID:'',basicAuthPassword:'',oauthClientID:'', oauthClientSecret:'',internetFacing:'',AdditionalInfo: ''
    }
    componentDidMount() {
        // fetch('/mui/onboardAccountFormData')
        // .then(res => {
        //     return res.json()
        // })
        // .then(AccData => { 
        //     this.setState({ AccData })
        // });
    }
    // nextStep = () => {
    //     const { step } = this.state
    //     this.setState({
    //         step : step + 1
    //     })
    // }
    // submitForm = (e) => {
    //     console.log(e);
    //     var saved = e;
    //     // this.setState({
    //     //     [e.target.name]: e.target.value,
    //     // });
    //     const { step } = this.state
    //     var stateValue = this.state.AccData;
    //     console.log(this.state);
    //     console.log(this.state.AccData);
    //     const { accGeo, accMarket, accSector, accIndustry, accCountry , blueID , CDIR , dpeAdminName , dpeAdminEmail , itsmAdminName , itsmAdminEmail , networkAdminName , networkAdminEmail, collaborationTool, workspace , defaultLanguage , incidentChannelType , eventSource , severityList , tickertingRestURL, triggerChatOpsProcess, aiopsAccIdentifier , defaultassignments ,assignmentServiceToAssignResource, squadBasedAssignment , aiopsSquadGeo , gnmAssignments, blueGroupAssignment , usingTicketingTool , chatopsCommandAuth , authType , ticketingToolUsed, typeOfAuthentication , basicAuthUserID, basicAuthPassword, oauthClientID , oauthClientSecret, internetFacing, AdditionalInfo } = this.state;
    //     const values = { accGeo, accMarket, accSector, accIndustry, accCountry , blueID , CDIR , dpeAdminName , dpeAdminEmail , itsmAdminName , itsmAdminEmail , networkAdminName , networkAdminEmail, collaborationTool, workspace , defaultLanguage , incidentChannelType , eventSource , severityList ,tickertingRestURL,  triggerChatOpsProcess, aiopsAccIdentifier , defaultassignments ,assignmentServiceToAssignResource, squadBasedAssignment , aiopsSquadGeo , gnmAssignments, blueGroupAssignment , usingTicketingTool , chatopsCommandAuth , authType , ticketingToolUsed, typeOfAuthentication , basicAuthUserID, basicAuthPassword, oauthClientID , oauthClientSecret, internetFacing, AdditionalInfo };

    //     values["_id"] = stateValue.accountsData._id;
    //     values["accCode"] = stateValue.accountsData.accountCode;
    //     values["accName"] = stateValue.accountsData.accountName;
    //     values["saved"] = saved;
    //     console.log(values);
    //     fetch('/mui/postOnboardAccountDetails' , {
    //         method: "POST",
    //         headers: {
    //             'Content-type': 'application/json'
    //         },
    //         body: JSON.stringify(values)
    //     })
    //     .then((result) => {result.json()
    //         if(result.status == 200){
    //           window.location.href = "/mui/onboardAccount";
    //         }
    //       //   window.location.href = "/addAccount";
    //     })
    // }

    // prevStep = () => {
    //     const { step } = this.state
    //     this.setState({
    //         step : step - 1
    //     })
    // }

    handleChange = input => event => {
        this.setState({
            [event.target.name]: event.target.value,
        });
        // if(event.target.name == "accGeo"){
        //     var geoSelected = event.target.value;
        //     if( geoSelected == "APAC"){
        //         this.setState({
        //             geo: "APAC",
        //         });
        //     }else if(geoSelected == "Americas"){
        //         this.setState({
        //             geo: "Americas",
        //         });
        //     }else if(geoSelected == "EMEA"){
        //         this.setState({
        //             geo: "EMEA",
        //         });
        //     }else if(geoSelected == "Japan"){
        //         this.setState({
        //             geo: "Japan",
        //         });
        //     }else if(geoSelected == "Choose an Option"){
        //         this.setState({
        //             geo: "Choose an Option",
        //         });
        //     }
        // }
    }

    render(){
        
        switch(step) {
        case 1:
            return <GeneralInfo
                    nextStep={this.nextStep}
                    handleChange = {this.handleChange}
                    values={values}
                    submitForm={this.submitForm}
                    />
        case 2:
            return <ConfigForm
                    nextStep={this.nextStep}
                    prevStep={this.prevStep}
                    submitForm={this.submitForm}
                    handleChange = {this.handleChange}
                    values={values}
                    />
        case 3:
            return <AdditionalInfoForm
                    nextStep={this.nextStep}
                    prevStep={this.prevStep}
                    handleChange = {this.handleChange}
                    submitForm={this.submitForm}
                    values={values}
                    />
        case 4:
            return  <OnboardAccount />
        }
    }
}

export default MainTable;