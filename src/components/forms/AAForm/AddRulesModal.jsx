import {
  Checkbox,
  Column,
  Form,
  Grid,
  Modal,
  Row,
  Select,
  SelectItem,
  TextInput,
} from "carbon-components-react";
import React, { useState, Component } from "react";
import ReactDOM from "react-dom";
import { Add24 } from "@carbon/icons-react";
import { AddAlt32 } from "@carbon/icons-react";
import { TrashCan32 } from "@carbon/icons-react";
import "../form.scss";
import AdditionalProp from './AdditionalProp';

const ModalStateManager = ({
  renderLauncher: LauncherContent,
  children: ModalContent,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {!ModalContent || typeof document === "undefined"
        ? null
        : ReactDOM.createPortal(
            <ModalContent open={open} setOpen={setOpen} />,
            document.body
          )}
      {LauncherContent && <LauncherContent open={open} setOpen={setOpen} />}
    </>
  );
};

class AddRules extends Component {
//   state = {};
    constructor(props) {    
        super(props)
        this.state = { 
            additionalProp: [{ additionalPropKey: "", additionalPropVal : "" }],
        };
        this.additionalPropData = [];
    }
    
  getUTCTime = (time) => {
    const inputDate = "2018-10-22";
    const inputTime = time;

    const getUTCTime = (d) => {
      return d.getUTCHours() + ":" + d.getUTCMinutes() + " UTC";
    };

    let [y, m, d] = inputDate.split("-");
    let date = new Date(y, m - 1, d);
    let [hh, mm] = inputTime.match(/\d+/g).map((x) => parseInt(x));
    let [ap] = inputTime.match(/[a-z]+/i);

    ap = ap.toLowerCase();
    if (ap === "pm") {
      hh = hh < 12 ? hh + 12 : 0;
    }
    date.setHours(hh, mm);

    let utc = getUTCTime(date);
    return utc;
  };
  
  
  handleChange( e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  
  
  render() {
    let modalFor = this.props.rulesFor;
    if(modalFor ==="group")
    {
      modalFor = "Add Rules";
    }
    else
    {
      modalFor = "Add Index Channel"
    }
    const { accountsData } = this.props;
    //console.log(`accountsData---${JSON.stringify(accountsData)}`);
    const timeList = [
      "1:00AM",
      "2:00AM",
      "3:00AM",
      "4:00AM",
      "5:00AM",
      "6:00AM",
      "7:00AM",
      "8:00AM",
      "9:00AM",
      "10:00AM",
      "11:00AM",
      "12:00PM",
      "1:00PM",
      "2:00PM",
      "3:00PM",
      "4:00PM",
      "5:00PM",
      "6:00PM",
      "7:00PM",
      "8:00PM",
      "9:00PM",
      "10:00PM",
      "11:00PM",
      "12:00AM",
    ];
    const operationList = [
      "INCLUDE",
      "PRESENT",
    ];
    let TICKETASSIGNMENTGROUPS = [];
    let additionalPropArr = [];
    let GROUPSOPERATION = "";
    let TICKETTYPE = "";
    const rules = {
      GEOGRAPHY: {},
      TICKETTYPE: {},
      MARKET: {},
      SECTOR: {},
      INDUSTRY: {},
      COUNTRY: {},
      TICKETPRIORITY: {},
      TICKETIMPACT: {},
      ADDITIOANLPROPERTY: {},
      CDIR: "",
      CDIC: "",
      BlueID: "",
      additionalPropArr: []
    };
    const timeRules = {
      "START TIME": "",
      "END TIME": "",
    };

    let geo = "";
    let markets = "";
    let sector = "";
    let industry = "";
    let country = "";
    var ticketTypeList = ''
    if (accountsData) {
        ticketTypeList = accountsData.ticketTemplates
      geo = accountsData.geoList
        .filter((value) => value.geo != "Choose an Option")
        .map((value) => (
          <Checkbox
            key={`${this.props.index}-geo-${value.geo}`}
            id={`${this.props.index}-geo-${value.geo}`}
            labelText={value.geo}
            onChange={(checked) => {
              if (checked) rules.GEOGRAPHY[value.geo] = checked;
              else delete rules.GEOGRAPHY[value.geo];
            }}
          />
        ));
      markets = accountsData.marketList.map((market) => (
        <Checkbox
          key={`${this.props.index}-market-${market}`}
          id={`${this.props.index}-market-${market}`}
          labelText={market}
          onChange={(checked) => {
            if (checked) rules.MARKET[market] = checked;
            else delete rules.MARKET[market];
          }}
        />
      ));

      sector = accountsData.sectorList
        .filter((value) => value.desc != "Choose an Option")
        .map((value) => (
          <Checkbox
            key={`${this.props.index}-sector-${value.desc}`}
            id={`${this.props.index}-sector-${value.desc}`}
            labelText={value.desc}
            onChange={(checked) => {
              if (checked) rules.SECTOR[value.desc] = checked;
              else delete rules.SECTOR[value.desc];
            }}
          />
        ));

      industry = accountsData.industryList
        .filter((value) => value.desc != "Choose an Option")
        .map((value) => (
          <Checkbox
            key={`${this.props.index}-industry-${value.desc}`}
            id={`${this.props.index}-industry-${value.desc}`}
            labelText={value.desc}
            onChange={(checked) => {
              if (checked) rules.INDUSTRY[value.desc] = checked;
              else delete rules.INDUSTRY[value.desc];
            }}
          />
        ));

      country = accountsData.countryList.map((value) => (
        <Checkbox
          key={`${this.props.index}-country-${value.desc}`}
          id={`${this.props.index}-country-${value.desc}`}
          labelText={value.desc}
          onChange={(checked) => {
            if (checked) rules.COUNTRY[value.desc] = checked;
            else delete rules.COUNTRY[value.desc];
          }}
        />
      ));
    }

    let ticketPriority = [1, 2, 3, 4];
    ticketPriority = ticketPriority.map((n) => (
      <Checkbox
        key={`${this.props.index}-${n}`}
        id={this.props.index + n}
        labelText={n}
        onChange={(checked) => {
          if (checked) rules.TICKETPRIORITY[n] = checked;
          else delete rules.TICKETPRIORITY[n];
        }}
      />
    ));

    let ticketImpact = ["Critical", "High", "Major", "Medium", "Minor", "Low"];
    ticketImpact = ticketImpact.map((value) => (
      <Checkbox
        key={this.props.index + value}
        id={this.props.index + value}
        labelText={value}
        onChange={(checked) => {
          if (checked) rules.TICKETIMPACT[value] = checked;
          else delete rules.TICKETIMPACT[value];
        }}
      />
    ));

    const withStateManagerProps = {
      className: "some-class",
      modalHeading: modalFor,
      primaryButtonText: "Submit Rule",
      secondaryButtonText: "Cancel",
    };
    const { size, ...rest } = withStateManagerProps;

    return (
      <ModalStateManager
        renderLauncher={({ setOpen }) => (
          <Add24
            className="iconAddSize"
            aria-label="Add Rule"
            title="Add Rule"
            onClick={() => setOpen(true)}
          />
        )}
      >
    
        {({ open, setOpen }) => (
          <Modal
            aria-label={modalFor}
            {...rest}
            size={size || undefined}
            open={open}
            className="bx--rules-popup-container"
            onRequestClose={() => setOpen(false)}
            onRequestSubmit={() => {
              const rulesArr = [];
              if (
                (timeRules["START TIME"] || timeRules["END TIME"]) &&
                !(timeRules["START TIME"] && timeRules["END TIME"])
              )
                return;
                var addPropKey;
                var addPropVal;
                var addPropstring="";
                var objLen;
                var valueList;
                Object.entries(rules).forEach((value) => {
                    const key = value[0];
                    if (value[1] && typeof value[1] == "string") {
                         rulesArr.push(`('${key}'='${value[1]}')`);
                    }else{
                        valueList = Object.keys(value[1]);
                        if(key == "ADDITIOANLPROPERTY"){
                            objLen = Object.keys(value[1]).length;
                            if(objLen == 2){
                                rulesArr.push(`('${value[1]["additionalPropKey-0"]}'='${value[1]["additionalPropVal-0"]}')`);
                            }else{
                                valueList = value[1];
                                if (objLen > 2) {
                                   
                                    for(var i=0; i < objLen/2; i++){
                                        addPropstring = "('"+ valueList["additionalPropKey-"+i]+"'='"+valueList["additionalPropVal-"+i] + "')" + " AND " + addPropstring
                                    }
                                     addPropstring = addPropstring.slice(0, -5)
                                     addPropstring = `(${addPropstring})`;
                                     rulesArr.push(addPropstring );
                                }
                            }
                        }else{
                            if (valueList.length) {
                              rulesArr.push(
                                `(${valueList
                                  .map((r) => `'${key}'='${r}'`)
                                  .join(" OR ")})`
                              );
                            }
                            
                        }
                    }
                });

              if (timeRules["START TIME"] && timeRules["END TIME"]) {
                rulesArr.push(
                  "('START TIME'= '" +
                    this.getUTCTime(timeRules["START TIME"]) +
                    "'" +
                    " TO 'END TIME'= '" +
                    this.getUTCTime(timeRules["END TIME"]) +
                    "')"
                );
              }
              if(TICKETTYPE){
                rulesArr.push(
                  "('TICKETTYPE'='" +
                  TICKETTYPE +
                  "')"
                );
                }
              if (TICKETASSIGNMENTGROUPS.length >0) {
                let groupArr = TICKETASSIGNMENTGROUPS.split(',');
                TICKETASSIGNMENTGROUPS = groupArr.map((val) => "'" + val + "'").join(',');
                if(GROUPSOPERATION){
                rulesArr.push(
                  "('TICKETASSIGNMENTGROUPS'." +
                    GROUPSOPERATION +
                    "([" +
                    TICKETASSIGNMENTGROUPS +
                    "]))"
                );
                }
              }
              this.props.onAddRules(rulesArr.join(" AND "));
              setOpen(false);
            }}
          >
            <Form>
              <Grid>
                <Row>
                  <Column lg={6}>
                    <TextInput
                      id="geo"
                      labelText="Geo"
                      placeholder="Enter Geo"
                    />
                    <div className="box">{geo}</div>
                  </Column>
                  <Column lg={1}></Column>
                  <Column lg={5}>
                    <TextInput
                      id="market"
                      labelText="Market"
                      placeholder="Enter Market"
                    />
                    <div className="box">{markets}</div>
                  </Column>
                </Row>
                <br />
                <Row>
                  <Column lg={6}>
                    <TextInput
                      id="sector"
                      labelText="Sector"
                      placeholder="Enter Sector"
                    />
                    <div className="box">{sector}</div>
                  </Column>
                  <Column lg={1}></Column>
                  <Column lg={5}>
                    <TextInput
                      id="industry"
                      labelText="Industry"
                      placeholder="Enter Industry"
                    />
                    <div className="box">{industry}</div>
                  </Column>
                </Row>
                <br />
                <Row>
                  <Column lg={6}>
                    <TextInput
                      id="country"
                      labelText="Country"
                      placeholder="Enter Country"
                    />
                    <div className="box">{country}</div>
                  </Column>
                  <Column lg={1}></Column>
                  <Column lg={5}>
                    <TextInput
                      id="ticketPriority"
                      labelText="Ticket Priority"
                      placeholder="Enter Ticket Priority"
                    />
                    <div className="box">{ticketPriority}</div>
                  </Column>
                </Row>
                <br />
                <Row>
                  <Column lg={6}>
                    <TextInput
                      id={this.props.index + "ticketImpact"}
                      labelText="Ticket Impact"
                      placeholder="Enter Ticket Impact"
                    />
                    <div className="box">{ticketImpact}</div>
                  </Column>
                  {/* <Column lg={1}></Column> */}
                  <Column lg={6}>
                    {this.props.rulesFor === "group" && (
                      <>
                        <div>Time</div>
                        <br />
                        <Select
                          name="startTime"
                          id="startTime"
                          placeholder="Choose start time"
                          onChange={(e) => {
                            timeRules["START TIME"] = e.target.value;
                          }}
                        >
                          <SelectItem
                            hidden
                            value=""
                            text="Choose start time"
                          />
                          {timeList.map((time) => (
                            <SelectItem
                              key={this.props.index + "startTime" + time}
                              id={this.props.index + "startTime" + time}
                              value={time}
                              text={time}
                            />
                          ))}
                        </Select>
                        <br />
                        <Select
                          name="endTime"
                          id="endTime"
                          placeholder="Choose end time"
                          onChange={(e) => {
                            timeRules["END TIME"] = e.target.value;
                          }}
                        >
                          <SelectItem hidden value="" text="Choose end time" />
                          {timeList.map((time) => (
                            <SelectItem
                              key={this.props.index + "endTime" + time}
                              id={this.props.index + "endTime" + time}
                              value={time}
                              text={time}
                            />
                          ))}
                        </Select>
                      </>
                    )}
                  </Column>
                  <Column lg={6}>
                    <div>
                      <span>
                      Ticket Assignment Groups <b className="groupLabel">(Please select Operation and Value)</b>
                      </span>
                    </div>
                    <br />
                    <Select
                          name="groupsOperation"
                          id="groupsOperation"
                          labelText="Select Operation"
                          placeholder="Choose Group Operation"
                          onChange={(e) => {
                            GROUPSOPERATION = e.target.value;
                          }}
                        >
                          <SelectItem
                            hidden
                            value=""
                            text="Choose Group Operation"
                          />
                          {operationList.map((operation) => (
                            <SelectItem
                              key={this.props.index + "groupsOperation" + operation}
                              id={this.props.index + "groupsOperation" + operation}
                              value={operation}
                              text={operation}
                            />
                          ))}
                    </Select>
                    <span>
                      <b className="fontRed">*</b><b className="groupLabel">INCLUDE - Exact match</b>
                      <br />
                      <b className="fontRed">*</b><b className="groupLabel">PRESENT - Not exact match</b>
                    </span>
                    <br /><br />
                    <TextInput
                      id={this.props.index + "ticketAssignmentGroups"}
                      name="ticketAssignmentGroups"
                      labelText={<>Enter Value <b className="groupLabel">(Comma Separated)</b></>}
                      placeholder="Enter Assignment Groups"
                      onChange={(e) => {
                        TICKETASSIGNMENTGROUPS = e.target.value;
                      }}
                    />
                  </Column>
                  </Row>
                  <Row>
                  <Column lg={6}>
                        <Select
                            name="ticketType"
                            id="ticketType"
                            labelText="Select Ticket Type"
                            placeholder="Choose Ticket Type"
                            onChange={(e) => {
                                TICKETTYPE = e.target.value;
                            }}
                            >
                            <SelectItem
                                hidden
                                value=""
                                text="Choose Ticket Type"
                            />
                            {ticketTypeList.map((ticketType) => (
                                <SelectItem
                                key={"ticketType" + ticketType}
                                id={"ticketType" + ticketType}
                                value={ticketType}
                                text={ticketType}
                                />
                            ))}
                        </Select> 
                    </Column>
                </Row>
                <AdditionalProp rules={rules} addProperty={this.additionalProps}/>
              </Grid>
            </Form>
          </Modal>
        )}
      </ModalStateManager>
    );
  }
}

export default AddRules;
