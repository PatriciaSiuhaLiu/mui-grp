import React from 'react';
import ReactDOM from 'react-dom';
import AddAccountForm from './forms/addAccount';
import { Breadcrumb, BreadcrumbItem } from 'carbon-components-react';
import { Link } from 'react-router-dom';

class AddAccount extends React.Component {
    render() {
        return (
            <div className="divContainer">
                <div className="headerDiv sectionMargin  mainMargin">
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/mui/home">Home</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/mui/addAccount">Accounts</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <Link to="/mui/addAccountDetails">Add Accounts</Link>
                        </BreadcrumbItem>
                    </Breadcrumb>
                    <h2 className="headerText">Add Accounts Details</h2>
                </div>
                <section className="sectionMargin mainMargin paddingCostom">
                    <AddAccountForm />
                </section>
                
            </div>
        );
    }
}
export default AddAccount;