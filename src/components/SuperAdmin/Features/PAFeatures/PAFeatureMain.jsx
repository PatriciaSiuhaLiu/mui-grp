import React from 'react';
import SAFeaturesList from '../SAFeatures/SAFeatureList';
import { Breadcrumb, BreadcrumbItem, Select, SelectItem  } from 'carbon-components-react';
import {  Link} from 'react-router-dom';
import "./PAfeatures.scss";

class PAFeatureMain extends React.Component {
    constructor(){
        super();
        this.state ={
            allAccounts: [],
            searchVal:''
        };
    }
    async componentDidMount() {
        const accRes$ = fetch("/mui/muiaccounts");
        const accRes = await accRes$;
        if (accRes.status !== 200)
          return this.setState({ errMsg: "failed to fetch accounts" });
    
        const { accounts } = await accRes.json();
    
        this.setState({
          allAccounts: accounts,
        });
      }
  changeAccount = (e) =>{
    const {value} = e.target;
    this.setState({searchVal : value})
  }
  render() {
    return (
        <div className="divContainer">
            <div className="headerDiv sectionMargin  mainMargin">
                <div>
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/mui/home">Home</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <Link to="/mui/paFeatures">Features</Link>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </div>
                <h2 className="headerText">Features</h2>
            </div>
            
            <div className="searchDivPAFeatures">
                <div className="mainHeaderDivPA">
                    <Select 
                        id="accounts"
                        name="accounts"
                        onChange={this.changeAccount}
                        defaultValue=""
                        required
                    >
                        <SelectItem value="all" text="All Accounts" />
                        {
                            this.state.allAccounts.map((acc, i) =>{
                                return <SelectItem value={acc.accountCode} text={acc.accountName} id={i} />
                            })
                        }
                    </Select>
                </div>
            </div>
            <section className="sectionMargin mainMargin paddingCostom">
                <div className="addBtnPADiv">
                </div>
                <SAFeaturesList type="program_admin" searchVal={this.state.searchVal} />
            </section>
        </div>
    );
    }
  }
  export default PAFeatureMain; 