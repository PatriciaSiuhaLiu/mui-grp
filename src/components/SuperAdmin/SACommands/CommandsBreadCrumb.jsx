import React, { Component } from "react";
import { Breadcrumb, BreadcrumbItem } from "carbon-components-react";
import { Link, withRouter } from "react-router-dom";

class CommandsBreadCrumb extends Component {
  state = {};
  render() {
    const { links, header } = this.props;
    return (
      <div className="breadCrumpDiv">
        <Breadcrumb>
          {Object.entries(links).map(([title, link], i, arr) => (
            <BreadcrumbItem key={i} isCurrentPage={i == arr.length - 1}>
              <Link to={link}>{title}</Link>
            </BreadcrumbItem>
          ))}
          {/* <BreadcrumbItem>
            <Link to="/mui/home">Home</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Link to="/mui/commands">Commands</Link>
          </BreadcrumbItem> */}
        </Breadcrumb>
        <h2 className="headerText">{header}</h2>
      </div>
    );
  }
}

export default withRouter(CommandsBreadCrumb);
