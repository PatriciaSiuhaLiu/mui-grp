import React from "react";
import SubscribeToMaintenanceSchedule from "./forms/subscribeToMaintenanceSchedule";
import { Breadcrumb, BreadcrumbItem } from "carbon-components-react";
import { Link } from "react-router-dom";

class MaintenanceSchedule extends React.Component {
  constructor() {
    super();
    this.state = {
      accountCode: "",
    };
  }

  componentDidMount() {
    let code = new URLSearchParams(window.location.search).get("code");

    this.setState({
      accountCode: code,
    });
  }

  render() {
    return (
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
                <Link to="/mui/subscribeToMaintenanceSchedule">
                  Maintenance Window Configuration
                </Link>
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
          <h2 className="headerText">
            Maintenance Window Configuration | Account Code:{" "}
            {this.state.accountCode}
          </h2>
        </div>
        <section className="sectionMargin mainMargin paddingCostom">
          <SubscribeToMaintenanceSchedule />
        </section>
      </div>
    );
  }
}

export default MaintenanceSchedule;
