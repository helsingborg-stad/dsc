import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import getElementPosition from '../util/getElementPosition';

import './OverlayCloser.css';

export class OverlayCloser extends Component {
  render() {
    const { isHidden, onCloseModal, onDismissClose, translatables } = this.props;
    return (
      <div
        ref='wrapper'
        className={classNames('OverlayCloser', {'OverlayCloser--hidden': isHidden})}
        onClick={ev => ev.stopPropagation()}
      >
        { translatables.closePopup }
        <button onClick={onCloseModal}>{translatables.yes}</button>
        <button onClick={onDismissClose}>{translatables.no}</button>
      </div>
    );
  }
}

OverlayCloser.propTypes = {
  isHidden: PropTypes.bool,
  onCloseModal: PropTypes.func,
  onDismissClose: PropTypes.func,
  translatables: PropTypes.shape({
    closePopup: PropTypes.string.isRequired,
    yes: PropTypes.string.isRequired,
    no: PropTypes.string.isRequired
  }).isRequired
};

export function setOverlayCloserPosition(backdropEl, overlayCloserEl) {
  const backdropPosition = getElementPosition(backdropEl.currentTarget);
  let xPosition = backdropEl.clientX - backdropPosition.x - (overlayCloserEl.clientWidth / 2);
  if (xPosition < 120) {
    xPosition = 120;
  }
  if ((window.innerWidth - xPosition) < 120) {
    xPosition = window.innerWidth - 120;
  }
  let yPosition = backdropEl.clientY - backdropPosition.y - (overlayCloserEl.clientHeight / 2);
  if ((window.innerHeight - yPosition) < 70) {
    yPosition = window.innerHeight - 70;
  }
  overlayCloserEl.style.left = xPosition + 'px';
  overlayCloserEl.style.top = yPosition + 'px';
}

const mapStateToProps = (state) => {
  return {
    translatables: state.siteSettings.translatables[state.activeLanguage]
  };
};

export default connect(mapStateToProps, null, null, { withRef: true })(OverlayCloser);
