import React, { Component } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  OverflowMenu, 
  OverflowMenuItem,
  Search,
  TextInput,
  Button
} from "carbon-components-react";
import { Edit32 } from "@carbon/icons-react";
import { Search32 } from "@carbon/icons-react";
import { Reset32 } from "@carbon/icons-react";
import { searchIcon } from "@carbon/icons-react";
import { trackPromise } from "react-promise-tracker";
import "./table.scss";
import { Link } from "react-router-dom";
// import axios from 'axios';


class DataTablePA extends Component {
    constructor(){
        super();
        this.state ={
            accData: [],
            accID: '',
            feedStatusData:[],
            filtered:[],
            searchVal:''
        };
        this.loadFeedStatus = this.loadFeedStatus.bind(this);
    }
    componentDidMount() {
        trackPromise(fetch('/mui/onboardAccountDataPA')
        .then(res => {
            return res.json()
        })
        .then(accData => { 
            this.setState({
                 accData,
                filtered: accData.accountsData })
        }))
    }
    handleReset = e => {
        var searchValObj = {}
        searchValObj["searchVal"] = '';
        trackPromise(
            fetch('/mui/resetSearch' , {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(searchValObj)
            })
            .then((result) => {result.json()
                if(result.status == 200){
                    e.preventDefault();
                    this.loadSearchDara();
                }
            })
            
        )
    }
    editAccountClick= (e) => {
        e.preventDefault();
        var accID = e.currentTarget.id;
        fetch('/mui/editAccountDetails' , {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                "accID": accID
             })
        })
        .then((result) => {result.json()
            if(result.status == 200){
              window.location.href = "/mui/addAccountDetails";
            }
        })
    }
    handleSearch = e => {
        this.setState({
            searchVal: e.target.value
        })
        
    };
    handleSeachClick = e => {
        const { accData, searchVal } = this.state
        this.setState({
            filtered: accData.accountsData.filter(({accountName}) => accountName && accountName.toLowerCase().startsWith(searchVal.toLowerCase()))
        })
    } ;
    loadSearchDara = () => {
        trackPromise(
            fetch('/mui/onboardAccountDataPA')
            .then(res => {
                return res.json()
            })
            .then(accData => { 
                this.setState({ 
                    accData,
                    filtered: accData.accountsData
                })
            })
            
        )
    }
    feedStatus = (e) => {
        e.preventDefault();
        var feedDtatusName = e.currentTarget.name;
        const feedData = {
            accCode: e.currentTarget.id,
            feedStatusData: feedDtatusName
        };
        trackPromise(
            fetch('/mui/addFeedStatus' , {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(feedData)
            })
            .then((result) => {result.json()
                if(result.status == 200){
                    e.preventDefault();
                    this.loadFeedStatus();
                }
            })
        )
    }
    loadFeedStatus = () => {
        trackPromise(
            fetch('/mui/onboardAccountDataPA')
            .then(res => {
                return res.json()
            })
            .then(accData => { 
                this.setState({ accData })
            })
            
        )
    }


    render() {
        const items = []
        var rows ;
        var headers = [
            "Account Code",
            "Account Name",
            "Account Geo",
            "Group Name",
            "Created On (UTC)",
            "Account Status",
            "Feed Status",
            ""
        ];
        var feedStatus = '';
        var feedAccCode = '';
        const rowsData = this.state.accData;
        if(this.state.feedStatusData){
            var feedData = this.state.feedStatusData;
            if(Object.keys(feedData).length != 0){
                var feedDataFetched = feedData.statusList;
                feedStatus = feedDataFetched.feedStatus;
                feedAccCode = feedDataFetched.accCode;
            }
            
        }
        if(rowsData.length !==0 ){
            var rowDataArr = rowsData.accountsData;
            rows = this.state.filtered;
            var tag = '';
            var formSubmitted;
            var feedTag = '';
            var overflowMenu = '';
            Object.entries(rows).map(([key, value]) => {
                let tableTr = "";
                var accID = value._id;
                if (value.hasOwnProperty("geo")) {
                }else{
                    value.geo = "NA";
                }
                if (value.hasOwnProperty("feedStatus")) {
                    if(value.feedStatus == "active"){
                        feedTag = <Tag type="teal" title="Clear Filter">Active</Tag>
                    }else if(value.feedStatus == "deactive"){
                        feedTag = <Tag type="magenta" title="Clear Filter">Deactive</Tag>
                    }else if(value.feedStatus == "requestForFeed"){
                        feedTag = <Tag type="gray" title="Clear Filter">Requested for feed</Tag>
                    }else if(value.feedStatus == "hold"){
                        feedTag = <Tag type="cyan" title="Clear Filter">Hold</Tag>
                    }
                }
                else{
                    feedTag = <Tag type="warm-gray" title="Clear Filter"> NA </Tag>
                }
                if(value.submitted && (value.saved == true || value.saved == false)){
                    tag = <Tag type="green" title="Clear Filter"> Submitted </Tag>
                    overflowMenu =  <div className="overflowMenuPA">
                                        <OverflowMenu
                                        ariaLabel="Feed Status"
                                        title="Feed Status"
                                        aria-label="Feed Status"
                                        aria-labelledby="Feed Status"
                                        iconDescription="Feed Status"
                                        className="overFlowIcon"
                                        selectorPrimaryFocus="option-two"
                                        > 
                                            <OverflowMenuItem
                                                name="active"
                                                defaultValue="active"
                                                className="overflowMenuClass"
                                                itemText="Active"
                                                id={value.accountCode}
                                                onClick={this.feedStatus}
                                            />
                                            <OverflowMenuItem
                                                name="deactive"
                                                defaultValue="deactive"
                                                className="overflowMenuClass"
                                                itemText="Deactive"
                                                id={value.accountCode}
                                                onClick={this.feedStatus}
                                            />
                                            <OverflowMenuItem
                                                name="requestForFeed"
                                                defaultValue="requestForFeed"
                                                className="overflowMenuClass"
                                                itemText="Requested for feed"
                                                id={value.accountCode}
                                                onClick={this.feedStatus}
                                            />
                                            <OverflowMenuItem
                                                name="hold"
                                                defaultValue="hold"
                                                className="overflowMenuClass"
                                                itemText="Hold"
                                                id={value.accountCode}
                                                onClick={this.feedStatus}
                                            />
                                        </OverflowMenu>
                                    </div>
                }else if(value.submitted == false && value.saved == true){
                    tag = <Tag type="purple" title="Clear Filter">Saved as Draft</Tag>
                    overflowMenu = ""
                }else{
                    tag = <Tag type="blue" title="Clear Filter">Not Submitted </Tag>
                    overflowMenu = ""
                }
                var redirectUrl = "/mui/addAccountDetails?"+value._id;
                tableTr = <tr >
                            <td className="tdStyle" style={{width: "13% !important",wordBreak: "break-word"}}>{value.accountCode}</td>
                            <td className="tdStyle">{value.accountName}</td>
                            <td className="tdStyle">{value.geo}</td>
                            <td className="tdStyle">{value.groupName}</td>
                            <td className="tdStyle">{value.date}</td>
                            <td className="tdStyle">{tag}</td>
                            <td className="tdStyle">{feedTag}</td>
                            <td className="tdStyle" style={{width: "12%"}}>
                                <Link  id={value._id} to={redirectUrl} ><Edit32 className="iconEditSize editIconPA" aria-label="Add" /></Link>
                                {overflowMenu}
                            </td>
                        </tr>
                items.push( tableTr );
            })
        }
       
        return (
            <div className="dataTableMainDiv">
            <div className="searchDivMain">
                <div className="mainHeaderDivPA">
                    <TextInput
                        id="search-1"
                        labelText=""
                        placeholder="Search"
                        className="searchInput"
                        onChange={this.handleSearch}
                        defaultValue=''
                    />
                    <a  id="searchIcon" onClick={this.handleSeachClick}><Search32 className="iconEditSize editIconPA" style={{margin: "0 10px"}} aria-label="Search" /></a>
                    <a  id="resetIcon" onClick={this.handleReset}><Reset32 className="iconEditSize editIconPA" aria-label="Reset" /></a>
                </div>
                <Link class="addBtnPACss" to="/mui/addAccountDetails">
                    <Button className="addAccBtn addBtnCss addBtnPACss">
                        <Link to="/mui/addAccountDetails">Add Account</Link>
                    </Button>
                </Link>
                {/* <Button className="addAccBtn addBtnCss">
                    <Link to="/mui/addAccountDetails">Add Account</Link>
                </Button> */}
            </div>
                <Table className="dataTablePA">
                    <TableHead>
                        <TableRow>
                            {headers.map((header) => (
                            <TableHeader key={header}>{header}</TableHeader>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items}
                    </TableBody>
                </Table>
            </div>
        )
    }
}

export default DataTablePA;
