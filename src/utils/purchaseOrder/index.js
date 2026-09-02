import Axios from "axios";
import { toast } from "react-toastify";
import { uploadFilesOnAzure, getPayloadWithStage } from "../common";

const domain = process.env.REACT_APP_API_CALL;

// export const GetPODetails = async (poId, itemId, atoken) => {
//   try {
//     const url = `${domain}api/poconfirm/${poId}/GetPODetails?itemId=${itemId}`; //?${queryParams}
//     //const url = `${domain}api/poconfirm/Find?Id=${poId}&itemId=${itemId}`; //?${queryParams}

//     const headers = {
//       "accept": "application/json",
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${atoken}`,
//     };
//     const res = await Axios.get(url, { headers });
//     // console.log('GetPODetails', res)

//     return res?.data;

//   } catch (error) {
//     // console.log('error-- ', error);
//     if (error?.response?.data?.Message) {
//       toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
//     }
//     return '';
//   }
// }


// #8 GetPOHeaderList_Slug
// export const GetPOHeaderList_Slug = async (Slug, atoken) => {

//   try {
//     const url = `${domain}api/poconfirm/Find?Id=${Slug}`;

//     const headers = {
//       accept: "application/json",
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${atoken}`,
//     };

//     const res = await Axios.get(url, { headers });
//     //console.log('resresres', res)
//     if (res?.status === 200) {

//       return res?.data?.result[0];
//     }
//   } catch (error) {
//     // console.log('error-- ', error);
//     if (error?.response?.data?.Message) {
//       toast(error?.response?.data?.Message, {
//         hideProgressBar: true,
//         autoClose: 1000,
//         type: "error",
//       });
//     }
//     return "";
//   }
// };

