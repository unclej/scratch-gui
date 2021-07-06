import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ShareModalComponent from '../components/share-modal/share-modal.jsx';

import {
    closeShareProject
} from '../reducers/modals';

class ShareModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleTryIt',
            'handleCancel'
        ]);
    }
    handleTryIt () {
        const textField = document.createElement('textarea');
        textField.innerText = this.props.hashUrl;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        textField.remove();
        this.props.onTryIt();
    }
    handleCancel () {
        this.props.onTryIt();
    }
    render () {
        return (
            <ShareModalComponent
                hashUrl={this.props.hashUrl}
                onCancel={this.handleCancel}
                onTryIt={this.handleTryIt}
            />
        );
    }
}

ShareModal.propTypes = {
    hashUrl: PropTypes.string,
    onTryIt: PropTypes.func
};

const mapStateToProps = state => ({
    hashUrl: state.scratchGui.itchProject.shareUrl
});

const mapDispatchToProps = dispatch => ({
    onTryIt: () => {
        dispatch(closeShareProject());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ShareModal);
