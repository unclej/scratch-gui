import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import Box from '../box/box.jsx';
import CloseButton from '../close-button/close-button.jsx';
import {AlertLevels} from '../../lib/alerts/index.jsx';

import styles from './alert.css';

const closeButtonColors = {
    [AlertLevels.SUCCESS]: CloseButton.COLOR_GREEN,
    [AlertLevels.WARN]: CloseButton.COLOR_ORANGE
};

const AlertComponent = ({
    content,
    iconURL,
    level,
    message,
    onCloseAlert,
    onReconnect,
    showReconnect
}) => (
    <Box
        className={classNames(styles.alert, styles[level])}
    >
        <div className={styles.alertMessage}>
            {iconURL === 'spin' ? (
                <div className={styles.spinner} />
            ) : (iconURL ? (
                <img
                    className={styles.alertIcon}
                    src={iconURL}
                />
            ) : null)}
            {message}
            
            {content}
        </div>
        {showReconnect ? (
            <button
                className={styles.connectionButton}
                onClick={onReconnect}
            >
                <FormattedMessage
                    defaultMessage="Reconnect"
                    description="Button to reconnect the device"
                    id="gui.connection.reconnect"
                />
            </button>
        ) : null}
        {level === 'warn' && !message ? null : (
            <Box
                className={styles.alertCloseButtonContainer}
            >
                <CloseButton
                    className={classNames(styles.alertCloseButton)}
                    color={closeButtonColors[level]}
                    size={CloseButton.SIZE_LARGE}
                    onClick={onCloseAlert}
                />
            </Box>
        ) }
    </Box>
);

AlertComponent.propTypes = {
    content: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    iconURL: PropTypes.string,
    level: PropTypes.string,
    message: PropTypes.string,
    onCloseAlert: PropTypes.func.isRequired,
    onReconnect: PropTypes.func,
    showReconnect: PropTypes.bool
};

AlertComponent.defaultProps = {
    level: AlertLevels.WARN
};

export default AlertComponent;
