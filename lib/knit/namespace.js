if (typeof global === 'undefined') throw new Error("Please define global.  If you are in a browser, set global=window.")

global.knit = {
  algebra: {predicate:{}},
  mixin:{},
  translation:{sql:{}},
  engine:{ memory:{}, sqlite:{} },
  attributeType:{}
}