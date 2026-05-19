import axios from "axios";
import { toast } from "react-toastify";
const domain = process.env.REACT_APP_API_CALL;

//post call for register customers
export const RegisterCustomer = async (Data, atoken) => {

	let data = {
		customerName: Data?.customerName,
		address: Data?.address,
		customerEmail: Data?.customerEmail,
		accountManagerEmail: Data?.accountManagerEmail,
		contactPersonName: Data?.contactPersonName,
		country: Data?.country?.countryName,
		countrykey: Data?.country?.id.toString(),
		state: Data?.state?.stateName,
		regionkey: Data?.state?.id.toString(),
		city: Data?.city?.cityName,
		zipCode: Data?.zipCode,
		website: Data?.website,
		phoneNo: Data?.phoneNo,
		description: Data?.description,
		isActive: Data?.isActive,
		adminEmail: Data?.adminEmail,
		loginUrlSuffix: Data?.loginUrlSuffix,
		defaultCurrency: Data?.defaultCurrency?.currencyNm,
		dialingCode: Data?.dialingCode?.dialingCode,
		imgLogo: Data?.imgLogo,
		imgBG1: Data?.imgBG1,
		imgBG2: Data?.imgBG2,
		imgBG3: Data?.imgBG3,
		isWhatsAppEnabled: Data?.isWhatsAppEnabled,
		timeZone: Data?.timeZone?.localeName,
	};
     ;
	try {
		const url = `${domain}api/customer/RegisterCustomer`;
		const headers = {
			accept: "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const existingCustomers = await getCustomerList(Data, atoken); // Assuming Data contains email
		const emailExists = existingCustomers.some(customer => customer.customerEmail === Data?.customerEmail);
;
		if (emailExists) {
			toast.error("Customer with this email already exists.", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 1000,
			});
			return '';
		}

		const response = await axios.post(url, data, { headers });
		// toast.success("Customer details submitted successfully. Please complete the subscription process to finalize the registration.", {
		// 	position: toast.POSITION.TOP_CENTER,
		// 	autoClose: 1000,
		// });
		return response.data;
		
	} catch (error) {

		if (error?.response?.data?.Message) {
			toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
		}
		return '';
	}
};

