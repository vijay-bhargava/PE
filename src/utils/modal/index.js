//RFQ

export const RFQQuestionsModal = (selectedQuesionArray, idFromURL) => 
  
    selectedQuesionArray?.map((obj) => ({
      id: 0,
      rfqId: idFromURL,
      questionId: obj?.id || 0,
      questionDescription: obj?.questionDescription || "",
      questionRequirement: obj?.questionRequirement || "",
      attachement: obj?.attachement || false,
      attachedFileName: obj?.attachedFileName || "",
      optionType: obj?.optionType || false,
      isMultiOption: obj?.isMultiOption || false,
			isMultipleChoice: obj?.isMultipleChoice || false,
      weightage: obj?.weightage || 0,
      mandatory: obj?.mandatory || false,
      isActive: obj?.isActive || false,
      libraryId: obj?.libraryId || 0,
      libraryEntity: obj?.libraryEntity || "",
      questioncategoryId: obj?.questioncategoryId || 0,
      questionCategory: obj?.questionCategory || "",
      questionSubcategoryId: obj?.questionSubcategoryId || 0,
      questionSubCategory: obj?.questionSubCategory || "",
      questionOption: obj?.questionOption?.length > 0
        ? obj.questionOption.map(({ id, ...rest }) => ({ ...rest }))
        : [],
    }));


export const RFQSupplierQuestionsModal = (selectedQuesionArray, idFromURL) => 
          
      selectedQuesionArray?.map((obj) => ({
         id: obj?.id,
        rfqId: idFromURL,
        questionId: obj?.questionId,
        questionDescription: obj?.questionDescription,
        questionRequirement: obj?.questionRequirement || "",
        attachement:obj?.attachement == 1 ? true: false,
        attachedFileName:obj?.attachedFileName || "",
        optionType:obj?.optionType == 1 ? true: false,
        weightage:obj?.weightage,
        mandatory: obj?.mandatory == 1 ? true: false,
        libraryId: obj?.libraryId || 0,
        libraryEntity: obj?.libraryEntity || "",
        vendorDetailId:  obj?.vendorDetailId,
        questionCategory: obj?.questionCategory || "",
        questioncategoryId: obj?.questioncategoryId || 0,
        questionSubcategoryId: obj?.questionSubcategoryId || 0,
        questionSubCategory: obj?.questionSubCategory || "",
          questionOption: obj?.questionOption && obj?.questionOption?.length > 0
          ? obj.questionOption.map(({ id, ...rest }) => ({ ...rest }))
          : [],
        vendorId: obj?.vendorId,
        version: obj?.version,
        score: obj?.score,
        answer: obj?.answer,
        attachement:obj?.attachement == 1 ? true: false,
        optionType:obj?.optionType == 1 ? true:false,
        isMultiOption: obj?.isMultiOption  == 1 ? true: false,
			  isMultipleChoice: obj?.isMultipleChoice == 1 ? true: false,
        weightage:obj?.weightage,
        ansAttachements:obj?.ansAttachements,
      }));


   


//SQ
export const SQEQuestionsModal = (Questionarray,selectedVendorId) => {

	return Questionarray.map((item) => (
		{
			id: 0,
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


 export const RFQQuestionsModalOBJ = (obj, idFromURL) => 
     {
        return {
          id: 0,
          rfqId: idFromURL,
          questionId:0,
          questionDescription: obj?.questiondescription || "",
          questionRequirement: obj?.questionRequirement || "",
          attachement: obj?.attachement || false,
          attachedFileName: obj?.attachedFileName || "",
          optionType: obj?.optionType || false,
          isMultiOption: obj?.isMultiOption || false,
          isMultipleChoice: obj?.isMultipleChoice =="M" ? true : false,
          weightage: obj?.weightage || 0,
          mandatory: obj?.mandatory || false,
          isActive: obj?.isActive || false,
          libraryId:  0,
          libraryEntity:"",
          questioncategoryId: obj?.questionCategory?.id || 0,
          questionCategory: obj?.questionCategory?.questioncategory || "",
          questionSubcategoryId: obj?.questionSubCategory?.id || 0,
          questionSubCategory: obj?.questionSubCategory?.questionsubcategory || "",
          questionOption: obj?.questionOption || []
        }
     }


 export const SQEQuestionsModalOBJ = (obj, idFromURL) => 
     {
        return {
		    	id: 0,
          VendorId: idFromURL,
          questionId:0,
          questionDescription: obj?.questiondescription || "",
          questionRequirement: obj?.questionRequirement || "",
          attachement: obj?.attachement || false,
          attachedFileName: obj?.attachedFileName || "",
          optionType: obj?.optionType || false,
          isMultiOption: obj?.isMultiOption || false,
          isMultipleChoice: obj?.isMultipleChoice || false,
          weightage: obj?.weightage || 0,
          mandatory: obj?.mandatory || false,
          isActive: obj?.isActive || false,
          libraryId:  0,
          libraryEntity:"",
          questioncategoryId: obj?.questionCategory?.id || 0,
          questionCategory: obj?.questionCategory?.questioncategory || "",
          questionSubcategoryId: obj?.questionSubCategory?.id || 0,
          questionSubCategory: obj?.questionSubCategory?.questionsubcategory || "",
          questionOption: obj?.questionOption || []
		}
     }

//NFA

export const NFAQuestionsModal = (selectedQuesionArray, idFromURL) => 
  
  selectedQuesionArray?.map((obj) => ({
    id: 0,
    nfaId: idFromURL,
    questionId: obj?.id || 0,
    questionDescription: obj?.questionDescription || "",
    questionRequirement: obj?.questionRequirement || "",
    attachement: obj?.attachement || false,
    attachedFileName: obj?.attachedFileName || "",
    optionType: obj?.optionType || false,
    isMultiOption: obj?.isMultiOption || false,
    isMultipleChoice: obj?.isMultipleChoice || false,
    weightage: obj?.weightage || 0,
    mandatory: obj?.mandatory || false,
    isActive: obj?.isActive || false,
    libraryId: obj?.libraryId || 0,
    libraryEntity: obj?.libraryEntity || "",
    questioncategoryId: obj?.questioncategoryId || 0,
    questionCategory: obj?.questionCategory || "",
    questionSubcategoryId: obj?.questionSubcategoryId || 0,
    questionSubCategory: obj?.questionSubCategory || "",
    questionOption: obj?.questionOption?.length > 0
      ? obj.questionOption.map(({ id, ...rest }) => ({ ...rest }))
      : [],
  }));

  export const NFAQuestionsModalOBJ = (obj, idFromURL) => 
    {
       return {
         id: 0,
         nfaId: idFromURL,
         questionId:0,
         questionDescription: obj?.questiondescription || "",
         questionRequirement: obj?.questionRequirement || "",
         attachement: obj?.attachement || false,
         attachedFileName: obj?.attachedFileName || "",
         optionType: obj?.optionType || false,
         isMultiOption: obj?.isMultiOption || false,
         isMultipleChoice: obj?.isMultipleChoice || false,
         weightage: obj?.weightage || 0,
         mandatory: obj?.mandatory || false,
         isActive: obj?.isActive || false,
         libraryId:  0,
         libraryEntity:"",
         questioncategoryId: obj?.questionCategory?.id || 0,
         questionCategory: obj?.questionCategory?.questioncategory || "",
         questionSubcategoryId: obj?.questionSubCategory?.id || 0,
         questionSubCategory: obj?.questionSubCategory?.questionsubcategory || "",
         questionOption: []
       }
    }


    
    
    
  