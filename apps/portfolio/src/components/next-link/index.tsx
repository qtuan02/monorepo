"use client";

import React from "react";

import { Link } from "~/i18n/navigation";

type NextLinkProps = React.ComponentProps<typeof Link> & {
  isExternalLink?: boolean;
};

const NextLink: React.FC<NextLinkProps> = ({
  isExternalLink: _isExternalLink,
  ...props
}) => {
  const isExternalLink =
    _isExternalLink ?? props.href.toString().startsWith("http");

  if (isExternalLink) {
    return (
      <a
        {...props}
        href={props.href.toString()}
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.children}
      </a>
    );
  }

  return <Link {...props}>{props.children}</Link>;
};

export default NextLink;
