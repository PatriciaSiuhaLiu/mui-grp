
import React, { Component } from 'react';
  import ReactDOM from "react-dom";
  import {
    Modal,
    Button,
    FormGroup,
    TextInput,
    Form,
    ModalWrapper
  } from "carbon-components-react";
  import "../form.scss";
  import { Add32  } from "@carbon/icons-react";
  import { TrashCan32   } from "@carbon/icons-react";
  import { trackPromise } from "react-promise-tracker";
//   class AddWorkspace extends Component{
  class AddWorkspace extends Component {
    constructor(){
        super();
        this.state ={
            display: '',
        };
    }
    cancelModal = (e) => {
        e.preventDefault();
        // this.props.cancelModal();
        this.setState({
            display: 'none',
        })
        // this.props.nextStep();
    }
    render() {
        var wrapper = "";
        if(this.state){
            wrapper = this.state.display;
        }
      return (
        <div className='popup' >
            {/* <div data-modal id="modal-addWorkspace" className="bx--modal popup" role="dialog"  */}
                    {/* aria-modal="true" aria-labelledby="modal-addWorkspace-label" aria-describedby="modal-addWorkspace-heading" tabindex="-1"> */}
                    <div className="bx--modal-container modal-css">
                        <div className="bx--modal-header">
                            <p className="bx--modal-header__label bx--type-delta" id="modal-addWorkspace-label">Optional label</p>
                            <p className="bx--modal-header__heading bx--type-beta" id="modal-addWorkspace-heading">Modal heading</p>
                            <button className="bx--modal-close" type="button" data-modal-close aria-label="close modal" >
                                <TrashCan32 className="iconEditSize" aria-label="Delete Rule" title="Delete Rule"/>
                                {/* <svg focusable="false" preserveAspectRatio="xMidYMid meet" style="will-change: transform;" xmlns="http://www.w3.org/2000/svg" className="bx--modal-close__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M12 4.7L11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3 4.7 12 8 8.7 11.3 12 12 11.3 8.7 8z"></path></svg> */}
                            </button>
                        </div>

                        <div className="bx--modal-content" >
                            <Form>
                                <TextInput
                                    className="bx--text-input bx--text__input"
                                    id="adminName"
                                    labelText="Slack Workspace Admin Name"
                                    placeholder="Slack Workspace Admin Name"
                                />
                                <br />
                    
                                <TextInput
                                    className="bx--text-input bx--text__input"
                                    id="adminEmail"
                                    labelText="Slack Workspace Admin Email"
                                    placeholder="Slack Workspace Admin Email"
                                />
                                <br />
                    
                                <TextInput
                                    className="bx--text-input bx--text__input"
                                    id="workspaceSigningSecret"
                                    labelText="Workspace Signing Secret"
                                    placeholder="Workspace Signing Secret"
                                />
                                <br />
                    
                                <TextInput
                                    className="bx--text-input bx--text__input"
                                    id="xoxptoken"
                                    labelText="Workspace xoxp Token"
                                    placeholder="Workspace xoxp Token"
                                />
                                <br />
                    
                                <TextInput
                                    className="bx--text-input bx--text__input"
                                    id="xoxbtoken"
                                    labelText="Workspace xoxb Token"
                                    placeholder="Workspace xoxb Token"
                                />
                            </Form>
                        </div>
                        <div className="bx--modal-content--overflow-indicator"></div>

                        <div className="bx--modal-footer">
                            <Button kind="secondary" className="addWorkspace" onClick={this.cancelModal} > 
                                Cancel
                            </Button>
                            <Button kind="primary" className="addWorkspace" onClick={e => {this.saveWorkspace();}}> 
                                Add Workspace
                            </Button>
                            {/* <button className="bx--btn bx--btn--secondary" type="button" data-modal-close>Cancel</button> */}
                            {/* <button className="bx--btn bx--btn--primary" type="button"   data-modal-primary-focus>Add Workspace</button> */}
                        </div>
                    </div>
                    <span tabindex="0"></span>
                </div> 
          
      );
    }
  }


  export default AddWorkspace;


