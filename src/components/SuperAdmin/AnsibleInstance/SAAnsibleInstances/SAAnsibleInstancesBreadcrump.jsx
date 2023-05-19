import React from 'react';
import ReactDOM from 'react-dom';
import { Breadcrumb, BreadcrumbItem, Button,UnorderedList, ListItem  } from 'carbon-components-react';
import { Link } from 'react-router-dom';

class SAAnsibleInstancesBreadcrump extends React.Component {

  render() {
    return (
        <div className="breadCrumpDiv stickyDiv">
            <Breadcrumb>
                <BreadcrumbItem>
                    <Link to="/mui/home">Home</Link>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <Link to="/mui/superAdmin">Admin</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                    <Link to="/mui/ansibleInstance">CACF Ansible Instances</Link>
                </BreadcrumbItem>
            </Breadcrumb>
            <h2 className="headerText">CACF Ansible Instances</h2>
        </div>
    );
  }
}
export default SAAnsibleInstancesBreadcrump;