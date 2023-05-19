import React from 'react';
import ReactDOM from 'react-dom';
import DataTable from './common/table/table';
import { Breadcrumb, BreadcrumbItem } from 'carbon-components-react';
import { Link } from 'react-router-dom';

class OnboardAccount extends React.Component {
    
  render() {
    return (
        <div className="divContainer">
            <div className="headerDiv sectionMargin  mainMargin">
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/mui/home">Home</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <Link to="/mui/onboardAccount">Accounts</Link>
                    </BreadcrumbItem>
                </Breadcrumb>
                <h2 className="headerText">Accounts</h2>
            </div>
            <section className="sectionMargin mainMargin">
                <DataTable />
            </section>
            
        </div>
    );
  }
}
export default OnboardAccount;