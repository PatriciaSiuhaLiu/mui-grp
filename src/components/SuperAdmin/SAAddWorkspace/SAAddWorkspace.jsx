import React from 'react';
import ReactDOM from 'react-dom';
import { trackPromise } from "react-promise-tracker";
import {  Button, Form, TextInput, Select, SelectItem  } from 'carbon-components-react';
import SAAddWorkspaceBreadCrump from './SAAddWorkspaceBreadCrump';
import SALandingSidebar from '../SALandingSidebar';
import { withRouter } from 'react-router-dom';
import { validate } from '../../../validation/validate.js';
import AddWorkspaceTeams from './AddWorkspaceTeams';
class SuperAdminAddWorkspace extends React.Component {
    constructor(props) {
        super(props);
        this.state = (
            {
                workspaceDataFromDB:[],
                verifiedWorkspaceFetched:[],
                signingSecret: '',
                xoxb: '',
                xoxp:'',
                workspaceName: '',
                resErrMsg: '',
                teamExistsError:''
            }
        );
        this.saveWorkspace = this.saveWorkspace.bind(this);
    }
    componentDidMount() {
        trackPromise(fetch('/mui/addWorkspaces')
        .then(res => {
            return res.json()
        })
        .then(WSData => { 
            this.setState({ WSData });
            const collabTool = this.state.WSData?.workspaceDataToEdit.workspaceType;
            this.setState({
                workspaceType:collabTool?collabTool:'Slack',
                teamName: this.state.WSData?.workspaceDataToEdit.teamName,
                teamId:this.state.WSData?.workspaceDataToEdit.teamId,
                workspaceName:this.state.WSData?.workspaceDataToEdit.name,
                region:this.state.WSData?.workspaceDataToEdit.region,
                accountCode:this.state.WSData?.workspaceDataToEdit.accountCode
            });
            if(this.state.WSData?.workspaceDataToEdit.workspaceRegions){
                this.setState({
                    workspaceRegions:this.state.WSData?.workspaceDataToEdit.workspaceRegions
                });
            }
        })
        )
    }
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
    updateValue = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };
    saveWorkspace = (e) => {

    }
    changeWorkSpace =(e) => {
        const collabTool = e.target.value;
        this.setState({workspaceType:collabTool});
    }

    formSubmit= (e) => {
        e.preventDefault();
        const queryParams = window.location.search;
        let workspaceId;
        if(queryParams.includes('?')){
            workspaceId = queryParams.split('?')[1];
        }
        this.setState({
            [e.target.name]: e.target.value
          });
          if(this.state.WSData){

          }
          let workspaceData = {};
          if(this.state.workspaceType.toLowerCase() === 'teams'){
            workspaceData = {
                teamName: this.state.teamName,
                teamId: this.state.teamId,
                region: this.state.region,
                accCode:this.state.accountCode,
                workspaceType: this.state.workspaceType,
                workspaceId:workspaceId,
                workspaceName: this.state.teamName
            }
            
          } else {
            workspaceData = {
                workspaceName: this.state.workspaceName || this.state.WSData?.workspaceDataToEdit?.name,
                signingSecret: this.state.signingSecret || this.state.WSData?.workspaceDataToEdit?.signingSecret,
                xoxb: this.state.xoxb || this.state.WSData?.workspaceDataToEdit?.xoxb,
                xoxp: this.state.xoxp || this.state.WSData?.workspaceDataToEdit?.xoxp,
            };
          }
         
         // SpecialCharacter validation
        var validateFields = validate(workspaceData);
        if(validateFields.length > 0){
            var message = "";
            for(var i =0; i<validateFields.length; i++){
                var element = document.querySelector(`input[name=${validateFields[i]}]`);
                message += element.title + ", ";
            }
            this.setState({'specialCharacterErr': `Special Character not allowed in field ${message}`});
        }else{
            if(this.state.workspaceType.toLowerCase() === 'teams'){
                this.saveTeamsWorkspace(workspaceData)
            } else {
                this.saveSlackWorkspace(workspaceData);
            }
        }
          
    }
    saveTeamsWorkspace = (workspaceData) =>{
        trackPromise(
            fetch('/mui/addTeamsWorkspace' , {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(workspaceData)
            })
            .then((result) => {
                if(result.status === 200){
                    this.props.history.push("/mui/workspaces");
                } else if (result.status === 500)  {
                    result.json().then((object)=> {
                        this.setState({teamExistsError: object.message});
                    });
                }
            })
            .catch(err => { 
                this.setState({errorMessage: err.message});
            })
        )
    }
    saveSlackWorkspace = (workspaceData)=> {
        trackPromise(
            fetch('/mui/validateSAWorkspace' , {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(workspaceData)
            })
            .then((result) => {
                if (result.status === 404 || result.status === 400)  {
                    result.json().then((object)=> {
                    this.setState({resErrMsg: object.workspaceError});
                    })
                } else if (result.status === 409) {
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.workspaceError});
                    })
                } else if(result.status == 200){
                    this.props.history.push("/mui/workspaces");
                }
            })
            .catch(err => { 
                this.setState({errorMessage: err.message});
            })
        )
    }
    render() {
        var workspaceName = "";
        var signingSecret = "";
        var xoxb = "";
        var xoxp = "";
        var signingSecretElement = "";
        var xoxpElement = '';
        var xoxbElement = '';
        var readOnlyVal = false;
        var workspaceNameItem = '';
        const workspaceType = this.state.workspaceType ? this.state.workspaceType: 'Slack';
        let  teamsData= {};
        if(this.state.WSData){
            var dataToFEtch = this.state.WSData.workspaceDataToEdit;
            xoxbElement = dataToFEtch.xoxb;
            xoxpElement = dataToFEtch.xoxp;
            signingSecretElement = dataToFEtch.signingSecret;
            readOnlyVal = true;
            workspaceNameItem = <TextInput className="bx--text-input bx--text__input" id="workspaceName" name="workspaceName" labelText={ <> Workspace Name <b className="fontRed">*</b> </> }  placeholder="Workspace Name" readOnly onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={dataToFEtch.name} required />
            teamsData = {
                teamName: dataToFEtch.teamName,
                teamId: dataToFEtch.teamId,
                region: dataToFEtch.region,
                workspaceName: dataToFEtch.name,
                workspaceRegions: dataToFEtch.workspaceRegions
            }
        }else{
            xoxbElement = '';
            xoxpElement = '';
            signingSecretElement = '';
            readOnlyVal = false;
            if(this.state.resErrMsg){
                if(!this.state.resErrMsg.slackAPIError || !this.state.resErrMsg.xoxbNameError || !this.state.resErrMsg.xoxpNameError){
                    workspaceNameItem = <TextInput className="bx--text-input bx--text__input" id="workspaceName" name="workspaceName" labelText={ <> Workspace Name <b className="fontRed">*</b> </> }  placeholder="Workspace Name" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue="" required />
                }else{
                    workspaceNameItem = <TextInput className="bx--text-input bx--text__input" id="workspaceName" name="workspaceName" labelText={ <> Workspace Name <b className="fontRed">*</b> </> }  placeholder="Workspace Name" readOnly onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue="" required />
                }
            }else{
                workspaceNameItem = <TextInput className="bx--text-input bx--text__input" id="workspaceName" name="workspaceName" labelText={ <> Workspace Name <b className="fontRed">*</b> </> }  placeholder="Workspace Name" readOnly onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue="" required />
            }
        }
        return (
            <div className="divContainer">
                <section className="sectionGrid">
                    <div class="bx--grid padding0">
                        <div class="rowWidth">
                            <div class="gridColulmnWidth3">
                                <SALandingSidebar />
                            </div>
                            <div class="gridColumn13" style={{maxWidth: '20% !important', paddingRight: '0 !important'}}>
                                <SAAddWorkspaceBreadCrump />
                                <div className="formDivSA">
                                    <Form  onSubmit={this.formSubmit}>
                                    <Select className="labelFont" id="collabTool" 
                                        labelText={<> Collaboration tool <b className="fontRed">*</b> </>}
                                        defaultValue="SLACK" 
                                            onChange={(e) => this.changeWorkSpace(e)} required>
                                            <SelectItem hidden
                                                  value=""
                                                  text="Choose an option"
                                                />
                                            <SelectItem
                                                selected={this.state.workspaceType && this.state.workspaceType.toLowerCase()==='slack'}
                                                value="SLACK"
                                                text="SLACK"
                                            />
                                            <SelectItem
                                                selected={this.state.workspaceType && this.state.workspaceType.toLowerCase()==='teams'}
                                                value="TEAMS"
                                                text="TEAMS"
                                            />
                                        </Select>
                                        {workspaceType && workspaceType.toLowerCase() === 'slack' &&
                                            <>
                                                <TextInput className="bx--text-input bx--text__input" id="signingSecret" readOnly={readOnlyVal} name="signingSecret" labelText={ <> Workspace Signing Secret <b className="fontRed">*</b> </> } placeholder="Workspace Signing Secret" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={signingSecretElement} required />
                                                <TextInput className="bx--text-input bx--text__input" id="xoxp" name="xoxp" labelText={ <> Workspace xoxp Token <b className="fontRed">*</b> </> } placeholder="Workspace xoxp Token" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={xoxpElement} required />
                                                {
                                                    this.state['resErrMsg'] && 
                                                    <small className="fontRed">
                                                    <b className="blgrperrorMsg">{this.state.resErrMsg.xoxpNameError}</b>
                                                    </small>
                                                }
                                                <TextInput className="bx--text-input bx--text__input" id="xoxb" name="xoxb" readOnly={readOnlyVal} defaultValue={xoxbElement} labelText={ <> Workspace xoxb Token <b className="fontRed">*</b> </> } placeholder="Workspace xoxb Token" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} required />
                                                {
                                                    this.state['resErrMsg'] && 
                                                    <small className="fontRed">
                                                    <b className="blgrperrorMsg">{this.state.resErrMsg.xoxbNameError}</b>
                                                    </small>
                                                }
                                                {workspaceNameItem}
                                                {
                                                    this.state['resErrMsg'] && 
                                                    <small className="fontRed">
                                                    <b className="blgrperrorMsg">{this.state.resErrMsg.workspaceNameErr}</b>
                                                    </small>
                                                }
                                                {
                                                    this.state['resErrMsg'] && 
                                                    <small className="fontRed">
                                                    <b className="blgrperrorMsg">{this.state.resErrMsg.slackAPIError}</b>
                                                    </small>
                                                }
                                            </>
                                        }
                                        {workspaceType && workspaceType.toLowerCase() === 'teams' &&
                                        <>
                                            <AddWorkspaceTeams teamsData={teamsData} onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} />
                                            {
                                                this.state['teamExistsError'] && 
                                                <small className="fontRed">
                                                <b className="blgrperrorMsg">{this.state.teamExistsError}</b>
                                                </small>
                                            }
                                        </>
                                        }
                                        {
                                            this.state['specialCharacterErr'] &&
                                            <small className="fontRed">
                                                <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                                            </small>
                                        }
                                        <br></br>
                                        <Button kind="primary" type="submit" className="btnSACss" >Submit</Button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
            </div>
        );
    }
}
export default withRouter(SuperAdminAddWorkspace);









