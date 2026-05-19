import React, { useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import {
	Autocomplete,
	Box,
	Button,
	Drawer,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Tab,
	Tabs,
	TextField,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { HiOutlineX, HiPlusSm } from "react-icons/hi";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import Table from "react-bootstrap/Table";
import SecurityRFQCell from "./SecurityRFQCell";
import { actionTypes, useStateValue } from "../../../store";
import { getUserRoles, getuserlist } from "../../../utils/users";
import AddUpdateRole from "../RoleManagement/AddUpdateRole";
import { Modal } from "react-bootstrap";
import { ApiClient, api } from "../../../Apiclient";
import { buildQueryParams } from "../../../utils/common/utility";
import { toast } from "react-toastify";
import { BackButton } from "../../../utils/common/component";

const Security = () => {
	const apiClient = new ApiClient(customersuffix);
	const [value, setValue] = React.useState(0);
	const [{ atoken, rtoken, customerid, roleClaims }, dispatch] =
		useStateValue();
	const [roleList, setRoleList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [gridloading, setGridloading] = useState(true);
	const [modal, setModal] = useState(false);
	const CloseModal = () => {
		setModal(false);
		//seteditRecordData(null);
	};

	const OpenModal = (event) => {
		if (!state.opensidebar) {
			//seteditRecordData(null);
		}

		if (
			event &&
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}

		setState({ ...state, opensidebar: true });
		setModal(true);
	};
	useEffect(() => {
		pullGetRoles();
	}, []);

	const pullGetRoles = () => {
		var data = {
			customerid: customerid,
		};

		setLoading(true);

		getUserRoles(data, atoken).then((res) => {
			console.log(data);

			setGridloading(true);

			if (res?.length) {
				setRoleList(res);
			} else {
				setRoleList([]);
			}

			setLoading(false);
			setGridloading(false);
		});
	};

	const [state, setState] = useState({
		opensidebar: false,
	});
	
	const [tablist, setTabList] = useState([]);
	const [menufeatures, setMenuFeatures] = useState([]);
	const handleTabList = async () => {
		
	   const res = await apiClient.get(
			`api/customer/${customerid}`,
			atoken
		);
		setTabList(res?.subscriptions[0]?.subscriptionModule)
		handleTabonLoad(res?.subscriptions[0]?.subscriptionModule, 0);
		
   }
	useEffect(() => {
		handleTabList()
		//setTabList(roleClaims);
		
	}, []);
	const [selectedModule, setSelectedModule] = useState("");
	const handleChange = async (event, newValue) => {
		
		setMapclaims([]);
		const MenuIdentity = tablist[newValue]?.moduleName;
		setSelectedModule(MenuIdentity);
		setValue(newValue);
		const obj = {
			MenuIdentity: MenuIdentity,
		};
		const queryParams = buildQueryParams(obj);

		const res = await apiClient.get(
			`api/MenuMaster/Find?${queryParams}`,
			atoken
		);
		const mappedArray = [];
		if (res) {
			setMenuFeatures(res?.result[0]?.menuFeatures);
			const featuresobj = res?.result[0]?.menuFeatures;
			
			// const claimValue = ["Read", "Create", "Remove", "Assign", "Share"];
			const claimValue = ["Read", "Create","Edit", "Remove"];
			featuresobj?.forEach((obj) => {
				claimValue?.forEach((value) => {
					mappedArray.push({
						...obj,
						claimValue: value,
					});
				});
			});

			setInputList(mappedArray);
		} else {
			setMenuFeatures([]);
			setInputList([]);
		}

		const res2 = await apiClient.get(
			`api/rolemanagement/${selectedRoleId}/claims?eventType=${MenuIdentity}`,
			atoken
		);

		if (res2) {
			setPrefilledArr(res2);
		} else {
			setPrefilledArr([]);
		}
		;
		//setting access value to input list
		const claimMap = new Map();
		res2?.forEach((item) => {
			const key = `${item.claimType}-${item.claimValue}`;
			claimMap.set(key, item.accessLevel);
		});

		// Map accessLevel values based on claimType and claimValue from the second array
		const mappedAccessLevels = mappedArray.map((obj) => {
			const key = `${obj.claimType}-${obj.claimValue}`;
			const accessLevel = claimMap.has(key) ? claimMap.get(key) : "None";
			return {
				...obj,
				accessLevel,
			};
		});
		setInputList(mappedAccessLevels);
		;
	};
	const [selectedRole, setSelectedRole] = useState(0);
	const [selectedRoleId, setSelectedRoleId] = useState(1);

	const [prefilledArr, setPrefilledArr] = useState([]);

	const handleTabonLoad = async (tablist, newValue) => {
		    
		setMapclaims([]);
		const MenuIdentity = tablist[newValue]?.moduleName;

		setSelectedModule(MenuIdentity);
		setValue(newValue);

		const obj = {
			MenuIdentity: MenuIdentity,
		};
		const queryParams = buildQueryParams(obj);

		const res = await apiClient.get(
			`api/MenuMaster/Find?${queryParams}`,
			atoken
		);
		const mappedArray = [];
		if (res) {
			setMenuFeatures(res?.result[0]?.menuFeatures);
			const featuresobj = res?.result[0]?.menuFeatures;

			// const claimValue = ["Read", "Create", "Remove", "Assign", "Share"];
			const claimValue = ["Read", "Create","Edit", "Remove"];
			featuresobj?.forEach((obj) => {
				claimValue?.forEach((value) => {
					mappedArray.push({
						...obj,
						claimValue: value,
					});
				});
			});

			setInputList(mappedArray);
		} else {
			setMenuFeatures([]);
			setInputList([]);
		}
		const res2 = await apiClient.get(
			`api/rolemanagement/${selectedRoleId}/claims?eventType=${MenuIdentity}`,
			atoken
		);

		if (res2) {
			setPrefilledArr(res2);
		} else {
			setPrefilledArr([]);
		}
		;
		//setting access value to input list
		const claimMap = new Map();
		res2?.forEach((item) => {
			const key = `${item.claimType}-${item.claimValue}`;
			claimMap.set(key, item.accessLevel);
		});

		// Map accessLevel values based on claimType and claimValue from the second array
		const mappedAccessLevels = mappedArray.map((obj) => {
			const key = `${obj.claimType}-${obj.claimValue}`;
			const accessLevel = claimMap.has(key) ? claimMap.get(key) : "None";
			return {
				...obj,
				accessLevel,
			};
		});
		setInputList(mappedAccessLevels);
		;
	};

	const handleRoleClick = async (index, roleid) => {
		setSelectedRole(index);
		setSelectedRoleId(roleid);
		setMapclaims([]);
		const res2 = await apiClient.get(
			`api/rolemanagement/${roleid}/claims?eventType=${selectedModule}`,
			atoken
		);

		if (res2) {
			;
			setPrefilledArr(res2);
		} else {
			setPrefilledArr([]);
		}

		;
		//setting access value to input list
		const claimMap = new Map();
		res2?.forEach((item) => {
			const key = `${item.claimType}-${item.claimValue}`;
			claimMap.set(key, item.accessLevel);
		});

		// Map accessLevel values based on claimType and claimValue from the second array
		const mappedAccessLevels = inputList.map((obj) => {
			const key = `${obj.claimType}-${obj.claimValue}`;
			const accessLevel = claimMap.has(key) ? claimMap.get(key) : "None";
			return {
				...obj,
				accessLevel,
			};
		});
		setInputList(mappedAccessLevels);
		;
	};
	const [mapclaims, setMapclaims] = useState([]);

	const handleMapClaim = (claimType, claimValue, accessLevel) => {
    
    if (accessLevel) {
        const existingIndex = mapclaims.findIndex(obj => obj.claimType === claimType && obj.claimValue === claimValue);
        if (existingIndex !== -1) {
            const updatedClaims = [...mapclaims];
            updatedClaims[existingIndex] = {
                featureName: selectedModule,
                claimType: claimType,
                claimValue: claimValue,
                accessLevel: accessLevel,
            };
            setMapclaims(updatedClaims);
        } else {
            const newobj = {
                featureName: selectedModule,
                claimType: claimType,
                claimValue: claimValue,
                accessLevel: accessLevel,
            };
            setMapclaims([...mapclaims, newobj]);
        }
    }
};

	const saveMapClaim = async () => {
		if (mapclaims.length < 1) {
			toast.error(`please make changes to save`);
			return;
		}
		const res = await apiClient.postres(
			`/api/rolemanagement/${selectedRoleId}/mapclaims`,
			mapclaims,
			atoken
		);
		if (res) {
			toast.success(`Changes Saved Successfully`);
			setMapclaims([]);
		}
		const res2 = await apiClient.get(
			`api/rolemanagement/${selectedRoleId}/claims?eventType=${selectedModule}`,
			atoken
		);

		if (res2) {
			setPrefilledArr(res2);
		} else {
			setPrefilledArr([]);
		}
	};

	//###
	const [inputList, setInputList] = useState([]);
	const handleInputChange = (
		e,
		v,
		selectedModule,
		claimType,
		claimValue,
		selectedRoleId
	) => {
		const list = [...inputList];
		// Find the index of the object in inputList where claimType and claimValue match
		const index = list.findIndex(
			(item) => item.claimType === claimType && item.claimValue === claimValue
		);
		// Update the accessLevel field of the found object with value v
		if (index !== -1) {
			list[index].accessLevel = v.label;
			setInputList(list);
			handleMapClaim(claimType,claimValue,v.label)
		}
	};

	
	return (
		<>
			<div className="container-fluid">
				<div className="row">
									<div className="d-flex justify-content-between minh50px align-items-center bg-grey p-2">

								{/* <div className='page-heading f16'>Manage Suppliers</div> */}
								<BackButton title="Manage Security" />
								<div>
										<div className="actionpin-wrap">
											<Button
												variant="text"
												size="small"
												startIcon={<HiPlusSm />}
												className="text-capitalize blue-text font-normal"
												onClick={() => OpenModal()}
											>
												Add Role
											</Button>
										</div>
									
								</div>
							</div>
					<div className="col-12 col-md-3 col-lg-2  p-3">
						<div className="d-flex flex-column min-vh-100">
							<div className="flex-grow-1">
								<div className="p-2 pe-0">
									<div
										className="tabtheme mb-2  pt-2 pb-2 ps-2 text-white border rounded"
										role="button"
										//onClick={() => handleRoleClick(null, null)}
									>
										Roles
									</div>

									{roleList?.map((roleParam, index) => (
										<div key={index}>
											<div
												className={` p-2 rounded ${
													selectedRole === index ? "bgLblue" : "bgWhite"
												}`}
												role="button"
												onClick={() => handleRoleClick(index, roleParam?.id)}
											>
												{roleParam?.name}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
					<div className="col-12 col-md-10 col-lg-10 p-0">
						<div className="d-flex flex-column min-vh-100">
							
							{selectedRole != null && (
							<div className="flex-grow-1 m-1 ms-0">

									<div className="p-3">
										<div className="rounded">
											<Box sx={{ width: "100%" }}>
												<Tabs
													value={value}
													onChange={handleChange}
													textColor="primary"
													className="tabstheme"
													indicatorColor="primary"
													sx={{
														'.MuiTabs-flexContainer': {
															marginBottom: "10px",
															maxWidth:"1050px",
														  },
														 
													}}
												>
													{tablist &&
														tablist?.map((tab, index) => (
															<Tab value={index} label={tab?.moduleName} className="tabs"/>
														))}
												</Tabs>
											</Box>
										</div>
										{value == value ? (
											<div className="row">
												<div className="col-md-12">

												<SecurityRFQCell
													inputList={inputList}
													menufeatures={menufeatures}
													selectedModule={selectedModule}
													selectedRoleId={selectedRoleId}
													handleMapClaim={handleMapClaim}
													handleInputChange={handleInputChange}
													prefilledArr={prefilledArr}
													mapclaims={mapclaims}
												/>
												</div>
												<div className="row">
													<div className="col-12 text-end">
														
														<LoadingButton
															// loading={loadingBids}
															color="primary"
															
																variant="contained"
										size="medium"
															onClick={saveMapClaim}
															className="text-white text-capitalize mb-3 mr-3 mt-3"
															
															type="button"
															disabled={mapclaims.length > 0 ? false : true}
														>
															<span>Save Changes</span>
														</LoadingButton>
														{/* Add margin-bottom to create a gap */}
													</div>
												</div>
											</div>
										) : (
											<></>
										)}
									</div>
								</div>
							)}
							{/* button for save*/}
						</div>
					</div>
				</div>
			</div>
			<Modal
				size="lg"
				show={modal}
				backdrop="static"
				keyboard={false}
				//  className=""
				// backdropClassName=""
				centered
				contentClassName="border-0 rounded"
				onHide={() => CloseModal()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">
							Manage Role
						</div>
					</Modal.Title>

					<IconButton onClick={() => CloseModal()} size="small" edge="start">
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<AddUpdateRole handleRoleList={setRoleList} />
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
};
export default Security;
