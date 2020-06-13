import React, { useState } from 'react';
import Alert from "react-bootstrap/Alert"
function ErrorAlert(props) {
  const [show, setShow] = useState(true);
  if (show) {
    return (
      <Alert 
        variant="danger"
        onClose={() => {setShow(false); props.onClose();}}
        dismissible
      >
        <p>
          {props.msg}
        </p>
      </Alert>
    );
  } else {
    return null
  }
}

export default ErrorAlert
