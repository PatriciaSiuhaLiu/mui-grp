import React, { Component } from "react";
import {
  Button,
  Checkbox,
  Form,
  TextInput,
  Select,
  SelectItem,
  Column,
  Row,
  TooltipIcon,
  MultiSelect,
  ComboBox,
} from "carbon-components-react";
import Breadcrumb from "../SuperAdmin/SACommands/CommandsBreadCrumb";
// import {DynamicQyeryForm} from './DynamicQyeryForm'
import { trackPromise } from "react-promise-tracker";
import { InformationFilled16, Add16, Subtract16 } from "@carbon/icons-react";


export default class EditSMRules extends Component {
  constructor(props) {
    super(props);
    // this.getAccountDetail();
    this.getSelectedStates()
  }

  getSelectedStates = async () => {
    const searchUrl = this.props.location.search;
    let ruleDetails = {};
    if (searchUrl) {
      const ruleId = searchUrl.split("?").length > 1 && searchUrl.split("?")[1];
      console.log("ruleId: ",ruleId);
      if (ruleId) { 
        ruleDetails = await this.fetchRuleDetails(ruleId);
        if(ruleDetails.ticketStates){
          for(let ticketState of (ruleDetails.ticketStates)){
            this.selectedTicketStates.push(ticketState)
          }
        }

        if(ruleDetails.queryParameters){
          this.selectedDynamicQuery = [...ruleDetails.queryParameters]
        }
   
    }
  }
}
selectedDynamicQuery = [];
  actions = ["user", "channel", "group"];
  state = {
    ruleId: "",
    accountCode: "",
    assignmentGroup: "",
    priority: "",
    checked: false,
    actiontype: "",
    channelId: "",
    userEmail: "",
    groupName: "",
    breachType: "",
    breachTime: "",
    breachTimeUnit: "",
    sla: "",
    slaUnit: "",
    editMode: false,
    isRuleEnabled: false,
    isFormValid: true,
    enableUserEmail: false,
    enableChannelId: false,
    enableGroup: false,
    enableOwnerNotification: false,
    incidentChannelEnabled:false,
    ticketStateList: [],
    ticketStateItems: [],
    ticketStates: [],
    invalid_ticketStates: undefined,
    queryParameters: undefined,
    // queryParametersCreate: [{ paramName: "", operator: "", paramValue: "" }],
    dynamicComboboxItems: [],
    dynamicQueryOperators: [],
    initialSelectedComboItems: [],

  };
  selectedTicketStates = []

  links = {
    Home: "/mui/home",
    Accounts: "/mui/onboardAccount",
    ServiceManager: `/mui/servicemanager?${this.props.match.params.accountId}`,
    "Add Rule": "/mui/servicemanager/create",
  };
   
    handleDynamicComboChange = (event, index) => {
      // const { name, value } = event.target;
      console.log(event.selectedItem);

      const list = [...this.state.queryParameters];
      list[index]["paramName"] = event.selectedItem;
      console.log(JSON.stringify(list));
      this.setState({queryParameters: list});
      }

      
    handleDynamicInputChange = (event, index) => {
      const { name, value } = event.target;
      const list = [...this.state.queryParameters];
      list[index][name] = value;
      console.log(JSON.stringify(list));
      this.setState({queryParameters: list});
    }
    handleRemoveClick (index) {
      const list = [...this.state.queryParameters];
      list.splice(index, 1);
      this.setState({queryParameters: list})
    };
    handleAddClick(event) {

      this.setState((prevState) => {
        return {
          queryParameters: [
            ...prevState.queryParameters,
            { paramName: "", paramValue: "" },
          ],
        };
      });
    }

