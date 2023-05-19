import React from 'react';
import ReactDOM from 'react-dom';
import { Breadcrumb, BreadcrumbItem, Button,UnorderedList, ListItem  } from 'carbon-components-react';
import { Link } from 'react-router-dom';

class AddGlobalAssignmentsBreadcrump extends React.Component {

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
                    <Link to="/mui/globalAssignments">Global Assignments</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                    <Link to="/mui/addGlobalAssignments">Add GLobal Assignment</Link>
                </BreadcrumbItem>
            </Breadcrumb>
            <h2 className="headerText">Add Global Assignment</h2>
        </div>
    );
  }
}
export default AddGlobalAssignmentsBreadcrump;