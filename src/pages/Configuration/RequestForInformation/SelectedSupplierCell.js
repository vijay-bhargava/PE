import { Accordion, AccordionDetails, AccordionSummary, Chip, IconButton, Typography } from '@mui/material';
import * as React from 'react';
import { HiOutlineTrash, HiOutlineUserAdd, HiX, HiOutlineChevronDown, HiOutlineChevronUp, HiPencilAlt, HiChevronDown } from "react-icons/hi";
import { Dropdown, OverlayTrigger, Popover } from 'react-bootstrap';
const SelectedSupplierCell = ({ selectedsupplier }) => {
   
    
    return (
        <>
            <div className=''>
                <div className='row'>
                    <div className='col-12 mb-3 '>
                        <div className='row align-items-center p-1 ps-0 pe-0   ms-0 me-0 mt-2 MuiDataGrid-columnHeaders text-white d-none d-lg-block' style={{borderRadius:"0px"}}>
                            <div className='col-12 col-md-10 f14 lingh14'>
                                <div className=" pe-2">
                                    <div className='row text-left'>
                                        <div className='col-lg-1 col-md-4 col-12 ps-1 f14 fw500' >
                                            <div className=''>S.No</div>
                                        </div>
                                        <div className='col-lg col-md-4 col-12 f14 fw500' >
                                            <div className=''>Name </div>
                                        </div>
                                        <div className='col-lg col-md-4 col-6  f14 fw500'>
                                            <div className=''>
                                                 Email
                                            </div>
                                        </div>
                                        <div className='col-lg col-md-4 col-6 f14 fw500'>
                                            <div className=''>
                                                 Company Name
                                            </div>
                                        </div>
                                        
                                       

                                    </div>
                                </div>
                            </div>
                            <div className='d-flex col-12 col-md-2 align-items-center text-end'>
                                <div className='f14'>
                                    <div className='text-muted f14 lingh14'></div>
                                </div>
                            </div>
                        </div>
                        <div className='zebracolor'>
                            {selectedsupplier && selectedsupplier?.length > 0 && selectedsupplier?.map((item, index) => <div className={`${index % 2 == 0 ? "even" : "odd"}`} key={index}>
                                <div className='row align-items-center p-0 pb-1 border-bottom ms-0 me-0 pt-2'>
                                    <div className='col-10 col-md-10 col-lg-10'>
                                        <div className="ps-2 pe-2">
                                            <div className='row text-left f14'>
                                                <div className='col-lg-1 col-md-4 col-12' >
                                                    <div className='text-muted f14 lingh14'>{index + 1}</div>
                                                </div>
                                                <div className='col-lg col-md-4 col-12 text-truncate' >
                                                    <div className='text-muted lingh14 text-truncate'>{item?.contactPerson}</div>
                                                </div>
                                                <div className='col-lg col-md-4 col-6 text-truncate'>
                                                    <div className='text-muted lingh14 text-truncate'>{item?.email}</div>
                                                </div>
                                                <div className='col-lg col-md-4 col-6 text-truncate'>
                                                    <div className='text-muted lingh14 text-truncate'>{item?.companyName}</div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                               
                                  
                                </div>
                            </div>)}
                        </div>
                    </div>
                </div>
            </div>

            
        </>
    )
}

