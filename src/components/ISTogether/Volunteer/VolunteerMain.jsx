import React from 'react';
import ReactDOM from 'react-dom';
import { Breadcrumb, BreadcrumbItem, Button,UnorderedList, ListItem  } from 'carbon-components-react';
import { Link, withRouter } from 'react-router-dom';
import VolunteerForm from './Volunteer';
import VolunteerBreadCrump from './VolunteerBreadCrump';
class VolunteerHome extends React.Component {

  render() {
    return (
        <div className="divContainer">
            <VolunteerBreadCrump />
            <section className="sectionMargin mainMargin paddingCostom">
                <VolunteerForm />
            </section>

        </div>
    );
  }
}
export default withRouter(VolunteerHome);