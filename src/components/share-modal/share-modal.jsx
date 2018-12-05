import PropTypes from 'prop-types';
import React from 'react';
import ReactModal from 'react-modal';
import Box from '../box/box.jsx';
import {injectIntl, FormattedMessage} from 'react-intl';

import styles from './share-modal.css';


const ShareModal = ({...props}) => (
    <ReactModal
        isOpen
        className={styles.modalContent}
        overlayClassName={styles.modalOverlay}
        onRequestClose={props.onTryIt}
    >
        <Box className={styles.body}>
            <h2>
                <FormattedMessage
                    defaultMessage="Copy this link and share this project"
                    description="Share this project with others"
                    id="gui.shareModal.shareMessage"
                />
            </h2>
            <div>
                <a
                    className={styles.hashLink}
                    href={props.hashUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                >{props.hashUrl}</a>
            </div>
            <Box className={styles.buttonRow}>
                <button
                    className={styles.noButton}
                    onClick={props.onCancel}
                >
                    <FormattedMessage
                        defaultMessage="Close"
                        description="Label for button to close modal"
                        id="gui.shareModal.close"
                    />
                </button>
                <button
                    className={styles.okButton}
                    title="Copy to Clipboard"
                    onClick={props.onTryIt}
                >
                    <FormattedMessage
                        defaultMessage="Copy to Clipboard"
                        description="Label for button to copy link"
                        id="gui.shareModal.copyToClipboard"
                    />
                </button>
            </Box>
        </Box>
    </ReactModal>
);

ShareModal.propTypes = {
    hashUrl: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onTryIt: PropTypes.func.isRequired
};

export default injectIntl(ShareModal);
