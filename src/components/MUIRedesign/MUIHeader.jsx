import React, { Component } from "react";
import { Header, HeaderContainer, HeaderName, HeaderMenuButton, HeaderMenuItem, SkipToContent, SideNav, SideNavItems, HeaderSideNavItems, HeaderGlobalBar, HeaderGlobalAction, Button, Select, SelectItem } from "carbon-components-react";
import MySVG from '../Icon';
import { User20 } from "@carbon/icons-react";
import { trackPromise } from "react-promise-tracker";
import { Link } from "react-router-dom";

class MUIHeader extends Component {
    constructor() {
        super();
        this.state = { users: [] };
    }
    componentDidMount() {
        trackPromise(
        fetch("/mui/getUserAccess")
            .then((res) => {
            return res.json();
            })
            .then((users) => {
            this.setState({ users });
            var loaderFlag = true;
            })
        );
    }

    blankFn = () => {}
    handleInputChange = (e) => {
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
        var isAccAdmin = this.state.users;
        var userObj = isAccAdmin.userAccessData;
        var element = "";
        var user = "";
        var releaseNumber = "";
        var namespace = "";
        if (typeof userObj != "undefined") {
        if (userObj.user) {
            user = userObj.user.id;
        }
        releaseNumber = userObj.releaseNumber;
        namespace = userObj.namespace;
        var userPresent = userObj.user;
        }
        return (
        <HeaderContainer
            render={({ isSideNavExpanded, onClickSideNavExpand }) => (
            <Header aria-label="Chatops" className="navBarBG">
                <SkipToContent />
                { userPresent &&
                    <img src={MySVG.switcher} className="sideBarMenuIcon" alt="Open menu" onClick={onClickSideNavExpand} isActive={isSideNavExpanded}/>
                }
                <div>
                {/* <Switcher aria-label="Add" className="customMenu" /> */}
                <HeaderName prefix="">
                    <Link to="/mui/home" className="navbarTitle">
                        CHATOPS&nbsp;
                        <span className="spanHeaderTitle">MANAGEMENT UI</span>
                    </Link>
                </HeaderName>
                <div className="versionNavbar">
                    {namespace}&nbsp;[ver:&nbsp;{releaseNumber}]
                </div>
                </div>
                <HeaderGlobalBar>
                    <div className="accountDropdown1">
                        <Select
                            id="accountNameToDashboard"
                            name="accountName"
                            labelText=""
                            style={{height: '30px !important'}}
                            // className="accountDropdownSelect"
                            onChange={(e) => this.handleInputChange(e)}
                            // onChange={this.props.handleChange("eventSource")}
                            // defaultValue={this.props.eventSource || ""}
                            // required
                        >
                            <SelectItem value="" text="Choose an Account" />
                            {/* <Link to="/mui/MUIDashboard"> */}
                                <SelectItem
                                    value="gsmaAccount"
                                    text="gsmaAccount"
                                    // selected={this.props.eventSource == "CDI"}
                                />
                            {/* </Link> */}
                        </Select>
                    </div>
                    <HeaderName prefix="">
                        <p className="userNavBar">{userPresent}&nbsp;</p>
                        {/* <User20 /> */}
                    </HeaderName>
                    <HeaderGlobalAction aria-label="User"></HeaderGlobalAction>
                </HeaderGlobalBar>

                { userPresent &&
                    <SideNav
                        aria-label="Side navigation"
                        expanded={isSideNavExpanded}
                        isPersistent={false}
                        isRail
                    >
                        <div>
                            { userObj.isAccoutAdmin && <>
                                <p className="SidebarTitle">Account Admin</p>
                                <SideNavItems>
                                    <HeaderSideNavItems>
                                    <HeaderMenuItem className="headerMenuItem" onClick={isSideNavExpanded ? onClickSideNavExpand : this.blankFn}>
                                        <Link to="/mui/onboardAccount">
                                        Onboard Account
                                        </Link>
                                    </HeaderMenuItem>
                                    </HeaderSideNavItems>
                                </SideNavItems>
                            </>}
                            { userObj.isProgramAdmin && <>
                                <p className="SidebarTitle">Program Admin</p>
                                <SideNavItems>
                                    <HeaderSideNavItems>
                                    <HeaderMenuItem className="headerMenuItem" onClick={isSideNavExpanded ? onClickSideNavExpand : this.blankFn}>
                                        <Link to="/mui/addAccount">Onboard Account</Link>
                                        </HeaderMenuItem>
                                    <HeaderMenuItem className="headerMenuItem" onClick={isSideNavExpanded ? onClickSideNavExpand : this.blankFn}>
                                        <Link to="/mui/paFeatures">Features</Link>
                                    </HeaderMenuItem>
                                    </HeaderSideNavItems>
                                </SideNavItems>
                            </>}
                            { userObj.isSuperAdmin && <>
                                <p className="SidebarTitle">Super Admin</p>
                                <SideNavItems>
                                    <HeaderSideNavItems>
                                    <HeaderMenuItem className="headerMenuItem" onClick={isSideNavExpanded ? onClickSideNavExpand : this.blankFn}>
                                        <Link to="/mui/superAdmin">Configure Settings</Link>
                                    </HeaderMenuItem>
                                    </HeaderSideNavItems>
                                </SideNavItems>
                            </>}
                        </div>
                    </SideNav>
                }
                
            </Header>
            )}
        />
        );
    }
}

export default MUIHeader;
