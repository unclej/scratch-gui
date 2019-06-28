import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {FormattedMessage} from 'react-intl';
import Draggable from 'react-draggable';

import styles from './lesson-cards.css';

import shrinkIcon from '../cards/icon--shrink.svg';
import expandIcon from '../cards/icon--expand.svg';

import helpIcon from '../menu-bar/lessons.png';
import closeIcon from '../close-button/icon--close.svg';
import ReactPlayer from 'react-player';
import YouTubePlayer from 'react-player/lib/players/YouTube';
import classNames from "classnames";
import rightArrow from "../cards/icon--next.svg";
import leftArrow from "../cards/icon--prev.svg";
const LessonCardHeader = ({onCloseCards, totalSteps, step, expanded, onShrinkExpandLessons}) => (
    <div className={expanded ? styles.headerButtons : classNames(styles.headerButtons, styles.headerButtonsHidden)}>
        <div
            className={styles.allButton}
        >
            <img
                className={styles.helpIcon}
                src={helpIcon}
            />
            <FormattedMessage
                defaultMessage="Lessons"
                description="Message for itch lesson button"
                id="itchLocale.cards.lessons"
            />
        </div>
        {totalSteps > 1 ? (
            <div className={styles.stepsList}>
                {Array(totalSteps).fill(0)
                    .map((_, i) => (
                        <div
                            className={i === step ? styles.activeStepPip : styles.inactiveStepPip}
                            key={`pip-step-${i}`}
                        />
                    ))}
            </div>
        ) : null}
        <div className={styles.headerButtonsRight}>
            <div
                className={styles.shrinkExpandButton}
                onClick={onShrinkExpandLessons}
            >
                <img
                    draggable={false}
                    src={expanded ? shrinkIcon : expandIcon}
                />
                {expanded ?
                    <FormattedMessage
                        defaultMessage="Shrink"
                        description="Title for button to shrink how-to card"
                        id="gui.cards.shrink"
                    /> :
                    <FormattedMessage
                        defaultMessage="Expand"
                        description="Title for button to expand how-to card"
                        id="gui.cards.expand"
                    />
                }
            </div>
            <div
                className={styles.removeButton}
                onClick={onCloseCards}
            >
                <FormattedMessage
                    defaultMessage="Close"
                    description="Title for button to close how-to card"
                    id="gui.cards.close"
                />
                <img
                    className={styles.closeIcon}
                    src={closeIcon}
                />
            </div>
        </div>
    </div>
);

// Video step needs to know if the card is being dragged to cover the video
// so that the mouseup is not swallowed by the iframe.
const VideoStep = ({video, dragging}) => (
    <div className={styles.stepVideo}>
        {dragging ? (
            <div className={styles.videoCover} />
        ) : null}
        <iframe
            allowFullScreen
            /* allow="autoplay; encrypted-media" */
            allow="encrypted-media"
            frameBorder="0"
            height="337"
            src={`${video}?rel=0&amp;showinfo=0`}
            width="600"
        />
    </div>
);

VideoStep.propTypes = {
    /*expanded: PropTypes.bool.isRequired,*/
    dragging: PropTypes.bool.isRequired,
    video: PropTypes.string.isRequired
};

const ImageStep = ({title, image}) => (
    <Fragment>
        <div className={styles.stepTitle}>
            {title}
        </div>
        <div className={styles.stepImageContainer}>
            <img
                className={styles.stepImage}
                draggable={false}
                src={image}
            />
        </div>
    </Fragment>
);

ImageStep.propTypes = {
    image: PropTypes.string.isRequired,
    title: PropTypes.node.isRequired
};

