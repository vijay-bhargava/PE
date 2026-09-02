// Pure utility functions for Purchase Order business logic.
// No React imports, no hooks — all state-dependent functions take state as arguments.

export const isServiceLineItem = (item) =>
	String(item?.itemType ?? '').toLowerCase() === 'service';

export const getOrderedQty = (item) =>
	Number(item?.orderedQuantity ?? item?.quantity ?? 0);

export const normalizeMatchKeys = (values) =>
	values.filter(v => v !== null && v !== undefined && v !== '').map(v => String(v));

export const getPOItemMatchKeys = (source) => normalizeMatchKeys([
	source?.id,
	source?.poCreationDetailId,
	source?.poItemId,
	source?.itemId,
	source?.poCreationId,
	source?.itemNo,
	source?.lineItemNo,
	source?.itemCode,
	source?.materialCode,
]);

export const getDetailMatchKeys = (source) => normalizeMatchKeys([
	source?.creationDetailId,
	source?.poCreationDetailId,
	source?.poItemId,
	source?.itemId,
	source?.poCreationId,
	source?.itemNo,
	source?.lineItemNo,
	source?.itemCode,
	source?.materialCode,
]);

export const matchesPOItem = (detail, item) => {
	const detailKeys = getDetailMatchKeys(detail);
	const itemKeys = getPOItemMatchKeys(item);
	return detailKeys.some(key => itemKeys.includes(key));
};

export const matchesByCreationDetailId = (detail, item) =>
	detail?.creationDetailId != null &&
	item?.id != null &&
	String(detail.creationDetailId) === String(item.id);

export const getDetailPoLineId = (detail) =>
	detail?.creationDetailId ?? detail?.poCreationDetailId ?? detail?.poItemId ?? null;

export const matchesByPoLineId = (detail, item) =>
	item?.id != null &&
	getDetailPoLineId(detail) != null &&
	String(getDetailPoLineId(detail)) === String(item.id);

export const sumMatchingDetails = (records, item, detailKeys, qtyKeys) =>
	(records ?? []).reduce((total, record) => {
		const details = detailKeys.flatMap(key => Array.isArray(record?.[key]) ? record[key] : []);
		return total + details.reduce((detailTotal, detail) => {
			if (!matchesPOItem(detail, item)) return detailTotal;
			const qty = qtyKeys.reduce((value, key) => value ?? detail?.[key], null);
			return detailTotal + Number(qty ?? 0);
		}, 0);
	}, 0);

export const isRejectedInvoiceRecord = (invoice) => {
	const stage = String(invoice?.stage ?? '').toLowerCase().trim();
	const status = String(invoice?.status ?? '').toLowerCase().trim();
	return stage === 'rejected' || stage === 'reject' || status === 'rejected' || status === 'reject';
};

export const isRejectedInvoiceDetail = (detail) => {
	const stage = String(detail?.stage ?? '').toLowerCase().trim();
	const status = String(detail?.status ?? '').toLowerCase().trim();
	return stage === 'rejected' || stage === 'reject' || status === 'rejected' || status === 'reject';
};

export const getStageInfo = (currentStage, stageList) => {
	if (!stageList || stageList.length === 0) return null;
	const currentStageObj = stageList.find(stage => stage.stageName === currentStage);
	if (!currentStageObj) return null;
	const currentIndex = stageList.findIndex(item => item.stageName === currentStageObj.stageName);
	const nextStageObj = currentIndex !== -1 ? stageList[currentIndex + 1] : undefined;
	const prevStageObj = currentIndex > 0 ? stageList[currentIndex - 1] : undefined;
	return {
		prevStage: prevStageObj ? prevStageObj.stageName : null,
		prevStageId: prevStageObj ? prevStageObj.stageId : null,
		currentStage: currentStageObj.stageName,
		currentStageId: currentStageObj.stageId,
		nextStage: nextStageObj ? nextStageObj.stageName : null,
		nextStageId: nextStageObj ? nextStageObj.stageId : null,
	};
};

// --- State-dependent helpers (take state lists as arguments) ---

export const getAsnCompletedQty = (item, allPOShipHeader) => Math.max(
	sumMatchingDetails(allPOShipHeader, item, ['shipmentDetails'], ['shipQty', 'quantity']),
	Number(item?.receivedQty ?? item?.totalShipQty ?? item?.shippedQuantity ?? item?.asnQuantity ?? 0)
);

export const getGrnCompletedQty = (item, poGrnList) => {
	const matchedQty = (poGrnList ?? []).reduce((total, header) => {
		const details = ['grnItem', 'grnItems']
			.flatMap(key => Array.isArray(header?.[key]) ? header[key] : []);
		return total + details.reduce((detailTotal, detail) => {
			const isMatch = item?.id != null && getDetailPoLineId(detail) != null
				? matchesByPoLineId(detail, item)
				: matchesPOItem(detail, item);
			if (!isMatch) return detailTotal;
			const qty = ['acceptedQty', 'receivedQty', 'quantity']
				.reduce((value, key) => value ?? detail?.[key], null);
			return detailTotal + Number(qty ?? 0);
		}, 0);
	}, 0);
	const fallbackQty = Number(
		item?.receivedQty ?? item?.acceptedQty ?? item?.totalGrnQty ?? item?.grnQuantity ?? 0
	);
	if ((poGrnList ?? []).length === 0) return fallbackQty;
	return matchedQty > 0 ? matchedQty : fallbackQty;
};

