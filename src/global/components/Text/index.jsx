import React from "react";
import classNames from "../../utils/classNames";
import classes from "./index.module.css";

const COLORS = {
  muted: classes.cxTextMuted,
  success: classes.cxTextSuccess,
  error: classes.cxTextError,
  white: classes.cxTextWhite,
};

const TEXT_TRANSFORM = {
  uppercase: classes.cxTransformUppercase,
  lowercase: classes.cxTransformLowercase,
  capitalize: classes.cxTransformCapitalize,
};

const TEXT_ALIGN = {
  left: classes.cxAlignLeft,
  center: classes.cxAlignCenter,
  right: classes.cxAlignRight,
  justify: classes.cxAlignJustify,
};

export function Text({
  children,
  className,
  bold,
  color,
  textTransform,
  textAlign,
  ...rest
}) {
  const colorClass = COLORS[color] || color;
  const transformClass = TEXT_TRANSFORM[textTransform];
  const alignClass = TEXT_ALIGN[textAlign];
  return (
    <p
      {...rest}
      className={classNames(
        classes.cxTextBase,
        bold && classes.cxTextBold,
        colorClass,
        transformClass,
        alignClass,
        className
      )}
    >
      {children}
    </p>
  );
}

Text.displayName = "Paragraph";

export function Heading1({
  children,
  className,
  bold,
  color,
  textTransform,
  textAlign,
  ...rest
}) {
  const colorClass = COLORS[color] || color;
  const transformClass = TEXT_TRANSFORM[textTransform];
  const alignClass = TEXT_ALIGN[textAlign];
  return (
    <h1
      {...rest}
      className={classNames(
        classes.cxTextH1,
        bold && classes.cxTextBold,
        colorClass,
        transformClass,
        alignClass,
        className
      )}
    >
      {children}
    </h1>
  );
}

Heading1.displayName = "Heading1";

export function Heading2({
  children,
  className,
  bold,
  color,
  textTransform,
  textAlign,
  ...rest
}) {
  const colorClass = COLORS[color] || color;
  const transformClass = TEXT_TRANSFORM[textTransform];
  const alignClass = TEXT_ALIGN[textAlign];
  return (
    <h2
      {...rest}
      className={classNames(
        classes.cxTextH2,
        bold && classes.cxTextBold,
        colorClass,
        transformClass,
        alignClass,
        className
      )}
    >
      {children}
    </h2>
  );
}

Heading2.displayName = "Heading2";

export function Heading3({
  children,
  className,
  bold,
  color,
  textTransform,
  textAlign,
  ...rest
}) {
  const colorClass = COLORS[color] || color;
  const transformClass = TEXT_TRANSFORM[textTransform];
  const alignClass = TEXT_ALIGN[textAlign];
  return (
    <h3
      {...rest}
      className={classNames(
        classes.cxTextH3,
        bold && classes.cxTextBold,
        colorClass,
        transformClass,
        alignClass,
        className
      )}
    >
      {children}
    </h3>
  );
}

Heading3.displayName = "Heading3";

export function Heading4({
  children,
  className,
  bold,
  color,
  textTransform,
  textAlign,
  ...rest
}) {
  const colorClass = COLORS[color] || color;
  const transformClass = TEXT_TRANSFORM[textTransform];
  const alignClass = TEXT_ALIGN[textAlign];
  return (
    <h4
      {...rest}
      className={classNames(
        classes.cxTextH4,
        bold && classes.cxTextBold,
        colorClass,
        transformClass,
        alignClass,
        className
      )}
    >
      {children}
    </h4>
  );
}

Heading4.displayName = "Heading4";

export function Heading5({
  children,
  className,
  bold,
  color,
  textTransform,
  textAlign,
  ...rest
}) {
  const colorClass = COLORS[color] || color;
  const transformClass = TEXT_TRANSFORM[textTransform];
  const alignClass = TEXT_ALIGN[textAlign];
  return (
    <h5
      {...rest}
      className={classNames(
        classes.cxTextH5,
        bold && classes.cxTextBold,
        colorClass,
        transformClass,
        alignClass,
        className
      )}
    >
      {children}
    </h5>
  );
}

Heading5.displayName = "Heading5";

export function Heading6({
  children,
  className,
  bold,
  color,
  textTransform,
  textAlign,
  ...rest
}) {
  const colorClass = COLORS[color] || color;
  const transformClass = TEXT_TRANSFORM[textTransform];
  const alignClass = TEXT_ALIGN[textAlign];
  return (
    <h6
      {...rest}
      className={classNames(
        classes.cxTextH6,
        bold && classes.cxTextBold,
        colorClass,
        transformClass,
        alignClass,
        className
      )}
    >
      {children}
    </h6>
  );
}

Heading6.displayName = "Heading6";

export function TextSmall({
  children,
  className,
  bold,
  color,
  textTransform,
  textAlign,
  ...rest
}) {
  const colorClass = COLORS[color] || color;
  const transformClass = TEXT_TRANSFORM[textTransform];
  const alignClass = TEXT_ALIGN[textAlign];
  return (
    <small
      {...rest}
      className={classNames(
        classes.cxTextSmall,
        bold && classes.cxTextBold,
        colorClass,
        transformClass,
        alignClass,
        className
      )}
    >
      {children}
    </small>
  );
}

TextSmall.displayName = "Small";

export function TextDiv({
  children,
  className,
  bold,
  color,
  textTransform,
  textAlign,
  ...rest
}) {
  const colorClass = COLORS[color] || color;
  const transformClass = TEXT_TRANSFORM[textTransform];
  const alignClass = TEXT_ALIGN[textAlign];
  return (
    <div
      {...rest}
      className={classNames(
        classes.cxTextDiv,
        bold && classes.cxTextBold,
        colorClass,
        transformClass,
        alignClass,
        className
      )}
    >
      {children}
    </div>
  );
}

TextDiv.displayName = "Div";
