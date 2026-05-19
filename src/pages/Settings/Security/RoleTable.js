import React, { useEffect, useState } from 'react';
import { HiChevronDown, HiChevronUp, HiOutlineX, HiPlusSm } from 'react-icons/hi';
import { Button, Select, MenuItem, FormControl, InputLabel, Box, Tabs, Tab, TextField, Autocomplete, IconButton } from '@mui/material';
import { BackButton } from '../../../utils/common/component';
import { api, ApiClient } from '../../../Apiclient';
import { useStateValue } from '../../../store';
import { buildQueryParams } from '../../../utils/purchaseRequest';
import { findObjByValueFromArray } from '../../../utils/common';
import { toast } from 'react-toastify';
import { LoadingButton } from '@mui/lab';
import AddUpdateRole from '../RoleManagement/AddUpdateRole';
import { Modal } from "react-bootstrap";

const RolesTable = () => {



  const [expandedModule, setExpandedModule] = useState(null);



  const handleExpandToggle = (moduleId,index) => {
    setExpandedModule(prev => (prev === moduleId ? null : moduleId));
    handleChange(index)
  };


  //abheedev
  const [{ atoken, rtoken, customerid,customersuffix, roleClaims }, dispatch] =
		useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [loading, setLoading] = useState(false);
  const [roleList, setRoleList] = useState([]);
  const [gridloading, setGridloading] = useState(true);
	const [value, setValue] = React.useState(1);
  const [selectedRole, setSelectedRole] = useState(1);
	const [selectedRoleId, setSelectedRoleId] = useState(1);
  const [mapclaims, setMapclaims] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [prefilledArr, setPrefilledArr] = useState([]);
  const [inputList, setInputList] = useState([]);
  const [tablist, setTabList] = useState([]);
  const [menufeatures, setMenuFeatures] = useState([]);
  // const claimValue = ["Read", "Create", "Remove", "Assign", "Share"];
  const claimValue = ["Read", "Create","Edit", "Remove"];
  const RoleRights = [
    { label: "None"},
    { label: 'User'},
    { label: 'Team'},
    { label: 'Department' },
    { label: 'Business Unit' }, 
    { label: 'Legal Entity' }, 
    { label: 'Admin'}
];
const CreateRights = [
  { label: "None"},
  { label: 'User'},

];
const restrictedCreateRights=["List"]
	
  useEffect(() => {
		pullGetRoles();
	}, []);
  const [RoleModal, setRoleModal] = useState(false);
  const CloseRoleModal = () => setRoleModal(false);
  const OpenRoleModal = () => setRoleModal(true);
  const handleRoleList = () => {
    // Your logic for handling the role list update
  };
	const pullGetRoles =async () => {
		var data = {
			customerid: customerid,
		};
   const queryParams=buildQueryParams(data)
		setLoading(true);
    const res = await apiClient.getres(`api/rolemanagement/roles?${queryParams}`,atoken);
    if(res){
      setGridloading(true);

			if (res?.data?.length) {
        const data =res?.data?.filter(x=>x.name != "Super Admin")
				setRoleList(data);
        setSelectedRoleId(data[0].id)
			} else {
				setRoleList([]);
			}
    
			setLoading(false);
			setGridloading(false);
      
    }

    //module data fetching
    const res2 = await apiClient.get(
      `api/customer/${customerid}`,
      atoken
    );
    if(res2){
    
    const submodule=res2?.subscriptions[0]?.subscriptionModule;
    console.log("res2",res2?.subscriptions[0]?.subscriptionModule?.filter(x=>x.moduleId == 9 && 10));
      setTabList(res2?.subscriptions[0]?.subscriptionModule)
      handleTabonLoad( res2?.subscriptions[0]?.subscriptionModule, 0,res?.data?.filter(x=>x.name != "Super Admin")[0].id)
     
    }
  
		
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
		const mappedAccessLevels = inputList?.map((obj) => {
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

  

  const handleTabonLoad = async (tablist, newValue,selectedRoleId) => {
		console.log("Tab",tablist);
		setMapclaims([]);
		const MenuIdentity = tablist[newValue]?.moduleName;

		setSelectedModule(MenuIdentity);
		//setValue(newValue);

		const obj = {
			MenuName: MenuIdentity,
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
      const claimValue = ["Read", "Create","Edit", "Remove"];
			// const claimValue = ["Read", "Create", "Remove", "Assign", "Share"];
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
		const mappedAccessLevels = mappedArray?.map((obj) => {
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

const handleChange = async ( newValue) => {
		
  setMapclaims([]);
  const MenuIdentity = tablist[newValue]?.moduleName;
  setSelectedModule(MenuIdentity);
 // setValue(newValue+1);
  const obj = {
    MenuName: MenuIdentity,
  };
  const queryParams = buildQueryParams(obj);

  const res = await apiClient.get(
    `api/MenuMaster/Find?${queryParams}`,
    atoken
  );
  const mappedArray = [];
  
  if (res && res?.result.length>0) {
    setMenuFeatures(res?.result[0]?.menuFeatures);
    const featuresobj = res?.result[0]?.menuFeatures;
    const claimValue = ["Read", "Create","Edit", "Remove"];
    // const claimValue = ["Read", "Create", "Remove", "Assign", "Share"];
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

  return (
    <>
      <div className="d-flex justify-content-between minh50px align-items-center bg-grey p-2">
        <BackButton title="Manage Role"/>
        <div>
          <div className="action-wrap">
            <Button
               variant="contained"              
              size="medium"
              startIcon={<HiPlusSm />}
              className="text-capitalize font-normal"
              onClick={OpenRoleModal}
            >
              Add New
            </Button>
          </div>
        </div>
      </div>
      <div className='new-container mx-3'>
      <Box sx={{ width: "100%" }}>
    <Tabs
      value={value}
      onChange={(event, newValue) => setValue(newValue)}
      textColor="primary"
      className="tabstheme"
      indicatorColor="primary"
      sx={{
        '.MuiTabs-flexContainer': {
          marginBottom: "10px",
        },
       '.MuiTabs-scroller': {
          overflowX: 'none !important', // Adding !important here
        },
      }}
    >
      <Tab value={0} label='Roles'  disabled />
      {roleList?.map((role,i)=>{
             const index=i+1;
             return (<Tab value={index} label={role?.name} 
              className={` p-2 tabs rounded  ${
              selectedRole === index ? "bgLblue" : "bgWhite"
            }`}
            role="button"
            onClick={() => handleRoleClick(index, role?.id)} />)
      })
      
      }
      
    </Tabs>
  </Box>
      </div>
      <div className=''>
     
             <div className='mx-3 table-wrapper'>
        <table className="roles-table">
  <thead>
    <tr>
      <th className='sticky-header-new'>Module Name</th>
      {claimValue?.map((claim)=>{
          return (<th className='sticky-header-new'>{claim}</th>)
      })
            }      
      
    </tr>
  </thead>
  <tbody>
    {tablist && tablist?.map((module,index) => 
    {
      
      return  (
        <React.Fragment key={module.id}>
          <tr className='border'>
            <td className='sticky-col'>
              <div className='row'>
                <div className='col-md-12 d-flex justify-content-between'>
                  {module.moduleName}
                  <span className='d-flex justify-content-end'>
                    <Button onClick={() => handleExpandToggle(module.id,index)}>
                      {expandedModule === module.id ? <HiChevronDown /> : <HiChevronUp />}
                    </Button>
                  </span>
                </div>
              </div>
            </td>
          </tr>
          {expandedModule === module.id && (
            <>
      
  

                          <tr className='m-0 p-0'>
              <td className='m-0 p-0' colSpan="8">
                <table className="nested-table">
                  <tbody>
                    {Array.from(new Set(inputList?.map(feature => feature.claimType)))?.map((claimType, index) =>
                    {
                      
                      const claimTypeEntries = inputList.filter(feature => feature.claimType === claimType);
                      
                      return  (
                        <tr key={index}>
                        <td>{claimType}</td>
                        
                        {claimValue?.map((value, valueIndex) => {
                            const claim = claimTypeEntries.find(item => item.claimValue === value);
                            
                            const isCreateRight=  claim?.claimValue =='Create' && restrictedCreateRights.includes(claim?.claimType)
                            console.log("Claim",claim.claimType);
                            const isAudithistory = claim?.claimType == 'Audit History' &&claim?.claimValue!='Read';
                            const isList = claim?.claimType == 'List' &&claim?.claimValue=='Remove';
                            const isGeneral = claim?.claimType == 'General' &&claim?.claimValue=='Remove';
                            return (
                                <td key={valueIndex}>
                                    <Autocomplete
                                        disabled ={(isAudithistory) || (isList) || (isGeneral)}
                                        disablePortal
                                        disableClearable
                                        id={`${value}-${index}`}
                                        size='small'
                                        options={isCreateRight ?  CreateRights:RoleRights}
                                        getOptionLabel={(option) => option?.label ?? ""}
                                        fullWidth
                                        renderInput={(params) => <TextField {...params} InputLabelProps={{ shrink: true }} label="" />}
                                        sx={{ width: '160px' }}
                                        defaultValue={findObjByValueFromArray(RoleRights, claim?.accessLevel, 'label')}
                                        value={findObjByValueFromArray(RoleRights, claim?.accessLevel, 'label')}
                                        onChange={(e, v) => handleInputChange(e, v, selectedModule, claimType, value, selectedRoleId)}
                                    />
                                </td>
                            );
                        })}
                    </tr>
                      )
                    }
                    
                    )}
                     <tr>
       <td colSpan={8} style={{textAlign:"end"}}> {inputList && inputList?.length>0 &&<LoadingButton
      color="primary"
      size="medium"
      onClick={saveMapClaim}
      className="text-white text-capitalize mb-3 mt-3"
      variant="contained"
      type="button"
      disabled={mapclaims.length > 0 ? false : true}
    >
      <span>Save Changes</span>
    </LoadingButton>}
  </td>
      
       </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            
            </>
            
          )}
        </React.Fragment>
      )
    }
   )}
  </tbody>
</table>
        </div>
      </div>
      <Modal
            size="lg"
            show={RoleModal}
            backdrop="static"
            keyboard={false}
            value={"Add NEW CATEGORY"}
            className="zindex1280"
            backdropClassName="zindex1280"
            centered
            contentClassName="border-0"
            onHide={() => CloseRoleModal()}
          >
            <Modal.Header className="pt-2 pb-2 bgheaderCards">
              <Modal.Title id="modal-heading">
                <div className="d-flex align-items-center f14 text-white">
                  Manage  Role 
                </div>
              </Modal.Title>
              <IconButton
                onClick={() => CloseRoleModal()}
                size="small"
                edge="start"
              >
                <HiOutlineX className="f20 text-white" />
              </IconButton>
            </Modal.Header>
            <Modal.Body className="">
              <div className="p-3">
                <AddUpdateRole handleRoleList={handleRoleList}  />
              </div>
            </Modal.Body>
          </Modal>
    </>
  );
};

export default RolesTable;
