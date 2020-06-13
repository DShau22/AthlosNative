import React from 'react';
import { Route } from 'react-router-dom';

const ContextRoute = ({ contextComp, component, ...rest }) => {
  const { Consumer } = contextComp
  const Component = component;

  return (
    <Route {...rest}>
      <Consumer>
        {(context) => (<Component
                        context={context}
                      />)}
      </Consumer>
    </Route>
  );
};

export default ContextRoute;
