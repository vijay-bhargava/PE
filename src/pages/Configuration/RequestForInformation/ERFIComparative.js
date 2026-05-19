import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useStateValue } from "../../../store";
import {
	MenuItem,
	Tooltip,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Box,
	Tabs,
	Tab,
	Menu,
	Typography,
} from "@mui/material";
import { DropdownButton, Modal, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import {
	ChevronLeft,
	ChevronRight,
	CommentOutlined,
	ExpandMore,
	ExpandMoreOutlined,
	InfoOutlined,
	KeyboardDoubleArrowLeft,
	PushPinOutlined,
} from "@mui/icons-material";
import {
	HiChevronDown,
	HiDotsVertical,
	HiOutlineX,
} from "react-icons/hi";
import { api, ApiClient } from "../../../Apiclient";
import { toast } from "react-toastify";
import {
	downloadFilesOnAzure,
	getFileName,

	sumArray,
} from "../../../utils/common";
import {
	buildQueryParams,
	formatDateViaLocale,
	formatDateViaTime,
	formattimeoption,
} from "../../../utils/common/utility";
import { GrAttachment } from "react-icons/gr";
import { FastApiClient } from "../../../FastApiClient";
import SupplierAttachmentCell from "./SupplierAttachmentCell";
import SupplierTechnicalResponses from "../../../components/Reports/SupplierTechnicalResponses";
import RFQActionDrawer from "../../../components/Reports/RFQActionDrawer";
import { FaComment } from "react-icons/fa";
import WhiteTooltip from "../../../components/whitetooltip";
import EventQuestionScreen from "../../../components/Event/EventQuestionScreen";
import { id } from "date-fns/locale";
import EventRFIQuestion from "../../../components/Event/EventRFIQuestion";
const ERFIComparative = ({ accessLevel, handleTab, actions }) => {

	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState(null); //state to handle  version dropdown open and close
	const [
		{ atoken, customerid,customersuffix, userDetail },
		dispatch, thousands_separators
	] = useStateValue();
	const [rfqItemsList, setrfqItemsList] = useState([]);
	const [rfqQuestionList, setRFQQuestionList] = useState([]) //it sets question of rfqs
	const [rfqItemCommercialList, setRfqItemCommercialList] = useState([]);
	const [rfqOthersCommercialList, setrfqOthersCommercialList] = useState([]);
	const apiClient = new ApiClient(customersuffix);
	const [openSupplier, setOpenSupplier] = useState(false);
	const [openViewSupplier, setOpenViewSupplier] = useState(false);
	const [openPoDetail, setOpenPoDetail] = useState(false);
	const [openLoadingF, SetLoadingF] = useState(false);
	const handleCloseLoadingF = () => SetLoadingF(false);
	const [selectedLoadingF, SetSelectedLoadingF] = useState(null);
	const handleOpenLoadingF = (v) => {
		SetLoadingF(true);
		SetSelectedLoadingF(v);
	};
	const [selectedpodetails, setSelectedPODetails] = useState(null);
	const handleOpenPoDetail = (v) => {

		setOpenPoDetail(true);
		setSelectedPODetails(v);
	};
	const handleClosePoDetail = () => setOpenPoDetail(false);
	const [value, setValue] = useState(2);
	const handleChange = (event, newValue) => {
		setValue(newValue);
	};
	const [reInvite, setreInvite] = useState(0);
	const [isExpanded, setIsExpanded] = useState(false);

	const { pageSlug, supplierid } = useParams();
	const [vendorItemAnalysis, setVendorItemAnalysis] = useState([]);
	const [vendorRanking, setVendorRanking] = useState([]);
	const [vendorCommercial, setVendorCommercial] = useState([]);
	const [version, setVersion] = useState(0);
	const [currentVersion, setCurrentVersion] = useState(0);
	const [linewiseItemLowest, setLineWiseItemLowest] = useState([]);

	const [QuestionResponses, setQuestionResponses] = useState([])
	const RFQcomparativeReport = async () => {
		const reqdata = {
			rfqId: parseInt(pageSlug),
			Version: version,
		};
		const queryParams = buildQueryParams(reqdata);
		const res = await apiClient.getres(
			`/api/RFQManage/RFQcomparativeReport?${queryParams}`,
			atoken
		);
		if (res.status === 200) {

			let vendorItemAnalysisdata = res.data;
			if (!supplierid) {
				setVendorItemAnalysis(vendorItemAnalysisdata);
			}
			else {
				// when supplierid then filter his data only				
				const filteredsupplier = vendorItemAnalysisdata?.filter(x => x.id == supplierid)
				vendorItemAnalysisdata = filteredsupplier;
				setVendorItemAnalysis(vendorItemAnalysisdata);
			}

			//in order to get linewise lowest  term 
			const data = vendorItemAnalysisdata?.filter(v => v?.submissionDate != null)[0]
			if (data) {
				const linewiselowest = JSON.parse(data?.vendorItemAnalysis);
				setLineWiseItemLowest(linewiselowest)
			}
			//in order to segregate supplierquestionresponses
			if (vendorItemAnalysisdata && vendorItemAnalysisdata?.length > 0) {
				
				const vendorQuestionAns = vendorItemAnalysisdata?.map((v) => {
					
					const { id, tradeName,qTotalScore } = v;  // Destructure only the fields you need
					return {
					  id,
					  tradeName,
					  qTotalScore,
					  vendorQuestionAns: JSON.parse(v?.vendorQuestionAns),  // Only include the fields you need
					};
				  });
				  setQuestionResponses(vendorQuestionAns);
			}


		}
	};

	//useeffect
	useEffect(() => {
		pullRFQItemServiceFind();
	}, []);

	useEffect(() => {
		RFQcomparativeReport();
	}, [version]);
	const [rfqheaderdetails, setRFQHeaderDetails] = useState(null);
	const [totalItemSum, setTotalItemSum] = useState(0)
	const pullRFQItemServiceFind = async () => {
		var data = {
			Id: pageSlug,
		};

		const queryParams = buildQueryParams(data);
		const res = await apiClient.getres(
			`/api/RFQManage/FindById?${queryParams}`,
			atoken
		);
		// console.log('request id pullRFQItemServiceFind', data);
		if (res) {

			setCurrentVersion(res?.data?.result[0]?.version)

			setRFQHeaderDetails(res?.data?.result)

			setrfqItemsList(res?.data?.result[0]?.rfqParameters);
			const itemsumarr = sumArray(res?.data?.result[0]?.rfqParameters?.map(x => x.targetPrice * x.quantity))
			setTotalItemSum(itemsumarr)
			setRfqItemCommercialList(
				res?.data?.result[0]?.rfqTermsCondition.filter((x) => x.level == "item")
			);
			setRFQQuestionList(res?.data?.result[0]?.rfqQuestionMaster)

			setrfqOthersCommercialList(
				res?.data?.result[0]?.rfqPackageCommercial
			)
		}
	};

	const handleVersionClick = (v) => {
		setVersion(v ?? 0);
		setAnchorEl(null);
		console.log(`Selected Version: ${v}`);
	};

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	//
	const [expandedCommercial, setExpandedCommercial] = useState(null);

	const handleToggleExpand = (index) => {
		setExpandedCommercial(expandedCommercial === index ? null : index);
	};
	const [reInviteModal, setreInviteModal] = useState(false);
	//to handle reinvite or same reminder with same modal
	const [modalType, setModalType] = useState("");
	const handleModelType = (modeltype) => {
		switch (modeltype) {
			case "Reminder":
				return setModalType("Reminder")
			case "ReInvite":
				return setModalType("ReInvite")
			case "ExtendDate":
				return setModalType("ExtendDate")
			default:
				return ""
		}

	}


	const [searchQuery, setSearchQuery] = useState('');

	// Function to filter vendors based on name and email

	const [filteredVendors, setFilteredVendors] = useState([]);


	const [filteredReopenVendors, setFilteredReopenVendors] = useState([]);


	useEffect(() => {

		setFilteredVendors(vendorItemAnalysis?.map((x) => {
			return { ...x, reinviteremark: "", reinvitechecked: false, reInviteShow: true }
		}))
		setFilteredReopenVendors(vendorItemAnalysis?.map((x) => {
			return { ...x, reopenremark: "", reoepnchecked: false, reopenShow: true }
		}))
	}, [vendorItemAnalysis])
	useEffect(() => {

		const updatedVendors = filteredVendors?.map(v => {
			const matchesSearch =
				(v.tradeName && v.tradeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
				(v.contactPerson && v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));

			return {
				...v,
				reInviteShow: matchesSearch // Set isShow based on the search
			};
		});
		const updatedreopenVendors = filteredReopenVendors?.map(v => {
			const matchesSearch =
				(v.tradeName && v.tradeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
				(v.contactPerson && v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));

			return {
				...v,
				reopenShow: matchesSearch // Set isShow based on the search
			};
		});


		setFilteredVendors(updatedVendors);
		setFilteredReopenVendors(updatedreopenVendors);
	}, [searchQuery]);

	const validationSchemaReinvite = yup.object().shape({
		deadlineDate: yup
			.date()
			// .default(new Date(maxNow))
			// .min(maxNow, `Date cannot be in the past`)
			.required("RFQ DeadLine Date/Time is required")
			.typeError("RFQ DeadLine Date/Time is required"),
	});

	//handle surrogate and reopen quotes
	const [actionmodal, setActionModal] = useState({
		surrogateSupplierModal: false,
		reopenSupplierModal: false,
		extenddateSupplierModal: false,
		opensealedBid: false
	});



	const validationSchemaSurrogate = yup.object().shape({
		// surrogatename: yup
		// .string("Enter Surrogater Name")
		// .max(200, "Max 40 character")
		// .required("Surrogater Name is required"),
		surrogateemail: yup
			.string('Enter email')
			.required('Please enter your email')
			.email('Enter a valid email'),
	});
	const formik_Surrogate = useFormik({
		enableReinitialize: true,
		initialValues: {
			supplier: null,
			surrogatename: "",
			surrogateemail: "",
			surrogateReason: ""
		},
		validationSchema: validationSchemaSurrogate,
		onSubmit: async (values) => {

			if (!values?.supplier) {
				toast.error(`Please Select Supplier`, {
					toastId: "surrogatetoasterror"
				})
				return
			}

			const payload = {
				"name": values?.surrogatename,
				"vendorId": values?.supplier?.vendorId,
				"email": values?.surrogateemail,
				"rfqId": pageSlug,
				"reason": values?.surrogateReason,
				"stages": {
					"eventType": "RFQ",
					"currentStage": "Surrogate",
					"nextStage": "Surrogate",
					"orgId": 0,
					"orgGroupId": 0
				}
			}

			const res = await apiClient.postres(`/api/RFQManage/RFQSurrogate`, payload, atoken)
			if (res) {
				setActionModal({ ...actionmodal, ["surrogateSupplierModal"]: false })
				toast.success(`suppliers surrogated successfully`, {
					toastId: "surrogatetoast"
				})
				formik_Surrogate.resetForm();

			}


		},
	});





	const fastApiClient = new FastApiClient()

	const [tabshow, setTabShow] = useState(true)

	//sealed bid handling 
	const [progress, setProgress] = useState(false)

	// SupplierAttachment
	const [expandedSupplierAttachment, setExpandedSupplierAttachment] = useState(false);

	const handleSupplierAttachment = (panel) => (event, isExpanded) => {
		setExpandedSupplierAttachment(isExpanded ? panel : false); // Toggle the accordion
	};



	//to handle tabchange on the basis of access abheedev
	useEffect(() => {
		

		if (accessLevel?.find(x => x.claimType == "Question Responses")?.claimValue?.Read != "N") {
			setValue(2)
			return;
		}

		// if (accessLevel?.find(x => x.claimType == "Approval Activity")?.claimValue?.Read != "N") {
		// 	setValue(3)
		// 	return;
		// }




	}, [accessLevel])

	return (
		<div className="container-fluid">
			<div className="row justify-content-between align-items-baseline d-none">
				<div className="col-md-10 mb-2">
					<div className={ "d-none "}>
						<Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
							<KeyboardDoubleArrowLeft className="text-primary pointer"
								onClick={() => handleTab(true)}
							/>
							<Tabs
								onChange={handleChange}
								value={value}
								textColor="primary"
								indicatorColor="primary"
								aria-label=""
								selectionFollowsFocus
								className="ps-2 tabstheme scrollable-container"

							>
								{/* {accessLevel?.find(x => x.claimType == "Item Commercial Responses")?.claimValue?.Read != "N" && <Tab value={0} className="text-capitalize f12 fw500" label="Item Commercial Responses" />} */}
								{/* {accessLevel?.find(x => x.claimType == "Package Commercial Responses")?.claimValue?.Read != "N" && <Tab value={1} className="text-capitalize f12 fw500" label="Package Commercial Responses" />} */}
								{accessLevel?.find(x => x.claimType == "Question Responses")?.claimValue?.Read != "N" && <Tab value={2} className="text-capitalize f12 fw500" label="Questions Responses" />}

								{/* <Tab className="text-capitalize f12 fw500" label="Other Attachments" /> */}
								{/* {accessLevel?.find(x => x.claimType == "Approval Activity")?.claimValue?.Read != "N" && <Tab value={3} className="text-capitalize f12 fw500" label="Approval Activity" />} */}
								{/* <Tab
								className="text-capitalize"
								label="Item/Service Wise Comparision"
							/> */}
							</Tabs>
						</Box>

					</div>
				</div>
				<div className="col-md-2  me-0 pe-0 d-flex justify-content-end align-items-center text-end me-0 pe-0 mt-2">
					<RFQActionDrawer
						rfqid={actions?.rfqid}
						categoryList={actions?.categoryList}
						selectedsupplier={actions?.selectedsupplier}
						enddate={actions?.enddate}
						activityId={actions?.activityId}
						handleDraftEvent={actions?.handleDraftEvent}
						rfqtype={actions?.rfqtype}
						EventHeaderDetails={actions?.EventHeaderDetails}
					/>

					{/* <DropdownButton
						as={"div"}
						key={"end7"}
						id={`myacccmenu`}
						className="sidebaraccmenu "
						drop={"bottom"}
						variant="outlined"
						style={{ backgroundColor: "white", color: "#2182cde" }}
						title={
							<Tooltip title={"Version Control"}>
								<div>
									{" "}
									<HiDotsVertical className="text-primary"/>{" "}
								</div>
							</Tooltip>
						}
					>
						<div className="shadow rounded min-width-200px">
						 <MenuItem className="p-2">
												<span className="f13 fw400">Export Summary Comparative</span>
											</MenuItem>
						    <MenuItem className="p-2">
												<span className="f13 fw400">Export RFQ Comparative</span>
							</MenuItem>
							 <MenuItem className="p-2" >
												<span className="f13 fw400">Open Sealed Bid</span>
							</MenuItem>
					        	<MenuItem className="p-2">
												<span className="f13 fw400">PDF</span>
											</MenuItem>
							<MenuItem className="p-2">
												<span className="f13 fw400">Cancel RFQ</span>
											</MenuItem>
							<MenuItem className="p-2">
												<span className="f13 fw400">Download</span>
											</MenuItem>
							<MenuItem className="p-2">
												<span className="f13 fw400" >Re-Open Quote</span>
											</MenuItem>
											<MenuItem className="p-2" >
								<span className="f13 fw400">Surrogate</span>
											</MenuItem>
											
											<MenuItem className="p-2">
												<span className="f13 fw400">Send Reminder</span>
											</MenuItem>
											<MenuItem className="p-2">
												<span className="f13 fw400">Extend Date</span>
											</MenuItem>
											
											
											

<MenuItem className="p-2" >
												<span className="f13 fw400">Update Event</span>
											</MenuItem>
											<MenuItem className="p-2">
												<span className="f13 fw400">Counter-Offer</span>
											</MenuItem>
						</div>
					</DropdownButton> */}
					<Button
						aria-controls={Boolean(anchorEl) ? "simple-menu" : undefined}
						aria-haspopup="true"
						onClick={handleClick}
						variant="text"
						style={{ backgroundColor: "white", color: "#2182cde" }}
					>
						<Tooltip title={"Version Control"}>
							<div
								style={{
									fontSize: "0.7125rem",
									color: "#2A68D3",
									fontWeight: "500",
								}}
							>
								{version != 0 ? `Version ${version} X ` : `Final Version`}
								<ExpandMore />
							</div>
						</Tooltip>
					</Button>
					<Menu
						id="simple-menu"
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={handleClose}
					>
						{Array?.from({ length: currentVersion + 1 }).map((_, i) => {

							if (i != 0) {
								return (<MenuItem onClick={() => handleVersionClick(i)}>Version {i}</MenuItem>)
							}
							return (<MenuItem onClick={() => handleVersionClick(0)}>Final Version</MenuItem>)
						})}



					</Menu>
				</div>

			</div>
			{value == 0 ? (
				<div className="d-flex ms-2 scrollable-container">
					<div className="d-flex itemTable">
						<div className="d-flex itemTable" id="pdfContent">
							<div className="detailItem ">
								<div
									className="f16 fw500 border ps-2 pt-2 pb-2 pe-2 text-center fixed-header"
									style={{ height: "100px", paddingTop: ".7rem" }}
								>
									Items/Services
								</div>
								<div className="item">
									<Table
										striped
										bordered
										hover
										responsive
										className="mb-0 pb0 items"
									>
										<thead>
											<tr>
												<th className="f14 fw500">SrNo.</th>
												<th className="f14 fw500">Item Name</th>
												<th className="f14 fw500">Item Code</th>
												<th className="f14 fw500">Quantity</th>
												<th className="f14 fw500">UOM</th>
												<th className="f14 fw500">Target Price</th>
											</tr>
										</thead>
										<tbody>
											{rfqItemsList &&
												rfqItemsList.length > 0 &&
												rfqItemsList?.map((v, i) => {

													return (
														<>
															<tr>
																<td className="f13 fw400">{i + 1}</td>
																<td className="f13 fw400">
																	{v.itemName}{" "}
																	<Tooltip title={"Commercial Terms"}>
																		<span
																			onClick={() => handleToggleExpand(i)}
																			style={{
																				cursor: "pointer",
																				color: "#1976d2",
																				fontSize: "12px",
																			}}
																		>
																			<HiChevronDown className="f14" />
																		</span>
																	</Tooltip>
																	<WhiteTooltip
																		title={`Description :${v?.itemDesc}`}
																	>
																		<span
																			className="ms-2"
																			style={{
																				cursor: "pointer",
																				color: "#1976d2",
																				fontSize: "12px",
																			}}
																		>
																			<InfoOutlined className="f14" />
																		</span>
																	</WhiteTooltip>
																	<WhiteTooltip
																		title={`Remark :${v?.remarks}`}
																	>
																		<span
																			className="ms-2"
																			style={{
																				cursor: "pointer",
																				color: "#1976d2",
																				fontSize: "12px",
																			}}
																		>
																			<CommentOutlined className="f14" />
																		</span>
																	</WhiteTooltip>
																</td>
																<td className="f13 fw400">{v.itemCode}</td>
																<td className="f13 fw400">{thousands_separators(v.quantity)}</td>
																<td className="f13 fw400">{v.uom}</td>
																<td className="f13 fw400">
																	{thousands_separators(v.targetPrice)}{" "}
																	<Tooltip title={"Base Currency"}>
																		<span> {rfqheaderdetails && rfqheaderdetails[0]?.baseCurrency}  </span>
																	</Tooltip>
																</td>
															</tr>

															{expandedCommercial == i &&
																rfqItemCommercialList.map((x, q2) => {
																	return (
																		<tr key={`commercial_${q2}`}>
																			<td
																				className="f13 fw400"
																				style={{

																					width: "75px",
																				}}
																			>
																			</td>
																			<td
																				className="f13 fw400"
																				style={{
																					color: "#1976d2",
																					width: "200px",
																				}}
																			>
																				{" "}
																				{x?.name}
																			</td>
																			<td
																				className="f13 fw400"
																				style={{ color: "#1976d2" }}
																			>
																				<Tooltip
																					title={`Requirement : ${x?.requirement}`}
																				>
																					<span
																						className="ms-2"
																						style={{
																							cursor: "pointer",
																							color: "#1976d2",
																							fontSize: "12px",
																						}}
																					>
																						<InfoOutlined className="f14 d-none" />
																					</span>
																				</Tooltip>
																			</td>
																			<td
																				className="f13 fw400"
																				style={{ color: "#1976d2" }}
																			>
																				<Tooltip
																					title={`Requirement : ${x?.requirement}`}
																				>
																					<span
																						className="ms-2"
																						style={{
																							cursor: "pointer",
																							color: "#1976d2",
																							fontSize: "12px",
																						}}
																					>
																						<InfoOutlined className="f14 d-none" />
																					</span>
																				</Tooltip>
																			</td>
																			<td
																				className="f13 fw400"
																				style={{ color: "#1976d2" }}
																			>
																				<Tooltip
																					title={`Requirement : ${x?.requirement}`}
																				>
																					<span
																						className="ms-2"
																						style={{
																							cursor: "pointer",
																							color: "#1976d2",
																							fontSize: "12px",
																						}}
																					>
																						<InfoOutlined className="f14 d-none" />
																					</span>
																				</Tooltip>
																			</td>
																			<td className="f13 fw400"
																				style={{ color: "#1976d2" }}></td>
																		</tr>
																	);
																})}
														</>
													);
												})}
										</tbody>
									</Table>

									<Table
										striped
										bordered
										hover
										responsive
										className="mb-0 pb-0"
									>
										<tbody>
											<tr>
												<td className="f13 fw400" style={{ width: "483px" }}>
													Total
												</td>
												<td className="f13 fw400">
													{thousands_separators(totalItemSum)}{" "}
													<Tooltip title={"Base Currency"}>
														<span> {rfqheaderdetails && rfqheaderdetails?.[0]?.baseCurrency}  </span>
													</Tooltip>
												</td>
											</tr>
										</tbody>
									</Table>
									<Table
										striped
										bordered
										hover
										responsive
										className="mb-0 pb-0"
									>
										<tbody>
											<tr>
												<td className="f13 fw400" style={{ width: "369px" }}>
													Loading Factor
												</td>
											</tr>
										</tbody>
									</Table>
									<Table
										striped
										bordered
										hover
										responsive
										className="mb-0 pb-0"
									>
										<tbody>
											<tr>
												<td className="f13 fw400" style={{ width: "369px" }}>
													Loaded Price
												</td>
											</tr>
										</tbody>
									</Table>
									{/* <Table
										striped
										bordered
										hover
										responsive
										className="mb-0 pb-0"
									>
										<tbody>
											<tr>
												<td className="f13 fw400" style={{ width: "369px" }}>
													Amount (Including Taxes)
												</td>
											</tr>
										</tbody>
									</Table> */}
								</div>
								<div className="fixed-footer">
									<div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-start">
										Commercial Rank
									</div>
									<div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-start">
										Package Value Where Supplier Is L1
									</div>
								</div>
							</div>

							{linewiseItemLowest && linewiseItemLowest.length > 1 && <div className="lineItem ms-2 shadow">
								<div id="pdfContent ">
									<div
										className="f16 fw500 border ps-2  pb-2 pe-2 text-center fixed-header"
										style={{ height: "100px", paddingTop: ".7rem" }}
									>
										Line-Wise Lowest Price
									</div>
									<div className="line">
										<Table
											striped
											bordered
											hover
											responsive
											className="mb-0 pb-0"
										>
											<thead>
												<tr>
													<th className="f14 fw500">Unit Price</th>
												</tr>
											</thead>
											<tbody>
												{linewiseItemLowest?.map((x, i) => {
													return (
														<>



															<tr>
																<td className="f13 fw400">
																	{isNaN(x?.ItemLowestQuotes) ? x?.ItemLowestQuotes :
																		<>

																			{x?.ItemLowestQuotes}
																			<Tooltip title={"Base Currency"}>
																				<span> {rfqheaderdetails && rfqheaderdetails[0]?.baseCurrency}  </span>
																			</Tooltip>
																		</>


																	}

																</td>
															</tr>
															{expandedCommercial == i && (
																Array.from({ length: rfqItemCommercialList.length }).map((_) => {
																	return (<>


																		<tr style={{ height: "37px" }}>
																			<td className="f13 fw400"></td>
																		</tr>


																	</>)
																})

															)}


														</>
													)

												})}
											</tbody>
										</Table>


										{isExpanded && (
											Array.from({ length: rfqItemCommercialList.length }).map((_) => {
												return (<>
													<Table
														striped
														bordered
														hover
														responsive
														className="mb-0 pb-0"
													>
														<tbody>
															<tr style={{ height: "37px" }}>
																<td className="f13 fw400"></td>
															</tr>
														</tbody>
													</Table>
												</>)
											})

										)}







										{Array.from({ length: 3 }).map((_, index) => (
											<Table
												key={index}
												striped
												bordered
												hover
												responsive
												className="mb-0 pb-0"
											>
												<tbody>
													<tr style={{ height: "36px" }}>
														<td className="f13 fw400"></td>
													</tr>
												</tbody>
											</Table>
										))}
										<div className="fixed-footer">
											<div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-start" style={{ height: "36px" }}>

											</div>
											<div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-start" style={{ height: "36px" }}>

											</div>
										</div>


									</div>
								</div>
							</div>}
							{/*supplier card : it contains data related to supplier */}
							{vendorItemAnalysis &&
								vendorItemAnalysis?.length > 0 &&
								vendorItemAnalysis.filter(v => v?.submissionDate != null)?.map((v, i) => {


									const supplieritemlist = JSON.parse(v?.vendorItemAnalysis);
									const loadingFactors = JSON.parse(v?.loadingFactors);

									return (
										<div
											className="vendorDetail ms-2 shadow"
											key={`vendorItemAnalysis${i}`}
										>
											<div id="pdfContent">
												<div className="vendor">
													<div className=" ps-2 pt-2 pb-2 pe-2 border  fixed-header">
														<div
															className="row"  
															style={{ textDecoration: "underline", cursor: "pointer" }}
															onClick={() => navigate(`/manage-rfq/${pageSlug}/supplier-individual-report/${v?.id}?tab=report&eventid=${pageSlug}`)}
														>
															<div className="col-md-9 d-flex justify-content-center align-items-center fw500 text-center pe-1">
																<Tooltip
																	title={
																		<div className="row">
																			<div className="col-md-12">
																				<div>{v?.tradeName}</div>
																				<div>
																					{" "}
																					{v?.contactPerson} {"|"} {v?.email}
																				</div>
																			</div>
																			<div className="col-md-12">
																				<div>Mobile</div>
																				<div> {v?.mobile}</div>
																			</div>
																			<div className="col-md-12">
																				<div>Submission Time</div>
																				<div>
																					{v?.submissionDate
																						? formatDateViaLocale(
																							v?.submissionDate,
																							userDetail
																						)
																						: ""}
																				</div>
																			</div>
																		</div>
																	}
																>
																	<div className="f15 vendorName fw500">{v?.tradeName}{" "}</div>
																</Tooltip>

															</div>
															<div className="col-md-3 d-flex justify-content-center align-items-center">

																{/* <span>
																<DropdownButton
																	as={"div"}
																	key={"end7"}
																	id={`myacccmenu`}
																	className="supplieraccmenu "
																	drop={"start"}
																	variant="outlined"
																	style={{
																		backgroundColor: "white",
																		color: "#2182cde",
																	}}
																	title={
																		<Tooltip title={"Version Control"}>
																			<div
																				style={{
																					fontSize: "0.8125rem",
																					color: "#2A68D3",
																					fontWeight: "500",
																				}}
																			>
																				<HiDotsVertical />{" "}
																			</div>
																		</Tooltip>
																	}
																>
																	<div className="shadow rounded min-width-200px">
																		<MenuItem className="f12 fw500">
																			Remove Supplier
																		</MenuItem>

																		<MenuItem className="f12 fw500">
																			Counter Offer
																		</MenuItem>

																		<MenuItem className="f12 fw500">
																			Re-Invite
																		</MenuItem>
																		<MenuItem className="f12 fw500">
																			Re-Open Quote
																		</MenuItem>
																		<MenuItem className="f12 fw500">
																			Surrogate
																		</MenuItem>
																	</div>
																</DropdownButton>
															</span> */}

															</div>
														</div>
													</div>

													<Table
														striped
														bordered
														hover
														responsive
														className="mb-0 pb-0"
													>
														<thead>
															<tr>
																<th className="f14 fw500">Offered Price</th>
																<th className="f14 fw500">Amount</th>
															</tr>
														</thead>
														<tbody>
															{rfqItemsList?.map((rfqItem, i2) => {
																const sq = supplieritemlist?.find(sq => sq.id === rfqItem.id);

																let totalamount = sq?.SupplierPrice * sq?.Quantity; //total amount

																if (totalamount == NaN) {
																	totalamount = ""
																}
																const CommercialItem = sq?.CommercialItem;


																if (sq) {

																	return (
																		<>
																			<tr key={`supplieritemlist${i2}`}>
																				<td
																					className="f13 fw400"
																					style={{ color: "#1976d2" }}
																				>
																					{totalamount ? thousands_separators(parseFloat(sq?.SupplierPrice)) : sq?.SupplierPrice}{" "}
																					{totalamount ? <Tooltip title={"Base Currency"}>
																						<span> {rfqheaderdetails && rfqheaderdetails[0]?.baseCurrency}  </span>
																					</Tooltip> : <></>}
																				</td>
																				<td
																					className="f13 fw400"
																					style={{ color: "#1976d2" }}
																				>
																					{totalamount ? thousands_separators(totalamount) : ""}{" "}
																					{totalamount ? <Tooltip title={"Base Currency"}>
																						<span> {rfqheaderdetails && rfqheaderdetails[0]?.baseCurrency} 	 </span>
																					</Tooltip> : <></>}
																				</td>
																			</tr>

																			{expandedCommercial == i2 &&
																				rfqItemCommercialList?.map((rfqItemComm, q2) => {

																					const com = CommercialItem?.find(com => com.Name === rfqItemComm.name);

																					if (com) {
																						return (
																							<tr key={`CommercialItem${q2}`}>
																								<td
																									className="f13 fw400"
																									style={{ color: "#1976d2" }}
																								>
																									{thousands_separators(com?.EnterCommValue)}{" "}
																									{rfqItemComm?.valuetype == "Percentage" &&
																										<span> % </span>
																									}
																									{rfqItemComm?.valuetype != "Percentage" && <Tooltip title={"Base Currency"}>
																										<span> {rfqheaderdetails && rfqheaderdetails[0]?.baseCurrency} </span>
																									</Tooltip>}
																								</td>
																								<td
																									className="f13 fw400"
																									style={{
																										color: "#1976d2",
																										width: "202px",
																									}}
																								>
																									{" "}

																								</td>

																							</tr>
																						);

																					}
																					else {
																						return (
																							<tr key={`CommercialItem${q2}`}>
																								<td
																									className="f13 fw400"
																									style={{
																										color: "#1976d2",
																										width: "202px",
																									}}
																								>
																									{" "}

																								</td>
																								<td
																									className="f13 fw400"
																									style={{ color: "#1976d2" }}
																								>
																									{0}{" "}
																									<Tooltip title={"Base Currency"}>
																										<span> {rfqheaderdetails && rfqheaderdetails[0]?.baseCurrency}  </span>
																									</Tooltip>
																								</td>
																							</tr>
																						);
																					}

																				})}
																		</>
																	);
																}
																else {
																	return (
																		<>
																			<tr key={`supplieritemlist${i2}`}>
																				<td
																					className="f13 fw400"
																				// style={{ color: "#1976d2" }}
																				>
																					{"Not Quoted"}

																				</td>
																				<td
																					className="f13 fw400"
																				// style={{ color: "#1976d2" }}
																				>
																					{"Not Quoted"}

																				</td>
																			</tr>

																			{expandedCommercial == i2 &&
																				rfqItemCommercialList?.map((com, q2) => {

																					return (
																						<tr key={`CommercialItem${q2}`}>
																							<td
																								className="f13 fw400"
																							// style={{
																							// 	color: "#1976d2",
																							// 	width: "202px",
																							// }}
																							>
																								{/* {"N/A"} */}

																							</td>
																							<td
																								className="f13 fw400"
																							// style={{ color: "#1976d2" }}
																							>
																								{"N/A"}

																							</td>
																						</tr>
																					);
																				})}
																		</>
																	)

																}

															})}
														</tbody>
													</Table>

													{/* supplier total amount */}
													<Table
														striped
														bordered
														hover
														responsive
														className="mb-0 pb-0"
													>
														<tbody>
															<tr>
																<td style={{ width: "202px" }}></td>
																<td className="f13 fw400">
																	{thousands_separators(v?.vendorAmount)}{" "}
																	<Tooltip title={"Base Currency"}>
																		<span> {rfqheaderdetails && rfqheaderdetails[0]?.baseCurrency}  </span>
																	</Tooltip>
																</td>
															</tr>
														</tbody>
													</Table>
													{/* loading factor */}
													<Table
														striped
														bordered
														hover
														responsive
														className="mb-0 pb-0"
													>
														<tbody>
															<tr>
																<td
																	className="f13 fw400"
																	style={{ width: "202px" }}
																>
																	{<Tooltip
																		title={loadingFactors ? "Click to View Loading Factor" : ""}
																	>
																		{" "}
																		<Button className="p-0 text-start" onClick={() => {

																			handleOpenLoadingF(loadingFactors)
																		}

																		}
																			disabled={!loadingFactors}>
																			<span
																				className="f11 fw400 me-3"
																				style={loadingFactors ? { color: "#1976d2" } : {}}


																			>
																				{!loadingFactors ? "N/A" : "View"}
																			</span>
																		</Button>{" "}
																	</Tooltip>}
																</td>
																<td className="f13 fw400"></td>
															</tr>
														</tbody>
													</Table>
													{/* <Table
														striped
														bordered
														hover
														responsive
														className="mb-0 pb-0"
													>
														<tbody>
															<tr>
																<td
																	className="f13 fw400"
																	style={{ width: "202px" }}
																>
																	{" "}
																	0{" "}
																	<Tooltip title={"Base Currency"}>
																		<span> {rfqheaderdetails[0]?.baseCurrency}  </span>
																	</Tooltip>
																</td>
																<td className="f13 fw400"></td>
															</tr>
														</tbody>
													</Table> */}
													<Table
														striped
														bordered
														hover
														responsive
														className="mb-0 pb-0"
													>
														<tbody>
															<tr>
																<td
																	className="f13 fw400"
																	style={{ width: "202px" }}
																>
																	{" "}
																</td>
																<td className="f13 fw400">
																	0{" "}
																	<Tooltip title={"Base Currency"}>
																		<span> {rfqheaderdetails && rfqheaderdetails[0]?.baseCurrency}  </span>
																	</Tooltip>
																</td>
															</tr>
														</tbody>
													</Table>
													<div className="fixed-footer">
														<div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center ">
															{v?.vendorRanking
																? `L${v?.vendorRanking}`
																: "N/A"}
														</div>
														<div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center ">
															2560
														</div>
													</div>
												</div>
											</div>
										</div>
									);
								})}

							<div className="poDetail mx-2 shadow">
								<div id="pdfContent">
									<div className="f16 fw500 border ps-2 pt-2 pb-2 pe-2 text-center fixed-header">
										Last PO-Details
									</div>
									<div className="po">
										<Table
											striped
											bordered
											hover
											responsive
											className="mb-0 pb-0"
										>
											<thead>
												<tr>
													<th className="f14 fw500">PO-Detail</th>
												</tr>
											</thead>
											<tbody>
												{rfqItemsList?.map((v, i) => {
													return (
														<tr key={`rfqItemsList${i}`}>
															<td
																className="f13 fw400 ms-0 ps-0"
																style={{ paddingBottom: ".35rem", height: "36px" }}
															>
																<Button className="p-0 text-start"
																	color="primary"
																	onClick={() => handleOpenPoDetail(v)}
																	disabled={!v?.poNumber}>
																	<span
																		className="f11 fw400 me-3"


																	>
																		{v?.poNumber ? "View" : "N/A"}
																	</span>
																</Button>
															</td>
														</tr>
													);
												})}
											</tbody>
										</Table>
										{isExpanded && (
											<Table
												striped
												bordered
												hover
												responsive
												className="mb-0 pb-0"
											>
												<tbody>
													<tr>
														<td
															className="f13 fw400"
															style={{ height: "37px" }}
														></td>
													</tr>
												</tbody>
											</Table>
										)}
										<Table
											striped
											bordered
											hover
											responsive
											className="mb-0 pb-0"
										>
											<tbody>
												<tr>
													<td
														className="f13 fw400 ms-0 ps-0"
														style={{ paddingBottom: ".35rem", height: "37px" }}
													>
														{/* <Button className="p-0 text-start">
                     <span className="f11 fw400 me-3" style={{color:"#1976d2"}} onClick={handleOpenPoDetail}>View</span>
                 </Button> */}
													</td>
												</tr>
											</tbody>
										</Table>
										<Table
											striped
											bordered
											hover
											responsive
											className="mb-0 pb-0"
										>
											<tbody>
												<tr>
													<td
														className="f13 fw400"
														style={{ height: "37px" }}
													></td>
												</tr>
											</tbody>
										</Table>
										<Table
											striped
											bordered
											hover
											responsive
											className="mb-0 pb-0"
										>
											<tbody>
												<tr>
													<td
														className="f13 fw400"
														style={{ height: "37px" }}
													></td>
												</tr>
											</tbody>
										</Table>
										<div className="fixed-footer">
											<div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-start" style={{ height: "37px" }}>

											</div>
											<div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-start" style={{ height: "36px" }}>

											</div>
										</div>
										{/* <Table
											striped
											bordered
											hover
											responsive
											className="mb-0 pb-0"
										>
											<tbody>
												<tr>
													<td
														className="f13 fw400"
														style={{ height: "36px" }}
													></td>
												</tr>
											</tbody>
										</Table> */}

									</div>
								</div>
							</div>
							<div className="deliveryDetail mx-2  ms-0 shadow">
								<div id="pdfContent">
									<div className="f16 fw500 border ps-2 pt-2 pb-2 pe-2 text-center fixed-header">
										Delivery Location
									</div>
									<div className="delivery">
										<Table
											striped
											bordered
											hover
											responsive
											className="mb-0 pb-0"
										>
											<thead>
												<tr>
													<th className="f14 fw500">Delivery Location</th>
												</tr>
											</thead>
											<tbody>
												{rfqItemsList?.map((v, i) => {
													return (
														<tr key={`rfqItemsList2${i}`}>
															<td
																className="f13 fw400 ms-0 ps-0"
																style={{ paddingBottom: ".35rem", height: "37px" }}
															>
																<div className="p-0 text-start">
																	<span className="me-3"></span>
																	<span
																		className="f13 fw400 "

																	>
																		{v?.plant}
																	</span>
																</div>
															</td>
														</tr>
													);
												})}
											</tbody>
										</Table>
										{isExpanded && (
											<Table
												striped
												bordered
												hover
												responsive
												className="mb-0 pb-0"
											>
												<tbody>
													<tr>
														<td
															className="f13 fw400"
															style={{ height: "37px" }}
														></td>
													</tr>
												</tbody>
											</Table>
										)}
										<Table
											striped
											bordered
											hover
											responsive
											className="mb-0 pb-0"
										>
											<tbody>
												<tr>
													<td
														className="f13 fw400"
														style={{ height: "37px" }}
													></td>
												</tr>
											</tbody>
										</Table>
										<Table
											striped
											bordered
											hover
											responsive
											className="mb-0 pb-0"
										>
											<tbody>
												<tr>
													<td
														className="f13 fw400"
														style={{ height: "37px" }}
													></td>
												</tr>
											</tbody>
										</Table>
										<Table
											striped
											bordered
											hover
											responsive
											className="mb-0 pb-0"
										>
											<tbody>
												<tr>
													<td
														className="f13 fw400"
														style={{ height: "37px" }}
													></td>
												</tr>
											</tbody>
										</Table>
										<div className="fixed-footer">
											<div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-start" style={{ height: "37px" }}>

											</div>
											<div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-start" style={{ height: "36px" }}>

											</div>
										</div>

									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				<></>
			)}
			{value == 1 ? (
				// othercommercialterms card
				<div className="d-flex ms-2 scrollable-container">
					<div className="d-flex itemTable">
						<div className="d-flex itemTable" id="pdfContent">
							<div className="detailItem">
								<div
									className="f16 fw500 border ps-2 pt-2 pb-2 pe-2 text-center fixed-header"
									style={{ height: "100px" }}
								>
									Package Commercial Terms
								</div>
								<div className="item">
									<Table
										striped
										bordered
										hover
										responsive
										className="mb-0 pb0 items"
									>
										<thead>
											<tr>
												<th className="f14 fw500">SrNo.</th>
												<th className="f14 fw500">Item Name</th>


											</tr>
										</thead>
										<tbody>
											<tr>
												<td className="f13 fw400"></td>

												<td className="f13 fw400">Package Price</td>


											</tr>
											{rfqOthersCommercialList &&
												rfqOthersCommercialList?.length > 0 &&
												rfqOthersCommercialList?.map((voct, ioct) => {
													return (
														<>
															<tr>
																<td className="f13 fw400">{ioct + 1}</td>

																<td className="f13 fw400">{voct?.name}</td>


															</tr>


														</>
													);
												})}
										</tbody>
									</Table>




								</div>

							</div>
							{vendorItemAnalysis &&
								vendorItemAnalysis.length > 0 &&
								vendorItemAnalysis?.map((v, i) => {

									const supplierotherCommerciallist = JSON.parse(v?.vendorCommercial);


									return (
										<div
											className="vendorDetail ms-2 shadow"
											key={`vendorItemAnalysis${i}`}
										>
											<div id="pdfContent">
												<div className="vendor">
													<div className=" ps-2 pt-2 pb-2 pe-2 border  fixed-header">
														<div
															className="row "
															style={{ textDecoration: "underline" }}
														>
															<div className="col-md-9 d-flex justify-content-center align-items-center fw500 text-center  pe-1">
																<Tooltip
																	title={
																		<div className="row">
																			<div className="col-md-12">
																				<div>{v?.tradeName}</div>
																				<div>
																					{" "}
																					{v?.contactPerson} {"|"} {v?.email}
																				</div>
																			</div>
																			<div className="col-md-12">
																				<div>Mobile</div>
																				<div> {v?.mobile}</div>
																			</div>
																			<div className="col-md-12">
																				<div>Submission Time</div>
																				<div>
																					{v?.submissionDate
																						? formatDateViaLocale(
																							v?.submissionDate,
																							userDetail
																						)
																						: ""}
																				</div>
																			</div>
																		</div>
																	}
																>
																	<div className="f15 vendorName fw500">{v?.tradeName}{"|"}</div>
																</Tooltip>

															</div>
															<div className="col-md-3 d-flex justify-content-center align-items-center">

																<span>
																	<DropdownButton
																		as={"div"}
																		key={"end7"}
																		id={`myacccmenu`}
																		className="supplieraccmenu "
																		drop={"start"}
																		variant="outlined"
																		style={{
																			backgroundColor: "white",
																			color: "#2182cde",
																		}}
																		title={
																			<Tooltip title={"Version Control"}>
																				<div
																					style={{
																						fontSize: "0.8125rem",
																						color: "#2A68D3",
																						fontWeight: "500",
																					}}
																				>
																					<HiDotsVertical />{" "}
																				</div>
																			</Tooltip>
																		}
																	>
																		<div className="shadow rounded min-width-200px">
																			<MenuItem className="f12 fw500">
																				Remove Supplier
																			</MenuItem>

																			<MenuItem className="f12 fw500">
																				Counter Offer
																			</MenuItem>

																			<MenuItem className="f12 fw500">
																				Re-Invite
																			</MenuItem>
																			<MenuItem className="f12 fw500">
																				Re-Open Quote
																			</MenuItem>
																			<MenuItem className="f12 fw500">
																				Surrogate
																			</MenuItem>
																		</div>
																	</DropdownButton>
																</span>

															</div>
														</div>
													</div>

													<Table
														striped
														bordered
														hover
														responsive
														className="mb-0 pb-0"
													>
														<thead>
															<tr>
																<th className="f14 fw500">Offered Price</th>

															</tr>
														</thead>
														<tbody>
															<tr key={`supplierpackage`}>
																<td
																	className="f13 fw400"
																	style={{ color: "#1976d2" }}
																>
																	{/* {thousands_separators(soc?.EnterCommValue)}{" "}
																				<Tooltip title={"Base Currency"}>
																					<span> {rfqheaderdetails &&  rfqheaderdetails[0]?.baseCurrency}  </span>
																				</Tooltip> */}
																	{thousands_separators(v?.packagePrice || 0)}
																</td>

															</tr>
															{supplierotherCommerciallist?.map((soc, ioc) => {


																return (
																	<>
																		<tr key={`supplieritemlist${ioc}`}>
																			<td
																				className="f13 fw400"
																				style={{ color: "#1976d2" }}
																			>
																				{soc?.Valuetype ? isNaN(soc?.EnterCommValue) ? soc?.EnterCommValue : thousands_separators(soc?.EnterCommValue) : soc?.Remarks}{" "}
																				{soc?.Valuetype == "Percentage" &&
																					<span> % </span>
																				}
																				{soc?.Valuetype == "Currency" && <Tooltip title={"Base Currency"}>
																					<span> {rfqheaderdetails && rfqheaderdetails[0]?.baseCurrency}  </span>
																				</Tooltip>}
																			</td>

																		</tr>


																	</>
																);
															})}
														</tbody>
													</Table>





												</div>
											</div>
										</div>
									);
								})}
						</div>
					</div>
				</div>



				// <div className="commercialTable">
				// 	<Table striped bordered hover responsive className="mb-0 pb0">
				// 		<thead>
				// 			<tr>
				// 				<th className="f14 fw500">SrNo.</th>
				//         <th className="f14 fw500">Commercial Terms</th>
				//         {vendorItemAnalysis && vendorItemAnalysis?.length >0 && vendorItemAnalysis?.map((vendoritem,indexvendoritem) => {

				//           return (<th className="vendorName f14 fw500">{vendoritem?.contactPerson}{"|"}{vendoritem?.email }</th>)
				//         })}

				// 				<th className="f14 fw500">Our Requirement</th>
				// 			</tr>
				// 		</thead>
				//     <tbody>

				//       <tr>

				//         {rfqOthersCommercialList.map((rocl, iocl) => {
				//           
				//           <>
				//                <td>{iocl + 1}</td>
				//                <td>{rocl?.name}</td>
				//           </>

				//         })}
				//         {vendorItemAnalysis && vendorItemAnalysis?.length > 0 && vendorItemAnalysis?.map((vendoritem, indexvendoritem) => {
				//           
				//           const vendorCommercial = JSON.parse(vendoritem?.vendorCommercial);
				//           vendorCommercial.map((vcom, icom) => {
				//             
				//                return (<td className="vendorName f14 fw500">{vcom?.CommValue}</td>)
				//           })


				//         })}
				//        </tr>


				// 		</tbody>
				// 	</Table>
				// </div>
			) : (
				<></>
			)}

			{value == 2 ? (
				// othercommercialterms card
				// 		<div className="d-flex ms-2 scrollable-container">
				//         	<div className="d-flex itemTable">
				//         <div className="d-flex itemTable" id="pdfContent">
				// 		  <div className="detailItem">
				// 						<div
				// 							className="f16 fw500 border ps-2 pt-2 pb-2 pe-2 text-center fixed-header"
				// 							style={{ height: "100px" }}
				// 						>
				// 							Questions
				// 						</div>
				// 						<div className="item-question">
				// 							<Table
				// 								striped
				// 								bordered
				// 								hover
				// 								responsive
				// 								className="mb-0 pb0 items"
				// 							>
				// 								<thead>
				// 									<tr>
				// 										<th className="f14 fw500">SrNo.</th>
				// 										<th className="f14 fw500">Question</th>

				// 										<th className="f14 fw500">Score</th>

				// 									</tr>
				// 								</thead>
				// 								<tbody>
				// 									{rfqQuestionList &&
				// 										rfqQuestionList?.length > 0 &&
				// 										rfqQuestionList?.map((vq, iq) => {

				// 											return (
				// 												<>
				// 													<tr>
				// 														<td className="f13 fw400">{iq + 1}</td>

				// 														<td className="f13 fw400">{vq?.questionDescription}
				// 															{vq?.attachedFileName && <Tooltip title={getFileName(vq?.attachedFileName)}><IconButton
				// 																onClick={() =>
				// 																	downloadFilesOnAzure(
				// 																		vq?.attachedFileName,
				// 																		getFileName(vq?.attachedFileName),
				// 																		atoken
				// 																	)
				// 																}
				// 																size="small"
				// 																edge="start"
				// 																className="pointer"
				// 															>
				// 																<GrAttachment />
				// 															</IconButton> </Tooltip>}
				// 														</td>
				// 										                {vq?.weightage  ?	<td className="f13 fw400" style={{ color: "#1976d2" }}>{vq?.weightage} </td>: <td className="f13 fw400">0</td>}


				// 													</tr>


				// 												</>
				// 											);
				// 										})}
				// 								</tbody>
				// 							</Table>




				// 						</div>

				//       </div>
				//       		{vendorItemAnalysis &&
				// 						vendorItemAnalysis.length > 0 &&
				//         vendorItemAnalysis?.map((v, i) => {

				//           const supplierQuestionAns=JSON.parse(v?.vendorQuestionAns);

				// 							return (
				// 								<div
				// 									className="vendorDetail ms-2 shadow"
				// 									key={`vendorItemAnalysis${i}`}
				// 								>
				// 									<div id="pdfContent">

				// 										<div className="vendor">
				// 											<div className=" ps-2 pt-2 pb-2 pe-2 border  fixed-header">
				// 												<div
				// 													className="row "
				// 													style={{ textDecoration: "underline" }}
				// 												>
				// 													<div className="col-md-8 d-flex justify-content-center align-items-center fw500 text-center  pe-1">
				// 													<Tooltip
				// 														title={
				// 															<div className="row">
				// 																<div className="col-md-12">
				// 																	<div>{v?.tradeName}</div>
				// 																	<div>
				// 																		{" "}
				// 																		{v?.contactPerson} {"|"} {v?.email}
				// 																	</div>
				// 																</div>
				// 																<div className="col-md-12">
				// 																	<div>Mobile</div>
				// 																	<div> {v?.mobile}</div>
				// 																</div>
				// 																<div className="col-md-12">
				// 																	<div>Submission Time</div>
				// 																	<div>
				// 																		{v?.submissionDate
				// 																			? formatDateViaLocale(
				// 																					v?.submissionDate,
				// 																					userDetail
				// 																			  )
				// 																			: ""}
				// 																	</div>
				// 																	</div>
				// 																	<div className="col-md-12 d-flex">
				// 																	<div>{"Vendor Score: " +v?.qTotalScore }</div>
				// 																</div>
				// 															</div>
				// 														}
				// 													>
				// 														<div className="row align-items-center justify-content-between">

				// 														<div className="f15 col-md-9 vendorName fw500  align-items-center">{v?.tradeName}</div>
				// 														</div>
				// 														</Tooltip>

				// 													</div>
				// 													<div className="col-md-4 d-flex justify-content-center align-items-center">
				// 													<div className="f12 fw500">Score: {v?.qTotalScore }</div>

				// 													<span>
				// 														<DropdownButton
				// 															as={"div"}
				// 															key={"end7"}
				// 															id={`myacccmenu`}
				// 															className="supplieraccmenu "
				// 															drop={"start"}
				// 															variant="outlined"
				// 															style={{
				// 																backgroundColor: "white",
				// 																color: "#2182cde",
				// 															}}
				// 															title={
				// 																<Tooltip title={"Version Control"}>
				// 																	<div
				// 																		style={{
				// 																			fontSize: "0.8125rem",
				// 																			color: "#2A68D3",
				// 																			fontWeight: "500",
				// 																		}}
				// 																	>
				// 																		<HiDotsVertical />{" "}
				// 																	</div>
				// 																</Tooltip>
				// 															}
				// 														>
				// 															<div className="shadow rounded min-width-200px">
				// 																<MenuItem className="f12 fw500">
				// 																	Remove Supplier
				// 																</MenuItem>

				// 																<MenuItem className="f12 fw500">
				// 																	Counter Offer
				// 																</MenuItem>

				// 																<MenuItem className="f12 fw500">
				// 																	Re-Invite
				// 																</MenuItem>
				// 																<MenuItem className="f12 fw500">
				// 																	Re-Open Quote
				// 																</MenuItem>
				// 																<MenuItem className="f12 fw500">
				// 																	Surrogate
				// 																</MenuItem>
				// 															</div>
				// 														</DropdownButton>
				// 													</span>

				// 													</div>
				// 												</div>
				// 											</div>

				// 											<Table
				// 												striped
				// 												bordered
				// 												hover
				// 												responsive
				// 												className="mb-0 pb-0"
				// 											>
				// 												<thead>
				// 									<tr>

				// 										<th className="f14 fw500">Response</th>
				// 									    {/* <th className="f14 fw500">Ranking</th> */}

				// 									</tr>
				// 								</thead>
				// 								<tbody>
				// 									{supplierQuestionAns &&
				// 										supplierQuestionAns?.length > 0 &&
				// 										supplierQuestionAns?.map((vq) => {

				// 											return (
				// 												<>
				// 													<tr>


				// 														{vq?.answer ? <td className="f13 fw400" style={{ color: "#1976d2" }}>{vq?.answer} 

				// 														{vq?.ansAttachements && <Tooltip title={getFileName(vq?.ansAttachements)}><IconButton
				// 																onClick={() =>
				// 																	downloadFilesOnAzure(
				// 																		vq?.ansAttachements,
				// 																		getFileName(vq?.ansAttachements),
				// 																		atoken
				// 																	)
				// 																}
				// 																size="small"
				// 																edge="start"
				// 															>
				// 																<GrAttachment  /> 
				// 															</IconButton> </Tooltip>}



				// 														</td> : <td className="f13 fw400">
				// 															No response



				// 														</td>}
				// 										            {/* {vq?.vendorRanking  ?	<td className="f13 fw400" style={{ color: "#1976d2" }}>{"R"+vq?.vendorRanking} </td>: <td className="f13 fw400">N/A</td>} */}
				// 													</tr>


				// 												</>
				// 											);
				// 										})}
				// 								</tbody>
				// 											</Table>





				// 										</div>
				// 									</div>
				// 								</div>
				// 							);
				// 						})}
				// </div>
				//   </div>
				//     </div>

				<EventRFIQuestion
					props={{
						eventid: pageSlug,
						eventtype: "RFI",
						librarytype: "QuestionLibrary",
						action: false,
						questionresponses: QuestionResponses,
						callback:()=>{
							RFQcomparativeReport();
						}
						
					}}

				/>


			) : (
				<></>
			)}

			{/* {value == 3 ? (
				<>
					<SupplierTechnicalResponses EventId={pageSlug} />
				
				</>
			) : (
				<></>
			)} */}

			{value == 4 ? (
				<>
					{vendorItemAnalysis?.length > 0 &&
						vendorItemAnalysis.filter(v => v?.submissionDate != null).map((item, index) => {

							const panelId = `panel${index}`; // Unique id for each accordion panel
							return (
								<Accordion
									key={index}
									expanded={expandedSupplierAttachment === panelId}
									onChange={handleSupplierAttachment(panelId)} // Handles opening/closing
								>
									<AccordionSummary
										expandIcon={<ExpandMoreOutlined />}
										aria-controls={`${panelId}d-content`}
										id={`${panelId}d-header`}
									>
										<Typography className="fw700 f13">
											{/* Display title and submission date */}
											{item.tradeName} <br />
											<small>{item.email}</small>
										</Typography>
									</AccordionSummary>

									<AccordionDetails>
										<SupplierAttachmentCell
											eventid={pageSlug}
											eventtype={`RFQ`}
											satoken={atoken}
											vendorid={item?.vendorId}
											action={false}
										/>
									</AccordionDetails>
								</Accordion>
							);

						})

					}
				</>
			) : (
				<></>
			)}



			<>






				{/* {PO modal} */}
				<Modal
					size="md"
					show={openPoDetail}
					backdrop="static"
					// keyboard={false}
					//  className=""
					// backdropClassName=""
					centered
					contentClassName="border-0 rounded"
					className="zindex1280"
					backdropClassName="zindex1280"
					onHide={() => handleClosePoDetail()}
				>
					<Modal.Header className="pt-2 pb-2 bgheaderCards">
						<Modal.Title id="modal-heading">
							<div className="d-flex align-items-center f14 text-white">
								PO Details
							</div>
						</Modal.Title>

						<IconButton
							onClick={() => handleClosePoDetail()}
							size="small"
							edge="start"
						>
							<HiOutlineX className="text-white" />
						</IconButton>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
							<div
								className="row"
								style={{
									paddingLeft: ".7rem",
									paddingRight: ".7rem",
									paddingTop: ".7rem",
								}}
							>
								{selectedpodetails?.poNumber && <Table striped bordered hover responsive className="mb-0 pb0">
									<thead>
										<tr>
											{/* <th className="f12 fw500">SrNo.</th> */}
											<th className="f12 fw500"> PO No</th>
											<th className="f12 fw500">PO Date </th>
											<th className="f12 fw500">Vendor Name</th>
											<th className="f12 fw500">Unit Rate</th>
											{/* <th className="f12 fw500">Po Value</th> */}
										</tr>
									</thead>
									<tbody>
										<tr>
											{/* <td className="f12 fw400">1</td> */}
											<td className="f12 fw400">{selectedpodetails?.poNumber}</td>
											<td className="f12 fw400">{selectedpodetails?.poDate}</td>
											<td className="f12 fw400">{selectedpodetails?.poVendorName}</td>
											{/* <td className="f12 fw400">{selectedpodetails?.poNumber}</td> */}
											<td className="f12 fw400">
												{selectedpodetails?.poUnitRate}{" "}
												<Tooltip title={"Base Currency"}>
													<span> {rfqheaderdetails && rfqheaderdetails[0]?.baseCurrency}  </span>
												</Tooltip>
											</td>
										</tr>
									</tbody>
								</Table>}
							</div>
						</div>
					</Modal.Body>
				</Modal>
				{/* {loading factor modal} */}
				<Modal
					size="md"
					show={openLoadingF}
					backdrop="static"
					// keyboard={false}
					//  className=""
					// backdropClassName=""
					centered
					contentClassName="border-0 rounded"
					className="zindex1280"
					backdropClassName="zindex1280"
					onHide={() => handleCloseLoadingF()}
				>
					<Modal.Header className="pt-2 pb-2 bgheaderCards">
						<Modal.Title id="modal-heading">
							<div className="d-flex align-items-center f14 text-white">
								Loading Factor
							</div>
						</Modal.Title>

						<IconButton
							onClick={() => handleCloseLoadingF()}
							size="small"
							edge="start"
						>
							<HiOutlineX className="text-white" />
						</IconButton>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
							<div
								className="row"
								style={{
									paddingLeft: ".7rem",
									paddingRight: ".7rem",
									paddingTop: ".7rem",
								}}
							>
								<Table striped bordered hover responsive className="mb-0 pb0">
									<thead>
										<tr>
											<th className="f12 fw500">Reason</th>
											<th className="f12 fw500"> Loading Type</th>
											<th className="f12 fw500">Loading Factor</th>
											<th className="f12 fw500">Loading Factor Amount</th>
										</tr>
									</thead>
									<tbody>
										{selectedLoadingF &&
											selectedLoadingF?.map((loading) => {
												return (
													<>
														<tr>
															<td className="f12 fw400">
																{loading?.FactorDesc}
															</td>
															<td className="f12 fw400">
																{loading?.FactorType == "P"
																	? "Percentage"
																	: "Absolute"}
															</td>
															<td className="f12 fw400">
																{loading?.FactorType == "P"
																	? loading?.FactorPerc
																	: ""}
															</td>

															<td className="f12 fw400">
																{loading?.LoadingAmount}{" "}
																<Tooltip title={"Base Currency"}>
																	<span> {rfqheaderdetails && rfqheaderdetails[0]?.baseCurrency}  </span>
																</Tooltip>
															</td>
														</tr>
													</>
												);
											})}
									</tbody>
								</Table>
							</div>
						</div>
					</Modal.Body>
				</Modal>





			</>
		</div>
	);
};

export default ERFIComparative;


