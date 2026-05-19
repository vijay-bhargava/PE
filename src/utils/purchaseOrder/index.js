import Axios from "axios";
//import CryptoJS from 'crypto-js';
import { toast } from "react-toastify";
import { uploadFilesOnAzure, getPayloadWithStage } from "../common";

const domain = process.env.REACT_APP_API_CALL;


export const GetPODetails = async (poId, itemId, atoken) => {

  try {

    const url = `${domain}api/poconfirm/${poId}/GetPODetails?itemId=${itemId}`; //?${queryParams} 

    //const url = `${domain}api/poconfirm/Find?Id=${poId}&itemId=${itemId}`; //?${queryParams} 

    const headers = {
      "accept": "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const res = await Axios.get(url, { headers });
    // console.log('GetPODetails', res)

    return res?.data;

  } catch (error) {
    // console.log('error-- ', error);
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
    }
    return '';
  }
}


// #8 GetPOHeaderList_Slug
export const GetPOHeaderList_Slug = async (Slug, atoken) => {

  try {
    const url = `${domain}api/poconfirm/Find?Id=${Slug}`;

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const res = await Axios.get(url, { headers });
    //console.log('resresres', res)
    if (res?.status === 200) {

      return res?.data?.result[0];
    }
  } catch (error) {
    // console.log('error-- ', error);
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


export const GetPOShipHeaderList = async (data, atoken) => {
  try {

    //to create dynamic query
    const queryParams = Object.entries(data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    //  const url = `${domain}api/VendorFullfilment/GetPOShipHeaderList?${queryParams}`;

   // const url = `${domain}api/poinvoice/Find?${queryParams}`;
   
    const url = `${domain}api/shipment/Find?${queryParams}`;


    const headers = {
      "accept": "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const res = await Axios.get(url, { headers });

    if (res?.status === 200) {
      
      console.log('Headerdelivery -1', res.data)
      //return res?.data.result;
      return res?.data;
    }

  } catch (error) {
    // console.log('error-- ', error);
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
    }
    return '';
  }
}


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
    // console.log('error-- ', error);
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
    }
    return '';
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
    //console.log('GetPOAttachments', res)

    return res?.data;

  } catch (error) {
    // console.log('error-- ', error);
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
    }
    return '';
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
    
    //console.log('data data', data)
    // const url = `${domain}api/VendorFullfilment/POShipInvoiceGRN`; 
    const url = `${domain}api/poinvoice/Update`;

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const res = await Axios.post(url, data, { headers });
    console.log('POShipInvoiceGRN', res)
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
    console.log('POShipInvoiceGRN', res)
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
    // console.log('error-- ', error);
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
    }
    return '';
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
    // console.log('error-- ', error);
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
    
    //console.log("resresres", res);
    if (res?.data) {
      toast("Address update successfully", {
        hideProgressBar: true,
        autoClose: 1000,
        type: "success",
      });
      
      return res?.data;
    }
    // if (res?.data?.statusCode === 200) {
    //   toast("Address update successfully", {
    //     hideProgressBar: true,
    //     autoClose: 1000,
    //     type: "success",
    //   });
    //   
    //   return res?.data?.result;
    // }
  } catch (error) {
    // console.log('error-- ', error);
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