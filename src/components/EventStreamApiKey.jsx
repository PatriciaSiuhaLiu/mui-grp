import React, { Component } from "react";
import { CodeSnippet, Column, Grid, Row, Checkbox, Button, Form, TextArea } from "carbon-components-react";
import { trackPromise } from "react-promise-tracker";
import { withRouter } from 'react-router-dom';
import "./forms/form.scss";
import {CheckmarkFilled32, CloseFilled32} from "@carbon/icons-react";
import { validate } from '../validation/validate.js';
class EventStreamApiKey extends Component {
  state = {
    data: this.props.stream.esData,
    accData: this.props.stream.accountData,
    ssData: this.props.stream.ssData,
    editNow: false,
    streamJson: "",
    resErrMsg: "",
    esEnabled: this.props.stream.accountData.pushToEventStream,
    eventStreamsConfig: "",
    showSuccess: "",
    showFailure: ""
  };

  editForm = (e) => {  
    e.preventDefault();  
    this.setState({
      editNow: true,
      eventStreamsConfig: this.state.streamJson
    });
  }

  formSubmit= (e) => {
    e.preventDefault();
   
    const eventStreamData = {
        name: this.state.accData.accountCode,
        configuration: this.state.eventStreamsConfig,
        eventStreamEnabled: this.state.esEnabled
    };
     // SpecialCharacter validation
    var validateFields = validate(eventStreamData);
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
        trackPromise(
            fetch('/mui/saveAccountBasedES' , {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(eventStreamData)
        })
        .then((result) => {      
            if (result.status === 404 || result.status === 400 || result.status === 500)  {
                result.json().then((object)=> {
                    this.setState({resErrMsg: object.eventStreamsError});
                })
            } else if (result.status === 409) {
                result.json().then((object)=> {
                    this.setState({resErrMsg: object.eventStreamsError});
                })
            } else if(result.status == 200){            
                // this.props.history.push("/mui/onboardAccount");
                window.location = "/mui/onboardAccount";
            }
    })
        .catch(err => { 
        this.setState({errorMessage: err.message});
        })
        )
    }
}

  checkConnection = (e) => {
    e.preventDefault();
    const eventStreamData = {
      name: this.state.accData.accountCode,
      configuration: this.state.eventStreamsConfig
    };
    trackPromise(
      fetch('/mui/checkEventStreamConnection' , {
      method: "POST",
      headers: {
          'Content-type': 'application/json'
      },
      body: JSON.stringify(eventStreamData)
    })
    .then((result) => {      
      if (result.status === 404 || result.status === 400 || result.status === 500)  {
          result.json().then((object)=> {
            this.setState({showFailure: true});
            this.setState({showSuccess: false});
          })
      } else if (result.status === 409) {
          result.json().then((object)=> {
            this.setState({showFailure: true});
            this.setState({showSuccess: false});
          })
      } else if(result.status == 200){          
          // this.props.history.push("/mui/onboardAccount");
          // window.location = "/mui/onboardAccount";
          this.setState({showSuccess: true});
          this.setState({showFailure: false});
      }
 })
  .catch(err => { 
    this.setState({showFailure: true});
    this.setState({showSuccess: false});
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

  handleCheckbox = () => {
    this.setState({ esEnabled: document.getElementById("pushToEventStream").checked });    
  }

  render() {    
    this.state.streamJson = JSON.stringify(this.state.data);
    var viewData = '';
    let pushToEventStreamBool;    
    if(this.state.ssData){
      pushToEventStreamBool = (this.state.ssData.pushToEventStream ? this.state.ssData.pushToEventStream : false);
    }
    if(this.state.data && this.state.streamJson && !this.state.editNow){
      viewData = (
        <Form onSubmit={this.editForm}>
              <CodeSnippet
                  type="multi"
                  onClick={() => {
                    navigator.clipboard.writeText(this.state.streamJson);
                  }}
                >
                  {this.state.streamJson && this.state.streamJson.replaceAll(",", ", \n")}
              </CodeSnippet>   
                <br></br> 
                <Button kind="primary" type="submit" className="btnSACss" >Edit</Button>  
        </Form>         
      );
    }else{
      viewData = (
                  <Form  onSubmit={this.formSubmit}>
                      <TextArea
                          cols={50}
                          id="eventStreamsConfig"
                          name="eventStreamsConfig"
                          helperText="Provide proper json with name/value pairs, that begins with { left brace and ends with } right brace. Each name should be followed by : colon and the name/value pairs separated by , comma"
                          onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} 
                          defaultValue={this.state.streamJson} 
                          required
                          labelText={ <> Configurations<b className="fontRed">*</b> </> }
                          placeholder="Enter EveentStream Configurations"
                          rows={8}
                      />
                      {
                          this.state['resErrMsg'] && 
                          <small className="fontRed">
                          <b className="blgrperrorMsg">{this.state.resErrMsg.jsonErr}</b>
                          </small>
                      }
                       <br>
                      </br> 
                        <Checkbox
                          labelText="Enable Event Stream"
                          name="pushToEventStream"
                          id="pushToEventStream"
                          placeholder="Enable Event Stream"
                          defaultChecked={pushToEventStreamBool} 
                          onClick={(event) => { this.handleCheckbox()}}
                        />
                      <br>
                      </br> 
                        {
                            this.state['specialCharacterErr'] &&
                            <small className="fontRed">
                                <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                            </small>
                        }
                         <br>
                      </br> 
                      <div className="checkConnection">
                        <Button kind="primary" type="submit" className="btnSACss" id="BTNSubFinal" >Submit</Button>
                        <Button kind="warning" type="submit" className="btnSACss" onClick={this.checkConnection} >Test Connection</Button>
                        {/* <a href="#" className="checkConnectionLink" onClick= {this.checkConnection}>Test Connection
                        </a> */}
                        {this.state.showSuccess ? (
                        <CheckmarkFilled32 className="connectionSuccess"/>) : null}
                        {this.state.showFailure ? (
                        <CloseFilled32 className="connectionFailure"/>) : null}
                      </div>
                  </Form>
      );
    }   
    return (
      <div className="width80 p-2 center">
        <Grid>
          <Row>
            <Column>
              <div className="my-2">
                {viewData}                         
              </div>
            </Column>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default EventStreamApiKey;
