import React, { Component } from "react";
import ReactDOM from "react-dom";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Toggle,
  Form,
  Tabs,
  Tab,
  Breadcrumb, BreadcrumbItem
} from "carbon-components-react";
import { Edit32,  TrashCan32, Settings16 } from "@carbon/icons-react";
import { Link } from "react-router-dom";
// import Breadcrumb from "../SuperAdmin/SACommands/CommandsBreadCrumb";
import { trackPromise } from "react-promise-tracker";
import DeleteRuleModal from "./DeleteRuleModal";

export default class ServiceManagerHome extends Component {
  state = {
    SMRules: [],
    accountData: {},
    isRuleEnabled: false,
    accountCode: "",
    isParamGenerated: true
  };

  headers = [
    "Priority",
    "Assignment Group",
    "SLA/SLO",
    "Breach Detection Time",
    "Last Job Run (UTC)",
    "Enable/Disable Rule",
    "Edit Rule",
    "Delete Rule"
  ];
  
  getSMRules = async () => {
    const fetchSMRulesRes = fetch(`/mui/getSMRules`);
    trackPromise(fetchSMRulesRes);
    const resMSRules = await fetchSMRulesRes;
    const { SMRules, accountData, isParamGenerated } = await resMSRules.json();
    SMRules && this.setState({ SMRules, accountData, isParamGenerated });
    this.links.ServiceManager = `/mui/servicemanager?${this.state.accountData.accountId}`;
  };

  componentDidMount() {  
    this.getSMRules();
  }
  links = {
    Home: "/mui/home",
    Accounts: "/mui/onboardAccount",
    ServiceManager: `/mui/servicemanager`,
  };


  handleToggle = async (checked, ruleId) => {
    const ruleData = {isRuleEnabled: checked}
    const data = {
      ruleId,
      data:ruleData 
  }
  trackPromise(
      fetch('/mui/patchRule' , {
      method: "PATCH",
      headers: {
          'Content-type': 'application/json'
      },
      body: JSON.stringify(data)
      })
      .then((result) => {
          // if (result.status === 404 || result.status === 400 || result.status === 500)  {
          //     result.json().then((object)=> {
          //         setErrorMessage({resErrMsg: object.error});
          //     })
          // } else if (result.status === 409) {
          //     result.json().then((object)=> {
          //         setErrorMessage({errorMessage: object.error});
          //     })
          // } else 
          if(result.status === 200){
            this.getSMRules();
          }
      })
      .catch(err => { 
          // setErrorMessage({errorMessage: err.error});
      })
  );
  }

