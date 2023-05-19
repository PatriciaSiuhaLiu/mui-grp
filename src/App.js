import React from 'react';
import './App.scss';
import { BrowserRouter, Switch, Route, withRouter } from 'react-router-dom';
import { Loading } from "carbon-components-react";
// import Home from './components/Home';
import OnboardAccount from './components/OnboardAccount';
import AddAccount from './components/AddAccount';
import WorkspaceTrack from './components/WorkspaceTrack';
import ThanksPage from './components/ThanksPage';
import NoAccess from './components/NoAccess';
import IBM2Kyndryl from './components/IBM2Kyndryl';
import SuperAdminHome from './components/SuperAdmin/SuperAdminHome';
import OnboardAccountPA from './components/OnboardAccountPA';
import OnboardAccountAA from './components/forms/AAForm/OnboardAccountAA';
import UIHeader from './components/common/header/header';
import CommandRegistration from './components/commandRegistration/CommandRegistration';
import AddCommandRegistration from './components/commandRegistration/AddCommandRegistration';
import SuperAdminWorkspace from './components/SuperAdmin/SAWorkspace/SAWorkspaceMain';
import SuperAdminAddWorkspace from './components/SuperAdmin/SAAddWorkspace/SAAddWorkspace';
import SuperAdminEventStreams from './components/SuperAdmin/EventStreams/SAEventStreams/SAEventStreamsMain';
import SAAddEventStreams from './components/SuperAdmin/EventStreams/AddEventStreams/AddEventStreams';
import SuperAdminAssistants from './components/SuperAdmin/Assistants/SAAssistants/SAAssistatnsMain';
import SAAddAssistants from './components/SuperAdmin/Assistants/AddAssistants/AddAssistants';
import SuperAdminIndexChannel from './components/SuperAdmin/IndexChannel/SAIndexChannel/SAIndexChannelMain';
import SAAddIndexChannel from './components/SuperAdmin/IndexChannel/AddIndexChannel/AddIndexChannel';  
import SAGlobalAssignments from './components/SuperAdmin/GlobalAssignment/SAGlobalAssignments/SAGlobalAssignmentsMain';
import SAAddGlobalAssignments from './components/SuperAdmin/GlobalAssignment/AddGlobalAssignments/AddGlobalAssignments';  
import APIKeys from './components/ApiKeys';
import AccountSettings from './components/AccountSettings';
import FollowUpApproval from './components/followUpApproval/FollowUpApproval';
import ExtractTeamIds from './components/teams/ExtractTeamIds';
import EventStreams from './components/EventStreams';
import AddUserForm from './components/forms/addUserForm';
import SuperAdminCommands from './components/SuperAdmin/SACommands/CommandsMain';
import AddCommands from './components/SuperAdmin/SACommands/AddCommands/AddCommand';
import SAFeatureMain from './components/SuperAdmin/Features/SAFeatures/SAFeatureMain';
import PAFeatureMain from './components/SuperAdmin/Features/PAFeatures/PAFeatureMain';
import SAAddFeature from './components/SuperAdmin/Features/AddFeature/AddFeature';
import DRHome from './components/DailyReport/DRHome';
import Services from './components/ServiceKeys/Services';
import ServiceKeys from './components/ServiceKeys/Service-keys';
import AddService from './components/ServiceKeys/Add-Service';
import AddKey from './components/ServiceKeys/Add-Key';
import MaintenanceSchedule from './components/SubscribeToMaintenanceSchedule';

import SAAnsibleInstances from './components/SuperAdmin/AnsibleInstance/SAAnsibleInstances/SAAnsibleInstancesMain';
import SAAddAnsibleInstances from './components/SuperAdmin/AnsibleInstance/AddAnsibleInstances/AddAnsibleInstances';  

// import ReqHome from './components/ISTogether/Requester/RequesterMain';
// import VolunteerHome from './components/ISTogether/Volunteer/VolunteerMain';
// import AdminHome from './components/ISTogether/Admin/AdminMain';
import WebhooksHome from './components/Webhooks/WebhookMain';
import WebhookForm from './components/Webhooks/AddWebhook';
// import ReqHome from './components/ISTogether/Requester/RequesterMain';
// import VolunteerHome from './components/ISTogether/Volunteer/VolunteerMain';
// import AdminHome from './components/ISTogether/Admin/AdminMain';
import GroupsHome from './components/groups/GroupsHome';
import GroupDetails from './components/groups/GroupDetails';
import CreateGroup from './components/groups/CreateGroup';
import ServiceManagerHome from './components/ServiceManager/ServiceManagerHome';
import CreateSMRules from './components/ServiceManager/CreateSMRules';
import IncidentParamSettings from './components/ServiceManager/IncidentParamSettings';
import EditSMRules from './components/ServiceManager/EditSMRules';


