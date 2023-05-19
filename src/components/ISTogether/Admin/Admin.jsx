import React from 'react';
import ReactDOM from 'react-dom';
import { trackPromise } from "react-promise-tracker";
import { Table, TableBody, Select,SelectItem, TableHead, TableHeader, TableRow } from "carbon-components-react";
import { Link, withRouter } from 'react-router-dom';
import "react-datetime/css/react-datetime.css";
import LazyLoad from "react-lazyload";
class AdminLanding extends React.Component {
    constructor() {
        super();
        this.state = { reqData: [] };
      }
      componentDidMount() {
        trackPromise(
            fetch("/mui/teamITAdminData")
            .then((res) => {
                return res.json();
            })
            .then((reqData) => {
                this.setState({ reqData });
            })
        );
      }

    handleInputChange = (e) => {
        if ((e.target.value && e.target.value.includes("script") && e.target.value.includes("<")) || e.target.value.includes(">")){
            this.setState({
                ["inValid_" + e.target.name]: "Invalid Input.",
            });
            return;
        }
        this.setState({
            [e.target.name]: e.target.value,
        });
    };
    applyFilter = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
        var requestToFilter = {}
        requestToFilter[e.target.name] = e.target.value;
        trackPromise(
            fetch('/mui/postRequestFilter' , {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(requestToFilter)
            })
            .then((result) => {result.json()
                if(result.status == 200){
                    e.preventDefault();
                    this.loadRequests();
                }
            })
            
        )
    };
    loadRequests() {
        trackPromise(
            fetch("/mui/teamITAdminData")
            .then((res) => {
                return res.json();
            })
            .then((reqData) => {
                this.setState({ reqData });
            })
        );
      }
    editAccountClick= (e) => {
        e.preventDefault();
        var accID = e.currentTarget.id;
        fetch('/mui/editAdmin' , {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                "accID": accID
             })
        })
        .then((result) => {result.json()
            // if(result.status == 200){
            //   window.location.href = "/mui/addAccountDetails";
            // }
        })
    }
    updateValue = (e) => {
        
        this.setState({ [e.target.name]: e.target.value });
    };
    
    render() {
        var stateObj = this.state;
        var dbData = stateObj?.reqData?.dbData;
        var statusdbData = stateObj?.reqData?.teamITRequestDataFromDB;
        const items = [];
        const itemsSelect = [];
        var rows;
        var statusrows;
        var headers = [
        "ID",
        "Status",
        "Account",
        "Channel",
        "Geo",
        "Market",
        "Short Description"
        ];
        if (dbData != undefined) {
            rows = dbData;
            statusrows = statusdbData;
            var uniqueStatus = [...new Set(statusrows.map(a => a.status))];
            for(var i = 0; i < uniqueStatus.length; i++){
                var selectedOption = "";
                selectedOption = (
                    <option
                          className="bx--select-option"
                          defaultValue={uniqueStatus[i]}
                        //   select
                        >
                          {uniqueStatus[i]}
                    </option>
                  );
                  itemsSelect.push(selectedOption);
            }
            Object.entries(rows).map(([key, value]) => {
                let tableTr = "";
                const redirect = {
                    pathname: "/mui/teamit/requester",
                    search: `?id=${value.requestID}`,
                    state: {admin: true}
                }
                tableTr = (
                    <tr>
                      <td><Link className="reqIDLink" id="adminUpdate" to={redirect} >{value.requestID}</Link></td>
                      <td>{value.status}</td>
                      <td>{value.account}</td>
                      <td>{value.supportType}</td>
                      <td>{value.geo}</td>
                      <td>{value.market}</td>
                      <td>{value.shortDesc}</td>
                    </tr>
                  );
                  items.push(tableTr);
                  
            });
        }
        
        return (
                <LazyLoad>
                    <div>
                        <div className="selectFloat">
                            <Select
                            className="labelFont"
                            id="reaStatusFilter"
                            labelText="Filter Request with Status"
                            defaultValue=""
                            name="reaStatusFilter"
                            onChange={(e) => this.applyFilter(e)}
                            >
                                <SelectItem value="noFilter" text="No Filter" />
                                {itemsSelect}
                            </Select>
                        </div>
                        <Table style={{margin: "0 0 4% 0"}}>
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
                </LazyLoad>
        );
    }
}
export default withRouter(AdminLanding);