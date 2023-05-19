import React from 'react';
class ThanksPage extends React.Component {
    constructor(props) {
        super(props);
      }
  render() {
    return (
        <div className="divContainer">
            {/* <UIHeader /> */}
            <section className="sectionBanner">
                <div className="bannerDiv">
                    <h1 className="bannerTitleMain">Thank you..!!</h1>
                    <p className="bannerTitlePara">Request successfully Completed.</p>
                    <p className="bannerTitlePara">You may close the browser window now.</p>
                </div>
            </section>                                         
        </div>
    );
  }
}
export default ThanksPage;


