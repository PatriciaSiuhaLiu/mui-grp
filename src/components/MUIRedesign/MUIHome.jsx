import React from 'react';
import ReactDOM from 'react-dom';
import { SelectItem, Select, Form,UnorderedList, ListItem  } from 'carbon-components-react';
import bannerImg from '../Icon';
import { Information32 } from "@carbon/icons-react";
import { EventSchedule } from "@carbon/icons-react";
import { OperationsRecord } from "@carbon/icons-react";
import { Reminder } from "@carbon/icons-react";
import { Link } from "@carbon/icons-react";
import { TableOfContents } from "@carbon/icons-react";

class MUILanding extends React.Component {
    constructor(props) {
        super(props);
        this.state = (
            {
                selectedRelease: ''
            }
        );
    }
    handleReleaseSelected = (e) => {
        if (
            (e.target.value &&
            e.target.value.includes("script") &&
            e.target.value.includes("<")) ||
            e.target.value.includes(">")
        ){
            this.setState({
                ["inValid_" + e.target.name]: "Invalid Input.",
            });
            return;
        }
        this.setState({
            [e.target.name]: e.target.value,
        });
    };
    render() {
        return (
            <div className="divContainer">
                <div class="cds--grid gridCssBanner">
                    <div class="cds--row">
                        <div class="cds--col-lg-8 cds--col-md-4 cds--col-sm-2 width50 bannerHeight imageTextContainerPosition">
                            <img src={bannerImg.homeBanner1} alt="Banner Image" className="homeBanner1" />
                            <h4 className="bannerWelcomeText centeredText">Welcome to ChatOps Management</h4>
                            <p className="bannerWelcomeTextSub centeredText">Get started with ChatOps to connect account systems and collaborate account teams to improve service management process and efficiency</p>
                        </div>
                        <div class="cds--col-lg-8 cds--col-md-4 cds--col-sm-2 width50 bannerHeight">
                            <div class="cds--row">
                                <div class="cds--col-lg-8 cds--col-md-4 cds--col-sm-2 width50 bannerHeightSub bannerHeightSubBottomPadd imageTextContainerPosition">
                                    <img src={bannerImg.homeBanner2} alt="Banner Image" className="homeBanner1" />
                                    <p className="bannerSidePanelText centeredText">Integrates chat platform with systems and sub-systems creating a single POV for everything.</p>
                                </div>
                                <div class="cds--col-lg-8 cds--col-md-4 cds--col-sm-2 width50 bannerHeightSub bannerHeightSubBottomPadd imageTextContainerPosition">
                                    <img src={bannerImg.homeBanner4} alt="Banner Image" className="homeBanner1" />
                                    <p className="bannerSidePanelText centeredText">Recommend courses of action and resolution techniques to the technical teams.</p>
                                </div>
                            </div>
                            <div class="cds--row">
                                <div class="cds--col-lg-8 cds--col-md-4 cds--col-sm-2 width50 bannerHeightSub imageTextContainerPosition">
                                    <img src={bannerImg.homeBanner3} alt="Banner Image" className="homeBanner1" />
                                    <p className="bannerSidePanelText centeredText">Single access point for stake holders and technical team on management issues.</p>
                                </div>
                                <div class="cds--col-lg-8 cds--col-md-4 cds--col-sm-2 width50 bannerHeightSub imageTextContainerPosition">
                                    <img src={bannerImg.homeBanner5} alt="Banner Image" className="homeBanner1" />
                                    <p className="bannerSidePanelText centeredText">Migrates or eliminates motion and waiting waste types of service management processes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="sectionHomeContent">
                    <div class="cds--grid margin0">
                        <div class="cds--row">
                        <div class="cds--col-lg-10 width70">
                            <div className="leftPanelMainDiv">
                                <div class="cds--grid margin0">
                                    <div class="cds--row">
                                        <div class="cds--col-lg-8 cds--col-md-4 cds--col-sm-2 width50 ">
                                        <div className="contactDiv">
                                                <p className="contactQuery">
                                                    For questions related to Account Onboarding, please reach out to
                                                </p>
                                                <p className="contactPerson">Robin Perrino</p>
                                                <p className="contactEmail">Robin.Perrino@kyndryl.com</p>
                                        </div>
                                        </div>
                                        <div class="cds--col-lg-8 cds--col-md-4 cds--col-sm-2 width50 ">
                                            <div className="contactDiv">
                                                <p className="contactQuery">
                                                    For questions related to technical architecture, tool integration etc., please reach out to
                                                </p>
                                                <p className="contactPerson">Wesley Stevens</p>
                                                <p className="contactEmail">Wesley.Stevens@kyndryl.com</p>
                                        </div>
                                        </div>
                                    </div>
                                </div> 
                                <div className="alertNotificationMainDiv">
                                <p className="panelTitle">Top Features</p>
                                <div class="fetureContent">
                                    <div className="featureContainer">
                                        {/* <div className="iconDivRightPanel">
                                            <Information32 className="iconCLassRightPanel" />
                                        </div> */}
                                        <div className="featureContentRightPanel">
                                            <p className="featureTitle">Incident Management</p>
                                            <p className="featureContentStyle">Incident Management for ChatOps provides practitioners with real time collaboration channels to accompany incident ticketing.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="featureContainer">
                                        {/* <div className="iconDivRightPanel">
                                            <Information32 className="iconCLassRightPanel" />
                                        </div> */}
                                        <div className="featureContentRightPanel">
                                            <p className="featureTitle">Service Manager</p>
                                            <p className="featureContentStyle">The Service Manager allows you to begin to automate many of the daily repeatable administration based checked and notifications that the role of the Service Manager typically performs.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="featureContainer">
                                        {/* <div className="iconDivRightPanel">
                                            <Information32 className="iconCLassRightPanel" />
                                        </div> */}
                                        <div className="featureContentRightPanel">
                                            <p className="featureTitle">Ansible &amp; CACF Integration</p>
                                            <p className="featureContentStyle">Open up the power of your automation capabilities through Ansible with your ChatOps integration. Allow your practitioners to quickly execute and collaborate on the results of playbooks by enabling the ChatOps Ansible Integration for your account. 
                                            </p>
                                        </div>
                                    </div>
                                    <div className="featureContainer">
                                            {/* <div className="iconDivRightPanel">
                                                <Information32 className="iconCLassRightPanel" />
                                            </div> */}
                                        <div className="featureContentRightPanel">
                                            <p className="featureTitle">Knowledge Management</p>
                                            <p className="featureContentStyle">Being able to quickly find answers to the questions needed can make a big difference in how fast practitioners are able to resolve issues or just perform every day workload tasks. There are two types of Knowledge Management that ChatOps can help you: Structured and Un-structured knowledge. 
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                    
                                </div>              
                            </div>
                        </div>
                        <div class="cds--col-lg-6 width30">
                            <div className="rightPanelMainDiv">
                            <p className="leftPanelTitle">Alert Notification</p>
                                    <div className="alertNotificationCard">
                                        <div className="alertNotificationSideBar operationalAlertCss"></div>
                                        <div className="alertNotificationIconDiv">
                                            {/* <OperationsRecord className="alertNotificationIcon" /> */}
                                            <img src={bannerImg.OperationsRecord} alt="Operational Overview" className="iconCLassRightPanel"  />
                                        </div>
                                        <div className="alertNotificationContentDiv">
                                            <p className="alertNotificationContentTitle operationalAlertContentCss">Operational Overview</p>
                                            <UnorderedList className="alertContentList">
                                                <ListItem>
                                                    No outages
                                                </ListItem>
                                                {/* <ListItem>
                                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry
                                                </ListItem>
                                                <ListItem>
                                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry
                                                </ListItem> */}
                                            </UnorderedList>
                                            {/* <p className="alertNotificationContent">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</p> */}
                                        </div>
                                    </div>
                                    <div className="alertNotificationCard">
                                        <div className="alertNotificationSideBar upcomingAlertCss"></div>
                                        <div className="alertNotificationIconDiv">
                                            {/* <Reminder className="alertNotificationIcon" /> */}
                                            <img src={bannerImg.Reminder} alt="Upcoming Action"  className="iconCLassRightPanel" />
                                        </div>
                                        <div className="alertNotificationContentDiv">
                                            <p className="alertNotificationContentTitle upcomingAlertContentCss">Upcoming Action</p>
                                            <UnorderedList className="alertContentList">
                                                <ListItem>
                                                    MS Team Integration
                                                </ListItem>
                                                {/* <ListItem>
                                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry
                                                </ListItem>
                                                <ListItem>
                                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry
                                                </ListItem> */}
                                            </UnorderedList>
                                            {/* <p className="alertNotificationContent">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</p> */}
                                        </div>
                                    </div>
                                {/* <p className="panelTitle">Top Features</p>
                                <div class="fetureContent">
                                    <div className="featureContainer">
                                        <div className="iconDivRightPanel">
                                            <Information32 className="iconCLassRightPanel" />
                                        </div>
                                        <div className="featureContentRightPanel">
                                            <p className="featureTitle">Feature1</p>
                                            <p className="featureContentStyle">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                                            </p>
                                        </div>
                                    </div>
                                    <div className="featureContainer">
                                        <div className="iconDivRightPanel">
                                            <Information32 className="iconCLassRightPanel" />
                                        </div>
                                        <div className="featureContentRightPanel">
                                            <p className="featureTitle">Feature2</p>
                                            <p className="featureContentStyle">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                                            </p>
                                        </div>
                                    </div>
                                    <div className="featureContainer">
                                        <div className="iconDivRightPanel">
                                            <Information32 className="iconCLassRightPanel" />
                                        </div>
                                        <div className="featureContentRightPanel">
                                            <p className="featureTitle">Feature3</p>
                                            <p className="featureContentStyle">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                                            </p>
                                        </div>
                                    </div>
                                </div> */}
                                <p className="panelTitle">Upcoming Release</p>
                                <div className="releaseContentDiv">
                                    <div className="releaseContentContainer">
                                        <div className="releaseIconDiv">
                                        {/* <EventSchedule /> */}
                                            <img src={bannerImg.EventSchedule} alt="Upcoming Release" className="iconCLassRightPanel" />
                                            {/* <EventSchedule className="iconCLassRightPanel" aria-label="Reset" /> */}
                                        </div>
                                        <div className="releaseContentSubDiv">
                                            <p className="releaseMainContent">ChatOps 20.25 | <span className="releaseTimeframe">05/12/2022</span></p>
                                            {/* <p className="newApplicationContent">ChatOps 20.25</p> */}
                                        </div>
                                    </div>
                                    {/* <div className="releaseContentContainer">
                                        <div className="releaseIconDiv">
                                            <Reset32 className="iconCLassRightPanel" aria-label="Reset" />
                                        </div>
                                        <div className="releaseContentSubDiv">
                                            <p className="releaseMainContent">ChatOps 20.25</p>
                                        </div>
                                    </div>
                                    <div className="releaseContentContainer">
                                        <div className="releaseIconDiv">
                                            <p className="iconCLassRightPanel">0</p>
                                        </div>
                                        <div className="releaseContentSubDiv">
                                            <p className="releaseMainContent">Issues reported</p>
                                        </div>
                                    </div> */}
                                </div>
                                <div className="releaseContainer">
                                    <div className="releasetableContentMain">
                                         {/* <span><img src={bannerImg.tableOfcontents} alt="Table of contents" className="iconCLassRightPanel tocIcon" /></span> */}
                                        <p className="panelTitle releaseContentCss">Release Content</p>
                                    </div>
                                    <div className="releaseOptionContainer">
                                        <Form className="formReleaseSelect">
                                            <Select
                                                id="selectedRelease"
                                                // labelText="Select Release"
                                                name="selectedRelease"
                                                onChange={(e) => this.handleReleaseSelected(e)}
                                                // onChange={this.props.handleChange('usingTicketingTool')}
                                                // defaultValue={values.usingTicketingTool || ""}
                                                required
                                            >
                                                <SelectItem
                                                value=""
                                                text="Select Release"
                                                />
                                                <SelectItem text="20.25" value="20.25" /> 
                                                <SelectItem value="20.24" text="20.24" />
                                            </Select>
                                        </Form>
                                        {this.state.selectedRelease != "" &&
                                            <div className="selectedReleaseContentConatainer">
                                                {this.state.selectedRelease == "20.24" &&
                                                    <UnorderedList className="releaseContentList">
                                                        <ListItem>
                                                            Service manager enhancement- User will be able to create rules with fields defined by ServiceNow along with chatops defined fields and would be able to create incident channels (A button ‘create incident’ is provided with the notification).
                                                        </ListItem>
                                                        <ListItem>
                                                            CACF – Notification Messages will get posted to channels when a ansible playbook is run from an incident channel.
                                                        </ListItem>
                                                        <ListItem>
                                                            ITSM access control – Access control for the different action like update status, add comments can be configured via the account admin for accounts integrated with ITSM.
                                                        </ListItem>
                                                    </UnorderedList>
                                                } 
                                                {this.state.selectedRelease == "20.25" && 
                                                    <UnorderedList className="releaseContentList">
                                                        <ListItem>
                                                            Approval chasing via emails for change management - Manulife
                                                        </ListItem>
                                                        <ListItem>
                                                            Knowledege Management Insights in incident channel
                                                        </ListItem>
                                                        <ListItem>
                                                            Business Rule enhacement for (ServiceNow,ICD)
                                                        </ListItem>
                                                        <ListItem>
                                                            Enhacement to ChatOps groups supporting adding multiple users
                                                        </ListItem>
                                                    </UnorderedList>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>
                                <p className="panelTitle">API Documentation</p>
                                <div className="releaseContentDiv">
                                    <div className="releaseContentContainer">
                                        <div className="releaseIconDiv">
                                            <img src={bannerImg.link} className="iconCLassRightPanel" />
                                            {/* <Link className="iconCLassRightPanel" aria-label="Reset"/> */}
                                            {/* <Reset32 className="iconCLassRightPanel" aria-label="Reset" /> */}
                                        </div>
                                        <div className="releaseContentSubDiv">
                                            <p className="releaseMainContent"><a className="linkColor" href="https://chatops-test-int.extnet.ibm.com" target="_blank" rel="noopener noreferrer">https://chatops-test-int.extnet.ibm.com</a></p>
                                        </div>
                                    </div>
                                    {/* <div className="releaseContentContainer">
                                        <div className="releaseIconDiv">
                                            <Reset32 className="iconCLassRightPanel" aria-label="Reset" />
                                        </div>
                                        <div className="releaseContentSubDiv">
                                            <p className="releaseMainContent">ChatOps 20.25</p>
                                        </div>
                                    </div>
                                    <div className="releaseContentContainer">
                                        <div className="releaseIconDiv">
                                            <p className="iconCLassRightPanel">0</p>
                                        </div>
                                        <div className="releaseContentSubDiv">
                                            <p className="releaseMainContent">Issues reported</p>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
export default MUILanding;