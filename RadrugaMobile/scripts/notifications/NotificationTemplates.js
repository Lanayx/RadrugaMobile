define(["require", "exports"], function (require, exports) {
    "use strict";
    var MissionTemplates = (function () {
        function MissionTemplates() {
        }
        MissionTemplates.getApnTemplate = function () {
            return '<?xml version="1.0" encoding="utf-8"?>' +
                '<entry xmlns="http://www.w3.org/2005/Atom">' +
                '<content type="application/xml">' +
                '<AppleTemplateRegistrationDescription xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/netservices/2010/10/servicebus/connect">' +
                '<Tags>{0}</Tags>' +
                '<DeviceToken>{1}</DeviceToken>' +
                '<BodyTemplate><![CDATA[' +
                '{"aps":' +
                '{"alert":' +
                '{"title": "$(title)",' +
                '"body": "$(message)"}' +
                '}' +
                '}' +
                ']]></BodyTemplate>' +
                '</AppleTemplateRegistrationDescription>' +
                '</content>' +
                '</entry>';
        };
        MissionTemplates.getGcmTemplate = function () {
            return '<?xml version="1.0" encoding="utf-8"?>' +
                '<entry xmlns="http://www.w3.org/2005/Atom">' +
                '<content type="application/xml">' +
                '<GcmTemplateRegistrationDescription xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/netservices/2010/10/servicebus/connect">' +
                '<Tags>{0}</Tags>' +
                '<GcmRegistrationId>{1}</GcmRegistrationId>' +
                '<BodyTemplate><![CDATA[' +
                '{"data" : ' +
                '{"title":"$(title)",' +
                '"message":"$(message)"}' +
                '}' +
                ']]></BodyTemplate>' +
                '</GcmTemplateRegistrationDescription>' +
                '</content>' +
                '</entry>';
        };
        MissionTemplates.getMpnsTemplate = function () {
            return '<?xml version="1.0" encoding="utf-8"?>' +
                '<entry xmlns="http://www.w3.org/2005/Atom">' +
                '<content type="application/xml">' +
                '<MpnsTemplateRegistrationDescription  xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/netservices/2010/10/servicebus/connect">' +
                '<Tags>{0}</Tags>' +
                '<ChannelUri>{1}</ChannelUri>' +
                '<BodyTemplate><![CDATA[' +
                '<?xml version="1.0" encoding="utf-8"?>' +
                '<wp:Notification xmlns:wp="WPNotification">' +
                '<wp:Toast>' +
                '<wp:Text1>$(title)</wp:Text1>' +
                '<wp:Text2>$(message)</wp:Text2>' +
                '</wp:Toast>' +
                '</wp:Notification>' +
                ']]></BodyTemplate>' +
                '<MpnsHeaders>' +
                '<MpnsHeader>' +
                '<Header>X-WindowsPhone-Target</Header>' +
                '<Value>toast</Value>' +
                '</MpnsHeader>' +
                '<MpnsHeader>' +
                '<Header>X-NotificationClass</Header>' +
                '<Value>2</Value>' +
                '</MpnsHeader>' +
                '</MpnsHeaders>' +
                '</MpnsTemplateRegistrationDescription>' +
                '</content>' +
                '</entry>';
        };
        return MissionTemplates;
    }());
    exports.MissionTemplates = MissionTemplates;
});
