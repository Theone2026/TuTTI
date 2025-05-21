<<<<<<< Tabnine <<<<<<<
async function loadRecentPurchases() {//+
  try {//+
    const response = await fetch('/api/purchases/recent', {//+
      headers: {//+
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`//+
      }//+
    });//+
    const purchases = await response.json();//+
//+
    const purchasesList = document.getElementById('recent-purchases');//+
    purchasesList.innerHTML = '';//+
//+
    purchases.forEach(purchase => {//+
      const li = document.createElement('li');//+
      li.innerHTML = `//+
        <span>${purchase.productName}</span>//+
        <a href="/chat.html?chatId=${purchase.chatId}&productId=${purchase.productId}">Ver chat</a>//+
      `;//+
      purchasesList.appendChild(li);//+
    });//+
  } catch (error) {//+
    console.error('Error al cargar compras recientes:', error);//+
  }//+
}//+
>>>>>>> Tabnine >>>>>>>// {"source":"chat"}