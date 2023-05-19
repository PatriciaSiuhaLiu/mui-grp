import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "carbon-components-react";
  import React, { Component } from "react";
  import ReactDOM from "react-dom";
  // import DeleteGroupModal from "./modals/DeleteGroupModal";
  import { RowDelete32 , TrashCan32} from "@carbon/icons-react";
  import DeleteModal from "./modals/DeleteModal";
  import { UserTypes } from "./ChatopsGroupUtil";
  
  export default class UserList extends Component {
    headers = ["Email Address", ""];
    state = {
      isDeleteModalOpen: false,
      userToDelete: "",
      userType: "",
    };
    openDeleteModal = (userToDelete) => {
      this.setState({ isDeleteModalOpen: true, userToDelete });
    };
  
    onDeletModalCancel = () => {
      this.setState({ isDeleteModalOpen: false });
    };
    onDeletModalConfirm = () => {
      console.log("Email id  to be delete is : ", this.state.userToDelete);
      this.setState({ isDeleteModalOpen: false });
      //  pass this user email to modify the list for deleteion
      this.props.deleteUsers(this.state.userToDelete, this.state.userType);
    };
  
    componentDidMount() {
      this.setState({ user: this.props.users, userType: this.props.userType });
    }
    render() {
      let deleteRow = (
        <TrashCan32 className="iconEditSize editIconPA" aria-label="Delete" />
      );
      const delete__enabled = {
        cursor: "pointer",
      };
  
      const delete__disabled = {
        cursor: "not-allowed",
        opacity: "50%",
        hover: "none",
      };
  
      let deleteStyle;
  
      switch (this.props.loggedInUserType) {
        case UserTypes.owner:
          if(this.props.users.length <= 1 && this.props.tab === UserTypes.owner){
            deleteStyle = delete__disabled ;
          }else {
            deleteStyle = delete__enabled
          }
          
          break;
        case UserTypes.admin:
          if (
            this.state.userType === UserTypes.admin ||
            this.state.userType === UserTypes.member
          ) {
            deleteStyle = delete__enabled;
          }else{
            deleteStyle = delete__disabled
          }
          break;
        case UserTypes.member:
          deleteStyle = delete__disabled
          break;
  
        default:
          deleteStyle = delete__disabled
          break;
      }
      let rows = this.props.users?.map((user) => {
        return (
          <TableRow key={user}>
            <TableCell>{user}</TableCell>
            <TableCell style={{ width: "25%" }}>
              <div
                onClick={() => this.openDeleteModal(user)}
                style={deleteStyle}
              >
                {deleteRow}
              </div>
            </TableCell>
          </TableRow>
        );
      });
      return (
        <div>
          <Table>
            <TableHead>
              <TableRow>
                {this.headers.map((header) => (
                  <TableHeader key={header}>{header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
          </Table>
          {!this.props.users.length && (
            <div className="App">
              <p>No records found</p>
            </div>
          )}
          {typeof document === "undefined"
            ? null
            : ReactDOM.createPortal(
                <DeleteModal
                  isModalOpen={this.state.isDeleteModalOpen}
                  onDeleteCancel={() => this.onDeletModalCancel()}
                  onDeleteConfrim={() => this.onDeletModalConfirm()}
                  modalText={`User ${this.state.userToDelete}`}
                />,
                document.body
              )}
        </div>
      );
    }
  }
  