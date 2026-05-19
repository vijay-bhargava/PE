import { compose } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
const domain = process.env.REACT_APP_API_CALL;

//export const customerid = 1;

let required = true;
export const replaceMultipleDotsExceptExtension = (fileName) => {
	// Split the file name into base name and extension
	const [baseName, extension] = fileName.split(".");
	const modifiedBaseName = baseName.replace(/\./g, "_");
	const modifiedFileName = `${modifiedBaseName}.${extension}`;
	return modifiedFileName;
};
export const getDocumentList = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const url = `${domain}api/Doclib/Find?${queryParams}`;

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

export const saveDocumentLibrary = async (Data, atoken) => {
	
	var returnresult = 0;
	for (let i = 0; i < Data.eventtype.length; i++) {
		let data = {
			id: 0,
			customerId: Data.customerId,
			eventtype: Data.eventtype[i],
			attachmentdesc: Data?.attachmentdesc,
			attachment: Data?.attachment,
			filepath: Data?.filepath || "",
			required: Data?.required,
			isactive: Data?.isactive,
		};

		try {
			const url = `${domain}api/Doclib/Add`;
			const headers = {
				accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${atoken}`,
			};
			const response = await axios.post(url, data, { headers });

			if (response?.status === 200) {
				returnresult = response?.data; //?.result;
			}
		} catch (error) {
			//console.log(error);
			// return "";
			returnresult = 0;
		}
	}

	return returnresult;
};

export const updateDocumentLibrary = async (Data, id, atoken) => {
	var returnresult = 0;
	for (let i = 0; i < Data.eventtype.length; i++) {
		let data = {
			id: id,
			customerid: Data.customerId,
			eventtype: Data.eventtype[i],
			attachmentdesc: Data?.attachmentdesc,
			attachment: Data?.attachment,
			filepath: Data?.filepath,
			required: Data?.required,
			isactive: Data?.isactive,
		};

		try {
			const url = `${domain}api/Doclib/Update`;
			const headers = {
				accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${atoken}`,
			};
			const response = await axios.post(url, data, { headers });

			if (response?.status === 200) {
				returnresult = response?.data;
			}
		} catch (error) {
			//console.log(error);
			// return "";
			returnresult = 0;
		}
	}
	return returnresult;
};

export const getId = async (id) => {
	try {
		const getPrefilled_ENDPOINT = `${domain}api/Doclib/${id}?id=${id}`;
		const response = await axios.get(getPrefilled_ENDPOINT);
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export const uploadFilesOnAzure = async (data, file, atoken) => {
	
	try {
		// to create dynamic query
		
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const filename = replaceMultipleDotsExceptExtension(file.name);
		//to append file to formData;
		const formData = new FormData();
		formData.append("file", file, filename);
		const RequestedBy = "Customer";
      
		const url = `${domain}api/BlobStorage/${RequestedBy}?${queryParams}`;
		const headers = {
			accept: "multipart/form-data",
			"Content-Type": "multipart/form-data",
			Authorization: `Bearer ${atoken}`,
		};
		const res = await axios.post(url, formData, { headers });
		console.log("response file ", res);
		if (res?.status === 200) {
			return res?.data?.result?.blobName;
		} else {
			return "";
		}
	} catch (error) {
		// console.log('error-- ', error);
		if (error?.response?.data?.Message) {
			toast(error?.response?.data?.Message, {
				hideProgressBar: true,
				autoClose: 2000,
				type: "error",
			});
		}
		return "";
	}
};