export const POAttachments = async (Data, atoken) => {

  try {
    //to create dynamic query

    let data = {
      "id": Data.id,
      "poHeaderId": Data.poHeaderId,
      "poAttachmentDescription": Data.poAttachmentDescription,
      "poAttachment": Data.poAttachmentDescription,
      "fileType": Data.fileType,
      "filePath": `${Data?.poHeaderId}/${Data?.fileType}`
    }
    //  const url = `${domain}api/VendorFullfilment/POAttachments`;
    const url = `${domain}api/poconfirm/POAttachments`;

    const headers = {
      "accept": "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const res = await Axios.post(url, data, { headers });
    //  console.log('POAttachments', res)
    if (res?.status === 200) {

      let resp = await uploadFilesOnAzure(`${Data?.poHeaderId}/${Data?.fileType}`, Data?.POAttachment, atoken)
      toast('Your file is uploaded successfully', { hideProgressBar: true, autoClose: 2000, type: 'success' })

      return resp
    }
  } catch (error) {
    throw error;
  }
}

export const GetPOAttachments = async (data, atoken) => {

  try {
    //to create dynamic query
    const queryParams = Object.entries(data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    //  const url = `${domain}api/VendorFullfilment/GetPOAttachments?${queryParams}`; 

    const url = `${domain}api/poconfirm/GetPOAttachments?${queryParams}`;

    const headers = {
      "accept": "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const res = await Axios.get(url, { headers });

    return res?.data;
  } catch (error) {
    throw error;
  }
}

export const POShipInvoiceGRN = async (poId, selectedInvoiceRows, datavalue, stagelist, atoken) => {

  try {
    //to create dynamic query

    let dataPost = {
      "id": selectedInvoiceRows[0]?.id,
      "poId": parseInt(poId),
      "grnQuantity": parseFloat(datavalue?.grnQuantity),
      "grnNumber": datavalue.grnNumber,
      "grnAmount": parseFloat(datavalue?.grnAmount),
      "grnDate": datavalue?.grnDate,
      "customerId": selectedInvoiceRows[0]?.customerId
    }

    const data = getPayloadWithStage('currentStage', selectedInvoiceRows[0]?.stage, stagelist, dataPost, 'currentStage');

    // const url = `${domain}api/VendorFullfilment/POShipInvoiceGRN`;
    const url = `${domain}api/poinvoice/Update`;

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const res = await Axios.post(url, data, { headers });
    if (res?.status === 200) {
      toast('Your Data is saved successfully', { hideProgressBar: true, autoClose: 2000, type: 'success' })
      return res?.data?.result;
    }
  } catch (error) {
    throw error;
  }
}

export const POShipInvoiceApproval = async (poId, selectedInvoiceRows, datavalue, stagelist, activityId, atoken) => {

  try {

    var CurrentStage = selectedInvoiceRows[0]?.stage;
    if (datavalue?.status === 'Rejected' && selectedInvoiceRows[0]?.stage === "Invoice Raised") {
      CurrentStage = "UnderApproval";
    }
    else if (datavalue?.status === 'Approved' && selectedInvoiceRows[0]?.stage === "Invoice Raised") {
      CurrentStage = "Under Approval";
    }
    if (datavalue?.status === 'Rejected' && selectedInvoiceRows[0]?.stage === "Pending for Payment") {
      CurrentStage = "Pending for Payment";
    }
    else if (datavalue?.status === 'Approved' && selectedInvoiceRows[0]?.stage === "Pending for Payment") {
      CurrentStage = "Paid";
    }

    let dataPost = {
      "id": selectedInvoiceRows[0]?.id,
      "poId": parseInt(poId),
      "status": datavalue?.status,
      "approveComment": datavalue.approveComment,
      "activityId": activityId
    }

    const data = getPayloadWithStage('currentStage', CurrentStage, stagelist, dataPost, 'currentStage');
    //to create dynamic query

    const url = `${domain}api/poinvoice/POShipInvoiceApproval`;

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const res = await Axios.post(url, data, { headers });
    if (res?.status === 200) {
      toast('Your Data is saved successfully', { hideProgressBar: true, autoClose: 2000, type: 'success' })
      return res?.data?.result;
    }
  } catch (error) {
    throw error;
  }
}

//Un used Accepted GRN for multiple invoice at a time
export const POShipInvoiceAcceptGRN = async (dataPost, stagelist, atoken) => {

  try {
    //to create dynamic quer
    const data = getPayloadWithStage('currentStage', dataPost.status, stagelist, dataPost, 'currentStage');
    const url = `${domain}api/VendorFullfilment/POShipInvoiceAcceptGRN`;

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const res = await Axios.post(url, data, { headers });
    if (res?.status === 200) {
      toast('Your Data is saved successfully', { hideProgressBar: true, autoClose: 2000, type: 'success' })
      return res?.data?.result;
    }
  } catch (error) {
    throw error;
  }
}

export const POConfirmOrder = async (Data, stagelist, atoken) => {
  try {
    //to create dynamic query
    let data = {
      "poId": parseInt(Data?.poId),
      "ConfirmationNo": Data?.ConfirmationNo,
      "SupplierRef": Data?.SupplierRef,
      "ConfirmedShipDate": Data?.ConfirmedShipDate?.toISOString(),
      "ConfirmedDelDate": Data?.ConfirmedDelDate?.toISOString(),
      "ShippingCost": parseFloat(Data?.ShippingCost),
      "Remarks": Data?.Remarks
    }

    let datapost = getPayloadWithStage('currentStage', Data?.stage, stagelist, data);

    //const url = `${domain}api/VendorFullfilment/${Data?.poId}/POConfirmOrder`; 
    const url = `${domain}api/poconfirm/Update`;

    const headers = {
      "accept": "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const res = await Axios.post(url, datapost, { headers });
    //console.log('POConfirmOrder', res)
    if (res?.status === 200) {

      toast('Successful', { hideProgressBar: true, autoClose: 2000, type: 'success' })
      return res?.data?.result;
    }
  } catch (error) {
    throw error;
  }
}

export const PORejectOrder = async (Data, stagelist, atoken) => {

  try {
    //to create dynamic query
    let data = {
      "poId": Data.poId,
      "status": "Rejected",
      "rejectionReason": Data.rejectionReason
    }

    let datapost = getPayloadWithStage('currentStage', Data?.stage, stagelist, data);

    // const url = `${domain}api/VendorFullfilment/${Data?.poId}/PORejectOrder`; 

    const url = `${domain}api/poconfirm/Update`;

    const headers = {
      "accept": "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${datapost}`,
    };
    const res = await Axios.post(url, data, { headers });
    // console.log('PORejectOrder', res)
    if (res?.status === 200) {
      toast('Your Data is saved successfully', { hideProgressBar: true, autoClose: 2000, type: 'success' })
      return res?.data?.result;
    }
  } catch (error) {
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
    }
    return '';
  }
}

export const POShipHeader = async (Data, stagelist, atoken) => {
  try {

    let data = {
      "id": Data?.id,
      "poId": Data?.poId,
      "customerId": Data?.customerId,
      "vendorId": Data?.vendorId,
      "shipSlipId": Data?.shipSlipId,
      "shipNoticeType": Data?.shipNoticeType,
      "carrierName": Data?.carrierName,
      "lrShipBillNumber": Data?.lrShipBillNumber,
      "ewayBillNumber": Data?.ewayBillNumber,
      "shipMethod": Data?.shipMethod,
      "serviceLevel": Data?.serviceLevel,
      "shippingDate": Data?.shippingDate?.toISOString(),
      "deliveryDate": Data?.deliveryDate?.toISOString(),
      "invoicePath": Data?.invoicePath,
      "invoiceFile": Data?.invoiceFile,
      "invoiceDate": Data?.invoiceDate,
    }


    let datapost = getPayloadWithStage('currentStage', Data?.stage, stagelist, data);

    const url = `${domain}api/VendorFullfilment/${Data?.poId}/POShipHeader`;

    const headers = {
      "accept": "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const res = await Axios.post(url, datapost, { headers });
    //console.log('POShipHeader', res)
    if (res?.data?.statusCode === 200) {
      toast('successful', { hideProgressBar: true, autoClose: 2000, type: 'success' })
      return res?.data?.result;
    }
  } catch (error) {
    // console.log('error-- ', error);
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
    }
    return '';
  }
}

export const POShipOrdrItem = async (Data, stagelist, atoken) => {

  try {
    //to create dynamic query
    let data = {
      "poId": Data?.poId,
      "poItemDetail": Data?.poItemDetail
    }


    let datapost = getPayloadWithStage('currentStage', Data?.stage, stagelist, data);

    // const url = `${domain}api/VendorFullfilment/${Data?.poId}/poshiporderitem`;
    const url = `${domain}api/poinvoice/Add`;

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const res = await Axios.post(url, datapost, { headers });
    //console.log('POShipOrdrItem', res)
    if (res?.status === 200) {
      toast('Your Data is saved successfully', { hideProgressBar: true, autoClose: 2000, type: 'success' })
      return res?.data?.result;
    }
  } catch (error) {
    // console.log('error-- ', error);
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
    }
    return '';
  }
}

export const POShipInvoiceHeader = async (Data, stagelist, atoken) => {

  try {
    //to create dynamic query
    let data = {
      "id": Data?.id,
      "customerId": Data?.customerId,
      "vendorId": Data?.vendorId,
      "shipSlipId": Data?.shipSlipId,
      "shipNoticeType": Data?.shipNoticeType,
      "carrierName": Data?.carrierName,
      "lrShipBillNumber": Data?.lrShipBillNumber,
      "ewayBillNumber": Data?.ewayBillNumber,
      "shipMethod": Data?.shipMethod,
      "serviceLevel": Data?.serviceLevel,
      "remarks": Data?.remarks,
      "shipTyStatuspe": Data?.shipTyStatuspe,
      "stage": Data?.stage,
      "actionTakenBy": Data?.actionTakenBy,
      "grossValue": Data?.grossValue,
      "quantity": Data?.quantity,
      "grossWeight": Data?.grossWeight,
      "reqDeliveryDate": Data?.reqDeliveryDate?.toISOString(),
      "shippingDate": Data?.shippingDate?.toISOString(),
      "deliveryDate": Data?.deliveryDate?.toISOString(),
      "invoiceNo": Data?.invoiceNo,
      "serviceDesc": Data?.serviceDesc,
      "supplierTaxId": Data?.supplierTaxId,
      "invoicePath": Data?.invoicePath,
      "invoiceFile": Data?.invoiceFile,
      "invoiceDate": Data?.invoiceDate,
      "createdOn": Data?.createdOn?.toISOString(),
      "createdBy": Data.createdBy,
      "modifyOn": Data.modifyOn?.toISOString(),
      "modifyBy": Data.modifyBy,
    }

    let datapost = getPayloadWithStage('currentStage', Data?.stage, stagelist, data);

    //   const url = `${domain}api/VendorFullfilment/POShipInvoiceHeader`;
    const url = `${domain}api/poinvoice/Update`;

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const res = await Axios.post(url, datapost, { headers });
    //console.log('POShipInvoiceHeader', res)
    if (res?.status === 200) {
      toast('Your Data is saved successfully', { hideProgressBar: true, autoClose: 2000, type: 'success' })
      return res?.data?.result;
    }
  } catch (error) {
    // console.log('error-- ', error);
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
    }
    return '';
  }
}


export const generateEventStage = (stages) =>
  stages?.reduce((acc, stage, index) => {
    acc[stage] = index;
    return acc;
  }, {});

// Re-usable API helper

export const UpdatePOAddresses = async (data, atoken) => {

  try {
    //to create dynamic query
    const url = `${domain}api/poconfirm/UpdateAddress`;

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const res = await Axios.post(url, data, { headers });

    if (res?.data) {
      toast("Address update successfully", {
        hideProgressBar: true,
        autoClose: 1000,
        type: "success",
      });

      return res?.data;
    }
  } catch (error) {
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, {
        hideProgressBar: true,
        autoClose: 1000,
        type: "error",
      });
    }
    return "";
  }
};

