import React from 'react';
import ReactDOM from 'react-dom';
import DataTablePA from './common/table/TablePA';
import { Breadcrumb, BreadcrumbItem, Button } from 'carbon-components-react';
import { Link } from 'react-router-dom';

class OnboardAccount extends React.Component {
    
  render() {
    return (
        <div className="divContainer">
            <div className="headerDiv sectionMargin  mainMargin">
                <div>
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/mui/home">Home</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <Link to="/mui/addAccount">Accounts</Link>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </div>
                <h2 className="headerText">Accounts</h2>
            </div>
            <section className="sectionMargin mainMargin paddingCostom">
                <div className="addBtnPADiv">
                {/* <Button href="/mui/OnboardAccountPA" className="addAccBtn" style={{float: "right"}} href="/mui/addAccountDetails">Add Account</Button> */}
                </div>
                <DataTablePA />
            </section>
            
        </div>
    );
  }
}
export default OnboardAccount;