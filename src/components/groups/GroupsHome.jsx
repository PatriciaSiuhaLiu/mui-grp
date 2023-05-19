import React, { Component } from "react";
import { Link } from "react-router-dom";
import { trackPromise } from "react-promise-tracker";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "carbon-components-react";
import { Edit32,  TrashCan32 } from "@carbon/icons-react";
import Breadcrumb from "../SuperAdmin/SACommands/CommandsBreadCrumb";
import ReactDOM from "react-dom";
import DeleteModal from "./modals/DeleteModal";

export default class GroupsHome extends Component {
  state = {
    loggedInUser: "",
    groupData: [],
    isSuperAdminUser: false,
    emailID: "",
    deleteGroupId: "",
    deleteGroupName: "",
    isDeleteModalOpen: false,
  };
  headers = ["Group Name", "Description", "Owner", "Administrator", "", ""];
  links = {
    Home: "/mui/home",
    Groups: "/mui/groups",
  };

  getAllGroups = async () => {
    const res$ = fetch("/mui/groupsForUser");
    trackPromise(res$);
    const res = await res$;
    if (res.status === 200) {
      const { groupData, isSuperAdmin } = await res.json();
      if (groupData) {
        const groupList = groupData.map((grpDB) => {
          const editable = grpDB.owners?.includes(this.state.emailID);
          const group = {};
          group._id = grpDB._id;
          group.groupName = grpDB.name;
          group.groupDescription = grpDB.description;
          group.owner = grpDB.owners?.toString();
          group.admin = grpDB.administrators?.toString();
          group.editable = editable;
          return group;
        });
        groupList &&
          this.setState({
            groupData: groupList,
            isSuperAdminUser: isSuperAdmin
          });
      }
    }
  };

  getKyndrylEmail(userEmail) {
    if (userEmail) {
      let userToLogin;
      let splitUser = userEmail.split("@");
      if (splitUser[1].toLowerCase() === "ocean.ibm.com") {
        splitUser[1] = "@kyndryl.com";
        userToLogin = splitUser.join("");
        return userToLogin;
      } else if (splitUser[1].toLowerCase() === "kyndryl.com") {
        return userEmail;
      } else return null;
    }
  }

  componentDidMount() {
    trackPromise(
      fetch("/mui/getUserData")
        .then((res) => {
          return res.json();
        })
        .then((loggedInUser) => {
          this.setState({ loggedInUser });
          this.setState({
            emailID: this.getKyndrylEmail(this.state.loggedInUser?.loggedIn).toLowerCase(),
          });
        })
        .then((result) => {})
    );
    this.getAllGroups();
  }

  createGroup() {}
  openDeleteModal = (groupId, groupName) => {
      
    this.setState({
      isDeleteModalOpen: true,
      deleteGroupId: groupId,
      deleteGroupName: groupName,
    });
  };
  onDeletModalCancel = () => {
    this.setState({ isDeleteModalOpen: false });
  };
  onDeletModalConfirm = () => {
    // get group id from state
    
    const groupData = {
      toDeleteID: this.state.deleteGroupId,
    };
    
    //  pass this group id for deleteion
    trackPromise(
      fetch("/mui/deleteGroup", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(groupData),
      }).then((result) => {
        if (result.status === 200) {
          this.onDeletModalCancel();
          this.getAllGroups();
        }
      })
    );
  };
  render() {
    const editGroupIcon = (
      <Edit32 className="iconEditSize editIconPA" aria-label="Add" />
    );
    let deleteRow = (
      <TrashCan32 className="iconEditSize editIconPA" aria-label="Delete" />
    );
    const enabled = {
      cursor: "pointer",
    };

    const disabled = {
      cursor: "not-allowed",
      opacity: "50%",
      hover: "none",
    };
    let rows = this.state.groupData.map((group) => {
      let redirectUrl = `/mui/groups/create?${group._id}`;
      return (
        <TableRow key={group._id}>
          <TableCell>
            <Link to={`/mui/groups/groupdetails/${group._id}`} style={{color: "#0f62fe"}}>
              <p>{group.groupName}</p>
            </Link>
          </TableCell>
          <TableCell>{group.groupDescription}</TableCell>
          {/* <TableCell>{group.loggedInUserRole}</TableCell> */}
          <TableCell><p className="ellipsis">{group.owner}</p></TableCell>
          <TableCell><p className="ellipsis">{group.admin}</p></TableCell>
          <TableCell>
            {group.editable ? (
              <Link id={group._id} to={redirectUrl}>
                {editGroupIcon}
              </Link>
            ) : (
              <p style={disabled}>{editGroupIcon}</p>
            )}
          </TableCell>
          <TableCell>
            <div
              id={group.id}
              onClick={() => this.openDeleteModal(group._id, group.groupName)}
              style={group.editable ? enabled : disabled}
            >
              {deleteRow}
            </div>
          </TableCell>
        </TableRow>
      );
    });
    return (
      <div>
        <div className="headerDiv mainMargin sectionMargin">
          <Breadcrumb header="Groups" links={this.links} />
        </div>
        <section className="sectionMargin mainMargin">
          {this.state.isSuperAdminUser && (
            <div className="searchDivMain my-2">
              <Link class="addBtnPACss" to="/mui/groups/create">
                <Button
                  className="addAccBtn addBtnCss addBtnPACss"
                  onClick={this.createGroup()}
                >
                  Create Group
                </Button>
              </Link>
            </div>
          )}

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
        </section>
        {typeof document === "undefined"
          ? null
          : ReactDOM.createPortal(
              <DeleteModal
                groupId={this.state.deleteGroupId}
                isModalOpen={this.state.isDeleteModalOpen}
                onDeleteCancel={() => this.onDeletModalCancel()}
                onDeleteConfrim={() => this.onDeletModalConfirm()}
                modalText={`Group ${this.state.deleteGroupName}`}
              />,
              document.body
            )}
      </div>
    );
  }
}

