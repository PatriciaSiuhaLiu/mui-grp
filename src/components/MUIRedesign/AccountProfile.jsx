import React from 'react';
import ReactDOM from 'react-dom';
import { SelectItem, Select, Form,UnorderedList, ListItem,Grid, Row, Column, TextInput, Tooltip, Button, FormGroup, TextArea, FormLabel } from 'carbon-components-react';
import bannerImg from '../Icon';
import { Information32 } from "@carbon/icons-react";
import { Reset32 } from "@carbon/icons-react";
import { TableOfContents } from "@carbon/icons-react";
import PageBanner from "./PageBanner";

class MUIAccountProfile extends React.Component {

    constructor(props) {
        super(props);
    }
    header = "gsmaAccount";
    header1 = "NA Shared";
  render() {
    return (
        <div className="divContainer">
            <PageBanner header={this.header} header1={this.header1} />
            <section className="formSectionMain">
                <Form className="onboardFormMain">
                    <Grid>
                        <Row>
                            <Column>
                                <Select
                                    id="accountContractGeo"
                                    labelText={
                                    <>
                                        Account Contract Geo <b className="fontRed">*</b>
                                    </>
                                    }
                                    name="accGeo"
                                    // onChange={this.props.handleChange("accGeo")}
                                    // defaultValue={this.props.accGeo|| ""}
                                    required
                                >
                                    <SelectItem  value="" text="Choose an option" />
                                </Select>
                            </Column>
                            <Column>
                                <Select
                                    id="accountContractMarket"
                                    labelText={
                                    <>
                                        Account Contract Market <b className="fontRed">*</b>{" "}
                                    </>
                                    }
                                    // defaultValue={this.props.accMarket || ""}
                                    name="accMarket"
                                    // onChange={this.props.handleChange("accMarket")}
                                    required
                                >
                                    <SelectItem  value="" text="Choose an option" />
                                </Select>
                            </Column>
                        </Row>
                        <Row>
                            <Column>
                                <Select
                                    id="accountCountry"
                                    labelText={
                                    <>
                                        Account Country <b className="fontRed">*</b>
                                    </>
                                    }
                                    name="accountCountry"
                                    // onChange={this.props.handleChange("accGeo")}
                                    // defaultValue={this.props.accGeo|| ""}
                                    required
                                >
                                    <SelectItem  value="" text="Choose an option" />
                                </Select>
                            </Column>
                            <Column>
                                <Select
                                    id="accSector"
                                    labelText={
                                    <>
                                        Account Sector <b className="fontRed">*</b>{" "}
                                    </>
                                    }
                                    // defaultValue={this.props.accMarket || ""}
                                    name="accSector"
                                    // onChange={this.props.handleChange("accMarket")}
                                    required
                                >
                                    <SelectItem  value="" text="Choose an option" />
                                </Select>
                            </Column>
                        </Row>
                        <Row>
                            <Column>
                                <Select
                                    id="accIndustry"
                                    labelText={
                                    <>
                                        Account Industry <b className="fontRed">*</b>
                                    </>
                                    }
                                    name="accIndustry"
                                    // onChange={this.props.handleChange("accGeo")}
                                    // defaultValue={this.props.accGeo|| ""}
                                    required
                                >
                                    <SelectItem  value="" text="Choose an option" />
                                </Select>
                            </Column>
                            <Column>
                                <Select
                                    name="defaultLanguage"
                                    id="defaultLanguage"
                                    labelText={
                                        <span>
                                        Select Default Language
                                        <Tooltip>
                                            Message displayed in the channel will be with respect to
                                            the preferred language selected
                                        </Tooltip>
                                        </span>
                                    }
                                    // name="defaultLanguage"
                                    // onChange={this.props.handleChange("defaultLanguage")}
                                    // defaultValue={this.props.defaultLanguage}
                                    >
                                    <SelectItem value="English" text="English" />
                                    {/* {itemsLanguage} */}
                                    </Select>
                            </Column>
                        </Row>
                        <p className="accountOnboardTitle">Account Identifiers</p>
                        <div className="divGrouping">
                            <Row>
                                <Column>
                                    <TextInput
                                        className="classWithTitle"
                                        id="accountBlueId"
                                        name="blueID"
                                        labelText={
                                        <span>
                                            Account BlueID
                                            <Tooltip>Unique identifier for account</Tooltip>
                                        </span>
                                        }
                                        placeholder="Account BlueID"
                                        name="blueID"
                                        // onChange={this.props.handleChange("blueID")}
                                        // defaultValue={this.props.blueID } 
                                    />
                                </Column>
                                <Column>
                                    <TextInput
                                        id="accountCdir"
                                        name="CDIR"
                                        labelText={
                                        <>
                                            Account CDIR <b className="fontRed">*</b>
                                        </>
                                        }
                                        placeholder="Account CDIR"
                                        // onChange={this.props.handleChange("CDIR")}
                                        // defaultValue={this.props.CDIR }
                                        required
                                    />
                                </Column>
                            </Row>
                            <Row>
                                <Column>
                                    <TextInput
                                        id="accountGbgid"
                                        name="GBGID"
                                        labelText={
                                        <>
                                            Account GBGID <b className="fontRed">*</b>
                                        </>
                                        }
                                        placeholder="Account GBGID"
                                        // onChange={(e) => {
                                        // let gbgidValue = e.target.value.trim();
                                        // let RegEx = /^[a-z0-9]+$/i;
                                        // let isInvalid = !(RegEx.test(gbgidValue));
                                        // if(gbgidValue.length>15){
                                        //     //show error
                                        //     e.target.setCustomValidity(
                                        //         "Only 15 characters are allowed"
                                        //     );
                                        // }
                                        // if(isInvalid){
                                        //     e.target.setCustomValidity(
                                        //     "Only alphanumeric data is allowed"
                                        //     );
                                            
                                        // }
                                        // else e.target.setCustomValidity("");
                                        // this.props.handleChange("GBGID")(e);
                                        
                                        // }}
                                        // defaultValue={this.props.GBGID }
                                        length={15}
                                        required
                                    />
                                </Column>
                                <Column></Column>
                            </Row>
                        </div>
                        <p className="accountOnboardTitle">Contacts</p>
                        <div className="divGrouping">
                            <Row>
                                <Column>
                                    <TextInput
                                        id="accountDpeName"
                                        name="dpeAdminName"
                                        labelText={
                                        <>
                                            Account DPE Name <b className="fontRed">*</b>
                                        </>
                                        }
                                        placeholder="Account DPE Name"
                                        // onChange={this.props.handleChange("dpeAdminName")}
                                        // defaultValue={this.props.dpeAdminName}
                                        required
                                    />    
                                </Column>  
                                <Column>
                                    <TextInput
                                        type="email"
                                        id="accountDpeEmail"
                                        name="dpeAdminEmail"
                                        labelText={
                                        <>
                                            Account DPE Email <b className="fontRed">*</b>
                                        </>
                                        }
                                        placeholder="Account DPE Email"
                                        // onChange={(e) => {
                                        // const email = e.target.value.trim();
                                        // const allowedDomains = process.env.REACT_APP_ALLOWED_DOMAINS?.split(",") || []
                                        // const validDomain = allowedDomains.find(domain => email.toLowerCase().includes(domain + "."));
                                        // const validEmail = email.toLowerCase().includes("." + enterprise.toLowerCase() + ".") || email.toLowerCase().includes("@" + enterprise.toLowerCase() + ".");
                                        // if (!validDomain || !validEmail)
                                        //     e.target.setCustomValidity(
                                        //     "Please provide a valid " + enterprise + " email id"
                                        //     );
                                        // else e.target.setCustomValidity("");
                                        // this.props.handleChange("dpeAdminEmail")(e);
                                        // }}
                                        // defaultValue={this.props.dpeAdminEmail}
                                        required
                                    />   
                                </Column>  
                            </Row>
                            <Row>
                                <Column>
                                    <TextInput
                                        id="ItsmAdminName"
                                        name="itsmAdminName"
                                        labelText={
                                        <>
                                            ITSM System Admin Name <b className="fontRed">*</b>
                                        </>
                                        }
                                        placeholder="ITSM System Admin Name"
                                        // onChange={this.props.handleChange("itsmAdminName")}
                                        // defaultValue={this.props.itsmAdminName}
                                        required
                                    />    
                                </Column>
                                <Column>
                                    <TextInput
                                        type="email"
                                        name="itsmAdminEmail"
                                        id="ItsmAdminEmail"
                                        labelText={
                                        <>
                                            ITSM System Admin Email <b className="fontRed">*</b>
                                        </>
                                        }
                                        placeholder="ITSM System Admin Email"
                                        // onChange={(e) => {
                                        // const email = e.target.value.trim();
                                        // const allowedDomains = process.env.REACT_APP_ALLOWED_DOMAINS?.split(",") || []
                                        // const validDomain = allowedDomains.find(domain => email.toLowerCase().includes(domain + "."));
                                        // const validEmail = email.toLowerCase().includes("." + enterprise.toLowerCase() + ".") || email.toLowerCase().includes("@" + enterprise.toLowerCase() + ".");
                                        // if (!validDomain || !validEmail)
                                        //     e.target.setCustomValidity(
                                        //     "Please provide a valid " + enterprise + " email id"
                                        //     );
                                        // else e.target.setCustomValidity("");
                                        // this.props.handleChange("itsmAdminEmail")(e);
                                        // }}
                                        // defaultValue={this.props.itsmAdminEmail}
                                        required
                                    />
                                </Column>
                            </Row>
                            <Row>
                                <Column>
                                    <TextInput
                                        id="networkAdminName"
                                        name="networkAdminName"
                                        labelText="Network Admin Name"
                                        placeholder="Network Admin Name"
                                        // onChange={this.props.handleChange("networkAdminName")}
                                        // defaultValue={values?.networkAdminName}
                                    />
                                </Column>
                                <Column>
                                    <TextInput
                                        id="networkAdminEmail"
                                        name="networkAdminEmail"
                                        labelText="Network Admin Email"
                                        placeholder="Network Admin Email"
                                        // onChange={(e) => {
                                        // const email = e.target.value.trim();
                                        // const allowedDomains = process.env.REACT_APP_ALLOWED_DOMAINS?.split(",") || []
                                        // const validDomain = allowedDomains.find(domain => email.toLowerCase().includes(domain + "."));
                                        // const validEmail = email.toLowerCase().includes("." + enterprise.toLowerCase() + ".") || email.toLowerCase().includes("@" + enterprise.toLowerCase() + ".");
                                        // if (!validDomain || !validEmail)
                                        //     e.target.setCustomValidity(
                                        //     "Please provide a valid " + enterprise + " email id"
                                        //     );
                                        // else {
                                        //     e.target.setCustomValidity("");
                                        //     this.props.handleChange("networkAdminEmail")(e);
                                        // }
                                        // }}
                                        // defaultValue={values?.networkAdminEmail}
                                    />
                                </Column>
                            </Row>
                        </div> 
                        <Row>
                            <Column>
                                <TextArea
                                    cols={50}
                                    rows={5}
                                    labelText={<>Any other Information that you would like to add ? <span className="specialCharacterLabel">(Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | ? ~ are not allowed)</span></>}
                                    placeholder="Any other Information that you would like to add ?"
                                    // onChange={this.props.handleChange('otherInformation')}
                                    name="otherInformation"
                                    // defaultValue={this.props.otherInformation}
                                />
                            </Column>
                        </Row>                               
                        <Row>
                            <div className="onboardBtnDiv">
                                <Button type="submit" className="onboardBtn">
                                    Submit
                                </Button>
                                {/* <Button type="submit" className="onboardBtn">
                                    Save
                                </Button> */}
                            </div>
                        </Row>
                    </Grid>
                </Form>
            </section>
        </div>
    );
  }
}
export default MUIAccountProfile;