export const POCommercialFind = async (RfqId, isHeader, atoken) => {
  try {
    const queryParams = new URLSearchParams();
    if (RfqId) queryParams.append('RfqId', RfqId);
    if (isHeader !== undefined) queryParams.append('isHeader', isHeader);

    const url = `${domain}api/poconfirm/POCommercialFind?${queryParams.toString()}`;

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const res = await Axios.get(url, { headers });

    if (res?.status === 200) {
      return res?.data || [];
    }
  } catch (error) {
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, {
        hideProgressBar: true,
        autoClose: 1000,
        type: "error",
      });
    }
    return [];
  }
};

export const GetPOCondition = async (poId, version, atoken, options = {}) => {
  try {
    const ver = Number(version) || 1;
    const query = `poId=${poId}&version=${ver}`;
    const url = `${domain}api/pocondition/Find?${query}`;

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const config = { headers };
    if (options.signal) config.signal = options.signal;

    const res = await Axios.get(url, config);
    // API may return array or { result: [...] }
    let data = res?.data ?? null;
    if (data && data.result) data = data.result;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') return { __cancelled: true };
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' });
    }
    return [];
  }
};

export const GetPOCreationDetails = async (poId, version, atoken, options = {}) => {

  try {
    const ver = Number(version) || 1;
    const url = `${domain}api/pocreationdetail/Find?poId=${poId}&version=${ver}`;

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const config = { headers };
    if (options.signal) config.signal = options.signal;

    const res = await Axios.get(url, config);
    // API returns an array of items
    return res?.data ?? [];
  } catch (error) {
    if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
      return { __cancelled: true };
    }
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' });
    }
    return [];
  }
};

