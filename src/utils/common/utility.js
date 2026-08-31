import axios from "axios";
import CryptoJS from "crypto-js";
import { Cookies } from "react-cookie";
import { customerid } from "../workflow";
import * as XLSX from "xlsx";
import { findObjByValueFromArray, toastoption } from ".";
import { toast } from "react-toastify";
import { UOMMasterList } from "../commerciallibrary";
import { actionTypes } from "../../store";
import { createFilterOptions } from "@mui/material";
import { json } from "react-router-dom";
import moment from "moment";
const domain = process.env.REACT_APP_API_CALL;

export function formatDate(inputDate) {
	let idate = inputDate.toString().replace("-", "");

	const date = new Date(idate);
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${year}-${month}-${day}`;
}

export function LocalFormatDate(inputDate) {
	//console.log("",inputDate);
	if (inputDate != "" && inputDate != null) {
		let idate = inputDate?.toString().replace("-", "");
		// console.log(inputDate);
		const date = new Date(inputDate);
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		return date.toLocaleDateString(); //`${year}-${month}-${day}`;
	} else {
		const date = new Date(inputDate);
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		return date.toLocaleDateString();
	}
}

export const uploadfiles = async (data) => {
	try {
		const getUpdated_ENDPOINT = `${domain}api/common/uploadfiles`;
		const response = await axios.post(getUpdated_ENDPOINT, data);
		//
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export const AddPurcOrg = async (Data, atoken) => {
	let data = {
		id: 0,
		customerId: Data?.customerid,
		orgGroupMsts: Data?.orgGroupMsts,
		orgName: Data?.orgName,
		externalSourceCode: Data?.externalSourceCode,
		isActive: Data?.isActive,
	};

	try {
		const ENDPOINT = `${domain}api/OrgMaster/Add`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export const UpdatePuchaseOrg = async (Data, id, atoken) => {

	let data = {
		id: id,
		customerId: Data?.customerid,
		orgGroupMsts: Data?.orgGroupMsts,
		orgName: Data?.orgName,
		externalSourceCode: Data?.externalSourceCode,
		isActive: Data?.isActive,
		address: Data?.address,
	};
	try {
		const ENDPOINT = `${domain}api/OrgMaster/Update`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export const GetPurshaseOrg = async (data) => {
	try {
		const ENDPOINT = `${domain}api/common/GetOrg?columnName=&value=&customerid=${data?.customerid}&isActive=${data?.isActive}&pagenumber=${data?.pagenumber}`;
		const response = await axios.get(ENDPOINT, data);
		return response.data;
	} catch (error) {
		console.log(error);
	}
};
export const getPurchaseOrgList = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const url = `${domain}api/OrgMaster/Find?${queryParams}`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(url, { headers });
		if (response?.status === 200) {
			return response?.data?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

export const AddPurcOrgGrp = async (Data, atoken) => {
	let data = {
		id: 0,
		//"customerId": Data?.customerid,
		orgMstId: parseInt(Data?.orgMstId),
		orgName: Data?.orgName,
		groupName: Data?.groupName,
		externalSourceCode: Data?.externalSourceCode,
		isActive: Data?.isActive,
		address: Data?.address,
	};

	try {
		const ENDPOINT = `${domain}api/OrgGroupMaster/Add`;
		// const token = CryptoJS.AES.decrypt(
		//   cookies.patkn,
		//   process.env.REACT_APP_TOKEN_INCRYPT_KEY
		// ).toString(CryptoJS.enc.Utf8);
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export const UpdatePurchOrgGrp = async (Data, atoken, id) => {

	let data = {
		id: id,
		orgMstId: parseInt(Data?.orgMstId),
		groupName: Data?.groupName,
		orgName: Data?.orgName,
		externalSourceCode: Data?.externalSourceCode,
		isActive: Data?.isActive,
		address: Data?.address,
	};
	try {
		const ENDPOINT = `${domain}api/OrgGroupMaster/Update`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export const OrgGroupMasterList = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const getPO_ENDPOINT = `${domain}api/OrgGroupMaster/Find?${queryParams}`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(getPO_ENDPOINT, { headers });

		if (response?.status === 200) {
			console.log("data api", response?.data?.result);
			return response?.data?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

// export const GetPurshaseOrg=async(data) => {
//   try {
//     const ENDPOINT = `${domain}api/common/GetOrgGrp?customerid=${data?.customerid}&purchOrgId=${data?.purchOrgId}&isActive=${data?.isActive}&pagenumber=${data?.pagenumber}`;
//     const response = await axios.get(ENDPOINT, data);
//     return response.data;
//   } catch (error) {
//       console.log(error)
//   }
// }

// export const AddNFACondition=async(data) => {
//
//   try {
//     const ENDPOINT = `${domain}api/Common/AddNFACondition`;
//     const response = await axios.post(ENDPOINT, data);
//     return response.data;
//   } catch (error) {
//       console.log(error)
//   }
// }

export const AddCondition = async (Data, atoken) => {
	try {
		let data = {
			id: 0,
			customerId: customerid,
			conditionName: Data?.conditionName,
			conditionSrNo: Data?.conditionSrNo,
			isActive: Data?.isActive,
		};

		const ENDPOINT = `${domain}api/Condition/Add`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export const UpdateCondition = async (Data, id, atoken) => {
	try {
		let data = {
			id: id,
			customerId: customerid,
			conditionName: Data?.conditionName,
			conditionSrNo: Data?.conditionSrNo,
			isActive: true,
		};

		const ENDPOINT = `${domain}api/Condition/Update`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export const GetNFACondition = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const ENDPOINT = `${domain}api/Condition/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getEventStage = async (data, atoken) => {
	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");

	try {
		const ENDPOINT = `${domain}api/EventStage/Find?${queryParams}`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(ENDPOINT, { headers });

		if (response?.status === 200) {
			return response?.data?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getuserlist = async (data, atoken) => {
	try {
		const ENDPOINT = `${domain}api/User/Find?CustomerId=${data?.CustomerId}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(ENDPOINT, { headers });

		return response?.data?.result;
	} catch (error) {
		console.log(error);
	}
};

export const getMenuMaster = async (data, atoken) => {

	var eventsetvalue = "";

	if (data?.MenuType != null && data?.MenuType != undefined) {
		// eventsetvalue = "MenuType="+data?.MenuType;
		eventsetvalue = `MenuType=${encodeURIComponent(data.MenuType)}`;
	}

	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");

	try {
		const ENDPOINT = `${domain}api/MenuMaster/Find?${eventsetvalue}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(ENDPOINT, { headers });

		;
		if (response?.status === 200) {

			return response?.data?.result;
		}

	} catch (error) {
		console.log(error);
	}
};

export const getEventApprovers = async (data, atoken) => {

	try {

		const queryParams = Object.entries(data?.requestApprover)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");
		if (queryParams) {
			const url = `${domain}api/eventapprover/Find?${queryParams}`;
			const headers = {
				accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${atoken}`,
			};

			const response = await axios.get(url, { headers });

			if (response?.status === 200) {
				return response?.data?.result;
			}
		}




	} catch (error) {
		console.log(error);
	}
};

export const getEventApproverslist = async (data, atoken) => {

	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const url = `${domain}api/eventapprover/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(url, { headers });

		if (response?.status === 200) {
			return response?.data?.result;
		}
	} catch (error) {
		console.log(error);
	}
};


export const getEventApproversFind = async (data, atoken) => {

	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const url = `${domain}api/eventapprover/EventApproversFind?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(url, { headers });

		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getEventApproversRFQ = async (data, atoken) => {

	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const url = `${domain}api/eventapprover/EventApproversFindRFQ?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(url, { headers });

		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const AddEventApprovers = async (data, atoken) => {
	try {

		const ENDPOINT = `${domain}api/eventapprover/Add`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

export const DeleteEventApprover = async (data, atoken) => {
	try {
		const ENDPOINT = `${domain}api/eventapprover/Delete`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getCurrency = async (data, atoken) => {
	try {
		const ENDPOINT = `${domain}api/Currency/Find`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(ENDPOINT, {
			headers,
			params: {
				IsActive: true,
			},
		});

		if (response?.status === 200) {
			return response?.data?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getWorkFlowList = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const url = `${domain}api/WorkFlow/Find?${queryParams}`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		;
		const response = await axios.get(url, { headers });
		if (response?.status === 200) {
			return response?.data?.result;

		}
	} catch (error) {
		console.log(error);
	}
};

export const ActionWFAddApprover = async (data, atoken) => {

	try {
		const ENDPOINT = `${domain}api/eventapprover/WFAddApprover`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.post(ENDPOINT, data, { headers });

		if (response?.status === 200) {
			return response?.data;
			//return response?.data?.result;
		}
	} catch (error) {
		console.log(error);
	}
};
export const FindDepartmentList = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const ENDPOINT = `${domain}api/BussinessDepartment/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		var isActive = true;
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};
export const getBusinessUnit = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const ENDPOINT = `${domain}api/LegalEntity/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		var isActive = true;
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};
export const getUserDepartment = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const ENDPOINT = `${domain}api/LegalEntity/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		var isActive = true;
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};
export const getUserDepartmentList = async (data, atoken) => {

	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const ENDPOINT = `${domain}api/Department/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		var isActive = true;
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};


export const getBusinessUnitList = async (data, atoken) => {

	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const ENDPOINT = `${domain}api/BusinessUnit/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		var isActive = true;
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};
export const BusinessUnitAdd = async (data, atoken) => {
	;
	try {

		const ENDPOINT = `${domain}api/BusinessUnit/Add`;


		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};
export const BusinessUnitUpdate = async (data, id, atoken) => {
	try {
		const ENDPOINT = `${domain}api/BusinessUnit/Update`;


		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};
export const LegalEntityAdd = async (data, atoken) => {
	;
	try {
		const ENDPOINT = `${domain}api/LegalEntity/Add`;


		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};
export const LegalEntityUpdate = async (data, id, atoken) => {
	try {
		const ENDPOINT = `${domain}api/LegalEntity/Update`;


		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};
export const getUserDesignation = async (data, atoken) => {
	;
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const ENDPOINT = `${domain}api/Designation/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		var isActive = true;
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

//Note:Excepted date_String 2024-03-01T05:43:10.5616139
export const formatDateViaTimeZone = (dateString, locale, formatoption) => {

	if (dateString) {
		const date = new Date(dateString);
		const formattedDate = new Intl.DateTimeFormat(locale, formatoption).format(
			date
		);
		return formattedDate;
	}
};

//for testing purpose
export const formatDateViaTimeZonet = (dateString, locale, formatoption) => {
	if (dateString) {
		const date = new Date(dateString);
		const formattedDate = new Intl.DateTimeFormat(locale, formatoption).format(
			date
		);
		return formattedDate;
	}
};
export const formatDateViaTime = (dateString, locale, formattimeoption) => {
	if (dateString) {

		// Check if dateString contains 'Z' and append it if not
		const formattedDateString = dateString?.endsWith('Z') ? dateString : dateString + 'Z';
		const date = new Date(formattedDateString);
		const formattedDate = new Intl.DateTimeFormat(locale, formattimeoption).format(
			date
		);
		return formattedDate;
	}
};
//checking and correcting  dateString for Z 
export const checkUTC = (dateString) => {
	if (dateString) {
		const formattedDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
		return formattedDateString
	}

	return ""
}
//to get fromat pattern based on locale


export const formatoption = {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	// hour: '2-digit',
	// minute: '2-digit',
	hour12: false,
	timeZone: "Asia/Kolkata",

};

export const formattimeoption = {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	hour: '2-digit',
	minute: '2-digit',
	hour12: true,
	timeZone: "Asia/Kolkata",
	// timeZoneName: "short",

};

export const RFQManageAdd = async (data, atoken) => {
	try {
		const ENDPOINT = `${domain}api/RFQManage/Add`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const RFQManageUpdate = async (data, atoken) => {
	try {
		const ENDPOINT = `${domain}api/RFQManage/Update`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getRFQManageFind = async (data, atoken) => {
	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");
	try {
		const ENDPOINT = `${domain}api/RFQManage/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};


export const getRFQManageFindById = async (data, atoken) => {
	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");
	try {
		const ENDPOINT = `${domain}api/RFQManage/FindById?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};


export const RFQItemServiceAdd = async (data, atoken, accesslevel) => {

	try {
		const querydata = {
			AccessLevel: accesslevel
		};

		const queryParams = buildQueryParams(querydata)
		const ENDPOINT = `${domain}api/RFQItemService/Add?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {

		const message = error?.response?.data?.Message
		toast.error(message, {
			toastId: "itemroleerror"
		})
	}
};
export const RFQItemServiceUpdate = async (data, atoken) => {
	try {
		const ENDPOINT = `${domain}api/RFQItemService/Update`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getRFQItemServiceFind = async (data, atoken) => {
	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");
	try {
		const ENDPOINT = `${domain}api/RFQItemService/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

export const RFQItemServiceDelete = async (data, atoken) => {

	try {
		const ENDPOINT = `${domain}api/RFQItemService/Delete`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const buildQueryParams = (data) => {
	const filteredData = Object.entries(data).filter(
		([key, value]) => value !== null && value !== undefined && value !== ""
	);

	const queryParams = filteredData
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");

	return queryParams;
};

export const getLibraryOrgEntityFind = async (data, atoken) => {
	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");
	try {
		const ENDPOINT = `${domain}api/LibraryOrgEntity/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getCommercialLibFind = async (data, atoken) => {

	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");
	try {
		const ENDPOINT = `${domain}api/CommercialLib/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

export const RFQCommLibraryAdd = async (data, idFromURL, atoken) => {
	try {
		const ENDPOINT = `${domain}api/RFQCommLibrary/${idFromURL}/Add`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getQuestionsLibFind = async (data, atoken) => {
	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");
	try {
		const ENDPOINT = `${domain}api/QuestionsLib/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

export const RFQQuestionLibAdd = async (data, idFromURL, atoken) => {

	try {
		const ENDPOINT = `${domain}api/RFQQuestionLib/${idFromURL}/Add`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const phoneRegExp = /^[0-9]+$/;

//handle sample file download
//to handle download bulk invite
export const downloadSample = (headers, data, filename) => {
	const wb = XLSX.utils.book_new();
	const wsName = "Sheet1";

	// Convert data to worksheet
	const wsData = [
		headers.map((header) => header.header),
		...data.map((row) => headers.map((header) => row[header.key] || "")),
	];
	const ws = XLSX.utils.aoa_to_sheet(wsData);

	// Add worksheet to workbook
	XLSX.utils.book_append_sheet(wb, ws, wsName);

	// Write workbook and initiate download
	XLSX.writeFile(wb, filename);
};


export const getObjIndexfromArr = (stagelist, currentStage) => {

	const index = stagelist.findIndex(stage => stage.currentStage.trim() === currentStage.trim());
	return index ?? 0;
};


export const extractPAN_Number = (inputStr) => {
	// Check if the length of the string is 15
	if (inputStr.length === 15) {
		// Remove the first two characters and the last three characters
		var processedStr = inputStr.substring(2, inputStr.length - 3);
		return processedStr;
	} else {
		return "";
	}
};
const RoleRights = [
	{ label: "None" },
	{ label: "User" },
	{ label: "Admin" },
	{ label: "Department" },
	{ label: "Business Unit" },
	{ label: "Legal Entity" },
];

export const getAccessLevel = (
	prefilledArr,
	featureName,
	claimType,
	claimValue,
	roleId
) => {
	const matchingEntry = prefilledArr.find(
		(entry) =>
			entry.featureName === featureName &&
			entry.claimType === claimType &&
			entry.claimValue === claimValue &&
			entry.roleId === roleId
	);

	if (matchingEntry) {
		const obj = findObjByValueFromArray(
			RoleRights,
			matchingEntry?.accessLevel,
			"label"
		);

		return obj;
	} else {
		const obj = findObjByValueFromArray(
			RoleRights,
			'None',
			"label"
		)
		return obj
	}
}



export const downloadSampleEvent = (sheets, filename) => {
	const wb = XLSX.utils.book_new();

	sheets.forEach(sheet => {
		const wsName = sheet.name;

		if (sheet.headers && wsName === 'ItemDetails') {
			// Convert data to worksheet
			const wsData = [sheet.headers.map(header => {
				if (header.mandatory) {
					return {
						v: header.header,
						s: {
							font: {
								bold: true // Make the text bold
							},
							fill: {
								bgColor: { rgb: "b2b2b2" },// Green fill color
								color: "b2b2b2"
							}
						}
					};
				} else {
					return header.header;
				}
			})];

			const ws = XLSX.utils.aoa_to_sheet(wsData);

			// Add worksheet to workbook
			XLSX.utils.book_append_sheet(wb, ws, wsName);
		} else if (sheet.data && wsName === 'ItemDetails') {
			// Add worksheet with provided data
			const ws = XLSX.utils.aoa_to_sheet(sheet.data);

			// Apply green fill color to mandatory fields
			sheet.headers.forEach(header => {
				if (header.mandatory) {
					const range = XLSX.utils.decode_range(ws['!ref']);
					for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
						const cellRef = XLSX.utils.encode_cell({ c: header.key.split('rfq')[1], r: rowNum });
						const cell = ws[cellRef];
						if (cell) {
							cell.s = { fill: { bgColor: { rgb: "00FF00FF" } } };
						}
					}
				}
			});

			// Add worksheet to workbook
			XLSX.utils.book_append_sheet(wb, ws, wsName);
		} else if (sheet.data) {
			// Add worksheet with provided data
			const ws = XLSX.utils.aoa_to_sheet(sheet.data);

			// Add worksheet to workbook
			XLSX.utils.book_append_sheet(wb, ws, wsName);
		}
	});

	// Write workbook and initiate download
	XLSX.writeFile(wb, filename);
};


export const handleFileUploadItem = (file, sheets) => {

	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {

			const data = e.target.result;
			const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];

			const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, dateNF: 'mm/dd/yyyy' });
			if (jsonData.length < 1) {
				toast.info(`please add items to upload excel`, { toastid: "uploadexc" });
				return;
			}

			const headers = Object.keys(jsonData[0]);
			const expectedHeaders = sheets[0].headers;
			if (headers.length !== expectedHeaders?.length) {
				toast.error(`Please check the file or download sample template and try again.`, { toastid: "downloadexec" });

				return;
			}
			for (let i = 0; i < expectedHeaders.length; i++) {

				if (headers[i].trim() !== expectedHeaders[i]?.header.trim()) {

					toast.error(
						`Column header mismatch please check'.`,
						{ toastid: "columnheader" }
					);
					return;
				}
			}





			resolve(jsonData);
		};

		reader.onerror = (error) => {
			reject(error);
		};

		reader.readAsBinaryString(file);
	});
};

export const formatDatelineitems = (dateString) => {

	if (!dateString) return null;
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export const formatNumber = (value) => {
	const num = parseFloat(value);
	return isNaN(num) ? '0.00' : num.toFixed(2);
};

export const checkRFQLineItems = async (data, atoken) => {


	let isValid = true;

	try {

		const uomMasterList = await UOMMasterList("", atoken); // Fetch UOMMasterList data


		for (let i = 0; i < data.length; i++) {

			const x = data[i];
			x.poValue = formatNumber(x.poValue);
			x.unitRate = formatNumber(x.unitRate);
			x.poDate = formatDatelineitems(x.poDate);
			x.delivery = formatDatelineitems(x.delivery);

			if (!x.itemName || !x.itemCode || !x.description) {
				isValid = false;
				toast.error(`One or more required fields are empty or missing in line item ${x?.itemName}.`, { toastid: "lineitem" });
				return isValid;
			}

			// Validate UOM against allowed values
			const UOMsList = uomMasterList.map(item => item.uom);
			if (!UOMsList.includes(x.uom)) {

				isValid = false;
				toast.error(`Invalid UOM '${x.uom}'. Please select a valid UOM from the list.`, { toastid: "UOM" });
				return isValid;
			}
		}
	} catch (error) {
		console.error("Error:", error);
		isValid = false;
	}

	return isValid;
};

export const renderHtmlAsText = (htmlString) => {
	return <div className="col-md-12 bw" dangerouslySetInnerHTML={{ __html: htmlString }} />;
}

export function extractTextFromHTML(html) {
	// Create a temporary DOM element
	var tempElement = document.createElement('div');

	// Set the HTML content of the temporary element
	tempElement.innerHTML = html;

	// Get the plain text content by accessing the textContent property
	return tempElement.textContent || tempElement.innerText || "";
}


export const scrollToTarget = (targetId) => {
	const targetElement = document.getElementById(targetId);
	if (targetElement) {
		targetElement.scrollIntoView({ behavior: 'smooth' });
	}
};

export const scrollToTargetC = (targetId) => {
	const targetElement = document.getElementById(targetId);
	const scrollContainer = document.querySelector('.custom-fix'); // Select the custom scrollbar container

	if (targetElement && scrollContainer) {
		// Scroll within the custom scrollbar container
		scrollContainer.scrollTo({
			top: targetElement.offsetTop,
			behavior: 'smooth'
		});
	}
};

export const getUomList = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const url = `${domain}api/UOM/Find?${queryParams}`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(url, { headers });
		if (response.status === 200) {
			return response.data.result;
		} else return "";
	} catch (error) {
		console.log(error);
	}
};
export const AddUom = async (Data, atoken) => {


	let data = {
		customerId: Data?.customerid,
		id: 0,
		uom: Data?.uom,
		isActive: Data?.isActive,
	};

	try {
		const url = `${domain}api/UOM/Add`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(url, data, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
};
export const UpdateUom = async (Data, id, atoken) => {

	let data = {
		customerId: Data?.customerid,
		id: id,
		uom: Data?.uom,
		isActive: Data?.isActive,
	};

	try {
		const url = `${domain}api/UOM/Update`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(url, data, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
}

export const purchaseOrgGroupModal = (inputArray, eventType, stageId) => {
	const mappedArray = inputArray.flatMap(item =>
		item.orgPurchGroup.map(group => ({
			id: 0, // Add id field as required by API
			eventType: eventType,
			orgId: item.orgId.id,
			orgName: item.orgId.orgName,
			orgGroupId: group.id,
			orgGroupName: group.groupName,
			stageId: stageId > 0 ? stageId : 0,
		}))
	);
	return mappedArray
}

// New function for EventStage API that matches EventStage API specification
export const purchaseOrgGroupModalForEventStage = (inputArray, eventType, stageId) => {
	const mappedArray = inputArray.flatMap(item =>
		item.orgPurchGroup.map(group => ({
			id: 0,
			eventType: eventType || "",
			orgId: item.orgId.id,
			orgName: item.orgId.orgName,
			orgGroupId: group.id,
			orgGroupName: group.groupName,
			stageId: stageId || 0
		}))
	);
	return mappedArray
}




export const mapInputtopurchaseOrgGroupModal = (inputArray) => {

	// Create an empty object to store unique orgId mappings
	let uniqueOrgIds = {};

	// Iterate through array1 to populate uniqueOrgIds
	inputArray?.forEach(item => {
		// Check if orgId already exists in uniqueOrgIds
		if (!uniqueOrgIds[item.orgId]) {
			// Initialize orgId entry in uniqueOrgIds with orgName and empty orgPurchGroup array
			uniqueOrgIds[item.orgId] = {
				orgId: {
					id: item.orgId,
					orgName: item.orgName,
					externalSourceCode: "",
					isActive: true,
					orgGroupMsts: []
				},
				orgPurchGroup: []
			};
		}

		// Add orgPurchGroup entry to uniqueOrgIds
		uniqueOrgIds[item.orgId].orgPurchGroup.push({
			id: item.orgGroupId,
			orgMstId: item.orgGroupId, // Assuming orgMstId should be the same as id
			groupName: item.orgGroupName,
			externalSourceCode: "",
			isActive: true
		});
	});

	// Convert uniqueOrgIds object into mappedArray format
	const mappedArray = Object.values(uniqueOrgIds);

	return mappedArray;
}
export const replaceOrgMstIds = (mappedList, purchasegrpList) => {
	const purchasegrpListDict = {};
	purchasegrpList.forEach(item => {
		purchasegrpListDict[item.groupName] = item.orgMstId;
	});

	mappedList.forEach(item => {
		item.orgPurchGroup.forEach(group => {
			group.orgMstId = purchasegrpListDict[group.orgGroupName] || null;
		});
	});

	return mappedList;
}


export const checkIf60DaysOrLessLeft = (endDateStr) => {
	// Parse the end date string into a Date object
	const endDate = new Date(endDateStr);

	// Get the current date
	const currentDate = new Date();

	// Calculate the difference in milliseconds
	const differenceMs = endDate.getTime() - currentDate.getTime();

	// Convert milliseconds to days
	const differenceDays = differenceMs / (1000 * 60 * 60 * 24);

	// Check if the difference is 60 days or less
	return differenceDays <= 60;
}

// Example usage:
const endDateStr = "2025-05-19T19:10:00";
const result = checkIf60DaysOrLessLeft(endDateStr);
console.log(result); // This will output true or false based on the current date


export const emailadditionalModal = (arr) => arr.map(({ emailadditional, contactPerson, contactNo }) => ({
	contactPerson,
	contactNo,
	email: emailadditional
}));

export const EventQuestionVQModal = (responsesForQuestion) => {
	console.log("=== EventQuestionVQModal called ===");
	console.log("Input responsesForQuestion:", responsesForQuestion);

	const result = {};

	// Add validation for input parameter
	if (!responsesForQuestion || typeof responsesForQuestion !== 'object') {
		console.warn("EventQuestionVQModal: Invalid input parameter");
		return result;
	}

	for (const [key, value] of Object.entries(responsesForQuestion)) {
		// Add null/undefined check for value
		if (!value || typeof value !== 'object') {
			console.warn(`EventQuestionVQModal: Skipping invalid value for key ${key}:`, value);
			continue;
		}

		result[key] = {
			id: value.id || null,
			vendorDetailId: value.vqHeaderId || null,
			questionId: value.questionId || null,
			questionDescription: value.questionDescription || "",
			questionRequirement: value.questionRequirement || null,
			ansAttachements: value.ansAttachements || null,
			answer: value.answer || null,
			vendorQuestOptions: value.questionOption || [],
			weightage: value.weightage || 0,
			score: value.score || 0,
			optionType: value.optionType || false,
			questionCategory: value.questionCategory || "",
			questionSubCategory: value.questionSubCategory || "",
			attachedFileName: value.attachedFileName || "",
			libraryId: value.libraryId || null,
			libraryEntity: "",
			version: 1,
			attachement: value.attachement || false,
			mandatory: value.mandatory || false,
			vendorId: value.vendorId || null,
			questioncategoryId: value.categoryId || null,
			questionSubcategoryId: value.categorySubId || null
		};
	}

	console.log("EventQuestionVQModal result:", result);
	return result;
};










export const getemailadditionalModal = (arr) => arr.map(({ id, contactPerson, contactNo, email }) => ({
	id,
	emailadditional: email,
	contactPerson,
	contactNo
}));


export const filteroptionDialingCode = createFilterOptions({
	matchFrom: 'any',
	stringify: (option) => option.dialingCode,
	trim: true,
	limit: 10,
	ignoreCase: true,
	ignoreAccents: true
});

// export const filteroptionDialingCode = (options, state) => {

// 	const searchValue = state.inputValue?.toString().trim();

// 	if (!searchValue) {
// 	  return options; // If no search value, return all options
// 	}

//    const list =options
//    .filter((option) => {

// 	 const dialingCode = option.dialingCode?.toString().trim();
// 	 return dialingCode && (
// 	   dialingCode.includes(searchValue) || dialingCode === searchValue
// 	 );
//    })
//    console.log("DClist",searchValue,list)
// 	return list
//   };




//Auctions
export const getAuctionManageFind = async (data, atoken, pageNumber = 1, pageSize = 10) => {

	// const queryParams = Object.entries(data)
	// 	.filter(
	// 		([key, value]) => value !== null && value !== undefined && value !== ""
	// 	)
	// 	.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
	// 	.join("&");
	const paramString = Object.entries(data)
		.filter(([key, value]) => value !== null && value !== undefined && value !== "")
		.map(([key, value]) => `parameters[${key}]=${encodeURIComponent(value)}`)
		.join("&");
	try {
		//const ENDPOINT = `${domain}api/AuctionManage/Find?${queryParams}`;

		const ENDPOINT = `${domain}api/AuctionManage/Find?${paramString}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });

		if (response?.status === 200) {

			// return response?.data?.result;
			return response?.data;

		}
	} catch (error) {
		console.log(error);
	}
};


// export const bidlist = {
// 	"1": { "id": 1, "bidTypeName": "Forward Auction", "isActive": true },
// 	"2": { "id": 2, "bidTypeName": "Reverse Auction", "isActive": true },
// 	"3": { "id": 3, "bidTypeName": "Freight Auction", "isActive": true },
// 	"4": { "id": 4, "bidTypeName": "Formula Based Auction", "isActive": true },
// 	"5": { "id": 5, "bidTypeName": "French Forward Auction", "isActive": true },
// 	"6": { "id": 6, "bidTypeName": "French Reverse Auction", "isActive": true }

// }
export const bidlist = {
	1: { id: 1, bidTypeName: "Forward Auction", isActive: true },
	2: { id: 2, bidTypeName: "Reverse Auction", isActive: true },
	3: { id: 3, bidTypeName: "Freight Auction", isActive: true },
	4: { id: 4, bidTypeName: "Formula Based Auction", isActive: true },
	5: { id: 5, bidTypeName: "French Forward Auction", isActive: true },
	6: { id: 6, bidTypeName: "French Reverse Auction", isActive: true },
};

export const AuctionItemServiceAdd = async (data, atoken) => {
	try {
		const ENDPOINT = `${domain}api/AuctionParameters/Add`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const AuctionItemServiceUpdate = async (data, atoken) => {
	try {
		const ENDPOINT = `${domain}api/AuctionParameters/Update`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getAuctionItemServiceFind = async (data, atoken) => {
	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");
	try {
		const ENDPOINT = `${domain}api/AuctionParameters/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

export const AuctionCommLibraryAdd = async (data, idFromURL, atoken) => {

	try {
		const ENDPOINT = `${domain}api/AuctionCT/${idFromURL}/Add`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.post(ENDPOINT, data, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};


export const getReportColumns = async (data, atoken) => {

	try {

		const ENDPOINT = `${domain}api/ReportConfig/ReportColumns?ReportName=${data?.slug}&CustomerId=${data?.customerId}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getRFQSummaryReport = async (params, atoken) => {
	try {


		const ENDPOINT = `${domain}api/RFQManage/RFQSummaryReport?${params}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(ENDPOINT, { headers });

		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.error('Error in getRFQSummaryReport:', error);
	}
};
// export const getRFQSummaryReport = async (data, atoken) => {

// 	try {
// 		const ENDPOINT = `${domain}api/RFQManage/RFQSummaryReport`;
// 		const headers = {
// 			accept: "application/json",
// 			"Content-Type": "application/json",
// 			Authorization: `Bearer ${atoken}`,
// 		};
// 		const response = await axios.post(ENDPOINT, data, { headers });
// 		if (response?.status === 200) {
// 			return response?.data;
// 		}
// 	} catch (error) {
// 		console.log(error);
// 	}
// };

export const getRFQSavingSummaryReport = async (data, atoken) => {
	try {
		const ENDPOINT = `${domain}api/RFQManage/RFQSavingSummaryReport `;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};
export const getRFQSummaryDetailedReport = async (data, atoken) => {
	try {
		const ENDPOINT = `${domain}api/RFQManage/RFQSummaryDetailedReport `;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getBIDSummaryReport = async (data, atoken) => {

	try {
		const ENDPOINT = `${domain}api/AuctionManage/SummaryReport`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};
export const getBIDSavingSummaryReport = async (data, atoken) => {
	try {
		const ENDPOINT = `${domain}api/AuctionManage/SavingSummaryReport`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getBIDSummaryDetailedReport = async (data, atoken) => {
	try {
		const ENDPOINT = `${domain}api/AuctionManage/SummaryDetailedReport`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			return response?.data;
		}
	} catch (error) {
		console.log(error);
	}
};
export const PE_CHATBOT_API = `https://peaichatbot.azurewebsites.net/chatbot/ask/`
export const PE_CHATBOT_Web_API = `https://peaichatbot.azurewebsites.net/chatbot/askweb/`



export const formatbidtime = (timeDiff) => {
	// Calculate total hours, minutes, and seconds
	const hours = Math.floor(timeDiff / (1000 * 60 * 60));
	const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

	// Format time in HH:mm:ss
	const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	return formattedTime;
};



export const VendorfilterOptions = createFilterOptions({
	matchFrom: "any",
	stringify: (option) => `${option.contactPerson} ${option.email} `,
});

export const formatTimeWithIST = (dateString, locale = 'en-US') => {
	if (dateString) {
		// Check if dateString contains 'Z' and append it if not
		const formattedDateString = dateString?.endsWith('Z') ? dateString : dateString + 'Z';
		const date = new Date(formattedDateString);

		// Options for time formatting with AM/PM (using IST)
		const timeOptions = {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: true,
			timeZone: 'Asia/Kolkata', // IST (Indian Standard Time) timezone
		};

		const formattedTime = new Intl.DateTimeFormat(locale, timeOptions).format(date);

		return formattedTime;
	}
};


export const savedelegation = async (Data, atoken) => {
	let data = [{
		id: Data?.id,
		approverRef_id: Data?.approverRef_id,
		preApproverId: Data?.preApproverId,
		approverId: Data?.approverId,
		approverSeq: Data?.approverSeq,
		eventId: Data?.eventId,
		eventType: Data?.eventType,
		approverType: Data?.approverType,
		wfStage: Data?.wfStage,
		wfId: Data?.wfId,
		stageId: Data?.stageId,
		fromDate: Data?.fromDate,
		toDate: Data?.toDate
	}]

	try {
		const ENDPOINT = `${domain}/api/eventapprover/EventApproverDelegate`;
		// const token = CryptoJS.AES.decrypt(
		//   cookies.patkn,
		//   process.env.REACT_APP_TOKEN_INCRYPT_KEY
		// ).toString(CryptoJS.enc.Utf8);
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(ENDPOINT, data, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
};







export const getCurrentDateonFormat = (locale, option, format) => {

	const date = new Date();
	const utcDate = new Date(date.toISOString());

	const options = JSON.parse(option);
	const formattedDate = new Intl.DateTimeFormat(locale, { ...options }).format(utcDate);
	// Return the formattedDate as is if no specific format was found
	return formattedDate;
}


export const getCurrentTimeonFormat = (option, format) => {

	const date = new Date();
	const utcDate = new Date(date.toISOString());

	const options = JSON.parse(option);
	const formattedDate = new Intl.DateTimeFormat('en-US', { ...options }).format(utcDate);
	// Return the formattedDate as is if no specific format was found
	return formattedDate;
}



export const getUserDateFormat = (date, locale, option) => {

	const utcDate = new Date(date.toISOString());

	const options = JSON.parse(option);
	const formattedDate = new Intl.DateTimeFormat(locale, { ...options }).format(utcDate);
	// Return the formattedDate as is if no specific format was found
	return formattedDate;
}
export const getUserTimeFormat = (date, option) => {


	const utcDate = new Date(date.toISOString());

	const options = JSON.parse(option);
	const formattedDate = new Intl.DateTimeFormat('en-US', { ...options }).format(utcDate);
	// Return the formattedDate as is if no specific format was found
	return formattedDate;
}

const defaultdateoption = '{"year":"2-digit","month":"2-digit","day":"2-digit"}';
const defaulttimeoption = '{"hour": "2-digit", "minute": "2-digit", "second": "2-digit"}';
const defaultlocale = 'en-GB';
const defaulttimeZone = 'Asia/Calcutta';
// for handling isostring
export const formatDateViaLocale = (dateString, userDetail, isSecond = false) => {

	if (dateString) {

		//getting user time locale parameters
		const datelocale = userDetail?.dateLocale || defaultlocale;
		const dateoption = userDetail?.datePattern || defaultdateoption;
		const timeoption = userDetail?.timePattern || defaulttimeoption;
		const timelocale = userDetail?.timeLocale || defaultlocale
		const timeZone = userDetail?.timeZone || defaulttimeZone


		// Check if dateString contains 'Z' and append it if not
		const formattedDateString = dateString?.endsWith('Z') ? dateString : dateString + 'Z';
		const date = new Date(formattedDateString);
		const Dateoptions = dateoption ? JSON.parse(dateoption) : JSON.parse(defaultdateoption);
		const Timeoption = timeoption ? JSON.parse(timeoption) : JSON.parse(defaulttimeoption);
		const option = { ...Dateoptions, ...Timeoption };
		//let formatoption={...option}

		let formatdateoption = { ...Dateoptions, timeZone: timeZone }
		let formattimeoption = { ...Timeoption, timeZone: timeZone }

		if (!isSecond) {
			delete formattimeoption?.second
		}

		const formattedDate = new Intl.DateTimeFormat(datelocale, formatdateoption).format(
			date
		);

		const formattedTime = new Intl.DateTimeFormat(timelocale, formattimeoption).format(
			date
		);

		return `${formattedDate}  ${formattedTime}`;
	}
};

export const formatDateViaLocaleonlydatenottime = (dateString, userDetail) => {

	if (dateString) {

		//getting user date locale parameters
		const datelocale = userDetail?.dateLocale || defaultlocale;
		const dateoption = userDetail?.datePattern || defaultdateoption;
		const timeZone = userDetail?.timeZone || defaulttimeZone;

		// Check if dateString contains 'Z' and append it if not
		const formattedDateString = dateString?.endsWith('Z') ? dateString : dateString + 'Z';
		const date = new Date(formattedDateString);
		const Dateoptions = dateoption ? JSON.parse(dateoption) : JSON.parse(defaultdateoption);

		let formatdateoption = { ...Dateoptions, timeZone: timeZone };

		const formattedDate = new Intl.DateTimeFormat(datelocale, formatdateoption).format(
			date
		);

		return formattedDate;
	}
};

export const formatDateViaLocale2 = (dateString, userDetail, isSecond = false) => {
	if (dateString) {
		//getting user time locale parameters
		const datelocale = userDetail?.dateLocale || defaultlocale;
		const dateoption = userDetail?.datePattern || defaultdateoption;
		const timeoption = userDetail?.timePattern || defaulttimeoption;
		const timelocale = userDetail?.timeLocale || defaultlocale
		const timeZone = userDetail?.timeZone || defaulttimeZone


		// Check if dateString contains 'Z' and append it if not
		//	const formattedDateString = dateString?.endsWith('Z') ? dateString : dateString + 'Z';
		const date = new Date(dateString.toISOString());
		const Dateoptions = dateoption ? JSON.parse(dateoption) : JSON.parse(defaultdateoption);
		const Timeoption = timeoption ? JSON.parse(timeoption) : JSON.parse(defaulttimeoption);
		const option = { ...Dateoptions, ...Timeoption };
		//let formatoption={...option}

		let formatdateoption = { ...Dateoptions, timeZone: timeZone }
		let formattimeoption = { ...Timeoption, timeZone: timeZone }

		if (!isSecond) {
			delete formattimeoption?.second
		}

		const formattedDate = new Intl.DateTimeFormat(datelocale, formatdateoption).format(
			date
		);

		const formattedTime = new Intl.DateTimeFormat(timelocale, formattimeoption).format(
			date
		);

		return `${formattedDate}  ${formattedTime}`;
	}
};


export const getDateFormatPatteronLocale = (userDetail) => {

	const locale = userDetail?.dateLocale || defaultlocale;
	const timeoption = userDetail?.timePattern || defaulttimeoption;
	const Timeoption = timeoption ? JSON.parse(timeoption) : JSON.parse(defaulttimeoption);



	const formatMapping = {
		'en-US': 'MM/DD/YYYY',
		'en-GB': 'DD/MM/YYYY',
		'fr-FR': 'DD/MM/YYYY',
		'de-DE': 'DD.MM.YYYY',
		'ja-JP': 'YYYY/MM/DD',
		'es-ES': 'DD/MM/YYYY',
		'it-IT': 'DD/MM/YYYY',
		'ar-SA': 'DD/MM/YYYY',
		'ko-KR': 'YYYY.MM.DD',
		'lv-LV': 'DD.MM.YYYY',
		'fr-CA': 'YYYY-MM-DD'


	};

	const dateformat = formatMapping[locale] || 'DD/MM/YYYY'
	let timeformat = 'HH:mm:ss';
	if (Timeoption.hour12)
		timeformat = 'hh:mm:ss A'

	return `${dateformat} ${timeformat}`
};


export const userampm = (userDetail) => {

	const timeoption = userDetail?.timePattern || defaulttimeoption;
	const Timeoption = timeoption ? JSON.parse(timeoption) : JSON.parse(defaulttimeoption);
	if (Timeoption.hour12) {
		return true
	}

	return false


}

export const getEventDetails = async (data, atoken) => {
	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");
	try {

		const ENDPOINT = `${domain}api/NFAManage/FindEventforNFA?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
}

export const getNFAProjectList = async (data, atoken) => {
	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");
	try {

		const ENDPOINT = `${domain}api/NFAProject/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
}
export const getNFAConditionList = async (data, atoken) => {
	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");
	try {
		const ENDPOINT = `${domain}api/NFACondition/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
}

export const getNFASpendList = async (data, atoken) => {
	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");
	try {

		const ENDPOINT = `${domain}api/NFASpend/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
}

export const getNFAManageFind = async (data, atoken, pageNumber = 1, pageSize = 10) => {
	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");
	try {
		const ENDPOINT = `${domain}api/NFAManage/Find?${queryParams}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};


export const getNFAManageFindById = async (data, atoken) => {
	const queryParams = Object.entries(data)
		.filter(
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");
	try {
		const ENDPOINT = `${domain}api/NFAManage/FindById?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(ENDPOINT, { headers });
		if (response?.status === 200) {
			const d = response?.data;
			return Array.isArray(d) ? d : d?.result;
		}
	} catch (error) {
		console.log(error);
	}
};

export const isMobile = () => {
	return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};


export const cleanAndConvertToArray = (str) => {

	if (!str) return str
	// Remove the unwanted symbols
	const cleaned = str.replace(/None|<=|>=|\+|\-|\*|\/|%|=|{|}|\(|\)|<|>/g, ' ');
	// Split the cleaned string into an array by whitespace and filter out empty elements
	const resultArray = cleaned.trim().split(/\s+/).filter(Boolean);
	const resultstring = resultArray.join(',');
	return resultstring;
}

export const getOnlyDateFormatPatternLocale = (userDetail) => {

	const locale = userDetail?.dateLocale || defaultlocale;

	const formatMapping = {
		'en-US': 'MM/DD/YYYY',
		'en-GB': 'DD/MM/YYYY',
		'fr-FR': 'DD/MM/YYYY',
		'de-DE': 'DD.MM.YYYY',
		'ja-JP': 'YYYY/MM/DD',
		'es-ES': 'DD/MM/YYYY',
		'it-IT': 'DD/MM/YYYY',
		'ar-SA': 'DD/MM/YYYY',
		'ko-KR': 'YYYY.MM.DD',
		'lv-LV': 'DD.MM.YYYY',
		'fr-CA': 'YYYY-MM-DD'
	};

	const dateformat = formatMapping[locale] || 'DD/MM/YYYY';

	return dateformat;   // <-- only date format returned
};


//   export const refreshPageRoute = () => {
//     navigate(location.pathname, { replace: true });
//   };





