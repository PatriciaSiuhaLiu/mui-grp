import {
  Button,
  Form,
  Select,
  SelectItem,
  TextArea,
  TextInput,
} from "carbon-components-react";
import React, { Component } from "react";
import { trackPromise } from "react-promise-tracker";
import BreadCrumb from "../SuperAdmin/SACommands/CommandsBreadCrumb";
import qs from "qs";
import { validate } from '../../validation/validate.js';
import { Tooltip } from "carbon-components-react/lib/components/Tooltip/Tooltip";
import { Close32 } from "@carbon/icons-react";
import "./form.scss";
class AddService extends Component {
  header = "Add Service";
  links = {
    Home: "/mui/home",
    Services: "/mui/services",
    "Add Service": "/mui/add-service",
  };
  state = {
    id: "",
    name: "",
    description: "",
    bJustification: "",
    workspace: "",
    owners: "",
    collaborators: "",
    workspacesList: [],
    service: {},
    showPopup: false,
    collaborationTool: "SLACK",
    defaultassignments: '',
    teamName: "",
    teamId: "",
    workspaceName: "",
    region:"",
    teamsWorkspaceData : {}
  };

  async fetchWorkSpaces() {
    const res = await fetch("/mui/fetchWorkspace");
    if (res.status == 200) {
      const { workspaceData } = await res.json();
      this.setState({ workspacesList: workspaceData });
    }
  }

