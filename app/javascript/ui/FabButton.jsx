import React, { Component } from 'react';
import { Button } from 'react-md';

const FabButton = (props) => {

  const {
    fabClass,
    icon,
    buttonActions,
    buttonChildActions,
    iconChild,
    classesChild
  } = props

  let localFabClass = ["Fab"];
  if (fabClass) {
    localFabClass = ["Fab", fabClass];
  }
  localFabClass = localFabClass.join(' ');

  let buttonClasses = ["FabButton"];
  if (props.classes) {
    buttonClasses = ["FabButton", props.classes];
  }
  buttonClasses = buttonClasses.join(' ');

  let buttonChildClasses = ["FabButtonChild"];
  if (classesChild) {
    buttonClasses = ["FabButtonChild", classesChild];
  }
  buttonChildClasses = buttonChildClasses.join(' ');

  return (
    <div className={localFabClass}>
      <Button
        floating
        secondary
        className={buttonClasses}
        onClick={buttonActions}>
          {icon}
      </Button>
      {iconChild ? (
        <Button
          floating
          className={buttonChildClasses}
          onClick={buttonChildActions}>
              {iconChild}
        </Button>) : null }
    </div>
  )
}

export default FabButton
