import React from 'react';
import ReactDOM from 'react-dom';
import { SelectItem, Select, Form,UnorderedList, ListItem,Grid, Row, Column, TextInput, Tooltip, Button, FormGroup, TextArea, FormLabel } from 'carbon-components-react';
import bannerImg from '../Icon';
import { Information32 } from "@carbon/icons-react";
import { Reset32 } from "@carbon/icons-react";
import { TableOfContents } from "@carbon/icons-react";
import PageBanner from "./PageBanner";
import {CheckmarkFilled32, CloseFilled32} from "@carbon/icons-react";

class MUIInsights extends React.Component {

    constructor(props) {
        super(props);
        this.state = (
            {
                enableWatsonAssistant: false,
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
  render() {
    return (
        <div className="divContainer">
            <PageBanner header={this.header} header1={this.header1} />
            <section className="formSectionMain">
                <Form className="onboardFormMain">
                    <Grid>
                        <Row>
                            <Column>
                                <FormGroup className="displayInlineDiv noMarginDiv">
                                    <label className="displayInlineLabel"><b>Enable Stack exchange</b> 
                                    <Tooltip>URL Links from stack exchange for the incident description gets added as an insight to the incident channel.</Tooltip>
                                        <input
                                            type="checkbox"
                                            className="checkboxInput"
                                            name="enableStackDetails"
                                            id="enableStackDetails"
                                            onClick={ (event) => { this.handleCheckbox('enableStackDetails', event) }}
                                            // onClick={ (event) => { this.handleDescCheckbox('enableDescDetails', event) }}
                                            // defaultChecked={this.props.enableDescDetails || false}
                                        />
                                    </label>
                                </FormGroup> 
                            </Column>
                            <Column>
                            </Column>
                        </Row>
                        <Row>
                            <Column>
                                <FormGroup className="displayInlineDiv noMarginDiv">
                                    <label className="displayInlineLabel"><b>Enable Watson Knowledge insights</b> 
                                    <Tooltip>Response from Watson assistant gets added as an insight to the incident channel.</Tooltip>
                                        <input
                                            type="checkbox"
                                            className="checkboxInput"
                                            name="enableWatsonAssistant"
                                            id="enableWatsonAssistant"
                                            onClick={ (event) => { this.handleCheckbox('enableWatsonAssistant', event) }}
                                            // onClick={ (event) => { this.handleDescCheckbox('enableDescDetails', event) }}
                                            // defaultChecked={this.props.enableDescDetails || false}
                                        />
                                    </label>
                                </FormGroup> 
                            </Column>
                            <Column>
                            </Column>
                        </Row>
                        {this.state.enableWatsonAssistant == true ? <>
                            <Row>
                                <Column>
                                    <TextInput
                                        className="labelFont"
                                        id="watsonURL"
                                        placeholder="IBM Watson Assistant URL"
                                        labelText={<>IBM Watson Assistant URL  <b className="fontRed">*</b></>}
                                        name="watsonURL"
                                        onChange={(e) => this.handleInputChange(e)}
                                        // defaultValue={this.props.watsonURL || ""}
                                        required
                                    />
                                </Column>
                                <Column>
                                    <TextInput
                                        className="labelFont"
                                        id="watsonVersion"
                                        placeholder="IBM Watson Version"
                                        labelText={<span>IBM Watson Version  <b className="fontRed">*</b>
                                            <Tooltip>
                                            Version should be of format version=&lt;value&gt; , eg: version=2020-04-01
                                            </Tooltip>
                                        </span>}
                                        name="watsonVersion"
                                        onChange={(e) => this.handleInputChange(e)}
                                        // defaultValue={this.props.watsonVersion || ""}
                                        required
                                    />
                                    
                                </Column>
                            </Row>
                            <Row>
                                <Column>
                                        <TextInput
                                        type="password"
                                        className="labelFont"
                                        id="watsonApiKey"
                                        placeholder="IBM Watson API Key"
                                        labelText={<>IBM Watson API Key  <b className="fontRed">*</b></>}
                                        name="watsonApiKey"
                                        onChange={(e) => this.handleInputChange(e)}
                                        // defaultValue={this.props.watsonApiKey || ""}
                                        required
                                    />
                                </Column>
                            </Row>
                            </>:''
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
export default MUIInsights;