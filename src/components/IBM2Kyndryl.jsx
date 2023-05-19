import React from 'react';
import ReactDOM from 'react-dom';
import { Button,Form, TextInput, FormGroup, TooltipDefinition  } from 'carbon-components-react';
import { Link } from 'react-router-dom';
import { trackPromise } from "react-promise-tracker";
import { Information32 } from "@carbon/icons-react";
import { withRouter } from 'react-router-dom';
class IBM2Kyndryl extends React.Component {
    constructor(props) {
        super(props);
        this.state = (
            {
                verifiedDataFetched:[],
                emailID:'',
                resErrMsg: '',
                loggedInUser: '',
                loggedInUserCheck: '',
                emailIdUserChecked: '',
                loggedInUserIbmId:'',
                handleInput: false
            }
        );
    }
  render() {
    return (
        <div className="divContainer divContainerNoAccess">
            <section className="sectionBannerNoAccess">
                <div className="bannerDiv1">
                    <p className="bannerTitlePara2">Thank you for using ChatOps Knight during the Kyndryl migration. This service is now sunset.</p>
                    <p className="bannerTitlePara1">You can find the Kyndryl homepage <a className="redirectLinkStyle" href="https://w3.kyndryl.net/">HERE</a>, or you can learn more about ChatOps Knight <a className="redirectLinkStyle" href="https://w3.ibm.com/ocean/w3publisher/chatops">HERE</a></p>
                    <Information32 className="noaccessIcon" />
                </div>
            </section>                                         
        </div>
    );
  }
}
export default withRouter(IBM2Kyndryl);