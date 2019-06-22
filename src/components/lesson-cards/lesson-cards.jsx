import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {FormattedMessage} from 'react-intl';
import Draggable from 'react-draggable';

import styles from './lesson-cards.css';

import nextIcon from './icon--next.svg';
import prevIcon from './icon--prev.svg';

import helpIcon from '../menu-bar/lessons.png';
import closeIcon from '../close-button/icon--close.svg';
import ReactPlayer from 'react-player';
import YouTubePlayer from 'react-player/lib/players/YouTube';
const LessonCardHeader = ({onCloseCards, totalSteps, step}) => (
    <div className={styles.headerButtons}>
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

const LessonStep = ({step, dragging, lessonName/* , autoPlayVideo */}) => (
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
    dragging: PropTypes.bool,
    lessonName: PropTypes.string,
    step: PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
        read: PropTypes.bool,
        content: PropTypes.array
    })
};
const NextPrevButtons = ({onNextStep, onPrevStep}) => (
    <Fragment>
        {onNextStep ? (
            <div>
                <div className={styles.rightCard} />
                <div
                    className={styles.rightButton}
                    onClick={onNextStep}
                >
                    <img
                        draggable={false}
                        src={nextIcon}
                    />
                </div>
            </div>
        ) : null}
        {onPrevStep ? (
            <div>
                <div className={styles.leftCard} />
                <div
                    className={styles.leftButton}
                    onClick={onPrevStep}
                >
                    <img
                        draggable={false}
                        src={prevIcon}
                    />
                </div>
            </div>
        ) : null}
    </Fragment>
);

NextPrevButtons.propTypes = {
    onNextStep: PropTypes.func,
    onPrevStep: PropTypes.func
};
LessonCardHeader.propTypes = {
    onCloseCards: PropTypes.func.isRequired,
    step: PropTypes.number,
    totalSteps: PropTypes.number
};


const LessonCards = props => {
    if (props.activeLessonId === null) {
        return (<Draggable
            bounds="parent"
            position={{x: props.x, y: props.y}}
            onDrag={props.onDrag}
            onStart={props.onStartDrag}
            onStop={props.onEndDrag}
        >
            <div className={styles.cardContainer}>
                <div className={styles.card}>
                    <LessonCardHeader
                        step={props.step}
                        totalSteps={0}
                        onCloseCards={props.onCloseCards}
                    />
                    <div className={styles.stepBody} >
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
            position={{x: props.x, y: props.y}}
            onDrag={props.onDrag}
            onStart={props.onStartDrag}
            onStop={props.onEndDrag}
        >

            <div className={styles.cardContainer}>
                <div className={styles.card}>
                    <LessonCardHeader
                        step={props.step}
                        totalSteps={steps.length}
                        onCloseCards={props.onCloseCards}
                    />
                    <div className={styles.stepBody}>
                        <LessonStep
                            /* autoPlayVideo={!((!props.autoPlayVideo && props.step === 0))} */
                            dragging={props.dragging}
                            lessonName={props.lessonName}
                            step={steps[props.step]}
                        />
                    </div>
                    <NextPrevButtons
                        onNextStep={props.step < steps.length - 1 ? props.onNextStep : null}
                        onPrevStep={props.step > 0 ? props.onPrevStep : null}
                    />
                </div>
            </div>
        </Draggable>
    );
};

LessonCards.propTypes = {
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