   fetchRuleDetails = async (ruleId) => {
    const response = fetch(`/mui/ruleDetails/${ruleId}`);
    // trackPromise(response);
    const res = await response;
    if (res.status === 200) {
      const { ruleDetail } = await res.json();
      
      const { assignmentGroup, priority, breachType, breachTime, breachTimeUnit, sla, slaUnit, userEmail, groupName, channelId, isRuleEnabled, enableOwnerNotification,incidentChannelEnabled, ticketStates, queryParameters } = ruleDetail;
      return {
        assignmentGroup: assignmentGroup ? assignmentGroup : "",
        priority,
        breachType,
        breachTime,
        breachTimeUnit,
        sla,
        slaUnit,
        userEmail,
        groupName,
        channelId,
        ruleId,
        isRuleEnabled,
        enableOwnerNotification,
        incidentChannelEnabled,
        ticketStates,
        queryParameters: (queryParameters && queryParameters.length) ? queryParameters : [{ paramName: "", operator: "", paramValue: "" }]
      }
    }
   }
  getAccountDetail = async () => {
    const response = fetch(`/mui/getMUIAccountData/${this.props.match.params.accountId}`);
    const res = await response;
    
    if (res.status === 200) {
      const { muiAccountData } = await res.json();
    // If form is opened in Edit Mode, Get rule details 
    const searchUrl = this.props.location.search;
    let ruleDetails = {};
    let editMode = false;
    if (searchUrl) {
      const ruleId = searchUrl.split("?").length > 1 && searchUrl.split("?")[1];
      if (ruleId) {
        
       ruleDetails = await this.fetchRuleDetails(ruleId);
       editMode = true;
      }
    }
    let enableUserEmail = false, enableChannelId = false, enableGroup = false;
    if(ruleDetails.userEmail){
      enableUserEmail = true
    }
    if(ruleDetails.channelId){
      enableChannelId = true
    }
    if(ruleDetails.groupName){
      enableGroup = true
    }
     const ticketStateItems =  await this.getTicketState(muiAccountData.accountCode, ruleDetails);
      const {dynamicComboboxItems, dynamicQueryOperators} = await this.getValueForDynamicCombobox(muiAccountData.accountCode);
    //   setTimeout(() => {
        this.setState({
          accountCode: muiAccountData.accountCode,
          editMode,
          ...ruleDetails,
          enableUserEmail,
          enableChannelId,
          enableGroup,
          ticketStateItems,
          dynamicComboboxItems,
          dynamicQueryOperators,
        });
    //   }, 1000)
      

      console.log(JSON.stringify(this.state));

    }
  }

