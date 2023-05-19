// CommandRegistration.jsx
import React, { Component } from 'react';
import {
    Button,
    Form,
    Select,
    TextInput,
    SelectItem,
    Breadcrumb,
    BreadcrumbItem,
    Accordion,
    AccordionItem,
    Tag
  } from "carbon-components-react";
import './commandReg.scss';
import { Filter32 } from "@carbon/icons-react";
import { trackPromise } from "react-promise-tracker";
import { Edit32 } from "@carbon/icons-react";
import { Link } from 'react-router-dom';
class CommandRegistration extends Component{
    constructor(){
        super();
        this.state ={
            cmdData: []
        };
    }
   
    componentDidMount() {
        trackPromise(
            fetch('/mui/fetchCommandRegistered')
            .then(res => {
                return res.json()
            })
            .then(cmdData => { 
                this.setState({ cmdData })
            })
        )
    }
    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
        if(e.target.name == "accountCodeFilter"){
            var accCodeTOFilter = {}
            accCodeTOFilter[e.target.name] = e.target.value;
            trackPromise(
                fetch('/mui/postAccCodeCommandRegistration' , {
                    method: "POST",
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(accCodeTOFilter)
                })
                .then((result) => {result.json()
                    if(result.status == 200){
                        e.preventDefault();
                        this.loadDynamicWOrkflow();
                    }
                })
                
            )
        }
    };
    loadDynamicWOrkflow = () => {
        trackPromise(
            fetch('/mui/fetchCommandRegistered')
            .then(res => {
                return res.json()
            })
            .then(cmdData => { 
                this.setState({ cmdData })
            })
            
        )
    }
    render(){
        var items = [];
        var paramToPush = [];
        var accountToPush = [];
        var uniqueNames = [];
        var groupToPush = [];
        var formOptionAccCode = '';
        var itemsAccCode = []
        var stateData = this.state;
        var accName = '';
        var accCode = '';
        var accId = '';
        if(this.state.cmdData){
            var cmdDataFetched = stateData.cmdData;
            var accordionItem = '';
            var paramitem = ''
            var accDetailsTag = ''
            var redirect_url = '';
            if(cmdDataFetched.dynamicWorkflowData){
                var dataFetched = stateData.cmdData.accountData;
                var uniqueArr = dataFetched.uniqueNames;
                for(var i = 0; i<uniqueArr.length;i++){
                    formOptionAccCode = <option className="bx--select-option" defaultValue={uniqueArr[i]}>{uniqueArr[i]}</option>
                    itemsAccCode.push( formOptionAccCode );
                }

                var accDataFetched = dataFetched.accCode;
                accName = dataFetched.accName;
                accCode = dataFetched.accCode;
                accId = dataFetched._id;
                if(accCode.length > 0){
                    accDetailsTag = <h4>Account Name: {dataFetched.accName} | Account Code: {dataFetched.accCode}</h4>
                    // redirect_url = "/mui/commandRegistraton?"+accId;
                }else{
                    accDetailsTag = ''
                    // redirect_url = '';
                }
                
                var redirectUrl = "/mui/addCommandRegistraton?"+dataFetched._id;
                var redirectUrl1 = "/mui/commandRegistraton?"+dataFetched._id;
                

                var fetchedFromStore =cmdDataFetched.dynamicWorkflowData;
                for (var i =0; i< fetchedFromStore.length; i++){
                    var fetchedCmdData = fetchedFromStore[i];
                    if(fetchedCmdData.accountCode != undefined){
                        accountToPush.push(fetchedCmdData.accountCode);
                        uniqueNames = Array.from(new Set(accountToPush));
                    }
                    var cmdId = fetchedFromStore[i]._id;
                    var editUrl = "/mui/addCommandRegistraton?id="+cmdId;
                    var accCodeFromDW = fetchedCmdData.accountCode;
                    var paramsData = fetchedCmdData.params;
                    var groupData = fetchedCmdData.group;
                    paramToPush = []
                    groupToPush=[]
                    if(paramsData || paramsData != undefined){
                        Object.entries(paramsData).map(([key, value]) => {
                            paramitem = <Tag type="gray" title="Clear Filter">{key}</Tag>
                            paramToPush.push( paramitem );
                        });
                    }
                    if(groupData){
                        var groupitem = ''
                        var groupStr = fetchedCmdData.group;
                        var str_array = groupStr.split(',');
                        <h6>Group</h6>
                        Object.entries(str_array).map(([key, value]) => {
                            paramitem = <Tag type="gray" title="Clear Filter">{value}</Tag>
                            groupToPush.push( paramitem );
                        });
                        groupToPush.push(groupitem);

                    }else{
                        groupitem = 'N/A';
                        groupToPush.push(groupitem);
                    }
                    var command = "Command: " + fetchedCmdData.command

                    if(fetchedCmdData.accountCode) {
                        command = command + " | Account Code: " + fetchedCmdData.accountCode
                    }

                    if(accCodeFromDW == accDataFetched) {
                        accordionItem = <AccordionItem title={command}>
                                        <div className="paramsDivMain">
                                            <div className="editDiv">
                                                <Link  id={cmdId} to={editUrl} ><Edit32 className="editIconCmd" /></Link>
                                                
                                            </div>
                                            <div className="cmdContentDiv">
                                                <div className="bgDivCmd">
                                                    <h6>Group</h6>
                                                     {groupToPush}
                                                </div> 
                                                <h6>Params</h6>
                                                {paramToPush}
                                            </div>
                                        </div>
                                    </AccordionItem>
                        items.push( accordionItem );
                    }else{
                        accordionItem = <AccordionItem title={command}>
                                        <div className="paramsDivMain">
                                            <div className="bgDivCmd">
                                                <h6>Group</h6>
                                                 {groupToPush}
                                            </div> 
                                            
                                            <h6>Params</h6>
                                            {paramToPush}
                                        </div>
                                    </AccordionItem>
                        items.push( accordionItem );
                    }
                }
                
            }else{
                redirectUrl1 = "/mui/onboardAccount";
            }
        }
        return(
            <div className="divContainer">
                <div className="headerDiv sectionMargin  mainMargin">
                    <div>
                        <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/mui/home">Home</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/mui/onboardAccount">Accounts</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <Link to={redirectUrl1}>Command Registration</Link>
                        </BreadcrumbItem>
                        </Breadcrumb>
                    </div>
                    <h2 className="headerText">Command Registration</h2>
                    {/* <h4>test-----{accCode}</h4> */}
                    {accDetailsTag}
                    {/* <h4>Account Name: {accName} | Account Code: {accCode}</h4> */}
                </div>
                <section className="sectionMargin mainMargin paddingCostom">
                    <div className="addBtnPA">
                        <Link to={redirectUrl}>
                            <Button className="addAccBtn">
                                Command Registration
                            </Button>
                        </Link>
                        <Select
                                className="labelFont"
                                id="accountCodeFilter"
                                labelText="Filter Command with Account Code"
                                defaultValue=''
                                name="accountCodeFilter"
                                onChange={this.handleInputChange}
                            >
                            <SelectItem
                                defaultValue="noOption"
                                text="No Filter"
                            />
                            {itemsAccCode}
                        </Select>
                        
                    </div>
                    <div className="accordionDiv">
                        <Accordion align='start'>
                            {items}
                        </Accordion>
                    </div>
                </section>
                
            </div>
        )
    }
}

export default CommandRegistration;