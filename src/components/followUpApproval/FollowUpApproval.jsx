import React, { useState, useEffect } from "react";
import { settings } from "carbon-components";
import { useLocation } from "react-router-dom";
import {
  FileUploader,
  FileUploaderItem,
  Button,
  Form,
  Tabs,
  Tab,
} from "carbon-components-react";
import { withRouter } from "react-router-dom";
import { trackPromise } from "react-promise-tracker";
import { Breadcrumb, BreadcrumbItem } from "carbon-components-react";
import { Link } from "react-router-dom";
import TabularlData from "./TabularData";

const InvalidEntries = {};
const { prefix } = settings;
const FollowUpApproval = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [accountEnabled, setAccountEnabled] = useState(false);
  const [invalidEntries, setInvalidEntries] = useState(InvalidEntries);
  const [errMessage, setErrMessage] = useState(null);
  const [errSubject, setErrSubject] = useState("Invalid File");
  const [fileName, setFileName] = useState("");
  const [inValid, setInValid] = useState(false);
  const [successCssClass, setSuccessCssClass] = useState("");
  const headers = {
    Users: {
      index: "index",
      group: "group",
      user: "user",
      email: "user.email",
    },
    Groups: {
      index: "index",
      name: "name",
      email: "email",
      managerEmail: "manager.email",
    },
  };
  const [filenameStatus, setFileNameStatus] = useState("edit");
  const search = useLocation().search;
  const accountCode = new URLSearchParams(search).get("code");
  const iconDesc = {
    edit: "Clear the file",
    uploading: "File uploading in progress",
    complete: "File uploaded successfully",
  };
  const config = {
    buttonKind: "primary",
    labelTitle: "Upload File for approval Set up",
    labelDescription: "only .xlsx and .xls files are allowed",
    buttonLabel: "Add file",
    filenameStatus: filenameStatus,
    accept: [".xlsx", ".xls"],
    name: "file",
    multiple: false,
    iconDescription: iconDesc[filenameStatus],
    onChange: (event) => {
      const file = event?.target.files[0];
      if (file) {
        setFileName(file.name);
        setSuccessCssClass("");
        const fileExtension = file.name.split(".").pop();
        if (!["xlsx", "xls"].includes(fileExtension)) {
          setErrMessage("Selected is not valid Excel File");
          setErrSubject("Invalid File Type");
          setInValid(true);
          setInvalidEntries(InvalidEntries);
          //fileUploadCompleteProps.name = file.name;
          return;
        }
        setSelectedFile(file);
        setErrMessage();
        setInvalidEntries(InvalidEntries);
        setInValid(false);
        setErrMessage("");
        setFileNameStatus("edit");
      }
    },
    onDelete: (event) => onFileRemove(event),
    size: "default",
  };

  const onFileRemove = () => {
    setSelectedFile();
    setErrMessage();
    setInvalidEntries(InvalidEntries);
    setInValid(false);
    setErrMessage("");
  };

  const fileUploadCompleteProps = {
    name: fileName,
    status: "edit",
    iconDescription: "Clear file",
    onDelete: (event) => onFileRemove(event),
    invalid: inValid,
    errorSubject: errSubject,
    errorBody: errMessage,
    size: "default",
  };

  const onFormSubmit = async (event) => {
    event.preventDefault();
    if (selectedFile) {
      setInvalidEntries(InvalidEntries);
      setErrMessage("");
      setInValid(false);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("accountCode", accountCode);
      setFileNameStatus("uploading");
      trackPromise(
        fetch("/mui/crFollowUpApproval", {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            response.json().then(({ invalidEntries, message }) => {
              const statusCode = response.status;
              const isInvalid = statusCode !== 200 ? true : false;
              setInValid(isInvalid);
              setErrMessage(message);
              if (isInvalid) {
                setFileNameStatus("edit");
                const subject =
                  statusCode === 413 ? "Large File" : "Invalid File";
                setErrSubject(subject);
                if (invalidEntries) {
                  setInvalidEntries(invalidEntries);
                }
              } else {
                // setErrMessage(message);
                setInvalidEntries(InvalidEntries);
                setFileNameStatus("complete");
                setSuccessCssClass("bx--tag bx--tag--green");
              }
            });
          })
          .catch((err) => {
            setErrMessage(err.message);
            setErrSubject("Internal Error");
            setInValid(true);
          })
      );
    }
  };

  useEffect(() => {
    //Runs only on the first render
    trackPromise(
      fetch("/mui/crFollowUpEnableCheck", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountCode }),
      })
        .then((response) => {
          response.json().then(({ isEnabled }) => {
            const enabled = isEnabled ? true : false;
            setAccountEnabled(enabled);
          });
        })
        .catch((err) => {
          setAccountEnabled(false);
        })
    );
  }, [accountCode]);
  return (
    <div className="divContainer">
      <div className="headerDiv sectionMargin  mainMargin">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/mui/home">Home</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Link to="/mui/onboardAccount">Accounts</Link>
          </BreadcrumbItem>
        </Breadcrumb>
        <h2 className="headerText">CR Follow up Email Set up</h2>
      </div>
      <section className="sectionMargin mainMargin">
        {!accountEnabled ? (
          <div>
            <p>Account is not enabled to view the page</p>
          </div>
        ) : (
          <div>
            <Form onSubmit={onFormSubmit} className="formMain">
              <div>
                {inValid ? (
                  <div className={`${prefix}--file__container`}>
                    {<FileUploaderItem {...fileUploadCompleteProps} />}
                  </div>
                ) : (
                  <div
                    className={`${prefix}--file__container ${successCssClass}`}
                  >
                    {errMessage}{" "}
                  </div>
                )}
                <div className={`${prefix}--file__container`}>
                  <FileUploader {...config} />
                </div>
                <Button className="" type="submit">
                  Submit
                </Button>
              </div>
            </Form>
            {Object.keys(invalidEntries).length > 0 ? (
              <section className="sectionMargin mainMargin">
                <div className={`${prefix}--file__container fontRed`}>
                  Invalid Entries in File
                </div>
                <Tabs>
                  {console.log(Object.keys(invalidEntries))}
                  {Object.keys(invalidEntries).map((sheet) => (
                    <Tab id={`tab-${sheet}`} label={sheet}>
                      <div>
                        <TabularlData
                          headers={headers[sheet]}
                          data={invalidEntries[sheet]}
                        />
                      </div>
                    </Tab>
                  ))}
                </Tabs>
              </section>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
};

export default withRouter(FollowUpApproval);