  async componentDidMount() {
    this.fetchWorkSpaces();
    const { id } = qs.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });

    const res$ = fetch("/mui/registeredService/" + id);
    trackPromise(res$);
    const res = await res$;
    if (res.status == 200) {
      const { serviceData } = await res.json();
      this.setState({
        id,
        name: serviceData.SourceIdentificationCode,
        description: serviceData.SourceDescription,
        bJustification: serviceData.businessJustification,
        workspace: serviceData.workspace,
        owners: serviceData.owner && serviceData.owner.join(),
        collaborators:
          serviceData.collaborator && serviceData.collaborator.join(),
        service: serviceData,
        collaborationTool: serviceData.collabTool
      });
    }
  }

  updateValue = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleInputChange = (e) => {
    if (
      (e.target.value &&
        e.target.value.includes("script") &&
        e.target.value.includes("<")) ||
      e.target.value.includes(">")
    ) {
      this.setState({
        ["inValid_" + e.target.name]: "Invalid Input.",
      });
      return;
    };
  }

  updatecollaborationTool = (e) => {
    this.setState({
      collaborationTool: e.target.value,
    });
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

  handleWorkspaceRegion = (e) => {
    console.log(e.target.value);
    this.setState({region: e.target.value})
  };

  saveWorkspace = async (e) => {
    e.preventDefault();
    // alert(e.target.name);
    const res = await fetch("/mui/checkUniqueWorkspace/"+this.state.teamName);
    if (res.status === 200) {
      const { message, error } = await res.json();
      if(error){
        this.setState({
          invalidMsg: message,
        })
        return false;
      }
      
    }

    
  //Save workspace when Teams selected
      const teamsWorkspaceData = {
        teamName: this.state.teamName,
        teamId: this.state.teamId,
        workspaceType:"TEAMS",
        region: this.state.region,
        name: this.state.teamName,
        type: 'new'
      }
      console.log(`teamsWorkspaceData----${JSON.stringify(teamsWorkspaceData)}`);
      
      this.setState({
        [e.target.name]: e.target.value,
        showPopup: false,
        invalidMsg: undefined,
        teamsWorkspaceData : teamsWorkspaceData
      }, () =>{
        this.loadWorkspace();
      });
      
      
  };

  loadWorkspace = () => {
    console.log(this.state.teamsWorkspaceData)
    const olderWorkspaces = [...this.state.workspacesList];
    //console.log(`olderWorkspaces---${JSON.stringify(olderWorkspaces)}`);
    //const mergeAddWorkspace = [...olderWorkspaces, ...this.state.teamsWorkspaceData]
    olderWorkspaces.push(this.state.teamsWorkspaceData);
    this.setState({
      workspacesList : olderWorkspaces
    }, () =>{
      console.log(`workspacesList----${JSON.stringify(olderWorkspaces)}`);
    })

    
    // trackPromise(
    //   fetch("/mui/onboardAccountFormData")
    //     .then((res) => {
    //       return res.json();
    //     })
    //     .then((AccData) => {
    //       this.props.registerState("AccData", AccData);
    //     })
    // );
  };

  emailHandler = (e) => {
    e.target.setCustomValidity("");
    if (e.target.value.length == 0) return (this.state.collaborators = "");
    const emaillArr = e.target.value.trim().split(",");
    const validEmails = emaillArr.every((email) => {
      const allowedDomains =
        process.env.REACT_APP_ALLOWED_DOMAINS?.split(",") || [];
      const validDomain = allowedDomains.find((domain) =>
        email.toLowerCase().includes(domain + ".")
      );
      return validDomain;
    });
    if (validEmails) {
      this.updateValue(e);
    } else e.target.setCustomValidity("Please provide valid email...");
  };

  submit = async (e) => {
      e.preventDefault();
      const payload = new Payload(this.state);
      console.log(`payload----${JSON.stringify(payload)}`);
        // SpecialCharacter validation
      var validateFields = validate(payload);
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
      }else{
          const res$ = fetch("/mui/postServiceApprovalToSlack", {
          method: "POST",
          headers: {
              "Content-type": "application/json",
          },
          body: JSON.stringify(payload),
          });
          trackPromise(res$);
  
          const res = await res$;
  
          if (res.status === 200) {
              this.props.history.push("/mui/services");
          }else{
              res.json().then((object)=> {
                  this.setState({uniqueCheck:object.uniqueCheck});
              })
          }
      }
  };

  isUnique = async (name) => {
    try {
      const res = await fetch("/mui/uniqueService/" + name);
      if (res.status == 200) {
        const { unique } = await res.json();
        return unique;
      } else return false;
    } catch (error) {
      return false;
    }
  };

  generateNameHandler = (time) => {
    let timer;
    return async (e = new Event()) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const { value } = e.target;
        if (!value) {
          e.target.setCustomValidity("");
          return;
        }
        e.target.setCustomValidity("Verifying......");
        const unique = await this.isUnique(value);
        if (unique) {
          e.target.setCustomValidity("");
          this.state.name = value;
        } else e.target.setCustomValidity("Service name already exists...");
      }, time);
    };
  };

  render() 
  {
    const addWorkspaceTeamsForm = (
      <Form>
        <Select
          className="labelFont"
          id="workspaceRegions"
          labelText={
            <span>
              Region <b className="fontRed">*</b>
              <Tooltip>Region</Tooltip>
            </span>
          }
          name="workspaceRegions"
          // onChange={this.props.handleChange("workspaceRegions")}
          onChange={(e) => this.handleWorkspaceRegion(e)}
          defaultValue={this.state.region || ""}
          value={this.state.region}
          required="required"
        >
          
          <SelectItem hidden value="" text="Choose an option" />
          <SelectItem value="NA" text="NA" />
          <SelectItem value="EU" text="EU" />
        </Select>
        <TextInput
          className="bx--text-input bx--text__input"
          id="teamName"
          name="teamName"
          labelText={
            <span>
              Team Name<b className="fontRed">*</b>
              <Tooltip>MS Team Name</Tooltip>
            </span>
          }
          placeholder="Team Name"
          value={this.state.teamName}
          onBlur={(e) => this.handleInputChange(e)}
          onChange={(e) => this.updateValue(e)}
          // defaultValue = {signingSecret}
          defaultValue={this.state.teamName}
          required
        />
        <TextInput
          className="bx--text-input bx--text__input"
          id="teamId"
          name="teamId"
          labelText= {
            <span>
              Team Id<b className="fontRed">*</b>
              <Tooltip>MS Team Id</Tooltip>
              <a className="addWorkspaceLink" href={`/mui/extract-team-ids`} target="_blank" rel="noreferrer">Get Team Id</a>
            </span>
          }
          placeholder="Team Id"
          value={this.state.teamId}
          onBlur={(e) => this.handleInputChange(e)}
          onChange={(e) => this.updateValue(e)}
          // defaultValue = {signingSecret}
          defaultValue={this.state.teamId}
          required
        />
        <br />
        <span>Click on the 'Get team id' link to fetch the team id and for instruction <a className="bx--link" href={`https://kyndryl.sharepoint.com/sites/ChatOps/SitePages/MS-Teams.aspx`} target="_blank" rel="noreferrer">MS Teams (sharepoint.com)</a></span>
        <br />
        <br />
        <br />
      </Form>
    )
    return (
      <div className="divContainer">
        <div className="headerDiv sectionMargin">
          <BreadCrumb header={this.header} links={this.links} />
        </div>
        <section className="sectionMargin mainMargin paddingCostom">
          <Form className="formMain" onSubmit={this.submit}>
            <TextInput
              labelText={
                <>
                  Service Name <b style={{ color: "red" }}>*</b>
                </>
              }
              placeholder="Service Name"
              name="name"
              onChange={this.generateNameHandler(400)}
              defaultValue={this.state.name}
              readOnly={this.state.id}
              required
            />
            <TextInput
              labelText={<>Service Description <b style={{ color: "red" }}>*</b> <span className="specialCharacterLabel">(Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | ? ~ are not allowed)</span></>}
              placeholder="Service Description"
              name="description"
              onChange={this.updateValue}
              defaultValue={this.state.description}
              readOnly={this.state.id}
              required
            />
            <TextArea
              cols={50}
              rows={5}
              labelText={<>Business Justification <b style={{ color: "red" }}>*</b> <span className="specialCharacterLabel">(Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | ? ~ are not allowed)</span></>}
              placeholder="Business Justification"
              name="bJustification"
              onChange={this.updateValue}
              defaultValue={this.state.bJustification}
              readOnly={this.state.id && !(this.state.service.status === 'rejected')}
              required
            />
            {/* <TextInput
              labelText={
                <>
                  Workspace Name <b style={{ color: "red" }}>*</b>
                </>
              }
              placeholder="Workspace Name"
              name="workspace"
              onChange={this.updateValue}
              required
            /> */}
            <Select
              id="service_type"
              name="service_type"
              labelText={
                <span>
                  Collaboration Tool <b className="fontRed">*</b>
                  <Tooltip>Collaborative Chat Plateform</Tooltip>
                </span>
              }
              onChange={this.updatecollaborationTool}
              defaultValue={this.state.collaborationTool}
              required
            >
              <SelectItem value="SLACK" text="SLACK" selected={this.state.collaborationTool === 'SLACK'} />
              <SelectItem value="TEAMS" text="TEAMS" selected={this.state.collaborationTool === 'TEAMS'}/>
            </Select>

            <Select
              id="workspace"
              labelText={
                <span>
                   Workspace Name <b className="fontRed">*</b>
                  <Tooltip>
                    Workspace is made up of channels <br />
                    where user can can communicate and work together.
                    User either can select existing workspace or add new
                    workspace by giving appropriate details
                  </Tooltip>
                  { 
                    this.state.collaborationTool === 'TEAMS' ?
                    <a
                      className="addWorkspaceLink"
                      onClick={(e) => {
                        this.showModal();
                      }}
                    >
                      Add Workspace
                    </a>
                    :
                    ''
                  }
                </span>
              }
              name="workspace"
              onChange={this.updateValue}
              defaultValue={this.state.workspace}
              required
            >
              <SelectItem disabled value="" text="Choose an option" />
              {this.state.workspacesList.length &&
                this.state.workspacesList.map((workspace) => (

                  (this.state.collaborationTool === 'TEAMS' && workspace.workspaceType === 'TEAMS') ? 
                    <SelectItem
                      key={workspace._id}
                      value={workspace.name}
                      text={workspace.name}
                      selected={workspace.name === this.state.workspace}
                    />
                  : (this.state.collaborationTool === 'SLACK' && workspace.workspaceType !== 'TEAMS') ?
                  <SelectItem
                      key={workspace._id}
                      value={workspace.name}
                      text={workspace.name}
                      selected={workspace.name === this.state.workspace}
                    /> 
                  :
                  ''
                ))}
            </Select>
            {this.state.showPopup ? (
                      <div className="popup">
                        <div className="bx--modal-container modal-css">
                          <div className="bx--modal-header">
                            <p
                              className="bx--modal-header__label bx--type-delta"
                              id="modal-addWorkspace-label"
                            ></p>
                            <p
                              className="bx--modal-header__heading bx--type-beta"
                              id="modal-addWorkspace-heading"
                            >
                              Add Workspace
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
                            {this.state.invalidMsg && (
                              <h4>
                                <b className="fontRed">
                                  {this.state.invalidMsg}
                                </b>
                              </h4>
                            )}
                            {
                               addWorkspaceTeamsForm
                            }
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
                              onClick={this.saveWorkspace}
                              type="submit"
                              className="addWorkspace"
                            >
                              Add Workspace
                            </Button>
                            {/* <button className="bx--btn bx--btn--secondary" type="button" data-modal-close>Cancel</button> */}
                            {/* <button className="bx--btn bx--btn--primary" type="button"   data-modal-primary-focus>Add Workspace</button> */}
                          </div>
                        </div>
                        <span tabindex="0"></span>
                      </div>
                    ) : null}
            <TextInput
              labelText={
                <>
                  Owners email (email comma separated){" "}
                  {/* <b style={{ color: "red" }}>*</b> */}
                </>
              }
              placeholder="Owners email (email comma separated)"
              name="owners"
              onChange={this.emailHandler}
              defaultValue={this.state.owners}
            />
            <TextInput
              labelText={<>Collaborator email (email comma separated)</>}
              placeholder="collaborator email (email comma separated)"
              name="collaborators"
              onChange={this.emailHandler}
              defaultValue={this.state.collaborators}
            />
            <br></br>
            {
                this.state['specialCharacterErr'] &&
                <small className="fontRed">
                    <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                </small>
            }
            <br></br>
            <Button className="addAccBtn addBtnCss addBtnPACss my-2" type="submit">Add Service</Button>
            {
                  this.state.uniqueCheck == false &&
                  <small className="fontRed">
                      <b className="errorMsg">Service name already existing</b>
                  </small>
            }
          </Form>
        </section>
      </div>
    );
  }
}

export default AddService;

class Payload {
  constructor(stateObj) {
    this.id = stateObj.id || undefined;
    this.name = stateObj.name;
    this.description = stateObj.description;
    this.justification = stateObj.bJustification;
    this.collaborationTool = stateObj.collaborationTool;
    console.log(`collabTool---${stateObj.collaborationTool}`);
    if(stateObj.collaborationTool === 'TEAMS'){
        let workspaceData = stateObj.workspacesList.filter((obj) => {
          if(obj.type && obj.type === 'new' && obj.name === stateObj.workspace){
            return obj;
          }
        });
        console.log(`workspaceData---${JSON.stringify(workspaceData)}`);
        if(workspaceData.length > 0){
          delete workspaceData[0].type;
          delete workspaceData[0].name;
          this.workspace = workspaceData[0];
        }else{
          this.workspace = stateObj.workspace;
        }
      
    } else{
      this.workspace = stateObj.workspace;
    }
    
    this.owners = stateObj.owners.split(",").map((email) => email.trim());
    this.collaborators = stateObj.collaborators.split(",").map((email) => email.trim());
    
  }
}
