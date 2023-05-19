import React from 'react';
import ReactDOM from 'react-dom';
import { SelectItem, Select, Form,UnorderedList, ListItem,Grid, Row, Column, TextInput, Tooltip, Button, FormGroup, TextArea, FormLabel } from 'carbon-components-react';
import bannerImg from '../Icon';
import { Information32 } from "@carbon/icons-react";
import { Reset32 } from "@carbon/icons-react";
import { TableOfContents } from "@carbon/icons-react";
import PageBanner from "./PageBanner";
import {CheckmarkFilled32, CloseFilled32} from "@carbon/icons-react";

class MUIITSMIntegration extends React.Component {

    constructor(props) {
        super(props);
        this.state = (
            {
                usingTicketingTool: '',
                chatopsCommandAuth: '',
                authType: '',
                dedicatedDropletInstance: true,
                typeOfAuthentication: ''
            }
        );
    }
    header = "gsmaAccount";
    header1 = "NA Shared";
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
        if(e.target.name == "eventSource" && e.target.value != "CDI") {
            this.setState({
                squadBasedAssignment: "no",
                aiopsSquadGeo: ""
            })
        }
        if(e.target.name == "eventSource" && e.target.value == "netcool") {
            this.setState({
                usingTicketingTool: 'yes',
                chatopsCommandAuth: 'chatopsAuth',
            })
        }
        if(e.target.name == "eventSource" && e.target.value == "CDI") {
            this.setState({
                usingTicketingTool: '',
                chatopsCommandAuth: '',
            })
        }
        if(e.target.name == "usingTicketingTool" && e.target.value == "yes") {
            this.setState({
                chatopsCommandAuth: 'chatopsAuth'
            })
        }
        if(e.target.name == "ticketingToolUsed" && e.target.value == "icd") {
            this.setState({
                typeOfAuthentication: 'basic'
            })
        }
        if(e.target.name == "usingTicketingTool" && e.target.value == "no") {
            this.setState({
                typeOfAuthentication: '',
                authType: 'useopenAuth'
            })
        }
        if(e.target.name == "chatopsCommandAuth" && (e.target.value == "userAuth") ) {
            this.setState({
                authType: ''
            })
        }
        this.setState({
            [e.target.name]: e.target.value,
        });
    };
    handleCheckbox(name, event) {
        this.setState({
            [event.target.name]: event.target.checked,
          });
    };
    submitPopup = (e) => {
        e.preventDefault();
        var saved = false;
        var submitted = true;
        this.setState({
            showFailPopup: false,
        });
        this.props.submitForm(saved);
    };
    cancelPopup = (e) => {
        e.preventDefault();
        this.setState({
            showFailPopup: false,
        });
    };
  render() {
        console.log(this.state);
        var disableCMS = false;
        var disabledroplet = false;
        if(this.state.dropletEnabled == true){
            disableCMS = true;
        }else{
            disableCMS = false;
        }
        if(this.state.csmEnabled == true){
            disabledroplet = true;
        }else{
            disabledroplet = false;
        }
    return (
        <div className="divContainer">
            <PageBanner header={this.header} header1={this.header1} />
            <section className="formSectionMain">
                <Form className="onboardFormMain">
                    <Grid>
                        <Row>
                            <Column>
                                <Select
                                    id="integratedWithChatops"
                                    labelText={<>Does account uses a ticketing tool, if yes, does it needs to be integrated with ChatOps  <b className="fontRed">*</b></>}
                                    name="usingTicketingTool"
                                    onChange={(e) => this.handleInputChange(e)}
                                    // onChange={this.props.handleChange('usingTicketingTool')}
                                    // defaultValue={values.usingTicketingTool || ""}
                                    required
                                >
                                {/* {values.eventSource !== "netcool" && <> */}
                                {/* -----------------------TODO Check for value != netcool-------------------------------------- */}
                                    <SelectItem
                                    value=""
                                    text="Choose an option"
                                    />
                                    <SelectItem value="no" text="No"  /> 
                                    <SelectItem value="yes" text="Yes" />
                                </Select>
                            </Column>
                            <Column>
                            </Column>
                        </Row>
                        { this.state.usingTicketingTool == "yes" &&
                            <div>
                                <Row>
                                    <Column>
                                        <Select
                                            id="chatopsCommandAuth"
                                            name="chatopsCommandAuth"
                                            labelText="Authorisation Type"
                                            onChange={(e) => this.handleInputChange(e)}
                                            // onChange={this.props.handleChange('chatopsCommandAuth')}
                                            // defaultValue={this.props.chatopsCommandAuth||""}
                                        >
                                            <SelectItem
                                                value="chatopsAuth"
                                                text="Chatops Authorization"
                                                // selected={this.props.chatopsCommandAuth == "chatopsAuth"}
                                            />
                                            <SelectItem
                                                value="userAuth"
                                                text="User Authorisation"
                                                // selected={this.props.chatopsCommandAuth == "userAuth"}
                                            />
                                        </Select>
                                    </Column>
                                    <Column>
                                    </Column>
                                </Row>
                                {(this.state.chatopsCommandAuth == "chatopsAuth") &&
                                    <Row>
                                        <Column>
                                            <Select
                                                id="authType"
                                                labelText={
                                                    <span>Access Type <b className="fontRed">*</b> 
                                                    <Tooltip>
                                                    <b>Group: </b> Group members will be ablee to perform the command action.
                                                    <br/>
                                                    <b>Open Access: </b> All the users would be able to perform the command action via the detail provided in the onboarding form.
                                                    </Tooltip>
                                                    </span>
                                                }
                                                name="authType"
                                                onChange={(e) => this.handleInputChange(e)}
                                                // onChange={this.props.handleChange('authType')}
                                                // defaultValue={this.props.authType}
                                                required
                                            >
                                                <SelectItem value="useopenAuth" text="Open Access"  />
                                                <SelectItem value="useGroup" text="Group"  />
                                            </Select>
                                        </Column>
                                        {this.state.authType == "useGroup" ? 
                                            <Column>
                                                <TextInput
                                                    id="authGroup"
                                                    placeholder="Add Group Name"
                                                    labelText={<>Group Name  <b className="fontRed">*</b></>}
                                                    name="authGroup"
                                                    onChange={(e) => this.handleInputChange(e)}
                                                    // onChange={this.props.handleChange('authGroup')}
                                                    // defaultValue={this.props.authGroup}
                                                    required
                                                />
                                            </Column>:
                                            <Column></Column>
                                        }
                                    </Row> 
                                }
                                <div className="divGrouping">
                                    <Row>
                                        <Column>
                                            <Select
                                                    id="ticketingToolType"
                                                    labelText={<>Ticketing Tool Used  <b className="fontRed">*</b></>}
                                                    name="ticketingToolUsed"
                                                    onChange={(e) => this.handleInputChange(e)}
                                                    // onChange={this.props.handleChange('ticketingToolUsed')}
                                                    // defaultValue={this.props.ticketingToolUsed|| ""}
                                                    required
                                                >
                                                    <SelectItem
                                                    hidden
                                                    value="noTicketingTool"
                                                    text="Choose an option"
                                                    />
                                                    <SelectItem value="icd" text="ICD" />
                                                    <SelectItem value="service_now" text="ServiceNow" />
                                                </Select>
                                        </Column>
                                        <Column>
                                            <div className="checkConnectionDiv">
                                                <a href="#" className="noBorderRadiusBtn">Test Connection
                                                </a>
                                                {this.state.showSuccess ? (
                                                    <CheckmarkFilled32 className="connectionSuccess"/>) : null
                                                }
                                                {this.state.showFailure ? (
                                                    <CloseFilled32 className="connectionFailure"/>) : null
                                                }
                                            </div>
                                            {this.state.showFailPopup ? (
                                                <div className="popup">
                                                    <div className="bx--modal-container modal-css">
                                                        <div className="bx--modal-header">
                                                            <p
                                                            className="bx--modal-header__heading bx--type-beta"
                                                            id="modal-connectionFail-heading"
                                                            >
                                                            Ticketing Tool Connection is Failed. Do you want to Continue?
                                                            </p>
                                                        </div>
                                                        <div className="bx--modal-content--overflow-indicator"></div>

                                                        <div className="bx--modal-footer">
                                                        <Button
                                                        // kind="tertiary"
                                                        className="onboardBtn"
                                                        className="connectionCheck"
                                                        onClick={this.cancelPopup}
                                                        >
                                                        No
                                                        </Button>
                                                        <Button
                                                        // kind="primary"
                                                        onClick={this.submitPopup}
                                                        className="onboardBtn"
                                                        className="connectionCheck"
                                                        >
                                                        Yes
                                                        </Button>
                                                        </div>
                                                    </div>
                                                    <span tabindex="0"></span>
                                                </div>
                                                ) : null
                                            }
                                        </Column>
                                    </Row>
                                    <Row>
                                        <Column>
                                            <TextInput
                                                id="tickertingRestURL"
                                                placeholder="Ticketing Tool Used"
                                                labelText={<>Ticketing REST API URL  <b className="fontRed">*</b> <Tooltip>Only host url with / at end to be added. Eg: "https://example.service-now.com/" </Tooltip> </>}
                                                name="tickertingRestURL"
                                                onChange={(e) => this.handleInputChange(e)}
                                                // onChange={this.props.handleChange('tickertingRestURL')}
                                                // defaultValue={this.props.tickertingRestURL}
                                                required
                                            />
                                        </Column>
                                        <Column></Column>
                                    </Row>
                                    <Row>
                                        <Column>
                                            <Select
                                                id="authenticationType"
                                                labelText={<>Type of Authentication  <b className="fontRed">*</b></>}
                                                // defaultValue="opts"
                                                name="typeOfAuthentication"
                                                onChange={(e) => this.handleInputChange(e)}
                                                // onChange={this.props.handleChange('typeOfAuthentication')}
                                                // defaultValue={this.props.typeOfAuthentication}
                                                required
                                            >
                                                {this.state.ticketingToolUsed != 'icd' && <><SelectItem
                                                //   disabled
                                                value="noAuth"
                                                text="Select an option"
                                                />
                                                <SelectItem value="oauth" text="OAuth" /></>}
                                                <SelectItem value="basic" text="Basic" />
                                            </Select>
                                        </Column>
                                        <Column>
                                        </Column>
                                    </Row>
                                    <div>
                                        {(this.state.typeOfAuthentication == "basic" || this.state.typeOfAuthentication == "oauth") && 
                                            <>
                                            <Row>
                                                <Column>
                                                    <TextInput
                                                        type="password"
                                                        id="userId"
                                                        placeholder="Basic Auth User ID(Required for Oauth Style as well)"
                                                        labelText={<>Basic Auth User ID  <b className="fontRed">*</b></>}
                                                        name="basicAuthUserID"
                                                        onChange={(e) => this.handleInputChange(e)}
                                                        // defaultValue={this.props.basicAuthUserID}
                                                        // onChange={this.props.handleChange('basicAuthUserID')}
                                                        required
                                                    />
                                                </Column>
                                                <Column>
                                                    <TextInput
                                                        type="password"
                                                        id="userPassword"
                                                        placeholder="*********"
                                                        labelText={<>Basic Auth Password  <b className="fontRed">*</b></>}
                                                        name="basicAuthPassword"
                                                        onChange={(e) => this.handleInputChange(e)}
                                                        // defaultValue={this.props.basicAuthPassword}
                                                        // onChange={this.props.handleChange('basicAuthPassword')}
                                                        required
                                                    />
                                                </Column>        
                                            </Row>
                                            {this.state.typeOfAuthentication == "oauth" && 
                                            <Row>
                                                <Column>
                                                    <TextInput
                                                        type="password"
                                                        id="oauthClientID"
                                                        placeholder="*********"
                                                        labelText={<>OAuth Client ID  <b className="fontRed">*</b></>}
                                                        name="oauthClientID"
                                                        onChange={(e) => this.handleInputChange(e)}
                                                        // onChange={this.props.handleChange('oauthClientID')}
                                                        // defaultValue={this.props.oauthClientID || ""}
                                                        required
                                                    />
                                                </Column>
                                                <Column>
                                                    <TextInput
                                                        type="password"
                                                        id="oauthClientSecret"
                                                        placeholder="*********"
                                                        labelText={<>OAuth Client Secret  <b className="fontRed">*</b></>}
                                                        name="oauthClientSecret"
                                                        onChange={(e) => this.handleInputChange(e)}
                                                        // onChange={this.props.handleChange('oauthClientSecret')}
                                                        // defaultValue={this.props.oauthClientSecret || ""}
                                                        required
                                                    />
                                                </Column>
                                            </Row>
                                            } 
                                        </>
                                        }
                                    </div>
                                    {this.state.ticketingToolUsed == 'icd' && 
                                        <div className="divGrouping">
                                            <Row>
                                                <Column>
                                                    <TextArea
                                                        cols={50}
                                                        className=" textAreaMargin"
                                                        id="IcdDefaultStatusFlowConf"
                                                        name="IcdDefaultStatusFlowConf"
                                                        onChange={(e) => this.handleInputChange(e)}
                                                        // onChange={this.props.handleChange('IcdDefaultStatusFlowConf')}
                                                        // defaultValue={IcdDefaultStatusFlowConf} 
                                                        labelText={ <> ICD default status flow configuration </> }
                                                        placeholder="ICD default status flow configuration"
                                                        rows={5}
                                                    />
                                                </Column>
                                            </Row>
                                            <Row>
                                                <Column>
                                                    <Select
                                                    id="internetFacing"
                                                    labelText="Can ticketing tool API be accessed from the Internet?(Internet Facing)"
                                                    // defaultValue="opts"
                                                    name="internetFacing"
                                                    onChange={(e) => this.handleInputChange(e)}
                                                    // onChange={this.props.handleChange('internetFacing')}
                                                    // defaultValue={this.props.internetFacing|| ""}
                                                    >
                                                        <SelectItem
                                                            value=""
                                                            text="Choose an option"
                                                        />
                                                        <SelectItem value="yes" text="Yes" />
                                                        <SelectItem value="no" text="No" />
                                                    </Select>
                                                </Column>
                                                <Column>
                                                    
                                                </Column>
                                            </Row>
                                        </div>
                                    }
                                    {this.state.ticketingToolUsed == 'service_now' && 
                                        <div className="divGrouping">
                                            {this.state.ticketingToolUsed == 'service_now' &&  (this.state.csmEnabled == false || this.state.csmEnabled == undefined) && (this.state.dropletEnabled == false || this.state.dropletEnabled == undefined) &&
                                                <Row>
                                                    <Column>
                                                        <TextArea
                                                            cols={50}
                                                            className=" textAreaMargin"
                                                            id="SnowDefaultStatusFlowConf"
                                                            name="SnowDefaultStatusFlowConf"
                                                            // helperText="Provide proper json with name/value pairs, that begins with { left brace and ends with } right brace. Each name should be followed by : colon and the name/value pairs separated by , comma"
                                                            // onBlur={(e) => this.handleInputChange(e)} 
                                                            onChange={(e) => this.handleInputChange(e)}
                                                            // defaultValue={SnowDefaultStatusFlowConf || this.props.SnowDefaultStatusConf} 
                                                            labelText={ <> Snow default status flow configuration 
                                                                <Tooltip>
                                                                    Default ticketing tool status flow, the config can be modified according to how the configuration is in the tool
                                                                </Tooltip>
                                                            </> }
                                                            placeholder="Snow default status flow configuration"
                                                            rows={5}
                                                        />
                                                    </Column>
                                                </Row>
                                            }
                                            <br />
                                            <Row>
                                                <Column>
                                                    <FormGroup className="displayInlineDiv">
                                                        <label className="displayInlineLabel"><b>Is this instance droplet enabled?</b>
                                                            <Tooltip>
                                                                Enable this option for servicenow instances that have droplets enabled
                                                            </Tooltip>
                                                            <input
                                                                type="checkbox"
                                                                className="relatedInsights"
                                                                name="dropletEnabled"
                                                                id="dropletEnabled"
                                                                disabled={disabledroplet}
                                                                onClick={ (event) => { this.handleCheckbox('dropletEnabled', event) }}
                                                                // onClick={ (event) => { this.handleDropletEnabled('dropletEnabled', event) }}
                                                                // defaultChecked={this.props.dropletEnabled || false}
                                                            />
                                                        </label>
                                                    </FormGroup> 
                                                </Column>
                                                <Column>
                                                    <FormGroup className="displayInlineDiv">
                                                        <label className="displayInlineLabel"><b>Is this instance CSM enabled?</b>
                                                            <Tooltip>Enable this option for CSM servicenow instances</Tooltip>
                                                            <input
                                                                type="checkbox"
                                                                className="relatedInsights"
                                                                name="csmEnabled"
                                                                id="csmEnabled"
                                                                disabled={disableCMS}
                                                                onClick={ (event) => { this.handleCheckbox('csmEnabled', event) }}
                                                                // onClick={ (event) => { this.handlecsmEnabled('csmEnabled', event) }}
                                                                // defaultChecked={this.props.csmEnabled || false}
                                                            />
                                                        </label>
                                                    </FormGroup> 
                                                </Column>
                                            </Row>
                                            {this.state.ticketingToolUsed == 'service_now' &&  (this.state.dropletEnabled == true ) && (this.state.csmEnabled == false || this.state.csmEnabled == undefined) &&
                                                <Row>
                                                    <Column>
                                                        <TextArea
                                                            cols={50}
                                                            className=" textAreaMargin"
                                                            id="SnowDropletStatusFlowConf"
                                                            name="SnowDropletStatusFlowConf"
                                                            onChange={(e) => this.handleInputChange(e)}
                                                            // defaultValue={SnowDropletStatusFlowConf} 
                                                            labelText={ <> Snow droplet status flow configuration 
                                                            </> }
                                                            placeholder="Snow droplet status flow configuration"
                                                            rows={5}
                                                        />
                                                    </Column>
                                                </Row>
                                            }
                                            {/* (values.dropletEnabled == false || values.dropletEnabled == undefined) && (values.csmEnabled == true || values.csmEnabled == undefined) */}
                                            {this.state.ticketingToolUsed == 'service_now' &&  (this.state.dropletEnabled == false || this.state.dropletEnabled == undefined) && (this.state.csmEnabled == true) &&
                                                <Row>
                                                    <Column>
                                                        <TextArea
                                                            cols={50}
                                                            className=" textAreaMargin"
                                                            id="SnowCsmStatusFlowConf"
                                                            name="SnowCsmStatusFlowConf"
                                                            onChange={(e) => this.handleInputChange(e)}
                                                            // defaultValue={SnowCsmStatusFlowConf} 
                                                            labelText={ <> Snow CSM status flow configuration </> }
                                                            placeholder="Snow CSM status flow configuration"
                                                            rows={5}
                                                        />
                                                    </Column>
                                                </Row>
                                            }
                                            {(this.state.dropletEnabled == true) && 
                                                <Row>
                                                    <Column>
                                                        <TextInput
                                                            id="urlPath"
                                                            placeholder="API Path"
                                                            labelText={<>API Path<b className="fontRed">*</b>
                                                            <Tooltip> Enter the API path of the droplet instance eg:- "/api/now/table/x_ibmip_int_inc_web_services"</Tooltip>
                                                            </>}
                                                            name="urlPath"
                                                            onChange={(e) => this.handleInputChange(e)}
                                                            // onChange={this.props.handleChange('urlPath')}
                                                            // defaultValue={this.props.urlPath}
                                                            required
                                                        />
                                                    </Column>
                                                    <Column>
                                                    <FormGroup className="displayInlineDiv">
                                                        <label className="displayInlineLabel"><b>Is this a dedicated droplet instance?</b>
                                                        <Tooltip>Enable this option if this is a dedicated servicenow droplet instance</Tooltip>
                                                            <input
                                                                type="checkbox"
                                                                className="relatedInsights"
                                                                name="dedicatedDropletInstance"
                                                                id="dedicatedDropletInstance"
                                                                onClick={ (event) => { this.handleCheckbox('dedicatedDropletInstance', event) }}
                                                                // onClick={ (event) => { this.handleDedicatedDropletInstance('dedicatedDropletInstance', event) }}
                                                                defaultChecked={this.state.dedicatedDropletInstance || false}
                                                            />
                                                        </label>
                                                        </FormGroup> 
                                                    </Column>
                                                </Row> 
                                            }
                                            {(this.state.csmEnabled == true) && 
                                                <Row>
                                                    <Column>
                                                        <TextInput
                                                            id="tableName"
                                                            placeholder="Table Name"
                                                            labelText={<>Table Name<b className="fontRed">*</b>
                                                                <Tooltip>
                                                                    Default is entered, in case of a different table name enter the appropriate table name
                                                                </Tooltip>
                                                            </>}
                                                            name="tableName"
                                                            onChange={(e) => this.handleInputChange(e)}
                                                            // onChange={this.props.handleChange('tableName')}
                                                            // defaultValue={this.props.tableName}
                                                            required
                                                        />
                                                    </Column>
                                                    <Column>
                                                    </Column>
                                                </Row> 
                                            }
                                            {(this.state.dedicatedDropletInstance == false && this.state.dropletEnabled == true) && 
                                                <Row>
                                                    <Column>
                                                        <TextInput
                                                            id="companyName"
                                                            placeholder="Company Name"
                                                            labelText={<>Company Name<b className="fontRed">*</b>
                                                            <Tooltip>Enter client name as specified in the servicenow instance</Tooltip>
                                                            </>}
                                                            name="companyName"
                                                            onChange={(e) => this.handleInputChange(e)}
                                                            // onChange={this.props.handleChange('companyName')}
                                                            // defaultValue={this.props.companyName}
                                                            required
                                                        />
                                                    </Column>
                                                    <Column>
                                                    </Column>
                                                </Row> 
                                            }
                                        </div>   
                                    }
                                </div>
                            </div>
                        }
                        <Row>
                            <div className="onboardBtnDiv">
                                <Button type="submit" className="onboardBtn">
                                    Submit
                                </Button>
                            </div>
                        </Row>
                    </Grid>
                </Form>
            </section>
        </div>
    );
  }
}
export default MUIITSMIntegration;