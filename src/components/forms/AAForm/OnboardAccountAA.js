import React from 'react';
import ReactDOM from 'react-dom';
import GeneralInfo from './GeneralInfo';
import MainForm from './MainForm';
import ConfigForm from './configInfoForm';
import AdditionalInfoForm from './additionalInfoForm';
import { Breadcrumb, BreadcrumbItem, OrderedList, ListItem, Form } from 'carbon-components-react';
import { Link } from 'react-router-dom';

class OnboardAccountDetails extends React.Component {
    constructor(){
        super();
        this.state ={
            step:1
        };
    }
    
    nextStep = () => {
        const { step } = this.state
        this.setState({
            step : step + 1
        })
    }

    prevStep = () => {
        const { step } = this.state
        this.setState({
            step : step - 1
        })
    }

    changeForm = (n) => {
        this.setState({
            step: n
        })
    }

    updateState = (key, value) => {
        this.setState({
            [key]: value
        })
    }

    render() {
        return (
            <div className="divContainer">
            <div className="onboardMainDiv">
                <div className="sidebarDiv">
                    <div className="sidebarSubDiv">
                        <h5 className="h5Sidebar" data-id="1"  id="generalTab" onClick={()=> {this.changeForm(1)}}><a className={this.state.step == 1 ? "" : "primary"}>General Information</a></h5>
                        <h5 className="h5Sidebar" data-id="2" id="configTab" onClick={()=> {this.changeForm(2)}}><a className={this.state.step == 2 ? "" : "primary"}>Configuration Information</a></h5>
                        <h5 className="h5Sidebar" data-id="3" id="additionalTab" onClick={()=> {this.changeForm(3)}}><a className={this.state.step == 3 ? "" : "primary"}>Additional Information</a></h5>
                    </div>  
                </div>
                <div className="formDiv">
                    <div className="headerDiv headerDivSidebar sectionMargin  mainMargin">
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/mui/home">Home</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link to="/mui/onboardAccount">Accounts</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <Link to="/mui/addAccountDetails">Onboard Account</Link>
                            </BreadcrumbItem>
                        </Breadcrumb>
                        <h4>Onboard {this.state.accName} | Account Code: {this.state.accCode}</h4>
                    </div>  
                    <section className="sectionMargin mainMargin paddingCostom customPaddAA overFlowAA">
                        <MainForm step={this.state.step} nextStep={this.nextStep} prevStep={this.prevStep} updateParent={this.updateState} />                       
                    </section>
                </div>
            </div>
            </div>
        );
    }
}
export default OnboardAccountDetails;