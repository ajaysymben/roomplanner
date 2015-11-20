import fixture from 'can-fixture';

const store = fixture.store([{
  id: 0,
  description: 'First item'
}, {
  id: 1,
  description: 'Second item'
}]);

fixture({
  'GET /roomplan': store.findAll,
  'GET /roomplan/{id}': store.findOne,
  'POST /roomplan': store.create,
  'PUT /roomplan/{id}': store.update,
  'DELETE /roomplan/{id}': store.destroy
});

export default store;
