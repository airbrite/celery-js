describe('#fetchShop', function() {
  var subject;

  before(function() {
    this.server = sinon.fakeServer.create();
    this.server.respondWith(/.*\/shop\/testslug/, [
      200, {
        'Content-Type': 'application/json'
      },
      JSON.stringify(SHOP_FIXTURE)
    ]);
  });

  beforeEach(function() {
    subject = new Celery();
  });

  afterEach(function() {
    this.server.restore();
  });

  describe('no slug', function() {
    it('should throw', function() {
      assert.throws(function() {
        subject.fetchShop();
      });
    });
  });

  it('should set user ID from response', function() {
    subject.fetchShop('testslug');
    this.server.respond();
    assert.ok(subject.config.userId);
  });
});
