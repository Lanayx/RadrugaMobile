/// <reference path="Push.d.ts" />
/// <reference path="Transitions.d.ts" />
/// <reference path="../../custom/insomnia.d.ts" />

interface Window {
    plugins: Plugins
}

interface Plugins {
    /**
         * This plugin allows to receive push notifications. The Android implementation uses
         * Google's GCM (Google Cloud Messaging) service,
         * whereas the iOS version is based on Apple APNS Notifications
         */
    pushNotification: PushNotification;
    nativepagetransitions: NativePageTransitions;
    sslCertificateChecker: any;
    insomnia: IInsomnia;
}
