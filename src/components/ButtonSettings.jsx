import React, { Component } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  Column,
  Grid,
  Row,
  Select,
  SelectItem,
  Tooltip,
  InlineNotification,
} from "carbon-components-react";

import { trackPromise } from "react-promise-tracker";

class ButtonSettings extends Component {
  state = {
    updateStatus: "enabled",
    addComment: true,
    toolInitiateComment: true,
    enableOwner: "",
    showNotification: false,
    notificationProps: {
        kind: "error",
        lowContrast: false,
        role: "alert",
        title: "",
        subtitle: "",
        iconDescription: "describes the close button",
        statusIconDescription: "describes the status icon",
        hideCloseButton: false,
      }
  };

  componentDidMount() {
      console.log(`${this.props.updateStatus}----${this.props.addComment}----${this.props.toolInitiateComment}`);
    this.setState({
        updateStatus : this.props.updateStatus,
        addComment : this.props.addComment,
        toolInitiateComment : this.props.toolInitiateComment,
        enableOwner : this.props.enableOwner,
    });
  }

  /**
   * @description Toggle showNotification property for inline error notification
   * @param {*} flag
   */
   toggleErrorNotification = (flag) => {
    this.setState((prevState) => ({
      ...prevState,
      showNotification: flag,
    }));
  };


  submitAndContinue = (e) => {
    e.preventDefault();
    const saveButtonData = {
        statusEnabled: this.state.updateStatus,
        commentsEnabled: this.state.addComment,
        toolInitiateComment: this.state.toolInitiateComment,
        enableOwner: this.state.enableOwner ?? "",
        acc_id: this.props.accId
    };
    console.log(`saveButtonData-----${JSON.stringify(saveButtonData)}`);
    trackPromise( fetch("/mui/saveAccountButtonSettings",
      {
        method: "POST",
        headers: {
                "Content-type": "application/json",
              },
        body: JSON.stringify(saveButtonData),
      }).then(async (result) => {
            if (result.status == 200) {
              const { status, message } = await result.json();
              this.setState((prevState) => ({
                showNotification : true,
                notificationProps: {
                    ...prevState["notificationProps"],
                    subtitle: message,
                    kind: status === 'ok' ? 'success' : 'error',
                    title: status === 'ok' ? 'Success: ' : 'Error: ', 
                  }
              }));
            }
      })
       
      );
  };
  
  handleChange = (e) => {
    const {value, name} = e.target;
    let finalVal = value;
    if(name === 'addComment' || name === 'toolInitiateComment'){
        finalVal = value === "enabled" ? true : false;
    }
    this.setState({
        [name]: finalVal
    })
    
  }

