import React from 'react';
import ReactDOM from 'react-dom';
import { Breadcrumb, BreadcrumbItem, Button,UnorderedList, ListItem  } from 'carbon-components-react';
import { Link } from 'react-router-dom';

class SAHome extends React.Component {
    
  render() {
    return (
        <div class="landingContentColumnMain">
            <div class="contentDIvSub">

                <UnorderedList>
                    <ListItem className="listSALanding">
                        Create Workspace.
                    </ListItem>
                    <ListItem className="listSALanding">
                        Add EventStream Config.
                    </ListItem>
                    <ListItem className="listSALanding">
                        Add Assistants.
                    </ListItem>
                    <ListItem className="listSALanding">
                        Add Commands.
                    </ListItem>
                    <ListItem className="listSALanding">
                        Add Index Channel.
                    </ListItem>
                    {/* 
                    <ListItem className="listSALanding">
                        Nam ac turpis in massa euismod varius at vitae tortor.
                    </ListItem> */}
                </UnorderedList>
            </div>
        </div>
    );
  }
}
export default SAHome;









