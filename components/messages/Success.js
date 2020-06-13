import React, { useState } from 'react';
import Alert from "react-bootstrap/Alert"
function Success(props) {
  const [show, setShow] = useState(true);
  if (show) {
    return (
      <Alert
        variant="success"
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

export default Success
