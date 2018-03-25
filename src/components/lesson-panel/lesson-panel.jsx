import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import styles from '../menu-bar/menu-bar.css';
import lessonIcon from './lessons.png';
import {defineMessages, FormattedMessage, intlShape} from 'react-intl';
const ariaMessages = defineMessages({
    lessons: {
        id: 'gui.menuBar.lessonPanel',
        defaultMessage: 'Lessons',
        description: 'go to lesson panel'
    }
});
const LessonPanelComponent = ({
    className,
    onClick,
    onChange,
    children,
    ...props
}) => {
    if (props.disabled === true) {
        onChange = function () {};
    }
    return (
        <div
            className={classNames(styles.menuBarItem, styles.hoverable)}
            onClick={onClick}
            {...props}
        >
            <img
                className={styles.lessonIcon}
                src={lessonIcon}
                draggable={false}
            />
            <FormattedMessage {...ariaMessages.lessons} />
        </div>
            
    )
};

LessonPanelComponent.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};

export default LessonPanelComponent;
