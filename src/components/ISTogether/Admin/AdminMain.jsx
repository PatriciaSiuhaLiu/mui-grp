import React from 'react';
import ReactDOM from 'react-dom';
import { Breadcrumb, BreadcrumbItem, Button,UnorderedList, ListItem  } from 'carbon-components-react';
import { Link, withRouter } from 'react-router-dom';
import AdminLanding from './Admin';
import AdminBreadCrump from './AdminBreadCrump';
class AdminHome extends React.Component {

  render() {
    return (
        <div className="divContainer">
            <AdminBreadCrump />
            <section className="sectionMargin mainMargin paddingCostom">
                <AdminLanding />
            </section>

        </div>
    );
  }
}
export default withRouter(AdminHome);