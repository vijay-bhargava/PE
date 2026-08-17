import React from 'react';
import { HiPencilAlt } from 'react-icons/hi';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import BidGeneralPreview from './BidGeneralPreview';
import ProductitemCell from '../RequestForQuotation/ProductitemCell';
import SelectedSupplierCell from '../RequestForQuotation/SelectedSupplierCell';

const AuctionPreviewTab = ({
	formik,
	inputList,
	purchaseAllList,
	bidtype,
	stagearray,
	currentStage,
	handletabEdit,
	bidItemsList,
	handleEditItem,
	handleDeleteItem,
	tempDataForItemService,
	commercialLibFind,
	selectedSupplier,
}) => {
	const canEdit = stagearray.includes(currentStage);

	return (
		<div className="rfq-preview-scroll-area">

			{/* Bid General Details */}
			<div className="rfq-preview-section-card mb-3">
				<div className="rfq-preview-card-body">
					<div className="d-flex justify-content-between align-items-center mb-3" id="bidgeneraldetails">
						<div className="rfq-preview-section-title">
							<ArticleOutlinedIcon className="rfq-preview-section-icon" />
							Bid General Details
						</div>
						{canEdit && (
							<button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => handletabEdit(1)}>
								<HiPencilAlt />
							</button>
						)}
					</div>
					<BidGeneralPreview
						formik={formik}
						inputList={inputList}
						purchaseAllList={purchaseAllList}
						bidtype={bidtype}
						stagearray={stagearray}
						currentStage={currentStage}
						handletabEdit={handletabEdit}
					/>
				</div>
			</div>

			{/* Items Details */}
			<div className="rfq-preview-section-card mb-3">
				<div className="rfq-preview-card-body">
					<div className="d-flex justify-content-between align-items-center mb-3" id="auctionitemsdetails">
						<div className="rfq-preview-section-title">
							<ListAltOutlinedIcon className="rfq-preview-section-icon" />Items Details
						</div>
						{canEdit && (
							<button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => handletabEdit(2)}>
								<HiPencilAlt />
							</button>
						)}
					</div>
					<div style={{ height: 200 }}>
						<ProductitemCell
							action={false}
							itemsList={bidItemsList}
							handleEditItem={handleEditItem}
							handleDeleteItem={handleDeleteItem}
							tempDataForItemService={tempDataForItemService}
							eventType="Auction"
						/>
					</div>
				</div>
			</div>

			{/* Commercial Details (conditionally for non-forward/reverse/french types) */}
			{bidtype && ![1, 2, 5, 6].includes(bidtype.id) && (
				<div className="rfq-preview-section-card mb-3">
					<div className="rfq-preview-card-body">
						<div className="d-flex justify-content-between align-items-center mb-3" id="auctioncommercialdetails">
							<div className="rfq-preview-section-title">
								<ReceiptLongOutlinedIcon className="rfq-preview-section-icon" />BID Commercial Details
							</div>
							{canEdit && (
								<button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => handletabEdit(3)}>
									<HiPencilAlt />
								</button>
							)}
						</div>
						{commercialLibFind?.filter(s => s.isSelected)?.length > 0 ? (
							<div>
								<div className="d-flex mb-2">
									<div className="col-3 f14 fw500">Name</div>
									<div className="col-3 f14 fw500">UOM</div>
									<div className="col-3 f14 fw500">Fixed Value</div>
									<div className="col-3 f14 fw500">Formula Value</div>
								</div>
								{commercialLibFind.filter(x => x.isSelected).map((item, index) => (
									<div className={`d-flex border-bottom py-1 ${index % 2 === 0 ? 'even' : 'odd'}`} key={index}>
										<div className="col-3">
											<div>{item.name}</div>
											<div className="text-muted f10">{item.libraryEntity}</div>
										</div>
										<div className="col-3">{item.valuetype}</div>
										<div className="col-3">{item.commValue}</div>
										<div className="col-3">{item.formulavalue}</div>
									</div>
								))}
							</div>
						) : (
							<div>No commercial details selected.</div>
						)}
					</div>
				</div>
			)}

			{/* Invited Suppliers */}
			<div className="rfq-preview-section-card mb-3">
				<div className="rfq-preview-card-body">
					<div className="d-flex justify-content-between align-items-center mb-3" id="auctiionsuppliersdetails">
						<div className="rfq-preview-section-title">
							<GroupOutlinedIcon className="rfq-preview-section-icon" />Invited Suppliers
						</div>
						{canEdit && (
							<button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => handletabEdit(4)}>
								<HiPencilAlt />
							</button>
						)}
					</div>
					<SelectedSupplierCell selectedsupplier={selectedSupplier} />
				</div>
			</div>

		</div>
	);
};

export default AuctionPreviewTab;
