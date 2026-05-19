import React, { useEffect, useState, useRef } from "react";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { api, ApiClient } from "../../../Apiclient";
import { downloadFilesOnAzure, getExtension, getFileName } from "../../../utils/common";
import { buildQueryParams } from "../../../utils/purchaseRequest";
import { useStateValue } from "../../../store";


const SupplierAttachmentCell = ({eventid,eventtype,satoken,vendorid}) => {  
	const [{ customersuffix }, dispatch] =useStateValue();
	const apiClient = new ApiClient(customersuffix);
    const [attachmentDesc, setattachmentDesc] = useState("");
	const [attachment, setAttachement] = useState(null);
    const [AttachFiles, setAttach] = useState([]);
    const [error, setError] = useState("");
    useEffect(()=>{
       fetchAttachments()
    },[vendorid])

 
	const [loading,setLoading]=useState(false)

    const fetchAttachments = async () => {
		  
		let res = [];
		if (parseInt(eventid)) {
			const data = {
				EventType: eventtype,
				EventId: eventid,
                VendorId:vendorid
			};
			const queryParams = buildQueryParams(data);
            
			res = await apiClient.getres(
				`/api/eventattachment/Find?${queryParams}`,

				satoken
			);
			const resData = res?.data?.result || []; // Default to an empty array if undefined
            setAttach(resData)    
			
			
		}

		
	};



  return (
    <div className="row mt-2">
    
  
    {AttachFiles &&
									AttachFiles?.map((item, index) => (
										<div className="border-bottom mb-2 pt-1 pb-1" key={index}>
											<div className="row">
												<div
													className="col-md-5"
													style={{
														fontStyle: "normal",
													}}
												>
													{item?.attachmentDescription}
												</div>
												<div className="col-md-5">
													<Form.Group controlId="formFile" className="">
														<div
															className="col-12 col-md-8 mb-2"
															style={{
																color: "blue",
																fontStyle: "italic",
																cursor: "pointer",
															}}
															onClick={() =>
																downloadFilesOnAzure(
																	item?.fileNamePath,
																	getFileName(item?.fileNamePath),
																	satoken
																)
															}
														>
															{getFileName(item?.fileNamePath)}
														</div>
													</Form.Group>
												</div>

												
											</div>
										</div>
									))}		
	{AttachFiles && AttachFiles.length<1 && <div className="fw500 f13 p-4">No Attachment</div>}								
</div>

  )
}

export default SupplierAttachmentCell