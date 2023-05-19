import React, {Component} from 'react';
import merge from "lodash/merge";
import {Query, Builder, BasicConfig,Widgets,Settings,
    Utils as QbUtils} from 'react-awesome-query-builder';
// import React from 'react';
import ReactDOM from 'react-dom';
import { trackPromise } from "react-promise-tracker";
import {  Button, Form, TextInput, Select, SelectItem  } from 'carbon-components-react';
import AddGlobalAssignmentsBreadcrump from './AddGlobalAssignmentsBreadcrump';
import SALandingSidebar from '../../SALandingSidebar';
import { withRouter } from 'react-router-dom';
import "react-awesome-query-builder/css/antd.less";
// For Material-UI widgets only:
import MaterialConfig from 'react-awesome-query-builder/lib/config/material';

import 'react-awesome-query-builder/lib/css/styles.css';
import 'react-awesome-query-builder/lib/css/compact_styles.css'; //optional, for more compact styles
import { validate } from '../../../../validation/validate.js';
// Choose your skin (ant/material/vanilla):
const InitialConfig = BasicConfig; // or MaterialConfig or BasicConfig

var config = {
  ...InitialConfig,
  
  fields: {
  }
};

// You can load query value from your backend storage (for saving see `Query.onChange()`)
const queryValue = {"id": QbUtils.uuid(), "type": "group"};
class SAAddGlobalAssignments extends Component {
    constructor(props) {
        super(props);
        this.state = (
            {
                globalAssignmentFromDB:[],
                verifiedglobalAssignmentFetched:[],
                globalAssignmentNameElement: '',
                name: '',
                group: '',
                rule: '',
                resErrMsg: '',
                tree: QbUtils.checkTree(QbUtils.loadTree(queryValue), config),
                config: config,
                ruleFlag: false
            }
        );
    }
    componentDidMount() {
        trackPromise(fetch('/mui/addGlobalAssignments')
        .then(res => {
            return res.json()
        })
        .then(globalAssignmentData => { 
            this.setState({ globalAssignmentData })
        })
        )
        trackPromise(fetch('/mui/addglobalAssignmentData')
        .then(res => {
            return res.json()
        })
        .then(addglobalAssignmentData => { 
            this.setState({ addglobalAssignmentData })
            var fromState = this.state.addglobalAssignmentData;
            var geoObj = '';
            var marketObj = '';
            var industryObj = '';
            var sectorObj = '';
            var countryObj = '';
            const itemsGeo = []; 
            const itemsMarket = [];
            const itemsCountry = [];
            const itemsIndustry = [];
            const itemsSector = [];
            var ticketPriorityArr =  [
                { value: '1', title: '1' },
                { value: '2', title: '2' },
                { value: '3', title: '3' },
                { value: '4', title: '4' }
            ];
            var ticketImpactArr = [
                { value: 'Critical', title: 'Critical' },
                { value: 'High', title: 'High' },
                { value: 'Major', title: 'Major' },
                { value: 'Medium', title: 'Medium' },
                { value: 'Low', title: 'Low' },
            ]
            if(this.state.addglobalAssignmentData){
                geoObj= fromState.geoList;
                marketObj = fromState.marketList;
                industryObj = fromState.industryList;
                sectorObj = fromState.sectorList;
                countryObj = fromState.countryList;
                for(var i=0; i < geoObj.length ; i++){
                    var geoListObj = {}
                    geoListObj["value"] = geoObj[i].geo
                    geoListObj['title'] = geoObj[i].geo
                    itemsGeo.push(geoListObj);
                }
                 for(var i=0; i < countryObj.length ; i++){
                    var countryListObj = {}
                    countryListObj["value"] = countryObj[i].desc
                    countryListObj['title'] = countryObj[i].desc
                    itemsCountry.push(countryListObj);
                }
                 for(var i=0; i < industryObj.length ; i++){
                    var industryListObj = {}
                    industryListObj["value"] = industryObj[i].desc
                    industryListObj['title'] = industryObj[i].desc
                    itemsIndustry.push(industryListObj);
                }
                 for(var i=0; i < sectorObj.length ; i++){
                    var sectorListObj = {}
                    sectorListObj["value"] = sectorObj[i].desc
                    sectorListObj['title'] = sectorObj[i].desc
                    itemsSector.push(sectorListObj);
                }
                for(var i=0; i < marketObj.length ; i++){
                    var marketListObj = {}
                    marketListObj["value"] = marketObj[i]
                    marketListObj['title'] = marketObj[i]
                    itemsMarket.push(marketListObj);
                }
                const operators = {
                    ...InitialConfig.operators,
                    INCLUDE: {
                      label: "INCLUDE",
                      labelForFormat: "INCLUDE",
                      valueSources: ['value'],
                      sqlFormatOp: (field, _op, values, valueSrc) => {
                        if (valueSrc === 'value') {
                            var removeQuate = values.replace(/'/g, "");;
                            var splitVal = removeQuate.split(',');
                            var joinSplit;
                            var splitValArray = [];
                            for (var i = 0; i < splitVal.length; i ++){
                                joinSplit = "'"+splitVal[i]+"'";
                                splitValArray.push(joinSplit)
                            }
                            var joinValue = splitValArray.join(",")
                          return `( ${field}.INCLUDE([${joinValue}]) )`;
                        } else return undefined; // not supported
                      },
                      sqlOp: "INCLUDE",
                      jsonLogic: (field, _op, val) => ({ in: [val, field] }),
                      mongoFormatOp: (field, _op, value, useExpr) => {
                        const $field =
                          typeof field === "string" && !field.startsWith("$")
                            ? "$" + field
                            : field;
                        const mv = value.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
                        const mop = "$regex";
                        return !useExpr ? { [field]: { [mop]: mv } } : { [mop]: [$field, mv] };
                      }
                    },
                    PRESENT: {
                      label: "PRESENT",
                      labelForFormat: "PRESENT",
                      valueSources: ['value'],
                      sqlFormatOp: (field, _op, values, valueSrc) => {
                        if (valueSrc === 'value') {
                            var removeQuate = values.replace(/'/g, "");;
                            var splitVal = removeQuate.split(',');
                            var joinSplit;
                            var splitValArray = [];
                            for (var i = 0; i < splitVal.length; i ++){
                                joinSplit = "'"+splitVal[i]+"'";
                                splitValArray.push(joinSplit)
                            }
                            var joinValue = splitValArray.join(",")
                            return `( ${field}.PRESENT([${joinValue}]) )`;
                        } else return undefined; // not supported
                      },
                      sqlOp: "PRESENT",
                      jsonLogic: (field, _op, val) => ({ in: [val, field] }),
                      mongoFormatOp: (field, _op, value, useExpr) => {
                        const $field =
                          typeof field === "string" && !field.startsWith("$")
                            ? "$" + field
                            : field;
                        const mv = value.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
                        const mop = "$regex";
                        return !useExpr ? { [field]: { [mop]: mv } } : { [mop]: [$field, mv] };
                      }
                    },
                    equal: {
                      label: "equal",
                      labelForFormat: "equal",
                      valueSources: ['value'],
                      sqlFormatOp: (field, _op, values, valueSrc) => {
                        if (valueSrc === 'value') {
                          return `( '${field}' = ${values} )`;
                        } else return undefined; // not supported
                      },
                      sqlOp: "=",
                      jsonLogic: (field, _op, val) => ({ in: [val, field] }),
                      mongoFormatOp: (field, _op, value, useExpr) => {
                        const $field =
                          typeof field === "string" && !field.startsWith("$")
                            ? "$" + field
                            : field;
                        const mv = value.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
                        const mop = "$regex";
                        return !useExpr ? { [field]: { [mop]: mv } } : { [mop]: [$field, mv] };
                      }
                    },
                    notequal: {
                        label: "not equal",
                        labelForFormat: "not equal",
                        valueSources: ['value'],
                        sqlFormatOp: (field, _op, values, valueSrc) => {
                          if (valueSrc === 'value') {
                            return `( '${field}' != ${values} )`;
                          } else return undefined; // not supported
                        },
                        sqlOp: "!=",
                        jsonLogic: (field, _op, val) => ({ in: [val, field] }),
                        mongoFormatOp: (field, _op, value, useExpr) => {
                          const $field =
                            typeof field === "string" && !field.startsWith("$")
                              ? "$" + field
                              : field;
                          const mv = value.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
                          const mop = "$regex";
                          return !useExpr ? { [field]: { [mop]: mv } } : { [mop]: [$field, mv] };
                        }
                      },
                  };
                  
                  const widgets = {
                    ...InitialConfig.widgets
                  };
                  
                  const types = {
                    ...InitialConfig.types,
                    // examples of  overriding
                    text: {
                      ...InitialConfig.types.text,
                      widgets: {
                        ...InitialConfig.types.text.widgets,
                        text: {
                          ...InitialConfig.types.text.widgets.text,
                          operators: [
                            ...InitialConfig.types.text.widgets.text.operators,
                            "INCLUDE",
                            "PRESENT",
                            "equal",
                            "notequal"
                          ]
                        },
                      }
                    },
                    select: {
                      ...InitialConfig.types.select,
                      widgets: {
                        ...InitialConfig.types.select.widgets,
                        select: {
                          ...InitialConfig.types.select.widgets.select,
                          operators: [
                            ...InitialConfig.types.select.widgets.select.operators,
                            "equal",
                            "notequal"
                          ]
                        },
                      }
                    },

                  };
                  
                  const settings = {
                    ...InitialConfig.settings
                  };
                this.setState({config: {
                    ...InitialConfig,
                    operators,
                    widgets,
                    types,
                    fields: {
                        GEOGRAPHY:{
                        label: 'GEOGRAPHY',
                        type: 'select',
                        excludeOperators: ["select_equals", "select_not_equals",'select_any_in', 'select_not_any_in',"is_empty","is_not_empty",],
                        valueSources: ['value'],
                        fieldSettings: {
                            listValues: itemsGeo,
                        }
                    },
                    MARKET:{
                        label: 'MARKET',
                        type: 'select',
                        excludeOperators: ["notequal","select_equals", "select_not_equals","select_equals", "select_not_equals",'select_any_in', 'select_not_any_in',"is_empty","is_not_empty", "select_not_equals"],
                        valueSources: ['value'],
                        fieldSettings: {
                            listValues: itemsMarket,
                        }
                    },
                    SECTOR:{
                        label: 'SECTOR',
                        type: 'select',
                        excludeOperators: ["notequal","select_equals", "select_not_equals","select_equals", "select_not_equals",'select_any_in', 'select_not_any_in',"is_empty","is_not_empty","select_not_equals"],
                        valueSources: ['value'],
                        fieldSettings: {
                            listValues: itemsSector,
                        }
                    },
                    INDUSTRY:{
                        label: 'INDUSTRY',
                        type: 'select',
                        excludeOperators: ["notequal","select_equals", "select_not_equals","select_equals", "select_not_equals",'select_any_in', 'select_not_any_in',"is_empty","is_not_empty","select_not_equals"],
                        valueSources: ['value'],
                        fieldSettings: {
                            listValues: itemsIndustry,
                        }
                    },
                    COUNTRYNAME:{
                        label: 'COUNTRY',
                        type: 'select',
                        excludeOperators: ["notequal","select_equals", "select_not_equals",'select_any_in', 'select_not_any_in',"is_empty","is_not_empty","select_not_equals"],
                        valueSources: ['value'],
                        fieldSettings: {
                            listValues: itemsCountry,
                        }
                    },
                    TICKETPRIORITY:{
                        label: 'TICKET PRIORITY',
                        type: 'select',
                        excludeOperators: ["notequal","select_equals", "select_not_equals","select_equals", "select_not_equals",'select_any_in', 'select_not_any_in',"is_empty","is_not_empty","select_not_equals"],
                        valueSources: ['value'],
                        fieldSettings: {
                            listValues: ticketPriorityArr,
                        }
                    },
                    TICKETIMPACT:{
                        label: 'TICKET IMPACT',
                        type: 'select',
                        excludeOperators: ["notequal","select_equals", "select_not_equals","select_equals", "select_not_equals",'select_any_in', 'select_not_any_in',"is_empty","is_not_empty","select_not_equals"],
                        valueSources: ['value'],
                        fieldSettings: {
                            listValues: ticketImpactArr,
                        }
                    },
                    BlueID: {
                        label: 'BlueID',
                        type: 'text',
                        valueSources: ['value'],
                        excludeOperators: ["notequal","INCLUDE","PRESENT","not_equal","is_empty", "is_not_empty", "like", "not_like", "starts_with", "ends_with", "proximity"],
                        // excludeOperators: [ 'not_equal'],
                        defaultOperator: ["equal"],
                    },
                    CDIC: {
                        label: 'APIOS Client ID',
                        type: 'text',
                        valueSources: ['value'],
                        excludeOperators: ["notequal","INCLUDE","PRESENT","not_equal","is_empty", "is_not_empty", "like", "not_like", "starts_with", "ends_with", "proximity"],
                        defaultOperator: ["equal"],
                    },
                    CDIR: {
                        label: 'CDIR',
                        type: 'text',
                        excludeOperators: ["notequal","INCLUDE","PRESENT","not_equal","is_empty", "is_not_empty", "like", "not_like", "starts_with", "ends_with", "proximity"],
                        valueSources: ['value'],
                        // excludeOperators: [ 'not_equal'],
                        defaultOperator: ["equal"],
                    },
                    TICKETASSIGNMENTGROUPS : {
                        label: 'TICKET ASSIGNMENT GROUPS ',
                        type: 'text',
                        excludeOperators: ["notequal","not_equal","equal","is_empty", "is_not_empty", "like", "not_like", "starts_with", "ends_with", "proximity"],
                        preferWidgets: ["text"],
                        valueSources: ['value'],
                    },
                }}})
            }
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
    handleruleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };
    formSubmit= (e) => {
        e.preventDefault();
        this.setState({
            [e.target.name]: e.target.value
        });
        this.setState({resErrMsg: ''});
        var editFlag = false;
        var ruleToSave ;
        if(this.state.globalAssignmentData?.globalAssignmentDataToEdit){
            editFlag = true;
        }else{
            editFlag = false;
        }
        if(this.state.rule.length > 0){
            ruleToSave = this.state.rule
        }else if(this.state.rule.length == 0){
            ruleToSave = ''
        }else if(this.state.globalAssignmentData?.globalAssignmentDataToEdit?.rule){
            if(this.state.rule.length > 0 ){
                ruleToSave = this.state.rule
            }else if(this.state.rule.length == 0){
                ruleToSave = ''
            }else{
                ruleToSave = this.state.globalAssignmentData?.globalAssignmentDataToEdit?.rule
            }
        }
        var channelTOEdit = '';
        const globalAssignmentData = {
            name: this.state.name || this.state?.globalAssignmentData?.globalAssignmentDataToEdit?.name,
            rule: ruleToSave,
            group: this.state.group || this.state?.globalAssignmentData?.globalAssignmentDataToEdit?.groups,
            editFlag: editFlag,
            ruleFlag: this.state.ruleFlag,
        }
         // SpecialCharacter validation
        var validateFields = validate(globalAssignmentData);
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
                fetch('/mui/saveGlobalAssignment' , {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(globalAssignmentData)
            })
            .then((result) => {
                if (result.status === 404 || result.status === 400 || result.status === 500)  {
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.fetchErrorfromGlobalAssignment});
                    })
                } else if (result.status === 409) {
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.fetchErrorfromGlobalAssignment});
                    })
                } else if(result.status == 200){
                    this.props.history.push("/mui/globalAssignments");
                }
           })
            .catch(err => { 
              this.setState({errorMessage: err.message});
            })
            )
        }
          
    }
    renderBuilder = (props) => {
        return (<div className="query-builder-container" style={{padding: '10px'}}>
            <div className="query-builder qb-lite">
                <Builder {...props} />
            </div>
            </div>
        )
    }

    renderResult = ({tree: immutableTree, config}) => {
        return (
            <div className="query-builder-result">
                <div>Query string: <pre>{JSON.stringify(QbUtils.queryString(immutableTree, config))}</pre></div>
                <div>MongoDb query: <pre>{JSON.stringify(QbUtils.mongodbFormat(immutableTree, config))}</pre></div>
                <div>SQL where: <pre>{JSON.stringify(QbUtils.sqlFormat(immutableTree, config))}</pre></div>
                <div>JsonLogic: <pre>{JSON.stringify(QbUtils.jsonLogicFormat(immutableTree, config))}</pre></div>
            </div>
        )
    }
    
    onChange = (immutableTree, config) => {
        // Tip: for better performance you can apply `throttle` - see `examples/demo`
        this.setState({tree: immutableTree, config: config});
        const jsonTree = QbUtils.getTree(immutableTree);
        var ruleToSave;
        var queryString = JSON.stringify(QbUtils.queryString(immutableTree, config));
        var mongodbFormat = JSON.stringify(QbUtils.mongodbFormat(immutableTree, config));
        var sqlFormat = JSON.stringify(QbUtils.sqlFormat(immutableTree, config));
        var JsonLogic = JSON.stringify(QbUtils.jsonLogicFormat(immutableTree, config));
        this.setState({rule: sqlFormat})
        this.setState({ruleFlag: true})
        // `jsonTree` can be saved to backend, and later loaded to `queryValue`
    }
    render() {
        var stateObj = this.state;
        var configVal ;
        var rules = '';
        if(this.state.config){
            configVal = this.state.config
        }else{
            configVal = config;
        }
        if(this.state.rule){
            rules = this.state.rule;
        }else{
            rules = ''
        }
        var name = '';
        var group = '';
        var rule = '';
        if(this.state.globalAssignmentData){
            // EDIT FLOW------
            var dataToEdit = this.state?.globalAssignmentData?.globalAssignmentDataToEdit;
            name = dataToEdit.name;
            group = dataToEdit.groups;
            if(this.state.rule){
                rules = this.state.rule;
            }else{
                rules = dataToEdit.rule;
            }
            
        }else{
            // CREATE FLOW-------
            name = '';
            group = '';
            rules = rules;
        }
        return (
            <div className="divContainer">
                 <section className="sectionGrid">
                    <div class="bx--grid padding0">
                         <div class="rowWidth">
                             <div class="gridColulmnWidth3">
                                 <SALandingSidebar />
                            </div>
                            <div class="gridColumn13" style={{maxWidth: '20% !important', paddingRight: '0 !important'}}>
                                 <AddGlobalAssignmentsBreadcrump />
                                 <div className="formDivSA formDivSALg">
                                     <Form  onSubmit={this.formSubmit}>
                                        <TextInput className="bx--text-input bx--text__input" id="name" name="name" labelText={ <> Name <b className="fontRed">*</b> </> }  placeholder="Name" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={name} required />
                                        <TextInput className="bx--text-input bx--text__input" id="group" name="group" labelText={ <> Group Name <b className="fontRed">*</b> </> }  placeholder="Group Name" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={group} required />
                                        <div>
                                            <Query
                                                {...configVal}
                                                value={this.state.tree}
                                                onChange={this.onChange}
                                                renderBuilder={this.renderBuilder}
                                            />
                                        </div>
                                        <TextInput className="bx--text-input bx--text__input" id="rule" name="rule" labelText= "Rule"  placeholder="Rule" onBlur={(e) => this.handleInputChange(e)} onKeyUp={(e) => this.handleruleChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={rules} />
                                        <br></br>
                                        {
                                            this.state['specialCharacterErr'] &&
                                            <small className="fontRed">
                                                <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                                            </small>
                                        }
                                        <br></br>
                                        <Button kind="primary" type="submit" className="btnGeneral addWorkspace" >Submit</Button>
                                        {
                                            this.state['resErrMsg'] && 
                                            <small className="fontRed">
                                            <b className="blgrperrorMsg">{this.state.resErrMsg.validateGAMsgNew}</b>
                                            </small>
                                        }
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
           
        )
      
    }
}
export default withRouter(SAAddGlobalAssignments);

