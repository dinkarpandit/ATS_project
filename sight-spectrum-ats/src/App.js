import { useEffect } from "react";
import Login from "./Login";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import EmployeeListing from "./pages/ManageEmployee";
import SubmissionListing from "./pages/SubmissionListing";
import CandidateListing from "./pages/CandidateListing";
import EditEmployee from './pages/EditEmployee';
import EditCandidate from './pages/EditCandidate';
import EditDemand from './pages/EditDemand'
import EditClient from './pages/EditClient'
import UC from "./pages/UC";
import UC1 from "./pages/UC1";
import { ThemeProvider } from '@fluentui/react';
import { UserProvider } from './contexts/UserProvider'
import { darkTheme } from './themes'
import Layout from "./Layout";
import DemandListing from "./pages/DemandListing";
import MyDemands from './pages/MyDemands'
import MySubmissions from './pages/MySubmissions'
import TrackSubmission from "./pages/TrackSubmission";
import ClientListing from "./pages/ManageClient";
import SkillListing from "./pages/ManageSkill";
import EditSkill from './pages/EditSkill';
import VendorListing from "./pages/ManageVendor";
import EditVendor from './pages/EditVendor';
import Dashboard from "./pages/Dashboard";
import LogReport from "./pages/LogReport";
import BdeDashboard from "./pages/BdeDashboard";
import EditLeadModel from "./pages/EditLeadModal";
import SubmissionApproval from "./pages/SubmissionApproval";
import MyCandidate from './pages/MyCandidate';
// hooks 
import { useLocationPath } from '../src/hooks/useLocationPath'
import ViewSubmission from "./pages/ViewSubmission";
import Reset from "./ResetPassword";
import ManagePipeline from "./pages/ManagePipeline";
import EditPipeline from "./pages/EditPipeline";
import TargetListing from "./pages/TargetListing";
import MyTarget from "./pages/MyTarget";
import LeadsAllListing from "./pages/LeadsAllListing";

import LeadsPassiveListing from "./pages/LeadsPassiveListing";
import LeadsActiveListing from "./pages/LeadsActiveListing";
import AddLeadModal from "./pages/AddLeadModal"
import ViewLeadModal from "./pages/ViewLeadModal";

import { SearchResultsProvider } from './components/SeachComponent/SearchResultsContext';
import ManageMeet from "./pages/ManageMeet";
import Room from "./pages/room";
import CandidateHistory from "./pages/CandidateHistory";
import ViewCandidate from './pages/ViewCandidate'


