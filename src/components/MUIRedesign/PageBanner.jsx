import React, { Component } from "react";
import { Breadcrumb, BreadcrumbItem } from "carbon-components-react";
import { Link, withRouter } from "react-router-dom";
import bannerImg from '../Icon';

class PageBanner extends Component {
  state = {};
  render() {
    const { links, header, header1 } = this.props;
    return (
        <section className="pageBannerContainer imageTextContainerPosition">  
            <img src={bannerImg.pageBanner} alt="Banner Image" className="homeBanner1" />          
             <h4 className="headerText centeredText bannerTextSub1 "><span className="boldText">Account Management:</span> {header}</h4>
             <h4 className="headerText centeredText bannerTextSub " style={{color:'yellow !important',marginTop: "10px !important"}}><span className="boldText">ChatOps Instance:</span> {header1}</h4>
        </section>
    );
  }
}

export default withRouter(PageBanner);
