import React, { Component } from "react";
import ReactDOM from "react-dom";
import Breadcrumb from "../SuperAdmin/SACommands/CommandsBreadCrumb";
import { Tabs, Tab, Button, Form } from "carbon-components-react";
import { trackPromise } from "react-promise-tracker";
import UserList from "./UserList";
import CreateUserModal from "./modals/CreateUserModal";
import { isUniqueGroupUser, UserTypes } from "./ChatopsGroupUtil";

const AddUserButton = ({ buttonText, onAddUserClick, userType }) => {
  return (
    <div className="searchDivMain my-2">
      <Button
        className="addAccBtn  addBtnPACss"
        onClick={() => onAddUserClick(userType)}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default class GroupDetails extends Component {
  links = {
    Home: "/mui/home",
    Groups: "/mui/groups",
    "Group Detail": "/mui/groupDetails",
  };
  state = {
    groupId: "",
    name: "",
    description: "",
    owners: [],
    administrators: [],
    members: [],
    isAdmin: false,
    isOwner: false,
    isMember: false,
    isModalOpen: false,
    memberAdded: false,
    modalData: [],
    addUserButtonText: "",
    loggedInUserKyndrylEmail: "",
    userType: "",
    loggedInUserType: "",
    deleteEnableAdmin: false,
    deleteEnableOwner: false,
    deleteEnableMember: false,
    invalidMember: "",
    isUserValid: true,
    uniqueGroupUser: true
  };

  async fetchGroupDetails() {
    const response = fetch(`/mui/groupsDetail/${this.props.match.params.id}`);
    trackPromise(response);
    const res = await response;
    if (res.status === 200) {
      const { groupDetail } = await res.json();
      const { name, description, owners, members, administrators } =
        groupDetail;
      let loggedInUserType,
        deleteEnableAdmin,
        deleteEnableOwner,
        deleteEnableMember;
      const isAdmin = administrators?.some(
        (admin) => admin === this.state.loggedInUserKyndrylEmail.toLocaleLowerCase()
      );

      const isOwner = owners?.some(
        (owner) => owner === this.state.loggedInUserKyndrylEmail.toLocaleLowerCase()
      );

      const isMember = members?.some(
        (member) => member === this.state.loggedInUserKyndrylEmail.toLocaleLowerCase()
      );
      if (isOwner) {
        loggedInUserType = UserTypes.owner;
        deleteEnableOwner = true;
      } else if (isAdmin) {
        loggedInUserType = UserTypes.admin;
        deleteEnableAdmin = true;
      } else {
        loggedInUserType = UserTypes.member;
        deleteEnableMember = true;
      }

      this.setState({
        groupId: this.props.match.params.id,
        name,
        description,
        owners,
        members,
        administrators,
        isAdmin,
        isMember,
        isOwner,
        loggedInUserType,
        deleteEnableAdmin,
        deleteEnableOwner,
        deleteEnableMember,
      });
    }
  }
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
            loggedInUserKyndrylEmail: this.getKyndrylEmail(
              this.state.loggedInUser?.loggedIn
            ).toLowerCase(),
          });
        })
        .then((result) => {})
    );
    this.fetchGroupDetails();
  }

  componentDidUpdate() {
  }

  addUser(userType) {
    this.setState({ isModalOpen: true, userType });
    // this.setState({ email: '' });
  }
  closeModal() {
    this.setState({ isModalOpen: false, memberAdded: true });
  }

 async saveUser(emailUserList) {
   console.log(`SaveUser-user email: ${emailUserList}`);
   let emailList = [];
   if(emailUserList.indexOf(',')> -1){
    emailList = emailUserList.split(',');
  } else {
    emailList.push(emailUserList);
  }
   
   let userData = {};
   let data = {};
   for(const usrEmail of emailList){
    const userEmail = usrEmail.toLowerCase();
    let apiData = {
      emailId: userEmail.trim(),
    };

    if( !process.env.skip_blue_group_check){
      const response = await fetch("/mui/validateGroupUser", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(apiData),
        })
      const result = await response.json();
      this.setState({
            invalidMember: result.fetchError,
            isUserValid: result.validEmail,
      });  
    }
    if(this.state.isUserValid){
      const uniqueGroupUser = await isUniqueGroupUser(this.state.groupId, userEmail.trim(), this.state.userType);
      this.setState(
        {
          uniqueGroupUser:uniqueGroupUser,
          invalidUserEmail:userEmail
        }
      )
    }
    if (this.state.isUserValid && this.state.uniqueGroupUser) {
      // Prepare data to  update users
      let updatedUsers = [];
      switch (this.state.userType) {
        case UserTypes.owner:
          updatedUsers =
            this.state.owners && this.state.owners.length > 0
              ? [...this.state.owners, userEmail.trim()]
              : [userEmail];
          data["owners"] = updatedUsers;
          this.setState(data);
          break;
        case UserTypes.admin:
          updatedUsers =
            this.state.administrators && this.state.administrators.length > 0
              ? [...this.state.administrators, userEmail.trim()]
              : [userEmail];
          data["administrators"] = updatedUsers;
          this.setState(data);
          break;
        case UserTypes.member:
          updatedUsers =
            this.state.members && this.state.members.length > 0
              ? [...this.state.members, userEmail.trim()]
              : [userEmail];
          data["members"] = updatedUsers;
          this.setState(data);
          break;

        default:
          break;
      }
    }
   }
   userData = {
    groupId: this.state.groupId,
    data,
  };
  // Send Post request to update a Group
  trackPromise(
    fetch("/mui/updateGroup", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((result) => {
        if (result.status === 404 || result.status === 400) {
          result.json().then((object) => {
            this.setState({ resErrMsg: object.errMsg });
          });
        } else if (result.status === 200) {
          this.setState(data);
        }
      })
      .catch((err) => {
        this.setState({ errorMessage: err.message });
      })
  );
  this.setState({ isModalOpen: false, memberAdded: true  });
    
   
    // this.setState({ memberAdded: true });
    // return true
  }
  removeUser(users, userToRemove) {
    const index = users.indexOf(userToRemove);
    if (index > -1) {
      users.splice(index, 1);
    }
    return users;
  }
  deleteUserFromList(email, userType) {
    const userDataUpdate = {};
    // Update userList
    switch (userType) {
      case UserTypes.owner:
        userDataUpdate["owners"] = this.removeUser(this.state.owners, email);
        break;

      case UserTypes.admin:
        userDataUpdate["administrators"] = this.removeUser(
          this.state.administrators,
          email
        );
        break;

      case UserTypes.member:
        userDataUpdate["members"] = this.removeUser(this.state.members, email);
        break;

      default:
        break;
    }
    if (userDataUpdate && Object.keys(userDataUpdate) !== 0) {
      // call api to update group with updated user list
      // Prepare data for update of group
      const userData = {
        groupId: this.state.groupId,
        data: userDataUpdate,
      };

      // Send Post request to update a Group
      trackPromise(
        fetch("/mui/updateGroup", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(userData),
        })
          .then((result) => {
            if (result.status === 404 || result.status === 400) {
              result.json().then((object) => {
                this.setState({ resErrMsg: object.errMsg });
              });
            } else if (result.status === 200) {

              this.setState(userDataUpdate);
              // this.props.history.push("/mui/groups");
            }
          })
          .catch((err) => {
            this.setState({ errorMessage: err.message });
          })
      );

      this.setState({ isModalOpen: false });
    }
  }

  render() {
    return (
      <div>
        <div className="headerDiv mainMargin sectionMargin">
          <Breadcrumb header="Groups" links={this.links} />
        </div>
        <section className="sectionMargin mainMargin">
          <div>
            <Form style={{ fontWeight: 500, margin: "1rem 0" }}>
              <h5>
                Group Name:{" "}
                <span style={{ fontWeight: "normal" }}>{this.state.name}</span>
              </h5>
              <h5>
                Description:{" "}
                <span style={{ fontWeight: "normal" }}>
                  {this.state.description}{" "}
                </span>{" "}
              </h5>
            </Form>
          </div>
          {!this.state.isUserValid && this.state.invalidMember.length > 0 && (
            <small className="danger">
              <b className="errorMsg">{this.state.invalidMember}</b>
            </small>
          )}
          {!this.state.uniqueGroupUser && (
             <small className="danger">
             <b className="errorMsg">User email {this.state.invalidUserEmail} already exists</b>
           </small>
          )

          }
          <Tabs type="container">
            <Tab id="owners" label="Owners">
              {this.state.isOwner && (
                <AddUserButton
                  buttonText="Add Owner"
                  userType={UserTypes.owner} //
                  onAddUserClick={(type) => this.addUser(type)}
                />
              )}

              {this.state.owners ? (
                <UserList
                  users={this.state.owners}
                  userType={UserTypes.owner}
                  loggedInUserType={this.state.loggedInUserType}
                  deleteEnable={this.state.deleteEnableOwner}
                  tab={UserTypes.owner}
                  deleteUsers={(email, userType) =>
                    this.deleteUserFromList(email, userType)
                  }
                />
              ) : null}
            </Tab>
            <Tab id="admin" label="Administrators">
              {(this.state.isAdmin || this.state.isOwner) && (
                <AddUserButton
                  buttonText="Add Admin"
                  userType={UserTypes.admin} //
                  onAddUserClick={(type) => this.addUser(type)}
                />
              )}
              {this.state.administrators ? (
                <UserList
                  userType={UserTypes.admin}
                  users={this.state.administrators}
                  loggedInUserType={this.state.loggedInUserType}
                  deleteEnable={this.state.deleteEnableAdmin}
                  tab={UserTypes.admin}
                  deleteUsers={(email, userType) =>
                    this.deleteUserFromList(email, userType)
                  }
                />
              ) : null}
            </Tab>
            <Tab id="member" label="Members" title="Members">
              {(this.state.isAdmin || this.state.isOwner) && (
                <AddUserButton
                  buttonText="Add Member"
                  userType={UserTypes.member}
                  onAddUserClick={(type) => this.addUser(type)}
                />
              )}
              {this.state.members ? (
                <UserList
                  userType={UserTypes.member}
                  users={this.state.members}
                  loggedInUserType={this.state.loggedInUserType}
                  deleteEnable={this.state.deleteEnableMember}
                  tab={UserTypes.member}
                  deleteUsers={(email, userType) =>
                    this.deleteUserFromList(email, userType)
                  }
                />
              ) : null}
            </Tab>
          </Tabs>
          {typeof document === "undefined"
            ? null
            : ReactDOM.createPortal(
                <CreateUserModal
                  isModalOpen={this.state.isModalOpen}
                  onCloseModal={() => this.closeModal()}
                  onSaveUser={(userEmail) => this.saveUser(userEmail)}
                  addUserButtonText={this.state.addUserButtonText}
                />,
                document.body
              )}
        </section>
      </div>
    );
  }
}
