import PropTypes from 'prop-types';
import React from 'react';
import ReactModal from 'react-modal';
import Box from '../box/box.jsx';
import {injectIntl, FormattedMessage} from 'react-intl';

import styles from './preview-modal.css';


const PreviewModal = ({...props}) => (
    <ReactModal
        isOpen
        className={styles.modalContent}
        overlayClassName={styles.modalOverlay}
        onRequestClose={props.onCancel}
    >
        <Box className={styles.body}>
            <h4>
                <FormattedMessage
                    defaultMessage="Any changes you make during preview will not be saved"
                    description="Share this project with others"
                    id="gui.shareModal.shareMessage"
                />
            </h4>
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
            </Box>
        </Box>
    </ReactModal>
);

PreviewModal.propTypes = {
    onCancel: PropTypes.func.isRequired
};

export default injectIntl(PreviewModal);
