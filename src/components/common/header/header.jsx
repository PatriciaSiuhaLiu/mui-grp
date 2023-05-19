import React, { Component } from "react";
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderMenuButton,
  HeaderMenuItem,
  SkipToContent,
  SideNav,
  SideNavItems,
  HeaderSideNavItems,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Button,
} from "carbon-components-react";
import { User20 } from "@carbon/icons-react";
import "./header.scss";
import { trackPromise } from "react-promise-tracker";
import { Link } from "react-router-dom";

class UIHeader extends Component {
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
          <Header aria-label="Chatops">
            <SkipToContent />
            { userPresent &&
                <HeaderMenuButton
                aria-label="Open menu"
                onClick={onClickSideNavExpand}
                isActive={isSideNavExpanded}
                />
            }
            <div>
              <HeaderName prefix="">
                <Link to="/mui/home" className="headerDivTitle">
                  CHATOPS&nbsp;
                  <span className="spanHeaderTitle">MANAGEMENT UI</span>
                </Link>
              </HeaderName>
              <div className="versionHeader">
                {namespace}&nbsp;[ver:&nbsp;{releaseNumber}]
              </div>
            </div>
            <HeaderGlobalBar>
              <HeaderName prefix="">
                <p className="userTitle">{userPresent}&nbsp;</p>
                <User20 />
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
                            <HeaderMenuItem className="againTest" onClick={isSideNavExpanded ? onClickSideNavExpand : this.blankFn}>
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
                            <HeaderMenuItem className="againTest" onClick={isSideNavExpanded ? onClickSideNavExpand : this.blankFn}>
                                <Link to="/mui/addAccount">Onboard Account</Link>
                                </HeaderMenuItem>
                            <HeaderMenuItem className="againTest" onClick={isSideNavExpanded ? onClickSideNavExpand : this.blankFn}>
                                <Link to="/mui/paFeatures">Features</Link>
                            </HeaderMenuItem>
                            </HeaderSideNavItems>
                        </SideNavItems>
                    </>}
                    { userObj.isSuperAdmin && <>
                        <p className="SidebarTitle">Super Admin</p>
                        <SideNavItems>
                            <HeaderSideNavItems>
                            <HeaderMenuItem className="againTest" onClick={isSideNavExpanded ? onClickSideNavExpand : this.blankFn}>
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

export default UIHeader;
