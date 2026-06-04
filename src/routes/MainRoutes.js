// const DashboardDefault = Loadable(lazy(() => import('pages/dashboard')));
import { Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayoutV2";
import AboutUs from "../pages/AboutUs";
import ManageRFQ from "../pages/Configuration/RequestForQuotation/ManageRFQV2";
import RequestForQuotation from "../pages/Configuration/RequestForQuotation/RequestForQuotationV2";
import BoqScreen from "../pages/Configuration/RequestForQuotation/BoqScreen";
import Dashboard from "../pages/Dashboard/Dashboard";
import ManageParticipants from "../pages/Manage/ManageParticipants/ManageParticipants";
import CommercialTerms from "../pages/Settings/CommercialTerms/CommercialTerms";
import DocumentsLibraryList from "../pages/Settings/DocumentsLibrary/DocumentsLibraryList";
import DynamicFieldsSettings from "../pages/Settings/DynamicFieldsSettings/DynamicFieldsSettings";
import ManageWorkflows from "../pages/Settings/ManageWorkflows/ManageWorkflows";
import ManageEmailTemplate from "../pages/Settings/ManageEmailTemplate/ManageEmailTemplate";
import QuestionLibrary from "../pages/Settings/QuestionMaster/QuestionLibrary";
import InviteVendor from "../pages/Manage/ManageParticipants/InviteVendor";

import POOrderList from "../pages/POOrders/POOrderList";
import PurchaseOrder from "../pages/POOrders/PurchaseOrder";
//import PurchaseOrder from "../pages/PurchaseOrder/PurchaseOrder";
//import POToAccept from "../pages/POToAccept/POToAccept";
//import PurchaseResponse from "../pages/PurchaseOrder/PurchaseResponse";
import OrganisationProfile from "../pages/Settings/OrganisationSetup/OrganisationProfile";
import ManageStageList from "../pages/Settings/ManageStage/ManageStageList";
import UserManage from "../pages/Settings/OrganisationSetup/UserManage";
import CustomerList from "../pages/MasterData/CustomerSetup/CustomerList";
import ManagePR from "../pages/Configuration/PurchaseRequest/ManagePR";
import PurchaseRequest from "../pages/Configuration/PurchaseRequest/PurchaseRequest";

import { bid_list, managePR_list, manageParticipants_list, managerfi_list, managerfq_list, managenfa_list, purchaseRequest_list, registerParticipants_list, rfq_list, nfa_list } from "./claimlist";
import ManageBid from "../pages/Configuration/Auctions/ManageBid";
import AuctionControl from "../pages/Configuration/Auctions/AuctionControl";
import ERFQComparative from "../pages/Configuration/RequestForQuotation/ERFQComparative";
import PurchaseOrg from "../utils/common/PurchaseOrg";
import PurchaseOrgGrp from "../utils/common/PurchaseOrgGrp";
import RegisterSuppliers from "../pages/Manage/ManageParticipants/RegisterSuppliers";
import Auctions from "../pages/Configuration/Auctions/Auctions";
import { bidlist } from "../utils/common/utility";
import RolesTable from "../pages/Settings/Security/RoleTable";
import PivotTableDashboard from "../components/Analytics/PivotTableDashboard";
import QueryList from "../pages/CommunucationHub/QueryList";
import CkEditorComponent from "../pages/BaseCells/CkEditor";
import DetailsReport from "../pages/Configuration/RequestForQuotation/DetailsReport";
import RFQSummaryReport from "../pages/Reports/RFQSummaryReport";
import RFQSavingSummaryReport from "../pages/Reports/RFQSavingSummaryReport";
import RFQSummaryDetailedReport from "../pages/Reports/RFQSummaryDetailedReport";
import ManageDelegate from "../utils/common/Delegate";
import Delegation from "../utils/common/Delegation";
import BidGraphs from "../pages/Configuration/Auctions/BidGraphs";
import NoteForApproval from "../pages/Configuration/NFA/NoteForApproval";
import BIDSummaryReport from "../pages/Reports/BIDSummaryReport";
import BIDSavingSummaryReport from "../pages/Reports/BIDSavingSummaryReport";
import BIDSummaryDetailedReport from "../pages/Reports/BIDSummaryDetailedReport";
import ManageNFA from "../pages/Configuration/NFA/ManageNFA";
import ShowCommercialTerms from "../pages/Settings/CommercialTerms/ShowCommercialTerm";
import ShowCommercialTermsTest from "../pages/Settings/CommercialTerms/ShowCommercialTermTest";
import ShowQuestionLibarary from "../pages/Settings/QuestionMaster/ShowQuestionLibrary";
import ManageRFI from "../pages/Configuration/RequestForInformation/ManageRFI";
import RequestForInformation from "../pages/Configuration/RequestForInformation/RequestForInformation";
import UserChangePassword from "../pages/Login/UserChangePassword";
import ERFQIndividualReport from "../pages/Configuration/RequestForQuotation/ERFQIndividualReport";
import NoInternet from "../components/NoInternet";
import AddUpdateException from "../pages/Configuration/NFA/AddUpdateException";
import AddUpdateProject from "../pages/Configuration/NFA/AddUpdateProject";
import AddUpdateSpend from "../pages/Configuration/NFA/AddUpdateSpend";
import EERFQComparative from "../pages/Configuration/RequestForQuotation/EERFQComparative";
import EERFQIndividualReport from "../pages/Configuration/RequestForQuotation/EERFQIndividualReport";
import ManageGrade from "../pages/Settings/ManageGrade/GradeList";
import AddPrItemCategory from "../utils/common/AddPrItemCategory";
import AddUpdateexception from "../pages/Configuration/NFA/AddUpdateException";
import NFASummaryReport from "../pages/Reports/NFASummaryReport";
import TATReport from "../pages/Reports/TATReport";
import POSummaryDetailedReport from "../pages/Reports/POSummaryDetailedReport";
import InvoiceReport from "../pages/Reports/InvoiceReport";





const MainRoutes = {
	path: "/",
	element: <MainLayout />,
	children: [
		{
			path: "/app",
			// element: <POOrderList />,
			element: <Dashboard />,
		},
		{
			// Redirect customer suffix paths (e.g., /buyer, /supplier) to /app
			// This handles cases where subdomain + path suffix are both used
			path: "/:customerSuffix",
			element: <Navigate to="/app" replace />,
		},
		{
			path: "/AboutUs",
			element: <AboutUs />,
		},
		{
			path: "/configuration/manage-PR",
			element: <ManagePR claimType={managePR_list} key={"managePr"} />,
		},
		{
			path: "/configuration/manage-pr/:pageSlug",
			element: <PurchaseRequest key={"editmanagepr"} claimType={purchaseRequest_list} />,
		},
		{
			path: "/configuration/manage-pr/add",
			element: <PurchaseRequest key={"addmanagepr"} claimType={purchaseRequest_list} />,
		},

		{
			path: "/configuration/manage-rfq",
			element: <ManageRFQ key={"managerfq"} claimType={managerfq_list} />,
		},
		{
			path: "/configuration/manage-rfq/supplier-quotation",
			element: <EERFQComparative key={"eERFQComparative"} />

		},
		{
			path: "/configuration/manage-rfq/:pageSlug",
			element: <RequestForQuotation key={"editmanagerfq"} claimType={rfq_list} />,
		},
		{
			path: "/configuration/manage-rfq/add",
			element: <RequestForQuotation key={"addmanagerfq"} claimType={rfq_list} />,
		},
		{
			path: "/configuration/boq",
			element: <BoqScreen />,
		},
		{
			path: "/manage/manage-participants",
			element: <ManageParticipants claimType={manageParticipants_list} />,
		},
		{
			path: "/manage/manage-participants/register-participants/:pageSlug",
			element: <RegisterSuppliers claimType={registerParticipants_list} key={'editregisterparticipant'} />,
		},
		{
			path: "/manage/manage-participants/register-participants",
			element: <RegisterSuppliers claimType={registerParticipants_list} />,
		},
		{
			path: "/manage/manage-participants/InviteVendor",
			element: <InviteVendor />,
		},
		{
			path: "/settings/dynamic-fields",

			element: <DynamicFieldsSettings />,
		},
		{
			path: "/settings/manage-workflows",
			element: <ManageWorkflows />,
		},
		{
			path: "/settings/documents-library",
			element: <DocumentsLibraryList />,
		},
		{
			path: "/settings/commercial-terms",
			element: <CommercialTerms />,
		},
		{
			path: "/settings/showcommercial-terms",
			element: <ShowCommercialTermsTest />,
		},
		{
			path: "/settings/security",
			element: <RolesTable />
			// element: <Security />,
		},
		{
			path: "/settings/email-master",
			element: <ManageEmailTemplate key={`manageemailtemplate`} />,
		},
		{
			path: "/settings/stage-master",
			element: <ManageStageList />,
		},

		{
			path: "/settings/question-library",
			element: <QuestionLibrary />,
		},
		{
			path: "/settings/showquestion-library",
			element: <ShowQuestionLibarary />,
		},
		{
			path: "/settings/manage-delegate",
			// element: <ManageDelegate />,
			element: <Delegation />,
		},
		{
			path: "/settings/manage-user",
			element: <UserManage key={"manage-user"} />,
		},
		{
			path: "/settings/manage-category",
			element: <AddPrItemCategory />,
		},
		{
			path: "/settings/manage-grade",
			element: <ManageGrade />,
		},
		{
			path: "/PO/POlist",
			element: <POOrderList />,
		},
		{
			path: "/purchase-order/:pageSlug",
			element: <PurchaseOrder />,
		},
		{
			path: '/purchase-order/:poId/:pageSlug',
			element: <PurchaseOrder key={"purchaseorder"} />
		},
		{
			path: "/settings/OrgSetup",
			element: <OrganisationProfile />,
		},
		{
			path: "/settings/roles-table",
			element: <RolesTable />,
		},
		// {
		// 	path: "/ck-editor",
		// 	element: <CkEditorComponent />,
		// },
		{
			path: "/bid-graphs",
			element: <BidGraphs />,
		},
		{
			path: "/configuration/manage-nfa",
			element: <ManageNFA claimType={managenfa_list} key={"manageNFA"} />,
		},
		{
			path: "/create-exception",
			element: <AddUpdateexception />,
		},
		{
			path: "/create-project",
			element: <AddUpdateProject />,
		},
		{
			path: "/create-spend",
			element: <AddUpdateSpend />,
		},
		{
			path: "/reports/NFASummaryReport",
			element: <NFASummaryReport />,
		},
		{
			path: "/reports/TATReport",
			element: <TATReport />,
		},
		{

			path: "/configuration/manage-nfa/:pageSlug",
			element: <NoteForApproval key={"editmanagenfa"} claimType={nfa_list} />,
		},
		{
			path: "/configuration/manage-nfa/add",
			element: <NoteForApproval key={"addmanagenfa"} claimType={nfa_list} />,
		},
		// {
		// 	path: "/create-nfa",
		// 	element: <NoteForApproval />,
		// },
		// {
		// 	path: "configuration/nfa-list",
		// 	element: <ManageNFA key={"managenfa"} claimType={managenfa_list} />,
		// },


		{
			path: '/manage/manage-participants/invited-participants/:pageSlug/:supplierid',
			element: <RegisterSuppliers key={"invitedparticipants"} />
			//element: <DetailsReport />
		},

		{
			path: "/master/customer-setup",
			element: <CustomerList />,
		},
		{
			path: "/manage/manage-participants/extend-participants",
			element: <RegisterSuppliers />,
		},
		// {
		// 	path: "/configuration/manage-bid",
		// 	element: <ManageBid key={"managebid"} />,
		// },
		// {
		// 	path: "/configuration/manage-foa/:pageSlug",
		// 	element: <Auctions key={"editmanagefoa"} bidtype={bidlist[1]} claimType={bid_list} />,
		// },
		// {
		// 	path: "/configuration/manage-ra/:pageSlug",
		// 	element: <Auctions key={"editmanagera"} bidtype={bidlist[2]} claimType={bid_list} />,
		// },
		// {
		// 	path: "/configuration/manage-fa/:pageSlug",
		// 	element: <Auctions key={"editmanagefa"} bidtype={bidlist[3]} claimType={bid_list} />,
		// },
		// {
		// 	path: "/configuration/manage-ca/:pageSlug",
		// 	element: <Auctions key={"editmanageca"} bidtype={bidlist[4]} claimType={bid_list} />,
		// },
		// {
		// 	path: "/configuration/manage-ffa/:pageSlug",
		// 	element: <Auctions key={"editmanageffa"} bidtype={bidlist[5]} claimType={bid_list} />,
		// },
		// {
		// 	path: "/configuration/manage-fra/:pageSlug",
		// 	element: <Auctions key={"editmanagefra"} bidtype={bidlist[6]} claimType={bid_list} />,
		// },
		// {
		// 	path: "/configuration/manage-foa/add",
		// 	element: <Auctions bidtype={bidlist[1]} key={"addmanagefoa"} claimType={bid_list} />,
		// },
		// {
		// 	path: "/configuration/manage-ra/add",
		// 	element: <Auctions bidtype={bidlist[2]} key={"addmanagera"} claimType={bid_list} />,
		// },
		// {
		// 	path: "/configuration/manage-fa/add",
		// 	element: <Auctions bidtype={bidlist[3]} key={"addmanagefa"} claimType={bid_list} />,
		// },
		// {
		// 	path: "/configuration/manage-ca/add",
		// 	element: <Auctions bidtype={bidlist[4]} key={"addmanageca"} claimType={bid_list} />,
		// },
		// {
		// 	path: "/configuration/manage-ffa/add",
		// 	element: <Auctions bidtype={bidlist[5]} key={"addmanageffa"} claimType={bid_list} />,
		// },
		// {
		// 	path: "/configuration/manage-fra/add",
		// 	element: <Auctions bidtype={bidlist[6]} key={"addmanagefra"} claimType={bid_list} />,
		// },
		{
			path: "/configuration/manage-auction",
			element: <ManageBid key={"managebid"} />,
		},
		{
			path: "/configuration/manage-auction/add",
			element: <Auctions key={"addmanageauction"} claimType={bid_list} />,
		},
		{
			path: "/configuration/manage-auction/:pageSlug",
			element: <Auctions key={"editmanagefoa"} claimType={bid_list} />,
		},
		{
			path: "/configuration/auction-control/:pageSlug",
			element: <AuctionControl key={"AuctionControl"} />,
		},
		{
			path: "/configuration/manage-rfq/comparative-rfq/:pageSlug",
			element: <ERFQComparative key={"ERFQComparative"} />

		},
		{
			path: '/configuration/manage-rfq/:pageSlug/:supplierid',
			element: <RequestForQuotation key={"ERFQforsupplier"} />
			//element: <DetailsReport />
		},
		{
			path: '/manage-rfq/:eventid/supplier-individual-report/:supplierid',
			//element: <DetailsReport key={"DetailedReport"}/>
			element: <ERFQIndividualReport key={"DetailedReportIndividual"} />
		},
		{
			path: '/manage-rfq/Reportss',
			//element: <DetailsReport key={"DetailedReport"}/>
			element: <EERFQIndividualReport key={"DetailedReportIndividual"} />
		},
		{
			path: "/utils/common/purchase-organization",
			element: <PurchaseOrg key={"purchaseOrganisation"} />

		},
		{
			path: "/utils/common/purchase-group",
			element: <PurchaseOrgGrp key={"purchaseGroup"} />

		},
		{
			path: "/test",
			element: <PivotTableDashboard />
		},

		{
			path: "/query-list",
			element: <QueryList />
		},

		{
			path: "/reports/RFQSummaryReport",
			element: <RFQSummaryReport />,
		},
		{
			path: "/reports/RFQSavingSummaryReport",
			element: <RFQSavingSummaryReport />,
		},
		{
			path: "/reports/RFQSummaryDetailedReport",
			element: <RFQSummaryDetailedReport />,
		},
		{
			path: "/reports/POSummaryDetailedReport",
			element: <POSummaryDetailedReport />,
		},
		{
			path: "/reports/BIDSummaryReport",
			element: <BIDSummaryReport />,
		},
		{
			path: "/reports/InvoiceReport",
			element: <InvoiceReport />,
		},
		{
			path: "/reports/BIDSavingSummaryReport",
			element: <BIDSavingSummaryReport />,
		},
		{
			path: "/reports/BIDSummaryDetailedReport",
			element: <BIDSummaryDetailedReport />,
		},

		//#RFI

		{
			path: "/configuration/manage-rfi",
			element: <ManageRFI key={"managerfi"} claimType={managerfi_list} />,
		},
		{
			path: "/configuration/manage-rfi/:pageSlug",
			element: <RequestForInformation key={"editmanagerfi"} claimType={managerfi_list} />,
		},
		{
			path: "/configuration/manage-rfi/add",
			element: <RequestForInformation key={"addmanagerfi"} claimType={managerfi_list} />,
		},

		{
			path: "/pages/Login/UserChangePassword",
			// element: <POOrderList />,
			element: <UserChangePassword />,
		},



		{



			path: '/no-internet',
			element: <NoInternet />

		}

	],
};

export default MainRoutes;
