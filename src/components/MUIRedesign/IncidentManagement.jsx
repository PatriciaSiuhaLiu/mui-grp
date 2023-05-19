import React from 'react';
import ReactDOM from 'react-dom';
import { SelectItem, Select, Form,UnorderedList, ListItem,Grid, Row, Column, TextInput, Tooltip, Button, FormGroup, TextArea, FormLabel } from 'carbon-components-react';
import bannerImg from '../Icon';
import { Information32 } from "@carbon/icons-react";
import { Reset32 } from "@carbon/icons-react";
import { TableOfContents } from "@carbon/icons-react";
import PageBanner from "./PageBanner";

class MUIIncidentManagement extends React.Component {

    constructor(props) {
        super(props);
        this.state = (
            {
                eventSource: '',
            }
        );
    }
    header = "gsmaAccount";
    header1 = "NA Shared";
    handleCheckbox(name, event) {
        this.setState({
            [event.target.name]: event.target.checked,
          });
    };
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
    render() {
        return (
            <div className="divContainer">
                <PageBanner header={this.header} header1={this.header1} />
                <section className="formSectionMain">
                    <Form className="onboardFormMain">
                        <Grid>
                            <Row>
                                <Column className="colMaxWidth50">
                                    <Select
                                        id="eventSource"
                                        name="eventSource"
                                        labelText={
                                            <span>
                                            What is the event source to be used with ChatOps?{" "}
                                            <b className="fontRed">*</b>
                                            <Tooltip>External event source</Tooltip>
                                            </span>
                                        }
                                        onChange={(e) => this.handleInputChange(e)}
                                        // onChange={this.props.handleChange("eventSource")}
                                        // defaultValue={this.props.eventSource || ""}
                                        required
                                    >
                                        <SelectItem value="" hidden text="Choose an option" />
                                        <SelectItem
                                            value="CDI"
                                            text="AIOPS"
                                            // selected={this.props.eventSource == "CDI"}
                                        />
                                        <SelectItem
                                            value="netcool"
                                            text="Netcool"
                                            // selected={this.props.eventSource == "netcool"}
                                        />
                                        <SelectItem
                                            value="other"
                                            text="Other"
                                            // selected={this.props.eventSource == "other"}
                                        />
                                    </Select>
                                </Column>

                                {this.state.eventSource == "CDI" &&
                                    <Column>
                                        <TextInput
                                            name="aiopsAccIdentifier"
                                            labelText={
                                            <span>
                                                If Account is using AIOPS, provide account
                                                identifier(AIOPS client id) <b className="fontRed">*</b>
                                                <Tooltip>Unique identifier for account</Tooltip>
                                            </span>
                                            }
                                            placeholder="AIOPS Client Id"
                                            onChange={(e) => this.handleInputChange(e)}
                                            // onChange={this.debouncer(500)}
                                            // defaultValue={this.props.aiopsAccIdentifier}
                                            required
                                        />
                                    </Column>
                                } 
                                {this.state.eventSource == "netcool" &&
                                    <Column>
                                        <Select
                                            className="labelFont"
                                            id="accountUtilizingNetcool"
                                            name="accountUtilizingNetcool"
                                            onChange={(e) => this.handleInputChange(e)}
                                            // onChange={this.props.handleChange(
                                            //     "accountUtilizingNetcool"
                                            // )}
                                            // defaultValue={this.props.accountUtilizingNetcool}
                                            labelText="Does the client Netcool env allow internet based call?"
                                            // defaultValue="ops"
                                        >
                                            <SelectItem value="ops" text="Choose an option" />
                                            <SelectItem value="yes" text="Yes" />
                                            <SelectItem value="no" text="No" />
                                        </Select>
                                    </Column>
                                } 
                            </Row>   
                            {this.state.eventSource == "CDI" &&
                                <Row>
                                    <Column>
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
                                                    onClick={ (event) => { this.handleCheckbox('allowedPriorities', event) }}
                                                    // onChange={this.props.handleCheckboxPriority("allowedPriorities")}
                                                    // defaultChecked={true}
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
                                                        onClick={ (event) => { this.handleCheckbox('allowedPriorities', event) }}
                                                        // onClick={this.props.handleCheckboxPriority("allowedPriorities")}
                                                        // defaultChecked={p2Priority}
                                                    />
                                                    p 2
                                                </label>
                                                <label className="bx--checkbox-label-text checkboxClass">
                                                    <input
                                                        type="checkbox"
                                                        className="checkboxInput"
                                                        name="p3"
                                                        data-value="3"
                                                        onClick={ (event) => { this.handleCheckbox('allowedPriorities', event) }}
                                                        // onClick={this.props.handleCheckboxPriority("allowedPriorities")}
                                                        // defaultChecked={p3Priority}
                                                    />
                                                    p 3
                                                </label>
                                                <label className="bx--checkbox-label-text checkboxClass">
                                                    <input
                                                        type="checkbox"
                                                        className="checkboxInput"
                                                        name="p4"
                                                        data-value="4"
                                                        onClick={ (event) => { this.handleCheckbox('allowedPriorities', event) }}
                                                        // onClick={this.props.handleCheckboxPriority("allowedPriorities")}
                                                        // defaultChecked={p4Priority}
                                                    />
                                                    p 4
                                                </label>
                                            </div>
                                            </FormGroup>   
                                    </Column>
                                    <Column>
                                            
                                    </Column>
                                </Row>  
                            }
                            <Row>
                                <Column>
                                    <FormGroup className="displayInlineDiv noMarginDiv">
                                        <label className="displayInlineLabel"><b>Related ticket insights to display child tickets</b>
                                        <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip>
                                            <input
                                                type="checkbox"
                                                className="relatedInsights checkboxInput"
                                                name="relatedInsights"
                                                id="relatedInsights"
                                                onClick={ (event) => { this.handleCheckbox('relatedInsights', event) }}
                                                // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                // defaultChecked={this.props.relatedInsights || false}
                                            />
                                        </label>
                                    </FormGroup> 
                                </Column>
                            </Row>
                            <Row>
                                <Column>
                                    <FormGroup className="displayInlineDiv noMarginDiv">
                                        <label className="displayInlineLabel"><b>Display incidents with similar configuration item</b>
                                        <Tooltip>Incidents with similar configuration item displays as an insight in the Incident channel if enabled</Tooltip>
                                            <input
                                                type="checkbox"
                                                className="enableCiDetails checkboxInput"
                                                name="enableCiDetails"
                                                id="enableCiDetails"
                                                onClick={ (event) => { this.handleCheckbox('enableCiDetails', event) }}
                                                // onClick={ (event) => { this.handleCiCheckbox('enableCiDetails', event) }}
                                                // defaultChecked={this.props.enableCiDetails || false}
                                            />
                                        </label>
                                    </FormGroup> 
                                </Column>
                            </Row>
                            <Row>
                                <Column>
                                    <FormGroup className="displayInlineDiv noMarginDiv">
                                        <label className="displayInlineLabel"><b>Display incidents with similar description</b> 
                                        <Tooltip>Incidents with similar description displays as an insight in the Incident channel if enabled</Tooltip>
                                            <input
                                                type="checkbox"
                                                className="enableDescDetails checkboxInput"
                                                name="enableDescDetails"
                                                id="enableDescDetails"
                                                onClick={ (event) => { this.handleCheckbox('enableDescDetails', event) }}
                                                // onClick={ (event) => { this.handleDescCheckbox('enableDescDetails', event) }}
                                                // defaultChecked={this.props.enableDescDetails || false}
                                            />
                                        </label>
                                    </FormGroup> 
                                </Column>
                            </Row>                              
                            <Row>
                                <div className="onboardBtnDiv">
                                    <Button type="submit" className="onboardBtn">
                                        Submit
                                    </Button>
                                    {/* <Button type="submit" className="onboardBtn">
                                        Save
                                    </Button> */}
                                </div>
                            </Row>
                        </Grid>
                    </Form>
                </section>
            </div>
        );
    }
}
export default MUIIncidentManagement;