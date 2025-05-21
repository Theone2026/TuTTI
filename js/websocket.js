(function() {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      console.log('Conectado al servidor WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        console.log('Nueva notificación:', data.notification);
        // Manejar la notificación en el cliente
      } else if (data.type === 'newMessage') {
        console.log('Nuevo mensaje:', data.message);
        // Manejar el nuevo mensaje en el cliente
      }
    };

    // Función para unirse a una sala de producto
    function joinProductRoom(productId) {
      ws.send(JSON.stringify({ type: 'joinRoom', productId }));
    }

    // Función para enviar un mensaje
    function sendMessage(productId, message) {
      ws.send(JSON.stringify({ type: 'sendMessage', productId, message }));
    }
})();