import React from 'react';
import ReactDOM from 'react-dom';
import { SelectItem, Select, Form,UnorderedList, ListItem,Grid, Row, Column, TextInput, Tooltip, Button, FormGroup, TextArea, FormLabel, Checkbox } from 'carbon-components-react';
import bannerImg from '../Icon';
import { Add24 } from "@carbon/icons-react";
import { Close32 } from "@carbon/icons-react";
import { AddAlt32 } from "@carbon/icons-react";
import { TableOfContents } from "@carbon/icons-react";
import PageBanner from "./PageBanner";
// import AddRules from "./AddRulesModal";
import { TrashCan32 } from "@carbon/icons-react";


class MUIAssignments extends React.Component {

    constructor(props) {
        super(props);
        this.state = (
            {
                assignmentServiceToAssignResource: '',
                groupField: [true],
                additionalPropField: [true],
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
    addAdditionalProp = () => {
        const { additionalPropField } = this.state;
        additionalPropField.push(true);
        this.setState({
            additionalPropField,
        });
    };
    
    deleteAdditionalProp = (index) => {
        const { additionalPropField } = this.state;

        if ((additionalPropField.deleted || 0) >= additionalPropField.length - 1) return;

        additionalPropField[index] = false;
        additionalPropField.deleted = additionalPropField.deleted + 1 || 1;
        this.setState({
            additionalPropField,
        });
        delete this.props.values["additionalPropKey-" + index]
        delete this.props.values["additionalPropVal-" + index]
    };
    registerState = (stateName,data) => {  
        this.setState({
            [stateName]: data,
        });        
    }
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
    
    addRuleModalHtml = () => {
        return (
            <div className="popup">
                <div className="bx--modal-container modalContainerCss">
                    <div className="bx--modal-header">
                        <p
                        className="bx--modal-header__label bx--type-delta"
                        id="modalAddRuleLabel"
                        ></p>
                        <p
                        className="bx--modal-header__heading bx--type-beta"
                        id="modal-addRule-heading"
                        >
                        Add Rules
                        </p>
                        
                        <button
                        className="bx--modal-close"
                        type="button"
                        data-modal-close
                        aria-label="close modal"
                        onClick={this.cancelModal}
                        >
                        <Close32
                            className="iconEditSize"
                            onClick={this.cancelModal}
                        />
                        </button>
                    </div>
                    <div className="bx--modal-content">
                        <Form>
                            <Grid>
                                <Row className="rowSeparator">
                                    <Column>
                                        <div className="rulesInputContainer">
                                            <TextInput id="geo" labelText="Geo" placeholder="Enter Geo"className="inputWhite"  />
                                            <div className="ruleCheckboxContainer">
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">APAC
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">Americas
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">EMEA
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">Japan
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                            </div>
                                        </div>
                                    </Column>
                                    <Column>
                                        <div className="rulesInputContainer">
                                            <TextInput id="market" labelText="Market" placeholder="Enter Market" className="inputWhite" />
                                            <div className="ruleCheckboxContainer">
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">ASEAN
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">AUSTRALIA/NEW ZEALAND
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">BENELUX
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">BNL
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">BRAZIL
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">CDG
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">CEE
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">CHANCE
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                            </div>
                                        </div>
                                    </Column>
                                </Row>
                                <Row className="rowSeparator">
                                    <Column>
                                        <div className="rulesInputContainer">
                                            <TextInput id="sector" labelText="Sector" placeholder="Enter Sector"className="inputWhite"  />
                                            <div className="ruleCheckboxContainer">
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">Communications Sector
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">Computer Services Industry
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">Distribution Sector
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">Financial Services Sector
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">General Business Enterprise
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">IBM Internal Account
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                            </div>
                                        </div>
                                    </Column>
                                    <Column>
                                        <div className="rulesInputContainer">
                                            <TextInput id="industry" labelText="Industry" placeholder="Enter Industry" className="inputWhite" />
                                            <div className="ruleCheckboxContainer">
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">Aerospace & Defense
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">Automotive
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">Banking
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">Chemicals & Petroleum
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">Computer Services
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">Consumer Products
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">Cross Competency
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">Education
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                            </div>
                                        </div>
                                    </Column>
                                </Row>
                                <Row className="rowSeparator">
                                    <Column>
                                        <div className="rulesInputContainer">
                                            <TextInput id="country" labelText="Country" placeholder="Enter Country"className="inputWhite"  />
                                            <div className="ruleCheckboxContainer">
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">United States
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">Azerbaijan
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">Turkmenistan
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">Tajikistan
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel">Mauritius
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel"> Equitorial Guinea
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="geo-1"
                                                            id="geo-1"
                                                            onClick={ (event) => { this.handleCheckbox('geo', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                            </div>
                                        </div>
                                    </Column>
                                    <Column>
                                        <div className="rulesInputContainer">
                                            <TextInput id="ticketPriority" labelText="Ticket Priority" placeholder="Enter Ticket Priority" className="inputWhite" />
                                            <div className="ruleCheckboxContainer">
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">1
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">2
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">3
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">4
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                            </div>
                                        </div>
                                    </Column>
                                </Row>
                                <Row className="rowSeparator">
                                    <Column>
                                        <div className="rulesInputContainer">
                                            <TextInput id="ticketImpact" labelText="Ticket Impact" placeholder="Enter Ticket Impact" className="inputWhite" />
                                            <div className="ruleCheckboxContainer">
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">Critical
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">High
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">Major
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">Medium
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                                <FormGroup className="displayInlineDiv noMarginDiv">
                                                    <label className="displayInlineLabel floatCheckbox">Minor
                                                    {/* <Tooltip>Child tickets display as an insight in the Incident channel if enabled</Tooltip> */}
                                                        <input
                                                            type="checkbox"
                                                            className="checkboxInput floatCheckbox"
                                                            name="market-1"
                                                            id="market-1"
                                                            onClick={ (event) => { this.handleCheckbox('market', event) }}
                                                            // onClick={ (event) => { this.handleInsightCheckbox('relatedInsights', event) }}
                                                            // defaultChecked={this.props.relatedInsights || false}
                                                        />
                                                    </label>
                                                </FormGroup> 
                                            </div>
                                        </div>
                                    </Column>
                                    <Column>
                                        <div className="rulesInputContainer">
                                            <p className="inputTextExternalCss">Time</p>
                                            <Select
                                                className="labelFont"
                                                id="startTime"
                                                labelText="Select start time"
                                                // defaultValue="icd"
                                                name="startTime"
                                                onChange={ (event) => { this.handleCheckbox('startTime', event) }}
                                                // onChange={(e) => this.handleInputChange(e)}
                                            >
                                                <SelectItem value="" text="Choose an option" />
                                                <SelectItem value="1:00AM" text="1:00AM" />
                                                <SelectItem value="2:00AM" text="2:00AM" />
                                                <SelectItem value="3:00AM" text="3:00AM" />
                                                <SelectItem value="4:00AM" text="4:00AM" />
                                                <SelectItem value="5:00AM" text="5:00AM" />
                                                <SelectItem value="6:00AM" text="6:00AM" />
                                                <SelectItem value="7:00AM" text="7:00AM" />
                                                <SelectItem value="8:00AM" text="8:00AM" />
                                                <SelectItem value="9:00AM" text="9:00AM" />
                                                <SelectItem value="10:00AM" text="10:00AM" />
                                                <SelectItem value="11:00AM" text="11:00AM" />
                                                <SelectItem value="12:00PM" text="12:00PM" />
                                                <SelectItem value="1:00PM" text="1:00PM" />
                                                <SelectItem value="2:00PM" text="2:00PM" />
                                                <SelectItem value="3:00PM" text="3:00PM" />
                                                <SelectItem value="4:00PM" text="4:00PM" />
                                                <SelectItem value="5:00PM" text="5:00PM" />
                                                <SelectItem value="6:00PM" text="6:00PM" />
                                                <SelectItem value="7:00PM" text="7:00PM" />
                                                <SelectItem value="8:00PM" text="8:00PM" />
                                                <SelectItem value="9:00PM" text="9:00PM" />
                                                <SelectItem value="10:00PM" text="10:00PM" />
                                                <SelectItem value="11:00PM" text="11:00PM" />
                                                <SelectItem value="12:00AM" text="12:00AM" />
                                            </Select>
                                            <Select
                                                className="labelFont"
                                                id="endTime"
                                                labelText="Select End time"
                                                // defaultValue="icd"
                                                name="endTime"
                                                onChange={ (event) => { this.handleCheckbox('endTime', event) }}
                                                // onChange={(e) => this.handleInputChange(e)}
                                            >
                                                <SelectItem value="" text="Choose an option" />
                                                <SelectItem value="1:00AM" text="1:00AM" />
                                                <SelectItem value="2:00AM" text="2:00AM" />
                                                <SelectItem value="3:00AM" text="3:00AM" />
                                                <SelectItem value="4:00AM" text="4:00AM" />
                                                <SelectItem value="5:00AM" text="5:00AM" />
                                                <SelectItem value="6:00AM" text="6:00AM" />
                                                <SelectItem value="7:00AM" text="7:00AM" />
                                                <SelectItem value="8:00AM" text="8:00AM" />
                                                <SelectItem value="9:00AM" text="9:00AM" />
                                                <SelectItem value="10:00AM" text="10:00AM" />
                                                <SelectItem value="11:00AM" text="11:00AM" />
                                                <SelectItem value="12:00PM" text="12:00PM" />
                                                <SelectItem value="1:00PM" text="1:00PM" />
                                                <SelectItem value="2:00PM" text="2:00PM" />
                                                <SelectItem value="3:00PM" text="3:00PM" />
                                                <SelectItem value="4:00PM" text="4:00PM" />
                                                <SelectItem value="5:00PM" text="5:00PM" />
                                                <SelectItem value="6:00PM" text="6:00PM" />
                                                <SelectItem value="7:00PM" text="7:00PM" />
                                                <SelectItem value="8:00PM" text="8:00PM" />
                                                <SelectItem value="9:00PM" text="9:00PM" />
                                                <SelectItem value="10:00PM" text="10:00PM" />
                                                <SelectItem value="11:00PM" text="11:00PM" />
                                                <SelectItem value="12:00AM" text="12:00AM" />
                                            </Select>
                                        </div>
                                    </Column>
                                </Row>
                                <Row className="rowSeparator">
                                    <Column>
                                        <div className="rulesInputContainer">
                                            <p className="inputTextExternalCss">Ticket Assignment Groups (Please select Operation and Value) <Tooltip>INCLUDE - Exact match<br></br>PRESENT - Not exact match</Tooltip></p>
                                            <Select
                                                    className="labelFont"
                                                    id="groupsOperation"
                                                    labelText="Select Operation"
                                                    // defaultValue="icd"
                                                    name="groupsOperation"
                                                    onChange={ (event) => { this.handleCheckbox('groupsOperation', event) }}
                                                    // onChange={(e) => this.handleInputChange(e)}
                                                >
                                                    <SelectItem value="" text="Choose an option" />
                                                    <SelectItem value="include" text="INCLUDE" />
                                                    <SelectItem value="present" text="PRESENT" />
                                            </Select>
                                            <TextInput id="ticketAssignmentGroups" labelText={<>Enter Value <b className="groupLabelSpan">(Comma Separated)</b></>} placeholder="Enter Assignment Groups" className="inputWhite" />
                                        </div>
                                    </Column>
                                    <Column>
                                        <Select
                                            className="labelFont"
                                            id="ticketType"
                                            labelText="Select Ticket Type"
                                            // defaultValue="icd"
                                            name="ticketType"
                                            onChange={ (event) => { this.handleCheckbox('ticketType', event) }}
                                            // onChange={(e) => this.handleInputChange(e)}
                                        >
                                            <SelectItem value="" text="Choose an option" />
                                            <SelectItem value="incident" text="incident" />
                                            <SelectItem value="gsmaevent" text="gsmaevent" />
                                        </Select> 
                                    </Column>
                                </Row>
                                <Row>
                                    <Column lg={12}>
                                        <div className="">
                                            <p className="inputTextExternalCss displayInlineDIv">Additional Properties&nbsp;<Tooltip>Enter a search key and value for adding a rule eg: Priority = 1</Tooltip></p>
                                            <AddAlt32 className="addAdditionalPropIcon" onClick={this.addAdditionalProp}/>
                                            <div className="rulesDivStyleAdditionalProp">
                                                {this.state.additionalPropField.map(
                                                (v, i) =>
                                                    v && (
                                                    <Row key={"b" + i}>
                                                        <Column>
                                                        <div className="RulesDiv2">
                                                            <div className="rulesSubDiv">
                                                            <TextInput
                                                                key={"additionalPropKey-" + i}
                                                                id={"additionalPropKey-" + i}
                                                                name={"additionalPropKey-" + i}
                                                                className="inputWhite inputMarginRight"
                                                                placeholder="Add Additional Properties Key"
                                                                // defaultValue={
                                                                // param["additionalPropKey"]
                                                                //     ? param["additionalPropKey"]
                                                                //     : ""
                                                                // }
                                                                // onChange={(e) => {
                                                                // if (e.target.value)
                                                                //     rules.ADDITIOANLPROPERTY[e.target.name] =
                                                                //     e.target.value;
                                                                // }}
                                                            />
                                                            <TextInput
                                                                key={"additionalPropVal-" + i}
                                                                id={"additionalPropVal-" + i}
                                                                name={"additionalPropVal-" + i}
                                                                className="inputWhite inputMarginRight"
                                                                placeholder="Add Additional Properties Value"
                                                                // defaultValue={
                                                                // param["additionalPropVal"]
                                                                //     ? param["additionalPropVal"]
                                                                //     : ""
                                                                // }
                                                                // onChange={(e) => {
                                                                // if (e.target.value)
                                                                //     rules.ADDITIOANLPROPERTY[e.target.name] =
                                                                //     e.target.value;
                                                                // }}
                                                            />
                                                            {/* <TextInput
                                                                style={{ margin: "10px" }}
                                                                readOnly
                                                                id={"groupRules" + i}
                                                                name={"groupRules" + i}
                                                                labelText=""
                                                                onChange={(e) => this.handleInputChange(e)}
                                                                // onChange={this.props.handleChange(
                                                                // "groupRules"
                                                                // )}
                                                                className="labelFont bgRulesTitle"
                                                                placeholder="No Rules applied"
                                                                // defaultValue={
                                                                // typeof v === "object"
                                                                //     ? v[1]
                                                                //     : ""
                                                                // }
                                                                // value={
                                                                // this.props["groupRules" + i]
                                                                // }
                                                                required
                                                            /> */}
                                                            </div>
                                                            <div className="iconDivAdditionalProp">
                                                            <TrashCan32
                                                                className="iconEditSizeAdditionalProp"
                                                                aria-label="Delete Rule"
                                                                title="Delete Rule"
                                                                onClick={() =>
                                                                    this.deleteAdditionalProp(i)
                                                                }
                                                            />
                                                            </div>
                                                        </div>
                                                        </Column>
                                                    </Row>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </Column>
                                </Row>
                            </Grid>
                        </Form>
                    </div>
                    {/* <div className="bx--modal-content--overflow-indicator"></div> */}

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
                        // disabled={(!this.state.ansibleInstanceUrl || !this.state.ansibleInstanceName )}
                        // onClick={this.saveAnsibleInstance}
                        >
                        Submit Rule
                        </Button>
                    </div>
                </div>
                <span tabindex="0"></span>
            </div>
        )
    }
  render() {
      console.log(this.state);
    return (
        <div className="divContainer">
            {this.state.showPopup ? ( this.addRuleModalHtml()) : null}
            <PageBanner header={this.header} header1={this.header1} />
            <section className="formSectionMain">
                <Form className="onboardFormMain">
                    <Grid>
                        <Row>
                            <Column>
                                <TextInput
                                    className="labelFont"
                                    id="emails"
                                    name="defaultassignments"
                                    placeholder="Email id’s of the focal/dispatcher for handling incidents"
                                    labelText="Email id’s of users to add to all incident channels(Email id's , comma separated)"
                                   
                                    // <<<<<<<<<<<<-----------------CHECK ONBLUR------------------>>>>>>>>>>>>>>>>>>>>>
                                   
                                    // onBlur={async (e) => {
                                    //         if(e.target.value.trim() !== this.state.defaultassignments){
                                    //         this.setState({defaultassignments:e.target.value.trim()});
                                    //         e.target.setCustomValidity("");
                                    //         if (e.target.value.length == 0)
                                    //             return this.props.handleChange(
                                    //             "defaultassignments"
                                    //             )(e);
                                    //         const emaillArr = e.target.value
                                    //             .trim()
                                    //             .split(",");
                                    //             e.target.setCustomValidity("Verifying...");
                                    //             const { valid, message } = await this.validateEmails(emaillArr, this.props.values.collaborationTool);
                                                
                                    //             if (valid) {
                                    //                 e.target.setCustomValidity("");
                                    //                 this.props.handleInputChange("defaultassignments")(e);
                                                
                                    //             } else{
                                    //             e.target.setCustomValidity(message);
                                    //             } 
                                    //         }else{
                                    //         this.setState({defaultassignments:e.target.value.trim()});
                                    //         }
                                    //     }
                                    // }


                                    // <<<<<<<<<<<<-----------------CHECK ONBLUR------------------>>>>>>>>>>>>>>>>>>>>>

                                    onChange={(e) => this.handleInputChange(e)}
                                    // defaultValue={this.props.defaultassignments}
                                    // value={this.props.defaultassignments || ""}
                                    // onChange={(e) => this.props.handleChange("defaultassignments")(e)}
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
                                    onChange={(e) => this.handleInputChange(e)}
                                    // onChange={this.props.handleChange(
                                    // "assignmentServiceToAssignResource"
                                    // )}
                                    // defaultValue={
                                    // this.props.assignmentServiceToAssignResource
                                    // }
                                >
                                    <SelectItem value="" text="Choose an option" />
                                    <SelectItem value="cdi" text="AIOPS" />
                                    <SelectItem value="service_now" text="ServiceNow" />
                                    <SelectItem value="icd" text="ICD" />
                                </Select>
                            </Column>
                            <Column>
                                {this.state.assignmentServiceToAssignResource === "cdi" && (
                                    <TextInput
                                    className="labelFont"
                                    id="CDITicketToolID"
                                    labelText="AIOPS Ticket Tool ID"
                                    placeholder="AIOPS Ticket Tool ID"
                                    name="CDITicketToolID"
                                    onChange={(e) => this.handleInputChange(e)}
                                    // onChange={this.props.handleChange(
                                    //     "CDITicketToolID"
                                    // )}
                                    // defaultValue={this.props.CDITicketToolID}
                                    />
                                )}
                            </Column>
                        </Row>
                        <Row>
                            <Column>
                                <Select
                                className="labelFont"
                                id="squareAssignments"
                                labelText="Squad Based Assignments"
                                name="squadBasedAssignment"
                                onChange={(e) => this.handleInputChange(e)}
                                // onChange={this.props.handleChange(
                                //     "squadBasedAssignment"
                                // )}
                                // defaultValue={values.squadBasedAssignment || ""}
                                >
                                    <SelectItem
                                        hidden
                                        value=""
                                        text="Choose an option"
                                    />
                                    <SelectItem
                                        value="yes"
                                        text="Yes"
                                        // selected={values.squadBasedAssignment == "yes"}
                                    />
                                    <SelectItem
                                        value="no"
                                        text="No"
                                        // selected={values.squadBasedAssignment == "no"}
                                    />
                                </Select>
                            </Column>
                            <Column>
                                {this.state.squadBasedAssignment === "yes" && (
                                <Select
                                    className="labelFont"
                                    name="aiopsSquadGeo"
                                    id="aiopsSquadGeo"
                                    labelText={
                                    <>
                                        AIOPS Squad Geo <b className="fontRed">*</b>
                                    </>
                                    }
                                    // defaultValue={this.props.aiopsSquadGeo}
                                    onChange={(e) => this.handleInputChange(e)}
                                    // onChange={this.props.handleChange(
                                    // "aiopsSquadGeo"
                                    // )}
                                    required
                                >
                                    <SelectItem
                                    disabled
                                    defaultValue="noSquadGeo"
                                    text="Choose an option"
                                    />
                                    {/* {itemsSquadGeo} */}
                                </Select>
                                )}
                            </Column>
                        </Row>    
                        <Row>
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
                                    onChange={(e) => this.handleInputChange(e)}
                                    // onChange={this.props.handleChange(
                                    // "groupAssignment"
                                    // )}
                                    // defaultValue={values.groupAssignment || ""}
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
                        {this.state.groupAssignment === "yes" && ( <>
                            <Row>
                                <Column>
                                <h4 className="bx--label">
                                    Add Group Details(Group names's and
                                    rules) <b className="fontRed">*</b>{" "}
                                    <Tooltip>
                                    Group members get assigned according to
                                    the rule set.
                                    </Tooltip>
                                </h4>
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
                                                    onChange={(e) => this.handleInputChange(e)}
                                                    // onChange={this.props.handleChange(
                                                    // "groupName"
                                                    // )}
                                                    // defaultValue={
                                                    // typeof v === "object"
                                                    //     ? v[0]
                                                    //     : ""
                                                    // // }
                                                    // value={this.props["groupName" + i]}
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
                                                    onChange={(e) => this.handleInputChange(e)}
                                                    // onChange={this.props.handleChange(
                                                    // "groupRules"
                                                    // )}
                                                    className="labelFont bgRulesTitle"
                                                    placeholder="No Rules applied"
                                                    // defaultValue={
                                                    // typeof v === "object"
                                                    //     ? v[1]
                                                    //     : ""
                                                    // }
                                                    // value={
                                                    // this.props["groupRules" + i]
                                                    // }
                                                    required
                                                />
                                                </div>
                                                <div className="iconDiv">
                                                <Add24
                                                    className="iconAddSize"
                                                    aria-label="Add Rule"
                                                    title="Add Rule"
                                                    onClick={(e) => { this.showModal(); }}
                                                    // onClick={() => showModal(true)}
                                                />
                                                {/* <AddRules
                                                    key={"group" + i}
                                                    index={"group" + i}
                                                    rulesFor="group"
                                                    accountsData={
                                                    this.props.AccData
                                                        .accountsData
                                                    }
                                                    onAddRules={(rules) =>
                                                    this.state.registerState(
                                                        "groupRules" + i,
                                                        rules
                                                    )
                                                    }
                                                /> */}
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
export default MUIAssignments;