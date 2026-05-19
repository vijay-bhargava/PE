import axios from "axios";
import CryptoJS from "crypto-js";
const domain = process.env.REACT_APP_API_CALL;
export const customerid = 1;

let required = true;

export const saveWorkflow = async (Data, atoken) => {
	try {
		let data = {
			//        "customerId": 1,
			stageId: parseInt(Data?.stageId),
			wfname: Data?.wfname,
			eventtype: Data?.eventtype || "",
			amountfrom: parseInt(Data?.amountfrom),
			amountto: parseInt(Data?.amountto),
			deviationprc: parseInt(Data?.deviationprc),
			cond1: Data?.cond1,
			cond2: Data?.cond2,
			currencyType: Data?.currencyType,
			emailevent: Data?.emailevent,
			isactive: Data?.isactive,
			purchorggroup: Data?.purchorggroup,
			wfapproverusers: Data?.wfapproverusers,
			workFlowRules: Data?.workFlowRules,
			approverusertype: Data?.approverusertype,
		};
		const saveWorkFlow_ENDPOINT = `${domain}api/WorkFlow/Add`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(saveWorkFlow_ENDPOINT, data, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export const updatedworkflow = async (Data, id, atoken) => {
	
	// let purchorggroups = [];

	// // Check if Data and its nested properties exist before mapping
	// if (Data?.purchorggroup && Data.purchorggroup.length > 0) {
	//     // Iterate over the purchorggroup array
	//     Data.purchorggroup.forEach(group => {
	//         // Check if group.purchgroup exists and is an array
	//         if (group.purchgroup && Array.isArray(group.purchgroup)) {
	//             // Iterate over the purchgroup array within each group
	//             group.purchgroup.forEach(subgroup => {
	//                 // Extract the desired properties and push them into purchorggroups array
	//                 purchorggroups.push({
	//                     wfid: Data.id, // Assuming Data.id is the correct property
	//                     purorgid: group.orgId,
	//                     groupName: subgroup.groupName,
	//                     purgrpid: subgroup.id
	//                 });
	//             });
	//         }
	//     });
	// }

	try {
		let data = {
			id: id,
			// customerId:id,
			wfname: Data?.wfname,
			approverusertype: Data?.approverusertype,
			eventtype: Data?.eventtype || "",
			amountfrom: parseInt(Data?.amountfrom),
			amountto: parseInt(Data?.amountto),
			deviationprc: 0,
			cond1: Data?.cond1,
			cond2: Data?.cond2,
			currencyType: Data?.currencyType,
			stageId: parseInt(Data?.stageId),
			wfoverride: true,
			required: Data?.required,
			isactive: Data?.isactive,
			emailevent: Data?.emailevent,
			purchorggroup: Data?.purchorggroup,
			wfapproverusers: Data?.wfapproverusers,
			workFlowRules: Data?.workFlowRules,
		};

		const getUpdated_ENDPOINT = `${domain}api/WorkFlow/Update`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.post(getUpdated_ENDPOINT, data, { headers });

		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export const getPurchaseOrg = async (data, atoken) => {
	try {
		const getPO_ENDPOINT = `${domain}api/OrgMaster/Find`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(getPO_ENDPOINT, { headers });
		if (response?.status === 200) {
			return response?.data?.result;
		}
	} catch (error) {
		console.log(error);
	}
};
// export const FindBankDetailsAll = async (data, id, cookies) => {
//   const queryParams = Object.entries(data)
//     .filter(
//       ([key, value]) => value !== null && value !== undefined && value !== ""
//     )
//     .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
//     .join("&");
//   try {
//     console.log(data);

//     const ENDPOINT = `${domain}api/managevendors/${id}/getbank`;

//     const token = CryptoJS.AES.decrypt(
//       cookies.patkn,
//       process.env.REACT_APP_TOKEN_INCRYPT_KEY
//     ).toString(CryptoJS.enc.Utf8);
//     const headers = {
//       accept: "application/json",
//       // "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     };

//     const response = await axios.get(ENDPOINT, { headers });
//     return response.data;
//   } catch (error) {
//     console.log(error);
//   }
// };

export const getPurchaseGrp = async (data, atoken) => {
	//let id=data?.id ? data.id : 1
	try {
		const getPG_ENDPOINT = `${domain}api/common/GetPurshaseOrgGrp?customerId=${data.customerId}&pagenumber=${data.pagenumber}&isActive=${data.isActive}&purchOrgId=${data.purchOrgId}`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(getPG_ENDPOINT, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export const getEmailEvent = async (eventtype) => {
	try {
		const getEE_ENDPOINT = `${domain}api/EmailMaster/Find?mailtype=${eventtype}`;
		const response = await axios.get(getEE_ENDPOINT);
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export async function getwfapproverseqn(data, atoken) {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const getwfapproverseqn_ENDPOINT = `${domain}api/WorkFlow/FindWFApprover?${queryParams}`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(getwfapproverseqn_ENDPOINT, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
}

export const getworkflowlistprev = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const getWF_ENDPOINT = `${domain}api/WorkFlow/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(getWF_ENDPOINT, { headers });
		console.log("response", response);
		if (response?.status === 200) {
			return response.data;
		}
	} catch (error) {
		console.log(error);
	}
};

export const getworkflowlist = async (data, atoken) => {
	
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const getWF_ENDPOINT = `${domain}api/WorkFlow/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(getWF_ENDPOINT, { headers });
		//  console.log(response);
		if (response?.status === 200) {
			return response?.data?.result;
		}
	} catch (error) {
		//
		console.log(error);
	}
};


export const getWFRuleCriteria = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const getWF_ENDPOINT = `${domain}api/WorkFlow/FindWFCriteria?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(getWF_ENDPOINT, { headers });
		//  console.log(response);
		if (response?.status === 200) {
			return response?.data?.result;
		}
	} catch (error) {
		//
		console.log(error);
	}
};


export const getuserlist = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const getUL_ENDPOINT = `${domain}api/User/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			// "Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(getUL_ENDPOINT, { headers });
		return response?.data?.result;
	} catch (error) {
		console.log(error);
	}
};

export async function getworkflowFilter(url) {
	try {
		const response = await axios.get(url);
		return response.data;
	} catch (error) {
		console.log(error);
	}
}

export const getprefilledworkflow = async (id) => {
	try {
		const getPrefilled_ENDPOINT = `${domain}api/WorkFlowp/FindById?Id=${id}`;
		const response = await axios.get(getPrefilled_ENDPOINT);
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export const AddWFApprover = async (data, atoken) => {
	try {
		const getUpdated_ENDPOINT = `${domain}api/WorkFlow/AddWFApprover`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.post(getUpdated_ENDPOINT, data, { headers });
		//
		return response.data;
	} catch (error) {
		console.log(error);
	}
};
export async function getOrgGroup(wfid, atoken) {
	try {
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const getwfapproverseqn_ENDPOINT = `${domain}api/WorkFlow/getOrgGroup?wfid=${wfid}`;
		const response = await axios.get(getwfapproverseqn_ENDPOINT, { headers });

		return response.data;
	} catch (error) {
		console.log(error);
	}
}
