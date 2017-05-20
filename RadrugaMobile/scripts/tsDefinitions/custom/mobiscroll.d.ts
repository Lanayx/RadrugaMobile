interface JQuery {
    mobiscroll: () => Mobiscroll;
}

interface Mobiscroll {
    date: (options: MobiscrollOptions) => void;
}

interface MobiscrollOptions {
    theme?: string; // Specify theme like: theme: 'ios' or omit setting to use default 
    mode?: string; // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
    display?: string; // Specify display mode like: display: 'bottom' or omit setting to use default 
    lang?: string; // Specify language like: lang: 'pl' or omit setting to use default 
    dateFormat?: string;
    endYear?: number;
}