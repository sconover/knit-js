require("../../helper")
require("knit/engine/sqlite")

regarding("table", function() {
  
  var type = knit.attributeType,
      sqlite = knit.engine.sqlite
  
  beforeEach(function(){ this.conn = new knit.engine.sqlite.Connection(":memory:"); this.conn.open() })
  afterEach(function(){ this.conn.close() })
  
  regarding("load from conn", function() {
    
    test("name", function(){
      this.conn.execute({sql:"create table foo(id int primary key)"})
      assert.equal("foo", sqlite.Table.load(this.conn, "foo").name())
    })
    
    test("attributes", function(){
      this.conn.execute({sql:"create table foo(id int primary key, color string, age int)"})
      this.conn.execute({sql:"create table bar(id int primary key, color string)"})

      var foo = sqlite.Table.load(this.conn, "foo")
      assert.equal([
          ["id", type.Integer], 
          ["color", type.String], 
          ["age", type.Integer]
        ],
        foo.attributes().namesAndTypes()
      )
      
      var bar = sqlite.Table.load(this.conn, "bar")
      assert.same(foo.attr("color"), foo.attr("color"))
      assert.notSame(foo.attr("color"), bar.attr("color"))
    })
    
    test("inspect", function(){
      this.conn.execute({sql:"create table bar(id int primary key, color string)"})
      assert.equal("bar[id,color]", sqlite.Table.load(this.conn, "bar").inspect())
    })
    
    test("rows", function(){
      this.conn.execute({sql:"create table foo(id int primary key, color string)"})
      this.conn.execute({sql:"insert into foo values(1, 'blue')"})
      this.conn.execute({sql:"insert into foo values(2, 'red')"})
      this.conn.execute({sql:"insert into foo values(3, 'green')"})

      var foo = sqlite.Table.load(this.conn, "foo")
      
      assert.equal([
        [1, 'blue'],
        [2, 'red'],
        [3, 'green']],
        foo.rows()
      )
      
    })

    test("compile", function(){
      this.conn.execute({sql:"create table foo(id int primary key, color string)"})
      this.conn.execute({sql:"insert into foo values(1, 'blue')"})
      this.conn.execute({sql:"insert into foo values(2, 'red')"})
      this.conn.execute({sql:"insert into foo values(3, 'green')"})

      var foo = sqlite.Table.load(this.conn, "foo")
      
      assert.equal([
        {id:1, color:'blue'},
        {id:2, color:'red'},
        {id:3, color:'green'}],
        foo.compile().objects()
      )
    })

    test("merge", function(){
      this.conn.execute({sql:"create table foo(id int primary key, color string)"})
      this.conn.execute({sql:"insert into foo values(1, 'blue')"})
      this.conn.execute({sql:"insert into foo values(2, 'red')"})

      var foo = sqlite.Table.load(this.conn, "foo")
      assert.equal([
        [1, 'blue'],
        [2, 'red']],
        foo.rows()
      )
      
      foo.merge([
        [2, 'pink'],
        [3, 'green']
      ])
      
      assert.equal([
        [1, 'blue'],
        [2, 'pink'],
        [3, 'green']],
        foo.rows()
      )
      
    })
  })
  
  regarding("create", function(){

    test("requires attribute type information and information about the primary key",function(){
      sqlite.Table.create(this.conn, "foo", [["id",type.Integer], ["color",type.String]], ["id"])
      
      assert.equal(
        [{name:"id", type:"int", pk:"1"},
         {name:"color", type:"string", pk:"0"}],
        this.conn.columnInformation("foo")
      )      
    }) 
    
  })
  
  test("same", function(){
    assert.same(new sqlite.Table("foo", [{name:"color", type:"string", pk:"0"}], this.conn),
                new sqlite.Table("foo", [{name:"color", type:"string", pk:"0"}], this.conn))
    assert.notSame(new sqlite.Table("foo", [{name:"color", type:"string", pk:"0"}], this.conn),
                   new sqlite.Table("bar", [{name:"color", type:"string", pk:"0"}], this.conn))
    assert.notSame(new sqlite.Table("foo", [{name:"color", type:"string", pk:"0"}], this.conn),
                   new sqlite.Table("foo", [{name:"zzz", type:"string", pk:"0"}], this.conn))
  })
  
  test("a table is the same as a resolved table reference", function(){
    var fooRef = new knit.RelationReference("foo")
    var foo = new sqlite.Table("foo", [{name:"color", type:"string", pk:"0"}], this.conn)
    fooRef.resolve({foo:foo})
    assert.same(fooRef, foo)
  })
  
  test("quacks like relation", function(){
    assert.quacksLike(new sqlite.Table("foo", [{name:"color", type:"string", pk:"0"}], this.conn), knit.signature.relation)
  })
  
})