	getValueForDynamicCombobox = async (accountCode) => {
    const response = await fetch(
      `/mui/servicemanager/serviceManagerSettings/${accountCode}`
    );
      let dynamicComboboxItems = [];
    const { serviceManagerSettings, dynamicQueryOperators } = await response.json();
    if (serviceManagerSettings && serviceManagerSettings.length) {
      if (serviceManagerSettings[0].incidentParamNames) {
        dynamicComboboxItems =  Object.values(serviceManagerSettings[0].incidentParamNames).map(value => {
            return value;
          })
        }
      }
      return {dynamicComboboxItems, dynamicQueryOperators}
    }
  getTicketState = async (accountCode, ruleDetails) => {
    //Get states from ticketing tool
    const response = fetch(`/mui/servicemanager/getTicketState/${accountCode}`);
    const resTicketState = await response;
    if(resTicketState.status === 200){
      const {msStatusValues} = await resTicketState.json();
      const ticketStateItems = [];
      for(let ticketStateKey in msStatusValues ){
        ticketStateItems.push({
          id: ticketStateKey,
          text: msStatusValues[ticketStateKey]
        })
      }
      return ticketStateItems;
    }

  }
  componentDidMount() {
    this.getAccountDetail();
    trackPromise(
      fetch("/mui/fetchAllowedDomains")
      .then((res) => {
          return res.json();
      })
      .then((domainData) => {
          this.setState({ domainData });
      })
  );
  }
  onBlur = (e) => {
    if (
      (e.target.value &&
        e.target.value.includes("script") &&
        e.target.value.includes("<")) ||
      e.target.value.includes(">")
    ) {
      this.setState({
        ["inValid_" + e.target.name]: "Invalid Input.",
        isFormValid: false
      });
      return;
    }
    if(e.target.name === "assignmentGroup") {
      this.setState({
        [e.target.name]: e.target.value,
      });
    } 
  }
  onSelectChange = (e) => {
    const selectedStates = e.selectedItems;
    this.setState({ticketStates: selectedStates, isFormValid: true})
  }
  
  
  handleInputChange = (e) => {
    e.preventDefault();
    if (
      (e.target.value &&
        e.target.value.includes("script") &&
        e.target.value.includes("<")) ||
      e.target.value.includes(">")
    ) {
      this.setState({
        ["inValid_" + e.target.name]: "Invalid Input.",
        isFormValid: false
      });
      return;
    }
    if(e.target.name === "sla" || e.target.name === "breachTime"){
      const re = /^[0-9\b]+$/;
      if (e.target.value === '' || !re.test(e.target.value)) {
        this.setState({
          ["invalid_" + e.target.name]:
            "Enter Number between 0-9",
            isFormValid: false
        });
        return;
      }else {
        this.setState({
          ["invalid_" + e.target.name]:undefined,
          isFormValid: true
        });
      }
    }
    if(e.target.name === "userEmail"){
      // Validate User email for kyndryl Domain
      var domainValues = this.state.domainData;
      var domainArray = domainValues.domainData;
      if(e.target.value.includes("@")){
          let splitUser = e.target.value.split("@");
          if(splitUser[1]) {
            this.setState({
              ["invalid_" + e.target.name]: undefined,
              isFormValid: true
            });

            if (!domainArray.includes(splitUser[1].toLowerCase())) {
              this.setState({
                ["invalid_" + e.target.name]:
                  "Invalid email domain",
                  isFormValid: false
              });
              return;
            }else {
              this.setState({
                ["invalid_" + e.target.name]: undefined,
                isFormValid: true
              });
            }
          }else {
            this.setState({
              ["invalid_" + e.target.name]:
                "Invalid email",
                isFormValid: false
            });
            return;
          }         
      }else {
        this.setState({
          ["invalid_" + e.target.name]: "Invalid email",
          isFormValid: false
        });
      }
    }else {
      this.setState({
        "invalid_userEmail": undefined,
        isFormValid: true
      });
    }
    this.setState({
      [e.target.name]: e.target.value,
    });

  };

  setUserEmail = () => {
    let userEmail;
    if(!this.state.enableUserEmail){
      userEmail = this.state.userEmail
    }else {
      userEmail = "";
    }
    this.setState({enableUserEmail: !this.state.enableUserEmail, userEmail})
  }
  setChannelId = () => {
    let channelId;
    if(!this.state.enableChannelId){
      channelId = this.state.channelId
    }else {
      channelId = "";
    }
    this.setState({enableChannelId: !this.state.enableChannelId, channelId})
  }
  setGroup = () => {
    let groupName;
    if(!this.state.enableGroup){
      groupName = this.state.groupName
    }else {
      groupName = "";
    }
    this.setState({enableGroup: !this.state.enableGroup, groupName})
  }

