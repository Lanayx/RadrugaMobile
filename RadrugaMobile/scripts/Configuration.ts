export class Configuration {
    //release
    static apiUrl: string = "https://radrugadev.azurewebsites.net/api/";
    //static sendTelemetry: boolean = true;
    
    //debug
    //static apiUrl: string = "http://localhost/RadrugaCloud/api/";
    static sendTelemetry: boolean = false;

    static tokenUrl: string = Configuration.apiUrl + "token";
    static identityUrl: string = Configuration.apiUrl + "useridentity";
    static vkVersion:string = "5.37";
    static vkTokenUrl: string = `https://oauth.vk.com/authorize?client_id=4452546&scope=friends,notify,offline,wall,photos&redirect_uri=https://oauth.vk.com/blank.html&display=mobile&v=${Configuration.vkVersion}&response_type=token`;
    static vkApiUrl: string = "https://api.vk.com/method/";

    static enableRating: boolean = false; 

    //Device options
    static baseGeolocationAccuracy = 5;
    static androidAutoFocusStubDelay = 300;
}