import axios from "axios";
const domain = process.env.REACT_APP_API_CALL;


//To Find User
export const FindUserList = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const url = `${domain}api/User/Find?${queryParams}`;

		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.get(url, { headers });
		if (response?.status === 200) {
			;
			return response?.data?.result;
		}
	} catch (error) {
		console.log(error);
	}
};
//To Find Vendor
export const FindvendorList = async (data, atoken) => {
	
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const url = `${domain}api/Communication/GetEventVendors?${queryParams}`;
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
export const GetRFQVendorList = async (data, atoken) => {
	
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const url = `${domain}api/RFQVendorInvite/Find?${queryParams}`;
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
export const GetBIDVendorList = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const url = `${domain}api/AuctionManage/{bidId}/BIDInvitation?${queryParams}`;
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
//To Insert Message
export const insertMessage = async (Data, atoken) => {
	
	let data = {
	id: 0,
  eventId: Data?.eventId,
  eventType: Data?.eventType,
  eventCode: Data?.eventCode,
  urllink: Data?.urllink,
  vurllink: Data?.vurllink,
  isEmailActive: Data?.isEmailActive,
  customerId: Data?.customerId,
  createdById: Data?.createdById,
  createdByName: Data?.createdByName,
  createdOn: Data?.createdOn,
  commDetails: Data?.commDetails || [],
 // commParticipantUser:Data?.commParticipantUser||[]

	};
;
	try {
		const url = `${domain}api/Communication/Add`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(url, data, { headers });
		
		return response.data;
	} catch (error) {
		console.log(error);
		// Handle error
	}
};


//To Find Message
export const Findmessage = async (data, atoken) => {

	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const url = `${domain}api/Communication/Find?${queryParams}`;
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
//To find thread chat 
export const FindThreadChat = async (data, atoken) => {
	
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const url = `${domain}api/CommThread/Find?${queryParams}`;
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
export const insertThread = async (Data, atoken) => {
	;
	let data = {
		id: 0,
		userName: Data?.userName,
		userEmail: Data?.userEmail,
		fromId: Data?.fromId || 0,
		toVendorId: Data?.toVendorId,
		queryText: Data?.queryText || "",
		parentQueryId: Data?.parentQueryId || 0,
		isRead: Data?.isRead || true,
		commChannel: Data?.commChannel || "",
		commId: Data?.commId || 0,
		eventId: Data?.eventId || 0,
		eventType: Data?.eventType || "",

		userType: Data?.userType || "",
		urllink: Data?.urllink || "",
		customerId: Data?.customerId,
		commAttachment: Data?.commAttachment || [],
		//commDetails: Data?.commDetails || [],
		commParticipantUser: Data?.commParticipantUser || [],

	};
	;
	try {
		const url = `${domain}api/CommThread/Add`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(url, data, { headers });
		;
		return response.data;
	} catch (error) {
		console.log(error);
		// Handle error
	}
};