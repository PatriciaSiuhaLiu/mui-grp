import React,{useState} from 'react';
import ReactDOM from "react-dom";
import { Add24 } from "@carbon/icons-react";
import {
    Column,
    Form,
    Grid,
    Row,
    Select,
    SelectItem,
    TextInput,
    Button,
    ComposedModal,
    ModalBody,
    ModalHeader
  } from "carbon-components-react";

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

  const AddChatPlatform = (props) => {
    const withStateManagerProps = {
        className: "onboardBtn",
        modalHeading: "Add Chat Platform",
        primaryButtonText: "Submit",
        secondaryButtonText: "Cancel",
      };
      const { size, ...rest } = withStateManagerProps;
      const [chatplatformData, setChatplatformData] = useState({
        platformName:'',
        platformType:'',
        URL:'',
        token:'',
        defaultWorkspace:'',
        channelType:''
    });
      const handleChange = (e) => {
        const {name, value} = e.target;
        chatplatformData[name] = value;
        setChatplatformData(chatplatformData);
      }
      return(
        <ModalStateManager
            renderLauncher={({ setOpen }) => (
            <Button
                onClick={() => {
                    setChatplatformData({
                        platformName:'',
                        platformType:'',
                        URL:'',
                        token:'',
                        defaultWorkspace:'',
                        channelType:''
                    });
                    setOpen(true);
                }}
            >Add Chat Platform</Button>
        )}
        >
            {({ open, setOpen }) => (
                <ComposedModal 
                    aria-label="Add Chat Platform"
                    {...rest}
                    size={size || undefined}
                    open={open}
                    className="chatPlatformModal"
                    onRequestClose={() => setOpen(false)} 
                    onRequestSubmit={(e) => {
                        props.addChatPlatform(chatplatformData);
                        setOpen(false);
                    }}>
                    <ModalHeader>Add Chat Platform</ModalHeader>
                    <ModalBody hasForm>
                        <Form onSubmit={() => {
                            props.addChatPlatform(chatplatformData);
                            setOpen(false);}
                        }>
                            <Grid>
                                <Row>
                                    <Column lg={6}>
                                        <TextInput
                                            id="platformName"
                                            name="platformName"
                                            labelText={<>Name</>}
                                            placeholder="Name"
                                            onChange={handleChange} 
                                            required
                                            defaultValue="" 
                                        />
                                    </Column>
                                    <Column lg={6}>
                                        <Select
                                            id="platformType"
                                            name="platformType"
                                            labelText={<>Type</>}
                                            placeholder="Chat platform type"
                                            onChange={handleChange}
                                            defaultValue={chatplatformData.platformType}
                                            required
                                        >
                                            <SelectItem
                                                hidden
                                                value=""
                                                text="Choose Chat Platform Type"
                                            />
                                            <SelectItem
                                                value="MS Teams"
                                                text="MS Teams"
                                            />
                                            <SelectItem
                                                value="Slack"
                                                text="Slack"
                                            />
                                        </Select>
                                    </Column>
                                </Row>
                                <Row>
                                    <Column lg={12}>
                                        <TextInput
                                            id="URL"
                                            name="URL"
                                            labelText={<>URL</>}
                                            placeholder="URL"
                                            onChange={handleChange}
                                            defaultValue=""
                                            required
                                        />
                                    </Column>
                                    <Column lg={2}>
                                    </Column>
                                </Row>
                                <Row>
                                    <Column lg={12}>
                                        <TextInput
                                            id="token"
                                            name="token"
                                            labelText={<>Token</>}
                                            placeholder="token"
                                            onChange={handleChange} 
                                            defaultValue=""
                                            required
                                        />
                                    </Column>
                                </Row>
                                <Row>
                                    <Column lg={6}>
                                        <Select
                                            id="defaultWorkspace"
                                            name="defaultWorkspace"
                                            labelText={<>Default Workspace / Teams</>}
                                            placeholder="Default Workspace / Teams"
                                            onChange={handleChange} 
                                            defaultValue={chatplatformData.defaultWorkspace}
                                            required
                                        >
                                            <SelectItem
                                                hidden
                                                value=""
                                                text="Choose Default workspace"
                                            />
                                            <SelectItem
                                                value="Test - Global"
                                                text="Test - Global"
                                            />
                                            <SelectItem
                                                value="Chatops - Teams"
                                                text="Chatops - Teams"
                                            />
                                        </Select>
                                    </Column>
                                    <Column lg={6}>
                                        <Select
                                            id="channelType"
                                            name="channelType"
                                            labelText={<>Channel Type</>}
                                            placeholder="Channel Type"
                                            onChange={handleChange} 
                                            defaultValue={chatplatformData.channelType}
                                            required
                                        >
                                            <SelectItem
                                                hidden
                                                value=""
                                                text="Choose Channel Type"
                                            />
                                            <SelectItem
                                                value="Private"
                                                text="Private"
                                            />
                                            <SelectItem
                                                value="Public"
                                                text="Public"
                                            />
                                        </Select>
                                    </Column>
                                
                                </Row>
                                <Row>
                                    <Column lg={7}></Column>
                                    <Column lg={2}>
                                        <Button type='button' onClick={()=> setOpen(false)}>Cancel</Button>
                                    </Column> 
                                    <Column lg={1}></Column>
                                    <Column lg={2}><Button type='Submit'>Submit</Button></Column>
                                </Row>
                            </Grid>
                        </Form>
                    </ModalBody>
                </ComposedModal>
            )}
        </ModalStateManager>
      )

  }

  export default AddChatPlatform;