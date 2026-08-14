import React, { useEffect, useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { HiOutlineX } from 'react-icons/hi';
import { formatbidtime, getDateFormatPatteronLocale, userampm } from '../../../utils/common/utility';
import { ApiClient } from "../../../Apiclient";
import { useStateValue } from '../../../store';
import { useParams } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
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
        const currentTime = Date.now();

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
      toast.error('An error occurred while updating the status.');
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
      // Handle any error that occurs during the API call
      toast.error('An error occurred while pausing the slots.');
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
      // Handle any error that occurs during the API call
      toast.error('An error occurred while reopen the slots.');
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
      toast.error('An error occurred while removing the restrict remark.');
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
  //console.log("prebidValues:", prebidValues)
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

    console.log("hii there", prebidValues)
    if (prebidValues.length > 0) {
      setPreBidLoading(true);
      for (let prebid of prebidValues) {
        // const bidParameter = actions?.auctionManageData[0]?.bidParamater.find((param) => param.id === prebid.bidParameterId);
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
        const res = await apiClient.postres(
          `/api/AuctionParticipation/SubmitPreBid`,
          prebidValues,
          atoken
        );
        if (res) {
          toast.success(`PreBid added successfully.`, {
            toastId: "prebid_added"
          });
          callbackPaginationForVendors(actions?.pageNumber, 10);
        }
        else {
          toast.error("Error fetching response");
        }
      } catch (err) {
        console.error("Error submitting bid: ", err);
        toast.error("An error occurred while submitting the bid.");
      }
    } else {
      toast.error(`Enter atleast one prebid.`, {
        toastId: "prebid_added",
        autoClose: 2000,
      });
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
            <div className="bg-white rounded  p-2 pt-0 ">
              <div className="p-2">
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
      <Modal
        show={open}
        onHide={CloseLoadingModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header>
          <Modal.Title className='f14'>Bid will be paused from the selected slots .</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Typography>Do you want to pause the slots? If yes, click "OK". If no, click "Cancel".</Typography>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={CloseLoadingModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmPause}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={reOpenSlot}
        onHide={CloseReOpenLoadingModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header>
          <Modal.Title className='f14'>Do you want to reOpen the slots? If yes, then please select date/time and then click "OK". If no, click "Cancel".</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="col-12 col-md-6 pe-2">
              <MobileDateTimePicker
                variant="outlined"
                label="Bid Start Date *"
                size="small"
                name="bidStDate"
                id="bidStDate"
                minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
                //value={bidStDate ? new Date(bidStDate) : null} // Convert back to Date object
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={CloseReOpenLoadingModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmReOpen}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={openRemoveQuoteStagger}
        onHide={CloseRemoveQuoteModalStagger}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header>
          <Modal.Title className='f14'>Remove Quotes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Typography>Do you want to remove this quote? If yes, click "OK". If no, click "Cancel".</Typography>

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
            helperText={
              remarkError
                ? 'Remarks are required'
                : `${removeRemark.length}/200`
            }
            autoFocus
          />

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={CloseRemoveQuoteModalStagger}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!removeRemark.trim()) {
                setRemarkError(true);
                return;
              }
              handleRemoveQoutes(removeRemark);
            }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        size="lg"
        show={modal}
        backdrop="static"
        keyboard={false}
        centered
        className="rfq-create-modal"
        contentClassName="border-0 rounded-default"
        onHide={() => CloseModal()}
      >
        <Modal.Header className="pt-2 pb-2">
          <Modal.Title><span style={{ fontSize: 14 }}>Bidding Trend</span></Modal.Title>
          <button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={() => CloseModal()}>
            <HiOutlineX style={{ fontSize: 16 }} />
          </button>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3">
            <BidGraphs
              selectedParameterData={selectedParameterData}
              auctionManageData={actions?.auctionManageData}
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default StaggerAuction;
