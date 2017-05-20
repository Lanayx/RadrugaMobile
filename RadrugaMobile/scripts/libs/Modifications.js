/*! imgcache.js

    // checks if a copy of the file has already been cached
    // Reminder: this is an asynchronous method!
    // Answer to the question comes in response_callback as the second argument (first being the path)
    ImgCache.isCached = function (img_src, response_callback) {
        ImgCache.getCachedFile(img_src, function (src, file_entry) {
            response_callback(src, file_entry);                 !!! changed second argument !!!
        });
    };

    ..............

            if (success_callback) {                           !!! in cacheFile function !!!!
	             success_callback(entry.toURL());
            }             

    ...............


      Helpers.EntryGetPath = function (entry) {
        if (Helpers.isCordova()) {
            // From Cordova 3.3 onward toURL() seems to be required instead of fullPath (#38)
            var toUrlNeeded = entry.toURL === 'function' && entry.nativeURL && 
                entry.nativeURL !== "undefined/";                                                          //kostyl for windows phone emulator
            
            return (toUrlNeeded  ? Helpers.EntryToURL(entry) : entry.fullPath);
        } else {
            return entry.fullPath;
        }
    };


    ..............

    if (Helpers.isCordova() && window.requestFileSystem) {                         !!! added condition !!!
		    // PHONEGAP
		    alert("phonegap start");
            window.requestFileSystem(Helpers.getCordovaStorageType(ImgCache.options.usePersistentCache), 0, _gotFS, _fail);
		} else {
    ..............


    var savedFS = window.requestFileSystem || window.webkitRequestFileSystem;  !!!!  Strange change of window.requestFileSystem in callback !!!!
		    //window.requestFileSystem = savedFS;
*/