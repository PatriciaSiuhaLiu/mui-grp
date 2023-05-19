import React from 'react';
import ReactDOM from 'react-dom';
import { Breadcrumb, BreadcrumbItem, Button,UnorderedList, ListItem  } from 'carbon-components-react';
import { Link } from 'react-router-dom';

class SABreadCrump extends React.Component {
    
  render() {
    return (
        <div className="breadCrumpDiv">
            <Breadcrumb>
                <BreadcrumbItem>
                    <Link to="/mui/home">Home</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                    <Link to="/mui/superAdmin">Admin</Link>
                </BreadcrumbItem>
            </Breadcrumb>
            <h2 className="headerText">Admin</h2>
        </div>
    );
  }
}
export default SABreadCrump;