  setOwnerNotification = () => {
    this.setState({enableOwnerNotification: !this.state.enableOwnerNotification})
  }
  setIncidentChannel = () => {
    this.setState({incidentChannelEnabled: !this.state.incidentChannelEnabled})
  }
  formSubmit = async (e) => {
    e.preventDefault();
    if(this.state.isFormValid){
      if(!(this.state.enableUserEmail || this.state.enableChannelId || this.state.enableGroup)){
        this.setState({
          "invalid_ticketStates": undefined,
          isFormValid: true
        });
        this.setState({
          "invalid_action": "Choose at least one notification type",
          isFormValid: false
        });
        return;
      }else {
        this.setState({
          "invalid_action": undefined,
          isFormValid: true
        });
      }

      if(this.state.ticketStates && this.state.ticketStates.length === 0){
        this.setState({
          "invalid_ticketStates": "Select at least one State",
          isFormValid: false
        });
        return;
      }else {
        this.setState({
          "invalid_ticketStates": undefined,
          isFormValid: true
        });
      }

      const queryParamsToSave = this.state.queryParameters.filter(queryParam => {
        return (!(queryParam.paramName == null || queryParam.paramName === ""));
       })
        const ruleData = {
          accountCode : this.state.accountCode,
          priority: this.state.priority,
          assignmentGroup: this.state.assignmentGroup,
          slaUnit: this.state.slaUnit,
          sla: this.state.sla,
          breachType: this.state.breachType,
          breachTimeUnit: this.state.breachTimeUnit,
          breachTime : this.state.breachTime,
          userEmail: this.state.userEmail,
          channelId: this.state.channelId,
          groupName: this.state.groupName,
          enableOwnerNotification: this.state.enableOwnerNotification,
          incidentChannelEnabled: this.state.incidentChannelEnabled,
          ticketStates: this.state.ticketStates,
          queryParameters: queryParamsToSave
        };

        // check for existing rule
        const query = `accountCode=${ruleData.accountCode}&priority=${ruleData.priority}&assignmentGroup=${ruleData.assignmentGroup}&slaUnit=${ruleData.slaUnit}&sla=${ruleData.sla}&breachType=${ruleData.breachType}&breachTimeUnit=${ruleData.breachTimeUnit}&breachTime=${ruleData.breachTime}`;
        const response = await fetch(`/mui/servicemanager/serachRule?${query}`)
        const result = await response.json();
        if(result && result.length > 0){
          let validateDuplicate = true;
          const {
            accountCode,
            priority,
            assignmentGroup,
            slaUnit,
            sla,
            breachType,
            breachTimeUnit,
            breachTime,
            _id: ruleIdDB
          } = result[0];
          let ruleFromDB =  {
            accountCode,
            priority,
            assignmentGroup,
            slaUnit,
            sla,
            breachType,
            breachTimeUnit,
            breachTime
          };
          if(this.state.editMode){
            if(this.state.ruleId && ruleIdDB === this.state.ruleId){
              validateDuplicate = false;
            }else {
              validateDuplicate = true
            }
          }
          if(validateDuplicate){
            const incomingRuleData = {
              accountCode: ruleData.accountCode,
              priority: ruleData.priority,
              assignmentGroup: ruleData.assignmentGroup,
              slaUnit: ruleData.slaUnit,
              sla: ruleData.sla,
              breachType: ruleData.breachType,
              breachTimeUnit: ruleData.breachTimeUnit,
              breachTime: ruleData.breachTime
            }
            if(JSON.stringify(ruleFromDB) === JSON.stringify(incomingRuleData)){
              this.setState({
                invalid_rule: "Rule already exists ",
                isFormValid: false
              });
              return;
            }else {
              this.setState({
                invalid_rule: undefined,
                isFormValid: true
              });
            }
          }
        }else {
          this.setState({
            invalid_rule: undefined,
            isFormValid: true
          });
        }

        //Validate group name
        if(this.state.groupName){
          const responseGroup = await fetch(`/mui/group/getGroup/${this.state.groupName}`)
          const resultGroup = await responseGroup.json();
          if(!resultGroup || resultGroup.length === 0){
            this.setState({
              invalid_group: "Invalid Group",
              isFormValid: false
            });
            return;
          }else {
            this.setState({
              invalid_group: undefined,
              isFormValid: true
            });
          }
        }

        ruleData["isRuleEnabled"]=this.state.isRuleEnabled
        if (this.state.editMode) {
          
            const data = {
                ruleId: this.state.ruleId,
                data:ruleData 
              }
              trackPromise(
                fetch('/mui/patchRule' , {
                method: "PATCH",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(data)
                })
                .then((result) => {
                    if(result.status === 200){
                      this.props.history.push(`${this.links.ServiceManager}`);
                    }
                })
                .catch(err => { 
                    // setErrorMessage({errorMessage: err.error});
                })
            );
        } else {
            trackPromise(
              fetch("/mui/createRule", {
                method: "POST",
                headers: {
                  "Content-type": "application/json",
                },
                body: JSON.stringify(ruleData),
              })
                .then((result) => {
                  if (result.status === 404 || result.status === 400) {
                    result.json().then((object) => {
                      this.setState({ resErrMsg: object.errMsg });
                    });
                  } else if (result.status === 200) {
                    this.props.history.push(`${this.links.ServiceManager}`);
                  }
                })
                .catch((err) => {
                  this.setState({ errorMessage: err.message });
                })
            );
          }
    }
  };

