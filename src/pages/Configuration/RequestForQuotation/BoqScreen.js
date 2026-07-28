import React, { useState, useEffect, useMemo } from 'react';
import { Box, Tooltip, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { HiOutlineTrash, HiPlusSm } from 'react-icons/hi';
import { ApiClient, api } from "../../../Apiclient";
import { actionTypes, useStateValue } from "../../../store";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { buildQueryParams } from '../../../utils/common/utility';
import { getPayloadWithStage, RFQModalFromPR, fetchAttachmentsFromPRItems, handlesaveAttachment } from '../../../utils/common';

const BoqScreen = ({ idFromURL, eventType: passedEventType, CurrentVersion, readOnly = false, onUploadSuccess, stage, boqReq }) => {
	const [{ atoken, rtoken, customerid, customersuffix, userDetail, eventType }] = useStateValue();
	// Use passed eventType or fall back to Redux state
	const finalEventType = passedEventType || eventType;
	const apiClient = new ApiClient(customersuffix);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [rows, setRows] = useState([]);
	const [prData, setPrData] = useState(null); // Store PR data for RFQ creation
	const [selectedItems, setSelectedItems] = useState(new Set());
	const [selectAll, setSelectAll] = useState(false);
	const [creatingRFQ, setCreatingRFQ] = useState(false);

	// Transform flat rfqParameters array into hierarchical structure
	const transformToHierarchy = (items) => {
		console.log("transformToHierarchy called with items:", items);

		if (!items || items.length === 0) {
			console.log("No items to transform");
			return [];
		}

		// Create a map for quick lookup
		const itemMap = new Map();
		const rootItems = [];

		console.log("Processing", items.length, "items");

		// First pass: create all items with their properties
		items.forEach(item => {
			const level = item.hierarchyCode ? item.hierarchyCode.split('.').length : 1;
			const hasChildren = items.some(i => i.parentId === item.id);

			console.log(`Item ${item.id}: ${item.itemName}, hierarchyCode: ${item.hierarchyCode}, parentId: ${item.parentId}, hasChildren: ${hasChildren}`);

			itemMap.set(item.id, {
				id: item.id,
				level: level,
				description: item.itemName || '',
				itemCode: item.itemCode || '',
				itemDesc: item.itemDesc || '',
				quantity: item.quantity || 0,
				quantityUnit: item.uom || '',
				uom: item.uom || '',
				targetPrice: item.targetPrice || 0,
				remarks: item.remarks || '',
				plant: item.plant || '',
				boqSheetName: item.boqSheetName || '',
				hierarchyCode: item.hierarchyCode || '',
				parentId: item.parentId,
				lineTotal: (item.quantity || 0) * (item.targetPrice || 0),
				isGroup: hasChildren,
				expanded: true,
				children: [],
				// Store original data for reference
				originalData: item
			});
		});

		console.log("Item map size:", itemMap.size);

		// Second pass: build the hierarchy
		itemMap.forEach((item, id) => {
			if (item.parentId === null || item.parentId === undefined) {
				// Root level item
				console.log(`Adding root item: ${item.description} (id: ${id})`);
				rootItems.push(item);
			} else {
				// Child item - add to parent's children
				const parent = itemMap.get(item.parentId);
				if (parent) {
					console.log(`Adding ${item.description} as child of ${parent.description}`);
					parent.children.push(item);
				} else {
					// If parent not found, treat as root
					console.warn(`Parent not found for item ${item.description} (parentId: ${item.parentId}), treating as root`);
					rootItems.push(item);
				}
			}
		});

		console.log("Root items count:", rootItems.length);

		// Sort by hierarchyCode to maintain order
		const sortByHierarchy = (a, b) => {
			const aCode = a.hierarchyCode || '';
			const bCode = b.hierarchyCode || '';
			const aParts = aCode.split('.').map(Number);
			const bParts = bCode.split('.').map(Number);

			for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
				const aVal = aParts[i] || 0;
				const bVal = bParts[i] || 0;
				if (aVal !== bVal) return aVal - bVal;
			}
			return 0;
		};

		const sortRecursive = (items) => {
			items.sort(sortByHierarchy);
			items.forEach(item => {
				if (item.children && item.children.length > 0) {
					sortRecursive(item.children);
				}
			});
		};

		sortRecursive(rootItems);
		console.log("Returning hierarchical data:", rootItems);
		return rootItems;
	};

	// Fetch BOQ data from API - uses correct endpoint based on event type
	const fetchRFQData = async () => {
		if (!idFromURL) {
			console.warn("No idFromURL provided to fetch BOQ data");
			return;
		}

		try {
			setLoading(true);
			console.log(`Fetching ${finalEventType} BOQ data for ID:`, idFromURL);

			// Use correct API endpoint based on event type
			const endpoint = finalEventType === "RFQ"
				? `/api/RFQManage/FindById?Id=${idFromURL}`
				: `/api/PRManage/Find?Id=${idFromURL}`;

			const response = await apiClient.getres(endpoint, atoken);
			console.log("API Response:", response);

			if (response && response.status === 200) {
				const responseData = response.data;
				console.log(`${finalEventType} Data:`, responseData);

				// Handle different response structures
				let eventItem;
				if (Array.isArray(responseData)) {
					// If it's an array, get first item
					eventItem = responseData[0];
				} else if (responseData?.result && Array.isArray(responseData.result)) {
					// If wrapped in result property (Task<T> response), extract from result array
					eventItem = responseData.result[0];
				} else {
					// Direct object
					eventItem = responseData;
				}

				console.log(`${finalEventType} Item:`, eventItem);
				console.log("boqReq:", eventItem?.boqReq);

				// Store PR data for RFQ creation
				if (finalEventType === "PR") {
					setPrData(eventItem);
				}

				// Get BOQ items based on event type
				const boqItems = finalEventType === "RFQ"
					? eventItem?.rfqParameters
					: eventItem?.prItems;

				console.log("BOQ Items:", boqItems);
				console.log("BOQ Items length:", boqItems?.length);

				if (eventItem?.boqReq && boqItems && boqItems.length > 0) {
					// Transform and set the BOQ data
					console.log("Transforming data to hierarchy...");
					const hierarchicalData = transformToHierarchy(boqItems);
					console.log("Hierarchical data:", hierarchicalData);
					setRows(hierarchicalData);

					// Notify parent component to refresh items list
					if (onUploadSuccess) {
						onUploadSuccess();
					}
				} else if (!eventItem?.boqReq) {
					console.log("BOQ not required for this event");
					setRows([]);
				} else {
					console.log("No BOQ items found or empty array");
					setRows([]);
				}
			} else {
				console.error("Unexpected response status:", response?.status);
			}
		} catch (error) {
			console.error("Failed to fetch BOQ data:", error);
			toast.error("Failed to load BOQ data", { toastId: "boq-fetch-error" });
		} finally {
			setLoading(false);
		}
	};

	// Fetch data on component mount or when idFromURL changes
	useEffect(() => {
		if (idFromURL && atoken) {
			fetchRFQData();
		}
	}, [idFromURL, atoken]);

	const deleteRow = (id) => {
		const removeRecursive = (items) => {
			return items
				.filter(row => row.id !== id)
				.map(row => ({ ...row, children: row.children ? removeRecursive(row.children) : undefined }));
		};
		setRows(prevRows => removeRecursive(prevRows));
	};

	const formatCurrency = (val) =>
		val != null && val !== ''
			? `₹ ${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
			: '—';

	const flattenRows = (items) => {
		const result = [];
		for (const row of items) {
			result.push(row);
			if (row.isGroup && row.expanded && row.children) {
				result.push(...flattenRows(row.children));
			}
		}
		return result;
	};

	// Calculate subtotal dynamically from all non-group items
	const calculateSubtotal = () => {
		const flatItems = flattenRows(rows);
		return flatItems
			.filter(item => !item.isGroup)
			.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
	};

	const subtotal = calculateSubtotal();
	const flatRows = flattenRows(rows);

	const toggleExpand = (id) => {
		const toggle = (items) =>
			items.map((row) => {
				if (row.id === id) return { ...row, expanded: !row.expanded };
				if (row.children) return { ...row, children: toggle(row.children) };
				return row;
			});
		setRows(toggle(rows));
	};

	const addRow = () => {
		const newRow = {
			id: Date.now(),
			level: 1,
			description: '',  // Empty so user can enter immediately
			itemCode: '',
			itemDesc: '',
			quantity: 0,
			quantityUnit: '',
			uom: '',
			targetPrice: 0,
			remarks: '',
			plant: '',
			boqSheetName: '',
			hierarchyCode: '',
			parentId: null,
			lineTotal: 0,
			isGroup: false,
			expanded: true,
			children: [],
			isNewItem: true  // Flag to indicate this is a newly added item
		};
		setRows(prev => [...prev, newRow]);
	};

	const addGroup = () => {
		const newGroup = {
			id: Date.now(),
			level: 1,
			description: '',  // Empty so user can enter immediately
			itemCode: '',
			itemDesc: '',
			quantity: 0,
			quantityUnit: '',
			uom: '',
			targetPrice: 0,
			remarks: '',
			plant: '',
			boqSheetName: '',
			hierarchyCode: '',
			parentId: null,
			lineTotal: 0,
			isGroup: true,
			expanded: true,
			children: [],
			isNewItem: true  // Flag to indicate this is a newly added group
		};
		setRows(prev => [...prev, newGroup]);
	};

	// Handle editable quantity & UOM
	const handleFieldChange = (id, field, value) => {
		const updateRecursive = (items) =>
			items.map(row => {
				if (row.id === id) {
					const updatedRow = { ...row, [field]: value };
					// Recalculate lineTotal when quantity or targetPrice changes
					if (field === 'quantity' || field === 'targetPrice') {
						const qty = field === 'quantity' ? value : row.quantity;
						const price = field === 'targetPrice' ? value : row.targetPrice;
						updatedRow.lineTotal = (qty || 0) * (price || 0);
					}
					// Clear the "new item" flag when user enters a description
					if (field === 'description' && value.trim() !== '') {
						updatedRow.isNewItem = false;
					}
					return updatedRow;
				}
				if (row.children) return { ...row, children: updateRecursive(row.children) };
				return row;
			});
		setRows(updateRecursive(rows));
	};

	// Excel upload handler
	const handleExcelUpload = async (e) => {
		const file = e.target.files[0];

		if (!file) {
			toast.warning("Please select a file to upload");
			return;
		}

		if (!idFromURL) {
			toast.error("RFQ ID is missing. Please refresh and try again.");
			console.error("idFromURL is not available for upload");
			return;
		}

		const validExcelTypes = [
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel',
			'application/msexcel'
		];

		if (!validExcelTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
			toast.error("Please upload a valid Excel file (.xlsx or .xls)");
			return;
		}

		const maxFileSize = 10 * 1024 * 1024;
		if (file.size > maxFileSize) {
			toast.error("File size exceeds 10MB. Please upload a smaller file.");
			return;
		}

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("eventId", idFromURL);
			formData.append("eventType", finalEventType);
			formData.append("version", CurrentVersion);

			const response = await apiClient.postres(
				`/api/RFQManage/uploadBoqBuyer`,
				formData,
				atoken
			);

			if (response && response.status === 200) {
				const result = response.data;

				if (result?.error && result.error !== "") {
					toast.error(result.error, { toastId: "boq-upload-error" });
				} else {
					toast.success("BOQ uploaded successfully!", { toastId: "boq-upload-success" });

					if (e.target) {
						e.target.value = '';
					}

					await fetchRFQData();
				}
			} else {
				toast.error("Upload failed. Please try again.", { toastId: "boq-upload-error" });
				console.error("Unexpected response status:", response?.status);
			}

		} catch (error) {
			console.error("Upload failed:", error);

			if (error.response?.status === 400) {
				toast.error(error.response?.data?.Message || "Invalid file format or data", { toastId: "boq-upload-error" });
			} else if (error.response?.status === 401) {
				toast.error("Your session has expired. Please log in again.", { toastId: "boq-upload-error" });
			} else if (error.response?.status === 404) {
				toast.error("RFQ not found. Please refresh and try again.", { toastId: "boq-upload-error" });
			} else if (error.message === 'Network Error') {
				toast.error("Network error. Please check your connection.", { toastId: "boq-upload-error" });
			} else {
				toast.error("Upload failed. Please try again.", { toastId: "boq-upload-error" });
			}
		}
	};

	// Helper function to check if an item is linked to an event (should be disabled)
	const isItemDisabled = (item) => {
		const originalData = item.originalData || item;
		return !!(originalData.closeDate || originalData.eventId || originalData.eventType);
	};

	// Function to get all leaf node IDs (items with quantity and UOM)
	const getLeafNodeIds = () => {
		const leafNodes = [];

		const extractLeafNodes = (items) => {
			items.forEach(item => {
				// Leaf node: has quantity and UOM, not a group, and not disabled
				if (!item.isGroup && item.quantity && item.uom && !isItemDisabled(item)) {
					leafNodes.push(item.originalData?.id || item.id);
				}
				// Recursively check children
				if (item.children && item.children.length > 0) {
					extractLeafNodes(item.children);
				}
			});
		};

		extractLeafNodes(rows);
		return leafNodes;
	};

	// Function to get selected leaf node IDs
	const getSelectedLeafNodeIds = () => {
		const selectedLeafNodes = [];

		const extractSelectedLeafNodes = (items) => {
			items.forEach(item => {
				const itemId = item.originalData?.id || item.id;
				// Leaf node: has quantity and UOM, not a group, not disabled, and is selected
				if (!item.isGroup && item.quantity && item.uom && selectedItems.has(itemId) && !isItemDisabled(item)) {
					selectedLeafNodes.push(itemId);
				}
				// Recursively check children
				if (item.children && item.children.length > 0) {
					extractSelectedLeafNodes(item.children);
				}
			});
		};

		extractSelectedLeafNodes(rows);
		return selectedLeafNodes;
	};

	// Handle checkbox change for individual item
	const handleCheckboxChange = (itemId, item) => {
		// Prevent selecting disabled items
		if (isItemDisabled(item)) {
			return;
		}

		setSelectedItems(prev => {
			const newSet = new Set(prev);
			if (newSet.has(itemId)) {
				newSet.delete(itemId);
			} else {
				newSet.add(itemId);
			}
			return newSet;
		});
	};

	// Handle select all checkbox
	const handleSelectAll = () => {
		if (selectAll) {
			// Deselect all
			setSelectedItems(new Set());
			setSelectAll(false);
		} else {
			// Select all leaf nodes (excluding disabled items)
			const leafNodeIds = getLeafNodeIds(); // This now filters out disabled items
			setSelectedItems(new Set(leafNodeIds));
			setSelectAll(true);
		}
	};

	// API call to create RFQ from PR - following the same flow as ManagePR
	const handleCreateRFQ = async () => {
		const selectedLeafIds = getSelectedLeafNodeIds();

		if (selectedLeafIds.length === 0) {
			toast.warning("Please select at least one item to create RFQ");
			return;
		}

		if (!prData) {
			toast.error("PR data not loaded. Please refresh and try again.");
			return;
		}

		setCreatingRFQ(true);

		try {
			console.log("=== Starting RFQ Creation from BOQ ===");
			console.log("Selected PR Item IDs:", selectedLeafIds);
			console.log("PR Data:", prData);
			console.log("BOQ Flag from PR:", prData.isBoq || prData.boqReq);

			// Step 1: Build RFQ payload (same as ManagePR flow)
			const rfqPayload = {
				subject: prData.prSubject,
				description: prData.prDescription,
				requisitioner: prData.requisitioner,
				stage: "Draft",
				startDate: null,
				endDate: new Date(),
				baseCurrency: userDetail?.defaultCurrency || "INR",
				termandCondition: 'terms and condition',
				purchGrpId: prData.purchGrpId,
				purchOrgId: prData.purchOrgId,
				boqReq: prData.isBoq || prData.boqReq || true, // Maintain BOQ flag from PR
				Version: 1,
				createdById: userDetail?.id,
				createdByName: userDetail?.name,
				customerId: customerid,
				rfqParameters: [], // Empty - will be populated via pullPrItemsToRfq
				RFQVersionHistory: [{
					version: 1,
					bidOpeningDate: null,
					autoOpenEnabled: false
				}]
			};

			// Get stage information
			const statedata = {
				EventType: "RFQ",
				CustomerId: customerid,
				EventId: 0,
				OrgId: prData.purchOrgId,
				OrgGroupId: prData.purchGrpId,
			};

			console.log("Fetching event stages...");
			const queryParams = buildQueryParams(statedata);
			const stagelist = await apiClient.getres(`/api/EventStage/EventStageFind?${queryParams}`, atoken);

			const rfqPayloadWithStage = getPayloadWithStage(
				"currentStage",
				"Draft",
				stagelist?.data?.result,
				rfqPayload,
				"currentStage",
				prData.purchOrgId,
				prData.purchGrpId
			);

			// Step 2: Create the RFQ (same API as ManagePR)
			console.log("Creating RFQ via /api/RFQManage/Add...");
			const res = await apiClient.postres(`/api/RFQManage/Add`, rfqPayloadWithStage, atoken);

			if (!res) {
				toast.error("Failed to create RFQ - No response from server");
				setCreatingRFQ(false);
				return;
			}

			// Get rfqId from response (same as ManagePR: const id = res.data)
			const rfqId = res.data;
			console.log("✓ RFQ created successfully with ID:", rfqId);

			// Step 3: Pull selected PR BOQ items to the newly created RFQ
			console.log("Pulling PR items to RFQ via /api/RFQManage/pullPrItemsToRfq...");
			const pullItemsPayload = {
				rfqId: rfqId,
				version: 1,
				selectedPrItemIds: selectedLeafIds
			};

			const pullResult = await apiClient.post(
				`/api/RFQManage/pullPrItemsToRfq`,
				pullItemsPayload,
				atoken,
				rtoken
			);

			console.log("✓ Pull items API call completed. Result:", pullResult);
			console.log("✓ Items pulled successfully to RFQ");

			// Step 4: Handle attachments (optional, following ManagePR pattern)
			try {
				console.log("Handling attachments...");
				const flatItems = flattenRows(rows);
				const selectedPrItems = flatItems
					.filter(item => selectedLeafIds.includes(item.originalData?.id || item.id))
					.map(item => item.originalData || item);

				const prAttachments = await fetchAttachmentsFromPRItems(selectedPrItems, 'RFQ', atoken, customerid);
				if (prAttachments && prAttachments?.length > 0) {
					const attachmentsToSave = prAttachments?.map(att => ({
						...att,
						eventId: rfqId,
						createdById: userDetail?.id,
						createdByName: userDetail?.name
					}));
					await handlesaveAttachment(attachmentsToSave, rfqId, atoken);
					console.log(`✓ Saved ${attachmentsToSave.length} attachments from PR to RFQ`);
				}
			} catch (error) {
				console.error("Error saving PR attachments:", error);
				// Don't block RFQ creation if attachment save fails
			}

			// Step 5: Success - navigate to RFQ screen (same as ManagePR)
			console.log("✓ RFQ creation complete. Navigating to RFQ screen...");
			toast.success("RFQ Created successfully.");
			navigate(`/configuration/manage-rfq/${rfqId}`);

		} catch (error) {
			console.error("=== Error creating RFQ ===", error);
			console.error("Error details:", error.response || error.message);
			toast.error("Failed to create RFQ. Please try again.");
		} finally {
			setCreatingRFQ(false);
		}
	};

	const handleDownloadExcel = async () => {
		// Function to strip HTML tags
		const stripHtmlTags = (htmlString) => {
			if (!htmlString) return 'N/A';
			// Create a temporary div element to parse HTML
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = htmlString;
			// Get text content without HTML tags
			return tempDiv.textContent || tempDiv.innerText || 'N/A';
		};

		// Create a new Excel workbook
		const workbook = new ExcelJS.Workbook();

		// Define simple styles without colors
		const topHeaderStyle = {
			font: { bold: true, size: 12 },
			alignment: { horizontal: 'left', vertical: 'top' },
			border: { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } },
		};
		const HeaderStyle = {
			font: { bold: true, size: 12 },
			alignment: { horizontal: 'left', vertical: 'top' },
			fill: {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FFFFFF00' } // Yellow background
			},
			border: { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } },
		};
		// First sheet: Summary Sheet 
		const SummarySheet = workbook.addWorksheet('Summary');

		// Add header row with static fields and dynamic supplier columns (matching original structure)
		const headerRow = ['SrNo', 'Item', 'Sheet Name'];
		const titleRow = SummarySheet.addRow(headerRow);

		// Style all header rows
		titleRow.eachCell((cell) => {
			cell.style = topHeaderStyle;
		});

		// 🔥 FORCE SrNo column as TEXT
		SummarySheet.getColumn(1).numFmt = '@';

		// Second sheet: Summary Sheet 
		const DataSheet = workbook.addWorksheet('Sheet Name');

		// Add header row with static fields and dynamic supplier columns (matching original structure)
		const headerRowSecond = ['SrNo', 'ItemCode', 'ItemService', 'Description', 'Target Price', 'Remarks', 'Quantity', 'UOM', 'Delivery Location'];
		const titleRowSecond = DataSheet.addRow(headerRowSecond);

		// Style all header rows
		titleRowSecond.eachCell((cell) => {
			if (cell.value === 'ItemCode' || cell.value === 'Target Price' || cell.value === 'Remarks') {
				cell.style = HeaderStyle;
			}
			else {
				cell.style = topHeaderStyle;
			}
		});

		// 🔥 FORCE SrNo column as TEXT
		DataSheet.getColumn(1).numFmt = '@';

		// Generate Excel file and download
		const buffer = await workbook.xlsx.writeBuffer();
		const file = new Blob([buffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		});
		const fileName = `${finalEventType.toLowerCase()}-boq-template.xlsx`;
		saveAs(file, fileName);
	};

	const columns = useMemo(() => {
		const cols = [];

		if (finalEventType === "PR" && stage === "Open") {
			cols.push({
				id: 'select',
				header: () => (
					<input
						type="checkbox"
						checked={selectAll}
						onChange={handleSelectAll}
						disabled={readOnly}
						style={{ cursor: 'pointer' }}
					/>
				),
				size: 44,
				enableResizing: false,
				Cell: ({ row }) => {
					if (row.original.isGroup) return null;
					const itemId = row.original.originalData?.id || row.original.id;
					const isSelected = selectedItems.has(itemId);
					const isDisabled = isItemDisabled(row.original);
					return (
						<Tooltip title={isDisabled ? "Item already linked to an event" : ""} placement="top">
							<span>
								<input
									type="checkbox"
									checked={isSelected}
									onChange={() => handleCheckboxChange(itemId, row.original)}
									disabled={readOnly || isDisabled}
									style={isDisabled ? { cursor: 'not-allowed', opacity: 0.5 } : { cursor: 'pointer' }}
								/>
							</span>
						</Tooltip>
					);
				},
			});
		}

		cols.push(
			{
				accessorKey: 'description',
				header: 'Item Description',
				Cell: ({ row }) => (
					<Typography
						variant="body2"
						sx={{
							fontWeight: row.original.isGroup ? 600 : 400,
							color: 'text.primary',
							whiteSpace: 'normal',
							wordBreak: 'break-word',
						}}
					>
						{row.original.description}
					</Typography>
				),
			},
			{
				accessorKey: 'quantity',
				header: 'Quantity',
				size: 110,
				enableResizing: false,
				muiTableHeadCellProps: { align: 'center' },
				muiTableBodyCellProps: { align: 'center' },
				Cell: ({ row }) => row.original.isGroup ? null : (
					<Typography variant="body2">{row.original.quantity}</Typography>
				),
			},
			{
				accessorKey: 'uom',
				header: 'UOM',
				size: 90,
				enableResizing: false,
				muiTableHeadCellProps: { align: 'center' },
				muiTableBodyCellProps: { align: 'center' },
				Cell: ({ row }) => row.original.isGroup ? null : (
					<Typography variant="body2">{row.original.uom}</Typography>
				),
			}
		);

		return cols;
	}, [stage, selectAll, selectedItems, readOnly]);

	const table = useMaterialReactTable({
		columns,
		data: rows,
		getSubRows: (row) => row.children,
		enableExpanding: true,
		enableSorting: false,
		enableColumnActions: false,
		enableColumnFilters: false,
		enablePagination: false,
		enableBottomToolbar: false,
		enableTopToolbar: false,
		enableDensityToggle: false,
		enableFullScreenToggle: false,
		enableGlobalFilter: false,
		enableColumnResizing: false,
		initialState: { density: 'compact', expanded: true },
		displayColumnDefOptions: {
			'mrt-row-expand': {
				size: 44,
				muiTableHeadCellProps: { className: 'eq-category-expand-cell' },
				muiTableBodyCellProps: { className: 'eq-category-expand-cell' },
			},
		},
		muiTableBodyRowProps: ({ row }) => ({
			className: `eq-category-row eq-category-row--${row.original.isGroup ? 'category' : 'question'}`,
			hover: false,
		}),
		muiTablePaperProps: {
			className: 'eq-category-table-paper',
			elevation: 0,
		},
		muiTableContainerProps: {
			className: 'eq-category-table-container',
		},
		muiTableHeadCellProps: {
			className: 'eq-category-head-cell',
		},
		muiTableBodyCellProps: {
			className: 'eq-category-body-cell',
		},
		state: { isLoading: loading },
	});

	return (
		<div className="p-3 pt-0 ps-0" style={{ overflow: 'hidden' }}>
			{/* Toolbar */}
			<div className="rfq-items-toolbar" style={{ flexShrink: 0 }}>
				<div className="rfq-items-toolbar-right">
					{finalEventType === "PR" && stage === "Open" && !readOnly && (
						<LoadingButton
							variant="contained"
							size="small"
							onClick={handleCreateRFQ}
							loading={creatingRFQ}
							disabled={selectedItems.size === 0}
							className="pe-btn pe-btn--primary"
							style={{ textTransform: 'none', fontSize: 13 }}
						>
							Create RFQ
						</LoadingButton>
					)}
					{!readOnly && (
						<button type="button" className="pe-btn pe-btn--secondary" onClick={() => document.getElementById('boq-excel-upload').click()}>
							Upload Excel
						</button>
					)}
					<button type="button" className="pe-btn pe-btn--secondary" onClick={handleDownloadExcel}>
						Download Excel
					</button>
					<input
						id="boq-excel-upload"
						className="d-none"
						type="file"
						accept=".xlsx,.xls"
						onChange={handleExcelUpload}
					/>
				</div>
			</div>

			{/* MRT Table — matches Questions tab CategoryWiseTable pattern */}
			<Box sx={{ mt: 1 }}>
				<MaterialReactTable table={table} />
			</Box>
		</div>
	);
};

export default BoqScreen;