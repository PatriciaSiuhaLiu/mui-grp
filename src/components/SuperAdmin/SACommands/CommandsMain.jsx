import React, { Component } from "react";
import CommandsBreadCrumb from "./CommandsBreadCrumb";
import CommandList from "./CommandList";
import SALandingSidebar from "../SALandingSidebar";

class SuperAdminCommands extends Component {
  state = {};
  links = {
    Home: "/mui/home",
    Commands: "/mui/commands",
  };
  header = "Commands";
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
                <CommandsBreadCrumb header={this.header} links={this.links} />
                <CommandList />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default SuperAdminCommands;