  render() {
    let inlineNotification = (
        <InlineNotification {...this.state.notificationProps} onCloseButtonClick={() =>  {this.toggleErrorNotification(false)}} />
      );
    return (
        <div>
            <div className="itsm-settings-notification">
                {this.state.showNotification && inlineNotification}
            </div>
            <Row>
                <Column>
                <div className="width80 itsm-settings-accordion p-2 shadow center">
                    <Accordion>
                    <AccordionItem title='ITSM Settings'>
                        <Grid>
                        <Row>
                            <Column lg={4}>
                                <div className="display-inline-flex">
                                <Select
                                    className="labelFont"
                                    id="updateStatus"
                                    labelText={
                                    <>
                                        Update Status <b className="fontRed">*</b>
                                        <Tooltip>
                                            <b>Read and Write Disabled</b> :: Incident status wouldn't display in the channel dashboard and no status update would happen in ITSM system via channel <br /><br />
                                            <b>Read and Write Enabled</b> :: Incident status would be retrieved from ITSM system and status update can be done via channel<br /><br />
                                            <b>Read Only - No Write</b> :: Incident status would be retrieved from ITSM system but no update would happen via channel 
                                        </Tooltip>
                                    </>
                                    }
                                    defaultValue={this.props.updateStatus ||  "enabled"}
                                    name="updateStatus"
                                    onChange={this.handleChange}
                                    required
                                >
                                    <SelectItem value="enabled" text="Read and Write enabled" />
                                    <SelectItem value="disabled" text="Read and Write disabled" />
                                    <SelectItem value="read" text="Read Only - No Write" />
                                </Select>
                                </div>
                            </Column>
                            <Column lg={4}>
                                <div className="display-inline-flex">
                                <Select
                                    className="labelFont"
                                    id="addComment"
                                    labelText={
                                    <>
                                        Add Comment <b className="fontRed">*</b>
                                        <Tooltip>
                                            <b>Disabled</b> :: Comments can't be added to the ITSM system<br /><br />
                                            <b>Enabled</b> :: Comments can be added to the ITSM system 
                                        </Tooltip>
                                    </>
                                    }
                                    defaultValue={this.props.addComment ? "enabled" : "disabled"}
                                    name="addComment"
                                    onChange={this.handleChange}
                                    required
                                >
                                    <SelectItem value="disabled" text="Disabled" />
                                    <SelectItem value="enabled" text="Enabled" />
                                </Select>
                                </div>
                            </Column>
                            <Column lg={4}>
                                <div className="display-inline-flex">
                                <Select
                                    className="labelFont"
                                    id="toolInitiateComment"
                                    labelText={
                                    <>
                                        Channel Info update on ITSM <b className="fontRed">*</b>
                                        <Tooltip>
                                            <b>Disabled</b> :: Channel details willn't get added to the ITSM as comments<br /><br />
                                            <b>Enabled</b> :: Channel details will get added to the ITSM as comments 
                                        </Tooltip>
                                    </>
                                    }
                                    defaultValue={this.props.toolInitiateComment ? "enabled" : "disabled"}
                                    name="toolInitiateComment"
                                    onChange={this.handleChange}
                                    required
                                >
                                    <SelectItem value="disabled" text="Disabled" />
                                    <SelectItem value="enabled" text="Enabled" />
                                </Select>
                                </div>
                            </Column>
                            
                        </Row>
                        <Row>
                            <Column lg={6}>
                    <div className="itsmGroup">
                                    
                                            <Select
                                            className="labelFont"
                                                id="enableOwner"
                                                labelText={
                                                <span>Owner Assignment on ITSM System 
                                                <Tooltip>Assigns owner to the Incident via collaboration platform,<br /><br />
                                                    Option 1 - Assignment of the owner can't be done<br /><br />
                                                    Option 2 - If the email id of the user in the collaboration platform and the ITSM sysem are the same, this option can be selected<br /><br />
                                                    Option 3 - If the email id of the user in the collaboration platform and the ITSM sysem is different, this option can be selected
                                                </Tooltip>
                                                </span>
                                                }
                                                name="enableOwner"
                                                onChange={this.handleChange}
                                                defaultValue={this.props.enableOwner || ""}
                                            >
                                                <SelectItem
                                                hidden
                                                value=""
                                                text="Choose an option"
                                                />
                                                <SelectItem value="disabled" text="Disabled" selected={this.props.enableOwner === "disabled"} />
                                                <SelectItem value="enableSameOwner" text="Enable Owner Assignment if email id on the Collaboration platform and ITSM System are the same" selected={this.props.enableOwner === "enableSameOwner"} />
                                                <SelectItem value="enableDiffOwner" text="Enable Owner Assignment if email id on the Collaboration platform and ITSM System are different" selected={this.props.enableOwner === "enableDiffOwner"} />
                                            </Select>
                                    <br />
                                </div>
                            </Column>
                            <Column lg={6} className='save-button'>
                                <div className="btnCommon">
                                    <div>
                                    <Button
                                        className="btnMargin saveData"
                                        kind="secondary"
                                        key="saveData"
                                        onClick={this.submitAndContinue}
                                    >
                                        Save
                                    </Button>
                                    </div>
                                </div>
                            </Column>
                        </Row>
                        </Grid>
                        
                    </AccordionItem>
                    </Accordion>
                </div>
                </Column>
            </Row>
        </div>
    );
  }
}

export default ButtonSettings;
