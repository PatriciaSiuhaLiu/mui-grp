import React from 'react';
import {
  Button,
  Checkbox,
  Select,
  SelectItem,
  Form,
  FormGroup,
  TextInput,
  RadioButton,
  TextArea,
  RadioButtonGroup
} from "carbon-components-react";
import { trackPromise } from "react-promise-tracker";
import { withRouter } from 'react-router-dom';
class WorkspaceTrack extends React.Component {
  state = {
    workspaceName: "",
    email: "",
    contractual_obligation: "",    
    workspaceUrl: "",
    others: "",
    access_management: "",
    others_reason: "",        
    workspace_justification: "",
    dpeOrExecutive: "",
    workspaceData: { ownerSubmission: {} },
    allWorkspaceData: [],
    uniqWorkspaceNames: []
  };

  componentDidMount() {
    const search = this.props.location.search;
    const recordId = new URLSearchParams(search).get("id");
    let payload;
    if(recordId != undefined){
      payload = JSON.stringify({id: recordId});
    }else{
      payload = "";
    }
      trackPromise(fetch('/mui/getWorkspaceData', {
        method: "POST",
        headers: {
            'Content-type': 'application/json'
        },
        body: payload
      })
      .then(res => {
          return res.json()
      })
      .then(accData => {
          if(recordId){
            this.setState({ workspaceData: accData.WorkspaceData.responseHash[0] });               
            this.setState({ email: accData.WorkspaceData.responseHash[0].email });               
            this.setState({ workspaceName: accData.WorkspaceData.responseHash[0].workspaceName });               
            this.setState({ others: accData.WorkspaceData.responseHash[0].ownerSubmission.others });   
            this.setState({ uniqWorkspaceNames: [accData.WorkspaceData.responseHash[0].workspaceName] });    
          }else{
            this.setState({ uniqWorkspaceNames: accData.WorkspaceData.responseHash });               
            this.setState({ email: accData.WorkspaceData.user });               
          }
      }))    
  }
  
  checkWorkspaceDetails = (e) => {
    let workSpaceName = document.getElementById("workspaceName").value;
    let emailVal = document.getElementById('email').value;
    if(workSpaceName && emailVal){
    trackPromise(fetch('/mui/getWorkspaceData', {
      method: "POST",
      headers: {
          'Content-type': 'application/json'
      },
      body: JSON.stringify({email: emailVal.toLowerCase(), workspaceName: workSpaceName})
    })
    .then(res => {
        return res.json()
    })
    .then(wrkSpaceData => {               
      let workspaceObj = wrkSpaceData.WorkspaceData.responseHash[0];
    
      if(workspaceObj){                
        if(workspaceObj.ownerSubmission.workspace_justification){
          this.setState({ workspaceName: workspaceObj.workSpaceName });
          this.setState({ email: workspaceObj.email });
          this.setState({workspaceData: workspaceObj});
          document.getElementById("submit-now").disabled = true;
        }else{
          this.setState({ workspaceName: workspaceObj.workSpaceName });
          this.setState({ email: workspaceObj.email });
          this.setState({workspaceData: { ownerSubmission: {} }});
          document.getElementById("submit-now").disabled = false;
          document.getElementById("contractual_obligation").checked = false;      
          document.getElementById("others").checked = false;
          document.getElementById("others_reason").value = "";
          document.getElementById("workspace_justification").value = "";
          document.getElementById("dpeOrExecutive").value = ""; 
          document.getElementById("workspaceUrl").value = ""; 
        }   
      }else{
        alert("Invalid workspace Name and email combination. Please recheck and enter again.");
        this.setState({workspaceData: { ownerSubmission: {} }});
        document.getElementById("submit-now").disabled = true;
      }      
    }))
  }else{
    alert("Please enter workspace Name and your email!");
    return;
  }
    
  };

  handleInputChange = (e) => {
    this.setState({ workspaceName: e.target.value });
  }

