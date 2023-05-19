import React from 'react';
import ReactDOM from 'react-dom';
import { Breadcrumb, BreadcrumbItem, Button,UnorderedList, ListItem  } from 'carbon-components-react';
import { Link, withRouter } from 'react-router-dom';
import DRForm from './DRForm';
import DRBreadCrump from './DRBreadCrumb';
class DRHome extends React.Component {
    
  render() {
    return (
        <div className="divContainer">
            <DRBreadCrump />
            <section className="sectionMargin mainMargin paddingCostom">
                <DRForm />
            </section>
            
        </div>
    );
  }
}
export default withRouter(DRHome);








