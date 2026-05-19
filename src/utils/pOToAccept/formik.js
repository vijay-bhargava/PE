import { useFormik } from 'formik';
import * as Yup from 'yup';


//POConfirmOrder POST
const initialValues_POConfirmOrder = {
  PoId: 0,
  ConfirmationNo: '',
  SupplierRef: '',
  ConfirmedShipDate: null,
  ConfirmedDelDate: null,
  ShippingCost: 0,
  Remarks: '',
};

const validationSchema_POConfirmOrder = Yup.object().shape({
  shippingCost: Yup.number()
    .typeError('Shipping cost must be a number')
    .required('Shipping cost is required')
    .positive('Shipping cost must be a positive number')
    .min(0, 'Shipping cost must be greater than 0'),

  confirmedShipDate: Yup.date()
    .typeError('Please enter a valid date')
    .required('Est. Shipping Date is required')
    .min(new Date(), 'Est. Shipping Date must be greater than or equal to the current date'),

  confirmedDelDate: Yup.date()
    .typeError('Please enter a valid date')
    .required('Est. Delivery Date is required')
    .min(Yup.ref('confirmedShipDate'), 'Est. Delivery Date must be greater than or equal to the Shipping date'),
});

const useFormik_POConfirmOrder = (onSubmitCallback, prefilled_POConfirmOrder) => {

  return useFormik({
    initialValues: { ...initialValues_POConfirmOrder, ...prefilled_POConfirmOrder },
    // validationSchema: validationSchema_POConfirmOrder,
    onSubmit: (values) => {

      onSubmitCallback(values);
    },
  });
};

//PORejectOrder POST
const initialValues_PORejectOrder = {
  "poId": 0,
  "status": "",
  "rejectionReason": ""
};

const validationSchema_PORejectOrder = Yup.object().shape({

});



const useFormik_PORejectOrder = (onSubmitCallback, prefilled_PORejectOrder) => {
  const initialValues = { ...initialValues_PORejectOrder, ...prefilled_PORejectOrder };
  return useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema_PORejectOrder,
    onSubmit: (values) => {

      onSubmitCallback(values);
    },
  });
};




//POShipHeader POST
const initialValues_POShipHeader = {
  "id": 0,
  "poId": 0,
  "customerId": 0,
  "vendorId": 0,
  "shipSlipId": "",
  "shipNoticeType": "",
  "carrierName": "",
  "lrShipBillNumber": "",
  "ewayBillNumber": "",
  "shipMethod": "",
  "serviceLevel": "",
  "shippingDate": null,
  "deliveryDate": null,
  "invoicePath": "",
  "invoiceFile": "",
  "invoiceDate": null
}

const validationSchema_POShipHeader = Yup.object().shape({

});

const useFormik_POShipHeader = (onSubmitCallback, prefilled_POShipHeader) => {

  return useFormik({
    initialValues: { ...initialValues_POShipHeader, ...prefilled_POShipHeader },
    validationSchema: validationSchema_POShipHeader,
    onSubmit: (values) => {

      onSubmitCallback(values);
    },
  });
};

//POShipOrdrItem POST
const initialValues_POShipOrdrItem = {
  "poId": 0,
  "poItemDetail": []
};

const validationSchema_POShipOrdrItem = Yup.object().shape({

});

const useFormik_POShipOrdrItem = (onSubmitCallback) => {
  return useFormik({
    initialValues: initialValues_POShipOrdrItem,
    validationSchema: validationSchema_POShipOrdrItem,
    onSubmit: (values) => {

      onSubmitCallback(values);
    },
  });
};