  submitHandler = (e) => {
    e.preventDefault();
    if (this.state.dpeOrExecutive === "" || this.state.workspace_justification === "") {
      alert("All the fields are mandatory!");
      return;
    }else{
      let data = this.state;      
      const search = this.props.location.search;
      const recordId = new URLSearchParams(search).get("id");
      data.recordId = recordId;
      let workSpaceName = document.getElementById("workspaceName").value; 
      data.workspaceName = workSpaceName;
      trackPromise(
        fetch('/mui/saveWorspaceAdminAnswers' , {
        method: "POST",
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then((result) => {
          if(result.status == 200){
            console.log('saved');
            this.props.history.push("/mui/thankyou");
        }
   })
    .catch(err => { 
      console.log(err);
    })
    )
    }

    
  };

  render() {   
    let email, workspaceOptions, workSpaceName, ownerName, workspaceUrl, othersReason, contractOblig, accessMgmt, othersCheck, loggedInText, dpeOrExecutive, wrkSpaceJustification;
    let headerText1 = "A request for additional workspace requires significant business justification that includes contractual obligation or internal audit/CISO requirements for eDiscovery.";
    let headerText2 = "Note that data migration is not included in the exception process and is only for the creation of the workspace in the Kyndryl grid.";
    let headerText3 = "Note this does not include migration of the workspace data. This request is for having a dedicated workspace created in the Kyndryl Slack instance only.";
    if(this.state.workspaceData){
      workSpaceName = this.state.workspaceData['workspaceName'];
      email = this.state.workspaceData['email'];
    }
      if(this.state.uniqWorkspaceNames){
      let worspacesData = this.state.uniqWorkspaceNames;
    
      workspaceOptions = [];
      let workspaceNames = [];
      if(worspacesData){
        workspaceOptions.push((
          <option
            className="bx--select-option"
            defaultValue=""           
          >            
          </option>
        ))
        for (var i = 0; i < worspacesData.length; i++) {                    
          let data = worspacesData[i];
          workspaceOptions.push((
            <option
              className="bx--select-option"
              defaultValue={data}
              selected={data == this.state.workspaceName}
            >
              {data}
            </option>
          ))
        } 
      }
    }
    
    if(Object.keys(this.state.workspaceData.ownerSubmission).length > 0){
      console.log("insdie submission entry");
      let ownerSubmission = this.state.workspaceData.ownerSubmission
      contractOblig = ownerSubmission.contractual_obligation;      
      othersCheck = ownerSubmission.others;      
      dpeOrExecutive = ownerSubmission.dpeOrExecutive;      
      workspaceUrl = ownerSubmission.workspaceUrl;      
      wrkSpaceJustification = ownerSubmission.workspace_justification;      
      othersReason = ownerSubmission.others_reason;      
      document.getElementById("contractual_obligation").checked = contractOblig;      
      document.getElementById("others").checked = !othersCheck ? false : othersCheck;
      document.getElementById("others_reason").value = othersReason;
      document.getElementById("submit-now").disabled = true;
      document.getElementById("workspace_justification").value = wrkSpaceJustification;
      document.getElementById("dpeOrExecutive").value = dpeOrExecutive; 
      document.getElementById("workspaceUrl").value = workspaceUrl; 
      loggedInText = "We see that you have already filled the details for this request, hence submit is not allowed."          
    }
    return (
      <div className="divContainer">      
      <section className="sectionMargin mainMargin">
    <h3>Exception Request: </h3>    
    <br/>
        <Form className="formMain" onSubmit={this.submitHandler}>
        <div style={{color:' red'}}>{loggedInText}</div>
        <br/>
        <div>{headerText1}</div>
        <br/>       
        <div>{headerText2}</div>
        <br/>       
        <div>{headerText3}</div>
        <br/>
        <br/>
          <div className="field">            
            
            <Select
              className="workspaceName"
              id="workspaceName"
              name="workspaceName"
              labelText={
               <>
                Select Workspace Name <b className="fontRed">*</b>
              </> }
              onChange={(e) => this.checkWorkspaceDetails(e)} 
              required
              > {workspaceOptions}
            </Select>
          </div>
          <div className="field">            
            <TextInput
              labelText="Owner Email"              
              name="workspaceOwnerEmail"
              id="email"
              placeholder="workspace Owner Email"              
              value={this.state.email}              
              onChange={(e) => this.checkWorkspaceDetails(e)}
            />
          </div>
          <div className="field">            
            <TextInput            
              labelText="Supporting Executive (VP or higher): "              
              name="dpeOrExecutive"
              placeholder="Supporting Executive (VP or higher)"
              id="dpeOrExecutive"
              required              
              value={dpeOrExecutive}
              onBlur={(e) => this.setState({ dpeOrExecutive: e.target.value })}
            />
          </div>
          <div className="field">            
            <TextInput            
              labelText="Workspace URL: "              
              name="workspaceUrl"
              placeholder="Enter Workspace URL"
              id="workspaceUrl"
              required              
              value={workspaceUrl}
              onChange={(e) => this.setState({ workspaceUrl: e.target.value })}
            />
          </div>
          <div className="field">          
            <Checkbox
              labelText="Contractual Obligation"
              name="contractual_obligation"
              id="contractual_obligation"
              placeholder="Contractual Obligation"
              value={this.state.contractual_obligation}
              defaultChecked={contractOblig}
              onChange={(isChecked) => this.setState({ contractual_obligation: isChecked })}
            />
          </div>
          
          <div className="field">            
            <Checkbox
              labelText="Others"              
              name="others"
              id="others"
              value={this.state.others}
              onChange={(isChecked) => this.setState({ others: isChecked })}
            />
          </div>
          <div className="field" style={{display: this.state.others ? 'block' : 'none'}}>            
            <TextInput
              labelText="Others Reason"              
              name="others_reason"
              id="others_reason"
              placeholder="Others Reason"              
              onChange={(e) => this.setState({ others_reason: e.target.value })}
              value={othersReason}
            />
          </div>                    
          <div className="field">           
            <TextArea
                labelText={<>Justification (Include extract from contract for contractual obligation) <b style={{ color: "red" }}>*</b> <span className="specialCharacterLabel">(Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | ? ~ are not allowed)</span></>}
              required
              name="workspace_justification"
              id="workspace_justification"
              placeholder="Workspace Justification"              
              cols= "50"
              rows= "4"
              onChange={(e) => this.setState({ workspace_justification: e.target.value })}
              value={wrkSpaceJustification}
            />
          </div>
          <br></br><br></br>
          
          <Button type="submit" className="submit-now" id="submit-now" onClick={this.submitHandler}>
            Submit
          </Button>
       
        </Form>
      </section>
      
  </div>
    );
  }
}
export default withRouter(WorkspaceTrack);
