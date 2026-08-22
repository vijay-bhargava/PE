import React, { useEffect, useState } from 'react';
import { TextField, Typography } from '@mui/material';
import { formatbidtime, getDateFormatPatteronLocale, userampm } from '../../../utils/common/utility';
import { getApiErrorMessage } from '../../../utils/common';
import { ApiClient } from "../../../Apiclient";
import { useStateValue } from '../../../store';
import { useParams } from 'react-router-dom';
import PEModal from '../../../components/PEModal';
import { toast } from 'react-toastify';
import { buildQueryParams } from '../../../utils/purchaseRequest';
import BidGraphs from './BidGraphs';
import RenderTable from './RenderTable';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const StaggerAuction = ({ actions }) => {
  const [bidParamaterData, setBidParameterData] = useState([]);
  const [{ atoken, customerid, roleClaims, customersuffix, userDetail }, dispatch, thousands_separators] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const { pageSlug } = useParams();
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [uniqueGroupCount, setUniqueGroupCount] = useState(0);
  const [slotStatus, setSlotStatus] = useState(null);
  useEffect(() => {
    if (actions?.auctionManageData?.length > 0) {
      setBidParameterData(actions?.auctionManageData[0]?.bidParamater);
    }
  }, [actions?.auctionManageData]);

  useEffect(() => {
    if (actions?.pageNumber !== undefined) {
      setCurrentTableIndex(actions.pageNumber - 1);
    }
  }, [actions?.pageNumber]);

  //timer calculation before bid start here
  const [timeRemainingForGrp, setTimeRemainingForGrp] = useState("");
  const [showRemainingTime, setShowRemainingTime] = useState(false);

  useEffect(() => {
    let timer; // ✅ declare first so it's in scope

    const calculateTimeRemaining = () => {
      const currentGroupNo = actions?.pageNumber;
      const currentGroupItems = actions?.lineItemsPerPage?.filter(
        item => item.groupNo === currentGroupNo
      ) ?? [];

      if (currentGroupItems.length > 0) {
        const firstItem = currentGroupItems[0];
        const bidStartDate = new Date(firstItem.itemStDate + 'Z').getTime();
        const bidEndDate = new Date(firstItem.itemEndDate + 'Z').getTime();
        const currentTime = actions?.getCurrentServerTime?.() ?? Date.now();

        if (currentTime < bidStartDate) {
          setTimeRemainingForGrp("");
          setShowRemainingTime(false);
          setSlotStatus("Slot_Not_Started");
        } else if (currentTime > bidEndDate) {
          if (["Running"].includes(actions?.auctionManageData[0]?.stage) || actions?.bidStatus === "running") {
            handleStaggerStatus();
          }
          setTimeRemainingForGrp("00:00:00");
          clearInterval(timer); // ✅ timer is defined now
          setShowRemainingTime(false);

          if (currentGroupItems[0]?.itemStatus === 'Paused') {
            setSlotStatus("Slot_Paused");
          } else {
            setSlotStatus("Slot_Closed");
          }
        } else {
          const timeDiff = bidEndDate - currentTime;
          if (timeDiff > 0) {
            const formattedTime = formatbidtime(timeDiff);
            setTimeRemainingForGrp(formattedTime);
            setShowRemainingTime(true);
            setSlotStatus("");
          }
        }
      }
    };
    // ✅ Run immediately once after data change or reopen
    calculateTimeRemaining();
    // ✅ Then continue updating every second
    timer = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(timer);
  }, [actions?.lineItemsPerPage, actions?.pageNumber, actions?.reopenTrigger]);

  // Use the pagination function passed from parent component
  const callbackPagination = actions?.fetchVendorParameterDetailsLineItems;
  const callbackPaginationForVendors = actions?.fetchVendorParameterDetails;

  const handleNext = () => {
    //
    setCurrentTableIndex((prevIndex) => (prevIndex + 1) % actions?.totalCount);
    if (callbackPagination) {
      callbackPagination(actions?.pageNumber + 1, 10);
    }
  };

  const handlePrevious = () => {
    //
    setCurrentTableIndex((prevIndex) => (prevIndex - 1 + actions?.totalCount) % actions?.totalCount);
    if (callbackPagination) {
      callbackPagination(actions?.pageNumber - 1, 10);
    }
  };

  //api call for pause and resume
  const [open, setOpen] = useState(false);
  const [reOpenSlot, setReopenSlot] = useState(false);
  const [bidStDate, setBidStDate] = useState(null);
  const [error, setError] = useState(false);

  const handleDateChange = (newValue) => {
    if (newValue) {
      const isoString = newValue.toISOString(); // Convert to ISO string
      setBidStDate(isoString); // Set ISO string in state
    } else {
      setBidStDate(null);
      toast.error('Invalid date selected. Please choose a valid date.');
    }
  };

  const handleOpenModal = () => {
    setOpen(true)
  };

  const handleOpenModalForReopen = () => {
    setReopenSlot(true)
  };

  const CloseLoadingModal = () => {
    setOpen(false)
  };

  const CloseReOpenLoadingModal = () => {
    setReopenSlot(false)
    setBidStDate(null)
    setError(false)
  };

  const handleStaggerStatus = async () => {
    try {
      const res = await apiClient.postres(`/api/AuctionManage/UpdateStaggerStatus?bidId=${parseInt(pageSlug)}&Status=${actions?.auctionManageData[0]?.stage}`, null, atoken)
      if (res) {
        console.log('Successfully updated the slots status.');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleConfirmPause = async () => {

    try {
      const res = await apiClient.postres(`/api/AuctionParticipation/PauseUnPauseAuction?BidId=${parseInt(pageSlug)}&stage=${'Paused'}&GroupNo=${filteredItems[0]?.groupNo}`, null, atoken)
      if (res) {

        actions?.callbackOnpause(res)
        toast.success('Successfully paused the slots.');
        setOpen(false);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleConfirmReOpen = async () => {

    if (!bidStDate) {
      //toast.error('Please select a Bid Start Date before confirming.');
      setError(true)
      return;
    }

    // Check if bidenddate is in the past
    const bidEndDate = new Date(actions?.auctionManageData[0]?.bidEndDate);
    const currentDate = new Date();

    if (bidEndDate > currentDate) {
      toast.error('You cannot reopen the auction as the bid end date has not passed yet.', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
      return;
    }

    try {
      const res = await apiClient.postres(`/api/AuctionParticipation/PauseUnPauseAuction?BidId=${parseInt(pageSlug)}&stage=${'Open'}&ReOpenDtTime=${bidStDate}&GroupNo=${filteredItems[0]?.groupNo}`, null, atoken)
      if (res) {

        actions?.callbackOnpause(res)
        toast.success('Successfully reOpen the slots.');
        setBidStDate(null);
        setReopenSlot(false);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };


  //remove quotes in stagger
  const [openRemoveQuoteStagger, setOpenRemoveQuoteStagger] = useState(false);
  const [vendorQuotedPriceStagger, setVendorQuotedPriceStagger] = useState(0);
  const [vendorParamIdStagger, setVendorParamIdStagger] = useState(0);
  const [removeRemark, setRemoveRemark] = useState('');
  const [remarkError, setRemarkError] = useState(false);

  const handleOpenModalRemoveQuoteInStagger = (quotedPrice, id) => {
    setOpenRemoveQuoteStagger(true)
    setVendorQuotedPriceStagger(quotedPrice)
    setVendorParamIdStagger(id)
  };

  const handleRemoveRestrictRemarks = async (id) => {
    try {
      const res = await apiClient.postres(`/api/AuctionParticipation/RemoveQuotes?HeaderId=${id}&quotedPrice=0&Remarks='remove'`, null, atoken);
      if (res) {
        toast.success('Restrict remark removed successfully.');
        callbackPaginationForVendors(actions?.pageNumber, 10);
      }
    } catch (err) {
      console.error('Error removing restrict remark: ', err);
      toast.error(getApiErrorMessage(err));
    }
  };

  const CloseRemoveQuoteModalStagger = () => {
    setOpenRemoveQuoteStagger(false)
    setVendorQuotedPriceStagger(0)
    setVendorParamIdStagger(0)
    setRemoveRemark('');
  };

  const handleRemoveQoutes = async () => {
    try {
      const res = await apiClient.postres(`/api/AuctionParticipation/RemoveQuotes?HeaderId=${vendorParamIdStagger}&quotedPrice=${parseFloat(vendorQuotedPriceStagger)}&Remarks=${removeRemark}`, null, atoken)
      if (res) {
        toast.success('Successfully removed the quotes.');
        setOpenRemoveQuoteStagger(false);
        setRemoveRemark('');
      }
    } catch (err) {
      console.error("Error removing quotes: ", err);
    }
  };

  const getRankColor = (rankValue) => {
    if (rankValue === 'L1' || rankValue === 'H1') {
      return 'blue'; // L1 should be blue
    } else {
      return 'red';  // Any rank 2 and beyond should also be red
    }
  };
  //prebiduser for stagger
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [editingParameterId, setEditingParameterId] = useState(null);
  const [prebidloading, setPreBidLoading] = useState(false);
  const [prebidValues, setPrebidValues] = useState([]);
  const [duplicateQuoteModalOpen, setDuplicateQuoteModalOpen] = useState(false);
  const [duplicateQuoteGroups, setDuplicateQuoteGroups] = useState([]);

  const getDuplicateQuoteGroups = () => {
    if (actions?.auctionManageData?.[0]?.groupAuction) return [];

    const quotesByLineItem = new Map();
    actions?.allVendorParticipationDetails?.forEach(v => {
      if (v.bidParameterId === 0 || v.quotedPrice === null || v.quotedPrice === undefined || v.quotedPrice === '' || Number(v.quotedPrice) === 0) return;
      if (!quotesByLineItem.has(v.bidParameterId)) quotesByLineItem.set(v.bidParameterId, new Map());
      quotesByLineItem.get(v.bidParameterId).set(v.vendorId, Number(v.quotedPrice));
    });
    prebidValues.forEach(p => {
      if (p.bidParameterId === 0 || p.quotedPrice === '' || p.quotedPrice === null || p.quotedPrice === undefined || Number(p.quotedPrice) === 0) return;
      if (!quotesByLineItem.has(p.bidParameterId)) quotesByLineItem.set(p.bidParameterId, new Map());
      quotesByLineItem.get(p.bidParameterId).set(p.createdById, Number(p.quotedPrice));
    });

    const duplicates = [];
    quotesByLineItem.forEach((vendorMap, bidParameterId) => {
      const priceGroups = new Map();
      vendorMap.forEach((price, vendorId) => {
        if (!priceGroups.has(price)) priceGroups.set(price, []);
        priceGroups.get(price).push(vendorId);
      });
      priceGroups.forEach((vendorIds, price) => {
        if (vendorIds.length > 1) {
          const itemName = actions?.lineItemsPerPage?.find(li => li.bidParameterId === bidParameterId)?.itemName || `Line Item ${bidParameterId}`;
          const vendorNames = vendorIds.map(vId =>
            actions?.allVendorParticipationDetails?.find(v => v.vendorId === vId && v.bidParameterId === bidParameterId)?.companyName || `Vendor ${vId}`
          );
          duplicates.push({ itemName, price, vendorNames });
        }
      });
    });
    return duplicates;
  };

  const handleBlur = () => {
    setEditingVendorId(null);
    setEditingParameterId(null);
    setRestrictVendorId(null);
    setRestrictParameterId(null);
  };

  const handleEditPrice = (vendorId, bidParameterId) => {
    setEditingVendorId(vendorId);
    setEditingParameterId(bidParameterId);
  };

  const handlePriceChange = (e, sq) => {
    const newPrice = parseFloat(e.target.value);
    if (newPrice !== 0 && !isNaN(newPrice)) {
      // const bidParameter = actions?.auctionManageData[0]?.bidParamater?.find(param => param.id === sq.bidParameterId);
      const bidParameter = actions?.lineItemsPerPage?.find(param => param.bidParameterId === sq.bidParameterId);
      if ((actions?.auctionManageData[0]?.bidTypeID !== 1 && actions?.auctionManageData[0]?.bidTypeID !== 5) && bidParameter?.startPrice && Number(newPrice) > bidParameter.startPrice) {
        toast.error(`You cannot enter more than the start price (${bidParameter.startPrice}) for this bid.`);
        return;
      }

      setPrebidValues(prev => {
        const updatedPrices = [...prev];
        const existingVendor = updatedPrices.find(item => item.createdById === sq.vendorId && item.bidParameterId === sq.bidParameterId);
        if (existingVendor) {
          existingVendor.quotedPrice = newPrice;
        } else {
          updatedPrices.push({
            id: 0,
            createdById: sq.vendorId,
            bidParameterId: sq.bidParameterId,
            quotedPrice: newPrice ?? 0,
            customerId: parseInt(customerid),
            bidId: parseInt(pageSlug),
            isPrePrice: true,
            bidTypeID: actions?.auctionManageData[0]?.bidTypeID,
            bidSubTypeId: actions?.auctionManageData[0]?.bidSubTypeId
          });
        }
        return updatedPrices;
      });
    } else {
      setPrebidValues(prev =>
        prev.filter(item => !(item.createdById === sq.vendorId && item.bidParameterId === sq.bidParameterId))
      );
    }
  };

  //restrict vendor
  const [restrictVendorId, setRestrictVendorId] = useState(null);
  //console.log("restrictVendorId:", restrictVendorId)
  const [restrictParameterId, setRestrictParameterId] = useState(null);
  const handleCheckboxRestrict = (vendorId, bidParameterId) => {
    setRestrictVendorId(vendorId);
    setRestrictParameterId(bidParameterId);
  };

  const handleRestricttChange = (e, sq) => {
    const newQuote = e.target.value;
    if (newQuote !== '') {
      setPrebidValues(prev => {
        const updatedPrices = [...prev];
        const existingVendor = updatedPrices.find(item => item.createdById === sq.vendorId && item.bidParameterId === sq.bidParameterId);
        if (existingVendor) {
          existingVendor.restrictRemarks = newQuote;
        } else {
          updatedPrices.push({
            id: 0,
            createdById: sq.vendorId,
            bidParameterId: sq.bidParameterId,
            restrictRemarks: newQuote ?? '',
            customerId: parseInt(customerid),
            bidId: parseInt(pageSlug),
            isPrePrice: true,
            bidTypeID: actions?.auctionManageData[0]?.bidTypeID,
            bidSubTypeId: actions?.auctionManageData[0]?.bidSubTypeId
          });
        }
        return updatedPrices;
      });
    } else {
      setPrebidValues(prev =>
        prev.filter(item => !(item.createdById === sq.vendorId && item.bidParameterId === sq.bidParameterId))
      );
    }
  };

  const submitPrebid = async () => {
    if (prebidValues.length === 0) {
      toast.error(`Enter atleast one prebid.`, { toastId: "prebid_added", autoClose: 2000 });
      return;
    }
    setPreBidLoading(true);

    const duplicates = getDuplicateQuoteGroups();
    if (duplicates.length > 0) {
      setDuplicateQuoteGroups(duplicates);
      setDuplicateQuoteModalOpen(true);
      setPreBidLoading(false);
      return;
    }

    for (let prebid of prebidValues) {
      const bidParameter = actions?.lineItemsPerPage?.find((param) => param.bidParameterId === prebid.bidParameterId);
      if (bidParameter && (actions?.auctionManageData[0]?.bidTypeID === 1 || actions?.auctionManageData[0]?.bidTypeID === 5)) {
        const newPrice = prebid.quotedPrice;
        if (bidParameter.startPrice && Number(newPrice) < bidParameter.startPrice) {
          toast.error(`Amount should not be less than Start Price (${bidParameter.startPrice}) for this bid.`);
          setPreBidLoading(false);
          return;
        }
      }
    }
    try {
      const res = await apiClient.postres(`/api/AuctionParticipation/SubmitPreBid`, prebidValues, atoken);
      if (res) {
        toast.success(`PreBid added successfully.`, { toastId: "prebid_added" });
        callbackPaginationForVendors(actions?.pageNumber, 10);
      } else {
        toast.error("Error fetching response");
      }
    } catch (err) {
      console.error("Error submitting bid: ", err);
      toast.error(getApiErrorMessage(err));
    }
    setPreBidLoading(false);
  }

  //bidgraph
  const [modal, setModal] = useState(false);
  const [selectedParameterData, setSelectedParameterData] = useState([]);
  const OpenModal = (data, index) => {
    const selectedItem = data[index];
    setModal(true);
    getLineWiseGraphData(selectedItem)
  }

  const CloseModal = () => {
    setModal(false);
    getLineWiseGraphData([])
  };

  const getLineWiseGraphData = async (selectedItem) => {
    const obj = {
      // BidId: selectedItem?.bidId,
      BidId: pageSlug,
      ParameterId: selectedItem?.bidParameterId,
      BidTypeId: actions?.auctionManageData[0]?.bidTypeID
    };
    const queryParams = buildQueryParams(obj);
    const res = await apiClient.getres(
      `/api/AuctionParticipation/BIDQuotesTrendGraph?${queryParams}`,
      atoken
    );

    try {
      if (res?.data) {

        setSelectedParameterData(res?.data)
      }
    } catch (err) {
      console.error("Error submitting bid: ", err);
    }
  };

  // Filter the items based on the current group number
  const filteredItems = actions?.lineItemsPerPage.filter(item => item.groupNo === actions?.pageNumber);

  return (
    <>
      <div>
        <div className='row'>
          <div className='col-md-12'>
            <div className="bg-white rounded pt-0">
              <div>
                {<RenderTable
                  actions={actions}
                  actionsR={{
                    handlePrevious: handlePrevious,
                    currentTableIndex: currentTableIndex,
                    uniqueGroupCount: uniqueGroupCount,
                    showRemainingTime: showRemainingTime,
                    timeRemainingForGrp: timeRemainingForGrp,
                    slotStatus: slotStatus,
                    filteredItems: filteredItems,
                    handleOpenModal: handleOpenModal,
                    handleOpenModalForReopen: handleOpenModalForReopen,
                    handleNext: handleNext,
                    submitPrebid: submitPrebid,
                    OpenModal: OpenModal,
                    setCurrentTableIndex: setCurrentTableIndex,
                    handleCheckboxRestrict: handleCheckboxRestrict,
                    restrictVendorId: restrictVendorId,
                    restrictParameterId: restrictParameterId,
                    getRankColor: getRankColor,
                    handleOpenModalRemoveQuoteInStagger: handleOpenModalRemoveQuoteInStagger,
                    handleRemoveRestrictRemarks: handleRemoveRestrictRemarks,
                    prebidValues: prebidValues,
                    handleRestricttChange: handleRestricttChange,
                    handleBlur: handleBlur,
                    thousands_separators: thousands_separators,
                    editingVendorId: editingVendorId,
                    editingParameterId: editingParameterId,
                    handlePriceChange: handlePriceChange,
                    handleEditPrice: handleEditPrice,
                    callbackPagination,
                  }}
                />}
              </div>
            </div>
          </div>
        </div>
      </div>
      <PEModal
        open={open}
        onClose={CloseLoadingModal}
        disableBackdropClose={true}
        title={<span className='f14'>Pause Slots</span>}
        footer={
          <>
            <button className="pe-btn pe-btn--secondary" onClick={CloseLoadingModal}>Cancel</button>
            <button className="pe-btn pe-btn--primary" onClick={handleConfirmPause}>OK</button>
          </>
        }
      >
        <Typography>Do you want to pause the slots? If yes, click "OK". If no, click "Cancel".</Typography>
      </PEModal>
      <PEModal
        open={reOpenSlot}
        onClose={CloseReOpenLoadingModal}
        disableBackdropClose={true}
        title={<span className='f14'>Reopen Slots</span>}
        footer={
          <>
            <button className="pe-btn pe-btn--secondary" onClick={CloseReOpenLoadingModal}>Cancel</button>
            <button className="pe-btn pe-btn--primary" onClick={handleConfirmReOpen}>OK</button>
          </>
        }
      >
        <div>
          <Typography className="mb-3">Do you want to reOpen the slots? If yes, then please select date/time and then click "OK". If no, click "Cancel".</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="col-12 col-md-6 pe-2">
              <MobileDateTimePicker
                variant="outlined"
                label="Bid Start Date *"
                size="small"
                name="bidStDate"
                id="bidStDate"
                minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
                value={bidStDate ? dayjs(bidStDate) : null}
                onChange={handleDateChange}
                className="w-100 f14"
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    size: 'small',
                    InputLabelProps: { shrink: true },
                    error: error,
                    helperText: error ? 'Bid Start Date is required' : ''
                  }
                }}
                format={getDateFormatPatteronLocale(userDetail)}
                ampm={userampm(userDetail)}
              />
            </div>
          </LocalizationProvider>
        </div>
      </PEModal>
      <PEModal
        open={openRemoveQuoteStagger}
        onClose={CloseRemoveQuoteModalStagger}
        disableBackdropClose={true}
        title="Remove Quotes"
        footer={
          <>
            <button className="pe-btn pe-btn--secondary" onClick={CloseRemoveQuoteModalStagger}>Cancel</button>
            <button className="pe-btn pe-btn--primary" onClick={() => {
              if (!removeRemark.trim()) { setRemarkError(true); return; }
              handleRemoveQoutes(removeRemark);
            }}>OK</button>
          </>
        }
      >
        <div>
          <Typography className="mb-3">Do you want to remove this quote? If yes, click "OK". If no, click "Cancel".</Typography>
          <TextField
            label="Remarks"
            value={removeRemark}
            onChange={(e) => {
              if (e.target.value.length <= 200) {
                setRemoveRemark(e.target.value);
                if (e.target.value.trim()) {
                  setRemarkError(false);
                }
              }
            }}
            fullWidth
            multiline
            rows={3}
            required
            error={remarkError}
            helperText={remarkError ? 'Remarks are required' : `${removeRemark.length}/200`}
            autoFocus
          />
        </div>
      </PEModal>
      <PEModal
        open={duplicateQuoteModalOpen}
        onClose={() => setDuplicateQuoteModalOpen(false)}
        disableBackdropClose={true}
        title="Duplicate Quotes Found"
        footer={
          <button className="pe-btn pe-btn--primary px-4" onClick={() => setDuplicateQuoteModalOpen(false)}>OK</button>
        }
      >
        <div style={{ fontFamily: 'inherit' }}>
          <Typography className="mb-2" style={{ fontFamily: 'inherit' }}>
            Duplicate quotes are not allowed for the same line item. Please correct the following before submitting:
          </Typography>
          <ul className="mb-0 ps-3">
            {duplicateQuoteGroups.map((d, idx) => (
              <li key={idx} className="mb-1">
                <strong>{d.itemName}</strong>: {d.vendorNames.join(' & ')} have same value (<span className="fw-bold" style={{ color: 'var(--vz-primary-color)' }}>{d.price}</span>).
              </li>
            ))}
          </ul>
        </div>
      </PEModal>
      <PEModal
        size="lg"
        open={modal}
        onClose={() => CloseModal()}
        disableBackdropClose={true}
        title={<span style={{ fontSize: 14 }}>Bidding Trend</span>}
      >
        <div className="p-1">
          <BidGraphs
            selectedParameterData={selectedParameterData}
            auctionManageData={actions?.auctionManageData}
          />
        </div>
      </PEModal>
    </>
  );
}

export default StaggerAuction;
