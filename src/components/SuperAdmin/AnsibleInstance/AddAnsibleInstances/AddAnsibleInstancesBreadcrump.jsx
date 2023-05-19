import React from 'react';
import ReactDOM from 'react-dom';
import { Breadcrumb, BreadcrumbItem, Button,UnorderedList, ListItem  } from 'carbon-components-react';
import { Link } from 'react-router-dom';

class AddAnsibleInstancesBreadcrump extends React.Component {

  render() {
    return (
        <div className="breadCrumpDiv">
            <Breadcrumb>
                <BreadcrumbItem>
                    <Link to="/mui/home">Home</Link>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <Link to="/mui/superAdmin">Admin</Link>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <Link to="/mui/ansibleInstance">CACF Ansible Instances</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                    <Link to="/mui/addAnsibleIntances">Add CACF Ansible Instance</Link>
                </BreadcrumbItem>
            </Breadcrumb>
            <h2 className="headerText">Add CACF Ansible Instance</h2>
        </div>
    );
  }
}
export default AddAnsibleInstancesBreadcrump;