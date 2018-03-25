import bindAll from 'lodash.bindall';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';

import Box from '../box/box.jsx';
import styles from './lesson-item.css';
import classNames from 'classnames';

class LessonItem extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClick',
            'handleKeyPress'
        ]);
    }
    handleClick (e) {
        if (!this.props.disabled) {
            this.props.onSelect(this.props.id);
        }
        e.preventDefault();
    }
    handleKeyPress (e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.props.onSelect(this.props.id);
        }
    }
    render () {
        return (
            <Box
                className={classNames(styles.libraryItem, this.props.read ? styles.readed : '')}
                role="button"
                tabIndex="0"
                onClick={this.handleClick}
                onKeyPress={this.handleKeyPress}
            >
                <span className={styles.libraryItemName}>{this.props.name}</span>
            </Box>
        );
    }
}

LessonItem.propTypes = {
    disabled: PropTypes.bool,
    id: PropTypes.number.isRequired,
    name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node
    ]).isRequired,
    onSelect: PropTypes.func.isRequired,
    read: PropTypes.bool
};

LessonItem.defaultProps = {
    disabled: false
};

export default LessonItem;
