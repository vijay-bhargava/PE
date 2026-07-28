import React from 'react';
import EventQuestionScreen from '../../../components/Event/EventQuestionScreen';

const RFQQuestionsTab = ({
  idFromURL,
  supplierid,
  formik,
  stagearray,
  currentStage,
  isquestioneditDisabled,
  stagelist,
  permissionManager,
  requestCell,
  EventQuestionScreenRef,
}) => {
  return (
    <div>
      <EventQuestionScreen
        props={{
          eventid: idFromURL,
          eventtype: 'RFQ',
          librarytype: 'QuestionLibrary',
          action: stagearray.includes(currentStage),
          supplierid: supplierid,
          Version: formik?.values?.Version,
          editquestion: isquestioneditDisabled,
          stagelist: stagelist,
          permissionManager: permissionManager,
          requestCell: requestCell,
        }}
        ref={EventQuestionScreenRef}
      />
    </div>
  );
};

export default RFQQuestionsTab;
