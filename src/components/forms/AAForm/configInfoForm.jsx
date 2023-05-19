// ConfigForm.jsx
import React, { Component } from "react";
import AddWorkspace from "./AddWorkspace";
import { throws } from "assert";
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
  FormLabel,
} from "carbon-components-react";
//   import React, { Component } from "react";
import "../form.scss";
import { Add32 } from "@carbon/icons-react";
import { TrashCan32 } from "@carbon/icons-react";
import { Close32 } from "@carbon/icons-react";
import { trackPromise } from "react-promise-tracker";
import AddRules from "./AddRulesModal";
import { Tooltip } from "carbon-components-react/lib/components/Tooltip/Tooltip";
//   import "./validationForm.js"
//   import $ from 'jquery';
//   import ButtonsForm from '../Buttons';
class ConfigForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //     AccData: [],
      showPopup: false,
      workspaceData: [],
      encryptedData: [],
      groupField: [true],
      channelField: [true],
      collaborationTool: "Slack",
      defaultassignments: '',
      teamName: "",
      teamId: "",
      workspaceName: "",
      region:""
    };
    this.loadData = this.loadData.bind(this);
    this.loadWorkspace = this.loadWorkspace.bind(this);
  }

  debouncer = (time) => {
    let timer;
    return (e) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const { value } = e.target;
        if (!value) {
          e.target.setCustomValidity("");
          return;
        }
        if (
          this.props.AccData.accountsData?.accountCDIC &&
          value === this.props.AccData.accountsData?.accountCDIC
        ) {
          this.props.handleChange("aiopsAccIdentifier")(e);
          e.target.setCustomValidity("");
          return;
        }
        e.target.setCustomValidity("Verifying......");
        const response = await this.validateCdic(value.trim());
        if (response.valid) {
          this.props.handleChange("aiopsAccIdentifier")(e);
          e.target.setCustomValidity("");
        } else {
          e.target.setCustomValidity(response.message);
        }
      }, time);
    };
  };

  validateCdic = async (cdic) => {
    try {
      const response = await fetch("/mui/validateCdic", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ cdic }),
      });

      return response.json();
    } catch (error) {
      return {
        valid: false,
        message: "Invalid value!",
      };
    }
  };

  validateEmails = async (emailArr, collaborationToolUsed) => {

    const { AccData, workspace } = this.props;
    try {
      var workspaceObj = AccData?.accountsData?.workspaceList?.find(
        (value) => value?.name == workspace
      );
      if(!workspaceObj){
        throw "Please select workspace then enter email Ids"
      }
    } catch (error) {
      return {
        valid: false,
        message: "Please select workspace then enter email Ids",
      };
    }
    const data = {
      emails: emailArr,
      workspaceToken: workspaceObj?.bot?.tokens?.xoxb,
      collaborationTool: collaborationToolUsed,
      region:workspaceObj?.region
    }
    try {
      const response = await fetch("/mui/validateEmails", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return response.json();
    } catch (error) {
      return {
        valid: false,
        message: "Invalid Email!",
      };
    }
  };

  addGroup = () => {
    const { groupField } = this.state;
    groupField.push(true);
    this.setState({
      groupField,
    });
  };

  deleteGroup = (index) => {
    const { groupField } = this.state;

    if ((groupField.deleted || 0) >= groupField.length - 1) return;

    groupField[index] = false;
    groupField.deleted = groupField.deleted + 1 || 1;
    this.setState({
      groupField,
    });
    delete this.props.values["groupName" + index]
    delete this.props.values["groupRules" + index]
  };

  addChannel = () => {
    const { channelField } = this.state;
    channelField.push(true);
    this.setState({
      channelField,
    });
  };

  deleteChannel = (index) => {
    const { channelField } = this.state;

    if ((channelField.deleted || 0) >= channelField.length - 1) return;

    channelField[index] = false;
    channelField.deleted = channelField.deleted + 1 || 1;
    this.setState({
      channelField,
    });
    delete this.props.values["indexChannel" + index]
    delete this.props.values["channelRules" + index]
    delete this.props.values["workspaceRules" + index]
  };

  showModal = (e) => {
    this.setState({
      showPopup: true,
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
    }
    // if (
    //   e.target.name == "signingSecret" ||
    //   e.target.name == "xoxp" ||
    //   e.target.name == "xoxb"
    // ) {
    //   this.setState({
    //     [e.target.name]: e.target.value,
    //   });
    //   const workspaceDataToEncrypt = {
    //     signingSecret: this.state.signingSecret,
    //     xoxb: this.state.xoxb,
    //     xoxp: this.state.xoxp,
    //   };
    //   trackPromise(
    //     fetch("/mui/encryptSecret", {
    //       method: "POST",
    //       headers: {
    //         "Content-type": "application/json",
    //       },
    //       body: JSON.stringify(workspaceDataToEncrypt),
    //     }).then((result) => {
    //       result.json();
    //       if (result.status == 200) {
    //         this.loadData();
    //       }
    //     })
    //   );
    // } else {
    this.setState({
      [e.target.name]: e.target.value,
    });
    // }
  };
  updateValue = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  loadData = () => {
    trackPromise(
      fetch("/mui/encryptSecret")
        .then((res) => {
          return res.json();
        })
        .then((encryptedData) => {
          this.setState({ encryptedData }, () => {});
          // this.setState({ encryptedData }, function () {
          // });
          // this.setState({ encryptedData })
        })
    );
  };
  loadWorkspace = () => {
    trackPromise(
      fetch("/mui/onboardAccountFormData")
        .then((res) => {
          return res.json();
        })
        .then((AccData) => {
          this.props.registerState("AccData", AccData);
        })
    );
  };
  componentDidMount() {


    //this.setState({ AccData })
    let { groupList, workspaceIndexChannel } =
      this.props.AccData.accountsData;
      groupList = groupList && Object.entries(groupList);
    workspaceIndexChannel =
      workspaceIndexChannel && Object.entries(workspaceIndexChannel);
    if (groupList && groupList.length) {
      this.setState({
        groupField: groupList,
      });
    }
    if (workspaceIndexChannel && workspaceIndexChannel.length) {
      this.setState({
        channelField: workspaceIndexChannel,
      });
    }
    //this.props.registerState("indexChannel",(this.state.channelField))
  }
  componentDidUpdate(prevProps, prevState) {
    const collabConfig = this.props.values.collabConfig;
    if(prevProps.values.collaborationTool !== this.props.values.collaborationTool && collabConfig){
      let {  workspaceIndexChannel} = this.props.AccData.accountsData;
      if(workspaceIndexChannel){  
        workspaceIndexChannel = workspaceIndexChannel && Object.entries(workspaceIndexChannel);
        let teamsCollabconfig, slackCollabconfig;

        if(this.props.values.collaborationTool.toLowerCase() === 'teams'){
          if(collabConfig['teams']){
            teamsCollabconfig = collabConfig['teams'];
          }
          for(let i=0; i< workspaceIndexChannel.length; i++){
            if(teamsCollabconfig && Object.keys(teamsCollabconfig).length > 0){
              workspaceIndexChannel[i][0] = teamsCollabconfig.defaultindexchannels[i]['channel'];
              workspaceIndexChannel[i][1][1] = teamsCollabconfig.defaultindexchannels[i]['workspaceName'];
            }else {
              // set blank values
            }
            
          }
        }else {
          if(collabConfig['slack']){
            slackCollabconfig = collabConfig['slack'];
          }
          for(let i=0; i< workspaceIndexChannel.length; i++){
            if(slackCollabconfig && Object.keys(slackCollabconfig).length > 0){
              workspaceIndexChannel[i][0] = slackCollabconfig.defaultindexchannels[i]['channel'];
              workspaceIndexChannel[i][1][1] = slackCollabconfig.defaultindexchannels[i]['workspaceName'];
            }else {
              // set blank values
            }
            
          }
        }

        this.setState({
          channelField: workspaceIndexChannel,
        });
      }
    }
    
  }
  handleWorkspaceChange = () => {

  }
  saveAndContinue = (e) => {
    e.preventDefault();
    const {
      defaultassignments,
      assignmentServiceToAssignResource,
      squadBasedAssignment,
      groupAssignment,
    } = this.props;
      if (
        !(
          defaultassignments ||
          assignmentServiceToAssignResource ||
          squadBasedAssignment == "yes" ||
          groupAssignment == "yes"
        )
      ) {
        this.setState({
          error: "Please select atleast one Assignment Service",
        });
        return;
      }
    // if(this.props.collaborationTool.toLowerCase() ===  'teams'){
    //   this.props.setdefaultFunctionalId(defaultassignments)
    // }
    this.props.onSubmit("config");
    this.props.nextStep();
  };
  submitAndContinue = (e) => {
    e.preventDefault();
    var saved = false;
    var submitted = false;
    if (e.target.className.includes("saveData")) {
      saved = true;
      submitted = false;
    } else {
      saved = false;
      submitted = true;
    }

    this.props.submitForm(saved);
    // this.props.submitForm();
  };
  cancelModal = (e) => {
    e.preventDefault();
    this.setState({
      showPopup: false,
    });
  };

  saveWorkspace = (e) => {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value,
      showPopup: false,
    });

    //Save workspace when Slack selected
    if(this.props.values.collaborationTool === 'Slack'){
    const workspaceData = {
      _id: this.props.AccData.accountsData._id,
      accCode: this.props.AccData.accountsData.accountCode,
      accName: this.props.AccData.accountsData.accountName,
      workspaceAdmin: this.state.workspaceAdmin,
      workspaceEmail: this.state.workspaceEmail,
      signingSecret: this.state.signingSecret,
      xoxb: this.state.xoxb,
      xoxp: this.state.xoxp,
      workspaceType : "SLACK"
    };

    trackPromise(
      fetch("/mui/addWorkspace", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(workspaceData),
      }).then(async (result) => {
        if (result.status == 200) {
          e.preventDefault();
          this.setState({
            showPopup: false,
            invalidMsg: undefined,
          });
          this.loadWorkspace();
          //   window.location.href = "/addAccount";
        } else {
          const parsedMsz = await result.json();
          this.setState({
            showPopup: true,
            invalidMsg: parsedMsz.message,
          });
        }
        //   window.location.href = "/addAccount";
      })
    );
  }
  //Save workspace when Teams selected
    if(this.props.values.collaborationTool === 'Teams'){
      const teamsWorkspaceData = {
        accCode: this.props.AccData.accountsData.accountCode,
        teamName: this.state.teamName,
        teamId: this.state.teamId,
        // workspaceName: this.state.workspaceName,
        workspaceType:"TEAMS",
        region: this.state.region,
      }
      trackPromise(
        fetch("/mui/addTeamsWorkspace", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(teamsWorkspaceData),
        }).then(async (result) => {
          if (result.status == 200) {
            this.setState({
              showPopup: false,
              invalidMsg: undefined,
            });
            this.loadWorkspace();
          } else {
            const parsedMsz = await result.json();
            this.setState({
              showPopup: true,
              invalidMsg: parsedMsz.message,
            });
          }
          //   window.location.href = "/addAccount";
        })
      );
    }
  };

  back = (e) => {
    e.preventDefault();
    this.props.prevStep();
  };

  handleWorkspaceRegion = (e) => {
    console.log(e.target.value);
    this.setState({region: e.target.value})
  }

  render() {
    const { values } = this.props;
    var accData = this.props.AccData;
    const itemsLanguage = [];
    var formOptionLang = "";
    const itemsWorkspace = [];
    const itemsSquadGeo = [];
    var formOptionWorkspace = "";
    var formOptionSquadGeo = "";
    var signingSecret = "";
    var xoxb = "";
    var xoxp = "";
    var signingSecretElement = "";
    var xoxpElement = "";
    var xoxbElement = "";
    var p2Priority = false;
    var p3Priority = false;
    var p4Priority = false;
    var checkboxChecked = "";
    if (this.state.encryptedData.encrypted != undefined) {
      var stateData = this.props.encryptedData.encrypted;
      signingSecret = stateData.signingSecret;
      xoxb = stateData.xoxb;
      xoxp = stateData.xoxp;
      signingSecretElement = (
        <TextInput
          className="bx--text-input bx--text__input"
          id="signingSecret"
          name="signingSecret"
          // type="password"
          labelText={
            <>
              Workspace Signing Secret <b className="fontRed">*</b>
            </>
          }
          placeholder={signingSecret}
          onBlur={(e) => this.handleInputChange(e)}
          onChange={(e) => this.updateValue(e)}
          // defaultValue = {signingSecret}
          defaultValue={signingSecret}
          value={signingSecret}
        />
      );
      xoxbElement = (
        <TextInput
          className="bx--text-input bx--text__input"
          id="xoxb"
          name="xoxb"
          // type="password"
          // defaultValue={xoxb}
          labelText={
            <>
              Workspace xoxb Token <b className="fontRed">*</b>
            </>
          }
          placeholder={xoxb}
          defaultValue={xoxb}
          value={xoxb}
          onBlur={(e) => this.handleInputChange(e)}
          onChange={(e) => this.updateValue(e)}
        />
      );
      xoxpElement = (
        <TextInput
          className="bx--text-input bx--text__input"
          id="xoxp"
          // type="password"
          name="xoxp"
          labelText={
            <>
              Workspace xoxp Token <b className="fontRed">*</b>
            </>
          }
          placeholder={xoxp}
          onBlur={(e) => this.handleInputChange(e)}
          onChange={(e) => this.updateValue(e)}
          // defaultValue={xoxp}
          defaultValue={xoxp}
          value={xoxp}
        />
      );
    } else {
      signingSecret = "";
      xoxb = "";
      xoxp = "";
      signingSecretElement = (
        <TextInput
          className="bx--text-input bx--text__input"
          id="signingSecret"
          name="signingSecret"
          // type="password"
          labelText={
            <>
              Workspace Signing Secret <b className="fontRed">*</b>
            </>
          }
          placeholder="Workspace Signing Secret"
          onBlur={(e) => this.handleInputChange(e)}
          onChange={(e) => this.updateValue(e)}
          defaultValue={signingSecret}
        />
      );
      xoxbElement = (
        <TextInput
          className="bx--text-input bx--text__input"
          id="xoxb"
          name="xoxb"
          // type="password"
          defaultValue={xoxb}
          labelText={
            <>
              Workspace xoxb Token <b className="fontRed">*</b>
            </>
          }
          placeholder={xoxb}
          onBlur={(e) => this.handleInputChange(e)}
          onChange={(e) => this.updateValue(e)}
        />
      );
      xoxpElement = (
        <TextInput
          className="bx--text-input bx--text__input"
          id="xoxp"
          // type="password"
          name="xoxp"
          labelText={
            <>
              Workspace xoxp Token <b className="fontRed">*</b>
            </>
          }
          placeholder="Workspace xoxp Token"
          // onBlur={this.handleInputChange}
          onBlur={(e) => this.handleInputChange(e)}
          onChange={(e) => this.updateValue(e)}
          defaultValue={xoxp}
        />
      );
    }
    var editFlag = false
    var workspaceModal = "";
    if (accData.length !== 0) {
        editFlag= true;
      var accountsData = accData.accountsData;
      var languageArr = accountsData.languageList;
      var submitted = accountsData.submitted;
      var saved = accountsData.saved;
      var workspaceArr = accountsData.workspaceList;
      var squadGeoList = accountsData.squadGeoList;
      var enterprise = accountsData.enterprise;
      var priorityList = [];
    if(accountsData.allowedPriorities != undefined){
        priorityList = accountsData.allowedPriorities;
    }else{
        priorityList = ["1"];
    }
    for(var i = 0; i<priorityList.length;i++){
        if(priorityList[i] == "2"){
          p2Priority = true; 
        }
        if(priorityList[i] == "3"){
          p3Priority = true;
        }else if(priorityList[i] == "4"){
          p4Priority = true;
        }
    }
      

      var savedBtn = "";
      if (submitted == false && (saved == true || saved == false)) {
        savedBtn = (
          <Button
            className="btnMargin saveData"
            kind="secondary"
            onClick={this.submitAndContinue}
          >
            Save
          </Button>
        );
      }
      if (submitted == true && (saved == true || saved == false)) {
        savedBtn = "";
      }
      Object.entries(languageArr).map(([key, value]) => {
        if (value.languageName != "English") {
          formOptionLang = (
            <option
              className="bx--select-option"
              defaultValue={value.languageName}
              selected={value.languageName == accountsData.defaultLanguage}
            >
              {value.languageName}
            </option>
          );
          itemsLanguage.push(formOptionLang);
        }
      });
      
      if(this.props.values.collaborationTool === "Teams" ){
        workspaceArr = workspaceArr.filter(workspaceObj => {
          if(workspaceObj.workspaceType){
              if(workspaceObj.workspaceType.toLowerCase() === 'teams'){
                  return workspaceObj;
              }
          }
      })
      }else {
        workspaceArr = workspaceArr.filter(workspaceObj => {
          if(workspaceObj.workspaceType){
              if(workspaceObj.workspaceType.toLowerCase() !== 'teams'){
                  return workspaceObj;
              }
          }else {
              return workspaceObj;
          }
      })
      }
      Object.entries(workspaceArr).map(([key, value]) => {
        if(this.props.values.collaborationTool === "Teams"){
          if(value.workspaceType && value.workspaceType.toLowerCase() === 'teams'){
            formOptionWorkspace = (
              <option
                className="bx--select-option"
                defaultValue={value.name}
                selected={value.name == accountsData.is_GTSWorkspaceInUse}
              >
                {value.name}
              </option>
            );
            itemsWorkspace.push(formOptionWorkspace);
          }
        }else {
          
          if(!value.workspaceType || value.workspaceType.toLowerCase() !== 'teams'){
            formOptionWorkspace = (
              <option
                className="bx--select-option"
                defaultValue={value.name}
                selected={value.name == accountsData.is_GTSWorkspaceInUse}
              >
                {value.name}
              </option>
            );
            itemsWorkspace.push(formOptionWorkspace);
          }
        }
      });
      for (var i = 0; i < squadGeoList.length; i++) {
        formOptionSquadGeo = (
          <option
            className="bx--select-option"
            defaultValue={squadGeoList[i]}
            selected={squadGeoList[i] == accountsData.squadGeo}
          >
            {squadGeoList[i]}
          </option>
        );
        itemsSquadGeo.push(formOptionSquadGeo);
      }
    }else{
        editFlag = false;
    }

    const addWorkspaceSlackForm = (
      <Form>
        <TextInput
          className="bx--text-input bx--text__input"
          id="workspaceAdmin"
          name="workspaceAdmin"
          labelText="Slack Workspace Admin Name"
          placeholder="Slack Workspace Admin Name"
          onBlur={this.handleInputChange}
        />
        <br />

        <TextInput
          className="bx--text-input bx--text__input"
          id="workspaceEmail"
          name="workspaceEmail"
          labelText="Slack Workspace Admin Email"
          placeholder="Slack Workspace Admin Email"
          onBlur={this.handleInputChange}
        />
        <br />
        {signingSecretElement}
        <br />
        {xoxpElement}
        <br />
        {xoxbElement}
      </Form>
    );
   const itemsWorkspaceRegion = this.props.AccData.accountsData.workspaceRegions.map(workspaceRegion => {
    return formOptionWorkspace = (
        <option
          className="bx--select-option"
          defaultValue={workspaceRegion}
          selected={workspaceRegion == this.state.region}
        >
          {workspaceRegion}
        </option>
      );
    
   });
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
          {/* <SelectItem value="NA" text="NA" />
          <SelectItem value="EU" text="EU" /> */}
          <SelectItem hidden value="" text="Choose an option" />
                      {itemsWorkspaceRegion}
        </Select>
        {/* <TextInput
          className="bx--text-input bx--text__input"
          id="workspaceName"
          name="workspaceName"
          labelText={
            <span>
              Workspace Name <b className="fontRed">*</b>
              <Tooltip>Workspace Name</Tooltip>
            </span>
          }
          placeholder="Workspace Name"
          value={this.state.workspaceName}
          onBlur={(e) => this.handleInputChange(e)}
          onChange={(e) => this.updateValue(e)}
          // defaultValue = {signingSecret}
          defaultValue={this.state.workspaceName}
        /> */}
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
    );


    return (
      <div>
        <Form color="blue" onSubmit={this.saveAndContinue}>
          <Grid>
            <Row>
              <Column>
                <Select
                  className="labelFont"
                  id="collaborationTool"
                  labelText={
                    <span>
                      Collaboration Tool <b className="fontRed">*</b>
                      <Tooltip>Collaborative Chat Plateform</Tooltip>
                    </span>
                  }
                  name="collaborationTool"
                  onChange={this.props.handleChange("collaborationTool")}
                  defaultValue={this.props.collaborationTool}
                  required
                >
                  <SelectItem value="Slack" text="Slack" />
                  <SelectItem value="Teams" text="Teams" />
                </Select>
              </Column>
              <Column>
                <div className="addWorkspaceDivMain">
                  <div className="workspaceDiv">
                    <Select
                      className="labelFont"
                      id="workspace"
                      labelText={
                        <span>
                          Select/Add Workspace <b className="fontRed">*</b>
                          <Tooltip>
                            Workspace is made up of channels <br />
                            where user can can communicate and work together.
                            User either can select existing workspace or add new
                            workspace by giving appropriate details
                          </Tooltip>
                          <a
                            className="addWorkspaceLink"
                            onClick={(e) => {
                              this.showModal();
                            }}
                          >
                            Add Workspace
                          </a>
                        </span>
                      }
                      name="workspace"
                      onChange={this.props.handleChange("workspace")}
                      // onChange={() => this.handleWorkspaceChange()}
                      defaultValue={this.props.workspace}
                      value={this.props.workspace || ''}
                      required
                    >
                      <SelectItem hidden value="" text="Choose an option" />
                      {itemsWorkspace}
                    </Select>
                    {/* <button onClick={this.togglePopup}>show popup</button> */}
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
                              {/* <TrashCan32 className="iconEditSize" aria-label="Delete Rule" title="Delete Rule"/> */}
                              {/* <svg focusable="false" preserveAspectRatio="xMidYMid meet" style="will-change: transform;" xmlns="http://www.w3.org/2000/svg" className="bx--modal-close__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M12 4.7L11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3 4.7 12 8 8.7 11.3 12 12 11.3 8.7 8z"></path></svg> */}
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
                              this.props.values.collaborationTool? this.props.values.collaborationTool === "Slack"?addWorkspaceSlackForm : addWorkspaceTeamsForm : null
                            }
                            {/* <Form>
                              <TextInput
                                className="bx--text-input bx--text__input"
                                id="workspaceAdmin"
                                name="workspaceAdmin"
                                labelText="Slack Workspace Admin Name"
                                placeholder="Slack Workspace Admin Name"
                                onBlur={this.handleInputChange}
                              />
                              <br />

                              <TextInput
                                className="bx--text-input bx--text__input"
                                id="workspaceEmail"
                                name="workspaceEmail"
                                labelText="Slack Workspace Admin Email"
                                placeholder="Slack Workspace Admin Email"
                                onBlur={this.handleInputChange}
                              />
                              <br />
                              {signingSecretElement}
                              <br />
                              {xoxpElement}
                              <br />
                              {xoxbElement}
                            </Form> */}
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
                    {/* <Button kind="tertiary" className="addWorkspace" onClick={e => {this.showModal();}}> 
                            Add Workspace
                        </Button> */}

                    {/* {workspaceModal} */}
                  </div>
                  {/* <a  className="addWorkspace" onClick={e => {this.showModal();}}> 
                        Add Workspace
                    </a> */}
                </div>
              </Column>
            </Row>

            <Row>
              <Column>
                <Select
                  className="labelFont"
                  name="defaultLanguage"
                  id="defaultLanguage"
                  labelText={
                    <span>
                      Select Default Language
                      <Tooltip>
                        Message displayed in the channel will be with respect to
                        the preferred language selected
                      </Tooltip>
                    </span>
                  }
                  // name="defaultLanguage"
                  onChange={this.props.handleChange("defaultLanguage")}
                  defaultValue={this.props.defaultLanguage}
                >
                  <SelectItem value="English" text="English" />
                  {itemsLanguage}
                </Select>
              </Column>
              <Column>
                <Select
                  className="labelFont"
                  id="incidentChannelType"
                  name="incidentChannelType"
                  labelText={
                    <>
                      Ticket Channel Type <b className="fontRed">*</b>
                    </>
                  }
                  defaultValue={this.props.incidentChannelType || ""}
                  onChange={this.props.handleChange("incidentChannelType")}
                  required
                >
                  <SelectItem value="" hidden text="Choose an option" />
                  <SelectItem
                    selected={this.props.incidentChannelType == "public"}
                    value="public"
                    text="Public"
                  />
                  <SelectItem
                    selected={this.props.incidentChannelType == "private"}
                    value="private"
                    text="Private"
                  />
                </Select>
              </Column>
            </Row>

            <Row>
              <Column>
                <Select
                  className="labelFont"
                  id="eventSource"
                  name="eventSource"
                  labelText={
                    <FormLabel>
                      What is the event source to be used with ChatOps?{" "}
                      <b className="fontRed">*</b>
                      <Tooltip>External event source</Tooltip>
                    </FormLabel>
                  }
                  onChange={this.props.handleChange("eventSource")}
                  defaultValue={this.props.eventSource || ""}
                  required
                >
                  <SelectItem value="" hidden text="Choose an option" />
                  <SelectItem
                    value="CDI"
                    text="AIOPS"
                    selected={this.props.eventSource == "CDI"}
                  />
                  <SelectItem
                    value="netcool"
                    text="Netcool"
                    selected={this.props.eventSource == "netcool"}
                  />
                  <SelectItem
                    value="other"
                    text="Other"
                    selected={this.props.eventSource == "other"}
                  />
                </Select>
              </Column>
              <Column>
                {this.props.eventSource &&
                  (values.eventSource === "CDI" ? (
                    <FormGroup
                      className="displayInlineDIv"
                      legendText={
                        <>
                          Events that should trigger ChatOps processes{" "}
                          <b className="fontRed">*</b>
                        </>
                      }
                    >
                      <div className="checkbox">
                            
                        <label className="bx--checkbox-label-text checkboxClass">
                        <input
                            type="checkbox"
                            className="checkboxInput"
                            name="p1"
                            data-value="1"
                            onChange={this.props.handleCheckboxPriority("allowedPriorities")}
                            defaultChecked={true}
                            disabled
                        />
                        p 1
                        </label>
                        <label className="bx--checkbox-label-text checkboxClass">
                            <input
                                type="checkbox"
                                className="checkboxInput"
                                name="p2"
                                data-value="2"
                                onClick={this.props.handleCheckboxPriority("allowedPriorities")}
                                defaultChecked={p2Priority}
                            />
                            p 2
                        </label>
                        <label className="bx--checkbox-label-text checkboxClass">
                            <input
                                type="checkbox"
                                className="checkboxInput"
                                name="p3"
                                data-value="3"
                                onClick={this.props.handleCheckboxPriority("allowedPriorities")}
                                defaultChecked={p3Priority}
                            />
                            p 3
                        </label>
                        <label className="bx--checkbox-label-text checkboxClass">
                            <input
                                type="checkbox"
                                className="checkboxInput"
                                name="p4"
                                data-value="4"
                                onClick={this.props.handleCheckboxPriority("allowedPriorities")}
                                defaultChecked={p4Priority}
                            />
                            p 4
                        </label>
                      </div>
                    </FormGroup>
                  ) : (
                    <Select
                      className="labelFont"
                      id="accountUtilizingNetcool"
                      name="accountUtilizingNetcool"
                      onChange={this.props.handleChange(
                        "accountUtilizingNetcool"
                      )}
                      defaultValue={this.props.accountUtilizingNetcool}
                      labelText="Does the client Netcool env allow internet based call?"
                      // defaultValue="ops"
                    >
                      <SelectItem value="ops" text="Choose an option" />
                      <SelectItem value="yes" text="Yes" />
                      <SelectItem value="no" text="No" />
                    </Select>
                  ))}
              </Column>
            </Row>

            {values.eventSource === "CDI" && (
              <Row>
                <Column>
                  <Select
                    className="labelFont"
                    id="aboveCriteria"
                    labelText="If AIOPS is used as event source should ITSM created tickets and event management tickets drive ChatOps?"
                    name="triggerChatOpsProcess"
                    onChange={this.props.handleChange("triggerChatOpsProcess")}
                    defaultValue={this.props.triggerChatOpsProcess || ""}
                  >
                    <SelectItem hidden value="" text="Choose an option" />
                    <SelectItem value="yes" text="Yes" />
                    <SelectItem value="no" text="No" />
                  </Select>
                </Column>
                <Column>
                  <TextInput
                    className="labelFont"
                    name="aiopsAccIdentifier"
                    labelText={
                      <span>
                        If Account is using AIOPS, provide account
                        identifier(AIOPS client id) <b className="fontRed">*</b>
                        <Tooltip>Unique identifier for account</Tooltip>
                      </span>
                    }
                    placeholder="AIOPS Client Id"
                    onChange={this.debouncer(500)}
                    defaultValue={this.props.aiopsAccIdentifier}
                    required
                  />
                </Column>
              </Row>
            )}
            <Row>
              <Column>
                <div className="checkbox">
                  <label className="bx--checkbox-label-text checkboxClass checkboxClassBG">
                    <input
                      type="checkbox"
                      name="enrollMaintenanceWindow"
                      className="checkboxInput"
                      defaultChecked={this.props.AccData.accountsData.enrollMaintenanceWindow}
                      onClick={this.props.handleCheckboxGsma("gsma")}
                    />
                    Enable GSMA Maintenance Window
                  </label>
                  <Tooltip className="tooltipBG">
                    If checked, user can enroll account to receive maintenance window updates
                  </Tooltip>
                </div>
              </Column>
            </Row>
            <Row>
              <Column className="border my-2 py-2">
                <Row>
                  <Column>
                    <h4 className="bx--label bold">
                      Assignment Services
                      <span class="bx--form__helper-text bold">
                        (Please select atleast one Assignment Service)
                      </span>
                    </h4>
                  </Column>
                </Row>
                <Row>
                  <Column>
                    <Grid>
                      <Row>
                        <Column>
                          <TextInput
                            className="labelFont"
                            id="emails"
                            name="defaultassignments"
                            placeholder="Email id’s of the focal/dispatcher for handling incidents"
                            labelText="Email id’s of users to add to all incident channels(Email id's , comma separated)"
                            onBlur={async (e) => {
                              
                              if(e.target.value.trim() !== this.state.defaultassignments){
                              this.setState({defaultassignments:e.target.value.trim()});
                              e.target.setCustomValidity("");
                              if (e.target.value.length == 0)
                                return this.props.handleChange(
                                  "defaultassignments"
                                )(e);
                              const emaillArr = e.target.value
                                .trim()
                                .split(",");
                              // if (
                              //   emaillArr.length > 0 &&
                              //   !emaillArr.every((email) =>
                              //     {
                              //       const allowedDomains = process.env.REACT_APP_ALLOWED_DOMAINS?.split(",") || []
                              //       const validDomain = allowedDomains.find(domain => email.toLowerCase().includes(domain + "."))
                              //       const validEmail = email.toLowerCase().includes("." + enterprise.toLowerCase() + ".") || email.toLowerCase().includes("@" + enterprise.toLowerCase() + ".");
                              //       return validDomain, validEmail
                              //     }
                              //   )
                              // )
                              //   e.target.setCustomValidity(
                              //     "Please provide a valid " + enterprise + " email id"
                              //   );
                              // else {
                                e.target.setCustomValidity("Verifying...");
                                const { valid, message } = await this.validateEmails(emaillArr, this.props.values.collaborationTool);
                                
                                if (valid) {
                                  // if(this.props.values.collaborationTool.toLowerCase() === 'teams'){
                                    // To be uncommented ***********************************************
                                    // if(emaillArr.length >= 3){
                                    //   e.target.setCustomValidity("");
                                    //   this.props.handleChange("defaultassignments")(e);
                                    // }else {
                                    //   e.target.setCustomValidity("Enter at least 3 Email Ids in case of Teams collaboration tool");
                                    // }
                                  // }else {
                                    e.target.setCustomValidity("");
                                    this.props.handleChange("defaultassignments")(e);
                                  // }
                                  
                                } else{
                                  e.target.setCustomValidity(message);
                                } 
                              // }
                            }else{
                              this.setState({defaultassignments:e.target.value.trim()});
                            }
                           }
                          }
                            defaultValue={this.props.defaultassignments}
                            value={this.props.defaultassignments || ""}
                            // value={this.state.defaultassignments || ""}
                            // onChange={(e) => this.setState({defaultassignments:e.target.value.trim()})}
                            onChange={(e) => this.props.handleChange("defaultassignments")(e)}
                          />
                        </Column>
                      </Row>
                      <Row>
                        <Column>
                          <Select
                            className="labelFont"
                            id="assignmentServiceToAssignResource"
                            labelText="Source for assigning incident channel owner"
                            // defaultValue="icd"
                            name="assignmentServiceToAssignResource"
                            onChange={this.props.handleChange(
                              "assignmentServiceToAssignResource"
                            )}
                            defaultValue={
                              this.props.assignmentServiceToAssignResource
                            }
                          >
                            <SelectItem value="" text="Choose an option" />
                            <SelectItem value="cdi" text="AIOPS" />
                            <SelectItem value="service_now" text="ServiceNow" />
                            <SelectItem value="icd" text="ICD" />
                          </Select>
                        </Column>

                        <Column>
                          {values.assignmentServiceToAssignResource ===
                            "cdi" && (
                            <TextInput
                              className="labelFont"
                              id="CDITicketToolID"
                              labelText="AIOPS Ticket Tool ID"
                              placeholder="AIOPS Ticket Tool ID"
                              name="CDITicketToolID"
                              onChange={this.props.handleChange(
                                "CDITicketToolID"
                              )}
                              defaultValue={this.props.CDITicketToolID}
                            />
                          )}
                        </Column>
                      </Row>
                      {values.eventSource == "CDI" && (
                        <Row>
                          <Column>
                            <Select
                              className="labelFont"
                              id="squareAssignments"
                              labelText="Squad Based Assignments"
                              name="squadBasedAssignment"
                              onChange={this.props.handleChange(
                                "squadBasedAssignment"
                              )}
                              defaultValue={values.squadBasedAssignment || ""}
                            >
                              <SelectItem
                                hidden
                                value=""
                                text="Choose an option"
                              />
                              <SelectItem
                                value="yes"
                                text="Yes"
                                selected={values.squadBasedAssignment == "yes"}
                              />
                              <SelectItem
                                value="no"
                                text="No"
                                selected={values.squadBasedAssignment == "no"}
                              />
                            </Select>
                          </Column>
                          <Column>
                            {values.squadBasedAssignment === "yes" && (
                              <Select
                                className="labelFont"
                                name="aiopsSquadGeo"
                                id="aiopsSquadGeo"
                                labelText={
                                  <>
                                    AIOPS Squad Geo <b className="fontRed">*</b>
                                  </>
                                }
                                defaultValue={this.props.aiopsSquadGeo}
                                onChange={this.props.handleChange(
                                  "aiopsSquadGeo"
                                )}
                                required
                              >
                                <SelectItem
                                  disabled
                                  defaultValue="noSquadGeo"
                                  text="Choose an option"
                                />
                                {itemsSquadGeo}
                              </Select>
                            )}
                          </Column>
                        </Row>
                      )}
                      <Row>
                        {/* <Column>
                <Select
                    className="labelFont"
                    id="gnmAssignments"
                    labelText="GNM Assignments"
                    defaultValue={accData.accountsData?.GNMAssignment}
                    name="gnmAssignments"
                    onChange={this.props.handleChange('gnmAssignments')}
                    disabled
                >
                    <SelectItem value="opts" text="Choose an option" />
                </Select>
              </Column> */}
                        <Column>
                          <Select
                            className="labelFont"
                            id="groupAssignments"
                            labelText={
                              <FormLabel>
                                Group Assignments
                                <Tooltip>
                                  Group member gets assigned to Incident
                                  channel
                                </Tooltip>
                              </FormLabel>
                            }
                            name="groupAssignment"
                            onChange={this.props.handleChange(
                              "groupAssignment"
                            )}
                            defaultValue={values.groupAssignment || ""}
                          >
                            <SelectItem
                              hidden
                              value=""
                              text="Choose an option"
                            />
                            <SelectItem value="yes" text="Yes" />
                            <SelectItem value="no" text="No" />
                          </Select>
                        </Column>
                        <Column></Column>
                      </Row>
                      {values.groupAssignment === "yes" && (
                        <>
                          <Row>
                            <Column>
                              {/* <div className="BGLabelDiv"> */}
                              <h4 className="bx--label">
                                Add Group Details(Group names's and
                                rules) <b className="fontRed">*</b>{" "}
                                <Tooltip>
                                  Group members get assigned according to
                                  the rule set.
                                </Tooltip>
                              </h4>
                              {/* </div> */}
                            </Column>
                            <Column>
                              <a
                                className="addBGBtn addWorkspaceLink"
                                onClick={this.addGroup}
                              >
                                Add Group
                              </a>
                            </Column>
                          </Row>
                          <Row>
                            <Column>
                              <div className="rulesDivStyle">
                                {this.state.groupField.map(
                                  (v, i) =>
                                    v && (
                                      <Row key={"b" + i}>
                                        <Column>
                                          <div className="RulesDiv2">
                                            <div className="rulesSubDiv">
                                              <TextInput
                                                style={{ margin: "10px" }}
                                                id={"groupName" + i}
                                                name={"groupName" + i}
                                                onChange={this.props.handleChange(
                                                  "groupName"
                                                )}
                                                defaultValue={
                                                  typeof v === "object"
                                                    ? v[0]
                                                    : ""
                                                }
                                                value={this.props["groupName" + i]}
                                                className="labelFont"
                                                labelText=""
                                                placeholder="Group Name"
                                                required
                                              />
                                              <TextInput
                                                style={{ margin: "10px" }}
                                                readOnly
                                                id={"groupRules" + i}
                                                name={"groupRules" + i}
                                                labelText=""
                                                onChange={this.props.handleChange(
                                                  "groupRules"
                                                )}
                                                className="labelFont bgRulesTitle"
                                                placeholder="No Rules applied"
                                                defaultValue={
                                                  typeof v === "object"
                                                    ? v[1]
                                                    : ""
                                                }
                                                value={
                                                  this.props["groupRules" + i]
                                                }
                                                required
                                              />
                                            </div>
                                            <div className="iconDiv">
                                              <AddRules
                                                key={"group" + i}
                                                index={"group" + i}
                                                rulesFor="group"
                                                accountsData={
                                                  this.props.AccData
                                                    .accountsData
                                                }
                                                onAddRules={(rules) =>
                                                  this.props.registerState(
                                                    "groupRules" + i,
                                                    rules
                                                  )
                                                }
                                              />
                                              <TrashCan32
                                                className="iconEditSize"
                                                aria-label="Delete Rule"
                                                title="Delete Rule"
                                                onClick={() =>
                                                  this.deleteGroup(i)
                                                }
                                              />
                                            </div>
                                          </div>
                                        </Column>
                                      </Row>
                                    )
                                )}
                              </div>
                            </Column>
                          </Row>
                        </>
                      )}
                    </Grid>
                  </Column>
                </Row>
              </Column>
            </Row>

            <Row>
              <Column>
                {/* <div className="BGLabelDiv"> */}
                <h4 className="bx--label">
                 <span>
                  Workspace {this.props.collaborationTool.toLowerCase()}  channels that will act as index channel{" "}</span>
                  <b className="fontRed">*</b>{" "}
                  <Tooltip>
                    Index channel displays consolidated Ticket details.
                  </Tooltip>
                </h4>
                {/* </div> */}
              </Column>
              <Column>
                <a
                  className="addBGBtn addWorkspaceLink"
                  onClick={this.addChannel}
                >
                  Add Channel
                </a>
              </Column>
            </Row>
            <Row>
              <Column>
                <div className="rulesDivStyle">
                  {this.state.channelField.map(
                    (v, i) =>
                      v && (
                        <div key={"ch" + i}>
                          <Row>
                            <Column>
                              <div className="RulesDiv2">
                                <div className="rulesSubDiv">
                                  <TextInput
                                    style={{ margin: "13px 10px" }}
                                    className="labelFont"
                                    id={"channel-groupName" + i}
                                    name={"indexChannel" + i}
                                    placeholder={`Workspace ${this.props.collaborationTool.toLowerCase()} Channel that will act as index channel`}
                                    labelText=""
                                    onChange={this.props.handleChange(
                                      "indexChannel"
                                    )}
                                    defaultValue={
                                      typeof v === "object" ? v[0] : ""
                                    }
                                    value={this.props["indexChannel" + i]}
                                    required
                                  />
                                  <TextInput
                                    style={{ margin: "13px 10px" }}
                                    className="labelFont ruleTitle"
                                    name={"channelRules" + i}
                                    onChange={this.props.handleChange(
                                      "channelRules"
                                    )}
                                    labelText=""
                                    readOnly
                                    id={"channelRules" + i}
                                    placeholder="No Rules applied"
                                    value={this.props["channelRules" + i]}
                                    defaultValue={
                                      typeof v === "object" &&
                                      typeof v[1] === "object"
                                        ? v[1][0]
                                        : ""
                                    }
                                    required
                                  />
                                  <Select
                                    style={{
                                      margin: "10px !important",
                                      padding: "0 !important",
                                    }}
                                    className="labelFont ruleTitle"
                                    id="workspace"
                                    labelText=""
                                    name={"workspaceRules" + i}
                                    onChange={this.props.handleChange(
                                      "workspaceRules"
                                    )}
                                    defaultValue={
                                      typeof v ===
                                      ("object" && typeof v[1] === "object")
                                        ? v[1][1]
                                        : ""
                                    }
                                    value={
                                      this.props["workspaceRules" + i] || ""
                                    }
                                    required
                                  >
                                    <SelectItem
                                      value=""
                                      hidden
                                      text="Choose an option"
                                    />
                                    {itemsWorkspace}
                                  </Select>
                                </div>
                                <div className="iconDiv">
                                  <AddRules
                                    key={"channel" + i}
                                    index={"channel" + i}
                                    rulesFor="channel"
                                    accountsData={
                                      this.props.AccData.accountsData
                                    }
                                    onAddRules={(rules) =>
                                      this.props.registerState(
                                        "channelRules" + i,
                                        rules
                                      )
                                    }
                                  />
                                  <TrashCan32
                                    className="iconEditSize"
                                    aria-label="Delete Rule"
                                    title="Delete Rule"
                                    onClick={() => this.deleteChannel(i)}
                                  />
                                </div>
                              </div>
                            </Column>
                          </Row>
                        </div>
                      )
                  )}
                </div>
              </Column>
            </Row>
          </Grid>
          <div className="my-2">
            <b className="fontRed">{this.state.error}</b>
          </div>
          <div className="btnCommon">
            <Button className="btnMargin" onClick={this.back}>
              Back
            </Button>
            <div>{savedBtn}</div>
            <Button
              type="submit"
              className="btnMargin btnLast"
              disabled={!this.props.generalFormSubmitted}
            >
              Continue{" "}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default ConfigForm;