export const GetPOVersion = async (poId, version, atoken, options = {}) => {
  try {
    const ver = Number(version) || 1;
    const url = `${domain}api/poconfirm/GetPOVersion?poId=${poId}&version=${ver}`;

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const config = { headers };
    // support AbortController signal if provided
    if (options.signal) config.signal = options.signal;

    const res = await Axios.get(url, config);
    return res?.data ?? null;
  } catch (error) {
    // propagate cancellation silently
    if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
      return { __cancelled: true };
    }
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' });
    }
    return null;
  }
};

export const GetPOHeaderList_Slug = async (Slug, atoken, version = 1) => {
  try {
    const res = await GetPOVersion(Slug, version, atoken);

    console.log("GetPOHeaderList_Slug Response:", res);

    if (!res || res.__cancelled) {
      return null;
    }

    return res;
  } catch (error) {
    console.error("GetPOHeaderList_Slug Error:", error);

    if (error?.response?.data?.Message) {
      toast(error.response.data.Message, {
        hideProgressBar: true,
        autoClose: 1000,
        type: "error",
      });
    }

    return null;
  }
};

export async function POInvoiceAdd(invoiceData, token) {
  try {

    const payload = {
      invoiceNo: invoiceData.invoiceNo ?? 0,
      poId: invoiceData.poId ?? 0,
      poCreationId: invoiceData.poCreationId ?? 0,
      shipHId: invoiceData.shipHId ?? 0,
      filePath: invoiceData.filePath ?? "",
      invoiceDate: invoiceData.invoiceDate,
      totaLInvoiceAmount: invoiceData.totaLInvoiceAmount ?? 0,
      stages: invoiceData.stages,
      customerId: invoiceData.customerId ?? 0,
      headerCondition: invoiceData.headerCondition ?? [],
      invoiceItem: invoiceData.invoiceItem ?? []
    };

    const response = await fetch('/api/poinvoice/Add', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },

      // IMPORTANT
      body: JSON.stringify([payload])
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    return await response.json();
  }
  catch (error) {
    console.error(error);
    throw error;
  }
}

