(function() {
    function loadWebSocketScript() {
        var script = document.createElement('script');
        script.src = '/js/websocket.js';
        script.type = 'text/javascript';
        script.async = true;
        document.body.appendChild(script);
    }

    if (document.readyState === 'complete') {
        loadWebSocketScript();
    } else {
        window.addEventListener('load', loadWebSocketScript);
    }
})();