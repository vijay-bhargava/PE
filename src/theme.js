import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#2A68D3", // Blue color
    },
    btn: {
      main: "#757575", // Gray theme
    },
    black:{
      main: "#F3f3f3", // black theme
    }
  },
  typography: {
    fontSize: 13,
    // You can customize the color of text globally for different variants
   
    // If you want to set the primary color for all text elements, you can do so here
    body1: {
      color: "#212529", // Primary color for body1 text
    },
    body2: {
      color: "#343a40"
     // color: "#2A68D3", // Primary color for body2 text  #343a40
    },
    tablehead:{
      color: "#2A68D3", 
      textDecoration: "underline",
      
    }
  },
 
});
