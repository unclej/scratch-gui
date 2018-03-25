import GoogleAnalytics from 'react-ga';

//Remove Analytics while we are testing and will reactivate when we are going to put this live

/*GoogleAnalytics.initialize(process.env.GA_ID, {
    debug: (process.env.NODE_ENV !== 'production'),
    titleCase: true,
    sampleRate: (process.env.NODE_ENV === 'production') ? 100 : 0,
    forceSSL: true
});
*/
export default GoogleAnalytics;
