import PropTypes from 'prop-types';
import React from 'react';
import ReactModal from 'react-modal';
import Box from '../box/box.jsx';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

import styles from './share-modal.css';

const messages = defineMessages({
    label: {
        id: 'gui.shareModal.label',
        defaultMessage: 'Try Scratch 3.0',
        description: 'Scratch 3.0 modal label - for accessibility'
    }
});

const ShareModal = ({intl, ...props}) => (
    <ReactModal
        isOpen
        className={styles.modalContent}
        contentLabel={intl.formatMessage({...messages.label})}
        overlayClassName={styles.modalOverlay}
        onRequestClose={props.onTryIt}
    >
        <Box  className={styles.body}>
            <h2>
                <FormattedMessage
                    defaultMessage="Copy this link and share this project"
                    description="Share this project with others"
                    id="gui.shareModal.shareMessage"
                />
            </h2>
            <div>
                <a href={props.hash_link} target="_blank" className={styles.hashLink}>{props.hash_link}</a>           
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
    intl: intlShape.isRequired,
    onCancel: PropTypes.func.isRequired,
    onTryIt: PropTypes.func.isRequired
};

export default injectIntl(ShareModal);
