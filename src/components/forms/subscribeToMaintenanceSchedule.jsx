import {
  Form,
  TextInput,
  Tabs,
  Tab,
  Tooltip,
  RadioButtonGroup,
  RadioButton,
  Checkbox,
  Button,
  Select,
  FileUploader,
  Modal,
  FileUploaderItem,
  Link,
  InlineNotification,
} from "carbon-components-react";
import React, { Component } from "react";
import { trackPromise } from "react-promise-tracker";
import { settings } from "carbon-components";
import { withRouter } from "react-router-dom";
import debounce from "lodash.debounce";
import "./form.scss";
import gsmaImage from "../../images/gsma1.3.png";

const { prefix } = settings;
const _0 = [
  "enableMaintenanceWindow",
  "authType",
  "certFile",
  "certFilePassphrase",
  "instanceType",
  "maintenanceBaseUrl",
];
const _1 = [
  "enableHandlerEvent",
  "handlerBaseUrl",
  "handlerCertFile",
  "handlerAuthUserName",
  "handlerAuthPassword",
];
const _2 = ["workspace", "channelId"];
let formValidationFlag;
let breakLoop;

class SubscribeToMaintenanceSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openRefModal: false,
      showCertDetails: false,
      selectedTab: 0,
      showNotification: false,
      operationMode: "create",
      data: {
        accountCode: "",
        enableMaintenanceWindow: false,
        collaborationTool: "",
        workspace: "",
        channelId: false,
        authType: false,
        certFile: false,
        certFileName: false,
        certFilePassphrase: false,
        enableHandlerEvent: false,
        instanceType: false,
        maintenanceBaseUrl: false,
        handlerBaseUrl: false,
        handlerCertFile: false,
        handlerCertFileName: false,
        handlerAuthUserName: false,
        handlerAuthPassword: false,
      },
      fileUploaderProps: {
        buttonKind: "primary",
        labelTitle: "Upload files",
        labelDescription:
          "Max file size is 100kb. Only .p12 file is supported.",
        buttonLabel: "Upload file",
        size: "default",
        filenameStatus: "edit",
        accept: [".p12"],
        name: "",
        multiple: false,
        iconDescription: "Clear file",
        onChange: this.onFileChange,
        onDelete: this.onFileDelete,
      },
      fileUploadCompleteProps: {
        name: "",
        status: "edit",
        iconDescription: "Clear file",
        onDelete: this.onFileRemove,
        invalid: false,
        errorSubject: "File size exceeds limit",
        errorBody: "100kb max file size. Select a new file and try again.",
        size: "default",
      },
      validationProps: {
        channelIdInvalidProps: {
          className: "errorMsg",
          invalid: false,
          invalidText: "Channel id is required",
        },
        authTypeInvalidProps: {
          className: "errorMsg",
          invalid: false,
          invalidText: "Auth type is required",
        },
        certFilePassphraseInvalidProps: {
          className: "errorMsg",
          invalid: false,
          invalidText: "Field is required",
        },
        instanceTypeInvalidProps: {
          className: "errorMsg",
          invalid: false,
          invalidText: "Instance type is required",
        },
        maintenanceBaseUrlInvalidProps: {
          className: "errorMsg",
          invalid: false,
          invalidText: "Base URL is required",
        },
        enableHandlerEventInvalidProps: {
          className: "errorMsg",
          invalid: false,
          invalidText: "Field is required",
        },
        handlerBaseUrlInvalidProps: {
          className: "errorMsg",
          invalid: false,
          invalidText: "Base URL is required",
        },
        handlerAuthUserNameInvalidProps: {
          className: "errorMsg",
          invalid: false,
          invalidText: "Username is required",
        },
        handlerAuthPasswordInvalidProps: {
          className: "errorMsg",
          invalid: false,
          invalidText: "Password is required",
        },
      },
      notificationProps: {
        kind: "error",
        lowContrast: false,
        role: "alert",
        title: "Error: ",
        subtitle: "",
        iconDescription: "describes the close button",
        statusIconDescription: "describes the status icon",
        hideCloseButton: true,
      },
      handlerFileUploaderProps: {
        buttonKind: "primary",
        labelTitle: "Upload files",
        labelDescription:
          "Max file size is 100kb. Only .pem file is supported.",
        buttonLabel: "Upload file",
        size: "default",
        filenameStatus: "edit",
        accept: [".pem"],
        name: "",
        multiple: false,
        iconDescription: "Clear file",
        onChange: this.onHandlerFileChange,
        onDelete: this.onHandlerFileDelete,
      },
      handlerFileUploadCompleteProps: {
        name: "",
        status: "edit",
        iconDescription: "Clear file",
        onDelete: this.onHandlerFileRemove,
        invalid: false,
        errorSubject: "File size exceeds limit",
        errorBody: "100kb max file size. Select a new file and try again.",
        size: "default",
      },
    };
  }

  tabs = () => ({
    type: "container",
    className: "some-class",
    light: false,
    selected: 0,
    scrollIntoView: true,
    selectionMode: "automatic",
  });

  componentDidMount = () => {
    let code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      trackPromise(
        fetch(`/mui/getMaintenanceWindow?accountCode=${code}`, {
          method: "GET",
        }).then((result) => {
          if (result.status === 200) {
            result.json().then((response) => {
              let { data } = response;

              if (data !== false) {
                this.setState((prevState) => ({
                  data: {
                    ...prevState["data"],
                    ...data,
                  },
                  operationMode: "edit",
                }));

                //show cert details block
                if (data.authType === "cert") {
                  if (data.certFileName) {
                    this.setState({
                      showCertDetails: true,
                    });

                    this.setState((prevState) => ({
                      fileUploadCompleteProps: {
                        ...prevState["fileUploadCompleteProps"],
                        name: data.certFileName,
                      },
                      data: {
                        ...prevState.data,
                        certFile: true,
                        certFileName: data.certFileName,
                      },
                    }));
                  }
                }

                if (data.pemFileName) {
                  this.setState((prevState) => ({
                    handlerFileUploadCompleteProps: {
                      ...prevState["handlerFileUploadCompleteProps"],
                      name: data.pemFileName,
                    },
                    data: {
                      ...prevState.data,
                      handlerCertFile: true,
                      handlerCertFileName: data.pemFileName,
                    },
                  }));
                }
              } else {
                this.setState((prevState) => ({
                  data: {
                    ...prevState["data"],
                    accountCode: code,
                  },
                }));
              }
            });
          }
        })
      );
    }
  };

  changeTabValue = (event) => {
    this.setState({
      selectedTab: event,
    });
  };

  /**
   * @description Removes special character from the string.
   * Only alphanumeric characters are allowed
   * @param {*} input
   * @returns {*} result
   */
  checkForSpecialCharacters = (input) => {
    let regex = "";

    if (this.state.data.collaborationTool.toLowerCase() === "slack") {
      regex = /[^a-z0-9]+/i;
    }

    if (this.state.data.collaborationTool.toLowerCase() === "teams") {
      regex = /[^a-z0-9:@.]+/i;
    }

    const result = input.replace(regex, "");
    return result;
  };

  /**
   * @description Saves input values in data object in state
   * @param {*} event
   */
  handleInputChange = async (event) => {
    let key = event?.target.name;
    let value = event?.target.value;

    if (key === "channelId") {
      let newValue = this.checkForSpecialCharacters(value);
      this.setState((prevState) => ({
        data: {
          ...prevState["data"],
          [key]: newValue.toUpperCase(),
        },
      }));
    }

    if (key === "authType") {
      this.setState((prevState) => ({
        data: {
          ...prevState["data"],
          [key]: value,
        },
      }));

      if (value === "cert") {
        this.setState({
          showCertDetails: true,
        });
      }

      if (value !== "cert") {
        this.setState({
          showCertDetails: false,
        });
      }
    }

    if (key === "certFilePassphrase") {
      this.setState((prevState) => ({
        data: {
          ...prevState["data"],
          [key]: value,
        },
      }));
    }

    if (key === "maintenanceBaseUrl") {
      this.setState((prevState) => ({
        data: {
          ...prevState["data"],
          maintenanceBaseUrl: value,
        },
      }));
    }

    if (key === "handlerBaseUrl") {
      if (value !== "") {
        this.debouncedFetchData(value);
      }

      this.setState((prevState) => ({
        data: {
          ...prevState["data"],
          handlerBaseUrl: value,
        },
      }));
    }

    if (key === "handlerAuthUserName") {
      this.setState((prevState) => ({
        data: {
          ...prevState["data"],
          [key]: value,
        },
      }));
    }

    if (key === "handlerAuthPassword") {
      this.setState((prevState) => ({
        data: {
          ...prevState["data"],
          [key]: value,
        },
      }));
    }
  };

  /**
   * @description Saves file information in data object in state
   * @param {*} event
   */
  onFileChange = (event) => {
    let fileName = event?.target.files[0].name;
    this.setState((prevState) => ({
      data: {
        ...prevState["data"],
        certFile: event?.target.files[0],
        certFileName: fileName,
      },
      fileUploadCompleteProps: {
        ...prevState["fileUploadCompleteProps"],
        name: fileName,
      },
    }));
  };

  /**
   * @description Removes file information from data object in state
   */
  onFileDelete = () => {
    this.setState((prevState) => ({
      data: {
        ...prevState["data"],
        certFile: "",
        certFileName: "",
      },
    }));
  };

  /**
   * @description Removes file information from data object in state
   */
  onFileRemove = () => {
    this.setState((prevState) => ({
      data: {
        ...prevState["data"],
        certFile: false,
        certFileName: false,
      },
    }));
  };

  /**
   * @description Validates all the required input fields.
   * 1. iterates through keys in data object from state
   */
  validateInput = async () => {
    let data = this.state.data;

    let tabIndex = this.state.selectedTab;

    if (tabIndex === 0) {
      if (this.state.data.enableMaintenanceWindow) {
        _0.forEach(async (key) => {
          let props = `${key}InvalidProps`;

          if (key === "maintenanceBaseUrl") {
            let isUrlValid = await this.isUrlValid({
              url: data[key],
            });

            if (isUrlValid) {
              this.toggleButtonFieldsValidation(props, { invalid: false });
            } else {
              this.toggleButtonFieldsValidation(props, { invalid: true });
            }
          } else if (data[key]) {
            console.log(key, "true value: ", data[key]);
            this.toggleButtonFieldsValidation(props, { invalid: false });
          } else {
            console.log(key, "false value: ", data[key]);
            this.toggleButtonFieldsValidation(props, { invalid: true });
          }
        });
      }
    }

    if (tabIndex === 1) {
      if (this.state.data.enableHandlerEvent) {
        _1.forEach(async (key) => {
          let props = `${key}InvalidProps`;

          if (key === "handlerBaseUrl") {
            let isUrlValid = await this.isUrlValid({
              url: data[key],
            });

            if (isUrlValid) {
              this.toggleButtonFieldsValidation(props, { invalid: false });
            } else {
              this.toggleButtonFieldsValidation(props, { invalid: true });
            }
          } else if (data[key]) {
            this.toggleButtonFieldsValidation(props, { invalid: false });
          } else {
            this.toggleButtonFieldsValidation(props, { invalid: true });
          }
        });
      }
    }

    if (tabIndex === 2) {
      _2.forEach(async (key) => {
        let props = `${key}InvalidProps`;

        if (data[key]) {
          console.log(key, "true value: ", data[key]);
          this.toggleButtonFieldsValidation(props, { invalid: false });
        } else {
          console.log(key, "false value: ", data[key]);
          this.toggleButtonFieldsValidation(props, { invalid: true });
        }
      });
    }
  };

  /**
   * @description Toggle invalid property in invalid props for each repective field
   * @param {*} props
   * @param {*} params
   */
  toggleButtonFieldsValidation = async (props, params) => {
    this.setState((prevState) => ({
      validationProps: {
        ...prevState.validationProps,
        [props]: {
          ...prevState.validationProps[props],
          ...params,
        },
      },
    }));
  };

  /**
   * @description Check if form is valid
   *
   */
  checkFormValidation = async (invalidProps) => {
    if (!breakLoop) {
      for (const item in invalidProps) {
        if (typeof invalidProps[item] === "object") {
          this.checkFormValidation(invalidProps[item]);
        } else if (typeof invalidProps[item] === "boolean") {
          if (invalidProps[item]) {
            formValidationFlag = !invalidProps[item];
            breakLoop = true;
          } else {
            formValidationFlag = !invalidProps[item];
          }
        }
      }
    }
  };

  /**
   * @description Validates form and if form is valid data is saved.
   * @param {*} event
   */
  formSubmit = async (event) => {
    event.preventDefault();
    this.toggleErrorNotification(false);
    await this.validateInput();
    let invalidProps = this.state.validationProps;
    formValidationFlag = "";
    breakLoop = "";
    await this.checkFormValidation(invalidProps);

    console.log("Form is valid:", formValidationFlag);
    console.log("data:", this.state.data);

    if (formValidationFlag) {
      this.toggleErrorNotification(false);
      const { operationMode } = this.state;
      let tabIndex = this.state.selectedTab;

      const formData = new FormData();

      if (tabIndex === 0) {
        const {
          accountCode,
          enableMaintenanceWindow,
          authType,
          certFileName,
          certFilePassphrase,
          certFile,
          maintenanceBaseUrl,
          instanceType,
        } = this.state.data;

        formData.append("tabIndex", tabIndex);
        formData.append("accountCode", accountCode);
        formData.append("enableMaintenanceWindow", enableMaintenanceWindow);
        formData.append("authType", authType);

        if (typeof certFile === "object") {
          formData.append("file", certFile, certFileName);
        }

        formData.append("certFilePassphrase", certFilePassphrase);
        formData.append("certFileName", certFileName);
        formData.append("maintenanceBaseUrl", maintenanceBaseUrl);
        formData.append("instanceType", instanceType);
        formData.append("operationMode", operationMode);
      }

      if (tabIndex === 1) {
        const {
          accountCode,
          enableHandlerEvent,
          handlerBaseUrl,
          handlerCertFile,
          handlerCertFileName,
          handlerAuthUserName,
          handlerAuthPassword,
        } = this.state.data;

        formData.append("tabIndex", tabIndex);
        formData.append("accountCode", accountCode);
        formData.append("enableHandlerEvent", enableHandlerEvent);
        formData.append("handlerBaseUrl", handlerBaseUrl);

        if (typeof handlerCertFile === "object") {
          formData.append("file", handlerCertFile, handlerCertFileName);
        }

        formData.append("handlerAuthUserName", handlerAuthUserName);
        formData.append("handlerAuthPassword", handlerAuthPassword);
        formData.append("operationMode", operationMode);
      }

      if (tabIndex === 2) {
        const { accountCode, channelId } = this.state.data;

        formData.append("tabIndex", tabIndex);
        formData.append("accountCode", accountCode);

        if (this.state.data.collaborationTool.toLowerCase() === "slack") {
          formData.append("channelId", channelId);
        }
        if (this.state.data.collaborationTool.toLowerCase() === "teams") {
          formData.append("channelId", channelId.toLowerCase());
        }

        formData.append("operationMode", operationMode);
      }
      trackPromise(
        fetch("/mui/onboardForMaintenanceWindow", {
          method: "POST",
          body: formData,
        }).then((result) => {
          if (
            result.status === 404 ||
            result.status === 400 ||
            result.status === 500
          ) {
            result.json().then((data) => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              this.toggleErrorNotification(true);

              this.setState((prevState) => ({
                notificationProps: {
                  ...prevState["notificationProps"],
                  subtitle: data.error,
                },
              }));
            });
          } else if (result.status === 200) {
            this.props.history.push("/mui/onboardAccount");
          }
        })
      );
    }
  };

  handleCheckboxGsma = (isChecked) => {
    this.setState((prevState) => ({
      data: {
        ...prevState["data"],
        enableMaintenanceWindow: isChecked,
      },
    }));
  };

  handleCheckboxEvent = (isChecked) => {
    this.setState((prevState) => ({
      data: {
        ...prevState["data"],
        enableHandlerEvent: isChecked,
      },
    }));
  };

  handleInstanceType = (value) => {
    this.setState((prevState) => ({
      data: {
        ...prevState["data"],
        instanceType: value,
      },
    }));
  };

  toggleRefModal = async (value) => {
    this.setState({
      openRefModal: value,
    });
  };

  /**
   * @description Toggle showNotification property for inline error notification
   * @param {*} flag
   */
  toggleErrorNotification = (flag) => {
    this.setState((prevState) => ({
      ...prevState,
      showNotification: flag,
    }));
  };

  /**
   * @description Validates URL: If invalid invalidates the URL field for respective button
   * @param {url, invalidPropsIdentifier}
   */
  isUrlValid = async (params) => {
    let { url } = params;

    let expression =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;

    let regex = new RegExp(expression);
    let result = regex.test(url);
    return result;
  };

  /**
   * @description Saves file information in data object in state
   * @param {*} event
   */
  onHandlerFileChange = (event) => {
    let fileName = event?.target.files[0].name;
    this.setState((prevState) => ({
      data: {
        ...prevState["data"],
        handlerCertFile: event?.target.files[0],
        handlerCertFileName: fileName,
      },
      handlerFileUploadCompleteProps: {
        ...prevState["handlerFileUploadCompleteProps"],
        name: fileName,
      },
    }));
  };

  /**
   * @description Removes file information from data object in state
   */
  onHandlerFileDelete = () => {
    this.setState((prevState) => ({
      data: {
        ...prevState["data"],
        handlerCertFile: "",
        handlerCertFileName: "",
      },
    }));
  };

  /**
   * @description Removes file information from data object in state
   */
  onHandlerFileRemove = () => {
    this.setState((prevState) => ({
      data: {
        ...prevState["data"],
        handlerCertFile: false,
        handlerCertFileName: false,
      },
    }));
  };

  fetchData = async (query) => {
    console.log("fetching ", query, new Date());
    trackPromise(
      fetch(`/mui/fetchTicketHandlerData?handlerBaseUrl=${query}`, {
        method: "GET",
      }).then((result) => {
        console.log("result: ", result);
        if (result.status === 200) {
          result.json().then((response) => {
            let { data } = response;

            if (data !== false) {
              let { handlerAuthUserName, handlerAuthPassword, pemFileName } =
                data;
              this.setState((prevState) => ({
                data: {
                  ...prevState["data"],
                  handlerAuthUserName,
                  handlerAuthPassword,
                },
              }));

              if (pemFileName) {
                this.setState((prevState) => ({
                  handlerFileUploadCompleteProps: {
                    ...prevState["handlerFileUploadCompleteProps"],
                    name: pemFileName,
                  },
                  data: {
                    ...prevState.data,
                    handlerCertFile: true,
                    handlerCertFileName: pemFileName,
                  },
                }));
              }
            }
          });
        }
      })
    );
  };

  debouncedFetchData = debounce((query) => {
    this.fetchData(query);
  }, 1000);

  render() {
    if (this.state !== undefined) {
      var inlineNotification = "";
      var instanceType = "";
      var maintenanceBaseUrl = "";
      var channelId = "";
      var workspace = "";
      var maintenanceWindowCheck = "";
      var enableHandlerEvent = "";
      var handlerBaseUrl = "";
      var authType = "";
      var certFile = "";
      var certFileInvalid = "";
      var passphrase = "";
      var submitButton = "";
      var refModal = "";
      var handlerEventInvalid = "";
      var instanceTypeInvalid = "";
      var handlerCertFile = "";
      var handlerAuthUserName = "";
      var handlerAuthPassword = "";

      inlineNotification = (
        <InlineNotification {...this.state.notificationProps} />
      );

      maintenanceWindowCheck = (
        <div className="checkbox displayInlineDIv">
          <Checkbox
            id="enableMaintenanceWindow"
            className="some-class"
            labelText="Enable GSMA Maintenance Window"
            checked={this.state.data.enableMaintenanceWindow}
            onChange={(isChecked) => this.handleCheckboxGsma(isChecked)}
          />
          <Tooltip className="tooltipBG">
            If checked, user can enroll account to receive maintenance window
            updates
          </Tooltip>
        </div>
      );

      workspace = (
        <TextInput
          value={this.state.data.workspace}
          labelText={<>Workspace</>}
          placeholder="Slack Workspace"
          name="workspace"
          id="workspace"
          readOnly
        />
      );

      channelId = (
        <TextInput
          value={
            this.state.data.channelId === false
              ? ""
              : this.state.data.channelId.toString()
          }
          labelText={
            <>
              Channel Id <b style={{ color: "red" }}>*</b>
            </>
          }
          placeholder="Channel Id"
          name="channelId"
          id="channelId"
          onChange={this.handleInputChange}
          {...this.state.validationProps.channelIdInvalidProps}
        />
      );

      instanceType = (
        <div>
          {" "}
          <br />
          <br />
          <RadioButtonGroup
            name="radio-button-group"
            defaultSelected="radio-1"
            valueSelected={this.state.data.instanceType.toString()}
            className="displayInlineDIv"
            legendText={
              <>
                Select Instance Type
                <b style={{ color: "red" }}>*</b>
              </>
            }
            onChange={(value) => {
              this.handleInstanceType(value);
            }}
          >
            <RadioButton labelText="Shared" value="shared" id="radio-1" />
            <RadioButton labelText="Dedicated" value="dedicated" id="radio-2" />
          </RadioButtonGroup>
        </div>
      );

      instanceTypeInvalid = (
        <small className="danger">
          <b className="errorMsg">Instance type is required</b>
          <br />
        </small>
      );

      maintenanceBaseUrl = (
        <TextInput
          value={
            this.state.data.baseUrl === false
              ? ""
              : this.state.data.maintenanceBaseUrl.toString()
          }
          labelText={
            <>
              Base URL <b style={{ color: "red" }}>*</b>
            </>
          }
          placeholder="Please enter only base url. e.g. https://example.com:80"
          name="maintenanceBaseUrl"
          id="maintenanceBaseUrl"
          onChange={this.handleInputChange}
          {...this.state.validationProps.maintenanceBaseUrlInvalidProps}
        />
      );

      authType = (
        <Select
          value={this.state.data.authType.toString()}
          labelText={
            <>
              API Auth Type <b style={{ color: "red" }}>*</b>
            </>
          }
          name="authType"
          className="labelFont"
          id="authType"
          onChange={this.handleInputChange}
          {...this.state.validationProps.authTypeInvalidProps}
        >
          <option className="bx--select-option" value="">
            Select Option
          </option>
          <option className="bx--select-option" value="cert">
            Certificate Authentication
          </option>
          <option disabled className="bx--select-option" value="basic">
            Basic Authentication
          </option>
        </Select>
      );

      if (this.state.data.certFileName) {
        certFile = (
          <div className={`${prefix}--file__container`}>
            <FileUploaderItem {...this.state.fileUploadCompleteProps} />
          </div>
        );
      } else {
        certFile = (
          <div className={`${prefix}--file__container`}>
            <FileUploader {...this.state.fileUploaderProps} />
          </div>
        );
      }

      certFileInvalid = (
        <small className="danger">
          <b className="errorMsg">File is required</b>
          <br />
        </small>
      );

      passphrase = (
        <TextInput
          value={
            this.state.data.certFilePassphrase === false
              ? ""
              : this.state.data.certFilePassphrase.toString()
          }
          labelText={
            <>
              Passphrase <b style={{ color: "red" }}>*</b>
            </>
          }
          placeholder="Passphrase"
          name="certFilePassphrase"
          id="certFilePassphrase"
          onChange={this.handleInputChange}
          {...this.state.validationProps.certFilePassphraseInvalidProps}
        />
      );

      enableHandlerEvent = (
        <div className="checkbox displayInlineDIv">
          <Checkbox
            id="cb"
            labelText="Allow Handler Action In Events"
            className="checkboxClass checkboxClassBG"
            checked={this.state.data.enableHandlerEvent}
            onChange={(isChecked) => this.handleCheckboxEvent(isChecked)}
          />
          &nbsp;&nbsp;&nbsp;
          <Link onClick={() => this.toggleRefModal(true)} className="refModal">
            See example
          </Link>
        </div>
      );

      handlerEventInvalid = (
        <small className="danger">
          <b className="errorMsg">Field is required</b>
          <br />
        </small>
      );

      refModal = (
        <Modal
          modalHeading="Reference"
          passiveModal={true}
          primaryButtonText="Add"
          secondaryButtonText="Cancel"
          open={this.state.openRefModal}
          onRequestClose={() => this.toggleRefModal(false)}
        >
          <p>If checked, user can update tickets in ChatOps ecosystem</p>
          <img src={gsmaImage} alt="ref_image" width={600} height={400} />
        </Modal>
      );

      handlerBaseUrl = (
        <TextInput
          value={
            this.state.data.baseUrl === false
              ? ""
              : this.state.data.handlerBaseUrl.toString()
          }
          labelText={
            <>
              Base URL <b style={{ color: "red" }}>*</b>
            </>
          }
          placeholder="Please enter only base url. e.g. https://example.com:80"
          name="handlerBaseUrl"
          id="handlerBaseUrl"
          onChange={this.handleInputChange}
          {...this.state.validationProps.handlerBaseUrlInvalidProps}
        />
      );

      if (this.state.data.handlerCertFileName) {
        handlerCertFile = (
          <div className={`${prefix}--file__container`}>
            <FileUploaderItem {...this.state.handlerFileUploadCompleteProps} />
          </div>
        );
      } else {
        handlerCertFile = (
          <div className={`${prefix}--file__container`}>
            <FileUploader {...this.state.handlerFileUploaderProps} />
          </div>
        );
      }

      handlerAuthUserName = (
        <TextInput
          value={
            this.state.data.handlerAuthUserName === false
              ? ""
              : this.state.data.handlerAuthUserName.toString()
          }
          labelText={
            <>
              Username: <b style={{ color: "red" }}>*</b>
            </>
          }
          placeholder="Enter username for API authentication"
          name="handlerAuthUserName"
          id="handlerAuthUserName"
          onChange={this.handleInputChange}
          {...this.state.validationProps.handlerAuthUserNameInvalidProps}
        />
      );

      handlerAuthPassword = (
        <TextInput
          value={
            this.state.data.handlerAuthPassword === false
              ? ""
              : this.state.data.handlerAuthPassword.toString()
          }
          labelText={
            <>
              Password: <b style={{ color: "red" }}>*</b>
            </>
          }
          placeholder="Please enter password for API authentication"
          name="handlerAuthPassword"
          id="handlerAuthPassword"
          onChange={this.handleInputChange}
          {...this.state.validationProps.handlerAuthPasswordInvalidProps}
        />
      );

      submitButton = (
        <Button className="PAbtnCommon" type="submit">
          Submit
        </Button>
      );
    }

    return (
      <Tabs {...this.tabs} onSelectionChange={this.changeTabValue}>
        <Tab id="tab-1" label="Maintenance Window" title="Maintenance Window">
          <Form onSubmit={this.formSubmit} className="formMain">
            {this.state.showNotification && inlineNotification}
            {maintenanceWindowCheck}

            {this.state.data.enableMaintenanceWindow && instanceType}
            <br />
            {this.state.data.enableMaintenanceWindow &&
              this.state.validationProps?.instanceTypeInvalidProps?.invalid &&
              instanceTypeInvalid}
            <br />
            {this.state.data.enableMaintenanceWindow && maintenanceBaseUrl}

            {this.state.data.enableMaintenanceWindow && authType}
            {this.state.data.enableMaintenanceWindow &&
              this.state.showCertDetails &&
              certFile}
            {this.state.data.enableMaintenanceWindow &&
              this.state.showCertDetails &&
              this.state.validationProps?.certFileInvalidProps?.invalid &&
              certFileInvalid}
            {this.state.data.enableMaintenanceWindow &&
              this.state.showCertDetails &&
              passphrase}
            {submitButton}
          </Form>
        </Tab>
        <Tab
          id="tab-2"
          label="Allow Handler Action In Events"
          title="Allow Handler Action In Events"
        >
          <Form onSubmit={this.formSubmit} className="formMain">
            {this.state.showNotification && inlineNotification}
            {enableHandlerEvent}
            {refModal}
            <br />
            {this.state.validationProps?.enableHandlerEventInvalidProps
              ?.invalid && handlerEventInvalid}
            <br />
            {this.state.data.enableHandlerEvent && handlerBaseUrl}
            {this.state.data.enableHandlerEvent && <p>Auth Details:</p>}
            <br />

            {this.state.data.enableHandlerEvent && handlerCertFile}
            {this.state.data.enableHandlerEvent && handlerAuthUserName}
            {this.state.data.enableHandlerEvent && handlerAuthPassword}
            {submitButton}
          </Form>
        </Tab>
        <Tab id="tab-3" label="Settings">
          <Form onSubmit={this.formSubmit} className="formMain">
            {this.state.showNotification && inlineNotification}
            {workspace}
            {channelId}
            {submitButton}
          </Form>
        </Tab>
      </Tabs>
    );
  }
}

export default withRouter(SubscribeToMaintenanceSchedule);