const data = [{
    id: '2323',
    sno: '1',
    itemName: 'HVAC Work',
    item: [
        {
            id: '1234',
            sno: '1',
            title: "Supply, Unloading, Installing, Testing and commissioning of 1.1kV grade, ISI Marked FRLS XLPE insulated, Galvanised Steel Wire/ Strip armoured, PVC sheathed., stranded Al / Cu.conductor Cables,",
            item: [
                {
                    id: '1',
                    sno: '1.1',
                    title: "Control Cable 2 core 1.5 sqmm Cu. Armoured conductor cable,",
                    uom: "Running Meter",
                    qty: 1500,
                    budget: 0
                },
                {
                    id: '2',
                    sno: '1.2',
                    title: "4 core 10 Sq mm Cu. Armoured conductor cable, as per specs",
                    uom: "Running Meter",
                    qty: 200,
                    budget: 0
                },
            ],
        },
        {
            id: '23',
            sno: '2',
            title: "Design, Fabrication, Supply, Handling, Installation, Commissioning and Handing Over of of heavy duly hot dipped galvanised Tin 70 Micron as per IS 2629/ Specification, whichever is",
            item: [
                {
                    id: '1',
                    sno: '2.1',
                    title: "150 mm x 50 mm height x 2 mm thick wide single horizontal/vertical 100 tier.",
                    uom: "Running Meter",
                    qty: 100,
                    budget: 0
                },
            ],
        },
        {
            id: '234',
            sno: '3',
            title: "SITC of Isolators / Circuit Breakers",
            item: [
                {
                    id: '1',
                    sno: '2.1',
                    title: "32 Amps 4 Pole MCB Enclosures with IP44 MS Enclosure as per above specifications.",
                    uom: "number",
                    qty: 1500,
                    budget: 0
                },
                {
                    id: '2',
                    sno: '3.2',
                    title: "40 Amps 4 Pole MCB Enclosures with IP44 MS Enclosure as per above specifications.",
                    uom: "number",
                    qty: 1500,
                    budget: 0
                },
            ],
        },
    ],
},
{
    id: '33',
    sno: '2',
    itemName: 'HVAC Work titme here',
    item: [
        {
            id: '1234',
            sno: '1',
            title: "Supply, Unloading, Installing, Testing and commissioning of 1.1kV grade, ISI Marked FRLS XLPE insulated, Galvanised Steel Wire/ Strip armoured, PVC sheathed., stranded Al / Cu.conductor Cables,",
            item: [
                {
                    id: '1',
                    sno: '1.1',
                    title: "Control Cable 2 core 1.5 sqmm Cu. Armoured conductor cable,",
                    uom: "Running Meter",
                    qty: 1500,
                    budget: 0
                },
                {
                    id: '2',
                    sno: '1.2',
                    title: "4 core 10 Sq mm Cu. Armoured conductor cable, as per specs",
                    uom: "Running Meter",
                    qty: 200,
                    budget: 0
                },
            ],
        },
        {
            id: '23',
            sno: '2',
            title: "Design, Fabrication, Supply, Handling, Installation, Commissioning and Handing Over of of heavy duly hot dipped galvanised Tin 70 Micron as per IS 2629/ Specification, whichever is",
            item: [
                {
                    id: '1',
                    sno: '2.1',
                    title: "150 mm x 50 mm height x 2 mm thick wide single horizontal/vertical 100 tier.",
                    uom: "Running Meter",
                    qty: 100,
                    budget: 0
                },
            ],
        },
    ],
},
{
    id: '3322',
    sno: '3',
    itemName: 'HVAC Work titme here sjdkfjds fdskfjkds fkjdsfsdf',
    item: [
        {
            id: '1234',
            sno: '1',
            title: "Supply, Unloading, Installing, Testing and commissioning of 1.1kV grade, ISI Marked FRLS XLPE insulated, Galvanised Steel Wire/ Strip armoured, PVC sheathed., stranded Al / Cu.conductor Cables,",
            item: [
                {
                    id: '1',
                    sno: '1.1',
                    title: "Control Cable 2 core 1.5 sqmm Cu. Armoured conductor cable,",
                    uom: "Running Meter",
                    qty: 1500,
                    budget: 0
                },
                {
                    id: '2',
                    sno: '1.2',
                    title: "4 core 10 Sq mm Cu. Armoured conductor cable, as per specs",
                    uom: "Running Meter",
                    qty: 200,
                    budget: 0
                },
            ],
        },
        {
            id: '23',
            sno: '2',
            title: "Design, Fabrication, Supply, Handling, Installation, Commissioning and Handing Over of of heavy duly hot dipped galvanised Tin 70 Micron as per IS 2629/ Specification, whichever is",
            item: [
                {
                    id: '1',
                    sno: '2.1',
                    title: "150 mm x 50 mm height x 2 mm thick wide single horizontal/vertical 100 tier.",
                    uom: "Running Meter",
                    qty: 100,
                    budget: 0
                },
            ],
        },
    ],
},
];

export default SelectedSupplierCell