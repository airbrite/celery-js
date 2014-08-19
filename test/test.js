var celeryClient = new Celery({
  apiHost: 'http://dev.trycelery.com:3000',
  slug: '53ebdd5e1fd9c90400553dab'
});

celeryClient.fetchShop(null, function(err, data) {
  console.log(data.data, 'buy this wombat');
});
