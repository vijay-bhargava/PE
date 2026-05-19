import CryptoJS from "crypto-js";
import Axios from "axios";
import { Bounce, Zoom, toast } from "react-toastify";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import React from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { buildQueryParams, formatDateViaTimeZone, getObjIndexfromArr } from "./utility";
import { UOMMasterList } from "../commerciallibrary";
import { getItemCategory, getPlantStorage } from "../purchaseRequest";
import {
	HiOutlineCog,
	HiOutlineHome,
	HiOutlineLibrary,
	HiOutlineMail,
	HiOutlineUser,
	HiOutlineUserGroup,
} from "react-icons/hi";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ManageAccountsOutlineIcon from '@mui/icons-material/ManageAccounts';
import { SiAwsorganizations } from "react-icons/si";
import { TbReportSearch } from "react-icons/tb";
import { ApiClient } from "../../Apiclient";
import { CorporateFareOutlined, ManageAccounts, ManageAccountsOutlined } from "@mui/icons-material";
import { actionTypes, useStateValue } from "../../store";
import { LuFileType } from "react-icons/lu";
const apiClient = new ApiClient();
const domain = process.env.REACT_APP_API_CALL;
export const fnencrypt = (message) => {
	const encryptedtext = CryptoJS.AES.encrypt(
		`${message}`,
		process.env.REACT_APP_TOKEN_INCRYPT_KEY
	).toString();
	return encodeURIComponent(encryptedtext);
};

export const fndecrypt = (message) => {
	const decryptedtext = CryptoJS.AES.decrypt(
		decodeURIComponent(message),
		process.env.REACT_APP_TOKEN_INCRYPT_KEY
	).toString(CryptoJS.enc.Utf8);
	return decryptedtext;
};

export const formatDateToDDMMYYYY = (date) => {
	if (date) {
		const concatenatedDate = date + ".000Z";
		const options = { day: "2-digit", month: "2-digit", year: "numeric" };
		let returnedDate = new Date(concatenatedDate)?.toLocaleDateString(
			"en-IN",
			options
		);
		if (returnedDate == "Invalid Date") {
			returnedDate = new Date(date)?.toLocaleDateString("en-IN", options);
		}
		return returnedDate;
	}
	return;
};

export const formatToDDMMYYYY = (date) => {
	//const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
	const datevalue = new Date(date);
	const finaldate = datevalue.getTime() === 0 ? null : datevalue;
	return finaldate;
	//format(new Date(date),'MM-dd-yyyy');
};
export const convertISOToFormattedDate = (isoString) => {
	const date = new Date(isoString);

	const options = {
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		timeZoneName: "short",
	};

	return date.toLocaleString("en-US", options);
};

