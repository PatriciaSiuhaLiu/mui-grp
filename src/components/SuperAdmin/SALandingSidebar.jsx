import React from 'react';
import ReactDOM from 'react-dom';
import { Breadcrumb, BreadcrumbItem, Button,UnorderedList, ListItem  } from 'carbon-components-react';
import { Link } from 'react-router-dom';

class SALandingSidebar extends React.Component {
    
  render() {
    return (
        <div className="gridSidebar sidebarHeight">
            <div className="sidebarMain">
                <p className="sidebarNav">
                    <Link className="linkClass" to="/mui/workspaces">
                        Workspace
                    </Link>
                </p>
                <p className="sidebarNav">
                    <Link className="linkClass" to="/mui/commands">
                        Commands
                    </Link>
                </p>
                {/* <p className="sidebarNav">
                    <Link className="linkClass" to="/mui/settings">
                        Global Settings
                    </Link>
                </p> */}
                {/* <div className="nestedMenu">
                    <p className="sidebarNav sidebarBorderNested">
                        <Link className="linkClass" to="/mui/settings">
                            Source Systems
                        </Link>
                    </p>
                    <div className="nestedMenuITem">
                        <p className="sidebarNavNested">
                            <Link className="linkClass" to="/mui/settings">
                                Source Systems
                            </Link>
                        </p>
                        <p className="sidebarNavNested">
                            <Link className="linkClass" to="/mui/settings">
                                Status Mapping 
                            </Link>
                        </p>
                        <p className="sidebarNavNested">
                            <Link className="linkClass" to="/mui/settings">
                                Global 
                            </Link>
                        </p>
                    </div>
                </div> */}
                <div className="nestedMenu">
                    <p className="sidebarNav sidebarBorderNested">
                        {/* <Link className="linkClass" to="/mui/settings"> */}
                            Cloud services
                        {/* </Link> */}
                    </p>
                    <div className="nestedMenuITem">
                        <p className="sidebarNavNested">
                            <Link className="linkClass" to="/mui/eventStreams">
                                Event Streams 
                            </Link>
                        </p>
                        <p className="sidebarNavNested">
                            <Link className="linkClass" to="/mui/assistants">
                                Assistants
                            </Link>
                        </p>
                        {/* <p className="sidebarNav">
                            <Link className="linkClass" to="/mui/groups">
                                Groups
                            </Link>
                        </p> */}
                        {/* <p className="sidebarNavNested">
                            <Link className="linkClass" to="/mui/settings">
                                Translator 
                            </Link>
                        </p> */}
                    </div>
                </div>
                <p className="sidebarNav">
                    <Link className="linkClass" to="/mui/groups">
                        Groups
                    </Link>
                </p>
                <div className="nestedMenu">
                    <p className="sidebarNav sidebarBorderNested">
                        {/* <Link className="linkClass" to="/mui/settings"> */}
                            Configure Settings
                        {/* </Link> */}
                    </p>
                    <div className="nestedMenuITem">
                        <p className="sidebarNavNested">
                            <Link className="linkClass" to="/mui/indexChannels">
                                Index Channel
                            </Link>
                        </p>
                        <p className="sidebarNavNested">
                            <Link className="linkClass" to="/mui/globalAssignments">
                                Global Assignments 
                            </Link>
                        </p>
                        <p className="sidebarNavNested">
                            <Link className="linkClass" to="/mui/ansibleInstance">
                              CACF Ansible Instances
                            </Link>
                        </p>  
                        {/* <p className="sidebarNavNested">
                            <Link className="linkClass" to="/mui/settings">
                                Instance Settings
                            </Link>
                        </p>
                        */}
                    </div>
                </div>
                <p className="sidebarNav">
                    <Link className="linkClass" to="/mui/features">
                        Features
                    </Link>
                </p>
            </div>
        </div>
    );
  }
}
export default SALandingSidebar;