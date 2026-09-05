import React from 'react';
import { CircularProgress } from '@mui/material';
import { HiOutlinePrinter } from 'react-icons/hi';
import PEModal from '../../components/PEModal';

const fmtDate = (val) => {
	if (!val) return '';
	try {
		const d = new Date(val);
		return !isNaN(d.getTime()) ? d.toLocaleDateString('en-GB') : val;
	} catch {
		return val;
	}
};

const GRNReportModal = ({ open, onClose, data = [], loading = false }) => {
	const first = data[0] ?? {};

	const handlePrint = () => {
		const el = document.getElementById('grn-report-printable');
		if (!el) return;
		const win = window.open('', '', 'height=800,width=1200');
		win.document.write('<html><head><title>GRN Report</title>');
		win.document.write('<style>@media print { @page { margin: 0.5in; } body { margin: 0; } } body { font-family: Arial, sans-serif; }</style>');
		win.document.write('</head><body>');
		win.document.write(el.innerHTML);
		win.document.write('</body></html>');
		win.document.close();
		win.print();
	};

	return (
		<PEModal
			open={open}
			onClose={onClose}
			title="Goods Receipt Note"
			size="lg"
			bodyStyle={{ padding: 0, overflowY: 'auto' }}
			footer={
				<>
					<button type="button" className="pe-btn pe-btn--outline" onClick={onClose}>
						Close
					</button>
					{!loading && data.length > 0 && (
						<button type="button" className="pe-btn pe-btn--primary" onClick={handlePrint}>
							<HiOutlinePrinter style={{ marginRight: 6, fontSize: 15 }} />
							Print
						</button>
					)}
				</>
			}
		>
			{loading ? (
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 0' }}>
					<CircularProgress size={36} />
				</div>
			) : data.length === 0 ? (
				<div style={{ textAlign: 'center', padding: '48px 0', fontSize: 13, color: '#9ca3af' }}>
					No GRN report data available
				</div>
			) : (
				<div id="grn-report-printable" style={{ padding: '32px 40px', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' }}>
					{/* Document border */}
					<div style={{ border: '2px solid #000', padding: '20px' }}>

						{/* Company header */}
						<div style={{ borderBottom: '2px solid #000', paddingBottom: 10, marginBottom: 10, textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
							POSCO - India Pune Processing Center Pvt. Ltd.
						</div>

						{/* Document title */}
						<div style={{ borderBottom: '2px solid #000', padding: '8px 0', marginBottom: 15, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>
							Goods Receipt Note
						</div>

						{/* Supplier info row */}
						<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, fontSize: 12, padding: '10px 0' }}>
							<div style={{ flex: 1 }}>
								<span style={{ fontWeight: 'bold' }}>Supplier Name : </span>
								<span>{first.vendorCompany || ''}</span>
							</div>
							<div style={{ flex: 1 }}>
								<span style={{ fontWeight: 'bold' }}>Supplier Code : </span>
								<span>{first.vendorCode || ''}</span>
							</div>
							<div style={{ flex: 1 }}>
								<span style={{ fontWeight: 'bold' }}>GRN Date : </span>
								<span>{fmtDate(first.grnDate)}</span>
							</div>
						</div>

						{/* Invoice / GRN number row */}
						<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, fontSize: 12, padding: '5px 0' }}>
							<div style={{ flex: 1 }}>
								<span style={{ fontWeight: 'bold' }}>Invoice NO : </span>
								<span>{first.invoiceNo || ''}</span>
							</div>
							<div style={{ flex: 1 }}>
								<span style={{ fontWeight: 'bold' }}>GRN No : </span>
								<span>{first.grnNumber || ''}</span>
							</div>
							<div style={{ flex: 1 }}>
								<span style={{ fontWeight: 'bold' }}>Invoice Date : </span>
								<span>{fmtDate(first.invoiceDate)}</span>
							</div>
						</div>

						{/* Items table */}
						<div style={{ marginBottom: 20 }}>
							<table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', border: '1px solid #000' }}>
								<thead>
									<tr style={{ backgroundColor: '#f0f0f0' }}>
										{['Sr', 'PO NO LN', 'PO NUMBER', 'ITEM CODE', 'GRN NO', 'BATCH NUMBER',
											'ITEM DESCRIPTION', 'UOM', 'REC QTY', 'APP QTY', 'REJ QTY', 'WHLO C', 'COST CENTER', 'GL ACCOUNT']
											.map(h => (
												<th key={h} style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>{h}</th>
											))}
									</tr>
								</thead>
								<tbody>
									{data.map((item, idx) => (
										<tr key={idx}>
											<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center' }}>{item.sr || idx + 1}</td>
											<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center' }}>{item.poLn || ''}</td>
											<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.poNo || ''}</td>
											<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.itemCode || ''}</td>
											<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.grnNumber || first.grnNumber || ''}</td>
											<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.batchNumber || ''}</td>
											<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.itemDescription || ''}</td>
											<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center' }}>{item.uom || ''}</td>
											<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{item.recQty ?? '0.00'}</td>
											<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{item.appQty ?? '0.00'}</td>
											<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{item.rejQty ?? '0.00'}</td>
											<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center' }}>{item.whLoc || ''}</td>
											<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.costCenter || ''}</td>
											<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.glAccount || ''}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Inspection remarks */}
						<div style={{ fontSize: 11, marginBottom: 30 }}>
							<div style={{ marginBottom: 8, fontWeight: 'bold' }}>INSPECTION REMARKS:</div>
							<div style={{ marginBottom: 4 }}>
								<span style={{ fontWeight: 'bold' }}>INSPECTION NUMBER:</span>
								<span style={{ marginLeft: 150 }}>{first.inspectionNumber || ''}</span>
								<span style={{ marginLeft: 10 }}>{first.inspectionDate || ''}</span>
							</div>
						</div>

						{/* Date / prepared by */}
						<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 10 }}>
							<div />
							<div style={{ textAlign: 'right' }}>
								<div><span style={{ fontWeight: 'bold' }}>DATE:</span> {fmtDate(first.date)}</div>
								<div><span style={{ fontWeight: 'bold' }}>Prepared By :</span> {first.createdByName || ''}</div>
							</div>
						</div>

						{/* Signature section */}
						<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 40, paddingTop: 20 }}>
							<div style={{ textAlign: 'center', flex: 1 }}>
								<div style={{ marginBottom: 40 }} />
								<div style={{ fontWeight: 'bold' }}>Approved By</div>
								<div>(Store/QC)</div>
							</div>
							<div style={{ textAlign: 'center', flex: 1 }}>
								<div style={{ marginBottom: 40 }} />
								<div style={{ fontWeight: 'bold' }}>Approved By</div>
								<div>(TL)</div>
							</div>
						</div>

					</div>
				</div>
			)}
		</PEModal>
	);
};

export default GRNReportModal;
