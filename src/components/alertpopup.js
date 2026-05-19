import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function AlertPopUp({ show, handleCancel, handleAction,f,v }) {
	return (
		<>
			<Dialog
				open={show}
				onClose={handleCancel}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">Confirm</DialogTitle>
				<DialogContent>
					Your Changes will not be saved . Are you sure you want to close?
				</DialogContent>

				<DialogActions>
					<Button variant="secondary" onClick={handleCancel}>
						Cancel
					</Button>
					<Button variant="primary" onClick={()=>handleAction(f,v)}>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default AlertPopUp;
