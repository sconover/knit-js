require("../../test_helper")
require("knit/engine/sqlite")

regarding("table", function() {
  
  var type = knit.attributeType,
      sqlite = knit.engine.sqlite
  
  beforeEach(function(){ this.db = new knit.engine.sqlite.Database(":memory:"); this.db.open() })
  afterEach(function(){ this.db.close() })
  
  regarding("load from db", function() {
    
    test("name", function(){
      this.db.execute({sql:"create table foo(id int primary key)"})
      assert.equal("foo", sqlite.Table.load(this.db, "foo").name())
    })
    
    test("attributes", function(){
      this.db.execute({sql:"create table foo(id int primary key, color string, age int)"})
      this.db.execute({sql:"create table bar(id int primary key, color string)"})

      var foo = sqlite.Table.load(this.db, "foo")
      assert.equal([
          ["id", type.Integer], 
          ["color", type.String], 
          ["age", type.Integer]
        ],
        foo.attributes().namesAndTypes()
      )
      
      var bar = sqlite.Table.load(this.db, "bar")
      assert.same(foo.attr("color"), foo.attr("color"))
      assert.notSame(foo.attr("color"), bar.attr("color"))
    })
    
    test("objects and rows", function(){
      this.db.execute({sql:"create table foo(id int primary key, color string)"})
      this.db.execute({sql:"insert into foo values(1, 'blue')"})
      this.db.execute({sql:"insert into foo values(2, 'red')"})
      this.db.execute({sql:"insert into foo values(3, 'green')"})

      var foo = sqlite.Table.load(this.db, "foo")
      assert.equal([
        {id:1, color:'blue'},
        {id:2, color:'red'},
        {id:3, color:'green'}],
        foo.objects()
      )
      
      assert.equal([
        [1, 'blue'],
        [2, 'red'],
        [3, 'green']],
        foo.rows()
      )
      
    })

    test("merge", function(){
      this.db.execute({sql:"create table foo(id int primary key, color string)"})
      this.db.execute({sql:"insert into foo values(1, 'blue')"})
      this.db.execute({sql:"insert into foo values(2, 'red')"})

      var foo = sqlite.Table.load(this.db, "foo")
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
  
  test("same", function(){
    assert.same(new sqlite.Table("foo", [{name:"color", type:"string", pk:"0"}], this.db),
                new sqlite.Table("foo", [{name:"color", type:"string", pk:"0"}], this.db))
    assert.notSame(new sqlite.Table("foo", [{name:"color", type:"string", pk:"0"}], this.db),
                   new sqlite.Table("bar", [{name:"color", type:"string", pk:"0"}], this.db))
    assert.notSame(new sqlite.Table("foo", [{name:"color", type:"string", pk:"0"}], this.db),
                   new sqlite.Table("foo", [{name:"zzz", type:"string", pk:"0"}], this.db))
  })
  
  test("quacks like relation", function(){
    assert.quacksLike(new sqlite.Table("foo", [{name:"color", type:"string", pk:"0"}], this.db), knit.signature.relation)
  })
  
})
