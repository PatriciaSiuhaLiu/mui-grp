// AddCommandRegistration
import React, { Component } from "react";
import CommandsBreadCrumb from "../CommandsBreadCrumb";
import AddCommandForm from "./AddCommandForm";
import SALandingSidebar from "../../SALandingSidebar";

class AddCommands extends Component {
  state = {};
  links = {
    Home: "/mui/home",
    Commands: "/mui/commands",
    "Add Commands": "/mui/add-commands",
  };
  header = "Add Command";
  render() {
    return (
      <div className="divContainer">
        <section className="sectionGrid">
          <div class="bx--grid padding0">
            <div class="rowWidth">
              <div class="gridColulmnWidth3">
                <SALandingSidebar />
              </div>
              <div
                class="gridColumn13"
                style={{
                  maxWidth: "20% !important",
                  paddingRight: "0 !important",
                }}
              >
                <CommandsBreadCrumb links={this.links} header={this.header} />
                <AddCommandForm />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default AddCommands;
