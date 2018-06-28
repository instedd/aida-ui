import React, { Component } from 'react';
import { Button } from 'react-md';


const FabButton = (props) => {

  let buttonClasses = ["FabButton"];
  if (props.classes) {
    buttonClasses = ["FabButton", props.classes];
  }
  buttonClasses = buttonClasses.join(' ');

  let buttonChildClasses = ["FabButtonChild"];
  if (props.classesChild) {
    buttonClasses = ["FabButtonChild", props.classesChild];
  }
  buttonChildClasses = buttonChildClasses.join(' ');

  return (
      <div className='Fab'>
        <Button 
          floating
          {...props}
          className={buttonClasses}
          icon={props.icon} >
              {props.icon}
        </Button>
        {props.iconChild ? (
          <Button
            floating
            className={buttonChildClasses}
            onClick={props.buttonChildActions}
            icon={props.iconChild} >
                {props.iconChild}
          </Button>) : null }
      </div>
  )
}

export default FabButton
