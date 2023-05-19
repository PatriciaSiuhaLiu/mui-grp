// GeneralInfo.jsx
import React, { Component } from "react";
import {
  Button,
  Column,
  Form,
  Grid,
  Row,
  Select,
  TextInput,
  SelectItem,
  FormLabel,
} from "carbon-components-react";
import "../form.scss";
import "../onboardForm.scss";
import { trackPromise } from "react-promise-tracker";
import { Tooltip } from "carbon-components-react/lib/components/Tooltip/Tooltip";

class GeneralInfo extends Component {
  constructor() {
    super();
    this.state = {
      //AccData: [],
    };
  }
  saveAndContinue = (e) => {
    e.preventDefault();
    this.props.onSubmit("general")
    this.props.nextStep();
  };
  submitAndContinue = (e) => {
    e.preventDefault();
    var saved = false;
    var submitted = false;
    if (e.target.className.includes("saveData")) {
      saved = true;
      submitted = false;
    } else {
      saved = false;
      submitted = true;
    }

    this.props.submitForm(saved);
  };
  componentDidMount() {
    // trackPromise(
    //   fetch("/mui/onboardAccountFormData")
    //     .then((res) => {
    //       return res.json();
    //     })
    //     .then((AccData) => {
    //       this.setState({ AccData });
    //     })
    //     .catch((err) => {
    //       console.log("error==============>", err);
    //     })
    // );
  }
  handleChange = (e) => {};
  render() {
    const { values } = this.props;
    var accData = this.props.AccData;
    const itemsIndustry = [];
    const itemsSector = [];
    const itemsGeo = [];
    const itemsCountry = [];
    const itemsMarket = [];

    var geoSelected = this.state.geo;
    var formOptionMarket = "";
    var formOptionSector = "";
    var formOptionIndustry = "";
    var formOptionCountry = "";
    var formOptionGeo = "";
    var showComponent = "";
    var market = [];
    var stateObj = this.state;
    var continueFlag = false;
    if (accData.length !== 0) {
      var accountsData = accData.accountsData;
      var submitted = accountsData.submitted;
      var saved = accountsData.saved;
      var industryArr = accountsData.industryList;
      var sectorArr = accountsData.sectorList;
      var geoArr = accountsData.geoList;
      var countryArr = accountsData.countryList;
      var enterprise = accountsData.enterprise;
      var savedBtn = "";
      if (submitted == false && (saved == true || saved == false)) {
        savedBtn = (
          <Button
            className="btnMargin saveData"
            kind="secondary"
            key="saveData"
            onClick={this.submitAndContinue}
          >
            Save
          </Button>
        );
      }
      if (submitted == true && (saved == true || saved == false)) {
        savedBtn = "";
      }
      Object.entries(industryArr).map(([key, value]) => {
        formOptionIndustry = (
          <option
            className="bx--select-option"
            value={value.value}
            selected={value.value == accountsData.industry}
          >
            {value.desc}
          </option>
        );
        itemsIndustry.push(formOptionIndustry);
      });
      Object.entries(sectorArr).map(([key, value]) => {
        formOptionSector = value.desc !== "Choose an Option" && (
          <option
            className="bx--select-option"
            value={value.value}
            selected={value.value == accountsData.sector}
          >
            {value.desc}
          </option>
        );
        itemsSector.push(formOptionSector);
      });
      Object.entries(geoArr).map(([key, value]) => {
        formOptionGeo = value.geo !== "Choose an Option" && (
          <option
            className="bx--select-option"
            value={value.geo}
            selected={value.geo == accountsData.geo}
          >
            {value.geo}
          </option>
        );
        itemsGeo.push(formOptionGeo);
      });
      Object.entries(geoArr).map(([key, value]) => {
        if (value.geo !== "Choose an Option") {
          if (
            value.geo == this.props.values.accGeo ||
            value.geo == accountsData.geo
          ) {
            market = value.market;
            for (var i = 0; i < market.length; i++) {
              formOptionMarket = (
                <option
                  className="bx--select-option"
                  value={market[i]}
                  selected={market[i] == accountsData.market}
                >
                  {market[i]}
                </option>
              );
              itemsMarket.push(formOptionMarket);
            }
          }
        }
      });
      Object.entries(countryArr).map(([key, value]) => {
        formOptionCountry = (
          <option
            className="bx--select-option"
            data-iso={value.isocode}
            data-country={value.desc}
            value={value.desc}
            selected={value.desc == accountsData.countryName}
          >
            {value.desc}
          </option>
        );
        itemsCountry.push(formOptionCountry);
      });
    }
    return (
      <Form onSubmit={this.saveAndContinue}>
        <Grid>
          <Row>
            <Column>
              <Select
                className="labelFont"
                id="accountContractGeo"
                labelText={
                  <>
                    Account Contract Geo <b className="fontRed">*</b>
                  </>
                }
                name="accGeo"
                onChange={this.props.handleChange("accGeo")}
                defaultValue={this.props.accGeo|| ""}
                required
              >
                <SelectItem disabled hidden value="" text="Choose an option" />
                {itemsGeo}
              </Select>
            </Column>
            <Column>
              <Select
                className="labelFont"
                id="accountContractMarket"
                labelText={
                  <>
                    Account Contract Market <b className="fontRed">*</b>{" "}
                  </>
                }
                defaultValue={this.props.accMarket || ""}
                name="accMarket"
                onChange={this.props.handleChange("accMarket")}
                required
              >
                <SelectItem disabled hidden value="" text="Choose an option" />
                {itemsMarket}
              </Select>
            </Column>
          </Row>

          <Row>
            <Column>
              <Select
                className="labelFont"
                id="accountCountry"
                labelText={
                  <>
                    Account Country <b className="fontRed">*</b>
                  </>
                }
                defaultValue={this.props.countryName || values?.accountCountry || ""}
                name="accountCountry"
                onChange={this.props.handleChange("accountCountry")}
                required
              >
                <SelectItem disabled hidden value="" text="Choose an option" />
                {itemsCountry}
              </Select>
            </Column>
            <Column>
              <Select
                className="labelFont"
                id="accountSector"
                labelText={
                  <>
                    Account Sector <b className="fontRed">*</b>
                  </>
                }
                defaultValue={this.props.accSector || values?.accSector || ""}
                name="accSector"
                onChange={this.props.handleChange("accSector")}
                required
              >
                <SelectItem disabled hidden value="" text="Choose an option" />
                {itemsSector}
              </Select>
            </Column>
          </Row>

          <Row>
            <Column>
              <Select
                className="labelFont"
                id="accountIndustry"
                labelText={
                  <>
                    Account Industry <b className="fontRed">*</b>
                  </>
                }
                defaultValue={this.props.accIndustry ||  ""}
                name="accIndustry"
                onChange={this.props.handleChange("accIndustry")}
                required
              >
                <SelectItem disabled hidden value="" text="Choose an option" />
                {itemsIndustry}
              </Select>
            </Column>
            <Column>
              <TextInput
                className="labelFont classWithTitle"
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
                onChange={this.props.handleChange("blueID")}
                defaultValue={this.props.blueID } 
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <TextInput
                className="labelFont"
                id="accountCdir"
                name="CDIR"
                labelText={
                  <>
                    Account CDIR <b className="fontRed">*</b>
                  </>
                }
                placeholder="Account CDIR"
                onChange={this.props.handleChange("CDIR")}
                defaultValue={this.props.CDIR }
                required
              />
            </Column>
            <Column>
            <TextInput
                className="labelFont"
                id="accountGbgid"
                name="GBGID"
                labelText={
                  <>
                    Account GBGID <b className="fontRed">*</b>
                  </>
                }
                placeholder="Account GBGID"
                onChange={(e) => {
                  let gbgidValue = e.target.value.trim();
                  let RegEx = /^[a-z0-9]+$/i;
                  let isInvalid = !(RegEx.test(gbgidValue));
                  if(gbgidValue.length>15){
                      //show error
                      e.target.setCustomValidity(
                        "Only 15 characters are allowed"
                      );
                  }
                  if(isInvalid){
                    e.target.setCustomValidity(
                      "Only alphanumeric data is allowed"
                    );
                      
                  }
                  else e.target.setCustomValidity("");
                  this.props.handleChange("GBGID")(e);
                  
                }}
                defaultValue={this.props.GBGID }
                length={15}
                required
              /></Column>
          </Row>

          <Row>
            <Column>
              <TextInput
                className="labelFont"
                id="accountDpeName"
                name="dpeAdminName"
                labelText={
                  <>
                    Account DPE Name <b className="fontRed">*</b>
                  </>
                }
                placeholder="Account DPE Name"
                onChange={this.props.handleChange("dpeAdminName")}
                defaultValue={this.props.dpeAdminName}
                required
              />
            </Column>
            <Column>
              <TextInput
                type="email"
                className="labelFont"
                id="accountDpeEmail"
                name="dpeAdminEmail"
                labelText={
                  <>
                    Account DPE Email <b className="fontRed">*</b>
                  </>
                }
                placeholder="Account DPE Email"
                onChange={(e) => {
                  const email = e.target.value.trim();
                  const allowedDomains = process.env.REACT_APP_ALLOWED_DOMAINS?.split(",") || []
                  const validDomain = allowedDomains.find(domain => email.toLowerCase().includes(domain + "."));
                  const validEmail = email.toLowerCase().includes("." + enterprise.toLowerCase() + ".") || email.toLowerCase().includes("@" + enterprise.toLowerCase() + ".");
                  if (!validDomain || !validEmail)
                    e.target.setCustomValidity(
                      "Please provide a valid " + enterprise + " email id"
                    );
                  else e.target.setCustomValidity("");
                  this.props.handleChange("dpeAdminEmail")(e);
                }}
                defaultValue={this.props.dpeAdminEmail}
                required
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <TextInput
                className="labelFont"
                id="ItsmAdminName"
                name="itsmAdminName"
                labelText={
                  <>
                    ITSM System Admin Name <b className="fontRed">*</b>
                  </>
                }
                placeholder="ITSM System Admin Name"
                onChange={this.props.handleChange("itsmAdminName")}
                defaultValue={this.props.itsmAdminName}
                required
              />
            </Column>
            <Column>
              <TextInput
                type="email"
                className="labelFont"
                name="itsmAdminEmail"
                id="ItsmAdminEmail"
                labelText={
                  <>
                    ITSM System Admin Email <b className="fontRed">*</b>
                  </>
                }
                placeholder="ITSM System Admin Email"
                onChange={(e) => {
                  const email = e.target.value.trim();
                  const allowedDomains = process.env.REACT_APP_ALLOWED_DOMAINS?.split(",") || []
                  const validDomain = allowedDomains.find(domain => email.toLowerCase().includes(domain + "."));
                  const validEmail = email.toLowerCase().includes("." + enterprise.toLowerCase() + ".") || email.toLowerCase().includes("@" + enterprise.toLowerCase() + ".");
                  if (!validDomain || !validEmail)
                    e.target.setCustomValidity(
                      "Please provide a valid " + enterprise + " email id"
                    );
                  else e.target.setCustomValidity("");
                  this.props.handleChange("itsmAdminEmail")(e);
                }}
                defaultValue={this.props.itsmAdminEmail}
                required
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <TextInput
                className="labelFont"
                id="networkAdminName"
                name="networkAdminName"
                labelText="Network Admin Name"
                placeholder="Network Admin Name"
                onChange={this.props.handleChange("networkAdminName")}
                defaultValue={values?.networkAdminName}
              />
            </Column>
            <Column>
              <TextInput
                className="labelFont"
                id="networkAdminEmail"
                name="networkAdminEmail"
                labelText="Network Admin Email"
                placeholder="Network Admin Email"
                onChange={(e) => {
                  const email = e.target.value.trim();
                  const allowedDomains = process.env.REACT_APP_ALLOWED_DOMAINS?.split(",") || []
                  const validDomain = allowedDomains.find(domain => email.toLowerCase().includes(domain + "."));
                  const validEmail = email.toLowerCase().includes("." + enterprise.toLowerCase() + ".") || email.toLowerCase().includes("@" + enterprise.toLowerCase() + ".");
                  if (!validDomain || !validEmail)
                    e.target.setCustomValidity(
                      "Please provide a valid " + enterprise + " email id"
                    );
                  else {
                    e.target.setCustomValidity("");
                    this.props.handleChange("networkAdminEmail")(e);
                  }
                }}
                defaultValue={values?.networkAdminEmail}
              />
            </Column>
          </Row>
          <Row>
            <div className="btnDivAA"></div>
          </Row>
        </Grid>
        <div className="btnCommon">
            <div>
                {savedBtn}
            </div>
            <Button type="submit" className="btnMargin btnLast">
            Continue{" "}
            </Button>
        </div>
      </Form>
    );
  }
}

export default GeneralInfo;