export async function POInvoiceFind(invoiceId, token) {
  try {
    const response = await fetch(`/api/poinvoice/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch invoice: ${response.statusText}`);
    }

    const invoiceData = await response.json();

    // Ensure headerCondition and itemCondition arrays exist
    // This handles backward compatibility with older invoice data
    if (!invoiceData.headerCondition) {
      invoiceData.headerCondition = [];
    }

    if (Array.isArray(invoiceData.invoiceItem)) {
      invoiceData.invoiceItem = invoiceData.invoiceItem.map(item => ({
        ...item,
        itemCondition: item.itemCondition || [],
      }));
    }
    return invoiceData;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
}

// export async function POInvoiceAdd(invoiceData, token) {
// 	try {

// 		const payload = {
// 			invoiceNo: invoiceData.invoiceNo ?? 0,
// 			poId: invoiceData.poId ?? 0,
// 			poCreationId: invoiceData.poCreationId ?? 0,
// 			shipHId: invoiceData.shipHId ?? 0,
// 			filePath: invoiceData.filePath ?? "",
// 			invoiceDate: invoiceData.invoiceDate,
// 			totaLInvoiceAmount: invoiceData.totaLInvoiceAmount ?? 0,

// 			stages: invoiceData.stages,

// 			customerId: invoiceData.customerId ?? 0,

// 			headerCondition: invoiceData.headerCondition ?? [],

// 			invoiceItem: invoiceData.invoiceItem ?? []
// 		};


// 		const response = await fetch('/api/poinvoice/Add', {
// 			method:'POST',
// 			headers:{
// 				Authorization:`Bearer ${token}`,
// 				'Content-Type':'application/json'
// 			},

// 			// IMPORTANT
// 			body: JSON.stringify([payload])
// 		});


// 		if(!response.ok){
// 			const error = await response.text();
// 			throw new Error(error);
// 		}


// 		return await response.json();

// 	}
// 	catch(error){
// 		console.error(error);
// 		throw error;
// 	}
// }


// export async function POInvoiceFind(invoiceId, token) {
// 	try {
// 		const response = await fetch(`/api/poinvoice/${invoiceId}`, {
// 			method: 'GET',
// 			headers: {
// 				'Authorization': `Bearer ${token}`,
// 				'Content-Type': 'application/json',
// 			},
// 		});

// 		if (!response.ok) {
// 			throw new Error(`Failed to fetch invoice: ${response.statusText}`);
// 		}

// 		const invoiceData = await response.json();

// 		// Ensure headerCondition and itemCondition arrays exist
// 		// This handles backward compatibility with older invoice data
// 		if (!invoiceData.headerCondition) {
// 			invoiceData.headerCondition = [];
// 		}

// 		if (Array.isArray(invoiceData.invoiceItem)) {
// 			invoiceData.invoiceItem = invoiceData.invoiceItem.map(item => ({
// 				...item,
// 				itemCondition: item.itemCondition || [],
// 			}));
// 		}

// 		return invoiceData;
// 	} catch (error) {
// 		console.error('Error fetching invoice:', error);
// 		throw error;
// 	}
// }
