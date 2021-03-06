import PropTypes from 'prop-types';
import React from 'react';

/* eslint-disable max-len */
const FrFlag = ({className}) => {
  return (
    <svg className={className} viewBox='0 0 640 480' width="43" height="30">
      <g fillRule="evenodd">
        <path fill="#fff" d="M0 0h640v480H0z"/>
        <path fill="#00267f" d="M0 0h213.3v480H0z"/>
        <path fill="#f31830" d="M426.7 0H640v480H426.7z"/>
      </g>
    </svg>
  );
};

FrFlag.propTypes = {
  className: PropTypes.string
};

FrFlag.defaultProps = {
  className: ''
};

export default FrFlag;
