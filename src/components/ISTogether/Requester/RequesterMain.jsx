import React from 'react';
import ReactDOM from 'react-dom';
import { Breadcrumb, BreadcrumbItem, Button,UnorderedList, ListItem  } from 'carbon-components-react';
import { Link, withRouter } from 'react-router-dom';
import ReqForm from './Requester';
import ReqBreadCrump from './ReqBreadCrump';
class ReqHome extends React.Component {

  render() {
    return (
        <div className="divContainer">
            <ReqBreadCrump />
            <section className="sectionMargin mainMargin paddingCostom">
                <ReqForm />
            </section>

        </div>
    );
  }
}
export default withRouter(ReqHome);