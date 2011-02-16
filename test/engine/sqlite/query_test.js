require("../../test_helper")
require("knit/engine/sqlite")

regarding("query", function() {
  
  var type = knit.attributeType,
      sqlite = knit.engine.sqlite,
      sql = knit.translation.sql
  
  beforeEach(function(){ this.db = new knit.engine.sqlite.Database(":memory:"); this.db.open() })
  afterEach(function(){ this.db.close() })
  
  
  test("async/stream-oriented row+object access", function(){
    this.db.execute({sql:"create table foo(id int primary key, color string)"})
    this.db.execute({sql:"insert into foo values(1, 'blue')"})
    this.db.execute({sql:"insert into foo values(2, 'red')"})
    
    var foo = sqlite.Table.load(this.db, "foo"),
        query = new sqlite.Query(new sql.Select().from(foo), this.db),
        results = []
        
    query.rows(function(row){
      if (row==null) {
        assert.equal([
          [1, 'blue'],
          [2, 'red']
        ], results)
      } else {
        results.push(row)
      }
    })
    
    results = []
    query.objects(function(object){
      if (object==null) {
        assert.equal([
          {id:1, color:'blue'},
          {id:2, color:'red'}
        ], results)
      } else {
        results.push(object)
      }
    })
    
    //talk to davis et al about proving async
  })
  
  test("[wasabug] rows are not incorrect because columns from different tables have the same name", function(){
    this.db.execute({sql:"create table foo(id int primary key, color string)"})
    this.db.execute({sql:"create table bar(id int primary key, color string)"})
    this.db.execute({sql:"insert into foo values(1, 'blue')"})
    this.db.execute({sql:"insert into bar values(2, 'red')"})
    
    var foo = sqlite.Table.load(this.db, "foo")
    var bar = sqlite.Table.load(this.db, "bar")
    var query = new sqlite.Query(new sql.Select().join(new sql.Join(foo, bar)), this.db)

    assert.equal([
      [1, 'blue', 2, 'red']],
      query.rows()
    )
    
    //the last id+color columns 'win'
    //this is messed up but it's just how it has to be.
    assert.equal([
      {id:2, color:'red'}],
      query.objects()
    )
  })
  

})

