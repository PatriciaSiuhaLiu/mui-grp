import React from 'react';
import { trackPromise } from "react-promise-tracker";
import { Error32 } from "@carbon/icons-react";
class NoAccess extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        trackPromise(
            fetch('/mui/getUserData')
            .then(res => {
                return res.json()
            })
            .then(loggedInUser => { 
                this.setState({ loggedInUser })
                this.setState({emailID:this.state?.loggedInUser?.loggedIn})
            })
            .then((result) => {
            })
        )
    }
  render() {
      var loggedInUser = this.state?.emailID;
    return (
        <div className="divContainer divContainerNoAccess">
            {/* <UIHeader /> */}
            <section className="sectionBannerNoAccess">
                <div className="bannerDiv">
                    <h1 className="bannerTitleMain1">403</h1>
                    <p className="bannerTitlePara1">{loggedInUser}</p>
                    <p className="bannerTitlePara2">ACCESS NOT GRANTED</p>
                    <Error32 className="noaccessIcon" />
                </div>
            </section>                                         
        </div>
    );
  }
}
export default NoAccess;