export const getSesCompletedQty = (item, poSesList) => Math.max(
	sumMatchingDetails(poSesList, item, ['sesItem', 'sesItems'], ['serviceQty', 'acceptedQty', 'quantity']),
	Number(item?.totalSesQty ?? item?.serviceQty ?? item?.acceptedQty ?? 0)
);

export const getInvoiceCompletedQty = (item, poInvoiceList) => {
	const matchedQty = (poInvoiceList ?? []).reduce((total, invoice) => {
		if (isRejectedInvoiceRecord(invoice)) return total;
		const details = ['invoiceDetails', 'invoiceItem', 'invoiceItems']
			.flatMap(key => Array.isArray(invoice?.[key]) ? invoice[key] : []);
		return total + details.reduce((detailTotal, detail) => {
			const isMatch = item?.id != null && detail?.creationDetailId != null
				? matchesByCreationDetailId(detail, item)
				: matchesPOItem(detail, item);
			if (!isMatch) return detailTotal;
			if (isRejectedInvoiceDetail(detail)) return detailTotal;
			const qty = ['invoiceQuantity', 'quantity', 'invoicedQty']
				.reduce((value, key) => value ?? detail?.[key], null);
			return detailTotal + Number(qty ?? 0);
		}, 0);
	}, 0);
	const fallbackQty = Number(
		item?.invoicedQty ?? item?.invoicedQuantity ?? item?.totalInvoiceQty ?? item?.invoiceQuantity ?? 0
	);
	if ((poInvoiceList ?? []).length === 0) return fallbackQty;
	return matchedQty > 0 ? matchedQty : fallbackQty;
};

export const getCompletedQtyForAddMode = (mode, item, { allPOShipHeader, poGrnList, poSesList, poInvoiceList }) => {
	if (mode === 'ASN') return getAsnCompletedQty(item, allPOShipHeader);
	if (mode === 'GRN') return getGrnCompletedQty(item, poGrnList);
	if (mode === 'SES') return getSesCompletedQty(item, poSesList);
	if (mode === 'INVOICE') return getInvoiceCompletedQty(item, poInvoiceList);
	return 0;
};

export const getRemainingQtyForAddMode = (mode, item, state) =>
	Math.max(getOrderedQty(item) - getCompletedQtyForAddMode(mode, item, state), 0);

export const isItemEligibleForAddMode = (mode, item, state) => {
	if (!mode || !item) return true;
	if ((mode === 'ASN' || mode === 'GRN') && isServiceLineItem(item)) return false;
	if (mode === 'SES' && !isServiceLineItem(item)) return false;
	return getRemainingQtyForAddMode(mode, item, state) > 0;
};

export const getItemWithStageQuantity = (mode, item, state) => {
	const remainingQty = getRemainingQtyForAddMode(mode, item, state);
	if (mode === 'ASN') return { ...item, totalShipQty: getAsnCompletedQty(item, state.allPOShipHeader) };
	if (mode === 'GRN') return { ...item, totalShipQty: getGrnCompletedQty(item, state.poGrnList) };
	if (mode === 'SES') return { ...item, totalSesQty: getSesCompletedQty(item, state.poSesList) };
	if (mode === 'INVOICE') {
		const orderedQty = getOrderedQty(item);
		const invoicedQty = getInvoiceCompletedQty(item, state.poInvoiceList);
		return { ...item, quantity: remainingQty, orderedQuantity: orderedQty, invoicedQty };
	}
	return item;
};

export const getEligibleItemsForAddMode = (mode, sourceItems, state) =>
	(sourceItems ?? [])
		.filter(item => isItemEligibleForAddMode(mode, item, state))
		.map(item => getItemWithStageQuantity(mode, item, state));

export const hasRemainingItemsForAddMode = (mode, allPOItems, state) =>
	allPOItems.length === 0 || getEligibleItemsForAddMode(mode, allPOItems, state).length > 0;

export const isItemShipped = (item, allPOShipHeader) =>
	getAsnCompletedQty(item, allPOShipHeader) >= getOrderedQty(item);

export const isServiceRow = (row, allPOItems) =>
	row?.shipmentDetails?.some(shipItem => {
		const poItem = allPOItems?.find(po => po.itemNo === shipItem.itemNo);
		return poItem?.itemType?.toLowerCase() === 'service';
	});

export const isServiceItem = (item, allPOItems) => {
	if (!item) return false;
	if (item?.itemType) return item.itemType.toLowerCase() === 'service';
	if (!item.itemNo || !allPOItems || allPOItems.length === 0) return false;
	const poItem = allPOItems.find(po => po.itemNo === item.itemNo);
	return poItem?.itemType?.toLowerCase() === 'service';
};
