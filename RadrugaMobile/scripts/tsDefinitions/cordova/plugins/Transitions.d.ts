interface NativePageTransitions {
    slide(params: SlideParams,
        successCallback: (message: string) => void ,
        errorCallback: (error: string) => void
        ): void;
}
interface SlideParams {
    "href": string; //view address
    "direction"      ?: string; // 'left|right|up|down', default 'left' (which is like 'next')
    "duration"       ?: number; // in milliseconds (ms), default 400
    "slowdownfactor" ?: number; // overlap views (higher number is more) or no overlap (1), default 4
    "iosdelay"       ?: number; // ms to wait for the iOS webview to update before animation kicks in, default 60
    "androiddelay"   ?: number; // same as above but for Android, default 70
    "winphonedelay"  ?: number; // same as above but for Windows Phone, default 200

}