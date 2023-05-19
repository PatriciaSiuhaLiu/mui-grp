import React from 'react';
import ReactDOM from 'react-dom';
import { SelectItem, Select, Form,UnorderedList, ListItem,Grid, Row, Column, TextInput, Tooltip, Button, FormGroup, TextArea, FormLabel, Checkbox } from 'carbon-components-react';
import bannerImg from '../Icon';
import { Information32 } from "@carbon/icons-react";
import { Reset32 } from "@carbon/icons-react";
import { TableOfContents } from "@carbon/icons-react";
import PageBanner from "./PageBanner";
import {CheckmarkFilled32, CloseFilled32} from "@carbon/icons-react";

import { Close32 } from "@carbon/icons-react";

class MUIAnsibleIntegration extends React.Component {
    // <<<<<<<<<<<<<<<<<<-----------handle the functionality and data part------------------>>>>>>>>>>>>>>>>>>>>>>
    constructor(props) {
        super(props);
        this.state = (
            {
                usingTicketingTool: '',
                chatopsCommandAuth: '',
                authType: '',
                dedicatedDropletInstance: true
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
        this.setState({
            [e.target.name]: e.target.value,
        });
    };
    handleCheckbox(name, event) {
        this.setState({
            [event.target.name]: event.target.checked,
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
    ansibleModalHtml = () => {
        return (
            <div className="popup">
                <div className="bx--modal-container modal-css-ansible">
                    <div className="bx--modal-header">
                        <p
                        className="bx--modal-header__label bx--type-delta"
                        id="modal-ansible-label"
                        ></p>
                        <p
                        className="bx--modal-header__heading bx--type-beta"
                        id="modal-ansible-heading"
                        >
                        Add Ansible Instance
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
                        {this.state.ansibleInvalidMsg && (
                        <h4>
                            <b className="fontRed">
                            {this.state.ansibleInvalidMsg}
                            </b>
                        </h4>
                        )}
                        <Form>
                        <TextInput
                        className="bx--text-input bx--text__input"
                        id="ansibleInstanceName"
                        name="ansibleInstanceName"
                        labelText={
                            <>
                            Name <b className="fontRed">*</b>
                            </>
                        }
                        placeholder="name"
                        onBlur={this.handleAnsibleInputChange}
                        />
                        <br />
                        <TextInput
                        className="bx--text-input bx--text__input"
                        id="ansibleInstanceUrl"
                        name="ansibleInstanceUrl"
                        labelText={
                            <>
                            URL <b className="fontRed">*</b>
                            </>
                        }
                        placeholder="url"
                        onBlur={this.handleAnsibleInputChange}
                        />
    
                        <div class="addAccBtn">
                        <Checkbox
                            id="autoStatus"
                            labelText="Auto Job Status"
                            onChange={(isChecked) =>
                                this.handleAnsibleCheckChange(isChecked, "autoStatus")
                            }
                            checked={this.state.autoStatus}
                        />
                        </div>

                        </Form>
                    </div>
                    <div className="bx--modal-content--overflow-indicator"></div>

                    <div className="bx--modal-footer">
                        <Button
                        // kind="secondary"
                        className="onboardBtn"
                        onClick={this.cancelModal}
                        >
                        Cancel
                        </Button>
                        <Button
                        // kind="primary"
                        type="submit"
                        className="onboardBtn"
                        disabled={(!this.state.ansibleInstanceUrl || !this.state.ansibleInstanceName )}
                        onClick={this.saveAnsibleInstance}
                        >
                        Add Ansible Instance
                        </Button>
                    </div>
                </div>
                <span tabindex="0"></span>
            </div>
        )
    }
    enableAnsibleHtml = () => {

        // var accData = this.props.AccData;
        // let ansibleInstance =  accData.accountsData.ansibleInstanceList;
        // let {ansibleInstanceItems,cacfAnsibleInstanceItems} = this.formatAnsibleInstanceData(ansibleInstance);
        // let ansibleInstanceOptions = this.state.ansibleInstanceItems || ansibleInstanceItems;
      
        return (
            <Row>
                <Column>
                    <br />
                    <Select
                    className="labelFont"
                    id="ansibleInstance"
                    labelText={
                    <span>
                        Select Ansible instance <b className="fontRed">*</b>
                        <Tooltip>
                        Add Ansible Tower Instance <br />
                        User either can select existing ansible instance or add new
                        Ansible instance by giving appropriate details
                        </Tooltip>
                        <a
                        className="addWorkspaceLink"
                        onClick={(e) => { this.showModal(); }}
                        >
                        Add Ansible Instance
                        </a>
                    </span>
                    }
                    name="ansibleInstance"
                    onChange={(e) => this.handleInputChange(e)}
                    // onChange={this.props.handleChange("ansibleInstance")}
                    // defaultValue={this.props.ansibleInstance}
                    required
                >
                    <SelectItem hidden value="" text="Choose an option" />
                    {/* {ansibleInstanceOptions}  */}
                </Select>
                </Column>
                <Column></Column>
            </Row>
        )
    }

    enableCacfHtml = () => {

        // var accData = this.props.AccData;
        // let ansibleInstance =  accData.accountsData.ansibleInstanceList;
        // let {ansibleInstanceItems,cacfAnsibleInstanceItems} = this.formatAnsibleInstanceData(ansibleInstance);
        // let cacfInstanceOptions = this.state.cacfAnsibleInstanceItems || cacfAnsibleInstanceItems;

        return (
            <Row>
                <Column>
                    <br />
                    <Select
                        className="labelFont"
                        id="ansibleInstance"
                        labelText={
                        <span>
                            Select CACF instance <b className="fontRed">*</b>
                        </span>
                        }
                        name="ansibleInstance"
                        onChange={(e) => this.handleInputChange(e)}
                        // onChange={this.props.handleChange("ansibleInstance")}
                        // defaultValue={this.props.ansibleInstance}
                        required
                    >
                        <SelectItem hidden value="" text="Choose an option" />
                        {/* {cacfInstanceOptions}  */}
                    </Select>
                
                </Column>
                <Column></Column>
            </Row>
        )
    }
    formatTemplateOptions(templateLists){

        // let formatData = [];
        // for(const templateList of templateLists){
        //     let formOption = (
        //         <option className="bx--select-option" defaultValue={templateList.name}>
        //             {templateList.name}
        //         </option>
        //     );
        //     formatData.push(formOption);
        // }
        // return formatData;
    }

    jobLogHtml = () => {

        // const { values } = this.props;
        // var accData = this.props.AccData;
        // let templateList =  accData.accountsData.ansibleInstanceTemplateList;
        // let templateOptions = this.formatTemplateOptions(templateList);
      
        return (
            <Row>
                <Column>
                    <Select
                        className="labelFont"
                        id="ansibleInstanceLogFlag"
                        labelText={
                        <span>
                            Job Log with Notification
                        </span>
                        }
                        name="ansibleInstanceLogFlag"
                        onChange={(e) => this.handleInputChange(e)}
                        // onChange={this.props.handleChange("ansibleInstanceLogFlag")}
                        required
                    >
                        <SelectItem value="no" text="No" /> 
                        <SelectItem value="yes" text="Yes" />
                    </Select>
                </Column>
                <Column>
                   <Select
                        className="labelFont"
                        id="ansibleInstanceLogTemplate"
                        labelText={
                        <span>
                            Notification Template 
                        </span>
                        }
                        name="ansibleInstanceLogTemplate"
                        onChange={(e) => this.handleInputChange(e)}
                        // onChange={this.props.handleChange("ansibleInstanceLogTemplate")}
                        // defaultValue={this.props.ansibleInstanceLogTemplate}
                        required
                    >
                        <SelectItem value="no" text="No"  /> 
                         {/* {templateOptions}  */}
                    </Select>
                </Column>
                <Column>
                <TextInput
                    className="labelFont"
                    id="ansibleInstanceLogChannels"
                    placeholder="Channels"
                    labelText={<>Notification Channels</>}
                    name="ansibleInstanceLogChannels"
                    onChange={(e) => this.handleInputChange(e)}
                    // onChange={this.props.handleChange('ansibleInstanceLogChannels')}
                    // defaultValue={this.props.ansibleInstanceLogChannels}
                />
                </Column>
                
            </Row>
        )
    }
    render() {
        console.log(this.state);
        return (
            <div className="divContainer">
                {this.state.showPopup ? ( this.ansibleModalHtml()) : null}
                <PageBanner header={this.header} header1={this.header1} />
                <section className="formSectionMain">
                    <Form className="onboardFormMain">
                        <Grid>
                            <Row>
                                <Column>
                                    <Select
                                        className="labelFont"
                                        id="ansibleIntegratedWithChatops"
                                        labelText={<>Does account need ChatOps integration with CACF/Ansible <b className="fontRed">*</b></>}
                                        name="ansibleIntegratedWithChatops"
                                        onChange={(e) => this.handleInputChange(e)}
                                        // onChange={this.props.handleChange('usingAnsibleIntegration')}
                                        // defaultValue={this.state.usingAnsibleIntegration || "no"}
                                        required
                                        >
                                        <SelectItem value="no" text="No" /> 
                                        <SelectItem value="cacf" text="CACF"  />
                                        <SelectItem value="ansible" text="Ansible"  />
                                    </Select>
                                </Column>
                                <Column></Column>
                            </Row>
                            { this.state.ansibleIntegratedWithChatops == "ansible"? this.enableAnsibleHtml() : null}
                            { this.state.ansibleIntegratedWithChatops == "cacf"? this.enableCacfHtml() : null}
                            { (this.state.ansibleIntegratedWithChatops == "ansible" || this.state.ansibleIntegratedWithChatops == "cacf") ? this.jobLogHtml() : null}
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
export default MUIAnsibleIntegration;