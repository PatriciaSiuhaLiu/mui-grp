import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Breadcrumb,
  BreadcrumbItem,
  TextInput,
  TableToolbar,
  TableContainer,
  TableToolbarContent,
  TableToolbarSearch,
  DataTable,
} from "carbon-components-react";
import React, { useEffect, useState } from "react";
import { trackPromise } from "react-promise-tracker";
import { Link } from "react-router-dom";

const IncidentParamSettings = (props) => {
  const links = {
    Home: "/mui/home",
    Accounts: "/mui/onboardAccount",
    ServiceManager: `/mui/servicemanager?${props.match.params.accountId}`,
    "Parameter Settings": "/mui/servicemanager/incidentParamSettings",
  };
  const [queryParams, setQueryParams] = useState({});
  const [queryParamsBeforeSave, setQueryParamsBeforeSave] = useState({});
  const [editInputStart, setEditInputStart] = useState(false);
  const [accountCode, setAccountCode] = useState("");
  const [serviceManagerSettingsId, setServiceManagerSettingsId] = useState("");
  const [editMode, setEditMode] = useState(false);

  const getServiceManagerSettings = async () => {
    const responseMUIAccount = fetch(
      `/mui/getMUIAccountData/${props.match.params.accountId}`
    );
    const res = await responseMUIAccount;

    if (res.status === 200) {
      const { muiAccountData } = await res.json();
      setAccountCode(muiAccountData.accountCode);
      const response = await fetch(
        `/mui/servicemanager/serviceManagerSettings/${muiAccountData.accountCode}`
      );
      const { serviceManagerSettings } = await response.json();
      if (serviceManagerSettings && serviceManagerSettings[0]) {
        setServiceManagerSettingsId(serviceManagerSettings[0]._id);
        if (serviceManagerSettings[0].incidentParamNames) {
          setQueryParams(serviceManagerSettings[0].incidentParamNames);
        }
      }
    } else {
      //   return null;
    }
  };

  useEffect(() => {
    getServiceManagerSettings();
  }, []);
  const getDynamiceParamNames = async () => {
    const res = fetch(
      `/mui/servicemanager/getDynamiceParamNames/${accountCode}`
    );
    trackPromise(res);
    const resParams = await res;
    console.log("getDynamiceParamNames");

    if (resParams.status === 200) {
      const { serviceNowParams } = await resParams.json();
      console.log(serviceNowParams);
      return serviceNowParams;
    }
  };
  const generateParamList = async () => {
    // get parameter names from snow
    const serviceNowParamList = await getDynamiceParamNames();
    console.log(`serviceNowParamList: ${JSON.stringify(serviceNowParamList)}`);
    const queryParamKeyValuePair = {};
    for (let param of serviceNowParamList) {
      queryParamKeyValuePair[param] = param;
    }
    const response = await fetch(
      `/mui/servicemanager/serviceManagerSettings/${accountCode}`
    );
    const { serviceManagerSettings } = await response.json();
    if (serviceManagerSettings && serviceManagerSettings[0]) {
      setServiceManagerSettingsId(serviceManagerSettings[0]._id);
      const smSettingsDataPatch = {
        id: serviceManagerSettings[0]._id,
        data: {
          incidentParamNames: queryParamKeyValuePair,
          accountCode
          // isGenerateParam: true,
        },
      };

      trackPromise(
        fetch("/mui/servicemanager/serviceManagerSettings", {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(smSettingsDataPatch),
        })
          .then((result) => {
            if (result.status === 200) {
              console.log(result);
              setQueryParams(queryParamKeyValuePair);
            }
          })
          .catch((err) => {
            // setErrorMessage({errorMessage: err.error});
          })
      );
    }else {


    const smSettingsData = {
      // id: serviceManagerSettingsId,
      data: {
        incidentParamNames: queryParamKeyValuePair,
        accountCode
        // isGenerateParam: true,
      },
    };
    console.log(`smSettingsData`);
    console.log(smSettingsData);
    trackPromise(
      fetch("/mui/servicemanager/serviceManagerSettings", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(smSettingsData),
      })
        .then((result) => {
          if (result.status === 200) {
            console.log(result);
            setQueryParams(queryParamKeyValuePair);
          }
        })
        .catch((err) => {
          // setErrorMessage({errorMessage: err.error});
        })
    );
  }
  };

  const saveQueryParameters = (queryParameterList) => {
    const smSettingsData = {
      id: serviceManagerSettingsId,
      data: { incidentParamNames: queryParameterList },
    };
    console.log(`smSettingsData`);
    console.log(smSettingsData);
    trackPromise(
      fetch("/mui/servicemanager/serviceManagerSettings", {
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(smSettingsData),
      })
        .then((result) => {
          if (result.status === 200) {
            setQueryParams(queryParameterList);
            setEditMode(false);
          }
        })
        .catch((err) => {
          // setErrorMessage({errorMessage: err.error});
        })
    );
  };
  const onEditField = () => {
    setEditMode(true);
  };

  const onEditInputChange = (e, key) => {
    const inputValueBeforeEdit = queryParams[key];
    queryParams[key] = e.target.value;
    if(!editInputStart){
      setQueryParamsBeforeSave({
        ...queryParamsBeforeSave,
        [key]: inputValueBeforeEdit,
      });
      setEditInputStart(true)
    }
  };
  const onBlur = (e) => {
    setEditInputStart(false)
  }

  const onSave = () => {
    saveQueryParameters(queryParams);
  };
  const onCancel = () => {
    for (let key of Object.keys(queryParamsBeforeSave)) {
      queryParams[key] = queryParamsBeforeSave[key];
    }
    setQueryParams(queryParams);
    setEditInputStart(false);
    setEditMode(false);
  };
  const rows = Object.entries(queryParams).map(([key, value], index) => {
    return { id: index, key, value };
  });


  const headers = [
    {
      header: "Field Name",
      key: "key",
    },
    {
      header: "Query Parameter",
      key: "value",
    },
  ];
  const saveCancelButtons = (
    <>
      <Button className="paramStngButtonBtn" onClick={onSave}>
        Save
      </Button>
      <Button className="" onClick={onCancel}>
        Cancel
      </Button>
    </>
  );

  const generateEditButtons = (
    <>
      <Button
        className="paramStngButtonBtn"
        onClick={generateParamList}
      >
        Generate Parameters
      </Button>
      <Button
        className=""
        onClick={onEditField}
      >
        Edit
      </Button>
    </>
  );
  return (
    <div className="headerDiv mainMargin sectionMargin">
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to={links.Home}>Home</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to={links.Accounts}>Accounts</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to={links.ServiceManager}>ServiceManager</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <Link to={links["Parameter Settings"]}>Parameter Settings</Link>
        </BreadcrumbItem>
      </Breadcrumb>

      <section className="sectionMargin mainMargin">
        <DataTable rows={rows} headers={headers}>
          {({
            rows,
            headers,
            getHeaderProps,
            getRowProps,
            getTableProps,
            getToolbarProps,
            onInputChange,
            getTableContainerProps,
          }) => (
            <TableContainer
              title="Query Parameter Settings"
              {...getTableContainerProps()}
            >
              <TableToolbar
                {...getToolbarProps()}
                aria-label=""
              >
                <TableToolbarContent>
                  <TableToolbarSearch onChange={onInputChange} />

                  {editMode ? saveCancelButtons : generateEditButtons}
                </TableToolbarContent>
              </TableToolbar>
              <Table>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader key={header.key}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.key} {...getRowProps({ row })}>

                      <TableCell key={row.cells[0].id}>
                        {row.cells[0].value}
                      </TableCell>
                      <TableCell>
                        {editMode ? (
                          <TextInput
                            labelText=""
                            placeholder=""
                            name="internalFieldName"
                            id="internalFieldName"
                            onChange={(e) =>
                              onEditInputChange(e, row.cells[0].value)
                            }
                            onBlur={(e) => onBlur(e)}
                            defaultValue={row.cells[1].value}
                            required
                          />
                        ) : (
                          row.cells[1].value
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </section>
    </div>
  );
};

export default IncidentParamSettings;