function App() {

  const location = useLocation();
  const navigateTo = useNavigate();
  const { mainPath, subPath } = useLocationPath();
  const token = localStorage.getItem('token');
  let decodedValue = null;
  if (token) {
    let base64Url = token.split('.')[1];
    decodedValue = JSON.parse(window.atob(base64Url));
  }
  useEffect(() => {
    const allowedRoutes = [
      '/login',
      '/resetpassword',
    ];

    if (!allowedRoutes.includes(mainPath) && !token) {
      navigateTo('/login');
    }
    if (
      (decodedValue && decodedValue.user_role === 'bde' && 
      ((mainPath === 'dashboard') ||
      (mainPath === 'target' && subPath === 'managetarget') ||
      (mainPath === 'target' && subPath === 'mytarget') ||
      (mainPath === 'submission' && subPath === 'submissionapproval') ||
      (mainPath === 'submission' && subPath === 'managesubmissions') ||
      (mainPath === 'submission' && subPath === 'mysubmissions') ||
      (mainPath === 'candidatelibrary' && subPath === 'managecandidates') ||
      (mainPath === 'employee' && subPath === 'Manageemployee'))) ||
      (decodedValue && decodedValue.user_role === 'account_manager' && 
      ((mainPath === 'managedeals' && subPath === 'managesalespipeline') ||
      (mainPath === 'leads' && subPath === 'leadsall') ||
      (mainPath === 'leads' && subPath === 'leadspassive') ||
      (mainPath === 'leads' && subPath === 'leadsactive') ||
      (mainPath === 'employee' && subPath === 'Manageemployee'))) ||
      (decodedValue && decodedValue.user_role === 'team_lead' && 
      ((mainPath === 'managedeals' && subPath === 'managesalespipeline') ||
      (mainPath === 'employee' && subPath === 'Manageemployee') ||
      (mainPath === 'leads' && subPath === 'leadsall') ||
      (mainPath === 'leads' && subPath === 'leadspassive') ||
      (mainPath === 'leads' && subPath === 'leadsactive') ||
      (mainPath === 'bdedashboard'))) ||
      (decodedValue && decodedValue.user_role === 'recruiter' && 
      ((mainPath === 'leads' && subPath === 'leadsall') ||
      (mainPath === 'managedeals' && subPath === 'managesalespipeline') ||
      (mainPath === 'employee' && subPath === 'Manageemployee') ||
      (mainPath === 'bdedashboard'))) ||
      (decodedValue && decodedValue.user_role === 'recruiter' &&
      ((mainPath === 'leads' && subPath === 'leadspassive') ||
      (mainPath === 'leads' && subPath === 'leadsactive') ||
      (mainPath === 'submission' && subPath === 'submissionapproval')))
    ) {
      navigateTo('/login');
    }
    if (
      (decodedValue && decodedValue.user_role === 'sales' && 
      ((mainPath === 'leads' && subPath === 'leadspassive') ||
      (mainPath === 'leads' && subPath === 'leadsactive') ||
      (mainPath === 'leads' && subPath === 'leadsall') ||
      (mainPath === 'target' && subPath === 'managetarget') ||
      (mainPath === 'target' && subPath === 'mytarget') ||
      (mainPath === 'demand' && subPath === 'managedemands') ||
      (mainPath === 'demand' && subPath === 'mydemands') ||
      (mainPath === 'submission' && subPath === 'managesubmissions') ||
      (mainPath === 'submission' && subPath === 'mysubmissions') ||
      (mainPath === 'submission' && subPath === 'submissionapproval') ||
      (mainPath === 'bdedashboard') ||
      (mainPath === 'dashboard') ||
      (mainPath === 'candidatelibrary' && subPath === 'managecandidates')))
    ) {
      navigateTo('/login');
    }
  }, [mainPath, subPath, navigateTo, decodedValue, token]);

  return (
    <div>
      <ThemeProvider >
        <UserProvider>
          <SearchResultsProvider> {/* Wrap the relevant components */}
            <Routes>
              <Route path='/' element={<Navigate to='/login' />} />
              <Route path='/login' element={<Login />} />
              <Route path='/resetpassword' element={<Reset />} />s
               <Route path='bdedashboard' element={<Layout />} >
                <Route index element={<BdeDashboard />} />
               </Route>
               <Route path='dashboard' element={<Layout />} >
                 <Route index element={<Dashboard />} />
               </Route>
               <Route path='target' element={<Layout />} >
                <Route path="managetarget" element={<TargetListing />} />
                <Route path="mytarget" element={<MyTarget />} />
               </Route>
              <Route path='leads' element={<Layout />} >
                <Route path="leadsall" element={<LeadsAllListing />} />
                <Route path="leadsactive" element={<LeadsActiveListing />} />
                <Route path="leadspassive" element={<LeadsPassiveListing />} />
                <Route path="editleadmodal" element={<EditLeadModel />} />
                <Route path="viewleadmodal" element={<ViewLeadModal />} />
                <Route path="AddLeadModal" element={<UC />} />
              </Route>   
              <Route path='demand' element={<Layout />}>
                <Route path='adddemand' element={<UC />} />
                <Route path='managedemands' element={<DemandListing />} />
                <Route path='mydemands' element={<MyDemands />} />
                <Route path='demandstatus' element={<UC />} />
                <Route path='editdemand' element={<EditDemand />} />
              </Route>

              <Route path='submission' element={<Layout />}>
                <Route index path='managesubmissions' element={<SubmissionListing />} />
                <Route path='addsubmission' element={<UC />} />
                <Route path='tracksubmission' element={<TrackSubmission />} />
                <Route path='mysubmissions' element={<MySubmissions />} />
                <Route path='submissionapproval' element={<SubmissionApproval />} />
                <Route path='viewsubmission' element={<ViewSubmission />} />
              </Route>
              <Route path='candidatelibrary' element={<Layout />}>
                <Route path='mycandidate' element={<MyCandidate/>} />
                <Route path='candidatehistory' element={<CandidateHistory/>} />
                <Route index path='managecandidates' element={<CandidateListing />} />
                <Route path='viewcandidate' element={<ViewCandidate />} />
                <Route path='editcandidate' element={<EditCandidate/>}/>
              </Route>
              <Route path='reports' element={<Layout />}>
                <Route path='recruitersubmission' element={<UC />} />
                <Route path='leaddemand' element={<UC />} />
                <Route path='accountmanager' element={<UC />} />
                <Route path='clientreport' element={<LogReport />} />
                <Route path='subvendorsubmission' element={<UC />} />
                <Route path='clientreportcount' element={<UC />} />
                <Route path='logreport' element={<LogReport />} />
              </Route>
              <Route path='masterlist' element={<Layout />}>
                <Route path='add' element={<UC />} />
                <Route path='manageclient' element={<ClientListing />} />
                <Route path='editclient' element={<EditClient />} />
                <Route path='manageskill' element={<SkillListing />} />
                <Route path='editskill' element={<EditSkill />} />
                <Route path='managevendor' element={<VendorListing />} />
                <Route path='editvendor' element={<EditVendor />} />
              </Route> 
              <Route path='employee' element={<Layout />}>
                <Route path='addemployee' element={<UC />} />
                <Route path='Manageemployee' element={<EmployeeListing />} />
                <Route path='editemployee' element={<EditEmployee />} />
              </Route>
              <Route path='managedeals' element={<Layout />}>
                <Route path='managesalespipeline' element={<ManagePipeline />} />
                <Route path='editpipeline' element={<EditPipeline />} />
              </Route>
            </Routes>
          </SearchResultsProvider>
        </UserProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;