import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IconButton, Tooltip, TextField, MenuItem } from '@mui/material';
import { PEPagination } from '../../../components/RFQ/PEPagination';
import PEModal from '../../../components/PEModal';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { HiOutlineTrash, HiPlusSm, HiChevronDown, HiChevronRight, HiPencilAlt } from 'react-icons/hi';
import { ApiClient } from "../../../Apiclient";
import { useStateValue } from "../../../store";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { buildQueryParams } from '../../../utils/common/utility';
import { getPayloadWithStage, fetchAttachmentsFromPRItems, handlesaveAttachment, getApiErrorMessage } from '../../../utils/common';
import { UOMMasterList } from '../../../utils/commerciallibrary';
import CommonTooltip from '../../../components/commonTooltip';

const BoqScreen = ({ idFromURL, eventType: passedEventType, CurrentVersion, readOnly = false, onUploadSuccess, stage, boqReq }) => {
	const [{ atoken, rtoken, customerid, roleClaims, customersuffix,
		userDetail, eventType, eventId, eventCode }, dispatch] = useStateValue();
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
	const [loadingNodes, setLoadingNodes] = useState(new Set()); // Track which nodes are loading children
	const [navigatorSearch, setNavigatorSearch] = useState('');
	const [selectedNodeId, setSelectedNodeId] = useState(null);
	const [rightPanelRows, setRightPanelRows] = useState([]);
	const [navigatorExpanded, setNavigatorExpanded] = useState(true);
	const [rightPanelLoading, setRightPanelLoading] = useState(false);
	const [addingRow, setAddingRow] = useState(false);
	const [selectedRightRowId, setSelectedRightRowId] = useState(null);
	const [editingRowId, setEditingRowId] = useState(null);
	const [editFormData, setEditFormData] = useState({});
	const [savingRowId, setSavingRowId] = useState(null);
	const [newlyAddedRowId, setNewlyAddedRowId] = useState(null);
	const [UOMMaster, setUOMMaster] = useState([]);
	const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
	const [deletingAll, setDeletingAll] = useState(false);
	const [rightPagination, setRightPagination] = useState({
		pageNumber: 1,
		pageSize: 10,
		totalCount: 0,
		totalPages: 0,
	});

	// Track if initial data has been fetched to prevent duplicate API calls
	const hasFetchedInitialData = useRef(false);
	const fetchingBoqRef = useRef(false);

	const updateNodeById = (items, nodeId, updater) =>
		items.map((row) => {
			if (row.id === nodeId) {
				return updater(row);
			}
			if (row.children && row.children.length > 0) {
				return { ...row, children: updateNodeById(row.children, nodeId, updater) };
			}
			return row;
		});

	const findNodeById = (items, nodeId) => {
		for (const row of items) {
			if (row.id === nodeId) return row;
			if (row.children && row.children.length > 0) {
				const inChildren = findNodeById(row.children, nodeId);
				if (inChildren) return inChildren;
			}
		}
		return null;
	};

	const filterTree = (items, term) => {
		if (!term) return items;
		const lowerTerm = term.trim().toLowerCase();
		return items
			.map((row) => {
				const children = row.children && row.children.length > 0 ? filterTree(row.children, term) : [];
				const text = `${row.description || ''} ${row.itemCode || ''}`.toLowerCase();
				const match = text.includes(lowerTerm);
				if (match || children.length > 0) {
					return { ...row, children };
				}
				return null;
			})
			.filter(Boolean);
	};

	// Keep top-level entries (disciplines, and every item directly under a
	// discipline — e.g. "1 HT Installation", "2 HT Panels") always visible in
	// the left navigator. Also keep orphan hierarchy siblings (e.g. "2 FAS
	// Software", "3 Workstation") that are nested under a section header via
	// hierarchyCode even when parentId is null. Only deeper API-fetched
	// sub-items (1.1, 1.2, …) are filtered out of the navigator since those
	// appear in the right-hand panel instead.
	const filterParentTree = (items, term, depth = 0) => {
		const lowerTerm = term.trim().toLowerCase();

		return items
			.map((row) => {
				const children = row.children && row.children.length > 0 ? filterParentTree(row.children, term, depth + 1) : [];
				const isParent = (row.children && row.children.length > 0) || row.hasChildren || row.isGroup;
				const alwaysKeep = depth <= 1 || row.isOrphanHierarchySibling;

				if (!alwaysKeep && !isParent) {
					return null;
				}

				if (!term) {
					return { ...row, children };
				}

				const text = `${row.description || ''} ${row.itemCode || ''}`.toLowerCase();
				const match = text.includes(lowerTerm);

				if (match || children.length > 0) {
					return { ...row, children };
				}

				return null;
			})
			.filter(Boolean);
	};

	const collectLeafRows = (node) => {
		if (!node) return [];
		if (!node.isGroup) return [node];

		const leaves = [];
		const walk = (items) => {
			items.forEach((item) => {
				if (item.isGroup) {
					walk(item.children || []);
				} else {
					leaves.push(item);
				}
			});
		};
		walk(node.children || []);
		return leaves;
	};

	const getNavigatorBadgeColor = (isDiscipline = false) =>
		isDiscipline ? '#5b3fa0' : '#1976d2';

	const getLevelBadgeColor = (level, isDiscipline = false) => {
		if (isDiscipline) return '#5b3fa0';
		if (level <= 1) return '#2f6fd6';
		if (level === 2) return '#1976d2';
		return '#f0a130';
	};

	const getLeafRowsFromChildren = (children = []) => {
		const leafRows = [];

		const walk = (items) => {
			items.forEach((item) => {
				if (item.isGroup) {
					if (item.children && item.children.length > 0) {
						walk(item.children);
					}
				} else {
					leafRows.push(item);
				}
			});
		};

		walk(children);
		return leafRows;
	};

	const fetchRightPanelRows = async (parentNode, pageNumber = 1, pageSize = 10) => {
		if (!parentNode?.id) {
			setRightPanelRows([]);
			setRightPagination({ pageNumber: 1, pageSize, totalCount: 0, totalPages: 0 });
			return;
		}

		// Synthetic discipline (sheet) group nodes are built entirely on the
		// client from data we already have — there is no backend id to query
		// for them. Walk the whole subtree (fetching any nested group whose
		// children haven't loaded yet) so every leaf under the discipline
		// (e.g. FAS: 1.1, 2, 3) shows up together, not just its direct
		// children.
		if (parentNode.isDiscipline) {
			const loadedLeaves = getLoadedLeaves(parentNode);
			if (loadedLeaves.length > 0) {
				applyRightPanelLeaves(loadedLeaves, pageNumber, pageSize);
				return;
			}

			const firstRealParent = (parentNode.children || []).find(
				(child) => !isSyntheticNodeId(child.id) && (child.isGroup || child.hasChildren)
			);
			if (firstRealParent) {
				const { updatedRows, leafRows } = await loadFirstLeafBranch(firstRealParent, rows);
				setRows(updatedRows);
				applyRightPanelLeaves(leafRows, pageNumber, pageSize);
				return;
			}

			applyRightPanelLeaves([], pageNumber, pageSize);
			return;
		}

		if (!idFromURL) {
			setRightPanelRows([]);
			setRightPagination({ pageNumber: 1, pageSize, totalCount: 0, totalPages: 0 });
			return;
		}

		if (!parentNode.isGroup && !parentNode.hasChildren) {
			applyRightPanelLeaves([parentNode], pageNumber, pageSize);
			return;
		}

		if (parentNode.childrenLoaded || isSyntheticNodeId(parentNode.id)) {
			applyRightPanelLeaves(getLoadedLeaves(parentNode), pageNumber, pageSize);
			return;
		}

		try {
			setRightPanelLoading(true);

			// Fetch every page of this parent's children instead of trusting a
			// single request — previously only page 1 was ever requested, so
			// any parent with more rows than `pageSize` silently lost the rest
			// (the "only 5 records" bug). We fetch the full set once and then
			// slice it client-side so the existing pagination UI keeps working.
			const childItems = await fetchAllBoqItems((pageNum, size) =>
				finalEventType === "PR"
					? `/api/PRItemService/GetBoqItems?prId=${idFromURL}&parentId=${parentNode.id}&pageNumber=${pageNum}&pageSize=${size}`
					: `/api/RFQManage/GetBoqItems?rfqId=${idFromURL}&version=${CurrentVersion || 1}&parentId=${parentNode.id}&pageNumber=${pageNum}&pageSize=${size}`
				, 50);

			const mappedChildren = childItems.map(item => {
				// A row is a group/parent only when it has NO line-item data of
				// its own (no quantity AND no UOM) — that's what a true section
				// header looks like. Previously this used OR, so a real leaf
				// line item with quantity = 0 but a valid UOM (e.g. a lump-sum
				// "Lot"/"Job" item) was wrongly treated as a parent. It must be
				// BOTH blank to count as a header/group.
				const hasChildren = (!item.quantity && !item.uom) || !!item.isGroup;
				const level = (parentNode?.level || 0) + 1;

				return {
					id: item.id,
					level: level,
					description: item.itemName || item.description || item.itemDesc || '',
					itemCode: item.itemCode || '',
					itemDesc: item.itemDesc || '',
					quantity: item.quantity || 0,
					quantityUnit: item.uom || item.quantityUnit || '',
					uom: item.uom || item.quantityUnit || '',
					targetPrice: item.targetPrice || 0,
					remarks: item.remarks || '',
					plant: item.plant || '',
					boqSheetName: item.boqSheetName || '',
					hierarchyCode: item.hierarchyCode || '',
					parentId: item.parentId,
					lineTotal: (item.quantity || 0) * (item.targetPrice || 0),
					isGroup: hasChildren,
					expanded: false,
					children: [],
					childrenLoaded: false,
					hasChildren: hasChildren,
					originalData: item
				};
			});

			const leafRows = mappedChildren
				.filter((item) => !item.isGroup)
				.sort((a, b) => compareHierarchyCode(a.hierarchyCode, b.hierarchyCode));
			const totalCount = leafRows.length;
			const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
			const start = (pageNumber - 1) * pageSize;
			const pageRows = leafRows.slice(start, start + pageSize);

			setRightPanelRows(pageRows);
			setRightPagination({
				pageNumber,
				pageSize,
				totalCount,
				totalPages,
			});
		} catch (error) {
			toast.error(`Failed to load ${finalEventType} items`, { toastId: 'boq-right-panel-fetch-error' });
			setRightPanelRows([]);
			setRightPagination({ pageNumber, pageSize, totalCount: 0, totalPages: 0 });
		} finally {
			setRightPanelLoading(false);
		}
	};

	// Resolve first descendant branch (within the same parent tree) that has leaf rows.
	const loadFirstLeafBranch = async (startNode, seedRows, maxFetches = 1) => {
		let workingRows = seedRows;
		let currentNode = startNode;
		let fetches = 0;

		while (currentNode) {
			// Synthetic discipline nodes (and any node whose children are already
			// loaded) don't need another round-trip to the API — reuse what we
			// already have instead of re-fetching (and instead of trying to fetch
			// a synthetic id that doesn't exist on the backend at all).
			const alreadyLoaded = currentNode.childrenLoaded && currentNode.children && currentNode.children.length > 0;
			let children;
			if (alreadyLoaded || isSyntheticNodeId(currentNode.id) || fetches >= maxFetches) {
				children = currentNode.children || [];
			} else {
				children = await resolveNodeChildren(currentNode);
				fetches += 1;
			}

			workingRows = updateNodeById(workingRows, currentNode.id, (row) => ({
				...row,
				expanded: true,
				children,
				childrenLoaded: true,
			}));

			const leafRows = getLeafRowsFromChildren(children);
			if (leafRows.length > 0) {
				return { updatedRows: workingRows, resolvedNode: currentNode, leafRows };
			}

			const nextParent = children.find((child) => child.isGroup || child.hasChildren || (child.children && child.children.length > 0));
			currentNode = nextParent || null;
		}

		return { updatedRows: workingRows, resolvedNode: startNode, leafRows: [] };
	};

	// Recursively resolve every leaf row under a node, fetching any child
	// group that hasn't been loaded yet. Selecting a single node like
	// "FIRE ALARM SYSTEM" only shows its own direct children (1.1), so a
	// sibling leaf item further down the discipline (e.g. FAS's "2 FAS
	// Software" / "3 Workstation", which sit next to "1 FIRE ALARM SYSTEM"
	// rather than under it) never appeared anywhere. Selecting the
	// discipline itself now walks the whole subtree so every leaf under it
	// (1.1, 2, 3, ...) is fetched and shown together.
	const collectAllLeavesRecursive = async (node, seedRows) => {
		let workingRows = seedRows;
		const leaves = [];

		const walk = async (current) => {
			const isExpandable = current.isGroup || current.hasChildren;
			let children = current.children || [];

			if (isExpandable && !current.childrenLoaded) {
				children = await resolveNodeChildren(current);
				workingRows = updateNodeById(workingRows, current.id, (row) => ({
					...row,
					children,
					childrenLoaded: true,
				}));
			}

			for (const child of children) {
				if (child.isGroup || child.hasChildren) {
					await walk(child);
				} else {
					leaves.push(child);
				}
			}
		};

		await walk(node);
		return { updatedRows: workingRows, leaves };
	};

	// Group root-level BOQ items by the Excel sheet/discipline they came from
	// (e.g. "Elect", "FAS") so the navigator shows the real hierarchy:
	//   Discipline -> Item (1, 2, ...) -> Sub-item (1.1, 2.1, ...)
	// Previously every sheet's root rows were dumped into one flat list, so
	// "HT INSTALLATION" (Elect, item 1) and "FIRE ALARM SYSTEM" (FAS, item 1)
	// showed up as unrelated siblings with duplicate badge numbers instead of
	// being grouped under their own discipline.
	// The API does not guarantee rows arrive sorted by hierarchyCode (real
	// responses interleave disciplines, e.g. Elect/FAS/FAS/Elect/FAS) — sort
	// numerically ("2" before "10", "1.2" before "1.10") so display order
	// always matches the Excel numbering regardless of API row order.
	const compareHierarchyCode = (a, b) => {
		const partsA = String(a || '').split('.').map(Number);
		const partsB = String(b || '').split('.').map(Number);
		const len = Math.max(partsA.length, partsB.length);
		for (let i = 0; i < len; i++) {
			const diff = (partsA[i] || 0) - (partsB[i] || 0);
			if (diff !== 0) return diff;
		}
		return 0;
	};

	const getTopLevelHierarchyNumber = (code) => {
		const str = String(code || '').trim();
		if (!str || str.includes('.')) return null;
		const num = parseInt(str, 10);
		return Number.isNaN(num) ? null : num;
	};

	// Root items with parentId === null but hierarchyCode 2, 3, … and their own
	// quantity/UOM are line items that belong under the sheet's hierarchyCode "1"
	// section header — not as siblings of it (unlike section headers such as
	// "2 HT PANELS" which have no quantity/UOM and stay at discipline level).
	const isOrphanHierarchyLeaf = (row) => {
		if (row.parentId != null) return false;
		const topLevel = getTopLevelHierarchyNumber(row.hierarchyCode);
		if (topLevel == null || topLevel <= 1) return false;
		return !!(row.quantity || row.uom);
	};

	const mergeChildNodes = (existingChildren = [], fetchedChildren = []) => {
		const orphans = existingChildren.filter((child) => child.isOrphanHierarchySibling);
		const fetchedIds = new Set(fetchedChildren.map((child) => child.id));
		const preservedOrphans = orphans.filter((child) => !fetchedIds.has(child.id));

		return [...preservedOrphans, ...fetchedChildren].slice().sort((a, b) =>
			compareHierarchyCode(a.hierarchyCode, b.hierarchyCode)
		);
	};

	const nestOrphanHierarchyItems = (siblingRows) => {
		const primaryRoot = siblingRows.find(
			(row) => getTopLevelHierarchyNumber(row.hierarchyCode) === 1
		);
		const orphanLeaves = siblingRows.filter(isOrphanHierarchyLeaf);
		const remainingRows = siblingRows.filter(
			(row) => row !== primaryRoot && !orphanLeaves.includes(row)
		);

		if (!primaryRoot || orphanLeaves.length === 0) {
			return siblingRows;
		}

		const orphanChildren = orphanLeaves
			.map((row) => ({
				...row,
				isOrphanHierarchySibling: true,
				level: (primaryRoot.level || 1) + 1,
			}))
			.sort((a, b) => compareHierarchyCode(a.hierarchyCode, b.hierarchyCode));

		const nestedPrimaryRoot = {
			...primaryRoot,
			children: mergeChildNodes(primaryRoot.children || [], orphanChildren),
			hasChildren: true,
			isGroup: primaryRoot.isGroup || orphanChildren.length > 0,
			expanded: orphanChildren.length > 0,
			childrenLoaded: false,
		};

		return [nestedPrimaryRoot, ...remainingRows].sort((a, b) =>
			compareHierarchyCode(a.hierarchyCode, b.hierarchyCode)
		);
	};

	const bumpNodeLevels = (row, level) => {
		const updated = { ...row, level };
		if (updated.children && updated.children.length > 0) {
			updated.children = updated.children.map((child) => bumpNodeLevels(child, level + 1));
		}
		return updated;
	};

	const isSyntheticNodeId = (id) =>
		id == null || id === '' || (typeof id === 'string' && String(id).startsWith('discipline-'));

	const getLoadedLeaves = (node) => {
		if (!node) return [];
		if (!node.isGroup && !node.hasChildren) return [node];
		return getLeafRowsFromChildren(node.children || []);
	};

	const applyRightPanelLeaves = (leafRows, pageNumber = 1, pageSize = 10) => {
		const sortedLeaves = (leafRows || [])
			.slice()
			.sort((a, b) => compareHierarchyCode(a.hierarchyCode, b.hierarchyCode));
		const totalCount = sortedLeaves.length;
		const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
		const start = (pageNumber - 1) * pageSize;
		setRightPanelRows(sortedLeaves.slice(start, start + pageSize));
		setRightPagination({ pageNumber, pageSize, totalCount, totalPages });
	};

	const resolveNodeChildren = async (node) => {
		const preloadedChildren = node.children || [];
		const orphanChildren = preloadedChildren.filter((child) => child.isOrphanHierarchySibling);

		if (node.childrenLoaded) {
			return preloadedChildren;
		}

		if (!node.isGroup && !node.hasChildren) {
			return preloadedChildren;
		}

		// Discipline wrappers are client-only — calling GetBoqItems with their
		// synthetic id 404s and was the extra red request after upload.
		if (isSyntheticNodeId(node.id)) {
			return preloadedChildren;
		}

		const fetchedChildren = await fetchChildItems(node.id, node);
		return mergeChildNodes(orphanChildren, fetchedChildren);
	};

	const groupRootItemsByDiscipline = (mappedRootRows) => {
		const groups = new Map();
		const order = [];

		mappedRootRows.forEach((row) => {
			const disciplineName = row.boqSheetName || row.plant || 'General';
			if (!groups.has(disciplineName)) {
				groups.set(disciplineName, []);
				order.push(disciplineName);
			}
			groups.get(disciplineName).push(row);
		});

		// Single-discipline BOQs (or BOQs with no sheet info at all) don't need
		// an extra wrapper level — keep the flat list so behavior for simple
		// BOQs is unchanged.
		if (order.length <= 1) {
			return nestOrphanHierarchyItems(
				mappedRootRows.slice().sort((a, b) => compareHierarchyCode(a.hierarchyCode, b.hierarchyCode))
			);
		}

		return order.map((disciplineName, index) => {
			const disciplineLevel = 1;
			const children = nestOrphanHierarchyItems(
				groups.get(disciplineName)
					.slice()
					.sort((a, b) => compareHierarchyCode(a.hierarchyCode, b.hierarchyCode))
			).map((row) => bumpNodeLevels(row, disciplineLevel + 1));

			return {
				id: `discipline-${disciplineName}`,
				level: disciplineLevel,
				description: disciplineName,
				hierarchyCode: disciplineName,
				isGroup: true,
				isDiscipline: true,
				hasChildren: true,
				expanded: index === 0,
				childrenLoaded: true,
				children,
			};
		});
	};

	// Fetch every page of root-level BOQ items instead of trusting a single
	// request. The API paginates results (pageMetadata.totalPages), and the
	// previous code only ever asked for page 1 — any BOQ with more root items
	// than fit on one page silently lost the rest (the "only 5 records"
	// symptom reported for larger BOQs).
	const fetchAllBoqItems = async (endpointBuilder, pageSize = 50) => {
		let allItems = [];
		let currentPage = 1;
		let totalPages = 1;

		do {
			const response = await apiClient.getres(endpointBuilder(currentPage, pageSize), atoken);

			if (!(response && response.status === 200)) {
				break;
			}

			const responseData = response.data || {};
			const pageItems = responseData?.result || (Array.isArray(responseData) ? responseData : []);
			const pageMetadata = responseData?.pageMetadata || {};

			allItems = allItems.concat(pageItems);
			totalPages = pageMetadata?.totalPages || 1;
			currentPage += 1;
		} while (currentPage <= totalPages);

		return allItems;
	};

	// Fetch BOQ data from API - Lazy loading: one root fetch, plus at most one
	// child fetch if the first selected node has no leaf rows yet.
	const fetchRFQData = async () => {
		if (!idFromURL || fetchingBoqRef.current) {
			return;
		}

		fetchingBoqRef.current = true;

		try {
			setLoading(true);

			// Use GetBoqItems API without parentId to get root level items
			// Use different endpoints based on event type
			const boqItems = await fetchAllBoqItems((pageNumber, pageSize) =>
				finalEventType === "PR"
					? `/api/PRItemService/GetBoqItems?prId=${idFromURL}&parentId=0&pageNumber=${pageNumber}&pageSize=${pageSize}`
					: `/api/RFQManage/GetBoqItems?rfqId=${idFromURL}&version=${CurrentVersion || 1}&parentId=0&pageNumber=${pageNumber}&pageSize=${pageSize}`
				, 50);

			if (boqItems && Array.isArray(boqItems) && boqItems.length > 0) {
				// Map API response to our row structure
				const mappedRootRows = boqItems.map(item => {
					// A row is a group/parent only when it has NO line-item data of
					// its own (no quantity AND no UOM) — that's what a true section
					// header looks like. Root items like "FAS Software" or
					// "Workstation" have parentId === null (they're real top-level
					// items, siblings of "Fire Alarm System"), but they carry their
					// own quantity/UOM, so they must render as plain leaf rows, not
					// as (empty) expandable groups.
					const hasChildren = (!item.quantity && !item.uom) || !!item.isGroup;
					const level = item.hierarchyCode ? item.hierarchyCode.split('.').length : 1;

					return {
						id: item.id,
						level: level,
						description: item.itemName || item.description || item.itemDesc || '',
						itemCode: item.itemCode || '',
						itemDesc: item.itemDesc || '',
						quantity: item.quantity || 0,
						quantityUnit: item.uom || item.quantityUnit || '',
						uom: item.uom || item.quantityUnit || '',
						targetPrice: item.targetPrice || 0,
						remarks: item.remarks || '',
						plant: item.plant || '',
						boqSheetName: item.boqSheetName || '',
						hierarchyCode: item.hierarchyCode || '',
						parentId: item.parentId,
						lineTotal: (item.quantity || 0) * (item.targetPrice || 0),
						isGroup: hasChildren, // Set based on whether it has quantity/uom
						expanded: false, // Collapsed by default
						children: [], // Will be loaded on expand
						childrenLoaded: false, // Track if children have been fetched
						hasChildren: hasChildren,
						originalData: item // Store original API data
					};
				});

				// Group by discipline/sheet so the navigator reflects the real
				// Excel hierarchy (Discipline -> Item -> Sub-item) instead of a
				// flat list of every sheet's root rows mixed together. Orphan
				// hierarchy leaves (parentId null, hierarchyCode 2/3/…) are nested
				// under the sheet's hierarchyCode "1" header inside this step.
				const groupedRootRows = groupRootItemsByDiscipline(mappedRootRows);

				let initializedRows = groupedRootRows;
				let defaultParent = groupedRootRows[0] || null;
				// On initial load: auto-select the first top-level node.
				if (defaultParent) {
					let leafRows = getLoadedLeaves(defaultParent);

					// Only hit GetBoqItems once more if the first node is a real
					// parent with no leaf rows in the root payload.
					if (leafRows.length === 0) {
						const firstRealParent = defaultParent.isDiscipline
							? (defaultParent.children || []).find(
								(child) => !isSyntheticNodeId(child.id) && (child.isGroup || child.hasChildren)
							)
							: defaultParent;

						if (firstRealParent && !isSyntheticNodeId(firstRealParent.id)) {
							const resolved = await loadFirstLeafBranch(firstRealParent, groupedRootRows);
							initializedRows = resolved.updatedRows;
							if (!defaultParent.isDiscipline) {
								defaultParent = resolved.resolvedNode || firstRealParent;
							}
							leafRows = resolved.leafRows || [];
						}
					} else {
						leafRows = leafRows
							.slice()
							.sort((a, b) => compareHierarchyCode(a.hierarchyCode, b.hierarchyCode));
					}

					setRows(initializedRows);
					setSelectedNodeId(defaultParent.id);

					// Set right panel with resolved leaf rows (don't fetch again)
					if (leafRows.length > 0) {
						setRightPanelRows(leafRows.slice(0, rightPagination.pageSize));
						setRightPagination({
							pageNumber: 1,
							pageSize: rightPagination.pageSize,
							totalCount: leafRows.length,
							totalPages: Math.max(Math.ceil(leafRows.length / rightPagination.pageSize), 1),
						});
					} else {
						setRightPanelRows([]);
						setRightPagination({ pageNumber: 1, pageSize: rightPagination.pageSize, totalCount: 0, totalPages: 0 });
					}
				} else {
					setRows(initializedRows);
					setRightPanelRows([]);
					setRightPagination({ pageNumber: 1, pageSize: rightPagination.pageSize, totalCount: 0, totalPages: 0 });
				}

				// Mark initial data as fetched
				hasFetchedInitialData.current = true;
			} else {
				setRows([]);
			}
		} catch (error) {
			// toast.error("Failed to load BOQ data", { toastId: "boq-fetch-error" });
		} finally {
			fetchingBoqRef.current = false;
			setLoading(false);
		}
	};

	// Fetch child items for a specific parent node using GetBoqItems API
	const fetchChildItems = async (parentId, parentNode) => {
		if (!idFromURL || !parentId || isSyntheticNodeId(parentId)) {
			return [];
		}

		try {
			// Add to loading set
			setLoadingNodes(prev => new Set(prev).add(parentId));

			// Fetch every page of children instead of only page 1 — a parent
			// with more children than a single page (previously hard-coded to
			// pageSize=10) was silently truncated, which is why some nodes in
			// the tree looked like they were "missing" items.
			const childItems = await fetchAllBoqItems((pageNumber, pageSize) =>
				finalEventType === "PR"
					? `/api/PRItemService/GetBoqItems?prId=${idFromURL}&parentId=${parentId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
					: `/api/RFQManage/GetBoqItems?rfqId=${idFromURL}&version=${CurrentVersion || 1}&parentId=${parentId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
				, 50);

			if (childItems && Array.isArray(childItems) && childItems.length > 0) {
				// Map child items to row structure
				const mappedChildren = childItems.map(item => {
					// A row is a group/parent only when it has NO line-item data of
					// its own (no quantity AND no UOM) — that's what a true section
					// header looks like, not just quantity = 0 alone.
					const hasChildren = (!item.quantity && !item.uom) || !!item.isGroup;
					// Compute level relative to the parent node rather than from
					// hierarchyCode alone — hierarchyCode is an absolute Excel
					// number (e.g. "1.1") that doesn't know about wrapper levels
					// such as the synthetic discipline group, so basing it on
					// the parent's actual level keeps indentation correct no
					// matter how the tree is nested.
					const level = (parentNode?.level || 0) + 1;

					return {
						id: item.id,
						level: level,
						description: item.itemName || item.description || item.itemDesc || '',
						itemCode: item.itemCode || '',
						itemDesc: item.itemDesc || '',
						quantity: item.quantity || 0,
						quantityUnit: item.uom || item.quantityUnit || '',
						uom: item.uom || item.quantityUnit || '',
						targetPrice: item.targetPrice || 0,
						remarks: item.remarks || '',
						plant: item.plant || '',
						boqSheetName: item.boqSheetName || '',
						hierarchyCode: item.hierarchyCode || '',
						parentId: item.parentId,
						lineTotal: (item.quantity || 0) * (item.targetPrice || 0),
						isGroup: hasChildren,
						expanded: false,
						children: [],
						childrenLoaded: false,
						hasChildren: hasChildren,
						originalData: item
					};
				});
				return mappedChildren.slice().sort((a, b) => compareHierarchyCode(a.hierarchyCode, b.hierarchyCode));
			}

			return [];
		} catch (error) {
			// toast.error("Failed to load child items", { toastId: "boq-fetch-children-error" });
			return [];
		} finally {
			// Remove from loading set
			setLoadingNodes(prev => {
				const newSet = new Set(prev);
				newSet.delete(parentId);
				return newSet;
			});
		}
	};

	// Fetch data on component mount or when idFromURL changes
	useEffect(() => {
		if (idFromURL && atoken && !hasFetchedInitialData.current) {
			fetchRFQData();
		}
	}, [idFromURL, atoken]);

	useEffect(() => {
		if (!selectedNodeId && rows.length > 0) {
			setSelectedNodeId(rows[0].id);
		}
	}, [rows, selectedNodeId]);

	useEffect(() => {
		if (atoken && customerid) {
			pullUOMMasterList();
		}
	}, [atoken, customerid]);

	useEffect(() => {
		if (newlyAddedRowId) {
			// Find the newly added row by hierarchyCode and auto-enter edit mode
			const newRow = rightPanelRows.find(row => row.hierarchyCode === newlyAddedRowId);
			if (newRow) {
				handleEditRow(newRow);
			}
		}
	}, [newlyAddedRowId, rightPanelRows]);

	const deleteRow = (id) => {
		const removeRecursive = (items) => {
			return items
				.filter(row => row.id !== id)
				.map(row => ({ ...row, children: row.children ? removeRecursive(row.children) : undefined }));
		};
		setRows(prevRows => removeRecursive(prevRows));
	};

	const pullUOMMasterList = () => {
		const data = {
			CustomerId: customerid,
			IsActive: true,
		};
		UOMMasterList(data, atoken).then((res) => {
			setUOMMaster(res || []);
		}).catch((err) => {
			setUOMMaster([]);
		});
	};

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

	const toggleExpand = async (id) => {
		// Find the node being toggled
		let targetNode = null;
		const findNode = (items) => {
			for (const item of items) {
				if (item.id === id) {
					targetNode = item;
					return true;
				}
				if (item.children && findNode(item.children)) {
					return true;
				}
			}
			return false;
		};
		findNode(rows);

		if (!targetNode) return;

		// If expanding and children not loaded yet, fetch them
		if (!targetNode.expanded && !targetNode.childrenLoaded && (targetNode.isGroup || targetNode.hasChildren)) {
			const children = await resolveNodeChildren(targetNode);

			// Update the tree with fetched children
			const updateWithChildren = (items) =>
				items.map((row) => {
					if (row.id === id) {
						return {
							...row,
							expanded: true,
							children: children,
							childrenLoaded: true
						};
					}
					if (row.children) {
						return { ...row, children: updateWithChildren(row.children) };
					}
					return row;
				});
			setRows(updateWithChildren(rows));
		} else {
			// Just toggle the expanded state
			const toggle = (items) =>
				items.map((row) => {
					if (row.id === id) return { ...row, expanded: !row.expanded };
					if (row.children) return { ...row, children: toggle(row.children) };
					return row;
				});
			setRows(toggle(rows));
		}
	};

	const handleNavigatorToggle = async () => {
		if (navigatorExpanded) {
			setNavigatorExpanded(false);
		} else {
			setNavigatorExpanded(true);
			if (rows.length === 0) {
				await fetchRFQData();
			}
		}
	};

	const handleNavigatorNodeClick = async (node) => {
		setSelectedNodeId(node.id);

		if (node.isDiscipline) {
			// Show every item under this discipline (all nested leaves),
			// not just the first branch that happens to have leaves.
			await fetchRightPanelRows(node, 1, rightPagination.pageSize);
			return;
		}

		// A standalone leaf item (e.g. "2 FAS Software", "3 Workstation") has
		// no children to fetch — it IS the row to display, with its own real
		// Quantity/UOM. Trying to fetch its children only ever returns an
		// empty list and previously surfaced a misleading "no items found"
		// message instead of the item's own data.
		if (!node.isGroup && !node.hasChildren) {
			setRightPanelRows([node]);
			setRightPagination({ pageNumber: 1, pageSize: rightPagination.pageSize, totalCount: 1, totalPages: 1 });
			return;
		}

		// Resolve clicked branch to first descendant that contains leaf rows.
		const resolved = await loadFirstLeafBranch(node, rows);
		setRows(resolved.updatedRows);
		setSelectedNodeId(resolved.resolvedNode?.id || node.id);
		applyRightPanelLeaves(resolved.leafRows, 1, rightPagination.pageSize);
	};

	const handleRightPageChange = async (newPage) => {
		if (!selectedNode) return;
		await fetchRightPanelRows(selectedNode, newPage, rightPagination.pageSize);
	};

	const handleRightRowsPerPageChange = async (newPageSize) => {
		if (!selectedNode) {
			setRightPagination((prev) => ({ ...prev, pageSize: newPageSize, pageNumber: 1 }));
			return;
		}
		await fetchRightPanelRows(selectedNode, 1, newPageSize);
	};

	const selectedNode = useMemo(() => findNodeById(rows, selectedNodeId), [rows, selectedNodeId]);

	const filteredNavigatorTree = useMemo(
		() => filterParentTree(rows, navigatorSearch),
		[rows, navigatorSearch]
	);

	const selectedNodeLeaves = useMemo(() => {
		if (!selectedNode) return [];
		const leaves = collectLeafRows(selectedNode);
		if (leaves.length > 0) return leaves;
		if (!selectedNode.isGroup) return [selectedNode];
		return [];
	}, [selectedNode]);

	const handleAddRow = async () => {
		// Determine parent: prefer right panel selected row, else use navigator node
		let parentNode = null;

		if (selectedRightRowId) {
			const rightRow = rightPanelRows.find(r => (r.originalData?.id || r.id) === selectedRightRowId);
			if (rightRow) {
				parentNode = {
					id: rightRow.originalData?.id || rightRow.id,
					hierarchyCode: rightRow.hierarchyCode,
					boqSheetName: rightRow.boqSheetName
				};
			}
		}

		if (!parentNode) {
			parentNode = selectedNode;
		}

		if (!parentNode) {
			toast.warning('Please select a parent node from the navigator first');
			return;
		}

		setAddingRow(true);
		try {
			// Fetch current children count to calculate the correct hierarchy code
			// Use different endpoints based on event type
			const childrenEndpoint = finalEventType === "PR"
				? `/api/PRItemService/GetBoqItems?prId=${idFromURL}&parentId=${parentNode.id}&pageNumber=1&pageSize=1`
				: `/api/RFQManage/GetBoqItems?rfqId=${idFromURL}&version=${CurrentVersion || 1}&parentId=${parentNode.id}&pageNumber=1&pageSize=1`;
			const childrenRes = await apiClient.getres(childrenEndpoint, atoken);
			const totalChildren = childrenRes?.data?.pageMetadata?.totalCount ?? 0;

			const newHierarchyCode = parentNode.hierarchyCode
				? `${parentNode.hierarchyCode}.${totalChildren + 1}`
				: `${totalChildren + 1}`;

			// Create a temporary row with id = 0 to mark it as new (NO API CALL HERE)
			const tempRowId = Date.now(); // Unique temp ID
			const newRow = {
				id: tempRowId,
				originalData: { id: 0 }, // Mark as new row (not yet saved)
				level: (parentNode.hierarchyCode?.split('.').length || 1) + 1,
				description: 'New Item',
				itemCode: '',
				itemDesc: '',
				quantity: 0,
				quantityUnit: '',
				uom: '',
				targetPrice: 0,
				remarks: '',
				plant: '',
				boqSheetName: parentNode.boqSheetName || selectedNode?.boqSheetName || '',
				hierarchyCode: newHierarchyCode,
				parentId: parentNode.id,
				lineItemNo: null,
				itemCategory: '',
				materialGrp: null,
				deliveryDate: null,
				erpSourceId: null,
				prId: null,
				itemRefId: 0,
				itemImage: '',
				itemFile: '',
				poNumber: '',
				poVendorName: null,
				poUnitRate: null,
				poValue: null,
				poDate: null,
				bidStartprice: null,
				minimumdecreamentOn: null,
				eventType: null,
				eventId: null,
				maxPrice: null,
				minPrice: null,
				itemType: '',
				itemTypeId: 0,
				rfqVendorParameters: null,
				isNewItem: true // Flag to identify new rows
			};

			// Add new row to the right panel and enter edit mode immediately (NO API)
			setRightPanelRows(prev => [newRow, ...prev]);
			setEditingRowId(tempRowId);
			setEditFormData({
				itemDesc: '',
				quantity: 0,
				uom: '',
				targetPrice: 0,
				remarks: ''
			});
			setNewlyAddedRowId(newHierarchyCode);
			toast.info('New row added. Please fill in the details and click Save.', { toastId: 'boq-add-row-info' });
		} catch (error) {
			toast.error('Failed to add new row. Please try again.', { toastId: 'boq-add-row-error' });
		} finally {
			setAddingRow(false);
		}
	};

	const handleEditRow = (row) => {
		const itemId = row.originalData?.id || row.id;
		setEditingRowId(itemId);

		// If uom stored as a numeric ID, resolve it to the UOM text so the select pre-fills correctly
		let resolvedUom = row.uom || '';
		if (resolvedUom !== '' && !isNaN(resolvedUom)) {
			const found = UOMMaster.find(u => String(u.id) === String(resolvedUom));
			resolvedUom = found ? found.uom : resolvedUom;
		}

		setEditFormData({
			itemDesc: row.description || row.itemDesc || '',
			quantity: row.quantity || 0,
			targetPrice: row.targetPrice || 0,
			remarks: row.remarks || '',
			uom: resolvedUom
		});
	};

	const handleEditFieldChange = (field, value) => {
		setEditFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	const handleSaveRow = async (row) => {
		// Validate form data
		if (!editFormData.itemDesc?.trim()) {
			toast.warning('Please enter item description', { toastId: 'validate-itemdesc' });
			return;
		}
		if (!editFormData.quantity || editFormData.quantity <= 0) {
			toast.warning('Please enter a valid quantity', { toastId: 'validate-qty' });
			return;
		}
		if (!editFormData.uom?.trim()) {
			toast.warning('Please select a UOM', { toastId: 'validate-uom' });
			return;
		}

		const itemId = row.originalData?.id || row.id;
		const isNewRow = row.originalData?.id === 0 || row.isNewItem; // Check if this is a new row
		setSavingRowId(itemId);

		try {
			const payload = {
				id: isNewRow ? 0 : (row.originalData?.id || row.id),
				itemName: editFormData.itemDesc,
				lineItemNo: row.lineItemNo,
				itemCode: row.itemCode || '',
				version: CurrentVersion || 1,
				itemDesc: editFormData.itemDesc,
				itemCategory: row.itemCategory || '',
				quantity: parseFloat(editFormData.quantity) || 0,
				uom: editFormData.uom,
				targetPrice: parseFloat(editFormData.targetPrice) || 0,
				materialGrp: row.materialGrp,
				plant: row.plant || '',
				deliveryDate: row.deliveryDate,
				remarks: editFormData.remarks || '',
				boqSheetName: row.boqSheetName || '',
				parentId: row.parentId,
				erpSourceId: row.erpSourceId,
				// Use appropriate ID field based on event type
				...(finalEventType === "PR"
					? { prId: parseInt(idFromURL) }
					: { rfqId: parseInt(idFromURL) }),
				prId: finalEventType === "PR" ? parseInt(idFromURL) : row.prId,
				itemRefId: row.itemRefId || 0,
				itemImage: row.itemImage || '',
				itemFile: row.itemFile || '',
				customerId: customerid,
				createdById: userDetail?.id || 0,
				createdByName: userDetail?.name || '',
				poNumber: row.poNumber || '',
				poVendorName: row.poVendorName,
				poUnitRate: row.poUnitRate,
				poValue: row.poValue,
				poDate: row.poDate,
				bidStartprice: row.bidStartprice,
				minimumdecreamentOn: row.minimumdecreamentOn,
				eventType: row.eventType,
				eventId: row.eventId,
				maxPrice: row.maxPrice,
				minPrice: row.minPrice,
				itemType: row.itemType || '',
				itemTypeId: row.itemTypeId || 0,
				hierarchyCode: row.hierarchyCode || '',
				rfqVendorParameters: row.rfqVendorParameters
			};

			// Choose endpoint: Add for new rows, Update for existing rows
			// Use different endpoints based on event type
			let endpoint;
			if (finalEventType === "PR") {
				endpoint = isNewRow ? '/api/PRItemService/Add' : '/api/PRItemService/Update';
			} else {
				endpoint = isNewRow ? '/api/RFQItemService/Add' : '/api/RFQItemService/Update';
			}
			const response = await apiClient.postres(endpoint, payload, atoken);

			if (response && (response.status === 200 || response.status === 201)) {
				const successMsg = isNewRow ? 'Row added successfully!' : 'Row updated successfully!';
				toast.success(successMsg, { toastId: 'boq-save-row-success' });
				setEditingRowId(null);
				setEditFormData({});
				setNewlyAddedRowId(null);
				// Refresh right panel to reflect changes
				await fetchRightPanelRows(selectedNode, rightPagination.pageNumber, rightPagination.pageSize);
			} else {
				toast.error('Failed to save row. Please try again.', { toastId: 'boq-save-row-error' });
			}
		} catch (error) {
			toast.error(
				error?.response?.data?.message || 'Failed to save row. Please try again.',
				{ toastId: 'boq-save-row-error' }
			);
		} finally {
			setSavingRowId(null);
		}
	};

	const handleCancelEdit = () => {
		setEditingRowId(null);
		setEditFormData({});
		setNewlyAddedRowId(null);
	};

	const handleAddGroup = () => {
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
			toast.error(`${finalEventType} ID is missing. Please refresh and try again.`);
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

			const uploadEndpoint = `/api/RFQManage/uploadBoqBuyer`;

			const response = await apiClient.postres(
				uploadEndpoint,
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

					hasFetchedInitialData.current = false;
					await fetchRFQData();

					if (onUploadSuccess) {
						onUploadSuccess();
					}
				}
			} else {
				toast.error("Upload failed. Please try again.", { toastId: "boq-upload-error" });
			}

		} catch (error) {
			// ONLY IMPROVED ERROR HANDLING 
			toast.error(getApiErrorMessage(error), {
				toastId: "boq-upload-error"
			});
		}
	};

	const handleDeleteAllBoq = async () => {
		if (!idFromURL) {
			toast.error(`${finalEventType} ID is missing. Please refresh and try again.`);
			return;
		}

		try {
			setDeletingAll(true);
			const deleteEndpoint = finalEventType === "PR"
				? `/api/PRItemService/${idFromURL}/DeleteAll`
				: `/api/RFQItemService/${idFromURL}/DeleteAll`;

			const res = await apiClient.postres(deleteEndpoint, null, atoken);

			if (res) {
				toast.success("BOQ items deleted successfully", { toastId: "boq-delete-all-success" });
				setConfirmDeleteAll(false);
				setRows([]);
				setRightPanelRows([]);
				setSelectedNodeId(null);
				setSelectedRightRowId(null);
				setSelectedItems(new Set());
				setSelectAll(false);
				setRightPagination({ pageNumber: 1, pageSize: rightPagination.pageSize, totalCount: 0, totalPages: 0 });
				hasFetchedInitialData.current = false;

				if (onUploadSuccess) {
					onUploadSuccess();
				}
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error), { toastId: "boq-delete-all-error" });
		} finally {
			setDeletingAll(false);
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
				boqReq: prData.isBoq || prData.boqReq || true,
				Version: 1,
				createdById: userDetail?.id,
				createdByName: userDetail?.name,
				customerId: customerid,
				rfqParameters: [],
				RFQVersionHistory: [{
					version: 1,
					bidOpeningDate: null,
					autoOpenEnabled: false
				}]
			};

			const statedata = {
				EventType: "RFQ",
				CustomerId: customerid,
				EventId: 0,
				OrgId: prData.purchOrgId,
				OrgGroupId: prData.purchGrpId,
			};

			const queryParams = buildQueryParams(statedata);

			const stagelist = await apiClient.getres(
				`/api/EventStage/EventStageFind?${queryParams}`,
				atoken
			);

			const rfqPayloadWithStage = getPayloadWithStage(
				"currentStage",
				"Draft",
				stagelist?.data?.result,
				rfqPayload,
				"currentStage",
				prData.purchOrgId,
				prData.purchGrpId
			);

			const res = await apiClient.postres(
				`/api/RFQManage/Add`,
				rfqPayloadWithStage,
				atoken
			);

			if (!res) {
				toast.error("Failed to create RFQ - No response from server");
				setCreatingRFQ(false);
				return;
			}

			const rfqId = res.data;
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

			try {
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
				}
			} catch (error) {
				// Don't block RFQ creation if attachment save fails
			}

			toast.success("RFQ Created successfully.");
			navigate(`/configuration/manage-rfq/${rfqId}`);

		} catch (error) {
			// COMMON ERROR HANDLER
			toast.error(getApiErrorMessage(error), {
				toastId: "rfq_create_error"
			});
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

	const renderNavigatorNodes = (items, forceExpand = false) =>
		items.map((node) => {
			const showExpandIcon = !!(node.isGroup && node.hasChildren);
			const isExpanded = forceExpand || node.expanded;
			const isSelected = selectedNodeId === node.id;
			const badgeColor = getNavigatorBadgeColor(node.isDiscipline);

			return (
				<React.Fragment key={node.id}>
					<div
						onClick={() => handleNavigatorNodeClick(node)}
						className="d-flex align-items-center"
						style={{
							padding: '7px 8px',
							marginLeft: `${Math.max((node.level - 1) * 12, 0)}px`,
							cursor: 'pointer',
							backgroundColor: isSelected ? '#e7edf9' : 'transparent',
							borderLeft: isSelected ? '3px solid #2f6fd6' : '3px solid transparent',
							color: '#2e3f66',
							borderRadius: '3px',
						}}
					>
						{showExpandIcon ? (
							<IconButton
								size="small"
								onClick={(e) => {
									e.stopPropagation();
									toggleExpand(node.id);
								}}
								disabled={loadingNodes.has(node.id)}
								className="p-0 me-1"
								sx={{ color: '#5f7fbe' }}
							>
								{loadingNodes.has(node.id) ? (
									<div className="spinner-border spinner-border-sm" role="status" style={{ width: '12px', height: '12px' }}>
										<span className="visually-hidden">Loading...</span>
									</div>
								) : isExpanded ? (
									<HiChevronDown className="f14" />
								) : (
									<HiChevronRight className="f14" />
								)}
							</IconButton>
						) : (
							<span style={{ width: 18 }} />
						)}

						<span
							style={{
								minWidth: '28px',
								height: '14px',
								lineHeight: '14px',
								borderRadius: '2px',
								textAlign: 'center',
								fontSize: '9px',
								fontWeight: 700,
								color: '#fff',
								backgroundColor: badgeColor,
								marginRight: '8px',
								display: 'inline-block',
								padding: '0 3px',
								whiteSpace: 'nowrap',
							}}
						>
							{node.hierarchyCode || node.level || 1}
						</span>
						<Tooltip title={node.itemDesc || node.description || 'Untitled'} placement="right" arrow>
							<span
								className="f13"
								style={{
									flex: 1,
									minWidth: 0,
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									cursor: 'pointer',
									fontWeight: node.isDiscipline ? 700 : 400,
									textTransform: node.isDiscipline ? 'uppercase' : 'none',
								}}
							>
								{node.description || 'Untitled'}
							</span>
						</Tooltip>
					</div>
					{isExpanded && node.children && node.children.length > 0 && renderNavigatorNodes(node.children, forceExpand)}
				</React.Fragment>
			);
		});

	return (
		<div className="p-3">
			{loading && (
				<div className="d-flex justify-content-center align-items-center p-4">
					<div className="spinner-border text-primary" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
					<span className="ms-2">Loading BOQ data...</span>
				</div>
			)}

			<div className="d-flex justify-content-between align-items-center mb-2">
				<div className="fw-semibold">Item Description</div>
				<div className="d-flex align-items-center gap-2">
					<button
						type="button"
						className="pe-btn pe-btn--secondary"
						onClick={handleDownloadExcel}
						disabled={readOnly}
					>
						Download Excel
					</button>
					<label
						className="pe-btn pe-btn--secondary"
						style={{ cursor: (readOnly || stage === "Open") ? 'not-allowed' : 'pointer', opacity: (readOnly || stage === "Open") ? 0.5 : 1 }}
					>
						Upload Excel
						<input
							hidden
							type="file"
							accept=".xlsx,.xls"
							onChange={handleExcelUpload}
							disabled={readOnly || stage === "Open"}
						/>
					</label>
					<button
						type="button"
						className="pe-btn pe-btn--primary"
						onClick={handleAddRow}
						disabled={readOnly || stage !== "Draft" || addingRow || (!selectedNode && !selectedRightRowId)}
					>
						<HiPlusSm /> Add item
					</button>
					<button
						type="button"
						className="pe-btn pe-btn--danger"
						onClick={() => setConfirmDeleteAll(true)}
						disabled={readOnly || stage === "Open" || deletingAll || rows.length === 0}
					>
						<HiOutlineTrash /> Delete All
					</button>
				</div>
			</div>

			{!loading && rows.length === 0 ? (
				<div
					className="border rounded d-flex flex-column align-items-center justify-content-start text-center"
					style={{ minHeight: '520px', background: '#ffffff', color: '#5e78ad', paddingTop: 60 }}
				>
					<svg width="56" height="56" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 16, opacity: 0.35 }}>
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#2f6fd6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
						<polyline points="14 2 14 8 20 8" stroke="#2f6fd6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
						<line x1="12" y1="18" x2="12" y2="12" stroke="#2f6fd6" strokeWidth="1.5" strokeLinecap="round" />
						<line x1="9" y1="15" x2="15" y2="15" stroke="#2f6fd6" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
					<div className="fw mb-1" style={{ fontSize: 15, color: 'black' }}>No BOQ Data Available</div>
					<div style={{ fontSize: 13, color: 'black' }}>Please upload an Excel file to view the BOQ.</div>
				</div>
			) : (
				<div className="border rounded overflow-hidden" style={{ minHeight: '520px', background: '#ffffff' }}>
					<div className="d-flex" style={{ minHeight: '520px' }}>
						<div
							style={{
								width: '250px',
								borderRight: '1px solid #dde3ef',
								background: '#ffffff',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<div style={{ padding: '10px 12px', borderBottom: '1px solid #dde3ef' }}>
								<div className="d-flex align-items-center justify-content-between mb-2">
									<div className="fw-semibold f13" style={{ color: '#2d3f67' }}>BOQ Navigator</div>
									<IconButton
										size="small"
										onClick={handleNavigatorToggle}
										sx={{ color: '#5f7fbe', padding: '2px' }}
									>
										{navigatorExpanded ? <HiChevronDown className="f14" /> : <HiChevronRight className="f14" />}
									</IconButton>
								</div>
								{navigatorExpanded && (
									<TextField
										size="small"
										fullWidth
										placeholder="Search BOQ"
										value={navigatorSearch}
										onChange={(e) => setNavigatorSearch(e.target.value)}
										sx={{
											'& .MuiOutlinedInput-root': {
												backgroundColor: '#ffffff',
												'& fieldset': { borderColor: '#d5dce9' },
											},
										}}
									/>
								)}
							</div>

							{navigatorExpanded && (
								<div style={{ padding: '8px', overflowY: 'auto', flex: 1 }}>
									{filteredNavigatorTree.length > 0 ? (
										renderNavigatorNodes(filteredNavigatorTree, !!navigatorSearch.trim())
									) : (
										<div className="text-muted f12 p-2">No matching nodes found.</div>
									)}
								</div>
							)}
						</div>

						<div style={{ flex: 1, minWidth: 0, background: '#ffffff', overflow: 'hidden' }}>
							<div
								className="d-flex justify-content-between align-items-center"
								style={{
									padding: '12px 14px',
									borderBottom: '1px solid #dde3ef',
									background: '#ffffff',
								}}
							>
								<div>
									<div className="fw-semibold" style={{ color: '#2d3f67' }}>{finalEventType === "PR" ? "PR Items" : "RFQ Items"}</div>
									<div className="f12" style={{ color: '#5e78ad' }}>
										{selectedRightRowId
											? `Adding child under: ${rightPanelRows.find(r => (r.originalData?.id || r.id) === selectedRightRowId)?.description || 'Selected Row'} — click "Add Row" to confirm`
											: selectedNode
												? `Selected: ${selectedNode.description || 'Untitled'} (${rightPagination.totalCount} child item${rightPagination.totalCount === 1 ? '' : 's'})`
												: 'Select a parent node from BOQ Navigator'}
									</div>
								</div>
							</div>

							<div style={{ overflowX: 'auto', width: '100%' }}>
								<table className="f13" style={{ borderCollapse: 'collapse', minWidth: '780px', width: '100%' }}>
									<thead>
										<tr style={{ background: '#ffffff', borderBottom: '1px solid #dde3ef', color: '#2d3f67' }}>
											<th className="p-2 text-start" style={{ minWidth: 200 }}>Description</th>
											<th className="p-2 text-center" style={{ width: 100 }}>Quantity</th>
											<th className="p-2 text-center" style={{ minWidth: 100 }}>UOM</th>
											<th className="p-2 text-center" style={{ minWidth: 120 }}>Target Price</th>
											<th className="p-2 text-start" style={{ minWidth: 160 }}>Remarks</th>
											<th className="p-2 text-center" style={{ width: 60 }}></th>
										</tr>
									</thead>
									<tbody>
										{rightPanelLoading ? (
											<tr>
												<td colSpan={6} className="p-4 text-center text-muted">
													Loading items...
												</td>
											</tr>
										) : rightPanelRows.length === 0 ? (
											<tr>
												<td colSpan={6} className="p-4 text-center text-muted">
													{selectedNode
														? 'No leaf items found under this node. Expand navigator groups to load children.'
														: 'Select a parent node from the left panel to view Quantity and UOM.'}
												</td>
											</tr>
										) : (
											<>
												{selectedNode && selectedNode.isGroup && (
													<tr style={{ borderBottom: '1px solid #edf1f8', background: '#fff' }}>
														<td className="p-2 text-start fw-semibold" style={{ color: '#2d3f67' }}>
															{selectedNode.description || 'Untitled'}
														</td>
														<td className="p-2 text-center"></td>
														<td className="p-2 text-center"></td>
														<td className="p-2 text-center" style={{ color: '#9db0d8' }}>...</td>
													</tr>
												)}
												{rightPanelRows.map((row) => {
													const itemId = row.originalData?.id || row.id;
													const isSelected = selectedItems.has(itemId);
													const isRightRowSelected = selectedRightRowId === itemId;
													const isEditing = editingRowId === itemId || (newlyAddedRowId === row.hierarchyCode && editingRowId !== null);
													const isDisabled = isItemDisabled(row);
													const badgeColor = getLevelBadgeColor(row.level || 2);

													if (isEditing) {
														return (
															<tr key={row.id} style={{ borderBottom: '1px solid #edf1f8', background: '#f0f5ff' }}>
																<td className="p-2">
																	<TextField
																		size="small"
																		fullWidth
																		value={editFormData.itemDesc || ''}
																		onChange={(e) => handleEditFieldChange('itemDesc', e.target.value)}
																		placeholder="Item Description"
																		disabled={savingRowId === itemId}
																	/>
																</td>
																<td className="p-2">
																	<TextField
																		size="small"
																		type="number"
																		fullWidth
																		value={editFormData.quantity || ''}
																		onChange={(e) => handleEditFieldChange('quantity', e.target.value)}
																		placeholder="Qty"
																		disabled={savingRowId === itemId}
																	/>
																</td>
																<td className="p-2">
																	<TextField
																		size="small"
																		select
																		fullWidth
																		value={editFormData.uom || ''}
																		onChange={(e) => handleEditFieldChange('uom', e.target.value)}
																		disabled={savingRowId === itemId}
																	>
																		<MenuItem value="">Select UOM</MenuItem>
																		{UOMMaster && UOMMaster.length > 0 ? (
																			UOMMaster.map((option) => (
																				<MenuItem key={option.id} value={option.uom}>
																					{option.uom}
																				</MenuItem>
																			))
																		) : (
																			<MenuItem disabled>No UOM available</MenuItem>
																		)}
																	</TextField>
																</td>
																<td className="p-2">
																	<TextField
																		size="small"
																		type="number"
																		fullWidth
																		value={editFormData.targetPrice || ''}
																		onChange={(e) => handleEditFieldChange('targetPrice', e.target.value)}
																		placeholder="Target Price"
																		disabled={savingRowId === itemId}
																	/>
																</td>
																<td className="p-2">
																	<TextField
																		size="small"
																		fullWidth
																		rows={2}
																		multiline
																		value={editFormData.remarks || ''}
																		onChange={(e) => handleEditFieldChange('remarks', e.target.value)}
																		placeholder="Remarks"
																		disabled={savingRowId === itemId}
																	/>
																</td>
																<td className="p-2 text-center" style={{ minWidth: '100px' }}>
																	<div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
																		<CommonTooltip title="Save Changes" placement="bottom">
																			<span>
																				<button
																					type="button"
																					className="pe-icon-btn pe-icon-btn--edit"
																					onClick={() => handleSaveRow(row)}
																					disabled={savingRowId !== null}
																					style={{ fontSize: 16, fontWeight: 700 }}
																				>
																					{savingRowId === itemId ? (
																						<span className="spinner-border spinner-border-sm" />
																					) : '✓'}
																				</button>
																			</span>
																		</CommonTooltip>
																		<CommonTooltip title="Discard Changes" placement="bottom">
																			<button
																				type="button"
																				className="pe-icon-btn pe-icon-btn--delete"
																				onClick={handleCancelEdit}
																				disabled={savingRowId === itemId}
																				style={{ fontSize: 16, fontWeight: 700 }}
																			>
																				✕
																			</button>
																		</CommonTooltip>
																	</div>
																</td>
															</tr>
														);
													}

													return (
														<tr
															key={row.id}
															onClick={() => !readOnly && setSelectedRightRowId(isRightRowSelected ? null : itemId)}
															style={{
																borderBottom: '1px solid #edf1f8',
																background: isRightRowSelected ? '#eef3fb' : '#fff',
																cursor: readOnly ? 'default' : 'pointer',
																outline: isRightRowSelected ? '2px solid #93b0e8' : 'none',
																outlineOffset: '-1px'
															}}
														>
															<td className="p-2 text-start">
																<div className="d-flex align-items-center" style={{ gap: '8px', paddingLeft: '10px' }}>
																	<span
																		style={{
																			minWidth: '28px',
																			height: '14px',
																			lineHeight: '14px',
																			borderRadius: '2px',
																			textAlign: 'center',
																			fontSize: '9px',
																			fontWeight: 700,
																			color: '#fff',
																			backgroundColor: badgeColor,
																			display: 'inline-block',
																			padding: '0 3px',
																			whiteSpace: 'nowrap',
																		}}
																	>
																		{row.hierarchyCode || row.level || 2}
																	</span>
																	{(() => {
																		const displayDesc = row.description || row.itemName || row.itemCode || 'N/A';
																		const tooltipDesc = row.itemDesc || displayDesc;
																		return (
																			<CommonTooltip title={tooltipDesc} placement="bottom">
																				<span style={{ color: '#2f3f63', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '100%' }}>
																					{displayDesc.length > 100 ? displayDesc.substring(0, 100) + '...' : displayDesc}
																				</span>
																			</CommonTooltip>
																		);
																	})()}
																</div>
															</td>
															<td className="p-2 text-center">{row.quantity || 0}</td>
															<td className="p-2 text-center">{row.uom || row.quantityUnit || '-'}</td>
															<td className="p-2 text-center">{row.targetPrice || '-'}</td>
															<td className="p-2" style={{ fontSize: '12px', color: '#666', minWidth: '200px' }}>
																{row.remarks && row.remarks.length > 100 ? (
																	<CommonTooltip title={row.remarks} placement="bottom">
																		<div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
																			{row.remarks.substring(0, 100)}...
																		</div>
																	</CommonTooltip>
																) : (
																	<div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
																		{row.remarks || '-'}
																	</div>
																)}
															</td>
															<td className="p-2 text-center" style={{ minWidth: '80px' }}>
																{!readOnly && stage === "Draft" && (
																	<CommonTooltip title="Edit Item" placement="bottom">
																		<button
																			type="button"
																			className="pe-icon-btn pe-icon-btn--edit"
																			onClick={() => handleEditRow(row)}
																		>
																			<HiPencilAlt size={16} />
																		</button>
																	</CommonTooltip>
																)}
															</td>
														</tr>
													);
												})}
											</>
										)}
									</tbody>
								</table>
							</div>

							{selectedNode && rightPagination.totalCount > 0 && (
								<PEPagination
									page={rightPagination.pageNumber}
									pageSize={rightPagination.pageSize}
									totalRows={rightPagination.totalCount}
									onPageChange={handleRightPageChange}
									onPageSizeChange={handleRightRowsPerPageChange}
								/>
							)}
						</div>
					</div>
				</div>
			)}
			<PEModal
				open={confirmDeleteAll}
				onClose={() => !deletingAll && setConfirmDeleteAll(false)}
				size="xs"
				title="Delete All BOQ Items"
				footer={
					<>
						<button
							type="button"
							className="pe-btn pe-btn--secondary"
							onClick={() => setConfirmDeleteAll(false)}
							disabled={deletingAll}
						>
							Cancel
						</button>
						<button
							type="button"
							className="pe-btn pe-btn--primary"
							onClick={handleDeleteAllBoq}
							disabled={deletingAll}
						>
							{deletingAll ? 'Deleting...' : 'Yes, Delete All'}
						</button>
					</>
				}
			>
				<p className="f14" style={{ color: 'var(--pe-text)', margin: 0 }}>
					Are you sure you want to delete all BOQ items? This action cannot be undone.
				</p>
			</PEModal>
		</div>
	);
};

export default BoqScreen;