//get call for customer list
export const getCustomerList = async (data, atoken) => {

	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const getCL_ENDPOINT = `${domain}api/customer/Find?${queryParams}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(getCL_ENDPOINT, { headers });
		console.log("response", response);
		if (response?.status === 200) {
			return response.data;
		}
	} catch (error) {
		if (error?.response?.data?.Message) {
			toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
		}
		//return '';
	}
};

//update call for register customers
export const UpdateCustomer = async (Data, id, atoken) => {

	let data = {
		customerName: Data?.customerName,
		address: Data?.address,
		customerEmail: Data?.customerEmail,
		accountManagerEmail: Data?.accountManagerEmail,
		contactPersonName: Data?.contactPersonName,
		country: Data?.country?.countryName,
		countrykey: Data?.country?.id.toString(),
		state: Data?.state?.stateName,
		regionkey: Data?.state?.id.toString(),
		city: Data?.city?.cityName,
		zipCode: Data?.zipCode,
		website: Data?.website,
		phoneNo: Data?.phoneNo,
		isActive: Data?.isActive,
		adminEmail: Data?.adminEmail,
		description: Data?.description,
		loginUrlSuffix: Data?.loginUrlSuffix,
		defaultCurrency: Data?.defaultCurrency?.currencyNm,
		dialingCode: Data?.dialingCode?.dialingCode,
		imgLogo: Data?.imgLogo,
		imgBG1: Data?.imgBG1,
		imgBG2: Data?.imgBG2,
		imgBG3: Data?.imgBG3,
		isWhatsAppEnabled: Data?.isWhatsAppEnabled,
		timeZone: Data?.timeZone?.localeName,
	};

	try {
		const url = `${domain}api/customer/${id}`;
		const headers = {
			accept: "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		// const res = await getCustomerList(Data, atoken); // Assuming Data contains email
		// const existingCustomers = res.filter((x, i) => {
		// 	return x.id != id;
		// });
		// const emailExists = existingCustomers.some(customer => customer.customerEmail === Data?.customerEmail);

		// if (emailExists) {
		// 	toast.info("Customer with this email already exists.", {
		// 		position: toast.POSITION.TOP_CENTER,
		// 		autoClose: 1000,
		// 	});
		// 	return '';
		// }

		const response = await axios.put(url, data, { headers });
		toast.success("Customer Details Updated Successfully!", {
			position: toast.POSITION.TOP_CENTER,
			autoClose: 1000,
		});
		return response.data || true;
	} catch (error) {
		if (error?.response?.data?.Message) {
			toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
		}
		return '';
	}
};


//update status
export const UpdateStatusCustomer = async (Data, id, atoken) => {
	try {
		const url = `${domain}api/customer/${id}`;
		const headers = {
			accept: "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.put(url, Data, { headers });

		return response.data;
	} catch (error) {
		if (error?.response?.data?.Message) {
			toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
		}
		return '';
	}
};


//post call for subscription
export const Subscription = async (Data, id, atoken) => { 

	let data = {
		startDate: Data?.startDate,
		endDate: Data?.endDate,
		noOFUsers: parseInt(Data?.noOFUsers),
		noOFEvents: parseInt(Data?.noOFEvents),
		noOfApprovers: parseInt(Data?.noOfApprovers),
		value: parseInt(Data?.value),
		subscriptionModule: Data?.subscriptionModule,
		isSubscriptionActive: Data?.isSubscriptionActive,
	};

	

	try {
		const customerData = await getSingleCustomer(id, atoken);
		const numberOfSubscriptions = customerData?.subscriptions?.length || 0;
		const url = `${domain}api/customer/${id}/subscription`;
		const headers = {
			accept: "application/json",
			Authorization: `Bearer ${atoken}`,
		};


		if (numberOfSubscriptions > 0) {
			const response = await axios.post(url, data, { headers });
			// toast.success("Subscription Successfully Done.", {
			// 	position: toast.POSITION.TOP_CENTER,
			// 	autoClose: 1000,
			// });
			return response.data || true;
		} else {
			const response = await axios.post(url, data, { headers });
			// toast.success("Customer Setup Successfully Done.", {
			// 	position: toast.POSITION.TOP_CENTER,
			// 	autoClose: 1000,
			// });
			return response.data || true;
		}
	} catch (error) {
		if (error?.response?.data?.Message) {
			toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
		}
		return '';
	}
};
export const UpdateSubscription = async (Data, id,editid, atoken) => { 

	let data = {
		id:editid,
		startDate: Data?.startDate,
		endDate: Data?.endDate,
		noOFUsers: parseInt(Data?.noOFUsers),
		noOFEvents: parseInt(Data?.noOFEvents),
		noOfApprovers: parseInt(Data?.noOfApprovers),
		value: parseInt(Data?.value),
		subscriptionModule: Data?.subscriptionModule,
		isSubscriptionActive: Data?.isSubscriptionActive,
	};

	try {
		const customerData = await getSingleCustomer(id, atoken);
		const numberOfSubscriptions = customerData?.subscriptions?.length || 0;
		const url = `${domain}api/customer/${id}/Updatesubscription`;
	
		const headers = {
			accept: "application/json",
			Authorization: `Bearer ${atoken}`,
		};


		if (numberOfSubscriptions > 0) {
			const response = await axios.post(url, data, { headers });
			// toast.success("Subscription Successfully Done.", {
			// 	position: toast.POSITION.TOP_CENTER,
			// 	autoClose: 1000,
			// });
			return response.data || true;
		} else {
			const response = await axios.post(url, data, { headers });
			// toast.success("Customer Setup Successfully Done.", {
			// 	position: toast.POSITION.TOP_CENTER,
			// 	autoClose: 1000,
			// });
			return response.data || true;
		}
	} catch (error) {
		if (error?.response?.data?.Message) {
			toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
		}
		return '';
	}
};
//get call for single customer
export const getSingleCustomer = async (id, atoken) => {

	try {
		const getCL_ENDPOINT = `${domain}api/customer/${id}`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(getCL_ENDPOINT, { headers });
		console.log("response", response);
		if (response?.status === 200) {
			return response.data;
		}
	} catch (error) {
		if (error?.response?.data?.Message) {
			toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
		}
		return '';
	}
};

//Post Request For SMTP
export const SMTPDetail = async (Data, id, atoken) => {
	let data = {
		host: Data?.host,
		port: Data?.port,
		fromEmail: Data?.fromEmail,
		password: Data?.password,
		displayName: Data?.displayName,
	};

	try {
		const url = `${domain}api/customer/${id}/smtp`;
		const headers = {
			accept: "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.post(url, data, { headers });

		return response.data;
	} catch (error) {
		if (error?.response?.data?.Message) {
			toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
		}
		return '';
	}
};

//update call for SMTP Details
export const UpdateSMTP = async (Data, id, atoken) => {
	let data = {
		host: Data?.host,
		port: Data?.port,
		fromEmail: Data?.fromEmail,
		password: Data?.password,
		displayName: Data?.displayName,
	};

	try {
		const url = `${domain}api/customer/${id}/smtp`;
		const headers = {
			accept: "application/json",
			Authorization: `Bearer ${atoken}`,
		};
		const response = await axios.put(url, data, { headers });

		return response.data;
	} catch (error) {
		if (error?.response?.data?.Message) {
			toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
		}
		return '';
	}
};
