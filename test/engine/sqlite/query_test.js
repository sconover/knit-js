require("../../helper")
require("knit/engine/sqlite")

regarding("query", function() {
  
  var type = knit.attributeType,
      sqlite = knit.engine.sqlite,
      sql = knit.translation.sql
  
  beforeEach(function(){ this.conn = new knit.engine.sqlite.Connection(":memory:"); this.conn.open() })
  afterEach(function(){ this.conn.close() })
  
  
  test("async/stream-oriented row+object access", function(){
    this.conn.execute({sql:"create table foo(id int primary key, color string)"})
    this.conn.execute({sql:"insert into foo values(1, 'blue')"})
    this.conn.execute({sql:"insert into foo values(2, 'red')"})
    
    var foo = sqlite.Table.load(this.conn, "foo"),
        query = new sqlite.Query(new sql.Select().from(foo), this.conn),
        results = []
        
    query.rowsAsync(function(row){
      if (row === null) {
        assert.equal([
          [1, 'blue'],
          [2, 'red']
        ], results)
      } else {
        results.push(row)
      }
    })
    
    //talk to davis et al about proving async
  })
  
  test("quacksLike execution strategy", function(){
    this.conn.execute({sql:"create table foo(id int primary key, color string)"})
    var foo = sqlite.Table.load(this.conn, "foo")
    assert.quacksLike(new sqlite.Query(new sql.Select().from(foo), this.conn), knit.signature.executionStrategy)
  })
  
  test("[wasabug] rows are not incorrect because columns from different tables have the same name", function(){
    this.conn.execute({sql:"create table foo(id int primary key, color string)"})
    this.conn.execute({sql:"create table bar(id int primary key, color string)"})
    this.conn.execute({sql:"insert into foo values(1, 'blue')"})
    this.conn.execute({sql:"insert into bar values(2, 'red')"})
    
    var foo = sqlite.Table.load(this.conn, "foo")
    var bar = sqlite.Table.load(this.conn, "bar")
    var query = new sqlite.Query(new sql.Select().join(new sql.Join(foo, bar)), this.conn)

    assert.equal([
      [1, 'blue', 2, 'red']],
      query.rowsSync()
    )
    
    //the last id+color columns 'win'
    //this is messed up but it's just how it has to be.
    assert.equal([
      {id:2, color:'red'}],
      new knit.ExecutableRelation(query).objects()
    )
  })
  

})