// -------------MUI Redesign component import----------------------
import MUIHome from './components/MUIRedesign/MUIHome';
import MUIHeader from './components/MUIRedesign/MUIHeader';
import MUIFooter from './components/MUIRedesign/MUIFooter';
import MUIAccountProfile from './components/MUIRedesign/AccountProfile';
import MUIITSMIntegration from './components/MUIRedesign/ITSMIntegration';
import MUIIncidentManagement from './components/MUIRedesign/IncidentManagement';
import MUIAnsibleIntegration from './components/MUIRedesign/AnsibleIntegration';
import MUIAssignments from './components/MUIRedesign/MUIAssignments';
import MUIInsights from './components/MUIRedesign/MUIInsights';
import MUIDashboard from './components/MUIRedesign/MUIDashboard';
import MUIIndexChannel from './components/MUIRedesign/ProgramAdmin/IndexChannel';
import MUIChatPlatform from './components/MUIRedesign/ProgramAdmin/ChatPlatform';




const Home = React.lazy(() => import('./components/Home'));
const  ReqHome= React.lazy(() => import('./components/ISTogether/Requester/RequesterMain'));
const  VolunteerHome= React.lazy(() => import('./components/ISTogether/Volunteer/VolunteerMain'));
const  AdminHome= React.lazy(() => import('./components/ISTogether/Admin/AdminMain'));
function App() {
    return (
      <div>
        <React.Suspense fallback={<span><Loading withOverlay={true} description="loading..." /></span>}>
        <BrowserRouter>
            {/* <UIHeader /> */}
            <MUIHeader />
            <Switch>
                {/* Home page */}
                <Route path="/mui/home" render={() => <Home/>} />
                {/* Requester Form page */}
                <Route path="/mui/teamit/requester" render={() => <ReqHome/>} /> 
                 <Route path="/mui/teamit/editReqDetails" render={() => <ReqHome/>} />
                 {/* Volunteer Form page */}  
                 <Route path="/mui/teamit/volunteer" render={() => <VolunteerHome/>} />
                 {/* Admin page */}
                 <Route path="/mui/teamit/admin" render={() => <AdminHome/>} />
                {/* Account list page for AA with Datatable*/}
                <Route path='/mui/onboardAccount' component={()=><OnboardAccount/>} />
                {/* Account list page for PA with Datatable*/}
                <Route path='/mui/addAccount' component={AddAccount} /> 
                {/* SA landing page */} 
                <Route path='/mui/superAdmin'  component={SuperAdminHome} /> 
                {/* Add account form page for PA */}
                <Route path='/mui/addAccountDetails' component={()=><OnboardAccountPA/>}  />
                {/* Subscribe to maintenance schedule*/}
                <Route path='/mui/subscribeToMaintenanceSchedule' component={()=><MaintenanceSchedule/>}  />
                {/* edit account form page for PA */}
                <Route path='/mui/editAccountDetails' component={()=><OnboardAccountPA/>} />
                {/* Onboard Account form page */}
                <Route path='/mui/onboardAccountDetails' component={()=><OnboardAccountAA/>}  />
                {/* Command Registraion page */}
                <Route path='/mui/commandRegistraton' component={()=><CommandRegistration/>}  />
                {/* Add Command Registraion page */}
                <Route path='/mui/addCommandRegistraton' component={()=><AddCommandRegistration/>}  />
                {/* Generate API Key */}
                <Route path='/mui/api-keys/:id' component={APIKeys} />
                {/* Account Settings */}
                <Route path='/mui/account-settings/:id' component={AccountSettings} />
                {/*New pge for Account based event streams*/}
                <Route path='/mui/event-streams/:id' component={()=><EventStreams/>} />
                {/* SA Workspace page */}
                <Route path='/mui/workspaces'  component={()=><SuperAdminWorkspace/>}  />
                {/* SA Add Workspace page */}
                <Route path='/mui/addWorkspaces'  component={()=><SuperAdminAddWorkspace/>}  />
                {/* SA EventStreams page */}
                <Route path='/mui/eventStreams'  component={()=><SuperAdminEventStreams/>}  />
                {/* SA Add EventStreams page */}
                <Route path='/mui/addEventStreams'  component={()=><SAAddEventStreams/>}  />
                {/* SA Assistants page */}
                <Route path='/mui/assistants'  component={()=><SuperAdminAssistants/>}  />
                {/* SA Add Assistant page */}
                <Route path='/mui/addAssistants'  component={()=><SAAddAssistants/>}  />
                {/* AddUserForm page */}
                <Route path='/mui/register' component={()=><AddUserForm/>} />
                <Route path='/mui/workspace-exception-registration' component={WorkspaceTrack} />                          
                <Route path='/mui/thankyou' component={ThanksPage} />     
                <Route path='/mui/notAuthorized' component={NoAccess} />     
                {/* SA Commands page */}        
                <Route path='/mui/commands' component={SuperAdminCommands} />
                {/* SA Add Commands page */}
                <Route path='/mui/add-command' component={AddCommands} />
                {/* IBM2Kyndryl transition page */} 
                <Route path='/mui/IBMToKyndryl' component={IBM2Kyndryl} />    
                {/* SA Index Channel page */}
                <Route path='/mui/indexChannels'  component={()=><SuperAdminIndexChannel/>}  />
                {/* SA Add Index Channel page */}
                <Route path='/mui/addIndexChannel'  component={()=><SAAddIndexChannel/>}  />         
                {/* SA Global Assignments page */}
                <Route path='/mui/globalAssignments'  component={()=><SAGlobalAssignments/>}  />
                {/* SA Add Global Assignments page */}
                <Route path='/mui/addGlobalAssignments'  component={()=><SAAddGlobalAssignments/>}  />         
                {/* SA Feature page */}
                <Route path='/mui/features'  component={()=><SAFeatureMain/>}  />
                {/* SA Feature page */}
                <Route path='/mui/paFeatures'  component={PAFeatureMain} exact  />
                {/* SA Add Feature page */}
                <Route path='/mui/addFeature'  component={()=><SAAddFeature/>}  />      
                {/* Daily Reports Home page */}
                <Route path='/mui/dailyReporting'  component={()=><DRHome/>}  />     
                <Route path='/mui/addFeature'  component={()=><SAAddFeature/>}  />  
                 {/* Service Key Page */}
                <Route path='/mui/services' component={Services} />  
                {/* Service Key Page */}           
                <Route path='/mui/service-keys' component={ServiceKeys} /> 
                {/* Add Services Page */}            
                <Route path='/mui/add-service' component={AddService} />   
                 {/* Add Key Page */}            
                <Route path='/mui/add-serviceKey' component={AddKey} />
                <Route path='/mui/cr-approval-followup' component={FollowUpApproval} /> 
                <Route path='/mui/extract-team-ids' component={ExtractTeamIds} /> 
                
                <Route path='/mui/groups' component={GroupsHome} exact />       
                 {/* Groups Detail Page */}            
                 <Route path='/mui/groups/groupdetails/:id' component={GroupDetails}/>       
                 {/* Add Group Page */}            
                 <Route path='/mui/groups/create' component={CreateGroup}/> 
                <Route path='/mui/ansibleInstance'  component={()=><SAAnsibleInstances/>}  />   
                <Route path='/mui/addAnsibleIntances'  component={()=><SAAddAnsibleInstances/>}  />         
                <Route path='/mui/servicemanager'  component={()=><ServiceManagerHome/>}  exact/>         
                <Route path='/mui/servicemanager/create/:accountId'  component={CreateSMRules}  />         
                <Route path='/mui/servicemanager/editRule/:accountId'  component={EditSMRules}  />         
                <Route path='/mui/servicemanager/incidentParamSettings/:accountId'  component={IncidentParamSettings}  />         

                 {/* Requester Form page */}
                 {/* <Route path='/mui/teamit/requester'  component={()=><ReqHome/>}  />  */}
                 {/* <Route path='/mui/teamit/editReqDetails' component={()=><ReqHome/>} />    */}
                 {/* Volunteer Form page */}
                 {/* <Route path='/mui/teamit/volunteer'  component={()=><VolunteerHome/>}  />     */}
                 {/* Admin page */}
                 <Route path='/mui/teamit/admin'  component={()=><AdminHome/>}  />    
                  <Route path='/mui/webhooks/:id' component={()=><WebhooksHome/>} /> 
                  <Route path='/mui/addWebhook/:id' component={()=><WebhookForm/>} /> 
                 {/* <Route path='/mui/teamit/admin'  component={()=><AdminHome/>}  />     */}



                {/* <<<<<<<---------------------------------MUI Redesign Routes----------------------------------------->>>>>>>> */}
                {/* Home page */}
                <Route path="/mui/MUIHome" render={() => <MUIHome/>} />
                <Route path="/mui/MUIAccountProfile" render={() => <MUIAccountProfile/>} />
                <Route path="/mui/MUIITSMIntegration" render={() => <MUIITSMIntegration/>} />
                <Route path="/mui/MUIIncidentManagement" render={() => <MUIIncidentManagement/>} />
                <Route path="/mui/MUIAnsibleIntegration" render={() => <MUIAnsibleIntegration/>} />
                <Route path="/mui/MUIAssignments" render={() => <MUIAssignments/>} />
                <Route path="/mui/MUIInsights" render={() => <MUIInsights/>} />
                <Route path="/mui/MUIDashboard" render={() => <MUIDashboard/>} />
                <Route path="/mui/MUIAddIndexChannel" render={() => <MUIIndexChannel/>} />
                <Route path="/mui/MUIChatPlatform" render={() => <MUIChatPlatform/>} />
                 
            </Switch>
            <MUIFooter />
       </BrowserRouter>
       </React.Suspense>
      </div>
    );
  }
  
  export default App;
  