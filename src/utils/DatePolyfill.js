// on top of your index.android.js file
const isAndroid = require('react-native').Platform.OS === 'android';
const isHermesEnabled = !!global.HermesInternal;

export function datePolyfill() {
    // in your index.js file
    if (isHermesEnabled || isAndroid) {

        require('@formatjs/intl-getcanonicallocales/polyfill');
        require('@formatjs/intl-locale/polyfill');


        require('@formatjs/intl-pluralrules/polyfill');
        require('@formatjs/intl-pluralrules/locale-data/pt.js'); // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

        require('@formatjs/intl-displaynames/polyfill');
        require('@formatjs/intl-displaynames/locale-data/pt.js'); // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

        require('@formatjs/intl-listformat/polyfill');
        require('@formatjs/intl-listformat/locale-data/pt.js'); // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

        require('@formatjs/intl-numberformat/polyfill');
        require('@formatjs/intl-numberformat/locale-data/pt.js'); // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

        require('@formatjs/intl-relativetimeformat/polyfill');
        require('@formatjs/intl-relativetimeformat/locale-data/pt.js'); // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

        require('@formatjs/intl-datetimeformat/polyfill');
        require('@formatjs/intl-datetimeformat/locale-data/pt.js'); // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

        require('@formatjs/intl-datetimeformat/add-golden-tz.js');

        // https://formatjs.io/docs/polyfills/intl-datetimeformat/#default-timezone

        if ('__setDefaultTimeZone' in Intl.DateTimeFormat) {

            // If you are using react-native-cli
            // let RNLocalize = require('react-native-localize');
            // Intl.DateTimeFormat.__setDefaultTimeZone(RNLocalize.getTimeZone());

            //  Are you using Expo, use this instead of previous 2 lines
            Intl.DateTimeFormat.__setDefaultTimeZone("America/Sao_Paulo");
        }
    }

}
