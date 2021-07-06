/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/prop-types */
import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import PreviewModalComponent from '../components/preview-modal/preview-modal.jsx';

import {
    closePreviewProject
} from '../reducers/modals';

class PreviewModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClose'
        ]);
    }
    handleClose () {
        this.props.onClose();
    }
    render () {
        return (
            <PreviewModalComponent
                onCancel={this.handleClose}
            />
        );
    }
}

PreviewModal.propTypes = {
    handleClose: PropTypes.func
};
const mapDispatchToProps = dispatch => ({
    onClose: () => {
        dispatch(closePreviewProject());
    }
});

export default connect(
    null,
    mapDispatchToProps
)(PreviewModal);
