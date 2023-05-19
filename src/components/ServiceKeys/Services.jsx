import {
  Button,
  ComposedModal,
  Link,
  ModalBody,
  OverflowMenu,
  OverflowMenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from "carbon-components-react";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { trackPromise } from "react-promise-tracker";
import { withRouter } from "react-router-dom";
import BreadCrumb from "../SuperAdmin/SACommands/CommandsBreadCrumb";

class Services extends Component {
  header = "Services";
  links = {
    Home: "/mui/home",
    Services: "/mui/services",
  };
  tableHeaders = [
    "Service Name",
    "Service Description",
    "Status",
    "Service Created At (UTC)",
    "",
  ];
  colors = {
    approved: "green",
    rejected: "red",
    pending: "cyan",
  };
  state = {
    serviceData: [],
    modalOpen: false,
    modalData: {},
    users: []
  };
  getAllServiceKeys = async () => {
    const res$ = fetch("/mui/registeredService");
    trackPromise(res$);
    const res = await res$;
    if (res.status == 200) {
      const { serviceData } = await res.json();
      serviceData &&
        this.setState({
          serviceData,
        });
        this.getUserAccess();
    }
  };

  gotoServiceKeyPage = (id) => () => {
    let url = "/mui/service-keys";
    if (id) url += `?id=${id}`;
    this.props.history.push(url);
  };
  gotoWebhookPage = (id) => () => {
    let url = "/mui/webhooks";
    if (id) url += `/${id}`;
    this.props.history.push(url);
  };

  gotoAddServiceForm = (id) => () => {
    let url = "/mui/add-service";
    if (id) url += `?id=${id}`;
    this.props.history.push(url);
  };

  getUserAccess = () => {
    trackPromise(
      fetch("/mui/getUserAccess")
        .then((res) => {
          return res.json();
        })
        .then((users) => {
          this.setState({ users });
        })
    );
  }

  componentDidMount() {
    this.getAllServiceKeys();
  }

  closeModal = () => this.setState({ modalOpen: false });

  getServiceInfo = (index) => () => {
    this.setState({
      modalOpen: true,
      modalData: this.state.serviceData[index],
    });
  };

  render() {
    var isAccAdmin = this.state.users;

    
    var userObj = isAccAdmin.userAccessData;
    return (
      <div className="divContainer">
        <div className="headerDiv sectionMargin  mainMargin">
          <BreadCrumb header={this.header} links={this.links} />
        </div>
        <section className="sectionMargin mainMargin">
          <div className="searchDivMain my-2">
            <Link class="addBtnPACss" to="/mui/addAccountDetails">
              <Button
                className="addAccBtn addBtnCss addBtnPACss"
                onClick={this.gotoAddServiceForm()}
              >
                Add Service
              </Button>
            </Link>
          </div>
          <Table overflowMenuOnHover={true}>
            <TableHead>
              <TableRow>
                {this.tableHeaders.map((header) => (
                  <TableHeader key={header}>{header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.serviceData.map((service, i) => (
                <TableRow key={service._id}>
                  <TableCell onClick={this.getServiceInfo(i)}>
                    <a>{service.SourceIdentificationCode}</a>
                  </TableCell>
                  <TableCell>{service.SourceDescription}</TableCell>
                  <TableCell>
                    <Tag type={this.colors[service.status]}>
                      {service.status}
                    </Tag>
                  </TableCell>
                  <TableCell>{service.date}</TableCell>
                  <TableCell>
                    {service.status !== "pending" && (
                      <OverflowMenu title="Options">
                        {userObj && service.owner
                        .map((a) => { return a.toLowerCase() })
                        .includes(userObj.user.toLowerCase()) && (
                          <OverflowMenuItem
                            className="overflowMenuClass"
                            itemText="Edit Service"
                            onClick={this.gotoAddServiceForm(service._id)}
                          />
                        )}
                        {service.status !== "rejected" && (
                          <OverflowMenuItem
                            className="overflowMenuClass"
                            itemText="Service Keys"
                            onClick={this.gotoServiceKeyPage(service._id)}
                          />
                        )}
                        <OverflowMenuItem
                            className="overflowMenuClass"
                            itemText="Webhook"
                            onClick={this.gotoWebhookPage(service._id)}
                        />
                      </OverflowMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!this.state.serviceData.length && (
            <div className="App">
              <p>No records found</p>
            </div>
          )}
          {this.state.serviceData.length && typeof document === "undefined"
            ? null
            : ReactDOM.createPortal(
                <ComposedModal
                  open={this.state.modalOpen}
                  onClose={this.closeModal}
                >
                  <ModalBody className="my-2 py-2" hasScrollingContent={true}>
                    <div>
                      <p>Description:</p>
                      {this.state.modalData.SourceDescription}
                    </div>
                    <br />
                    <div>
                      <p>Created At:</p>
                      <Tag>
                        {this.state.modalData.date &&
                          new Date(this.state.modalData.date).toUTCString()}
                      </Tag>
                    </div>
                    <br />
                    <div>
                      <p>Owners:</p>
                      {this.state.modalData.owner &&
                        this.state.modalData.owner.map((id) => (
                          <Tag key={id}>{id}</Tag>
                        ))}
                    </div>
                    <br />

                    <div>
                      <p>Collaborators</p>
                      {this.state.modalData.collaborator &&
                        this.state.modalData.collaborator.map((id) => (
                          <Tag key={id}>{id}</Tag>
                        ))}
                    </div>
                  </ModalBody>
                </ComposedModal>,
                document.body
              )}
        </section>
      </div>
    );
  }
}

//export default withServices;
export default withRouter(Services);
