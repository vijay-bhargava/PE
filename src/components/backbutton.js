import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";

const BackButton = () => {
  const navigate = useNavigate();

  const goBack = () => {
    
    navigate(-1);
  };


  return (
    <IconButton onClick={goBack}>
					<IoMdArrowRoundBack />
      </IconButton>
  );
};

export default BackButton;