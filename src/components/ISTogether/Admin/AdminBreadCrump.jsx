import React from 'react';
import ReactDOM from 'react-dom';
import { Breadcrumb, BreadcrumbItem, Button,UnorderedList, ListItem  } from 'carbon-components-react';
import { Link, withRouter } from 'react-router-dom';
import { trackPromise } from "react-promise-tracker";
class AdminBreadCrump extends React.Component {
    // constructor(props) {
    //     super(props);
    //     this.state = (
    //         {
    //             data: '',
    //         }
    //     );
    // }
    // componentDidMount() {
    //     const search = this.props.location.search;
    //     const recordId = new URLSearchParams(search).get("id");
    //     this.setState({recordId: recordId})
    //     trackPromise(
    //         fetch("/mui/getCIOUserData?id="+recordId)
    //         .then((res) => {
    //             return res.json();
    //         })
    //         .then((cioUserData) => {
    //             var dateFormat = cioUserData.cioUserData.weekDayName;
    //             this.setState({ date:dateFormat });
    //         })
    //     );
    // }
  render() {
    //   var date = this.state.date;
    return (
        <div className="breadCrumpDiv headerDiv sectionMargin  mainMargin">
            {/* <Breadcrumb>
                <BreadcrumbItem>
                    <Link to="/mui/home">Home</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                    <Link to="/mui/dailyReporting">Report</Link>
                </BreadcrumbItem>
            </Breadcrumb> */}
            <h2 className="headerText">Admin</h2>
        </div>
    );
  }
}
export default withRouter(AdminBreadCrump);