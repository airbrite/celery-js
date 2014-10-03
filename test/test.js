var celeryClient = new Celery({
  apiHost: 'http://dev.trycelery.com:3000',
  slug: '53d86cc3f1da790000c7102a'
});

celeryClient.fetchShop(null, function(err, data) {
  console.log(data.data, 'buy this wombat');
  celeryClient.fetchTaxes({
    shipping_country: 'zz'
  }, function(err, data) {
    console.log('taxes', data);
  });

  celeryClient.fetchCoupon({
    // userId: '53a8e161c7efd6d63d088e71',
    code: '10pct'
  }, function(err, data) {
    console.log('coupon', err, data);
  });

});
