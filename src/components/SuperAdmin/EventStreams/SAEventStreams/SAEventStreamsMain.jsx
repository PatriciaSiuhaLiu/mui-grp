import React from 'react';
import ReactDOM from 'react-dom';
import SALandingSidebar from '../../SALandingSidebar';
import SAEventStreamsBreadCrump from './SAEventStreamsBreadcrump';
import SAEventStreamsList from './SAEventStreamsList';
// import SAWorkspace from './SAWorkspace/Workspace';
import { Breadcrumb, BreadcrumbItem, Button,UnorderedList, ListItem  } from 'carbon-components-react';
// import { Link, Route } from 'react-router-dom';
import { BrowserRouter, Switch, Route , Link} from 'react-router-dom';
class SuperAdminEventStreams extends React.Component {
    
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
                            <SAEventStreamsBreadCrump />
                            <SAEventStreamsList />
                        </div>
                    </div>
                </div>
            </section>
            
        </div>
    );
    }
  }
  export default SuperAdminEventStreams;