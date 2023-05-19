import React from 'react';
import ReactDOM from 'react-dom';
import { Breadcrumb, BreadcrumbItem } from 'carbon-components-react';
import { Link } from 'react-router-dom';
import SABreadCrump from './SABreadCrump'
import SAHome from './SAHome'
import SALandingSidebar from './SALandingSidebar'
class SuperAdminHome extends React.Component {
    
  render() {
    return (
        <div className="divContainer">
            <section className="sectionGrid">
                <div class="bx--grid padding0">
                    <div class="rowWidth">
                        <div class="gridColulmnWidth3">
                            <SALandingSidebar />
                        </div>
                        <div class="gridColumn13" style={{maxWidth: '20% !important', paddingRight: '0 !important'}}>
                            <SABreadCrump />
                            <SAHome />
                        </div>
                    </div>
                </div>
            </section>
            
        </div>
    );
  }
}
export default SuperAdminHome;