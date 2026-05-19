import React, { useCallback, useState, useEffect } from "react";
import { IconButton, MenuItem } from "@mui/material";
import { Dropdown } from "react-bootstrap";
import { HiOutlineDotsHorizontal, HiOutlineX } from "react-icons/hi";
import ParticipantsCompanyDetails from "./ParticipantsCompanyDetails";
import { Modal } from "react-bootstrap";
import { Link} from "react-router-dom";
//import RegisterParticipants from "./RegisterParticipants";

const ResultListCell = ({ item }) => {
  const [modal, setModal] = useState(false);

  const openModal = () => {
    setModal(true);
  };
  const openParticipantModal = () => {
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
  };

  return (
    <form autoComplete="off">
      <div className="row  p-0 pb-1 border-bottom ms-0 me-0 pt-1 pb-1">
        <div className="col-12 col-md-11">
          <div className="row text-left f12 lingh14 text-muted">
            <div className="col-lg col-md col-12">
              <div>{item.VendorMasters[0]?.tradeName}</div>
            </div>
            <div className="col-lg col-md col-12">
              <div>{item.VendorMasters[0]?.companyName}</div>
            </div>
            <div className="col-lg col-md-1 col-12 text-center">
              <div>{item?.ContactPerson}</div>
            </div>
            <div className="col-lg col-md-2 col-12 text-center">
              <div>{item.VendorMasters[0]?.vendorCode}</div>
            </div>
            <div className="col-lg col-md-2 col-12 text-center">
              <div className="">{item.VendorMasters[0]?.taxId2}</div>
            </div>
            <div className="col-lg col-md col-6 text-center">
              <div>{item.VendorMasters[0]?.taxId}</div>
            </div>
            <div className="col-lg col-md col-6 text-center">
              <div>{item?.PhoneNumber}</div>
            </div>
            <div className="col-lg col-md col-6 text-center">
              <div>
                Qulification not send / qulification started, qualification
                approval, qualified,
              </div>
            </div>
            <div className="col-lg-1 col-md-1 col-6 text-center">
              <div>{item?.gstnStatus ? "InActive" : "Active"}</div>
            </div>
          </div>
        </div>
        <div className="d-flex col-12 col-md-1 text-end justify-content-end">
          <Dropdown align="end" className="d-inline-block">
            <Dropdown.Toggle
              as="div"
              id="gt"
              className="round-edit remove-tringle me-2"
              role="button"
            >
              <IconButton size="medium" className="shadow-sm ">
                <HiOutlineDotsHorizontal className="f17" />
              </IconButton>
            </Dropdown.Toggle>
            <Dropdown.Menu className="ddl-menu">
              <MenuItem className="f14" onClick={openModal}>
                View Profile
              </MenuItem>
              <Link
                to={`/manage/manage-participants/register-participants/${item?.Id}`}
                state={item}
              >
                <MenuItem
                  className="f14"
                  // component={Link}
                  // to="/manage/manage-participants/register-participants"
                  // state={item}
                >
                  Edit Profile
                </MenuItem>
              </Link>
              {/* <Divider /> */}
              <MenuItem className="f14">Re Invite SQE</MenuItem>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      {/* <Modal
        size="lg"
        show={modal}
        backdrop="static"
        keyboard={false}
        value={"Add New"}
        className="zindex1280"
        backdropClassName="zindex1280"
        centered
        contentClassName="border-0 rounded"
        onHide={() => closeModal()}
      >
        <Modal.Header className="pt-2 pb-2">
          <Modal.Title id="modal-heading">
            <div className="d-flex align-items-center f14"></div>
          </Modal.Title>
          <IconButton onClick={() => closeModal()} size="small" edge="start">
            <HiOutlineX className="" />
          </IconButton>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3">
            <RegisterParticipants />
          </div>
        </Modal.Body>
      </Modal> */}
      <Modal
        size="lg"
        show={modal}
        backdrop="static"
        keyboard={false}
        value={"Add New"}
        className="zindex1280"
        backdropClassName="zindex1280"
        centered
        contentClassName="border-0 rounded"
        onHide={() => closeModal()}
      >
        <Modal.Header className="pt-2 pb-2">
          <Modal.Title id="modal-heading">
            <div className="d-flex align-items-center f14">View Profile</div>
          </Modal.Title>
          <IconButton onClick={() => closeModal()} size="small" edge="start">
            <HiOutlineX className="" />
          </IconButton>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3">
            <ParticipantsCompanyDetails />
          </div>
        </Modal.Body>
      </Modal>
    </form>
  );
};

export default ResultListCell;
