import {
    Button,
    Grid,
    Row,
  } from "carbon-components-react";
  import React, { Component } from "react";
  
  class ButtonsForm extends Component {
    constructor(){
        super();
        this.state ={
            AccData: []
        };
    }
    componentDidMount() {
        fetch('/mui/onboardAccountFormData')
        .then(res => {
            return res.json()
        })
        .then(AccData => { 
            this.setState({ AccData })
        });
    }
    render() {
        var accData = this.state.AccData;
        var submitted = '';
        var btnTag = '';
        if(accData.length !==0){
            var accountsData = accData.accountsData;
            submitted = accountsData.submitted;
            if(submitted){
                btnTag = <div className="btnDivAA">
                            <Button kind='secondary' type="submit" id="cancelTab1" className="btnAA cancelBtn">Cancel</Button>
                            <Button kind='primary' type="submit"    id="continueTab1" className="btnAA continueBtn">Submit</Button>
                        </div>
            }else{
                btnTag = <div className="btnDivAA">
                        <Button kind='secondary' type="submit" id="cancelTab1" className="btnAA cancelBtn">Cancel</Button>
                        <Button kind='primary' type="submit" id="saveTab1" className="btnAA saveBtn">Save</Button>
                        <Button kind='primary' type="submit"    id="continueTab1" className="btnAA continueBtn">Submit</Button>
                    </div>
            }
        }
        return (
            <Grid>
                <Row>  
                    {btnTag}
                </Row>
            </Grid>
        );
    }
  }
  
  export default ButtonsForm;
  