  openDeleteModal = (ruleId) => {
    console.log(`openDeleteModal:: ${ruleId}`);
    this.setState({
      isDeleteModalOpen: true,
      deleteRuleId: ruleId,
    });
  };
  onDeletModalCancel = () => {
    this.setState({ isDeleteModalOpen: false });
  };
  onDeletModalConfirm = () => {
    const ruleData = {
      toDeleteID: this.state.deleteRuleId,
    };
    console.log(`onDeletModalConfirm:: ${JSON.stringify(ruleData)}`);
    trackPromise(
      fetch("/mui/deleteRule", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(ruleData),
      }).then((result) => {
        if (result.status === 200) {
          this.onDeletModalCancel();
          this.getSMRules();
        }
      })
    );
  };

  render() {
    const enabled = {
      cursor: "pointer",
    };
    const rows = this.state.SMRules.map((rule) => {
      let redirectUrl = `/mui/servicemanager/editRule/${this.state.accountData.accountId}?${rule._id}`;
      // let redirectUrl = `/mui/servicemanager/create/${this.state.accountData.accountId}?${rule._id}`;
      return (
        <TableRow key={rule._id}>
          <TableCell>{rule.priority}</TableCell>
          <TableCell>{rule.assignmentGroup}</TableCell>
          <TableCell>{`${rule.sla} ${rule.sla > 1 ? rule.slaUnit: (rule.slaUnit === "Days" ? "Day": (rule.slaUnit === "Hours" ? "Hour": "Minute"))}`}</TableCell>
          <TableCell>{`${rule.breachTime} ${rule.breachTime > 1 ? rule.breachTimeUnit : (rule.breachTimeUnit === "Hours" ? "Hour": "Minute")} `}</TableCell>
          <TableCell>{rule.lastJobRun }</TableCell>
          
          <TableCell>
            <Toggle className="toggleSwitch"
            size="sm"
            toggled={rule.isRuleEnabled}
            labelA='Disabled'
            labelB='Enabled'
            id={rule._id}
            onToggle={(checked)=>this.handleToggle(checked,rule._id)}
            />
          </TableCell>
          <TableCell>
            <Link id={rule._id} to={redirectUrl}>
              <Edit32 className="iconEditSize editIconPA" aria-label="Edit Rule" />
            </Link>
          </TableCell>
          <TableCell>
            <div
                id={rule._id}
                onClick={() => this.openDeleteModal(rule._id)}
            >
                <TrashCan32 className="iconEditSize editIconPA" aria-label="Delete Rule" />
            </div>
          </TableCell>
          
        </TableRow>
      );
    });

    return (
      <div>
        <div className="headerDiv mainMargin sectionMargin">
          {/* <Breadcrumb header="ServiceManager" links={this.links} /> */}
          <Breadcrumb>
                <BreadcrumbItem>
                    <Link to={this.links.Home}>Home</Link>
                </BreadcrumbItem>
                <BreadcrumbItem >
                    <Link to={this.links.Accounts}>Accounts</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                    <Link to={this.links.ServiceManager}>ServiceManager</Link>
                </BreadcrumbItem>      
            </Breadcrumb>
            <h2 className="headerText">Service Manager</h2>
        </div>
        <section className="sectionMargin mainMargin">
          <div style={{display: "flex", flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
          <Form style={{ fontWeight: 500, margin: "1rem 0" }}>
              <h5>
                Account Code:{" "}
                <span style={{ fontWeight: "normal" }}>{this.state.accountData.accountCode}</span>
              </h5>
              <h5>
                Account Name:{" "}
                <span style={{ fontWeight: "normal" }}>
                  {this.state.accountData.accountName}
                </span>
              </h5>
            </Form>
            {!this.state.isParamGenerated && <span style={{ color:"red"}}>All the settings for service manager has not been enabled.Few options of creating rule might not work</span>}
          </div>
          <Tabs>
          {/* <Tabs type="container"> */}
            <Tab id="incidentRules" label="Incident Rules">
              <div className=" my-2">
           
              <Link class="paramStngButtonBtn" to={`/mui/servicemanager/create/${this.state.accountData.accountId}`}>
                  <Button
                    className="addAccBtn addBtnCss addBtnPACss"
                    style={ enabled}
                    
                  >
                    Create Rule
                  </Button>
                </Link> 

                <Link class="paramStngButtonBtn" to={`/mui/servicemanager/incidentParamSettings/${this.state.accountData.accountId}`}>
                  <Button
                    className="addAccBtn addBtnCss addBtnPACss"
                  >
                    Settings
                  </Button>
              </Link>
              </div>
              <Table>
                <TableHead>
                  <TableRow>
                    {this.headers.map((header) => (
                      <TableHeader key={header}>{header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>{rows}</TableBody>
              </Table>
            </Tab>
            {/* <Tab id="changeRequestRules" label="Change Request Rules" title="Change Request Rules">
              
            </Tab> */}
          </Tabs>
        </section>
        {typeof document === "undefined"
          ? null
          : ReactDOM.createPortal(
              <DeleteRuleModal
                ruleId={this.state.deleteGroupId}
                isModalOpen={this.state.isDeleteModalOpen}
                onDeleteCancel={() => this.onDeletModalCancel()}
                onDeleteConfrim={() => this.onDeletModalConfirm()}
                modalText={`Group ${this.state.deleteGroupName}`}
              />,
              document.body
            )}
      </div>
    );
  }
}