//POShipInvoiceHeader POST
const initialValues_POShipInvoiceHeader = {
  "id": 0,
  "customerId": 0,
  "vendorId": 0,
  "shipSlipId": "",
  "shipNoticeType": "",
  "carrierName": "",
  "lrShipBillNumber": "",
  "ewayBillNumber": "",
  "shipMethod": "",
  "serviceLevel": "",
  "remarks": "",
  "shipTyStatuspe": "",
  "finalStatus": "",
  "actionTakenBy": "",
  "grossValue": 0,
  "quantity": 0,
  "grossWeight": 0,
  "reqDeliveryDate": null,
  "shippingDate": null,
  "deliveryDate": null,
  "invoiceNo": "",
  "serviceDesc": "",
  "supplierTaxId": "",
  "invoicePath": "",
  "invoiceFile": "",
  "invoiceDate": null,
  "createdOn": null,
  "createdBy": 0,
  "modifyOn": null,
  "modifyBy": 0
};
const validationSchema_POShipInvoiceHeader = Yup.object().shape({

});

const useFormik_POShipInvoiceHeader = (onSubmitCallback) => {
  return useFormik({
    initialValues: initialValues_POShipInvoiceHeader,
    validationSchema: validationSchema_POShipInvoiceHeader,
    onSubmit: (values) => {

      onSubmitCallback(values);
    },
  });
};

//POAttachments POST
const initialValues_POAttachments = {
  "id": 0,
  "poHeaderId": 0,
  "customerId": 0,
  "vendorId": 0,
  "poAttachmentDescription": "",
  "poAttachment": "",
  "fileType": "",
  "createdOn": null,
  "createdBy": 0
}

const validationSchema_POAttachments = Yup.object().shape({

});

const useFormik_POAttachments = (onSubmitCallback) => {
  return useFormik({
    initialValues: initialValues_POAttachments,
    validationSchema: validationSchema_POAttachments,
    onSubmit: (values) => {

      onSubmitCallback(values);
    },
  });
};


const initialValues_GRNAccepted = {
  "id": 0,
  "poId": 0,
  "grnQuantity": 0,
  "grnAmount": 0,
  "grnNumber": "",
  "grnDate": null
};


const validationSchema_GRNAccepted = Yup.object().shape({
  grnNumber: Yup.string()
    .typeError('GRN number is required')
    .required("GRN number is required"),
  grnAmount: Yup.number()
    .typeError("GRN Amount must be a number")
    .positive("GRN Amount must be a positive number")
    .min(0, "GRN Amount must be greater than 0")
    .required("GRN Amount is required"),
  grnQuantity: Yup.number()
    .typeError("GRN Qty must be a number")
    .positive("GRN Qty must be a positive number")
    .min(0, "GRN Qty must be greater than 0")
    .required("GRN Qty is required"),
  grnDate: Yup.date()
    .typeError("Please enter a valid date")
    .required("GRN Date is required")
});
const useFormik_GRNAccepted = (onSubmitCallback, prefilled_GRNAccepted) => {
  const initialValues = { ...initialValues_GRNAccepted, ...prefilled_GRNAccepted };
  return useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema_GRNAccepted,
    onSubmit: (values) => {
      
      onSubmitCallback(values);
    },
  });
};


const initialValues_InvoiceAccepted = {
  "id": 0,
  "poId": 0,
  "status": "Approve"
};


const validationSchema_InvoiceAcccepted = Yup.object().shape({
  status: Yup
    .string("Please choose status")
    .max(200, "Max 200 character")
    .required("Status is required"),
 approveComment: Yup
    .string("Please enter comment")
    .max(200, "Max 200 character")
    .required("Comments is required"),
});

const useFormik_InvoiceAccepted = (onSubmitCallback, prefilled_GRNAccepted) => {
  
  const initialValues = { ...initialValues_InvoiceAccepted, ...prefilled_GRNAccepted };
  return useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema_InvoiceAcccepted,
    onSubmit: (values) => {
      
      onSubmitCallback(values);
    },
  });
};



export { useFormik_POConfirmOrder, useFormik_PORejectOrder, useFormik_POShipHeader, useFormik_POShipOrdrItem, useFormik_POShipInvoiceHeader, useFormik_POAttachments, useFormik_GRNAccepted, useFormik_InvoiceAccepted };