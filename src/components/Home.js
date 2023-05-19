import React from 'react';
import ReactDOM from 'react-dom';
import MySVG from './Icon';
class Landing extends React.Component {
    constructor(props) {
        super(props);
      }
  render() {
    return (
        <div className="divContainer">
            {/* <UIHeader /> */}
            <section className="sectionBanner">
                <div className="bannerDiv">
                    <h1 className="bannerTitleMain">Welcome to ChatOps Management</h1>
                    <p className="bannerTitlePara">Get started with ChatOps to connect account systems and collaborate account teams to improve service management process and efficiency</p>
                </div>
            </section>
            <section className="benefitSection sectionMargin">
                <div className="benefitMain">
                    <div className="benefitEachMain"><h3>Benefits</h3></div>
                    <div className="benefitEachMain1">
                        <div className="benifitDiv">
                            <div className="benefitEach">
                                <img src={MySVG.benefit1} alt=""/>
                                <p className="benefiteachPara">Integrates chat platform with systems and sub-systems creating a single POV for everything.</p>
                            </div>
                            <div className="benefitEach">
                                <img src={MySVG.benefit2} alt=""/>
                                <p className="benefiteachPara">Recommend courses of action and resolution techniques to the technical teams.</p>
                            </div>
                        </div>
                        <div className="benifitDiv">
                            <div className="benefitEach">
                                <img src={MySVG.benefit3} alt=""/>
                                <p className="benefiteachPara">Single access point for stake holders and technical team on management issues.</p>
                            </div>
                            <div className="benefitEach">
                                <img src={MySVG.benefit4} alt=""/>
                                <p className="benefiteachPara">Migrates or eliminates motion and waiting waste types of service management processes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="helpSection sectionMargin">
                <div className="benefitMain">
                    <div className="benefitEachMain"><h3>ChatOps Help</h3></div>
                    <div className="benefitEachMain1">
                        <div className="benifitDiv helpDiv">
                            <div className="benefitEach">
                                <p className="benefiteachPara helpText">For questions related to Account Onboarding, please reach out to</p>
                                <p className="benefiteachPara nameStyle">Robin Perrino</p>
                                <p className="benefiteachPara emailStyle">Robin.Perrino@kyndryl.com</p>
                            </div>
                        </div>
                        <div className="benifitDiv helpDiv">
                            <div className="benefitEach">
                                <p className="benefiteachPara helpText">For questions related to technical architecture, tool integration etc., please reach out to</p>
                                <p className="benefiteachPara nameStyle">Wesley Stevens</p>
                                <p className="benefiteachPara emailStyle">Wesley.Stevens@kyndryl.com</p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
  }
}
export default Landing;