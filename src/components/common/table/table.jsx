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
} from "carbon-components-react";
import { Link } from "react-router-dom";
import { trackPromise } from "react-promise-tracker";

class DataTable extends Component {
  constructor() {
    super();
    this.state = { accData: [] };
  }
  componentDidMount() {
    trackPromise(
      fetch("/mui/onboardAccountData")
        .then((res) => {
          return res.json();
        })
        .then((accData) => {
          this.setState({ accData });
        })
    );
  }
  handleCheck(e) {
    this.setState({
      clickedID: e.target.id,
    });
  }
  render() {
    const items = [];
    var rows;
    var headers = [
      "Account Code",
      "Account Name",
      "Account Geo",
      "Group Name",
      "Created On (UTC)",
      "Account Status",
      "Feed Status",
      "",
    ];
    const rowsData = this.state.accData;
    var stateData = this.state;
    if (rowsData.length !== 0) {
      var rowDataArr = rowsData.accountsData;
      rows = rowDataArr;
      var tag = "";
      var overflowMenu = "";
      var formSubmitted;
      var feedTag = "";

      Object.entries(rows).map(([key, value]) => {
        let tableTr = "";
        var redirectUrl = "/mui/onboardAccountDetails?" + value._id;
        var redirectAPIUrl = "/mui/APIKeys?" + value._id;
        var redirectCmdRegUrl = "/mui/commandRegistraton?" + value._id;
        var redirectSMUrl = "/mui/servicemanager?" + value._id;
        const redirectCRFWEmailUrl = `/mui/cr-approval-followup?code=${value.accountCode}`;
        var redirectWebhookUrl = "/mui/webhooks/" + value._id;
        var redirectSettingsUrl = "/mui/account-settings/" + value._id; 
        var redirectEnrollWindowUrl = "/mui/subscribeToMaintenanceSchedule?code=" + value.accountCode;
        if (value.hasOwnProperty("geo")) {
        } else {
          value.geo = "NA";
        }
        if (value.hasOwnProperty("feedStatus")) {
          if (value.feedStatus == "active") {
            feedTag = (
              <Tag type="teal" title="Clear Filter">
                Active
              </Tag>
            );
          } else if (value.feedStatus == "deactive") {
            feedTag = (
              <Tag type="magenta" title="Clear Filter">
                Deactive
              </Tag>
            );
          } else if (value.feedStatus == "requestForFeed") {
            feedTag = (
              <Tag type="gray" title="Clear Filter">
                Requested for feed
              </Tag>
            );
          } else if (value.feedStatus == "hold") {
            feedTag = (
              <Tag type="cyan" title="Clear Filter">
                Hold
              </Tag>
            );
          }
        } else {
          feedTag = (
            <Tag type="warm-gray" title="Clear Filter">
              {" "}
              NA{" "}
            </Tag>
          );
        }
        if (value.submitted && (value.saved == true || value.saved == false)) {
          tag = (
            <Tag type="green" title="Clear Filter">
              {" "}
              Submitted{" "}
            </Tag>
          );

          overflowMenu = (
            <div>
              <Link className="width-full" to={redirectUrl}>
                <OverflowMenuItem
                  className="overflowMenuClass"
                  itemText="Edit Account"
                  id="onboardAccount"
                />
              </Link>
              <Link className="width-full" to={"/mui/api-keys/" + value._id}>
                <OverflowMenuItem
                  className="overflowMenuClass"
                  itemText="API Keys"
                  id="APIKeys"
                />
              </Link>
              <Link className="width-full" to={"/mui/event-streams/" + value._id}>
                <OverflowMenuItem
                  className="overflowMenuClass"
                  itemText="Event Streams"
                  id="EventStreams"
                />
              </Link>
              <Link className="width-full" to={redirectCmdRegUrl}>
                <OverflowMenuItem
                  className="overflowMenuClass"
                  itemText="Command Registration"
                  id="cmdReg"
                />
              </Link>
              {value.enableServiceManager && (<Link className="width-full" to={redirectSMUrl}>
                <OverflowMenuItem
                  className="overflowMenuClass"
                  itemText="Service Manager"
                  id="serviceManager"
                />
              </Link>)}

              {value.enableCRFWEmail && (<Link className="width-full" to={redirectCRFWEmailUrl}>
                <OverflowMenuItem
                  className="overflowMenuClass"
                  itemText="CR Follow Up Email"
                  id="crFWEmail"
                />
              </Link>)}
            
              <Link className="width-full" to={redirectWebhookUrl}>
                <OverflowMenuItem
                  className="overflowMenuClass"
                  itemText="Webhook"
                  id="wedhook"
                />
              </Link>
              <Link className="width-full" to={redirectSettingsUrl}>
                <OverflowMenuItem
                  className="overflowMenuClass"
                  itemText="Settings"
                  id="settings"
                />
              </Link>
              {
                value.enrollMaintenanceWindow && value.enrollMaintenanceWindow === true && (
                  <Link to={redirectEnrollWindowUrl}>
                    <OverflowMenuItem
                      name="enrollForMaintenanceWindow"
                      defaultValue="enrollForMaintenanceWindow"
                      className="overflowMenuClass"
                      itemText="Maintenance Window Configuration"
                      id={value.accountCode}
                    />
                  </Link>
                )
              }
            </div>
          );
        } else if (value.submitted == false && value.saved == true) {
          tag = (
            <Tag type="purple" title="Clear Filter">
              Saved as Draft
            </Tag>
          );
          overflowMenu = (
            <Link className="width-full" to={redirectUrl}>
              <OverflowMenuItem
                className="overflowMenuClass"
                itemText="Onboard Account"
              />
            </Link>
          );
        } else {
          tag = (
            <Tag type="blue" title="Clear Filter">
              Not Submitted{" "}
            </Tag>
          );
          overflowMenu = (
            <Link className="width-full" to={redirectUrl}>
              <OverflowMenuItem
                className="overflowMenuClass"
                itemText="Onboard Account"
              />
            </Link>
          );
        }

        tableTr = (
          <tr>
            <td style={({ width: "13%" }, { wordBreak: "break-word" })}>
              {value.accountCode}
            </td>
            <td>{value.accountName}</td>
            <td>{value.geo}</td>
            <td>{value.groupName}</td>
            <td>{value.date}</td>
            <td style={{ width: "13%" }}>{tag}</td>
            <td>{feedTag}</td>
            <td style={{ width: "12%" }}>
              <OverflowMenu
                ariaLabel="Onboard / Edit Account"
                title="Onboard Account"
                aria-label="Onboard / Edit Account"
                aria-labelledby="Onboard / Edit Account"
                iconDescription="Onboard / Edit Account"
                selectorPrimaryFocus="option-two"
              >
                {overflowMenu}
              </OverflowMenu>
            </td>
          </tr>
        );
        items.push(tableTr);
      });
    }

    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableHeader key={header}>{header}</TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{items}</TableBody>
        </Table>
      </div>
    );
  }
}

export default DataTable;
