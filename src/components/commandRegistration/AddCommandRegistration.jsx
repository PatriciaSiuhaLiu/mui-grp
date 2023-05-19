// AddCommandRegistration.jsx >>> WORKING WITH JUST ADDD DELETE
import React, { Component } from 'react';
import { throws } from 'assert';
import {
    Modal,
    Button,
    Checkbox,
    Column,
    FormGroup,
    Grid,
    Row,
    Select,
    SelectItem,
    TextInput,
    Form,
    ModalWrapper,
    Breadcrumb,
    BreadcrumbItem
  } from "carbon-components-react";
//   import React, { Component } from "react";
  import "../forms/form.scss";
  import { AddAlt32  } from "@carbon/icons-react";
  import { TrashCan32   } from "@carbon/icons-react";
  import { Close32 } from "@carbon/icons-react";
  import { trackPromise } from "react-promise-tracker";
import { Link, withRouter } from 'react-router-dom';
import { validate } from '../../validation/validate.js';
class AddCommandRegistration extends Component{
    constructor(){
        super();
        this.state ={
            AccData: [],
            cmdData: [],
            addField: [{added:false, fValue:''}],
            cmdVal: {},
        };
        this.formSubmit = this.formSubmit.bind(this);
    }

    addParams = () => {
        const {addField} = this.state
        const {isEdit} = this.state
        addField.push({added:true, fValue:''})
        this.setState({
          addField
        })
        
    }

    deleteParams = (id) => {
        var paramId = JSON.stringify(id),
            matches = paramId.match(/\d+$/),
            index;

        if (matches) {
            index = matches[0];
        }
        // var index = number
        const {addField} = this.state

      if( (addField.deleted || 0) >= addField.length - 1) return
      addField[index] = {added:false, fValue:''}
      addField.deleted = addField.deleted + 1 || 1
      this.setState({
        addField
      })
    
    }

    handleInputChange = e => {
        if(e.target.name === 'groupName' && e.target.value && e.target.value.match(/[!<>#%]/)) {
            this.setState({
                ['inValid_' + e.target.name]: 'Value should not contain !<>#% Characters.'
            })
            return 
        }else{
            this.setState({
                [e.target.name]: e.target.value,
            }); 
        }
        this.setState({
            ['inValid_' + e.target.name]: undefined
        }) 
        this.setState({
            [e.target.name]: e.target.value,
        });
        
    }

    updateValue = e => {
        this.setState({[e.target.name]: e.target.value});
    }
    componentDidMount() {
        trackPromise(
            fetch('/mui/fetchCommandRegistered')
            .then(res => {
                return res.json()
            })
            .then(cmdData => { 
                if(cmdData && !cmdData.commandData)
                        this.addParams()

                this.setState({ cmdData })
                
            })
            
        )

    }
    formSubmit= (e) => {
        e.preventDefault();

        var paramsData=[];
        var params={};
        var retrievedData = ''
        var cmdDataToPassState =this.state
        var accDataFetch = cmdDataToPassState.cmdData ;
        var accDetails = accDataFetch.accountData
        var accCode = accDetails.accCode;
        var accName = accDetails.accName;
        var accID = accDetails._id;
        
        if(cmdDataToPassState.cmdData){
            var accData = cmdDataToPassState.cmdData.accountData;
            var accId = accData._id 
            var cmdToedit = cmdDataToPassState.cmdData;
            if(cmdToedit.commandData){
                var cmdToeditData = cmdToedit.commandData;
                var retrievedData = cmdToeditData
            }
        }
        
        var paramObj = {};
        var paramsData =[];
        var paramsDataSequence =[];
        

        // ****Filter all Param keys and respective value from state****
        if(cmdDataToPassState){
            var filteredParamsFromState = Object.keys(cmdDataToPassState).filter(function(k) {
                return k.indexOf('params') == 0;
            }).reduce(function(newData, k) {
                newData[k] = cmdDataToPassState[k];
                return newData;
            }, {});
            
        }
        var retrievedParamSequence = {}
        if(retrievedData){
            if(Object.keys(retrievedData.paramSequence).length != 0 ){
                retrievedParamSequence = retrievedData.paramSequence;
            }
        }
        
        var submittedSequence = {}
        if(filteredParamsFromState){
            if(Object.keys(filteredParamsFromState).length != 0 ){
                submittedSequence = filteredParamsFromState;
            }

        }
        
        paramObj["param"] = paramsData;
        var groupName = '';
        if(this.state.groupName == '' || (this.state["groupName"] == undefined)){
            groupName = undefined
        }else{
            groupName = this.state.groupName
        }
        var cmdDataToPass = {
            accID: accID,
            accCode: accCode,
            accName:accName,
            command: this.state.comand || retrievedData.command,
            group: groupName || retrievedData.group,
            paramSequence: {}
        }
        if( Object.keys(submittedSequence).length != 0){
            Object.entries(submittedSequence).map(([key, value]) => {
                if(Object.keys(retrievedParamSequence).length != 0 ){
                    retrievedParamSequence[key] = value
                }else{
                    retrievedParamSequence = submittedSequence
                }
            });

            cmdDataToPass["paramSequence"] = retrievedParamSequence

        }else{
            cmdDataToPass["paramSequence"] = retrievedParamSequence
        } 
        
        var redirect_url = "/mui/commandRegistraton?"+accId;
        // SpecialCharacter validation
        var validateFields = validate(cmdDataToPass);
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
                fetch('/mui/postCommandRegistration' , {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(cmdDataToPass)
            })
            .then((result) => {result.json()
                if(result.status == 200){
                    this.props.history.push(redirect_url)
                }
            })
            )   
        }
    }

