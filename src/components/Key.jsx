import React, { Component } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  Column,
  CopyButton,
  Grid,
  Row,
  TextInput,
  Checkbox
} from "carbon-components-react";
import {
  Copy32,
  Information32,
  Reset32,
  TrashCan32,
} from "@carbon/icons-react";
import { trackPromise } from "react-promise-tracker";

class Key extends Component {
  state = {
    keyName: "",
    keyValue: "",
    // allowPlainAuth: false
  };

  componentDidMount() {
    this.setState({
      ...this.props.keyObj,
    });
  }
  saveAuth(name, event) {
    this.setState({
        [event.target.name]: event.target.checked,
      });
      const saveAuthData = {
        allowApi: event.target.checked,
        acc_id: this.props.accountCode,
        keyName: this.state.keyName
      };
      trackPromise( fetch("/mui/saveAuth",
      {
        method: "POST",
        headers: {
                "Content-type": "application/json",
              },
        body: JSON.stringify(saveAuthData),
      }).then(async (result) => {
            if (result.status == 200) {
              const { retrievedData } = await result.json();
               this.setState({
                ...retrievedData,
              });
            }
      })
       
      );
  
      
  };
  reGenerateKey = async () => {
    const { keyName } = this.state;
    const { accountCode, onRegenerateKey } = this.props;
    const payload = {
      accCode: accountCode,
      keyName: keyName,
    };
    let res = fetch(`/mui/reGenerateCKKey`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    trackPromise(res);

    res = await res;

    const { data } = await res.json();
    const newKey = data.keys[keyName];

    this.setState({
      keyValue: newKey,
    });
    onRegenerateKey(newKey);
  };

  render() {
    const { accountCode, getInfo, onDelete } = this.props;
    const { keyName, keyValue, allowPlainAuth } = this.state;
    return (
        <div>
            <Row>
                <Column>
                    <p className="externalLink" >
                        Click <a className="externalLinkClass" href="https://kyndryl.sharepoint.com/sites/ChatOps/SitePages/ChatOps-APIS.aspx" target="_blank" rel="noopener noreferrer" >HERE</a> to know more about using signed payload
                    </p>                      
                </Column>
            </Row>
            <Row>
                <Column>
                <div className="width80 p-2 shadow center">
                    <Accordion>
                    <AccordionItem title={keyName}>
                        <Grid>
                        <Row>
                            <Column lg={3}>
                                <div className="display-inline-flex">
                                    <TextInput
                                    labelText="Key Name"
                                    id="keyName"
                                    defaultValue={keyName}
                                    readOnly
                                    />
                                    <div className="mx-2 pt-18">
                                    <CopyButton
                                        onClick={() => {
                                        navigator.clipboard.writeText(keyName);
                                        }}
                                    />
                                    </div>
                                </div>
                            </Column>
                            <Column lg={3}>
                            <div className="display-inline-flex">
                                <TextInput
                                labelText="Source Id"
                                id="sourceid"
                                defaultValue={accountCode}
                                readOnly
                                />
                                <div className="mx-2 pt-18">
                                <CopyButton
                                    onClick={() => {
                                    navigator.clipboard.writeText(accountCode);
                                    }}
                                />
                                </div>
                            </div>
                            </Column>
                            <Column lg={4}>
                            <TextInput
                                labelText="API key"
                                id="apiKey"
                                defaultValue={keyValue}
                                readOnly
                            />
                            </Column>
                            <Column lg={2}>
                            <div>
                                <br />
                            </div>
                            <div className="display-inline-flex pt-25">
                                <Button
                                kind="ghost"
                                renderIcon={Copy32}
                                iconDescription="Copy to clipboard"
                                hasIconOnly
                                onClick={() => {
                                    navigator.clipboard.writeText(keyValue);
                                }}
                                />
                                <Button
                                kind="ghost"
                                renderIcon={Reset32}
                                iconDescription="Regenerate Key"
                                hasIconOnly
                                onClick={this.reGenerateKey}
                                />
                                <Button
                                kind="ghost"
                                renderIcon={TrashCan32}
                                iconDescription="Delete"
                                hasIconOnly
                                onClick={onDelete}
                                />
                                <Button
                                kind="ghost"
                                renderIcon={Information32}
                                iconDescription="Click to see more information"
                                hasIconOnly
                                onClick={getInfo}
                                />
                                <div className="">
                                    <Checkbox
                                        labelText="Allow auth via API key [Less Secure]"
                                        id={"allowPlainAuth_" + keyName}
                                        name={keyName}
                                        // defaultChecked={allowPlainAuth} 
                                        checked={this.state.allowPlainAuth}
                                        onClick={(event) => { this.saveAuth('checkbox-1', event)}}
                                    />
                                </div>
                            </div>
                            </Column>
                        </Row>
                        </Grid>
                    </AccordionItem>
                    </Accordion>
                </div>
                </Column>
            </Row>
        </div>
    );
  }
}

export default Key;
