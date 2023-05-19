import {
  Button,
  Checkbox,
  Form,
  TextArea,
  TextInput,
} from "carbon-components-react";
import React, { Component } from "react";
import { trackPromise } from "react-promise-tracker";
import Breadcrumb from "../SuperAdmin/SACommands/CommandsBreadCrumb";
import { isUniqueGroup } from "./ChatopsGroupUtil";
import { validate } from '../../validation/validate.js';
var logger = require("winston");

export default class CreateGroup extends Component {
  state = {
    groupName: "",
    groupDescription: "",
    editMode: false,
    loggedInUserKyndrylEmail: "",
    groupId: "",
    checked: false,
  };

  links = {
    Home: "/mui/home",
    Groups: "/mui/groups",
    Create: "/mui/groups/create",
  };

  handleInputChange = (e) => {
    e.preventDefault();
    // Validations
    if (
      (e.target.value &&
        e.target.value.includes("script") &&
        e.target.value.includes("<")) ||
      e.target.value.includes(">")
    ) {
      this.setState({
        ["invalid_" + e.target.name]: "Invalid Input.",
      });
      return;
    }
    if (
      e.target.name === "groupName" &&
      e.target.value &&
      e.target.value.match(/[!<>#%]/)
    ) {
      this.setState({
        ["invalid_" + e.target.name]:
          "Value should not contain !<>#% Characters.",
      });
      return;
    } else {
      this.setState({
        ["invalid_" + e.target.name]: undefined,
      });
    }
    console.log(`Input ${e.target.name}: ${e.target.value}`);
    logger.info(`Input ${e.target.name}: ${e.target.value}`);
    this.setState({ [e.target.name]: e.target.value });
  };

  generateNameHandler = (time) => {
    let timer;
    return async (e = new Event()) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const { value } = e.target;
        if (!value) {
          e.target.setCustomValidity("");
          return;
        }
        // validate sppace in group name
        const splitValue = value && value.split(" ");
        if (splitValue && splitValue.length > 1) {
          this.setState({
            ["invalid_" + e.target.name]:
              "Group Name should not contain Spaces.",
          });
          return;
        } else {
          this.setState({
            ["invalid_" + e.target.name]: undefined,
          });
        }
        // validate special character  in group name
        if (value && value.match(/[!<>#%]/)) {
          this.setState({
            ["invalid_" + e.target.name]:
              "Value should not contain !<>#% Characters.",
          });
          return;
        } else {
          this.setState({
            ["invalid_" + e.target.name]: undefined,
          });
        }

        this.setState({ [e.target.name]: e.target.value });
      }, time);
    };
  };

  formSubmit = async (e) => {
    e.preventDefault();
    //Validate owners email id (To Do)
    if (this.state.editMode) {
      console.log(`edit mode is true: ${this.state.editMode}`);
      //Update Group
      // Prepare data for update of group
      const grpData = {
        groupId: this.state.groupId,
        data: {
          description: this.state.groupDescription,
        },
      };

      console.log(`Sending post request to update group`);
      // Send Post request to update a Group
       // SpecialCharacter validation
        var validateFields = validate(grpData);
        if(validateFields.length > 0){
            var message = "";
            for(var i =0; i<validateFields.length; i++){
                var element = document.querySelector(`input[name=${validateFields[i]}]`);
                if(element){
                    message += element.title + ", ";
                }else{
                    message += validateFields[i] + ', ' 
                }
            }
            this.setState({'specialCharacterErr': `Special Character not allowed in field ${message}`});
        }else{
            trackPromise(
                fetch("/mui/updateGroup", {
                  method: "POST",
                  headers: {
                    "Content-type": "application/json",
                  },
                  body: JSON.stringify(grpData),
                })
                  .then((result) => {
                    if (result.status === 404 || result.status === 400) {
                      result.json().then((object) => {
                        this.setState({ resErrMsg: object.errMsg });
                      });
                    } else if (result.status === 200) {
                      this.props.history.push("/mui/groups");
                    }
                  })
                  .catch((err) => {
                    this.setState({ errorMessage: err.message });
                  })
              );
        }
      
    } else {
      // check for unique group name
      const uniqueGroup = await isUniqueGroup(this.state.groupName);
      if (uniqueGroup) {
        //Prepare data for Create Group Post request
        const owners = [this.state.loggedInUserKyndrylEmail];
        // const members = [this.state.loggedInUserKyndrylEmail];
        const grpData = {
          grpName: this.state.groupName,
          grpDescription: this.state.groupDescription,
          owners,
          // members,
        };
        if (this.state.checked) {
          grpData["members"] = [this.state.loggedInUserKyndrylEmail];
        }

        // Send Post request to create a Group
        console.log(`Sending post request to create group`);
        console.log(` group Data to create : ${JSON.stringify(grpData)}`);
         // SpecialCharacter validation
            var validateFields = validate(grpData);
            if(validateFields.length > 0){
                var message = "";
                for(var i =0; i<validateFields.length; i++){
                    var element = document.querySelector(`input[name=${validateFields[i]}]`);
                    if(element){
                        message += element.title + ", ";
                    }else{
                        message += validateFields[i] + ', '
                    }
                }
                this.setState({'specialCharacterErr': `Special Character not allowed in field ${message}`});
            }else{
                trackPromise(
                  fetch("/mui/createGroup", {
                    method: "POST",
                    headers: {
                      "Content-type": "application/json",
                    },
                    body: JSON.stringify(grpData),
                  })
                    .then((result) => {
                      if (result.status === 404 || result.status === 400) {
                        result.json().then((object) => {
                          this.setState({ resErrMsg: object.errMsg });
                        });
                      } else if (result.status === 200) {
                        this.props.history.push("/mui/groups");
                      }
                    })
                    .catch((err) => {
                      this.setState({ errorMessage: err.message });
                    })
                );
            }
      } else {
        this.setState({
          invalid_groupName: "Group name already exists ",
        });
        return;
      }
    }
  };

  async fetchGroupDetails(groupId) {
    console.log(`fetchGroupDetails:: group id : ${groupId}`);
    const response = fetch(`/mui/groupsDetail/${groupId}`);
    trackPromise(response);
    const res = await response;
    if (res.status === 200) {
      const { groupDetail } = await res.json();
      console.log(
        `fetchGroupDetails:: groupDetail : ${JSON.stringify(groupDetail)}`
      );
      const { name, description, _id } = groupDetail;
      this.setState({
        groupName: name,
        groupDescription: description,
        editMode: true,
        groupId: _id,
      });
    }
  }
  getKyndrylEmail(userEmail) {
    console.log(`getting kyndryl email id from ocean email id`);
    if (userEmail) {
      let userToLogin;
      let splitUser = userEmail.split("@");
      if (splitUser[1].toLowerCase() === "ocean.ibm.com") {
        splitUser[1] = "@kyndryl.com";
        userToLogin = splitUser.join("");
        return userToLogin;
      } else if (splitUser[1].toLowerCase() === "kyndryl.com") {
        return userEmail;
      } else return null;
    }
  }
  componentDidMount() {
    //Get LoggedIn User details
    trackPromise(
      fetch("/mui/getUserData")
        .then((res) => {
          return res.json();
        })
        .then((loggedInUser) => {
          this.setState({ loggedInUser });
          this.setState({
            loggedInUserKyndrylEmail: this.getKyndrylEmail(
              this.state.loggedInUser?.loggedIn
            ).toLowerCase(),
          });
        })
        .then((result) => {})
    );

    // If form is opened in Edit Mode, Get group details for
    const searchUrl = this.props.location.search;
    if (searchUrl) {
      const groupdId =
        searchUrl.split("?").length > 1 && searchUrl.split("?")[1];
      console.log(`geoup id for which edit is requested : ${groupdId}`);
      if (groupdId) {
        this.fetchGroupDetails(groupdId);
      }
    }
  }
  setChecked() {
    this.setState({ checked: !this.state.checked });
  }
  render() {
    return (
      <div>
        <div className="headerDiv mainMargin sectionMargin">
          <Breadcrumb header="Groups" links={this.links} />
        </div>
        <section className="sectionMargin mainMargin paddingCostom">
          <Form
            className="formMain"
            onSubmit={(event) => this.formSubmit(event)}
          >
            <TextInput
              labelText={
                <>
                  Group Name <b style={{ color: "red" }}>*</b>
                </>
              }
              placeholder="Group Name"
              name="groupName"
              id="groupName"
              // onChange={(event) => this.handleInputChange(event)}
              onChange={this.generateNameHandler(200)}
              defaultValue={this.state.groupName}
              readOnly={this.state.editMode}
              required
            />
            {this.state["invalid_groupName"] && (
              <small className="danger">
                <b className="errorMsg">{this.state["invalid_groupName"]}</b>
              </small>
            )}
            

            <TextArea
              className="labelFont"
              style={{ marginBottom: "16px" }}
              cols={50}
              rows={5}
              placeholder="Description"
              labelText={<>Description <span className="specialCharacterLabel">(Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | ? ~ are not allowed)</span></>}
              name="groupDescription"
              id="groupDescription"
              // onBlur={(e) => this.handleInputChange(e)}
              onChange={(event) => this.handleInputChange(event)}
              defaultValue={this.state.groupDescription}
            />

            {!this.state.editMode && (
              <Checkbox
                labelText={`Add me as a member`}
                id="checkbox-1"
                checked={this.state.checked}
                onChange={() => this.setChecked()}
              />
            )}
            {
                this.state['specialCharacterErr'] &&
                <small className="fontRed">
                    <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                </small>
            }
            <br></br>
            {!this.state["invalid_email"] && (
              <Button className="addAccBtn addBtnCss addBtnPACss" type="submit">
                Save
              </Button>
            )}
          </Form>
        </section>
      </div>
    );
  }
}
