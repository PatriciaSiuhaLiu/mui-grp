import {
    Button,
    Checkbox,
    Select,
    SelectItem,
    Form,
    FormGroup,
    TextInput,
  } from "carbon-components-react";
import { Tooltip } from "carbon-components-react/lib/components/Tooltip/Tooltip";
  import React, { Component } from "react";
import { trackPromise } from "react-promise-tracker";
import { withRouter } from "react-router-dom";
import { validate } from '../../validation/validate.js';
  import "./form.scss";
  class AddAccountForm extends Component {
      constructor(props) {
          super(props);
          this.state = (
              {accData: '',
              accCode: '',
              accName: '',
              enterprise: '',
              group: '',
              createGroup:'',
              dpeEmail:'',
              globalRepEmail: '',
              accountRepEmail: '',
              globalConfig:'',
              eventStream:'',
              addChatopsAsAdmin:'',
              maceDisabled: false,
              directIntegEnabled:false,
              }
          );
        }
        componentDidMount() {
            trackPromise(fetch('/mui/addAccountDetails')
            .then(res => {
                this.setState({disableGroupEmail : false});
                return res.json()
            })
            .then(accData => { 
                if(accData.enterprisesDetails){
                    this.setState({enterpriseData: accData.enterprisesDetails})
                }
                if(accData && accData.retrievedData.accountCode && accData.retrievedData.createGroup){
                    this.setState({disableGroupEmail : true});}
                else{ 
                    this.setState({disableGroupEmail : false});
                }
                if(accData && accData.retrievedData){
                  this.setState({globalConfig:accData.retrievedData.eventStreams})
                  this.setState({eventStream:accData.retrievedData.pushToEventStream })
                }
                this.setState({ accData: accData });
                this.setState({createGroup : accData.retrievedData.createGroup});        
                this.setState({maceDisabled : accData.retrievedData.maceDisabled});        
                this.setState({directIntegEnabled : accData.retrievedData.directIntegEnabled});        
            })
            )
        }
        handleCheckbox(name, event) {
            this.setState({
                [event.target.name]: event.target.checked,
              });
        };
        handleCheckbox1(name, event) {
            this.setState({
                [event.target.name]: event.target.checked,
              });
        };
        handleCheckbox2(name, event) {
            this.setState({
                [event.target.name]: event.target.checked,
              });
        };
        handleCheckbox3(name, event) {
            this.setState({
                [event.target.name]: event.target.checked,
              });
        };
        handleCheckbox4(name, event) {
          this.setState({
              [event.target.name]: event.target.checked,
            });
      };





        ///
        validateEmail = async (email) => {
          if(this.state.enterprise == undefined || this.state.enterprise  == ''){
            this.state.enterprise = "Kyndryl";
          }
          var enterpriseName = this.state.enterprise;
            try {
              const response = await fetch("/mui/validateEmail", {
                method: "POST",
                headers: {
                  "Content-type": "application/json",
                },
                body: JSON.stringify({email, enterpriseName}),
              })
              return response.json()
            } catch (error) {
              return {
                valid: false,
                message: "Invalid value!"
              }
            }
          }
        debouncer = (time) => {
            let timer 
            return (e) => {
              clearTimeout(timer)
              timer = setTimeout(async () => {
                const {value} = e.target
              if(!value) {
                e.target.setCustomValidity("")
                return 
              }
              e.target.setCustomValidity("Verifying......")
              const response = await this.validateEmail(value.trim())
              if(response.valid) {
                this.setState({
                  ['inValid_'+ e.target.name]: undefined
              })
                this.setState({
                  [e.target.name]: e.target.value,
                });
                //this.handleInputChange(e.target.name)(e)
                e.target.setCustomValidity("")
               
  
              } else {
                e.target.setCustomValidity(response.errMsg)
                this.setState({
                  ['inValid_'+ e.target.name]: 'Please Provide Valid Email.'
              })
              }
              }, time)
            }
          }
        
        handleInputChange = e => {
            e.preventDefault();
            if(e.target.value && e.target.value.includes('script') && e.target.value.includes('<') || e.target.value.includes('>')){
                this.setState({
                    ['inValid_'+ e.target.name]: 'Invalid Input.'
                })
                return
            }
            if(e.target.name === 'group' && e.target.value && e.target.value.match(/[!<>#%]/)) {
                this.setState({
                    ['inValid_' + e.target.name]: 'Value should not contain !<>#% Characters.'
                });
                return 
            }    
            
            this.setState({
                ['inValid_' + e.target.name]: undefined
            })  
            if(e.target.name === 'group' && e.target.value){
                var newGroup = e.target.value;
                if(this.state && this.state.accData &&this.state.accData.retrievedData.groupName){
                    var retrievedGroup = this.state.accData.retrievedData.groupName;
                }

                if(retrievedGroup && newGroup !== retrievedGroup)
                {
                    this.setState({disableGroupEmail : false});
                }
                
                else if(!retrievedGroup)
                {
                    this.setState({disableGroupEmail : false});
                }
                 else {
                    this.setState({disableGroupEmail : true});       
                }
                this.setState({
                    [e.target.name]: e.target.value,
                  });
            }
          this.setState({
            [e.target.name]: e.target.value,
          });
        };
    formSubmit= (e) => {
        e.preventDefault();
        var enterpriseVal = '';
        var stateVal = this.state.accData;
         
        if(this.state.enterprise == undefined || this.state.enterprise  == ''){
            enterpriseVal = "Kyndryl";
        }
        else{
            enterpriseVal = this.state.enterprise;
        }
        if(stateVal.retrievedData){
            if(stateVal.retrievedData.enterprise == "IBM" && this.state.enterprise  == '' ){
                enterpriseVal = "IBM";
            }
        }
        const accData = {
              _id: this.state.accData?.retrievedData?._id,
              accCode: this.state.accCode ||  this.state.accData?.retrievedData?.accountCode,
              accName: this.state.accName ||  this.state.accData?.retrievedData?.accountName,
              enterprise: enterpriseVal || this.state.accData?.retrievedData?.enterprise,
              globalConfig: this.state.globalConfig , 
              eventStream: this.state.eventStream , 
              addChatopsAsAdmin: this.state.addChatopsAsAdmin,
              group: this.state.group ||  this.state.accData?.retrievedData?.groupName,
              createGroup: this.state.createGroup ||  this.state.accData?.retrievedData?.createGroup,
              dpeEmail: this.state.dpeEmail ||  this.state.accData?.retrievedData?.dpeEmail,
              globalRepEmail: this.state.globalRepEmail ||  this.state.accData?.retrievedData?.globalRepEmail,
              accountRepEmail: this.state.accountRepEmail ||  this.state.accData?.retrievedData?.accountRepEmail,
              disableCreateGroup: this.state.disableGroupEmail,
              maceDisabled: this.state.maceDisabled,
              directIntegEnabled:this.state.directIntegEnabled

        };
        // SpecialCharacter validation
        var validateFields = validate(accData);
        if(validateFields.length > 0){
            var message = "";
            for(var i =0; i<validateFields.length; i++){
                var element = document.querySelector(`input[name=${validateFields[i]}]`);
                message += element.title + ", ";
            }
            this.setState({'specialCharacterErr': `Special Character not allowed in field ${message}`});
        }else{
            trackPromise(
                    fetch('/mui/postAddAccountDetails' , {
                    method: "POST",
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(accData)
                })
                .then((result) => {
                        if (result.status === 404 || result.status === 400)  {
                            result.json().then((object)=> {
                            this.setState({resErrMsg:object.errMsg});
                            })
                        } else if (result.status === 409) {
                            result.json().then((object)=> {
                                this.setState({resErrMsg:object.errMsg[0]});
                            })
                        } else if(result.status == 200){
                            this.props.history.push("/mui/addAccount");
                    }
                })
                .catch(err => { 
                    this.setState({errorMessage: err.message});
                })
            )
        }
            
      }
      render() {
        const hidden = this.state.createGroup ? '' : 'hidden';
            if((this.state )!== undefined){
                var retrievedData = this.state.accData.retrievedData;
                var enterpriseFromDb = this.state.enterpriseData;
                var inputFieldAccCode = '';
                var inputFieldAccName = '';
                var selectEnterprise = '' ;
                var inputFieldBG = '';
                var pushToEventStream = '';
                var event_stream = '';
                var createGroup ='';
                var maceDisabled ='';
                var directIntegEnabled ='';
                var dpeEmail='';
                var itemEnterprise = [];
                var globalRepEmail ='';
                var formOptionEnterprise ='';
                var accountRepEmail ='';
                    if(enterpriseFromDb != undefined){
                        itemEnterprise = [];
                        for (var i = 0; i < enterpriseFromDb.length; i++) {
                            if(retrievedData){
                                if(enterpriseFromDb[i] == retrievedData.enterprise){
                                    formOptionEnterprise = (
                                        <option
                                          className="bx--select-option"
                                          defaultValue={enterpriseFromDb[i]}
                                          selected={enterpriseFromDb[i] == retrievedData.enterprise}
                                        >
                                          {enterpriseFromDb[i]}
                                        </option>
                                      );
                                }else{
                                    formOptionEnterprise = (
                                        <option
                                          className="bx--select-option"
                                          defaultValue={enterpriseFromDb[i]}
                                        >
                                          {enterpriseFromDb[i]}
                                        </option>
                                      );
                                }
                                itemEnterprise.push(formOptionEnterprise);
                            }else{
                                formOptionEnterprise = (
                                    <option
                                      className="bx--select-option"
                                      defaultValue={enterpriseFromDb[i]}
                                    >
                                      {enterpriseFromDb[i]}
                                    </option>
                                  );
                            }
                            itemEnterprise.push(formOptionEnterprise);
                        }
                        itemEnterprise = itemEnterprise.filter((v, i, a) => a.indexOf(v) === i);
                    }
                var addChatopsAsAdmin='';
                if(retrievedData){
                    inputFieldAccCode = <TextInput labelText={<>Account Code  <b style={{color: 'red'}}>*</b></>} defaultValue={retrievedData.accountCode} onChange={this.handleInputChange} placeholder="Account Code" name="accCode" id="accountCode" required />
                    inputFieldAccName = <TextInput labelText={<>Account Name <b style={{color: 'red'}}>*</b></>} defaultValue={retrievedData.accountName} onChange={this.handleInputChange} placeholder="Account Name" name="accName" id="accountName" required />
                    selectEnterprise = <Select
                                        className="labelFont"
                                        id="enterprise"
                                        name="enterprise"
                                        labelText={
                                        <>
                                            Select Enterprise <b className="fontRed">*</b>
                                        </>
                                        }
                                        onChange={this.handleInputChange}
                                        required
                                    >
                                      {itemEnterprise}
                                    </Select>
                    
                    inputFieldBG = <TextInput defaultValue={retrievedData.groupName} name="group" labelText={<>Account Admin Group Name <b style={{color: 'red'}}>*</b>(Special characters &lt; &gt; ! # % are not allowed)</>} onChange={this.handleInputChange} required />
                        event_stream = <input type="checkbox" name="globalConfig" className="checkboxInput" defaultChecked={retrievedData.eventStreams} onClick={ (event) => { this.handleCheckbox1('globalConfig', event) }} />
                        pushToEventStream = <input type="checkbox" name="eventStream" className="checkboxInput" defaultChecked={retrievedData.pushToEventStream} onClick={ (event) => { this.handleCheckbox2('eventStream', event) }} />
                        
                    createGroup =<input type="checkbox" name="createGroup" className="checkboxInput" defaultChecked={retrievedData.createGroup} disabled ={this.state.disableGroupEmail} onClick={ (event) => { this.handleCheckbox('checkbox-1', event) }} />
                    maceDisabled =<input type="checkbox" name="maceDisabled" className="checkboxInput" defaultChecked={retrievedData.maceDisabled} onClick={ (event) => { this.handleCheckbox3('handleCheckbox3', event) }} />
                    directIntegEnabled =<input type="checkbox" name="directIntegEnabled" className="checkboxInput" defaultChecked={retrievedData.directIntegEnabled} onClick={ (event) => { this.handleCheckbox4('handleCheckbox4', event) }} />
                    // maceDisabled = <input type="checkbox" name="maceDisabled" className="checkboxInput" onClick={ (event) => { this.handleCheckbox('handleCheckbox3', event) }} />
                    addChatopsAsAdmin =<input type="checkbox" name="addChatopsAsAdmin" className="checkboxInput" defaultChecked={retrievedData.addChatopsAsAdmin} disabled ={this.state.disableGroupEmail} onClick={ (event) => { this.handleCheckbox('checkbox-2', event) }} />

                    dpeEmail = <TextInput labelText={<>DPE Email <b style={{color: 'red'}}>*</b></>} defaultValue={retrievedData.dpeEmail} onChange={this.debouncer(200)}  placeholder="DPE Email" disabled ={this.state.disableGroupEmail} name="dpeEmail" id="dpeEmail" required />
                    globalRepEmail = <TextInput labelText="Global Representative Email" defaultValue={retrievedData.globalRepEmail}  onChange={this.debouncer(200)}  disabled ={this.state.disableGroupEmail} placeholder="Global Representative Email" name="globalRepEmail" id="globalRepEmail"  />
                    accountRepEmail = <TextInput labelText="Account Representative Email" defaultValue={retrievedData.accountRepEmail} onChange={this.debouncer(200)} disabled ={this.state.disableGroupEmail} placeholder="Account Representative Email" name="accountRepEmail" id="accountRepEmail"  />
                    
                }else{
                    inputFieldAccCode = <TextInput labelText={<>Account Code  <b style={{color: 'red'}}>*</b></>} onChange={this.handleInputChange} placeholder="Account Code" name="accCode" id="accountCode" required />
                    inputFieldAccName = <TextInput labelText={<>Account Name <b style={{color: 'red'}}>*</b></>} onChange={this.handleInputChange} placeholder="Account Name" name="accName" id="accountName" required />
                    selectEnterprise = <Select
                                        className="labelFont"
                                        id="enterprise"
                                        name="enterprise"
                                        labelText={
                                        <>
                                            Select Enterprise <b className="fontRed">*</b>
                                        </>
                                        }
                                        // defaultValue={this.props.incidentChannelType || ""}
                                        onChange={this.handleInputChange}
                                        required
                                    >
                                      {itemEnterprise}
                                    </Select>
                    inputFieldBG = <TextInput  name="group" labelText={<>Account Admin Group Name <b style={{color: 'red'}}>*</b>(Special characters &lt; &gt; ! # % are not allowed)</>} placeholder="Group Details" id="groupDetails" onChange={this.handleInputChange} required />
                    event_stream = <input type="checkbox" name="globalConfig" className="checkboxInput" onClick={ (event) => { this.handleCheckbox1('globalConfig', event) }} />
                    pushToEventStream = <input type="checkbox" name="eventStream" className="checkboxInput" onClick={ (event) => { this.handleCheckbox2('eventStream', event) }} />
                    createGroup = <input type="checkbox" name="createGroup" className="checkboxInput" onClick={ (event) => { this.handleCheckbox('checkbox-1', event) }} />
                    maceDisabled = <input type="checkbox" name="maceDisabled" className="checkboxInput" onClick={ (event) => { this.handleCheckbox3('handleCheckbox3', event) }} />
                    directIntegEnabled =<input type="checkbox" name="directIntegEnabled" className="checkboxInput"  onClick={ (event) => { this.handleCheckbox4('handleCheckbox4', event) }} />
                    // maceDisabled = <input type="checkbox" name="maceDisabled" className="checkboxInput" onClick={ (event) => { this.handleCheckbox('handleCheckbox3', event) }} />                   
                    addChatopsAsAdmin = <input type="checkbox" name="addChatopsAsAdmin" className="checkboxInput" defaultChecked="checked" onClick={ (event) => { this.handleCheckbox('checkbox-2', event) }} />
                    dpeEmail = <TextInput labelText={<>DPE Email <b style={{color: 'red'}}>*</b></>}  onChange={this.debouncer(200)}  placeholder="DPE Email" name="dpeEmail" id="dpeEmail" required />                                       
                    globalRepEmail = <TextInput labelText="Global Representative Email"  onChange={this.debouncer(200)}  placeholder="Global Representative Email" name="globalRepEmail" id="globalRepEmail"  />
                    accountRepEmail = <TextInput labelText="Account Representative Email" onChange={this.debouncer(200)}  placeholder="Account Representative Email" name="accountRepEmail" id="accountRepEmail"  />
                    
                                    
                }
          }
          return (
          <Form onSubmit={this.formSubmit} className="formMain">


              {
                    this.state['resErrMsg'] && 
                    <small className="fontRed">
                    <b className="blgrperrorMsg">{this.state['resErrMsg']}</b>
                    </small>
              }
              <br></br>
              <br></br>
                {inputFieldAccCode}
              {
                  this.state['inValid_accCode'] &&
                  <small className="danger">
                      <b className="errorMsg">{this.state['inValid_accCode']}</b>
                  </small>
              }
                {inputFieldAccName}
                {
                  this.state['inValid_accName'] &&
                  <small className="danger">
                      <b className="errorMsg">{this.state['inValid_accName']}</b>
                  </small>
              }
              {selectEnterprise}
                {/* <TextInput labelText="Account Code" value={retrievedData.accountCode} onChange={this.handleInputChange} placeholder="Account Code" name="accCode" id="accountCode" />
                <TextInput labelText="Account Name" value={retrievedData.accountName} onChange={this.handleInputChange} placeholder="Account Name" name="accName" id="accountName" /> */}

                <div className="inlineCheckbox">
                    <FormGroup className="checkboxWrapper">
                            <div className="checkbox">
                                <label className="bx--checkbox-label-text checkboxClass checkboxClassBG">
                                {createGroup}
                                    Create Group
                                </label>
                                <Tooltip className="tooltipBG">Group is used for access control to the management user interface.<br></br>**Create group 'checked' option allows user to create a new group and add the dpe and respective people as members to the group<br></br>
** Groups needs to be maintained by the DPE/respective account admin<br></br>
** If a group already exists for the account, don't select this option but enter the group name directly in the 'Account admin group name' field.</Tooltip>
                                {
                                this.state.createGroup &&
                                <><label className="bx--checkbox-label-text checkboxClass checkboxClassBG">
                                {/* {addChatopsAsAdmin} Add Chatops As Admin */}
                                </label>   
                                </>
                                }
                               
                            </div>
                            
                    </FormGroup>
                </div>
                <br></br>
                

                {inputFieldBG}
                {
                  this.state['inValid_group'] &&
                  <small className="danger">
                      <b className="errorMsg">{this.state['inValid_group']}</b>
                  </small>
                }
                 <div className="checkbox">
                    <label className="bx--checkbox-label-text checkboxClass checkboxClassBG">
                    {maceDisabled}
                        Disable mace calls
                    </label>
                    <Tooltip className="tooltipBG">If checked, all calls coming from mace will be disabled</Tooltip>
                    {
                    this.state.createGroup &&
                    <><label className="bx--checkbox-label-text checkboxClass checkboxClassBG">
                    </label>   
                    </>
                    }
                    
                </div>
                <div className="checkbox">
                    <label className="bx--checkbox-label-text checkboxClass checkboxClassBG">
                    {directIntegEnabled}
                        Enable direct integration 
                    </label>
                    <Tooltip className="tooltipBG">Ticketing Tool to ChatOps direct integration enabled and if AIOPS is also enabled, only Insights would get posted in the channel</Tooltip>
                </div>
                
              {
                this.state.createGroup &&
              <>{dpeEmail}
              {
                  this.state['inValid_dpeEmail'] &&
                  <small className="fontRed">
                      <b className="errorMsg">{this.state['inValid_dpeEmail']}</b>
                  </small>
              }
              
              {globalRepEmail}
              {
                  this.state['inValid_globalRepEmail'] &&
                  <small className="fontRed">
                      <b className="errorMsg">{this.state['inValid_globalRepEmail']}</b>
                  </small>
              }
             {accountRepEmail}
             {
                  this.state['inValid_accountRepEmail'] &&
                  <small className="fontRed">
                      <b className="errorMsg">{this.state['inValid_accountRepEmail']}</b>
                  </small>
              }
             
            </>}

              {/* <div className="inlineCheckbox">
                    <FormGroup className="checkboxWrapper">
                            <div className="checkbox">
                                <label className="bx--checkbox-label-text checkboxClass">
                                {pushToEventStream}                                
                                    Event Streams Enable/Disable
                                </label>
                                <label className="bx--checkbox-label-text checkboxClass">
                                {event_stream}                               
                                    Use Global Config (Event Streams)
                                </label>
                            </div>    
                                        
                             <Tooltip>More Information about event stream click-https://w3.ibm.com/w3publisher/chatops-for-ibm-services/key-features/dynamic-workflow</Tooltip>
                        
                    </FormGroup>
                </div> */}
                <br></br><br></br>
                {
                  this.state['specialCharacterErr'] &&
                  <small className="fontRed">
                      <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                  </small>
              }
              <div>
                {/* {
                    this.props['specialCharacterErr'] &&
                    <small className="fontRed" style={{width: '100% !important'}}>
                        <b className="errorMsg specialCharErr">{this.props['specialCharacterErr']}</b>
                    </small>
                } */}
                </div>
                <Button className="PAbtnCommon" type="submit" onClick={this.addAccountClick} disabled={this.state['inValid_accCode'] || this.state['inValid_accName'] || this.state['inValid_group'] || this.state['inValid_group'] || this.state['inValid_dpeEmail'] || this.state['inValid_accountRepEmail'] || this.state['inValid_globalRepEmail'] } >Submit</Button>
          </Form>
          );
      }
  }
  
  export default withRouter(AddAccountForm);
  