export const uploadFilesOnAzure = async (foldername, filename, atoken) => {
	try {
		const formData = new FormData();
		formData.append("file", filename);
		formData.append("foldername", foldername);
		const url = `${domain}api/BlobStorage/UploadFile`;
		//const token=CryptoJS.AES.decrypt(cookies.patkn,process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString(CryptoJS.enc.Utf8);
		const headers = {
			"Content-Type": "multipart/form-data",
			Authorization: `Bearer ${atoken}`,
			'Accept': 'application/json',
		};

		const res = await Axios.post(url, formData, { headers });

		return res;
		// if(res?.data?.statusCode===200){
		//   toast('Your file is uploaded successfully', { hideProgressBar: true, autoClose: 2000, type: 'success' })
		//   return res?.data?.result;
		// }
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




export const onlyNumbers = (e) => {
	e.target.value = e.target.value.replace(/[^0-9]/g, "");
};
//For allow decimal number
export const onlyNumberdec = (e) => {
	let value = e.target.value;
	value = value.replace(/[^\d.]/g, "");
	const decimalCount = (value.match(/\./g) || []).length;

	if (decimalCount > 1) {
		value = value.slice(0, value.lastIndexOf("."));
	}

	if (/^0\d/.test(value)) {
		value = value.slice(1);
	}

	e.target.value = value;
};

export const DownloadFile = async (commFolderName, FileName) => {
	//    ;
	try {
		var foldername = commFolderName; // Example folder name
		var filename = FileName; // Assuming you have the selected file object in the state variable selectedFile
		if (FileName != "undefined" && FileName != undefined) {
			const url = `${domain}api/blobstorage/DownloadFile?filename=${filename}&filepath=${foldername}`;
			Axios({
				url: url,
				method: "GET",
				// responseType: "blob", // Set the responseType to 'blob' to receive the file as a Blob object
			})
				.then((response) => {
					// console.log("abc" + JSON.stringify(response));
					// Create a download link for the file
					//
					const blob = window.URL.createObjectURL(new Blob([response.data]));
					// console.log("Url ",blob);
					// Create a temporary anchor element
					const link = document.createElement("a");
					link.href = response.data;
					link.setAttribute("download", filename);
					document.body.appendChild(link);

					// Simulate a click event to start the download
					link.click();

					// Clean up the temporary link
					document.body.removeChild(link);
				})
				.catch((error) => {
					console.error("Error downloading file:", error);
					// Handle the error as needed
				});
		}
	} catch (error) { }
};
// to verify gst of indian suppliers
export const taxVerification = async (tax, cookies) => {
  try {
   
    const ENDPOINT = `${domain}api/utility/${tax}`;
    const token = CryptoJS.AES.decrypt(
      cookies.patkn,
      process.env.REACT_APP_TOKEN_INCRYPT_KEY
    ).toString(CryptoJS.enc.Utf8);
 
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
 
    const response = await Axios.get(ENDPOINT, { headers });
 
    // Check if response data is not empty
    if (response.data && Object.keys(response.data).length > 0) {
      toast.success("Tax is Verified successfully!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      toast.error("GST verification failed. No data found for this GST.", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
 
    return response.data;
 
  } catch (e) {
    toast.error("Not able to validate the GST number at the moment. Please enter the details manually.", {
        position: toast.POSITION.TOP_CENTER,
      });
  }
};

//to get jsondata from excel single sheet
export const handleFileUpload = (file, expectedHeaders) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			
			const data = e.target.result;
			const workbook = XLSX.read(data, { type: "binary", cellDates: true });
			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];

			const jsonData = XLSX.utils.sheet_to_json(sheet, {
				defval: "",
				raw: false,
				dateNF: "yyyy/mm/dd" ?? null,
			});
			if (jsonData.length < 1) {
				toast.info(`please fill data  to upload excel`);
				return;
			}
			// Check if column headers have correct length
			const headers = Object.keys(jsonData[0]);
			if (headers.length !== expectedHeaders.length) {
				toast.error(
					`File template format is not matched  .Please check the file or download sample template and try again.`,
					toastoption
				);

				return;
			}

			// Check if column headers match the expected headers
			for (let i = 0; i < expectedHeaders.length; i++) {
				if (headers[i].trim() !== expectedHeaders[i]?.header.trim()) {
					toast.error(
						`Expected column header '${expectedHeaders[i].header
						}' at position ${i + 1}, but found '${headers[i]}'.`,
						toastoption
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

// to validate array of emailaddress
export const validateEmails = (emails) => {
	const Constraint = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const invalidEmails = emails.filter((email) => !Constraint.test(email));
	return invalidEmails.length === 0;
};
//to remove multiple dots from file name
export const replaceMultipleDotsExceptExtension = (fileName) => {
	// Split the file name into base name and extension
	const [baseName, extension] = fileName.split(".");
	const modifiedBaseName = baseName.replace(/\./g, "_");
	const modifiedFileName = `${modifiedBaseName}.${extension}`;
	return modifiedFileName;
};

// to upload blob files on azure

export const uploadFilesOnAzure2 = async (data, file, atoken) => {
	try {
		//to create dynamic query
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
		const RequestedBy = "Buyer";

		const url = `${domain}api/BlobStorage/${RequestedBy}?${queryParams}`;
		// const token = CryptoJS.AES.decrypt(
		//   cookies.patkn,
		//   process.env.REACT_APP_TOKEN_INCRYPT_KEY
		// ).toString(CryptoJS.enc.Utf8);
		const token = atoken;
		const headers = {
			accept: "multipart/form-data",
			"Content-Type": "multipart/form-data",
			Authorization: `Bearer ${token}`,
		};

		const res = await Axios.post(url, formData, { headers });

		return res.data.result;
		// if(res?.data?.statusCode===200){
		// toast('Your file is uploaded successfully', { hideProgressBar: true, autoClose: 2000, type: 'success' })
		// return res?.data?.result;
		// }
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

//mapping email list for customer
export const mapEmail = async (customerId, atoken) => {
	try {
		const ENDPOINT = `${domain}api/rolemanagement/${customerId}/mapemail`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(ENDPOINT, { headers });

		return response.data;
	} catch (error) {
		console.log(error);
	}
};
// to create comma seperated string list using arraylist
export const StringFromArray = (arr) => {
	return arr?.join(",");
};
// to create array list using comma seperated string
export const ArrayFromString = (str) => {
	return str.split(",");
};

export const getObjectByfield = (field, value, array) => {
	return array?.find((obj) => obj[field] === value);
};

export const createStage = (obj) => {
	return {
		eventType: obj.eventType,
		currentStage: obj.stageSeq,
		nextStage: obj.stageSeq + 1,
	};
};

export const createStageModal = (currenstage, nextstage, orgId, orgGroupId) => {
	return {
		eventType: currenstage?.eventType ?? nextstage?.eventType,
		currentStage: currenstage?.currentStage ?? "",
		nextStage: nextstage?.currentStage,
		orgId: orgId ?? 0,
		orgGroupId: orgGroupId ?? 0
	};
};

export const createAddConModal = (additionalContactDetails) => {
	let arr = additionalContactDetails.filter((x) => x.id == undefined);

	return arr;
};
export const downloadZip = async (folderPath) => {
  try {
	
    const response = await axios.get(
      `${domain}api/blobstorage/download-zip?folderPath=${encodeURIComponent(folderPath)}`,
      {
        responseType: "blob", // important!
      }
    );

    // Create a Blob from the response
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Extract filename from response headers or fallback
    const contentDisposition = response.headers["content-disposition"];
    let fileName = "download.zip";

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) {
        fileName = match[1];
      }
    }

    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Release memory
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Error downloading zip:", error);
  }
};
// export const getPayloadWithStage = (field, value, stagelist, payload, field2) => {

//     let currenstage =getObjectByfield(field,value,stagelist);
//     let nextstage = getObjectByfield(field2, parseInt(currenstage?.stageSeq) + 1, stagelist);
//     if (!currenstage) {
//       currenstage = '';
//       nextstage = getObjectByfield(field2,1, stagelist);
//     }
//     if (currenstage && !nextstage) {
//       nextstage = currenstage;
//     }
//     const objstage=createStageModal(currenstage,nextstage);
//     payload['stages']=objstage;
//     return payload;
//   }

export const getPayloadWithStage = (
	field,
	value,
	stagelist,
	payload,
	field2,
	orgId, orgGroupId
) => {

	let currenindex;
	let nextstage;
	let currentStage = getObjectByfield(field, value, stagelist);
	if (currentStage) {
		currenindex = getObjIndexfromArr(stagelist, currentStage.currentStage);
		nextstage = stagelist[currenindex + 1];
	} else {
		currenindex = 0;
		currentStage = stagelist[currenindex];
		nextstage = stagelist[currenindex + 1];
	}

	const objstage = createStageModal(currentStage, nextstage, orgId, orgGroupId);
	payload["stages"] = objstage;
	return payload;
};


export const getStageInfo = (currentStage, stageList) => {

	if (!stageList || stageList.length === 0) return null;

	// const currentStageObj = stageList.find(stage => stage.stageName === currentStage);
	// if (!currentStageObj) return null; // If current stage is not found

	// const nextStageObj = stageList.find(stage => stage.stageSeq === currentStageObj.stageSeq + 1);
	// const prevStageObj = stageList.find(stage => stage.stageSeq === currentStageObj.stageSeq - 1);
	const currentStageObj = stageList.find(stage => stage.stageName === currentStage);
	const currentIndex = stageList?.findIndex(item => item.stageSeq === currentStageObj?.stageSeq);
	if (!currentStageObj) return null; // If current stage is not found

	// const nextStageObj = stageList.find(stage => stage.stageSeq === currentStageObj.stageSeq + 1);
	const nextStageObj = currentIndex !== -1 ? stageList[currentIndex + 1] : undefined;
	// const prevStageObj = stageList.find(stage => stage.stageSeq === currentStageObj.stageSeq - 1);
	const prevStageObj = currentIndex !== -1 && currentIndex !== 0 ? stageList[currentIndex - 1] : undefined;

	return {
		prevStage: prevStageObj ? prevStageObj.stageName : null,
		prevStageId: prevStageObj ? prevStageObj.stageId : null,
		currentStage: currentStageObj.stageName,
		currentStageId: currentStageObj.stageId,
		nextStage: nextStageObj ? nextStageObj.stageName : null,
		nextStageId: nextStageObj ? nextStageObj.stageId : null
	};
};

export const filequeryparam = (obj) => {
	return {
		EventType: obj.EventType,
		EventId: obj.EventId,
		Description: obj.Description,
		CustomerId: obj.CustomerId
	};
};


export const CategoryRegisterMasterModal = (array) => {

	return array.map((item) => ({
		categoryId: item.id,
		categoryName: item.categoryName
	}));
};

export const CategoryMasterModal = (array) => {
	return array.map((item) => ({
		categoryId: item.id,
	}));
};

export const CategorySqeMasterModal = (array, vendorelement) => {

	return array.map((item) => ({
		id: 0,
		categoryId: item.id,
		categoryName: item.categoryName,
		vqHeaderId: 0,
		vendorId: vendorelement,
		customerId: item.customerId
	}));
};

export const getPayloadWithFilePath = (field, filepath, payload) => {
	payload[field] = filepath;
	return payload;
};
export const getFileName = (filepath) => {
    if (!filepath) {
        return "";
    }
 
    const cleanedPath = filepath.split("?")[0];
    const filename = cleanedPath.split("/")?.pop() || "";
    try {
        return decodeURIComponent(filename);
    } catch (error) {
        return filename;
    }
};

export const downloadFilesOnAzure = async (filepath, filename, atoken) => {

	try {
		const url = `${domain}api/BlobStorage/download`;

		const data = {
			filepath: filepath,
		};

		const headers = {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.post(url, data, {
			headers,
			responseType: "blob",
		});

		const blob = new Blob([response.data], {
			type: response.headers["content-type"],
		});

		const blobUrl = window.URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = blobUrl;
		a.download = filename || "download";
		document.body.appendChild(a);
		a.click();

		// Clean up
		document.body.removeChild(a);
		window.URL.revokeObjectURL(blobUrl);
	} catch (error) {
		if (error?.response?.data?.Message) {
			toast.error(error.response.data.Message, {
				hideProgressBar: true,
				autoClose: 1000,
			});
		} else {
			console.error("Error downloading file:", error);
		}
	}
};

export const handleDownloadFile = (filepath, filename, atoken) => {

	downloadFilesOnAzure(filepath, filename, atoken);
};

//<---Master table APIs-->
//to get timezone
export const getTimeZone = async (atoken) => {

	try {
		const ENDPOINT = `${domain}api/TimeZone/Find`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(ENDPOINT, { headers });
		return response.data.result;
	} catch (error) {
		console.log(error);
	}
};

//to get dialing code and country list
export const getCountry = async (atoken) => {
	try {
		const ENDPOINT = `${domain}api/Country/Find`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(ENDPOINT, { headers });
		return response.data.result;
	} catch (error) {
		console.log(error);
	}
};

//to get state,taxtype,taxtype2,language and currency based on countrykey
export const getState = async (countrykey) => {
	try {
		const ENDPOINT = `${domain}api/StateMaster/Find`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
		};

		const response = await axios.get(ENDPOINT, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

//to get city list based on regionkey
export const getCity = async (regionkey) => {
	try {
		const ENDPOINT = `${domain}api/CityMaster/Find`;
		const headers = {
			accept: "application/json",
			"Content-Type": "application/json",
		};

		const response = await axios.get(ENDPOINT, { headers });
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

//Question Library
export const getQuestionLibrary = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");
		const url = `${domain}api/LibraryOrgEntity/Find?${queryParams}`;
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

//Questions from Library
export const getQuestionsFromLibrary = async (data, atoken) => {
	try {
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");
		const url = `${domain}api/QuestionsLib/Find?${queryParams}`;
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

export const isTokenExpired = async (atoken, rtoken, referenceId) => {
	try {
		const decoded = jwtDecode(atoken);
		const currentTime = Date.now() / 1000;
		if (decoded.exp < currentTime) {
			const newToken = await getRefreshToken(atoken, rtoken, referenceId);
			return newToken;
		}
		return "";
	} catch (err) {
		console.error(err);
		return "";
	}
};

const getRefreshToken = async (atoken, rtoken, referenceId) => {
	const data = {
		accessToken: atoken,
		refreshToken: rtoken,
		referenceId: referenceId,
		userType: "User",
	};

	try {
		const url = `${domain}api/auth/refresh`;
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
export const removeNonNumeric = (input) => {
	return input.replace(/[^0-9.]/g, "");
};
export const removeSpecialCharactersAndNumbers = (input) => {
	return input.replace(/[^a-zA-Z ]/g, "");
};

export const validateEmail = (email) => {
	// Regular expression for validating email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const fetchMasters = async (atoken, customerid, queryParams = {}) => {
  const timeZoneurl = `${domain}api/TimeZone/Find`;
  const countryurl = `${domain}api/Country/Find`;
  const currencyurl = `${domain}api/Currency/Find`;
  const categoryurl = `${domain}api/ItemCategory/Find`;

  const headers = {
    accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${atoken}`,
  };

  try {
    const [
      timeZoneResponse,
      countryResponse,
      currencyResponse,
      categoryResponse,
    ] = await Promise.all([
      axios.get(timeZoneurl, { headers }),
      axios.get(countryurl, { headers }),
         // Currency API with IsActive=true
      axios.get(currencyurl, {
        headers,
        params: {
          IsActive: true,
        },
      }),
      axios.get(categoryurl, {
        headers,
        params: {
          CustomerId: customerid,
          ...queryParams, // optional extra filters
        },
      }),
    ]);

    return {
      timezoneList: timeZoneResponse.data.result,
      countryList: countryResponse.data.result,
      currencyList: currencyResponse.data.result,
      categoryList: categoryResponse.data.result,
    };
  } catch (error) {
    console.error("Error in fetchMasters:", error);
    if (error?.message) {
      toast(error.message, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "error",
      });
    }
    return "";
  }
};


// export const fetchMasters = async (atoken, customerid) => {
// 	const timeZoneurl = `${domain}api/TimeZone/Find`;
// 	const countryurl = `${domain}api/Country/Find`;
// 	const currencyurl = `${domain}api/Currency/Find`;
// 	const categoryurl = `${domain}api/managevendors/${customerid}/categories`;
// 	const headers = {
// 		accept: "application/json",
// 		"Content-Type": "application/json",
// 		Authorization: `Bearer ${atoken}`,
// 	};
// 	try {
// 		const [
// 			timeZoneResponse,
// 			countryResponse,
// 			currencyResponse,
// 			categoryResponse,
// 		] = await Promise.all([
// 			axios.get(timeZoneurl, { headers }),
// 			axios.get(countryurl, { headers }),

// 			axios.get(currencyurl, { headers }),
// 			axios.get(categoryurl, { headers }),
// 		]);
// 		return {
// 			timezoneList: timeZoneResponse.data.result,
// 			countryList: countryResponse.data.result,
// 			currencyList: currencyResponse.data.result,
// 			categoryList: categoryResponse.data,
// 		};
// 	} catch (error) {
// 		if (error?.message) {
// 			toast(error?.message, {
// 				hideProgressBar: true,
// 				autoClose: 2000,
// 				type: "error",
// 			});
// 		}
// 		return "";
// 	}
// };

//to remove null,undefined or empty fields from obj
export const removeEmptyFields = (obj) => {
	const newObj = {};
	for (const key in obj) {
		if (
			obj[key] !== null &&
			obj[key] !== undefined &&
			obj[key] !== "" &&
			(typeof obj[key] !== "object" ||
				(Array.isArray(obj[key]) && obj[key].length > 0))
		) {
			newObj[key] = obj[key];
		}
	}
	return newObj;
};

//this function takes a value for a field and returns an object from an array
export const findObjByValueFromArray = (array, Value, field) => {
	if (array && array.length > 0) {
		let arrobj = array?.find((obj) => obj[field] === Value);
		console.log(array.find((obj) => obj[field] === Value));
		return arrobj || null;
	}
	return null;
};
export const findObjByValueFromArrayt = (array, Value, field) => {
	if (array && array.length > 0) {
		let arrobj = array?.find((obj) => obj[field] === Value);
		console.log(array.find((obj) => obj[field] === Value));
		return arrobj || null;
	}
	return null;
};

//it returns objects list which are included in value list based on field
export const findObjListByValueFromArray = (
	array,
	valuelist,
	field,
	field2
) => {

	const listModal = {};
	array.forEach((item) => {
		if (valuelist?.includes(item[field]) && item.featureName == field2) {
			listModal[item[field].trim().replace(/\s+/g, "").toLowerCase()] = item;
		}
	});

	return listModal;
};

export const cleanString = (String) => {
	return String.trim().replace(/\s+/g, "").toLowerCase();
};

export const fetchStates = async (countryKey, atoken) => {
	const url = `${domain}api/StateMaster/Find?CountryId=${countryKey}`;
	const headers = {
		accept: "application/json",
		"Content-Type": "application/json",
		Authorization: `Bearer ${atoken}`,
	};
	try {
		const response = await axios.get(url, { headers });
		return response.data.result;
	} catch (error) {
		if (error?.message) {
			toast(error?.message, {
				hideProgressBar: true,
				autoClose: 2000,
				type: "error",
			});
		}
		return "";
	}
};
export const fetchCities = async (stateId, atoken) => {
	const url = `${domain}api/CityMaster/Find?StateId=${stateId}`;
	const headers = {
		accept: "application/json",
		"Content-Type": "application/json",
		Authorization: `Bearer ${atoken}`,
	};
	try {
		const response = await axios.get(url, { headers });
		return response.data.result;
	} catch (error) {
		if (error?.message) {
			toast(error?.message, {
				hideProgressBar: true,
				autoClose: 2000,
				type: "error",
			});
		}
		return "";
	}
};
export const fetchTax = async (countryKey, atoken) => {
	const url = `${domain}api/TaxType/Find?CountryId=${countryKey}`;
	const headers = {
		accept: "application/json",
		"Content-Type": "application/json",
		Authorization: `Bearer ${atoken}`,
	};

	try {
		const response = await axios.get(url, { headers });
		return response?.data?.result;
	} catch (error) {
		if (error?.message) {
			toast(error?.message, {
				hideProgressBar: true,
				autoClose: 2000,
				type: "error",
			});
		}
		return "";
	}
};

export const fetchSupplierByMail = async (emailId, atoken) => {
	const url = `${domain}api/managevendors/${emailId}/getvendorbyemail`;
	const headers = {
		accept: "application/json",
		"Content-Type": "application/json",
		Authorization: `Bearer ${atoken}`,
	};

	try {
		const response = await axios.get(url, { headers });
		return response?.data;
	} catch (error) {
		if (error?.message) {
			toast(error?.message, {
				hideProgressBar: true,
				autoClose: 2000,
				type: "error",
			});
		}
		return "";
	}
};
export const fetchSupplierByID = async (id, atoken) => {

	const url = `${domain}api/managevendors/${id}/getvendorbyid`;
	const headers = {
		accept: "application/json",
		"Content-Type": "application/json",
		Authorization: `Bearer ${atoken}`,
	};

	try {
		const response = await axios.get(url, { headers });
		return response?.data;
	} catch (error) {
		// ✅ Only show toast if error is not a 404
		if (error?.response?.status !== 404 && error?.message) {
			toast(error.message, {
				hideProgressBar: true,
				autoClose: 2000,
				type: "error",
			});
		}

		// ✅ Return empty string in all error cases so modal logic can handle it
		return "";
	}
};

// export const fetchSupplierByID = async (id, atoken) => {
// 	
// 	const url = `${domain}api/managevendors/${id}/getvendorbyid`;
// 	const headers = {
// 		accept: "application/json",
// 		"Content-Type": "application/json",
// 		Authorization: `Bearer ${atoken}`,
// 	};


// 	try {
// 		const response = await axios.get(url, { headers });
// 		return response?.data;
// 	} catch (error) {
// 		if (error?.message) {
// 			toast(error?.message, {
// 				hideProgressBar: true,
// 				autoClose: 2000,
// 				type: "error",
// 			});
// 		}
// 		return "";
// 	}
// };

export const fetchCurrency = async (atoken) => {
  const url = `${domain}api/Currency/Find`;

  const headers = {
    accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${atoken}`,
  };

  try {
    const response = await axios.get(url, {
      headers,
      params: {
        IsActive: true,
      },
    });

    return response.data.result;
  } catch (error) {
    if (error?.message) {
      toast(error?.message, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "error",
      });
    }
    return "";
  }
};

// export const checkArray=(jsonArray)=> {
//     let isNullUndefined = false;

//   jsonArray.forEach(entry => {

//         for (let key in entry) {
//             if (!entry[key]) {
//                 isNullUndefined = true;
//               toast.error(`Field '${key}' in entry '${entry.companyName}' is empty or missing. Please make sure that all fields are mandatory`);
//               return true;
//             }
//     }

//     });

//     return isNullUndefined;
// }

export const checkArray = (jsonArray) => {
	
	let isNullUndefined = false;
	const seenEmails = new Set();

	for (let i = 0; i < jsonArray.length; i++) {
		const entry = jsonArray[i];

		for (let key in entry) {
			if (!entry[key]) {
				isNullUndefined = true;
				toast.error(
					entry.companyName
						? `Field '${key}' in company '${entry.companyName}' is empty or missing. Please make sure that all fields are mandatory`
						: `Field '${key}' is empty or missing. Please make sure that all fields are mandatory`,
					toastoption
				);
				return true; // Stop processing further
			}

			if (key === "email") {
				const email = entry[key].toLowerCase(); // Normalize email to lowercase
				if (seenEmails.has(email)) {
					toast.error(
						entry.companyName
							? `Duplicate email '${email}' found in company '${entry.companyName}'. Please ensure each email is unique.`
							: `Duplicate email '${email}' found `
					);
					return true; // Stop processing further
				}
				seenEmails.add(email);
			}
		}
	}

	return isNullUndefined;
};

//Anurag_Dev Added checkFields function for validating ecxel fields for pr
export const checkFields = async (data, atoken) => {
	let isValid = true;

	try {
		const uomMasterList = await UOMMasterList("", atoken); // Fetch UOMMasterList data
		const plantStorage = await getPlantStorage("", atoken); // Fetch plant storage data
		const itemCategories = await getItemCategory("", atoken); // Fetch item category data

		for (let i = 0; i < data.length; i++) {
			const entry = data[i];

			const formatDate = (dateString) => {
				if (!dateString) return null;
				const date = new Date(dateString);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, "0");
				const day = String(date.getDate()).padStart(2, "0");
				return `${year}-${month}-${day}`;
			};

			const toDecimal = (value) => {
				const num = parseFloat(value);
				return isNaN(num) ? "0.00" : num.toFixed(2);
			};

			entry.poValue = toDecimal(entry.poValue);
			entry.unitRate = toDecimal(entry.unitRate);
			entry.poDate = formatDate(entry.poDate);
			entry.deliveryDate = formatDate(entry.deliveryDate);

			if (!entry.itemName || !entry.itemDesc || !entry.qty) {
				isValid = false;
				toast.error(`One or more required fields are empty or missing.`);
				return isValid; // Stop processing further
			}

			// Validate UOM against allowed values
			const allowedUOMs = uomMasterList.map((item) => item.uom);
			if (!allowedUOMs.includes(entry.uom)) {
				isValid = false;
				toast.error(
					`Invalid UOM '${entry.uom}'. Please select a valid UOM from the list.`
				);
				return isValid; // Stop processing further
			}

			// Validate PlantName against slDesc concatenated with slCode
			const concatenatedPlantName = `${entry.plant}`;
			const plantExists = plantStorage.some((plant) => {
				const concatenatedPlantNameWithCode = `${plant.slDesc.trim()} - ${plant.slCode.trim()}`;
				return concatenatedPlantNameWithCode === concatenatedPlantName;
			});
			if (!plantExists) {
				isValid = false;
				toast.error(
					`Invalid plant name '${entry.plant.slDesc} - ${entry.plant.slCode}'. Please select a valid plant from the list.`
				);
				return isValid; // Stop processing further
			}

			// Validate ItemCategory against the fetched item categories
			const itemCategoryExists = itemCategories.some(
				(category) => category.categoryDescription === entry.itemCategory
			);
			if (!itemCategoryExists) {
				isValid = false;
				toast.error(
					`Invalid item category '${entry.itemCategory}'. Please select a valid item category from the list.`
				);
				return isValid; // Stop processing further
			}
		}
	} catch (error) {
		console.error("Error:", error);
		isValid = false;
	}

	return isValid;
};
export const IconComponent = ({ iconName }) => {
	const iconStyle = {
		color: "#0d6efd",
		fontSize: "16pt",
		margin: "4px", // Optional, same as m-1
	};

	switch (iconName) {
		case "Configure":
			return <ManageAccountsOutlined style={iconStyle} />;
		case "Set Up":
			return <HiOutlineCog style={iconStyle} />;
		case "Suppliers":
			return <HiOutlineUserGroup style={iconStyle} />;
		case "Libraries":
			return <LibraryBooksIcon style={iconStyle} />;
		case "Report":
			return <TbReportSearch style={iconStyle} />;
		case "Cust Setup":
			return <SiAwsorganizations style={iconStyle} />;
		case "HiOutlineMail":
			return <HiOutlineMail style={iconStyle} />;
		default:
			return <CorporateFareOutlined style={iconStyle} />;
	}
};


// export const IconComponent = ({ iconName }) => {
//     switch (iconName) {
//         case "Configure":
//             return <FormatListBulletedIcon className="f18pt m-1" style={{ color: "#0d6efd" }} />;
//         case "Set Up":
//             return <TaskAltIcon className="f18pt m-1" style={{ color: "#0d6efd" }} />;
//         case "Suppliers":
//             return <HiOutlineUserGroup className="f18pt m-1" style={{ color: "#0d6efd" }} />;
//         case "Libraries":
//             return <LibraryBooksIcon className="f18pt m-1" style={{ color: "#0d6efd" }} />;
//         case "Report":
//             return <SummarizeIcon className="f18pt m-1" style={{ color: "#0d6efd" }} />;
//         case "Cust Setup":
//             return <ManageAccountsOutlineIcon className="f18pt m-1" style={{ color: "#0d6efd" }} />;
//         case "HiOutlineMail":
//             return <HiOutlineMail className="f18pt m-1" style={{ color: "#0d6efd" }} />;
//         default:
//             return <CorporateFareOutlined className="f18pt m-1" style={{ color: "#0d6efd" }} />;
//     }
// 	switch (iconName) {
// 		case "Set Up":
// 			return <HiOutlineCog className="f18pt m-1" style={{ color: "#0d6efd" }} />;
// 		case "Configure":
// 			return <ManageAccountsOutlined className=" f18pt m-1" style={{ color: "#0d6efd" }} />;
// 		case "Report":
// 			return <TbReportSearch className="f18pt m-1" style={{ color: "#0d6efd" }} />;
// 		case "HiOutlineMail":
// 			return <HiOutlineMail className="f18pt m-1" style={{ color: "#0d6efd" }} />;
// 			case "Suppliers":
// 			return <HiOutlineUserGroup className="f18pt m-1" style={{ color: "#0d6efd" }} />;
// 			case "Cust Setup":
// 			return <SiAwsorganizations className="f18pt m-1" style={{ color: "#0d6efd" }} />;
// 		// Add more cases for other icons as needed
// 		default:
// 			return <CorporateFareOutlined className="f18pt m-1" style={{ color: "#0d6efd" }} />; // Default case if iconName doesn't match any
// 	}
// };

// export const IconComponent = ({ iconName }) => {
//     switch (iconName) {
// 		case "Configure":
//             return <ManageAccountsOutlined className=" f16pt m-1" style={{ color: "#0d6efd" }} />;
//         case "Set Up":
//             return <HiOutlineCog className="f16pt m-1" style={{ color: "#0d6efd" }} />;
// 			case "Suppliers":
// 				return <HiOutlineUserGroup className="f16pt m-1" style={{ color: "#0d6efd" }} />;
//         case "Report":
//             return <TbReportSearch className="f16pt m-1" style={{ color: "#0d6efd" }} />;
//         case "HiOutlineMail":
//             return <HiOutlineMail className="f16pt m-1" style={{ color: "#0d6efd" }} />;
//             case "Suppliers":
//             return <HiOutlineUserGroup className="f16pt m-1" style={{ color: "#0d6efd" }} />;
//             case "Cust Setup":
//             return <SiAwsorganizations className="f16pt m-1" style={{ color: "#0d6efd" }} />;
//         // Add more cases for other icons as needed
//         default:
//             return <CorporateFareOutlined className="f16pt m-1" style={{ color: "#0d6efd" }} />; // Default case if iconName doesn't match any
//     }
// };
export const checkItems = (jsonArray) => {
	let isNullUndefined = false;
	const seenEmails = new Set();

	for (let i = 0; i < jsonArray.length; i++) {
		const entry = jsonArray[i];

		for (let key in entry) {
			if (!entry[key]) {
				isNullUndefined = true;
				toast.error(
					entry.companyName
						? `Field '${key}' in  company '${entry.companyName}' is empty or missing. Please make sure that all fields are mandatory`
						: `email is missing`
				);
				return true; // Stop processing further
			}
		}
	}

	return isNullUndefined;
};

export const InvitedSupplierModal = (array, eventid, endDate, customerId, userDetail, Version = 1) => {
	console.log("arrayarrayarray", array)
	return array?.map((item) => ({
		RFQId: eventid,
		emailId: item.email,
		endDate: endDate,
		vendorId: item.id,
		contactId: item.contactId,
		contactPerson: item.contactPerson,
		companyName: item?.tradeName,
		customerId: customerId,
		createdById: userDetail?.id,
		createdByName: userDetail?.name,
		rfqLoadingFactor: item?.rfqLoadingFactor?.map(({ id, parentRefId, ...rest }) => rest),
		Version: Version,
		VersionInvitedDate: (new Date()).toISOString()

		//vendorParentId: item.contactId
	}));
};

export const InvitedSupplierForBidModal = (array, eventid, customerId, activityId, createdById, createdByName) => {

	return array?.map((item) => ({
		bidId: eventid,
		customerId: customerId,
		emailId: item?.email,
		vendorID: item.id || 0,
		contactId: item?.contactId,
		activityId: activityId,
		vendorName: item?.tradeName,
		contactPerson: item?.contactPerson,
		createdById: createdById,
		createdByName: createdByName,
		bidLoadingFactor: item?.bidLoadingFactor?.map(({ id, parentRefId, ...rest }) => rest)
		// bidLoadingFactor: item?.bidLoadingFactor?.map(
		// 	({ id, parentRefId, ...rest }) => ({
		// 		...rest
		// 	})
		// )
	}));
};

export const AuctionCTAddModal = (array, eventid, selectedCommercalDll, baseCurrency) => {

	return array?.map((item) => ({
		bidId: eventid,
		name: item?.name,
		formulavalue: item?.formulavalue,
		fieldName: item?.fieldName,
		valuetype: item?.valuetype,
		libraryId: parseInt(item?.libraryId),
		termsId: parseInt(item?.termsId),
		grandTotalTermName: selectedCommercalDll?.grandTotalTermName ?? "",
		// bidTermCurrency: item?.bidTermCurrency?.map(
		// 	({ id, parentRefId, ...rest }) => ({
		// 		...rest
		// 	})
		// )
		bidTermCurrency: item?.bidTermCurrency?.length
			? item?.bidTermCurrency.map(({ id, parentRefId, ...rest }) => ({
				...rest
			}))
			: [{ baseCurrency: baseCurrency, currencyConversion: 1, bidId: eventid }]
	}));
};

export const WFAddApproverModal = (array, requestCell) => {
	return array.map((item) => ({
		wfId: item.id,
		eventId: requestCell?.EventId,
		eventType: requestCell?.EventType,
	}));
};

export const toastoption = {
	position: "top-right",
	autoClose: 3000,
	hideProgressBar: true,
	closeOnClick: true,
	pauseOnHover: true,

	progress: undefined,
	theme: "light",
	transition: Zoom,
	rtl: true,

};



export const findStringByValueFromArray = (array, Value, field, name) => {

	if (array && array.length > 0) {
		const arrobj = array?.find((obj) => obj[field] === Value);
		const str = arrobj?.[name] ?? '';
		return str || '';
	}
	return '';
};


export const findStringByValueFromArrayt = (array, Value, field, name) => {

	if (array && array.length > 0) {
		const arrobj = array?.find((obj) => obj[field] === Value);
		const str = arrobj?.[name] ?? '';
		return str || '';
	}
	return '';
};


export const RFQModalFromPR = (array, userDetail) => {

	return array.map((item) => ({
		itemName: item.itemName,
		itemCode: item.itemCode,
		remarks: item?.remarks ?? '',
		itemDesc: item.itemDesc ?? '',
		targetPrice: item.targetPrice ?? 0,
		quantity: item.quantity ?? 0,
		uom: item.uom ?? '',
		//delivery: item?.deliveryDate ?? '',
		plant: item?.plant ?? '',
		itemCategory: item?.itemCategory ?? '',
		Version: 1,
		eventId: item?.prId,
		eventType: 'PR',
		createdById: userDetail?.id,
		createdByName: userDetail?.name,
		customerId: userDetail?.customerId,
		itemImage: item?.itemImage,
		itemFile: item?.itemFile,
		//poNo: item?.poNo ?? '',
		//poVendorName: item?.poVendorName ?? '',
		//poUnitRate: item?.unitRate ?? '',
		//poDate: item?.poDate ?? null,
		//poValue: item?.poValue ?? 0,
		erpSourceId: item?.prNo ?? '',
		erpType: 'aspl',
		itemRefId: item?.id
	}));
};

export const AuctionModalFromPR = (array, userDetail) => {

	return array.map((item) => ({
		itemName: item.itemName,
		itemCode: item.itemCode,
		remarks: item?.remarks ?? '',
		itemDesc: item.itemDesc ?? '',
		targetPrice: item.targetPrice ?? 0,
		quantity: item.quantity ?? 0,
		uom: item.uom ?? '',
		plant: item?.plant ?? '',
		itemCategory: item?.itemCategory ?? '',
		erpSourceId: item?.prNo ?? '',
		erpType: 'aspl',
		itemRefId: item?.id,
		//bydefault value
		maskL1Price: false,
		hidePrice: false,
		startPrice: item?.bidStartprice ?? 0,
		showStartPrice: true,
		minimumDelta: item?.minimumdecreamentOn ?? 0,
		decreamentOn: 'A',
		deliveryDate: item?.deliveryDate || null,
		eventId: item?.prId,
		eventType: 'PR',
		createdById: userDetail?.id,
		createdByName: userDetail?.name,
		customerId: userDetail?.customerId
	}));
};

export const AuctionModalFromRFQ = (array, userDetail) => {

	return array.map((item) => ({
		itemName: item.itemName,
		itemCode: item.itemCode ?? '',
		remarks: item?.remarks ?? '',
		itemDesc: item.itemDesc ?? '',
		targetPrice: item.targetPrice ?? 0,
		quantity: item.quantity ?? 0,
		uom: item.uom ?? '',
		plant: item?.plant ?? '',
		itemCategory: item?.itemCategory ?? '',
		//erpSourceId: item?.prNo ?? '',
		erpType: 'aspl',
		itemRefId: item?.id,
		//bydefault value
		maskL1Price: false,
		hidePrice: false,
		startPrice: item?.bidStartprice,
		showStartPrice: true,
		minimumDelta: item?.minimumdecreament,
		decreamentOn: 'A',
		deliveryDate: item?.deliveryDate || null,
		eventId: item?.rfqId,
		eventType: 'RFQ',
		createdById: userDetail?.id,
		createdByName: userDetail?.name,
		customerId: userDetail?.customerId
	}));
};

export const invitedSupplierForAuction = (array) => {
	return array?.map((item) => ({
		customerId: item?.customerId,
		createdById: item?.createdById,
		createdByName: item?.createdByName,
		emailId: item?.emailId,
		vendorID: item.vendorId || 0,
		contactId: item?.contactId,
		activityId: item?.activityId,
		vendorName: item?.companyName,
		Currency: item?.acceptedCurrency
	}));
};

export const eventMultiCurrencyList = (array) => {
	return array?.map((item) => ({
		baseCurrency: item?.baseCurrency,
		currencyConversion: item?.currencyConversion
	}));
};


export const eventattachmentmodal = (array, eventid, eventtype) => {

	return array.map((item) => ({
		eventId: eventid,
		eventType: eventtype,
		attachmentDescription: item.attachmentdesc,
		attachment: item?.attachment,
		docRefId: item?.id,
		fileNamePath: item?.filepath,
		required: item?.required,
		fileType: ""

	}))
}


export const attachmentmodalforevent = (array, eventid, eventtype) => {
	return array.map((item) => ({
		id: item?.id,
		eventId: eventid,
		eventType: eventtype,
		attachmentDescription: item.attachmentDescription,
		attachment: item?.attachment,
		docRefId: item?.docRefId,
		fileNamePath: item?.fileNamePath,
		required: item?.required,
		fileType: item?.fileType
	}))
}
export const SQEAddModal = (selectedVendorId, Questionarray, isID = false) => {

	return Questionarray.map((item) => (
		{
			id: isID ? item?.id : 0,
			questionId: item?.id,
			questionDescription: item?.questionDescription,
			attachement: item?.attachement,
			attachedFileName: item?.attachedFileName,
			optionType: item?.optionType,
			weightage: item?.weightage,
			mandatory: item?.mandatory,
			autoCalculated: item?.autoCalculated,
			isMultiOption: item?.isMultiOption,
			isMultipleChoice: item?.isMultipleChoice,
			vendorId: selectedVendorId,
			libraryId: item?.libraryId,
			categoryId: item?.questioncategoryId,
			questionCategory: item?.questionCategory,
			categorySubId: item?.questionSubcategoryId,
			questionSubCategory: item?.questionSubCategory,
			questionOption: item?.questionOption?.length ? item.questionOption.map(option => ({
				customerId: option.customerId,
				questionId: option.questionId,
				questionOption: option.questionOption,
				weightage: option.weightage,
				selectYN: option.selectYN,
				createdOn: option.createdOn,
				createdById: option.createdById
			})) : []
		}
	));
};





export const handlesaveAttachment = async (AttachFiles, eventid, atoken) => {

	const data = {
		attachments: AttachFiles,
	};
	const res = await apiClient.postres(
		`/api/eventattachment/${eventid}/AddMultiple`,
		data,
		atoken
	);
	if (res) {
		//toast.success(`attachment is saved successfully`);

	}
};

// Function to fetch attachments from selected PR/RFQ items
export const fetchAttachmentsFromPRItems = async (selectedItems, targetEventType, atoken, customerid) => {
	try {
		// Get unique Event IDs from selected items (supports PR, RFQ, etc.)
		
		const uniqueEventIds = [...new Set(selectedItems.map(item => item.prId || item.rfqId || item.eventId))];
		
		const allAttachments = [];

		const payload = {
			CustomerId: customerid,
			eventtype: targetEventType,
			isactive: "true"
		};
		const queryParamsevent = buildQueryParams(payload);
		const resevent = await apiClient.getres(`/api/Doclib/Find?${queryParamsevent}`, atoken);
		// const reseventData =
		// 	resevent?.data?.result.length > 0
		// 		? eventattachmentmodal(resevent?.data?.result, eventid, targetEventType)
		// 		: [];
		// setAttach(reseventData); 
		if (resevent?.data?.result && resevent?.data?.result.length > 0) {
			// Map attachments to the target event format
			const mappedAttachments = resevent?.data?.result.map(attachment => ({
				id: 0, // New attachment for target event
				eventId: 0, // Will be set when saving
				eventType: targetEventType,
				attachmentDescription: attachment.attachmentdesc,
				attachment: attachment.attachment,
				fileNamePath: attachment.filepath,
				docRefId: attachment.docRefId || 0,
				required: attachment.required || false,
				removed: false,
				createdById: attachment.createdById,
				createdByName: attachment.createdByName
			}));
			
			allAttachments.push(...mappedAttachments);
		}
		
		// Fetch attachments for each Event ID
		for (const eventId of uniqueEventIds) {
			if (!eventId) continue;
			
			// Determine source event type based on which field was present
			const sourceItem = selectedItems.find(item => 
				(item.prId && item.prId === eventId) || 
				(item.rfqId && item.rfqId === eventId) || 
				(item.eventId && item.eventId === eventId)
			);
			const sourceEventType = sourceItem?.prId ? "PR" : sourceItem?.rfqId ? "RFQ" : "PR";
			
			const data = {
				EventType: sourceEventType,
				EventId: eventId,
				VendorId: 0,
			};
			const queryParams = buildQueryParams(data);
			const res = await apiClient.getres(`/api/eventattachment/Find?${queryParams}`, atoken);
			const resData = res?.data?.result || [];
			
			if (resData.length > 0) {
				// Map attachments to the target event format
				const mappedAttachments = resData.map(attachment => ({
					id: 0, // New attachment for target event
					eventId: 0, // Will be set when saving
					eventType: targetEventType,
					attachmentDescription: `${sourceEventType} - ${attachment.attachmentDescription}`,
					attachment: attachment.attachment,
					fileNamePath: attachment.fileNamePath,
					docRefId: attachment.docRefId || 0,
					required: attachment.required || false,
					removed: false,
					createdById: attachment.createdById,
					createdByName: attachment.createdByName,
					sourceEventId: eventId, // Track source event for reference
					sourceEventType: sourceEventType
				}));
				
				allAttachments.push(...mappedAttachments);
			}
		}
		
		return allAttachments;
	} catch (error) {
		console.error("Error fetching PR attachments:", error);
		return [];
	}
};



// Function to map questions to their respective subcategories
// export const  mapQuestionsToSubcategories=(categories, questions)=> {
//     // Iterate through categories

//     categories.forEach(category => {

//         category.subCategory.forEach(subCategory => {

//             // Initialize an empty array to hold questions for each subcategory
//             subCategory.questions = [];
//             // Iterate through questions
//             questions.forEach(question => {
//                 // Check if the question belongs to the current subcategory
//                 if (question.questionSubcategoryId === subCategory.id) {
//                     // Add the question to the subcategory's questions array
//                     subCategory.questions.push(question);
//                 }
//             });
//         });
//     });

//     return categories;
// }


// Function to map questions to their respective subcategories or to "others" if subcategory is falsy
export const mapQuestionsToSubcategories = (categories, questions) => {
	if (questions.length == 0) {
		return [];
	}
	// Iterate through categories
	categories.forEach(category => {
		// Initialize an empty array to hold questions without subcategories
		category.others = [];

		category.subCategory.forEach(subCategory => {
			// Initialize an empty array to hold questions for each subcategory
			subCategory.questions = [];
		});

		// Iterate through questions
		questions.forEach(question => {

			// Check if the question has a valid subcategory ID
			if (question.questionSubcategoryId) {
				// Find the subcategory that matches the question's subcategory ID
				const subCategory = category.subCategory.find(sub => sub.id === question.questionSubcategoryId);
				if (subCategory) {
					// Add the question to the subcategory's questions array
					subCategory.questions.push(question);
				}
			} else if (question.questionCategory === category.questioncategory) {
				// Add the question to the category's "others" array if no valid subcategory ID and category matches
				category.others.push(question);
			}
		});
	});

	return categories;
}

// export const segregatedEventapprover = (array,stagelistworkflow) => {

// 	const segregatedArray = array?.reduce((acc, current) => {
// 		const wfStage = current.wfStage;
// 		if (!acc[wfStage]) {
// 			acc[wfStage] = [];
// 		}
// 		acc[wfStage].push(current);
// 		return acc;
// 	}, {});
// 	const mappedData = Object.keys(segregatedArray)?.map((key, index) => {
// 		return {
// 			stage: key,
// 			approvers: segregatedArray[key]
// 		};
// 	});


// 	return mappedData;
// }


export const segregatedEventapprover = (array, stagelistworkflow) => {

	// Step 1: Initialize an object with stages from stagelistworkflow
	const finalOutput = stagelistworkflow.reduce((acc, stage) => {
		acc[stage] = []; // Initialize each stage with an empty approver list
		return acc;
	}, {});

	// Step 2: Populate the finalOutput with data from the array
	array?.forEach((current) => {
		const wfStage = current.wfStage;
		if (finalOutput[wfStage]) {

			finalOutput[wfStage].push(current); // Add current to the corresponding stage
		}
	});

	// Step 3: Map the finalOutput into the desired format
	const mappedData = Object.keys(finalOutput).map((key) => {
		return {
			stage: key,
			approvers: finalOutput[key]
		};
	});

	return mappedData;
};

//sqe find
export const getSQEData = async (data, atoken) => {

	const queryParams = Object.entries(data)
		.filter(([key, value]) => value !== null && value !== undefined && value !== '')
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join('&');
	try {
		const ENDPOINT = `${domain}api/SQE/Find?${queryParams}`;
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
		console.log(error)
	}
}

export const vendorPrimaryContactModal = (vendorPrimaryContact, vendorCategories = []) => {
	console.log("=== vendorPrimaryContactModal CALLED ===");
	console.log("Input vendorPrimaryContact:", JSON.stringify(vendorPrimaryContact, null, 2));
	console.log("Input vendorCategories:", vendorCategories);
	
	const result = vendorPrimaryContact.map((item, index) => {
		
		console.log(`Processing contact ${index}:`, item);
		console.log(`TimeZone object:`, item.TimeZone);
		console.log(`DialingCode object:`, item.DialingCode);
		console.log(`Categories:`, item.categories);
	
		const transformedContact = {
			id: item?.id || 0,
			ContactPerson: item.ContactPerson ?? '',
			Email: item.Email,
			DialingCode: item.DialingCode?.dialingCode ?? '',
			PhoneNumber: item.PhoneNumber,
			TimeZone: item.TimeZone?.localeName ?? '',
			timezoneId: item.TimeZone?.id,
			isActive: item?.isActive ?? true,
			isPrimary: item?.isPrimary ?? false,
			vendorCategoryMappings: (item.categories || []).map(category => ({
				id: 0,
				categoryId: category.id || category.categoryId || 0,
				vendorId: 0,
				contactId: 0,
				customerId: 0
			})) || []
		};
		
		console.log(`Transformed contact ${index}:`, transformedContact);
		return transformedContact;
	});
	
	console.log("=== FINAL RESULT ===", JSON.stringify(result, null, 2));
	return result;
};

export const getvendorPrimaryContactModal = (data, timezone_list, country_list) => {
	console.log("Input Data:", data);
	console.log("Timezone List:", timezone_list);
	console.log("Country List:", country_list);

	const result = {
		vendorPrimaryContact: data.map(
			({ id, email, contactPerson, timeZone, dialingCode, phoneNumber, isActive, isPrimary }, index) => {
				const matchedTimeZone = findObjByValueFromArray(timezone_list, timeZone, "localeName") || "";
				const matchedDialingCode = findObjByValueFromArray(country_list, dialingCode, "dialingCode") || null;

				console.log(`Entry ${index}:`);
				console.log("  TimeZone input:", timeZone, "Matched:", matchedTimeZone);
				console.log("  DialingCode input:", dialingCode, "Matched:", matchedDialingCode);

				return {
					id: id || 0,
					Email: email || "",
					ContactPerson: contactPerson || "",
					TimeZone: matchedTimeZone,
					DialingCode: matchedDialingCode,
					PhoneNumber: phoneNumber || "",
					isActive: isActive || false,
					isPrimary: isPrimary || false
				};
			}
		)
	};

	console.log("Output Result:", result);
	return result;
};

// export const getvendorPrimaryContactModal = (data, timezone_list, country_list) => ({
	
// 	vendorPrimaryContact: data.map(({ id, email, contactPerson, timeZone, dialingCode, phoneNumber, isActive, isPrimary }) => ({
		
	
// 		id: id || 0,
// 		Email: email || "",
// 		ContactPerson: contactPerson || "",

// 		TimeZone: findObjByValueFromArray(timezone_list, timeZone, "localeName") || "",
// 		DialingCode: findObjByValueFromArray(country_list, dialingCode, "dialingCode") || null,
// 		PhoneNumber: phoneNumber || "",
// 		isActive: isActive || false,
// 		isPrimary: isPrimary || false
// 	}))
	
// });


export const multicurrencypostmodal = (data) => {
	return data.map(item => ({
		id: item.id,
		baseCurrency: item.baseCurrency.currencyNm,
		currencyConversion: item.currencyConversion
	}));
}


export const multicurrencygetmodal = (data, currencylist) => {
	return data.map(item => ({
		id: item.id,
		baseCurrency: findObjByValueFromArray(currencylist, item.baseCurrency, "currencyNm"),
		currencyConversion: item.currencyConversion
	}));
}

//function to add eleements of array
export const sumArray = (arr) => {
	return arr.reduce((total, num) => total + num, 0);
}

export const validateFileSize = (e) => {
	let file = e.target.files[0];
	if (file) {
		const fileName = file.name;
		//setPostFileName(fileName);
		let size = 5 * 1024 * 1024; // 5MB in bytes
		if (file.size > size) {
			toast.error("File size must be less than 5MB.", {
				position: toast.POSITION.TOP_CENTER,
			});

			//setPostFileName('');


			return false;
		} else if (!getExtension(fileName)) {
			toast.error("File extension is not allowed.", {
				position: toast.POSITION.TOP_CENTER,
			});
			return false;
		}
		return true;
	}
};
export const getExtension = (filname) => {
	let fileextesion = filname.split(".").pop();
	//console.log(fileextesion);
	if (fileextesion.toLowerCase() == "rar") {
		return false;
	}
	if (fileextesion.toLowerCase() == "zip") {
		return false;
	}
	if (fileextesion.toLowerCase() == "exe") {
		return false;
	}
	if (fileextesion.toLowerCase() == "txt") {
		return false;
	}
	return true;
};




export function thousands_Sep_Text(num) {
	var num_parts = num.toString().split(".");
	num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return num_parts.join(".");
}
export const menuactionlist = [
	{
		label: "Approve",
		value: "Approved"
	},
	{
		label: "Revert",
		value: "Rejected"
	},
	{
		label: "Forward",
		value: "Forward"
	}



]

//regular expression 
export const LeadingZeroRegEx = /^0+([1-9]{1,})/;
export const DecimalValueRegEx = /^(?:[1-9]{1}[0-9]{0,8}|0)(\.[0-9]{0,4})?$/;
export const PercentageRegex = /^(100(\.0{0,4})?|[0-9]{1,2}(\.[0-9]{0,4})?)$/;
export const IntegerRegex = /^[0-9]+$/;


// export const pullMessageCount = async ({ UserId, EventType, atoken, dispatch }) => {
// 	
// 	const data = {
// 		UserId,
// 		...(EventType !== undefined && { EventType })

// 	};

// 	const queryParams = buildQueryParams(data);
// 	const res = await apiClient.getres(`api/Communication/GetNotificationCount?${queryParams}`, atoken);

// 	if (res?.data) {
// 		dispatch({
// 			type: actionTypes.SET_MESSAGE_COUNT,
// 			value: res.data
// 		});
// 	}
// };

export const pullMessageCount = async ({ UserId, EventType, EventId, atoken, dispatch }) => {
	console.log('pullMessageCount called with params:', { UserId, EventType, EventId });

	const data = {
		UserId, IsVenderYN: "N",
		...(EventType !== undefined && EventType !== "" && { EventType }),
		...(EventId !== undefined && { EventId })
	};

	const queryParams = buildQueryParams(data);
	console.log('pullMessageCount - API call with queryParams:', queryParams);

	const res = await apiClient.getres(`api/Communication/GetNotificationCount?${queryParams}`, atoken);

	console.log('pullMessageCount - API response:', res?.data);

	if (res?.data) {
		dispatch({
			type: actionTypes.SET_MESSAGE_COUNT,
			value: res.data
		});
		console.log('pullMessageCount - Dispatched message count:', res.data);
	}
};


export const buildQueryParamscomm = (params) => {
	return Object.entries(params)
		.filter(([_, value]) => value !== undefined && value !== null) // keep empty strings
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join("&");
};



export const goToLoginPage = (customersuffix) => {
	const protocol = window.location.protocol;
	const hostname = window.location.hostname;
	const port = window.location.port;
	const baseUrl = `${protocol}//${hostname}${port ? ':' + port : ''}`;
	window.location.href = baseUrl;
};

export const getFirstNCharacters = (str, n) => {
	if (!str) return '';
	const sliced = str.slice(0, n).trim();
	return str.length > n ? sliced + ' ...' : sliced;
};


export const getUserTimeZoneDate = (dateString, userDetail) => {
  if (!dateString) return null;

  const timeZone = userDetail?.timeZone || 'Asia/Kolkata';

  // Format in ISO parts in user's time zone
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z'));

  // Build ISO string manually
  const get = (type) => parts.find(p => p.type === type)?.value.padStart(2, '0');
  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = get('hour');
  const minute = get('minute');
  const second = get('second');

  // Create a new Date from adjusted parts
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
};

/**
 * Downloads an Excel template from the Python API
 * @param {Object} params - Download parameters
 * @param {number} params.customerId - Customer ID
 * @param {number} params.templateId - Template ID
 * @param {string} params.fileName - Custom file name (optional)
 * @param {string} params.eventType - Event type for file naming (optional)
 * @returns {Promise<boolean>} - Success status
 */
export const downloadExcelTemplate = async ({ customerId, templateId, fileName, eventType }) => {
  try {
    
    const pythonApiUrl = process.env.REACT_APP_APIPYTHON_CALL;
   
    if (!pythonApiUrl) {
      console.error("REACT_APP_APIPYTHON_CALL environment variable is not defined");
      toast.error("API configuration error. Please contact support.", {
        toastId: "api-config-error"
      });
      return false;
    }
 
    const formData = new FormData();
    formData.append("customerId", customerId);
    formData.append("templateId", templateId);
    const host = window.location.host;      // buyer.pe.com
    const cleanHost = host.split(":")[0];   // remove port
    const tenant = cleanHost.split(".")[0];
    const response = await fetch(`${pythonApiUrl}bulk-template/generate-excel`, {
      method: "POST",
      headers: {
            "X-Tenant": tenant,
        },
      body: formData
    });
 
    if (!response.ok) {
      throw new Error("Failed to download Excel file.");
    }
 
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
   
    // Generate file name
    const defaultFileName = `${eventType || 'template'}_${new Date().getTime()}.xlsx`;
    a.download = fileName || defaultFileName;
   
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
   
    return true;
  } catch (error) {
    console.error("Error downloading Excel template:", error);
    toast.error("Error downloading the file.", {
      toastId: "template-download-error"
    });
    return false;
  }
};
// export const downloadExcelTemplate = async ({ customerId, templateId, fileName, eventType }) => {
//   try {
//     const pythonApiUrl = process.env.REACT_APP_APIPYTHON_CALL;
    
//     if (!pythonApiUrl) {
//       console.error("REACT_APP_APIPYTHON_CALL environment variable is not defined");
//       toast.error("API configuration error. Please contact support.", {
//         toastId: "api-config-error"
//       });
//       return false;
//     }

//     const formData = new FormData();
//     formData.append("customerId", customerId);
//     formData.append("templateId", templateId);

//     const response = await fetch(`${pythonApiUrl}bulk-template/generate-excel`, {
//       method: "POST",
//       body: formData
//     });

//     if (!response.ok) {
//       throw new Error("Failed to download Excel file.");
//     }

//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
    
//     // Generate file name
//     const defaultFileName = `${eventType || 'template'}_${new Date().getTime()}.xlsx`;
//     a.download = fileName || defaultFileName;
    
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);
    
//     return true;
//   } catch (error) {
//     console.error("Error downloading Excel template:", error);
//     toast.error("Error downloading the file.", {
//       toastId: "template-download-error"
//     });
//     return false;
//   }
// };
