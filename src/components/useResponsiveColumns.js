import { useTheme, useMediaQuery } from '@mui/material';

const useResponsiveColumns = () => {
  const theme = useTheme();

  // Define media queries
  const isWideScreen = useMediaQuery('(min-width: 1850px) and (max-width: 1920px)');
  const isLargerThan1650px = useMediaQuery('(min-width: 1650px) and (max-width: 1850px)');
  const isLargerThan1450px = useMediaQuery('(min-width: 1450px) and (max-width: 1550px)');
  const isLargerThan1350px = useMediaQuery('(min-width: 1350px) and (max-width: 1450px)');
  const isLargerThan1550px = useMediaQuery('(min-width: 1550px) and (max-width: 1650px)');
  const isLargerThan1024px = useMediaQuery('(min-width: 1024px) and (max-width: 1440px)');
  const isBetween1024pxAnd1250px = useMediaQuery('(min-width: 1024px) and (max-width: 1250px)');
  const isBetween1024pxAnd1350px = useMediaQuery('(min-width: 1024px) and (max-width: 1350px)');
  const isBetween1024pxAnd1050px = useMediaQuery('(min-width: 1150px) and (max-width: 1050px)');
  const isBetween728pxAnd1024px = useMediaQuery('(min-width: 728px) and (max-width: 1024px)');
  const isBetween1250And1300px = useMediaQuery('(min-width: 1250px) and (max-width: 1300px)');


  // Determine column widths
  const getColumnWidths = () => {
    if (isWideScreen) {
      return {
        libraryEntity: 350,
        name: 350,
        valuetype: 250,
        isActive: 250,
        action: 250,
        stages: 200,
        category:350,
        organisation: 100,
        commercial:200
      };
    } else if (isLargerThan1650px) {
      return {
        libraryEntity: 210,
        name: 210,
        valuetype: 160,
        isActive: 160,
        action: 160,
        stages: 200,
        category:350,
        organisation: 100,
        commercial:200
      };
    } else if (isLargerThan1450px) {
      return {
        libraryEntity: 300,
        name: 300,
        valuetype: 200,
        isActive: 80,
        action: 100,
        stages: 200,
        email:150,
        questions: 230,
        category:350,
        organisation: 100,
        commercial:200
      };
    } else if (isLargerThan1024px) {
      return {
        libraryEntity: 220,
        name: 250,
        valuetype: 140,
        isActive: 140,
        action: 140,
        email:150,
        questions: 200,
        stages: 150,
        category:290,
        commercial:200
      };
    } else if (isBetween1024pxAnd1250px) {
      return {
        libraryEntity: 170,
        name: 170,
        valuetype: 120,
        isActive: 120,
        action: 120,
        stages: 150,
        questions: 210,
        category:290,
        commercial:200
      };
    } else if (isBetween1024pxAnd1350px) {
      return {
        libraryEntity: 180,
        name: 180,
        valuetype: 130,
        isActive: 130, 
        action: 130,
        stages: 200,
        questions: 230,
        category:350,
        organisation: 100,
        commercial:200
      };
    } else if (isBetween1024pxAnd1050px) {
      return {
        libraryEntity: 160,
        name: 160,
        valuetype: 110,
        isActive: 110,
        action: 110,
        stages: 200,
        category:350,
        organisation: 100,
        commercial:200
      };
    } else if (isBetween728pxAnd1024px) {
      return {
        libraryEntity: 150,
        name: 150,
        valuetype: 100,
        isActive: 100,
        action: 100,
        stages: 200,
        category:350,
        organisation: 100,
        commercial:200
      };
    }else if (isLargerThan1550px) {
      return {
        libraryEntity: 150,
        name: 150,
        valuetype: 100,
        isActive: 100,
        action: 100,
        stages: 200,
        category:350,
        organisation: 100,
        email: 200,
        commercial:200
      };
    } else if (isLargerThan1350px) {
      return {
        libraryEntity: 300,
        name: 300,
        valuetype: 200,
        isActive: 150,
        action: 150,
        stages: 200,
        email:150,
        questions: 230,
        category:350,
        organisation: 100,
        commercial:200
      };
    } else if (isBetween1250And1300px) {
      return {
        questionStatus: 100,
        questionOption: 100,
        commercial:200
      };
    }
    // Default width if none of the above media queries match
    return {
      libraryEntity: 200,
      name: 200,
      valuetype: 150,
      isActive: 150,
      action: 150,
      stages: 200,
      category:350,
      organisation: 100,
      commercial:200
    };
  };

  return getColumnWidths();
};

export default useResponsiveColumns;
