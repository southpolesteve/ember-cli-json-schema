import Ember from 'ember';

export default Ember.Route.extend({
  model: function(){
    return this.schema.load('https://murfie-schemas.herokuapp.com/schemas/co.MUSICat.submission_schema', 'submission').then(()=>{
      return this.schema.createObject('submission', { id: "test", artist: {}, album: { tracks: [ {}, {}, {} ] } } );
    });
  }
});