import React from "react";
import classes from "./index.module.css";

import classNames from "../../utils/classNames";

function Card({ children, className, ...rest }) {
  return (
    <div {...rest} className={classNames(classes.cxCardRoot, className)}>
      {children}
    </div>
  );
}

function CardContent({ children, className, ...rest }) {
  return (
    <div {...rest} className={classNames(classes.cxCardContent, className)}>
      {children}
    </div>
  );
}

CardContent.displayName = "CardContent";

Card.CardContent = CardContent;

export default Card;