const LessonStep = ({step, dragging, lessonName, expanded/* , autoPlayVideo */}) => (
    <Fragment>
        <div className={styles.lessonName}>{lessonName}</div>
        <div className={styles.lessonContentBody}>
            {step.content.map((dataItem, index) => {
                if (dataItem.type === 'text'){
                    let text = dataItem.text;
                    text = text.replace(/height="\d+"/g, '');
                    text = text.replace(/width="\d+"/g, '');
                    return (
                        <div
                            /* eslint-disable react/no-danger */
                            dangerouslySetInnerHTML={{__html: text}}
                            key={`lesson-part-step-${index}`}
                        />
                    );
                } else if (dataItem.type === 'video'){
                    return (
                        <div
                            className={styles.stepVideo}
                            key={`lesson-part-step-${index}`}
                        >
                            {dragging ? (
                                <div className={styles.videoCover} />
                            ) : null}
                            {dataItem.video_type === 'youtube' ? (
                                <YouTubePlayer
                                    controls
                                    /* playing={autoPlayVideo} */
                                    url={dataItem.url}
                                />
                            ) : dataItem.video_type === 'internal' ? (
                                <ReactPlayer
                                    controls
                                    height="auto"
                                    /* playing={autoPlayVideo} */
                                    url={dataItem.url}
                                    width="560px"
                                />
                            ) : (
                                <iframe
                                    allowFullScreen
                                    /* allow={autoPlayVideo ? 'autoplay; encrypted-media' : 'encrypted-media'} */
                                    allow="encrypted-media"
                                    className={styles.videoIframe}
                                    frameBorder="0"
                                    height="375"
                                    src={dataItem.url}
                                    width="560"
                                />
                            )}

                        </div>
                    );
                } else if (dataItem.type === 'assignment'){
                    return (
                        <div className={styles.assignmentContainer}>
                            <a
                                className={styles.assignmentButton}
                                href={dataItem.url}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <FormattedMessage
                                    defaultMessage="Get Assigment"
                                    description="Title for get assigment button"
                                    id="itchLocale.cards.getAssigment"
                                />
                            </a>
                        </div>
                    );
                }
                return (<div
                    key={`lesson-part-step-${index}`}
                />);

            })}
        </div>
    </Fragment>
);
LessonStep.propTypes = {
    /* autoPlayVideo: PropTypes.bool, */
    expanded: PropTypes.bool.isRequired,
    dragging: PropTypes.bool,
    lessonName: PropTypes.string,
    step: PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
        read: PropTypes.bool,
        content: PropTypes.array
    })
};
const NextPrevButtons = ({onNextStep, onPrevStep, expanded, isRtl}) => (
    <Fragment>
        {onNextStep ? (
            <div>
                <div className={expanded ? (isRtl ? styles.leftCard : styles.rightCard) : styles.hidden} />
                <div
                    className={expanded ? (isRtl ? styles.leftButton : styles.rightButton) : styles.hidden}
                    onClick={onNextStep}
                >
                    <img
                        draggable={false}
                        src={isRtl ? leftArrow : rightArrow}
                    />
                </div>
            </div>
        ) : null}
        {onPrevStep ? (
            <div>
                <div className={expanded ? (isRtl ? styles.rightCard : styles.leftCard) : styles.hidden} />
                <div
                    className={expanded ? (isRtl ? styles.rightButton : styles.leftButton) : styles.hidden}
                    onClick={onPrevStep}
                >
                    <img
                        draggable={false}
                        src={isRtl ? rightArrow : leftArrow}
                    />
                </div>
            </div>
        ) : null}
    </Fragment>
);

NextPrevButtons.propTypes = {
    expanded: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool,
    onNextStep: PropTypes.func,
    onPrevStep: PropTypes.func
};
LessonCardHeader.propTypes = {
    onShrinkExpandLessons: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    onCloseCards: PropTypes.func.isRequired,
    step: PropTypes.number,
    totalSteps: PropTypes.number
};


const LessonCards = props => {
    const {
        activeLessonId,
        x,
        y,
        isRtl,
        onDrag,
        onStartDrag,
        onEndDrag,
        expanded,
        onCloseCards,
        dragging,
        lessonName,
        step,
        onNextStep,
        onPrevStep,
        onShrinkExpandLessons,
    } = props;
    if (activeLessonId === null) {
        return (<Draggable
            bounds="parent"
            position={{x: x, y: y}}
            onDrag={onDrag}
            onStart={onStartDrag}
            onStop={onEndDrag}
        >
            <div className={styles.cardContainer}>
                <div className={styles.card}>
                    <LessonCardHeader
                        onShrinkExpandLessons={onShrinkExpandLessons}
                        expanded={expanded}
                        step={step}
                        totalSteps={0}
                        onCloseCards={onCloseCards}
                    />
                    <div className={expanded ? styles.stepBody : styles.hidden} >
                        <FormattedMessage
                            defaultMessage="No Lessons here"
                            description="Message to notify users that we don't have any lesson here"
                            id="itchLocale.cards.noLessons"
                        />
                    </div>
                </div>
            </div>
        </Draggable>);
    }
    const steps = props.content;
    return (
        <Draggable
            bounds="parent"
            position={{x: x, y: y}}
            onDrag={onDrag}
            onStart={onStartDrag}
            onStop={onEndDrag}
        >

            <div className={styles.cardContainer}>
                <div className={styles.card}>
                    <LessonCardHeader
                        onShrinkExpandLessons={onShrinkExpandLessons}
                        expanded={expanded}
                        step={step}
                        totalSteps={steps.length}
                        onCloseCards={onCloseCards}
                    />
                    <div className={expanded ? styles.stepBody : styles.hidden}>
                        <LessonStep
                            /* autoPlayVideo={!((!props.autoPlayVideo && props.step === 0))} */
                            dragging={dragging}
                            expanded={expanded}
                            lessonName={lessonName}
                            step={steps[step]}
                        />
                    </div>
                    <NextPrevButtons
                        expanded={expanded}
                        isRtl={isRtl}
                        onNextStep={step < steps.length - 1 ? onNextStep : null}
                        onPrevStep={step > 0 ? onPrevStep : null}
                    />
                </div>
            </div>
        </Draggable>
    );
};

LessonCards.propTypes = {
    expanded: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    activeLessonId: PropTypes.number,
    /* autoPlayVideo: PropTypes.bool, */
    content: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            id: PropTypes.number.isRequired,
            read: PropTypes.bool,
            content: PropTypes.array
        })
    ),
    dragging: PropTypes.bool.isRequired,
    lessonName: PropTypes.string,
    onCloseCards: PropTypes.func.isRequired,
    onShrinkExpandLessons: PropTypes.func.isRequired,
    onDrag: PropTypes.func,
    onEndDrag: PropTypes.func,
    onNextStep: PropTypes.func,
    onPrevStep: PropTypes.func,
    onStartDrag: PropTypes.func,
    step: PropTypes.number,
    x: PropTypes.number,
    y: PropTypes.number
};

export default LessonCards;