    render(){
        var defaultCommandData = '';
        var defaultBGData = '';
        var defaultParamData = '';
        var paramitem = ''
        var itemsParam = [];
        var paramElements = [];
        var paramItem = ''
        var count = 0;
        var listItems = ''
        var retrievedData;
        var cmdDataToPassState =this.state;
        var seq_id = 0;
        var seq_id_key = "params0"
        var redirectUrl1 = '/mui/home/'
        var redirectUrl2  = '/mui/home/'   
        if(cmdDataToPassState.cmdData){
            var accData = cmdDataToPassState.cmdData.accountData;
            var cmdToedit = cmdDataToPassState.cmdData;
            if(cmdToedit.commandData){
                var cmdToeditData = cmdToedit.commandData;
                retrievedData = cmdToeditData
                var existing_data = retrievedData.paramSequence;
                if(existing_data){
                    Object.entries(existing_data).map(([key, value]) => {
                            listItems = <div className="rulesSubDiv">
                                        <TextInput id={key} defaultValue={value} name={key}  onChange={this.handleInputChange}  className="bx--text-input bx--text__input"  placeholder="Add Params" />
                                        <div className="iconDiv1">
                                            <TrashCan32 className="iconEditSize1" aria-label="Delete Rule" title="Delete Rule" onClick={() => this.deleteParams(key)} />
                                        </div>
                                    </div>
                            paramElements.push(listItems)
                            seq_id_key = JSON.stringify(key)
                    });
                 }  

                 seq_id = seq_id_key.match(/\d+$/); // geting the integer value for sequence    
            }
        }  
        
        var addFieldData =  this.state.addField;
        if(addFieldData){
            for(var j = 0; j < addFieldData.length; j++){
                if(addFieldData[j].added){
                    listItems = <div className="rulesSubDiv">
                                <TextInput id={"params"+seq_id} defaultValue={addFieldData[j].fValue} name={'params'+seq_id}  onChange={this.handleInputChange}  className="bx--text-input bx--text__input"  placeholder="Add Params" />
                                <div className="iconDiv1">
                                    <TrashCan32 className="iconEditSize1" aria-label="Delete Rule" title="Delete Rule" onClick={() => this.deleteParams(seq_id)} />
                                </div>
                            </div>
                    paramElements.push(listItems) ;
                    seq_id = seq_id + 1 ;
                }           
            }
        }
        if(this.state.addField){
            Object.entries(this.state.addField).map(([key, value]) => {
                var keyValue =key;
            });
        }
        if(this.state.cmdData){
            var cmdDataFetch = this.state.cmdData;
            if(cmdDataFetch.commandData){
                var dataFromFb = cmdDataFetch.commandData;
                var cmdDataFromDB = dataFromFb;
                defaultCommandData = cmdDataFromDB.command;
                defaultBGData = cmdDataFromDB.group;
                var paramsData = cmdDataFromDB.params;
                var accData = cmdDataFetch.accountData;
                itemsParam = []
            }
           
            if(cmdDataFetch.commandData && cmdDataFetch.accountData){
                var dataFromFb = cmdDataFetch.commandData;
                var accData = cmdDataFetch.accountData;
                redirectUrl1 = "/mui/commandRegistraton?"+accData._id;
                redirectUrl2 = "/mui/addCommandRegistraton?"+dataFromFb._id;
            }
            if(cmdDataFetch.accountData && !cmdDataFetch.commandData){
                var accData = cmdDataFetch.accountData;
                redirectUrl1 = "/mui/commandRegistraton?"+accData._id;
                redirectUrl2 = "/mui/addCommandRegistraton?"+accData._id;
            }
        }
        return(
        <div className="divContainer" style={{width: '70%'}}>
        <div className="headerDiv sectionMargin  mainMargin">
                <div>
                    <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/mui/home">Home</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to="/mui/onboardAccount">Accounts</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={redirectUrl1}>Command Registration</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <Link to={redirectUrl2}>Add Command Registration</Link>
                    </BreadcrumbItem>
                    </Breadcrumb>
                </div>
                <h2 className="headerText">Add Command Registration</h2>
            </div>
            <section className="sectionMargin mainMargin paddingCostom">
                <Form onSubmit={this.formSubmit}  >
                    <Grid>
                        <Row>
                            <Column>
                            <TextInput id="comand" name="comand"  ref={node => (this.inputNode = node)} defaultValue={defaultCommandData} onChange={this.handleInputChange}  className="bx--text-input bx--text__input" labelText={<>Command Name  <b style={{color: 'red'}}>*</b></>} placeholder="Add Comand" required />
                            <TextInput id="groupName" name="groupName" helperText="Optional helper text here; if message is more than one line text should wrap (~100 character count maximum)"  ref={node => (this.inputNode = node)} defaultValue={defaultBGData} onChange={this.handleInputChange}  className="bx--text-input bx--text__input" labelText="Group Name" placeholder="Group Name" />
                            {
                                this.state['inValid_groupName'] &&
                                <small className="danger">
                                    <b className="errorMsg">{this.state['inValid_groupName']}</b>
                                </small>
                            }
                            <div className="bx--form__helper-text" style={{maxWidth: '100%', margin: "0"}}>If Group is populated, it would restrict the usage of command. If Group is not populated, command can be used globally</div>
                            <div className="paramsInlineDiv">
                                <h4 className="bx--label paramsLabel">Params </h4>
                                <AddAlt32 className="addParam" onClick={this.addParams} />
                            </div>
                                    
                            </Column>
                        </Row>
                        <Row>
                            <Column>
                                <div className="rulesDivStyle" style={{marginTop: "0"}}>
                                {paramElements}
                                </div>
                            </Column>
                        </Row>
                        <Row>
                            <Column>
                                {
                                    this.state['specialCharacterErr'] &&
                                    <small className="fontRed">
                                        <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                                    </small>
                                }
                            </Column>
                        </Row>
                        <Row>
                            <Column>
                                <Button className="btnMargin btnCmd" type="submit" disabled={ this.state['inValid_groupName']}>Submit</Button>
                            </Column>
                        </Row>
                    </Grid>
                </Form>
            </section>
        </div>
        )
    }
}


export default withRouter(AddCommandRegistration);

