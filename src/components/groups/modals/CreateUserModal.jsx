import {
    Button,
    ComposedModal,
    Form,
    ModalBody,
    ModalFooter,
    TextInput,
  } from "carbon-components-react";
  import React, { Component } from "react";
  import { Close32 } from "@carbon/icons-react";
  import validator from "validator";
  
  export default class CreateUserModal extends Component {
    constructor() {
        super();
        this.state = { 
            email: '',
            invalid_email:''
        };
    }
    closeModal() {
        this.setState({email: ''},() => {
          this.setState({invalid_email:''},()=>{
            this.props.onCloseModal();
          });
        });
    }
  
    addUser() {
      let isValid = true;
      let userEmailList = [];
      if(this.state.email.indexOf(',')> -1){
        userEmailList = this.state.email.split(',');
      } else {
        userEmailList.push(this.state.email);
      }

      for (const userEmail of userEmailList) {
        if(!this.validateUserEmail(userEmail.trim())){
          this.setState({
                invalid_email:
                  "Invalid email or email domain.",
              });
          isValid = false;
          return;
        }
      }
      if(isValid){
        this.props.onSaveUser(this.state.email);
        this.setState({email: ''});
      }
    }
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
        e.target.value &&
        e.target.value.match(/[!<>#%]/)
      ) {
        this.setState({
          ["invalid_" + e.target.name]:
            "Email should not contain !<>#% Characters.",
        });
        return;
      }
      // Validate User email for kyndryl Domain
      const enterprises = ["kyndryl.com", "onmicrosoft.com" ];
      let splitUser = e.target.value.split("@");
      const matchEnterprises = enterprises.some(enterprise => 
        splitUser[1].toLowerCase().includes(enterprise)
      );
      // if (splitUser && splitUser[1].toLowerCase() !== "kyndryl.com") {
      if (splitUser && !matchEnterprises) {
        this.setState({
          ["invalid_" + e.target.name]:
            "Invalid email domain.",
        });
        return;
      }else {
        this.setState({
          ["invalid_" + e.target.name]: undefined,
        });
      }
      let userList = [];
      if(e.target.value.indexOf(',')> -1){
        userList = e.target.value.split(',');
      } else {
        userList.push(e.target.value);
      }
    // let userList = e.target.value.split(',');
    for (const userEmail of userList) {
      if(!this.validateUserEmail(userEmail.trim())){
        this.setState({
              ["invalid_" + e.target.name]:
                "Invalid email or email domain.",
            });
        return;
      } else {
        this.setState({
          ["invalid_" + e.target.name]:''
        });
      }
    }
    // let splitUser = e.target.value.split("@");
    // if (splitUser && splitUser[1].toLowerCase() !== "kyndryl.com") {
    //   this.setState({
    //     ["invalid_" + e.target.name]:
    //       "Invalid email domain.",
    //   });
    //   return;
    // }else {
    //   this.setState({
    //     ["invalid_" + e.target.name]: undefined,
    //   });
    // }
      this.setState({ [e.target.name]: e.target.value });
    };

    validateUserEmail = (userEmail) => {
      let isValidEmail = true;
      let allowedDomains = ["kyndryl.com", "onmicrosoft.com" ];
      let splitUser = userEmail.split('@');
      const matchEnterprises = allowedDomains.some(enterprise => 
        splitUser[1].toLowerCase().includes(enterprise)
      );
      if(userEmail && !validator.isEmail(userEmail)){
        isValidEmail = false;
      } else if (splitUser && !matchEnterprises) {
        isValidEmail = false;
      }
      return isValidEmail;
    }
    checkValidEmail = ((userList)=>{
      const emailList = userList.split(',');
      let isValid = true;
      for (const userEmail of emailList) {
        if(!this.validateUserEmail(userEmail.trim())){
          isValid = false;
        }
      }
      return isValid;
    });
    render() {
      const { isModalOpen } = this.props;
      var email = this.state.email;
      return(
            <div>
                {this.props.isModalOpen ? (
                    <div className="popup">
                    <div className="bx--modal-container modal-css">
                        <div className="bx--modal-header modalHeaderCss">
                            <button className="bx--modal-close" type="button" data-modal-close aria-label="close modal" > 
                                <Close32 className="iconEditSize" onClick={() => this.closeModal()} />
                            </button>
                        </div>
                        <div className="bx--modal-content">
                            <Form>
                                <TextInput
                                    labelText={
                                        <>
                                        Email Address <b style={{ color: "red" }}>*</b>
                                        </>
                                    }
                                    placeholder="Email Address"
                                    name="email"
                                    className="modalText"
                                    onChange={(e) => this.handleInputChange(e)}
                                    defaultValue=''
                                    onKeyDown={(e)=>{
                                      if(e.key === 'Enter'){
                                        e.preventDefault();
                                        if(this.checkValidEmail(e.target.value)){
                                          this.addUser();
                                        }
                                      }
                                    }}
                                    required
                                />
                                {/* <TextInput className="bx--text-input bx--text__input labelDeleteCSS" id={assistantsIdToDelete} name="delete" defaultValue='' labelText="Please type DELETE to complete this action" placeholder="Delete Assistant" onBlur={this.handleInputChange} /> */}
                            </Form>
                            {this.state["invalid_email"] && (
                                <small className="danger">
                                <b className="errorMsg">{this.state["invalid_email"]}</b>
                                </small>
                            )}
                        </div>
                        <div className="bx--modal-content--overflow-indicator"></div>
                        <div className="bx--modal-footer">
                        <Button kind="secondary" className="btnSACss" onClick={() => this.closeModal()}>Cancel</Button>
                        <Button kind='primary' onClick={() => this.addUser()} type="submit" className="btnSACss" >Add </Button>
                        </div>
                    </div>
                    <span tabindex="0"></span>
                    </div>
                 ) : null}
            </div>
      );
    }
  }
  