  breachTimeUnitList = ["Minutes", "Hours",];
  slaUnitList = ["Minutes", "Hours", "Days"];
  render() {
   
    const breachTypes = ["Approaching", "Lapsed"]
    const priorityList = ["1", "2", "3", "4", "5"]
    const priorityOptions = priorityList.map((priority) => {
      return (
        <option
          className="bx--select-option"
          value={priority}
          selected={priority === this.state.priority}

        >
          {priority}
        </option>
      );
    });
    const dynamicQueryParamOptions = this.state.dynamicComboboxItems.map((paramName) => {
      return (
        <option
          className="bx--select-option"
          value={paramName}
          // selected={paramName === this.state.priority}

        >
          {paramName}
        </option>
      );
    });
    const dynamicQueryOperatorptions = this.state.dynamicQueryOperators.map((operator) => {
      return (
        <option
          className="bx--select-option"
          value={operator.value}

        >
          {operator.text}
        </option>
      );
    });
    const breachTypeOptions = breachTypes.map((breachType) => {
      return (
        <option
          className="bx--select-option"
          value={breachType}
          selected={breachType === this.state.breachType}

        >
          {breachType}
          
        </option>
      );
    });
 
    const breachTimeUnitOptions = this.breachTimeUnitList.map((breachTimeUnit) => {
      return (
        <option
          className="bx--select-option"
          value={breachTimeUnit}
          selected={breachTimeUnit === this.state.breachTimeUnit}
        >
          {breachTimeUnit}
        </option>
      );
    });
    const slaUnitOptions = this.slaUnitList.map((slaUnit) => {
      return (
        <option
          className="bx--select-option"
          value={slaUnit}
          selected={slaUnit === this.state.slaUnit}
        >
          {slaUnit}
        </option>
      );
    });
    let inputFields = null;

    if(this.state.queryParameters ){

      inputFields =  this.state.queryParameters.map((input, index) => {
        console.log("input",JSON.stringify(input));
        return (
          <>
            <Row>
              <Column>
                  <Select
                      className="labelFont "
                      id={`paramName-${index}`}
                      name="paramName"
                      labelText="Name"
                      defaultValue={input.paramName || ''}
                      onChange={(event) => this.handleDynamicInputChange(event, index)}
                      // required="required"
                    >
                      <SelectItem
                        value=""
                        text="Choose an Option"
                      />
                      {dynamicQueryParamOptions}
                  </Select>
              </Column>
              <Column>
                <Select
                      className="labelFont "
                      id={`operator-${index}`}
                      name="operator"
                      labelText="Operator"
                      defaultValue={input.operator}
                      onChange={(event) => this.handleDynamicInputChange(event, index)}
                      // required="required"
                    >
                      <SelectItem
                        value=""
                        text="Choose an Option"
                      />
                      {dynamicQueryOperatorptions}  
                  </Select>
              </Column>
              <Column>
                <TextInput
                  labelText={
                    <>
                      Value{" "}
                    </>
                  }
                  placeholder="Value"
                  name="paramValue"
                  id={`${input.paramValue}-${index}`}
                  onChange={(event) => this.handleDynamicInputChange(event, index)}
                  defaultValue={input.paramValue}
                />
              </Column>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Button
                  renderIcon={Add16}
                  iconDescription="Add Query Parameter"
                  hasIconOnly
                  size="md"
                  kind="ghost"
                  onClick={(event) => this.handleAddClick(event)}
                ></Button>
                {this.state.queryParameters.length !== 1 && (
                  <Button
                    renderIcon={Subtract16}
                    iconDescription="Remove Query Parameter"
                    hasIconOnly
                    size="md"
                    kind="ghost"
                    onClick={() => this.handleRemoveClick(index)}
                  >
                    
                  </Button>
                )}
              </div>
            </Row>
          </>
        );
      });
    }

   
    return (
      <div>
        <div className="headerDiv mainMargin sectionMargin">
          <Breadcrumb header="Add Rule" links={this.links} />
        </div>
        <section className="sectionMargin mainMargin paddingCostom">
          <Form
            className="formMain"
            onSubmit={(event) => this.formSubmit(event)}
          >
            <TextInput
              labelText={
                <>
                  Account Code <b style={{ color: "red" }}>*</b>
                </>
              }
              placeholder="Account Code"
              name="accountCode"
              id="accountCode"
              onChange={(event) => this.handleInputChange(event)}
              defaultValue={this.state.accountCode}
              readOnly={true}
              required
            />
            {this.state["invalid_accountCode"] && (
              <small className="danger">
                <b className="errorMsg">{this.state["invalid_accountCode"]}</b>
              </small>
            )}
            <TextInput
              labelText={
                <>
                  Assignment Group{" "}
                  <TooltipIcon
                    renderIcon={InformationFilled16}
                    direction="bottom"
                    tabIndex={0}
                    tooltipText="Assignment group of the ticket that needs notification"
                  ></TooltipIcon>
                </>
              }
              placeholder="Assignment Group"
              name="assignmentGroup"
              id="assignmentGroup"
              onChange={(event) => this.handleInputChange(event)}
              onBlur={(event) => this.onBlur(event)}
              defaultValue={this.state.assignmentGroup}
            />
            {this.state["invalid_assignmentGroup"] && (
              <small className="danger">
                <b className="errorMsg">
                  {this.state["invalid_assignmentGroup"]}
                </b>
              </small>
            )}
            <Select
              className="labelFont "
              id="priority"
              name="priority"
              labelText={
                <>
                  Priority <b style={{ color: "red" }}>*</b>
                  <TooltipIcon
                    renderIcon={InformationFilled16}
                    direction="bottom"
                    tabIndex={0}
                    tooltipText="Priority of the ticket"
                  ></TooltipIcon>
                </>
              }
              defaultValue={this.state.priority}
              onChange={(e) => this.handleInputChange(e)}
              required="required"
            >
              <SelectItem value="" text="Choose an Option" />
              {priorityOptions}
            </Select>

            <MultiSelect
              titleText={
                <>
                  State <b style={{ color: "red" }}>*</b>
                </>
              }
              label="State"
              items={this.state.ticketStateItems}
              onChange={(e) => this.onSelectChange(e)}
              itemToString={(item) => (item ? item.text : "")}
              initialSelectedItems={this.selectedTicketStates}
            />
            <div
              style={{ marginBottom: "3px", marginTop: "1rem" }}
              className="ticketingToolGroupDiv"
            >
              <p style={{ marginBottom: "3px" }}>
                Enter dynamic query parameters
                <TooltipIcon
                  renderIcon={InformationFilled16}
                  direction="bottom"
                  tabIndex={0}
                  tooltipText="Generate Parameters for dynamic query by clicking on settings button in the Service Manager home page. For fields with Date, enter value in YYYY-MM-DD HH:MM:SS format"
                ></TooltipIcon>
              </p>
              {inputFields}
              
            </div>

            <Row>
              <Column>
                <Select
                  className="labelFont "
                  id="slaUnit"
                  name="slaUnit"
                  labelText={
                    <>
                      SLA/SLO Unit <b style={{ color: "red" }}>*</b>
                      <TooltipIcon
                        renderIcon={InformationFilled16}
                        direction="bottom"
                        tabIndex={0}
                        tooltipText={`Specify the unit of time the SLA runs within which the ticket should move out of the initial state(Open/InProgress)`}
                      ></TooltipIcon>
                    </>
                  }
                  defaultValue={this.state.slaUnit || ""}
                  onChange={(e) => this.handleInputChange(e)}
                  required="required"
                >
                  <SelectItem value="" text="Choose an Option" />
                  {slaUnitOptions}
                </Select>
              </Column>
              <Column>
                <TextInput
                  labelText={
                    <>
                      SLA/SLO Duration <b style={{ color: "red" }}>*</b>
                      <TooltipIcon
                        renderIcon={InformationFilled16}
                        direction="bottom"
                        tabIndex={0}
                        tooltipText={` Specify the length of time the SLA runs within which the ticket should move out of the initial state(Open/InProgress)`}
                      ></TooltipIcon>
                    </>
                  }
                  placeholder="SLA"
                  name="sla"
                  id="sla"
                  onChange={(event) => this.handleInputChange(event)}
                  defaultValue={this.state.sla}
                  maxLength={3}
                  required
                />

                {this.state["invalid_sla"] && (
                  <small className="danger">
                    <b className="errorMsg">{this.state["invalid_sla"]}</b>
                  </small>
                )}
              </Column>
            </Row>
            <Row>
              <Column>
                <Select
                  className="labelFont "
                  id="breachType"
                  name="breachType"
                  labelText={
                    <>
                      Breach Detection Type <b style={{ color: "red" }}>*</b>
                      <TooltipIcon
                        renderIcon={InformationFilled16}
                        direction="bottom"
                        tabIndex={0}
                        tooltipText="Specify breach detection type, whether the breach should be detected before or after a breach occurs"
                      ></TooltipIcon>
                    </>
                  }
                  defaultValue={this.state.breachType || ""}
                  onChange={(e) => this.handleInputChange(e)}
                  required="required"
                >
                  <SelectItem value="" text="Choose an Option" />
                  {breachTypeOptions}
                </Select>
              </Column>
            </Row>
            <Row>
              <Column>
                <Select
                  className="labelFont "
                  id="breachTimeUnit"
                  name="breachTimeUnit"
                  labelText={
                    <>
                      Breach Detection Time Unit{" "}
                      <b style={{ color: "red" }}>*</b>
                      <TooltipIcon
                        renderIcon={InformationFilled16}
                        direction="bottom"
                        tabIndex={0}
                        tooltipText="Specify the unit of time when breach must be notified once detected"
                      ></TooltipIcon>
                    </>
                  }
                  defaultValue={this.state.breachTimeUnit || ""}
                  onChange={(e) => this.handleInputChange(e)}
                  required="required"
                >
                  <SelectItem value="" text="Choose an Option" />
                  {breachTimeUnitOptions}
                </Select>
              </Column>
              <Column>
                <TextInput
                  labelText={
                    <>
                      Breach Detection Time <b style={{ color: "red" }}>*</b>
                      <TooltipIcon
                        renderIcon={InformationFilled16}
                        direction="bottom"
                        tabIndex={0}
                        tooltipText="Specify the length of time when breach must be notified once detected"
                      ></TooltipIcon>
                    </>
                  }
                  placeholder="Breach Detection Time"
                  name="breachTime"
                  id="breachTime"
                  onChange={(event) => this.handleInputChange(event)}
                  maxLength={3}
                  defaultValue={this.state.breachTime}
                  required
                />
                {this.state["invalid_breachTime"] && (
                  <small className="danger">
                    <b className="errorMsg">
                      {this.state["invalid_breachTime"]}
                    </b>
                  </small>
                )}
              </Column>
            </Row>
            <div
              style={{ marginBottom: "3px" }}
              className="ticketingToolGroupDiv"
            >
              <p style={{ marginBottom: "3px" }}>Choose notification type</p>
              <Row>
                <Column>
                  <Checkbox
                    labelText={
                      <>
                        User Email{" "}
                        {this.state.enableUserEmail ? (
                          <b style={{ color: "red" }}>*</b>
                        ) : null} <TooltipIcon 
                        renderIcon={InformationFilled16} 
                        direction="bottom" 
                        tabIndex={0} 
                        tooltipText="User email needs to be entered , user would get notification as a direct message"
                        >
                        </TooltipIcon>
                      </>
                    }
                    id="checkbox-userEmail"
                    checked={this.state.enableUserEmail}
                    onChange={() => this.setUserEmail()}
                  />

                  <TextInput
                    labelText=""
                    placeholder="User Email"
                    name="userEmail"
                    id="userEmail"
                    onChange={(event) => this.handleInputChange(event)}
                    defaultValue={this.state.userEmail}
                    required={this.state.enableUserEmail}
                    disabled={!this.state.enableUserEmail}
                  />
                  {this.state["invalid_userEmail"] && (
                    <small className="danger">
                      <b className="errorMsg">
                        {this.state["invalid_userEmail"]}
                      </b>
                    </small>
                  )}
                </Column>
                <Column>
                  <Checkbox
                    labelText={
                      <>
                        Channel Id{" "}
                        {this.state.enableChannelId ? (
                          <b style={{ color: "red" }}>*</b>
                        ) : null}{" "}
                        <TooltipIcon
                          renderIcon={InformationFilled16}
                          direction="bottom"
                          tabIndex={0}
                          tooltipText="Channel id of the collaboration tool where notifications needs to be posted"
                        ></TooltipIcon>
                      </>
                    }
                    id="checkbox-channelId"
                    checked={this.state.enableChannelId}
                    onChange={() => this.setChannelId()}
                  />
                  <TextInput
                    labelText=""
                    placeholder="Channel ID"
                    name="channelId"
                    id="channelId"
                    onChange={(event) => this.handleInputChange(event)}
                    defaultValue={this.state.channelId}
                    required={this.state.enableChannelId}
                    disabled={!this.state.enableChannelId}
                  />
                </Column>
                <Column>
                  <Checkbox
                    labelText={
                      <>
                        Group Name{" "}
                        {this.state.enableGroup ? (
                          <b style={{ color: "red" }}>*</b>
                        ) : null}{" "}
                        <TooltipIcon
                          renderIcon={InformationFilled16}
                          direction="bottom"
                          tabIndex={0}
                          tooltipText="ChatOps groups needs to be entered , all members would get notification as a direct message"
                        ></TooltipIcon>
                      </>
                    }
                    id="checkbox-group"
                    checked={this.state.enableGroup}
                    onChange={() => this.setGroup()}
                  />
                  <TextInput
                    labelText=""
                    placeholder="Group Name"
                    name="groupName"
                    id="groupName"
                    onChange={(event) => this.handleInputChange(event)}
                    defaultValue={this.state.groupName}
                    required={this.state.enableGroup}
                    disabled={!this.state.enableGroup}
                  />
                  {this.state["invalid_group"] && (
                    <small className="danger">
                      <b className="errorMsg">{this.state["invalid_group"]}</b>
                    </small>
                  )}
                </Column>
              </Row>
            </div>
            {this.state["invalid_action"] && (
              <small className="danger">
                <b className="errorMsg">{this.state["invalid_action"]}</b>
              </small>
            )}
            {this.state["invalid_ticketStates"] && (
              <small className="danger">
                <b className="errorMsg">{this.state["invalid_ticketStates"]}</b>
              </small>
            )}
            <Row>
              <Column>
                <Checkbox
                  labelText={
                    <>
                      Send Notification to Ticket Owner{" "}
                      <TooltipIcon
                        renderIcon={InformationFilled16}
                        direction="bottom"
                        tooltipText="Only kyndryl email ids are supported"
                      ></TooltipIcon>
                    </>
                  }
                  id="checkbox-owner"
                  checked={this.state.enableOwnerNotification}
                  onChange={() => this.setOwnerNotification()}
                />
              </Column>
              <Column>
                <Checkbox
                  labelText="Enable creation of Incident Channel"
                  id="checkbox-incidentChannel"
                  checked={this.state.incidentChannelEnabled}
                  onChange={() => this.setIncidentChannel()}
                />
              </Column>
            </Row>
            <Button className="addAccBtn addBtnCss addBtnPACss" type="submit">
              Save Rule
            </Button>
            <br />
            {this.state["invalid_rule"] && (
              <small className="danger">
                <b className="errorMsg">{this.state["invalid_rule"]}</b>
              </small>
            )}
            <br />
            <br />
            <br />
          </Form>
        </section>
      </div>
    );
  }
}
