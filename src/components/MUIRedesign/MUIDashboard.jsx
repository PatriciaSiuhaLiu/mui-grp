import React from 'react';
import ReactDOM from 'react-dom';
import { SelectItem, Select, Form,UnorderedList, ListItem,Grid, Row, Column, TextInput, Tooltip, Button, FormGroup, TextArea, FormLabel } from 'carbon-components-react';
import bannerImg from '../Icon';
import MySVG from '../Icon';
import { Link } from "react-router-dom";
import { Information32 } from "@carbon/icons-react";
import { Reset32 } from "@carbon/icons-react";
import { UserProfile } from "@carbon/icons-react";
import PageBanner from "./PageBanner";

class MUIDashboard extends React.Component {

    constructor(props) {
        super(props);
    }
    header = "gsmaAccount";
    header1 = "NA Shared";
  render() {
    return (
        <div className="divContainer">
            <PageBanner header={this.header} header1={this.header1} />
            <section className="bodySectionMain">
                <Form className="">
                    <Grid>
                        <Row>
                            <Column>
                                <Link to={"/mui/MUIAccountProfile"}>
                                    <div className="dashboardCardMain">
                                        <div class="toprightIndicator configuredBG"></div>
                                        <div className="cardContentContainer">
                                            <div className="topLeftIconSection">
                                                <img src={MySVG.userProfile} className="topLeftIcon" alt="Account Profile"/>
                                                {/* <UserProfile className="topLeftIcon" /> */}
                                            </div>
                                            <div className="cardContentMain">
                                                <p className="cardContentTitle">Account Profile</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Column>
                            
                            <Column>
                                <Link to={"/mui/MUIChatPlatform"}>
                                    <div className="dashboardCardMain">
                                        <div class="toprightIndicator configuredBG"></div>
                                        <div className="cardContentContainer">
                                            <div className="topLeftIconSection">
                                                <img src={MySVG.chatPlatform} className="topLeftIcon" alt="Chat Platform"/>
                                                {/* <Information32 className="topLeftIcon" /> */}
                                            </div>
                                            <div className="cardContentMain">
                                                <p className="cardContentTitle">Chat Platform</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Column>
                            <Column>
                                <Link to={"/mui/MUIITSMIntegration"}>
                                    <div className="dashboardCardMain">
                                        <div class="toprightIndicator notConfiguredBG"></div>
                                        <div className="cardContentContainer">
                                            <div className="topLeftIconSection">
                                                <img src={MySVG.integration} className="topLeftIcon" alt="ITSM Integration"/>
                                                {/* <Information32 className="topLeftIcon" /> */}
                                            </div>
                                            <div className="cardContentMain">
                                                <p className="cardContentTitle">ITSM Integration</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Column>
                        </Row>
                        <Row>
                            <Column>
                                <Link to={"/mui/MUIAssignments"}>
                                    <div className="dashboardCardMain">
                                        <div class="toprightIndicator configuredBG"></div>
                                        <div className="cardContentContainer">
                                            <div className="topLeftIconSection">
                                                <img src={MySVG.events} className="topLeftIcon" alt="Index Channel"/>
                                                {/* <Information32 className="topLeftIcon" /> */}
                                            </div>
                                            <div className="cardContentMain">
                                                <p className="cardContentTitle">Assignments</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Column>
                            <Column>
                                <Link to={"/mui/MUIAddIndexChannel"}>
                                    <div className="dashboardCardMain">
                                        <div class="toprightIndicator configuredBG"></div>
                                        <div className="cardContentContainer">
                                            <div className="topLeftIconSection">
                                                <img src={MySVG.hashtag} className="topLeftIcon" alt="Index Channel"/>
                                                {/* <Information32 className="topLeftIcon" /> */}
                                            </div>
                                            <div className="cardContentMain">
                                                <p className="cardContentTitle">Index Channel</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Column>
                            <Column>
                                <Link to={"/mui/MUIIncidentManagement"}>
                                    <div className="dashboardCardMain">
                                        <div class="toprightIndicator notConfiguredBG"></div>
                                        <div className="cardContentContainer">
                                            <div className="topLeftIconSection">
                                                <img src={MySVG.management} className="topLeftIcon" alt="Incident Management"/>
                                                {/* <Information32 className="topLeftIcon" /> */}
                                            </div>
                                            <div className="cardContentMain">
                                                <p className="cardContentTitle">Incident Management </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Column>
                        </Row>
                        <Row>
                            <Column>
                                <Link to={"/mui/MUIInsights"}>
                                    <div className="dashboardCardMain">
                                        <div class="toprightIndicator notConfiguredBG"></div>
                                        <div className="cardContentContainer">
                                            <div className="topLeftIconSection">
                                                <img src={MySVG.magnify} className="topLeftIcon" alt="Insights"/>
                                                {/* <Information32 className="topLeftIcon" /> */}
                                            </div>
                                            <div className="cardContentMain">
                                                <p className="cardContentTitle">Insights</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Column>
                            <Column>
                                <Link to={"/mui/MUIAnsibleIntegration"}>
                                    <div className="dashboardCardMain">
                                        <div class="toprightIndicator configuredBG"></div>
                                        <div className="cardContentContainer">
                                            <div className="topLeftIconSection">
                                                <img src={MySVG.automation} className="topLeftIcon" alt="Ansible Integration"/>
                                                {/* <Information32 className="topLeftIcon" /> */}
                                            </div>
                                            <div className="cardContentMain">
                                                <p className="cardContentTitle">Ansible Integration</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Column>
                            <Column>
                                {/* <div className="dashboardCardMain">
                                    <div class="toprightIndicator notConfiguredBG"></div>
                                    <div className="cardContentContainer">
                                        <div className="topLeftIconSection">
                                            <Information32 className="topLeftIcon" />
                                        </div>
                                        <div className="cardContentMain">
                                            <p className="cardContentTitle">Account Profile</p>
                                        </div>
                                    </div>
                                </div> */}
                            </Column>
                        </Row>
                    </Grid>
                </Form>
            </section>
        </div>
    );
  }
}
export default MUIDashboard;